/* ===================== GERICHT: KO-SYSTEM WIE BEI DER WM =====================
   - Reihenfolge wird ausgelost (aus Lobby-ID + Spieler abgeleitet → auf allen Geräten gleich) und beim Start eingefroren.
   - KO-Baum mit Setzliste; fehlen Spieler zur Zweierpotenz, bekommen die ersten Gesetzten ein Freilos (kampflos weiter).
   - Spiel um Platz 3 (die beiden Halbfinal-Verlierer). Bei 3 Spielern: A–B, Sieger gegen C (Finale),
     danach die beiden Verlierer im Spiel um Platz 2 → jeder hat gegen jeden gespielt.
   - Darstellung als Pyramide: linke Hälfte → Finale in der Mitte ← rechte Hälfte, Verbindungslinien, Bereit-Knöpfe am
     eigenen Kampf, Zuschauen bei laufenden Kämpfen, Siegerpodest am Ende. */
const RDY_MS=90000,WALKOVER_MS=60000;
function drawRank(peer){return hashStr(String(RUN&&RUN.id)+'|'+peer)}
readyRoom=function(){return false};
function koSeeds(S){let a=[1];while(a.length<S){const n=a.length*2;a=a.flatMap(x=>[x,n+1-x])}return a}
function koEntrants(parts){if(RUN.ent&&RUN.ent.length)return RUN.ent;return parts.slice().sort((a,b)=>drawRank(a.peer)-drawRank(b.peer)).map(p=>p.peer)}
function koBuild(parts){const ent=koEntrants(parts),N=ent.length;if(N<2)return null;let S=2;while(S<N)S*=2;const R=Math.log2(S),seeds=koSeeds(S),slots=seeds.map(sd=>sd<=N?ent[sd-1]:'bye');
  const P=id=>parts.find(p=>p.peer===id);
  const resOf=(a,b,r)=>{const pa=P(a),pb=P(b);const xa=pa&&pa.res.find(x=>x[0]===r&&x[1]===b),xb=pb&&pb.res.find(x=>x[0]===r&&x[1]===a);if(xa)return xa[2];if(xb)return 1-xb[2];return null};
  const fill=m=>{if(m.a==null&&m.sa)m.a=m.sa.m.done?(m.sa.t==='W'?m.sa.m.w:m.sa.m.l):null;if(m.b==null&&m.sb)m.b=m.sb.m.done?(m.sb.t==='W'?m.sb.m.w:m.sb.m.l):null;
    if(m.a==null||m.b==null){m.done=false;return}
    if(m.a==='bye'||m.b==='bye'){m.bye=1;m.done=true;m.w=m.a==='bye'?m.b:m.a;m.l=null;return}
    const r=resOf(m.a,m.b,m.r);if(r==null||r===0.5){m.done=false;return}m.done=true;m.w=r===1?m.a:m.b;m.l=r===1?m.b:m.a};
  const rounds=[];for(let r=1;r<=R;r++){const n=S>>r,ms=[];for(let j=0;j<n;j++){const m={r,j};if(r===1){m.a=slots[2*j];m.b=slots[2*j+1]}else{m.sa={m:rounds[r-2][2*j],t:'W'};m.sb={m:rounds[r-2][2*j+1],t:'W'}}fill(m);ms.push(m)}rounds.push(ms)}
  const fin=rounds[R-1][0];let place=null;
  if(R>=2){const s0=rounds[R-2][0],s1=rounds[R-2][1];const realS0=!(s0.a==='bye'||s0.b==='bye'),realS1=!(s1.a==='bye'||s1.b==='bye');
    if(realS0&&realS1){place={r:R,j:'p',third:1,sa:{m:s0,t:'L'},sb:{m:s1,t:'L'}}}
    else if(realS0||realS1){const s=realS0?s0:s1;place={r:R+1,j:'p',second:1,sa:{m:s,t:'L'},sb:{m:fin,t:'L'}}}
    if(place)fill(place)}
  const all=rounds.flat().concat(place?[place]:[]);let k=0;for(const m of all){if(m.bye||(m.r===1&&(m.a==='bye'||m.b==='bye')))continue;m.k=++k}
  const maxR=place?place.r:R;
  return{ent,N,S,R,rounds,fin,place,all,maxR}}
