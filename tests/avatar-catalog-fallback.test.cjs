const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const index=require('../assets/avatar-image-index.js');
const turnaround=require('../assets/avatar-turnaround.js');
const html=fs.readFileSync('avatar-creator.html','utf8');
const fn=html.slice(html.indexOf('function catalogFrame('),html.indexOf('function artComposition('));
function fixture(){
 const avatar={build:'male-athletic',pose:'neutral',skin:'#a9765d',face:'standard',hair:'short',hairColor:'#18222a',outfit:'street',cyberarm:'left',cyberleg:'none',eyes:false};
 const selection=Object.fromEntries(index.KEYS.map(k=>[k,0]));
 const path='assets/avatar-art/terry/front.webp';
 const entry={path,characterFingerprint:JSON.stringify(avatar)};
 const context={window:{REDAvatarImageIndex:index,REDAvatarTurnaround:turnaround},avatar:{...avatar,frame:0},catalogSelection:selection,imageCatalog:{images:{[index.imageId(selection,0)]:entry}},showImplants:true};
 vm.createContext(context);vm.runInContext(fn,context);
 return {context,entry,path,resolve:portrait=>vm.runInContext('catalogFrame('+!!portrait+')',context)};
}
test('catalog falls back when baked-in implants are hidden without altering saved appearance',()=>{
 const f=fixture();assert.equal(f.resolve(),f.path);
 f.context.showImplants=false;assert.equal(f.resolve(),null);assert.equal(f.resolve(true),null);
 assert.equal(f.context.avatar.cyberarm,'left');
 f.context.showImplants=true;assert.equal(f.resolve(),f.path);
});
test('invalid saved catalog selections fall back instead of breaking rendering',()=>{
 const f=fixture();for(const selection of [{},null,{template:-1},'broken']){f.context.catalogSelection=selection;assert.equal(f.resolve(),null);}
});
test('catalog portraits accept only local artwork paths',()=>{
 const f=fixture();for(const path of ['https://example.com/portrait.png','assets/avatar-art/../secret.png']){f.entry.portrait=path;assert.equal(f.resolve(true),f.path);}
 f.entry.portrait='assets/avatar-art/terry/portrait.webp';assert.equal(f.resolve(true),f.entry.portrait);
});
test('appearance mismatch keeps the customized procedural character',()=>{
 const f=fixture();f.context.avatar.hair='mohawk';assert.equal(f.resolve(),null);
});
