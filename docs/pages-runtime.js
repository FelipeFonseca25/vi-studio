/* Compatibilidade estática do gerador, sem backend. */
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
})();
