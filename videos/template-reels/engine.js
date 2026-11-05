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

  // Vinheta final com a logo (monta camadas em #end)
  E.buildEnd = function (sub) {
    const LX = [236, 377, 507, 650, 788], LW = [121, 112, 123, 117, 113];
    E.$('end').innerHTML = `
     <div class="abs" id="endbg" style="inset:0;background:radial-gradient(ellipse at 50% 45%,#fff 0%,#eef0fa 60%,#dfe3f5 100%)"></div>
     <div class="abs" id="elogo" style="left:80px;top:820px;width:920px;height:240px;transform-origin:460px 120px">
       <img class="abs" id="enm" src="assets/n_mag.png"><img class="abs" id="enb" src="assets/n_blu.png"><img class="abs" id="eno" src="assets/n_ora.png">
       ${LX.map((x, i) => `<div class="abs" style="left:${x}px;top:0;width:${LW[i]}px;height:172px;overflow:hidden"><img class="abs" id="el${i}" src="assets/L${i}.png"></div>`).join('')}
       <div class="abs" id="etag" style="left:0;top:172px;height:68px;width:0;overflow:hidden"><img class="abs" src="assets/tag.png"></div>
     </div>
     <div class="abs" id="esub" style="left:0;right:0;top:1110px;text-align:center;font:700 44px IT;color:#1e3f99;opacity:0">${sub}</div>`;
  };
  E.renderEnd = function (t, t0) {
    const x = t - t0, p = E.p, eo = E.eo, eb = E.eb;
    E.$('end').style.opacity = p(x, 0, .25);
    E.$('end').style.clipPath = `circle(${eo(p(x, 0, .5)) * 120}% at 50% 50%)`;
    const km = eo(p(x, .2, .6)), kb = eo(p(x, .35, .75)), ko = eo(p(x, .5, .9));
    E.$('enm').style.clipPath = `inset(${(1 - km) * 100}% 0 0 0)`;
    E.$('enb').style.clipPath = `polygon(0 0, ${kb * 520}px 0, 0 ${kb * 520}px)`;
    E.$('eno').style.clipPath = `inset(0 0 ${(1 - ko) * 100}% 0)`;
    for (let i = 0; i < 5; i++) E.$('el' + i).style.transform = `translateY(${(1 - eb(p(x, .7 + i * .07, 1.15 + i * .07))) * 175}px)`;
    E.$('etag').style.width = eo(p(x, 1.2, 1.7)) * 920 + 'px';
    E.$('esub').style.opacity = p(x, 1.5, 1.8);
    E.$('esub').style.transform = `translateY(${(1 - eo(p(x, 1.5, 1.9))) * 30}px)`;
    E.$('elogo').style.transform = `scale(${.9 + .1 * eo(p(x, .2, 1.4)) + .02 * p(x, 1.4, 4)})`;
  };
})();
