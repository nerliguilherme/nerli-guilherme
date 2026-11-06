# Sons de UI sintetizados (determinísticos) + mix com a trilha. Cada som é posicionado pelo seu pico medido.
import numpy as np, wave
SR=48000; T=18.0
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

def hum(): return mix(.35*tone(110,1.1,.25,.6,f2=165),.2*tone(220,1.1,.3,.5,f2=330),swoosh(1.0,1500,7000)*.35)
EV=[(0.45,hum(),.7),(1.5,swoosh(.3),.8),(2.0,click(),1),(2.3,swoosh(.22),.6),(2.9,pop(),.8),(3.5,swoosh(.34),.9),
 (3.9,tick(.9),.6),(4.8,tick(1.0),.6),(5.7,tick(1.1),.6),(6.4,success(),.45),(7.0,swoosh(.24),.6),(7.5,toggle(),1),(7.62,swoosh(.5,400,4000),.7),
 (8.6,click(.7),.7),(9.15,draw(),.75),(9.7,click(.85),.55),(10.0,swoosh(.32),.8),(10.45,click(1.05),.9),(10.95,click(1.1),.9),
 (11.5,swoosh(.3),.8),(11.78,draw(),.6),(12.1,tick(),.8),(12.5,swoosh(.3),.8),(12.75,click(),.85),(14.1,click(.95),.9),(14.62,success(),.95),
 (15.5,swoosh(.4),.85),(15.95,pop(),.5)]
for i,t in enumerate([12.95,13.15,13.35,13.55]): EV.append((t,tick(1+.06*((i*3)%5-2)),.8))
out=np.zeros(int(T*SR)); log=[]
for t,x,g in EV:
    pk=int(np.argmax(np.abs(x))); s=int(round(t*SR))-pk; x=x/np.max(np.abs(x))*g*.5
    a=max(s,0); b=min(s+len(x),len(out)); out[a:b]+=x[a-s:b-s]; log.append((t,round(pk/SR*1000,1)))
w=wave.open('sfx.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
w.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes());w.close()
print('eventos',len(EV),'picos(ms) ex.',log[:6])
