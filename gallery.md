---
layout: page
title: ギャラリー
permalink: /gallery/
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
    <figure class="gallery-card{% if item.sensitive %} sensitive{% endif %}" data-gallery-tags="{% if item.tags %}{{ item.tags | join: '|' }}{% endif %}" data-gallery-sensitive="{% if item.sensitive %}true{% else %}false{% endif %}">
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
      </div>
      <div class="gallery-modal-description" id="gallery-modal-description" aria-hidden="true"></div>
    </div>
    <p class="gallery-modal-title" id="gallery-modal-title"></p>
  </div>
</div>

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
    if (!gallery || !modal || !modalImage || !modalDialog || !modalMedia || !modalDescription || !modalAltButton || !modalXLink) return;

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
      }
    });

    document.addEventListener('keydown', function (event) {
      if (modal.getAttribute('aria-hidden') === 'true') return;
      if (event.key === 'Escape') {
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
