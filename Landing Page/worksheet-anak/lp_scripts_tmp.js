
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Dyca Creative",
    "url": "https://dyca-creative.myscalev.com/",
    "logo": "https://dyca-creative.myscalev.com/logo.png",
    "description": "Worksheet anak digital PAUD–SD siap cetak. Bisa dipakai sendiri atau dijual kembali dengan hak jual kembali tanpa bagi hasil.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "dyca.creative@gmail.com",
      "areaServed": "ID",
      "availableLanguage": ["id"]
    }
  }
  
;

  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Dyca Creative",
    "url": "https://dyca-creative.myscalev.com/"
  }
  
;

  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Paket gratisnya benar-benar gratis, nggak ada biaya tersembunyi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Benar-benar gratis. Bunda hanya perlu isi email untuk menerima beberapa worksheet contoh, tanpa kartu kredit dan tanpa langganan otomatis."
        }
      },
      {
        "@type": "Question",
        "name": "Apakah ada garansi/refund jika filenya tidak sesuai?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ada. Produk berupa file digital — jika file rusak, tidak bisa diakses, atau tidak sesuai deskripsi, hubungi admin maksimal 1x24 jam setelah pembelian untuk penggantian file atau pengembalian dana."
        }
      },
      {
        "@type": "Question",
        "name": "Setelah bayar, filenya dikirim ke mana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "File PDF (dan kode landing page untuk paket reseller) dikirim ke email yang digunakan saat pembayaran, biasanya sampai dalam beberapa menit."
        }
      },
      {
        "@type": "Question",
        "name": "Kalau ambil paket reseller, saya perlu jago desain atau coding?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tidak. Landing page sudah jadi, Bunda hanya perlu mengganti nama, logo, dan warna sesuai brand sendiri."
        }
      },
      {
        "@type": "Question",
        "name": "Boleh saya jual di mana saja?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Boleh dijual lewat media sosial, marketplace pribadi, atau grup komunitas Bunda sendiri, dengan nama brand Bunda sendiri."
        }
      }
    ]
  }
  
