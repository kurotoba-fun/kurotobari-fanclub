import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("../../x-media-downloader/node_modules/playwright");

const SITE_ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_WORK_DIR = path.resolve(
  SITE_ROOT,
  "../kurotobari-site-documents/2026年9月4日_ギャラリー更新効率/作業用",
);
const DEFAULT_PROFILE_DIR = path.resolve(
  SITE_ROOT,
  "../x-media-downloader/.auth/x-playwright-profile",
);

function parseArgs(argv) {
  const options = {
    input: "",
    workDir: DEFAULT_WORK_DIR,
    galleryData: path.join(SITE_ROOT, "_data/gallery_items.yml"),
    profileDir: DEFAULT_PROFILE_DIR,
    headless: false,
    dryRun: false,
    limit: 0,
    onlyTweetId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if ((arg === "--input" || arg === "-i") && argv[index + 1]) {
      options.input = path.resolve(argv[++index]);
    } else if (arg === "--work-dir" && argv[index + 1]) {
      options.workDir = path.resolve(argv[++index]);
    } else if (arg === "--gallery-data" && argv[index + 1]) {
      options.galleryData = path.resolve(argv[++index]);
    } else if (arg === "--profile" && argv[index + 1]) {
      options.profileDir = path.resolve(argv[++index]);
    } else if (arg === "--headless") {
      options.headless = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--limit" && argv[index + 1]) {
      options.limit = Number(argv[++index]);
      if (!Number.isInteger(options.limit) || options.limit < 1) {
        throw new Error("--limitには1以上の整数を指定してください");
      }
    } else if (arg === "--only" && argv[index + 1]) {
      options.onlyTweetId = tweetIdFrom(argv[++index]) || argv[index].match(/^\d+$/)?.[0] || "";
      if (!options.onlyTweetId) throw new Error("--onlyにはポストIDまたはXポストURLを指定してください");
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.input ||= path.join(options.workDir, "urls.txt");
  return options;
}

function printUsage() {
  process.stdout.write(`Usage:
  node scripts/batch-import-x-posts.mjs [options]

Options:
  --input, -i <file>     One-X-post-URL-per-line input file
  --work-dir <dir>       Work directory containing downloads and reports
  --gallery-data <file>  Existing gallery_items.yml used for duplicate checks
  --profile <dir>        Playwright persistent profile
  --headless             Hide the browser window (X may return a blank page)
  --dry-run              Check and classify URLs without opening X
  --limit <number>       Process only the first N pending posts
  --only <id-or-url>     Process only one specified post
  --help, -h             Show this help
`);
}

function tweetIdFrom(value) {
  return value.match(/(?:x\.com|twitter\.com)\/[^/\s]+\/status\/(\d+)/i)?.[1] ?? "";
}

function normalizeUrl(tweetId) {
  return `https://x.com/KUROTOBA_KGM/status/${tweetId}?s=20`;
}

function toJstIsoString(date) {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const parts = [
    jst.getUTCFullYear(),
    String(jst.getUTCMonth() + 1).padStart(2, "0"),
    String(jst.getUTCDate()).padStart(2, "0"),
    String(jst.getUTCHours()).padStart(2, "0"),
    String(jst.getUTCMinutes()).padStart(2, "0"),
    String(jst.getUTCSeconds()).padStart(2, "0"),
  ];
  return `${parts[0]}-${parts[1]}-${parts[2]}T${parts[3]}:${parts[4]}:${parts[5]}+09:00`;
}

function postedAtFromTweetId(tweetId) {
  const createdMs = (BigInt(tweetId) >> 22n) + 1288834974657n;
  return toJstIsoString(new Date(Number(createdMs)));
}

function normalizePostedAt(value, tweetId) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? postedAtFromTweetId(tweetId) : toJstIsoString(date);
}

function originalImageUrl(rawUrl, formatOverride = "") {
  const url = new URL(rawUrl);
  const extension = path.extname(url.pathname).replace(/^\./, "");
  let format = formatOverride || url.searchParams.get("format") || extension || "jpg";
  if (format === "webp") format = "jpg";
  if (extension) url.pathname = url.pathname.slice(0, -extension.length - 1);
  url.searchParams.set("format", format);
  url.searchParams.set("name", "orig");
  return url.toString();
}

function imageFilename(imageUrl, index) {
  const url = new URL(imageUrl);
  const mediaId = path.basename(url.pathname) || `image_${index}`;
  const format = url.searchParams.get("format") || "jpg";
  return `${mediaId.replace(/[^a-zA-Z0-9._-]+/g, "_")}.${format}`;
}

async function readCandidates(inputPath) {
  const text = await fs.readFile(inputPath, "utf8");
  const seen = new Set();
  const candidates = [];
  const invalid = [];

  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const tweetId = tweetIdFrom(line);
    if (!tweetId) {
      invalid.push({ line: index + 1, value: line, reason: "XのポストURLとして認識できません" });
      continue;
    }
    if (seen.has(tweetId)) continue;
    seen.add(tweetId);
    candidates.push({ tweetId, url: normalizeUrl(tweetId), inputLine: index + 1 });
  }
  return { candidates, invalid };
}

