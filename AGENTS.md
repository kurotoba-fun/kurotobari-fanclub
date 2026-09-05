# kurotobari-site Guide

このプロジェクトは、黒帳のキャラクターと世界観をまとめる Jekyll サイトです。現在の公開先は Cloudflare Pages です。作者公認のファン活動として運営されているため、文章や導線を変更する時はファンサイトとしての立場が伝わる表現を保ってください。

## 公開情報

- 最新URL: `https://kurotobari-fanclub.pages.dev/`
- 最新リポジトリ: `kurotoba-fun/kurotobari-fanclub`
- 旧URL: `https://kurotoba-fun.github.io/mainworld/`
- 旧リポジトリ: `kurotoba-fun/mainworld`

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
- `hibari` -> `ヒバリ`
- `kagemaru` -> `影丸`
- `kageto` -> `影戸`
- `kairi` -> `浬`
- `junze` -> `俊哲`
- `kujo` -> `九条`
- `kuro-shirabe` -> `黒調`
- `mairu` -> `哩`
- `minori` -> `稔`
- `momochi` -> `百地`
- `sakuraba` -> `桜庭`
- `shirabe` -> `調`
- `shirose` -> `白瀬`
- `sometani` -> `染谷`
- `susugaya` -> `煤ヶ谷`
- `tachibana` -> `橘`
- `tobarimori` -> `帳守`
- `tsukishiro` -> `月城`
- `wang-yixiang` -> `王 逸翔`
- `wuma-zirui` -> `巫馬 梓睿`

判断に迷うディレクトリや新しいキャラクターのディレクトリがある場合は、`_characters/` や既存の `_data/gallery_items.yml` を確認し、それでも不明ならユーザーに確認してください。

### 画像判定の補助情報

髪色と瞳色は、`2P`、`白バナ`、年齢差分など明示されたイレギュラーを除き、キャラクター判定の主要な固定指標として扱います。服装や背景だけで判断せず、原則として「髪色・瞳色 → 髪型・固有パーツ → 投稿文」の順で照合してください。

| ディレクトリ | キャラクター | 通常の髪 | 通常の瞳 | 固有指標・注意 |
| --- | --- | --- | --- | --- |
| `amagi` | 天城 | 白〜銀の短髪 | 灰色 | 青緑系のヘアピン。銀髪でも紫の瞳なら浬を優先する |
| `arata` | 灼 | 無造作な黒の短髪 | 緑 | 切れ長の目、尖った犬歯、筋肉質 |
| `boss` | ボス | 黒のオールバック | 暗色 | 大柄、強面、ファー付きの上着。瞳色は資料未確定のため補助扱い |
| `elliott` | エリオット | 金髪 | 青 | 明るい金髪と青い瞳の組み合わせ。ギャラリー画像による暫定指標 |
| `fumi` | ふみ | 桃〜ピンク | 資料未確定 | 女性、ふくよかな食堂姿または若い戦闘姿。瞳色だけで断定しない |
| `hibari` | ヒバリ | 赤紫〜マゼンタ | 青緑 | ボブまたは短髪。`2P` 等の色違いはタイトル・投稿文を確認する |
| `kagemaru` | 影丸 | 全身真っ黒の毛 | 資料未確定 | 人物ではなく大型の黒猫。人物画像があれば旧誤分類を疑う |
| `kageto` | 影戸 | 黒〜濃茶 | 黄〜金 | 甘い顔立ち、サングラスや眼鏡を伴う場合あり |
| `kairi` | 浬 | 灰〜銀の直毛短髪 | 紫 | 垂れ目、目の下の濃い隈、黒縁眼鏡。紫の瞳を最重要視する |
| `kujo` | 九条 | 黒の短髪 | 赤 | 左目の黒い眼帯、眉ピアス、強面、筋肉質 |
| `kuro-shirabe` | 黒調 | 黒 | 橙 | 調の黒髪差分。ヘッドホンや中性的な顔立ちは調と共通 |
| `mairu` | 哩 | 灰〜銀の三つ編みおさげ | 紫 | 浬の妹。女性、ややジト目。浬と同じ髪・瞳色 |
| `minori` | 稔 | 橙 | 青 | 明るい橙髪、青い瞳、少年らしい顔立ち。ギャラリー画像による暫定指標 |
| `momochi` | 百地 | 黒〜濃紺の短髪 | 暗色 | 女性、端正で落ち着いた顔立ち。資料が少ないため投稿文も確認する |
| `sakuraba` | 桜庭 | 茶 | 茶系 | 女性、柔らかな顔立ち。資料が少ないため投稿文も確認する |
| `shirabe` | 調 | 亜麻色の短髪 | 橙 | 中性的な顔立ち、ヘッドホン、余裕ありげな態度 |
| `shirose` | 白瀬 | 茶の癖毛、センター分け | 藍〜青 | 甘い顔立ち、革手袋。眼鏡の有無は固定指標にしない |
| `sometani` | 染谷 | 黒〜濃茶 | 資料未確定 | 成人男性。資料が少ないため配色だけで断定しない |
| `susugaya` | 煤ヶ谷 | 金の短髪〜ローポニー | 黒 | 左目下の雫型タトゥー、龍の刺青、サングラス |
| `tachibana` | 橘 | 黒と銀のグラデーション、長いローポニー | 黄 | 涼やかな顔立ち。白髪差分 `白バナ` は明示的な例外 |
| `tobarimori` | 帳守 | 設定上不明 | 設定上不明 | ガスマスクを最優先。素顔・髪色・瞳色は通常判定の根拠にしない |
| `tsukishiro` | 月城 | 灰金〜淡い金 | 紫系 | 眼鏡、長めの髪。ギャラリー画像による暫定指標 |
| `wang-yixiang` | 王 逸翔 | 黒 | 赤茶〜橙系 | 中華風の服、長い赤系の房飾り。ギャラリー画像による暫定指標 |
| `wuma-zirui` | 巫馬 梓睿 | 白〜銀 | 金〜黄 | 褐色肌、中華風の服。肌色も強い識別指標 |
| `junze` | 俊哲 | 濃紺にも見える黒 | 黄緑〜金系（開眼時・暫定） | 細く閉じた糸目、目尻の隈取、漢服、胡散臭い笑顔 |

