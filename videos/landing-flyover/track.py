import numpy as np, wave, sys
D=sys.argv[1]
w=wave.open(D+'/musA.wav');sr=w.getframerate();x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
hop=256;n=len(x)//hop;E=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)+1e-9) for i in range(n)])
# força de ataque: subida de energia em banda larga
on=np.maximum(0,np.diff(np.log(E)))*E[1:]
t=np.arange(len(on))*hop/sr
ok=(t>=9.97)&(t<=40-4.6)
i=np.argmax(np.where(ok,on,0));T=t[i]
print('golpe mais forte da trilha A em',round(T,3),'s -> corte de',round(T-9.97,3),'a',round(T-9.97+14.5,3))
open(D+'/cut.txt','w').write(f'{T-9.97:.3f}')
