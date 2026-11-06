// node render.js <j0> <j1> <out> — subquadros a 240/s, subquadro j em (j-1.5)/240 (4 seguidos centrados em f/60)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [j0,j1]=[+process.argv[2],+process.argv[3]],out=process.argv[4];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://127.0.0.1:8770/film.html');await pg.evaluate(()=>window.ready);
for(let j=j0;j<=j1;j++){await pg.evaluate(t=>seek(t),Math.max(0,(j-1.5)/240));
 await pg.screenshot({path:`${out}/${String(j).padStart(5,'0')}.png`}); if(j%200==0)console.log(j);}
await b.close();})();
