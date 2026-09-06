---
layout: page
title: ギャラリー
permalink: /gallery/
body_class: gallery-page
---

<p class="lead">画像をクリックするとモーダルで拡大表示されます。</p>

<div class="gallery-toolbar" data-gallery-toolbar>
  <span class="gallery-toolbar-label">表示</span>
  <div class="gallery-toggle" role="group" aria-label="ギャラリー表示切り替え">
    <button class="gallery-toggle-button" type="button" data-gallery-view="cards" aria-pressed="true">カード</button>
    <button class="gallery-toggle-button" type="button" data-gallery-view="photos" aria-pressed="false">写真</button>
  </div>
  <button class="gallery-sensitive-toggle" type="button" data-gallery-sensitive-toggle aria-pressed="true">センシティブ非表示</button>
</div>

<aside class="gallery-correction-builder" data-gallery-correction-builder hidden aria-label="キャラクター振り分け修正">
  <strong>振り分け修正</strong>
  <p>画像の「IDコピー」をキャラクターへドロップ</p>
  <div class="gallery-character-drop-list" data-gallery-character-drop-list></div>
  <div class="gallery-correction-builder-actions">
    <button type="button" data-gallery-correction-copy disabled>修正依頼文をコピー</button>
    <button type="button" data-gallery-correction-clear disabled>クリア</button>
  </div>
  <span data-gallery-correction-status aria-live="polite"></span>
</aside>

<div class="gallery-maintenance" data-gallery-maintenance hidden>
  <strong>ローカル管理モード</strong>
  <span><span data-gallery-ng-count>0</span>件選択</span>
  <button type="button" data-gallery-ng-copy disabled>選択したIDをコピー</button>
  <button type="button" data-gallery-ng-clear disabled>選択解除</button>
  <span class="gallery-maintenance-status" data-gallery-ng-status aria-live="polite"></span>
</div>

{% assign gallery_items = site.data.gallery_items | sort: "date" | reverse %}
{% assign gallery_tags = "" | split: "" %}
{% for item in gallery_items %}
  {% if item.tags %}
    {% for tag in item.tags %}
      {% assign gallery_tags = gallery_tags | push: tag %}
    {% endfor %}
  {% endif %}
{% endfor %}
{% assign gallery_tags = gallery_tags | uniq | sort %}

<div class="gallery-filter">
  <span class="gallery-toolbar-label">タグ</span>
  <div class="gallery-filter-tags" role="group" aria-label="ギャラリーのタグ絞り込み">
    <button class="gallery-filter-button" type="button" data-gallery-filter="all" aria-pressed="true">すべて<span class="gallery-filter-count">（{{ gallery_items.size }}）</span></button>
    {% for tag in gallery_tags %}
      {% assign tag_count = 0 %}
      {% for item in gallery_items %}
        {% if item.tags contains tag %}
          {% assign tag_count = tag_count | plus: 1 %}
        {% endif %}
      {% endfor %}
      <button class="gallery-filter-button" type="button" data-gallery-filter="{{ tag }}" aria-pressed="false">{{ tag }}<span class="gallery-filter-count">（{{ tag_count }}）</span></button>
    {% endfor %}
  </div>
</div>

