/* Portfolio interactions: nav, reveal, terminal typing, theme tweak bridge */
(function () {
  'use strict';

  /* ---- Nav scroll state + burger ---- */
  var nav = document.querySelector('.nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
    var tt = document.querySelector('.totop');
    if (tt) tt.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.nav-burger');
  if (burger && nav) {
    burger.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  var totop = document.querySelector('.totop');
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---- Reveal on scroll ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---- Hero role typewriter ---- */
  var roleEl = document.querySelector('[data-typeroles]');
  if (roleEl) {
    var roles = JSON.parse(roleEl.getAttribute('data-typeroles'));
    var span = roleEl.querySelector('.type-text');
    var ri = 0, ci = 0, deleting = false;
    var tick = function () {
      var word = roles[ri];
      if (!deleting) {
        ci++;
        if (ci > word.length) { deleting = true; setTimeout(tick, 1400); return; }
      } else {
        ci--;
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
      }
      span.textContent = word.slice(0, ci);
      setTimeout(tick, deleting ? 38 : 70);
    };
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) tick();
    else span.textContent = roles[0];
  }

  /* ---- Terminal typing ---- */
  var term = document.querySelector('[data-terminal]');
  if (term) {
    var lines = [
      { t: 'prompt', a: '$ ', b: 'whoami' },
      { t: 'out', b: '> ashwani_kumar — ai / backend engineer' },
      { t: 'gap' },
      { t: 'prompt', a: '$ ', b: 'cat stack.txt' },
      { t: 'out', b: '> fastapi · nestjs · azure_openai' },
      { t: 'out', b: '> rag · langchain · mongodb · docker' },
      { t: 'gap' },
      { t: 'prompt', a: '$ ', b: 'echo $MOTTO' },
      { t: 'out', b: '> "no docs? no problem. find a way out."' },
      { t: 'gap' },
      { t: 'prompt', a: '$ ', b: 'status --now' },
      { t: 'key', b: '> ● available for roles & collaborations' }
    ];
    var body = term.querySelector('.terminal-body');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var li = 0;
    function renderStatic() {
      lines.forEach(function (ln) {
        var d = document.createElement('div'); d.className = 'ln';
        if (ln.t === 'gap') { d.innerHTML = '&nbsp;'; }
        else if (ln.t === 'prompt') { d.innerHTML = '<span class="t-prompt">' + ln.a + '</span><span class="t-cmd">' + ln.b + '</span>'; }
        else if (ln.t === 'key') { d.innerHTML = '<span class="t-key">' + ln.b + '</span>'; }
        else { d.innerHTML = '<span class="t-out">' + ln.b + '</span>'; }
        body.appendChild(d);
      });
    }
    function typeLine() {
      if (li >= lines.length) {
        var cur = document.createElement('span'); cur.className = 't-cursor'; body.appendChild(cur); return;
      }
      var ln = lines[li];
      var d = document.createElement('div'); d.className = 'ln'; body.appendChild(d);
      if (ln.t === 'gap') { d.innerHTML = '&nbsp;'; li++; setTimeout(typeLine, 120); return; }
      var full = (ln.a || '') + ln.b;
      var cls = ln.t === 'prompt' ? 't-cmd' : (ln.t === 'key' ? 't-key' : 't-out');
      var prefix = ln.t === 'prompt' ? '<span class="t-prompt">' + ln.a + '</span>' : '';
      var txt = ln.b, i = 0;
      (function ch() {
        i++;
        d.innerHTML = prefix + '<span class="' + cls + '">' + txt.slice(0, i) + '</span>';
        if (i < txt.length) { setTimeout(ch, 16 + Math.random() * 22); }
        else { li++; setTimeout(typeLine, 240); }
      })();
    }
    var started = false;
    var tObs = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting && !started) {
          started = true;
          if (reduce) renderStatic(); else typeLine();
          tObs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    tObs.observe(term);
  }

  /* ---- Animated stat counters ---- */
  var statObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = parseFloat(el.getAttribute('data-count'));
      var dec = (el.getAttribute('data-dec') === '1');
      var dur = 1200, t0 = performance.now();
      function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var v = target * eased;
        el.textContent = dec ? v.toFixed(2) : Math.round(v).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = dec ? target.toFixed(2) : target.toLocaleString();
      }
      requestAnimationFrame(step);
      statObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { statObs.observe(el); });

  /* ---- Active nav link on scroll ---- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var navLinks = {};
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });
  var secObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove('active'); });
        var a = navLinks[e.target.id];
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(function (s) { secObs.observe(s); });
})();