;


    const PRICES = {
      'free': { original: null, sale: 0 },
      'simple': { original: 35000, sale: 25000 },
      'all-worksheet': { original: 75000, sale: 50000 },
      'reseller': { original: 200000, sale: 100000 },
      'custom-landing-page': { original: 250000, sale: 150000 }
    };

    function formatRupiah(n) {
      n = Math.round(Number(n) || 0);
      var s;
      try { s = n.toLocaleString('id-ID'); } catch (e) { s = String(n); }
      if (!/\./.test(s) && n >= 1000) s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return 'Rp' + s;
    }

    window.lpTrack = (function () {
      var PIXEL_WAIT_MS = 12000;
      var queue = [];
      var seen = {};
      var timer = null;

      function uid() {
        try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) { }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
      }

      function externalId() {
        try {
          var v = localStorage.getItem('sv_ext_id');
          if (!v) { v = uid(); localStorage.setItem('sv_ext_id', v); }
          return v;
        } catch (e) { return undefined; }
      }

      function fbReady() { return typeof window.fbq === 'function'; }

      function capiMirror(name, eventId, params, user) {
        try {
          var S = window.Scalev;
          if (!S || !S.analytics || typeof S.analytics.track !== 'function') return;
          var parameters = { currency: params.currency || 'IDR' };
          if (params.value != null) parameters.value = Number(params.value) || 0;
          if (params.content_ids) parameters.content_ids = params.content_ids;
          if (params.content_name) parameters.content_name = params.content_name;
          if (params.content_type) parameters.content_type = params.content_type;
          if (params.contents) parameters.contents = params.contents;
          if (params.num_items != null) parameters.num_items = params.num_items;
          S.analytics.track('facebook', {
            firstName: (user && user.firstName && String(user.firstName).trim()) || undefined,
            phone: (user && user.phone && String(user.phone).trim()) || undefined,
            email: (user && user.email && String(user.email).trim().toLowerCase()) || undefined,
            externalId: externalId(),
            events: [{ eventName: name, eventId: eventId, parameters: parameters }]
          });
        } catch (e) { }
      }

      function emit(item) {
        var params = item.params || {};
        if (params.value != null) params.value = Number(params.value) || 0;
        if (!params.currency && params.value != null) params.currency = 'IDR';
        capiMirror(item.name, item.eventId, params, item.user);
        try { window.fbq('track', item.name, params, { eventID: item.eventId }); } catch (e) { }
      }

      function flush() {
        if (!fbReady()) return;
        while (queue.length) emit(queue.shift());
        if (timer) { clearInterval(timer); timer = null; }
      }

      function scheduleFlush() {
        if (fbReady()) { flush(); return; }
        if (timer) return;
        var start = Date.now();
        timer = setInterval(function () {
          if (fbReady()) flush();
          else if (Date.now() - start > PIXEL_WAIT_MS) { clearInterval(timer); timer = null; }
        }, 200);
      }

      return function lpTrack(name, params, opts) {
        params = params || {};
        opts = opts || {};
        var now = Date.now();
        var key = opts.dedupeKey ||
          (name + '|' + (params.content_ids ? params.content_ids.join(',') : ''));
        var win = opts.dedupeWindowMs != null ? opts.dedupeWindowMs
          : (name === 'ViewContent' ? Infinity : 1500);
        if (seen[key] && (now - seen[key]) < win) return seen[key + '::id'];
        seen[key] = now;

        var eventId = opts.eventId || uid();
        seen[key + '::id'] = eventId;

        if (name === 'InitiateCheckout' || name === 'Lead') {
          try {
            localStorage.setItem('sv_lp_intent', JSON.stringify({
              event: name, eventId: eventId,
              pkg: (params.content_ids && params.content_ids[0]) || null,
              value: params.value != null ? Number(params.value) : null,
              ts: now
            }));
          } catch (e) { }
        }

        queue.push({ name: name, params: params, eventId: eventId, user: opts.user });
        scheduleFlush();
        return eventId;
      };
    })();

    (function fireViewContent() {
      function go() {
        window.lpTrack('ViewContent', { content_name: 'landing_page', content_type: 'product_group' });
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
      else go();
    })();

    (function renderPrices() {
      Array.prototype.forEach.call(document.querySelectorAll('[data-pkg]'), function (host) {
        var key = host.getAttribute('data-pkg');
        var slot = host.hasAttribute('data-price-slot') ? host : host.querySelector('[data-price-slot]');
        var p = PRICES[key];
        if (!slot || !p) return;

        if (!p.sale) {
          slot.innerHTML = 'Gratis<span>Rp0, selamanya</span>';
          return;
        }
        var html = '';
        if (p.original && p.original > p.sale) {
          var pct = Math.round((1 - p.sale / p.original) * 100);
          html += '<span class="price-was">' + formatRupiah(p.original) + '</span>';
          html += '<span class="price-now">' + formatRupiah(p.sale) + '</span>';
          html += '<span class="price-per">/ sekali bayar</span>';
          html += '<span class="price-save">Hemat ' + pct + '%</span>';
        } else {
          html += '<span class="price-now">' + formatRupiah(p.sale) + '</span>';
          html += '<span class="price-per">/ sekali bayar</span>';
        }
        slot.innerHTML = html;
      });
    })();

    (function renderStars() {
      var five = '<i></i><i></i><i></i><i></i><i></i>';
      Array.prototype.forEach.call(document.querySelectorAll('[data-stars]'), function (el) {
        var n = parseFloat(el.getAttribute('data-stars')) || 0;
        if (n < 0) n = 0;
        if (n > 5) n = 5;
        var pct = (n / 5 * 100).toFixed(2);
        el.innerHTML =
          '<span class="s-track">' + five + '</span>' +
          '<span class="s-fill" style="width:' + pct + '%">' + five + '</span>';
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', 'Rating ' + n + ' dari 5');
      });
    })();

    (function () {
      var phrases = ["Worksheet PAUD sampai SD", "Rapi & siap cetak", "Bisa dijual lagi dengan brand sendiri"];
      var el = document.getElementById('typedText');
      if (!el) return;
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) { el.textContent = phrases[0]; return; }
      var pi = 0, ci = 0, deleting = false;
      function tick() {
        var word = phrases[pi];
        if (!deleting) {
          ci++;
          el.textContent = word.slice(0, ci);
          if (ci === word.length) { deleting = true; setTimeout(tick, 1500); return; }
          setTimeout(tick, 55);
        } else {
          ci--;
          el.textContent = word.slice(0, ci);
          if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 300); return; }
          setTimeout(tick, 30);
        }
      }
      tick();
    })();

    (function () {
      var els = document.querySelectorAll('.reveal');
      if (!('IntersectionObserver' in window)) {
        els.forEach(function (el) { el.classList.add('in-view'); });
        return;
      }
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var t = entry.target;
            t.classList.add('in-view');
            obs.unobserve(t);

            t.addEventListener('transitionend', function handler() {
              t.style.willChange = 'auto';
              t.removeEventListener('transitionend', handler);
            });
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el) { obs.observe(el); });
    })();

    (function () {
      var bar = document.getElementById('stickyCta');
      if (!bar) return;
      function toggle() {
        if (window.scrollY > 480) bar.classList.add('show');
        else bar.classList.remove('show');
      }
      window.addEventListener('scroll', toggle, { passive: true });
      toggle();
    })();

    (function () {
      var navToggle = document.getElementById('navToggle');
      var navLinks = document.getElementById('navLinks');
      if (!navToggle || !navLinks) return;
      function closeMenu() {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      navToggle.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });
      document.addEventListener('click', function (e) {
        if (!navLinks.classList.contains('is-open')) return;
        if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
        closeMenu();
      });
    })();

    (function () {
      function openModal(id, e) {
        var m = document.getElementById(id);
        if (!m || !m.classList.contains('modal')) return;
        if (e) e.preventDefault();
        m.classList.add('is-open');
        document.body.classList.add('modal-open');
        var closeBtn = m.querySelector('.modal-close');
        if (closeBtn) { try { closeBtn.focus({ preventScroll: true }); } catch (e) { closeBtn.focus(); } }
      }
      function closeModal(m) {
        if (!m) return;
        m.classList.remove('is-open');
        if (!document.querySelector('.modal.is-open')) document.body.classList.remove('modal-open');
      }
      Array.prototype.forEach.call(document.querySelectorAll('[data-open]'), function (el) {
        el.addEventListener('click', function (e) { openModal(el.getAttribute('data-open'), e); });
      });
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (el) {
        var id = el.getAttribute('href').slice(1);
        var t = id && document.getElementById(id);
        if (t && t.classList.contains('modal')) {
          el.addEventListener('click', function (e) { openModal(id, e); });
        }
      });
      Array.prototype.forEach.call(document.querySelectorAll('.modal [data-close]'), function (el) {
        el.addEventListener('click', function () {
          closeModal(el.closest ? el.closest('.modal') : el.parentNode);
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal(document.querySelector('.modal.is-open'));
      });
    })();

    (function () {
      var track = document.querySelector('.testi-track');
      var set = track && track.querySelector('[data-testi-set]');
      if (!track || !set) return;
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      } catch (e) { }
      var clone = set.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('data-testi-set');
      track.appendChild(clone);
    })();
  
