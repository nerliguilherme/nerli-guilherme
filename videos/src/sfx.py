import numpy as np, wave
sr=48000; N=int(sr*6); t=np.arange(N)/sr; out=np.zeros(N); rng=np.random.default_rng(7)
def env(t0,a,d):
  e=np.zeros(N); x=t-t0
  e=np.where((x>=0)&(x<a),x/a,0)+np.where((x>=a)&(x<a+d),np.exp(-(x-a)/d*4),0); return e
def bp(sig,lo,hi):
  F=np.fft.rfft(sig); f=np.fft.rfftfreq(len(sig),1/sr); F[(f<lo)|(f>hi)]=0; return np.fft.irfft(F,len(sig))
noise=rng.standard_normal(N)
# whoosh das faixas (filtro varrendo)
w=np.zeros(N)
for lo,hi,s in [(200,900,0.0),(600,2500,0.25),(1500,6000,0.5)]:
  w+=bp(noise,lo,hi)*env(0.05+s*0.6,0.35,0.45)
out+=w*0.5
# impacto grave quando o N fecha
x=t-1.25; out+=np.where(x>0,np.sin(2*np.pi*(55+40*np.exp(-x*20))*x)*np.exp(-x*5),0)*0.8
out+=bp(noise,80,400)*env(1.25,0.005,0.3)*0.4
# pops das letras
for i in range(5):
  x=t-(1.72+i*0.09); out+=np.where(x>0,np.sin(2*np.pi*(700+i*90)*x)*np.exp(-x*45),0)*0.22
# swish da tagline
out+=bp(noise,3000,9000)*env(2.4,0.3,0.4)*0.15
# brilho
x=t-3.5; sh=np.where((x>0)&(x<1.2),np.sin(2*np.pi*(2600+1600*x)*x)*np.exp(-x*3),0)
out+=(sh+0.5*np.sin(2*np.pi*3950*t)*np.where((x>0)&(x<1.2),np.exp(-x*3),0))*0.07
# pad suave
pad=sum(np.sin(2*np.pi*f*t) for f in [110,164.8,220,277.2])*0.04*np.clip(t/1.5,0,1)*np.clip((6-t)/1.2,0,1)
out+=pad
out=out/np.abs(out).max()*0.89
pcm=(np.repeat(out[:,None],2,1)*32767).astype(np.int16)
with wave.open('sfx.wav','wb') as f: f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())
