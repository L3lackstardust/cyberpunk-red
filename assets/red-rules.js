'use strict';
(function(root){
 const number=x=>Number.isFinite(Number(x))?Number(x):0;
 const hpMax=s=>10+5*Math.ceil((number(s.stats?.BODY)+number(s.stats?.WILL))/2);
 function wound(s){const hp=number(s.hp);return hp<=0?{name:'MORTALLY WOUNDED',penalty:-4}:hp<Math.ceil(hpMax(s)/2)?{name:'SERIOUSLY WOUNDED',penalty:-2}:{name:hp<hpMax(s)?'LIGHTLY WOUNDED':'STABLE',penalty:0}}
 function sources(s,action,stat){
  const result=[],initiative=action==='Initiative';
  const armor=Math.min(0,number(s.armorPenalty));if(['REF','DEX','MOVE'].includes(stat)&&armor)result.push({id:'armor',name:'Armor penalty ('+stat+')',value:armor});
  const w=wound(s);if(s.hp!==undefined&&!initiative&&w.penalty&&!(w.penalty===-2&&s.ignoreSeriousWound))result.push({id:'wound',name:w.name,value:w.penalty});
  if(!initiative){const seen=new Set();for(const injury of s.injuries||[]){if(!injury||injury.enabled===false||typeof injury.name!=='string'||seen.has(injury.id))continue;if(injury.action&&injury.action!=='all'&&injury.action!==action)continue;seen.add(injury.id);const value=number(injury.value);if(value)result.push({id:injury.id,name:injury.name,value})}}
  return result;
 }
 function check(first,second,base,dv=null){if(!Number.isInteger(first)||first<1||first>10)throw Error('Invalid d10');if((first===1||first===10)&&(!Number.isInteger(second)||second<1||second>10))throw Error('Missing critical die');const critical=first===10?second:first===1?-second:0,total=first+critical+number(base);return {first,second:first===1||first===10?second:null,critical,total,dv,success:dv===null?null:total>dv}}
 function randomDie(sides,cryptoSource=globalThis.crypto){const limit=Math.floor(4294967296/sides)*sides,a=new Uint32Array(1);do{cryptoSource.getRandomValues(a)}while(a[0]>=limit);return a[0]%sides+1}
 function damage(dice){if(!Array.isArray(dice)||!dice.length||dice.some(x=>!Number.isInteger(x)||x<1||x>6))throw Error('Invalid damage dice');const critical=dice.filter(x=>x===6).length>=2;return {dice,total:dice.reduce((a,b)=>a+b,0),critical,criticalBonus:critical?5:0}}
 const api={hpMax,wound,sources,check,randomDie,damage};if(root)root.REDRules=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?null:window);
