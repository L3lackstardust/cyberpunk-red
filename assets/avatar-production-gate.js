'use strict';
/** Validate actual full-frame artwork before it becomes selectable. */
(function(root){
 const ANGLES=[0,45,90,135,180,225,270,315];
 function validate(manifest,exists){
  const errors=[];
  if(!manifest||!Array.isArray(manifest.frames))return {ok:false,errors:['Missing frames array']};
  if(manifest.frames.length!==8)errors.push('Expected exactly eight frames');
  const seen=new Set();
  for(const frame of manifest.frames){
   if(!ANGLES.includes(frame.angle)||seen.has(frame.angle))errors.push('Invalid or duplicate angle '+frame.angle);
   seen.add(frame.angle);
   if(!/^[a-z0-9_-]+\\.webp$/.test(frame.image||''))errors.push('Unsafe frame name');
   if(frame.characterFingerprint!==manifest.appearanceId)errors.push('Identity mismatch '+frame.angle);
   if(!Array.isArray(frame.dimensions)||frame.dimensions[0]<512||frame.dimensions[1]<768)errors.push('Insufficient resolution '+frame.angle);
   if(typeof exists==='function'&&!exists(frame.image))errors.push('Missing file '+frame.image);
  }
  for(const angle of ANGLES)if(!seen.has(angle))errors.push('Missing angle '+angle);
  if(manifest.status!=='approved')errors.push('Artwork not approved');
  if(manifest.background!=='transparent')errors.push('Background must be transparent');
  return {ok:errors.length===0,errors};
 }
 function frame(manifest,angle){if(!ANGLES.includes(angle))throw new RangeError('Invalid angle');return manifest?.frames?.find(f=>f.angle===angle)||null;}
 const api=Object.freeze({ANGLES,validate,frame});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.REDAvatarProductionGate=api;
})(typeof window!=='undefined'?window:null);
