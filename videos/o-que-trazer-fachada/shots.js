// node shots.js <out> <t1,t2,...>
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('console',m=>console.log('console:',m.text()));pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('http://127.0.0.1:8773/'+(process.env.FILM||'film.html'));await pg.evaluate(()=>window.ready);
for(const t of process.argv[3].split(',').map(Number)){await pg.evaluate(t=>seek(t),t);await pg.screenshot({path:`${out}/t_${t.toFixed(2)}.png`});}
await b.close();})();
