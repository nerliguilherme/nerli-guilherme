const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();
await pg.goto('http://127.0.0.1:8772/film.html');await pg.evaluate(()=>window.ready);
require('fs').writeFileSync('audio/ev.json',JSON.stringify(await pg.evaluate(()=>window.EV)));await b.close();})();
