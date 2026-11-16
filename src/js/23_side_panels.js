/* ===================== SIDE PANELS ===================== */
let curTab='team',unread=0;
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>switchTab(b.dataset.t));
function switchTab(t){curTab=t;document.querySelectorAll('.tabs button,#topbar button[data-t]').forEach(b=>b.classList.toggle('act',b.dataset.t===t));document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('act',p.id==='pane-'+t));if(t==='chat'){unread=0;$('#cbadge').innerHTML='';const l=$('#chatlog');l.scrollTop=l.scrollHeight}if(t==='players')renderPlayers();if(t==='lobby'){lastLob='';renderLobbyPane()}}
function monCard(m,i,inTeam){
  const st=stats(m),sp=SPECIES[m.s],r=m.hp/st.mhp;const d=document.createElement('div');d.className='card';
  const cv=mk(52,52);{const cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(monSprite(m.s,24),0,0,52,52)}d.appendChild(cv);
  const info=document.createElement('div');info.className='info';
  info.innerHTML=`<div class="nm"><span>${nameHtml(m.s)}</span><span class="lv">Lv ${m.l}</span></div><span class="tb" style="background:${TYPES[sp.t].c}">${TYPES[sp.t].n.toUpperCase()}</span> <span class="tb" style="background:${rarOf(m.s).c};color:#14141f">${rarOf(m.s).n.toUpperCase()}</span> <span class="small">KP ${m.hp}/${st.mhp}</span><div class="bar"><i style="width:${r*100}%;background:${hpColor(r)}"></i></div><div class="bar xp"><i style="width:${Math.min(100,m.xp/xpNeed(m.l)*100)}%"></i></div><div class="small" style="margin-top:3px">${m.m.map(x=>MOVES[x].n).join(' · ')}</div>`;
  const acts=document.createElement('div');const btn=(t,fn,dis)=>{const b=document.createElement('button');b.className='mini';b.textContent=t;b.disabled=!!dis||!!B||(RUN&&RUN.phase==='arena');b.onclick=fn;acts.appendChild(b)};
  if(inTeam){if(i>0)btn('↑ Nach vorn',()=>{RUN.team.unshift(RUN.team.splice(i,1)[0]);changed()});if(RUN.team.length>1)btn('→ Box',()=>{RUN.box.push(RUN.team.splice(i,1)[0]);changed()})}
  else btn('→ Team',()=>{RUN.team.push(RUN.box.splice(i,1)[0]);changed()},RUN.team.length>=teamMax());
  {const b=document.createElement('button');b.className='mini';b.textContent='ℹ Details';b.onclick=()=>openMonInfo(m.s,m);acts.appendChild(b)}
  {const b=document.createElement('button');b.className='mini';b.textContent='📚 Study';b.disabled=!!B||RUN.phase==='arena';b.title=SPECIES[m.s].law?'Quiz zu '+SPECIES[m.s].law:'Quiz mit zufälligen Paragraphen';b.onclick=()=>openStudy(m);acts.appendChild(b)}
  if(RUN&&RUN.items&&['potion','superp','revive','candy'].some(k=>RUN.items[k]>0)){const b=document.createElement('button');b.className='mini';b.textContent='🎒 Item';b.disabled=!!B||RUN.phase==='arena';b.onclick=()=>openItemsFor(m);acts.appendChild(b)}
  if(RUN&&tmOwned().some(k=>tmOK(m,k))){const b=document.createElement('button');b.className='mini';b.textContent='💿 TM';b.disabled=!!B||RUN.phase==='arena';b.onclick=()=>openTMFor(m);acts.appendChild(b)}
  info.appendChild(acts);d.appendChild(info);return d;
}
function changed(){save();renderTeam();pushMt()}
// ===== STUDY: quiz bank (first answer = correct, shuffled at runtime). [question, [answers], explanation]
const QZ={};
//@inc js/data/qz/01_owi_polg.js
//@inc js/data/qz/02_polg.js
//@inc js/data/qz/03_polg_gg.js
//@inc js/data/qz/04_gg.js
//@inc js/data/qz/05_gg.js
//@inc js/data/qz/06_stgb.js
//@inc js/data/qz/07_stgb.js
//@inc js/data/qz/08_stpo.js
//@inc js/data/qz/09_stpo.js
//@inc js/data/qz/10_stpo.js
//@inc js/data/dex_text.js