<section class="gallery-grid" data-gallery-view="cards">
  {% for item in gallery_items %}
    {% assign thumb_src = item.src %}
    {% if item.src contains '.jpg' %}
      {% assign thumb_src = item.src | replace: '.jpg', '.webp' %}
    {% elsif item.src contains '.JPG' %}
      {% assign thumb_src = item.src | replace: '.JPG', '.webp' %}
    {% elsif item.src contains '.jpeg' %}
      {% assign thumb_src = item.src | replace: '.jpeg', '.webp' %}
    {% elsif item.src contains '.JPEG' %}
      {% assign thumb_src = item.src | replace: '.JPEG', '.webp' %}
    {% elsif item.src contains '.png' %}
      {% assign thumb_src = item.src | replace: '.png', '.webp' %}
    {% elsif item.src contains '.PNG' %}
      {% assign thumb_src = item.src | replace: '.PNG', '.webp' %}
    {% endif %}
    {% assign webp_match = site.static_files | where: "relative_path", thumb_src %}
    {% assign thumb_position = item.thumb_position | default: "50% 50%" %}
    <figure class="gallery-card{% if item.sensitive %} sensitive{% endif %}" data-gallery-id="{{ item['id'] | escape }}" data-gallery-tags="{% if item.tags %}{{ item.tags | join: '|' }}{% endif %}" data-gallery-sensitive="{% if item.sensitive %}true{% else %}false{% endif %}">
      <div class="gallery-maintenance-actions">
        <label class="gallery-ng-selector" title="NG候補として選択">
          <input type="checkbox" value="{{ item['id'] | escape }}" data-gallery-ng-checkbox aria-label="NG候補として選択">
        </label>
        <button class="gallery-id-copy" type="button" data-gallery-id-copy="{{ item['id'] | escape }}" title="この画像のIDをコピー">IDコピー</button>
      </div>
      <button class="gallery-link" type="button" data-gallery-src="{{ item.src | relative_url }}" data-gallery-title="{{ item.title }}" data-gallery-description="{{ item.description | default: '' | escape }}" data-gallery-x-url="{{ item.x_url | default: '' | escape }}" data-gallery-index="{{ forloop.index0 }}">
        <picture>
          {% if webp_match and webp_match.size > 0 %}
            <source data-srcset="{{ thumb_src | relative_url }}" type="image/webp">
          {% endif %}
          <img
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            data-src="{{ item.src | relative_url }}"
            alt="{{ item.title | default: 'gallery image' }}"
            loading="lazy"
            style="--gallery-thumb-position: {{ thumb_position }};"
          >
        </picture>
      </button>
      {% if item.title or item.tags %}
        <figcaption class="gallery-caption">
          {% if item.title %}
            <p class="gallery-title">
              {% if item.sensitive %}
                <img class="gallery-sensitive-icon" src="{{ '/assets/images/site/icon/sensitive/sentitiveicon.svg' | relative_url }}" alt="センシティブ">
              {% endif %}
              {{ item.title }}
            </p>
          {% endif %}
          {% if item.tags %}
            <div class="gallery-tags">
              {% for tag in item.tags %}
                <button class="gallery-tag" type="button" data-gallery-filter-tag="{{ tag }}">{{ tag }}</button>
              {% endfor %}
            </div>
          {% endif %}
        </figcaption>
      {% endif %}
    </figure>
  {% endfor %}
</section>

<p class="gallery-empty" hidden>このタグの画像はまだありません。</p>

<div class="gallery-welcome-modal" id="gallery-welcome-modal" aria-hidden="true">
  <div class="gallery-welcome-backdrop" data-gallery-welcome-close></div>
  <div class="gallery-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-welcome-message">
    <button class="gallery-welcome-close" type="button" aria-label="閉じる" data-gallery-welcome-close>×</button>
    <img
      class="gallery-welcome-image"
      src="{{ '/assets/images/gallery/shirabe/HKPbMJ2bMAAGKOR.jpg' | relative_url }}"
      alt="頬杖をつく調"
    >
    <div class="gallery-welcome-copy">
      <p class="gallery-welcome-name">SHIRABE</p>
      <p class="gallery-welcome-message" id="gallery-welcome-message">また来たんすか？</p>
      <button class="gallery-welcome-enter" type="button" data-gallery-welcome-close>ギャラリーを見る</button>
    </div>
  </div>
</div>

