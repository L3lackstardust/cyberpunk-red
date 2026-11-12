'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const art=require('../assets/avatar-turnaround.js');
test('six body builds, four poses, and 48 angles are enumerated',()=>{
 assert.equal(art.BUILDS.length,6);
 assert.equal(art.POSES.length,4);
 assert.equal(art.ANGLES.length,48);
 assert.equal(new Set(art.BUILDS).size,6);
});
test('missing artwork cannot silently pass quality gate',()=>{
 const result=art.validate({version:1,frames:{}});
 assert.equal(result.valid,false);
 assert.equal(result.expectedFrames,1152);
 assert.equal(result.errors.length,1152);
});
test('angle keys are deterministic and invalid frames rejected',()=>{
 assert.equal(art.key('female-slim','neutral',0),'female-slim/neutral/00');
 assert.equal(art.key('male-athletic','guarded',47),'male-athletic/guarded/47');
 assert.equal(art.frame({frames:{}},'male-athletic','neutral',48),null);
});
