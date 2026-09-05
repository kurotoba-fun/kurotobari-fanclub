# X画像の一括取り込み

XポストのURL一覧から画像とメタデータを取得し、キャラクター判定後にギャラリーへ反映するための補助ツールです。

## 全体の流れ

1. 日付範囲を指定し、X検索結果からポストURLを自動収集する
2. `batch-import-x-posts.mjs` で画像とメタデータを作業フォルダへ保存する
3. 保存画像を確認し、`キャラクター判定.md` で掲載対象とキャラクターを確定する
4. `finalize-gallery-import.mjs` を最初はdry-run、問題がなければ `--apply` 付きで実行する
5. YAML、画像ファイル、差分を検証してからコミットする

Xから取得できなかったポストは `output/manual-required.txt` に記録されます。センシティブ表示などで自動取得できない画像だけ、作業フォルダへ手動保存してください。

後日手動保存するポストを `urls.txt` に残す場合は、URLを `#` でコメントアウトします。コメント行は一括取得の対象になりません。

```text
# 手動対応待ち（センシティブ）
# https://x.com/KUROTOBA_KGM/status/1234567890123456789?s=20
```

## X検索結果からURLをブックマークレットで収集する

X検索はPlaywright専用ブラウザではなく、普段ログインに使っているChrome上で巡回します。これにより、Xのログイン制限や新規ブラウザ判定を避けながら、表示中の検索結果からURLだけを取得できます。

### 初回だけ: ブックマークレットを登録する

1. `scripts/x-search-url-collector-bookmarklet.html` をChromeで開く。
2. Chromeで適当なページをブックマークし、そのブックマークの「編集」を開く。
3. 登録ページの「ブックマークレットをコピー」を押し、ブックマークのURL欄へ貼り付ける。
4. URL欄が `javascript:` で始まることを確認して保存する。

青いボタンをブックマークバーへドラッグする方法もありますが、ローカルHTMLではChromeがコードをURLエンコードする場合があるため、コピー方式を推奨します。

このHTMLはインストール用です。サイトへ公開するファイルではありません。

### URLを収集する

1. 普段使っているChromeでXへログインする。
2. 次の形式で検索し、「最新」タブを開く。

```text
from:KUROTOBA_KGM filter:images -is:retweet since:2026-07-13 until:2026-07-20
```

3. ブックマークバーの「X画像URLを収集」を押す。
4. ページ右上に表示されるパネルで件数を確認する。検索結果は自動で下へスクロールする。
5. 自動停止後、「URLをコピー」または「txtで保存」を押す。
6. コピーしたURLを作業用の `urls.txt` に貼るか、保存したtxtで置き換える。

`since` は対象に含まれ、`until` は対象に含まれません。7月20日まで含める場合は `until:2026-07-21` にします。

ブックマークレットの動作:

- 検索クエリの `from:` から対象アカウントを読み取る。省略時は `KUROTOBA_KGM`
- 対象アカウント自身の `/status/<ID>` だけを収集
- 引用先や返信欄に表示された別アカウントのURLを除外
- 時刻リンク・画像リンクなど、同じポストから見つかる複数リンクを投稿IDで重複除外
- 1.5秒ごとに少しずつ自動スクロール
- 10回連続で新しいURLが見つからない場合、または160回で自動停止
- 手動停止・再開、URLコピー、txt保存に対応

この処理は開いているページのリンクだけを読み取ります。Xのパスワード、Cookie、ログイン情報は取得しません。X検索自体に表示されない投稿は回収できないため、期間は1週間程度に区切るのがおすすめです。

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
