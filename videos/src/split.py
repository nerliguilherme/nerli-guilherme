from PIL import Image; import numpy as np, json
im=Image.open('text.png'); a=np.asarray(im)[...,3]
g=a[20:170]; cols=(g>40).sum(0)>0
runs=[];s=None
for x,v in enumerate(cols):
  if v and s is None: s=x
  if not v and s is not None: runs.append((s,x)); s=None
if s is not None: runs.append((s,len(cols)))
runs=[r for r in runs if r[1]-r[0]>15]; print(runs)
meta={'letters':[]}
for i,(x0,x1) in enumerate(runs):
  im.crop((x0-3,0,x1+3,172)).save(f'L{i}.png'); meta['letters'].append([x0-3,0])
im.crop((0,172,im.width,240)).save('tag.png'); meta['tag']=[0,172]
full=np.asarray(Image.open('logo_full.png')).copy()
# re-split symbol: mag/ora by hue, blue = rest
