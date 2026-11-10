const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const player=fs.readFileSync('index.html','utf8');
const cyber=fs.readFileSync('character-cyberware.html','utf8');
function inlineScripts(html){return [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean)}
test('inline browser JavaScript parses',()=>{for(const [name,html] of [['player',player],['cyberware',cyber]])for(const source of inlineScripts(html))assert.doesNotThrow(()=>new vm.Script(source,{filename:name+'.js'}))});
test('separate persistent namespaces are stable',()=>{assert.match(player,/cyberpunk-red-console-v1/);assert.match(cyber,/cyberpunk-red-character-v1/);assert.match(cyber,/cyberpunk-red-console-v1/)});
test('cyberware purchase reads latest player funds',()=>{assert.match(cyber,/if\(t\.dataset\.buy\)[\s\S]*?const p=playerData\(\)/);assert.match(cyber,/Number\(p\.eb\)<x\.price/);assert.doesNotMatch(cyber,/if\(!x\|\|state\.cash<x\.price\)return/)});
test('cyberware installation validates humanity before inventory mutation',()=>{const section=cyber.slice(cyber.indexOf("const input=prompt('Confirm installation"),cyber.indexOf('if(t.dataset.unload'));assert.ok(section.indexOf("Number(p.humanity)<loss")>=0);assert.ok(section.indexOf("Number(p.humanity)<loss")<section.indexOf("state.owned.splice(i,1)"))});
test('player roll refreshes stats before computing base',()=>{assert.match(player,/refreshSharedPlayer\(\);syncCyberware\(\);base=refreshedRollBase\(label,base\)/)});
test('cyberware backup import saves immediately',()=>{assert.match(cyber,/state\.conditions\|\|=\{\};save\(\);audit\('Imported cyberware backup/)});

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
