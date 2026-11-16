/* ===================== STORY =====================
   Anwärter auf Gnade → (4 FEM-Legendäre gefangen) einsatzbereit → (alle Gesetzes-Monster gefangen) Polizist auf Ewigkeit.
   Durchsuchungsbeschlüsse gibt es nach bestandener PPLK (Theorie-Fragen + Kampf gegen die Klausur) an den vier
   Ausbildungsstandorten; nur mit Beschluss öffnet sich der Dungeon mit dem jeweiligen FEM-Monster. Progress per run (RUN.story). */
const FEM=['schlagstock','taser','pfefferspray','kelle'];
const PPLK_N=8,PPLK_MIN=6,PPLK_QT=20000,PPLK_CD=60000;
MCOL[T_CAVE]='#1b1430';
function caveTile(){TILE[T_CAVE]=[tileCanvas(x=>{x.fillStyle='#6b6f7a';x.fillRect(0,0,16,16);x.fillStyle='#8e929c';x.fillRect(0,0,16,3);x.fillRect(0,0,2,16);x.fillRect(14,0,2,16);
  x.fillStyle='#14141f';x.fillRect(2,3,12,13);x.fillStyle='#0a0a12';x.fillRect(3,4,10,12);x.fillStyle='#2a2a3a';x.fillRect(3,4,10,2);x.fillStyle='#b8bcc6';x.fillRect(1,1,3,1);x.fillRect(11,2,3,1)})]}
caveTile();{const _bt=buildTiles;buildTiles=function(){_bt();caveTile()}}
function storyOf(){if(!RUN)return null;RUN.story=RUN.story||{met:0,besch:{},cd:{}};RUN.story.besch=RUN.story.besch||{};RUN.story.cd=RUN.story.cd||{};return RUN.story}
function hasBesch(law){const s=storyOf();return!!(s&&s.besch[law])}
function femCaught(){return FEM.filter(s=>G&&G.dex&&G.dex[s])}
function lawRoster(){return rosterIds().filter(s=>SPECIES[s]&&(SPECIES[s].law||FEM.includes(s)))}
function rankOf(){const all=lawRoster(),got=all.filter(s=>G.dex[s]);if(femCaught().length>=4&&got.length>=all.length)return{k:2,n:'Polizist auf Ewigkeit',i:'👑'};if(femCaught().length>=4)return{k:1,n:'Einsatzbereit – Anwärter auf Gnade',i:'🛡'};return{k:0,n:'Anwärter auf Gnade',i:'🎓'}}
function dungeonFor(law){return DUNGEONS.find(d=>d.law===law)}
function townName(id){const T=TOWNS.find(t=>t.id===id);return T?T.n:id}
// ---- career advisor
const BERATER_TXT=[
  'Ah, ein neues Gesicht! Willkommen in Villingen-Knastingen, Anwärter. Ich bin dein Karriereberater.',
  'Du willst der beste Polizist werden? Ganz einfach: Fang ALLE Monster der Gesetze – dann steigst du auf zum Polizisten auf Ewigkeit.',
  'Bis dahin bist du nur eins: Anwärter auf Gnade. Jederzeit widerruflich, versteht sich.',
  'Und ohne Ausrüstung bist du nicht einsatzbereit. Zuerst brauchst du die vier legendären FEM-Monster: Schlagstock, Taser, Pfefferspray und Kelle.',
  'Die stecken in Dungeons überall auf der Karte. Reinkommen? Nur mit Durchsuchungsbeschluss – § 105 StPO lässt grüßen!',
  'Die Beschlüsse gibt es an den Ausbildungsstandorten: Besteh dort die PPLK – die Praktische Peasant Leistungskontrolle – und besiege die Klausur.',
  'Damental prüft das GG, Marderach die StPO, Lahribar das PolG und Unterwertheim das StGB. In dieser Reihenfolge wird es schwerer.',
  'Und Mostbach? Das ist das Einsatzzentrum. Da laufen die ganz harten Brocken rum – geh da erst hin, wenn du einsatzbereit bist. Viel Erfolg!'];
