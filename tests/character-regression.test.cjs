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
