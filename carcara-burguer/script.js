/* =========================================================
   CARCARÁ BURGUER — script
   ========================================================= */

/* ⚠️ Troque pelo WhatsApp real da loja (55 + DDD + número) */
const WHATSAPP = "5581999999999";
const TAXA_ENTREGA = 5;

/* ---------- Ingredientes (descrição ao clicar no ícone) ---------- */
const ING = {
  brioche:   { i: "🍞", n: "Pão brioche", d: "Brioche amanteigado, selado na chapa para ficar crocante por fora e macio por dentro." },
  australiano:{ i: "🍞", n: "Pão australiano", d: "Pão escuro de cacau e mel, levemente adocicado." },
  blend:     { i: "🥩", n: "Blend 160g", d: "Blend artesanal de acém e peito, moído na casa e grelhado na brasa." },
  blend2:    { i: "🥩", n: "2x Blend 160g", d: "Dois blends artesanais de 160g — 320g de carne no total." },
  carnesol:  { i: "🥩", n: "Carne de sol", d: "Carne de sol desfiada e acebolada na manteiga de garrafa." },
  frango:    { i: "🍗", n: "Frango crocante", d: "Sobrecoxa marinada no limão e empanada na farinha panko." },
  grao:      { i: "🌱", n: "Burger de grão-de-bico", d: "Grão-de-bico, beterraba e especiarias. 100% vegetal." },
  cheddar:   { i: "🧀", n: "Cheddar", d: "Cheddar inglês derretido no vapor, bem cremoso." },
  coalho:    { i: "🧀", n: "Queijo coalho", d: "Coalho artesanal do agreste, tostado na chapa até dourar." },
  bacon:     { i: "🥓", n: "Bacon", d: "Bacon em fatias defumado, bem crocante." },
  alface:    { i: "🥬", n: "Alface", d: "Alface americana fresquinha, lavada e higienizada." },
  tomate:    { i: "🍅", n: "Tomate", d: "Tomate italiano em rodelas." },
  cebola:    { i: "🧅", n: "Cebola roxa", d: "Cebola roxa crua ou caramelizada, conforme o lanche." },
  ovo:       { i: "🍳", n: "Ovo", d: "Ovo caipira com gema mole." },
  pimenta:   { i: "🌶️", n: "Pimenta biquinho + jalapeño", d: "Picância média-alta. Dá pra pedir sem nas observações." },
  manteiga:  { i: "🧈", n: "Manteiga de garrafa", d: "Tradição sertaneja: dá aquele sabor tostado e intenso." },
  molho:     { i: "🥫", n: "Molho da casa", d: "Maionese defumada com alho assado — receita secreta do Carcará." },
  abacaxi:   { i: "🍍", n: "Abacaxi grelhado", d: "Rodela de abacaxi caramelizada na brasa com canela." },
  batata:    { i: "🍟", n: "Batata frita", d: "Batata rústica com casca, sal e alecrim." },
  refri:     { i: "🥤", n: "Refrigerante lata", d: "350ml, bem gelado. Escolha o sabor nas opções." },
  mandioca:  { i: "🥔", n: "Mandioca", d: "Macaxeira cozida e frita, sequinha por dentro." },
  limao:     { i: "🍋", n: "Limão", d: "Limão taiti espremido na hora." },
  caja:      { i: "🧃", n: "Polpa de cajá", d: "Polpa natural de cajá, sem conservantes." },
};