function talkChain(who,lines,cb){let i=0;const nx=()=>{if(i>=lines.length){cb&&cb();return}talk(who,lines[i++],nx)};nx()}
function storyIntro(t){const s=storyOf();if(!s)return;P.lock=true;held.length=0;talkChain(t.n,BERATER_TXT,()=>{P.lock=false;s.met=1;save();renderTeam();storyStatus()})}
function storyStatus(){const s=storyOf();if(!s)return;const rk=rankOf(),fem=femCaught(),all=lawRoster(),got=all.filter(x=>G.dex[x]).length;
  const row=(ok,txt,sub)=>`<div style="display:flex;gap:8px;align-items:center;padding:3px 0;border-bottom:1px dashed #0002"><b style="width:20px;color:${ok?'#2e9a4a':'#9aa1bd'}">${ok?'✓':'○'}</b><span>${txt}${sub?`<br><span class="small">${sub}</span>`:''}</span></div>`;
  openModal(`<h3>${rk.i} ${esc(rk.n)}</h3><p class="small">Karriereberater: „So steht’s um deine Laufbahn.“</p><div style="text-align:left">
    <b>Durchsuchungsbeschlüsse (PPLK)</b>${DUNGEONS.map(d=>row(hasBesch(d.law),`${esc(d.law)} – ${esc(townName(d.town))}`,`öffnet: ${esc(d.n)}`)).join('')}
    <b style="display:block;margin-top:8px">FEM-Ausrüstung</b>${DUNGEONS.map(d=>row(G.dex[d.id],esc(SPECIES[d.id]?SPECIES[d.id].n:d.id),esc(d.n))).join('')}
    <b style="display:block;margin-top:8px">Monster der Gesetze</b>${row(got>=all.length,`${got} / ${all.length} gefangen`,'Alle fangen → Polizist auf Ewigkeit')}</div>
    <div class="acts"><button class="btn ghost" id="sagain">NOCHMAL ERKLÄREN</button><button class="btn" id="mno">OK</button></div>`);
  $('#mno').onclick=closeModal;$('#sagain').onclick=()=>{closeModal();const t=TRAINERS.find(q=>q.id==='berater');talkChain(t.n,BERATER_TXT)}}
// ---- PPLK: theory (8 questions, 6 correct, 20 s each) then the exam fight ("die Klausur")
function storyBump(t){if(!RUN||RUN.phase!=='train'){toast(`${t.n}: „Komm wieder, wenn dein Spiel begonnen hat!“`);return}const s=storyOf();
  if(t.story==='berater'){if(!s.met)storyIntro(t);else storyStatus();return}
  if(t.story==='pplk'){const dg=dungeonFor(t.law);
    if(hasBesch(t.law)){talk(t.n,`Bestanden ist bestanden. Dein Durchsuchungsbeschluss (${t.law}) für die ${dg?dg.n:'Dungeon'} ist gültig – ab ins Einsatzgebiet!`);return}
    const left=(s.cd[t.town]||0)-Date.now();if(left>0){talk(t.n,`Nach dem Durchfallen gibt es eine Nachdenkpause. Wiederholung in ${Math.ceil(left/1000)} s.`);return}
    openModal(`<h3>📝 PPLK – ${esc(t.law)}</h3><p>${esc(t.n)}: „Praktische Peasant Leistungskontrolle im <b>${esc(t.law)}</b>. Wer besteht, bekommt den Durchsuchungsbeschluss für die <b>${esc(dg?dg.n:'Dungeon')}</b>.“</p>
      <div style="text-align:left" class="small">1. Theorie: ${PPLK_N} Fragen zum ${esc(t.law)}, je ${PPLK_QT/1000} s – mindestens ${PPLK_MIN} richtig.<br>2. Praxis: Kampf gegen die Klausur (Lv ${PPLK[t.town].lv}+).</div>
      <div class="acts"><button class="btn ghost" id="mno">SPÄTER</button><button class="btn" id="myes">PPLK STARTEN</button></div>`);
    $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();pplkTheory(t)}}}
