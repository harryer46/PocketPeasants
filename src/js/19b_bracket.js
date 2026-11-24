/* ===================== GERICHT: JEDER GEGEN JEDEN MIT TURNIERBAUM =====================
   - Reihenfolge wird ausgelost (aus der Lobby-ID abgeleitet → auf allen Geräten gleich).
   - Jeder kämpft einmal gegen jeden. Runde 1 nach Los; danach Sieger gegen Sieger, Verlierer gegen Verlierer,
     nur Gegner, gegen die man noch nicht gekämpft hat. Bei ungerader Zahl bekommt reihum der Schwächste ein Freilos.
     Beispiel 3 Spieler: A–B, Sieger gegen C, dann die beiden Verlierer.
   - Darstellung als Turnierbaum (Spalten = Runden, Kästen = Kämpfe), Bereit-Knöpfe direkt am eigenen Kampf,
     Zuschauen bei laufenden Kämpfen. Start eines Kampfes, wenn beide bereit sind (nach 90 s automatisch, damit niemand blockiert). */
const RDY_MS=90000;
function drawRank(peer){return hashStr(String(RUN&&RUN.id)+'|'+peer)}
// tiebreak by the draw instead of the peer id
standings=function(parts,upto){
  const sc={},bh={};for(const p of parts)sc[p.peer]=p.res.filter(x=>x[0]<upto).reduce((a,x)=>a+(x[1]==='bye'?0:x[2]),0);
  for(const p of parts)bh[p.peer]=p.res.filter(x=>x[0]<upto&&x[1]!=='bot'&&x[1]!=='bye').reduce((a,x)=>a+(sc[x[1]]||0),0);
  return parts.slice().sort((a,b)=>sc[b.peer]-sc[a.peer]||bh[b.peer]-bh[a.peer]||drawRank(a.peer)-drawRank(b.peer)).map(p=>Object.assign({},p,{score:sc[p.peer],bh:bh[p.peer]}))};
function rrRounds(n){return n<2?1:n%2?n:n-1}
roundsOf=function(){if(RUN&&RUN.R)return RUN.R;let n=2;try{n=participants().length}catch(e){}const rr=rrRounds(n),c=cfgOf().rounds;return c?Math.min(c,rr):rr};
// pairing: score groups (winners vs winners), never a rematch if any complete pairing without one exists
pairRound=function(parts,r){const list=standings(parts,r),pairs=[];if(!list.length)return pairs;
  const played=(a,b)=>a.res.some(x=>x[0]<r&&x[1]===b.peer)||b.res.some(x=>x[0]<r&&x[1]===a.peer);
  const hadBye=p=>p.res.some(x=>x[0]<r&&x[1]==='bye');const byeCands=list.length%2?list.map((p,i)=>i).reverse().sort((i,j)=>(hadBye(list[i])?1:0)-(hadBye(list[j])?1:0)):[-1];
  const solve=(rest,allowRe)=>{if(!rest.length)return[];const p=rest[0];const cand=rest.slice(1).map((q,k)=>({q,k,d:Math.abs(p.score-q.score)})).sort((a,b)=>a.d-b.d||a.k-b.k);
    for(const{q}of cand){if(!allowRe&&played(p,q))continue;const sub=solve(rest.filter(x=>x!==p&&x!==q),allowRe);if(sub)return[[p.peer,q.peer]].concat(sub)}return null};
  for(const allowRe of[false,true])for(const bi of byeCands){const rest=list.filter((p,i)=>i!==bi);const m=solve(rest,allowRe);if(m)return(bi>=0?[[list[bi].peer,'bye']]:[]).concat(m)}
  return pairs};
