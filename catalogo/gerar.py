# Gera o catálogo (index.html). Para mudar produtos, fotos ou textos, edite as listas abaixo e rode:
#   python3 gerar.py
# Depois gere o PDF com:  node pdf.js
from urllib.parse import quote

WHATS = '5581971063561'
SITE = 'https://ngraph.com.br/'
CATALOGO_URL = 'https://ngraph.com.br/catalogo/'

def wa(msg):
    return f'https://wa.me/{WHATS}?text=' + quote(msg)

# ---------- produtos (fotos reais de trabalhos do site) ----------
COMUNICACAO = [
  dict(id='acm', nome='Fachadas em ACM',
       desc='Painéis de Alumínio Composto sob medida, com projeto, fabricação e instalação completos.',
       tags=['Projeto, fabricação e instalação', 'Resistente ao tempo', 'Opção com iluminação LED'],
       fotos=[('acm-dpaleteiros', "D'Paleteiros"), ('acm-innova', 'Innova Cell'), ('acm-dpaula', "Drogaria D'Paula"),
              ('acm-assembleia', 'Assembleia de Deus'), ('acm-mendes', 'Mendes Import Car')]),
  dict(id='letreiros', nome='Letreiros e letras caixa 3D',
       desc='Letras caixa feitas em impressora 3D, com acabamento premium e identidade personalizada.',
       tags=['Impressão 3D', 'Acabamento premium', 'Com ou sem iluminação'],
       fotos=[('letreiro-reidapizza', 'O Rei da Pizza'), ('letreiro-fibernett', 'Grupo Fibernett')]),
  dict(id='acrilico', nome='Letras em acrílico',
       desc='Letras em acrílico com acabamento de alto padrão, para fachadas e ambientes internos.',
       tags=['Opção com iluminação de fundo', 'Alto padrão', 'Sob medida'],
       fotos=[('acrilico-espelhomeu', 'Studio Espelho Meu'), ('acrilico-blaser', 'Blaser'), ('acrilico-revitafio', 'Revitafio')]),
  dict(id='neon', nome='Letreiro em Neon LED',
       desc='Letreiro em Neon LED personalizado com a sua marca, para destacar de dia e de noite.',
       tags=['Personalizado', 'Destaque à noite'],
       fotos=[('neon-espelhomeu', 'Espelho Meu Studio de Beleza')]),
  dict(id='sinalizacao', nome='Placas de sinalização',
       desc='Placas informativas e de sinalização em PS (poliestireno), para fachadas, estacionamentos e ambientes internos.',
       tags=['PS (poliestireno)', 'Uso interno e externo'],
       fotos=[('sinalizacao', 'Placa informativa')]),
]
# Gráfica: ainda sem fotos de trabalhos — usa ícones. Troque por fotos quando tiver (campo "foto").
GRAFICA = [
  dict(id='cartoes', nome='Cartões de visita', desc='Cartões com a identidade da sua marca, prontos para entregar ao cliente.',
       icone='<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h6M7 13.5h4"/><circle cx="16.5" cy="11.5" r="1.6"/>'),
  dict(id='panfletos', nome='Panfletos e flyers', desc='Material de divulgação para promoções, inaugurações e eventos.',
       icone='<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 11h5M10 14.5h5M10 18h3"/>'),
  dict(id='banners', nome='Banners e faixas', desc='Para fachadas, eventos e pontos de venda, no tamanho que você precisar.',
       icone='<path d="M5 4h14v12l-7-3-7 3z"/><path d="M5 4v17M19 4v17"/>'),
  dict(id='adesivos', nome='Adesivos e etiquetas', desc='Adesivos personalizados para vitrines, produtos e embalagens.',
       icone='<path d="M4 4h11l5 5v11H4z"/><path d="M15 4v5h5"/><circle cx="10" cy="13" r="3"/>'),
]
PASSOS = [('Fale com a gente', 'Conte o que precisa pelo WhatsApp e mande fotos do local, se tiver.'),
          ('Projeto', 'Criamos a proposta e o orçamento sem compromisso.'),
          ('Produção', 'Fabricamos com acabamento de alto padrão.'),
          ('Entrega', 'Instalação ou entrega, com acompanhamento direto.')]

WA_ICON = '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/></svg>'

