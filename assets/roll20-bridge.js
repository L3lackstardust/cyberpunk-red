(function(root){'use strict';
const SKILLS=[['Athletics','DEX'],['Brawling','DEX'],['Evasion','DEX'],['Stealth','DEX'],['Handgun','REF'],['Shoulder Arms','REF'],['Autofire','REF'],['Melee Weapon','DEX'],['Perception','INT'],['Concentration','WILL'],['Conversation','EMP'],['Human Perception','EMP'],['Persuasion','COOL'],['Interrogation','COOL'],['Basic Tech','TECH'],['First Aid','TECH'],['Electronics/Security Tech','TECH'],['Cybertech','TECH'],['Drive Land Vehicle','REF'],['Streetwise','COOL'],['Local Expert','INT'],['Education','INT'],['Library Search','INT'],['Resist Torture/Drugs','WILL'],['Tactics','INT']];
const num=v=>Number.isFinite(Number(v))?Math.trunc(Number(v)):0;
function skillRows(c){return SKILLS.map(([name,stat])=>({name,stat,statValue:num(c&&c.stats&&c.stats[stat]),level:num(c&&c.skills&&c.skills[name])}));}
function chatCommand(statValue,level,modifier){const total=num(statValue)+num(level)+num(modifier);return '/roll 1d10'+(total>=0?'+':'')+total;}
function exportSummary(c){c=c||{};return {name:String(c.name||c.handle||''),role:String(c.role||''),stats:c.stats||{},skills:skillRows(c).map(x=>({name:x.name,stat:x.stat,level:x.level,total:x.statValue+x.level})),hp:num(c.hp),humanity:num(c.humanity),bodySP:num(c.bodySP),headSP:num(c.headSP)};}
root.REDRoll20Bridge={SKILLS,skillRows,chatCommand,exportSummary};
})(typeof window!=='undefined'?window:globalThis);
