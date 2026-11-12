// Deploy only application files. Tests, development notes and local evidence stay out of Pages.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
fs.mkdirSync(dist,{recursive:true});
for(const name of fs.readdirSync(root))if(name.endsWith('.html')||name==='.nojekyll')fs.copyFileSync(path.join(root,name),path.join(dist,name));
for(const name of ['assets','vendor'])if(fs.existsSync(path.join(root,name)))fs.cpSync(path.join(root,name),path.join(dist,name),{recursive:true,filter:src=>!src.endsWith('-draft.png')&&!src.endsWith('-prompts.json')});
console.log('Application staged in dist');
