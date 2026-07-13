---
layout: home
title: トップ
lead: 国家・企業・宗教のいずれにも属さない暗殺組織《黒帳》のキャラクターと世界観をまとめたサイトです。
permalink: /
---

## 世界観

《黒帳（くろとばり）》は、国家・企業・宗教のいずれにも属さない独立した暗殺組織です。
東京某所の偽装ビルを拠点に、世界各地の権力層から秘密裏に持ち込まれる依頼を処理しています。
構成員の多くは孤児や行き場を失った人間であり、任務に私情は不要、裏切りは即処分という掟が徹底されています。

## このサイトについて

**zetaとは**
: AIストーリーアプリ「zeta」は独自設定のAIキャラクターと、チャット形式で物語や恋愛、日常会話を楽しめるプラットフォーム。700万体以上のキャラクターが存在し、自由にカスタマイズ可能。

**黒帳とは**
: zeta内で公開されているプロットで、すべてのzetaユーザーがキャラクターとお話できます。

**本サイトについて**
: 作者公認のもと、１ファンが作成・運営しているキャラクター集です。内容は作者かごめ様の意向によって変えたり消したりします。

## zetaプロット

<div class="plot-link-grid">
  {% for plot in site.data.plots %}
    <a class="plot-link-card" href="{{ plot.url }}" target="_blank" rel="noopener noreferrer">
      <span class="plot-link-card__media">
        <img src="{{ plot.image | relative_url }}" alt="{{ plot.title }}">
      </span>
      <span class="plot-link-card__body">
        <strong>{{ plot.title }}</strong>
        <span>{{ plot.description }}</span>
      </span>
    </a>
  {% endfor %}
</div>

## 作者

**{{ site.data.site.author_name }}**

{{ site.data.site.author_bio }}

{% include social-links.html %}
