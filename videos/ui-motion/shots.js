// node shots.js <out_dir> <t1,t2,...>   -> png por tempo
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('console',m=>console.log('console:',m.text()));pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('file://'+__dirname+'/ui.html');await pg.evaluate(()=>document.fonts.ready);
await pg.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>0))));
for(const t of process.argv[3].split(',').map(Number)){await pg.evaluate(t=>seek(t),t);
 await pg.screenshot({path:`${out}/t_${t.toFixed(2)}.png`});}
await b.close();})();
