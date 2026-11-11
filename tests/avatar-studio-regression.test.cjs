const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const studio=fs.readFileSync('avatar-creator.html','utf8');
function inlineScript(){const marker='<script src="./assets/avatar-renderer.js"></script><script>';const start=studio.indexOf(marker);assert.ok(start>=0);const from=start+marker.length,end=studio.indexOf('</script>',from);assert.ok(end>from);return studio.slice(from,end)}
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
 assert.ok(cyber.includes("if(cyber3dEnabled){spinEnabled=false;layerViewEnabled=false}else{spinEnabled=true}"));
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