;


    (function () {
      var OFFSET = 96;
      var DURATION = 620;

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function smoothScrollTo(target) {
        var el = typeof target === 'string'
          ? document.getElementById(String(target).replace(/^#/, ''))
          : target;
        if (!el) return;
        var startY = window.pageYOffset;
        var maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        var endY = Math.max(0, Math.min(startY + el.getBoundingClientRect().top - OFFSET, maxY));
        var dist = endY - startY;
        if (Math.abs(dist) < 2) return;

        var startT = null;
        function loop(now) {
          if (startT === null) startT = now;
          var p = Math.min(1, (now - startT) / DURATION);
          window.scrollTo(0, startY + dist * easeInOutCubic(p));
          if (p < 1) requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
      }
      window.__smoothScrollTo = smoothScrollTo;

      document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a || a.hasAttribute('data-open')) return;
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var t = document.getElementById(id);
        if (!t || t.classList.contains('modal')) return;
        e.preventDefault();
        smoothScrollTo(t);
        try { history.replaceState(null, '', '#' + id); } catch (err) { }
      });
    })();
  
;


    (function () {
      var CHECKOUT_PAGE = "https://dyca-creative.myscalev.com/checkout-worksheet";
      var CHECKOUT = {
        'free': CHECKOUT_PAGE,
        'simple': CHECKOUT_PAGE,
        'all-worksheet': CHECKOUT_PAGE,
        'reseller': CHECKOUT_PAGE,
        'custom-landing-page': CHECKOUT_PAGE
      };

      var FORWARD = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
        'utm_content', 'utm_id', 'fbclid', 'gclid', 'msclkid', 'ref'];
      var incoming = new URLSearchParams(window.location.search);

      function checkoutUrl(pkg) {
        var base = CHECKOUT[pkg];
        if (!base || !/^https?:\/\//i.test(base)) return null;
        var u = new URL(base, window.location.href);
        if (pkg) u.searchParams.set('pkg', pkg);
        FORWARD.forEach(function (k) {
          var v = incoming.get(k);
          if (v && !u.searchParams.has(k)) u.searchParams.set(k, v);
        });
        return u.toString();
      }

      function smoothScroll(sel) {
        var t = sel && document.querySelector(sel);
        if (!t) return;
        if (typeof window.__smoothScrollTo === 'function') window.__smoothScrollTo(t);
        else t.scrollIntoView({ behavior: 'smooth' });
      }

      function trackClick(pkg) {
        if (typeof window.lpTrack !== 'function') return;
        var ev = (pkg === 'free') ? 'Lead' : 'InitiateCheckout';
        var id = pkg || 'unknown';
        var params = { content_name: id, content_type: 'product', content_ids: [id], currency: 'IDR' };
        var price = (typeof PRICES !== 'undefined' && PRICES[pkg]) ? Number(PRICES[pkg].sale) || 0 : 0;
        if (price > 0) {
          params.value = price;
          params.contents = [{ id: id, quantity: 1, item_price: price }];
          params.num_items = 1;
        }
        window.lpTrack(ev, params);
      }

      var nodes = document.querySelectorAll('[data-scalev], [data-scalev-go]');
      Array.prototype.forEach.call(nodes, function (el) {
        var pkg = el.getAttribute('data-scalev') || el.getAttribute('data-scalev-go');
        var fallback = el.getAttribute('data-scroll') || '#paket';
        var url = checkoutUrl(pkg);

        if (el.tagName === 'A') {
          if (url) {
            el.setAttribute('href', url);
            el.removeAttribute('target');
            el.removeAttribute('rel');
          } else {
            el.setAttribute('href', fallback);
          }
          el.addEventListener('click', function () { trackClick(pkg); });
          return;
        }

        el.addEventListener('click', function (e) {
          e.preventDefault();
          trackClick(pkg);
          if (url) window.location.href = url;
          else smoothScroll(fallback);
        });
      });
    })();
  
