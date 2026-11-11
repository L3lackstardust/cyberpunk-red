const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const player=fs.readFileSync('index.html','utf8');
const cyber=fs.readFileSync('character-cyberware.html','utf8');
function inlineScripts(html){return [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean)}
test('inline browser JavaScript parses',()=>{for(const [name,html] of [['player',player],['cyberware',cyber]])for(const source of inlineScripts(html))assert.doesNotThrow(()=>new vm.Script(source,{filename:name+'.js'}))});
test('separate persistent namespaces are stable',()=>{assert.match(player,/cyberpunk-red-console-v1/);assert.match(cyber,/cyberpunk-red-character-v1/);assert.match(cyber,/cyberpunk-red-console-v1/)});
test('cyberware purchase reads latest player funds',()=>{assert.match(cyber,/if\(t\.dataset\.buy\)[\s\S]*?const p=playerData\(\)/);assert.match(cyber,/Number\(p\.eb\)<x\.price/);assert.doesNotMatch(cyber,/if\(!x\|\|state\.cash<x\.price\)return/)});
test('cyberware installation validates humanity before inventory mutation',()=>{const section=cyber.slice(cyber.indexOf("const input=prompt('Confirm installation"),cyber.indexOf('if(t.dataset.unload'));assert.ok(section.indexOf("Number(p.humanity)<loss")>=0);assert.ok(section.indexOf("Number(p.humanity)<loss")<section.indexOf("state.owned.splice(i,1)"))});
test('player roll refreshes stats before computing base',()=>{assert.match(player,/refreshSharedPlayer\(\);syncCyberware\(\);base=refreshedRollBase\(label,base\)/)});
test('cyberware backup import saves immediately',()=>{assert.match(cyber,/state\.conditions\|\|=\{\};[\s\S]*?normalizeInstallInstances\(\);save\(\);audit\('Imported cyberware backup/)});

function extractFunction(source,name,nextName){const start=source.indexOf('function '+name+'(');const end=source.indexOf('function '+nextName+'(',start);assert.ok(start>=0&&end>start,'function boundaries: '+name);return source.slice(start,end)}
test('player mirrors only edited fields without changing cyberware inventory',()=>{
 const data=new Map([['cyberpunk-red-character-v1',JSON.stringify({name:'Old',cash:500,humanity:45,stats:{REF:5},installed:['optic'],owned:['deck'],netLoaded:['sword']})]]);
 const localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 const ctx={localStorage,console,s:{handle:'New',name:'New',role:'Solo',eb:100,humanity:20,humanityMax:50,stats:{REF:8}}};
 vm.runInNewContext(extractFunction(player,'mirrorPlayerFields','refreshSharedPlayer')+';mirrorPlayerFields(["REF"]);',ctx);
 const saved=JSON.parse(data.get('cyberpunk-red-character-v1'));
 assert.equal(saved.stats.REF,8);assert.equal(saved.cash,500);assert.equal(saved.humanity,45);
 assert.deepEqual(saved.installed,['optic']);assert.deepEqual(saved.netLoaded,['sword']);
});
test('cyberware commit updates only requested shared field',()=>{
 const data=new Map([['cyberpunk-red-console-v1',JSON.stringify({eb:1000,humanity:50,role:'Solo',handle:'Old',stats:{REF:7,DEX:6}})]]);
 const localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 const ctx={localStorage,console,alert:()=>{throw Error('unexpected alert')},state:{cash:300,humanity:20,humanityMax:40,role:'Netrunner',name:'New',stats:{REF:3,DEX:2}},STATS:['REF','DEX'],PLAYER_KEY:'cyberpunk-red-console-v1'};
 const source=cyber.slice(cyber.indexOf('function playerData()'),cyber.indexOf('function pullPlayer()'));
 vm.runInNewContext(source+';commitShared(["cash"]);',ctx);
 const saved=JSON.parse(data.get('cyberpunk-red-console-v1'));
 assert.equal(saved.eb,300);assert.equal(saved.humanity,50);assert.equal(saved.role,'Solo');assert.equal(saved.stats.REF,7);
});

test('refreshing player console pulls only shared character fields',()=>{
 const stored={eb:750,humanity:32,role:'Tech',handle:'Updated',stats:{REF:9,DEX:8},skills:{Handgun:9},rolls:[]};
 const ctx={localStorage:{getItem:()=>JSON.stringify(stored)},KEY:'cyberpunk-red-console-v1',console,s:{eb:100,humanity:40,role:'Solo',handle:'Old',stats:{REF:5,DEX:5},skills:{Handgun:4},rolls:[{id:1}]}};
 vm.runInNewContext(extractFunction(player,'refreshSharedPlayer','hpmax')+';refreshSharedPlayer();',ctx);
 assert.equal(ctx.s.eb,750);assert.equal(ctx.s.stats.REF,9);assert.equal(ctx.s.skills.Handgun,4);assert.equal(ctx.s.rolls.length,1);
});
test('cyberware refresh does not discard owned or installed items',()=>{
 const saved={eb:1200,humanity:36,humanityMax:60,stats:{REF:9,DEX:8}};
 const ctx={PLAYER_KEY:'cyberpunk-red-console-v1',localStorage:{getItem:()=>JSON.stringify(saved)},STATS:['REF','DEX'],state:{cash:10,humanity:20,humanityMax:40,stats:{REF:5,DEX:5},owned:['arm'],installed:['optic'],netLoaded:['sword']}};
 const src=cyber.slice(cyber.indexOf('function playerData()'),cyber.indexOf('function commitShared('));
 vm.runInNewContext(src+';refreshFromPlayer();',ctx);
 assert.equal(ctx.state.cash,1200);assert.equal(ctx.state.humanity,36);assert.equal(ctx.state.stats.REF,9);
 assert.deepEqual(ctx.state.owned,['arm']);assert.deepEqual(ctx.state.installed,['optic']);assert.deepEqual(ctx.state.netLoaded,['sword']);
});

test('cyberware modifier applies only when installed and condition enabled',()=>{
 const source=cyber.slice(cyber.indexOf('function mods()'),cyber.indexOf('function renderRoll()'));
 const ctx={state:{installed:['image'],conditions:{image:false},action:'perception'},items:[{id:'image',name:'Image Enhance',mod:{action:'perception',value:2},conditional:true}]};
 vm.runInNewContext(source+';globalResult=mods();',ctx);
 assert.equal(ctx.globalResult.length,0);
 ctx.state.conditions.image=true;
 vm.runInNewContext('globalResult=mods();',ctx);
 assert.equal(ctx.globalResult.length,1);assert.equal(ctx.globalResult[0].value,2);
 ctx.state.action='handgun';vm.runInNewContext('globalResult=mods();',ctx);
 assert.equal(ctx.globalResult.length,0);
});
test('cyberware roll uses latest player stats and records its modifier sources',()=>{
 assert.match(cyber,/\$\('roll'\)\.onclick=\(\)=>\{refreshFromPlayer\(\);renderRoll\(\)/);
 assert.match(cyber,/sources:mods\(\),modifier,total,dv/);
 assert.match(cyber,/cyberpunk-red:roll/);
});
test('cyberware transactions preserve inventory on insufficient player balance',()=>{
 const segment=cyber.slice(cyber.indexOf('if(t.dataset.buy)'),cyber.indexOf('if(t.dataset.install'));
 assert.ok(segment.indexOf('Number(p.eb)<x.price')<segment.indexOf('state.owned.push(x.id)'));
 assert.ok(segment.includes('return}state.cash=Number(p.eb)-x.price'));
});
test('cyberware installation checks prerequisites before moving inventory',()=>{
 const segment=cyber.slice(cyber.indexOf('if(t.dataset.install!==undefined)'),cyber.indexOf('if(t.dataset.unload'));
 assert.ok(segment.indexOf('x.requires.some(')<segment.indexOf('state.owned.splice(i,1)'));
 assert.match(segment,/Number\(p\.humanity\)<loss/);
});

test('shared player edits preserve unrelated cyberware equipment and NET state',()=>{
 const data=new Map([['cyberpunk-red-character-v1',JSON.stringify({name:'Before',cash:900,installed:['optic','image'],owned:['arm'],netLoaded:['sword'],conditions:{image:true},stats:{REF:5,DEX:6}})]]);
 const ctx={localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},console,s:{handle:'After',name:'After',role:'Solo',eb:450,humanity:38,humanityMax:50,stats:{REF:8,DEX:6}}};
 vm.runInNewContext(extractFunction(player,'mirrorPlayerFields','refreshSharedPlayer')+';mirrorPlayerFields(["eb","REF"]);',ctx);
 const saved=JSON.parse(data.get('cyberpunk-red-character-v1'));
 assert.equal(saved.cash,450);assert.equal(saved.stats.REF,8);assert.equal(saved.stats.DEX,6);
 assert.deepEqual(saved.installed,['optic','image']);assert.deepEqual(saved.owned,['arm']);assert.deepEqual(saved.netLoaded,['sword']);assert.equal(saved.conditions.image,true);
});
test('cyberware shared humanity edit preserves player skills and roll history',()=>{
 const stored={eb:900,humanity:55,humanityMax:60,role:'Solo',handle:'Ghost',stats:{REF:7},skills:{Perception:6},rolls:[{id:'r1'}]};
 const data=new Map([['cyberpunk-red-console-v1',JSON.stringify(stored)]]);
 const ctx={localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},console,alert:()=>{throw Error('unexpected alert')},state:{cash:200,humanity:32,humanityMax:60,role:'Netrunner',name:'Else',stats:{REF:2}},STATS:['REF'],PLAYER_KEY:'cyberpunk-red-console-v1'};
 const source=cyber.slice(cyber.indexOf('function playerData()'),cyber.indexOf('function pullPlayer()'));
 vm.runInNewContext(source+';commitShared(["humanity"]);',ctx);
 const saved=JSON.parse(data.get('cyberpunk-red-console-v1'));
 assert.equal(saved.humanity,32);assert.equal(saved.eb,900);assert.equal(saved.handle,'Ghost');assert.equal(saved.stats.REF,7);
 assert.deepEqual(saved.skills,{Perception:6});assert.deepEqual(saved.rolls,[{id:'r1'}]);
});
test('cyberware storage failure displays a warning rather than silently losing edits',()=>{
 assert.match(cyber,/NOT SAVED — export a JSON backup now/);
 assert.match(cyber,/console\.error\('RED local save failed'/);
});

test('shared avatar renderer preserves anatomy geometry across six bodies and four cardinal views',()=>{
 const src=fs.readFileSync('assets/avatar-renderer.js','utf8');
 const ctx={window:{}};vm.runInNewContext(src,ctx);
 for(const build of ['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic']){
  for(const frame of [0,12,24,36]){
   const svg=ctx.window.REDAvatarRenderer.render({build,frame,pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'left',eyes:false});
   assert.match(svg,/viewBox="0 0 260 480"/);
   assert.match(svg,/stroke="#977768"/);
   assert.match(svg,/stroke="#536c79"/);
   assert.match(svg,/stroke="#4c6876"/);
   assert.ok(!/NaN|undefined/.test(svg),build+' frame '+frame+' contains invalid geometry');
  }
 }
});

test('avatar rotation wraps every 48 frames and preserves anatomical cyberarm side',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'female-athletic',pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',eyes:false};
 const render=(frame,cyberarm)=>ctx.window.REDAvatarRenderer.render({...base,frame,cyberarm});
 for(let frame=0;frame<48;frame++){
  assert.equal(render(frame,'left'),render(frame+48,'left'),'frame '+frame+' should wrap');
  const left=render(frame,'left'),right=render(frame,'right'),both=render(frame,'both');
  assert.match(left,/data-cyberarm-side="left"/);
  assert.doesNotMatch(left,/data-cyberarm-side="right"/);
  assert.match(right,/data-cyberarm-side="right"/);
  assert.doesNotMatch(right,/data-cyberarm-side="left"/);
  assert.match(both,/data-cyberarm-side="left"/);
  assert.match(both,/data-cyberarm-side="right"/);
  assert.ok(!/NaN|undefined/.test(left));
 }
});

test('avatar arm layers and cyberoptic visibility follow cardinal viewing direction',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'male-average',pose:'neutral',face:'angular',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'both',eyes:true};
 for(const frame of [0,6,12,18,24,30,36,42]){
  const svg=ctx.window.REDAvatarRenderer.render({...base,frame});
  assert.match(svg,/data-arm-depth="near"/);
  assert.match(svg,/data-arm-depth="far"/);
  assert.match(svg,/data-cyberarm-side="left"/);
  assert.match(svg,/data-cyberarm-side="right"/);
  assert.equal(svg.includes('data-cyberoptic="visible"'),Math.cos(frame*Math.PI/24)>.12);
  assert.ok(!/NaN|undefined/.test(svg));
 }
});

test('all 48 avatar frames preserve arm layers and pose rendering without invalid coordinates',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 for(const pose of ['neutral','confident','guarded','relaxed']){
  for(let frame=0;frame<48;frame++){
   const avatar={build:'female-average',pose,frame,face:'round',hair:'swept',outfit:'combat',skin:'#a9765d',hairColor:'#18222a',cyberarm:'both',eyes:true};
   const svg=ctx.window.REDAvatarRenderer.render(avatar);
   assert.equal((svg.match(/data-arm-depth="near"/g)||[]).length,1,pose+' frame '+frame);
   assert.equal((svg.match(/data-arm-depth="far"/g)||[]).length,1,pose+' frame '+frame);
   assert.equal((svg.match(/data-cyberarm-side=/g)||[]).length,2);
   assert.ok(!/NaN|undefined|Infinity/.test(svg));
   assert.equal(svg,ctx.window.REDAvatarRenderer.render({...avatar,frame:frame+48}));
  }
 }
});

