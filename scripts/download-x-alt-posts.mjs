import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("../../x-media-downloader/node_modules/playwright");

const DEFAULT_PROFILE_DIR = path.resolve("../x-media-downloader/.auth/x-playwright-profile");
const DEFAULT_OUT_ROOT = path.resolve("assets/images/gallery");

function parseArgs(argv) {
  const options = {
    urls: [],
    characterDirs: [],
    outRoot: DEFAULT_OUT_ROOT,
    profileDir: DEFAULT_PROFILE_DIR,
    headless: true,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if ((arg === "--url" || arg === "-u") && argv[index + 1]) {
      options.urls.push(argv[++index]);
    } else if ((arg === "--map" || arg === "--dirs") && argv[index + 1]) {
      options.characterDirs = argv[++index]
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    } else if ((arg === "--out-root" || arg === "-o") && argv[index + 1]) {
      options.outRoot = path.resolve(argv[++index]);
    } else if (arg === "--profile" && argv[index + 1]) {
      options.profileDir = path.resolve(argv[++index]);
    } else if (arg === "--headful") {
      options.headless = false;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
  }

  return options;
}

function printUsage() {
  process.stdout.write(`Usage:
  node scripts/download-x-alt-posts.mjs --url <x-status-url> [--url <reply-url>] --map <dir,dir,...>

Options:
  --url, -u <url>       X status URL to open. Can be repeated.
  --map, --dirs <list>  Comma-separated gallery directories in image order.
  --out-root, -o <dir>  Gallery root directory (default: assets/images/gallery)
  --profile <dir>       Playwright persistent profile (default: ../x-media-downloader/.auth/x-playwright-profile)
  --headful             Open a visible browser window
  --json                Print machine-readable metadata
`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTweetId(statusUrl) {
  try {
    const url = new URL(statusUrl);
    return url.pathname.match(/\/status\/(\d+)/)?.[1] ?? "";
  } catch {
    return "";
  }
}

function normalizeStatusUrl(statusUrl) {
  const tweetId = getTweetId(statusUrl);
  if (!tweetId) return statusUrl;
  return `https://x.com/KUROTOBA_KGM/status/${tweetId}?s=20`;
}

function toJstIsoString(date) {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const year = jst.getUTCFullYear();
  const month = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  const hour = String(jst.getUTCHours()).padStart(2, "0");
  const minute = String(jst.getUTCMinutes()).padStart(2, "0");
  const second = String(jst.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
}

function normalizePostedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toJstIsoString(date);
}

function parseXTimestampText(timestampText) {
  const match = timestampText
    .trim()
    .match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*·\s*([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return "";

  const [, rawHour, rawMinute, meridiem, rawMonth, rawDay, rawYear] = match;
  const monthIndexes = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const monthIndex = monthIndexes[rawMonth];
  if (monthIndex === undefined) return "";

  let hour = Number(rawHour) % 12;
  if (meridiem === "PM") hour += 12;

  const date = new Date(
    Date.UTC(Number(rawYear), monthIndex, Number(rawDay), hour, Number(rawMinute), 0),
  );
  return toJstIsoString(date);
}

function sanitizeFilePart(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function buildOriginalImageUrl(rawUrl) {
  const url = new URL(rawUrl);
  const format = url.searchParams.get("format");
  if (format) {
    url.searchParams.set("name", "orig");
    return url.toString();
  }

  const extension = path.extname(url.pathname).replace(/^\./, "");
  if (extension) {
    url.pathname = url.pathname.slice(0, -extension.length - 1);
    url.searchParams.set("format", extension);
  }
  url.searchParams.set("name", "orig");
  return url.toString();
}

function imageFileName(imageUrl, fallbackIndex) {
  const url = new URL(imageUrl);
  const mediaId = path.basename(url.pathname) || `image_${fallbackIndex}`;
  const format =
    url.searchParams.get("format") ||
    path.extname(url.pathname).replace(/^\./, "") ||
    "jpg";
  return sanitizeFilePart(`${mediaId}.${format}`);
}

async function isLoginGate(page) {
  if (page.url().includes("/i/flow/login")) return true;

  const loginMarkers = [
    'input[autocomplete="username"]',
    'input[name="text"]',
    'a[href*="/login"]',
  ];

  for (const selector of loginMarkers) {
    if ((await page.locator(selector).count()) > 0) return true;
  }

  return false;
}

async function getStatusArticle(page, tweetId) {
  const articles = await page.locator("article").elementHandles();
  for (const article of articles) {
    const hasTweetLink = await article.evaluate(
      (element, id) => Boolean(element.querySelector(`a[href*="/status/${id}"]`)),
      tweetId,
    );
    if (hasTweetLink) return article;
  }
  return articles[0] ?? null;
}

async function extractPost(page, statusUrl) {
  const tweetId = getTweetId(statusUrl);
  if (!tweetId) {
    throw new Error(`Could not parse tweet id from URL: ${statusUrl}`);
  }

  await page.goto(statusUrl, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await sleep(1500);

  if (await isLoginGate(page)) {
    throw new Error("X requires login. Run the x-media-downloader login flow first.");
  }

  const article = await getStatusArticle(page, tweetId);
  if (!article) {
    throw new Error(`Could not find the status article: ${tweetId}`);
  }

  const timestamp = await article.evaluate((element, id) => {
    const anchor =
      element.querySelector(`a[href$="/status/${id}"]`) ||
      element.querySelector(`a[href$="/status/${id}?s=20"]`);
    const time = anchor?.querySelector("time[datetime]") || element.querySelector("time[datetime]");
    return {
      datetime: time?.getAttribute("datetime") || "",
      text: element.textContent || "",
    };
  }, tweetId);

  const images = await article.evaluate(() => {
    const anchors = [...document.querySelectorAll('a[href*="/photo/"]')];
    return anchors
      .map((anchor) => {
        const image = anchor.querySelector('img[src*="pbs.twimg.com/media/"]');
        return {
          imageUrl: image?.currentSrc || image?.src || "",
          alt: image?.alt || anchor.getAttribute("aria-label") || "",
          photoHref: anchor.getAttribute("href") || "",
        };
      })
      .filter((item) => item.imageUrl);
  });

  return {
    tweetId,
    postedAt: normalizePostedAt(timestamp.datetime) || parseXTimestampText(timestamp.text),
    shareUrl: normalizeStatusUrl(statusUrl),
    images: images.map((image) => ({
      ...image,
      imageUrl: buildOriginalImageUrl(image.imageUrl),
    })),
  };
}

async function downloadImage(requestContext, imageUrl, destinationPath) {
  const response = await requestContext.get(imageUrl, { failOnStatusCode: false });
  if (!response.ok()) {
    throw new Error(`HTTP ${response.status()} for ${imageUrl}`);
  }
  await fs.writeFile(destinationPath, Buffer.from(await response.body()));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.urls.length || !options.characterDirs.length) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const context = await chromium.launchPersistentContext(options.profileDir, {
    headless: options.headless,
    viewport: { width: 1440, height: 1600 },
  });

  try {
    const page = context.pages()[0] ?? (await context.newPage());
    page.setDefaultTimeout(20000);

    const posts = [];
    for (const url of options.urls) {
      posts.push(await extractPost(page, url));
    }

    const flattenedImages = posts.flatMap((post) =>
      post.images.map((image) => ({
        ...image,
        tweetId: post.tweetId,
        postedAt: post.postedAt,
        shareUrl: post.shareUrl,
      })),
    );

    if (flattenedImages.length !== options.characterDirs.length) {
      throw new Error(
        `Image count (${flattenedImages.length}) does not match map count (${options.characterDirs.length}).`,
      );
    }

    const result = [];
    for (let index = 0; index < flattenedImages.length; index += 1) {
      const image = flattenedImages[index];
      const characterDir = options.characterDirs[index];
      const outDir = path.join(options.outRoot, characterDir);
      await fs.mkdir(outDir, { recursive: true });
      const destinationPath = path.join(outDir, imageFileName(image.imageUrl, index + 1));
      await downloadImage(context.request, image.imageUrl, destinationPath);
      result.push({
        ...image,
        characterDir,
        savedFile: destinationPath,
      });
    }

    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    for (const item of result) {
      process.stdout.write(`${item.characterDir}: ${item.savedFile}\n`);
      process.stdout.write(`  alt: ${item.alt}\n`);
    }
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
