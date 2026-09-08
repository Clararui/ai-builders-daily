// Build in a staging directory. Deployment is a separate, explicitly enabled step.
import {readFile,writeFile,cp,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {archiveEdition} from './archive.mjs';
import {cleanSummary,selectItems} from './generation-policy.mjs';
export async function buildPublication({draft,html,existing,staging,now=new Date()}) {
  const day=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  const editionDate=day(new Date(draft.generatedAt));
  if(editionDate!==day(now))throw Error('Draft is not from today');
  if(!Array.isArray(draft.items)||(!draft.items.length&&draft.status!=='no-updates'))throw Error('No valid items');
  selectItems({stats:{feedGeneratedAt:draft.sourceUpdatedAt},x:[]},now);
  for(const item of draft.items)cleanSummary(item.summary,item.text);
  try {await access(join(existing,'archive',editionDate+'.html'));return {skipped:true,reason:'Edition already exists'};}catch(e){if(e.code!=='ENOENT')throw e;}
  if(resolve(existing)===resolve(staging))throw Error('Staging must be separate');
  await mkdir(staging,{recursive:true});await cp(existing,staging,{recursive:true});
  await archiveEdition(staging,{editionDate,sourceUpdatedAt:draft.sourceUpdatedAt,html});
  let previous=[];try{previous=JSON.parse(await readFile(join(existing,'source-urls.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  await writeFile(join(staging,'source-urls.json'),JSON.stringify([...new Set([...previous,...draft.items.map(i=>i.url)])].slice(-1000),null,2));
  return {skipped:false,editionDate};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
  const [draftFile,htmlFile,existing,staging]=process.argv.slice(2);
  console.log(JSON.stringify(await buildPublication({draft:JSON.parse(await readFile(draftFile,'utf8')),html:await readFile(htmlFile,'utf8'),existing,staging})));
}
