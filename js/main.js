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
    });

    // Close nav when a link is clicked
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('is-open');
        nav.classList.remove('is-open');
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
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    fadeElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

});
