'use strict';
// Production image-turnaround contract. Missing art is intentionally NOT marked complete.
(function(root){
 const BUILDS=['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic'];
 const POSES=['neutral','confident','guarded','relaxed'];
 const ANGLES=Array.from({length:48},(_,i)=>i);
 const requiredLayers=['anatomy','cyberware','face','hair','clothing'];
 const key=(build,pose,angle)=>build+'/'+pose+'/'+String(angle).padStart(2,'0');
 function validate(manifest){
  const errors=[];
  if(!manifest||manifest.version!==1||!manifest.frames)return {valid:false,errors:['Missing versioned artwork manifest']};
  for(const build of BUILDS)for(const pose of POSES)for(const angle of ANGLES){
   const entry=manifest.frames[key(build,pose,angle)];
   if(!entry){errors.push('Missing frame '+key(build,pose,angle));continue}
   if(typeof entry.base!=='string'||!entry.base.trim())errors.push('Missing anatomy base '+key(build,pose,angle));
   if(entry.layers&&typeof entry.layers!=='object')errors.push('Invalid layers '+key(build,pose,angle));
  }
  return {valid:errors.length===0,errors,expectedFrames:BUILDS.length*POSES.length*ANGLES.length};
 }
 function frame(manifest,build,pose,angle){
  if(!BUILDS.includes(build)||!POSES.includes(pose)||!Number.isInteger(angle)||angle<0||angle>=48)return null;
  return manifest?.frames?.[key(build,pose,angle)]||null;
 }
 const api=Object.freeze({BUILDS,POSES,ANGLES,requiredLayers,key,validate,frame});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.REDAvatarTurnaround=api;
})(typeof window!=='undefined'?window:null);
