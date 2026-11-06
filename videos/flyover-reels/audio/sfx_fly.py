# Sons de UI sintetizados (determinísticos) + mix com a trilha. Cada som é posicionado pelo seu pico medido.
import numpy as np, wave
SR=48000; T=15.0
rng=np.random.default_rng(7)
def mix(*xs):
    n=max(len(x) for x in xs);o=np.zeros(n)
    for x in xs:o[:len(x)]+=x
    return o
def env(n,a,d): t=np.arange(n)/SR; return (1-np.exp(-t/a))*np.exp(-t/d)
def tone(f,dur,a=.001,d=.05,f2=None):
    n=int(dur*SR); t=np.arange(n)/SR; ff=f if f2 is None else f*(f2/f)**(t/dur)
    return np.sin(2*np.pi*np.cumsum(ff)/SR)*env(n,a,d)
def bp(x,lo,hi):
    X=np.fft.rfft(x);fr=np.fft.rfftfreq(len(x),1/SR);X[(fr<lo)|(fr>hi)]=0;return np.fft.irfft(X,len(x))
def noise(dur): return rng.standard_normal(int(dur*SR))
def click(p=1.0):
    n=noise(.03);n=bp(n,2500,9000)*env(len(n),.0002,.004)
    return mix(.5*n,.6*tone(2100*p,.04,.0003,.008),.5*tone(190*p,.05,.0005,.014))
def tick(p=1.0): return mix(.5*tone(3600*p,.025,.0002,.005),.25*bp(noise(.02),4000,12000)*env(int(.02*SR),.0001,.002))
def pop(): return mix(.8*tone(640,.12,.001,.03,f2=280),.2*tone(1280,.06,.0005,.01))
def swoosh(dur=.32,lo=300,hi=3000):
    n=int(dur*SR);x=noise(dur);t=np.arange(n)/SR
    e=np.sin(np.pi*np.clip(t/dur,0,1))**2.2
    return bp(x,lo,hi)*e*.35
def success():
    return mix(.5*tone(1318.5,.5,.002,.13),.12*tone(2637,.3,.002,.06),np.r_[np.zeros(int(.07*SR)),mix(.45*tone(1975.5,.5,.002,.16),.1*tone(3951,.3,.002,.05))])
def toggle(): a=click(.8);b=click(1.15);o=np.zeros(len(a)+int(.03*SR));o[:len(a)]+=a;o[int(.03*SR):]+=b*.8;return o
def stretch(): return mix(.45*tone(230,.32,.01,.2,f2=150),.1*swoosh(.3,150,900))
def draw(): return mix(.25*tone(420,.5,.08,.4,f2=900)*np.hanning(int(.5*SR)),swoosh(.5,800,5000)*.6)

def whoosh(dur=1.3):
    n=int(dur*SR);x=noise(dur);t=np.arange(n)/SR;e=np.sin(np.pi*np.clip(t/dur,0,1))**2.6
    X=np.fft.rfft(x);fr=np.fft.rfftfreq(n,1/SR);X*=np.exp(-((np.log(fr+1)-np.log(1400))**2)/1.1);y=np.fft.irfft(X,n)
    return y*e
EV=[(10.15,whoosh(1.4),.75),(11.95,swoosh(.6,600,5000),.35),(13.62,mix(.5*tone(880,.6,.004,.22),.3*tone(1318.5,.6,.004,.25)),.45),(13.5,swoosh(.3,800,4000),.3)]
out=np.zeros(int(T*SR)); log=[]
for t,x,g in EV:
    pk=int(np.argmax(np.abs(x))); s=int(round(t*SR))-pk; x=x/np.max(np.abs(x))*g*.5
    a=max(s,0); b=min(s+len(x),len(out)); out[a:b]+=x[a-s:b-s]; log.append((t,round(pk/SR*1000,1)))
w=wave.open('sfx.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
w.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes());w.close()
print('eventos',len(EV),'picos(ms) ex.',log[:6])
