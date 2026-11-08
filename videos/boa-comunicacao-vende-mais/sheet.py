import sys,glob
from PIL import Image,ImageDraw
d=sys.argv[1];cols=int(sys.argv[2]) if len(sys.argv)>2 else 8
fs=sorted(glob.glob(d+'/t_*.png'),key=lambda f:float(f.split('_')[-1][:-4]))
W,H=240,427;rows=(len(fs)+cols-1)//cols;o=Image.new('RGB',(W*cols,H*rows),'white');dr=ImageDraw.Draw(o)
for i,f in enumerate(fs):
  o.paste(Image.open(f).convert('RGB').resize((W,H)),((i%cols)*W,(i//cols)*H));dr.text(((i%cols)*W+5,(i//cols)*H+5),f.split('_')[-1][:-4],fill='red')
  # zonas seguras
  x0,y0=(i%cols)*W,(i//cols)*H;dr.line([(x0,y0+250*H/1920),(x0+W,y0+250*H/1920)],fill=(255,0,0));dr.line([(x0,y0+1520*H/1920),(x0+W,y0+1520*H/1920)],fill=(255,0,0))
o.save(d+'_sheet.png')
