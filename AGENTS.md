# kurotobari-site Guide

このプロジェクトは、黒帳のキャラクターと世界観をまとめる Jekyll / GitHub Pages サイトです。作者公認のファン活動として運営されているため、文章や導線を変更する時はファンサイトとしての立場が伝わる表現を保ってください。

## イベント更新

イベントページは `events.md` で、URL は `/events/` です。表示内容は `_data/events.yml` から読み込み、月ごとの見出しと月別INDEXを生成します。

### 対象ファイル

- ページ: `events.md`
- イベントデータ: `_data/events.yml`
- ナビゲーション: `_includes/header.html`
- スタイル: `assets/css/style.css`

### データ形式

イベントは以下のような YAML 形式で追加します。

```yaml
- title: 調の誕生日
  date: "01-16"
  type: birthday
  character: shirabe
  character_name: 烏丸 調
  url: /characters/shirabe/
  description: 通常任務日。調のロッカーが毎年女子構成員からのプレゼントで埋まる。
```

期間イベントは `end_date` を使います。

```yaml
- title: 慰安旅行
  date: "08-24"
  end_date: "08-26"
  type: organization
  description: 黒帳構成員に年一度だけ与えられる完全オフ扱いの行事。二泊三日。
```

### 更新時の注意

- `date` と `end_date` は `"MM-DD"` 形式にする。
- `type` は主に `birthday`, `memorial`, `monthly`, `organization` を使う。
- `type: birthday` かつ `url` が通常キャラクター詳細ページと一致するイベントは、キャラクター詳細ページの「誕生日」枠にも表示される。
- 仮日付の誕生日は、イベントタイトルや説明文に「仮」と分かる表現を残す。
- イベントの根拠を確認する時は `developerWiki/黒帳世界観/` のロアブック HTML を参照する。
- 更新後は `bundle exec jekyll build` で `/events/` と該当キャラクター詳細ページの生成を確認する。

## ギャラリー更新

ユーザーが「ギャラリーに追加してほしい」と依頼した時は、基本的に画像が先に `assets/images/gallery/` 配下へ追加されています。`_data/gallery_items.yml` にまだ載っていない画像を探し、未記載分だけを追加してください。

### 対象ファイル

- 画像置き場: `assets/images/gallery/`
- ギャラリーデータ: `_data/gallery_items.yml`

### 追加前に確認すること

- 追加対象の画像が `_data/gallery_items.yml` に未記載か確認する。
- ユーザーに日付とタイトルの指定があるか確認する。
- 日付やタイトルの指定がない場合は、追加前にユーザーへ確認する。
- キャラクター名は画像の格納ディレクトリから推定し、既存のキャラクター名・タグ表記と照合する。
- タグには必ずキャラクター名を入れる。

### キャラクターディレクトリとタグ

`assets/images/gallery/<directory>/...` の `<directory>` から、以下のタグを使ってください。

- `amagi` -> `天城`
- `arata` -> `灼`
- `boss` -> `ボス`
- `elliott` -> `エリオット`
- `fumi` -> `ふみ`
- `kageto` -> `影戸`
- `kairi` -> `浬`
- `kujo` -> `九条`
- `kuro-shirabe` -> `黒調`
- `mairu` -> `哩`
- `momochi` -> `百地`
- `sakuraba` -> `桜庭`
- `shirabe` -> `調`
- `shirose` -> `白瀬`
- `sometani` -> `染谷`
- `susugaya` -> `煤ヶ谷`
- `tachibana` -> `橘`
- `tobarimori` -> `帳守`
- `tsukishiro` -> `月城`

判断に迷うディレクトリや新しいキャラクターのディレクトリがある場合は、`_characters/` や既存の `_data/gallery_items.yml` を確認し、それでも不明ならユーザーに確認してください。

### 追加形式

既存の YAML 形式に合わせて、基本は以下の形で追加します。

```yaml
- src: "/assets/images/gallery/<character-dir>/<filename>"
  title: <タイトル>
  tags:
  - <キャラクター名>
  date: '<YYYY-MM-DDTHH:MM:SS+09:00>'
  thumb_position: '50% 50%'
```

必要に応じて、ユーザー指定や既存類似アイテムに合わせて追加タグ、`description`、`thumb_position` を設定してください。指定がない場合の `thumb_position` は既存の標準に合わせて `'50% 50%'` を使います。

### 作業手順

1. `assets/images/gallery/` の画像一覧から未コミットの画像を確認する。
2. `_data/gallery_items.yml` の `src` と照合し、未記載の画像だけを抽出する。
3. 未記載画像のディレクトリ名からキャラクター名を確認する。
4. ユーザー指定の日付・タイトルを反映する。指定がなければ確認する。
5. 画像を確認して、サムネイルのトリミング位置をキャラクターの顔が見えるように決める。
6. `_data/gallery_items.yml` へ既存の並びに合わせて追加する。
7. 追加後、重複 `src` がないか確認する。

### 便利な確認コマンド

未記載画像の確認では、シェルやスクリプトで画像一覧と YAML 内の `src` を比較してください。手作業で探す場合も、少なくとも以下を確認します。

```bash
find assets/images/gallery -type f
rg 'src: "/assets/images/gallery/' _data/gallery_items.yml
```

## ローカル確認

Jekyll サイトの表示確認が必要な時は、プロジェクトルートで以下を使います。

```bash
bundle exec jekyll serve
```

