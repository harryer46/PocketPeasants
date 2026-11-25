// ===== question context: many questions do not name the norm they are about ("Für wie lange darf … höchstens …?").
// Wherever a question is shown, a small "📘 Thema" line names its norm (the monster's paragraph, or the law book for
// general questions) – unless the question itself or the box around it already names it.
const Q_NORM_RE=/§|Art\.|Artikel|\b[A-ZÄÖÜ][A-Za-zÄÖÜäöü]{1,9}(?:G|O|VO|V)\b|StGB|StPO|PolG|\bGG\b|Grundgesetz|OWiG|BtMG|StVO|StVG|ZollVG|\bAO\b|KCanG|BGB|VwVfG|LVwVG|Polizeigesetz|Strafprozess|Strafgesetz|VersG|AufenthG|PassG|PAuswG|WaffG/;
const Q_BOOK_NAME={StGB:'Strafgesetzbuch (StGB)',StPO:'Strafprozessordnung (StPO)',PolG:'Polizeigesetz Baden-Württemberg (PolG)',GG:'Grundgesetz (GG)',OWiG:'Ordnungswidrigkeitengesetz (OWiG)',StVO:'Straßenverkehrs-Ordnung (StVO)',BtMG:'Betäubungsmittelgesetz (BtMG)'};
let QCTX=null;
function qCtxMap(){if(QCTX)return QCTX;QCTX=new Map();
  for(const b in (typeof VAULT_BOOK!=='undefined'?VAULT_BOOK:{}))for(const q of VAULT_BOOK[b])if(!Q_NORM_RE.test(q[0]))QCTX.set(q[0],{t:Q_BOOK_NAME[b]||b,k:b});
  for(const s in QZ){const sp=SPECIES[s];if(!sp||!sp.law)continue;const L=sp.law.replace(/ PolG\b/,' PolG BW');for(const q of QZ[s])if(!Q_NORM_RE.test(q[0])&&!QCTX.has(q[0]))QCTX.set(q[0],{t:L,k:sp.law.split(' · ')[0]})}
  if(typeof STVO_QZ!=='undefined')for(const q of STVO_QZ)if(!Q_NORM_RE.test(q[0]))QCTX.set(q[0],{t:Q_BOOK_NAME.StVO,k:'StVO'});
  return QCTX}
function qCtxScan(root){const M=qCtxMap();const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const hits=[];let n;
  while((n=w.nextNode())){const t=n.nodeValue.trim();if(t.length<12)continue;const c=M.get(t);if(c)hits.push([n,c])}
  for(const[n,c]of hits){const box=n.parentElement;if(!box||box.querySelector(':scope > .qctx'))continue;
    const hd=(box.closest('.sdlg,#sleepq,#qqbox')||box).textContent;if(c.k.length<6?new RegExp('\\b'+c.k+'\\b').test(hd):hd.includes(c.k))continue;   // the header already names it
    const d=document.createElement('div');d.className='qctx';d.textContent='📘 Thema: '+c.t;box.insertBefore(d,n)}}
{let pend=0;const run=()=>{pend=0;for(const sel of['#cquiz','#study','#mbox','#sleepq'])for(const el of document.querySelectorAll(sel))try{qCtxScan(el)}catch(e){}};
 const mo=new MutationObserver(()=>{if(!pend){pend=1;requestAnimationFrame(run)}});mo.observe(document.body,{childList:true,subtree:true})}
(function(){const st=document.createElement('style');st.textContent=`.qctx{font-family:VT323,monospace;font-size:15px;color:#9aa1bd;margin:2px 0 3px;line-height:1.05}#sleepq .qctx{font-size:13px;color:#b8bdd6}`;document.head.appendChild(st)})();