function koPotential(m,me){if(m.a===me||m.b===me)return true;return[m.sa,m.sb].some(s=>s&&!s.m.done&&koPotential(s.m,me))}
function koMine(K,me){return K.all.filter(m=>!m.done&&koPotential(m,me))}
function koPlaces(K){const pl={};if(!K)return pl;const f=K.fin;if(f.done){pl[f.w]=1;if(!K.place||K.place.third)pl[f.l]=2}
  if(K.place&&K.place.done){if(K.place.third){pl[K.place.w]=3;pl[K.place.l]=4}else{pl[K.place.w]=2;pl[K.place.l]=3}}
  for(let r=K.R-1;r>=1;r--)for(const m of K.rounds[r-1])if(m.done&&m.l&&pl[m.l]==null&&!(K.place&&(K.place.a===m.l||K.place.b===m.l)))pl[m.l]=(K.S>>r)+1;
  return pl}
roundsOf=function(){try{if(RUN&&RUN.phase==='arena'){const K=koBuild(participants());if(K)return K.maxR}}catch(e){}let n=2;try{n=participants().length}catch(e){}let S=2;while(S<n)S*=2;return Math.max(1,Math.log2(S)+(n===3?1:0))};
function koIsFinal(id){try{const p=String(id).split('-');const K=koBuild(participants());if(!K)return false;const r=+p[1],pr=[p[2],p[3]].sort().join('|');return r===K.R&&[K.fin.a,K.fin.b].sort().join('|')===pr}catch(e){return false}}
function duelIdOf(r,a,b){return RUN.id+'-'+r+'-'+[a,b].sort().join('-')}
arenaTick=function(){
  if(!RUN||RUN.free||RUN.phase!=='arena')return;
  if(!B)showArena();
  try{specAuto()}catch(e){}
  if((B&&B.mode!=='spec')||RUN.st!=='wait')return;
  const parts=participants();
  const late=Date.now()>RUN.end+45000;
  if(!late&&parts.some(p=>p.st==='train'||p.st==='pick'||p.st==='lobby'))return;
  if(!RUN.ent&&!(RUN.res||[]).length&&Date.now()<RUN.end&&!(parts.length>1))return;
  if(!RUN.ent&&parts.length<2&&!(RUN.res||[]).length){RUN.st='done';RUN.solo=1;save();pushMt();$('#abox').dataset.h='';showArena();return}
  if(!RUN.ent){RUN.ent=koEntrants(parts.filter(p=>!['train','pick','lobby'].includes(p.st)));RUN.entN={};for(const p of parts)RUN.entN[p.peer]=p.n;save()}
  const K=koBuild(parts);if(!K)return;const me=MYPEER||'me';
  const mine=koMine(K,me);if(!mine.length){RUN.st='done';save();pushMt();$('#abox').dataset.h='';showArena();return}
  const m=mine.find(x=>x.a!=null&&x.b!=null&&(x.a===me||x.b===me));if(!m)return;
  const opp=m.a===me?m.b:m.a;
  if(RUN.r!==m.r){RUN.r=m.r;save();pushMt()}
  if(!RUN.pair||RUN.pair.r!==m.r||RUN.pair.opp!==opp){RUN.pair={r:m.r,opp,t:Date.now()};$('#abox').dataset.h=''}
  const op=parts.find(p=>p.peer===opp);
  // walkover: opponent gave up or is gone for a while
  if(!op||op.st==='done'){if(Date.now()-RUN.pair.t>(op?3000:WALKOVER_MS)){RUN.res=(RUN.res||[]).concat([[m.r,opp,1]]);RUN.r=m.r+1;RUN.st='wait';sysChat(`${(RUN.entN&&RUN.entN[opp])||'Dein Gegner'} ist nicht mehr da — du kommst kampflos weiter.`);save();pushMt();$('#abox').dataset.h=''}return}
  const both=(+RUN.rdy||0)>=m.r&&op.rd>=m.r&&op.r===m.r;if(!both&&Date.now()-RUN.pair.t<RDY_MS)return;
  if(B&&B.mode==='spec')specStop();
  startDuel(opp,duelIdOf(m.r,me,opp));
};
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
function podFig(col){const cv=mk(11,15),x=cv.getContext('2d'),F=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
  F('#14141f',2,0,7,15);F('#1f2a48',3,1,5,2);F('#ffcb3d',5,1,1,1);F('#ffdbac',3,3,5,3);F(col,2,6,7,5);F('#ffcb3d',1,6,1,2);F('#ffcb3d',9,6,1,2);F('#1f2a48',3,11,2,4);F('#1f2a48',6,11,2,4);return cv.toDataURL()}