<div class="gallery-modal" id="gallery-modal" aria-hidden="true">
  <div class="gallery-modal-backdrop" data-gallery-close></div>
  <div class="gallery-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
    <button class="gallery-modal-nav gallery-modal-prev" type="button" aria-label="前の画像" data-gallery-prev>‹</button>
    <button class="gallery-modal-nav gallery-modal-next" type="button" aria-label="次の画像" data-gallery-next>›</button>
    <button class="gallery-modal-close" type="button" aria-label="閉じる" data-gallery-close>×</button>
    <div class="gallery-modal-media" data-gallery-description-toggle>
      <img class="gallery-modal-image" src="" alt="" id="gallery-modal-image">
      <div class="gallery-modal-actions">
        <button class="gallery-modal-alt-button" type="button" aria-label="説明文を表示" aria-pressed="false" data-gallery-alt-toggle hidden>ALT</button>
        <a class="gallery-modal-x-link" href="" target="_blank" rel="noopener noreferrer" aria-label="Xの投稿を開く" data-gallery-x-link hidden>X</a>
        <button class="gallery-modal-report-button" type="button" aria-expanded="false" data-gallery-report-open>
          <img src="{{ '/assets/images/site/icon/report-warning.svg' | relative_url }}" alt="">
          <span>誤判定を報告</span>
        </button>
      </div>
      <div class="gallery-modal-description" id="gallery-modal-description" aria-hidden="true"></div>
      <section class="gallery-report-panel" data-gallery-report-panel hidden aria-labelledby="gallery-report-title">
        <div class="gallery-report-heading">
          <div>
            <p class="gallery-report-eyebrow">CHARACTER REPORT</p>
            <h3 id="gallery-report-title">キャラクターの誤判定を報告</h3>
          </div>
          <button type="button" class="gallery-report-close" aria-label="報告画面を閉じる" data-gallery-report-close>×</button>
        </div>
        <p class="gallery-report-guide">正しいキャラクターを選ぶと、Xへの報告文を自動で作成します。</p>
        <dl class="gallery-report-current">
          <div><dt>画像ID</dt><dd data-gallery-report-id></dd></div>
          <div><dt>現在のキャラ</dt><dd data-gallery-report-current></dd></div>
        </dl>
        <label class="gallery-report-select-label" for="gallery-report-character">正しいキャラクター</label>
        <select id="gallery-report-character" data-gallery-report-character>
          <option value="">選択してください</option>
          <option>天城</option><option>灼</option><option>ヒバリ</option><option>ふみ</option><option>哩</option><option>浬</option>
          <option>九条</option><option>黒調</option><option>調</option><option>白瀬</option><option>煤ヶ谷</option><option>橘</option>
          <option>ボス</option><option>エリオット</option><option>影戸</option><option>稔</option><option>月城</option><option>帳守</option>
          <option>霈</option><option>棗</option><option>ルキ</option><option>湍</option><option>王 逸翔</option><option>巫馬 梓睿</option><option>俊哲</option>
          <option>掲載対象外</option>
        </select>
        <pre class="gallery-report-preview" data-gallery-report-preview>正しいキャラクターを選択してください。</pre>
        <a class="gallery-report-submit" href="#" target="_blank" rel="noopener noreferrer" data-gallery-report-submit aria-disabled="true">
          Xで報告する
        </a>
        <p class="gallery-report-note">投稿前にXの画面で内容を確認・編集できます。</p>
      </section>
    </div>
    <p class="gallery-modal-title" id="gallery-modal-title"></p>
  </div>
</div>

