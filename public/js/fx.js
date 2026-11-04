/* =====================================================================
   ARES · efeitos (skill efeitos-ui-animados)
   Galáxia em canvas · grade hexagonal que acende sob o cursor · cursor
   customizado · split/blur text · botão magnético · tilt · contador
   Tudo respeita prefers-reduced-motion e pausa com a aba oculta.
   ===================================================================== */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const FX = (window.FX = {});
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };

  // cor do acento lida do CSS (muda com o tema)
  let accent = [34, 230, 255];
  FX.readAccent = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
    accent = v.split(',').map(Number);
  };

  /* ---------- Galáxia: 3 camadas, cintilação, estrelas cadentes, repulsão ---------- */
  const cv = document.getElementById('galaxy');
  const ctx = cv.getContext('2d');
  let W, H, DPR, stars = [], meteors = [];
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR;
    const n = Math.round((innerWidth * innerHeight) / 5200);
    stars = Array.from({ length: n }, () => {
      const layer = Math.random() < .6 ? 0 : Math.random() < .75 ? 1 : 2;
      const x = Math.random() * W, y = Math.random() * H;
      return { x, y, ox: x, oy: y, vx: 0, vy: 0, layer, r: (.35 + layer * .45 + Math.random() * .4) * DPR,
        tw: Math.random() * Math.PI * 2, ts: .6 + Math.random() * 1.6, tint: Math.random() < .28 };
    });
  }
  resize(); addEventListener('resize', resize);

  let t0 = performance.now(), running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { t0 = performance.now(); requestAnimationFrame(frame); } });

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - t0) / 1000, .05); t0 = now;
    ctx.clearRect(0, 0, W, H);
    const px = (mouse.x / innerWidth - .5), py = (mouse.y / innerHeight - .5);
    const mx = mouse.x * DPR, my = mouse.y * DPR, R = 120 * DPR;
    for (const s of stars) {
      // deriva lenta por camada
      s.oy -= (s.layer + 1) * 2.2 * DPR * dt; if (s.oy < -5) { s.oy = H + 5; s.y = s.oy; }
      // repulsão pelo mouse + mola de volta
      if (mouse.active && !reduce) {
        const dx = s.x - mx, dy = s.y - my, d = Math.hypot(dx, dy);
        if (d < R && d > .1) { const f = (1 - d / R) * 2.4; s.vx += dx / d * f; s.vy += dy / d * f; }
      }
      s.vx += (s.ox - s.x) * .04; s.vy += (s.oy - s.y) * .04; s.vx *= .82; s.vy *= .82;
      s.x += s.vx; s.y += s.vy;
      s.tw += s.ts * dt;
      const a = .35 + .65 * (.5 + .5 * Math.sin(s.tw));
      const par = (s.layer + 1) * 10 * DPR;
      ctx.globalAlpha = a * (.4 + s.layer * .3);
      ctx.fillStyle = s.tint ? `rgb(${accent})` : '#fff';
      ctx.beginPath(); ctx.arc(s.x - px * par, s.y - py * par, s.r, 0, 6.283); ctx.fill();
    }
    // estrelas cadentes
    if (!reduce && Math.random() < .004) meteors.push({ x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .4, l: 0 });
    ctx.lineCap = 'round';
    meteors = meteors.filter(m => {
      m.l += dt; const len = 140 * DPR, k = m.l / 1.1; if (k > 1) return false;
      const x = m.x - k * 520 * DPR, y = m.y + k * 260 * DPR;
      const g = ctx.createLinearGradient(x, y, x + len, y - len / 2);
      g.addColorStop(0, `rgba(${accent},${.9 * (1 - k)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 1.4 * DPR;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y - len / 2); ctx.stroke();
      return true;
    });
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(frame);
  }
  FX.readAccent();
  requestAnimationFrame(frame);

  /* ---------- Mouse: grade hexagonal + cursor custom (lerp) ---------- */
  const root = document.documentElement, cur = document.getElementById('cursor');
  let cx = -100, cy = -100;
  addEventListener('pointermove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    root.style.setProperty('--mx', e.clientX + 'px'); root.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });
  addEventListener('pointerleave', () => (mouse.active = false));
  if (fine && cur) {
    (function loop() {
      cx += (mouse.x - cx) * .22; cy += (mouse.y - cy) * .22;
      cur.style.transform = `translate3d(${cx}px,${cy}px,0) rotate(45deg)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('a,button,[role=slider],.card')));
  }

  /* ---------- Split / blur text ---------- */
  FX.split = (el, delay = 0) => {
    if (!el) return;
    const text = el.dataset.raw || el.textContent.trim();
    el.dataset.raw = text; el.textContent = '';
    text.split(/(\s+)/).forEach((w, i) => {
      if (/^\s+$/.test(w)) return el.append(' ');
      const s = document.createElement('span'); s.className = 'sw'; s.textContent = w;
      s.style.setProperty('--i', i); s.style.setProperty('--d', delay + 'ms'); el.append(s);
    });
    el.setAttribute('aria-label', text);
  };

  /* ---------- Botão magnético ---------- */
  FX.magnet = el => {
    if (!fine || reduce) return;
    addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const dx = e.clientX - x, dy = e.clientY - y, d = Math.hypot(dx, dy);
      el.style.transform = d < 80 ? `translate(${dx * .3}px,${dy * .3}px)` : '';
    }, { passive: true });
  };

  /* ---------- Tilt (±deg pela posição do mouse) ---------- */
  FX.tilt = (el, max = 8, area) => {
    if (!fine || reduce || !el) return;
    const zone = area || el;
    zone.addEventListener('pointermove', e => {
      const r = zone.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `rotateX(${-y * max}deg) rotateY(${x * max}deg)`;
    });
    zone.addEventListener('pointerleave', () => (el.style.transform = ''));
  };

  /* ---------- Contador animado ---------- */
  FX.count = (el, to, ms = 1200) => {
    const fmt = n => Math.round(n).toLocaleString('pt-BR');
    if (reduce) return (el.textContent = fmt(to));
    const t = performance.now();
    (function step(n) {
      const k = Math.min((n - t) / ms, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step);
    })(t);
  };
})();
