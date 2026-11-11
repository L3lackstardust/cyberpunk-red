const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const studio=fs.readFileSync('avatar-creator.html','utf8');
function inlineScripts(html){return [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/gi)].map(m=>m[1]).filter(Boolean)}
test('Avatar Studio inline JavaScript parses',()=>{for(const source of inlineScripts(studio))assert.doesNotThrow(()=>new vm.Script(source,{filename:'avatar-creator.js'}))});
test('Avatar Studio automatically persists appearance and rotation changes',()=>{
 assert.match(studio,/persistAvatar\\('Appearance saved automatically'\\)/);
 assert.match(studio,/persistAvatar\\('View saved automatically'\\)/);
 assert.match(studio,/persistAvatar\\('Rotation saved automatically'\\)/);
 assert.match(studio,/persistAvatar\\('Appearance reset and saved'\\)/);
 assert.match(studio,/persistAvatar\\('Avatar imported and saved'\\)/);
});
test('Avatar Studio maps bilateral cyberware to the correct avatar sides',()=>{
 const start=studio.indexOf('function installedInstances('),end=studio.indexOf('function syncCyberware(){',start);
 assert.ok(start>=0&&end>start);
 const source=studio.slice(start,end);
 const ctx={avatar:{cyberarm:'none',eyes:false}};
 vm.runInNewContext(source+';syncCyberwareFromCharacter(input);',Object.assign(ctx,{input:{installed:['arm','arm','optic'],installInstances:[{itemId:'arm',side:'left'},{itemId:'arm',side:'right'},{itemId:'optic',side:'left'}]}}));
 assert.equal(ctx.avatar.cyberarm,'both');assert.equal(ctx.avatar.eyes,'left');
});
test('Avatar Studio supports legacy side arrays and right-only optics',()=>{
 const start=studio.indexOf('function installedInstances('),end=studio.indexOf('function syncCyberware(){',start);
 const source=studio.slice(start,end),ctx={avatar:{cyberarm:'none',eyes:false},input:{installed:['arm','optic'],installSideByIndex:['right','right']}};
 vm.runInNewContext(source+';syncCyberwareFromCharacter(input);',ctx);
 assert.equal(ctx.avatar.cyberarm,'right');assert.equal(ctx.avatar.eyes,'right');
});
test('Avatar Studio keeps 48-frame rotation and sanitized six-build choices',()=>{
 assert.match(studio,/max=\\"47\\"/);
 assert.match(studio,/female-slim.*female-average.*female-athletic.*male-slim.*male-average.*male-athletic/);
 assert.match(studio,/raw\\.frame>=0&&raw\\.frame<48/);
});