<script>
  (function () {
    var modal = document.getElementById('gallery-welcome-modal');
    if (!modal) return;

    var storageKey = 'galleryWelcomeShirabe20260727Dismissed';
    var expiresAt = Date.parse('2026-07-27T00:00:00+09:00');
    var isDismissed = false;
    try {
      isDismissed = window.localStorage.getItem(storageKey) === 'true';
    } catch (e) {}
    if (Date.now() >= expiresAt || isDismissed) return;

    var closeButton = modal.querySelector('.gallery-welcome-close');
    var closeModal = function () {
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-gallery-welcome-open');
      try {
        window.localStorage.setItem(storageKey, 'true');
      } catch (e) {}
    };

    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-gallery-welcome-open');

    modal.addEventListener('click', function (event) {
      if (event.target.closest('[data-gallery-welcome-close]')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });

    window.requestAnimationFrame(function () {
      if (closeButton) closeButton.focus();
    });
  })();
</script>

<script>
  (function () {
    var localHosts = ['localhost', '127.0.0.1', '::1'];
    if (localHosts.indexOf(window.location.hostname) === -1) return;

    var maintenance = document.querySelector('[data-gallery-maintenance]');
    var correctionBuilder = document.querySelector('[data-gallery-correction-builder]');
    var checkboxes = Array.prototype.slice.call(document.querySelectorAll('[data-gallery-ng-checkbox]'));
    var idCopyButtons = Array.prototype.slice.call(document.querySelectorAll('[data-gallery-id-copy]'));
    if (!maintenance || !checkboxes.length) return;

    var count = maintenance.querySelector('[data-gallery-ng-count]');
    var copyButton = maintenance.querySelector('[data-gallery-ng-copy]');
    var clearButton = maintenance.querySelector('[data-gallery-ng-clear]');
    var status = maintenance.querySelector('[data-gallery-ng-status]');
    document.body.classList.add('is-gallery-maintenance');
    maintenance.hidden = false;

    var correctionCharacters = ['天城', '灼', 'ヒバリ', 'ふみ', '哩', '浬', '九条', '黒調', '調', '白瀬', '煤ヶ谷', '橘', 'ボス', 'エリオット', '影戸', '稔', '月城', '王 逸翔', '巫馬 梓睿', '俊哲', '帳守', '霈', '棗', 'ルキ', '湍', '掲載対象外'];
    var correctionAssignments = new Map();
    var dropList = correctionBuilder.querySelector('[data-gallery-character-drop-list]');
    var correctionCopy = correctionBuilder.querySelector('[data-gallery-correction-copy]');
    var correctionClear = correctionBuilder.querySelector('[data-gallery-correction-clear]');
    var correctionStatus = correctionBuilder.querySelector('[data-gallery-correction-status]');
    correctionCharacters.forEach(function (character) {
      var box = document.createElement('button');
      box.type = 'button';
      box.className = 'gallery-character-drop-box';
      box.setAttribute('data-gallery-character-drop', character);
      box.innerHTML = '<span></span><small>0</small>';
      box.querySelector('span').textContent = character;
      dropList.appendChild(box);
    });
    correctionBuilder.hidden = false;

    var selectedIds = function () {
      return checkboxes.filter(function (checkbox) { return checkbox.checked; })
        .map(function (checkbox) { return checkbox.value; });
    };

    var updateState = function () {
      var selected = selectedIds();
      count.textContent = String(selected.length);
      copyButton.disabled = selected.length === 0;
      clearButton.disabled = selected.length === 0;
      checkboxes.forEach(function (checkbox) {
        var card = checkbox.closest('.gallery-card');
        if (card) card.classList.toggle('is-ng-selected', checkbox.checked);
      });
      status.textContent = '';
    };

    var copyText = function (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      var copied = document.execCommand('copy');
      textarea.remove();
      return copied ? Promise.resolve() : Promise.reject(new Error('copy failed'));
    };

    var correctionText = function () {
      return correctionCharacters.map(function (character) {
        var ids = Array.from(correctionAssignments.entries())
          .filter(function (entry) { return entry[1] === character; })
          .map(function (entry) { return entry[0]; });
        return ids.length ? character + '\n' + ids.join('\n') : '';
      }).filter(Boolean).join('\n\n');
    };

    var updateCorrectionState = function () {
      var hasAssignments = correctionAssignments.size > 0;
      correctionCopy.disabled = !hasAssignments;
      correctionClear.disabled = !hasAssignments;
      dropList.querySelectorAll('[data-gallery-character-drop]').forEach(function (box) {
        var character = box.getAttribute('data-gallery-character-drop');
        var total = Array.from(correctionAssignments.values()).filter(function (value) { return value === character; }).length;
        box.querySelector('small').textContent = String(total);
        box.classList.toggle('has-items', total > 0);
      });
    };

    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('change', updateState);
    });
    idCopyButtons.forEach(function (button) {
      button.draggable = true;
      button.addEventListener('dragstart', function (event) {
        var id = button.getAttribute('data-gallery-id-copy');
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', id);
        button.classList.add('is-dragging');
      });
      button.addEventListener('dragend', function () {
        button.classList.remove('is-dragging');
      });
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-gallery-id-copy');
        copyText(id).then(function () {
          status.textContent = id + ' をコピーしました';
        }).catch(function () {
          status.textContent = 'コピーできませんでした';
        });
      });
    });
    dropList.addEventListener('dragover', function (event) {
      var box = event.target.closest('[data-gallery-character-drop]');
      if (!box) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      box.classList.add('is-drag-over');
    });
    dropList.addEventListener('dragleave', function (event) {
      var box = event.target.closest('[data-gallery-character-drop]');
      if (box) box.classList.remove('is-drag-over');
    });
    dropList.addEventListener('drop', function (event) {
      var box = event.target.closest('[data-gallery-character-drop]');
      if (!box) return;
      event.preventDefault();
      box.classList.remove('is-drag-over');
      var id = event.dataTransfer.getData('text/plain');
      if (!id || !idCopyButtons.some(function (button) { return button.getAttribute('data-gallery-id-copy') === id; })) return;
      var character = box.getAttribute('data-gallery-character-drop');
      correctionAssignments.set(id, character);
      correctionStatus.textContent = id + ' → ' + character;
      updateCorrectionState();
    });
    correctionCopy.addEventListener('click', function () {
      copyText(correctionText()).then(function () {
        correctionStatus.textContent = correctionAssignments.size + '件の修正依頼文をコピーしました';
      }).catch(function () {
        correctionStatus.textContent = 'コピーできませんでした';
      });
    });
    correctionClear.addEventListener('click', function () {
      correctionAssignments.clear();
      correctionStatus.textContent = '';
      updateCorrectionState();
    });
    copyButton.addEventListener('click', function () {
      var ids = selectedIds();
      copyText(ids.join('\n')).then(function () {
        status.textContent = ids.length + '件のIDをコピーしました';
      }).catch(function () {
        status.textContent = 'コピーできませんでした';
      });
    });
    clearButton.addEventListener('click', function () {
      checkboxes.forEach(function (checkbox) { checkbox.checked = false; });
      updateState();
    });
    updateState();
    updateCorrectionState();
  })();
