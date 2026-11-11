'use strict';
// Shared procedural renderer for RED Avatar Studio and Cyberware Manager.
(function(){
function renderAvatarSvg(avatar,portrait=false){
 const frame=portrait?0:((Math.trunc(Number(avatar.frame)||0)%48)+48)%48,a=frame*Math.PI/24,front=Math.cos(a),depth=Math.sqrt(front*front+.23*Math.sin(a)*Math.sin(a)),back=Math.max(0,-front),width={'female-slim':.79,'female-average':.89,'female-athletic':1.01,'male-slim':.88,'male-average':1.04,'male-athletic':1.17}[avatar.build],head={standard:1,angular:.91,round:1.12}[avatar.face];
 const proportions={'female-slim':{shoulder:.84,hip:1.08,waist:.79,leg:.84},'female-average':{shoulder:.91,hip:1.18,waist:.94,leg:.96},'female-athletic':{shoulder:1.02,hip:1.12,waist:.88,leg:1.12},'male-slim':{shoulder:.99,hip:.86,waist:.78,leg:.87},'male-average':{shoulder:1.09,hip:.94,waist:1,leg:1.02},'male-athletic':{shoulder:1.23,hip:.96,waist:.91,leg:1.18}}[avatar.build]||{shoulder:1,hip:1,waist:1,leg:1};const shoulderScale=proportions.shoulder,hipScale=proportions.hip;const sx=x=>130+(x-130)*depth*width,eye=avatar.eyes?'#ff526d':'#8fe2ec',skin=avatar.skin,arm=(side)=>avatar.cyberarm==='both'||avatar.cyberarm===side;
 const path=(d,fill,stroke='#63818e',sw=2)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linejoin="round"/>';
 const line=(x,y,x2,y2,color,weight)=>'<path d="M'+x+' '+y+'L'+x2+' '+y2+'" stroke="'+color+'" stroke-width="'+weight+'" stroke-linecap="round"/>';
 const pose={neutral:[0,0],confident:[-17,-25],guarded:[-25,-40],relaxed:[13,17]}[avatar.pose];
 let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(portrait?'60 0 140 210':'0 0 260 480')+'" role="img" aria-label="Custom cyberpunk character '+avatar.pose+' pose"><defs><linearGradient id="fabric" x2="1" y2="1"><stop stop-color="#566977"/><stop offset=".5" stop-color="#263843"/><stop offset="1" stop-color="#121d29"/></linearGradient><linearGradient id="chrome" x2="1" y2="1"><stop stop-color="#c4e4ec"/><stop offset=".5" stop-color="#6d8796"/><stop offset="1" stop-color="#263a48"/></linearGradient></defs>';
 const detail=(x,y,w,h,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="3" fill="'+fill+'"/>';
 s+='<ellipse cx="130" cy="455" rx="'+(40*depth*width)+'" ry="6" fill="#061017"/>';
 // Mask the upper portion of the far leg where the pelvis overlaps it.
 s+='<defs><mask id="far-leg-hip-mask" maskUnits="userSpaceOnUse"><rect width="260" height="480" fill="white"/><ellipse cx="130" cy="246" rx="'+(27*depth*width*hipScale)+'" ry="24" fill="black"/></mask></defs>';
 for(const sign of [-1,1]){const legNear=sign*(Math.abs(Math.sin(a))<1e-8?1:Math.sin(a))>0,legOcclusion=Math.abs(Math.sin(a));s+='<g data-leg-depth="'+(legNear?'near':'far')+'" data-leg-side="'+(sign<0?'right':'left')+'" opacity="'+(legNear?'1':(1-.22*legOcclusion).toFixed(3))+'"'+(!legNear?' mask="url(#far-leg-hip-mask)"':'')+'>';const legSide=sign<0?'right':'left',cyberleg=avatar.cyberleg==='both'||avatar.cyberleg===legSide;const hip=sx(130+sign*20*hipScale),knee=sx(130+sign*(avatar.pose==='confident'?29:24)),foot=sx(130+sign*28);s+=line(hip,244,knee,347,'#2c3b46',24*depth*width*proportions.leg)+line(knee,347,foot,435,'#25343e',21*depth*width*proportions.leg)+line(hip,267,knee,327,'#6e8590',2)+line(knee,362,foot,422,'#6e8590',2);s+=path('M'+(foot-11)+' 431L'+(foot+13)+' 431L'+(foot+16)+' 449L'+(foot-14)+' 449Z','#111c26');s+=line(knee,346,foot,434,'#101c28',2);s+=detail(knee-7,336,14,7,'#4c6976');s+=path('M'+(knee-9)+' 346Q'+knee+' 355 '+(knee+9)+' 346','none','#8fa5af',1.5);s+='<ellipse cx="'+knee+'" cy="348" rx="'+(5*depth+2)+'" ry="4" fill="#526b79" stroke="#91a8b4" stroke-width="1"/>';s+=line(foot-10,443,foot+13,443,'#607987',2);s+=path('M'+(foot-12)+' 435Q'+foot+' 427 '+(foot+13)+' 435','none','#829ba8',1.5);s+=line(foot-9,439,foot+9,439,'#4e6875',1.5);if(cyberleg){s+='<g data-cyberleg-side="'+legSide+'" data-cyberleg-frame="'+frame+'">';s+=line(hip,274,knee,326,'#a9d8e5',6*depth*width)+line(knee,370,foot,419,'#a9d8e5',5*depth*width);s+=line(hip-sign*5*depth,285,knee-sign*5*depth,321,'#162d3b',4*depth)+line(knee-sign*5*depth,376,foot-sign*5*depth,414,'#162d3b',4*depth);s+=path('M'+(hip-sign*10*depth)+' 284Q'+(knee-sign*12*depth)+' 306 '+(knee-sign*9*depth)+' 331','none','#d4edf3',2*depth);s+=path('M'+(knee-sign*9*depth)+' 370Q'+(foot-sign*10*depth)+' 391 '+(foot-sign*8*depth)+' 419','none','#d4edf3',2*depth);s+=line(hip+sign*5*depth,280,knee+sign*4*depth,322,'#ff526d',2)+line(knee+sign*4*depth,373,foot+sign*4*depth,414,'#ff526d',2);s+='<circle cx="'+knee+'" cy="348" r="'+(5*depth+2)+'" fill="#233d4b" stroke="#b7e2ec" stroke-width="2"/>';s+=detail(foot-7*depth,423,14*depth,7,'#769eaf');s+='</g>'}s+='</g>'}
 // Garment contour follows the waist-to-hip transition rather than a fixed cylinder.
 const waistLeft=sx(130-22*proportions.waist),waistRight=sx(130+22*proportions.waist);
 const hipLeft=sx(130-23*hipScale),hipRight=sx(130+23*hipScale);
 s+=path('M'+hipLeft+' 246Q'+waistLeft+' 229 '+waistLeft+' 212','none','#536c79',2);
 s+=path('M'+hipRight+' 246Q'+waistRight+' 229 '+waistRight+' 212','none','#536c79',2);
 s+=path('M'+hipLeft+' 246Q'+sx(130-28*hipScale)+' 254 '+sx(130-21*hipScale)+' 267','none','#91a5af',1.5);s+=path('M'+hipRight+' 246Q'+sx(130+28*hipScale)+' 254 '+sx(130+21*hipScale)+' 267','none','#91a5af',1.5);
 s+=path('M'+sx(130-31*shoulderScale)+' 104Q130 88 '+sx(130+31*shoulderScale)+' 104Q'+sx(130+27*proportions.waist)+' 165 '+sx(130+25*proportions.waist)+' 231Q130 249 '+sx(130-25*proportions.waist)+' 231Q'+sx(130-27*proportions.waist)+' 165 '+sx(130-31*shoulderScale)+' 104Z',avatar.outfit==='corporate'?'#202d3c':'url(#fabric)');
 s+=path('M'+sx(109)+' 221Q130 234 '+sx(151)+' 221L'+sx(149)+' 249Q130 255 '+sx(111)+' 249Z','#1b2935','#708795',1);
 // Collarbone, torso seams, and waist segmentation track the selected body proportions.
 const collarY=114,collarL=sx(130-22*shoulderScale),collarR=sx(130+22*shoulderScale);
 s+=path('M'+collarL+' '+collarY+'Q130 127 '+collarR+' '+collarY,'none','#8195a0',1.5);
 s+=path('M'+sx(130-30*shoulderScale)+' 110Q'+sx(130-25*shoulderScale)+' 103 '+collarL+' 114','none','#a4b6be',1.5);s+=path('M'+sx(130+30*shoulderScale)+' 110Q'+sx(130+25*shoulderScale)+' 103 '+collarR+' 114','none','#a4b6be',1.5);
 s+=line(sx(130-20*proportions.waist),174,sx(130-17*proportions.waist),211,'#617987',1.5);
 s+=line(sx(130+20*proportions.waist),174,sx(130+17*proportions.waist),211,'#617987',1.5);
 s+=path('M'+sx(130-19*proportions.waist)+' 211Q130 218 '+sx(130+19*proportions.waist)+' 211','none','#93a4ad',1.5);
 // Central sternum and side panel lines distinguish broad and narrow torsos.
 s+=line(130,132,130,184,'#536f7d',1.5);
 s+=path('M'+sx(130-19*shoulderScale)+' 132Q'+sx(130-24*proportions.waist)+' 169 '+waistLeft+' 205','none','#4c6876',1.5);
 s+=path('M'+sx(130+19*shoulderScale)+' 132Q'+sx(130+24*proportions.waist)+' 169 '+waistRight+' 205','none','#4c6876',1.5);
 s+=line(sx(112),228,sx(148),228,'#9e5562',2);
 if(avatar.outfit==='combat')s+=path('M'+sx(111)+' 117L'+sx(149)+' 117L'+sx(151)+' 205L'+sx(109)+' 205Z','#394d57','#93aab4',3);
 if(avatar.outfit==='street'){s+=line(sx(112),124,sx(149),215,'#e24d61',3);s+=path('M'+sx(105)+' 111L'+sx(122)+' 145L'+sx(115)+' 164L'+sx(103)+' 130Z','#1b2b36','#7795a0',1);s+=detail(sx(116),184,11,16,'#263d49')}
 if(avatar.outfit==='corporate'){s+=path('M'+sx(113)+' 110L130 153L'+sx(147)+' 110L130 131Z','#d2cbd0');s+=path('M130 153L125 172L130 202L135 172Z','#9f3245','#e16a7a',1)}
 // Far-arm masking keeps the torso in front at oblique angles without hiding the near arm.
 s+='<defs><mask id="far-arm-torso-mask" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="260" height="480" fill="white"/>'+path('M'+sx(130-31*shoulderScale)+' 104Q130 88 '+sx(130+31*shoulderScale)+' 104Q'+sx(130+27*proportions.waist)+' 165 '+sx(130+25*proportions.waist)+' 231Q130 249 '+sx(130-25*proportions.waist)+' 231Q'+sx(130-27*proportions.waist)+' 165 '+sx(130-31*shoulderScale)+' 104Z','black','black',0)+'</mask></defs>';
 for(const sign of (Math.sin(a)>=0?[-1,1]:[1,-1])){const side=(sign<0)===(front>=0)?'right':'left',shoulder=sx(130+sign*37*shoulderScale),elbow=sx(130+sign*50*shoulderScale)+pose[0]*sign*.5,wrist=sx(130+sign*64*shoulderScale)+pose[1]*sign;const cyber=arm(side),material=cyber?'url(#chrome)':skin,near=sign*(Math.abs(Math.sin(a))<1e-8?1:Math.sin(a))>0,occlusion=Math.abs(Math.sin(a));s+='<g data-arm-side="'+side+'" data-arm-depth="'+(near?'near':'far')+'" opacity="'+(!near?(1-.38*occlusion).toFixed(3):'1')+'" data-occlusion-mode="'+(!near&&occlusion>.5?'profile-far':'unoccluded')+'"'+(!near?' mask="url(#far-arm-torso-mask)"':'')+'>';s+=line(shoulder,123,elbow,190,material,21*depth*width*shoulderScale)+line(elbow,190,wrist,248,material,17*depth*width*shoulderScale);s+='<circle cx="'+elbow+'" cy="190" r="'+(5*depth+2)+'" fill="'+(cyber?'#1c3541':skin)+'" stroke="#89aab8"/>';if(cyber){s+='<g data-cyberarm-side="'+side+'" data-cyberarm-frame="'+frame+'">';s+=line(shoulder,135,elbow,177,'#ff526d',2)+line(elbow,203,wrist,238,'#ff526d',2);s+=line(shoulder+sign*4,139,elbow+sign*3,172,'#e2f5fa',2);s+=line(elbow+sign*4,207,wrist+sign*3,234,'#c5e1e9',2);s+=path('M'+(shoulder-sign*6*depth)+' 147L'+(elbow-sign*5*depth)+' 173L'+(elbow+sign*5*depth)+' 173','none','#2a4555',3);s+=path('M'+(elbow-sign*6*depth)+' 209L'+(wrist-sign*4*depth)+' 235L'+(wrist+sign*4*depth)+' 235','none','#2a4555',3);s+=line(shoulder-sign*6*depth,151,elbow-sign*5*depth,169,'#122c3a',3*depth)+line(elbow-sign*5*depth,214,wrist-sign*5*depth,231,'#122c3a',3*depth);s+=path('M'+(shoulder+sign*10*depth)+' 140Q'+(elbow+sign*11*depth)+' 162 '+(elbow+sign*8*depth)+' 179','none','#d7eff5',2*depth);s+=path('M'+(elbow+sign*8*depth)+' 204Q'+(wrist+sign*9*depth)+' 221 '+(wrist+sign*7*depth)+' 239','none','#d7eff5',2*depth);s+=line(elbow-sign*6*depth,191,elbow+sign*6*depth,191,'#d4f0f7',2);s+=detail(wrist-3*depth,238,6*depth,5,'#83b9c9');s+='<circle cx="'+elbow+'" cy="190" r="3" fill="#ff526d"/>';s+=path('M'+(elbow-sign*8*depth)+' 183L'+(elbow+sign*8*depth)+' 197','none','#9ed9e9',2);s+='</g>'}else{s+=line(shoulder,142,elbow,179,'#bd9a86',2)}s+='<ellipse cx="'+wrist+'" cy="253" rx="'+(7*depth+2)+'" ry="12" fill="'+material+'" stroke="'+(cyber?'#b8dbe5':'#765b53')+'" stroke-width="1"/>';
 // Distinct shoulder caps, elbow articulation and a readable thumb/hand silhouette.
 s+=path('M'+(shoulder-sign*8*depth)+' 121Q'+shoulder+' 110 '+(shoulder+sign*11*depth)+' 128','none',cyber?'#c4e4ec':'#9b8276',1.7);
 s+=path('M'+(elbow-sign*7*depth)+' 188Q'+elbow+' 196 '+(elbow+sign*7*depth)+' 188','none',cyber?'#d4eaf0':'#9c776b',1.5);
 s+=path('M'+(wrist+sign*5*depth)+' 252L'+(wrist+sign*12*depth)+' 260L'+(wrist+sign*8*depth)+' 266','none',cyber?'#a6d1de':'#b68e7b',2);s+='</g>';
 }
 // Neck tapers into the shoulders and keeps its profile readable at oblique angles.
 const neckRadius=(avatar.build.startsWith('male')?8.5:7)*depth*head;
 s+=path('M'+(130-neckRadius)+' 86Q'+(130-neckRadius-2)+' 98 '+(130-neckRadius-6)+' 107','none','#977768',2);
 s+=path('M'+(130+neckRadius)+' 86Q'+(130+neckRadius+2)+' 98 '+(130+neckRadius+6)+' 107','none','#977768',2);
 s+=line(130,89,130,104,skin,16*depth);
 const faceWidth=26*depth*head+4,cheek=avatar.face==='round'?1.12:avatar.face==='angular'?.82:1;
 s+=path('M'+(130-faceWidth*.78)+' 30Q130 13 '+(130+faceWidth*.78)+' 30Q'+(130+faceWidth*cheek)+' 58 '+(130+faceWidth*.57)+' 77Q130 '+(avatar.face==='angular'?98:91)+' '+(130-faceWidth*.57)+' 77Q'+(130-faceWidth*cheek)+' 58 '+(130-faceWidth*.78)+' 30Z',skin,'#b8a19a',1.5);
 s+=line(sx(112),74,sx(121),80,'#815e50',1)+line(sx(139),80,sx(148),74,'#815e50',1);
 // Profile features shift toward the viewing direction and fade at front/rear angles.
 const side=Math.sin(a),profile=Math.max(0,1-Math.abs(front)*2);
 if(profile>.01){
  const direction=side>=0?1:-1,edge=130+direction*faceWidth*.76;
  s+=path('M'+edge+' 48L'+(edge+direction*8*profile)+' 57L'+(edge+direction*2)+' 62Z',skin,'#99705d',1);
  s+='<ellipse cx="'+(130-direction*faceWidth*.42)+'" cy="58" rx="'+(3+2*profile)+'" ry="7" fill="'+skin+'" stroke="#98715d" stroke-width="1"/>';
  if(front>-.2)s+='<ellipse cx="'+(130+direction*faceWidth*.34)+'" cy="52" rx="2.5" ry="2" fill="'+eye+'"/>';
 }

 // Oblique jaw and nose contour soften the front/profile transition.
 if(profile>.01&&front>-.25){
  const dir=side>=0?1:-1;
  s+=path('M'+(130+dir*faceWidth*.65)+' 65Q'+(130+dir*faceWidth*.58)+' 78 130 86','none','#8f685b',1.5);
 }
 if(avatar.hair!=='none'){
  const hc=avatar.hairColor,hairEdge='#131c26',L=sx(105),R=sx(155);
  // Hair profiles are separate silhouettes, not a recolored universal cap.
  if(avatar.hair==='short'){
   s+=path('M'+L+' 43Q'+sx(104)+' 19 130 20Q'+sx(156)+' 19 '+R+' 43L'+sx(148)+' 33Q130 27 '+sx(112)+' 34Z',hc,hairEdge,1.5);
   if(back>.15)s+=path('M'+sx(109)+' 37Q130 27 '+sx(151)+' 37L'+sx(148)+' 64Q130 73 '+sx(112)+' 64Z',hc,hairEdge,1);
  }else if(avatar.hair==='swept'){
   s+=path('M'+L+' 44Q'+sx(98)+' 10 130 16Q'+sx(160)+' 11 '+sx(163)+' 36L'+sx(157)+' 68L'+sx(149)+' 62L'+sx(150)+' 31Q'+sx(119)+' 48 '+sx(108)+' 52Z',hc,hairEdge,1.5);
   s+=path('M'+sx(109)+' 33Q130 18 '+sx(154)+' 26','none','#b7a2a0',1);
  }else if(avatar.hair==='mohawk'){
   s+=path('M'+sx(119)+' 34L'+sx(119)+' 16L'+sx(126)+' 5L130 13L'+sx(134)+' 2L'+sx(143)+' 18L'+sx(142)+' 35Z',hc,hairEdge,1.5);
   s+=line(sx(121),30,sx(139),30,'#576673',1.5);
  }
  if(back>.3&&avatar.hair!=='mohawk')s+=line(sx(113),45,sx(147),45,'#71828a',1);
 }
 if(front>.12){s+=line(sx(112),45,sx(125),45,'#4a3430',2)+line(sx(135),45,sx(148),45,'#4a3430',2);s+=line(130,53,128,63,'#6e4b3e',1);s+='<ellipse cx="'+sx(119)+'" cy="51" rx="3.5" ry="2.5" fill="'+eye+'"/><ellipse cx="'+sx(141)+'" cy="51" rx="3.5" ry="2.5" fill="'+eye+'"/>'+line(sx(122),69,sx(138),69,'#4d3230',2)}
 // Cyberoptic glow is confined to the visible face and tracks viewing direction.
 if(avatar.eyes&&front>.12){
  // A single optic remains on its anatomical side as the head turns.
  // Legacy boolean true uses the right optic; explicit 'both' adds bilateral implants.
  const installed=avatar.eyes===true?'right':avatar.eyes;
  for(const opticSide of ['left','right']){
   if(installed!=='both'&&installed!==opticSide)continue;
   const lateral=opticSide==='left'?-1:1;
   const visibility=Math.max(0,front+lateral*Math.sin(a)*.65);
   if(visibility<=.12)continue;
   const opticX=sx(130+lateral*11*head*depth+Math.sin(a)*4);
   const glow=opticSide==='left'?'#64d8ff':'#ff526d';
   s+='<g data-cyberoptic="visible" data-optic-side="'+opticSide+'" data-optic-visibility="'+visibility.toFixed(3)+'" opacity="'+Math.min(1,visibility).toFixed(3)+'"><circle cx="'+opticX+'" cy="51" r="6.2" fill="#172b38" stroke="'+glow+'" stroke-width="1.5"/><circle cx="'+opticX+'" cy="51" r="3.1" fill="'+glow+'"/><circle cx="'+opticX+'" cy="51" r="1.3" fill="#e8faff"/>'+path('M'+(opticX-7)+' 46L'+(opticX-4)+' 42L'+(opticX+4)+' 42L'+(opticX+7)+' 46','none','#87aab9',1.2)+'</g>';
  }
 }
 if(back>.4)s+=line(130,118,130,211,'#718e9a',3);
 s+='</svg>';return s;
}
window.REDAvatarRenderer={render:renderAvatarSvg};
})();
