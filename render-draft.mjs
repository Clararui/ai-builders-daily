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
const sentences=s=>s.match(/[^。！？]+[。！？]?/g)?.map(x=>x.trim()).filter(Boolean)||[s];
const short=s=>s.replace(/[。！？]+$/,'').slice(0,46)+(s.replace(/[。！？]+$/,'').length>46?'…':'');
function visualType(item){
  const t=(item.text+' '+item.summary).toLowerCase();
  if(/limit|quota|reset|allocation|额度|次数/.test(t))return ['额度与权限','🎟️','谁能用、能用多少'];
  if(/eval|benchmark|test set|score|评测|测试集|得分/.test(t))return ['测试与比较','🧪','测试结果不等于所有场景'];
  if(/extens|plugin|skill|扩展|插件/.test(t))return ['能力扩展','🧩','从功能变化看实际用途'];
  if(/launch|release|roll.?out|available|上线|发布|开放/.test(t))return ['发布与可用性','🚦','发布不等于所有人立即可用'];
  if(/community|council|社区/.test(t))return ['真实使用场景','🏘️','工具怎样进入现实工作'];
  if(/open.?weight|开放权重/.test(t))return ['开放权重','🔓','观点、条件与事实要分开'];
  if(/codex|agent|workflow|自动|工作流/.test(t))return ['AI 工作方式','🤖','AI 在哪一步提供帮助'];
  return ['人物观点','💬','这是谁的判断，不是统一结论'];
}
function semanticFigure(item){
  const ss=sentences(item.summary),[category,icon,note]=visualType(item);
  const event=short(ss[0]||item.summary),impact=short(ss[1]||'这条动态主要体现作者的实际观察');
  return {category,html:`<figure class="meaning-map"><div class="meaning-question">${icon} 一眼看懂：这条动态在说什么？</div><div class="meaning-flow"><div class="meaning-card who"><small>谁</small><b>${esc(item.name)}</b></div><i aria-hidden="true">→</i><div class="meaning-card event"><small>发生了什么</small><b>${esc(event)}</b></div><i aria-hidden="true">→</i><div class="meaning-card impact"><small>带来的信息</small><b>${esc(impact)}</b></div></div><figcaption>${esc(note)}。点击右侧原帖可核对完整语境。</figcaption></figure>`};
}
function layout(item){
  const t=item.text.toLowerCase();
  if(/product manager/.test(t)&&/designer/.test(t))return [1,'分工与协作'];
  if(/open.weight/.test(t)&&/\bif\b/.test(t))return [6,'开放权重'];
  if(/\bapi\b/.test(t)&&/not.*yet/.test(t))return [5,'产品上线进度'];
  if(/verify|verification|fact.check/.test(t))return [3,'核对与执行'];
  return [0,'AI 工作观察'];
}
let slides=draft.items.map((item,i)=>{
  const {category,html:figure}=semanticFigure(item);
  const parts=item.summary.match(/[^。！？]+[。！？]?/g)||[item.summary];
  return `<section class="slide${i===0?' active':''}"><div class="paper"><div class="holes">${'<i></i>'.repeat(7)}</div><div class="mast reveal"><strong>${esc(category)} · 自动生成草稿</strong><span>${i+1} / ${draft.items.length}</span></div><h2 class="reveal" data-editable>${esc(item.name)} 的最新动态</h2><div class="story reveal"><div class="visual-column"><div class="quote" data-editable>${esc(category)}</div>${figure}</div><div class="analysis">${parts.map(p=>'<p data-editable>'+esc(p)+'</p>').join('')}<aside class="reading-note"><b>来源与阅读提示</b><p>原帖时间：${esc(item.createdAt)}。自动摘要可能存在误差；条件判断不代表已经发生，请点击原帖核对。</p></aside><div class="links"><a class="source" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">查看 ${esc(item.name)} 原帖 ↗</a></div></div></div><div class="page-tag">整理 ${day} · 中央源 ${esc(sourceTime)} 北京时间</div></div></section>`;
}).join('\n');
if(!slides&&draft.status==='no-updates')slides=`<section class="slide active"><div class="paper"><div class="holes">${'<i></i>'.repeat(7)}</div><div class="mast reveal"><strong>AI 工作观察 · 自动整理</strong><span>今日</span></div><h2 class="reveal">今日暂无新增动态</h2><div class="story reveal"><div class="analysis"><p>中央信息源本次更新后，没有发现尚未收录且符合筛选条件的新内容。</p><aside class="reading-note"><b>这不是生成失败</b><p>系统已经完成取数、去重和检查；有新动态时会在下一期自动收录。</p></aside><div class="links"><a class="source" href="../index.html">查看往期归档 ↗</a></div></div></div><div class="page-tag">整理 ${day} · 中央源 ${esc(sourceTime)} 北京时间</div></div></section>`;
if(!slides||!sections.length)throw Error('Missing content/template');
const start=template.indexOf(sections[0]),end=template.indexOf(sections.at(-1))+sections.at(-1).length;
let html=template.slice(0,start).replaceAll('2026-09-04',day)+slides+template.slice(end).replaceAll('2026-09-04',day);
html=html.replace(/<title>.*?<\/title>/,'<title>AI 日报 · '+day+' · 自动生成草稿</title>');
if(process.env.PUBLICATION==='true')html=html.replaceAll('自动生成草稿','自动整理');
await writeFile(output,readingLayout(html));
