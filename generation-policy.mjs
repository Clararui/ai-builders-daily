// Deterministic selection; source text is untrusted data, never executable code.
export function selectItems(feed, now=new Date(),previousUrls=[]) {
  const updated=Date.parse(feed.stats?.feedGeneratedAt);
  if(!Number.isFinite(updated)||updated>+now+300000||+now-updated>72*3600000) throw Error('数据源过期或缺少更新时间，不发布');
  const seen=new Set(previousUrls),items=[];
  for(const a of [...(feed.x||[])].sort((a,b)=>Number(b.handle==='petergyang')-Number(a.handle==='petergyang'))) {
    for(const t of a.tweets||[]) {
      let u;try{u=new URL(t.url);}catch{continue;}
      const date=Date.parse(t.createdAt);
      if(!['x.com','twitter.com'].includes(u.hostname)||!/^\/[^/]+\/status\/\d+$/.test(u.pathname)||seen.has(t.url))continue;
      if(!Number.isFinite(date)||date>+now+300000||+now-date>72*3600000)continue;
      if(typeof t.text!=='string'||t.text.trim().length<100)continue;
      if(!/\b(AI|LLM|GPT|model|agents?|Codex|Claude|Replit|Astra|machine learning|open.weight)\b/i.test(t.text))continue;
      seen.add(t.url);items.push({name:a.name||a.handle,handle:a.handle,url:t.url,text:t.text,createdAt:t.createdAt});
    }
  }
  return {sourceUpdatedAt:new Date(updated).toISOString(),items:items.slice(0,12)};
}
export function cleanSummary(raw,source) {
  const text=raw.replace(/\[end of text\]\s*$/,'').replace(/\binfluencers?\b/gi,'博主').trim();
  if(text.length<15||text.length>500||/[<>]|https?:\/\//.test(text)||(text.match(/[\u3400-\u9fff]/g)||[]).length<12)throw Error('摘要格式不合格');
  if(/\bif\b/i.test(source)&&!/[如若倘]|假设/.test(text))throw Error('摘要丢失条件语气');
  if(/\b(not yet|isn.t.*yet)\b/i.test(source)&&!/[未没]|还不/.test(text))throw Error('摘要丢失未上线限制');
  if(/banked reset/i.test(source)&&(/银行/.test(text)||!/付费/.test(text)))throw Error('额度重置译法或付费用户范围不准确');
  return text;
}
