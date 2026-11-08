// node render.js <j0> <j1> <out> — 2 subquadros por quadro: subquadro j em (j-0.5)/120 (±1/240 em torno de f/60 = blur leve)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [j0,j1]=[+process.argv[2],+process.argv[3]],out=process.argv[4];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://127.0.0.1:8775/film.html');await pg.evaluate(()=>window.ready);
for(let j=j0;j<=j1;j++){await pg.evaluate(t=>seek(t),Math.max(0,(j-0.5)/120));
 await pg.screenshot({path:`${out}/${String(j).padStart(5,'0')}.png`}); if(j%200==0)console.log(j);}
await b.close();})();
