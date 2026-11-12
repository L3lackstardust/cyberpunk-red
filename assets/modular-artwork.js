'use strict';
(function(root){
 const ID='terry-modular-v1',base='assets/avatar-art/terry/modular-v1/';
 const builds={
  'female-slim':[.79,.94,.78], 'female-average':[.9,1.09,.91], 'female-athletic':[1,1.04,1.02],
  'male-slim':[.9,.85,.85], 'male-average':[1.04,.98,1], 'male-athletic':[1.17,1.02,1.12]
 };
 const poses={neutral:[-5,5,0],confident:[-17,17,6],guarded:[12,-12,-3],relaxed:[-2,9,2]};
 let serial=0;
 function render(raw,portrait=false){
  const a=root.REDTerryArtwork.sanitize(raw);if(!a)return '';
  const atlas=root.REDModularAtlas;if(!atlas)return '';
  const i=portrait?0:Math.round(a.frame/6)%8,angle=i*Math.PI/4,c=Math.cos(angle),sn=Math.sin(angle);
  const [shoulder,hip,limb]=builds[a.build],pose=poses[a.pose],uid='modular-'+(++serial);
  const has=(part,side)=>a[part]==='both'||a[part]===side||(part==='eyes'&&a.eyes===true);
  function piece(name,index,x,y,width,height,{flip=false,rotation=0,filter='',side=''}={}){
   const meta=atlas[name],b=meta.boxes[index];
   return '<g data-part="'+name+'" data-side="'+side+'" transform="translate('+x+' '+y+') rotate('+rotation+')"><g'+(flip?' transform="scale(-1 1)"':'')+(filter?' filter="url(#'+uid+'-'+filter+')"':'')+'><svg x="'+(-width/2)+'" y="0" width="'+width+'" height="'+height+'" viewBox="'+b.join(' ')+'" preserveAspectRatio="none" overflow="hidden"><image href="'+base+name+'.png" width="'+meta.width+'" height="'+meta.height+'"/></svg></g></g>';
  }
  const skinColors={'#e4b995':[1.3,1.3,1.3],'#c99170':[1.12,1.12,1.12],'#a9765d':[1,1,1],'#76513e':[.77,.77,.77],'#513a31':[.55,.55,.55]};
  const skin=skinColors[a.skin],rgb=a.hairColor.match(/\w\w/g).map(x=>parseInt(x,16)/255);
  let out='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(portrait?'325 20 350 480':'0 0 1000 1500')+'" role="img" aria-label="Modular Terry artwork, '+a.pose+', view '+i+'" data-modular-view="'+i+'"><defs>';
  for(const [name,v]of [['skin',skin],['hair',rgb.map(x=>x*1.8)]])out+='<filter id="'+uid+'-'+name+'" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="'+v[0]+'"/><feFuncG type="linear" slope="'+v[1]+'"/><feFuncB type="linear" slope="'+v[2]+'"/></feComponentTransfer></filter>';
  out+='</defs>';
  const sideOrder=sn>=0?['left','right']:['right','left'];
  const screenSign=side=>side==='right'?-1:1;
  function limbPart(kind,side){
   const sign=screenSign(side),mirror=side==='left',idx=mirror?(8-i)%8:i;
   const cyber=has(kind==='arm'?'cyberarm':'cyberleg',side),name=kind+'-'+(cyber?'cyber':'natural');
   const leg=kind==='leg',spread=leg?85*hip:165*shoulder;
   const x=500+sign*spread*c+sn*(leg?0:8),y=leg?728:340;
   const b=atlas[name].boxes[idx],height=leg?700:585,width=height*b[2]/b[3]*limb;
   const rot=leg?sign*pose[2]*c:pose[side==='right'?0:1]*c;
   return piece(name,idx,x,y,width,height,{flip:mirror,rotation:rot,filter:!cyber&&!leg?'skin':'',side});
  }
  for(const side of sideOrder)out+=limbPart('leg',side);
  out+=limbPart('arm',sideOrder[0]);
  const torso='torso-'+a.outfit,tb=atlas[torso].boxes[i],tw=450*tb[2]/tb[3]*shoulder;
  out+=piece(torso,i,500,295,tw,465);
  out+=limbPart('arm',sideOrder[1]);
  const faceScale={standard:1,angular:.94,round:1.09}[a.face],hb=atlas.head.boxes[i],hh=275,hw=hh*hb[2]/hb[3]*faceScale;
  out+=piece('head',i,500,50,hw,hh,{filter:'skin'});
  if(a.hair!=='none'){
   const name='hair-'+a.hair,b=atlas[name].boxes[i];
   const mohawk=a.hair==='mohawk',hairWidth=mohawk?hw*(Math.abs(c)>.9?.46:.95):hw*.97;
   const hairHeight=hairWidth*b[3]/b[2];
   out+=piece(name,i,500,50-(mohawk?35:15),hairWidth,hairHeight,{filter:'hair'});
  }
  // Ocular hardware is drawn at the face anchors; far optics disappear in profile/rear views.
  if(c>-.1){for(const side of ['right','left'])if(has('eyes',side)&&!(Math.abs(sn)>.9&&((sn>0&&side==='left')||(sn<0&&side==='right')))){
   const sign=screenSign(side),x=500+sign*hw*.2*c+sn*hw*.25;
   out+='<g data-part="optic" data-side="'+side+'"><ellipse cx="'+x+'" cy="145" rx="'+(8*Math.max(.35,Math.abs(c)))+'" ry="5" fill="#111b22" stroke="#b4c7cc" stroke-width="2"/><circle cx="'+x+'" cy="145" r="3" fill="#ff3656"/><circle cx="'+(x-1)+'" cy="144" r="1" fill="#fff"/></g>';
  }}
  return out+'</svg>';
 }
 const loaded=new Map();
 function mount(target,avatar,portrait=false,onError=()=>{}){
  const token={};target._modularToken=token;target.innerHTML=render(avatar,portrait);
  const paths=[...new Set([...target.querySelectorAll('image')].map(x=>x.getAttribute('href')))];
  Promise.all(paths.map(path=>{if(!loaded.has(path))loaded.set(path,new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(Error('Artwork component unavailable: '+path));img.src=path}));return loaded.get(path)})).catch(error=>{if(target._modularToken!==token||!target.isConnected)return;target.innerHTML=root.REDAvatarRenderer.render(root.REDTerryArtwork.sanitize(avatar),portrait);onError(error)});
 }
 root.REDModularArtwork=Object.freeze({ID,render,mount,builds,poses});
})(window);
