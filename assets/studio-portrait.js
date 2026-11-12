'use strict';
(function(root){
 const AVATAR_KEY='cyberpunk-red-avatar-v1';
 function render(target,credit){
  let avatar;try{avatar=JSON.parse(localStorage.getItem(AVATAR_KEY)||'null')}catch{return false}
  avatar=root.REDTerryArtwork.sanitize(avatar);
  if(!avatar||!root.REDAvatarRenderer)return false;
  // Reflect the installed state immediately, even when Avatar Studio is closed.
  try{
   const character=JSON.parse(localStorage.getItem('cyberpunk-red-character-v1')||'null');
   if(character){
    const installs=character.installInstances?.length?character.installInstances:(character.installed||[]).map((itemId,i)=>({itemId,side:character.installSideByIndex?.[i]||character.installSides?.[itemId]||'both'}));
    for(const [key,id] of [['cyberarm','arm'],['cyberleg','leg'],['eyes','optic']]){
     const sides=installs.filter(x=>x.itemId===id).map(x=>String(x.side||'both').toLowerCase());
     const left=sides.includes('left')||sides.includes('both'),right=sides.includes('right')||sides.includes('both');
     avatar[key]=left&&right?'both':left?'left':right?'right':key==='eyes'?false:'none';
    }
   }
  }catch{}
  if(avatar.artwork===root.REDModularArtwork.ID){target.classList.remove('studio-terry');root.REDModularArtwork.mount(target,avatar,true,()=>{credit.textContent='Modular artwork unavailable · procedural recovery portrait'});credit.textContent='Modular Terry · linked Avatar Studio portrait';return true}
  const art=root.REDTerryArtwork.resolve(avatar);
  function fallback(){target.classList.remove('studio-terry');target.innerHTML=root.REDAvatarRenderer.render({...avatar,frame:0},true)}
  target.classList.remove('studio-terry');
  if(art.available){
   const image=document.createElement('img');image.src='./'+art.portrait;image.alt='Terry · Avatar Studio portrait';image.draggable=false;
   image.onerror=()=>{if(image.isConnected){fallback();credit.textContent='Artwork unavailable · Avatar Studio procedural portrait'}};
   target.classList.add('studio-terry');target.replaceChildren(image);
  }else fallback();
  credit.textContent=art.available?'Terry · linked Avatar Studio portrait':art.reason||'Linked Avatar Studio portrait';
  return true;
 }
 root.REDStudioPortrait=Object.freeze({render,AVATAR_KEY});
})(window);
