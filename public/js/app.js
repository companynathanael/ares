/* =====================================================================
   ARES · aplicação
   Sidebar de vidro · carrossel de modos · conversa com streaming ·
   painel tático · relatório (dashboard) · histórico
   ===================================================================== */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('logoPath').setAttribute('d', window.ARES_LOGO_PATH);

  /* ---------- armazenamento local (só neste navegador) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ares.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('ares.' + k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- modos de batalha ---------- */
  const I = {
    estrategista: '<path d="M4 20 20 4M14 4h6v6M4 14l6 6M7 17l-3 3"/>',
    forja: '<path d="M8 6 2 12l6 6M16 6l6 6-6 6M14 4l-4 16"/>',
    oraculo: '<circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>',
    escriba: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
    sentinela: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    arauto: '<path d="M3 10v4h4l6 4V6L7 10zM17 8a5 5 0 0 1 0 8M19.5 5.5a8.5 8.5 0 0 1 0 13"/>'
  };
  const MODES = [
    { id: 'estrategista', nome: 'Estrategista', cat: 'PLANEJAMENTO', tom: 'precisão',
      desc: 'Planos, decisões e próximos passos', texto: 'Transforma objetivos soltos em planos de ataque: prioridades, riscos, prazos e a próxima ação concreta.',
      itens: ['Quebra metas grandes em etapas', 'Compara caminhos com prós e contras', 'Sempre termina com o próximo passo'],
      seeds: ['Monte um plano de 30 dias para lançar meu produto', 'Me ajude a decidir entre duas propostas de trabalho'] },
    { id: 'forja', nome: 'Forja', cat: 'CÓDIGO', tom: 'engenharia',
      desc: 'Código, arquitetura e depuração', texto: 'Escreve, revisa e conserta código. Explica a causa do erro antes de entregar a correção.',
      itens: ['Código completo e comentado', 'Caça bugs pela causa, não pelo sintoma', 'Sugere testes para o que escreveu'],
      seeds: ['Crie uma API REST em Node com autenticação JWT', 'Por que meu useEffect roda duas vezes?'] },
    { id: 'oraculo', nome: 'Oráculo', cat: 'CONHECIMENTO', tom: 'clareza',
      desc: 'Explicações, estudos e pesquisa', texto: 'Explica qualquer assunto do básico ao avançado, com exemplos, analogias e o que ainda é incerto.',
      itens: ['Explica em camadas, do simples ao técnico', 'Diz quando não tem certeza', 'Monta roteiros de estudo'],
      seeds: ['Explique computação quântica como se eu tivesse 15 anos', 'Monte um roteiro para aprender inglês em 6 meses'] },
    { id: 'escriba', nome: 'Escriba', cat: 'ESCRITA', tom: 'estilo',
      desc: 'Textos, e-mails e roteiros', texto: 'Escreve e reescreve com voz humana: e-mails, roteiros, posts, propostas. Corta o excesso e mantém o que importa.',
      itens: ['Ajusta o tom para o público', 'Reescreve sem cara de texto de IA', 'Entrega versões curtas e longas'],
      seeds: ['Escreva um e-mail cobrando um cliente com educação', 'Crie um roteiro de Reel de 30 segundos sobre produtividade'] },
    { id: 'sentinela', nome: 'Sentinela', cat: 'ANÁLISE', tom: 'rigor',
      desc: 'Revisão crítica e riscos', texto: 'Olha seu plano, contrato, texto ou código procurando falhas, riscos e pontos cegos, sem passar pano.',
      itens: ['Aponta riscos por gravidade', 'Questiona premissas fracas', 'Sugere como mitigar cada problema'],
      seeds: ['Revise minha ideia de negócio e aponte os riscos', 'Quais falhas de segurança são comuns em sites de login?'] },
    { id: 'arauto', nome: 'Arauto', cat: 'MARKETING', tom: 'impacto',
      desc: 'Marca, conteúdo e redes sociais', texto: 'Cria posicionamento, campanhas, legendas e calendários de conteúdo com ganchos que prendem a atenção.',
      itens: ['Ganchos e chamadas que convertem', 'Calendário de conteúdo semanal', 'Ideias adaptadas a cada rede'],
      seeds: ['Crie 10 ganchos para Reels sobre academia', 'Monte um calendário de posts para uma barbearia'] }
  ];
  const modeById = id => MODES.find(m => m.id === id) || MODES[0];
  const icon = (id, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${I[id]}</svg>`;

  // capa gerada para cada modo (sem imagens de terceiros)
  function art(m, i) {
    const a = [[30, 25], [72, 30], [50, 70], [25, 65], [70, 72], [50, 20]][i % 6];
    const rot = [-18, 22, 0, 35, -30, 12][i % 6];
    return `<svg class="art" viewBox="0 0 300 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="g${i}" cx="${a[0]}%" cy="${a[1]}%" r="75%"><stop offset="0" stop-color="rgb(var(--accent-rgb))" stop-opacity=".75"/><stop offset=".45" stop-color="rgb(var(--accent-rgb))" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <pattern id="l${i}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(${rot})"><path d="M0 0v10" stroke="rgba(255,255,255,.07)" stroke-width="1"/></pattern>
      </defs>
      <rect width="300" height="260" fill="#060607"/><rect width="300" height="260" fill="url(#l${i})"/><rect width="300" height="260" fill="url(#g${i})"/>
      <g transform="translate(150 130) rotate(${rot})" fill="none" stroke="rgba(255,255,255,.22)">
        <path d="M-120 -60 L0 -120 L120 -60 L120 60 L0 120 L-120 60Z"/><path d="M-80 -40 L0 -80 L80 -40 L80 40 L0 80 L-80 40Z" stroke="rgb(var(--accent-rgb))" stroke-opacity=".55"/>
      </g>
      <use href="#logo" x="185" y="120" width="140" height="172" style="color:rgba(255,255,255,.07)"/>
      <g transform="translate(118 98) scale(2.7)" style="color:#fff" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${I[m.id]}</g>
    </svg>`;
  }

  /* ---------- estado ---------- */
  const FURY = [
    { id: 'low', nome: 'Baixa', hint: 'resposta rápida' },
    { id: 'medium', nome: 'Média', hint: 'equilibrada' },
    { id: 'high', nome: 'Alta', hint: 'análise profunda' },
    { id: 'xhigh', nome: 'Extrema', hint: 'máximo cuidado' },
    { id: 'max', nome: 'Máxima', hint: 'sem limites' }
  ];
  const S = {
    theme: store.get('theme', 'ciano'),
    glow: store.get('glow', 70),
    fury: store.get('fury', 2),
    mode: store.get('mode', 0),
    collapsed: store.get('collapsed', false),
    convos: store.get('convos', []),
    current: null,
    online: false,
    model: '',
    busy: false,
    abort: null
  };
  const saveConvos = () => { store.set('convos', S.convos.slice(0, 200)); renderSbRecent(); };
  function renderSbRecent() {
    const box = document.getElementById('sbRecent'); if (!box) return;
    document.getElementById('histBadge').textContent = S.convos.length;
    box.innerHTML = S.convos.slice(0, 6).map(c => `<button data-id="${c.id}" class="${c.id === S.current ? 'on' : ''}" title="${esc(c.title)}"><i></i><span>${esc(c.title)}</span></button>`).join('')
      || '<p class="none">Nenhuma batalha ainda.</p>';
    box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => openConvo(b.dataset.id)));
  }

  /* ---------- tema e brilho ---------- */
  function setTheme(t) {
    S.theme = t; store.set('theme', t);
    document.documentElement.dataset.theme = t;
    $$('.tdot').forEach(b => b.setAttribute('aria-checked', b.dataset.themeSet === t));
    requestAnimationFrame(FX.readAccent);
  }
  $$('.tdot').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.themeSet)));
  setTheme(S.theme);

  /* ---------- sidebar: pílula que desliza + recolher ---------- */
  const sb = $('#sidebar'), nav = $('#nav'), pill = $('#pill');
  let activeItem = $('.item.active', nav);
  const moveTo = el => { if (el) pill.style.transform = `translate(${el.offsetLeft}px,${el.offsetTop}px)`; };
  $$('.item', nav).forEach(el => {
    el.addEventListener('mouseenter', () => moveTo(el));
    el.addEventListener('click', e => {
      e.preventDefault();
      if (el.dataset.action) return;
      go(el.dataset.view);
    });
  });
  nav.addEventListener('mouseleave', () => moveTo(activeItem));
  const toggle = $('#toggle');
  function setCollapsed(c) {
    S.collapsed = c; store.set('collapsed', c); sb.classList.toggle('collapsed', c);
    toggle.setAttribute('aria-label', c ? 'Expandir menu' : 'Recolher menu');
    setTimeout(() => moveTo(activeItem), 560);
  }
  toggle.addEventListener('click', () => setCollapsed(!S.collapsed));
  setCollapsed(S.collapsed);
  addEventListener('resize', () => moveTo(activeItem));

  /* ---------- navegação entre views ---------- */
  function go(view) {
    if (!$('#view-' + view)) view = 'arena';
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
    activeItem = $(`.item[data-view="${view}"]`, nav); $$('.item', nav).forEach(i => i.classList.toggle('active', i === activeItem));
    moveTo(activeItem);
    if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
    const v = $('#view-' + view); $$('.split', v).forEach(el => FX.split(el));
    if (view === 'arsenal') { layoutCarousel(); $('#carousel').focus({ preventScroll: true }); }
    if (view === 'comando') renderDash();
    if (view === 'historico') renderHistory();
    if (view === 'arena') $('#input').focus({ preventScroll: true });
  }
  addEventListener('hashchange', () => go(location.hash.slice(1)));
  let togglePanel = () => {};
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || !$('#login').hidden || !$('#modal').hidden) return;
    if (e.target.closest('input,textarea,[contenteditable],[role=slider],.carousel')) return;
    const k = e.key.toLowerCase(), views = ['arena', 'arsenal', 'comando', 'historico'];
    if (['1', '2', '3', '4'].includes(k)) { go(views[+k - 1]); e.preventDefault(); }
    else if (k === 'n') { newConvo(); e.preventDefault(); }
    else if (k === 'p') { togglePanel(); e.preventDefault(); }
  });

  const tip = document.createElement('div'); tip.className = 'sbtip'; document.body.append(tip);
  $$('[data-tip]', sb).forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!S.collapsed) return; const r = el.getBoundingClientRect();
      tip.textContent = el.dataset.tip; tip.style.left = r.right + 14 + 'px'; tip.style.top = r.top + r.height / 2 + 'px'; tip.classList.add('on');
    });
    el.addEventListener('mouseleave', () => tip.classList.remove('on'));
  });

  /* ---------- modo ativo (player) ---------- */
  function setMode(i, { announce = true } = {}) {
    S.mode = (i + MODES.length) % MODES.length; store.set('mode', S.mode);
    const m = MODES[S.mode];
    $('#pname').textContent = m.nome; $('#pdesc').textContent = m.desc;
    $('#pthumb').innerHTML = icon(m.id);
    $('#crumbMode').textContent = m.nome.toUpperCase(); $('#brandMode').textContent = m.nome.toUpperCase();
    renderSeeds();
    if (announce) layoutCarousel();
  }
  $$('[data-mode-step]').forEach(b => b.addEventListener('click', () => setMode(S.mode + +b.dataset.modeStep)));
  $('#shuffle').addEventListener('click', () => { let n; do { n = Math.floor(Math.random() * MODES.length); } while (n === S.mode); setMode(n); });
  $('#pnow').addEventListener('click', () => go('arsenal'));

  function renderSeeds() {
    const m = MODES[S.mode], box = $('#seeds');
    const all = [...m.seeds, ...MODES.filter(x => x !== m).slice(0, 2).map(x => x.seeds[0])];
    box.innerHTML = all.map((s, i) => `<button class="seed" style="animation-delay:${400 + i * 90}ms" data-i="${i}"><small>${i < 2 ? m.nome.toUpperCase() : 'IDEIA'}</small>${esc(s)}</button>`).join('');
    $$('.seed', box).forEach((b, i) => b.addEventListener('click', () => { $('#input').value = all[i]; send(); }));
  }

  /* ---------- carrossel 3D de vidro ---------- */
  const car = $('#carousel'), dots = $('#cdots');
  car.innerHTML = MODES.map((m, i) => `
    <div class="card" role="option" data-i="${i}" id="card-${i}" aria-label="${m.nome}">
      <div class="cover">${art(m, i)}<span class="num">MODO ${String(i + 1).padStart(2, '0')}</span>
        <span class="play">${icon('estrategista').replace(I.estrategista, '<path d="M8 5v14l11-7z" fill="currentColor"/>')}</span></div>
      <div class="cinfo"><h3>${m.nome}</h3><span class="data">${String(i + 1).padStart(2, '0')} • ${m.cat} • ${m.tom.toUpperCase()}</span>
        <p>${m.desc}</p><span class="act">Ativar modo →</span></div>
    </div>`).join('');
  dots.innerHTML = MODES.map(() => '<i></i>').join('');
  const cards = $$('.card', car);
  let cIdx = S.mode;
  function layoutCarousel() {
    const mobile = innerWidth < 760;
    cards.forEach((c, i) => {
      const off = i - cIdx, ab = Math.abs(off);
      c.style.transform = reduce ? `translateX(${off * (mobile ? 70 : 62)}%) scale(${1 - ab * .12})`
        : `translateX(${off * (mobile ? 70 : 62)}%) translateZ(${-ab * 120}px) rotateY(${off * -28}deg) scale(${1 - ab * .12})`;
      c.style.opacity = ab > 3 ? 0 : 1 - ab * .25;
      c.style.zIndex = 10 - ab;
      c.style.pointerEvents = ab > 3 ? 'none' : '';
      c.setAttribute('aria-selected', off === 0);
    });
    car.setAttribute('aria-activedescendant', 'card-' + cIdx);
    $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === cIdx));
  }
  function cStep(n) { cIdx = Math.max(0, Math.min(MODES.length - 1, cIdx + n)); layoutCarousel(); }
  $$('[data-c-step]').forEach(b => b.addEventListener('click', () => cStep(+b.dataset.cStep)));
  car.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') cStep(1); else if (e.key === 'ArrowLeft') cStep(-1);
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(cIdx); }
  });
  let wheelLock = 0;
  car.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8 || Date.now() < wheelLock) return; e.preventDefault();
    wheelLock = Date.now() + 600; cStep(d > 0 ? 1 : -1);
  }, { passive: false });
  let sx = null, moved = false;
  car.addEventListener('pointerdown', e => { sx = e.clientX; moved = false; });
  car.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 50) { moved = true; cStep(dx < 0 ? 1 : -1); } sx = null; });
  cards.forEach((c, i) => {
    c.addEventListener('click', () => { if (moved) return; if (i !== cIdx) { cIdx = i; layoutCarousel(); } else openModal(i); });
    c.addEventListener('pointermove', e => {
      if (i !== cIdx || reduce || e.pointerType !== 'mouse') return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `rotateX(${-y * 12}deg) rotateY(${x * 12}deg)`;
    });
    c.addEventListener('pointerleave', () => i === cIdx && layoutCarousel());
  });

  /* ---------- modal com FLIP ---------- */
  const modal = $('#modal'), mcard = $('#modalCard');
  let modalFrom = null;
  function openModal(i) {
    const m = MODES[i]; modalFrom = cards[i];
    $('#modalCover').innerHTML = art(m, i);
    $('#modalKicker').textContent = `MODO ${String(i + 1).padStart(2, '0')} // ${m.cat}`;
    $('#modalTitle').textContent = m.nome.toUpperCase();
    $('#modalText').textContent = m.texto;
    $('#modalList').innerHTML = m.itens.map(t => `<li>${esc(t)}</li>`).join('');
    $('#modalGo').onclick = () => { setMode(i); closeModal(); go('arena'); };
    modal.hidden = false;
    const from = modalFrom.getBoundingClientRect(), to = mcard.getBoundingClientRect();
    if (!reduce) mcard.animate([
      { transform: `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width},${from.height / to.height})`, opacity: .4 },
      { transform: 'none', opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' });
    requestAnimationFrame(() => modal.classList.add('open'));
    $('#modalGo').focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.classList.remove('open');
    const from = modalFrom.getBoundingClientRect(), to = mcard.getBoundingClientRect();
    const done = () => { modal.hidden = true; car.focus({ preventScroll: true }); };
    if (reduce) return done();
    mcard.animate([{ transform: 'none', opacity: 1 },
      { transform: `translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width},${from.height / to.height})`, opacity: 0 }],
      { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = done;
  }
  $('#modalClose').addEventListener('click', closeModal);
  $('#modalCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ---------- markdown mínimo e seguro ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function inline(s) {
    return s.replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function md(src) {
    const out = [], lines = src.replace(/\r/g, '').split('\n');
    let i = 0, list = null, para = [];
    const flushP = () => { if (para.length) { out.push('<p>' + inline(esc(para.join('\n'))).replace(/\n/g, '<br>') + '</p>'); para = []; } };
    const flushL = () => { if (list) { out.push(`<${list.t}>${list.items.map(x => '<li>' + inline(esc(x)) + '</li>').join('')}</${list.t}>`); list = null; } };
    while (i < lines.length) {
      const l = lines[i];
      if (/^```/.test(l)) {
        flushP(); flushL(); const code = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
        out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); i++; continue;
      }
      let m;
      if ((m = l.match(/^(#{1,3})\s+(.*)/))) { flushP(); flushL(); out.push(`<h${m[1].length}>${inline(esc(m[2]))}</h${m[1].length}>`); }
      else if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { flushP(); if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); }
      else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { flushP(); if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); }
      else if ((m = l.match(/^>\s?(.*)/))) { flushP(); flushL(); out.push('<blockquote>' + inline(esc(m[1])) + '</blockquote>'); }
      else if (/^(-{3,}|\*{3,})$/.test(l.trim())) { flushP(); flushL(); out.push('<hr>'); }
      else if (/^\|.*\|\s*$/.test(l) && /^\|?[\s:-]+\|/.test(lines[i + 1] || '')) {
        flushP(); flushL();
        const row = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => inline(esc(c.trim())));
        let h = '<table><thead><tr>' + row(l).map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>'; i += 2;
        while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) h += '<tr>' + row(lines[i++]).map(c => `<td>${c}</td>`).join('') + '</tr>';
        out.push(h + '</tbody></table>'); continue;
      }
      else if (!l.trim()) { flushP(); flushL(); }
      else { flushL(); para.push(l); }
      i++;
    }
    flushP(); flushL();
    return out.join('');
  }

  /* ---------- conversas ---------- */
  const thread = $('#thread'), scroll = $('#scroll'), hero = $('#hero');
  const hhmm = t => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  function curConvo() { return S.convos.find(c => c.id === S.current); }
  function newConvo() {
    if (S.busy) stop();
    S.current = null; thread.innerHTML = ''; hero.classList.remove('gone'); renderSbRecent();
    FX.split($('#heroSub')); updateTokens(); go('arena');
  }
  function openConvo(id) {
    const c = S.convos.find(x => x.id === id); if (!c) return;
    S.current = id; thread.innerHTML = ''; hero.classList.add('gone'); renderSbRecent();
    c.msgs.forEach(m => addMsg(m.role, m.content, { t: m.t, mode: m.mode, demo: m.demo }));
    updateTokens(); go('arena'); requestAnimationFrame(() => (scroll.scrollTop = scroll.scrollHeight));
  }
  function addMsg(role, content, { t = Date.now(), mode = MODES[S.mode].id, demo = false } = {}) {
    const el = document.createElement('div'); el.className = 'msg ' + role;
    if (role === 'user') el.innerHTML = `<div class="tag">${hhmm(t)} · VOCÊ</div><div class="body"></div>`, $('.body', el).textContent = content;
    else {
      const m = modeById(mode);
      el.innerHTML = `<div class="tag"><svg><use href="#logo"/></svg><b>ARES</b> · ${m.nome.toUpperCase()} · ${hhmm(t)}${demo ? ' · DEMO' : ''}</div>
        <div class="body"><div class="md"></div><button class="copy">COPIAR</button></div>`;
      $('.md', el).innerHTML = md(content);
      $('.copy', el).addEventListener('click', e => { navigator.clipboard?.writeText(el.dataset.raw || ''); e.target.textContent = 'COPIADO'; setTimeout(() => (e.target.textContent = 'COPIAR'), 1400); });
      el.dataset.raw = content;
    }
    thread.append(el); return el;
  }

  /* ---------- envio ---------- */
  const input = $('#input'), sendBtn = $('#send'), eq = $('#eq');
  const autosize = () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 200) + 'px'; };
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
  $('#composer').addEventListener('submit', e => { e.preventDefault(); S.busy ? stop() : send(); });

  function setBusy(b) {
    S.busy = b; eq.classList.toggle('on', b); sendBtn.classList.toggle('stop', b);
    sendBtn.setAttribute('aria-label', b ? 'Parar resposta' : 'Enviar');
    sendBtn.innerHTML = b ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
  }
  function stop() { S.abort?.abort(); }

  async function send() {
    const text = input.value.trim(); if (!text || S.busy) return;
    input.value = ''; autosize();
    let c = curConvo();
    if (!c) {
      c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: text.slice(0, 70), created: Date.now(), msgs: [], usage: { in: 0, out: 0 } };
      S.convos.unshift(c); S.current = c.id;
    }
    hero.classList.add('gone');
    const mode = MODES[S.mode].id, t = Date.now();
    c.msgs.push({ role: 'user', content: text, t, mode }); c.updated = t; saveConvos();
    addMsg('user', text, { t });
    const el = addMsg('ares', '', { mode, demo: !S.online });
    el.classList.add('streaming');
    const mdEl = $('.md', el);
    mdEl.innerHTML = `<div class="think"><span class="bars"><i></i><i></i><i></i></span><span>ARES ESTÁ TRAÇANDO A ESTRATÉGIA…</span></div>`;
    scroll.scrollTop = scroll.scrollHeight;
    setBusy(true);

    let acc = '', pending = false, first = true;
    const paint = () => {
      pending = false; const stick = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 120;
      mdEl.innerHTML = md(acc); el.dataset.raw = acc; if (stick) scroll.scrollTop = scroll.scrollHeight;
    };
    const onText = s => { acc += s; if (first) { first = false; } if (!pending) { pending = true; requestAnimationFrame(paint); } };
    const ctrl = new AbortController(); S.abort = ctrl;
    const started = performance.now();
    let usage = null, error = null;
    try {
      if (S.online) usage = await streamApi(c, mode, onText, ctrl.signal);
      else await streamDemo(text, onText, ctrl.signal);
    } catch (e) {
      if (e.name !== 'AbortError') error = e.message || String(e);
    }
    paint();
    if (error) mdEl.insertAdjacentHTML('beforeend', `<p class="err">⚠ ${esc(error)}</p>`);
    if (!acc && !error) mdEl.innerHTML = '<p class="err">Resposta interrompida.</p>';
    el.classList.remove('streaming'); setBusy(false); S.abort = null;
    if (acc) {
      c.msgs.push({ role: 'assistant', content: acc, t: Date.now(), mode, ms: Math.round(performance.now() - started), demo: !S.online });
      if (usage) { c.usage.in += usage.input_tokens || 0; c.usage.out += usage.output_tokens || 0; }
      c.updated = Date.now(); saveConvos(); updateTokens();
    }
  }

  // SSE do servidor (server.js) → eventos {type:'text'|'done'|'error'}
  async function streamApi(c, mode, onText, signal) {
    const res = await fetch('api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
      body: JSON.stringify({ mode, effort: FURY[S.fury].id, messages: c.msgs.map(m => ({ role: m.role, content: m.content })) })
    });
    if (res.status === 401) { showLogin(S.status, 'Sua sessão expirou. Entre de novo.'); throw new Error('Sessão expirada.'); }
    if (!res.ok || !res.body) throw new Error(`Falha no núcleo (${res.status}). ${await res.text().catch(() => '')}`);
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = '', usage = null;
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      let k;
      while ((k = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, k); buf = buf.slice(k + 2);
        const line = chunk.split('\n').find(l => l.startsWith('data:')); if (!line) continue;
        const ev = JSON.parse(line.slice(5));
        if (ev.type === 'text') onText(ev.text);
        else if (ev.type === 'done') usage = ev.usage;
        else if (ev.type === 'error') throw new Error(ev.message);
      }
    }
    return usage;
  }

  // modo demonstração: sem servidor ou sem chave, a Ares explica como ligar o núcleo
  function streamDemo(text, onText, signal) {
    const m = MODES[S.mode];
    const reply = `**Modo demonstração.** O núcleo de IA ainda não está conectado, então esta resposta é fixa e não leu sua mensagem de verdade.

Você pediu: *"${text.slice(0, 120)}${text.length > 120 ? '…' : ''}"*. Com o núcleo ligado, eu responderia no modo **${m.nome}** (${m.desc.toLowerCase()}), com fúria **${FURY[S.fury].nome.toLowerCase()}**.

### Como ligar o núcleo
1. Crie o arquivo \`.env\` na raiz do projeto com \`ANTHROPIC_API_KEY=sua-chave\`
2. Rode \`npm install\` e depois \`npm start\`
3. Abra \`http://localhost:3000\`, e o ponto ao lado do seu nome fica aceso

\`\`\`bash
npm install
npm start
\`\`\`

> A chave fica só no servidor. O navegador nunca vê a chave.`;
    const parts = reply.match(/\S+\s*/g);
    return new Promise((resolve, reject) => {
      let i = 0;
      const tick = () => {
        if (signal.aborted) return reject(new DOMException('', 'AbortError'));
        if (i >= parts.length) return resolve();
        onText(parts[i++]); setTimeout(tick, 18 + Math.random() * 30);
      };
      setTimeout(tick, 650);
    });
  }

  /* ---------- painel tático: relógio, dials, núcleo ---------- */
  function clock() {
    const d = new Date();
    $('#clock').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    $('#crumbClock').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    $('#loginClock').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString('pt-BR');
    $('#date').textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  clock(); setInterval(clock, 1000 * 15);

  const A0 = Math.atan2(56, -62) * 180 / Math.PI, SWEEP = 540 - 2 * A0; // início ≈138°, varredura ≈264°
  function dial(rootSel, arcSel, knobSel, value, onChange, steps) {
    const root = $(rootSel), svg = $('svg', root), arc = $(arcSel), knob = $(knobSel);
    const pulse = $('.knob-pulse', svg), ticks = $('.ticks', svg);
    arc.setAttribute('pathLength', 100);
    // marcações em volta do arco
    const nT = steps || 10;
    for (let i = 0; i <= nT; i++) {
      const a = (A0 + SWEEP * i / nT) * Math.PI / 180, r1 = 96, r2 = steps ? 104 : 100;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', 100 + r1 * Math.cos(a)); l.setAttribute('y1', 100 + r1 * Math.sin(a));
      l.setAttribute('x2', 100 + r2 * Math.cos(a)); l.setAttribute('y2', 100 + r2 * Math.sin(a));
      l.dataset.v = i / nT * 100; ticks.append(l);
    }
    let shown = 0, raf = 0;
    const draw = v => {
      arc.style.strokeDasharray = `${Math.max(v, .01)} 100`;
      const a = (A0 + SWEEP * v / 100) * Math.PI / 180, x = 100 + 80 * Math.cos(a), y = 100 + 80 * Math.sin(a);
      knob.setAttribute('cx', x); knob.setAttribute('cy', y); pulse.setAttribute('cx', x); pulse.setAttribute('cy', y);
      $$('line', ticks).forEach(l => l.classList.toggle('on', +l.dataset.v <= v + .01));
    };
    // anima do valor mostrado até o novo (easing suave)
    const set = (v, ms = 520) => {
      cancelAnimationFrame(raf);
      if (reduce) { shown = v; return draw(v); }
      const from = shown, t0 = performance.now();
      root.classList.add('bump'); setTimeout(() => root.classList.remove('bump'), 260);
      const step = t => {
        const k = Math.min((t - t0) / ms, 1), e = 1 - Math.pow(1 - k, 3);
        shown = from + (v - from) * e; draw(shown); if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const fromPointer = (e, ms) => {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      let rel = (Math.atan2(p.y - 100, p.x - 100) * 180 / Math.PI - A0 + 720) % 360;
      if (rel > SWEEP) rel = rel > SWEEP + (360 - SWEEP) / 2 ? 0 : SWEEP;
      let v = rel / SWEEP * 100;
      if (steps) v = Math.round(v / (100 / steps)) * (100 / steps);
      if (v === value && ms !== 520) return;
      value = v; onChange(v); set(v, ms);
    };
    let drag = false;
    root.addEventListener('pointerdown', e => { drag = true; root.setPointerCapture(e.pointerId); fromPointer(e, 520); });
    root.addEventListener('pointermove', e => drag && fromPointer(e, steps ? 300 : 90));
    root.addEventListener('pointerup', () => (drag = false));
    root.addEventListener('keydown', e => {
      const d = steps ? 100 / steps : 5;
      if (['ArrowRight', 'ArrowUp'].includes(e.key)) value = Math.min(100, value + d);
      else if (['ArrowLeft', 'ArrowDown'].includes(e.key)) value = Math.max(0, value - d); else return;
      e.preventDefault(); onChange(value); set(value);
    });
    draw(0);
    return { set: v => { value = v; set(v); }, intro: () => { shown = 0; draw(0); set(value, 1100); } };
  }
  function applyFury(i) {
    S.fury = i; store.set('fury', i);
    $('#furyVal').textContent = FURY[i].nome; $('#furyHint').textContent = FURY[i].hint;
    $('#furyDial').setAttribute('aria-valuenow', i); $('#furyDial').setAttribute('aria-valuetext', FURY[i].nome);
  }
  const furyDial = dial('#furyDial', '#furyArc', '#furyKnob', S.fury * 25, v => applyFury(Math.round(v / 25)), 4);
  $$('[data-fury]').forEach(b => b.addEventListener('click', () => { const n = Math.max(0, Math.min(4, S.fury + +b.dataset.fury)); applyFury(n); furyDial.set(n * 25); }));
  applyFury(S.fury);
  function applyGlow(v) {
    S.glow = Math.round(v); store.set('glow', S.glow);
    document.documentElement.style.setProperty('--glow', (.15 + S.glow / 100 * 1.1).toFixed(3));
    $('#glowVal').textContent = S.glow + '%'; $('#glowDial').setAttribute('aria-valuenow', S.glow);
  }
  const glowDial = dial('#glowDial', '#glowArc', '#glowKnob', S.glow, applyGlow);
  applyGlow(S.glow);

  FX.tilt($('#spatial'), 4, $('#rail'));
  const rail = $('#rail'), scrim = $('#scrim');
  function openPanel() {
    rail.removeAttribute('inert'); rail.setAttribute('aria-hidden', 'false'); scrim.hidden = false;
    requestAnimationFrame(() => { rail.classList.add('open'); scrim.classList.add('on'); });
    setTimeout(() => { furyDial.intro(); glowDial.intro(); }, 200);
    $('#railClose').focus({ preventScroll: true });
  }
  function closePanel() {
    if (!rail.classList.contains('open')) return;
    rail.classList.remove('open'); scrim.classList.remove('on');
    rail.setAttribute('inert', ''); rail.setAttribute('aria-hidden', 'true');
    setTimeout(() => (scrim.hidden = true), 450);
  }
  togglePanel = () => (rail.classList.contains('open') ? closePanel() : openPanel());
  $$('[data-action="panel"]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); togglePanel(); }));
  $('#railClose').addEventListener('click', closePanel); scrim.addEventListener('click', closePanel);
  addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
  FX.tilt($('#heroLogo'), 14, $('#hero'));
  FX.magnet($('#modalGo'));

  function updateTokens() {
    const c = curConvo(), u = c ? c.usage : { in: 0, out: 0 };
    $('#tkIn').textContent = u.in.toLocaleString('pt-BR'); $('#tkOut').textContent = u.out.toLocaleString('pt-BR');
  }

  async function checkCore() {
    let st = null;
    try { const r = await fetch('api/status', { cache: 'no-store' }); if (r.ok) st = await r.json(); } catch {}
    S.online = !!(st && st.online); S.model = st?.model || '';
    const dot = $('#statusDot'), ring = $('#coreRing');
    dot.className = 'status-dot ' + (S.online ? 'on' : 'demo'); ring.className = 'ring ' + (S.online ? 'on' : 'demo');
    $('#coreState').textContent = S.online ? 'Online' : 'Demonstração';
    $('#coreModel').textContent = S.online ? S.model : (st ? 'sem chave da API' : 'sem servidor');
    $('#coreLabel').textContent = S.online ? 'Núcleo online' : 'Modo demonstração';
    $('#sbModel').textContent = S.online ? S.model : (st ? 'sem chave da API' : 'sem servidor');
    $('#sbRing').className = 'ring mini ' + (S.online ? 'on' : 'demo');
    $('#fine').textContent = S.online ? 'ENTER envia · SHIFT+ENTER quebra linha' : 'MODO DEMO · rode npm start com a chave no .env para ligar o núcleo';
    S.status = st;
    return st;
  }

  /* ---------- relatório (dashboard) ---------- */
  function renderDash() {
    const C = S.convos, msgs = C.flatMap(c => c.msgs);
    const ans = msgs.filter(m => m.role === 'assistant' && m.ms);
    const tin = C.reduce((s, c) => s + (c.usage?.in || 0), 0), tout = C.reduce((s, c) => s + (c.usage?.out || 0), 0);
    const avg = ans.length ? ans.reduce((s, m) => s + m.ms, 0) / ans.length / 1000 : 0;
    // mensagens enviadas por dia (últimos 7 dias)
    const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i)); return d; });
    const perDay = days.map(d => msgs.filter(m => m.role === 'user' && m.t >= +d && m.t < +d + 864e5).length);
    const perMode = MODES.map(m => ({ m, n: msgs.filter(x => x.role === 'user' && x.mode === m.id).length }));
    const maxMode = Math.max(1, ...perMode.map(x => x.n));
    const ico = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${p}</svg>`;
    const tiles = [
      ['BATALHAS', C.length, 'conversas salvas neste navegador', '<path d="M4 20 20 4M14 4h6v6"/>'],
      ['ORDENS', msgs.filter(m => m.role === 'user').length, 'mensagens enviadas', '<path d="M4 4h16v12H8l-4 4z"/>'],
      ['TOKENS', tin + tout, `${tin.toLocaleString('pt-BR')} entrada · ${tout.toLocaleString('pt-BR')} saída`, '<path d="M12 3v18M3 12h18"/>'],
      ['TEMPO MÉDIO', avg, 'segundos por resposta', '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>']
    ];
    const dash = $('#dash');
    dash.innerHTML = tiles.map((t, i) => `<div class="tile" style="--i:${i}"><div class="tl">${ico(t[3])}${t[0]}</div><div class="big" data-n="${t[1]}" data-dec="${i === 3 ? 1 : 0}">0</div><div class="sub">${t[2]}</div></div>`).join('')
      + `<div class="tile wide" style="--i:4;position:relative"><div class="tl">${ico('<path d="M3 17l6-6 4 4 8-8"/>')}ORDENS POR DIA · ÚLTIMOS 7 DIAS</div>${lineChart(days, perDay)}</div>`
      + `<div class="tile tall" style="--i:5"><div class="tl">${ico('<path d="M4 20V10M10 20V4M16 20v-7"/>')}MODOS MAIS USADOS</div>
         <div class="hbars">${perMode.map(x => `<div class="bar-row"><span>${x.m.nome}</span><div class="bar-track"><div class="bar-fill" data-w="${x.n / maxMode * 100}"></div></div><span>${x.n}</span></div>`).join('')}</div>
         ${msgs.length ? '' : '<p class="empty-note">Sem dados ainda: comece uma batalha na Arena.</p>'}</div>`
      + `<div class="tile half" style="--i:6"><div class="tl">${ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}BATALHAS RECENTES</div>
         <div class="recent">${C.slice(0, 5).map(c => `<button data-id="${c.id}"><span>${esc(c.title)}</span><small>${new Date(c.updated || c.created).toLocaleDateString('pt-BR')}</small></button>`).join('') || '<p class="empty-note">Nenhuma ainda.</p>'}</div></div>`
      + `<div class="tile half" style="--i:7"><div class="tl">${ico('<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/>')}CONFIGURAÇÃO ATUAL</div>
         <div class="recent"><button tabindex="-1"><span>Modo</span><small>${MODES[S.mode].nome.toUpperCase()}</small></button><button tabindex="-1"><span>Fúria</span><small>${FURY[S.fury].nome.toUpperCase()}</small></button>
         <button tabindex="-1"><span>Tema</span><small>${S.theme.toUpperCase()}</small></button><button tabindex="-1"><span>Núcleo</span><small>${S.online ? esc(S.model) : 'DEMO'}</small></button></div></div>`;
    $$('.big', dash).forEach((el, i) => {
      const n = +el.dataset.n;
      if (el.dataset.dec === '1') { el.textContent = n.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }); }
      else setTimeout(() => FX.count(el, n), 200 + i * 70);
    });
    requestAnimationFrame(() => $$('.bar-fill', dash).forEach(b => (b.style.width = b.dataset.w + '%')));
    $$('.recent button[data-id]', dash).forEach(b => b.addEventListener('click', () => openConvo(b.dataset.id)));
    wireChart(dash, days, perDay);
    $$('.split', $('#view-comando')).forEach(el => FX.split(el));
  }
  function lineChart(days, vals) {
    const W = 640, H = 220, P = { l: 32, r: 14, t: 16, b: 28 };
    const max = Math.max(4, ...vals), x = i => P.l + i * (W - P.l - P.r) / (vals.length - 1), y = v => P.t + (H - P.t - P.b) * (1 - v / max);
    const pts = vals.map((v, i) => [x(i), y(v)]);
    const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const ticks = [0, Math.round(max / 2), max];
    const lbl = d => d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Ordens por dia nos últimos 7 dias: ${vals.join(', ')}">
      <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(var(--accent-rgb))" stop-opacity=".28"/><stop offset="1" stop-color="rgb(var(--accent-rgb))" stop-opacity="0"/></linearGradient></defs>
      <g class="grid">${ticks.map(t => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/>`).join('')}</g>
      <g class="axis">${ticks.map(t => `<text x="${P.l - 8}" y="${y(t) + 3}" text-anchor="end">${t}</text>`).join('')}
        ${days.map((d, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${lbl(d)}</text>`).join('')}</g>
      <path class="area" d="${path} L${x(vals.length - 1)} ${y(0)} L${x(0)} ${y(0)}Z"/>
      <path class="line" d="${path}" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:drawLine 1.4s .3s cubic-bezier(.22,1,.36,1) forwards"/>
      <line class="xh" y1="${P.t}" y2="${H - P.b}" x1="-10" x2="-10"/>
      ${pts.map(p => `<circle class="dot" r="4.5" cx="${p[0]}" cy="${p[1]}"/>`).join('')}
      ${pts.map((p, i) => `<rect class="hit" data-i="${i}" x="${p[0] - (W - P.l - P.r) / 12}" y="0" width="${(W - P.l - P.r) / 6}" height="${H}"/>`).join('')}
    </svg><div class="tip" role="status"></div>
    <table class="sr-only"><caption>Ordens por dia</caption><tr>${days.map(d => `<th>${d.toLocaleDateString('pt-BR')}</th>`).join('')}</tr><tr>${vals.map(v => `<td>${v}</td>`).join('')}</tr></table>`;
  }
  function wireChart(root, days, vals) {
    const svg = $('.chart', root); if (!svg) return; const tip = $('.tip', root), xh = $('.xh', svg);
    $$('.hit', svg).forEach(h => {
      h.addEventListener('pointerenter', () => {
        const i = +h.dataset.i, dot = $$('.dot', svg)[i];
        xh.setAttribute('x1', dot.getAttribute('cx')); xh.setAttribute('x2', dot.getAttribute('cx'));
        const r = dot.getBoundingClientRect(), pr = tip.parentElement.getBoundingClientRect();
        tip.innerHTML = `${days[i].toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}<br><b>${vals[i]}</b> ${vals[i] === 1 ? 'ordem' : 'ordens'}`;
        tip.style.left = r.left - pr.left + r.width / 2 + 'px'; tip.style.top = r.top - pr.top - 6 + 'px'; tip.style.opacity = 1;
      });
    });
    svg.addEventListener('pointerleave', () => { tip.style.opacity = 0; xh.setAttribute('x1', -10); xh.setAttribute('x2', -10); });
  }
  const style = document.createElement('style'); style.textContent = '@keyframes drawLine{to{stroke-dashoffset:0}}'; document.head.append(style);

  /* ---------- histórico ---------- */
  function renderHistory() {
    const box = $('#history');
    if (!S.convos.length) { box.innerHTML = '<p class="empty">Nenhuma batalha registrada ainda.</p>'; return; }
    box.innerHTML = S.convos.map(c => {
      const last = [...c.msgs].reverse().find(m => m.role === 'assistant'), m = modeById(c.msgs[0]?.mode);
      return `<div class="hcard" role="button" tabindex="0" data-id="${c.id}"><span class="data">${m.nome.toUpperCase()} · ${new Date(c.updated || c.created).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
        <h4>${esc(c.title)}</h4><p>${esc((last?.content || '').replace(/[#*`>]/g, '').slice(0, 160))}</p><button class="del" data-del="${c.id}">APAGAR</button></div>`;
    }).join('');
    $$('.hcard', box).forEach(h => {
      const open = e => { if (!e.target.closest('.del')) openConvo(h.dataset.id); };
      h.addEventListener('click', open); h.addEventListener('keydown', e => e.key === 'Enter' && open(e));
      FX.tilt(h, 6);
    });
    $$('.del', box).forEach(b => b.addEventListener('click', () => {
      S.convos = S.convos.filter(c => c.id !== b.dataset.del); saveConvos();
      if (S.current === b.dataset.del) { S.current = null; thread.innerHTML = ''; hero.classList.remove('gone'); }
      renderHistory();
    }));
  }

  /* ---------- login ---------- */
  const login = $('#login'), app = $('#app'), lform = $('#loginForm');
  function setUser(name) {
    S.user = name; store.set('user', name);
    $('#userName').textContent = name; $('#avatar').textContent = (name.trim()[0] || '?').toUpperCase();
  }
  function showLogin(st, err = '') {
    app.classList.add('locked'); app.setAttribute('inert', '');
    login.hidden = false; login.classList.remove('leaving');
    FX.split($('#loginTitle'), 250);
    const need = !!st?.auth?.required;
    $('#passField').hidden = !need;
    $('#loginStatus').textContent = !st ? 'SEM SERVIDOR · MODO DEMONSTRAÇÃO' : st.online ? 'NÚCLEO ONLINE · ' + String(st.model).toUpperCase() : 'SERVIDOR SEM CHAVE · DEMONSTRAÇÃO';
    $('#loginNote').textContent = need ? '' : 'Sem senha configurada: seu codinome fica salvo só neste navegador.';
    $('#loginErr').textContent = err;
    $('#loginName').value = S.user || '';
    setTimeout(() => ($('#loginName').value ? (need ? $('#loginPass') : $('#loginGo')) : $('#loginName')).focus(), 450);
  }
  function enterApp(animate = true) {
    app.removeAttribute('inert'); app.classList.remove('locked');
    if (animate) { login.classList.add('leaving'); setTimeout(() => { login.hidden = true; login.classList.remove('leaving'); }, 800); }
    else login.hidden = true;
    FX.split($('#heroSub'), animate ? 700 : 300);
    go(location.hash.slice(1) || 'arena'); moveTo(activeItem);
  }
  lform.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#loginName').value.trim(), pass = $('#loginPass').value, need = !$('#passField').hidden;
    const fail = msg => { $('#loginErr').textContent = msg; lform.classList.remove('shake'); void lform.offsetWidth; lform.classList.add('shake'); };
    if (!name) return fail('Diga seu codinome, comandante.');
    if (need) {
      if (!pass) return fail('Digite a senha de acesso.');
      const btn = $('#loginGo'); btn.disabled = true;
      try {
        const r = await fetch('api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha: pass }) });
        if (!r.ok) { btn.disabled = false; return fail(r.status === 429 ? 'Muitas tentativas. Espere um minuto.' : 'Senha incorreta.'); }
      } catch { btn.disabled = false; return fail('Não consegui falar com o servidor.'); }
      btn.disabled = false; $('#loginPass').value = '';
    }
    $('#loginErr').textContent = '';
    setUser(name); enterApp(true);
  });
  $('#eye').addEventListener('click', () => {
    const i = $('#loginPass'), show = i.type === 'password';
    i.type = show ? 'text' : 'password'; $('#eye').setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
  });
  $('#logout').addEventListener('click', async () => {
    try { await fetch('api/logout', { method: 'POST' }); } catch {}
    store.set('user', null); S.user = null; closePanel(); showLogin(await checkCore());
  });
  FX.tilt(lform, 5);
  FX.tilt($('#loginLogo'), 14, login);

  /* ---------- início ---------- */
  setMode(S.mode, { announce: false });
  cIdx = S.mode; layoutCarousel();
  $$('[data-action="new"]').forEach(b => b.tagName === 'BUTTON' && b.addEventListener('click', newConvo));
  renderSbRecent();
  S.user = store.get('user', null);
  if (S.user) setUser(S.user);
  checkCore().then(st => {
    if (!S.user || (st?.auth?.required && !st.auth.ok)) showLogin(st);
    else enterApp(false);
  });
})();
