import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const source=path.join(root,'public');
const target=path.join(root,'docs');
const base='/vi-studio/';
const normal='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const custom='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
const decode=value=>Buffer.from([...value].map(c=>custom.includes(c)?normal[custom.indexOf(c)]:c).join(''),'base64').toString('utf8');
const encode=value=>[...Buffer.from(value).toString('base64')].map(c=>normal.includes(c)?custom[normal.indexOf(c)]:c).join('');

function copy(dir,prefix='') {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const relative=prefix+entry.name;
    const dest=path.join(target,relative);
    if(entry.isDirectory()){fs.mkdirSync(dest,{recursive:true});copy(path.join(dir,entry.name),relative+'/');continue;}
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    if(!/\.(?:html|css|js|webmanifest)$/.test(relative)){fs.copyFileSync(path.join(dir,entry.name),dest);continue;}
    let text=fs.readFileSync(path.join(dir,entry.name),'utf8');
    if(relative==='index.html') {
      text=text.replace('<head>','<head><script src="'+base+'pages-runtime.js"></script>');
      text=text.replace('<script src="/local-runtime.js"></script>','');
    }
    text=text.replaceAll('/_next/',base+'_next/').replaceAll('/backgrounds/',base+'backgrounds/');
    if(relative.endsWith('8c72c0efb9393301.js')) {
      const index=text.indexOf('];a=function');
      if(index<0)throw Error('Tabela de caminhos do gerador não encontrada');
      const table=text.slice(0,index).replace(/'([^']*)'/g,(match,value)=>{
        try {const decoded=decode(value);return decoded.startsWith('/backgrounds/')?"'"+encode(base+decoded.slice(1))+"'":match;}catch{return match;}
      });
      text=table+text.slice(index);
    }
    text=text.replaceAll('3a4831f05b16ee55/script.js',base+'telemetry-disabled.js').replaceAll('51742b4498e60729/script.js',base+'telemetry-disabled.js').replaceAll('/_vercel/insights/script.js',base+'telemetry-disabled.js').replaceAll('/_vercel/speed-insights/script.js',base+'telemetry-disabled.js');
    if(relative==='index.html')text=text.replaceAll('href="/custom.css"','href="'+base+'custom.css"').replaceAll('href="/manifest.webmanifest"','href="'+base+'manifest.webmanifest"').replaceAll('href="/favicon.ico','href="'+base+'favicon.ico').replaceAll('href="/icon.png','href="'+base+'icon.png').replaceAll('href="/apple-icon.png','href="'+base+'apple-icon.png');
    if(relative==='manifest.webmanifest'){const manifest=JSON.parse(text);manifest.start_url=base;manifest.icons=manifest.icons.map(icon=>({...icon,src:base+icon.src.replace(/^\//,'')}));text=JSON.stringify(manifest);}
    fs.writeFileSync(dest,text);
  }
}
fs.mkdirSync(target,{recursive:true});copy(source);
fs.writeFileSync(path.join(target,'.nojekyll'),'');
fs.writeFileSync(path.join(target,'telemetry-disabled.js'),'/* Telemetria desativada. */\n');
fs.writeFileSync(path.join(target,'pages-runtime.js'),`/* Compatibilidade estática do gerador, sem backend. */
(()=>{
  const originalFetch=window.fetch.bind(window);
  window.fetch=async(input,init)=>{
    const raw=typeof input==='string'?input:input.url;
    const url=new URL(raw,location.href);
    if(url.origin===location.origin&&url.pathname.endsWith('/api/check-text')){
      let data;
      try{data=JSON.parse(init?.body??(input instanceof Request?await input.clone().text():'{}'));}catch{return new Response('{}',{status:400});}
      if(typeof data.text!=='string')return new Response('{}',{status:400});
      const normalized=data.text.toLowerCase().replace(/[^a-z0-9!@|]+/g,'');
      const allowed=![/n[i1!|]gg+[e3]r/,/n[i1!|]gg+[a@]h?/].some(pattern=>pattern.test(normalized));
      return new Response(JSON.stringify({allowed}),{headers:{'Content-Type':'application/json'}});
    }
    if(url.pathname.endsWith('/api/feedback'))return new Response(JSON.stringify({error:'Feedback indisponível.'}),{status:503,headers:{'Content-Type':'application/json'}});
    return originalFetch(input,init);
  };
})();\n`);
console.log('GitHub Pages: docs/ pronto em '+base);
