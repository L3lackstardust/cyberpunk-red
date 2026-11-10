const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
(async()=>{
 const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
 let browser;
 const failures=[];
 async function check(name,fn){try{await fn();console.log('PASS',name)}catch(e){failures.push(name+': '+e.message);console.error('FAIL',name,e.message)}}
 try{
  await delay(1200);
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({acceptDownloads:true});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await check('Player loads and saves a handle',async()=>{
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
   const input=page.locator('[data-key="handle"]');
   await input.fill('STABILITY-TEST');
   await input.dispatchEvent('change');
   await page.waitForTimeout(200);
   const raw=await page.evaluate(()=>localStorage.getItem('cyberpunk-red-console-v1'));
   assert.equal(JSON.parse(raw).handle,'STABILITY-TEST');
   assert.match(await page.locator('#redSaveStatus').innerText(),/Saved in this browser/);
  });
  await check('Player data survives reload',async()=>{
   await page.reload({waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('[data-key="handle"]').inputValue(),'STABILITY-TEST');
  });
  await check('Player JSON export downloads',async()=>{
   const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);
   assert.match(download.suggestedFilename(),/json/i);
  });
  await check('Cyberware loads and saves a name',async()=>{
   await page.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
   await page.locator('#name').fill('STABILITY-TEST');
   await page.locator('#name').dispatchEvent('input');
   await page.waitForTimeout(150);
   const raw=await page.evaluate(()=>localStorage.getItem('cyberpunk-red-character-v1'));
   assert.equal(JSON.parse(raw).name,'STABILITY-TEST');
   assert.match(await page.locator('#redSaveStatus').innerText(),/Saved in this browser/);
  });
  await check('Cyberware survives reload',async()=>{
   await page.reload({waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('#name').inputValue(),'STABILITY-TEST');
  });
  await check('Cyberware JSON export downloads',async()=>{
   const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);
   assert.match(download.suggestedFilename(),/json/i);
  });
  await check('Cyberware reports storage failures',async()=>{
   await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(){throw new DOMException('Quota exceeded','QuotaExceededError')};
    window.__restoreStorage=()=>Storage.prototype.setItem=original;
   });
   await page.locator('#name').fill('UNSAVED-TEST');
   await page.locator('#name').dispatchEvent('input');
   await page.waitForTimeout(100);
   assert.match(await page.locator('#redSaveStatus').innerText(),/NOT SAVED/);
   await page.evaluate(()=>window.__restoreStorage());
  });
  await check('No uncaught errors in tested flows',async()=>assert.deepEqual(errors,[]));
  await context.close();
 }finally{if(browser)await browser.close();server.kill()}
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});