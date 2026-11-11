const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('roll20/red-gm-bridge.js', 'utf8');
function harness() {
  const callbacks = {};
  const sent = [];
  const char = {id:'-C1',get:key=>({name:'Test <Runner>'})[key]};
  const attr = {get:key=>({name:'ref',current:'8',max:''})[key]};
  const token = {get:key=>({represents:'-C1'})[key]};
  const context = {
    on:(event,fn)=>{callbacks[event]=fn;},
    log:()=>{},
    playerIsGM:id=>id==='GM',
    sendChat:(who,message)=>sent.push({who,message}),
    findObjs:query=>query._type==='character'?[char]:query._type==='attribute'?[attr]:[],
    getObj:(type,id)=>type==='character'&&id==='-C1'?char:type==='graphic'&&id==='-T1'?token:null
  };
  vm.runInNewContext(source,context);
  callbacks.ready();
  return {send:(content,playerid='GM',selected)=>callbacks['chat:message']({type:'api',content,playerid,selected}),sent};
}
test('GM-only ping, character list and selected token inspection',()=>{
  const h=harness();
  h.send('!red-ping','PLAYER');
  assert.equal(h.sent.length,0);
  h.send('!red-ping');
  assert.match(h.sent[0].message,/v0.2 ONLINE/);
  h.send('!red-characters');
  assert.match(h.sent[1].message,/Test &lt;Runner&gt;/);
  h.send('!red-inspect','GM',[{_type:'graphic',_id:'-T1'}]);
  assert.match(h.sent[2].message,/ref<\/code>: 8/);
  assert.ok(h.sent.every(x=>x.message.startsWith('/w gm ')));
});
test('invalid selection or ID does not modify character state',()=>{
  const h=harness();
  h.send('!red-inspect');
  h.send('!red-inspect -missing');
  assert.equal(h.sent.length,2);
  assert.ok(h.sent.every(x=>x.message.includes('Character not found')));
});
