// Motor do template NGraph Reels: gancho no topo, legenda dinâmica, vinheta final.
(function () {
  const css = `
  @font-face{font-family:Anton;src:url(fonts/1Ptgg87LROyAm0K0.ttf)}
  @font-face{font-family:Mont;font-weight:900;src:url(fonts/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvC70w-.ttf)}
  @font-face{font-family:Mont;font-weight:800;src:url(fonts/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvr70w-.ttf)}
  @font-face{font-family:IT;font-weight:500;src:url(fonts/NGSnv5HMAFg6IuGlBNMjxJEL2VmU3NS7Z2mjPQ-qXA.ttf)}
  @font-face{font-family:IT;font-weight:700;src:url(fonts/NGSnv5HMAFg6IuGlBNMjxJEL2VmU3NS7Z2mj6AiqXA.ttf)}
  @font-face{font-family:IT;font-weight:800;src:url(fonts/NGSnv5HMAFg6IuGlBNMjxJEL2VmU3NS7Z2mjjwiqXA.ttf)}
  html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#05070f}
  *{box-sizing:border-box}
  #stage{position:absolute;inset:0;overflow:hidden}
  .abs{position:absolute}
  #hook{position:absolute;left:60px;right:60px;top:250px;text-align:center;z-index:50}
  #hook .ln{display:inline-block;background:#0a0a0a;color:#fff;font:800 54px/1.12 Mont,'Noto Color Emoji';
     padding:10px 22px 14px;border-radius:14px;margin:0 0 8px;letter-spacing:-.5px}
  #cap{position:absolute;left:40px;right:140px;top:1230px;text-align:center;z-index:50;
     font:96px/1 Anton;text-transform:uppercase;color:#fff;letter-spacing:1px;
     -webkit-text-stroke:10px #000;paint-order:stroke fill;text-shadow:0 8px 24px rgba(0,0,0,.55)}
  #cap span{display:inline-block;margin:0 .12em}
  #cap .hl{color:#2f7bff}
  #end{position:absolute;inset:0;z-index:40;opacity:0}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const E = window.E = {};
  E.cl = x => Math.max(0, Math.min(1, x));
  E.p = (t, a, b) => E.cl((t - a) / (b - a));
  E.eo = x => 1 - Math.pow(1 - x, 3);
  E.eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  E.eb = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2) };
  E.lerp = (a, b, k) => a + (b - a) * k;
  E.$ = id => document.getElementById(id);

  // Gancho: lista de {t0,t1,lines:[...]}
  E.hook = function (t, hooks) {
    const el = E.$('hook');
    const h = hooks.find(h => t >= h.t0 && t < h.t1);
    if (!h) { el.innerHTML = ''; return; }
    const key = hooks.indexOf(h);
    if (el.dataset.k != key) { el.innerHTML = h.lines.map(l => `<span class="ln">${l}</span>`).join('<br>'); el.dataset.k = key; }
    const k = E.eb(E.p(t, h.t0, h.t0 + .35));
    el.style.transform = `translateY(${(1 - k) * -30}px) scale(${.9 + .1 * k})`;
    el.style.opacity = E.p(t, h.t0, h.t0 + .2);
  };

  // Legenda: lista de [t0, t1, "TEXTO COM *DESTAQUE*"]
  E.caption = function (t, caps) {
    const el = E.$('cap');
    const c = caps.find(c => t >= c[0] && t < c[1]);
    if (!c) { el.innerHTML = ''; el.dataset.k = ''; return; }
    if (el.dataset.k != c[0]) {
      el.innerHTML = c[2].replace(/\*([^*]+)\*/g, '\u0001$1\u0002').split(/(\u0001[^\u0002]*\u0002)/).map(seg => seg.startsWith('\u0001') ? `<span class="hl">${seg.slice(1, -1)}</span>` : seg.trim().split(/\s+/).filter(Boolean).map(w => `<span>${w}</span>`).join(' ')).join(' ');
      el.dataset.k = c[0];
    }
    const k = E.eb(E.p(t, c[0], c[0] + .16));
    el.style.transform = `scale(${.7 + .3 * k})`;
    el.style.opacity = E.p(t, c[0], c[0] + .06);
  };

  // Vinheta final com a logo vetorial (assets/logo_paths.js -> window.NG)
  const LET = [[203, 334], [353, 473], [491, 623], [643, 768], [788, 910]];
  E.buildEnd = function (sub, contato) {
    const N = window.NG;
    const ns = 'http://www.w3.org/2000/svg';
    E.$('end').innerHTML = `
     <div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 45%,#fff 0%,#eef0fa 60%,#dfe3f5 100%)"></div>
     <svg class="abs" id="elogo" style="left:80px;top:800px;transform-origin:460px 130px" width="920" height="260" viewBox="0 0 972 275" xmlns="${ns}">
       ${N.defs.replace('<defs>', '<defs>' +
         '<clipPath id="cpM"><rect id="rM" x="-10" y="275" width="64.3" height="300"/></clipPath>' +
         '<clipPath id="cpB"><polygon id="pB" points="54.3,0 54.3,0 54.3,0"/></clipPath>' +
         '<clipPath id="cpO"><rect id="rO" x="131.2" y="-20" width="80" height="0"/></clipPath>' +
         LET.map((l, i) => `<clipPath id="cL${i}"><rect x="${l[0]}" y="55" width="${l[1] - l[0]}" height="160"/></clipPath>`).join('') +
         '<clipPath id="cT"><rect id="rT" x="200" y="220" width="0" height="60"/></clipPath>')}
       ${['cpM', 'cpB', 'cpO'].map(c => `<g clip-path="url(#${c})"><path d="${N.sym1}" fill="url(#paint0_linear_259_122)"/><path d="${N.sym2}" fill="url(#paint1_linear_259_122)"/></g>`).join('')}
       ${LET.map((l, i) => `<g clip-path="url(#cL${i})"><g id="eL${i}"><path d="${N.text}" fill="#0a0a0a"/></g></g>`).join('')}
       <g clip-path="url(#cT)"><path d="${N.tag}" fill="#0a0a0a"/></g>
     </svg>
     <div class="abs" id="esub" style="left:0;right:0;top:1100px;text-align:center;font:700 42px IT;color:#1e3f99;opacity:0">${sub}</div>
     <div class="abs" id="econ" style="left:0;right:0;top:1170px;text-align:center;opacity:0">
       <span style="display:inline-flex;align-items:center;gap:14px;background:#0a0a0a;color:#fff;font:800 44px IT;padding:16px 30px;border-radius:999px">
       <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1.1" fill="#fff" stroke="none"/></svg>${contato || '@ngraph.pe'}</span></div>`;
  };
  E.renderEnd = function (t, t0) {
    const x = t - t0, p = E.p, eo = E.eo, eb = E.eb;
    E.$('end').style.opacity = p(x, 0, .25);
    E.$('end').style.clipPath = `circle(${eo(p(x, 0, .5)) * 120}% at 50% 50%)`;
    const km = eo(p(x, .2, .6)), kb = eo(p(x, .35, .75)), ko = eo(p(x, .5, .9));
    E.$('rM').setAttribute('y', 280 - km * 290);
    const d = kb * 520; E.$('pB').setAttribute('points', `54.3,-20 ${54.3 + d},-20 54.3,${-20 + d}`);
    E.$('rO').setAttribute('height', ko * 300);
    for (let i = 0; i < 5; i++) E.$('eL' + i).setAttribute('transform', `translate(0 ${(1 - eb(p(x, .7 + i * .07, 1.15 + i * .07))) * 165})`);
    E.$('rT').setAttribute('width', eo(p(x, 1.2, 1.7)) * 760);
    E.$('esub').style.opacity = p(x, 1.5, 1.8);
    E.$('esub').style.transform = `translateY(${(1 - eo(p(x, 1.5, 1.9))) * 30}px)`;
    const kc = eb(p(x, 1.8, 2.25)); E.$('econ').style.opacity = p(x, 1.8, 1.95);
    E.$('econ').style.transform = `scale(${.7 + .3 * kc})`;
    E.$('elogo').style.transform = `scale(${.9 + .1 * eo(p(x, .2, 1.4)) + .02 * p(x, 1.4, 4)})`;
  };
})();
