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
  const hintView = $('[data-hint-view]');

  // The steps, in the order the captions tell them.
  const STEPS = ['tabs', 'conv', 'term', 'panel', 'toast'];
  const N = STEPS.length;
  const plates = Object.fromEntries(['frame', ...STEPS].map((k) => [k, $(`[data-layer="${k}"]`)]));
  const leads = STEPS.map((k) => $$(`[data-lead="${k}"]`));

  // Height above the frame, in gaps: the terminal sits lowest, the conversation right over it.
  const LIFT = { term: 1, conv: 2, panel: 1.5, tabs: 3, toast: 4 };
  // What the camera leans towards when a step is lit, in window pixels.
  const FOCUS = { tabs: [600, 52], conv: [440, 380], term: [440, 420], panel: [1040, 380], toast: [1008, 650] };

  const STEP_START = 0.34;
  const STEP_END = 0.95;

  // How far the exploded stack reaches left and right of its centre, in window widths at its scale.
  const REACH_L = 0.6;
  const REACH_R = 0.76;

  let pinned = false;
  let heroBottom = 0;
  let captionsRight = 0;
  let shownCaption = -2;
  let view = 'chat';

  // Style writes skip values that have not changed: most frames of the story move only a few of them.
  let written = new Map();
  function put(el, prop, value) {
    let seen = written.get(el);
    if (!seen) written.set(el, (seen = {}));
    if (seen[prop] === value) return;
    seen[prop] = value;
    if (prop.startsWith('--')) el.style.setProperty(prop, value);
    else el.style[prop] = value;
  }

  function isStatic() {
    return reducedQuery.matches || smallQuery.matches;
  }

  function setView(next) {
    if (next === view) return;
    view = next;
    win.dataset.view = next;
    hintView.textContent = next === 'chat' ? 'terminal' : 'conversation';
  }

  function measure() {
    written = new Map();
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
    captionsRight = $('[data-captions]').getBoundingClientRect().right;
    update();
  }

  function layoutStatic() {
    const width = viewport.clientWidth;
    const s = width / W;
    viewport.style.setProperty('--vh-static', `${Math.round(H * s)}px`);
    win.style.transform = `scale(${s})`;
    win.style.transformOrigin = '0 0';
    // What the pinned story set on the hero would outlive it here.
    for (const prop of ['opacity', 'transform', 'visibility']) hero.style[prop] = '';
    for (const el of Object.values(plates)) {
      el.style.setProperty('--lz', '0px');
      el.style.opacity = '';
      el.classList.remove('is-lit');
    }
    plates.conv.style.removeProperty('--solid');
    plates.conv.style.removeProperty('--ink');
    setView('chat');
    captions.forEach((c) => c.classList.remove('is-active'));
    shownCaption = -2;
  }

  function progress() {
    const rect = story.getBoundingClientRect();
    const travel = rect.height - innerHeight;
    return travel > 0 ? clamp(-rect.top / travel) : 0;
  }

  // How lit step i is at position u (0..N along the steps): full across its middle, crossfading at the edges.
  function weight(u, i) {
    const d = Math.abs(u - (i + 0.5));
    return smooth(clamp(1 - (d - 0.3) / 0.4));
  }

  // The pointer leans the exploded window a little, eased.
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };

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
    // How much the steps have taken over: rises as the layers finish separating.
    const on = smooth(range(p, STEP_START - 0.05, STEP_START + 0.01));

    put(hero, 'opacity', clamp(1 - a * 1.6).toFixed(3));
    put(hero, 'transform', `translate(-50%, ${(-a * 90).toFixed(1)}px)`);
    put(hero, 'visibility', a > 0.7 ? 'hidden' : 'visible');
    put(note, '--note', (clamp(a * 3 - 2) * clamp(1 - b * 3)).toFixed(3));
    put(stage, '--grid', (0.35 + b * 0.5).toFixed(3));

    const u = clamp(c * N, 0.2, N - 0.2);
    const w = STEPS.map((_, i) => weight(u, i) * on);
    const lit = Object.fromEntries(STEPS.map((k, i) => [k, w[i]]));

    const fit = Math.min((vw - 96) / W, (vh - 150) / H, 1.08);
    const wide = vw > 1080;

    const s0 = fit * 0.98;
    const y0 = heroBottom + 44 + (H * s0) / 2;
    const y1 = vh / 2 + 24;
    const sA = fit * 0.94;

    // Exploded, the window keeps clear of the captions: as far right as its left reach needs, and
    // smaller when the room between the captions and the edge is short.
    const room = vw - 16 - (captionsRight + 24);
    const sB = Math.min(fit * (wide ? 0.5 : 0.46), room / ((REACH_L + REACH_R) * W * 1.04));
    const reach = W * sB * 1.04;
    const xB = Math.min(Math.max(vw * 0.6, captionsRight + 24 + REACH_L * reach), vw - 16 - REACH_R * reach);
    const yB = vh / 2 + 52;

    // The camera leans towards the lit layer and comes a little closer; never left, where the captions are.
    let fx = 0;
    let fy = 0;
    STEPS.forEach((k, i) => {
      fx += w[i] * (FOCUS[k][0] - W / 2);
      fy += w[i] * (FOCUS[k][1] - H / 2);
    });
    const scale = lerp(lerp(s0, sA, a), sB, b) * (1 + 0.04 * on);
    const x = lerp(vw / 2, xB, b);
    const y = lerp(lerp(y0, y1, a), yB, b);
    const drift = (c - 0.5) * 6 * on;
    const rx = lerp(26, 0, a) + b * 50;
    const rz = b * (-26 + drift);

    put(win, 'transformOrigin', '50% 50%');
    put(
      win,
      'transform',
        `translate3d(${(x - W / 2).toFixed(1)}px, ${(y - H / 2).toFixed(1)}px, 0) ` +
        `rotateY(${(lean.x * 5 * b).toFixed(3)}deg) rotateX(${(-lean.y * 4 * b).toFixed(3)}deg) ` +
        `scale(${scale.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) ` +
        `translate3d(${(-Math.min(0, fx) * 0.14).toFixed(1)}px, ${(-fy * 0.24).toFixed(1)}px, 0)`,
    );

    const exploded = b > 0.55;
    stage.classList.toggle('is-exploded', exploded);

    // Heights: each layer at its place in the stack, the lit one raised further. Looking at the
    // terminal lifts the conversation off it like a lid and thins it to glass.
    const gap = 125 * b;
    const z = {};
    for (const k of STEPS) z[k] = LIFT[k] * gap + 64 * lit[k];
    z.conv += 140 * lit.term;
    const dim = (k) => lerp(1, lerp(0.36, 1, lit[k]), on);

    put(plates.frame, '--lz', '0px');
    put(plates.frame, 'opacity', lerp(1, 0.55, on).toFixed(3));
    STEPS.forEach((k, i) => {
      const el = plates[k];
      put(el, '--lz', `${z[k].toFixed(1)}px`);
      put(el, 'opacity', k === 'conv' ? '1' : dim(k).toFixed(3));
      el.classList.toggle('is-lit', exploded && w[i] > 0.5);
      const lo = (b * (0.3 + 0.7 * lit[k])).toFixed(3);
      for (const line of leads[i]) {
        put(line, '--s', (z[k] / 100).toFixed(3));
        put(line, '--lo', lo);
      }
    });
    // The conversation dims its ink like the others; looking underneath turns it to glass, the outline
    // kept and the fill all but gone.
    const glass = lit.term;
    put(plates.conv, '--solid', lerp(1, 0.04, glass).toFixed(3));
    put(plates.conv, '--ink', lerp(dim('conv'), 0.07, glass).toFixed(3));
    setView(glass > 0.5 ? 'terminal' : 'chat');

    let active = -1;
    w.forEach((v, i) => {
      if (v > 0.5) active = i;
    });

    // Rail fill per step.
    railButtons.forEach((btn, i) => {
      put(btn, '--fill', clamp(c * N - i).toFixed(3));
      btn.setAttribute('aria-current', String(active === i));
    });

    const shown = exploded ? (active >= 0 ? active : c >= 1 ? N - 1 : 0) : -2;
    if (shown !== shownCaption) {
      shownCaption = shown;
      captions.forEach((cap, i) => cap.classList.toggle('is-active', i === shown));
    }
  }

  // One frame at a time, for the scroll and for the pointer's easing.
  let frameId = 0;
  function frame() {
    frameId = 0;
    lean.x += (lean.tx - lean.x) * 0.08;
    lean.y += (lean.ty - lean.y) * 0.08;
    update();
    if (Math.abs(lean.tx - lean.x) + Math.abs(lean.ty - lean.y) > 0.002) kick();
  }
  function kick() {
    if (!frameId) frameId = requestAnimationFrame(frame);
  }

  addEventListener('scroll', kick, { passive: true });

  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  stage.addEventListener('pointermove', (e) => {
    if (!pinned || !finePointer.matches || e.pointerType !== 'mouse') return;
    lean.tx = clamp(e.clientX / innerWidth, 0, 1) - 0.5;
    lean.ty = clamp(e.clientY / innerHeight, 0, 1) - 0.5;
    kick();
  });
  stage.addEventListener('pointerleave', () => {
    lean.tx = 0;
    lean.ty = 0;
    kick();
  });

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
      const at = STEP_START + ((i + 0.5) / N) * (STEP_END - STEP_START);
      scrollTo({ top: story.offsetTop + travel * at, behavior: 'smooth' });
    });
  });

  /* ---------------- Live demo inside the window ---------------- */

  // One turn, shown twice: the conversation builds it from the transcript while Claude Code
  // prints it in the terminal underneath.
  const demo = (() => {
    const el = {
      // Conversation
      cTurn: $('[data-c-turn]'),
      ask: $('[data-c-ask]'),
      cRead: $('[data-c-read]'),
      edit: $('[data-c-edit]'),
      counts: $('[data-c-counts]'),
      meta: $('[data-c-meta]'),
      answer: $('[data-c-answer]'),
      words: $$('[data-c-answer] > span'),
      foot: $('[data-c-foot]'),
      working: $('[data-c-working]'),
      hint: $('[data-c-hint]'),
      secs: $('[data-c-secs]'),
      typed: $('[data-c-typed]'),
      ph: $('[data-c-ph]'),
      send: $('[data-c-send]'),
      tokens: $('[data-c-tokens]'),
      // Terminal
      tTurn: $('[data-t-turn]'),
      tPrompt: $('[data-t-prompt]'),
      tSaid: $('[data-t-said]'),
      tRead: $('[data-t-read]'),
      tEdit: $('[data-t-edit]'),
      tEdited: $('[data-t-edited]'),
      tAnswer: $('[data-t-answer]'),
      tWords: $('[data-t-words]'),
      tDone: $('[data-t-done]'),
      tSecs: $('[data-t-secs]'),
      tInput: $('[data-t-input]'),
      tPh: $('[data-t-ph]'),
      // Around them
      ring: $('[data-ring]'),
      pct: $('[data-pct]'),
      sbPct: $('[data-sb-pct]'),
      ctxk: $('[data-ctxk]'),
      lim: $('[data-lim]'),
      limBar: $('[data-lim-bar]'),
      cost: $('[data-cost]'),
      curve: $('[data-curve]'),
      trend: $('[data-trend]'),
      forecast: $('[data-forecast]'),
      turn: $('[data-turn]'),
      add: $('[data-add]'),
      del: $('[data-del]'),
      dirty: $('[data-dirty]'),
      toast: $('[data-toast]'),
      dots: $$('[data-dot]'),
      clocks: [$('[data-clock]'), $('[data-clock-2]')],
    };

    const PROMPT = 'Make the hero window straighten as the page scrolls.';
    const ANSWER = el.words.map((w) => w.textContent).join(' ');
    const CURVE_A = 'M0 34 L40 33 L80 31 L120 30 L150 22 L175 26 L200 18 L220 16';
    const CURVE_B = 'M0 34 L40 33 L80 31 L120 30 L150 22 L175 26 L200 18 L220 6';
    // Context after each turn, with one compaction; the finished turn adds the last point.
    const TREND_A = 'M0 34 L20 29.2 L40 24.4 L60 19.6 L80 14 L100 8.4 L100 33.2 L120 30 L140 26.8 L160 23.6 L180 21.2 L200 18.8';
    const TREND_B = `${TREND_A} L220 16.4`;

    const START = { pct: 58, ctx: 116, cost: 0.06, lim: 31 };
    const END = { pct: 64, ctx: 128, cost: 0.09, lim: 33 };

    let run = 0;
    let visible = true;
    let seconds = 161;
    // Time that has passed on screen: the turn's stopwatch counts only this.
    let shownMs = 0;

    const state = { ...START };

    const off = (node, hidden) => node.classList.toggle('is-off', hidden);

    function render() {
      el.pct.textContent = Math.round(state.pct);
      el.sbPct.textContent = `${Math.round(state.pct)}%`;
      el.ctxk.textContent = Math.round(state.ctx);
      el.ring.setAttribute('stroke-dasharray', `${state.pct.toFixed(1)} 100`);
      el.lim.textContent = Math.round(state.lim);
      el.limBar.style.setProperty('--w', clamp(state.lim / 100).toFixed(3));
      el.cost.textContent = state.cost.toFixed(2);
    }

    function turnEnd(done) {
      el.curve.setAttribute('d', done ? CURVE_B : CURVE_A);
      el.trend.setAttribute('d', done ? TREND_B : TREND_A);
      el.forecast.textContent = done ? 'in ~4 turns' : 'in ~5 turns';
      el.turn.textContent = done ? '12' : '11';
    }

    function edited(done) {
      el.add.textContent = done ? '+216' : '+214';
      el.del.textContent = done ? '−39' : '−38';
      off(el.dirty, !done);
    }

    function compose(text) {
      el.typed.textContent = text;
      off(el.ph, text.length > 0);
      el.send.classList.toggle('is-ready', text.length > 0);
      // The composer's estimate: about four characters to a token.
      el.tokens.textContent = text ? `~${Math.max(1, Math.round(text.length / 4))} token` : '';
    }

    function termInput(text) {
      el.tInput.textContent = text;
      off(el.tPh, text.length > 0);
    }

    function stopwatch(ms) {
      const s = Math.floor(ms / 1000);
      el.secs.textContent = `${s} s`;
      return s;
    }

    // Sleeps that pause while the window is off screen and die on restart.
    function wait(ms, id, onTick) {
      return new Promise((resolve, reject) => {
        let left = ms;
        let last = performance.now();
        const tick = (now) => {
          if (id !== run) return reject(new Error('stopped'));
          if (visible && !document.hidden) {
            left -= now - last;
            shownMs += now - last;
          }
          last = now;
          onTick?.();
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
      Object.assign(state, START);
      render();
      el.cTurn.classList.remove('is-leaving');
      el.tTurn.classList.remove('is-leaving');
      off(el.cTurn, true);
      for (const n of [el.ask, el.cRead, el.edit, el.counts, el.answer, el.foot]) off(n, true);
      for (const n of [el.tPrompt, el.tRead, el.tEdit, el.tEdited, el.tAnswer, el.tDone]) off(n, true);
      el.edit.classList.remove('is-running', 'is-done');
      el.meta.textContent = '';
      el.words.forEach((w) => w.classList.remove('on'));
      off(el.working, false);
      off(el.hint, false);
      el.secs.textContent = '0 s';
      el.tSaid.textContent = '';
      el.tWords.textContent = '';
      compose('');
      termInput('');
      el.toast.classList.remove('is-shown');
      turnEnd(false);
      edited(false);
      delete el.dots[0].dataset.status;
      el.dots[1].dataset.status = 'unread';
      el.dots[2].dataset.status = 'working';
    }

    function finalState() {
      Object.assign(state, END);
      render();
      el.cTurn.classList.remove('is-leaving');
      el.tTurn.classList.remove('is-leaving');
      off(el.cTurn, false);
      for (const n of [el.ask, el.cRead, el.edit, el.counts, el.answer, el.foot]) off(n, false);
      for (const n of [el.tPrompt, el.tRead, el.tEdit, el.tEdited, el.tAnswer, el.tDone]) off(n, false);
      el.edit.classList.remove('is-running');
      el.edit.classList.add('is-done');
      el.meta.textContent = '0.1 s';
      el.words.forEach((w) => w.classList.add('on'));
      off(el.working, true);
      off(el.hint, true);
      el.secs.textContent = '9 s';
      el.tSecs.textContent = '9';
      el.tSaid.textContent = PROMPT;
      el.tWords.textContent = ANSWER;
      compose('');
      termInput('');
      el.toast.classList.add('is-shown');
      turnEnd(true);
      edited(true);
      delete el.dots[0].dataset.status;
      el.dots[1].dataset.status = 'waiting';
      el.dots[2].dataset.status = 'working';
    }

    async function loop(id) {
      while (id === run) {
        reset();
        await wait(1200, id);

        // Written in the composer…
        for (let i = 1; i <= PROMPT.length; i++) {
          compose(PROMPT.slice(0, i));
          await wait(PROMPT[i - 1] === ' ' ? 70 : 26 + Math.random() * 40, id);
        }
        await wait(420, id);
        el.send.classList.add('is-pressed');
        await wait(140, id);
        el.send.classList.remove('is-pressed');
        compose('');

        // …typed into Claude Code, keystroke by keystroke, then entered.
        for (let i = 1; i <= PROMPT.length; i += 3) {
          termInput(PROMPT.slice(0, i + 2));
          await wait(16, id);
        }
        await wait(120, id);
        termInput('');
        el.tSaid.textContent = PROMPT;
        off(el.tPrompt, false);
        off(el.cTurn, false);
        off(el.ask, false);
        off(el.foot, false);
        el.dots[0].dataset.status = 'working';
        const started = shownMs;
        const clock = () => stopwatch(shownMs - started);

        await wait(800, id, clock);
        off(el.cRead, false);
        off(el.tRead, false);
        await tween({ pct: 61, ctx: 122, cost: 0.07, lim: 32 }, 900, id);

        await wait(300, id, clock);
        el.edit.classList.add('is-running');
        el.meta.textContent = 'running';
        off(el.edit, false);
        off(el.tEdit, false);
        await wait(1100, id, clock);
        el.edit.classList.remove('is-running');
        el.edit.classList.add('is-done');
        el.meta.textContent = '0.1 s';
        off(el.counts, false);
        off(el.tEdited, false);
        edited(true);

        await wait(900, id, clock);
        off(el.answer, false);
        off(el.tAnswer, false);
        const grow = tween(END, 2600, id);
        let text = '';
        for (const w of el.words) {
          w.classList.add('on');
          text += (text ? ' ' : '') + w.textContent;
          el.tWords.textContent = text;
          await wait(50 + Math.random() * 50, id, clock);
        }
        await grow;

        const secs = Math.max(1, clock());
        off(el.working, true);
        off(el.hint, true);
        el.tSecs.textContent = String(secs);
        off(el.tDone, false);
        turnEnd(true);
        delete el.dots[0].dataset.status;

        await wait(1300, id);
        el.dots[1].dataset.status = 'waiting';
        el.toast.classList.add('is-shown');
        await wait(4200, id);
        el.toast.classList.remove('is-shown');
        await wait(2200, id);
        el.cTurn.classList.add('is-leaving');
        el.tTurn.classList.add('is-leaving');
        await wait(500, id);
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

  /* ---------------- Panel playground: resize, fold, move ---------------- */

  const play = $('[data-play]');
  if (play) {
    const frame = $('[data-play-stage]', play);
    const edge = $('[data-edge]', play);
    const readout = $('[data-width]', play);
    const mini = $('[data-mini]', play);
    const list = $('[data-mini-list]', play);
    const MIN = 240;
    const DEFAULT = 300;
    const WIDE = 440;
    let width = DEFAULT;

    // As in the app: up to 640 px, and here never wider than the frame allows.
    const maxWidth = () => Math.max(MIN, Math.min(640, frame.clientWidth - 48));

    function setWidth(w) {
      width = Math.round(clamp(w, MIN, maxWidth()));
      frame.style.setProperty('--pw', `${width}px`);
      mini.classList.toggle('is-wide', width >= WIDE);
      readout.textContent = `${width} px`;
      edge.setAttribute('aria-valuenow', String(width));
      edge.setAttribute('aria-valuemax', String(maxWidth()));
      edge.setAttribute('aria-valuetext', `${width} pixels`);
    }

    edge.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      edge.setPointerCapture(e.pointerId);
      edge.classList.add('is-drag');
      const right = frame.getBoundingClientRect().right;
      const move = (ev) => setWidth(right - ev.clientX);
      const stop = () => {
        edge.classList.remove('is-drag');
        edge.removeEventListener('pointermove', move);
        edge.removeEventListener('pointerup', stop);
        edge.removeEventListener('pointercancel', stop);
      };
      edge.addEventListener('pointermove', move);
      edge.addEventListener('pointerup', stop);
      edge.addEventListener('pointercancel', stop);
    });
    edge.addEventListener('dblclick', () => setWidth(DEFAULT));
    edge.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 64 : 16;
      // The panel sits on the right: moving its edge left makes it wider.
      if (e.key === 'ArrowLeft') setWidth(width + step);
      else if (e.key === 'ArrowRight') setWidth(width - step);
      else if (e.key === 'Home') setWidth(DEFAULT);
      else return;
      e.preventDefault();
    });

    // Move a section and let the others glide into place.
    function moveSection(sec, dir) {
      const secs = $$('[data-sec]', list);
      const i = secs.indexOf(sec);
      const j = i + dir;
      if (j < 0 || j >= secs.length) return;
      const before = new Map(secs.map((s) => [s, s.getBoundingClientRect().top]));
      if (dir < 0) list.insertBefore(sec, secs[j]);
      else list.insertBefore(sec, secs[j].nextSibling);
      if (reducedQuery.matches) return;
      for (const s of secs) {
        const dy = before.get(s) - s.getBoundingClientRect().top;
        if (!dy) continue;
        s.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
          duration: 450,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        });
      }
    }

    $$('.mini-h', list).forEach((btn) => {
      const sec = btn.closest('[data-sec]');
      btn.addEventListener('click', () => {
        const folded = sec.classList.toggle('is-folded');
        btn.setAttribute('aria-expanded', String(!folded));
      });
      btn.addEventListener('keydown', (e) => {
        if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
        e.preventDefault();
        moveSection(sec, e.key === 'ArrowUp' ? -1 : 1);
        btn.focus();
      });
    });

    addEventListener('resize', () => setWidth(width));
    setWidth(DEFAULT);
  }

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
