// node render.js <j0> <j1> <out>  — subquadros a 240/s; subquadro j no tempo (j-1.5)/240, então 4 seguidos ficam centrados em f/60
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [j0,j1]=[+process.argv[2],+process.argv[3]],out=process.argv[4];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('file://'+__dirname+'/ui.html');await pg.evaluate(()=>document.fonts.ready);
await pg.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>0))));
for(let j=j0;j<=j1;j++){await pg.evaluate(t=>seek(t),(j-1.5)/240);
 await pg.screenshot({path:`${out}/${String(j).padStart(5,'0')}.png`});
 if(j%200==0)console.log(j);}
await b.close();})();