// who belongs to round r (also those whose fight in r is already over)
function inRound(parts,r){return parts.filter(p=>p.res.some(x=>x[0]===r)||(p.r>=r&&p.st!=='done'&&!['pick','train','lobby'].includes(p.st)))}
function roundKnown(parts,r){if(r===1)return!parts.some(p=>['pick','train','lobby'].includes(p.st));const prev=inRound(parts,r-1);return prev.length>0&&prev.every(p=>p.res.some(x=>x[0]===r-1)||p.st==='done')}
function duelIdOf(r,a,b){return RUN.id+'-'+r+'-'+[a,b].sort().join('-')}
readyRoom=function(){return false};
arenaTick=function(){
  if(!RUN||RUN.free||RUN.phase!=='arena')return;
  if(!B)showArena();
  try{specAuto()}catch(e){}
  if((B&&B.mode!=='spec')||RUN.st!=='wait')return;
  const parts=participants();
  const late=Date.now()>RUN.end+45000;
  if(!late&&parts.some(p=>p.st==='train'||p.st==='pick'||p.st==='lobby'))return;
  if(RUN.r===1&&!(RUN.res||[]).length&&Date.now()<RUN.end&&!(parts.length>1))return;
  if(parts.length<2&&RUN.r===1&&!(RUN.res||[]).length){RUN.st='done';RUN.solo=1;save();pushMt();$('#abox').dataset.h='';showArena();return}
  const decided=p=>{if(!parts.some(q=>q.res.some(x=>x[0]===p.r&&x[1]===p.peer)))return false;const k=p.peer+':'+p.r;if(!DECT.has(k))DECT.set(k,Date.now());return Date.now()-DECT.get(k)>20000};
  if(parts.some(p=>p.st!=='done'&&p.r<RUN.r&&p.r>0&&!decided(p)&&!peerStale(p,150000)))return;
  const me=MYPEER||'me';const pr=pairRound(inRound(parts,RUN.r),RUN.r).find(x=>x[0]===me||x[1]===me);if(!pr)return;
  const opp=pr[0]===me?pr[1]:pr[0];
  if(RUN.r===1&&!RUN.R){const n=inRound(parts,1).length,c=cfgOf().rounds;RUN.R=c?Math.min(c,rrRounds(n)):rrRounds(n);save()}
  if(!RUN.pair||RUN.pair.r!==RUN.r||RUN.pair.opp!==opp){RUN.pair={r:RUN.r,opp,t:Date.now()};$('#abox').dataset.h=''}
  if(opp!=='bye'){const op=parts.find(p=>p.peer===opp);const both=(+RUN.rdy||0)>=RUN.r&&op&&op.rd>=RUN.r;if(!both&&Date.now()-RUN.pair.t<RDY_MS)return}
  if(B&&B.mode==='spec')specStop();
  if(opp==='bye'){RUN.res=(RUN.res||[]).concat([[RUN.r,'bye',1]]);RUN.r++;RUN.st=RUN.r>roundsOf()?'done':'wait';sysChat(`Runde ${RUN.r-1}: Freilos — du setzt diese Runde aus und schaust zu.`);toast('Diese Runde hast du ein Freilos.');save();pushMt();$('#abox').dataset.h='';showArena();return}
  startDuel(opp,duelIdOf(RUN.r,me,opp));
};
// ---------- Anzeige ----------
(function(){const st=document.createElement('style');st.textContent=`
.abox.wide{width:min(980px,100%)}
.brk{position:relative;display:flex;gap:46px;overflow-x:auto;padding:6px 2px 10px;margin:8px 0}
.brlines{position:absolute;left:0;top:0;pointer-events:none;z-index:0}.brcol,.brm{z-index:1}
.brcol{display:flex;flex-direction:column;justify-content:space-around;gap:12px;min-width:200px;flex:0 0 auto}
.brh{font-family:'Press Start 2P',monospace;font-size:8px;color:var(--muted);text-align:center;margin-bottom:2px}
.brm{position:relative;background:var(--panel2);border:2px solid #000;box-shadow:3px 3px 0 #000;font-family:VT323,monospace}
.brm.me{border-color:var(--accent)}.brm.live{border-color:#f0642a}.brm.fut{opacity:.55;border-style:dashed}
.brn{font-size:11px;color:var(--muted);padding:2px 6px;border-bottom:1px solid #000;display:flex;justify-content:space-between}
.brp{display:flex;align-items:center;gap:5px;padding:3px 6px;font-size:18px;line-height:1}
.brp+.brp{border-top:1px solid #00000066}
.brp .sw{width:9px;height:9px;border:2px solid #000;flex:0 0 auto}
.brp .nm{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brp.win{color:#3ddc6b}.brp.lose{color:#8a8ea6;text-decoration:line-through}
.brp .rd{font-size:14px}
.brf{padding:3px 6px 5px;font-size:15px;color:var(--muted)}
.brf .btn{width:100%;padding:5px;margin-top:3px;font-size:9px}
.drawroll{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
.drawroll span{background:#0b0d16;border:2px solid #000;padding:2px 6px;font-family:VT323,monospace;font-size:18px;animation:drawin .5s steps(4) both}

.podium{display:flex;align-items:flex-end;justify-content:center;gap:6px;margin:10px 0 6px;position:relative;min-height:170px;overflow:hidden}
.pod{display:flex;flex-direction:column;align-items:center;width:110px}
.pod .who{font-family:VT323,monospace;font-size:19px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px}
.pod .fig{width:22px;height:30px;margin:2px 0;image-rendering:pixelated;animation:podjump 1s steps(2) infinite}
.pod .step{width:100%;border:3px solid #000;box-shadow:3px 3px 0 #000;display:flex;align-items:flex-start;justify-content:center;font-family:'Press Start 2P',monospace;font-size:18px;color:#1b1300;padding-top:6px}
.pod.p1 .step{height:86px;background:#ffcb3d}.pod.p2 .step{height:60px;background:#c8ccd8}.pod.p3 .step{height:42px;background:#cd8a4a}
.pod.p1 .fig{animation-duration:.6s}
@keyframes podjump{0%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.conf{position:absolute;top:-8px;width:5px;height:5px;animation:conf 2.6s linear infinite}
@keyframes conf{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(190px) rotate(360deg)}}
@keyframes drawin{0%{transform:translateY(-8px) rotate(-8deg);opacity:0}100%{transform:none;opacity:1}}`;document.head.appendChild(st)})();
function bracketData(parts){const R=roundsOf(),N=Math.max(2,(RUN.R?inRound(parts,1).length:parts.length)),nm=id=>(parts.find(p=>p.peer===id)||{n:'(weg)'}),cols=[];let K=0;const label={};
  const resOf=(a,b,r)=>{const pa=parts.find(p=>p.peer===a),pb=parts.find(p=>p.peer===b);const xa=pa&&pa.res.find(x=>x[0]===r&&x[1]===b),xb=pb&&pb.res.find(x=>x[0]===r&&x[1]===a);if(xa)return xa[2];if(xb)return 1-xb[2];return null};
  const live=new Set(runningDuels().map(d=>d.id));let known=true;
  for(let r=1;r<=R;r++){const col={r,ms:[]};known=known&&roundKnown(parts,r);
    if(known){const prs=pairRound(inRound(parts,r),r);
      for(const[a,b]of prs){if(b==='bye'){col.ms.push({k:'–',r,a,b,bye:1});continue}K++;const res=resOf(a,b,r),id=duelIdOf(r,a,b);
        const st=res!=null?'done':(parts.some(p=>(p.peer===a||p.peer===b)&&p.st==='duel'&&p.r===r)||live.has(id))?'live':'ready';
        col.ms.push({k:K,r,a,b,res,st,id});label[r+'|'+a]=label[r+'|'+b]=K}}
    else{const per=Math.floor(N/2);const fut=[];
      for(let i=0;i<per;i++){K++;let t=['?','?'];
        if(N===3&&r===2)t=['Sieger K1',(cols[0]&&cols[0].ms.find(m=>m.bye))?nm(cols[0].ms.find(m=>m.bye).a).n:'Freilos-Spieler'];
        else if(N===3&&r===3)t=['Verlierer K1','Verlierer K2'];
        else if(N===4&&r===2)t=i===0?['Sieger K1','Sieger K2']:['Verlierer K1','Verlierer K2'];
        else if(N===4&&r===3)t=i===0?['Sieger K1','Verlierer K2']:['Sieger K2','Verlierer K1'];
        else if(r>1)t=i===0?['Bester','Zweitbester']:['nach Punkten','noch nicht gespielt'];
        fut.push({k:K,r,fut:1,t})}
      if(N%2)fut.push({k:'–',r,fut:1,bye:1,t:['Freilos','']});col.ms=fut}
    cols.push(col)}
  return cols}
