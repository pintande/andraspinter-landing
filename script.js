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

  /* ---------- Kontakt: bedingtes Website-Feld ---------- */
  var websiteToggle = document.querySelector('.segmented-control');
  var websiteWrapper = document.getElementById('website-field-wrapper');
  var websiteInput = document.getElementById('webseite');

  if (websiteToggle && websiteWrapper && websiteInput) {
    websiteToggle.addEventListener('change', function (e) {
      if (!e.target || e.target.name !== 'hat_website') return;

      if (e.target.value === 'ja') {
        websiteWrapper.classList.add('is-visible');
        websiteInput.disabled = false;
        websiteInput.required = true;
      } else {
        websiteWrapper.classList.remove('is-visible');
        websiteInput.disabled = true;
        websiteInput.required = false;
        websiteInput.value = '';
        websiteInput.setCustomValidity('');
      }
    });
  }

  /* ---------- Kontakt: bedingtes Bundesland-Feld ---------- */
  var landSelect = document.getElementById('land');
  var bundeslandWrapper = document.getElementById('bundesland-field-wrapper');
  var bundeslandSelect = document.getElementById('bundesland');

  if (landSelect && bundeslandWrapper && bundeslandSelect) {
    landSelect.addEventListener('change', function () {
      if (landSelect.value === 'deutschland') {
        bundeslandWrapper.classList.add('is-visible');
        bundeslandSelect.disabled = false;
      } else {
        bundeslandWrapper.classList.remove('is-visible');
        bundeslandSelect.disabled = true;
        bundeslandSelect.value = '';
      }
    });
  }

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

  /* ---------- Herausforderungen: 3D-Karussell ---------- */
  var carousel = document.querySelector('.challenges-carousel');

  if (carousel) {
    var viewport = carousel.querySelector('.challenges-viewport');
    var track = carousel.querySelector('.challenges-track');
    var cards = Array.prototype.slice.call(track.querySelectorAll('.challenge-card'));
    var prevBtn = carousel.querySelector('.carousel-arrow-prev');
    var nextBtn = carousel.querySelector('.carousel-arrow-next');
    var total = cards.length;
    var currentIndex = 0;
    var suppressNextClick = false;
    var isDragging = false;
    var startX = 0;
    var dragDelta = 0;

    function getLayoutConfig() {
      var w = window.innerWidth;
      if (w < 720) {
        return { spacing: 40, scaleStep: 0.12, rotate: 8, maxVisible: 0 };
      }
      if (w < 1024) {
        return { spacing: 160, scaleStep: 0.14, rotate: 16, maxVisible: 1 };
      }
      return { spacing: 205, scaleStep: 0.14, rotate: 22, maxVisible: 1 };
    }

    var prevDiffs = null;

    function resolveDiff(cardIndex) {
      var raw = cardIndex - currentIndex;
      var m = ((raw % total) + total) % total;

      /* Für jede Karte außer der exakt gegenüberliegenden ist die kleinste
         Darstellung eindeutig und braucht keine Historie - das verhindert
         jede Drift oder Fehlklassifizierung durch alte, geklemmte Werte. */
      if (total % 2 !== 0 || m !== total / 2) {
        return m > total / 2 ? m - total : m;
      }

      /* Nur die exakt gegenüberliegende Karte ist mehrdeutig (+total/2 oder
         -total/2 sind gleichwertig) - hier an der vorherigen Seite festhalten,
         damit sie nicht bei jedem Schritt die Seite wechselt. */
      var prev = prevDiffs ? prevDiffs[cardIndex] : m;
      return Math.abs(m - prev) <= Math.abs(m - total - prev) ? m : m - total;
    }

    function render(liveOffset) {
      liveOffset = liveOffset || 0;
      var cfg = getLayoutConfig();
      var newDiffs = [];

      cards.forEach(function (card, i) {
        var diff = resolveDiff(i);
        newDiffs[i] = diff;
        var abs = Math.abs(diff);
        var dir = diff > 0 ? 1 : diff < 0 ? -1 : 0;
        var x, scale, rotate, opacity, blur, z, pointerEvents;

        card.classList.remove('is-active', 'is-prev', 'is-next');

        if (diff === 0) {
          x = 0;
          scale = 1.06;
          rotate = 0;
          opacity = 1;
          blur = 0;
          z = 10;
          pointerEvents = 'auto';
          card.classList.add('is-active');
        } else if (cfg.maxVisible === 0) {
          /* Mobile: nur die aktive Karte sichtbar, Nachbarn knapp daneben für den Swipe-Effekt */
          x = dir * cfg.spacing;
          scale = 1 - cfg.scaleStep;
          rotate = 0;
          opacity = 0;
          blur = 0;
          z = 1;
          pointerEvents = 'none';
        } else if (abs <= cfg.maxVisible) {
          x = dir * cfg.spacing * abs;
          scale = 1 - cfg.scaleStep * abs;
          rotate = -dir * cfg.rotate;
          opacity = abs === 1 ? 0.65 : 0.4;
          blur = abs === 1 ? 1 : 2;
          z = 10 - abs;
          pointerEvents = 'auto';
          if (dir === -1) card.classList.add('is-prev');
          if (dir === 1) card.classList.add('is-next');
        } else {
          x = dir * 700;
          scale = 0.6;
          rotate = -dir * cfg.rotate;
          opacity = 0;
          blur = 2;
          z = 1;
          pointerEvents = 'none';
        }

        x += liveOffset;

        card.style.transform = 'translate(-50%, -50%) translateX(' + x + 'px) scale(' + scale + ') rotateY(' + rotate + 'deg)';
        card.style.opacity = String(opacity);
        card.style.filter = 'blur(' + blur + 'px)';
        card.style.zIndex = String(z);
        card.style.pointerEvents = pointerEvents;
        card.setAttribute('aria-hidden', diff === 0 ? 'false' : 'true');
        card.tabIndex = diff === 0 ? 0 : -1;
      });

      prevDiffs = newDiffs;
    }

    function goTo(index) {
      currentIndex = ((index % total) + total) % total;
      render();
    }

    function next() {
      goTo(currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex - 1);
    }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    cards.forEach(function (card, i) {
      card.addEventListener('click', function () {
        if (suppressNextClick) {
          suppressNextClick = false;
          return;
        }
        if (card.classList.contains('is-active')) return;
        goTo(i);
      });
    });

    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    });

    /* Ziehen / Swipe per Maus und Touch (Pointer Events) */
    viewport.addEventListener('pointerdown', function (e) {
      isDragging = true;
      startX = e.clientX;
      dragDelta = 0;
      cards.forEach(function (c) {
        c.classList.add('is-dragging');
      });
      if (viewport.setPointerCapture) {
        viewport.setPointerCapture(e.pointerId);
      }
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      var cfg = getLayoutConfig();
      var maxDrag = cfg.spacing || 1;
      var rawDelta = e.clientX - startX;
      /* Begrenzen, damit sich das Deck nie weiter verschiebt, als ein einzelner
         Schritt zulässt - kein freies Durchscrollen bis zum Anschlag. */
      dragDelta = Math.max(-maxDrag, Math.min(maxDrag, rawDelta));
      render(dragDelta);
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      cards.forEach(function (c) {
        c.classList.remove('is-dragging');
      });

      var threshold = 50;
      if (Math.abs(dragDelta) > 5) {
        suppressNextClick = true;
      }
      if (dragDelta > threshold) {
        prev();
      } else if (dragDelta < -threshold) {
        next();
      } else {
        render();
      }
      dragDelta = 0;
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('pointerleave', function () {
      if (isDragging) endDrag();
    });

    window.addEventListener('resize', function () {
      render();
    });

    render();
  }
});
