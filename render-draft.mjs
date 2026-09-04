// Reuse the user's approved v3 style and scene library; never run model HTML.
import {readFile,writeFile} from 'node:fs/promises';
const [draftFile,templateFile,output]=process.argv.slice(2);
const draft=JSON.parse(await readFile(draftFile,'utf8'));
const template=await readFile(templateFile,'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sections=[...template.matchAll(/<section class="slide[\s\S]*?<\/section>/g)].map(m=>m[0]);
const scenes=sections.map(s=>s.match(/<figure[\s\S]*?<\/figure>/)?.[0]);
const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(draft.generatedAt));
const sourceTime=new Date(draft.sourceUpdatedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});
function layout(item){
  const t=item.text.toLowerCase();
  if(/product manager|designer|engineer/.test(t))return [1,'分工与协作'];
  if(/open.weight/.test(t))return [6,'开放权重'];
  if(/prompt cach|\bapi\b/.test(t))return [5,'产品上线进度'];
  if(/verify|verification|fact.check/.test(t))return [3,'核对与执行'];
  return [0,'AI 工作观察'];
}
const slides=draft.items.map((item,i)=>{
  const [scene,category]=layout(item);
  // Illustrations are explicitly explanatory, not evidence of product behavior.
  const figure=scenes[scene].replace(/<figcaption[\s\S]*?<\/figcaption>/,'<figcaption>场景示意 · 请以右侧本条摘要为准</figcaption>');
  const parts=item.summary.match(/[^。！？]+[。！？]?/g)||[item.summary];
  return `<section class="slide${i===0?' active':''}"><div class="paper"><div class="holes">${'<i></i>'.repeat(7)}</div><div class="mast reveal"><strong>${esc(category)} · 自动生成草稿</strong><span>${i+1} / ${draft.items.length}</span></div><h2 class="reveal" data-editable>${esc(item.name)} 的最新动态</h2><div class="story reveal"><div class="visual-column"><div class="quote" data-editable>${esc(category)}</div>${figure}</div><div class="analysis">${parts.map(p=>'<p data-editable>'+esc(p)+'</p>').join('')}<aside class="reading-note"><b>来源与阅读提示</b><p>原帖时间：${esc(item.createdAt)}。自动摘要可能存在误差；条件判断不代表已经发生，请点击原帖核对。</p></aside><div class="links"><a class="source" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">查看 ${esc(item.name)} 原帖 ↗</a></div></div></div><div class="page-tag">整理 ${day} · 中央源 ${esc(sourceTime)} 北京时间</div></div></section>`;
}).join('\n');
if(!slides||!sections.length)throw Error('Missing content/template');
const start=template.indexOf(sections[0]),end=template.indexOf(sections.at(-1))+sections.at(-1).length;
let html=template.slice(0,start).replaceAll('2026-09-04',day)+slides+template.slice(end).replaceAll('2026-09-04',day);
html=html.replace(/<title>.*?<\/title>/,'<title>AI 日报 · '+day+' · 自动生成草稿</title>');
await writeFile(output,html);