function podFig(col){const cv=mk(11,15),x=cv.getContext('2d'),F=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
  F('#14141f',2,0,7,15);F('#1f2a48',3,1,5,2);F('#ffcb3d',5,1,1,1);F('#ffdbac',3,3,5,3);F(col,2,6,7,5);F('#ffcb3d',1,6,1,2);F('#ffcb3d',9,6,1,2);F('#1f2a48',3,11,2,4);F('#1f2a48',6,11,2,4);return cv.toDataURL()}
function podiumHtml(tab){const top=tab.slice(0,3),ord=[top[1],top[0],top[2]],cls=['p2','p1','p3'],num=['2','1','3'],med=['🥈','🏆','🥉'];
  const conf=Array.from({length:22},(_,i)=>`<i class="conf" style="left:${(i*37)%100}%;background:${['#ffcb3d','#ef4444','#3b82f6','#3ddc6b','#fff'][i%5]};animation-delay:${(i*0.23)%2.6}s"></i>`).join('');
  return`<div class="small" style="text-align:center;margin-top:8px">🏁 SIEGERPODEST</div><div class="podium">${conf}${ord.map((p,i)=>p?`<div class="pod ${cls[i]}"><div class="who">${med[i]} ${esc(p.n)}${p.me?' (du)':''}</div><img class="fig" src="${podFig(p.c)}" alt=""><div class="small">${p.score} Sieg${p.score===1?'':'e'}</div><div class="step">${num[i]}</div></div>`:`<div class="pod ${cls[i]}" style="opacity:0"></div>`).join('')}</div>`}