</script>

<script>
  (function () {
    var gallery = document.querySelector('.gallery-grid');
    var modal = document.getElementById('gallery-modal');
    var modalDialog = modal ? modal.querySelector('.gallery-modal-dialog') : null;
    var modalMedia = modal ? modal.querySelector('.gallery-modal-media') : null;
    var modalImage = document.getElementById('gallery-modal-image');
    var modalTitle = document.getElementById('gallery-modal-title');
    var modalDescription = document.getElementById('gallery-modal-description');
    var modalAltButton = modal ? modal.querySelector('[data-gallery-alt-toggle]') : null;
    var modalXLink = modal ? modal.querySelector('[data-gallery-x-link]') : null;
    var reportOpenButton = modal ? modal.querySelector('[data-gallery-report-open]') : null;
    var reportPanel = modal ? modal.querySelector('[data-gallery-report-panel]') : null;
    var reportCloseButton = modal ? modal.querySelector('[data-gallery-report-close]') : null;
    var reportId = modal ? modal.querySelector('[data-gallery-report-id]') : null;
    var reportCurrent = modal ? modal.querySelector('[data-gallery-report-current]') : null;
    var reportCharacter = modal ? modal.querySelector('[data-gallery-report-character]') : null;
    var reportPreview = modal ? modal.querySelector('[data-gallery-report-preview]') : null;
    var reportSubmit = modal ? modal.querySelector('[data-gallery-report-submit]') : null;
    if (!gallery || !modal || !modalImage || !modalDialog || !modalMedia || !modalDescription || !modalAltButton || !modalXLink || !reportOpenButton || !reportPanel || !reportCharacter || !reportSubmit) return;

    var siteHeader = document.querySelector('.site-header');
    var updateHeaderHeight = function () {
      if (!siteHeader) return;
      document.documentElement.style.setProperty('--site-header-height', siteHeader.offsetHeight + 'px');
    };
    updateHeaderHeight();
    window.addEventListener('load', updateHeaderHeight);
    window.addEventListener('resize', updateHeaderHeight);
    if (siteHeader && 'ResizeObserver' in window) {
      var headerObserver = new ResizeObserver(updateHeaderHeight);
      headerObserver.observe(siteHeader);
    }

    var cards = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-card'));
    var triggers = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-link'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.gallery-filter-button'));
    var sensitiveToggleButton = document.querySelector('[data-gallery-sensitive-toggle]');
    var galleryToolbar = document.querySelector('[data-gallery-toolbar]');
    var emptyState = document.querySelector('.gallery-empty');
    var currentIndex = -1;
    var currentFilter = 'all';
    var hideSensitive = true;
    var touchStartX = null;
    var swipeThreshold = 40;
    var currentGalleryId = '';
    var currentCharacter = '';

    var reportText = function () {
      return '@Mimmyzeta000\nキャラクターID「' + currentGalleryId + '」\n現在キャラ「' + currentCharacter + '」→修正「' + reportCharacter.value + '」';
    };

    var updateReport = function () {
      var correction = reportCharacter.value;
      var isValid = Boolean(correction) && correction !== currentCharacter;
      reportPreview.textContent = correction ? reportText() : '正しいキャラクターを選択してください。';
      reportSubmit.setAttribute('aria-disabled', String(!isValid));
      reportSubmit.href = isValid ? 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(reportText()) : '#';
    };

    var closeReport = function () {
      reportPanel.hidden = true;
      reportOpenButton.setAttribute('aria-expanded', 'false');
      modalMedia.classList.remove('is-report-open');
    };

    var openReport = function () {
      reportPanel.hidden = false;
      reportOpenButton.setAttribute('aria-expanded', 'true');
      modalMedia.classList.add('is-report-open');
      reportCharacter.focus();
    };

    var getVisibleTriggers = function () {
      return triggers.filter(function (trigger) {
        var card = trigger.closest('.gallery-card');
        return card && !card.hidden;
      });
    };

    var renderModal = function (index) {
      var visibleTriggers = getVisibleTriggers();
      var trigger = visibleTriggers[index];
      if (!trigger) return;
      currentIndex = index;
      var src = trigger.getAttribute('data-gallery-src');
      var title = trigger.getAttribute('data-gallery-title');
      var description = trigger.getAttribute('data-gallery-description') || '';
      var xUrl = trigger.getAttribute('data-gallery-x-url') || '';
      var card = trigger.closest('.gallery-card');
      var tags = card ? (card.getAttribute('data-gallery-tags') || '').split('|') : [];
      currentGalleryId = card ? card.getAttribute('data-gallery-id') || '' : '';
      currentCharacter = tags[0] || title || '不明';
      modalImage.src = src;
      modalImage.alt = title || 'gallery image';
      modalTitle.textContent = title || '';
      modalDescription.textContent = description;
      modalDescription.setAttribute('aria-hidden', 'true');
      var hasDescription = Boolean(description.trim());
      modalMedia.classList.toggle('has-description', hasDescription);
      modalMedia.classList.remove('is-description-visible');
      modalAltButton.hidden = !hasDescription;
      modalAltButton.setAttribute('aria-pressed', 'false');
      modalAltButton.setAttribute('aria-label', '説明文を表示');
      modalXLink.hidden = !xUrl;
      modalXLink.href = xUrl || '';
      reportId.textContent = currentGalleryId;
      reportCurrent.textContent = currentCharacter;
      reportCharacter.value = '';
      closeReport();
      updateReport();
    };

    var openModal = function (index) {
      renderModal(index);
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-gallery-modal-open');
    };

    var closeModal = function () {
      modal.setAttribute('aria-hidden', 'true');
      modalImage.src = '';
      modalTitle.textContent = '';
      modalDescription.textContent = '';
      modalDescription.setAttribute('aria-hidden', 'true');
      modalMedia.classList.remove('has-description', 'is-description-visible');
      modalAltButton.hidden = true;
      modalAltButton.setAttribute('aria-pressed', 'false');
      modalAltButton.setAttribute('aria-label', '説明文を表示');
      modalXLink.hidden = true;
      modalXLink.href = '';
      closeReport();
      document.body.classList.remove('is-gallery-modal-open');
    };

    var toggleDescription = function () {
      if (!modalMedia.classList.contains('has-description')) return;
      var isVisible = modalMedia.classList.toggle('is-description-visible');
      modalDescription.setAttribute('aria-hidden', String(!isVisible));
      modalAltButton.setAttribute('aria-pressed', String(isVisible));
      modalAltButton.setAttribute('aria-label', isVisible ? '説明文を非表示' : '説明文を表示');
    };

    var showRelativeImage = function (direction) {
      var visibleTriggers = getVisibleTriggers();
      if (currentIndex < 0 || !visibleTriggers.length) return;
      var nextIndex = currentIndex + direction;
      if (nextIndex < 0) {
        nextIndex = visibleTriggers.length - 1;
      } else if (nextIndex >= visibleTriggers.length) {
        nextIndex = 0;
      }
      renderModal(nextIndex);
    };

    gallery.addEventListener('click', function (event) {
      var tagTrigger = event.target.closest('[data-gallery-filter-tag]');
      if (tagTrigger) {
        applyFilter(tagTrigger.getAttribute('data-gallery-filter-tag'));
        return;
      }
      var trigger = event.target.closest('.gallery-link');
      if (!trigger) return;
      var visibleTriggers = getVisibleTriggers();
      var index = visibleTriggers.indexOf(trigger);
      if (Number.isNaN(index)) return;
      openModal(index);
    });

    modal.addEventListener('click', function (event) {
      if (event.target.closest('[data-gallery-close]')) {
        closeModal();
        return;
      }
      if (event.target.closest('[data-gallery-prev]')) {
        showRelativeImage(-1);
        return;
      }
      if (event.target.closest('[data-gallery-next]')) {
        showRelativeImage(1);
        return;
      }
      if (event.target.closest('[data-gallery-alt-toggle]')) {
        toggleDescription();
        return;
      }
      if (event.target.closest('[data-gallery-report-open]')) {
        openReport();
        return;
      }
      if (event.target.closest('[data-gallery-report-close]')) {
        closeReport();
      }
    });

    reportCharacter.addEventListener('change', updateReport);
    reportSubmit.addEventListener('click', function (event) {
      if (reportSubmit.getAttribute('aria-disabled') === 'true') event.preventDefault();
    });

    document.addEventListener('keydown', function (event) {
      if (modal.getAttribute('aria-hidden') === 'true') return;
      if (event.key === 'Escape') {
        if (!reportPanel.hidden) {
          closeReport();
          reportOpenButton.focus();
          return;
        }
        closeModal();
      } else if (event.key === 'ArrowLeft') {
        showRelativeImage(-1);
      } else if (event.key === 'ArrowRight') {
        showRelativeImage(1);
      }
    });

    modalDialog.addEventListener('touchstart', function (event) {
      if (!event.touches || event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    modalDialog.addEventListener('touchend', function (event) {
      if (touchStartX === null || !event.changedTouches || !event.changedTouches.length) return;
      var deltaX = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(deltaX) < swipeThreshold) return;
      if (deltaX > 0) {
        showRelativeImage(-1);
      } else {
        showRelativeImage(1);
      }
    }, { passive: true });

    var viewContainer = document.querySelector('.gallery-grid');
    var toggleButtons = Array.prototype.slice.call(document.querySelectorAll('.gallery-toggle-button'));
    var applyFilter = function (filter) {
      currentFilter = filter;
      var visibleCount = 0;
      cards.forEach(function (card) {
        var tagString = card.getAttribute('data-gallery-tags') || '';
        var tags = tagString ? tagString.split('|') : [];
        var matches = filter === 'all' || tags.indexOf(filter) !== -1;
        var isSensitive = card.getAttribute('data-gallery-sensitive') === 'true';
        var visible = matches && (!hideSensitive || !isSensitive);
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      filterButtons.forEach(function (button) {
        var isActive = button.getAttribute('data-gallery-filter') === filter;
        button.setAttribute('aria-pressed', String(isActive));
      });
      if (sensitiveToggleButton) {
        sensitiveToggleButton.setAttribute('aria-pressed', String(hideSensitive));
      }
      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }
      if (modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
      try {
        window.localStorage.setItem('galleryFilter', filter);
      } catch (e) {}
    };

    var setSensitiveVisibility = function (shouldHideSensitive) {
      hideSensitive = shouldHideSensitive;
      if (sensitiveToggleButton) {
        sensitiveToggleButton.setAttribute('aria-pressed', String(hideSensitive));
      }
      applyFilter(currentFilter);
      try {
        window.localStorage.setItem('galleryHideSensitive', String(hideSensitive));
      } catch (e) {}
    };

    var setView = function (view) {
      if (!viewContainer) return;
      viewContainer.setAttribute('data-gallery-view', view);
      toggleButtons.forEach(function (button) {
        var isActive = button.getAttribute('data-gallery-view') === view;
        button.setAttribute('aria-pressed', String(isActive));
      });
      try {
        window.localStorage.setItem('galleryView', view);
      } catch (e) {}
    };

    var preferred = null;
    try {
      preferred = window.localStorage.getItem('galleryView');
    } catch (e) {}
    if (!preferred) {
      preferred = window.matchMedia('(max-width: 640px)').matches ? 'photos' : 'cards';
    }
    setView(preferred);

    var preferredFilter = 'all';
    try {
      preferredFilter = window.localStorage.getItem('galleryFilter') || 'all';
    } catch (e) {}
    if (!filterButtons.some(function (button) { return button.getAttribute('data-gallery-filter') === preferredFilter; })) {
      preferredFilter = 'all';
    }

    try {
      var storedHideSensitive = window.localStorage.getItem('galleryHideSensitive');
      if (storedHideSensitive !== null) {
        hideSensitive = storedHideSensitive !== 'false';
      }
    } catch (e) {}
    applyFilter(preferredFilter);

    toggleButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setView(button.getAttribute('data-gallery-view'));
      });
    });

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyFilter(button.getAttribute('data-gallery-filter'));
      });
    });

    if (sensitiveToggleButton) {
      sensitiveToggleButton.addEventListener('click', function () {
        setSensitiveVisibility(!hideSensitive);
      });
    }

    var updateToolbarState = function () {
      if (!galleryToolbar) return;
      var headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
      var stickyTop = headerHeight + 8;
      galleryToolbar.classList.toggle('is-stuck', galleryToolbar.getBoundingClientRect().top <= stickyTop + 1);
    };
    updateToolbarState();
    window.addEventListener('scroll', updateToolbarState, { passive: true });
    window.addEventListener('resize', updateToolbarState);

    var lazyTargets = Array.prototype.slice.call(document.querySelectorAll('.gallery-grid img[data-src]'));
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var img = entry.target;
          var picture = img.closest('picture');
          if (picture) {
            picture.querySelectorAll('source[data-srcset]').forEach(function (source) {
              source.srcset = source.getAttribute('data-srcset');
              source.removeAttribute('data-srcset');
            });
          }
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          obs.unobserve(img);
        });
      }, { rootMargin: '200px 0px' });
      lazyTargets.forEach(function (img) { observer.observe(img); });
    } else {
      lazyTargets.forEach(function (img) {
        img.src = img.getAttribute('data-src');
        img.removeAttribute('data-src');
      });
    }
  })();
</script>
