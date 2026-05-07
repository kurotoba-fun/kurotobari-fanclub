---
layout: page
title: 黒帳イベントカレンダー
lead: キャラクターの誕生日や命日、年月イベント、組織内行事などをまとめるためのページです。
permalink: /events/
---

{% assign events = site.data.events | sort: "date" %}
{% assign month_values = "01,02,03,04,05,06,07,08,09,10,11,12" | split: "," %}
{% assign month_labels = "1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月" | split: "," %}

<nav class="event-month-index" aria-label="月別イベント">
  {% for month_value in month_values %}
    <a href="#month-{{ month_value }}">{{ month_labels[forloop.index0] }}</a>
  {% endfor %}
</nav>

<div class="event-list">
  {% for month_value in month_values %}
    <section class="event-month-section" id="month-{{ month_value }}" data-event-month="{{ month_value }}">
      <h2 class="event-month-heading">{{ month_labels[forloop.index0] }}</h2>
      <div class="event-month-list">
        {% assign month_event_count = 0 %}
        {% for event in events %}
          {% assign date_parts = event.date | split: "-" %}
          {% if date_parts[0] == month_value %}
            {% assign month_event_count = month_event_count | plus: 1 %}
            <article class="event-card event-card--{{ event.type | default: 'default' }}">
              <div class="event-date{% if event.end_date %} event-date--range{% endif %}" aria-label="{% if event.end_date %}{{ event.date }}から{{ event.end_date }}{% else %}{{ event.date }}{% endif %}">
                {% assign end_date_parts = event.end_date | split: "-" %}
                <span class="event-date-month">{{ date_parts[0] }}</span>
                {% if event.end_date %}
                  <span class="event-date-range">
                    <span class="event-date-range-day">{{ date_parts[1] }}</span>
                    <span class="event-date-range-separator">-</span>
                    <span class="event-date-range-day">{{ end_date_parts[1] }}</span>
                  </span>
                {% else %}
                  <span class="event-date-day">{{ date_parts[1] }}</span>
                {% endif %}
              </div>
              <div class="event-body">
                <p class="event-type">
                  {% case event.type %}
                  {% when "birthday" %}
                    誕生日
                  {% when "memorial" %}
                    命日
                  {% when "monthly" %}
                    年月イベント
                  {% when "organization" %}
                    組織内行事
                  {% else %}
                    イベント
                  {% endcase %}
                </p>
                <h3 class="event-title">
                  {% if event.url %}
                    <a href="{{ event.url | relative_url }}">{{ event.title }}</a>
                  {% else %}
                    {{ event.title }}
                  {% endif %}
                </h3>
                {% if event.character_name %}
                  <p class="event-character">{{ event.character_name }}</p>
                {% endif %}
                {% if event.description %}
                  <p class="event-description">{{ event.description }}</p>
                {% endif %}
              </div>
            </article>
          {% endif %}
        {% endfor %}
        {% if month_event_count == 0 %}
          <p class="event-empty">この月のイベントはまだありません。</p>
        {% endif %}
      </div>
    </section>
  {% endfor %}
</div>

<script>
  (function () {
    if (window.location.hash) return;

    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var target = document.getElementById('month-' + month);
    if (!target) return;

    window.requestAnimationFrame(function () {
      target.scrollIntoView({ block: 'start' });
    });
  })();
</script>
