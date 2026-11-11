const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const studio=fs.readFileSync('avatar-creator.html','utf8');
function inlineScript(){const marker='<script src="./assets/avatar-turnaround.js"></script><script>';const start=studio.indexOf(marker);assert.ok(start>=0);const from=start+marker.length,end=studio.indexOf('</script>',from);assert.ok(end>from);return studio.slice(from,end)}
const script=inlineScript();
test('Avatar Studio inline JavaScript parses',()=>assert.doesNotThrow(()=>new vm.Script(script,{filename:'avatar-creator.js'})));
test('Avatar Studio automatically persists appearance and rotation changes',()=>{
 for(const text of ["persistAvatar('Appearance saved automatically')","persistAvatar('View saved automatically')","persistAvatar('Rotation saved automatically')","persistAvatar('Appearance reset and saved')","persistAvatar('Avatar imported and saved')"])assert.ok(script.includes(text),text);
});
test('Avatar Studio maps bilateral cyberware to the correct avatar sides',()=>{
 const start=script.indexOf('function installedInstances('),end=script.indexOf('function syncCyberware(){',start);assert.ok(start>=0&&end>start);
 const ctx={avatar:{cyberarm:'none',eyes:false},input:{installed:['arm','arm','leg','leg','optic'],installInstances:[{itemId:'arm',side:'left'},{itemId:'arm',side:'right'},{itemId:'leg',side:'left'},{itemId:'leg',side:'right'},{itemId:'optic',side:'left'}]}};
 vm.runInNewContext(script.slice(start,end)+';syncCyberwareFromCharacter(input);',ctx);
 assert.equal(ctx.avatar.cyberarm,'both');assert.equal(ctx.avatar.cyberleg,'both');assert.equal(ctx.avatar.eyes,'left');
});
test('Avatar Studio supports legacy side arrays and right-only optics',()=>{
 const start=script.indexOf('function installedInstances('),end=script.indexOf('function syncCyberware(){',start);
 const ctx={avatar:{cyberarm:'none',eyes:false},input:{installed:['arm','optic'],installSideByIndex:['right','right']}};
 vm.runInNewContext(script.slice(start,end)+';syncCyberwareFromCharacter(input);',ctx);
 assert.equal(ctx.avatar.cyberarm,'right');assert.equal(ctx.avatar.eyes,'right');
});
test('Avatar Studio keeps 48-frame rotation and six supported body builds',()=>{
 for(const value of ['Cyberlegs','max="47"','female-slim','female-average','female-athletic','male-slim','male-average','male-athletic','raw.frame>=0&&raw.frame<48'])assert.ok(studio.includes(value),value);
});

test('Cyberware Manager defaults to efficient 48-frame rotation and keeps 3D optional',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes('let spinEnabled=true'));
 assert.ok(cyber.includes('let cyber3dModule=null,cyber3dEnabled=false'));
 assert.ok(cyber.includes('id="toggleSpin" type="button" aria-pressed="true"'));
 assert.ok(cyber.includes('function activateSpinMode()'));
 assert.ok(cyber.includes("if(cyber3dEnabled){activateSpinMode()}else{cyber3dEnabled=true;spinEnabled=false;layerViewEnabled=false;syncViewerButtons()}"));
});

test('Cyberware Manager recovers to image rotation if optional 3D initialization fails',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes('function activateSpinFallback(host,message)'));
 assert.ok(cyber.includes("activateSpinFallback(host,'3D unavailable — 48-frame image viewer active')"));
 assert.ok(cyber.includes("activateSpinFallback(host,'3D renderer failed — 48-frame image viewer active')"));
});

test('Cyberware Manager refreshes the avatar preview after Avatar Studio saves in another tab',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes("if(e.key==='cyberpunk-red-avatar-v1'){if(spinEnabled)render()}"));
});

test('Cyberware anatomy markers compare stored left/right sides case-insensitively',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes('String(state.installSideByIndex[i]).toLowerCase()===side.toLowerCase()'));
 assert.ok(cyber.includes('String(x.side).toLowerCase()===side.toLowerCase()'));
});

test('Anatomical left/right scan markers carry their side into installation selection',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes('data-side="\'+side.toLowerCase()+\'"'));
 assert.ok(cyber.includes("selectedAnatomicalSide=t.dataset.side||null"));
});

test('Selected implant side remains highlighted consistently between scan and layer views',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes("String(selectedAnatomicalSide).toLowerCase()===side.toLowerCase()"));
 assert.ok(cyber.includes("String(selectedAnatomicalSide||'').toLowerCase()===String(side||'').toLowerCase()"));
});

test('3D anatomical picking preserves the selected implant side',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes('state.selected=hit.object.userData.loc;selectedAnatomicalSide=hit.object.userData.side||null;render()'));
});

test('Avatar Studio exposes explicit none, left, right, and bilateral cyberoptic choices',()=>{
 assert.ok(script.includes('Cyberoptic placement'));
 for(const side of ["'none'","'left'","'right'","'both'"])assert.ok(script.includes(side));
 assert.ok(script.includes("b.dataset.value==='none'?false:b.dataset.value"));
});

