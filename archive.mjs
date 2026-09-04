// Prepare a static publication bundle. Upload this directory atomically via Pages.
// Never invoke on failed/unreviewed generation; this does not itself deploy anything.
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
export async function archiveEdition(root, {editionDate,sourceUpdatedAt,html}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(editionDate) || new Date(editionDate).toISOString().slice(0,10)!==editionDate) throw new Error('Invalid edition date');
  if (!Number.isFinite(Date.parse(sourceUpdatedAt))) throw new Error('Missing source timestamp');
  if (!html.includes('<html') || !html.includes('</html>') || !html.includes('class="slide')) throw new Error('Incomplete presentation');
  const marker='<meta name="edition-date" content="'+editionDate+'">';
  if (!html.includes(marker)) html=html.replace('</head>', marker+'\n</head>');
  if (!html.includes(marker)) throw new Error('No HTML head');
  await mkdir(join(root,'archive'),{recursive:true});
  const path=join(root,'archive',editionDate+'.html');
  let previous;
  try { previous=await readFile(path,'utf8'); } catch(e) { if(e.code!=='ENOENT')throw e; }
  if (previous && previous!==html) throw new Error('Existing edition is immutable; use a reviewed revision workflow');
  await writeFile(path,html);
  const dates=(await readdir(join(root,'archive'))).filter(x=>/^\d{4}-\d{2}-\d{2}\.html$/.test(x)).sort().reverse();
  if(dates[0]!==editionDate+'.html') throw new Error('Refuse to replace latest with an older edition');
  const index='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI 日报与往期</title><style>body{max-width:760px;margin:48px auto;padding:24px;background:#f8f4eb;color:#272924;font:20px/1.8 serif}a{color:#75482f}li{margin:16px 0}</style><h1>AI 圈今日信号</h1><p>最新一期：<a href="archive/'+dates[0]+'">'+editionDate+'</a></p><p>整理日期不等于原帖日期，请查看每期的数据更新时间。</p><h2>往期归档</h2><ul>'+dates.map(d=>'<li><a href="archive/'+d+'">'+d.slice(0,10)+'</a></li>').join('')+'</ul></html>';
  await writeFile(join(root,'index.html'),index);
  await writeFile(join(root,'published.json'),JSON.stringify({status:'published',editionDate,sourceUpdatedAt},null,2));
  return {editions:dates.length};
}