function brMatchHtml(m,parts,me){const P=id=>parts.find(p=>p.peer===id)||{n:'(weg)',c:'#555',rd:0};
  if(m.fut)return`<div class="brm fut" data-r="${m.r}"><div class="brn"><span>${m.bye?'Freilos':'Kampf '+m.k}</span><span>offen</span></div><div class="brp" data-ref="${esc(m.t[0])}"><span class="nm">${esc(m.t[0])}</span></div>${m.bye?'':`<div class="brp" data-ref="${esc(m.t[1])}"><span class="nm">${esc(m.t[1])}</span></div>`}</div>`;
  if(m.bye){const a=P(m.a);return`<div class="brm${m.a===me?' me':''}" data-r="${m.r}" data-bye="1"><div class="brn"><span>Freilos</span><span>setzt aus</span></div><div class="brp" data-peer="${esc(m.a)}" data-out="b"><span class="sw" style="background:${a.c}"></span><span class="nm">${esc(a.n)}${m.a===me?' (du)':''}</span></div></div>`}
  const a=P(m.a),b=P(m.b),mine=m.a===me||m.b===me;
  const row=(p,id,w)=>`<div class="brp ${m.res==null?'':w?'win':'lose'}" data-peer="${esc(id)}" data-out="${m.res==null?'':w?'w':'l'}"><span class="sw" style="background:${p.c}"></span><span class="nm">${esc(p.n)}${id===me?' (du)':''}</span>${m.st==='ready'?`<span class="rd" title="${p.rd>=m.r?'bereit':'noch nicht bereit'}">${p.rd>=m.r?'✔':'☐'}</span>`:m.res!=null?`<span class="rd">${w?'🏆':''}</span>`:''}</div>`;
  const wa=m.res==null?null:m.res===1,wb=m.res==null?null:m.res===0;
  let foot='';
  if(m.st==='live')foot=mine?'⚔ du kämpfst':`<button class="btn ghost" data-specid="${esc(m.id)}">👁 ZUSCHAUEN</button>`;
  else if(m.st==='ready'){const left=RUN.pair&&RUN.pair.r===m.r&&mine?Math.max(0,RDY_MS-(Date.now()-RUN.pair.t)):null;const n=(a.rd>=m.r?1:0)+(b.rd>=m.r?1:0);
    foot=`${n}/2 bereit${left!=null&&m.r===RUN.r?` · Start spätestens in ${fmt(left)}`:''}${mine&&RUN.st==='wait'&&RUN.r===m.r?`<button class="btn ${(+RUN.rdy||0)>=m.r?'ghost':'green'}" id="ardy">${(+RUN.rdy||0)>=m.r?'☐ DOCH NICHT BEREIT':'✔ BEREIT'}</button>`:''}`}
  else if(m.res===0.5)foot='unentschieden';
  return`<div class="brm${mine?' me':''}${m.st==='live'?' live':''}" data-r="${m.r}" data-k="${m.k}"><div class="brn"><span>Kampf ${m.k}</span><span>${m.st==='live'?'LÄUFT':m.st==='done'?'beendet':'wartet'}</span></div>${row(a,m.a,wa)}${row(b,m.b,wb)}<div class="brf">${foot}</div></div>`}
