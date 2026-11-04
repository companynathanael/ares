/* =====================================================================
   ARES · animação de entrada
   1. linha de energia liga a tela
   2. partículas vêm em espiral e montam a logo (amostrada do próprio SVG)
   3. anéis HUD se desenham, log de boot e progresso
   4. logo sólida com falha digital + nome decodificado
   5. onda de choque abre um buraco e revela a Ares
   Pula com clique, Esc, Enter ou espaço. Toca uma vez por sessão.
   ===================================================================== */
(function () {
  const root = document.documentElement;
  const el = document.getElementById('intro');
  if (!el) return;

  const lp = document.getElementById('logoPath');
  if (lp && !lp.getAttribute('d')) lp.setAttribute('d', window.ARES_LOGO_PATH);
  const $ = s => el.querySelector(s);
  const cv = $('#introCanvas'), ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, DPR, CX, CY, LW, LH, parts = [], raf = 0, t0 = 0, state = 'idle', exitAt = 0, timers = [];

  const accentRGB = () => getComputedStyle(root).getPropertyValue('--accent-rgb').trim() || '34,230,255';
  const ease = {
    outQuart: t => 1 - Math.pow(1 - t, 4),
    inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inCubic: t => t * t * t
  };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  /* ---------- geometria: onde a logo fica na tela ---------- */
  function layout() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    LH = Math.min(H * .36, W * .5, 340); LW = LH * 721 / 885;
    CX = W / 2; CY = H * .44;
    el.style.setProperty('--lw', LW + 'px'); el.style.setProperty('--lh', LH + 'px');
    el.style.setProperty('--cy', CY + 'px');
  }

  /* ---------- partículas amostradas do desenho da logo ---------- */
  function sample() {
    const w = Math.ceil(LW), h = Math.ceil(LH);
    const off = document.createElement('canvas'); off.width = w; off.height = h;
    const o = off.getContext('2d');
    o.scale(w / 721, h / 885); o.fill(new Path2D(window.ARES_LOGO_PATH), 'evenodd');
    const data = o.getImageData(0, 0, w, h).data;
    const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] > 120;
    const gap = W < 700 ? 3.4 : 2.8, pts = [];
    for (let y = 0; y < h; y += gap) for (let x = 0; x < w; x += gap) {
      const jx = Math.round(x + (Math.random() - .5) * gap * .6), jy = Math.round(y + (Math.random() - .5) * gap * .6);
      if (!inside(jx, jy)) continue;
      const g = Math.ceil(gap * 1.2);
      const edge = !inside(jx + g, jy) || !inside(jx - g, jy) || !inside(jx, jy + g) || !inside(jx, jy - g);
      pts.push({ x: jx, y: jy, edge });
    }
    const max = W < 700 ? 1500 : 2600;
    while (pts.length > max) pts.splice(Math.floor(Math.random() * pts.length), 1);

    const R = Math.hypot(W, H) * .62;
    parts = pts.map(p => {
      const tx = CX - LW / 2 + p.x, ty = CY - LH / 2 + p.y;
      const ta = Math.atan2(ty - CY, tx - CX), tr = Math.hypot(tx - CX, ty - CY);
      const a0 = Math.random() * Math.PI * 2, r0 = R * (.75 + Math.random() * .5);
      const sweep = ((ta + Math.PI) / (Math.PI * 2));         // monta em varredura circular
      return {
        tx, ty, tr, ta, a0, r0,
        swirl: (Math.random() < .5 ? -1 : 1) * (1.4 + Math.random() * 1.6),
        delay: 450 + sweep * 650 + Math.random() * 380,
        dur: 1050 + Math.random() * 520,
        size: p.edge ? 1.7 : 1.15 + Math.random() * .5,
        edge: p.edge, ph: Math.random() * 6.28, px: null, py: null,
        vx: 0, vy: 0
      };
    });
  }

  /* ---------- quadro a quadro ---------- */
  function frame(now) {
    const t = now - t0, rgb = accentRGB();
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const solid = clamp((t - 2250) / 600);               // quando a logo sólida entra, partículas recuam
    const exiting = state === 'exit', ke = exiting ? clamp((now - exitAt) / 900) : 0;

    for (const p of parts) {
      let x, y, k = clamp((t - p.delay) / p.dur), alpha;
      if (exiting) {
        // explosão radial a partir do centro
        if (p.vx === 0 && p.vy === 0) {
          const d = Math.hypot(p.tx - CX, p.ty - CY) || 1, sp = 6 + Math.random() * 14;
          p.vx = (p.tx - CX) / d * sp; p.vy = (p.ty - CY) / d * sp; p.x = p.px ?? p.tx; p.y = p.py ?? p.ty;
        }
        p.x += p.vx; p.y += p.vy; p.vx *= 1.04; p.vy *= 1.04;
        x = p.x; y = p.y; alpha = (1 - ke) * .9;
      } else if (k <= 0) continue;
      else {
        const e = ease.outQuart(k);
        const r = p.r0 + (p.tr - p.r0) * e;
        const a = p.a0 + (p.ta - p.a0) * e + p.swirl * (1 - e) * (1 - e);
        x = CX + Math.cos(a) * r; y = CY + Math.sin(a) * r;
        if (k >= 1) { x = p.tx + Math.sin(t / 380 + p.ph) * .35; y = p.ty + Math.cos(t / 420 + p.ph) * .35; }
        const shimmer = .75 + .25 * Math.sin(t / 140 + p.ph * 3);
        alpha = (k < 1 ? .35 + .65 * k : shimmer) * (1 - solid * .82);
      }
      // rastro de velocidade
      if (p.px != null && !exiting && k < 1) {
        // rastro limitado: em telas/PCs lentos o salto entre quadros não vira uma linha atravessando a tela
        let dx = p.px - x, dy = p.py - y; const d = Math.hypot(dx, dy), m = 46;
        if (d > m) { dx *= m / d; dy *= m / d; }
        ctx.strokeStyle = `rgba(${rgb},${alpha * .55})`; ctx.lineWidth = p.size * .9;
        ctx.beginPath(); ctx.moveTo(x + dx, y + dy); ctx.lineTo(x, y); ctx.stroke();
      } else if (exiting && p.px != null) {
        ctx.strokeStyle = `rgba(${rgb},${alpha * .6})`; ctx.lineWidth = p.size;
        ctx.beginPath(); ctx.moveTo(x - p.vx * 2.2, y - p.vy * 2.2); ctx.lineTo(x, y); ctx.stroke();
      }
      ctx.fillStyle = p.edge ? `rgba(255,255,255,${alpha})` : `rgba(${rgb},${alpha})`;
      ctx.fillRect(x - p.size / 2, y - p.size / 2, p.size, p.size);
      p.px = x; p.py = y;
    }
    // núcleo de luz no centro durante a montagem
    const core = clamp((t - 300) / 500) * (1 - clamp((t - 1900) / 700)) * (1 - ke);
    if (core > 0) {
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, LH * .9);
      g.addColorStop(0, `rgba(${rgb},${.35 * core})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.fillRect(CX - LH, CY - LH, LH * 2, LH * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (state !== 'done') raf = requestAnimationFrame(frame);
  }

  /* ---------- textos: log de boot, progresso, decodificação ---------- */
  const GLYPHS = '01#%&@$<>/\\|=+*ΔΣΞΛΩ▲◆●■ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function decode(node, text, ms, delay) {
    node.textContent = '';
    timers.push(setTimeout(() => {
      const start = performance.now();
      (function tick(n) {
        if (state === 'done') return;
        const k = clamp((n - start) / ms);
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') { out += ' '; continue; }
          out += k * text.length > i + .5 ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        node.textContent = out;
        if (k < 1) requestAnimationFrame(tick);
      })(start);
    }, delay));
  }
  function bootLog() {
    const theme = (root.dataset.theme || 'ciano').toUpperCase();
    const lines = [
      ['INICIALIZANDO NÚCLEO TÁTICO', 'OK'],
      ['MONTANDO MATRIZ DE PARTÍCULAS', 'OK'],
      ['CARREGANDO MODOS DE BATALHA', '06'],
      ['CALIBRANDO NÍVEIS DE FÚRIA', '05'],
      ['SINCRONIZANDO TEMA', theme],
      ['SISTEMA PRONTO', '▲']
    ];
    const box = $('#introLog'); box.innerHTML = '';
    lines.forEach((l, i) => timers.push(setTimeout(() => {
      const row = document.createElement('div');
      row.innerHTML = `<span>${l[0]}</span><i></i><b>${l[1]}</b>`;
      box.append(row);
    }, 260 + i * 470)));
    // porcentagem com pequenos travamentos, como carga real
    const pct = $('#introPct'), bar = $('#introBar'), start = performance.now(), total = 3300;
    (function tick(n) {
      if (state === 'done') return;
      const raw = clamp((n - start) / total);
      const v = Math.floor(ease.inOut(raw) * 100 - (Math.sin(raw * 23) > .85 ? 3 : 0));
      const c = clamp(v, 0, 100);
      pct.textContent = String(c).padStart(3, '0'); bar.style.transform = `scaleX(${c / 100})`;
      if (raw < 1) requestAnimationFrame(tick); else { pct.textContent = '100'; bar.style.transform = 'scaleX(1)'; }
    })(start);
    // fluxo de dados no canto
    const hex = $('#introHex');
    const iv = setInterval(() => {
      if (state === 'done') return clearInterval(iv);
      hex.textContent = Array.from({ length: 4 }, () => '0x' + Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0')).join('  ');
    }, 90);
    timers.push(iv);
  }

  /* ---------- anéis HUD: marcações geradas ---------- */
  function ticks() {
    const g = $('#introTicks'); if (g.childElementCount) return;
    for (let i = 0; i < 90; i++) {
      const a = i / 90 * Math.PI * 2, long = i % 15 === 0, r1 = 186, r2 = long ? 172 : 180;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', 200 + Math.cos(a) * r1); l.setAttribute('y1', 200 + Math.sin(a) * r1);
      l.setAttribute('x2', 200 + Math.cos(a) * r2); l.setAttribute('y2', 200 + Math.sin(a) * r2);
      l.style.animationDelay = (1000 + i * 9) + 'ms';
      if (long) l.classList.add('long');
      g.append(l);
    }
  }

  /* ---------- ciclo ---------- */
  function play() {
    if (state === 'running') return;
    timers.forEach(clearTimeout); timers = [];
    state = 'running';
    try { sessionStorage.setItem('ares.introSeen', '1'); } catch {}
    root.classList.add('intro-on'); root.classList.remove('no-intro');
    el.hidden = false; el.className = 'intro run';
    layout(); sample(); ticks(); bootLog();
    decode($('#introWord'), 'ARES', 900, 2500);
    decode($('#introTag'), 'ESTRATÉGIA · FORÇA · PRECISÃO', 900, 2900);
    t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    timers.push(setTimeout(exit, 4100));
    addEventListener('keydown', onKey, true);
  }
  function exit() {
    if (state !== 'running') return;
    state = 'exit'; exitAt = performance.now();
    el.classList.add('exit');
    // libera a interface por baixo um pouco antes do fim, para a revelação já mostrá-la animando
    timers.push(setTimeout(() => root.classList.remove('intro-on'), 250));
    timers.push(setTimeout(done, 1050));
  }
  function done() {
    state = 'done'; cancelAnimationFrame(raf);
    timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
    el.hidden = true; el.className = 'intro';
    root.classList.remove('intro-on'); root.classList.add('no-intro');
    removeEventListener('keydown', onKey, true);
    ctx.clearRect(0, 0, W, H); parts = [];
    dispatchEvent(new CustomEvent('ares:intro-done'));
  }
  function onKey(e) {
    if (['Escape', 'Enter', ' '].includes(e.key)) { e.preventDefault(); e.stopPropagation(); exit(); }
  }
  el.addEventListener('click', exit);
  addEventListener('resize', () => { if (state === 'running') { layout(); sample(); } });

  window.AresIntro = { play, skip: exit };
  if (root.classList.contains('no-intro') || reduce) { el.hidden = true; root.classList.remove('intro-on'); }
  else play();
})();
