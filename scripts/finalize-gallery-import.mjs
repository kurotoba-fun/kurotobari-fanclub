import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SITE_ROOT = path.resolve(import.meta.dirname, "..");
const WORK_ROOT = path.resolve(
  SITE_ROOT,
  "../kurotobari-site-documents/2026年9月4日_ギャラリー更新効率/作業用",
);
const DEFAULT_CLASSIFICATION = path.join(WORK_ROOT, "output/キャラクター判定.md");
const DEFAULT_DOWNLOADED = path.join(WORK_ROOT, "downloaded");
const DEFAULT_GALLERY_DATA = path.join(SITE_ROOT, "_data/gallery_items.yml");
const DEFAULT_GALLERY_ROOT = path.join(SITE_ROOT, "assets/images/gallery");

const CHARACTER_DIRS = new Map([
  ["天城", "amagi"],
  ["灼", "arata"],
  ["ヒバリ", "hibari"],
  ["哩", "mairu"],
  ["浬", "kairi"],
  ["九条", "kujo"],
  ["調", "shirabe"],
  ["白瀬", "shirose"],
  ["煤ヶ谷", "susugaya"],
  ["橘", "tachibana"],
  ["稔", "minori"],
  ["影戸", "kageto"],
  ["月城", "tsukishiro"],
  ["王 逸翔", "wang-yixiang"],
  ["巫馬 梓睿", "wuma-zirui"],
  ["俊哲", "junze"],
]);

function parseArgs(argv) {
  const options = {
    apply: false,
    classification: DEFAULT_CLASSIFICATION,
    downloaded: DEFAULT_DOWNLOADED,
    galleryData: DEFAULT_GALLERY_DATA,
    galleryRoot: DEFAULT_GALLERY_ROOT,
    expectedCount: 0,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") options.apply = true;
    else if (arg === "--classification" && argv[index + 1]) {
      options.classification = path.resolve(argv[++index]);
    } else if (arg === "--downloaded" && argv[index + 1]) {
      options.downloaded = path.resolve(argv[++index]);
    } else if (arg === "--gallery-data" && argv[index + 1]) {
      options.galleryData = path.resolve(argv[++index]);
    } else if (arg === "--gallery-root" && argv[index + 1]) {
      options.galleryRoot = path.resolve(argv[++index]);
    } else if (arg === "--expected-count" && argv[index + 1]) {
      options.expectedCount = Number(argv[++index]);
      if (!Number.isInteger(options.expectedCount) || options.expectedCount < 1) {
        throw new Error("--expected-countには1以上の整数を指定してください");
      }
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "Usage: node scripts/finalize-gallery-import.mjs [--apply] [--expected-count <number>]\n",
      );
      process.exit(0);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function yamlQuote(value) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function parseClassification(markdown) {
  let tweetId = "";
  const rows = [];
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^### (\d+)$/);
    if (heading) {
      tweetId = heading[1];
      continue;
    }
    if (!tweetId || !line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (!/^\d+$/.test(cells[0] ?? "") || cells.at(-1) !== "掲載候補") continue;
    const [order, filename, character] = cells;
    const characterDir = CHARACTER_DIRS.get(character);
    if (!characterDir) throw new Error(`保存先未定義のキャラクターです: ${character}`);
    rows.push({ tweetId, order: Number(order), filename, character, characterDir });
  }
  return rows;
}

function yamlItem(item) {
  return [
    `- src: ${yamlQuote(item.src)}`,
    `  id: ${yamlQuote(item.id)}`,
    `  title: ${item.character}`,
    "  tags:",
    `  - ${item.character}`,
    `  date: '${item.postedAt}'`,
    "  thumb_position: '50% 30%'",
    `  x_url: ${yamlQuote(item.xUrl)}`,
  ].join("\n");
}

async function exists(filePath) {
  return fs.access(filePath).then(() => true, () => false);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const markdown = await fs.readFile(options.classification, "utf8");
  const rows = parseClassification(markdown);
  const galleryYaml = await fs.readFile(options.galleryData, "utf8");
  const items = [];
  const problems = [];

  for (const row of rows) {
    const metadataPath = path.join(options.downloaded, row.tweetId, "metadata.json");
    const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
    const source = path.join(options.downloaded, row.tweetId, row.filename);
    const destination = path.join(options.galleryRoot, row.characterDir, row.filename);
    const src = `/assets/images/gallery/${row.characterDir}/${row.filename}`;
    if (!(await exists(source))) problems.push(`元画像なし: ${source}`);
    if (await exists(destination)) problems.push(`保存先が既に存在: ${destination}`);
    if (galleryYaml.includes(`src: "${src}"`)) problems.push(`YAML登録済み: ${src}`);
    items.push({
      ...row,
      source,
      destination,
      src,
      id: `${row.characterDir}-${path.basename(row.filename, path.extname(row.filename))}`,
      postedAt: metadata.postedAt,
      xUrl: metadata.xUrl,
    });
  }

  const duplicateDestinations = items
    .map((item) => item.destination)
    .filter((value, index, values) => values.indexOf(value) !== index);
  for (const destination of new Set(duplicateDestinations)) {
    problems.push(`取り込み内で保存先重複: ${destination}`);
  }
  if (options.expectedCount && items.length !== options.expectedCount) {
    problems.push(`掲載候補は${options.expectedCount}枚の想定ですが${items.length}枚です`);
  }

  const summary = {
    mode: options.apply ? "apply" : "dry-run",
    candidates: items.length,
    problems: problems.length,
    byCharacter: Object.fromEntries(
      [...CHARACTER_DIRS.keys()]
        .map((character) => [character, items.filter((item) => item.character === character).length])
        .filter(([, count]) => count > 0),
    ),
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (problems.length) throw new Error(problems.join("\n"));
  if (!options.apply) return;

  for (const item of items) {
    await fs.mkdir(path.dirname(item.destination), { recursive: true });
    await fs.copyFile(item.source, item.destination);
  }

  items.sort((a, b) => b.postedAt.localeCompare(a.postedAt) || a.order - b.order);
  const block = `${items.map(yamlItem).join("\n")}\n`;
  const updatedYaml = galleryYaml.startsWith("---\n")
    ? `---\n${block}${galleryYaml.slice(4)}`
    : `${block}${galleryYaml}`;
  await fs.writeFile(options.galleryData, updatedYaml);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