test('Legacy installs without side metadata remain visible bilaterally',()=>{
 const start=script.indexOf('function installedInstances('),end=script.indexOf('function syncCyberware(){',start);
 const ctx={avatar:{cyberarm:'none',cyberleg:'none',eyes:false},input:{installed:['arm','leg','optic']}};
 vm.runInNewContext(script.slice(start,end)+';syncCyberwareFromCharacter(input);',ctx);
 assert.equal(ctx.avatar.cyberarm,'both');assert.equal(ctx.avatar.cyberleg,'both');assert.equal(ctx.avatar.eyes,'both');
});

test('Cyberware Manager offers the six Avatar Studio body builds and uses the selected build',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 for(const value of ['value="avatar"','value="female-slim"','value="female-average"','value="female-athletic"','value="male-slim"','value="male-average"','value="male-athletic"'])assert.ok(cyber.includes(value),value);
 assert.ok(cyber.includes('build:selectedBuild'));
 assert.ok(cyber.includes('function avatarBuildWidth(build)'));
});

test('Cyberware viewer mode switches keep 3D, image, and layer controls mutually exclusive',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes('function syncViewerButtons()'));
 assert.ok(cyber.includes('function activateSpinMode(){spinEnabled=true;layerViewEnabled=false;cyber3dEnabled=false;syncViewerButtons()}'));
 assert.ok(cyber.includes("if(layerViewEnabled){spinEnabled=false;cyber3dEnabled=false}"));
 assert.ok(cyber.includes("if(spinEnabled){spinEnabled=false}else{activateSpinMode()}syncViewerButtons()"));
});

test('Shared avatar renderer leaves the unimplanted eye natural and overlays only selected cyberoptics',()=>{
 const renderer=fs.readFileSync('assets/avatar-renderer.js','utf8');
 assert.ok(renderer.includes("eye='#8fe2ec'"));
 assert.ok(renderer.includes("if(installed!=='both'&&installed!==opticSide)continue"));
 assert.ok(renderer.includes("data-optic-side=\"'+opticSide+'\""));
});

test('3D implant markers count and highlight left/right installations case-insensitively',()=>{
 const cyber=fs.readFileSync('character-cyberware.html','utf8');
 assert.ok(cyber.includes('String(inst.side).toLowerCase()===String(side).toLowerCase()'));
 assert.ok(cyber.includes('String(selectedAnatomicalSide).toLowerCase()===String(side).toLowerCase()'));
});

test('Shared model renderer includes layered facial and torso lighting',()=>{
 const renderer=fs.readFileSync('assets/avatar-renderer.js','utf8');
 assert.ok(renderer.includes('id="skinShade"'));
 assert.ok(renderer.includes('id="faceLight"'));
 assert.ok(renderer.includes("fill=\"url(#faceLight)\""));
 assert.ok(renderer.includes("'url(#skinShade)'"));
});

test('Avatar model geometry retains hand articulation, footwear and facial landmarks',()=>{
 const renderer=fs.readFileSync('assets/avatar-renderer.js','utf8');
 assert.ok(renderer.includes('finger<3'));
 assert.ok(renderer.includes('foot-14*depth'));
 assert.ok(renderer.includes("sx(124)+' 73Q130 77"));
});

test('Rear avatar view uses rear-head silhouette without facial lighting',()=>{
 const renderer=fs.readFileSync('assets/avatar-renderer.js','utf8');
 assert.ok(renderer.includes('if(back>.18)'));
 assert.ok(renderer.includes('if(front>0){s+='));
});

test('Turnaround artwork manifest requires all six builds and 48 frames per pose',()=>{
 const art=require('../assets/avatar-turnaround.js');
 assert.equal(art.BUILDS.length,6);
 assert.equal(art.ANGLES.length,48);
 const check=art.validate({version:1,frames:{}});
 assert.equal(check.valid,false);
 assert.equal(check.expectedFrames,1152);
});

test('Image-turnaround integration preserves cyberware fallback and shared portrait frame',()=>{
 const html=fs.readFileSync('avatar-creator.html','utf8');
 for(const snippet of ['avatar-turnaround.js','function renderFigure(',"renderFigure($('body'))","renderFigure($('portrait'),true)",'if(hasImplants)return null','target.innerHTML=figure(portrait)'])assert.ok(html.includes(snippet),snippet);
});
test('Turnaround angle navigation and artwork path validation',()=>{
 const art=require('../assets/avatar-turnaround.js');
 assert.equal(art.nextAngle(47,1),0);
 assert.equal(art.nextAngle(0,-1),47);
 assert.equal(art.safePath('assets/avatar-art/male-slim/neutral/00.webp'),'assets/avatar-art/male-slim/neutral/00.webp');
 assert.equal(art.safePath('https://example.com/portrait.png'),null);
 assert.equal(art.safePath('assets/avatar-art/../private.png'),null);
});