// ===== STUDY: quiz duel in the look of a turn-based battle. Correct answers give EP.
const STUDY_N=5,STUDY_CD=300000;  // 5 min study break per monster after a session
let ST=null;
function lawShort(sid){const l=SPECIES[sid]&&SPECIES[sid].law;return l?l.split(' · ')[0]:''}
function shuffleArr(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function studyQuestions(sid){
  if(QZ[sid])return shuffleArr(QZ[sid].slice()).slice(0,STUDY_N).map(q=>({src:sid,q:qReal(q)}));
  // hero monsters (no paragraph): random questions from random paragraph monsters
  const keys=Object.keys(QZ).filter(k=>SPECIES[k]);const out=[];const used=new Set();
  while(out.length<STUDY_N){const k=keys[Math.floor(Math.random()*keys.length)];const q=QZ[k][Math.floor(Math.random()*QZ[k].length)];if(used.has(q[0]))continue;used.add(q[0]);out.push({src:k,q:qReal(q)})}
  return out}
function atHfPol(){return tget(P.x,P.y)===23}
function openHfPol(){if(!RUN||B)return;if(RUN.phase==='arena'){toast('Während des Gerichtsturniers ist die HfPol geschlossen.');return}
  const now=Date.now();
  openModal(`<h3>🎓 HfPol — Hochschule für Polizei</h3><p>Villingen-Knastningen · Hörsaal. Wähle ein Monster für die Prüfung (5 Fragen, Multiple Choice). Richtige Antworten geben EP.</p>
   <div style="display:flex;flex-direction:column;gap:6px;max-height:50vh;overflow:auto">${RUN.team.map((m,i)=>{const left=(m.stT||0)+STUDY_CD-now;return`<div style="display:flex;gap:6px"><button class="btn ${left>0?'ghost':''}" data-hs="${i}" style="flex:1;text-align:left;font-family:VT323,monospace;font-size:19px">📚 ${nameHtml(m.s)} · Lv ${m.l}${left>0?` · Lernpause ${Math.floor(Math.ceil(left/1000)/60)}:${String(Math.ceil(left/1000)%60).padStart(2,"0")}`:''}</button><button class="btn ghost" data-cp="${i}" ${left>0||money()<CRIB_P?'disabled':''} title="Sofort die EP einer bestandenen Prüfung (5/5), danach Lernpause">📄 ABSCHREIBEN $${CRIB_P}</button></div>`}).join('')}</div>
   <div class="acts" style="margin-top:10px"><button class="btn ghost" id="mno">HÖRSAAL VERLASSEN</button></div>`);
  document.querySelectorAll('[data-hs]').forEach(b=>b.onclick=()=>openStudy(RUN.team[+b.dataset.hs]));document.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>studyCrib(RUN.team[+b.dataset.cp]));$('#mno').onclick=closeModal}
// Abschreiben: $100 → immediately the XP of a perfect exam (5/5), then the usual study break
const CRIB_P=100;
function studyCrib(m){if(!m||!atHfPol())return;if((m.stT||0)+STUDY_CD>Date.now()){toast('Lernpause — erst später wieder.');return}if(money()<CRIB_P){toast('Nicht genug Geld.');return}
  RUN.money-=CRIB_P;const amt=Math.max(8,Math.round(xpNeed(m.l)*0.25/((RUN.cfg&&RUN.cfg.xp)||1)))*STUDY_N;m.stT=Date.now();const msgs=gainXp(m,amt);for(const t of msgs)sysChat(t);
  toast(`📄 ${SPECIES[m.s].n} hat abgeschrieben: +${Math.round(amt*((RUN.cfg&&RUN.cfg.xp)||1))} EP.`);save();updateHud();renderTeam();pushMt();openHfPol()}
