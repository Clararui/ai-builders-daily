// Reuse the user's approved v3 style and scene library; never run model HTML.
import {readFile,writeFile} from 'node:fs/promises';
import {readingLayout} from './reading-layout.mjs';
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
  if(/product manager/.test(t)&&/designer/.test(t))return [1,'分工与协作'];
  if(/open.weight/.test(t)&&/\bif\b/.test(t))return [6,'开放权重'];
  if(/\bapi\b/.test(t)&&/not.*yet/.test(t))return [5,'产品上线进度'];
  if(/verify|verification|fact.check/.test(t))return [3,'核对与执行'];
  return [0,'AI 工作观察'];
}
const slides=draft.items.map((item,i)=>{
  const [scene,category]=layout(item);
  // Illustrations are explicitly explanatory, not evidence of product behavior.
  let figure=scenes[scene].replace(/<figcaption[\s\S]*?<\/figcaption>/,'<figcaption>场景示意 · 请以右侧本条摘要为准</figcaption>');
  if(scene===0){
    let labels=['作者有什么新观察？','阅读动态','原帖出处','观点与事实分开看'];
    if(/influencer/i.test(item.text))labels=['大家都能用了吗？','实际体验','访问权限','宣传与可用性是两回事'];
    else if(/banked reset|usage allocation|Fable limits/i.test(item.text))labels=['额度具体怎么用？','使用额度','适用规则','注意适用范围与时间'];
    else if(/extensible/i.test(item.text))labels=['还能接入什么能力？','Claude Code','扩展能力','这是早期探索'];
    else if(/community/i.test(item.text))labels=['用工具服务社区','Replit','社区应用','作者分享的使用案例'];
    else if(/eval|test set/i.test(item.text))labels=['复杂任务做得怎样？','任务测试','作者评测','留意测试范围'];
    else if(/launch|roll.out/i.test(item.text))labels=['新能力何时能用？','新模型','平台接入','关注上线进展'];
    ['今天 AI 又能帮什么？','开始工作','资料核对','做事，也检查'].forEach((old,n)=>figure=figure.replaceAll(old,labels[n]));
  }
  const parts=item.summary.match(/[^。！？]+[。！？]?/g)||[item.summary];
  return `<section class="slide${i===0?' active':''}"><div class="paper"><div class="holes">${'<i></i>'.repeat(7)}</div><div class="mast reveal"><strong>${esc(category)} · 自动生成草稿</strong><span>${i+1} / ${draft.items.length}</span></div><h2 class="reveal" data-editable>${esc(item.name)} 的最新动态</h2><div class="story reveal"><div class="visual-column"><div class="quote" data-editable>${esc(category)}</div>${figure}</div><div class="analysis">${parts.map(p=>'<p data-editable>'+esc(p)+'</p>').join('')}<aside class="reading-note"><b>来源与阅读提示</b><p>原帖时间：${esc(item.createdAt)}。自动摘要可能存在误差；条件判断不代表已经发生，请点击原帖核对。</p></aside><div class="links"><a class="source" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">查看 ${esc(item.name)} 原帖 ↗</a></div></div></div><div class="page-tag">整理 ${day} · 中央源 ${esc(sourceTime)} 北京时间</div></div></section>`;
}).join('\n');
if(!slides||!sections.length)throw Error('Missing content/template');
const start=template.indexOf(sections[0]),end=template.indexOf(sections.at(-1))+sections.at(-1).length;
let html=template.slice(0,start).replaceAll('2026-09-04',day)+slides+template.slice(end).replaceAll('2026-09-04',day);
html=html.replace(/<title>.*?<\/title>/,'<title>AI 日报 · '+day+' · 自动生成草稿</title>');
if(process.env.PUBLICATION==='true')html=html.replaceAll('自动生成草稿','自动整理');
await writeFile(output,readingLayout(html));
