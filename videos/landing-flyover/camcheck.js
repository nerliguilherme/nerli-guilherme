// checagem analítica da câmera: velocidade de descida e distância a cada 1/120 s
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const pg=await b.newPage({viewport:{width:1440,height:1152}});
await pg.goto('http://127.0.0.1:8765/film.html');await pg.evaluate(()=>window.ready);
const r=await pg.evaluate(()=>{const o=[];for(let i=0;i<=1740;i++){const t=i/120;const c=camInfo(t);o.push([t,c.ly,c.d,c.th,c.ph]);}return o;});
let dips=[],zin=[],lyBack=[];let prevV=null;
for(let i=1;i<r.length;i++){const [t,ly,d]=r[i],[t0,ly0,d0]=r[i-1];const v=(ly-ly0)*120;
 if(t>1.6&&t<7.3&&prevV!==null&&v<prevV*0.985)dips.push([t.toFixed(3),v.toFixed(1)]);
 if(t<=8.2&&d<d0-1e-6)zin.push(t);
 if(t<9.25&&ly<ly0-1e-6)lyBack.push(t.toFixed(3));
 prevV=(t>1.6&&t<7.3)?v:prevV;}
const sp=r.filter(x=>x[0]>1.6&&x[0]<7.3).map((x,i,a)=>i?(x[1]-a[i-1][1])*120:null).filter(x=>x);
console.log('cruzeiro px/s min',Math.min(...sp).toFixed(1),'max',Math.max(...sp).toFixed(1));
console.log('quedas de velocidade 1.6–7.3s:',dips.length,'| zoom-in até 8.2s:',zin.length,'| câmera voltando na página antes de 9.25s:',lyBack.length,lyBack.slice(0,5));
await b.close();})();
