import cv2, numpy as np
n=cv2.imread('noite_ok.png'); H=np.load('H.npy')
hsv=cv2.cvtColor(n,cv2.COLOR_BGR2HSV); h,s,v=[hsv[...,i].astype(np.float32) for i in range(3)]
green=((h>38)&(h<85)&(s>90)&(v>150)).astype(np.uint8)
sign=np.zeros_like(green); sign[235:440,160:990]=1; sign[600:690,530:610]=1; sign[815:860,395:510]=1
letters=((v>185)&(s<110)&(sign>0)).astype(np.uint8)
green=cv2.morphologyEx(green,cv2.MORPH_OPEN,np.ones((2,2),np.uint8)); green[1110:]=0
def soft(m,core=3,halo=22):
    c=cv2.dilate(m,np.ones((core,core),np.uint8)).astype(np.float32)
    g=cv2.GaussianBlur(c,(0,0),halo); g=g/max(g.max(),1e-6)
    return np.clip(np.maximum(c,np.clip(g*2.2,0,1)),0,1)
mL=soft(green,5,24); mT=soft(letters,3,12)
cv2.imwrite('dbg_masks.jpg',cv2.resize(np.dstack([mT*255,mL*255,green*255]).astype(np.uint8),None,fx=.5,fy=.5))
off=n.astype(np.float32)*(.80*(1-np.clip(.85*mL+.62*mT,0,.9)))[...,None]
# atraso de acendimento: linhas espalham a partir do letreiro; letras varrem da esquerda p/ direita
yy,xx=np.mgrid[0:n.shape[0],0:n.shape[1]].astype(np.float32)
dL=np.sqrt(((xx-575)/1.0)**2+((yy-340)*1.1)**2); dL=.62*dL/dL.max()
dT=.30+.38*np.clip((xx-170)/800,0,1)
fT=np.where(mL+mT>0,mT/np.maximum(mL+mT,1e-6),0)
d=dL*(1-fT)+dT*fT
core=(cv2.dilate(green,np.ones((3,3),np.uint8))|letters).astype(np.float32)
bloom=cv2.GaussianBlur(n.astype(np.float32)*core[...,None],(0,0),16)*1.6
def save(prefix,M,size,cover_center):
    W,Hh=size
    def tr(img,interp=cv2.INTER_AREA):
        return M(img,interp)
    cv2.imwrite(prefix+'_on.png',tr(n)); cv2.imwrite(prefix+'_off.png',tr(np.clip(off,0,255).astype(np.uint8)))
    mm=np.clip(mL+mT,0,1); mp=np.dstack([np.zeros_like(d),(1-.7*mm)*255,d*mm*255]).astype(np.uint8)  # B=atraso G=largura da rampa
    cv2.imwrite(prefix+'_map.png',tr(mp,cv2.INTER_LINEAR)); cv2.imwrite(prefix+'_bloom.png',tr(np.clip(bloom,0,255).astype(np.uint8)))
# card: noite alinhada ao dia, recorte quadrado (40..1130, 100..1190) -> 762
def Mcard(img,interp):
    w=cv2.warpPerspective(img,H,(1170,1320),flags=cv2.INTER_LINEAR); return cv2.resize(w[100:1190,40:1130],(762,762),interpolation=interp)
save('card',Mcard,(762,762),None)
d0=cv2.imread('dia_ok.png'); cv2.imwrite('card_day.png',cv2.resize(d0[100:1190,40:1130],(762,762),interpolation=cv2.INTER_AREA))
# gancho: noite original em tela cheia 1080x1920 (cover)
def Mhook(img,interp):
    sc=1920/1529; r=cv2.resize(img,(round(1151*sc),1920),interpolation=cv2.INTER_CUBIC); x0=(r.shape[1]-1080)//2; return r[:,x0:x0+1080]
save('hook',Mhook,(1080,1920),None)
print('ok', green.sum(), letters.sum())