let PQ=null;
function pplkTheory(t){const pool=shuffleArr(lawQuestions(t.law)).slice(0,PPLK_N);if(!pool.length){pplkFight(t);return}let i=0,right=0;held.length=0;
  const ask=()=>{const it=pool[i],order=shuffleArr([0,1,2,3]);CQ={it,order,end:Infinity,done:false,cb:null};const qEnd=Date.now()+PPLK_QT,myQ=CQ;
    $('#cqbox').innerHTML=`<div class="sdlg"><span class="slaw">📝 PPLK ${esc(t.law)} · Frage ${i+1}/${pool.length} · ${right} richtig${it.src?' · '+esc(SPECIES[it.src].law||''):''}</span><br>${esc(it.q[0])}<div class="cqt"><i id="cqbar"></i></div><div class="small" id="cqtime" style="text-align:right">${PPLK_QT/1000} s</div><div id="cqexp"></div></div>
      <div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${j+1}</span>${esc(it.q[1][k])}</button>`).join('')}</div><div class="sacts" id="cqact"></div>`;
    $('#cquiz').classList.remove('lite');$('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(bt=>bt.onclick=()=>pick(+bt.dataset.ck));
    clearInterval(PQ);PQ=setInterval(()=>{if(CQ!==myQ||myQ.done){clearInterval(PQ);return}if(typeof PANIC!=='undefined'&&PANIC)return;const l=Math.max(0,qEnd-Date.now()),bar=$('#cqbar');
      if(bar){bar.style.width=(l/PPLK_QT*100)+'%';bar.style.background=l<PPLK_QT/3?'#ef4444':'#ffcb3d'}const tt=$('#cqtime');if(tt)tt.textContent=Math.ceil(l/1000)+' s';if(l<=0)pick(-1)},100)};
  const pick=k=>{if(!CQ||CQ.done)return;CQ.done=true;clearInterval(PQ);const ok=k===0,it=CQ.it;if(ok)right++;
    document.querySelectorAll('[data-ck]').forEach(bt=>{const kk=+bt.dataset.ck;bt.disabled=true;bt.classList.add(kk===0?'ok':kk===k?'bad':'dim')});
    $('#cqexp').innerHTML=`<div class="sexp ${ok?'ok':'bad'}">${ok?'✓ Richtig.':k<0?'⏱ Zeit abgelaufen.':'✗ Falsch.'} ${esc(it.q[2]||'')}</div>`;
    const last=i>=pool.length-1,lost=right+(pool.length-1-i)<PPLK_MIN;
    $('#cqact').innerHTML=`<button class="btn" id="cqnext">${last||lost?'ERGEBNIS':'NÄCHSTE FRAGE'}</button>`;
    $('#cqnext').onclick=()=>{if(!last&&!lost){i++;ask();return}$('#cquiz').classList.remove('on');CQ=null;CQ_PICK=null;
      if(right>=PPLK_MIN){talk(t.n,`${right} von ${pool.length} – Theorie bestanden! Jetzt die Praxis: Die Klausur wartet. Zeig, was dein Team kann!`,()=>pplkFight(t))}
      else{storyOf().cd[t.town]=Date.now()+PPLK_CD;save();talk(t.n,`${right} richtig – zu wenig (mindestens ${PPLK_MIN}). Lern an der HfPol nach und komm in einer Minute wieder.`)}}};
  CQ_PICK=pick;ask()}
function pplkFight(t){const p=PPLK[t.town],pool=lawSpecies(t.law);const n=4;
  const team=Array.from({length:n},(_,q)=>[pool.length?pool[(hashStr(t.id)+q)%pool.length]:'owigon',p.lv+(q===n-1?3:q)]);
  const tr={id:'klausur_'+t.town,pplk:t.law,town:t.town,fixed:true,x:t.x,y:t.y,n:'Klausur '+t.law,c:t.c,d:t.d,team,reward:6,line:`Ich bin die Klausur im ${t.law}. Keiner besteht mich beim ersten Versuch!`,after:'Bestanden.'};
  if(RUN.beat)delete RUN.beat[tr.id];startTrainer(tr)}
{const _tw=trainerWin;trainerWin=async function(){const t=B&&B.trainer;if(t&&t.pplk){const s=storyOf();s.besch[t.pplk]=1;save();const dg=dungeonFor(t.pplk);
    say(`📜 Durchsuchungsbeschluss (${t.pplk}) erhalten!`);setTimeout(()=>sysChat(`📜 PPLK ${t.pplk} bestanden! Dein Durchsuchungsbeschluss öffnet die ${dg?dg.n:'Dungeon'}.`),2600)}
  return _tw.apply(this,arguments)}}
// ---- dungeon doors
function caveDungeon(x,y){return DUNGEONS.find(d=>d.ex===x&&d.ey===y)||null}
{const _tb=tollBlock;tollBlock=function(nx,ny){if(tget(nx,ny)===T_CAVE&&ny<MH){const dg=caveDungeon(nx,ny);if(dg&&RUN&&RUN.phase==='train'&&!hasBesch(dg.law)){if((P.bumpCd||0)<=0){P.bumpCd=1.5;
      talk('Wachtmeister am Eingang',`Halt! Hier beginnt die ${dg.n}. Ohne Durchsuchungsbeschluss (${dg.law}) kommt hier keiner rein. Den gibt’s nach bestandener PPLK in ${townName(dg.town)}.`)}return true}}
  return _tb(nx,ny)}}
{const _oa=onArrive;onArrive=function(){_oa();if(P.fly||B)return;const t=tget(P.x,P.y);if(t!==T_CAVE||!RUN||RUN.phase!=='train')return;
  if(P.y<MH){const dg=caveDungeon(P.x,P.y);if(!dg||!hasBesch(dg.law))return;P.lock=true;transition('fade',()=>{teleport(dg.sx,dg.sy);P.d='up';P.lock=false;toast(`🔦 ${dg.n} – Durchsuchung läuft!`)},300,350)}
  else{const dg=dungeonAt(P.x,P.y);if(!dg)return;P.lock=true;transition('fade',()=>{teleport(dg.ex,dg.ey+1);P.d='down';P.lock=false;toast('☀ Zurück an der frischen Luft.')},300,350)}}}
// ---- darkness inside the dungeons: a light circle around the player
{const _dw=drawWorld;drawWorld=function(){_dw.apply(this,arguments);if(!P||P.fy<MH||typeof wc==='undefined')return;try{const dpr=Math.min(3,devicePixelRatio||1),K=Math.max(1,Math.round(SC*dpr));const c=wc;c.setTransform(K,0,0,K,0,0);
  let camX=Math.round(P.fx*16+8-LW/2),camY=Math.round(P.fy*16+8-LH/2);camX=clamp(camX,0,MW*16-LW);camY=clamp(camY,MH*16,MHT*16-LH);const px=P.fx*16+8-camX,py=P.fy*16+8-camY;
  const g=c.createRadialGradient(px,py,40,px,py,150);g.addColorStop(0,'rgba(8,6,18,0)');g.addColorStop(0.55,'rgba(8,6,18,0.45)');g.addColorStop(1,'rgba(8,6,18,0.85)');c.fillStyle=g;c.fillRect(0,0,LW,LH)}catch(e){}}}
// ---- rank + story box in the side panel; a promotion is celebrated once
{const _rt=renderTeam;renderTeam=function(){_rt.apply(this,arguments);try{if(!G||!RUN)return;const el=$('#pane-team'),st=el&&el.querySelector('.stats');if(!st)return;const s=storyOf(),rk=rankOf();
  const nb=DUNGEONS.filter(d=>hasBesch(d.law)).length,nf=femCaught().length,all=lawRoster(),got=all.filter(x=>G.dex[x]).length;
  const next=!s.met?'Sprich mit dem Karriereberater in Villingen.':nb<4&&nf<4?`Nächstes Ziel: PPLK in ${esc(townName((DUNGEONS.find(d=>!hasBesch(d.law))||DUNGEONS[0]).town))}.`:nf<4?'Durchsuche die Dungeons und fang die FEM-Monster!':got<all.length?'Fang alle Monster der Gesetze! (Mostbach wartet)':'Du hast es geschafft!';
  st.insertAdjacentHTML('beforeend',`<div class="stat" style="grid-column:1/-1;cursor:pointer" id="srank" title="Laufbahn anzeigen">Laufbahn<b style="font-size:16px">${rk.i} ${esc(rk.n)}</b><span class="small">📜 ${nb}/4 Beschlüsse · 🛡 ${nf}/4 FEM · 📖 ${got}/${all.length} · ${next}</span></div>`);
  $('#srank').onclick=()=>{if(s.met)storyStatus();else toast('Sprich zuerst mit dem Karriereberater in Villingen.')};
  G.rankSeen=G.rankSeen||0;if(rk.k>G.rankSeen&&!B&&!modalOpen()){G.rankSeen=rk.k;save();setTimeout(()=>openModal(`<h3>${rk.i} BEFÖRDERUNG!</h3><p>${rk.k===2?'Du hast alle Monster der Gesetze gefangen. Ab heute bist du <b>Polizist auf Ewigkeit</b>!':'Alle vier FEM-Monster gefangen – du bist jetzt <b>einsatzbereit</b>. Das Einsatzzentrum Mostbach wartet!'}</p><div class="acts"><button class="btn" id="mno">JAWOHL!</button></div>`)||($('#mno').onclick=closeModal),300)}}catch(e){}}}
// ---- the advisor greets every new trainee once the game has started
setInterval(()=>{try{if(window.NO_STORY_INTRO||!RUN||RUN.phase!=='train'||B||P.lock||modalOpen()||P.moving)return;const s=storyOf();if(s.met||s.greeted)return;const t=TRAINERS.find(q=>q.id==='berater');if(!t||Math.abs(P.x-t.x)+Math.abs(P.y-t.y)>8)return;s.greeted=1;storyIntro(t)}catch(e){}},1000);
