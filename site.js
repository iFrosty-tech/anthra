// Anthra site: the pinned window story, the live terminal demo and the small controls.
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const W = 1200;
  const H = 740;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const smooth = (t) => t * t * (3 - 2 * t);
  const range = (p, start, end) => clamp((p - start) / (end - start));

  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const smallQuery = matchMedia('(max-width: 900px), (max-height: 560px)');

  if (!reducedQuery.matches) root.classList.add('motion');

  /* ---------------- Nav ---------------- */

  const nav = $('[data-nav]');
  const onNavScroll = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ---------------- The story ---------------- */

  const story = $('[data-story]');
  const stage = $('[data-stage]');
  const hero = $('[data-hero]');
  const viewport = $('[data-viewport]');
  const win = $('[data-win]');
  const note = $('[data-note]');
  const captions = $$('.caption');
  const railButtons = $$('[data-goto]');
  const layers = {
    frame: $('[data-layer="frame"]'),
    steps: [0, 1, 2, 3].map((i) => $(`[data-layer="${i}"]`)),
  };

  // Stacking order from the floor up: frame, terminal, panel, tabs, toast.
  const LIFT = { frame: 0, 1: 1, 2: 2, 0: 3, 3: 4.2 };

  const STEP_START = 0.36;
  const STEP_END = 0.95;

  let pinned = false;
  let heroBottom = 0;
  let current = -2;

  function isStatic() {
    return reducedQuery.matches || smallQuery.matches;
  }

  function measure() {
    pinned = !isStatic();
    root.classList.toggle('is-static', !pinned);
    stage.classList.remove('is-exploded');
    if (!pinned) {
      layoutStatic();
      return;
    }
    const heroRect = hero.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    heroBottom = heroRect.bottom - stageRect.top;
    update();
  }

  function layoutStatic() {
    const width = viewport.clientWidth;
    const s = width / W;
    viewport.style.setProperty('--vh-static', `${Math.round(H * s)}px`);
    win.style.transform = `scale(${s})`;
    win.style.transformOrigin = '0 0';
    for (const el of [layers.frame, ...layers.steps]) {
      el.style.setProperty('--lz', '0px');
      el.classList.remove('is-lit', 'is-dim');
    }
    captions.forEach((c) => c.classList.remove('is-active'));
  }

  function progress() {
    const rect = story.getBoundingClientRect();
    const travel = rect.height - innerHeight;
    return travel > 0 ? clamp(-rect.top / travel) : 0;
  }

  function update() {
    if (!pinned) return;
    const p = progress();
    const vw = innerWidth;
    const vh = stage.clientHeight;

    // Phase A: the hero lifts away and the window straightens and rises.
    const a = expoOut(range(p, 0, 0.17));
    // Phase B: the window turns and its layers separate.
    const b = smooth(range(p, 0.17, STEP_START));
    // Phase C: one layer at a time.
    const c = range(p, STEP_START, STEP_END);

    hero.style.opacity = String(clamp(1 - a * 1.6));
    hero.style.transform = `translate(-50%, ${-a * 90}px)`;
    hero.style.visibility = a > 0.7 ? 'hidden' : 'visible';
    note.style.setProperty('--note', String(clamp(a * 3 - 2) * clamp(1 - b * 3)));
    stage.style.setProperty('--grid', String(0.35 + b * 0.5));

    const fit = Math.min((vw - 96) / W, (vh - 150) / H, 1.08);
    const wide = vw > 1080;

    const s0 = fit * 0.98;
    const y0 = heroBottom + 44 + (H * s0) / 2;
    const y1 = vh / 2 + 24;
    const sA = fit * 0.94;

    const sB = fit * (wide ? 0.54 : 0.5);
    const xB = wide ? vw * 0.585 : vw * 0.5;
    const yB = vh / 2 + 50;

    const scale = lerp(lerp(s0, sA, a), sB, b);
    const x = lerp(vw / 2, xB, b);
    const y = lerp(lerp(y0, y1, a), yB, b);
    const drift = c > 0 && c < 1 ? (c - 0.5) * 6 : 0;
    const rx = lerp(26, 0, a) + b * 48;
    const rz = b * (-24 + drift);

    win.style.transformOrigin = '50% 50%';
    win.style.transform =
      `translate3d(${x - W / 2}px, ${y - H / 2}px, 0) scale(${scale}) ` +
      `rotateX(${rx}deg) rotateZ(${rz}deg)`;

    const exploded = b > 0.55;
    stage.classList.toggle('is-exploded', exploded);

    const active = c > 0 && c < 1 ? Math.min(3, Math.floor(c * 4)) : c >= 1 ? -1 : -2;
    const gap = 150 * b;

    layers.frame.style.setProperty('--lz', '0px');
    layers.frame.classList.toggle('is-dim', exploded && active >= 0);
    layers.steps.forEach((el, i) => {
      const lit = active === i;
      const z = LIFT[i] * gap + (lit ? 90 : 0);
      el.style.setProperty('--lz', `${z}px`);
      el.classList.toggle('is-lit', exploded && lit);
      el.classList.toggle('is-dim', exploded && active >= 0 && !lit);
    });

    // Rail fill per step.
    railButtons.forEach((btn, i) => {
      const fill = clamp(c * 4 - i);
      btn.style.setProperty('--fill', fill.toFixed(3));
      btn.setAttribute('aria-current', String(active === i));
    });

    const shown = !exploded ? -2 : active === -1 ? 3 : active;
    if (shown !== current) {
      current = shown;
      captions.forEach((cap, i) => cap.classList.toggle('is-active', i === shown));
    }
  }

  let ticking = false;
  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    },
    { passive: true },
  );

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 80);
  });
  reducedQuery.addEventListener('change', () => {
    root.classList.toggle('motion', !reducedQuery.matches);
    measure();
    demo.restart();
  });
  smallQuery.addEventListener('change', measure);

  railButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.goto);
      const travel = story.offsetHeight - innerHeight;
      const at = STEP_START + ((i + 0.5) / 4) * (STEP_END - STEP_START);
      scrollTo({ top: story.offsetTop + travel * at, behavior: 'smooth' });
    });
  });

  /* ---------------- Live demo inside the window ---------------- */

  const demo = (() => {
    const el = {
      typed: $('[data-typed]'),
      caret: $('[data-caret]'),
      read: $('[data-step-out="read"]'),
      answerLine: $('[data-step-out="answer"]'),
      answer: $('[data-answer]'),
      done: $('[data-step-out="done"]'),
      ring: $('[data-ring]'),
      pct: $('[data-pct]'),
      ctxk: $('[data-ctxk]'),
      files: $('[data-files]'),
      conv: $('[data-conv]'),
      cache: $('[data-cache]'),
      inp: $('[data-in]'),
      inBar: $('[data-in-bar]'),
      out: $('[data-out]'),
      outBar: $('[data-out-bar]'),
      cost: $('[data-cost]'),
      curve: $('[data-curve]'),
      toast: $('[data-toast]'),
      dots: $$('[data-dot]'),
      clocks: [$('[data-clock]'), $('[data-clock-2]')],
    };

    const PROMPT = 'Make the hero window straighten as the page scrolls.';
    const ANSWER =
      'Added a scroll-linked transform in site.js: the window starts tilted back, settles flat as the headline lifts away, and stays still with prefers-reduced-motion.';
    const CURVE_A = 'M0 34 L40 33 L80 31 L120 30 L150 22 L175 26 L200 18 L220 16';
    const CURVE_B = 'M0 34 L40 33 L80 31 L120 30 L150 22 L175 26 L200 18 L220 6';

    let run = 0;
    let visible = true;
    let waiters = [];
    let seconds = 161;

    const state = { pct: 18, ctx: 36, files: 0.4, conv: 1.2, inp: 31, out: 0.7, cost: 0.06, cache: 78 };

    function render() {
      el.pct.textContent = Math.round(state.pct);
      el.ctxk.textContent = Math.round(state.ctx);
      el.ring.setAttribute('stroke-dasharray', `${state.pct.toFixed(1)} 100`);
      el.files.textContent = `${state.files.toFixed(1)}k`;
      el.conv.textContent = `${state.conv.toFixed(1)}k`;
      el.inp.textContent = `${Math.round(state.inp)}k`;
      el.inBar.style.setProperty('--w', clamp(state.inp / 80).toFixed(3));
      el.out.textContent = `${state.out.toFixed(1)}k`;
      el.outBar.style.setProperty('--w', clamp(state.out / 12).toFixed(3));
      el.cost.textContent = state.cost.toFixed(2);
      el.cache.textContent = `${Math.round(state.cache)}%`;
    }

    // Sleeps that pause while the window is off screen and die on restart.
    function wait(ms, id) {
      return new Promise((resolve, reject) => {
        let left = ms;
        let last = performance.now();
        const tick = (now) => {
          if (id !== run) return reject(new Error('stopped'));
          if (visible && !document.hidden) left -= now - last;
          last = now;
          if (left <= 0) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }

    function tween(to, ms, id) {
      const from = { ...state };
      return new Promise((resolve, reject) => {
        let t0 = null;
        const step = (now) => {
          if (id !== run) return reject(new Error('stopped'));
          if (!visible || document.hidden) {
            requestAnimationFrame(step);
            return;
          }
          t0 ??= now;
          const t = expoOut(clamp((now - t0) / ms));
          for (const k of Object.keys(to)) state[k] = lerp(from[k], to[k], t);
          render();
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    }

    function reset() {
      Object.assign(state, { pct: 18, ctx: 36, files: 0.4, conv: 1.2, inp: 31, out: 0.7, cost: 0.06, cache: 78 });
      render();
      el.typed.textContent = '';
      el.answer.textContent = '';
      el.caret.hidden = false;
      el.read.classList.add('is-hidden');
      el.answerLine.classList.add('is-hidden');
      el.done.classList.add('is-hidden');
      el.toast.classList.remove('is-shown');
      el.curve.setAttribute('d', CURVE_A);
      el.dots[1].dataset.status = 'unread';
      el.dots[2].dataset.status = 'working';
    }

    function finalState() {
      Object.assign(state, { pct: 21, ctx: 42, files: 3.1, conv: 2.6, inp: 38, out: 1.9, cost: 0.09, cache: 81 });
      render();
      el.typed.textContent = PROMPT;
      el.answer.textContent = ANSWER;
      el.caret.hidden = true;
      el.read.classList.remove('is-hidden');
      el.answerLine.classList.remove('is-hidden');
      el.done.classList.remove('is-hidden');
      el.toast.classList.add('is-shown');
      el.curve.setAttribute('d', CURVE_B);
      el.dots[1].dataset.status = 'waiting';
      el.dots[2].dataset.status = 'unread';
    }

    async function loop(id) {
      while (id === run) {
        reset();
        await wait(1400, id);
        for (let i = 1; i <= PROMPT.length; i++) {
          el.typed.textContent = PROMPT.slice(0, i);
          await wait(PROMPT[i - 1] === ' ' ? 70 : 28 + Math.random() * 40, id);
        }
        await wait(500, id);
        el.caret.hidden = true;
        el.dots[2].dataset.status = 'working';
        await wait(700, id);
        el.read.classList.remove('is-hidden');
        await tween({ pct: 20, ctx: 40, files: 3.1, inp: 36, cost: 0.07, cache: 80 }, 900, id);
        await wait(600, id);
        el.answerLine.classList.remove('is-hidden');
        const words = ANSWER.split(' ');
        let text = '';
        const grow = tween({ pct: 21, ctx: 42, conv: 2.6, inp: 38, out: 1.9, cost: 0.09, cache: 81 }, 2600, id);
        for (const w of words) {
          text += (text ? ' ' : '') + w;
          el.answer.textContent = text;
          await wait(45 + Math.random() * 45, id);
        }
        await grow;
        el.curve.setAttribute('d', CURVE_B);
        el.done.classList.remove('is-hidden');
        el.dots[2].dataset.status = 'unread';
        await wait(1300, id);
        el.dots[1].dataset.status = 'waiting';
        el.toast.classList.add('is-shown');
        await wait(4200, id);
        el.toast.classList.remove('is-shown');
        await wait(2400, id);
      }
    }

    function start() {
      const id = ++run;
      if (reducedQuery.matches) {
        finalState();
        return;
      }
      loop(id).catch(() => {});
    }

    setInterval(() => {
      if (!visible || document.hidden || reducedQuery.matches) return;
      seconds++;
      const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const mm = String(Math.floor(seconds / 60) % 60).padStart(2, '0');
      const ss = String(seconds % 60).padStart(2, '0');
      for (const c of el.clocks) c.textContent = `${hh}:${mm}:${ss}`;
    }, 1000);

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }).observe(win);

    return {
      restart: start,
      start,
      finalState,
    };
  })();

  /* ---------------- Reveals ---------------- */

  const revealer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealer.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -15% 0px' },
  );
  $$('[data-reveal]').forEach((n) => revealer.observe(n));

  /* ---------------- Copy buttons ---------------- */

  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.append(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      btn.classList.add('is-copied');
      const status = $('[data-copy-status]', btn);
      if (status) status.textContent = 'Copied';
      if (btn.classList.contains('copy')) btn.textContent = 'Copied';
      clearTimeout(btn._t);
      btn._t = setTimeout(() => {
        btn.classList.remove('is-copied');
        if (status) status.textContent = '';
        if (btn.classList.contains('copy')) btn.textContent = 'Copy';
      }, 1800);
    });
  });

  /* ---------------- Install tabs ---------------- */

  const tabs = $('[data-tabs]');
  if (tabs) {
    const buttons = $$('[role="tab"]', tabs);
    const ink = $('[data-ink]', tabs);
    const moveInk = (btn) => {
      ink.style.transform = `translateX(${btn.offsetLeft}px) scaleX(${btn.offsetWidth / 100})`;
    };
    const select = (btn, focus) => {
      for (const b of buttons) {
        const on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        $(`#${b.getAttribute('aria-controls')}`).hidden = !on;
      }
      moveInk(btn);
      if (focus) btn.focus();
    };
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => select(b));
      b.addEventListener('keydown', (e) => {
        const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Home') select(buttons[0], true);
        else if (e.key === 'End') select(buttons.at(-1), true);
        else if (dir) select(buttons[(i + dir + buttons.length) % buttons.length], true);
        else return;
        e.preventDefault();
      });
    });
    const syncInk = () => moveInk(buttons.find((b) => b.getAttribute('aria-selected') === 'true'));
    document.fonts?.ready.then(syncInk);
    addEventListener('resize', syncInk);
    syncInk();
  }

  /* ---------------- Latest version ---------------- */

  function showVersion(tag) {
    if (!tag) return;
    const clean = tag.replace(/^v/, '');
    $$('[data-version]').forEach((n) => {
      n.textContent = `v${clean}`;
      n.hidden = false;
    });
    $$('[data-version-raw]').forEach((n) => (n.textContent = clean));
  }

  (async () => {
    let tag = null;
    try {
      tag = sessionStorage.getItem('anthra-tag');
    } catch {}
    if (!tag) {
      try {
        const res = await fetch('https://api.github.com/repos/iFrosty-tech/anthra/releases/latest', {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (res.ok) {
          tag = (await res.json()).tag_name;
          try {
            sessionStorage.setItem('anthra-tag', tag);
          } catch {}
        }
      } catch {}
    }
    showVersion(tag);
  })();

  /* ---------------- Go ---------------- */

  measure();
  document.fonts?.ready.then(measure);
  demo.start();
})();