function podiumHtml(tab){const top=tab.slice(0,3),ord=[top[1],top[0],top[2]],cls=['p2','p1','p3'],num=['2','1','3'],med=['🥈','🏆','🥉'];
  const conf=Array.from({length:22},(_,i)=>`<i class="conf" style="left:${(i*37)%100}%;background:${['#ffcb3d','#ef4444','#3b82f6','#3ddc6b','#fff'][i%5]};animation-delay:${(i*0.23)%2.6}s"></i>`).join('');
  return`<div class="small" style="text-align:center;margin-top:8px">🏁 SIEGERPODEST</div><div class="podium">${conf}${ord.map((p,i)=>p?`<div class="pod ${cls[i]}"><div class="who">${med[i]} ${esc(p.n)}${p.me?' (du)':''}</div><img class="fig" src="${podFig(p.c)}" alt=""><div class="small">${p.score} Sieg${p.score===1?'':'e'}</div><div class="step">${num[i]}</div></div>`:`<div class="pod ${cls[i]}" style="opacity:0"></div>`).join('')}</div>`}
(function(){const st=document.createElement('style');st.textContent=`
.pyr{position:relative;display:flex;align-items:stretch;justify-content:center;gap:34px;overflow-x:auto;padding:8px 2px 12px;margin:6px 0}
.pyr .brcol{display:flex;flex-direction:column;justify-content:space-around;gap:10px;min-width:150px;flex:0 0 auto}
.pyr .brcol.ctr{justify-content:center;gap:18px;min-width:170px}
.pyr .brm{min-width:150px}
.pyr .brm.final{border-color:#ffcb3d;box-shadow:0 0 0 2px #7a5a12,3px 3px 0 #000}
.fintitle{font-family:'Press Start 2P',monospace;font-size:12px;color:#ffcb3d;text-align:center;text-shadow:2px 2px 0 #7a3a00;margin-bottom:4px}
.brp.ph{color:var(--muted);font-style:italic;font-size:15px}`;document.head.appendChild(st)})();
function koName(id,parts){if(id==='bye')return'Freilos';const p=parts.find(q=>q.peer===id);return p?p.n:((RUN.entN&&RUN.entN[id])||'(weg)')}
function koMatchHtml(m,K,parts,me){const P=id=>parts.find(p=>p.peer===id)||{n:koName(id,parts),c:'#555',rd:0,r:0};const live=new Set(runningDuels().map(d=>d.id));
  const ph=s=>s?`${s.t==='W'?'Sieger':'Verlierer'} ${s.m.k?'K'+s.m.k:(s.m.a&&s.m.a!=='bye'?koName(s.m.a,parts):'?')}`:'?';
  const title=m===K.fin?'FINALE':m===K.place?(m.third?'Spiel um Platz 3':'Spiel um Platz 2'):m.r===K.R-1&&K.R>=2?'Halbfinale':m.r===K.R-2&&K.R>=3?'Viertelfinale':'Runde '+m.r;
  const isBye=m.a==='bye'||m.b==='bye';const id=m.a&&m.b&&!isBye?duelIdOf(m.r,m.a,m.b):'';const mine=m.a===me||m.b===me;
  const stt=m.done?(isBye?'Freilos':'beendet'):m.a!=null&&m.b!=null?((parts.some(p=>(p.peer===m.a||p.peer===m.b)&&p.st==='duel'&&p.r===m.r)||live.has(id))?'live':'ready'):'fut';
  const row=(id,src)=>{if(id==null)return`<div class="brp ph">${esc(ph(src))}</div>`;if(id==='bye')return`<div class="brp ph">— Freilos —</div>`;const p=P(id),w=m.done&&m.w===id,l=m.done&&m.l===id;
    return`<div class="brp ${w?'win':l?'lose':''}"><span class="sw" style="background:${p.c}"></span><span class="nm">${esc(p.n)}${id===me?' (du)':''}</span>${stt==='ready'?`<span class="rd" title="${p.rd>=m.r&&p.r===m.r?'bereit':'noch nicht bereit'}">${p.rd>=m.r&&p.r===m.r?'✔':'☐'}</span>`:w?'<span class="rd">🏆</span>':''}</div>`};
  let foot='';
  if(stt==='live')foot=mine?'⚔ du kämpfst':`<button class="btn ghost" data-specid="${esc(id)}">👁 ZUSCHAUEN</button>`;
  else if(stt==='ready'){const a=P(m.a),b=P(m.b),n=(a.rd>=m.r&&a.r===m.r?1:0)+(b.rd>=m.r&&b.r===m.r?1:0);const left=mine&&RUN.pair&&RUN.pair.r===m.r?Math.max(0,RDY_MS-(Date.now()-RUN.pair.t)):null;
    foot=`${n}/2 bereit${left!=null?` · Start spätestens in ${fmt(left)}`:''}${mine&&RUN.st==='wait'&&RUN.r===m.r?`<button class="btn ${(+RUN.rdy||0)>=m.r?'ghost':'green'}" id="ardy">${(+RUN.rdy||0)>=m.r?'☐ DOCH NICHT BEREIT':'✔ BEREIT'}</button>`:''}`}
  return`<div class="brm${mine?' me':''}${stt==='live'?' live':''}${stt==='fut'?' fut':''}${m===K.fin?' final':''}" data-mid="${m.r}-${m.j}"><div class="brn"><span>${m.k?'K'+m.k+' · ':''}${title}</span><span>${stt==='live'?'LÄUFT':stt==='ready'?'wartet':stt==='fut'?'offen':isBye?'kampflos':'beendet'}</span></div>${row(m.a,m.sa)}${row(m.b,m.sb)}${foot?`<div class="brf">${foot}</div>`:''}</div>`}
