const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const root='assets/avatar-art/terry/candidate-v1/';
test('all eight original Terry frames match supplied hashes and angle order',()=>{
 const m=JSON.parse(fs.readFileSync(root+'manifest.json'));
 assert.equal(m.frames.length,8);
 m.frames.forEach((f,i)=>{assert.equal(f.angle,i*45);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(root+f.image)).digest('hex'),f.sha256)});
 assert.ok(fs.existsSync(root+m.portrait));
});
test('candidate review script parses without changing production manifests',()=>{
 const html=fs.readFileSync('terry-art-review.html','utf8');
 new vm.Script(html.split('<script>')[1].split('</script>')[0]);
 assert.equal(fs.existsSync('assets/avatar-art/manifest.json'),false);
 assert.equal(fs.existsSync('assets/avatar-art/image-index.json'),false);
});
