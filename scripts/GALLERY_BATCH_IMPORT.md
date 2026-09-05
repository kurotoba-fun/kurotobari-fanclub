# X画像の一括取り込み

XポストのURL一覧から画像とメタデータを取得し、キャラクター判定後にギャラリーへ反映するための補助ツールです。

## 全体の流れ

1. `urls.txt` にXポストURLを1行ずつ記載する
2. `batch-import-x-posts.mjs` で画像とメタデータを作業フォルダへ保存する
3. 保存画像を確認し、`キャラクター判定.md` で掲載対象とキャラクターを確定する
4. `finalize-gallery-import.mjs` を最初はdry-run、問題がなければ `--apply` 付きで実行する
5. YAML、画像ファイル、差分を検証してからコミットする

Xから取得できなかったポストは `output/manual-required.txt` に記録されます。センシティブ表示などで自動取得できない画像だけ、作業フォルダへ手動保存してください。

## URL一覧から画像を取得

標準の作業フォルダは、今回作成した次のディレクトリです。

```text
../kurotobari-site-documents/2026年9月4日_ギャラリー更新効率/作業用/
├── urls.txt
├── downloaded/
├── manual/
└── output/
```

```bash
node scripts/batch-import-x-posts.mjs --dry-run
node scripts/batch-import-x-posts.mjs
```

主なオプション:

- `--input <file>`: URL一覧を指定
- `--work-dir <dir>`: 別の作業フォルダを指定
- `--limit <数>`: 先頭から指定件数だけ処理
- `--only <URLまたはID>`: 1ポストだけ処理
- `--headless`: ブラウザ画面を表示しない

このスクリプトは、隣接する `x-media-downloader` にインストール済みのPlaywrightと保存済みXログイン状態を利用します。

## 判定結果をギャラリーへ反映

`キャラクター判定.md` の各画像を `掲載候補` または対象外として整理してから実行します。

```bash
node scripts/finalize-gallery-import.mjs --expected-count <掲載候補数>
node scripts/finalize-gallery-import.mjs --expected-count <掲載候補数> --apply
```

引数なしでは事前検証だけを行います。`--apply` を付けると掲載候補画像を `assets/images/gallery/` のキャラクターフォルダへコピーし、`_data/gallery_items.yml` の先頭へ項目を追加します。

`--expected-count` を指定すると、判定表から読み取った掲載候補数が想定と異なる場合に反映を中止できます。標準作業パス以外を使う場合は `--classification`、`--downloaded` などで入力先を指定してください。

## 反映後の確認

```bash
ruby -e "require 'yaml'; YAML.load_file('_data/gallery_items.yml'); puts 'YAML OK'"
git diff --check
```

さらに、追加した `src` の画像が存在することと、`date`、`x_url`、`tags`、`sensitive`、`thumb_position` が既存形式に合っていることを確認します。

## ギャラリーIDの補完

既存データに `id` がない場合は、次のコマンドでキャラクターフォルダ名と画像名から一意なIDを補完できます。引数なしは確認のみです。

```bash
node scripts/ensure-gallery-ids.mjs
node scripts/ensure-gallery-ids.mjs --apply
```

同じ画像名が複数ある場合だけ、ID末尾に `-2` 以降の連番が付きます。
