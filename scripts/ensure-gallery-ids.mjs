import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_GALLERY_DATA = path.resolve(import.meta.dirname, "../_data/gallery_items.yml");

function parseArgs(argv) {
  const options = { apply: false, galleryData: DEFAULT_GALLERY_DATA };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") options.apply = true;
    else if (arg === "--gallery-data" && argv[index + 1]) {
      options.galleryData = path.resolve(argv[++index]);
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "Usage: node scripts/ensure-gallery-ids.mjs [--apply] [--gallery-data <file>]\n",
      );
      process.exit(0);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function idBaseFromSrc(src) {
  const match = src.match(/\/gallery\/(.+)$/);
  if (!match) throw new Error(`ギャラリー画像パスとして認識できません: ${src}`);
  const parts = match[1].split("/");
  const filename = parts.pop();
  const folder = parts.join("-") || "gallery";
  const extension = path.extname(filename);
  return `${folder}-${path.basename(filename, extension)}`
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueId(base, usedIds) {
  if (!usedIds.has(base)) return base;
  let suffix = 2;
  while (usedIds.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const yaml = await fs.readFile(options.galleryData, "utf8");
  const lines = yaml.split("\n");
  const usedIds = new Set();
  const duplicateExistingIds = [];

  for (const line of lines) {
    const match = line.match(/^  id: ["']([^"']+)["']$/);
    if (!match) continue;
    if (usedIds.has(match[1])) duplicateExistingIds.push(match[1]);
    usedIds.add(match[1]);
  }
  if (duplicateExistingIds.length) {
    throw new Error(`既存IDが重複しています: ${[...new Set(duplicateExistingIds)].join(", ")}`);
  }

  const output = [];
  let itemCount = 0;
  let addedCount = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    output.push(line);
    const srcMatch = line.match(/^- src: ["']([^"']+)["']$/);
    if (!srcMatch) continue;
    itemCount += 1;
    if (/^  id: /.test(lines[index + 1] || "")) continue;
    const id = uniqueId(idBaseFromSrc(srcMatch[1]), usedIds);
    usedIds.add(id);
    output.push(`  id: "${id}"`);
    addedCount += 1;
  }

  const result = {
    mode: options.apply ? "apply" : "dry-run",
    items: itemCount,
    existingIds: itemCount - addedCount,
    addedIds: addedCount,
    uniqueIds: usedIds.size,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (options.apply && addedCount) {
    await fs.writeFile(options.galleryData, output.join("\n"));
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
