'use strict';
// Shared procedural renderer for RED Avatar Studio and Cyberware Manager.
(function(){
function renderAvatarSvg(avatar,portrait=false){
 const a=portrait?0:avatar.frame*Math.PI/24,front=Math.cos(a),depth=Math.max(.15,Math.abs(front)),back=Math.max(0,-front),width={'female-slim':.79,'female-average':.89,'female-athletic':1.01,'male-slim':.88,'male-average':1.04,'male-athletic':1.17}[avatar.build],head={standard:1,angular:.91,round:1.12}[avatar.face];
 const female=avatar.build.startsWith('female-'),shoulderScale=female?.88:1.07,hipScale=female?1.14:.94;const sx=x=>130+(x-130)*depth*width,eye=avatar.eyes?'#ff526d':'#8fe2ec',skin=avatar.skin,arm=(side)=>avatar.cyberarm==='both'||avatar.cyberarm===side;
 const path=(d,fill,stroke='#63818e',sw=2)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linejoin="round"/>';
 const line=(x,y,x2,y2,color,weight)=>'<path d="M'+x+' '+y+'L'+x2+' '+y2+'" stroke="'+color+'" stroke-width="'+weight+'" stroke-linecap="round"/>';
 const pose={neutral:[0,0],confident:[-17,-25],guarded:[-25,-40],relaxed:[13,17]}[avatar.pose];
 let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(portrait?'60 0 140 210':'0 0 260 480')+'" role="img" aria-label="Custom cyberpunk character '+avatar.pose+' pose"><defs><linearGradient id="fabric" x2="1" y2="1"><stop stop-color="#566977"/><stop offset=".5" stop-color="#263843"/><stop offset="1" stop-color="#121d29"/></linearGradient><linearGradient id="chrome" x2="1" y2="1"><stop stop-color="#c4e4ec"/><stop offset=".5" stop-color="#6d8796"/><stop offset="1" stop-color="#263a48"/></linearGradient></defs>';
 const detail=(x,y,w,h,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="3" fill="'+fill+'"/>';
 s+='<ellipse cx="130" cy="455" rx="'+(40*depth*width)+'" ry="6" fill="#061017"/>';
 for(const sign of [-1,1]){const hip=sx(130+sign*20*hipScale),knee=sx(130+sign*(avatar.pose==='confident'?29:24)),foot=sx(130+sign*28);s+=line(hip,244,knee,347,'#2c3b46',24*depth*width)+line(knee,347,foot,435,'#25343e',21*depth*width)+line(hip,267,knee,327,'#6e8590',2)+line(knee,362,foot,422,'#6e8590',2);s+=path('M'+(foot-11)+' 431L'+(foot+13)+' 431L'+(foot+16)+' 449L'+(foot-14)+' 449Z','#111c26');s+=line(knee,346,foot,434,'#101c28',2);s+=detail(knee-7,336,14,7,'#4c6976');s+=line(foot-10,443,foot+13,443,'#607987',2)}
 s+=path('M'+sx(130-31*shoulderScale)+' 104Q130 88 '+sx(130+31*shoulderScale)+' 104L'+sx(155)+' 231Q130 249 '+sx(105)+' 231Z',avatar.outfit==='corporate'?'#202d3c':'url(#fabric)');
 s+=path('M'+sx(109)+' 221Q130 234 '+sx(151)+' 221L'+sx(149)+' 249Q130 255 '+sx(111)+' 249Z','#1b2935','#708795',1);
 s+=line(sx(112),228,sx(148),228,'#9e5562',2);
 if(avatar.outfit==='combat')s+=path('M'+sx(111)+' 117L'+sx(149)+' 117L'+sx(151)+' 205L'+sx(109)+' 205Z','#394d57','#93aab4',3);
 if(avatar.outfit==='street'){s+=line(sx(112),124,sx(149),215,'#e24d61',3);s+=path('M'+sx(105)+' 111L'+sx(122)+' 145L'+sx(115)+' 164L'+sx(103)+' 130Z','#1b2b36','#7795a0',1);s+=detail(sx(116),184,11,16,'#263d49')}
 if(avatar.outfit==='corporate'){s+=path('M'+sx(113)+' 110L130 153L'+sx(147)+' 110L130 131Z','#d2cbd0');s+=path('M130 153L125 172L130 202L135 172Z','#9f3245','#e16a7a',1)}
 for(const sign of [-1,1]){const side=sign<0?'right':'left',shoulder=sx(130+sign*37*shoulderScale),elbow=sx(130+sign*50*shoulderScale)+pose[0]*sign*.5,wrist=sx(130+sign*64*shoulderScale)+pose[1]*sign;const cyber=arm(side),material=cyber?'url(#chrome)':skin;s+=line(shoulder,123,elbow,190,material,21*depth*width)+line(elbow,190,wrist,248,material,17*depth*width);s+='<circle cx="'+elbow+'" cy="190" r="'+(5*depth+2)+'" fill="'+(cyber?'#1c3541':skin)+'" stroke="#89aab8"/>';if(cyber){s+=line(shoulder,135,elbow,177,'#ff526d',2)+line(elbow,203,wrist,238,'#ff526d',2);s+=line(shoulder+sign*4,139,elbow+sign*3,172,'#e2f5fa',2);s+=line(elbow+sign*4,207,wrist+sign*3,234,'#c5e1e9',2);s+='<circle cx="'+elbow+'" cy="190" r="3" fill="#ff526d"/>'}else{s+=line(shoulder,142,elbow,179,'#bd9a86',2)}s+='<ellipse cx="'+wrist+'" cy="253" rx="8" ry="12" fill="'+material+'"/>'}
 s+=line(130,89,130,104,skin,16*depth);
 s+='<ellipse cx="130" cy="55" rx="'+(26*depth*head+4)+'" ry="34" fill="'+skin+'" stroke="#b8a19a" stroke-width="1.5"/>';
 if(avatar.hair!=='none'){const top=avatar.hair==='mohawk'?8:avatar.hair==='swept'?16:23;s+=path('M'+sx(106)+' 42Q'+sx(105)+' '+top+' 130 '+(top-3)+'Q'+sx(155)+' '+top+' '+sx(154)+' 43L'+sx(148)+' 34Q130 27 '+sx(112)+' 37Z',avatar.hairColor,'#20252d',1)}
 if(front>.12){s+=line(sx(112),45,sx(125),45,'#4a3430',2)+line(sx(135),45,sx(148),45,'#4a3430',2);s+=line(130,53,128,63,'#6e4b3e',1);s+='<ellipse cx="'+sx(119)+'" cy="51" rx="3.5" ry="2.5" fill="'+eye+'"/><ellipse cx="'+sx(141)+'" cy="51" rx="3.5" ry="2.5" fill="'+eye+'"/>'+line(sx(122),69,sx(138),69,'#4d3230',2)}
 if(back>.4)s+=line(130,118,130,211,'#718e9a',3);
 s+='</svg>';return s;
}
window.REDAvatarRenderer={render:renderAvatarSvg};
})();