;

    (function () {

      var ENDPOINT = "GANTI_URL_WORKER";

      var form = document.getElementById('tanyaForm');
      if (!form) return;
      var statusEl = document.getElementById('askStatus');
      var submitBtn = form.querySelector('.ask-submit');

      var configured =
        ENDPOINT.indexOf('GANTI_') !== 0 && /^https?:\/\//i.test(ENDPOINT);

      function setStatus(msg, kind) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.classList.remove('is-ok', 'is-err');
        if (kind === 'ok') statusEl.classList.add('is-ok');
        else if (kind === 'err') statusEl.classList.add('is-err');
        statusEl.hidden = false;
      }

      function clearStatus() {
        if (!statusEl) return;
        statusEl.hidden = true;
        statusEl.textContent = '';
        statusEl.classList.remove('is-ok', 'is-err');
      }

      Array.prototype.forEach.call(
        document.querySelectorAll('#tanya-produk [data-close]'),
        function (el) { el.addEventListener('click', clearStatus); }
      );

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        if (!configured) {
          setStatus('Form belum terhubung. Mohon hubungi admin untuk melengkapi setup pengiriman.', 'err');
          return;
        }

        var contactUser = {
          firstName: form.nama.value,
          email: form.email.value,
          phone: form.whatsapp ? form.whatsapp.value : ''
        };

        var oldLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim...';
        setStatus('Mengirim pertanyaan Bunda...', null);

        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama: form.nama.value,
            email: form.email.value,
            whatsapp: form.whatsapp.value,
            pesan: form.pesan.value,
            website: form.website ? form.website.value : ''
          })
        })
          .then(function (r) {
            return r.json().catch(function () { return {}; })
              .then(function (body) { return { ok: r.ok, body: body }; });
          })
          .then(function (res) {
            if (!res.ok) throw new Error((res.body && res.body.error) || 'Gagal mengirim.');
            form.reset();
            setStatus('Terkirim! Pertanyaan Bunda sudah kami terima dan akan dibalas lewat email secepatnya. Terima kasih 🙏', 'ok');
            if (typeof window.lpTrack === 'function') {
              window.lpTrack('Contact', { content_name: 'tanya_produk' }, { user: contactUser });
            }
          })
          .catch(function (err) {
            setStatus('Maaf, pengiriman gagal. Coba lagi beberapa saat lagi.', 'err');
            if (window.console) console.error('Tanya Produk error:', err);
          })
          .finally(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = oldLabel;
          });
      });
    })();
  