showArena=function(){
  const el=$('#arena');el.classList.add('on');$('#abox').classList.add('wide');
  const parts=participants();const R=roundsOf();const allDone=parts.every(p=>p.st==='done');const me=MYPEER||'me';
  const tab=standings(parts,99);
  if(allDone&&!RUN.trophy&&!RUN.gaveUp&&!RUN.solo&&tab[0]&&tab[0].me&&parts.length>1){RUN.trophy=1;G.tro++;save();pres({tr:G.tro});updateHud();sysChat('🏆 Du hast das Turnier gewonnen!');earn(200,'Siegerprämie')}
  let my;
  if(RUN.solo)my='Keine Gegner — das Gericht ist nur PvP und braucht mindestens 2 Spieler. Verhandlung abgesagt.';
  else if(RUN.gaveUp&&RUN.st==='done')my=allDone?`Du hast aufgegeben. Endergebnis: Platz ${tab.findIndex(p=>p.me)+1} von ${tab.length}.`:'Du hast das Turnier aufgegeben. Die anderen spielen weiter.';
  else if(allDone)my=tab[0]&&tab[0].me&&parts.length>1?'🏆 Du hast das Turnier gewonnen!':`Turnier vorbei — du bist Platz ${tab.findIndex(p=>p.me)+1} von ${tab.length}.`;
  else if(RUN.st==='done')my='Du hast alle Kämpfe gespielt. Warte auf die letzten Duelle…';
  else if(parts.length>1&&Date.now()<=RUN.end+45000&&parts.some(p=>p.st==='train'||p.st==='lobby'))my=`Warte auf andere Spieler… (${parts.filter(p=>p.st!=='train'&&p.st!=='lobby').length}/${parts.length} im Gericht · Timer ${fmt(RUN.end-Date.now())})`;
  else if(parts.length<=1&&Date.now()<RUN.end&&RUN.r===1&&!(RUN.res||[]).length)my=`Warte auf andere Spieler… Du bist allein — das Turnier beginnt, wenn der Timer abläuft (${fmt(RUN.end-Date.now())}).`;
  else if(parts.some(p=>p.st==='pick'))my='Warte, bis alle ihr Gerichts-Team gewählt haben…';
  else if(RUN.st==='wait'&&RUN.pair&&RUN.pair.r===RUN.r&&RUN.pair.opp!=='bye'&&!B){const op=parts.find(p=>p.peer===RUN.pair.opp);my=`Dein nächster Kampf: gegen ${op?op.n:'?'} — setze ✔ BEREIT an deinem Kampf.`}
  else my=`Runde ${Math.min(RUN.r,R)} von ${R} — die nächste Paarung steht, sobald die laufenden Kämpfe vorbei sind.`;
  const started=parts.some(p=>p.res.length)||parts.some(p=>p.st==='duel');if(!G._drawT||G._drawRun!==RUN.id){G._drawT=Date.now();G._drawRun=RUN.id}const anim=Date.now()-G._drawT<150;
  const order=parts.slice().sort((a,b)=>drawRank(a.peer)-drawRank(b.peer));
  const cols=parts.length>1?bracketData(parts):[];
  const rec=p=>{const g=p.res.filter(x=>x[1]!=='bye'),w=g.filter(x=>x[2]===1).length,l=g.filter(x=>x[2]===0).length,d=g.filter(x=>x[2]===0.5).length;return`${w}-${l}${d?'-'+d:''}`};
  const h=`<h2>⚖ DAS GERICHT</h2><div class="small">${cfgOf().tb?'Rundenbasiert':'Echtzeit'} · Jeder gegen jeden · ${R} Runde${R>1?'n':''} · je ${cfgOf().team} Monster · Teams voll geheilt</div><div class="st">${esc(my)}</div>
   ${allDone&&parts.length>1&&!RUN.solo?podiumHtml(tab):''}
   ${parts.length>1?`<div class="small">🎲 Ausgelost — Reihenfolge:</div><div class="drawroll">${order.map((p,i)=>`<span style="${started||!anim?'animation:none;':`animation-delay:${i*0.18}s;`}border-color:${p.me?'var(--accent)':'#000'}">${i+1}. ${esc(p.n)}</span>`).join('')}</div>`:''}
   ${cols.length?`<div class="brk">${cols.map(c=>`<div class="brcol"><div class="brh">RUNDE ${c.r}</div>${c.ms.map(m=>brMatchHtml(m,parts,me)).join('')}</div>`).join('')}</div>`:''}
   <div class="small" style="margin-top:4px">Tabelle (Siege · Buchholz · S-N):</div>
   ${tab.map((p,i)=>`<div class="arow" ${p.me?'style="border-color:var(--accent)"':''}><span>${i+1}. <span class="sw" style="display:inline-block;width:10px;height:10px;background:${p.c};border:2px solid #000;margin:0 4px"></span>${esc(p.n)}${p.me?' (du)':''}</span><span>${p.score} · ${p.bh} · ${rec(p)}</span></div>`).join('')}
   ${RUN.st!=='done'?'<div style="margin-top:10px"><button class="btn red" id="agiveup" style="width:100%">🏳 TURNIER AUFGEBEN</button></div>':''}${RUN.st==='done'?rematchHtml():''}${canGoBack()?'<div style="margin-top:10px"><button class="btn ghost" id="aback" style="width:100%">◀ ZURÜCK INS TRAINING</button></div>':''}`;
  if($('#abox').dataset.h!==h){$('#abox').dataset.h=h;const sc=$('#abox').querySelector('.brk'),sl=sc?sc.scrollLeft:0;$('#abox').innerHTML=h;const sc2=$('#abox').querySelector('.brk');if(sc2){sc2.scrollLeft=sl;requestAnimationFrame(()=>brLines(sc2))}
    const b=$('#aleave');if(b)b.onclick=leaveRun;const bk=$('#aback');if(bk)bk.onclick=backToTraining;const gu=$('#agiveup');if(gu)gu.onclick=giveUpArena;const rdb=$('#ardy');if(rdb)rdb.onclick=toggleReady;
    document.querySelectorAll('[data-specid]').forEach(x=>x.onclick=()=>{const d=runningDuels().find(q=>q.id===x.dataset.specid);if(d){RUN.specOff=0;specStart(d)}else toast('Der Kampf ist schon vorbei.')});
    const r=$('#arematch');if(r)r.onclick=()=>{const prev=RUN.id,cfg=Object.assign({},RUN.cfg,{host:MYPEER||'me'});pickStarter(sid=>startRun('m'+Math.random().toString(36).slice(2,10),0,sid,prev,cfg,'lobby'),cfg)};
    document.querySelectorAll('[data-rjoin]').forEach(x=>x.onclick=()=>joinLobby(x.dataset.rjoin))}
};

