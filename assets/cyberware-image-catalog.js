'use strict';
// Full-frame cyberware lookup: no layer synthesis or invented combinations.
(function(root){
 const SIDES=['none','left','right','both'];
 const ZONES=['arms','legs','optics','ears','spine','torso','skin'];
 const pathOK=s=>typeof s==='string'&&/^assets\/avatar-art\/[a-z0-9_./-]+\.(webp|png)$/i.test(s)&&!s.includes('..');
 function signature({characterId,appearanceId,cyberware=[],angle}){
  if(!Number.isInteger(characterId)||characterId<1||!Number.isInteger(angle)||angle<0||angle>7||typeof appearanceId!=='string')throw new RangeError('Invalid character appearance or angle');
  const items=cyberware.map(item=>{
   if(!ZONES.includes(item.zone)||!SIDES.includes(item.side)||!/^[a-z0-9-]+$/.test(item.style))throw new RangeError('Invalid cyberware');
   return [item.zone,item.style,item.side].join(':');
  }).sort();
  if(new Set(items).size!==items.length)throw new RangeError('Duplicate cyberware');
  return [characterId,appearanceId,items.join('|'),angle].join('/');
 }
 function resolve(catalog,configuration){const id=signature(configuration);const item=catalog?.frames?.[id];return item&&pathOK(item.image)?item.image:null;}
 function available(catalog,configuration){return Array.from({length:8},(_,angle)=>resolve(catalog,{...configuration,angle}));}
 const api=Object.freeze({SIDES,ZONES,signature,resolve,available});if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.REDCyberwareImageCatalog=api;
})(typeof window!=='undefined'?window:null);
