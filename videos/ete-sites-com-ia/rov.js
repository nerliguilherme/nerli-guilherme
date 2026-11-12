const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [a,b]=[+process.argv[2],+process.argv[3]];fs.mkdirSync('ov',{recursive:true});
const br=await chromium.launch();const p=await br.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+__dirname+'/ov.html');await p.evaluate(()=>window.ready);
for(let f=a;f<=b;f++){await p.evaluate(t=>seek(t),f/30);await p.screenshot({path:`ov/${String(f).padStart(5,'0')}.png`,omitBackground:true});}
await br.close();})();
