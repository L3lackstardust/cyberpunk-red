const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const terry=require('../assets/terry-artwork.js');const window={REDTerryArtwork:terry};
vm.runInNewContext(fs.readFileSync('assets/avatar-art/terry/modular-v1/atlas-metadata.js','utf8'),{window});vm.runInNewContext(fs.readFileSync('assets/modular-artwork.js','utf8'),{window});
test('all modular atlases have eight in-bounds transparent component frames',()=>{
 for(const [id,m]of Object.entries(window.REDModularAtlas)){assert.ok(fs.existsSync('assets/avatar-art/terry/modular-v1/'+id+'.png'));assert.equal(m.boxes.length,8);assert.ok(m.transparentFraction>.4);for(const [x,y,w,h]of m.boxes){assert.ok(w>0&&h>0&&x>=0&&y>=0&&x+w<=m.width&&y+h<=m.height)}}
});
test('every body, pose, outfit, face, hair and angle composes actual artwork',()=>{
 for(const build of Object.keys(window.REDModularArtwork.builds))for(const pose of Object.keys(window.REDModularArtwork.poses))for(const outfit of ['street','combat','corporate'])for(const face of ['standard','angular','round'])for(const hair of ['none','short','swept','mohawk'])for(let frame=0;frame<48;frame+=6){const svg=window.REDModularArtwork.render({...terry.base,build,pose,outfit,face,hair,frame});assert.ok(svg.includes('data-modular-view'));assert.ok(svg.includes('torso-'+outfit));assert.doesNotMatch(svg,/NaN|undefined/)}
});
test('every bilateral implant combination chooses each anatomical limb independently',()=>{
 for(const cyberarm of ['none','left','right','both'])for(const cyberleg of ['none','left','right','both'])for(const eyes of [false,'left','right','both'])for(let frame=0;frame<48;frame+=6){const svg=window.REDModularArtwork.render({...terry.base,cyberarm,cyberleg,eyes,frame});for(const [part,choice]of [['arm',cyberarm],['leg',cyberleg]])for(const side of ['left','right'])assert.ok(svg.includes('data-part="'+part+'-'+(choice===side||choice==='both'?'cyber':'natural')+'" data-side="'+side+'"'));assert.doesNotMatch(svg,/NaN|undefined/)}
});
test('modular artwork survives sanitization and rotates in eight views',()=>{const a=terry.sanitize({...terry.base,artwork:window.REDModularArtwork.ID,frame:42});assert.equal(a.artwork,'terry-modular-v1');assert.equal(terry.next(a,1),0)});
