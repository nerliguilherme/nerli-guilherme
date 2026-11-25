const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1.5});
await p.goto('file://'+__dirname+'/deck.html');await p.evaluate(()=>window.ready);await p.waitForTimeout(800);
const els=await p.$$('section');
for(let i=0;i<els.length;i++){await els[i].screenshot({path:__dirname+'/hi/'+String(i+1).padStart(2,'0')+'.jpg',type:'jpeg',quality:88});}
await b.close();console.log(els.length)})();
