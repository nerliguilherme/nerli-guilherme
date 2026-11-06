import cv2, numpy as np
def blur_faces(im, pts):
    out=im.copy()
    for (x,y,r) in pts:
        x0,y0,x1,y1=max(x-2*r,0),max(y-2*r,0),x+2*r,y+2*r
        roi=out[y0:y1,x0:x1]; b=cv2.GaussianBlur(roi,(0,0),r*0.45)
        m=np.zeros(roi.shape[:2],np.float32); cv2.ellipse(m,(x-x0,y-y0),(int(r*1.05),int(r*1.3)),0,0,360,1,-1)
        m=cv2.GaussianBlur(m,(0,0),r*.25)[...,None]; out[y0:y1,x0:x1]=(roi*(1-m)+b*m).astype(np.uint8)
    return out
n=cv2.imread('src/noite.jpg'); d=cv2.imread('src/dia.jpg')
n=blur_faces(n,[(448,903,22),(520,888,22),(573,898,22),(623,903,22),(665,922,22),(785,968,26),(880,983,28),(873,1032,22)])
d=blur_faces(d,[(540,1006,19),(683,958,22),(725,998,30),(875,1010,28)])
d=d[:1320]   # corta a placa da moto (fica abaixo de y=1335)
cv2.imwrite('dia_ok.png',d); cv2.imwrite('noite_ok.png',n)
# homografia da fachada (noite -> dia), só com pontos da parte de cima (fachada plana)
o=cv2.SIFT_create(6000)
g1=cv2.cvtColor(n,cv2.COLOR_BGR2GRAY); g2=cv2.cvtColor(d,cv2.COLOR_BGR2GRAY)
m1=np.zeros_like(g1); m1[100:760]=255; m2=np.zeros_like(g2); m2[150:760]=255
k1,e1=o.detectAndCompute(g1,m1); k2,e2=o.detectAndCompute(g2,m2)
mt=cv2.BFMatcher().knnMatch(e1,e2,k=2); good=[a for a,b in mt if a.distance<.72*b.distance]
p1=np.float32([k1[a.queryIdx].pt for a in good]); p2=np.float32([k2[a.trainIdx].pt for a in good])
H,inl=cv2.findHomography(p1,p2,cv2.RANSAC,4.0); print('matches',len(good),'inliers',int(inl.sum())); print(H)
np.save('H.npy',H)
w=cv2.warpPerspective(n,H,(d.shape[1],d.shape[0])); cv2.imwrite('noite_al.png',w)
v=np.hstack([d,w]); cv2.imwrite('cmp.jpg',cv2.resize(v,None,fx=.4,fy=.4))
ov=cv2.addWeighted(d,.5,w,.5,0); cv2.imwrite('ov.jpg',cv2.resize(ov,None,fx=.5,fy=.5))