- 幼い外見の浬など、子ども時代と思われるイラストにはキャラクタータグに加えて `子ども` タグを付ける。
- `10年後`、`2P`、`白バナ` など通常配色から外れることが分かっている場合は、該当タグまたはタイトルを必ず付ける。
- 表で「暫定」「資料未確定」とした要素は断定材料にせず、同一投稿の本文、既存画像、ユーザー確認を優先する。
- 眼鏡やサングラスのキャラクターはそれらのアクセサリーを外している場合もある。

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

## ギャラリーのウェルカムモーダル

ギャラリーページ `/gallery/` では、期間限定のウェルカムモーダルを表示できます。実装は `gallery.md` のモーダルHTMLとインラインJavaScript、見た目は `assets/css/style.css` の `.gallery-welcome-*` で管理しています。

### 現在の仕様

- 表示対象はギャラリーページのみ。
- 現在時刻が設定した終了日時より前で、かつ同じモーダルを閉じた記録が `localStorage` にない場合だけ表示する。
- 閉じるボタン、背景、「ギャラリーを見る」ボタン、Escapeキーのいずれかで閉じられる。
- 一度閉じると、同じ `storageKey` のモーダルは同じブラウザで再表示しない。
- 終了日時を過ぎると、閉じた記録がなくても表示しない。
- モーダルを開いている間は `body.is-gallery-welcome-open` でページのスクロールを止める。
- 画像には内容が分かる `alt` を付け、ダイアログは `aria-modal` とメッセージの `aria-labelledby` を維持する。

### 更新する箇所

`gallery.md` の `#gallery-welcome-modal` 内で、次を更新します。

- `.gallery-welcome-image` の `src` と `alt`
- `.gallery-welcome-name` の英字キャラクター名
- `#gallery-welcome-message` のセリフ
- インラインJavaScriptの `storageKey`
- インラインJavaScriptの `expiresAt`

例:

```html
<img
  class="gallery-welcome-image"
  src="{{ '/assets/images/gallery/susugaya/HG32GMwawAAAmrC.jpg' | relative_url }}"
  alt="指でハートを作る煤ヶ谷"
>
<p class="gallery-welcome-name">SUSUGAYA</p>
<p class="gallery-welcome-message" id="gallery-welcome-message">よ・う・お・こ・し♡</p>
```

