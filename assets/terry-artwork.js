'use strict';
(function(root){
 const ID='terry-clean-v2';
 const base=Object.freeze({build:'male-athletic',pose:'neutral',hair:'mohawk',face:'angular',outfit:'combat',skin:'#a9765d',hairColor:'#18222a'});
 const files=['00_front','01_front_right','02_right','03_rear_right','04_back','05_rear_left','06_left','07_front_left'];
 const labels=['Front','Front right','Right profile','Rear right','Back','Rear left','Left profile','Front left'];
 // Display alignment measured from the alpha silhouettes: shared center and boot baseline.
 const transforms=["translate(-0.0475%,1.1609%) scale(0.971831)","translate(0.0481%,-0.0204%) scale(0.985011)","translate(6.1619%,0.9800%) scale(1.017699)","translate(0.0495%,0.5502%) scale(1.013960)","translate(0.0000%,0.2627%) scale(0.995671)","translate(3.0651%,-0.0945%) scale(0.996390)","translate(-0.0506%,1.7600%) scale(1.036814)","translate(0.0000%,0.0972%) scale(1.000725)"];
 const path=i=>'assets/avatar-art/terry/clean-v2/'+files[i]+'.png';
 const normalize=frame=>((Math.round(Number(frame)||0)%48)+48)%48;
 const index=frame=>Math.round(normalize(frame)/6)%8;
 function sanitize(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  const choices={build:['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic'],pose:['neutral','confident','guarded','relaxed'],hair:['none','short','swept','mohawk'],face:['standard','angular','round'],outfit:['street','combat','corporate'],skin:['#e4b995','#c99170','#a9765d','#76513e','#513a31'],hairColor:['#18222a','#684736','#e3c08b','#d14a56','#8d79b4'],cyberarm:['none','left','right','both'],cyberleg:['none','left','right','both']};
  const clean={...base,cyberarm:'none',cyberleg:'none',eyes:false,frame:normalize(raw.frame)};
  for(const [key,values]of Object.entries(choices))if(values.includes(raw[key]))clean[key]=raw[key];
  if(raw.eyes===true||['left','right','both'].includes(raw.eyes))clean.eyes=raw.eyes;
  if([ID,'terry-modular-v1'].includes(raw.artwork))clean.artwork=raw.artwork;
  return clean;
 }
 function resolve(avatar,{showImplants=true}={}){
  if(avatar?.artwork!==ID)return {available:false,reason:''};
  if(Object.keys(base).some(key=>avatar[key]!==base[key]))return {available:false,reason:'Terry artwork is unavailable for these appearance choices. Showing your customized procedural character.'};
  if(showImplants&&((avatar.cyberarm&&avatar.cyberarm!=='none')||(avatar.cyberleg&&avatar.cyberleg!=='none')||avatar.eyes))return {available:false,reason:'Terry artwork for these implants is unavailable. The procedural preview shows their left/right placement.'};
  const i=index(avatar.frame);
  return {available:true,src:path(i),portrait:path(0),transform:transforms[i],index:i,angle:i*45,label:labels[i],reason:'Terry artwork · 8 views · original outfit'};
 }
 function preset(current={}){return {...current,...base,artwork:ID,frame:normalize(current.frame),cyberarm:current.cyberarm||'none',cyberleg:current.cyberleg||'none',eyes:current.eyes||false}}
 function next(avatar,delta){const step=avatar.artwork==='terry-modular-v1'||resolve(avatar).available?6:1;return normalize(avatar.frame+delta*step)}
 const api=Object.freeze({ID,base,files,labels,path,normalize,index,resolve,preset,next,sanitize});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.REDTerryArtwork=api;
})(typeof window!=='undefined'?window:null);