/* ---------- Cardápio ---------- */
const MENU = [
  { id: "classico", cat: "burger", nome: "Carcará Clássico", preco: 26.9, badge: "Mais vendido",
    desc: "O nosso queridinho: blend na brasa, cheddar cremoso e molho da casa.",
    longa: "Feito pra quem gosta do básico bem feito. Pão brioche selado, blend de 160g no ponto, cheddar derretido no vapor, alface, tomate e o molho defumado da casa.",
    ings: ["brioche", "blend", "cheddar", "alface", "tomate", "molho"],
    layers: ["bun-top", "sauce", "lettuce", "tomato", "cheese", "patty", "bun-bottom"], kcal: 720, peso: "290g" },
  { id: "sertanejo", cat: "burger", nome: "Sertanejo", preco: 34.9, badge: "Assinatura",
    desc: "Blend, queijo coalho tostado, carne de sol e manteiga de garrafa.",
    longa: "Uma viagem pro sertão em cada mordida: blend de 160g, carne de sol desfiada na manteiga de garrafa, coalho tostado e cebola caramelizada.",
    ings: ["brioche", "blend", "carnesol", "coalho", "cebola", "manteiga"],
    layers: ["bun-top brioche", "onion", "coalho", "patty", "patty", "bun-bottom"], kcal: 940, peso: "360g" },
  { id: "lampiao", cat: "burger", nome: "Lampião Duplo", preco: 39.9, badge: "Monstrão",
    desc: "Dois blends de 160g, cheddar em dobro e bacon crocante.",
    longa: "Pra fome de cangaceiro: 320g de carne, cheddar duplo, bacon crocante e molho da casa no pão australiano.",
    ings: ["australiano", "blend2", "cheddar", "bacon", "molho"],
    layers: ["bun-top preto", "sauce", "cheese", "patty", "bacon", "cheese", "patty", "bun-bottom preto"], kcal: 1180, peso: "450g" },
  { id: "cangaceiro", cat: "burger", nome: "Cangaceiro Picante", preco: 32.9, badge: "🌶️ Apimentado", hot: true,
    desc: "Blend, cheddar, jalapeño, pimenta biquinho e bacon.",
    longa: "Ardência na medida certa: blend 160g, cheddar, bacon, jalapeño e pimenta biquinho, com maionese de pimenta.",
    ings: ["brioche", "blend", "cheddar", "bacon", "pimenta", "cebola"],
    layers: ["bun-top", "pepper", "bacon", "cheese", "patty", "onion", "bun-bottom"], kcal: 860, peso: "320g" },
  { id: "asabranca", cat: "burger", nome: "Asa Branca", preco: 28.9,
    desc: "Frango crocante empanado, queijo, alface e molho de limão.",
    longa: "Sobrecoxa marinada e empanada na panko, cheddar, alface, tomate e maionese de limão siciliano.",
    ings: ["brioche", "frango", "cheddar", "alface", "tomate", "molho"],
    layers: ["bun-top", "lettuce", "tomato", "cheese", "chicken", "bun-bottom"], kcal: 780, peso: "300g" },
  { id: "mandacaru", cat: "burger", nome: "Mandacaru Veggie", preco: 27.9, badge: "Novo", isNew: true,
    desc: "Burger de grão-de-bico, coalho, tomate e cebola roxa.",
    longa: "Opção vegetariana cheia de sabor: burger de grão-de-bico e beterraba, queijo coalho, alface, tomate e cebola roxa.",
    ings: ["brioche", "grao", "coalho", "alface", "tomate", "cebola"],
    layers: ["bun-top", "lettuce", "onion", "tomato", "coalho", "veg", "bun-bottom"], kcal: 610, peso: "280g" },
  { id: "baiao", cat: "burger", nome: "Baião", preco: 33.9,
    desc: "Blend, bacon, ovo de gema mole e cheddar.",
    longa: "Café da manhã que virou lanche: blend de 160g, ovo caipira de gema mole, bacon e cheddar.",
    ings: ["brioche", "blend", "ovo", "bacon", "cheddar", "alface"],
    layers: ["bun-top", "egg", "bacon", "cheese", "patty", "lettuce", "bun-bottom"], kcal: 990, peso: "350g" },
  { id: "forro", cat: "burger", nome: "Forró Tropical", preco: 31.9,
    desc: "Blend, coalho, abacaxi grelhado e bacon.",
    longa: "Doce e salgado em harmonia: blend 160g, coalho tostado, abacaxi grelhado com canela e bacon.",
    ings: ["brioche", "blend", "coalho", "abacaxi", "bacon"],
    layers: ["bun-top brioche", "pineapple", "bacon", "coalho", "patty", "bun-bottom"], kcal: 880, peso: "330g" },

  { id: "combo-lampiao", cat: "combo", nome: "Combo Lampião", preco: 49.9, de: 58.7, badge: "-15%", emoji: "🍔🍟",
    desc: "Lampião Duplo + fritas rústicas + refri lata.",
    longa: "O combo mais pedido: Lampião Duplo, porção individual de fritas rústicas e um refrigerante lata.",
    ings: ["blend2", "cheddar", "bacon", "batata", "refri"], kcal: 1650, peso: "serve 1", drink: true },
  { id: "combo-classico", cat: "combo", nome: "Combo Clássico", preco: 36.9, de: 42.7, badge: "Econômico", emoji: "🍔🥤",
    desc: "Carcará Clássico + fritas + refri lata.",
    longa: "Carcará Clássico, porção individual de fritas rústicas e um refrigerante lata.",
    ings: ["blend", "cheddar", "batata", "refri"], kcal: 1180, peso: "serve 1", drink: true },
  { id: "combo-casal", cat: "combo", nome: "Combo Casal", preco: 79.9, de: 94.6, badge: "Pra dividir", emoji: "❤️🍔",
    desc: "2 burgers à escolha + fritas grandes + 2 refris.",
    longa: "Dois burgers (Clássico, Sertanejo ou Asa Branca), porção grande de fritas e dois refrigerantes lata.",
    ings: ["blend", "batata", "refri"], kcal: 0, peso: "serve 2", drink: true },

  { id: "fritas", cat: "acompanhamento", nome: "Fritas Rústicas", preco: 14.9, emoji: "🍟",
    desc: "Batata com casca, alecrim e molho da casa.",
    longa: "Porção de 300g de batata rústica com casca, alecrim e sal grosso, acompanha molho da casa.",
    ings: ["batata", "molho"], kcal: 520, peso: "300g" },
  { id: "macaxeira", cat: "acompanhamento", nome: "Macaxeira Frita", preco: 16.9, emoji: "🥔",
    desc: "Macaxeira sequinha com queijo coalho ralado.",
    longa: "Porção de 350g de macaxeira frita com coalho ralado por cima e manteiga de garrafa.",
    ings: ["mandioca", "coalho", "manteiga"], kcal: 610, peso: "350g" },
  { id: "onion", cat: "acompanhamento", nome: "Onion Rings", preco: 17.9, emoji: "🧅",
    desc: "Anéis de cebola empanados e crocantes.",
    longa: "12 anéis de cebola empanados na panko, servidos com barbecue.",
    ings: ["cebola", "molho"], kcal: 480, peso: "250g" },

  { id: "refri", cat: "bebida", nome: "Refrigerante Lata", preco: 6.5, emoji: "🥤",
    desc: "Coca-Cola, Guaraná ou Fanta — 350ml.",
    longa: "Lata de 350ml bem gelada.", ings: ["refri"], kcal: 140, peso: "350ml", drink: true },
  { id: "suco-caja", cat: "bebida", nome: "Suco de Cajá", preco: 9.9, emoji: "🧃", badge: "Regional",
    desc: "Polpa natural de cajá batida na hora — 500ml.",
    longa: "Suco natural de cajá, 500ml. Pode pedir sem açúcar nas observações.", ings: ["caja"], kcal: 160, peso: "500ml" },
  { id: "limonada", cat: "bebida", nome: "Limonada Suíça", preco: 10.9, emoji: "🍋",
    desc: "Limão batido com casca e leite condensado — 500ml.",
    longa: "Limonada cremosa de 500ml, batida com gelo.", ings: ["limao"], kcal: 220, peso: "500ml" },
];

