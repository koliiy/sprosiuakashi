/* Unified Navigation, Progress Bar, Active Nav, Lightbox, Copy Helper, Cookie Banner & Article TOC */
(function () {
  var nav = document.getElementById('site-nav');
  var burger = document.getElementById('nav-burger');
  var drawer = document.getElementById('nav-mobile-drawer');
  var progress = document.getElementById('reading-progress');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) {
      if (y > 24) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    if (progress) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(100, Math.max(0, (y / docHeight) * 100)) : 0;
      progress.style.width = pct.toFixed(1) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // Active Navigation Indicator for Internal Pages
  var path = window.location.pathname.split('/').pop() || '';
  var matchedNav = false;
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (path && href.indexOf(path) !== -1) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
      matchedNav = true;
    }
  });
  if (!matchedNav && path && path !== '404.html' && path !== 'policy.html') {
    var kbLink = document.querySelector('.nav-links a[href*="#articles"]');
    if (kbLink) {
      kbLink.classList.add('active');
      kbLink.setAttribute('aria-current', 'true');
    }
  }

  // Automatic Table of Contents for Articles
  var article = document.querySelector('article.page-wrap');
  if (article && !document.getElementById('article-toc')) {
    var headings = Array.prototype.slice.call(article.querySelectorAll('h2')).filter(function (h) {
      return !h.closest('.cta-block') && !h.closest('.quiz-card') && !h.closest('.calc-dob-card');
    });
    if (headings.length >= 3) {
      var toc = document.createElement('nav');
      toc.className = 'article-toc';
      toc.id = 'article-toc';
      toc.setAttribute('aria-label', 'Содержание статьи');

      var title = document.createElement('div');
      title.className = 'article-toc-title';
      title.textContent = 'Содержание статьи';
      toc.appendChild(title);

      var list = document.createElement('ol');
      list.className = 'article-toc-list';

      headings.forEach(function (h, idx) {
        if (!h.id) {
          h.id = 'section-' + (idx + 1);
        }
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.replace(/^\s+|\s+$/g, '');
        li.appendChild(a);
        list.appendChild(li);
      });

      toc.appendChild(list);
      var firstH2 = headings[0];
      firstH2.parentNode.insertBefore(toc, firstH2);
    }
  }

  // Click-to-Zoom Lightbox for Telegram Review Screenshots
  var lbOverlay = document.getElementById('lightbox-overlay');
  var lbImg = document.getElementById('lightbox-img');
  var lbCaption = document.getElementById('lightbox-caption');
  var lbClose = document.getElementById('lightbox-close');

  function closeLightbox() {
    if (!lbOverlay) return;
    lbOverlay.classList.remove('open');
    lbOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.tg-review-img img, .tg-review-card img').forEach(function (img) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    function openImg() {
      if (!lbOverlay || !lbImg) return;
      lbImg.src = img.getAttribute('src');
      lbImg.alt = img.getAttribute('alt') || 'Скриншот отзыва из Telegram';
      var card = img.closest('.tg-review-card');
      var author = card ? (card.querySelector('.tg-review-author') || card.querySelector('.tg-review-title')) : null;
      if (lbCaption) lbCaption.textContent = author ? author.textContent : (img.getAttribute('alt') || '');
      lbOverlay.classList.add('open');
      lbOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lbClose) lbClose.focus();
    }
    img.addEventListener('click', openImg);
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openImg();
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbOverlay) {
    lbOverlay.addEventListener('click', function (e) {
      if (e.target === lbOverlay) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lbOverlay && lbOverlay.classList.contains('open')) {
      closeLightbox();
    }
  });

  function copyTextWithFallback(text, onSuccess, onFail) {
    function legacyCopy() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return !!ok;
      } catch (err) {
        return false;
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(function () {
        if (legacyCopy()) {
          onSuccess();
        } else {
          onFail();
        }
      });
    } else if (legacyCopy()) {
      onSuccess();
    } else {
      onFail();
    }
  }

  // Backup Copy Button for @sprosiuakashi
  document.querySelectorAll('[data-copy-tg]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var handle = btn.getAttribute('data-copy-tg') || '@sprosiuakashi';
      var span = btn.querySelector('span');
      var orig = span ? (span.getAttribute('data-orig') || span.textContent) : '';
      if (span && !span.getAttribute('data-orig')) span.setAttribute('data-orig', orig);
      function done() {
        btn.classList.add('copied');
        if (span) span.textContent = '✓ Ник @sprosiuakashi скопирован в буфер обмена';
        setTimeout(function () {
          btn.classList.remove('copied');
          if (span) span.textContent = orig;
        }, 3200);
      }
      function fail() {
        btn.classList.remove('copied');
        if (span) span.textContent = 'Скопируйте вручную: ' + handle;
        setTimeout(function () {
          if (span) span.textContent = orig;
        }, 4000);
      }
      copyTextWithFallback(handle, done, fail);
    });
  });

  // FAQ Accordion
  document.querySelectorAll('.faq-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      if (!item) return;
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        var b = i.querySelector('.faq-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Share URL Copy & Micro-Conversion Tracking
  document.querySelectorAll('[data-copy-url]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-copy-url') || window.location.href;
      var span = btn.querySelector('span');
      var orig = span ? (span.getAttribute('data-orig') || span.textContent) : '';
      if (span && !span.getAttribute('data-orig')) span.setAttribute('data-orig', orig);
      function done() {
        btn.classList.add('copied');
        if (span) span.textContent = '✓ Ссылка скопирована';
        setTimeout(function () {
          btn.classList.remove('copied');
          if (span) span.textContent = orig;
        }, 3000);
      }
      function fail() {
        btn.classList.remove('copied');
        if (span) span.textContent = 'Скопируйте адрес из строки браузера';
        setTimeout(function () {
          if (span) span.textContent = orig;
        }, 3500);
      }
      copyTextWithFallback(url, done, fail);
    });
  });

  function trackGoal(goalName, extraParams) {
    var params = Object.assign({ path: window.location.pathname }, extraParams || {});
    if (typeof gtag === 'function') {
      gtag('event', goalName === 'lead' ? 'generate_lead' : goalName, Object.assign({
        'event_category': 'conversion',
        'event_label': params.cta_location || window.location.pathname,
        'transport_type': 'beacon'
      }, extraParams || {}));
    }
    if (typeof ym === 'function') {
      ym(112518581, 'reachGoal', goalName, params);
    }
  }
  window.akashiTrackGoal = trackGoal;

  function getCtaLocation(link) {
    if (link.closest('#nav-mobile-drawer')) return 'mobile_drawer';
    if (link.closest('#site-nav')) return 'nav';
    if (link.closest('.mobile-sticky-cta')) return 'mobile_sticky';
    if (link.closest('.hero')) return 'hero';
    if (link.closest('#calculator, #dob-calculator')) return 'calculator';
    if (link.closest('#home-diagnostic-quiz, #diagnostic-quiz')) return 'quiz';
    if (link.closest('#formats')) return 'formats';
    if (link.closest('#faq, .faq-block')) return 'faq';
    if (link.closest('#contact')) return 'final_cta';
    if (link.closest('.cta-block')) return 'article_cta';
    if (link.closest('.site-footer')) return 'footer';
    return 'article_inline';
  }

  document.addEventListener('click', function (e) {
    var tgLink = e.target.closest('a[href*="t.me/sprosiuakashi"]');
    if (tgLink) {
      var ctaLocation = getCtaLocation(tgLink);
      trackGoal('lead', { cta_location: ctaLocation });
      trackGoal('lead_' + ctaLocation, { cta_location: ctaLocation });
    } else if (e.target.closest('a[href*="t.me/tribute"]')) {
      trackGoal('tribute_click');
    } else if (e.target.closest('[data-copy-tg]')) {
      trackGoal('copy_tg_handle');
    } else if (e.target.closest('.btn-share-tg') || e.target.closest('[data-copy-url]')) {
      trackGoal('share_article');
    } else if (e.target.closest('.quiz-opt-btn[data-step="3"], #quiz-step-3 .quiz-opt')) {
      trackGoal('quiz_complete');
    }
  });

  // Cookie Consent Banner
  var cookieBanner = document.getElementById('cookie-banner');
  var cookieAccept = document.getElementById('cookie-accept-btn');
  try {
    if (cookieBanner && !localStorage.getItem('akashi_cookie_accepted')) {
      setTimeout(function () {
        cookieBanner.classList.add('visible');
      }, 900);
    }
    if (cookieAccept && cookieBanner) {
      cookieAccept.addEventListener('click', function () {
        localStorage.setItem('akashi_cookie_accepted', '1');
        cookieBanner.classList.remove('visible');
      });
    }
  } catch (err) {}
})();
