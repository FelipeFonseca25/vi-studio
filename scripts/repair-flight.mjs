/* Atualiza comprimentos de blocos de texto após editar metadados HTML. */
export function repairFlightTextLengths(html) {
  const frames=[...html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)].map(match=>({match,data:JSON.parse(match[1])}));
  for(let i=0;i<frames.length-1;i++) {
    const current=frames[i].data,next=frames[i+1].data;
    if(current[0]!==1||typeof current[1]!=='string'||!/:T[0-9a-f]+,$/.test(current[1])||next[0]!==1||typeof next[1]!=='string')continue;
    current[1]=current[1].replace(/:T[0-9a-f]+,$/,':T'+Buffer.byteLength(next[1],'utf8').toString(16)+',');
    const before=frames[i].match[0],after='self.__next_f.push('+JSON.stringify(current)+')</script>';
    html=html.replace(before,after);
  }
  return html;
}