def card_cv(p):
    fotos = p['fotos']
    main = f'<img id="main-{p["id"]}" src="img/{fotos[0][0]}.jpg" alt="{p["nome"]} — {fotos[0][1]}" class="w-full h-full object-cover" loading="lazy">'
    thumbs = ''
    if len(fotos) > 1:
        thumbs = '<div class="flex gap-2 mt-3 overflow-x-auto no-print">' + ''.join(
            f'<button type="button" class="thumb shrink-0 w-16 h-16 rounded-xl overflow-hidden ring-2 {"ring-brand-500" if i == 0 else "ring-transparent"} focus:outline-none" '
            f'data-target="main-{p["id"]}" data-src="img/{f}.jpg" data-alt="{p["nome"]} — {n}" aria-label="Ver {n}">'
            f'<img src="img/{f}.jpg" alt="" class="w-full h-full object-cover" loading="lazy"></button>' for i, (f, n) in enumerate(fotos)) + '</div>'
    tags = ''.join(f'<li class="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">{t}</li>' for t in p['tags'])
    clientes = ', '.join(n for _, n in fotos)
    return f'''
<article class="card bg-white rounded-3xl shadow-card overflow-hidden flex flex-col" data-cat="comunicacao">
  <div class="aspect-[4/5] bg-slate-100 overflow-hidden">{main}</div>
  <div class="p-5 sm:p-6 flex flex-col flex-1">
    {thumbs}
    <h3 class="mt-4 text-xl font-bold text-brand-900">{p["nome"]}</h3>
    <p class="mt-2 text-slate-600 leading-relaxed">{p["desc"]}</p>
    <ul class="mt-4 flex flex-wrap gap-2">{tags}</ul>
    <p class="mt-4 text-sm text-slate-500"><span class="font-semibold text-slate-700">Projetos:</span> {clientes}</p>
    <div class="mt-auto pt-6">
      <a href="{wa(f"Olá! Vi o catálogo da Ngraph e quero um orçamento de {p['nome'].lower()}.")}" target="_blank" rel="noopener"
         class="btn-wa inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 hover:bg-brand-700 text-white font-semibold px-6 py-3.5 transition">
        {WA_ICON} Pedir orçamento</a>
    </div>
  </div>
</article>'''

def card_gr(p):
    return f'''
<article class="card bg-white rounded-3xl shadow-card overflow-hidden flex flex-col" data-cat="grafica">
  <div class="aspect-[16/10] bg-brand-50 flex items-center justify-center">
    <svg class="w-20 h-20 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{p["icone"]}</svg>
  </div>
  <div class="p-5 sm:p-6 flex flex-col flex-1">
    <h3 class="text-xl font-bold text-brand-900">{p["nome"]}</h3>
    <p class="mt-2 text-slate-600 leading-relaxed">{p["desc"]}</p>
    <div class="mt-auto pt-6">
      <a href="{wa(f"Olá! Vi o catálogo da Ngraph e quero um orçamento de {p['nome'].lower()}.")}" target="_blank" rel="noopener"
         class="btn-wa inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 hover:bg-brand-700 text-white font-semibold px-6 py-3.5 transition">
        {WA_ICON} Pedir orçamento</a>
    </div>
  </div>
</article>'''

passos = ''.join(f'''<li class="bg-white rounded-2xl p-5 shadow-card"><span class="inline-flex w-9 h-9 items-center justify-center rounded-full bg-brand-900 text-white font-bold">{i+1}</span>
  <h3 class="mt-3 font-bold text-brand-900">{t}</h3><p class="mt-1 text-sm text-slate-600 leading-relaxed">{d}</p></li>''' for i, (t, d) in enumerate(PASSOS))

