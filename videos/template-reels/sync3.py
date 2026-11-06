import json,sys
D=sys.argv[1]
w=[x for x in json.load(open(D+'w3.json'))['words'] if x['type']=='word']
assert len(w)==96, len(w)
S=lambda i:w[i]['start']; E_=lambda i:w[i]['end']
A=dict(olha=S(11),v1=S(13),aprox=S(21),whats=S(30),v2=S(33),insta=S(39),catal=S(40),aval=S(41),pix=S(48),v3=S(49),mudou=S(55),link=S(60),sem=S(61),v4=S(65),qr=S(79),end=S(81),manda=S(92),dur=round(E_(95)+1.6,2))
G=[(0,4,'SEU CLIENTE AINDA *PRECISA DIGITAR*'),(5,10,'O SEU *INSTAGRAM* PRA TE ACHAR?'),(11,12,'*OLHA ISSO*'),(15,18,'UM TOQUE E *PRONTO*'),(19,21,'O CLIENTE *APROXIMA*'),(22,25,'O CELULAR DA *PLACA*'),
 (26,30,'E ABRE O SEU *WHATSAPP*'),(31,32,'NA *HORA*'),(35,38,'TUDO NUM *LUGAR SÓ*'),(39,39,'*INSTAGRAM*'),(40,40,'*CATÁLOGO*'),(41,43,'AVALIAÇÃO NO *GOOGLE*'),(44,48,'E ATÉ O SEU *PIX*'),
 (51,54,'VOCÊ *ATUALIZA* QUANDO QUISER'),(55,57,'MUDOU A *PROMOÇÃO*?'),(58,60,'MUDA O *LINK*'),(61,64,'SEM TROCAR A *PLACA*'),(67,70,'FUNCIONA EM *QUALQUER CELULAR*'),(71,74,'QUEM NÃO TEM *NFC*'),
 (75,77,'APONTA A CÂMERA'),(78,80,'PRO *QR CODE*'),(81,83,'PLACA NFC *PERSONALIZADA*'),(84,87,'COM A *SUA MARCA*'),(88,91,'É COM A *NGRAPH*'),(92,95,'MANDA *NFC* NO DIRECT!')]
caps=[]
for j,(a,b,txt) in enumerate(G):
  nxt=G[j+1][0] if j+1<len(G) else None
  e=(S(nxt)-0.04) if (nxt is not None and nxt==b+1) else min(E_(b)+0.2, S(nxt)-0.04 if nxt else A['dur']-0.3)
  caps.append([round(S(a),3),round(e,3),txt])
hooks=[{'t0':0,'t1':A['end'],'lines':['Seu cliente ainda digita','o seu @? 🤔']},{'t0':A['end'],'t1':99,'lines':['Manda “NFC” no direct','e peça a sua 📲']}]
open(D+'v3_sync.js','w').write('window.ANCH='+json.dumps(A)+';\nwindow.CAPS_V='+json.dumps(caps,ensure_ascii=False)+';\nwindow.HOOKS_V='+json.dumps(hooks,ensure_ascii=False)+';\n')
# eventos sonoros (tempo do áudio)
ev=[[0,'riser',.6],[A['olha']+.8,'chime'],[A['v1']-.05,'boom',.6],[A['v1']+.85,'whoosh'],[A['aprox']+.7,'chime',.8],[A['whats']+.35,'pop',1.3],
    [A['v2']-.05,'boom',.6],[A['v2']+.85,'whoosh']]+[[A[k],'click'] for k in ['insta','catal','aval','pix']]+[
    [A['v3']-.05,'boom',.6],[A['v3']+.85,'whoosh'],[A['mudou'],'whoosh',.5],[A['sem'],'ding'],
    [A['v4']-.05,'boom',.6],[A['v4']+.85,'whoosh'],[A['v4']+1.6,'pop',1.2],[A['qr']+.3,'ding'],[A['end']-.8,'riser'],[A['end'],'boom'],[A['manda'],'pop',1.3]]
json.dump(ev,open(D+'v3_ev.json','w'))
print(A)