test('far-side arm is attenuated in profile while both arms remain fully visible in front view',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'male-average',pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'both',eyes:true};
 const front=ctx.window.REDAvatarRenderer.render({...base,frame:0});
 const profile=ctx.window.REDAvatarRenderer.render({...base,frame:12});
 assert.ok(front.includes('data-arm-depth="far" opacity="1.000"') || front.includes('data-arm-depth="far" opacity="1"'));
 assert.match(profile,/data-arm-depth="far" opacity="0.620"/);
 assert.match(profile,/data-arm-depth="near" opacity="1"/);
});

test('profile occlusion state is consistent across all six body builds and 48 frames',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const builds=['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic'];
 for(const build of builds)for(let frame=0;frame<48;frame++){
  const svg=ctx.window.REDAvatarRenderer.render({build,frame,pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'both',eyes:true});
  assert.equal((svg.match(/data-occlusion-mode=/g)||[]).length,2,build+' '+frame);
  const expected=Math.abs(Math.sin(frame*Math.PI/24))>.5;
  assert.equal(svg.includes('data-occlusion-mode="profile-far"'),expected,build+' '+frame);
  assert.ok(!/NaN|undefined|Infinity/.test(svg));
 }
});

test('six-body cardinal snapshots remain deterministic across poses and implant variants',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const builds=['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic'];
 const crypto=require('node:crypto');
 const signatures=new Set();
 for(const build of builds)for(const frame of [0,12,24,36])for(const cyberarm of ['none','left','right','both']){
  const avatar={build,frame,pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm,eyes:true};
  const svg=ctx.window.REDAvatarRenderer.render(avatar);
  assert.equal(svg,ctx.window.REDAvatarRenderer.render(avatar));
  assert.ok(!/NaN|undefined|Infinity/.test(svg));
  const hash=crypto.createHash('sha256').update(svg).digest('hex');
  signatures.add(hash);
  assert.equal(svg,ctx.window.REDAvatarRenderer.render({...avatar,frame:frame+48}));
 }
 assert.ok(signatures.size>=72,'cardinal snapshots should preserve body, view and cyberware differences');
});

