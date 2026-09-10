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
function sceneType(item){
  const t=(item.text+' '+item.summary).toLowerCase();
  if(/attention|注意力|scroll|通知/.test(t))return 'attention';
  if(/internet|infrastructure|business model|user experience|互联网|基础设施|商业模式|用户体验/.test(t)&&/agents?|代理/.test(t))return 'agent-web';
  if(/watch|手表|wrist/.test(t)&&/voice|语音/.test(t))return 'watch-voice';
  if(/memory leak|内存泄漏|podcast|播客/.test(t))return 'research';
  if(/launch|release|roll.?out|available|上线|发布|开放/.test(t))return 'rollout';
  if(/faster|minute|second|效率|耗时|自动化/.test(t))return 'before-after';
  if(/football|球队|选秀|比赛/.test(t))return 'sports-ai';
  if(/open.?weight|开放权重/.test(t))return 'open-weights';
  if(/limit|quota|reset|allocation|额度|次数/.test(t))return 'quota';
  return 'explain';
}
const svgShell=(type,body)=>`<svg class="story-svg" data-scene="${type}" viewBox="0 0 900 420" role="img" aria-label="本条动态的情境插画">${body}</svg>`;
function sceneFigure(item){
  const [category]=visualType(item),type=sceneType(item);
  const head=`<rect class="paper-bg" x="5" y="5" width="890" height="410" rx="24"/><path class="ground" d="M70 350 C260 338 620 362 830 346"/>`;
  const person=`<g class="person"><circle cx="165" cy="170" r="43"/><path d="M112 300q8-88 53-88t55 88"/><path d="M143 166q22 18 44 0"/></g>`;
  const bot=(x,y,s=1)=>`<g class="bot" transform="translate(${x} ${y}) scale(${s})"><rect x="-34" y="-27" width="68" height="55" rx="15"/><path d="M0-27v-17m-8 0h16"/><circle cx="-13" cy="-5" r="5"/><circle cx="13" cy="-5" r="5"/><path d="M-13 13h26"/></g>`;
  let body,caption;
  if(type==='agent-web'){
    body=`${head}${person}<g class="laptop"><path d="M104 306h130l22 24H82z"/><rect x="111" y="245" width="116" height="65" rx="7"/></g><path class="flow" d="M260 262C355 245 410 230 492 218"/>${bot(365,236,.72)}${bot(455,205,.62)}${bot(530,185,.55)}<g class="web"><circle cx="695" cy="205" r="103"/><path d="M592 205h206M695 103c-57 55-57 149 0 205M695 103c57 55 57 149 0 205"/></g><g class="warning"><path d="M747 86l42 73h-84z"/><text x="747" y="140">!</text></g><text class="label" x="95" y="385">每个人都派出 AI 代理</text><text class="label accent" x="625" y="385">网站基础设施承压</text>`;
    caption='一眼看懂：大量个人 AI 代理进入互联网后，网站、产品体验和商业模式都要重新适应。';
  }else if(type==='attention'){
    body=`${head}${person}<g class="phone"><rect x="300" y="105" width="150" height="235" rx="24"/><circle cx="375" cy="312" r="9"/></g><g class="focus"><path d="M208 165L303 130L303 245L208 185z"/></g>${bot(535,125,.65)}${bot(610,195,.65)}${bot(535,270,.65)}<g class="pings"><circle cx="690" cy="115" r="26"/><circle cx="735" cy="190" r="33"/><circle cx="675" cy="270" r="24"/><text x="690" y="124">1</text><text x="735" y="200">9</text><text x="675" y="279">!</text></g><path class="shrink" d="M250 90h215m-170 28h125m-75 28h65"/><text class="label" x="95" y="385">人的注意力</text><text class="label accent" x="575" y="385">被更多代理和通知切碎</text>`;
    caption='一眼看懂：AI 代理带来更多自动行动和提醒，可能进一步争夺人的注意力。';
  }else if(type==='watch-voice'){
    body=`${head}<g class="arm"><path d="M70 270c130-10 205-8 315 18"/><path d="M75 330c135-9 220-4 315 16"/></g><g class="watch"><rect x="250" y="225" width="108" height="105" rx="25"/><circle cx="304" cy="277" r="35"/><path d="M304 261v28m-14-9q14 18 28 0"/></g><path class="flow" d="M370 250C470 175 560 150 650 165"/><g class="threads"><rect x="620" y="105" width="205" height="190" rx="22"/><path d="M660 155h120M660 198h95M660 241h130"/></g><g class="phone crossed"><rect x="475" y="270" width="70" height="115" rx="12"/><path d="M460 260l100 135"/></g><text class="label" x="225" y="385">对手表说话</text><text class="label accent" x="620" y="330">直接进入 Codex 线程</text>`;
    caption='一眼看懂：不拿手机，只对着手表说话，也能继续处理 Codex 里的任务。';
  }else if(type==='rollout'){
    body=`${head}<g class="product"><rect x="105" y="105" width="250" height="205" rx="22"/><path d="M145 155h170M145 205h130M145 255h155"/></g><g class="gate"><path d="M430 105v230M545 105v230M430 150h115M430 220h115"/><circle cx="487" cy="277" r="20"/></g><g class="crowd"><circle cx="665" cy="160" r="34"/><path d="M620 280q5-88 45-88t45 88"/><circle cx="775" cy="190" r="28"/><path d="M740 290q5-70 35-70t35 70"/></g><path class="flow" d="M355 210h67m132 0h70"/><text class="label" x="120" y="365">新产品</text><text class="label accent" x="420" y="385">分批开放，不是人人立刻可用</text>`;
    caption='一眼看懂：产品已经开始发布，但用户通常需要分批通过开放入口。';
  }else if(type==='before-after'){
    body=`${head}<g class="before"><circle cx="180" cy="145" r="38"/><path d="M125 275q8-90 55-90t55 90"/><rect x="85" y="285" width="205" height="50" rx="12"/><path d="M110 300h150M110 318h120"/><circle cx="275" cy="105" r="45"/><path d="M275 105l-8-27m8 27l25 8"/></g><path class="flow" d="M330 220h175"/><g class="after">${bot(625,185,1.15)}<path d="M575 285h105"/><path class="spark" d="M730 105l12 25 25 12-25 12-12 25-12-25-25-12 25-12z"/></g><text class="label" x="105" y="385">手动、耗时</text><text class="label accent" x="565" y="385">代理自动完成</text>`;
    caption='一眼看懂：原本需要人工反复操作的流程，被 AI 代理压缩成自动执行。';
  }else if(type==='research'){
    body=`${head}${person}<g class="report"><rect x="285" y="95" width="240" height="250" rx="18"/><path d="M325 145h155M325 190h120M325 235h165"/><circle cx="455" cy="290" r="24"/><path d="M470 306l35 34"/></g><path class="flow" d="M535 205h90"/>${bot(705,200,1)}<g class="bug"><circle cx="795" cy="100" r="28"/><path d="M775 80l40 40m0-40l-40 40"/></g><text class="label" x="125" y="385">检查报告</text><text class="label accent" x="620" y="385">AI 提示线索，再人工核对</text>`;
    caption='一眼看懂：AI 在阅读材料时给出线索，但作者仍需回到原始内容核对。';
  }else{
    body=`${head}${person}<g class="bubble"><path d="M285 85h430q35 0 35 35v145q0 35-35 35H470l-65 55 18-55H285q-35 0-35-35V120q0-35 35-35z"/><path d="M315 140h355M315 190h280M315 240h320"/></g><g class="lens"><circle cx="735" cy="315" r="48"/><path d="M770 350l55 45"/></g><text class="label" x="95" y="385">作者提出观点</text><text class="label accent" x="555" y="385">看原帖，分清事实与判断</text>`;
    caption='一眼看懂：这是作者提出的观点或观察，需要结合原帖判断它是事实、预测还是个人感受。';
  }
  return {category,html:`<figure class="visual-story">${svgShell(type,body)}<figcaption>${esc(caption)}</figcaption></figure>`};
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
  const {category,html:figure}=sceneFigure(item);
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
