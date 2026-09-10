// Keep source content and existing illustrations; replace the presentation shell.
export function readingLayout(html){
 if(html.includes('id="reading-layout"'))return html;
 const sections=[...html.matchAll(/<section class="slide[\s\S]*?<\/section>/g)].map((m,i)=>m[0].replace(/<section class="[^"]*"[^>]*>/,`<section class="slide" id="slide-${i+1}">`).replaceAll('右侧本条摘要','本条摘要'));
 if(!sections.length)throw Error('No readable sections');
 const head=html.slice(0,html.indexOf('</head>'));
 return head+`<style id="reading-layout">
 html,body{width:100%;height:auto;overflow:visible;background:#f8f4eb;color:#252720;scroll-behavior:smooth}
 body{margin:0;font-family:system-ui,-apple-system,"Noto Sans SC",sans-serif}
 *,*::before,*::after{box-sizing:border-box}
 .reading-header{max-width:1100px;margin:auto;padding:24px 28px;display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #d9d4c8;font-size:15px}
 .reading-header a{color:#315c49;text-decoration:none;padding:6px 0}
 main{max-width:1100px;margin:auto;padding:0 28px}
 .slide,.slide.active,.slide.visible{position:relative;inset:auto;width:100%;height:auto;min-height:0;display:block;visibility:visible;opacity:1;pointer-events:auto;overflow:visible;background:transparent;padding:44px 0;border-bottom:1px solid #cfc8b9;scroll-margin-top:16px}
 .paper{position:relative;inset:auto;padding:0;overflow:visible;box-shadow:none;background:transparent;width:auto;height:auto}
 .paper::before,.holes,.tabs{display:none}
 .reveal{opacity:1;transform:none;transition:none}
 .mast{font:500 14px/1.5 system-ui;letter-spacing:0;border:0;padding:0;color:#637267;gap:16px}
 .mast span{white-space:nowrap}
 h2{font:750 clamp(28px,4vw,42px)/1.3 system-ui;letter-spacing:-.025em;margin:16px 0 24px;max-width:900px}
 .story{display:block;margin:0}
 .story>*{min-width:0}
 .visual-column{width:100%;margin-bottom:30px}
 .quote{font:650 20px/1.6 system-ui;border-left:3px solid #8aa990;padding-left:14px;margin:0 0 18px}
 .explainer,.comic{margin:0;padding:12px;background:#efeade;border:0;border-radius:12px;width:100%;height:auto;min-height:0}
 .explainer svg,.comic svg{display:block;width:100%;height:auto;max-height:none}
 .explainer figcaption,.comic figcaption{font:500 15px/1.65 system-ui;margin:8px 0 0}
 .scene-note{font:400 12px/1.6 system-ui;margin:8px 0 0;color:#777}
 .visual-story{margin:0;padding:14px;background:#f2eee5;border:1px solid #d3ccbd;border-radius:18px;overflow:hidden}
 .story-svg{display:block;width:100%;height:auto;max-height:470px}
 .story-svg .paper-bg{fill:#f5f0e8;stroke:#1f211d;stroke-width:2}
 .story-svg .ground,.story-svg .flow,.story-svg .shrink{fill:none;stroke:#718878;stroke-width:6;stroke-linecap:round;stroke-dasharray:12 12}
 .story-svg .flow{animation:dash 2.4s linear infinite}
 .story-svg .person circle,.story-svg .person path,.story-svg .bot rect,.story-svg .bot path,.story-svg .bot circle,.story-svg .laptop path,.story-svg .laptop rect,.story-svg .web circle,.story-svg .web path,.story-svg .phone rect,.story-svg .phone circle,.story-svg .arm path,.story-svg .watch rect,.story-svg .watch circle,.story-svg .watch path,.story-svg .threads rect,.story-svg .threads path,.story-svg .product rect,.story-svg .product path,.story-svg .gate path,.story-svg .gate circle,.story-svg .crowd circle,.story-svg .crowd path,.story-svg .before circle,.story-svg .before path,.story-svg .before rect,.story-svg .after path,.story-svg .report rect,.story-svg .report path,.story-svg .report circle,.story-svg .bubble path,.story-svg .lens circle,.story-svg .lens path{fill:#fff;stroke:#242620;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
 .story-svg .bot{animation:float 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.story-svg .bot:nth-of-type(2){animation-delay:.35s}.story-svg .bot:nth-of-type(3){animation-delay:.7s}
 .story-svg .warning path{fill:#ef6a5b;stroke:#242620;stroke-width:5}.story-svg .warning text,.story-svg .pings text{font:800 32px system-ui;text-anchor:middle;fill:#242620}
 .story-svg .focus{fill:#ffe29a;stroke:#242620;stroke-width:4;opacity:.8}.story-svg .pings circle{fill:#ef6a5b;stroke:#242620;stroke-width:4}.story-svg .pings{animation:pulse 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
 .story-svg .crossed path{fill:none;stroke:#ef6a5b;stroke-width:9}.story-svg .spark{fill:#f7c95c!important;animation:pulse 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.story-svg .bug circle{fill:#ef6a5b;stroke:#242620;stroke-width:4}.story-svg .bug path{stroke:#fff;stroke-width:6}
 .story-svg .label{font:650 19px system-ui;fill:#343831}.story-svg .label.accent{fill:#315c49}
 .visual-story figcaption{font:650 17px/1.7 system-ui;color:#28352d;padding:10px 8px 4px}
 @keyframes dash{to{stroke-dashoffset:-48}}@keyframes float{50%{translate:0 -8px}}@keyframes pulse{50%{scale:1.08}}
 @media(prefers-reduced-motion:reduce){.story-svg *{animation:none!important}}
 .meaning-map{margin:0;padding:20px;background:#eef0e7;border:1px solid #ccd2c5;border-radius:14px}
 .meaning-question{font-size:17px;font-weight:750;margin-bottom:18px;color:#28352d}
 .meaning-flow{display:grid;grid-template-columns:minmax(120px,.65fr) 28px minmax(260px,1.65fr) 28px minmax(260px,1.35fr);align-items:stretch;gap:10px}.meaning-flow>i{align-self:center;justify-self:center;font-style:normal;font-size:22px;color:#789080}
 .meaning-card{min-width:0;padding:16px;background:#fffdf7;border-top:4px solid #94ad9b;border-radius:8px;overflow-wrap:break-word;word-break:normal}
 .meaning-card.event{border-color:#e1a45f}.meaning-card.impact{border-color:#87a7cf}
 .meaning-card small{display:block;font-size:12px;color:#72786f;margin-bottom:7px}.meaning-card b{font-size:16px;line-height:1.65}
 .meaning-map figcaption{font-size:13px;line-height:1.65;color:#687168;margin-top:14px}
 .analysis{font:400 18px/1.9 system-ui;color:#333a33;overflow-wrap:anywhere}
 .analysis p{font-size:inherit;line-height:inherit;margin:0 0 18px}.analysis p+p{margin-top:0}
 .reading-note{padding:18px;margin:24px 0 0;border:0;border-left:3px solid #8aa990;background:#edeedf;font-size:16px;line-height:1.8}
 .reading-note p{font-size:16px;margin:8px 0 0}
 .links{gap:12px;margin-top:22px}.source{font:600 15px/1.6 system-ui;padding:10px 14px;border:1px solid #ccd4c9;border-radius:8px;color:#315c49;background:#f7faf3;max-width:100%;overflow-wrap:anywhere}
 .page-tag{position:static;font:400 12px/1.7 system-ui;margin-top:24px;color:#777;overflow-wrap:anywhere}
 .reading-footer{max-width:1100px;margin:auto;padding:32px 28px 56px;font-size:14px}.reading-footer a{color:#315c49}
 @media(max-width:1000px){.meaning-flow{display:grid;grid-template-columns:1fr}.meaning-flow>i{transform:rotate(90deg);justify-self:center;height:20px}.meaning-card b{font-size:16px}}
 @media(max-width:700px){.reading-header{padding:16px 20px}main{padding:0 20px}.slide{padding:30px 0 36px}.story{display:flex;flex-direction:column;gap:24px}h2{font-size:29px;margin:14px 0 22px}.quote{font-size:18px}.analysis{font-size:18px;line-height:1.9}.explainer{padding:10px}.page-tag{margin-top:22px}}
 @media print{html,body{width:auto;height:auto}.slide{width:auto;height:auto;break-after:auto}.reading-header,.reading-footer{display:none}}
 </style></head><body><header class="reading-header"><strong>AI Builders 日报</strong><a href="../index.html">往期归档 ↗</a></header><main>${sections.join('\n')}</main><footer class="reading-footer"><a href="../index.html">浏览全部往期 →</a></footer></body></html>`;
}
