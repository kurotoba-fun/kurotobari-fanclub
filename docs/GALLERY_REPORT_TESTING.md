# ギャラリー誤判定報告UI Playwright検証

ギャラリー画像モーダルの「誤判定を報告」機能を、PCとスマートフォン相当の画面サイズで継続的に確認するための手順です。

## 検証対象

- PC: 1440×900、1280×720
- iPhone SE相当: 375×667、タッチ操作
- iPhone 14相当: 390×844、タッチ操作
- Android相当: 412×915、タッチ操作

全規格で次を検証します。

1. ギャラリー画像からモーダルを開ける。
2. 警告アイコン付きの「誤判定を報告」ボタンが表示される。
3. 画像IDと現在のキャラクターが自動入力される。
4. 修正先を選択すると、指定形式の報告文とX Web IntentのURLが生成される。
5. 現在と同じキャラクターを選択した場合は送信できない。
6. 報告内容がCookie、`localStorage`、`sessionStorage`に保存されない。
7. 報告パネルが画面内に収まり、ページ全体に横スクロールが発生しない。

ギャラリーは掲載画像数が多いため、各テストの上限時間は90秒に設定しています。ページ遷移はDOM構築完了を基準にし、個々のUI要素は表示状態を待ってから操作します。

## 初回準備

```bash
npm install
npx playwright install chromium
```

Chromium本体の導入は初回のみ必要です。

## 実行方法

通常実行では、PlaywrightがJekyllのローカルサーバーを自動で起動・停止します。

```bash
npm run test:e2e
```

ブラウザを表示しながら確認する場合:

```bash
npm run test:e2e:headed
```

特定の画面規格だけを実行する場合:

```bash
npx playwright test --project=desktop-1440
npx playwright test --project=iphone-se
```

## 結果の確認

失敗時は`test-results/`へスクリーンショット、動画、トレースが保存されます。HTMLレポートは次のコマンドで開けます。

```bash
npm run test:e2e:report
```

`playwright-report/`と`test-results/`は検証生成物のためGitへコミットしません。

## テストを更新する場所

- テスト本体: `tests/e2e/gallery-report.spec.mjs`
- 画面規格・Jekyll起動設定: `playwright.config.mjs`
- npmコマンド・Playwrightのバージョン: `package.json`

キャラクター選択肢や投稿文の形式を変更した場合は、投稿文生成テストも同時に更新してください。
