import cv2,glob,numpy as np,sys
fs=sorted(glob.glob(sys.argv[1]+'/*.png'));fps=30
prev=None;rows=[];dup=0
for i,f in enumerate(fs):
  im=cv2.resize(cv2.imread(f),(720,576));g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
  if prev is not None:
    if np.abs(g.astype(int)-prev.astype(int)).mean()<0.05: dup+=1
    fl=cv2.calcOpticalFlowFarneback(prev,g,None,0.5,4,21,3,7,1.5,0)
    gx=cv2.Sobel(prev,cv2.CV_32F,1,0);gy=cv2.Sobel(prev,cv2.CV_32F,0,1);mag=np.hypot(gx,gy)
    sel=(mag>40);sel[:,:80]=False;sel[:,-80:]=False;sel[:60]=False;sel[-60:]=False
    vy=fl[...,1][sel]
    rows.append((i/fps,np.median(vy)*2*fps if vy.size>200 else np.nan, sel.sum()))
  prev=g
r=np.array(rows)
print('quadros repetidos:',dup)
for a,b in [(0,.6),(.6,1.25),(1.25,1.6),(1.6,3),(3,5),(5,7.3),(7.3,8.2)]:
  s=r[(r[:,0]>=a)&(r[:,0]<b)];v=-s[:,1];v=v[~np.isnan(v)]
  print(f'  {a:4.2f}-{b:4.2f}s  velocidade na tela (px/s): mediana {np.median(v):7.1f}  min {v.min():7.1f}  max {v.max():7.1f}')
c=r[(r[:,0]>1.7)&(r[:,0]<7.3)];v=-c[:,1];v=v[~np.isnan(v)];sm=np.convolve(v,np.ones(5)/5,mode='valid')
print('cruzeiro 1.7–7.3s (média móvel de 5 quadros): min',round(sm.min(),1),'mediana',round(np.median(sm),1),'max',round(sm.max(),1))
print('algum valor <= 0 no cruzeiro (parada ou ré)?', bool((v<=0).any()))
