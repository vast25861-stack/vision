/* =========================================================
   VDT Vision — interactions
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- header: compact on scroll + mobile menu ---------- */
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-compact', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!header || !burger) return;
    header.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && header) {
    burger.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        setTimeout(function () { el.classList.add('is-visible'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    // safety: never leave content hidden
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- timeline progress ---------- */
  var timeline = document.querySelector('.timeline');
  if (timeline && 'IntersectionObserver' in window) {
    var tIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); tIo.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    tIo.observe(timeline);
  } else if (timeline) {
    timeline.classList.add('is-visible');
  }

  /* ---------- active nav link ---------- */
  var sections = ['solutions', 'tasks', 'industries', 'demo', 'integration', 'cases', 'faq']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var navLinks = document.querySelectorAll('.nav__link');

  function setActiveNav() {
    var pos = window.scrollY + 140;
    var current = '';
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) current = sec.id;
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      link.classList.toggle('is-active', href === '#' + current);
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- industries tabs ---------- */
  var indItems = document.querySelectorAll('.ind__item');
  var indPanels = document.querySelectorAll('.ind__panel');

  function activateIndustry(idx) {
    indItems.forEach(function (item) {
      var on = item.getAttribute('data-ind') === String(idx);
      item.classList.toggle('is-active', on);
      item.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    indPanels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-panel') === String(idx));
    });
  }

  indItems.forEach(function (item) {
    var idx = item.getAttribute('data-ind');
    item.addEventListener('mouseenter', function () { activateIndustry(idx); });
    item.addEventListener('focus', function () { activateIndustry(idx); });
    item.addEventListener('click', function () { activateIndustry(idx); });
  });

  /* ---------- demo slider (before / after) ---------- */
  var screen = document.getElementById('demoScreen');
  var aiLayer = document.getElementById('demoAi');
  var divider = document.getElementById('demoDivider');
  var handle = document.getElementById('demoHandle');

  if (screen && aiLayer && divider && handle) {
    var dragging = false;

    function setPos(pct) {
      pct = Math.max(4, Math.min(96, pct));
      aiLayer.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      divider.style.left = pct + '%';
    }

    function pctFromEvent(e) {
      var rect = screen.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function startDrag(e) {
      dragging = true;
      screen.classList.add('is-dragging');
      setPos(pctFromEvent(e));
      if (e.cancelable && e.type === 'touchstart') { /* allow vertical scroll */ }
    }
    function moveDrag(e) {
      if (!dragging) return;
      setPos(pctFromEvent(e));
      if (e.type === 'touchmove' && e.cancelable) e.preventDefault();
    }
    function endDrag() {
      dragging = false;
      screen.classList.remove('is-dragging');
    }

    handle.addEventListener('mousedown', startDrag);
    screen.addEventListener('mousedown', function (e) {
      // click anywhere on screen moves the slider
      startDrag(e);
    });
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    handle.addEventListener('touchstart', startDrag, { passive: true });
    screen.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend', endDrag);

    handle.addEventListener('keydown', function (e) {
      var left = parseFloat(divider.style.left) || 50;
      if (e.key === 'ArrowLeft') { setPos(left - 4); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPos(left + 4); e.preventDefault(); }
    });

    // intro sweep once in view
    if ('IntersectionObserver' in window && !reduceMotion) {
      var sweepIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          sweepIo.unobserve(en.target);
          var start = null;
          var from = 92, to = 50, dur = 1100;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min(1, (ts - start) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            setPos(from + (to - from) * eased);
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.35 });
      sweepIo.observe(screen);
    }
    setPos(50);
  }

  /* ---------- FAQ: only one open (optional accordion behavior) ---------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- CTA prefill (Запросить пилот) ---------- */
  document.querySelectorAll('[data-prefill]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var desc = document.getElementById('fDesc');
      if (desc && !desc.value) {
        desc.value = 'Интересует пилотный проект: ';
        setTimeout(function () { desc.focus(); desc.selectionStart = desc.value.length; }, 600);
      }
    });
  });

  /* ---------- form ---------- */
  var form = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  var fileInput = document.getElementById('fFiles');
  var fileHint = document.getElementById('fileHint');

  if (fileInput && fileHint) {
    fileInput.addEventListener('change', function () {
      var n = fileInput.files ? fileInput.files.length : 0;
      fileHint.textContent = n
        ? ('Выбрано файлов: ' + n)
        : 'JPG, PNG, MP4 — кадры объекта контроля';
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var required = form.querySelectorAll('[required]');
      required.forEach(function (field) {
        var empty = !field.value.trim();
        field.classList.toggle('is-error', empty);
        if (empty) valid = false;
      });
      if (!valid) {
        var firstErr = form.querySelector('.is-error');
        if (firstErr) firstErr.focus();
        return;
      }
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
      form.reset();
      if (fileHint) fileHint.textContent = 'JPG, PNG, MP4 — кадры объекта контроля';
      form.querySelectorAll('.csel input').forEach(function (cb) { cb.checked = false; });
    });

    form.querySelectorAll('[required]').forEach(function (field) {
      field.addEventListener('input', function () { field.classList.remove('is-error'); });
    });
  }

  /* ---------- light parallax for hero visual ---------- */
  var heroVisual = document.querySelector('.hero__visual .scene__svg');
  if (heroVisual && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    var hero = document.getElementById('hero');
    if (hero) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        heroVisual.style.transform = 'translate3d(' + (x * 8).toFixed(2) + 'px,' + (y * 8).toFixed(2) + 'px,0)';
      });
      hero.addEventListener('mouseleave', function () {
        heroVisual.style.transform = '';
      });
    }
  }
})();
