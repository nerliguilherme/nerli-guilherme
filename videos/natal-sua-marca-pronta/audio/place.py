# Corta a narração em frases (pelas pausas medidas) e posiciona cada frase no início da sua cena.
import numpy as np, wave, subprocess, sys, json
SR=48000
def load(f):
    w=wave.open(f); return np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
def seg(src,a,b,tempo=1.0,cut=None):
    """trecho [a,b] (s); cut=(c0,c1) encurta uma pausa interna para 0.12 s; tempo>1 acelera sem mudar o tom"""
    x=load(src); s=lambda t:int(round(t*SR))
    y=x[s(max(a-.04,0)):s(b+.06)]
    if cut: c0,c1=cut; y=np.concatenate([y[:s(c0-a+.04)], y[s(c1-a+.04)-s(.12):]])
    if tempo!=1.0:
        open('tmp.raw','wb').write((y*32767).astype(np.int16).tobytes())
        subprocess.run(['ffmpeg','-loglevel','error','-y','-f','s16le','-ar',str(SR),'-ac','1','-i','tmp.raw','-af',f'atempo={tempo}','-f','s16le','tmp2.raw'],check=True)
        y=np.frombuffer(open('tmp2.raw','rb').read(),np.int16).astype(np.float32)/32768
    f=int(.012*SR); y[:f]*=np.linspace(0,1,f); y[-f:]*=np.linspace(1,0,f); return y
P=json.loads(sys.argv[2]); out=np.zeros(int(26.2*SR)); log=[]
for p in P:
    y=seg(p.get('src',sys.argv[1]),p['a'],p['b'],p.get('tempo',1.0),p.get('cut')); i=int(p['at']*SR)
    assert i+len(y)<=len(out), ('passa de 22s',p); 
    if np.abs(out[i:i+len(y)]).max()>0: raise SystemExit(f'sobreposição em {p}')
    out[i:i+len(y)]+=y; log.append((p['at'],round(p['at']+len(y)/SR,2)))
w=wave.open(sys.argv[3],'wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes());w.close()
print(log)