const EXTRAS = [
  { id: "x-bacon", n: "Bacon extra", p: 4 },
  { id: "x-cheddar", n: "Cheddar extra", p: 3 },
  { id: "x-ovo", n: "Ovo", p: 3 },
  { id: "x-blend", n: "+ Blend 160g", p: 9 },
];
const PONTOS = ["Mal passado", "Ao ponto", "Bem passado"];
const SABORES = ["Coca-Cola", "Guaraná", "Fanta Laranja"];

/* ---------- Helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const byId = (id) => MENU.find((m) => m.id === id);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

function illustration(item, big = false) {
  if (item.layers) {
    return `<div class="ill ${big ? "ill--big" : ""}">${item.layers
      .map((l, i) => `<div class="l-${l}" style="animation-delay:${(item.layers.length - i) * 0.06}s"></div>`)
      .join("")}</div>`;
  }
  return `<span class="card__emoji">${item.emoji}</span>`;
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* =========================================================
   HAMBÚRGUER 3D (CSS 3D puro)
   ========================================================= */
const Burger3D = (() => {
  const root = $("#burger3d");
  const stage = $("#stage");

  function slice(size, y, color, extra = "") {
    return `<div class="slice" style="width:${size}px;height:${size}px;left:${-size / 2}px;top:${-size / 2}px;background:${color};transform:translateY(${y}px) rotateX(90deg);${extra}"></div>`;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  function shade(c1, c2, t) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = p(c1), b = p(c2);
    return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(",")})`;
  }

  // cilindro: diâmetro, base y, altura, cor lateral escura -> topo claro
  function cylinder(d, y0, h, dark, light, topBg, extra = "") {
    let html = "";
    for (let k = 0; k <= h; k += 2) {
      const t = k / h;
      const isTop = k + 2 > h;
      html += slice(d, y0 - k, isTop && topBg ? topBg : shade(dark, light, t * 0.8), isTop ? extra : "");
    }
    return html;
  }

  const LAYERS = [
    // pão de baixo
    () => cylinder(220, 0, 22, "#a5551b", "#e7a258", "radial-gradient(circle,#f3c48a,#e0a056)"),
    // alface
    () => slice(250, -24, "#6cbf2f", "clip-path:polygon(" + wavy(26) + ");background:radial-gradient(circle,#a6e063,#5aa823)") +
          slice(246, -26, "#83cf40", "clip-path:polygon(" + wavy(26, 0.12) + ");background:radial-gradient(circle,#b8ea7a,#6cbf2f)"),
    // tomate
    () => cylinder(205, -28, 6, "#a9180a", "#e8321f", "radial-gradient(circle,#ff7d68 0 18%,#e8321f 19% 62%,#ff6a52 63% 70%,#d4210f 71%)"),
    // carne
    () => cylinder(232, -36, 26, "#2e1408", "#5d3119",
          "radial-gradient(circle 2px,#2a120a 90%,transparent) 0 0/10px 8px, radial-gradient(circle,#6e3c20,#4a2614)"),
    // queijo (quadrado inclinado)
    () => `<div class="slice" style="width:200px;height:200px;left:-100px;top:-100px;border-radius:14px;background:linear-gradient(135deg,#ffcb2e,#ffa800);transform:translateY(-64px) rotateX(90deg) rotateZ(38deg)"></div>` +
          `<div class="slice" style="width:200px;height:200px;left:-100px;top:-100px;border-radius:14px;background:#e89400;transform:translateY(-62px) rotateX(90deg) rotateZ(38deg)"></div>`,
    // bacon
    () => [0, 60, 125].map((r, i) =>
      `<div class="slice" style="width:200px;height:30px;left:-100px;top:-15px;border-radius:12px;background:repeating-linear-gradient(90deg,#b8331b 0 14px,#f2a081 14px 19px,#8b2010 19px 26px);transform:translateY(${-67 - i}px) rotateX(90deg) rotateZ(${r}deg)"></div>`).join(""),
    // pão de cima (domo)
    () => dome(),
  ];

  function wavy(n, rot = 0) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 + rot;
      const r = i % 2 ? 50 : 44;
      pts.push(`${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`);
    }
    return pts.join(",");
  }

  function dome() {
    const R = 116, H = 78, y0 = -72;
    let html = cylinder(R * 2, y0, 8, "#9c4c14", "#c9722a");
    for (let h = 8; h <= H; h += 2.5) {
      const t = (h - 8) / (H - 8);
      const r = R * Math.sqrt(Math.max(0, 1 - t * t * 0.98));
      html += slice(r * 2, y0 - h, shade("#c46a20", "#f6c07a", Math.pow(t, 0.8)));
    }
    // gergelim
    const seeds = 22;
    for (let i = 0; i < seeds; i++) {
      const golden = i * 2.399963;
      const rr = Math.sqrt((i + 0.6) / seeds) * 0.82;
      const x = Math.cos(golden) * rr * R;
      const z = Math.sin(golden) * rr * R;
      const t = Math.sqrt(1 - Math.min(1, (rr * rr) / 0.98));
      const y = y0 - 8 - t * (H - 8) - 2;
      html += `<div class="seed" style="transform:translate3d(${x}px,${y}px,${z}px) rotateY(${-golden}rad) rotateX(${70 - t * 60}deg)"></div>`;
    }
    return html;
  }

  let rotY = 20, rotX = -24, spinning = true, dragging = false, lastX = 0, lastY = 0, raf;

  function build() {
    stage.classList.remove("is-ready");
    root.innerHTML = LAYERS.map((fn, i) =>
      `<div class="b-layer drop" style="animation-delay:${0.25 + i * 0.28}s">${fn()}</div>`).join("");
    const total = 250 + LAYERS.length * 280 + 600;
    setTimeout(() => stage.classList.add("is-ready"), total);
  }

  function tick() {
    if (spinning && !dragging) rotY += 0.35;
    root.style.setProperty("--ry", rotY + "deg");
    root.style.setProperty("--rx", rotX + "deg");
    raf = requestAnimationFrame(tick);
  }

  function initDrag() {
    const down = (x, y) => { dragging = true; lastX = x; lastY = y; };
    const move = (x, y) => {
      if (!dragging) return;
      rotY += (x - lastX) * 0.6;
      rotX = Math.max(-60, Math.min(-5, rotX - (y - lastY) * 0.3));
      lastX = x; lastY = y;
    };
    const up = () => { dragging = false; };
    stage.addEventListener("pointerdown", (e) => down(e.clientX, e.clientY));
    window.addEventListener("pointermove", (e) => move(e.clientX, e.clientY));
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  function init() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    spinning = !reduce;
    build();
    initDrag();
    tick();
    $("#rebuild").addEventListener("click", build);
    // pausa quando fora da tela
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) tick(); }
      else { cancelAnimationFrame(raf); raf = null; }
    }).observe(stage);
  }
  return { init };
})();

/* =========================================================
   CARDÁPIO
   ========================================================= */
function renderMenu(filter = "todos") {
  const grid = $("#menuGrid");
  const items = MENU.filter((m) => filter === "todos" || m.cat === filter);
  grid.innerHTML = items.map((m, idx) => `
    <article class="card card--${m.cat}" style="animation-delay:${idx * 0.05}s" data-id="${m.id}">
      <div class="card__media" tabindex="0" role="button" aria-label="Ver detalhes de ${m.nome}" data-open="${m.id}">
        ${m.badge ? `<span class="card__badge ${m.hot ? "card__badge--hot" : ""} ${m.isNew ? "card__badge--new" : ""}">${m.badge}</span>` : ""}
        ${illustration(m)}
        <span class="card__zoom">Ver detalhes</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${m.nome}</h3>
        <p class="card__desc">${m.desc}</p>
        <div class="card__icons">
          ${m.ings.map((k) => `<button class="ing" type="button" data-ing="${k}" title="${ING[k].n}" aria-label="${ING[k].n}">${ING[k].i}</button>`).join("")}
        </div>
        <p class="card__info"></p>
        <div class="card__foot">
          <div class="price">${m.de ? `<s>${brl(m.de)}</s>` : ""}${brl(m.preco)}<small>${m.peso}${m.kcal ? " · " + m.kcal + " kcal" : ""}</small></div>
          <button class="add-btn" type="button" data-quick="${m.id}" aria-label="Adicionar ${m.nome}">+</button>
        </div>
      </div>
    </article>`).join("");
}

function initMenu() {
  renderMenu();
  const grid = $("#menuGrid");

  grid.addEventListener("click", (e) => {
    const ing = e.target.closest(".ing");
    if (ing) {
      const card = ing.closest(".card");
      const info = $(".card__info", card);
      const wasActive = ing.classList.contains("is-active");
      $$(".ing", card).forEach((b) => b.classList.remove("is-active"));
      if (wasActive) { info.classList.remove("is-open"); return; }
      ing.classList.add("is-active");
      const d = ING[ing.dataset.ing];
      info.innerHTML = `<b>${d.i} ${d.n}:</b> ${d.d}`;
      info.classList.add("is-open");
      return;
    }
    const open = e.target.closest("[data-open]");
    if (open) return openProduct(open.dataset.open);
    const quick = e.target.closest("[data-quick]");
    if (quick) {
      const item = byId(quick.dataset.quick);
      // burgers e combos abrem personalização; demais adicionam direto
      if (item.cat === "burger" || item.drink) return openProduct(item.id);
      addToCart(item.id, 1, []);
    }
  });
  grid.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-open]")) {
      e.preventDefault();
      openProduct(e.target.dataset.open);
    }
  });

  $$(".filter").forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  $$("[data-filter-link]").forEach((a) => a.addEventListener("click", () => setFilter(a.dataset.filterLink)));
}

function setFilter(f) {
  $$(".filter").forEach((x) => x.classList.toggle("is-active", x.dataset.filter === f));
  renderMenu(f);
}

/* =========================================================
   MODAL DE PRODUTO
   ========================================================= */
let current = null, qty = 1;

function openProduct(id, pushHash = true) {
  const m = byId(id);
  if (!m) return;
  current = m; qty = 1;
  $("#pmVisual").innerHTML = illustration(m, true);
  $("#pmTags").innerHTML = [m.badge, { burger: "Burger", combo: "Combo", acompanhamento: "Acompanhamento", bebida: "Bebida" }[m.cat]]
    .filter(Boolean).map((t) => `<span>${t}</span>`).join("");
  $("#pmTitle").textContent = m.nome;
  $("#pmDesc").textContent = m.longa;
  $("#pmFacts").innerHTML = [
    `⚖️ ${m.peso}`, m.kcal ? `🔥 ${m.kcal} kcal` : "", m.cat === "burger" ? "⏱️ 15–20 min" : "",
  ].filter(Boolean).map((f) => `<span>${f}</span>`).join("");
  $("#pmIngredients").innerHTML = m.ings.map((k) =>
    `<button class="ing" type="button" data-ing="${k}">${ING[k].i} ${ING[k].n}</button>`).join("");
  $("#pmIngInfo").textContent = "";

  let opts = "";
  if (m.cat === "burger" && m.ings.some((k) => k.startsWith("blend"))) {
    opts += `<div class="opt-group"><h4>Ponto da carne</h4><div class="opts">${PONTOS.map((p, i) =>
      `<label class="opt"><input type="radio" name="ponto" value="${p}" ${i === 1 ? "checked" : ""}/><span>${p}</span></label>`).join("")}</div></div>`;
  }
  if (m.cat === "burger") {
    opts += `<div class="opt-group"><h4>Turbine seu lanche</h4><div class="opts">${EXTRAS.map((x) =>
      `<label class="opt"><input type="checkbox" name="extra" value="${x.id}"/><span>${x.n} <em>+${brl(x.p)}</em></span></label>`).join("")}</div></div>`;
  }
  if (m.drink) {
    opts += `<div class="opt-group"><h4>Sabor do refri</h4><div class="opts">${SABORES.map((s, i) =>
      `<label class="opt"><input type="radio" name="sabor" value="${s}" ${i === 0 ? "checked" : ""}/><span>${s}</span></label>`).join("")}</div></div>`;
  }
  $("#pmOptions").innerHTML = opts;
  updateModalPrice();
  openModal("#productModal");
  if (pushHash) history.replaceState(null, "", "#produto-" + m.id);
}

function selectedOptions() {
  const out = [];
  const ponto = $("#pmOptions input[name=ponto]:checked");
  if (ponto) out.push({ n: ponto.value, p: 0 });
  $$("#pmOptions input[name=extra]:checked").forEach((c) => {
    const x = EXTRAS.find((e) => e.id === c.value);
    out.push({ n: x.n, p: x.p });
  });
  const sabor = $("#pmOptions input[name=sabor]:checked");
  if (sabor) out.push({ n: sabor.value, p: 0 });
  return out;
}

function updateModalPrice() {
  const extra = selectedOptions().reduce((s, o) => s + o.p, 0);
  $("#qtyValue").textContent = qty;
  $("#pmPrice").textContent = brl((current.preco + extra) * qty);
}

function initModal() {
  $("#pmOptions").addEventListener("change", updateModalPrice);
  $("#qtyMinus").addEventListener("click", () => { qty = Math.max(1, qty - 1); updateModalPrice(); });
  $("#qtyPlus").addEventListener("click", () => { qty = Math.min(20, qty + 1); updateModalPrice(); });
  $("#pmIngredients").addEventListener("click", (e) => {
    const b = e.target.closest(".ing");
    if (!b) return;
    $$("#pmIngredients .ing").forEach((x) => x.classList.toggle("is-active", x === b));
    const d = ING[b.dataset.ing];
    $("#pmIngInfo").innerHTML = `<b>${d.n}:</b> ${d.d}`;
  });
  $("#pmAdd").addEventListener("click", () => {
    addToCart(current.id, qty, selectedOptions());
    closeModal("#productModal");
  });
  $("#pmShare").addEventListener("click", async () => {
    const url = location.href.split("#")[0] + "#produto-" + current.id;
    try { await navigator.clipboard.writeText(url); toast("🔗 Link copiado!"); }
    catch { prompt("Copie o link:", url); }
  });

  $$(".modal").forEach((m) => m.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal("#" + m.id);
  }));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    $$(".modal.is-open").forEach((m) => closeModal("#" + m.id));
    closeCart();
  });
}

let lastFocus;
function openModal(sel) {
  lastFocus = document.activeElement;
  const m = $(sel);
  m.classList.add("is-open");
  m.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
  setTimeout(() => $(".modal__close", m).focus(), 50);
}
function closeModal(sel) {
  const m = $(sel);
  if (!m.classList.contains("is-open")) return;
  m.classList.remove("is-open");
  m.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock");
  if (sel === "#productModal" && location.hash.startsWith("#produto-")) history.replaceState(null, "", "#cardapio");
  lastFocus?.focus?.();
}

/* =========================================================
   SACOLA
   ========================================================= */
let cart = store.get("carcara-cart", []);

const lineKey = (id, opts) => id + "|" + opts.map((o) => o.n).join(",");
const unitPrice = (l) => byId(l.id).preco + l.opts.reduce((s, o) => s + o.p, 0);
const subtotal = () => cart.reduce((s, l) => s + unitPrice(l) * l.qty, 0);
const count = () => cart.reduce((s, l) => s + l.qty, 0);

function addToCart(id, q, opts) {
  const key = lineKey(id, opts);
  const found = cart.find((l) => l.key === key);
  if (found) found.qty += q; else cart.push({ key, id, qty: q, opts });
  saveCart();
  const btn = $("#cartBtn");
  btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  toast(`✅ ${q}x ${byId(id).nome} na sacola!`);
}
function changeQty(key, delta) {
  const l = cart.find((x) => x.key === key);
  if (!l) return;
  l.qty += delta;
  if (l.qty <= 0) cart = cart.filter((x) => x.key !== key);
  saveCart();
}
function saveCart() { store.set("carcara-cart", cart); renderCart(); }

function linesHTML() {
  if (!cart.length) {
    return `<div class="empty"><div>🍔</div><p>Sua sacola está vazia.<br/>Bora escolher um Carcará?</p></div>`;
  }
  return cart.map((l) => {
    const m = byId(l.id);
    const emoji = m.emoji ? [...m.emoji][0] : "🍔";
    return `<div class="line">
      <span class="line__emoji">${emoji}</span>
      <div><span class="line__name">${m.nome}</span>
        ${l.opts.length ? `<span class="line__extra">${l.opts.map((o) => o.n).join(" · ")}</span>` : ""}
        <span class="line__qty"><button type="button" data-dec="${l.key}" aria-label="Menos">−</button><b>${l.qty}</b><button type="button" data-inc="${l.key}" aria-label="Mais">+</button></span>
      </div>
      <span class="line__price">${brl(unitPrice(l) * l.qty)}</span>
    </div>`;
  }).join("");
}

function upsellHTML() {
  if (!cart.length) return "";
  const hasSide = cart.some((l) => ["acompanhamento", "combo"].includes(byId(l.id).cat));
  const hasDrink = cart.some((l) => byId(l.id).cat === "bebida" || byId(l.id).drink);
  if (!hasSide) return `<div class="upsell">🍟 Que tal umas <b>fritas rústicas</b>? <button type="button" data-upsell="fritas">+ ${brl(14.9)}</button></div>`;
  if (!hasDrink) return `<div class="upsell">🧃 Acompanha um <b>suco de cajá</b>? <button type="button" data-upsell="suco-caja">+ ${brl(9.9)}</button></div>`;
  return "";
}

function frete() {
  return $("input[name=entrega]:checked")?.value === "delivery" && cart.length ? TAXA_ENTREGA : 0;
}

function renderCart() {
  const c = count(), sub = subtotal();
  const badge = $("#cartCount");
  badge.textContent = c;
  badge.classList.toggle("has-items", c > 0);
  $("#drawerItems").innerHTML = linesHTML() + upsellHTML();
  $("#drawerTotal").textContent = brl(sub);
  $("#summaryItems").innerHTML = linesHTML();
  $("#sumSubtotal").textContent = brl(sub);
  $("#sumFrete").textContent = frete() ? brl(frete()) : "Grátis";
  $("#sumTotal").textContent = brl(sub + frete());
  $("#floatTotal").textContent = c ? `${c} · ${brl(sub)}` : "";
  updateFloatCta();
}

function openCart() {
  const d = $("#cartDrawer");
  d.classList.add("is-open");
  d.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock");
}
function closeCart() {
  const d = $("#cartDrawer");
  if (!d.classList.contains("is-open")) return;
  d.classList.remove("is-open");
  d.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lock");
}

function initCart() {
  $("#cartBtn").addEventListener("click", openCart);
  document.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (inc) changeQty(inc.dataset.inc, 1);
    if (dec) changeQty(dec.dataset.dec, -1);
    const up = e.target.closest("[data-upsell]");
    if (up) addToCart(up.dataset.upsell, 1, []);
    const add = e.target.closest("[data-add]");
    if (add) openProduct(add.dataset.add);
    if (e.target.closest("[data-close-cart]")) closeCart();
  });
  $("#goCheckout").addEventListener("click", (e) => {
    closeCart();
    if (!cart.length) { e.preventDefault(); toast("Adicione um item primeiro 🍔"); location.hash = "cardapio"; }
  });
  renderCart();
}

/* =========================================================
   FORMULÁRIO
   ========================================================= */
function maskPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

function initForm() {
  const form = $("#orderForm");
  const tel = $("#telefone");
  tel.addEventListener("input", () => { tel.value = maskPhone(tel.value); });

  const addr = $("#addressFields");
  form.addEventListener("change", (e) => {
    if (e.target.name === "entrega") {
      addr.classList.toggle("is-hidden", e.target.value !== "delivery");
      renderCart();
    }
    if (e.target.name === "pagamento") $("#trocoField").hidden = e.target.value !== "Dinheiro";
  });

  const saved = store.get("carcara-cliente", null);
  if (saved) ["nome", "telefone", "rua", "numero", "bairro", "referencia"].forEach((k) => { if (saved[k]) form[k].value = saved[k]; });

  form.addEventListener("input", (e) => {
    const f = e.target.closest(".field");
    if (f?.classList.contains("invalid")) { f.classList.remove("invalid"); $(".error", f).textContent = ""; }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cart.length) {
      toast("Sua sacola está vazia — escolha seu Carcará! 🍔");
      document.getElementById("cardapio").scrollIntoView();
      return;
    }
    const delivery = form.entrega.value === "delivery";
    const rules = [
      ["nome", (v) => v.trim().split(/\s+/).length >= 2, "Informe nome e sobrenome."],
      ["telefone", (v) => v.replace(/\D/g, "").length >= 10, "Informe um WhatsApp válido com DDD."],
    ];
    if (delivery) {
      rules.push(["rua", (v) => v.trim().length > 2, "Informe a rua."]);
      rules.push(["numero", (v) => v.trim().length > 0, "Informe o número."]);
      rules.push(["bairro", (v) => v.trim().length > 1, "Informe o bairro."]);
    }
    let firstBad = null;
    rules.forEach(([name, ok, msg]) => {
      const input = form[name], field = input.closest(".field");
      const valid = ok(input.value);
      field.classList.toggle("invalid", !valid);
      $(".error", field).textContent = valid ? "" : msg;
      if (!valid && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    store.set("carcara-cliente", { nome: data.nome, telefone: data.telefone, rua: data.rua, numero: data.numero, bairro: data.bairro, referencia: data.referencia });

    const total = subtotal() + frete();
    const num = "#" + String(Date.now()).slice(-5);
    const itens = cart.map((l) => `• ${l.qty}x ${byId(l.id).nome}${l.opts.length ? " (" + l.opts.map((o) => o.n).join(", ") + ")" : ""} — ${brl(unitPrice(l) * l.qty)}`).join("\n");
    const msg = [
      `*Pedido ${num} — Carcará Burguer* 🍔`, "",
      itens, "",
      `Subtotal: ${brl(subtotal())}`,
      `Entrega: ${frete() ? brl(frete()) : "Retirada na loja"}`,
      `*Total: ${brl(total)}*`, "",
      `👤 ${data.nome}`, `📱 ${data.telefone}`,
      delivery ? `📍 ${data.rua}, ${data.numero} — ${data.bairro}${data.referencia ? " (" + data.referencia + ")" : ""}` : "🏪 Vou retirar na loja",
      `💳 ${data.pagamento}${data.pagamento === "Dinheiro" && data.troco ? " — troco para R$ " + data.troco : ""}`,
      data.obs ? `📝 ${data.obs}` : "",
    ].filter((x) => x !== "").join("\n");

    $("#okNumber").textContent = num;
    $("#okTotal").textContent = brl(total);
    $("#okEta").textContent = delivery ? "35 a 50 minutos" : "20 a 30 minutos";
    $("#okWhats").href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    openModal("#successModal");

    cart = [];
    saveCart();
    form.obs.value = "";
  });
}

/* =========================================================
   UI GERAL
   ========================================================= */
function updateFloatCta() {
  const cta = $("#floatCta");
  const menuTop = $("#cardapio").getBoundingClientRect().top;
  const checkoutTop = $("#pedido").getBoundingClientRect().top;
  const inMenu = menuTop < window.innerHeight * 0.5;
  const inCheckout = checkoutTop < window.innerHeight * 0.8;
  if (inCheckout || scrollY < window.innerHeight * 0.6) cta.classList.add("is-hidden");
  else cta.classList.remove("is-hidden");
  // dentro do cardápio, o CTA vira "Finalizar pedido"
  if (inMenu && count()) {
    cta.href = "#pedido";
    cta.firstElementChild.textContent = "🛍️ Finalizar pedido";
  } else {
    cta.href = "#cardapio";
    cta.firstElementChild.textContent = "🍔 Ver cardápio";
  }
}

function initUI() {
  $("#year").textContent = new Date().getFullYear();

  const header = $(".header");
  const links = $$(".nav__link");
  const sections = ["inicio", "cardapio", "pedido"].map((id) => document.getElementById(id));
  const onScroll = () => {
    header.classList.toggle("is-scrolled", scrollY > 30);
    const pos = scrollY + window.innerHeight * 0.35;
    let active = "inicio";
    sections.forEach((s) => { if (s.offsetTop <= pos) active = s.id; });
    links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + active));
    updateFloatCta();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = $("#menuToggle"), nav = $("#nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.forEach((l) => l.addEventListener("click", () => { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", false); }));

  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$(".reveal").forEach((el) => io.observe(el));
}

/* Link direto: #cardapio, #produto-sertanejo etc. */
function handleHash() {
  const h = location.hash;
  if (h.startsWith("#produto-")) {
    const id = h.replace("#produto-", "");
    if (byId(id)) {
      document.getElementById("cardapio").scrollIntoView();
      setTimeout(() => openProduct(id, false), 300);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initUI();
  Burger3D.init();
  initMenu();
  initModal();
  initCart();
  initForm();
  handleHash();
  window.addEventListener("hashchange", handleHash);
});
