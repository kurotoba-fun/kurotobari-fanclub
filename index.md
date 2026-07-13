---
layout: home
title: トップ
lead: 国家・企業・宗教のいずれにも属さない暗殺組織《黒帳》のキャラクターと世界観をまとめたサイトです。
permalink: /
---

<section class="home-world" aria-labelledby="home-world-title">
  <header class="home-section-heading">
    <span class="home-section-number">01</span>
    <div>
      <p>WORLD / ORGANIZATION</p>
      <h2 id="home-world-title">世界観</h2>
    </div>
  </header>
  <div class="home-world-body">
    <img class="home-world-emblem" src="{{ '/assets/images/site/icons/world-emblem.svg' | relative_url }}" alt="" aria-hidden="true">
    <div class="home-world-copy">
      <p class="home-world-name">《黒帳<span>くろとばり</span>》</p>
      <p class="home-world-lead"><span><span class="home-world-mobile-line">国家にも、企業にも、</span><span class="home-world-mobile-line">宗教にも属さない。</span></span><span><span class="home-world-mobile-line">東京の闇に潜む、</span><span class="home-world-mobile-line">独立暗殺組織。</span></span></p>
      <p>東京某所の偽装ビルを拠点に、世界各地の権力層から秘密裏に持ち込まれる依頼を処理しています。構成員の多くは孤児や行き場を失った人間。任務に私情は不要、裏切りは即処分という掟が徹底されています。</p>
    </div>
  </div>
</section>

<section class="home-about" aria-labelledby="home-about-title">
  <header class="home-section-heading">
    <span class="home-section-number">02</span>
    <div>
      <p>ABOUT THIS ARCHIVE</p>
      <h2 id="home-about-title">このサイトについて</h2>
    </div>
  </header>
  <div class="home-about-grid">
    <article class="home-about-card">
      <span>PLATFORM</span>
      <h3>zetaとは</h3>
      <p>独自設定のAIキャラクターと、チャット形式で物語や恋愛、日常会話を楽しめるAIストーリーアプリ。700万体以上のキャラクターが存在し、自由にカスタマイズできます。</p>
    </article>
    <article class="home-about-card">
      <span>STORY</span>
      <h3>黒帳とは</h3>
      <p>zeta内で公開されているプロットです。すべてのzetaユーザーが、黒帳のキャラクターたちとの物語を楽しめます。</p>
    </article>
    <article class="home-about-card home-about-card-fan">
      <span>FAN ARCHIVE</span>
      <h3>本サイトについて</h3>
      <p>作者公認のもと、1人のファンが作成・運営しているキャラクター集です。掲載内容は作者かごめ様の意向により変更・削除する場合があります。</p>
    </article>
  </div>
</section>

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
