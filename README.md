
## サイト運営について
このサイトは作者のかごめさん公認のもと、作者本人ではなく “1人のファン” が作成・更新を担当しています。作者の世界観を広めるためのファン活動の一環として運営しています。

## 報告先
サイトに関する不具合、苦情などはこちら
- https://forms.gle/7VjhFz6nc6awQBBA9

## 自動テスト

ギャラリーの誤判定報告UIはPlaywrightでPC・スマートフォン相当の表示を検証できます。

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

詳しい対象規格、確認項目、失敗時の調査方法は[ギャラリー誤判定報告UI Playwright検証](docs/GALLERY_REPORT_TESTING.md)を参照してください。