```javascript
var storageKey = 'galleryWelcomeSusugaya20260721Dismissed';
var expiresAt = Date.parse('2026-07-22T00:00:00+09:00');
```

### 期限と保存キーの決め方

- 期限は必ずタイムゾーン付きのISO 8601形式で指定する。日本時間なら `+09:00` を付ける。
- 「2026/07/21 23:59まで」のように最終分を含める場合、終了判定は翌日の `2026-07-22T00:00:00+09:00` にする。コードは `Date.now() >= expiresAt` で非表示にするため、`expiresAt` 自体は表示されない最初の時刻になる。
- `storageKey` はモーダルごとに必ず新しくする。以前のキーを再利用すると、過去に閉じた利用者へ新しいモーダルが表示されない。
- キーは `galleryWelcome<Character><EndDate>Dismissed` の形を基本とし、英数字だけで内容と期間を判別できる名前にする。

### 画像と表示の調整

- 画像は外部URLを直接参照せず、`assets/images/gallery/` 配下の実在するローカル画像を `relative_url` フィルター経由で指定する。
- 更新前に画像を目視し、PCとスマートフォンのトリミングで顔が見えるか確認する。
- 調整が必要な場合は、`assets/css/style.css` の `.gallery-welcome-image` と `@media (max-width: 640px)` 内の `object-position` を変更する。
- 既存のレイアウト、閉じる操作、アクセシビリティ属性は、明示的な依頼がない限り維持する。

### 更新後の確認

ページ構造とJavaScriptに関わるため、更新後はフルビルドを実行します。

```bash
bundle exec jekyll build
git diff --check
```

あわせて、生成された `_site/gallery/index.html` に新しい画像パス、名前、セリフ、`storageKey`、`expiresAt` が含まれることを確認してください。ブラウザで再表示を試す時は、開発者ツールで該当する `localStorage` のキーだけを削除します。他の保存データは消さないでください。

## ローカル確認

Jekyll サイトの表示確認が必要な時は、プロジェクトルートで以下を使います。

```bash
bundle exec jekyll serve
```

## 依頼例
```
未コミット画像をギャラリーに追加して
日付：午前6:47 · 2026年6月19日
タイトル：魔法少女の[キャラクター]
タグ：[キャラクター]
Xリンク：https://x.com/KUROTOBA_KGM/status/2067725896556122263?s=20
センシティブ：ON

画像のトリミング位置についてはキャラクターの顔が見えるように調整してください。
追加後は「魔法少女の黒帳」でコミットして
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

#### 投稿単体取得がうまくいかない時の補足

- `npm run post` が `HTTP 404 for https://pbs.twimg.com/media/<media-id>?format=webp&name=orig` で失敗した場合は、X の画面上の `currentSrc` が `webp` でも原寸取得は `jpg` のことがあります。同じ `<media-id>` で `https://pbs.twimg.com/media/<media-id>?format=jpg&name=orig` を Playwright の request context から確認し、200 が返る場合は `<media-id>.jpg` として保存してください。
- サンドボックス内で Playwright/Chromium が `MachPortRendezvousServer ... Permission denied` や DNS 関連のエラーで起動できない場合は、承認を取ってサンドボックス外で再実行してください。ログインプロファイルや Cookie の中身は表示しないでください。
- `postedAt` が空で返る場合は、まず X 画面上の投稿時刻を確認してください。それも取れない場合の最終手段として、X の status ID から Snowflake 時刻を復元できます。計算式は `created_ms = (BigInt(tweetId) >> 22n) + 1288834974657n` です。UTC の `created_ms` を JST ISO 形式（例: `YYYY-MM-DDTHH:MM:SS+09:00`）へ変換して `date` に使います。
- 重複確認では、既存データに過去からの重複 `src` が残っている場合があります。全体重複で止めるのではなく、今回追加した `src` が `_data/gallery_items.yml` 内で 1 件だけかを必ず確認してください。

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
キャラクター：浬
センシティブ：OFF
https://x.com/KUROTOBA_KGM/status/2067514950453711232
タイトル：浬80万トーク記念
タグ：浬,記念

一枚目だけを使用する
```