## 依頼例
```
未コミット画像をギャラリーに追加して

日付：午後5:47 · 2026年6月3日
タイトル：ヤキモチ妬いちゃった時の[キャラクター]
タグ：[キャラクター]
Xリンク：https://x.com/KUROTOBA_KGM/status/2062093710423384514?s=20
センシティブ：OFF
説明：
  調：「……妬くでしょ、そりゃ。先輩は俺のなんすから。」
  灼：「…悪りぃかよ。」
  浬：「……俺お前のそういうとこ、たまにすっごい腹立つの。」
  天城：「……分かんね。ただ、不快だった。」
  白瀬：
    「…うん…少しね。
    …気にしないで、ぼくの問題だから。（名演技）」
  九条：「…俺では不足か？」
  橘：「……アンタは、タチが悪いな。」
  煤ヶ谷：「アレ、わざとやとしたらちゃんと効いとったで。…何がしたいん？」

```


```
未コミット画像をギャラリーに追加して
日付：午後2:45 · 2026年6月16日
タイトル：[キャラクター]
タグ：[キャラクター]
Xリンク：https://x.com/KUROTOBA_KGM/status/2066759164479848597?s=20
センシティブ：ON

画像のトリミング位置についてはキャラクターの顔が見えるように調整してください。
```


## playwrightでのX投稿取得方法

X投稿URLだけ渡された場合は、`x-media-downloader` の Playwright スクリプトで投稿時刻・共有URL・画像を取得できます。

### 事前準備

Playwright と Chromium は `x-media-downloader` に導入済みです。ログインが必要な場合は、以下で X にログインしてください。

```bash
cd ../x-media-downloader
npm run login -- --url https://x.com/KUROTOBA_KGM/media
```

ログイン状態は `x-media-downloader/.auth/x-playwright-profile` に保存されます。秘密情報なので表示・コミットしないでください。

### 投稿単体から画像を取得する

投稿URLから画像を保存し、投稿時刻と共有URLを JSON で確認します。

```bash
cd ../x-media-downloader
npm run post -- --url https://x.com/KUROTOBA_KGM/status/2066116349324390911 --out ../kurotobari-site/assets/images/gallery/hibari --json
```

出力例:

```json
{
  "tweetId": "2066116349324390911",
  "postedAt": "2026-06-14T20:11:00+09:00",
  "postedAtText": "11:11 AM · Jun 14, 2026",
  "shareUrl": "https://x.com/KUROTOBA_KGM/status/2066116349324390911?s=20",
  "savedFiles": [
    "../kurotobari-site/assets/images/gallery/hibari/HKxR3fSaEAADf8r.jpg"
  ]
}
```

`postedAt` を `_data/gallery_items.yml` の `date` に使い、`shareUrl` を `x_url` に使います。画像ファイル名は X の画像IDをもとに保存されます。

### ギャラリー登録までの流れ

1. ユーザーから X 投稿URLとキャラクター名を受け取る。
2. キャラクター名に対応する `assets/images/gallery/<directory>/` を選ぶ。
3. `npm run post -- --url <投稿URL> --out ../kurotobari-site/assets/images/gallery/<directory> --json` を実行する。
4. 保存された画像を確認し、キャラクターの顔が見える `thumb_position` を決める。
5. `_data/gallery_items.yml` の先頭へ、既存形式に合わせて追加する。
6. `ruby -e "require 'yaml'; YAML.load_file('_data/gallery_items.yml')"` などで YAML が読めることを確認する。

投稿本文や画像からキャラクターを完全自動判定するのは誤判定の可能性があります。ユーザーがキャラクター名を明示していない場合は確認してください。

### ALT付き複数画像・返信投稿も含めて取得する

ALTを `description` に入れたい複数画像投稿や、返信投稿にも画像が続く場合は、`kurotobari-site` 側の補助スクリプトを使います。返信がある場合はユーザーに返信投稿URLも指定してもらうと確実です。

```bash
node scripts/download-x-alt-posts.mjs \
  --url https://x.com/KUROTOBA_KGM/status/<main-status-id> \
  --url https://x.com/KUROTOBA_KGM/status/<reply-status-id> \
  --map shirabe,arata,kairi,amagi,shirose,kujo,tachibana,susugaya \
  --json
```

- `--url` は画像を取得する投稿URLを表示順に並べる。メイン投稿だけなら1つでよい。
- `--map` は取得される画像順に対応する `assets/images/gallery/<directory>/` をカンマ区切りで指定する。
- 出力JSONの `savedFile`, `postedAt`, `shareUrl`, `alt` を使って `_data/gallery_items.yml` に追加する。
- `alt` は既存形式に合わせて `description: |-` に入れる。
- `postedAt` が空の場合は、X画面上の投稿時刻を確認して手動で JST ISO 形式へ変換する。
- 画像数と `--map` の数が一致しない時はスクリプトが失敗するため、URLや画像順を確認する。

### ユーザーからの依頼例 
以下をそれぞれ対応し、都度キャラクター名でコミットしてほしい。


```
「playwrightでのX投稿取得方法」を参照し、
このX投稿をギャラリーに追加して
キャラクター：帳守
センシティブ：OFF
https://x.com/KUROTOBA_KGM/status/2066783418038542463
```
```
「playwrightでのX投稿取得方法」を参照し、
このX投稿をギャラリーに追加して
キャラクター：天城
センシティブ：OFF
https://x.com/KUROTOBA_KGM/status/2066794662577455319
```