function openStudy(m){
  if(!RUN||B||RUN.phase==='arena'){toast('Lernen geht nur außerhalb von Kämpfen und Gericht.');return}
  if(!atHfPol()){toast('Lernen geht nur in der HfPol (Hochschule für Polizei) — in der Stadt südlich der Hauptstraße, rechts (🎓 auf der Karte).');return}
  const left=(m.stT||0)+STUDY_CD-Date.now();if(left>0){const sec=Math.ceil(left/1000);toast(`☕ ${SPECIES[m.s].n} hat Lernpause — noch ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} min.`);return}
  closeModal();
  ST={m,qs:studyQuestions(m.s),i:0,ok:0,xp:0,state:'ask',fx:null,t0:performance.now()};
  ST.ex=QZ[m.s]?(m.s==='richtereule'?'wuerdeadler':'richtereule'):null;
  $('#study').classList.add('on');renderStudy();studyLoop();
}
function studyExaminer(){return ST.ex||ST.qs[Math.min(ST.i,ST.qs.length-1)].src}
function renderStudy(){if(!ST)return;const m=ST.m,sp=SPECIES[m.s],st=stats(m);const ex=studyExaminer(),cur=ST.qs[ST.i];
  const xpR=clamp(m.xp/xpNeed(m.l),0,1);
  let h=`<div class="shud"><div class="spanel"><div class="snm"><span>${nameHtml(m.s)}</span><span>Lv${m.l}</span></div><div class="sbar"><i style="width:${xpR*100}%;background:#4aa3ff"></i></div><div class="ssm">EP ${m.xp}/${xpNeed(m.l)}</div></div>
    <div class="spanel"><div class="snm"><span>Prüfer: ${nameHtml(ex)}</span></div><div class="shearts">${ST.qs.map((_,i)=>`<b class="${i<ST.i?(ST.res&&ST.res[i]?'hit':'miss'):''}">⚖</b>`).join('')}</div><div class="ssm">Frage ${Math.min(ST.i+1,ST.qs.length)}/${ST.qs.length} · richtig ${ST.ok}</div></div></div>
    <canvas id="stcv" width="360" height="150"></canvas>`;
  if(ST.state==='done'){
    h+=`<div class="sdlg"><b>${ST.ok===ST.qs.length?'Bestanden mit Auszeichnung!':ST.ok>0?'Prüfung beendet.':'Durchgefallen…'}</b><br>${ST.ok}/${ST.qs.length} richtig · +${ST.xp} EP für ${nameHtml(m.s)}${(ST.msgs||[]).filter(t=>!/erhält/.test(t)).map(t=>'<br>'+esc(t)).join('')}</div>
      <div class="sacts"><button class="btn" id="sclose">SCHLIESSEN</button></div>`;
  }else{
    const q=cur.q;if(!cur.order)cur.order=shuffleArr([0,1,2,3]);const LB=`<button class="rbtn" id="slearn" title="Ohne Frage: +5 % EP-Fortschritt, danach 10 s warten"><div class="cdr"></div><span><b>📖</b>+5 %</span></button>`;
    h+=`<div class="sdlg"><span class="slaw">${esc(SPECIES[cur.src].law||'')}</span><br>${esc(q[0])}${ST.state==='ask'?`<div class="cqt"><i id="sqbar"></i></div>`:''}${ST.state==='shown'?`<div class="sexp ${cur.right?'ok':'bad'}">${cur.right?'✓ Richtig.':(cur.pick<0?'⏱ Zeit abgelaufen.':'✗ Falsch.')} ${esc(q[2])}</div>`:''}</div>
      <div class="qrow"><div class="sans">${cur.order.map((k,j)=>`<button class="sa ${ST.state==='shown'?(k===0?'ok':(cur.pick===k?'bad':'dim')):''}" data-k="${k}" ${ST.state==='shown'?'disabled':''}><span class="sk">${'ABCD'[j]}</span>${esc(q[1][k])}</button>`).join('')}</div></div>
      ${ST.state==='shown'?`<div class="sacts"><button class="btn" id="snext">${ST.i+1<ST.qs.length?'WEITER ▶':'ERGEBNIS ▶'}</button></div>`:`<div class="sacts"><button class="btn ghost" id="squit">AUFGEBEN</button></div>`}`}
  const el=$('#sbox');el.innerHTML=h;
  el.querySelectorAll('.sa').forEach(b=>b.onclick=()=>studyAnswer(+b.dataset.k));
  const n=$('#snext');if(n)n.onclick=()=>{if((ST.pen||0)>Date.now())return;ST.i++;ST.state=ST.i>=ST.qs.length?'done':'ask';if(ST.state==='done')studyFinish();renderStudy()};
  const qq=$('#squit');if(qq)qq.onclick=()=>{ST.state='done';ST.qs=ST.qs.slice(0,ST.i);studyFinish();renderStudy()};
  const c=$('#sclose');if(c)c.onclick=closeStudy;
  if(n)studyPen()
}
// LERNEN: +5 % of the way to the next level without a question, then 5 s cooldown
function studyPen(){const n=$('#snext');if(!n||!ST)return;const l=Math.max(0,(ST.pen||0)-Date.now());n.disabled=l>0;n.textContent=l>0?`⏳ ${Math.ceil(l/1000)} s`:(ST.i+1<ST.qs.length?'WEITER ▶':'ERGEBNIS ▶');if(l>0)setTimeout(studyPen,200)}
function studyLearn(){if(!ST||ST.state==='done'||(ST.lcd||0)>Date.now())return;const m=ST.m;const amt=Math.max(1,Math.round(xpNeed(m.l)*0.05/((RUN.cfg&&RUN.cfg.xp)||1)));
  const msgs=gainXp(m,amt);for(const t of msgs)sysChat(t);ST.lcd=Date.now()+10000;save();renderTeam();pushMt();renderStudy()}