test('explicit optic sides remain distinct with bilateral colors',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'female-average',pose:'neutral',frame:0,face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'none'};
 const render=eyes=>ctx.window.REDAvatarRenderer.render({...base,eyes});
 assert.match(render('left'),/data-optic-side="left"/);
 assert.doesNotMatch(render('left'),/data-optic-side="right"/);
 assert.match(render('right'),/data-optic-side="right"/);
 assert.doesNotMatch(render('right'),/data-optic-side="left"/);
 assert.match(render('both'),/data-optic-side="left"/);
 assert.match(render('both'),/data-optic-side="right"/);
 assert.match(render('both'),/#64d8ff/);
 assert.match(render('both'),/#ff526d/);
 assert.doesNotMatch(render(false),/data-optic-side=/);
 assert.match(render(true),/data-optic-side="right"/);
});

test('cyberarm plate detail remains side-specific across rotation',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'male-average',pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',eyes:false};
 for(const frame of [0,6,12,18,24,30,36,42]){
  const svg=ctx.window.REDAvatarRenderer.render({...base,frame,cyberarm:'left'});
  assert.match(svg,/data-cyberarm-side="left"/);
  assert.doesNotMatch(svg,/data-cyberarm-side="right"/);
  assert.match(svg,/#83b9c9/);
  assert.ok(!/NaN|undefined|Infinity/.test(svg));
 }
});

