const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),port=Number(process.env.PORT||8765);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.css':'text/css'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
 let file;
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep))throw Error();if(path.relative(root,file).split(path.sep).some(p=>p.startsWith('.')))throw Error();if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.statSync(file).isFile())throw Error();}
 catch{res.writeHead(404);res.end('Not found');return}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
 if(req.method==='HEAD'){res.end();return}
 fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
});
server.on('error',error=>{console.error('Could not start local server:',error.message);process.exitCode=1});
server.listen(port,'127.0.0.1',()=>console.log('Cyberpunk RED: http://127.0.0.1:'+port+'/avatar-creator.html'));
