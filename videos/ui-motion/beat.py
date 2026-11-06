import numpy as np, wave, sys
def load(f):
    w=wave.open(f);n=w.getnframes();sr=w.getframerate()
    return np.frombuffer(w.readframes(n),np.int16).astype(np.float32)/32768,sr
def analyze(f):
    x,sr=load(f);hop=256;win=1024
    fr=np.lib.stride_tricks.sliding_window_view(x,win)[::hop]*np.hanning(win)
    S=np.abs(np.fft.rfft(fr,axis=1));freqs=np.fft.rfftfreq(win,1/sr)
    lo=S[:,freqs<150].sum(1)
    flux=np.maximum(np.diff(np.log1p(S*10),axis=0),0).sum(1);flux=np.r_[0,flux]
    env=flux-np.convolve(flux,np.ones(32)/32,'same');env=np.maximum(env,0)
    fps=sr/hop
    # tempo via autocorrelation 80-160bpm
    ac=np.correlate(env,env,'full')[len(env)-1:]
    lags=np.arange(len(ac))/fps;m=(lags>60/160)&(lags<60/80)
    per=lags[m][np.argmax(ac[m])]
    # refine: grid search bpm 118..122 and phase
    best=None
    for bpm in np.arange(117,123.01,.02):
        p=60/bpm
        for ph in np.arange(0,p,0.005):
            ts=np.arange(ph,len(x)/sr-0.05,p);idx=(ts*fps).astype(int)
            s=env[idx].mean()
            if best is None or s>best[0]:best=(s,bpm,ph)
    s,bpm,ph=best;p=60/bpm
    ts=np.arange(ph,len(x)/sr-0.05,p)
    # downbeat: which beat index mod 4 has most low energy
    lo_n=lo/lo.max();acc=[np.mean([lo_n[int(t*fps)] for t in ts[k::4]]) for k in range(4)]
    # strength regularity
    strength=np.array([env[int(t*fps)] for t in ts]);
    print(f"{f.split('/')[-1]}: acbpm {60/per:.1f} bpm {bpm:.2f} phase {ph:.3f} downbeat-k {np.argmax(acc)} acc {np.round(acc,2)} beatcv {strength.std()/strength.mean():.2f} hit {s/env.mean():.2f}")
    return bpm,ph,ts
for f in sys.argv[1:]: analyze(f)
