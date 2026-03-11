/* ============================================
   Existential Science Institute — main.js
   Minimal interactivity: nav toggle, scroll fade
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Nav Toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.global-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('is-open');
      nav.classList.toggle('is-open');
      document.documentElement.classList.toggle('nav-is-open');
      document.body.classList.toggle('nav-is-open');
    });

    // Close nav when a link is clicked
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('is-open');
        nav.classList.remove('is-open');
        document.documentElement.classList.remove('nav-is-open');
        document.body.classList.remove('nav-is-open');
      });
    });
  }

  // --- Nav Dropdown (mobile tap) ---
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.nav-dropdown__toggle');

  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', function (e) {
      e.preventDefault();
      dropdown.classList.toggle('is-open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
      }
    });

    // Close dropdown when a dropdown link is clicked
    dropdown.querySelectorAll('.nav-dropdown__menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        dropdown.classList.remove('is-open');
        if (toggle && nav) {
          toggle.classList.remove('is-open');
          nav.classList.remove('is-open');
          document.documentElement.classList.remove('nav-is-open');
          document.body.classList.remove('nav-is-open');
        }
      });
    });
  }

  // --- Active Nav Highlight ---
  const currentPath = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index';
  document.querySelectorAll('.global-nav a').forEach(function (link) {
    const href = link.getAttribute('href').replace('.html', '').replace('./', '').replace(/\/$/, '') || 'index';
    if (href === currentPath || (currentPath === 'index' && (href === './' || href === 'index' || href === ''))) {
      link.classList.add('is-active');
    }
  });

  // --- Scroll Fade-in ---
  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: '200px 0px 200px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: reveal any still-hidden elements after 3s
    setTimeout(function () {
      fadeElements.forEach(function (el) {
        if (!el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
        }
      });
    }, 3000);
  } else {
    // Fallback: show all immediately
    fadeElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // --- Case Study Accordion ---
  document.querySelectorAll('.kd-case__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var detail = this.nextElementSibling;
      var isOpen = detail.classList.contains('is-open');
      if (isOpen) {
        detail.classList.remove('is-open');
        setTimeout(function () { detail.hidden = true; }, 500);
      } else {
        detail.hidden = false;
        // Force reflow before adding class for transition
        detail.offsetHeight;
        detail.classList.add('is-open');
      }
      this.setAttribute('aria-expanded', String(!isOpen));
      this.textContent = isOpen ? '体験を読む' : '閉じる';
    });
  });

  // --- Reading Progress Bar ---
  (function () {
    var bar = document.querySelector('.reading-progress');
    if (!bar) return;

    function updateProgress() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var progress = Math.min((scrollTop / docHeight) * 100, 100);
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  })();

  // --- Site Search ---
  (function () {
    var searchToggle = document.querySelector('.search-toggle');
    var searchOverlay = document.querySelector('.search-overlay');
    var searchInput = document.querySelector('.search-input');
    if (!searchToggle || !searchOverlay || !searchInput) return;

    var searchResults = searchOverlay.querySelector('.search-results');
    var searchIndex = null;

    // Determine base path for resolving URLs
    var depth = (window.location.pathname.match(/\//g) || []).length - 1;
    var basePath = '';
    for (var i = 0; i < depth; i++) basePath += '../';

    function openSearch() {
      searchOverlay.classList.add('is-open');
      setTimeout(function () { searchInput.focus(); }, 100);
      // Lazy load index
      if (!searchIndex) {
        fetch(basePath + 'js/search-index.json')
          .then(function (r) { return r.json(); })
          .then(function (data) { searchIndex = data; })
          .catch(function () {});
      }
    }

    function closeSearch() {
      searchOverlay.classList.remove('is-open');
      searchInput.value = '';
      searchResults.innerHTML = '';
    }

    searchToggle.addEventListener('click', openSearch);

    // Close button
    var searchCloseBtn = searchOverlay.querySelector('.search-close');
    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', closeSearch);
    }

    // Close on overlay click (not modal)
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) closeSearch();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchOverlay.classList.contains('is-open')) {
        closeSearch();
      }
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchOverlay.classList.contains('is-open')) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    });

    // Search logic
    var debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var query = this.value.trim();
      if (!query || query.length < 2 || !searchIndex) {
        searchResults.innerHTML = query.length === 1
          ? '<div class="search-empty">2文字以上で検索</div>'
          : '';
        return;
      }
      debounceTimer = setTimeout(function () {
        var q = query.toLowerCase();
        var results = [];
        for (var i = 0; i < searchIndex.length; i++) {
          var page = searchIndex[i];
          var score = 0;
          var titleLower = (page.t || '').toLowerCase();
          var descLower = (page.d || '').toLowerCase();
          var bodyLower = (page.b || '').toLowerCase();

          if (titleLower.indexOf(q) !== -1) score += 10;
          if (descLower.indexOf(q) !== -1) score += 5;
          if (bodyLower.indexOf(q) !== -1) score += 1;

          if (score > 0) {
            results.push({ page: page, score: score });
          }
        }
        results.sort(function (a, b) { return b.score - a.score; });

        if (results.length === 0) {
          searchResults.innerHTML = '<div class="search-empty">「' + query + '」に一致するページが見つかりませんでした</div>';
          return;
        }

        var html = '';
        var max = Math.min(results.length, 12);
        for (var j = 0; j < max; j++) {
          var p = results[j].page;
          var url = basePath + p.u;
          var desc = p.d || p.b.substring(0, 120);
          // Highlight query in desc
          var highlighted = desc.replace(new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
          html += '<a class="search-result" href="' + url + '">'
            + '<div class="search-result__title">' + p.t + '</div>'
            + '<div class="search-result__desc">' + highlighted + '</div>'
            + '</a>';
        }
        if (results.length > 12) {
          html += '<div class="search-empty">他 ' + (results.length - 12) + ' 件</div>';
        }
        searchResults.innerHTML = html;
      }, 200);
    });
  })();

  // --- Sticky CTA: show after HERO ---
  (function () {
    var sticky = document.getElementById('stickyCta');
    var hero = document.querySelector('.kd-hero');
    if (!sticky || !hero) return;

    function update() {
      var heroBottom = hero.getBoundingClientRect().bottom;
      sticky.classList.toggle('is-visible', heroBottom < 0);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

});