test('cyberleg renders only on the selected side across rotation',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'female-average',pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'none',eyes:false};
 for(const frame of [0,6,12,18,24,30,36,42]){
  const svg=ctx.window.REDAvatarRenderer.render({...base,frame,cyberleg:'left'});
  assert.match(svg,/data-cyberleg-side="left"/);
  assert.doesNotMatch(svg,/data-cyberleg-side="right"/);
  assert.ok(!/NaN|undefined|Infinity/.test(svg));
 }
 const both=ctx.window.REDAvatarRenderer.render({...base,frame:0,cyberleg:'both'});
 assert.match(both,/data-cyberleg-side="left"/);assert.match(both,/data-cyberleg-side="right"/);
});

test('cyberoptic lens geometry attenuates toward oblique angles',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'female-average',pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',cyberarm:'none',cyberleg:'none',eyes:'both'};
 const front=ctx.window.REDAvatarRenderer.render({...base,frame:0});
 assert.match(front,/data-optic-visibility="1.000"/);
 assert.match(front,/r="3.1"/);assert.match(front,/r="1.3"/);
 const oblique=ctx.window.REDAvatarRenderer.render({...base,frame:4});
 assert.match(oblique,/data-optic-side="left"/);assert.match(oblique,/data-optic-side="right"/);
 assert.match(oblique,/data-optic-visibility="0\.[0-9]{3}"/);
 const rear=ctx.window.REDAvatarRenderer.render({...base,frame:24});
 assert.doesNotMatch(rear,/data-optic-side=/);
});

