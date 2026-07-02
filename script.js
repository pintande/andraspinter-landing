document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector('.site-header');

  function updateHeaderShadow() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderShadow);
  updateHeaderShadow();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navbar = document.querySelector('.navbar');

  if (navToggle && navbar) {
    navToggle.addEventListener('click', function () {
      navbar.classList.toggle('is-open');
    });

    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        navbar.classList.remove('is-open');
      });
    });
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href');
      if (targetId.length < 2) return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var headerHeight = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion-item').forEach(function (item) {
    var trigger = item.querySelector('.accordion-trigger');
    var panel = item.querySelector('.accordion-panel');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.accordion-item.is-open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.accordion-panel').style.maxHeight = null;
          openItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Cookie banner ---------- */
  var cookieBanner = document.querySelector('.cookie-banner');

  if (cookieBanner) {
    var storageKey = 'ap_cookie_consent';
    var consent = localStorage.getItem(storageKey);

    if (!consent) {
      window.setTimeout(function () {
        cookieBanner.classList.add('is-visible');
      }, 600);
    }

    var acceptBtn = cookieBanner.querySelector('[data-cookie-accept]');
    var necessaryBtn = cookieBanner.querySelector('[data-cookie-necessary]');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        localStorage.setItem(storageKey, 'all');
        cookieBanner.classList.remove('is-visible');
      });
    }

    if (necessaryBtn) {
      necessaryBtn.addEventListener('click', function () {
        localStorage.setItem(storageKey, 'necessary');
        cookieBanner.classList.remove('is-visible');
      });
    }
  }
});
