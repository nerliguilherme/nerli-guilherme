// uso: node render.js <dir> <arquivo.html> <saida_frames> [t1,t2,...]
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [dir,html,out,only]=process.argv.slice(2);const fps=30;
fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('pageerror',e=>console.error('ERR',e.message));
await pg.goto('file://'+dir+'/'+html);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(500);
const dur=await pg.evaluate(()=>window.DUR);
const ts=only?only.split(',').map(Number):[...Array(Math.round(fps*dur)).keys()].map(i=>i/fps);
for(let i=0;i<ts.length;i++){await pg.evaluate(t=>render(t),ts[i]);
 await pg.screenshot({path:`${out}/${only?'k_'+ts[i]:String(i).padStart(5,'0')}.png`});}
await b.close();})();
