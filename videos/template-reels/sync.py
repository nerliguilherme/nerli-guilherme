# Gera sincronia (legendas + mapa áudio->animação + eventos sonoros) a partir dos tempos por palavra.
import json,sys
D=sys.argv[1]
def W(f):
  d=json.load(open(D+f)); return [x for x in d['words'] if x['type']=='word']
CFG={
 'v1':dict(words='w1.json',ev='ev1.json',tail=1.4,hook_w=46,
  hooks1=['Isso tá substituindo','o cartão de visita 😱'],hooks2=['Chama no direct','e peça a sua 📲'],
  # (índice da palavra, 's'tart/'e'nd, tempo da animação)
  anchors=[(12,'s',2.5),(14,'s',2.8),(15,'s',4.4),(20,'s',6.0),(22,'s',6.85),(24,'s',7.65),(28,'s',8.5),(29,'s',10.0),(32,'s',11.1),(35,'s',12.3),(40,'s',12.9),(45,'s',13.9),(46,'s',14.6)],
  end_anim=14.6,
  caps=[(0,3,'OLHA SÓ *ISSO AQUI*'),(4,6,'O SEU *CLIENTE*'),(7,8,'SÓ *APROXIMA*'),(9,12,'O CELULAR DA *PLACA*'),(13,14,'E *PRONTO!*'),(15,17,'ABRE NA *HORA*'),
   (18,20,'O SEU *WHATSAPP*'),(21,22,'O *INSTAGRAM*'),(23,24,'O *CATÁLOGO*'),(25,28,'E ATÉ A *LOCALIZAÇÃO*'),(29,31,'SEM BAIXAR *APLICATIVO*'),(32,34,'SEM DIGITAR *NADA*'),
   (35,39,'E QUEM NÃO TEM *NFC*?'),(40,42,'APONTA A CÂMERA'),(43,45,'PRO *QR CODE*'),(46,49,'ESSA É A PLACA'),(50,52,'*NFC* DA *NGRAPH*'),(53,57,'QUER UMA NA *SUA EMPRESA*?'),(58,62,'CHAMA A GENTE NO *DIRECT!*')]),
 'v2':dict(words='w2.json',ev='ev2.json',tail=1.0,hook_w=66,hook_edge='e',
  hooks1=['Sua empresa aparece','quando te procuram? 🔎'],hooks2=['Manda “SITE” no direct','que a gente te explica 📩'],
  anchors=[(4,'s',1.5),(9,'s',2.75),(11,'s',3.2),(17,'s',4.4),(17,'e',4.9),(18,'s',6.0),(23,'s',6.4),(24,'s',7.45),(25,'s',7.8),(29,'e',9.7),(30,'s',10.0),(35,'s',10.2),(38,'e',11.4),(41,'s',11.6),(44,'e',12.9),(45,'s',13.0),(47,'s',13.9),(49,'s',14.6),(54,'s',15.5),(57,'s',17.1),(66,'e',18.7)],
  end_anim=18.7,
  caps=[(0,1,'PRESTA *ATENÇÃO*'),(2,4,'QUANDO ALGUÉM *PRECISA*'),(5,8,'DO QUE VOCÊ *VENDE*'),(9,11,'A PRIMEIRA COISA'),(12,14,'QUE FAZ É'),(15,17,'*PESQUISAR* NO *GOOGLE*'),
   (18,21,'SE A SUA EMPRESA'),(22,23,'*NÃO APARECE*...'),(24,26,'ESSE CLIENTE VAI'),(27,29,'DIRETO PRO *CONCORRENTE*'),(30,32,'UM SITE *TRABALHA*'),(33,34,'POR VOCÊ'),
   (35,40,'*24 HORAS* POR DIA'),(41,44,'*7 DIAS* POR SEMANA'),(45,47,'MOSTRA SEUS *SERVIÇOS*'),(48,49,'SEU *PORTFÓLIO*'),(50,53,'E LEVA O CLIENTE'),(54,56,'DIRETO PRO *WHATSAPP*'),
   (57,61,'A *NGRAPH* CRIA O SITE'),(62,66,'DA SUA EMPRESA *DO ZERO*'),(67,70,'MANDA *SITE* NO DIRECT!')]),
}
for k,c in CFG.items():
  w=W(c['words']); t=lambda i,e='s': w[i]['start' if e=='s' else 'end']
  dur=round(w[-1]['end']+c['tail'],2)
  M=[(0,0)]+[(round(t(i,e),3),b) for i,e,b in c['anchors']]
  hs=t(c['hook_w'],c.get('hook_edge','s'))
  M.append((dur, c['end_anim']+(dur-hs)))
  for a,b in zip(M,M[1:]): assert b[0]>a[0] and b[1]>=a[1],(k,a,b)
  caps=[]
  for j,(i0,i1,txt) in enumerate(c['caps']):
    s=t(i0); e=(t(c['caps'][j+1][0])-0.04) if j+1<len(c['caps']) else dur-0.3
    caps.append([round(s,3),round(e,3),txt])
  hooks=[{'t0':0,'t1':hs,'lines':c['hooks1']},{'t0':hs,'t1':99,'lines':c['hooks2']}]
  js=f"""
<script>
// Sincronia com a narração: tempo do áudio -> tempo da animação
const MAP={json.dumps(M)};
const CAPS_V={json.dumps(caps,ensure_ascii=False)};
const HOOKS_V={json.dumps(hooks,ensure_ascii=False)};
function remap(t){{for(let i=1;i<MAP.length;i++){{const [a0,b0]=MAP[i-1],[a1,b1]=MAP[i];if(t<=a1)return b0+(b1-b0)*(t-a0)/(a1-a0);}}return MAP[MAP.length-1][1];}}
window.DUR={dur};
const _render=window.render;
window.render=function(ta){{_render(remap(ta));E.hook(ta,HOOKS_V);E.caption(ta,CAPS_V);}};
render(0);
</script></body></html>"""
  s=open(D+k+'.html').read()
  s=s.split('\n<script>\n// Sincronia')[0]
  if not s.rstrip().endswith('</body></html>'): s=s.rstrip()+'</body></html>'
  s=s.replace('</body></html>',js,1)
  open(D+k+'.html','w').write(s)
  def inv(tm):
    for (a0,b0),(a1,b1) in zip(M,M[1:]):
      if tm<=b1: return a0+(a1-a0)*(tm-b0)/(b1-b0) if b1>b0 else a0
    return M[-1][0]
  ev=json.load(open(D+c['ev']))
  ev=[e for e in ev if e[1]!='pop' or (len(e)>2 and e[2]>1)]
  ev=[[round(inv(e[0]),3)]+e[1:] for e in ev]+[[x[0],'pop',.35] for x in caps]
  json.dump(ev,open(D+k+'_ev.json','w'))
  json.dump({'dur':dur},open(D+k+'_dur.json','w'))
  print(k,'dur',dur,'hook',round(hs,2))