function koPyramidHtml(K,parts,me){const L=[],Rr=[];
  for(let r=1;r<K.R;r++){const ms=K.rounds[r-1],h=ms.length/2;L.push(ms.slice(0,h));Rr.unshift(ms.slice(h))}
  const col=(ms,side)=>`<div class="brcol" data-side="${side}">${ms.map(m=>koMatchHtml(m,K,parts,me)).join('')}</div>`;
  return`<div class="pyr">${L.map(ms=>col(ms,'L')).join('')}<div class="brcol ctr"><div><div class="fintitle">🏆 FINALE</div>${koMatchHtml(K.fin,K,parts,me)}</div>${K.place?koMatchHtml(K.place,K,parts,me):''}</div>${Rr.map(ms=>col(ms,'R')).join('')}</div>`}
// lines: every match box to the box its winner goes to (gold once decided); dashed from the semis to the 3rd-place game
function koLines(pyr,K){try{if(!pyr||!pyr.isConnected)return;const old=pyr.querySelector('svg.brlines');if(old)old.remove();
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('class','brlines');svg.setAttribute('width',pyr.scrollWidth);svg.setAttribute('height',pyr.scrollHeight);
  const box=m=>pyr.querySelector(`[data-mid="${m.r}-${m.j}"]`);const rel=el=>{let x=0,y=0,e=el;while(e&&e!==pyr){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent}return{x,y,w:el.offsetWidth,h:el.offsetHeight}};
  const path=(a,b,col,dash,wd)=>{const p=document.createElementNS(ns,'path'),mx=Math.round((a.x+b.x)/2);p.setAttribute('d',`M${a.x} ${a.y} H${mx} V${b.y} H${b.x}`);p.setAttribute('fill','none');p.setAttribute('stroke',col);p.setAttribute('stroke-width',wd||2);if(dash)p.setAttribute('stroke-dasharray',dash);p.setAttribute('shape-rendering','crispEdges');svg.appendChild(p)};
  const link=(child,parent,take)=>{const c=box(child),p=box(parent);if(!c||!p)return;const A=rel(c),Bp=rel(p);const leftSide=A.x<Bp.x;
    const from={x:leftSide?A.x+A.w:A.x,y:A.y+A.h/2},to={x:leftSide?Bp.x:Bp.x+Bp.w,y:Bp.y+Bp.h/2};const dec=child.done&&!(take==='L'&&!child.l);
    path(from,to,take==='L'?'#8a8ea6':dec?'#ffcb3d':'#4a4f6a',take==='L'?'4 4':null,dec&&take==='W'?3:2)};
  for(const m of K.all)for(const s of[m.sa,m.sb])if(s)link(s.m,m,s.t);
  pyr.insertBefore(svg,pyr.firstChild)}catch(e){console.warn(e)}}
