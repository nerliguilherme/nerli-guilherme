// Captura da landing page para o voo 3D.
// Saída: page_0.png / page_1.png (página sem as peças, 2x, em 2 faixas), pieces/*.png (cada peça sozinha, fundo transparente, 28px de folga),
// layers.json (posição de cada peça na página, em px CSS), tile.png (ladrilho da logo).
const {chromium}=require('playwright');const fs=require('fs');
const OUT=process.argv[2];const PAD=28,DPR=2;
(async()=>{
const b=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY}});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:DPR});const pg=await ctx.newPage();
await pg.goto('https://ngraph.com.br/',{waitUntil:'networkidle',timeout:120000});
// rola até o fim uma vez para carregar imagens e animações de entrada
let H=await pg.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=500){await pg.evaluate(y=>window.scrollTo(0,y),y);await pg.waitForTimeout(220);}
await pg.waitForTimeout(1500);await pg.evaluate(()=>window.scrollTo(0,0));await pg.waitForTimeout(800);
// trava o estado: sem animações, sem elementos fixos flutuantes, endereço escondido, peças marcadas
await pg.evaluate(()=>{
 const st=document.createElement('style');st.textContent=`*,*:before,*:after{transition:none!important;animation:none!important}
  .fade-in{opacity:1!important;transform:none!important} a.fixed, iframe#nl-badge-frame, #nl-badge-frame{display:none!important}
  header#top{position:absolute!important}`;document.head.appendChild(st);
 document.querySelectorAll('iframe').forEach(f=>f.style.display='none');
 // endereço: texto nos cards e no rodapé
 [...document.querySelectorAll('body *')].forEach(e=>{if([...e.childNodes].some(n=>n.nodeType==3&&/Belm[ií]nio|54740|Capibaribe/.test(n.textContent)))e.style.visibility='hidden';});
 // endereço dentro do print do Google Maps
 const maps=[...document.querySelectorAll('a')].find(a=>/Google Maps/.test(a.innerText)&&a.querySelector('img'));
 if(maps){const c=document.createElement('div');c.style.cssText='position:absolute;left:0;right:0;top:866px;height:84px;background:#fff;z-index:5';maps.appendChild(c);}
 const R=e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top+scrollY,w:r.width,h:r.height}};
 const L=[];const mark=(e,kind,id,extra)=>{if(!e)return;e.setAttribute('data-layer',id);L.push(Object.assign({id,kind},R(e),extra||{}));};
 const T=s=>[...document.querySelectorAll('a,span,div')].find(e=>e.innerText&&e.innerText.trim().startsWith(s)&&e.children.length<6);
 // hero
 mark(document.querySelector('section span.inline-flex'),'chip','hero_chip');
 const btns=[...document.querySelectorAll('section a')].filter(a=>/Solicitar Orçamento|Conhecer Serviços/.test(a.innerText)&&a.getBoundingClientRect().top+scrollY<800);
 btns.forEach((a,i)=>mark(a,'chip','hero_btn'+i));
 mark(document.querySelector('section img'),'mock','hero_img');
 // sobre: 4 cards
 [...document.querySelectorAll('#sobre .fade-in')].forEach((c,i)=>mark(c,i==0||i==3?'fly':'photo','sobre'+i));
 // serviços: 3 cards com foto
 [...document.querySelectorAll('#servicos .fade-in')].forEach((c,i)=>mark(c,'card','serv'+i));
 // trabalhos: 12 fotos + botão
 [...document.querySelectorAll('#trabalhos .fade-in')].forEach((c,i)=>mark(c,'work','work'+i));
 mark([...document.querySelectorAll('#trabalhos a')].find(a=>/Quero um projeto/.test(a.innerText)),'chip','work_btn');
 // localização
 [...document.querySelectorAll('#localizacao .grid > div.flex, #localizacao div.flex.items-start')].slice(0,4).forEach((c,i)=>mark(c,'info','info'+i));
 const ph=[...document.querySelectorAll('#localizacao .fade-in')].find(e=>e.querySelector('img')&&!e.closest('a'));mark(ph,'card','loc_photo');
 mark(maps,'testimonial','testimonial');
 mark([...document.querySelectorAll('#localizacao a')].find(a=>/Como Chegar/.test(a.innerText)),'chip','loc_btn');
 // contato
 [...document.querySelectorAll('#contato a')].forEach((a,i)=>mark(a,'chip','cta'+i));
 window.__L=L;
});
H=await pg.evaluate(()=>document.documentElement.scrollHeight);
const layers=await pg.evaluate(()=>window.__L);
const sections=await pg.evaluate(()=>[...document.querySelectorAll('section,footer')].map(e=>{const r=e.getBoundingClientRect();const h=e.querySelector('h1,h2');const hr=h?h.getBoundingClientRect():null;
  return {id:e.id||e.tagName.toLowerCase(),y:r.top+scrollY,h:r.height,title_y:hr?hr.top+scrollY+hr.height/2:null};}));
// 1) página inteira sem as peças
await pg.evaluate(()=>document.querySelectorAll('[data-layer]').forEach(e=>e.style.visibility='hidden'));
await pg.screenshot({path:OUT+'/page_full.png',fullPage:true});
// 2) cada peça sozinha em fundo transparente
fs.mkdirSync(OUT+'/pieces',{recursive:true});
await pg.evaluate(()=>{const st=document.createElement('style');st.id='solo';st.textContent=`html,body{background:transparent!important} body *{visibility:hidden!important}
  [data-solo], [data-solo] *{visibility:visible!important}`;document.head.appendChild(st);
  document.querySelectorAll('[data-layer]').forEach(e=>e.style.visibility='');});
for(const l of layers){
 await pg.evaluate(id=>{document.querySelectorAll('[data-solo]').forEach(e=>e.removeAttribute('data-solo'));document.querySelector(`[data-layer="${id}"]`).setAttribute('data-solo','1');
   // o que estava escondido de propósito (endereço) continua escondido
   document.querySelectorAll('[data-solo] *').forEach(e=>{if([...e.childNodes].some(n=>n.nodeType==3&&/Belm[ií]nio|54740|Capibaribe/.test(n.textContent)))e.style.setProperty('visibility','hidden','important');});},l.id);
 await pg.screenshot({path:`${OUT}/pieces/${l.id}.png`,fullPage:true,omitBackground:true,clip:{x:l.x-PAD,y:l.y-PAD,width:l.w+2*PAD,height:l.h+2*PAD}});
}
fs.writeFileSync(OUT+'/layers.json',JSON.stringify({W:1440,H,dpr:DPR,pad:PAD,layers,sections},null,1));
// ladrilho da logo
const t=await ctx.newPage();await t.setViewportSize({width:256,height:256});
await t.setContent(`<html><body style="margin:0;background:transparent"><div style="width:256px;height:256px;border-radius:60px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px #eceff5">
 <img src="data:image/svg+xml;base64,${fs.readFileSync(process.argv[3]).toString('base64')}" style="width:150px"></div></body></html>`);
await t.waitForTimeout(300);await t.screenshot({path:OUT+'/tile.png',omitBackground:true});
console.log('altura',H,'pecas',layers.length);await b.close();})();
