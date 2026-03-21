/* ============================================
   Existential Science Institute — main.js
   Minimal interactivity: nav toggle, scroll fade
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Nav Toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.global-nav');

  if (toggle && nav) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'global-nav');
    nav.id = nav.id || 'global-nav';

    toggle.addEventListener('click', function () {
      var isOpen = toggle.classList.toggle('is-open');
      nav.classList.toggle('is-open');
      document.documentElement.classList.toggle('nav-is-open');
      document.body.classList.toggle('nav-is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    });

    // Close nav when a link is clicked
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('is-open');
        nav.classList.remove('is-open');
        document.documentElement.classList.remove('nav-is-open');
        document.body.classList.remove('nav-is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'メニューを開く');
      });
    });
  }

  // --- Nav Dropdowns (mobile tap) ---
  var dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(function (dd) {
    var ddToggle = dd.querySelector('.nav-dropdown__toggle');
    if (!ddToggle) return;

    ddToggle.addEventListener('click', function (e) {
      e.preventDefault();
      var wasOpen = dd.classList.contains('is-open');
      // Close all other dropdowns first
      dropdowns.forEach(function (other) {
        if (other !== dd) other.classList.remove('is-open');
      });
      // Toggle this one
      if (wasOpen) {
        dd.classList.remove('is-open');
      } else {
        dd.classList.add('is-open');
      }
    });

    // Close dropdown when a dropdown link is clicked
    dd.querySelectorAll('.nav-dropdown__menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        dd.classList.remove('is-open');
        if (toggle && nav) {
          toggle.classList.remove('is-open');
          nav.classList.remove('is-open');
          document.documentElement.classList.remove('nav-is-open');
          document.body.classList.remove('nav-is-open');
        }
      });
    });
  });

  // Close all dropdowns when clicking outside
  document.addEventListener('click', function (e) {
    dropdowns.forEach(function (dd) {
      if (!dd.contains(e.target)) {
        dd.classList.remove('is-open');
      }
    });
  });

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

  // --- Header scroll state ---
  (function () {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var threshold = 60;

    function onScroll() {
      if (window.scrollY > threshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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

    searchOverlay.setAttribute('aria-hidden', 'true');
    searchOverlay.setAttribute('role', 'dialog');
    searchOverlay.setAttribute('aria-label', '検索');

    function openSearch() {
      searchOverlay.classList.add('is-open');
      searchOverlay.setAttribute('aria-hidden', 'false');
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
      searchOverlay.setAttribute('aria-hidden', 'true');
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

  // --- Inline TOC (auto-generate from h2.chapter-heading) ---
  (function () {
    var list = document.getElementById('inlineTocList');
    if (!list) return;
    var headings = document.querySelectorAll('h2.chapter-heading');
    if (!headings.length) {
      // Hide TOC if no headings
      var tocNav = list.closest('.inline-toc');
      if (tocNav) tocNav.style.display = 'none';
      return;
    }
    headings.forEach(function (h, i) {
      if (!h.id) h.id = 'toc-section-' + i;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      // Extract text, skip .chapter-number span
      var text = h.textContent.replace(/\s+/g, ' ').trim();
      var numSpan = h.querySelector('.chapter-number');
      if (numSpan) {
        text = text.replace(numSpan.textContent.replace(/\s+/g, ' ').trim(), '').trim();
      }
      a.textContent = text;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById(h.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.appendChild(a);
      list.appendChild(li);
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

  // --- Back to Top Button ---
  (function () {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'ページの先頭に戻る');
    btn.innerHTML = '&#9650;';
    document.body.appendChild(btn);

    var scrollThreshold = 800;

    function toggleBtn() {
      if (window.scrollY > scrollThreshold) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', toggleBtn, { passive: true });
  })();

  // --- Shimmer Repaint on Font Load ---
  // Fix: background-clip:text + filter compositing bug on initial paint.
  // When web fonts arrive via display=swap, the GPU compositing layer
  // for shimmer text doesn't re-composite properly. Force a repaint.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      var shimmers = document.querySelectorAll(
        '.hero h1, .hero__tagline, .hero-title--shimmer, ' +
        '.cta-block__title, .cta-block__desc, ' +
        '[class*="gold-shimmer"], [class*="purple-shimmer"]'
      );
      if (!shimmers.length) return;
      shimmers.forEach(function (el) {
        // Toggle animation to force GPU layer re-composite
        var anim = el.style.animation;
        el.style.animation = 'none';
        void el.offsetHeight; // trigger reflow
        el.style.animation = anim || '';
      });
    });
  }

});
