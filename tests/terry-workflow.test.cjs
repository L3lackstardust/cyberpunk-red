const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const art=require('../assets/terry-artwork.js');
test('cleaned artwork passes the production gate and matches its hashes',()=>{
 const crypto=require('node:crypto'),gate=require('../assets/avatar-production-gate.js'),root='assets/avatar-art/terry/clean-v2/';
 const manifest=JSON.parse(fs.readFileSync(root+'manifest.json'));
 assert.deepEqual(gate.validate(manifest,name=>fs.existsSync(root+name)),{ok:true,errors:[]});
 for(const frame of manifest.frames){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(root+frame.image)).digest('hex'),frame.sha256);assert.equal(frame.alphaRange[0],0)}
});
test('stored portrait data is limited to supported appearance values',()=>{
 const a=art.sanitize({skin:'" onload="alert(1)',face:'bad',frame:-1,artwork:'https://example.com/p.png'});
 assert.equal(a.skin,art.base.skin);assert.equal(a.face,art.base.face);assert.equal(a.frame,47);assert.equal(a.artwork,undefined);
 assert.equal(art.sanitize(null),null);assert.equal(art.sanitize([]),null);
});
test('Terry has eight real PNG frames with stable wrapping and portrait source',()=>{
 const a=art.preset({frame:0});
 const paths=new Set();
 for(let i=0;i<8;i++){const view=art.resolve({...a,frame:i*6});assert.equal(view.index,i);assert.equal(view.angle,i*45);assert.ok(fs.existsSync(view.src));paths.add(view.src);assert.equal(view.portrait,art.path(0))}
 assert.equal(paths.size,8);assert.equal(art.next({...a,frame:42},1),0);assert.equal(art.next(a,-1),42);
 assert.equal(art.resolve({...a,frame:47}).index,0);
});
test('appearance changes and each implant side use explicit procedural fallback',()=>{
 const a=art.preset();
 for(const key of Object.keys(art.base)){assert.equal(art.resolve({...a,[key]:'different'}).available,false)}
 for(const key of ['cyberarm','cyberleg','eyes'])for(const side of ['left','right','both']){
  const changed={...a,[key]:side};assert.equal(art.resolve(changed).available,false);assert.match(art.resolve(changed).reason,/implants/);
  assert.equal(art.resolve(changed,{showImplants:false}).available,true);
 }
});
test('Terry preset preserves implants and frame while procedural mode remains independent',()=>{
 const initial={cyberarm:'right',cyberleg:'left',eyes:'both',frame:18};
 const result=art.preset(initial);
 for(const key of Object.keys(initial))assert.equal(result[key],initial[key]);
 assert.equal(art.next(result,1),19);
 assert.equal(art.resolve({...result,artwork:undefined}).available,false);
 assert.equal(initial.artwork,undefined);
});
