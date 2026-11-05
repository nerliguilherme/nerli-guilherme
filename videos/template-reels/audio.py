# Trilha + efeitos sintetizados. uso: python3 audio.py saida.wav dur bpm eventos.json
import sys, json, wave, numpy as np
out, dur, bpm, evf = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
sr=44100; N=int(sr*dur); t=np.arange(N)/sr; mix=np.zeros((N,2)); rng=np.random.default_rng(3)
def add(sig,t0,g=1.0,pan=0.0):
  i=int(t0*sr); s=sig[:max(0,N-i)]
  if i>=N or len(s)==0: return
  mix[i:i+len(s),0]+=s*g*(1-max(0,pan)); mix[i:i+len(s),1]+=s*g*(1+min(0,pan))
def tt(d): return np.arange(int(d*sr))/sr
def bp(x,lo,hi):
  F=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/sr); F[(f<lo)|(f>hi)]=0; return np.fft.irfft(F,len(x))
kick=lambda: (lambda x: np.sin(2*np.pi*(45+90*np.exp(-x*30))*x)*np.exp(-x*7))(tt(.45))
snare=lambda: (lambda x: bp(rng.standard_normal(len(x)),900,7000)*np.exp(-x*18)*.6+np.sin(2*np.pi*190*x)*np.exp(-x*25)*.4)(tt(.3))
hat=lambda: (lambda x: bp(rng.standard_normal(len(x)),7000,15000)*np.exp(-x*60))(tt(.08))
def tone(f,d,a=.01,r=4.0,harm=(1,.5,.25)):
  x=tt(d); s=sum(h*np.sin(2*np.pi*f*(k+1)*x) for k,h in enumerate(harm)); env=np.minimum(x/a,1)*np.exp(-x*r); return s*env
def pad(fs,d):
  x=tt(d); s=sum(np.sin(2*np.pi*f*x+np.sin(2*np.pi*.3*x)*.5)+.4*np.sin(2*np.pi*f*2.003*x) for f in fs)
  env=np.minimum(x/.6,1)*np.minimum((d-x)/.6,1); return s*env/len(fs)
beat=60/bpm; bar=beat*4
# progressão (Am F C G) em frequências
prog=[[220,261.6,329.6],[174.6,220,261.6],[261.6,329.6,392],[196,246.9,293.7]]
bass=[110,87.3,130.8,98]
nb=int(dur/bar)+1; endfade=dur-2.0
for b in range(nb):
  t0=b*bar; ch=prog[b%4]
  add(pad(ch,bar+.3),t0,.10)
  for k in range(4):
    tb=t0+k*beat
    if tb>dur: break
    add(kick(),tb,.55)
    if k in(1,3): add(snare(),tb,.22)
    add(hat(),tb,.10,-.3); add(hat(),tb+beat/2,.07,.3)
    add(tone(bass[b%4],beat*.9,.005,3,(1,.3)),tb,.22)
  # arpejo
  for k in range(8):
    tb=t0+k*beat/2; f=ch[k%3]*2
    if tb<dur: add(tone(f,.35,.003,9,(1,.2)),tb,.05,(-.4 if k%2 else .4))
# fade da trilha e "ducking" leve em eventos
env=np.ones(N); env*=np.clip(t/1.0,0,1); env*=np.clip((dur-t)/1.5,0,1)
mix*=env[:,None]
import os
mix*=float(os.environ.get('MUSIC_GAIN','1'))
ev=json.load(open(evf))
def whoosh(d=.6):
  x=tt(d); n=rng.standard_normal(len(x)); s=np.zeros(len(x))
  for lo,hi,o in [(300,1200,0),(900,3500,.15),(2500,8000,.3)]:
    e=np.exp(-((x/d-.35-o*.5)**2)/.02); s+=bp(n,lo,hi)*e
  return s/np.abs(s).max()
def pop(f=900): x=tt(.12); return np.sin(2*np.pi*(f*1.6*np.exp(-x*30)+f*.4)*x)*np.exp(-x*35)
def click(): x=tt(.03); return bp(rng.standard_normal(len(x)),2000,9000)*np.exp(-x*200)
def chime(): return sum(tone(f,1.2,.002,3.5,(1,.15)) for f in [1318.5,1975.5])*.5
def ding(): return tone(1046.5,.8,.002,5)+tone(1568,.8,.002,4)*.6
def boom(): x=tt(1.0); return np.sin(2*np.pi*(40+60*np.exp(-x*12))*x)*np.exp(-x*3)+bp(rng.standard_normal(len(x)),60,500)*np.exp(-x*6)*.3
def riser(d=1.0): x=tt(d); return bp(rng.standard_normal(len(x)),2000,10000)*(x/d)**2
FX={'whoosh':(whoosh,.35),'pop':(pop,.16),'click':(click,.25),'chime':(chime,.25),'ding':(ding,.22),'boom':(boom,.6),'riser':(riser,.18)}
for e in ev:
  fn,g=FX[e[1]]; add(fn(),e[0],g*(e[2] if len(e)>2 else 1)*float(os.environ.get('SFX_GAIN','1')))
mix=np.tanh(mix*1.2)/np.tanh(1.2)
if os.environ.get('NO_NORM')!='1': mix/=np.abs(mix).max()/0.9
pcm=(mix*32767).astype(np.int16)
with wave.open(out,'wb') as f: f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())
