'use strict';
// Mixed-radix image addresses: injective within declared option ranges.
(function(root){
 const DIMENSIONS=Object.freeze({template:6,hair:10,outfit:8,cyberarm:4,cyberleg:4,gear:8,build:6});
 const KEYS=Object.keys(DIMENSIONS);
 const ANGLES=8;
 function encode(selection){let id=0;for(const key of KEYS){const v=selection?.[key];if(!Number.isInteger(v)||v<0||v>=DIMENSIONS[key])throw new RangeError('Invalid '+key);id=id*DIMENSIONS[key]+v;}return id;}
 function decode(address){if(!Number.isSafeInteger(address)||address<0||address>=totalConfigurations())throw new RangeError('Invalid address');const result={};for(let i=KEYS.length-1;i>=0;i--){const key=KEYS[i];result[key]=address%DIMENSIONS[key];address=Math.floor(address/DIMENSIONS[key]);}return result;}
 function totalConfigurations(){return KEYS.reduce((a,key)=>a*DIMENSIONS[key],1)}
 function imageId(selection,angle){if(!Number.isInteger(angle)||angle<0||angle>=ANGLES)throw new RangeError('Invalid angle');return String(encode(selection)).padStart(9,'0')+'_'+String(angle).padStart(2,'0')}
 function resolve(index,selection,angle){const id=imageId(selection,angle);const entry=index?.images?.[id];return entry&&typeof entry.path==='string'&&/^assets\/avatar-art\/[a-z0-9_./-]+\.(?:webp|png|svg)$/i.test(entry.path)&&!entry.path.includes('..')?entry.path:null}
 function availableAngles(index,selection){return Array.from({length:ANGLES},(_,angle)=>resolve(index,selection,angle))}
 const api=Object.freeze({DIMENSIONS,KEYS,ANGLES,encode,decode,totalConfigurations,imageId,resolve,availableAngles});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.REDAvatarImageIndex=api;
})(typeof window!=='undefined'?window:null);
