# Gera as duas versões (Google e Catálogo) a partir de film.html, trocando só o conteúdo.
import re
base = open('film.html').read()

def between(s, a, b):
    i = s.index(a); j = s.index(b, i + len(a)); return i, j

NOTCH = '<div style="position:absolute;left:118px;top:14px;width:64px;height:18px;border-radius:9px;background:#18181B"></div>'
STAR = 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z'
def stars(fill, ids=False):
    out = ''
    for i in range(5):
        x = 26 + i * 52
        st = f'fill:{"#1E3A8A" if fill else "none"};stroke:{"#1E3A8A" if fill else "#A1A1AA"};stroke-width:1.6;stroke-linejoin:round'
        idattr = f' id="lb{i}"' if ids else ''
        out += f'<svg{idattr} style="position:absolute;left:{x}px;top:236px;overflow:visible" width="40" height="40" viewBox="0 0 24 24"><path d="{STAR}" style="{st}"/></svg>'
    return out

G_HEAD = NOTCH + '''
<div style="position:absolute;left:0;top:0;width:300px;height:620px;background:#fff;z-index:-1"></div>
<div style="position:absolute;left:24px;top:58px;width:56px;height:56px;border-radius:28px;border:1.5px solid #E4E4E7;display:flex;align-items:center;justify-content:center"><img src="img/ngraph_sym.svg" style="height:32px"></div>
<div style="position:absolute;left:92px;top:64px;font-size:20px;font-weight:700;letter-spacing:-.01em">Ngraph</div>
<div style="position:absolute;left:92px;top:90px;font-size:13px;color:#71717A;letter-spacing:0">Gráfica e comunicação visual</div>
<div style="position:absolute;left:24px;top:140px;width:252px;height:1px;background:#E4E4E7"></div>'''
G_BODY = '''<div style="position:absolute;left:0;width:300px;top:166px;text-align:center;font-size:20px;font-weight:600;letter-spacing:-.01em">Avalie sua experiência</div>
<div style="position:absolute;left:0;width:300px;top:196px;text-align:center;font-size:13px;color:#71717A;letter-spacing:0">Toque nas estrelas</div>'''
G_REST = '''<div style="position:absolute;left:28px;top:306px;width:244px;height:124px;border-radius:14px;border:1.5px solid #D4D4D8"></div>
<div style="position:absolute;left:44px;top:322px;font-size:15px;color:#A1A1AA;letter-spacing:0">Conte como foi…</div>
<div style="position:absolute;left:28px;top:452px;width:244px;height:52px;border-radius:26px;background:#E4E4E7;color:#A1A1AA;font-size:17px;font-weight:600;display:flex;align-items:center;justify-content:center">Publicar</div>'''
GOOGLE = dict(
  qr='qr_site.js', plate='img/placa_google.png',
  scrA=G_HEAD + f'<div id="b1">{G_BODY}</div><div id="b2">{stars(False)}</div>' + G_REST,
  scrB=G_HEAD + G_BODY + stars(False) + G_REST + stars(True, True) +
    '<div id="lb5" style="position:absolute;left:44px;top:322px;width:212px;padding:0 0 0 0;background:#fff;font-size:15px;line-height:1.35;color:#18181B;letter-spacing:0;white-space:normal">Atendimento excelente e entrega no prazo!</div>'
    '<div id="lb6" style="position:absolute;left:28px;top:452px;width:244px;height:52px;border-radius:26px;background:#18181B;color:#fff;font-size:17px;font-weight:600;display:flex;align-items:center;justify-content:center">Publicar</div>',
  BT='[9.6,9.85,10.1,10.35,10.6,11.05,11.5]',
  PH='''[
 {lines:['Seu cliente gostou,','mas não <k>avaliou?</k>'],y:[600,700],a:.15,b:2.75},
 {lines:['Tem um jeito','mais <k>fácil.</k>'],y:[480,580],a:3.0,b:4.85},
 {lines:['Um <k>toque</k>','e pronto.'],y:[380,480],a:5.05,b:8.7},
 {lines:['Avaliar leva','<k>segundos.</k>'],y:[360,460],a:9.05,b:12.6},
 {lines:['Mais avaliações,','mais <k>clientes.</k>'],y:[420,520],a:12.95,b:14.7},
 {lines:['A placa pede','por <k>você.</k>'],y:[420,520],a:14.85,b:15.95},
 {lines:['Funciona em','<k>qualquer</k> celular.'],y:[420,520],a:16.05,b:18.8},
 {lines:['@ngraph.pe'],y:[1090],a:20.05,b:99,size:64,weight:600},
 {lines:['<k>Manda NFC no direct</k>'],y:[1225],a:20.45,b:99,size:68,weight:700,id:'cta'}]''',
  typed='Ngraph avalia', pillA='Poucas avaliações', pillB='Mais avaliações')

