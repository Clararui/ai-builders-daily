import {readFile} from 'node:fs/promises';
const expected=JSON.parse(await readFile('docs/published.json','utf8'));
const base='https://clararui.github.io/ai-builders-daily/';
let verified=false;
for(let attempt=0;attempt<30;attempt++){
  try{
    const r=await fetch(base+'published.json?t='+Date.now());
    const live=r.ok?await r.json():{};
    if(live.editionDate===expected.editionDate&&live.sourceUpdatedAt===expected.sourceUpdatedAt){
      const p=await fetch(base+'archive/'+expected.editionDate+'.html');
      if(p.ok&&(await p.text()).includes('name="edition-date" content="'+expected.editionDate+'"')){verified=true;break;}
    }
  }catch{}
  await new Promise(r=>setTimeout(r,10000));
}
if(!verified)throw Error('Public edition not verified; notification checker must not send');
console.log('Verified public archive and publication record: '+expected.editionDate);
