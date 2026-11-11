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