C_HEAD = NOTCH + '''
<div style="position:absolute;left:0;top:0;width:300px;height:620px;background:#fff;z-index:-1"></div>
<div style="position:absolute;left:24px;top:54px;font-size:26px;font-weight:700;letter-spacing:-.02em">Catálogo</div>
<div style="position:absolute;left:24px;top:88px;font-size:13px;color:#71717A;letter-spacing:0">Ngraph · comunicação visual</div>
<div style="position:absolute;left:24px;top:118px;width:252px;height:40px;border-radius:20px;border:1.5px solid #E4E4E7;font-size:14px;color:#A1A1AA;padding:11px 0 0 40px;letter-spacing:0">Buscar produto…</div>
<svg style="position:absolute;left:38px;top:129px" width="18" height="18" viewBox="0 0 24 24"><g fill="none" stroke="#71717A" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></g></svg>'''
def card(i, x, y, img, label, bg=''):
    inner = f'<img src="{img}" style="width:120px;height:116px;object-fit:cover;display:block">' if not bg else \
            f'<div style="width:120px;height:116px;background:#F4F4F5;display:flex;align-items:center;justify-content:center"><img src="{img}" style="height:96px"></div>'
    return (f'<div id="lb{i}" style="position:absolute;left:{x}px;top:{y}px;width:120px">'
            f'<div style="width:120px;height:116px;border-radius:14px;overflow:hidden">{inner}</div>'
            f'<div style="margin-top:10px;font-size:14px;font-weight:600;letter-spacing:-.01em">{label}</div>'
            f'<div style="margin-top:2px;font-size:12px;color:#71717A;letter-spacing:0">Ver mais</div></div>')
CAT = dict(
  qr='qr_site.js', plate='img/placa_catalogo.png',
  scrA=C_HEAD + '''<div id="b1" style="position:absolute;left:24px;top:176px;width:252px;height:200px;border-radius:18px;overflow:hidden">
   <img src="img/c_banner.jpg" style="width:252px;height:200px;object-fit:cover;display:block">
   <div style="position:absolute;left:0;bottom:0;width:252px;height:90px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.6))"></div>
   <div style="position:absolute;left:16px;bottom:14px;color:#fff;font-size:18px;font-weight:700;letter-spacing:-.01em">Fachadas que acendem</div></div>
   <div id="b2" style="position:absolute;left:24px;top:394px;width:252px">
   <div style="font-size:16px;font-weight:600">Destaques</div>
   <div style="display:flex;gap:12px;margin-top:12px"><img src="img/c_acm.jpg" style="width:120px;height:84px;object-fit:cover;border-radius:12px"><img src="img/c_letreiro.jpg" style="width:120px;height:84px;object-fit:cover;border-radius:12px"></div></div>''',
  scrB=C_HEAD + card(0, 24, 176, 'img/c_acm.jpg', 'Fachadas em ACM') + card(1, 156, 176, 'img/c_letreiro.jpg', 'Letreiros') +
       card(2, 24, 370, 'img/placa_google.png', 'Placas NFC', bg=True) + card(3, 156, 370, 'img/c_sinal.jpg', 'Sinalização'),
  BT='[9.65,10.05,10.45,10.85]',
  PH='''[
 {lines:['Ainda manda','catálogo em <k>PDF?</k>'],y:[600,700],a:.15,b:2.75},
 {lines:['Tem um jeito','mais <k>fácil.</k>'],y:[480,580],a:3.0,b:4.85},
 {lines:['Um <k>toque</k>','e pronto.'],y:[380,480],a:5.05,b:8.7},
 {lines:['Tudo num','<k>lugar</k> só.'],y:[360,460],a:9.05,b:12.6},
 {lines:['Mudou a','<k>promoção?</k>'],y:[420,520],a:12.95,b:14.7},
 {lines:['A placa continua','a <k>mesma.</k>'],y:[420,520],a:14.85,b:15.95},
 {lines:['Funciona em','<k>qualquer</k> celular.'],y:[420,520],a:16.05,b:18.8},
 {lines:['@ngraph.pe'],y:[1090],a:20.05,b:99,size:64,weight:600},
 {lines:['<k>Manda NFC no direct</k>'],y:[1225],a:20.45,b:99,size:68,weight:700,id:'cta'}]''',
  typed='catalogo_final_v3.pdf', pillA='Promo de outubro', pillB='Promo de novembro')

