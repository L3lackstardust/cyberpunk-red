const {test}=require('node:test'),assert=require('node:assert/strict'),store=require('../assets/character-store.js');
test('backup validation rejects malformed records and negative inventory before writing',()=>{
 for(const data of [{stats:[]},{stats:{REF:'8'}},{owned:[{}]},{inventory:[{item:'Ammo',delta:-1}]},{inventory:[{item:'Ammo',delta:1.5}]},{rolls:[{total:null}]}])assert.throws(()=>store.validate(store.keys[0],data));
 assert.doesNotThrow(()=>store.validate(store.keys[0],{inventory:[{item:'Ammo',delta:2},{item:'Ammo',delta:-1}],rolls:[]}));
});
test('duplicate or mismatched implant instances are rejected',()=>{
 assert.throws(()=>store.validate(store.keys[1],{installed:['arm'],installInstances:[{id:'a',itemId:'leg',side:'left'}]}));
 assert.throws(()=>store.validate(store.keys[1],{installed:['arm','arm'],installInstances:[{id:'a',itemId:'arm'},{id:'a',itemId:'arm'}]}));
});
test('complete backup round trip preserves all three records and identity',()=>{
 const m=new Map();global.localStorage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
 store.save(store.keys[0],{stats:{REF:8},inventory:[{item:'Ammo',delta:12}],rolls:[]});store.save(store.keys[1],{owned:['arm'],installed:[]});store.save(store.keys[2],{hair:'short'});
 const b=store.bundle();store.save(store.keys[1],{owned:[],installed:[]});store.restore(b);
 assert.equal(store.identity(),b.characterId);assert.deepEqual(store.bundle().records,b.records);delete global.localStorage;
});
test('restore rejects incomplete bundles without changing storage',()=>{
 let writes=0;global.localStorage={setItem:()=>writes++};assert.throws(()=>store.restore({schema:1,kind:'cyberpunk-red-complete-backup',characterId:'test',records:{}}));assert.equal(writes,0);delete global.localStorage;
});