function studyLearnBtn(){const lb=$('#slearn');if(!lb||!ST)return;const l=Math.max(0,(ST.lcd||0)-Date.now());rbtnSet(lb,l,10000,'📖','+5 %');if(l>0)setTimeout(studyLearnBtn,100)}
// round quick-action button with a radial cooldown (like the touch attack buttons)
function rbtnSet(b,left,total,icon,lbl){b.disabled=left>0;b.querySelector('.cdr').style.setProperty('--cd',(left/total)+'turn');b.querySelector('span').innerHTML=`<b>${icon}</b>${left>0?Math.ceil(left/1000)+' s':lbl}`}
function studyAnswer(k){if(!ST||ST.state!=='ask')return;const cur=ST.qs[ST.i];cur.pick=k;cur.right=k===0;ST.res=ST.res||[];ST.res[ST.i]=cur.right;
  if(cur.right){ST.ok++;const amt=Math.max(8,Math.round(xpNeed(ST.m.l)*0.25/((RUN.cfg&&RUN.cfg.xp)||1)));ST.pend=(ST.pend||0)+amt;ST.fx={k:'hit',t:performance.now()}}
  else{ST.fx={k:'miss',t:performance.now()};ST.pend=(ST.pend||0)+Math.max(1,Math.round(xpNeed(ST.m.l)*0.05/((RUN.cfg&&RUN.cfg.xp)||1)));ST.pen=Date.now()+5000}
  ST.state='shown';renderStudy()}
function studyFinish(){const m=ST.m;m.stT=Date.now();if(ST.pend){const before=m.xp+xpNeed(m.l)*0;ST.msgs=gainXp(m,ST.pend);ST.xp=Math.round(ST.pend*((RUN.cfg&&RUN.cfg.xp)||1));for(const t of ST.msgs)sysChat(t);save();renderTeam();pushMt()}}
function closeStudy(){$('#study').classList.remove('on');ST=null;if(atHfPol())openHfPol()}
const STUDY_QT=15000;  // every question has a timer
function studyLoop(){if(!ST)return;if(ST.state==='ask'){if(ST.qi!==ST.i){ST.qi=ST.i;ST.qEnd=Date.now()+STUDY_QT}const l=Math.max(0,ST.qEnd-Date.now()),b=$('#sqbar');if(b)b.style.width=(l/STUDY_QT*100)+'%';if(l<=0)studyAnswer(-1)}const cv=$('#stcv');if(cv){const c=cv.getContext('2d');c.imageSmoothingEnabled=false;const W=360,H=150,now=performance.now(),t=now/1000;
    c.fillStyle='#3d7a34';c.fillRect(0,0,W,H);c.fillStyle='#4f9441';c.beginPath();c.ellipse(90,120,80,20,0,0,7);c.fill();c.beginPath();c.ellipse(270,62,70,16,0,0,7);c.fill();
    c.fillStyle='#5aa24b';for(let i=0;i<40;i++){c.fillRect((i*53)%W,(i*29)%H,2,2)}
    const fx=ST.fx,fk=fx?(now-fx.t)/500:9;
    const ex=studyExaminer();const es=monSprite(ex,24);let exX=270,exY=66;let exA=1;
    if(fx&&fx.k==='hit'&&fk<1){exX+=Math.sin(fk*30)*4;exA=Math.floor(fk*10)%2?0.4:1}
    c.globalAlpha=exA;c.save();c.translate(exX,exY+Math.sin(t*2)*2);c.scale(-1,1);c.drawImage(es,-40,-70,80,80);c.restore();c.globalAlpha=1;
    const ms=monSprite(ST.m.s,24);let mx=90,my=126;
    if(fx&&fx.k==='hit'&&fk<1){const e=Math.sin(fk*Math.PI);mx+=e*60;my-=e*24}
    if(fx&&fx.k==='miss'&&fk<1){mx+=Math.sin(fk*40)*5}
    const sx=SPECIES[ST.m.s].faceR?1:-1;c.save();c.translate(mx,my+Math.sin(t*3)*1.5);c.scale(sx,1);c.drawImage(ms,-48,-96,96,96);c.restore();
    if(fx&&fk<1.6){c.font='12px "Press Start 2P",monospace';c.textAlign='center';c.fillStyle='#14141f';const txt=fx.k==='hit'?'RICHTIG!':'FALSCH!';c.fillText(txt,W/2+1,31-fk*6);c.fillStyle=fx.k==='hit'?'#3ddc6b':'#ef4444';c.fillText(txt,W/2,30-fk*6)}}
  requestAnimationFrame(studyLoop)}

