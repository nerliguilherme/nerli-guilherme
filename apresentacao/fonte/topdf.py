import glob,os,sys
from PIL import Image
d=os.path.dirname(os.path.abspath(__file__))
fs=sorted(glob.glob(d+'/hi/*.jpg'))
ims=[Image.open(f).convert('RGB') for f in fs]
ims[0].save(sys.argv[1],save_all=True,append_images=ims[1:],resolution=144,quality=88)
print(len(ims),os.path.getsize(sys.argv[1])//1024//1024,'MB')