showArena=function(){
  const el=$('#arena');el.classList.add('on');$('#abox').classList.add('wide');
  const parts=participants();const me=MYPEER||'me';const K=parts.length>1||RUN.ent?koBuild(parts):null;
  const allDone=K?(K.fin.done&&(!K.place||K.place.done)):parts.every(p=>p.st==='done');const pl=koPlaces(K);
  const ranked=K?K.ent.map(id=>{const p=parts.find(q=>q.peer===id)||{peer:id,n:koName(id,parts),c:'#555',res:[]};const wins=p.res.filter(x=>x[2]===1).length;return Object.assign({},p,{me:id===me,place:pl[id]||99,score:wins})}).sort((a,b)=>a.place-b.place||b.score-a.score):[];
  if(allDone&&K&&!RUN.trophy&&!RUN.gaveUp&&!RUN.solo&&K.fin.w===me){RUN.trophy=1;G.tro++;save();pres({tr:G.tro});updateHud();sysChat('🏆 Du hast das Turnier gewonnen!');earn(200,'Siegerprämie')}
  let my;const myPl=pl[me];
  if(RUN.solo)my='Keine Gegner — das Gericht ist nur PvP und braucht mindestens 2 Spieler. Verhandlung abgesagt.';
  else if(allDone&&K)my=K.fin.w===me?'🏆 Du hast das Turnier gewonnen!':`Turnier vorbei — du bist Platz ${myPl||'?'} von ${K.N}.`;
  else if(RUN.gaveUp&&RUN.st==='done')my='Du hast das Turnier aufgegeben. Die anderen spielen weiter.';
  else if(RUN.st==='done')my=myPl?`Für dich ist das Turnier vorbei (Platz ${myPl}). Schau den anderen zu!`:'Du bist ausgeschieden — schau den anderen zu!';
  else if(parts.length>1&&Date.now()<=RUN.end+45000&&parts.some(p=>p.st==='train'||p.st==='lobby'))my=`Warte auf andere Spieler… (${parts.filter(p=>p.st!=='train'&&p.st!=='lobby').length}/${parts.length} im Gericht · Timer ${fmt(RUN.end-Date.now())})`;
  else if(parts.length<=1&&Date.now()<RUN.end&&!RUN.ent)my=`Warte auf andere Spieler… Du bist allein — das Turnier beginnt, wenn der Timer abläuft (${fmt(RUN.end-Date.now())}).`;
  else if(parts.some(p=>p.st==='pick'))my='Warte, bis alle ihr Gerichts-Team gewählt haben…';
  else if(RUN.st==='wait'&&RUN.pair&&RUN.pair.r===RUN.r&&!B){my=`Dein nächster Kampf: gegen ${koName(RUN.pair.opp,parts)} — setze ✔ BEREIT an deinem Kampf.`}
  else my='Warte auf deinen nächsten Gegner — die laufenden Kämpfe entscheiden ihn.';
  const started=parts.some(p=>p.res.length)||parts.some(p=>p.st==='duel');if(!G._drawT||G._drawRun!==RUN.id){G._drawT=Date.now();G._drawRun=RUN.id}const anim=Date.now()-G._drawT<150;
  const order=K?K.ent.map(id=>({n:koName(id,parts),me:id===me})):[];
  const h=`<h2>⚖ DAS GERICHT</h2><div class="small">${cfgOf().tb?'Rundenbasiert':'Echtzeit'} · KO-System mit Spiel um Platz ${K&&K.place&&K.place.second?'2':'3'} · je ${cfgOf().team} Monster · Teams voll geheilt</div><div class="st">${esc(my)}</div>
   ${allDone&&K&&!RUN.solo?podiumHtml(ranked):''}
   ${order.length?`<div class="small">🎲 Ausgelost — Setzliste:</div><div class="drawroll">${order.map((p,i)=>`<span style="${started||!anim?'animation:none;':`animation-delay:${i*0.18}s;`}border-color:${p.me?'var(--accent)':'#000'}">${i+1}. ${esc(p.n)}</span>`).join('')}</div>`:''}
   ${K?koPyramidHtml(K,parts,me):''}
   ${ranked.length&&ranked.some(p=>p.place<99)?`<div class="small" style="margin-top:4px">Platzierung:</div>${ranked.map(p=>`<div class="arow" ${p.me?'style="border-color:var(--accent)"':''}><span>${p.place<99?p.place+'.':'–'} <span class="sw" style="display:inline-block;width:10px;height:10px;background:${p.c};border:2px solid #000;margin:0 4px"></span>${esc(p.n)}${p.me?' (du)':''}</span><span>${p.score} Sieg${p.score===1?'':'e'}</span></div>`).join('')}`:''}
   ${RUN.st!=='done'?'<div style="margin-top:10px"><button class="btn red" id="agiveup" style="width:100%">🏳 TURNIER AUFGEBEN</button></div>':''}${RUN.st==='done'?rematchHtml():''}${canGoBack()?'<div style="margin-top:10px"><button class="btn ghost" id="aback" style="width:100%">◀ ZURÜCK INS TRAINING</button></div>':''}`;
  if($('#abox').dataset.h!==h){$('#abox').dataset.h=h;const sc=$('#abox').querySelector('.pyr'),sl=sc?sc.scrollLeft:0;$('#abox').innerHTML=h;const sc2=$('#abox').querySelector('.pyr');if(sc2){sc2.scrollLeft=sl;requestAnimationFrame(()=>koLines(sc2,K))}
    const b=$('#aleave');if(b)b.onclick=leaveRun;const bk=$('#aback');if(bk)bk.onclick=backToTraining;const gu=$('#agiveup');if(gu)gu.onclick=giveUpArena;const rdb=$('#ardy');if(rdb)rdb.onclick=toggleReady;
    document.querySelectorAll('[data-specid]').forEach(x=>x.onclick=()=>{const d=runningDuels().find(q=>q.id===x.dataset.specid);if(d){RUN.specOff=0;specStart(d)}else toast('Der Kampf ist schon vorbei.')});
    const r=$('#arematch');if(r)r.onclick=()=>{const prev=RUN.id,cfg=Object.assign({},RUN.cfg,{host:MYPEER||'me'});pickStarter(sid=>startRun('m'+Math.random().toString(36).slice(2,10),0,sid,prev,cfg,'lobby'),cfg)};
    document.querySelectorAll('[data-rjoin]').forEach(x=>x.onclick=()=>joinLobby(x.dataset.rjoin))}
};
addEventListener('resize',()=>{const b=document.querySelector('#abox .pyr');if(b&&RUN&&RUN.phase==='arena')koLines(b,koBuild(participants()))});
