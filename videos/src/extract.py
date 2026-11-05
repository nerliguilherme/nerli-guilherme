from PIL import Image
import numpy as np, colorsys
im=np.asarray(Image.open('/root/.claude/uploads/ee49a119-f83d-5604-abac-649049405974/8828cd20-image.jpg').convert('RGB')).astype(float)
x0,x1,y0,y1=95,1015,605,845
c=im[y0:y1,x0:x1]
H,W,_=c.shape
# background: interpolate per row between left and right edge columns
L=c[:, :6].mean(1); R=c[:, -6:].mean(1)
t=np.linspace(0,1,W)[None,:,None]
bg=L[:,None,:]*(1-t)+R[:,None,:]*t
diff=np.clip(bg-c,0,None).max(2)
a=np.clip((diff-12)/170,0,1)
fg=(c-(1-a[...,None])*bg)/np.maximum(a[...,None],1e-3)
fg=np.clip(fg,0,255)
rgba=np.dstack([fg,a*255]).astype(np.uint8)
# split by regions: text = x>=230 (crop coords), symbol x<230 split by hue
sym=rgba.copy(); sym[:,215:,3]=0
txt=rgba.copy(); txt[:,:215,3]=0
Image.fromarray(txt).save('text.png')
# hue segmentation on symbol
r,g,b=[fg[...,i]/255 for i in range(3)]
mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
hue=np.zeros_like(r)
d=np.maximum(mx-mn,1e-6)
hue=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))*60
mag=(hue>=290)|(hue<15); ora=(hue>=15)&(hue<90); blu=(hue>=180)&(hue<290)
for name,m in [('mag',mag),('blu',blu),('ora',ora)]:
  s=sym.copy(); s[...,3]=np.where(m,s[...,3],0); Image.fromarray(s).save(f'n_{name}.png')
Image.fromarray(rgba).save('logo_full.png')
print(W,H)