for name, V in [('google', GOOGLE), ('catalogo', CAT)]:
    s = base
    s = s.replace('<script src="qr.js"></script>', f'<script src="{V["qr"]}"></script>')
    s = s.replace('<img id="plate" src="img/placa.png"', f'<img id="plate" src="{V["plate"]}"')
    i, j = between(s, '<div class="scr" id="scrChat">', '<div class="scr" id="scrLinks">')
    s = s[:i] + '<div class="scr" id="scrChat">' + V['scrA'] + '\n   </div>\n   ' + s[j:]
    i, j = between(s, '<div class="scr" id="scrLinks">', '<div id="pill"')
    s = s[:i] + '<div class="scr" id="scrLinks">' + V['scrB'] + '\n   </div>\n   ' + s[j:]
    s = s.replace('>Promo de outubro<', f'>{V["pillA"]}<').replace('>Promo de novembro<', f'>{V["pillB"]}<')
    i, j = between(s, 'const PH=[', "];\nlet html=''")
    s = s[:i] + 'const PH=' + V['PH'] + s[j + 1:]
    old = "const TYPED='@ngrafh'; const TK=[...TYPED].map((c,i)=>1.0+i*.11); const DEL=[...TYPED].map((c,i)=>2.05+i*.065);"
    assert old in s
    s = s.replace(old, f"const TYPED='{V['typed']}'; const DT=Math.min(.11,.85/TYPED.length), DD=Math.min(.065,.45/TYPED.length);"
                       " const TK=[...TYPED].map((c,i)=>1.0+i*DT); const DEL=[...TYPED].map((c,i)=>2.05+i*DD);")
    i, j = between(s, 'const BTN=[', "</svg>${b[0]}</div>`).join('');")
    s = s[:i] + f"const BT={V['BT']}; BT.forEach(x=>EV.push(['pop',x]));" + s[j + len("</svg>${b[0]}</div>`).join('');"):]
    # digitação centralizada pela largura total do texto
    s = s.replace("const tw_=tx.offsetWidth, x0=540-200;", "const tw_=tx.offsetWidth, x0=540-(window.FULLW||400)/2;")
    s = s.replace("window.ready=Promise.all([document.fonts.ready,", "window.ready=Promise.all([document.fonts.ready.then(()=>{const e=$('typed');e.textContent=TYPED;window.FULLW=e.offsetWidth;e.textContent='';}),")
    s = s.replace('<path id="uline" d="M300 1010 L780 1010"', '<path id="uline" d="M240 1010 L840 1010"')
    open(f'film_{name}.html', 'w').write(s)
    print(name, 'ok', len(s))
