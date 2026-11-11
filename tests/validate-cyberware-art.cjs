#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../assets/cyberware-spin');
const manifestFile=path.join(root,'manifest.json');
const errors=[];
if(!fs.existsSync(manifestFile)){
 console.error('No 360-degree artwork manifest yet. Procedural anatomy remains the fallback.');
 process.exit(0);
}
let manifest;
try{manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'))}catch(e){console.error('Invalid artwork manifest:',e.message);process.exit(1)}
if(manifest.frameCount!==48)errors.push('frameCount must be 48');
const validName=/^[\w./-]+\.(webp|png|jpe?g)$/i;
function checkSequence(name,frames){
 if(!Array.isArray(frames)||frames.length!==48){errors.push(name+' must have exactly 48 frames');return}
 const seen=new Set();
 for(let i=0;i<frames.length;i++){
  const file=frames[i];
  if(typeof file!=='string'||!validName.test(file)||file.startsWith('/')||file.split('/').includes('..')){errors.push(name+' frame '+i+' has an unsafe path');continue}
  if(seen.has(file))errors.push(name+' repeats '+file);
  seen.add(file);
  const resolved=path.resolve(root,file);
  if(!resolved.startsWith(root+path.sep)||!fs.existsSync(resolved))errors.push(name+' frame '+i+' missing: '+file);
 }
}
for(const preset of ['standard','broad','slim']){
 const data=manifest.presets?.[preset];
 if(!data){errors.push('Missing body preset '+preset);continue}
 checkSequence(preset+' base',data.base);
 for(const [key,frames] of Object.entries(data.overlays||{}))checkSequence(preset+' overlay '+key,frames);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Cyberware image sequences valid: 48 frames for each body preset and supplied overlay.');
