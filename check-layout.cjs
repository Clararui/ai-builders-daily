const {chromium}=require('playwright');
const {resolve}=require('node:path');
const {mkdirSync}=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CI?{}:{channel:'chrome'})});
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 await page.goto('file://'+resolve(process.argv[2]));await page.waitForTimeout(1000);
 const count=await page.locator('.slide').count();
 for(let i=0;i<count;i++){
   await page.evaluate(i=>presentation.showSlide(i),i);await page.waitForTimeout(900);
   const bad=await page.evaluate(()=>{const s=document.querySelector('.slide.active'),foot=s.querySelector('.page-tag').getBoundingClientRect();return [...s.querySelectorAll('.analysis,.visual-column,h2')].filter(e=>e.scrollWidth>e.clientWidth+2||e.getBoundingClientRect().bottom>foot.top).map(e=>e.className);});
   if(bad.length)throw Error('Layout overflow on '+(i+1)+': '+bad);
 }
 const out=resolve(process.argv[3]||'work/cloud-daily');mkdirSync(out,{recursive:true});
 await page.evaluate(()=>presentation.showSlide(0));await page.waitForTimeout(1000);await page.screenshot({path:resolve(out,'layout-desktop.png')});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);await page.screenshot({path:resolve(out,'layout-phone.png')});
 console.log('Checked '+count+' slides and desktop/phone screenshots');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
