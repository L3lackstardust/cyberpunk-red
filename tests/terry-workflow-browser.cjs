const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),{spawn}=require('node:child_process');
(async()=>{
 const server=spawn(process.execPath,['scripts/serve.cjs'],{env:{...process.env,PORT:'8767'},stdio:'ignore'});
 let browser;
 const results=[];const check=async(name,fn)=>{await fn();results.push(name);console.log('PASS',name)};
 try{
 await new Promise((resolve,reject)=>{server.once('error',reject);setTimeout(resolve,700)});
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 // External reference portraits and optional 3D packages are outside this local workflow.
 await context.route(/^https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
 const errors=[];context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 const studio=await context.newPage(),url='http://127.0.0.1:8767/';
 await studio.goto(url+'avatar-creator.html');
 await studio.evaluate(()=>{localStorage.clear();localStorage.setItem('cyberpunk-red-console-v1',JSON.stringify({handle:'Terry',eb:5000,humanity:60,humanityMax:60,stats:{REF:8,BODY:7,WILL:6,EMP:6},skills:{Handgun:6},inventory:[{item:'Ammo',delta:12}],rolls:[]}))});
 await studio.reload();
 await check('Terry selection, all eight images, keyboard rotation and reload',async()=>{
  await studio.locator('#useTerry').click();const paths=new Set();
  for(let i=0;i<8;i++){
   await studio.locator('#body img').evaluate(img=>img.decode());
   paths.add(await studio.locator('#body img').getAttribute('src'));
   assert.match(await studio.locator('#frame').innerText(),new RegExp('VIEW '+(i+1)+' / 8'));
   await studio.locator('#viewer').focus();await studio.keyboard.press('ArrowRight');
  }
  assert.equal(paths.size,8);assert.equal(await studio.locator('#viewer').getAttribute('aria-valuenow'),'0');
  await studio.locator('#right').click();await studio.reload();
  assert.equal(await studio.locator('#viewer').getAttribute('aria-valuenow'),'6');
  assert.match(await studio.locator('#body img').getAttribute('src'),/01_front_right/);
 });
 await check('Appearance customization keeps data and clearly falls back',async()=>{
  await studio.locator('[data-key="hair"][data-value="swept"]').click();
  assert.equal(await studio.locator('#body svg').count(),1);
  assert.match(await studio.locator('#artStatus').innerText(),/unavailable/);
  await studio.reload();assert.equal(await studio.locator('[data-key="hair"][data-value="swept"]').getAttribute('aria-pressed'),'true');
  await studio.locator('#useTerry').click();
 });
 await check('Avatar backup restores Terry profile and viewpoint',async()=>{
  const pending=studio.waitForEvent('download');await studio.locator('#export').click();const download=await pending;
  const backup=fs.readFileSync(await download.path());const data=JSON.parse(backup);
  assert.equal(data.avatar.artwork,'terry-clean-v2');
  await studio.locator('#reset').click();
  await studio.locator('#import').setInputFiles({name:'avatar.json',mimeType:'application/json',buffer:backup});
  await studio.waitForFunction(()=>document.getElementById('body').querySelector('img'));
  assert.equal(await studio.locator('#viewer').getAttribute('aria-valuenow'),String(data.avatar.frame));
 });
 const sheet=await context.newPage();
 await check('Linked sheet portrait preserves character stats, skills and inventory',async()=>{
  await studio.locator('#useOnSheet').click();await sheet.goto(url+'index.html');
  assert.match(await sheet.locator('#portrait img').getAttribute('src'),/00_front.png/);
  const data=await sheet.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-console-v1')));
  assert.equal(data.stats.REF,8);assert.equal(data.skills.Handgun,6);assert.equal(data.inventory[0].delta,12);assert.equal(data.eb,5000);
 });
 const manager=await context.newPage();
 manager.on('dialog',async d=>d.accept(d.type()==='prompt'?'0':undefined));
 await check('Manager uses same artwork and advances eight views',async()=>{
  await manager.goto(url+'character-cyberware.html');
  await manager.locator('#spinBase').evaluate(img=>img.decode());
  assert.match(await manager.locator('#spinBase').getAttribute('src'),/clean-v2/);
  await manager.locator('#spinNext').click();
  assert.match(await manager.locator('#spinIndex').innerText(),/VIEW 2\/8/);
 });
 await check('Real left-arm purchase/install switches all linked previews to correct-side fallback',async()=>{
  await manager.locator('button.slot[data-loc="Arms"][data-side="left"]').first().click();
  await manager.locator('[data-buy="arm"]').click();
  await manager.locator('#owned [data-install]').first().click();
  await manager.waitForFunction(()=>state.installInstances.some(x=>x.itemId==='arm'&&x.side.toLowerCase()==='left'));
  assert.match(await manager.locator('#spinBase').getAttribute('src'),/^data:image\/svg/);
  assert.match(await manager.locator('#spinMessage').innerText(),/implants.*unavailable/);
  await studio.waitForFunction(()=>document.querySelector('#body [data-cyberarm-side="left"]'));
  assert.equal(await studio.locator('#body [data-cyberarm-side="right"]').count(),0);
  await sheet.waitForFunction(()=>document.querySelector('#portrait svg'));
  await studio.locator('#useTerry').click();
  assert.equal(await studio.evaluate(()=>avatar.cyberarm),'left','Preset must not erase an installed arm');
 });
 await check('Uninstall restores artwork across tabs without erasing other data',async()=>{
  await manager.locator('[data-remove]').first().click();
  await studio.waitForFunction(()=>document.querySelector('#body img'));
  await sheet.waitForFunction(()=>document.querySelector('#portrait img'));
  assert.match(await manager.locator('#spinBase').getAttribute('src'),/clean-v2/);
  assert.equal(await sheet.evaluate(()=>JSON.parse(localStorage.getItem('cyberpunk-red-console-v1')).inventory[0].delta),12);
 });
 await check('Character backup includes and restores the linked avatar profile',async()=>{
  const pending=sheet.waitForEvent('download');await sheet.locator('#export').click();const download=await pending;
  const backup=fs.readFileSync(await download.path());assert.equal(JSON.parse(backup).studioAvatar.artwork,'terry-clean-v2');
  await studio.locator('#reset').click();
  await sheet.locator('#importfile').setInputFiles({name:'character.json',mimeType:'application/json',buffer:backup});
  await sheet.waitForFunction(()=>document.querySelector('#portrait img')?.getAttribute('src')?.includes('clean-v2'));
  await studio.reload();assert.match(await studio.locator('#body img').getAttribute('src'),/clean-v2/);
 });
 await check('Missing frame falls back without breaking rotation',async()=>{
  const missing=await browser.newContext();
  try{
   await missing.route('**/clean-v2/02_right.png',route=>route.abort());
   const profile=await studio.evaluate(()=>({...avatar,frame:12}));
   await missing.addInitScript(a=>localStorage.setItem('cyberpunk-red-avatar-v1',JSON.stringify(a)),profile);
   const broken=await missing.newPage();broken.on('pageerror',e=>errors.push(e.message));
   await broken.goto(url+'avatar-creator.html');
   await broken.waitForFunction(()=>document.querySelector('#body svg'));
   assert.match(await broken.locator('#artStatus').innerText(),/missing/);
   await broken.locator('#right').click();
   await broken.locator('#body img').evaluate(img=>img.decode());
  }finally{await missing.close()}
 });
 await check('Desktop and mobile layouts, real-image drag, and screenshots',async()=>{
  fs.mkdirSync('docs/evidence',{recursive:true});
  await studio.locator('[data-view="0"]').click();
  await studio.locator('#body img').evaluate(img=>img.decode());
  await studio.screenshot({path:'docs/evidence/terry-studio-desktop.png',fullPage:true});
  await manager.screenshot({path:'docs/evidence/terry-manager-desktop.png',fullPage:true});
  for(const p of [studio,manager,sheet]){await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Page must fit mobile width')}
  const viewer=studio.locator('#viewer');await viewer.scrollIntoViewIfNeeded();const box=await viewer.boundingBox();
  await studio.mouse.move(box.x+70,box.y+150);await studio.mouse.down();await studio.mouse.move(box.x+178,box.y+150,{steps:6});await studio.mouse.up();
  assert.equal(await viewer.getAttribute('aria-valuenow'),'12');
  await studio.screenshot({path:'docs/evidence/terry-studio-mobile.png',fullPage:true});
  await manager.screenshot({path:'docs/evidence/terry-manager-mobile.png',fullPage:true});
 });
 assert.deepEqual(errors,[]);
 fs.writeFileSync('docs/evidence/terry-workflow-results.json',JSON.stringify({passed:results,uncaughtErrors:errors},null,2));
 console.log('PASS all '+results.length+' Terry acceptance scenarios');await context.close();
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
