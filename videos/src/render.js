const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const dir=process.argv[2],fps=30,dur=6;
fs.mkdirSync(dir+'/frames',{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
await pg.goto('file://'+dir+'/anim.html');await pg.waitForTimeout(300);
const only=process.argv[3];
const ts=only?only.split(',').map(Number):[...Array(fps*dur).keys()].map(i=>i/fps);
for(let i=0;i<ts.length;i++){await pg.evaluate(t=>render(t),ts[i]);
 await pg.screenshot({path:`${dir}/frames/${only?'chk_'+ts[i]:String(i).padStart(4,'0')}.png`});}
await b.close();})();
