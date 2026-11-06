// uso: node stills.js <dir> <N subquadros> <t1,t2,...> <saida>
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [dir,N,ts,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--enable-gpu','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const pg=await b.newPage({viewport:{width:1440,height:1152},deviceScaleFactor:1});
pg.on('console',m=>console.log('console:',m.text()));pg.on('pageerror',e=>console.log('ERRO:',e.message));
await pg.goto('http://127.0.0.1:8765/film.html');await pg.evaluate(()=>window.ready);
for(const t of ts.split(',').map(Number)){const t0=Date.now();const c=await pg.evaluate(([t,N])=>{const c=seek(t,N);return c;},[t,+N]);
 await pg.screenshot({path:`${out}/s_${t.toFixed(2)}.png`});console.log(`t=${t} ${c.ph} ly=${c.ly.toFixed(0)} d=${c.d.toFixed(0)} th=${(c.th*57.3).toFixed(1)} ${Date.now()-t0}ms`);}
await b.close();})();