async function existingTweetIds(galleryDataPath) {
  const yaml = await fs.readFile(galleryDataPath, "utf8");
  return new Set(
    [...yaml.matchAll(/(?:x\.com|twitter\.com)\/[^/\s"']+\/status\/(\d+)/gi)].map(
      (match) => match[1],
    ),
  );
}

async function getPostArticle(page, tweetId) {
  const articles = await page.locator("article").elementHandles();
  for (const article of articles) {
    const ownsStatus = await article.evaluate(
      (element, id) => Boolean(element.querySelector(`a[href*="/status/${id}"]`)),
      tweetId,
    );
    if (ownsStatus) return article;
  }
  return null;
}

async function extractPost(page, candidate) {
  await page.goto(candidate.url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 3_000 }).catch(() => {});
  await page.waitForTimeout(1_500);
  await page.locator("article").first().waitFor({ state: "attached", timeout: 10_000 }).catch(() => {});

  const pageText = await page.locator("body").innerText().catch(() => "");
  if (
    page.url().includes("/i/flow/login") ||
    (/ログイン|Log in/i.test(pageText) && /アカウントを作成|Sign up/i.test(pageText))
  ) {
    throw new Error("Xへのログインが必要です（保存済みログイン状態を更新してください）");
  }
  if (/Something went wrong|問題が発生しました/i.test(pageText)) {
    throw new Error("X側で「問題が発生しました」と表示されています");
  }
  if (/This Post is unavailable|このポストは表示できません/i.test(pageText)) {
    throw new Error("X上でポストを表示できません");
  }
  const article = await getPostArticle(page, candidate.tweetId);
  if (!article) {
    const title = await page.title().catch(() => "");
    throw new Error(`対象ポストを画面上で確認できません（ページ: ${title || page.url()}）`);
  }

  const extracted = await article.evaluate((element, tweetId) => {
    const time = element.querySelector("time[datetime]");
    const tweetText = element.querySelector('[data-testid="tweetText"]')?.textContent?.trim() || "";
    const images = [...element.querySelectorAll(`a[href*="/status/${tweetId}/photo/"]`)]
      .map((anchor) => {
        const image = anchor.querySelector('img[src*="pbs.twimg.com/media/"]');
        return {
          src: image?.currentSrc || image?.src || "",
          alt: image?.alt || "",
          href: anchor.getAttribute("href") || "",
        };
      })
      .filter((item) => item.src);
    return { datetime: time?.getAttribute("datetime") || "", tweetText, images };
  }, candidate.tweetId);

  const unique = new Map();
  for (const image of extracted.images) {
    const url = originalImageUrl(image.src);
    unique.set(url, { imageUrl: url, alt: image.alt, photoPath: image.href });
  }
  if (!unique.size) throw new Error("対象ポストから画像を取得できません（センシティブ表示等を確認）");

  return {
    tweetId: candidate.tweetId,
    xUrl: candidate.url,
    postedAt: normalizePostedAt(extracted.datetime, candidate.tweetId),
    tweetText: extracted.tweetText,
    images: [...unique.values()],
  };
}

async function downloadImage(request, imageUrl, destination) {
  let response = await request.get(imageUrl, { failOnStatusCode: false });
  let finalUrl = imageUrl;
  if (!response.ok()) {
    finalUrl = originalImageUrl(imageUrl, "jpg");
    response = await request.get(finalUrl, { failOnStatusCode: false });
  }
  if (!response.ok()) throw new Error(`画像の取得に失敗しました: HTTP ${response.status()}`);
  await fs.writeFile(destination, Buffer.from(await response.body()));
  return finalUrl;
}

async function savePost(context, post, downloadsDir) {
  const postDir = path.join(downloadsDir, post.tweetId);
  await fs.mkdir(postDir, { recursive: true });
  const savedImages = [];

  for (const [index, image] of post.images.entries()) {
    const destination = path.join(postDir, imageFilename(image.imageUrl, index + 1));
    const finalUrl = await downloadImage(context.request, image.imageUrl, destination);
    savedImages.push({
      order: index + 1,
      file: path.relative(downloadsDir, destination),
      alt: image.alt,
      sourceUrl: finalUrl,
      character: "",
      confidence: "",
      status: "未判定",
    });
  }

  const metadata = { ...post, images: savedImages, sensitive: null, title: "", tags: [] };
  await fs.writeFile(path.join(postDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  return metadata;
}

async function loadSavedPost(downloadsDir, candidate) {
  const postDir = path.join(downloadsDir, candidate.tweetId);
  try {
    const metadata = JSON.parse(await fs.readFile(path.join(postDir, "metadata.json"), "utf8"));
    if (metadata.tweetId !== candidate.tweetId || !metadata.images?.length) return null;
    const filesExist = await Promise.all(
      metadata.images.map((image) => fs.access(path.join(downloadsDir, image.file)).then(() => true, () => false)),
    );
    return filesExist.every(Boolean) ? metadata : null;
  } catch {
    return null;
  }
}

async function writeReports(outputDir, report) {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "batch-result.json"), `${JSON.stringify(report, null, 2)}\n`);
  const manualText = report.manualRequired.length
    ? `${report.manualRequired.map((item) => `${item.url}\t${item.reason}`).join("\n")}\n`
    : "# 手動対応が必要なURLはありません。\n";
  await fs.writeFile(path.join(outputDir, "manual-required.txt"), manualText);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { candidates, invalid } = await readCandidates(options.input);
  const registeredIds = await existingTweetIds(options.galleryData);
  const alreadyRegistered = candidates.filter(({ tweetId }) => registeredIds.has(tweetId));
  const allPending = candidates.filter(({ tweetId }) => !registeredIds.has(tweetId));
  let pending = options.onlyTweetId
    ? allPending.filter(({ tweetId }) => tweetId === options.onlyTweetId)
    : allPending;
  if (options.limit) pending = pending.slice(0, options.limit);
  const outputDir = path.join(options.workDir, "output");
  const downloadsDir = path.join(options.workDir, "downloaded");
  const report = {
    createdAt: new Date().toISOString(),
    input: options.input,
    summary: {
      uniqueValidUrls: candidates.length,
      alreadyRegistered: alreadyRegistered.length,
      pending: allPending.length,
      selectedForRun: pending.length,
      downloaded: 0,
      manualRequired: 0,
      invalid: invalid.length,
    },
    alreadyRegistered,
    downloaded: [],
    manualRequired: [],
    invalid,
  };

  if (options.dryRun || pending.length === 0) {
    await writeReports(outputDir, report);
    process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
    return;
  }

  await fs.mkdir(downloadsDir, { recursive: true });
  const context = await chromium.launchPersistentContext(options.profileDir, {
    headless: options.headless,
    viewport: { width: 1440, height: 1600 },
  });

  try {
    const page = context.pages()[0] ?? (await context.newPage());
    page.setDefaultTimeout(20_000);
    for (const candidate of pending) {
      const savedPost = await loadSavedPost(downloadsDir, candidate);
      if (savedPost) {
        process.stdout.write(`[保存済み] ${candidate.url}\n`);
        report.downloaded.push(savedPost);
        report.summary.downloaded = report.downloaded.length;
        await writeReports(outputDir, report);
        continue;
      }
      process.stdout.write(`[取得中] ${candidate.url}\n`);
      try {
        const post = await extractPost(page, candidate);
        report.downloaded.push(await savePost(context, post, downloadsDir));
      } catch (error) {
        const screenshotFile = path.join(outputDir, `error-${candidate.tweetId}.png`);
        await fs.mkdir(outputDir, { recursive: true });
        await page.screenshot({ path: screenshotFile, fullPage: false }).catch(() => {});
        report.manualRequired.push({
          ...candidate,
          reason: error instanceof Error ? error.message : String(error),
          screenshot: path.relative(options.workDir, screenshotFile),
        });
      }
      report.summary.downloaded = report.downloaded.length;
      report.summary.manualRequired = report.manualRequired.length;
      await writeReports(outputDir, report);
    }
  } finally {
    await context.close();
  }

  process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
