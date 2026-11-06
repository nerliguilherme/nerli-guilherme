// uso: node render_range.js <dir> <html> <saida> <frame_ini> <frame_fim>  (sobrescreve só esses quadros)
const {chromium}=require('playwright');
(async()=>{const [dir,html,out,a,b]=process.argv.slice(2);const fps=30;
const br=await chromium.launch();const pg=await br.newPage({viewport:{width:1080,height:1920}});
await pg.goto('file://'+dir+'/'+html);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(500);
for(let i=+a;i<=+b;i++){await pg.evaluate(t=>render(t),i/fps);await pg.screenshot({path:`${out}/${String(i).padStart(5,'0')}.png`});}
await br.close();})();