test('all body builds preserve cyberware placements through all 48 frames',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const builds=['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic'];
 for(const build of builds)for(let frame=0;frame<48;frame++){
  const base={build,frame,pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a'};
  const svg=ctx.window.REDAvatarRenderer.render({...base,cyberarm:'left',cyberleg:'right',eyes:'both'});
  assert.match(svg,/data-cyberarm-side="left"/);
  assert.doesNotMatch(svg,/data-cyberarm-side="right"/);
  assert.match(svg,/data-cyberleg-side="right"/);
  assert.doesNotMatch(svg,/data-cyberleg-side="left"/);
  assert.ok(!/NaN|undefined|Infinity/.test(svg),build+' frame '+frame);
  assert.equal(svg,ctx.window.REDAvatarRenderer.render({...base,cyberarm:'left',cyberleg:'right',eyes:'both'}));
  assert.equal(svg,ctx.window.REDAvatarRenderer.render({...base,frame:frame+48,cyberarm:'left',cyberleg:'right',eyes:'both'}));
 }
});

test('cyberlimb mechanical inset seams only appear on installed limbs',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'male-average',pose:'neutral',frame:0,face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',eyes:false};
 const organic=ctx.window.REDAvatarRenderer.render({...base,cyberarm:'none',cyberleg:'none'});
 const augmented=ctx.window.REDAvatarRenderer.render({...base,cyberarm:'right',cyberleg:'left'});
 assert.doesNotMatch(organic,/#122c3a|#162d3b/);
 assert.match(augmented,/#122c3a/);assert.match(augmented,/#162d3b/);
 assert.match(augmented,/data-cyberarm-side="right"/);assert.match(augmented,/data-cyberleg-side="left"/);
});

test('cyberlimb outer plate contours scale with rotation depth',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'male-athletic',pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',eyes:false,cyberarm:'left',cyberleg:'right'};
 const front=ctx.window.REDAvatarRenderer.render({...base,frame:0});
 const profile=ctx.window.REDAvatarRenderer.render({...base,frame:12});
 assert.match(front,/#d7eff5/);assert.match(front,/#d4edf3/);
 assert.match(profile,/#d7eff5/);assert.match(profile,/#d4edf3/);
 assert.notEqual(front,profile);
 for(const svg of [front,profile])assert.ok(!/NaN|undefined|Infinity/.test(svg));
});

test('far arm uses torso occlusion mask at profile angles',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'male-average',pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',eyes:false,cyberarm:'both',cyberleg:'none'};
 for(const frame of [6,12,18,30,36,42]){
  const svg=ctx.window.REDAvatarRenderer.render({...base,frame});
  assert.match(svg,/<mask id="far-arm-torso-mask"/);
  const groups=[...svg.matchAll(/<g data-arm-side="(left|right)" data-arm-depth="(near|far)"[^>]*>/g)];
  assert.equal(groups.length,2);
  assert.ok(groups.some(m=>m[2]==='far'&&m[0].includes('mask="url(#far-arm-torso-mask)"')));
  assert.ok(groups.some(m=>m[2]==='near'&&!m[0].includes('mask="url(#far-arm-torso-mask)"')));
 }
});

test('hip mask follows far leg while near leg stays unmasked',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const base={build:'female-athletic',pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',eyes:false,cyberarm:'none',cyberleg:'both'};
 for(const frame of [6,12,18,30,36,42]){
  const svg=ctx.window.REDAvatarRenderer.render({...base,frame});
  assert.match(svg,/<mask id="far-leg-hip-mask"/);
  const groups=[...svg.matchAll(/<g data-leg-depth="(near|far)" data-leg-side="(left|right)"[^>]*>/g)];
  assert.equal(groups.length,2);
  assert.ok(groups.some(m=>m[1]==='far'&&m[0].includes('mask="url(#far-leg-hip-mask)"')));
  assert.ok(groups.some(m=>m[1]==='near'&&!m[0].includes('mask="url(#far-leg-hip-mask)"')));
  assert.match(svg,/data-cyberleg-side="left"/);assert.match(svg,/data-cyberleg-side="right"/);
 }
});

test('combined arm and leg occlusion remains consistent across every build and frame',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const builds=['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic'];
 for(const build of builds)for(let frame=0;frame<48;frame++){
  const svg=ctx.window.REDAvatarRenderer.render({build,frame,pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',eyes:'both',cyberarm:'both',cyberleg:'both'});
  assert.match(svg,/<mask id="far-arm-torso-mask"/);
  assert.match(svg,/<mask id="far-leg-hip-mask"/);
  const arms=[...svg.matchAll(/<g data-arm-side="(left|right)" data-arm-depth="(near|far)"[^>]*>/g)];
  const legs=[...svg.matchAll(/<g data-leg-depth="(near|far)" data-leg-side="(left|right)"[^>]*>/g)];
  assert.equal(arms.length,2,build+' frame '+frame+' arms');
  assert.equal(legs.length,2,build+' frame '+frame+' legs');
  for(const groups of [arms,legs]){
   assert.equal(groups.filter(m=>m[0].includes('mask="url(#far-')).length,1);
   assert.equal(groups.filter(m=>m[0].includes('near')).length,1);
   assert.equal(groups.filter(m=>m[0].includes('far')).length,1);
  }
  assert.match(svg,/data-cyberarm-side="left"/);assert.match(svg,/data-cyberarm-side="right"/);
  assert.match(svg,/data-cyberleg-side="left"/);assert.match(svg,/data-cyberleg-side="right"/);
  assert.ok(!/NaN|undefined|Infinity/.test(svg),build+' frame '+frame);
 }
});

test('six body silhouettes retain distinct shoulder and hip geometry across rotation',()=>{
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/avatar-renderer.js','utf8'),ctx);
 const builds=['female-slim','female-average','female-athletic','male-slim','male-average','male-athletic'];
 const base={pose:'neutral',face:'standard',hair:'short',outfit:'street',skin:'#a9765d',hairColor:'#18222a',eyes:false,cyberarm:'none',cyberleg:'none'};
 for(const frame of [0,6,12,18,24,30,36,42]){
  const shoulderShapes=new Set(),hipRadii=new Set();
  for(const build of builds){
   const svg=ctx.window.REDAvatarRenderer.render({...base,build,frame});
   const shoulder=svg.match(/<mask id="far-arm-torso-mask"[^>]*>[\s\S]*?<path d="([^"]+)"/);
   const hip=svg.match(/<mask id="far-leg-hip-mask"[^>]*>[\s\S]*?<ellipse[^>]*rx="([^"]+)"/);
   assert.ok(shoulder,build+' frame '+frame+' shoulder');assert.ok(hip,build+' frame '+frame+' hip');
   shoulderShapes.add(shoulder[1]);hipRadii.add(hip[1]);
  }
  assert.equal(shoulderShapes.size,builds.length,'shoulder silhouettes frame '+frame);
  assert.ok(hipRadii.size>=4,'hip silhouettes frame '+frame);
 }
});
