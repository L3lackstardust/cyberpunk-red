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
  context.setDefaultTimeout(7000);
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

  await check('Two-tab player edit propagates without removing cyberware',async()=>{
   const playerTab=await context.newPage();
   const cyberTab=await context.newPage();
   playerTab.on('pageerror',e=>errors.push('player tab: '+e.message));
   cyberTab.on('pageerror',e=>errors.push('cyber tab: '+e.message));
   try{
    await playerTab.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
    await cyberTab.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    await cyberTab.evaluate(()=>{
     const k='cyberpunk-red-character-v1';
     const v=JSON.parse(localStorage.getItem(k));
     v.installed=['optic'];v.owned=['arm'];v.netLoaded=['sword'];
     localStorage.setItem(k,JSON.stringify(v));
    });
    await cyberTab.reload({waitUntil:'domcontentloaded'});
    await playerTab.locator('[data-key="eb"]').fill('777');
    await playerTab.locator('[data-key="eb"]').dispatchEvent('change');
    await cyberTab.waitForFunction(()=>Number(document.querySelector('#cash').value)===777,{timeout:5000});
    const stored=await cyberTab.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-character-v1')));
    assert.equal(stored.cash,777);
    assert.deepEqual(stored.installed,['optic']);
    assert.deepEqual(stored.owned,['arm']);
    assert.deepEqual(stored.netLoaded,['sword']);
   }finally{await playerTab.close();await cyberTab.close()}
  });
  await check('Two-tab cyberware humanity edit updates player without overwriting skills',async()=>{
   const playerTab=await context.newPage();
   const cyberTab=await context.newPage();
   playerTab.on('pageerror',e=>errors.push('player tab: '+e.message));
   cyberTab.on('pageerror',e=>errors.push('cyber tab: '+e.message));
   try{
    await playerTab.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
    await cyberTab.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    await playerTab.locator('[data-skill="Perception"]').fill('5');
    await playerTab.locator('[data-skill="Perception"]').dispatchEvent('input');
    const before=await playerTab.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-console-v1')));
    assert.equal(before.skills.Perception,5);
    await cyberTab.locator('#humanity').fill('33');
    await cyberTab.locator('#humanity').dispatchEvent('input');
    await playerTab.waitForFunction(()=>Number(document.querySelector('[data-key="humanity"]').value)===33,{timeout:5000});
    const stored=await playerTab.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-console-v1')));
    assert.equal(stored.humanity,33);
    assert.equal(stored.skills.Perception,5);
   }finally{await playerTab.close();await cyberTab.close()}
  });

  await check('Cyberware backup import restores installed items and settings',async()=>{
   const restore=await context.newPage();
   restore.on('pageerror',e=>errors.push('backup tab: '+e.message));
   try{
    await restore.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    const snapshot=await restore.evaluate(()=>{
     const raw=JSON.parse(localStorage.getItem('cyberpunk-red-character-v1'));
     return {...raw,name:'BACKUP-RESTORED',installed:['optic','image'],owned:['arm'],netLoaded:['sword'],conditions:{...raw.conditions,image:true}};
    });
    restore.once('dialog',dialog=>dialog.accept());
    await restore.locator('#import').setInputFiles({name:'restore-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({schema:1,kind:'cyberpunk-character',data:snapshot}))});
    await restore.waitForFunction(()=>JSON.parse(localStorage.getItem('cyberpunk-red-character-v1')||'{}').name==='BACKUP-RESTORED');
    const stored=await restore.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-character-v1')));
    assert.deepEqual(stored.installed,['optic','image']);
    assert.deepEqual(stored.owned,['arm']);
    assert.deepEqual(stored.netLoaded,['sword']);
    assert.equal(stored.conditions.image,true);
   }finally{await restore.close()}
  });
  await check('Conditional cyberware modifier only applies to relevant action',async()=>{
   const modPage=await context.newPage();
   modPage.on('pageerror',e=>errors.push('modifier tab: '+e.message));
   try{
    await modPage.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    const result=await modPage.evaluate(()=>{
     state.installed=['optic','image'];
     state.action='perception';
     state.conditions.image=false;
     const off=mods().reduce((sum,x)=>sum+x.value,0);
     state.conditions.image=true;
     const on=mods().reduce((sum,x)=>sum+x.value,0);
     state.action='handgun';
     const other=mods().reduce((sum,x)=>sum+x.value,0);
     return {off,on,other};
    });
    assert.deepEqual(result,{off:0,on:2,other:0});
   }finally{await modPage.close()}
  });

  await check('48-frame cyberware rotation wraps with keyboard input',async()=>{
   const viewer=await context.newPage();
   viewer.on('pageerror',e=>errors.push('spin tab: '+e.message));
   try{
    await viewer.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    await viewer.evaluate(()=>{spinEnabled=true;render()});
    const control=viewer.locator('#spinView');
    await control.waitFor({state:'attached'});
    assert.equal(await control.getAttribute('aria-valuenow'),'0');
    await control.evaluate(el=>el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true})));

    assert.equal(await control.getAttribute('aria-valuenow'),'47');
    await control.evaluate(el=>el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true})));
    assert.equal(await control.getAttribute('aria-valuenow'),'0');
    assert.match(await viewer.locator('#spinIndex').innerText(),/FRAME 1\/48/);
   }finally{await viewer.close()}
  });
  await check('Image rotation provides a fallback when sequence art is unavailable',async()=>{
   const viewer=await context.newPage();
   viewer.on('pageerror',e=>errors.push('fallback tab: '+e.message));
   try{
    await viewer.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    await viewer.evaluate(()=>{spinEnabled=true;spinManifest=null;render()});
    await viewer.locator('#spinBase').waitFor({state:'attached'});
    const src=await viewer.locator('#spinBase').getAttribute('src');
    assert.ok(src&&src.startsWith('data:image/svg+xml'), 'Expected procedural SVG fallback');
    const img=viewer.locator('#spinBase');
    await viewer.waitForFunction(()=>{const el=document.getElementById('spinBase');return !!el&&el.complete&&el.naturalWidth>0},null,{timeout:7000});
    assert.equal(await img.evaluate(el=>el.naturalWidth>0),true);
   }finally{await viewer.close()}
  });
  await check('Rapid rotation keeps the latest cyberware frame and overlays',async()=>{
   const viewer=await context.newPage();
   viewer.on('pageerror',e=>errors.push('rapid spin tab: '+e.message));
   try{
    await viewer.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    const result=await viewer.evaluate(()=>{
     state.installInstances=[{itemId:'arm',side:'Left'}];
     spinManifest={presets:{standard:{base:Array.from({length:48},(_,i)=>'missing-frame-'+i+'.png'),overlays:{'arms-left':Array.from({length:48},(_,i)=>'missing-arm-'+i+'.png')}}}};
     spinManifestPromise=Promise.resolve(spinManifest);
     spinAssetPath=relative=>'./assets/cyberware-spin/'+relative;
     spinEnabled=true;spinFrame=0;render();
     const img=document.getElementById('spinBase');
     const firstError=img.onerror;
     const initial=img.src;
     spinStep(1);spinStep(1);spinStep(1);
     const latest=img.src;
     firstError(new Event('error'));
     const afterStale=img.src;
     img.onerror(new Event('error'));
     const fallback=img.src;
     return {initial,latest,afterStale,fallback,frame:spinFrame,aria:document.getElementById('spinView').getAttribute('aria-valuenow'),overlayCount:document.querySelectorAll('#spinOverlays img').length};
    });
    assert.ok(result.initial.includes('missing-frame-0.png'), 'Initial frame should request frame 0');
    assert.ok(result.latest.includes('missing-frame-3.png'), 'Latest frame should request frame 3');
    assert.equal(result.afterStale,result.latest,'Stale callback must not replace current frame');
    assert.ok(result.fallback.startsWith('data:image/svg+xml'),'Current frame should fall back to procedural art');
    assert.equal(result.frame,3);
    assert.equal(result.aria,'3');
    assert.equal(result.overlayCount,1);
   }finally{await viewer.close()}
  });
  await check('Avatar studio builds, rotates, poses and saves one shared identity',async()=>{
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push('avatar studio: '+e.message));
   try{
    await page.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    await page.locator('[data-key="build"][data-value="female-athletic"]').click();
    await page.locator('[data-key="pose"][data-value="confident"]').click();
    await page.locator('[data-key="cyberarm"][data-value="left"]').click();
    await page.locator('[data-key="eyes"]').click();
    await page.locator('#right').click();
    assert.equal(await page.locator('#viewer').getAttribute('aria-valuenow'),'1');
    assert.equal(await page.locator('#portrait svg').count(),1);
    assert.equal(await page.locator('#body svg').count(),1);
    await page.evaluate(()=>localStorage.setItem('cyberpunk-red-character-v1',JSON.stringify({installInstances:[{itemId:'arm',side:'right'},{itemId:'optic',side:'both'}]})));
    await page.locator('#syncCyberware').click();
    assert.equal(await page.locator('[data-key="cyberarm"][data-value="right"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-key="eyes"]').getAttribute('aria-pressed'),'true');
    await page.locator('#save').click();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-avatar-v1')));
    assert.equal(saved.build,'female-athletic');assert.equal(saved.pose,'confident');assert.equal(saved.cyberarm,'right');assert.equal(saved.eyes,true);
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('[data-key="cyberarm"][data-value="right"]').getAttribute('aria-pressed'),'true');
    await page.evaluate(()=>localStorage.setItem('cyberpunk-red-character-v1',JSON.stringify({installInstances:[{itemId:'arm',side:'left'}]})));
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('[data-key="cyberarm"][data-value="left"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-key="eyes"]').getAttribute('aria-pressed'),'false');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('[data-key="pose"][data-value="confident"]').getAttribute('aria-pressed'),'true');
   }finally{await page.close()}
  });
  await check('No uncaught errors in tested flows',async()=>assert.deepEqual(errors,[]));
  await context.close();
 }finally{if(browser)await browser.close();server.kill()}
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});