// WM-style connector lines: every player row runs on to the box of their next fight (winner gold, loser grey dashed, Freilos blue dotted)
function brLines(brk){try{if(!brk||!brk.isConnected)return;const old=brk.querySelector('svg.brlines');if(old)old.remove();
  const W=brk.scrollWidth,H=brk.scrollHeight,ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('class','brlines');svg.setAttribute('width',W);svg.setAttribute('height',H);
  const pos=(row,side)=>{const m=row.closest('.brm');return{x:m.offsetLeft+(side==='r'?m.offsetWidth:0),y:m.offsetTop+row.offsetTop+row.offsetHeight/2}};
  const cols=[...brk.querySelectorAll('.brcol')];
  const line=(a,b,col,dash,wd)=>{const mx=Math.round((a.x+b.x)/2),p=document.createElementNS(ns,'path');p.setAttribute('d',`M${a.x} ${a.y} H${mx} V${b.y} H${b.x}`);p.setAttribute('fill','none');p.setAttribute('stroke',col);p.setAttribute('stroke-width',wd||2);if(dash)p.setAttribute('stroke-dasharray',dash);p.setAttribute('shape-rendering','crispEdges');svg.appendChild(p)};
  for(let i=0;i<cols.length-1;i++){const next=cols[i+1];
    for(const row of cols[i].querySelectorAll('.brp[data-peer]')){const peer=row.dataset.peer,out=row.dataset.out;const tgt=[...next.querySelectorAll('.brp[data-peer]')].find(r=>r.dataset.peer===peer);
      const k=row.closest('.brm').dataset.k;let to=tgt;
      if(!to&&k){const want=out==='w'?'Sieger K'+k:out==='l'?'Verlierer K'+k:null;to=[...next.querySelectorAll('.brp[data-ref]')].find(r=>want?r.dataset.ref===want:false)}
      if(!to&&out==='b'){const nmTxt=row.querySelector('.nm').textContent.replace(' (du)','');to=[...next.querySelectorAll('.brp[data-ref]')].find(r=>r.dataset.ref===nmTxt)}
      if(!to&&!out&&k){const tos=[...next.querySelectorAll('.brp[data-ref]')].filter(r=>r.dataset.ref==='Sieger K'+k||r.dataset.ref==='Verlierer K'+k);tos.forEach(t=>line(pos(row,'r'),pos(t,'l'),'#4a4f6a','3 3'));continue}
      if(!to)continue;
      line(pos(row,'r'),pos(to,'l'),out==='w'?'#ffcb3d':out==='l'?'#8a8ea6':out==='b'?'#4aa3ff':'#4a4f6a',out==='l'?'5 4':out==='b'?'2 3':(!out?'3 3':null),out==='w'?3:2)}}
  brk.insertBefore(svg,brk.firstChild)}catch(e){console.warn(e)}}
addEventListener('resize',()=>{const b=document.querySelector('#abox .brk');if(b)brLines(b)});
