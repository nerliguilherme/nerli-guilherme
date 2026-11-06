// Gera catalogo-ngraph.pdf a partir de index.html (A4, com capa). Uso: node pdf.js  (com "python3 -m http.server 8790" rodando nesta pasta)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}:undefined});
const pg=await b.newPage();
await pg.goto('http://127.0.0.1:8790/index.html',{waitUntil:'networkidle'});
await pg.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>0)));await document.fonts.ready;});
await pg.pdf({path:'catalogo-ngraph.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});
await b.close();console.log('catalogo-ngraph.pdf');})();
