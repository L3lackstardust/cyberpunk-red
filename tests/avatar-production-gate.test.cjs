'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const gate=require('../assets/avatar-production-gate.js');
const frames=gate.ANGLES.map((angle,i)=>({angle,image:String(i).padStart(2,'0')+'_front.webp',dimensions:[1024,1536],characterFingerprint:'terry_base_v1'}));
const manifest={status:'approved',background:'transparent',appearanceId:'terry_base_v1',frames};
test('eight valid angles pass artwork metadata gate',()=>assert.equal(gate.validate(manifest,()=>true).ok,true));
test('missing image blocks production',()=>assert.equal(gate.validate(manifest,()=>false).ok,false));
test('duplicate or missing angle blocks production',()=>assert.equal(gate.validate({...manifest,frames:[...frames.slice(0,7),frames[0]]}).ok,false));
test('mismatched character blocks production',()=>assert.equal(gate.validate({...manifest,frames:[{...frames[0],characterFingerprint:'other'},...frames.slice(1)]}).ok,false));
test('candidate status blocks production',()=>assert.equal(gate.validate({...manifest,status:'candidate_requires_visual_approval'}).ok,false));
test('wrong background blocks production',()=>assert.equal(gate.validate({...manifest,background:'street'}).ok,false));
test('frame lookup exact angle',()=>assert.equal(gate.frame(manifest,90).angle,90));

test('UI-sized images are acceptable for a character pane',()=>assert.equal(gate.validate({...manifest,frames:frames.map(f=>({...f,dimensions:[256,640]}))}).ok,true));
test('unsafe asset paths are rejected',()=>assert.equal(gate.validate({...manifest,frames:[{...frames[0],image:'../unsafe.webp'},...frames.slice(1)]}).ok,false));
test('missing physical file fails closed',()=>assert.equal(gate.validate(manifest,p=>p!=='00_front.webp').ok,false));
