const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
(async()=>{
 const server=spawn(process.env.PYTHON||'python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
 server.on('error',error=>{console.error('Test server failed:',error.message);process.exitCode=1});
 let browser;
 const failures=[];
 async function check(name,fn){try{await fn();console.log('PASS',name)}catch(e){failures.push(name+': '+e.message);console.error('FAIL',name,e.message)}}
 try{
  await delay(1200);
  browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
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
  await check('Anatomical overlay counts implants on their actual side',async()=>{
   await page.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
   const counts=await page.evaluate(()=>{
    state.installed=['optic'];state.installInstances=[{id:'test-optic',itemId:'optic',side:'left'}];
    return [installedAt('Eyes','Left').length,installedAt('Eyes','Right').length];
   });
   assert.deepEqual(counts,[1,0]);
  });
  await check('Anatomical eye and limb targets retain selected sides',async()=>{
   await page.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
   await page.locator('#toggleLayers').click();
   const eye=page.locator('.layer-hit[data-loc="Eyes"][data-side="Left"]');
   assert.equal(await eye.count(),1);
   await eye.click();
   assert.equal(await page.locator('.layer-hit[data-loc="Eyes"][data-side="Left"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.layer-hit[data-loc="Eyes"][data-side="Right"]').getAttribute('aria-pressed'),'false');
   const arm=page.locator('.layer-hit[data-loc="Arms"][data-side="Right"]');
   await arm.focus();await arm.press('Enter');
   assert.equal(await page.locator('.layer-hit[data-loc="Arms"][data-side="Right"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.layer-hit[data-loc="Eyes"][data-side="Left"]').getAttribute('aria-pressed'),'false');
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
     return {...raw,name:'BACKUP-RESTORED',installed:['optic','image'],installInstances:[],installSideByIndex:['left','left'],installSides:{optic:'left',image:'left'},owned:['arm'],netLoaded:['sword'],conditions:{...raw.conditions,image:true}};
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
    await control.focus();
    await viewer.keyboard.press('ArrowLeft');
    await viewer.waitForFunction(()=>document.getElementById('spinView')?.getAttribute('aria-valuenow')==='47');
    assert.equal(await control.getAttribute('aria-valuenow'),'47');
    await viewer.keyboard.press('ArrowRight');
    await viewer.waitForFunction(()=>document.getElementById('spinView')?.getAttribute('aria-valuenow')==='0');
    assert.equal(await control.getAttribute('aria-valuenow'),'0');
    assert.match(await viewer.locator('#spinIndex').innerText(),/FRAME 1\/48/);
    await control.scrollIntoViewIfNeeded();
    const rect=await control.boundingBox();
    const hit=await viewer.evaluate(({x,y})=>document.elementFromPoint(x,y)?.id||document.elementFromPoint(x,y)?.className,{x:rect.x+40,y:rect.y+rect.height/2});
    await viewer.evaluate(()=>{window.__spinPointerEvents=[];const el=document.getElementById('spinView');el.addEventListener('pointerdown',()=>window.__spinPointerEvents.push('down'));el.addEventListener('pointermove',()=>window.__spinPointerEvents.push('move'));el.addEventListener('pointerup',()=>window.__spinPointerEvents.push('up'))});
    console.log('drag geometry:',JSON.stringify({rect,hit}));
    await viewer.mouse.move(rect.x+40,rect.y+rect.height/2);await viewer.mouse.down();
    await viewer.mouse.move(rect.x+130,rect.y+rect.height/2,{steps:4});await viewer.mouse.up();
    console.log('48-frame drag result:',await control.getAttribute('aria-valuenow'),'events:',JSON.stringify(await viewer.evaluate(()=>window.__spinPointerEvents)));
    await viewer.waitForFunction(()=>document.getElementById('spinView')?.getAttribute('aria-valuenow')==='10');
    assert.equal(await control.getAttribute('aria-valuenow'),'10');
    await viewer.locator('#toggleLayers').click();
    assert.equal(await viewer.locator('#toggleLayers').getAttribute('aria-pressed'),'true');
    assert.equal(await viewer.locator('#toggleSpin').getAttribute('aria-pressed'),'false');
    assert.equal(await viewer.locator('#toggle3d').getAttribute('aria-pressed'),'false');
    await viewer.locator('#toggleSpin').click();
    assert.equal(await viewer.locator('#toggleSpin').getAttribute('aria-pressed'),'true');
    assert.equal(await viewer.locator('#toggleLayers').getAttribute('aria-pressed'),'false');
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
  await check('Avatar quick views and implant visibility do not alter saved implants',async()=>{
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push('avatar quick views: '+e.message));
   try{
    await page.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    await page.locator('[data-key="cyberarm"][data-value="left"]').click();
    await page.locator('[data-view="24"]').click();
    assert.equal(await page.locator('#viewer').getAttribute('aria-valuenow'),'24');
    assert.match(await page.locator('#frame').innerText(),/REAR · 180° · FRAME 25 \/ 48/);
    assert.equal(await page.locator('#viewer').getAttribute('aria-valuetext'),'180 degrees');
    await page.locator('#showImplants').click();
    assert.equal(await page.locator('#showImplants').getAttribute('aria-pressed'),'false');
    await page.locator('#save').click();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-avatar-v1')));
    assert.equal(saved.cyberarm,'left');
    await page.locator('#showImplants').click();
    assert.equal(await page.locator('#showImplants').getAttribute('aria-pressed'),'true');
   }finally{await page.close()}
  });
  await check('Cyberarm anatomical side reverses screen position at rear view',async()=>{
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push('cyberarm side: '+e.message));
   try{
    await page.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    await page.locator('[data-key="cyberarm"][data-value="left"]').click();
    if(await page.locator('#showImplants').getAttribute('aria-pressed')==='false')await page.locator('#showImplants').click();
    const svg=async()=>page.locator('#body svg').evaluate(el=>el.outerHTML);
    await page.locator('[data-view="0"]').click();
    assert.equal(await page.locator('#viewer').getAttribute('aria-valuenow'),'0');
    const front=await svg();
    await page.locator('#angle').evaluate(el=>{el.value='24';el.dispatchEvent(new Event('input',{bubbles:true}))});
    const rear=await svg();
    assert.ok(front.includes('#ff526d')&&rear.includes('#ff526d'));
    assert.notEqual(front,rear);
    await page.locator('[data-key="cyberarm"][data-value="right"]').click();
    assert.equal(await page.locator('[data-key="cyberarm"][data-value="right"]').getAttribute('aria-pressed'),'true');
    const rearRight=await svg();
    assert.notEqual(rear,rearRight,'left and right cyberarms should render differently at rear');
   }finally{await page.close()}
  });
  await check('Avatar side profiles differ from front and rear',async()=>{
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push('avatar side profiles: '+e.message));
   try{
    await page.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    const views=[];
    for(const frame of [0,12,24,36]){
     await page.locator('#angle').evaluate((el,n)=>{el.value=String(n);el.dispatchEvent(new Event('input',{bubbles:true}))},frame);
     views.push(await page.locator('#body svg').evaluate(el=>el.outerHTML));
    }
    assert.equal(new Set(views).size,4,'front, both sides, and rear should differ');
   }finally{await page.close()}
  });
  await check('Avatar hairstyles have distinct front and rear silhouettes',async()=>{
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push('avatar hair: '+e.message));
   try{
    await page.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    const front=new Set(),rear=new Set();
    for(const hair of ['none','short','swept','mohawk']){
     await page.locator('[data-key="hair"][data-value="'+hair+'"]').click();
     front.add(await page.locator('#portrait svg').evaluate(el=>el.outerHTML));
     await page.locator('#angle').evaluate(el=>{el.value='24';el.dispatchEvent(new Event('input',{bubbles:true}))});
     rear.add(await page.locator('#body svg').evaluate(el=>el.outerHTML));
     await page.locator('#angle').evaluate(el=>{el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}))});
    }
    assert.equal(front.size,4);assert.equal(rear.size,4);
   }finally{await page.close()}
  });
  await check('Avatar face presets render distinct jaw geometry',async()=>{
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push('avatar face: '+e.message));
   try{
    await page.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    const shapes=new Set();
    for(const face of ['standard','angular','round']){
     await page.locator('[data-key="face"][data-value="'+face+'"]').click();
     shapes.add(await page.locator('#portrait svg').evaluate(el=>el.outerHTML));
    }
    assert.equal(shapes.size,3);
   }finally{await page.close()}
  });
  await check('Avatar studio builds, rotates, poses and saves one shared identity',async()=>{
   const avatarContext=await browser.newContext();
   const page=await avatarContext.newPage();
   page.on('pageerror',e=>errors.push('avatar studio: '+e.message));
   try{
    await page.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    await page.locator('[data-key="build"][data-value="female-athletic"]').click();
    await page.locator('[data-key="pose"][data-value="confident"]').click();
    await page.locator('[data-key="cyberarm"][data-value="left"]').click();
    await page.locator('[data-key="eyes"][data-value="right"]').click();
    await page.locator('[data-view="0"]').click();
    await page.locator('#right').click();
    assert.equal(await page.locator('#viewer').getAttribute('aria-valuenow'),'1');
    assert.equal(await page.locator('#portrait svg').count(),1);
    assert.equal(await page.locator('#body svg').count(),1);
    await page.evaluate(()=>localStorage.setItem('cyberpunk-red-character-v1',JSON.stringify({installInstances:[{itemId:'arm',side:'right'},{itemId:'optic',side:'both'}]})));
    await page.locator('#syncCyberware').click();
    assert.equal(await page.locator('[data-key="cyberarm"][data-value="right"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-key="eyes"][data-value="both"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#body svg').count(),1);
    assert.equal(await page.locator('#portrait svg').count(),1);
    await page.locator('#save').click();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-avatar-v1')));
    assert.equal(saved.build,'female-athletic');assert.equal(saved.pose,'confident');assert.equal(saved.cyberarm,'right');assert.equal(saved.eyes,'both');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('[data-key="cyberarm"][data-value="right"]').getAttribute('aria-pressed'),'true');
    await page.evaluate(()=>localStorage.setItem('cyberpunk-red-character-v1',JSON.stringify({installInstances:[{itemId:'arm',side:'left'}]})));
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('[data-key="cyberarm"][data-value="left"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('[data-key="eyes"][data-value="none"]').getAttribute('aria-pressed'),'true');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('[data-key="pose"][data-value="confident"]').getAttribute('aria-pressed'),'true');
   }finally{await avatarContext.close()}
  });
  await check('Cyberware Manager shares all six Avatar Studio body builds',async()=>{
   const buildContext=await browser.newContext();
   const page=await buildContext.newPage();
   page.on('pageerror',e=>errors.push('shared body build: '+e.message));
   try{
    await page.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    await page.evaluate(()=>localStorage.setItem('cyberpunk-red-avatar-v1',JSON.stringify({pose:'invalid-pose',hair:'invalid-hair',face:'invalid-face',outfit:'invalid-outfit',skin:'#000000',hairColor:'#000000'})));
    await page.reload({waitUntil:'domcontentloaded'});
    const legacy=await page.evaluate(()=>savedAvatarForSpin());
    assert.equal(legacy.build,'male-average');assert.equal(legacy.pose,'neutral');assert.equal(legacy.hair,'short');assert.equal(legacy.face,'standard');assert.equal(legacy.outfit,'street');assert.equal(legacy.skin,'#a9765d');
    await page.evaluate(()=>localStorage.setItem('cyberpunk-red-avatar-v1',JSON.stringify({build:'female-athletic',pose:'neutral',hair:'short',face:'standard',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'none',cyberleg:'none',eyes:false,frame:0})));
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.evaluate(()=>savedAvatarForSpin()?.build),'female-athletic');
    await page.selectOption('#bodyPreset','male-slim');
    assert.equal(await page.evaluate(()=>savedAvatarForSpin()?.build),'male-slim');
    await page.selectOption('#bodyPreset','avatar');
    assert.equal(await page.evaluate(()=>savedAvatarForSpin()?.build),'female-athletic');
   }finally{await buildContext.close()}
  });
  await check('Avatar Studio updates the Cyberware Manager rotation across tabs',async()=>{
   const sharedContext=await browser.newContext();
   const cyberTab=await sharedContext.newPage(),studioTab=await sharedContext.newPage();
   try{
    await cyberTab.goto('http://127.0.0.1:8765/character-cyberware.html',{waitUntil:'domcontentloaded'});
    await cyberTab.evaluate(()=>localStorage.setItem('cyberpunk-red-avatar-v1',JSON.stringify({build:'female-athletic',pose:'neutral',hair:'short',face:'standard',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'none',cyberleg:'none',eyes:false,frame:0})));
    await cyberTab.reload({waitUntil:'domcontentloaded'});
    const before=await cyberTab.locator('#spinBase').getAttribute('src');
    await studioTab.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    await studioTab.evaluate(()=>localStorage.setItem('cyberpunk-red-avatar-v1',JSON.stringify({build:'female-slim',pose:'confident',hair:'swept',face:'angular',outfit:'combat',skin:'#c99170',hairColor:'#684736',cyberarm:'none',cyberleg:'none',eyes:false,frame:0})));
    await cyberTab.waitForFunction(previous=>document.querySelector('#spinBase')?.getAttribute('src')!==previous,before,{timeout:5000});
    assert.equal(await cyberTab.evaluate(()=>savedAvatarForSpin()?.build),'female-slim');
   }finally{await sharedContext.close()}
  });
  await check('Avatar cyberoptic overlays match the installed eye side',async()=>{
   const page=await context.newPage();
   try{
    await page.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'domcontentloaded'});
    const result=await page.evaluate(()=>{
     const base={build:'male-average',pose:'neutral',hair:'short',face:'standard',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'none',cyberleg:'none',frame:0};
     const sides=eyes=>{const svg=REDAvatarRenderer.render({...base,eyes},false),doc=new DOMParser().parseFromString(svg,'image/svg+xml');return [...doc.querySelectorAll('[data-optic-side]')].map(n=>n.getAttribute('data-optic-side')).sort()};
     return {left:sides('left'),right:sides('right'),both:sides('both'),none:sides(false)};
    });
    assert.deepEqual(result,{left:['left'],right:['right'],both:['left','right'],none:[]});
   }finally{await page.close()}
  });
  await check('Catalog artwork preserves implant hiding, dragging, and invalid-selection fallback',async()=>{
   const tab=await context.newPage();
   tab.on('pageerror',e=>errors.push('catalog tab: '+e.message));
   try{
    await tab.route('**/assets/avatar-art/test-frame.svg',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="400"><rect width="200" height="400" fill="teal"/></svg>'}));
    await tab.goto('http://127.0.0.1:8765/avatar-creator.html',{waitUntil:'networkidle'});
    await tab.evaluate(()=>{
     avatar={...defaults,cyberarm:'left'};showImplants=true;
     catalogSelection=Object.fromEntries(REDAvatarImageIndex.KEYS.map(k=>[k,0]));
     imageCatalog={version:1,images:{[REDAvatarImageIndex.imageId(catalogSelection,0)]:{path:'assets/avatar-art/test-frame.svg',characterFingerprint:JSON.stringify({build:avatar.build,pose:avatar.pose,skin:avatar.skin,face:avatar.face,hair:avatar.hair,hairColor:avatar.hairColor,outfit:avatar.outfit,cyberarm:avatar.cyberarm,cyberleg:avatar.cyberleg,eyes:avatar.eyes})}}};
     render();persistAvatar();
    });
    assert.equal(await tab.locator('#body img').evaluate(img=>img.draggable),false);
    await tab.locator('#showImplants').click();
    assert.equal(await tab.locator('#body svg').count(),1);
    assert.equal(await tab.locator('#portrait svg').count(),1);
    assert.equal(await tab.evaluate(()=>JSON.parse(localStorage.getItem(KEY)).cyberarm),'left');
    await tab.locator('#showImplants').click();
    assert.equal(await tab.locator('#body img').count(),1);
    await tab.evaluate(()=>{catalogSelection={};render()});
    assert.equal(await tab.locator('#body svg').count(),1);
    await tab.setViewportSize({width:390,height:844});
    await tab.locator('#right').click();
    assert.equal(await tab.locator('#viewer').getAttribute('aria-valuenow'),'1');
    assert.equal(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }finally{await tab.close()}
  });
  await check('No uncaught errors in tested flows',async()=>assert.deepEqual(errors,[]));
  await context.close();
 }finally{if(browser)await browser.close();server.kill()}
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});
