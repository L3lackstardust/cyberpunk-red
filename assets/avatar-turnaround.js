'use strict';
// Production image-turnaround contract. Missing art is intentionally NOT marked complete.
(function(root){
 const BUILDS=['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic'];
 const POSES=['neutral','confident','guarded','relaxed'];
 const ANGLES=Array.from({length:48},(_,i)=>i);
 const requiredLayers=['anatomy','cyberware','face','hair','clothing'];
 const normalizeAngle=angle=>((Math.trunc(Number(angle)||0)%48)+48)%48;
 const nextAngle=(angle,direction)=>normalizeAngle(normalizeAngle(angle)+(direction<0?-1:1));
 const key=(build,pose,angle)=>build+'/'+pose+'/'+String(angle).padStart(2,'0');
 function validate(manifest){
  const errors=[];
  if(!manifest||manifest.version!==1||!manifest.frames)return {valid:false,errors:['Missing versioned artwork manifest']};
  for(const build of BUILDS)for(const pose of POSES)for(const angle of ANGLES){
   const entry=manifest.frames[key(build,pose,angle)];
   if(!entry){errors.push('Missing frame '+key(build,pose,angle));continue}
   if(!safePath(entry.base))errors.push('Invalid anatomy base '+key(build,pose,angle));
   if(entry.portrait&&!safePath(entry.portrait))errors.push('Invalid portrait '+key(build,pose,angle));
   if(entry.layers&&typeof entry.layers==='object')for(const [name,path] of Object.entries(entry.layers))if(!requiredLayers.includes(name)||!safePath(path))errors.push('Invalid artwork layer '+name+' '+key(build,pose,angle));
   if(entry.layers&&typeof entry.layers!=='object')errors.push('Invalid layers '+key(build,pose,angle));
  }
  return {valid:errors.length===0,errors,expectedFrames:BUILDS.length*POSES.length*ANGLES.length};
 }
 function frame(manifest,build,pose,angle){
  if(!BUILDS.includes(build)||!POSES.includes(pose)||!Number.isInteger(angle)||angle<0||angle>=48)return null;
  return manifest?.frames?.[key(build,pose,angle)]||null;
 }

 // Artwork paths are repository-relative and cannot reference remote hosts or traversal.
 const safePath=value=>typeof value==='string'&&/^assets\/avatar-art\/[a-z0-9_./-]+\.(?:webp|png|svg)$/i.test(value)&&!value.includes('..')?value:null;
 const resolveBase=(manifest,build,pose,angle)=>safePath(frame(manifest,build,pose,normalizeAngle(angle))?.base);
 const resolvePortrait=(manifest,build,pose,angle)=>{
  const item=frame(manifest,build,pose,normalizeAngle(angle));
  return safePath(item?.portrait)||safePath(item?.base);
 };
 const api=Object.freeze({BUILDS,POSES,ANGLES,requiredLayers,key,validate,frame,normalizeAngle,nextAngle,safePath,resolveBase,resolvePortrait});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.REDAvatarTurnaround=api;
})(typeof window!=='undefined'?window:null);
