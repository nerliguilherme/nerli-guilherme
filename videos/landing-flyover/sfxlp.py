import numpy as np, wave
sr=48000;N=int(sr*14.5);rng=np.random.default_rng(11);out=np.zeros(N)
def bp(x,lo,hi):
  F=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/sr);F[(f<lo)|(f>hi)]=0;return np.fft.irfft(F,len(x))
def whoosh(t0,d,g):
  n=int(d*sr);tt=np.arange(n)/sr;s=np.zeros(n);no=rng.standard_normal(n)
  for lo,hi,o in [(250,1100,0),(800,3200,.12),(2200,8000,.24)]:
    s+=bp(no,lo,hi)*np.exp(-((tt/d-.55-o*.4)**2)/.03)
  s/=np.abs(s).max();i=int(t0*sr)-int(.55*n);out[max(0,i):max(0,i)+n]+=s[:N-max(0,i)][:n]*g
whoosh(8.66,1.0,.5);whoosh(9.80,.6,.6)
pcm=(np.repeat(out[:,None],2,1)*32767*.9).astype(np.int16)
with wave.open('whoosh.wav','wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())
