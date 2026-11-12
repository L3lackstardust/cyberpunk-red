'use strict';
(function(root){
 const keys=['cyberpunk-red-console-v1','cyberpunk-red-character-v1','cyberpunk-red-avatar-v1'];
 const identityKey='cyberpunk-red-active-character-v1';
 const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
 function validate(key,data){
  if(!keys.includes(key)||!plain(data))throw Error('Invalid character record');
  for(const k of ['stats','skills','conditions','installSides'])if(data[k]!==undefined&&!plain(data[k]))throw Error('Invalid '+k);
  for(const k of ['stats','skills'])for(const v of Object.values(data[k]||{}))if(typeof v!=='number'||!Number.isFinite(v))throw Error('Invalid numeric '+k);
  for(const k of ['eb','cash','humanity','humanityMax','hp','rank','rep'])if(data[k]!==undefined&&(typeof data[k]!=='number'||!Number.isFinite(data[k])))throw Error('Invalid '+k);
  for(const k of ['installed','owned','netLoaded'])if(data[k]!==undefined&&(!Array.isArray(data[k])||data[k].some(x=>typeof x!=='string')))throw Error('Invalid '+k);
  for(const k of ['rolls','history','installInstances','inventory','injuries'])if(data[k]!==undefined&&!Array.isArray(data[k]))throw Error('Invalid '+k);
  for(const x of data.injuries||[])if(!plain(x)||typeof x.id!=='string'||typeof x.name!=='string'||!Number.isFinite(x.value)||typeof x.action!=='string')throw Error('Invalid injury');
  const balances=new Map();
  for(const row of data.inventory||[]){if(!plain(row)||typeof row.item!=='string'||!row.item.trim()||!Number.isInteger(row.delta))throw Error('Invalid inventory transaction');const n=(balances.get(row.item)||0)+row.delta;if(n<0)throw Error('Inventory ledger becomes negative');balances.set(row.item,n)}
  const ids=new Set();for(const inst of data.installInstances||[]){if(!plain(inst)||typeof inst.id!=='string'||!inst.id||ids.has(inst.id)||typeof inst.itemId!=='string'||![null,undefined,'left','right','both'].includes(inst.side))throw Error('Invalid implant instance');ids.add(inst.id)}
  if(data.installInstances?.length&&data.installed&&(data.installInstances.length!==data.installed.length||data.installInstances.some((v,i)=>v.itemId!==data.installed[i])))throw Error('Installed inventory and instances disagree');
  if(data.rolls?.some(x=>!plain(x)||!Number.isFinite(x.total)))throw Error('Invalid roll history');
  return data;
 }
 function identity(){let id=localStorage.getItem(identityKey);if(!id){id=crypto.randomUUID();localStorage.setItem(identityKey,id)}return id}
 function save(key,data){validate(key,data);data.characterId=identity();const previous=localStorage.getItem(key);if(previous){try{validate(key,JSON.parse(previous));localStorage.setItem(key+'-recovery',previous)}catch(e){if(e.name==='QuotaExceededError')throw e;localStorage.setItem(key+'-rejected',previous)}}
  localStorage.setItem(key,JSON.stringify(data));return true;
 }
 function bundle(){const records={};for(const key of keys){const value=localStorage.getItem(key);records[key]=value?validate(key,JSON.parse(value)):null}return {schema:1,kind:'cyberpunk-red-complete-backup',characterId:identity(),createdAt:new Date().toISOString(),records}}
 function validateBundle(b){if(!plain(b)||b.schema!==1||b.kind!=='cyberpunk-red-complete-backup'||!plain(b.records)||typeof b.characterId!=='string'||!b.characterId)throw Error('Not a complete character backup');for(const key of keys){if(!(key in b.records))throw Error('Backup is missing '+key);if(b.records[key]!==null)validate(key,b.records[key])}return b}
 function restore(b){validateBundle(b);const snapshot=keys.map(k=>[k,localStorage.getItem(k)]),oldId=localStorage.getItem(identityKey);
  try{let previous;try{previous=bundle()}catch{localStorage.setItem('cyberpunk-red-corrupt-records-v1',JSON.stringify(snapshot))}if(previous)localStorage.setItem('cyberpunk-red-before-restore-v1',JSON.stringify(previous));for(const key of keys){if(b.records[key]===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify({...b.records[key],characterId:b.characterId}))}localStorage.setItem(identityKey,b.characterId)}catch(e){for(const [key,value]of snapshot){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}if(oldId===null)localStorage.removeItem(identityKey);else localStorage.setItem(identityKey,oldId);throw e}
 }
 const api={keys,validate,identity,save,bundle,validateBundle,restore};
 if(typeof module!=='undefined')module.exports=api;if(root)root.REDCharacterStore=api;
})(typeof window==='undefined'?null:window);