html = f'''<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Catálogo Ngraph | Fachadas, letreiros e gráfica em São Lourenço da Mata - PE</title>
<meta name="description" content="Catálogo da Ngraph Comunicação Visual: fachadas em ACM, letreiros, letras em acrílico, neon LED, sinalização e gráfica. Peça seu orçamento pelo WhatsApp.">
<meta name="theme-color" content="#061f4d">
<link rel="canonical" href="{CATALOGO_URL}">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR">
<meta property="og:title" content="Catálogo Ngraph | Comunicação visual e gráfica">
<meta property="og:description" content="Fachadas em ACM, letreiros, letras em acrílico, neon LED, sinalização e gráfica.">
<meta property="og:url" content="{CATALOGO_URL}"><meta property="og:image" content="{CATALOGO_URL}img/acm-dpaleteiros.jpg">
<link rel="icon" href="img/ngraph-simbolo.svg">
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {{ theme: {{ extend: {{
  fontFamily: {{ sans: ['Inter','system-ui','sans-serif'] }},
  colors: {{ brand: {{50:'#eef3fb',100:'#dbe4f7',200:'#b3c6ee',500:'#0d47a1',600:'#0a3682',700:'#082c6b',900:'#061f4d'}},
            accent: {{ orange:'#f88000', pink:'#b0005a' }}, whatsapp:'#25D366' }},
  boxShadow: {{ soft:'0 10px 30px -12px rgba(6,31,77,0.18)', card:'0 4px 20px -4px rgba(6,31,77,0.1)' }} }} }} }}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  body {{ font-family:'Inter',system-ui,sans-serif; }}
  .chip[aria-pressed="true"] {{ background:#061f4d; color:#fff; border-color:#061f4d; }}
  .print-only {{ display:none; }}
  @media print {{
    @page {{ size:A4; margin:12mm; }}
    html,body {{ background:#fff !important; }}
    .no-print {{ display:none !important; }}
    .print-only {{ display:block !important; }}
    header.site {{ position:static !important; box-shadow:none !important; }}
    .card {{ break-inside:avoid; box-shadow:none !important; border:1px solid #e2e8f0; }}
    .grid-cards {{ grid-template-columns:repeat(3,minmax(0,1fr)) !important; gap:10px !important; margin-top:12px !important; }}
    #grafica .grid-cards {{ grid-template-columns:repeat(4,minmax(0,1fr)) !important; }}
    #grafica {{ break-before:page; }}
    main > section {{ padding-top:8px !important; padding-bottom:14px !important; }}
    .card .p-5 {{ padding:12px !important; }}
    .card h3 {{ font-size:13pt !important; margin-top:6px !important; }}
    .card p, .card li {{ font-size:8.5pt !important; line-height:1.4 !important; }}
    .card ul {{ margin-top:8px !important; gap:4px !important; }}
    .card .pt-6 {{ padding-top:10px !important; }}
    .card .aspect-\\[16\\/10\\] {{ aspect-ratio:16/8 !important; }}
    ol {{ grid-template-columns:repeat(4,minmax(0,1fr)) !important; gap:8px !important; margin-top:10px !important; }}
    ol li {{ padding:10px !important; box-shadow:none !important; border:1px solid #e2e8f0; }}
    ol li p {{ font-size:8pt !important; }}
    .bg-brand-900 > div {{ padding-top:8mm !important; padding-bottom:8mm !important; }}
    .bg-brand-900 a {{ margin-top:4mm !important; }}
    main h2 + p {{ font-size:15pt !important; }}
    footer > div {{ padding-top:5mm !important; padding-bottom:0 !important; }}
    .card .aspect-\\[4\\/5\\] {{ aspect-ratio:16/10 !important; }}
    section {{ break-inside:auto; }}
    h2 {{ break-after:avoid; }}
    .btn-wa {{ padding:.45rem .8rem !important; font-size:9pt !important; }}
    * {{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
  }}
</style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased">

<!-- Capa (só no PDF) -->
<section class="print-only" style="break-after:page;height:270mm;position:relative">
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center">
    <img src="img/ngraph.svg" alt="Ngraph" style="width:110mm">
    <p style="margin-top:14mm;font-size:13pt;letter-spacing:.25em;color:#0d47a1;font-weight:600">CATÁLOGO</p>
    <h1 style="margin-top:4mm;font-size:30pt;line-height:1.1;font-weight:800;color:#061f4d;max-width:150mm">Comunicação visual e gráfica para a sua marca aparecer</h1>
    <img src="img/acm-dpaleteiros.jpg" alt="" style="margin-top:12mm;width:120mm;height:80mm;object-fit:cover;border-radius:6mm">
    <div style="margin-top:12mm;display:flex;align-items:center;gap:8mm;text-align:left">
      <img src="img/qr-catalogo.png" alt="QR Code do catálogo" style="width:32mm;height:32mm">
      <div style="font-size:11pt;color:#334155;line-height:1.6"><b style="color:#061f4d">Catálogo sempre atualizado:</b><br>ngraph.com.br/catalogo<br>
        <b style="color:#061f4d">WhatsApp:</b> (81) 97106-3561<br><b style="color:#061f4d">Instagram:</b> @ngraph.pe</div>
    </div>
  </div>
</section>

<header class="site sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
    <a href="{SITE}" class="flex items-center gap-3" aria-label="Ngraph — página inicial"><img src="img/ngraph.svg" alt="Ngraph" class="h-8 sm:h-9 w-auto"></a>
    <a href="{wa('Olá! Vi o catálogo da Ngraph e gostaria de um orçamento.')}" target="_blank" rel="noopener"
       class="no-print inline-flex items-center gap-2 rounded-full bg-whatsapp hover:brightness-95 text-white font-semibold px-4 py-2.5 text-sm transition">{WA_ICON}<span class="hidden sm:inline">Fale no WhatsApp</span><span class="sm:hidden">WhatsApp</span></a>
  </div>
</header>

<main>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-6 no-print">
    <span class="inline-flex items-center gap-2 rounded-full bg-accent-orange/10 text-accent-orange font-semibold text-xs tracking-wide uppercase px-3 py-1.5">Catálogo de produtos</span>
    <h1 class="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-900 leading-tight max-w-3xl">Comunicação visual e gráfica para a sua marca aparecer</h1>
    <p class="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed">Veja o que fazemos com fotos de trabalhos reais. Escolha o produto e peça seu orçamento pelo WhatsApp, sem compromisso.</p>
  </section>

  <nav class="no-print sticky top-16 z-30 bg-slate-50/95 backdrop-blur" aria-label="Filtrar produtos">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto">
      <button type="button" class="chip shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" data-filter="todos" aria-pressed="true">Todos</button>
      <button type="button" class="chip shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" data-filter="comunicacao" aria-pressed="false">Comunicação visual</button>
      <button type="button" class="chip shrink-0 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" data-filter="grafica" aria-pressed="false">Gráfica</button>
    </div>
  </nav>

  <section id="comunicacao" class="grupo max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10" data-grupo="comunicacao">
    <h2 class="text-sm font-semibold tracking-widest uppercase text-brand-500">Comunicação visual</h2>
    <p class="mt-1 text-2xl sm:text-3xl font-bold text-brand-900">Fachadas, letreiros e sinalização</p>
    <div class="grid-cards mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{''.join(card_cv(p) for p in COMUNICACAO)}</div>
  </section>

  <section id="grafica" class="grupo max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12" data-grupo="grafica">
    <h2 class="text-sm font-semibold tracking-widest uppercase text-brand-500">Gráfica</h2>
    <p class="mt-1 text-2xl sm:text-3xl font-bold text-brand-900">Impressos para divulgar a sua marca</p>
    <div class="grid-cards mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{''.join(card_gr(p) for p in GRAFICA)}</div>
  </section>

  <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-12" style="break-inside:avoid">
    <h2 class="text-sm font-semibold tracking-widest uppercase text-brand-500">Como funciona</h2>
    <p class="mt-1 text-2xl sm:text-3xl font-bold text-brand-900">Do pedido à instalação</p>
    <ol class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{passos}</ol>
  </section>

  <section class="bg-brand-900" style="break-inside:avoid">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
      <p class="text-2xl sm:text-4xl font-extrabold text-white">Não achou o que procura?</p>
      <p class="mt-3 text-brand-100 text-lg">A gente faz sob medida. Fale com a Ngraph e receba um orçamento sem compromisso.</p>
      <a href="{wa('Olá! Vi o catálogo da Ngraph e quero um orçamento sob medida.')}" target="_blank" rel="noopener"
         class="mt-7 inline-flex items-center gap-2 rounded-full bg-whatsapp hover:brightness-95 text-white font-semibold px-7 py-4 transition">{WA_ICON} Pedir orçamento no WhatsApp</a>
      <p class="print-only" style="margin-top:6mm;color:#dbe4f7;font-size:11pt">WhatsApp (81) 97106-3561 · ngraph.pe@gmail.com</p>
    </div>
  </section>
</main>

<footer class="bg-white border-t border-slate-200">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-slate-600">
    <img src="img/ngraph.svg" alt="Ngraph" class="h-8 w-auto self-start">
    <div class="flex flex-wrap gap-x-6 gap-y-2">
      <a class="hover:text-brand-900" href="https://wa.me/{WHATS}" target="_blank" rel="noopener">WhatsApp (81) 97106-3561</a>
      <a class="hover:text-brand-900" href="mailto:ngraph.pe@gmail.com">ngraph.pe@gmail.com</a>
      <a class="hover:text-brand-900" href="https://instagram.com/ngraph.pe" target="_blank" rel="noopener">@ngraph.pe</a>
      <a class="hover:text-brand-900" href="{SITE}">ngraph.com.br</a>
    </div>
  </div>
</footer>

<script>
// filtro por categoria
const chips=[...document.querySelectorAll('.chip')];
chips.forEach(c=>c.addEventListener('click',()=>{{
  chips.forEach(x=>x.setAttribute('aria-pressed',x===c));
  const f=c.dataset.filter;
  document.querySelectorAll('.grupo').forEach(g=>g.hidden=!(f==='todos'||g.dataset.grupo===f));
}}));
// galeria: miniaturas trocam a foto principal
document.querySelectorAll('.thumb').forEach(b=>b.addEventListener('click',()=>{{
  const m=document.getElementById(b.dataset.target); m.src=b.dataset.src; m.alt=b.dataset.alt;
  b.parentElement.querySelectorAll('.thumb').forEach(x=>{{x.classList.toggle('ring-brand-500',x===b);x.classList.toggle('ring-transparent',x!==b);}});
}}));
</script>
</body>
</html>'''
open('index.html', 'w', encoding='utf8').write(html)
print('index.html gerado')
