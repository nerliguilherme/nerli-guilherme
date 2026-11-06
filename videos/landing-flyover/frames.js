// uso: node frames.js <fps> <N subquadros> <f_ini> <f_fim> <saida> [escala]
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [fps,N,a,b,out,sc]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
const br=await chromium.launch({args:['--enable-gpu','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const pg=await br.newPage({viewport:{width:1440,height:1152},deviceScaleFactor:1});pg.on('pageerror',e=>console.log('ERRO',e.message));
await pg.goto('http://127.0.0.1:8765/film.html');await pg.evaluate(()=>window.ready);
for(let f=+a;f<=+b;f++){await pg.evaluate(([f,N,fps])=>renderFrame(f,N,fps),[f,+N,+fps]);
 await pg.screenshot({path:`${out}/${String(f).padStart(5,'0')}.png`,scale:'css'});}
console.log('ok',a,b);await br.close();})();
