/* ===================== STORY =====================
   Anwärter auf Gnade → (4 FEM-Legendäre gefangen) einsatzbereit → (alle Gesetzes-Monster gefangen) Polizist auf Ewigkeit.
   Durchsuchungsbeschlüsse gibt es nach bestandener PMLK (erst Kampf gegen die Klausur, dann Theorie-Fragen) an den vier
   Ausbildungsstandorten; nur mit Beschluss öffnet sich der Dungeon mit dem jeweiligen FEM-Monster. Progress per run (RUN.story). */
const FEM=['schlagstock','taser','pfefferspray','kelle'];
const PPLK_N=10,PPLK_MIN=8,PPLK_QT=15000,PPLK_CD=60000;
MCOL[T_CAVE]='#1b1430';
function caveTile(){TILE[T_CAVE]=[tileCanvas(x=>{x.fillStyle='#6b6f7a';x.fillRect(0,0,16,16);x.fillStyle='#8e929c';x.fillRect(0,0,16,3);x.fillRect(0,0,2,16);x.fillRect(14,0,2,16);
  x.fillStyle='#14141f';x.fillRect(2,3,12,13);x.fillStyle='#0a0a12';x.fillRect(3,4,10,12);x.fillStyle='#2a2a3a';x.fillRect(3,4,10,2);x.fillStyle='#b8bcc6';x.fillRect(1,1,3,1);x.fillRect(11,2,3,1)})]}
caveTile();{const _bt=buildTiles;buildTiles=function(){_bt();caveTile()}}
// the story (Karriereberater, PMLK, Beschlüsse, FEM dungeons, ranks) only exists in free play, not in lobby games
function storyOn(){return!!(RUN&&RUN.free)}
function storyOf(){if(!RUN)return null;RUN.story=RUN.story||{met:0,besch:{},cd:{}};RUN.story.besch=RUN.story.besch||{};RUN.story.cd=RUN.story.cd||{};return RUN.story}
function hasBesch(law){const s=storyOf();return!!(s&&s.besch[law])}
function femCaught(){return FEM.filter(s=>G&&G.dex&&G.dex[s])}
function lawRoster(){return rosterIds().filter(s=>SPECIES[s]&&(SPECIES[s].law||FEM.includes(s)))}
function rankOf(){if(G&&G.ewig)return{k:2,n:'Polizist auf Ewigkeit',i:'👑'};if(femCaught().length>=4)return{k:1,n:'Einsatzbereit – Anwärter auf Gnade',i:'🛡'};return{k:0,n:'Anwärter auf Gnade',i:'🎓'}}
function dungeonFor(law){return DUNGEONS.find(d=>d.law===law)}
function routesTo(id){const ch=['vil','mar','dam','lah','fel','unt','mos'],k=ch.indexOf(id);const rs=k>0?routeWay(ch[k-1],id):[];return rs.length?'Route '+rs.join(' → '):''}
function townName(id){const T=TOWNS.find(t=>t.id===id);return T?T.n:id}
// ---- career advisor
const BERATER_TXT=[
  'Ah, ein neues Gesicht! Willkommen in Villingen-Knastingen, Anwärter. Ich bin dein Karriereberater.',
  'Du willst der beste Polizist werden? Dann trainier dein Team bis Level 100, fang die Monster der Gesetze – und besteh am Ende meine Abschlussprüfung. Dann steigst du auf zum Polizisten auf Ewigkeit.',
  'Bis dahin bist du nur eins: Anwärter auf Gnade. Jederzeit widerruflich, versteht sich.',
  'Und ohne Ausrüstung bist du nicht einsatzbereit. Zuerst brauchst du die vier legendären FEM-Monster: Schlagstock, Taser, Pfefferspray und Kelle.',
  'Die stecken in Dungeons überall auf der Karte. Reinkommen? Nur mit Durchsuchungsbeschluss – § 105 StPO lässt grüßen!',
  'Die Beschlüsse gibt es an den Ausbildungsstandorten: Besteh dort die PMLK – die Praktische Monster Leistungskontrolle: erst besiegst du die Klausur, danach kommen die Theoriefragen.',
  `Dein erster Weg: ${routesTo('mar')||'nach Süden'} – nach Marderach zur ersten PMLK (StPO). Die Routenschilder zeigen dir, wie stark die wilden Monster dort sind.`,
  'Danach geht es weiter: Marderach prüft die StPO, dann Damental das GG, Lahribar das PolG und Unterwertheim das StGB. Folg den Routenschildern – Route 1 beginnt hier.',
  'Mostbach ist das Einsatzzentrum. Da laufen die ganz harten Brocken rum – geh erst hin, wenn du stark genug bist.',
  'Und wenn du alle vier FEM-Monster hast, kommst du zu mir: Dann nehme ich dir die Abschlussprüfung ab. Mein Team ist Level 100. Viel Erfolg!'];
function talkChain(who,lines,cb){let i=0;const nx=()=>{if(i>=lines.length){cb&&cb();return}talk(who,lines[i++],nx)};nx()}
function storyIntro(t){const s=storyOf();if(!s)return;P.lock=true;held.length=0;talkChain(t.n,BERATER_TXT,()=>{P.lock=false;s.met=1;save();renderTeam();storyStatus()})}
function storyStatus(){const s=storyOf();if(!s)return;const rk=rankOf(),fem=femCaught(),all=lawRoster(),got=all.filter(x=>G.dex[x]).length;
  const row=(ok,txt,sub)=>`<div style="display:flex;gap:8px;align-items:center;padding:3px 0;border-bottom:1px dashed #0002"><b style="width:20px;color:${ok?'#2e9a4a':'#9aa1bd'}">${ok?'✓':'○'}</b><span>${txt}${sub?`<br><span class="small">${sub}</span>`:''}</span></div>`;
  openModal(`<h3>${rk.i} ${esc(rk.n)}</h3><p class="small">Karriereberater: „So steht’s um deine Laufbahn.“</p><div style="text-align:left">
    <b>Durchsuchungsbeschlüsse (PMLK)</b>${DUNGEONS.map(d=>row(hasBesch(d.law),`${esc(d.law)} – ${esc(townName(d.town))} <span class="small">(${routesTo(d.town)})</span>`,`öffnet: ${esc(d.n)}`)).join('')}
    <b style="display:block;margin-top:8px">FEM-Ausrüstung</b>${DUNGEONS.map(d=>row(G.dex[d.id],esc(SPECIES[d.id]?SPECIES[d.id].n:d.id),esc(d.n))).join('')}
    <b style="display:block;margin-top:8px">Abschluss</b>${row(G.ewig,'Abschlussprüfung beim Karriereberater',`alle 4 FEM nötig · Team Lv ${BOSS_LV[0]}–${BOSS_LV[1]}`)}${row(got>=all.length,`Monster der Gesetze: ${got} / ${all.length} gefangen`,'Bonus: alle fangen')}</div>
    <div class="acts"><button class="btn ghost" id="sagain">NOCHMAL ERKLÄREN</button><button class="btn" id="mno">OK</button></div>`);
  $('#mno').onclick=closeModal;$('#sagain').onclick=()=>{closeModal();const t=TRAINERS.find(q=>q.id==='berater');talkChain(t.n,BERATER_TXT)}}
// ---- final boss: the career advisor himself (all four FEM monsters required)
function bossDialog(t){openModal(`<h3>👑 ABSCHLUSSPRÜFUNG</h3><p>${esc(t.n)}: „Alle vier FEM-Monster – nicht schlecht, Anwärter. Jetzt zeig mir, ob du wirklich Polizist auf Ewigkeit werden willst. Mein Team kennt keine Gnade.“</p><p class="small">6 Monster, Lv ${BOSS_LV[0]}–${BOSS_LV[1]}. Keine Fragen – nur Praxis.</p>
  <div class="acts"><button class="btn ghost" id="mno">NOCH NICHT</button><button class="btn red" id="myes">PRÜFUNG STARTEN</button></div>`);$('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();bossFight(t)}}
function bossFight(t){const strong=['boorberg','arenamon','zhang'].filter(s=>SPECIES[s]);const laws=['StGB','PolG','StPO','GG'].map(l=>lawSpecies(l).sort((a,b)=>SPECIES[b].b.reduce((x,y)=>x+y,0)-SPECIES[a].b.reduce((x,y)=>x+y,0))[0]).filter(Boolean);
  const ids=[...laws.slice(0,6-Math.min(2,strong.length)),...strong.slice(0,2)].slice(0,6);while(ids.length<6)ids.push(ids[ids.length%Math.max(1,ids.length)]||'owigon');
  const team=ids.map((s,q)=>[s,BOSS_LV[0]+q]);team[5][1]=BOSS_LV[1];
  const tr={id:'boss_berater',boss:1,fixed:true,x:t.x,y:t.y,n:t.n,c:t.c,d:t.d,team,reward:20,line:'Abschlussprüfung. Keine Gnade.',after:'Polizist auf Ewigkeit.'};if(RUN.beat)delete RUN.beat[tr.id];startTrainer(tr)}
// ---- PMLK: first the exam fight ("die Klausur"), then theory (10 questions, 8 correct, 15 s each); a won fight stays won
function storyBump(t){if(!storyOn())return;if(!RUN||RUN.phase!=='train'){toast(`${t.n}: „Komm wieder, wenn dein Spiel begonnen hat!“`);return}const s=storyOf();
  if(t.story==='berater'){if(!s.met){storyIntro(t);return}if(femCaught().length>=4&&!(G&&G.ewig)){bossDialog(t);return}storyStatus();return}
  if(t.story==='pplk'){const dg=dungeonFor(t.law);
    if(hasBesch(t.law)){talk(t.n,`Bestanden ist bestanden. Dein Durchsuchungsbeschluss (${t.law}) für die ${dg?dg.n:'Dungeon'} ist gültig – ab ins Einsatzgebiet!`);return}
    const left=(s.cd[t.town]||0)-Date.now();if(left>0){talk(t.n,`Nach dem Durchfallen gibt es eine Nachdenkpause. Wiederholung in ${Math.ceil(left/1000)} s.`);return}
    const fw=!!(s.pfw&&s.pfw[t.town]);
    openModal(`<h3>📝 PMLK – ${esc(t.law)}</h3><p>${esc(t.n)}: „Praktische Monster Leistungskontrolle im <b>${esc(t.law)}</b>. Wer besteht, bekommt den Durchsuchungsbeschluss für die <b>${esc(dg?dg.n:'Dungeon')}</b>.“</p>
      <div style="text-align:left" class="small">${fw?'✓ ':'1. '}Praxis: Kampf gegen die Klausur (Lv ${PPLK[t.town].lv}+)${fw?' – bestanden':''}.<br>${fw?'➜ ':'2. '}Theorie: ${PPLK_N} Fragen zum ${esc(t.law)}, je ${PPLK_QT/1000} s – mindestens ${PPLK_MIN} richtig.</div>
      <div class="acts"><button class="btn ghost" id="mno">SPÄTER</button><button class="btn" id="myes">${fw?'THEORIE STARTEN':'KAMPF STARTEN'}</button></div>`);
    $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();fw?pplkTheory(t):pplkFight(t)}}}
let PQ=null;
function pplkTheory(t){const pool=shuffleArr(lawQuestions(t.law)).slice(0,PPLK_N);if(!pool.length){pplkPass(t);return}let i=0,right=0;held.length=0;
  const ask=()=>{const it=pool[i],order=shuffleArr([0,1,2,3]);CQ={it,order,end:Infinity,done:false,cb:null};let qEnd=Date.now()+PPLK_QT;const myQ=CQ;
    $('#cqbox').innerHTML=`<div class="sdlg"><span class="slaw">📝 PMLK ${esc(t.law)} · Frage ${i+1}/${pool.length} · ${right} richtig${it.src?' · '+esc(SPECIES[it.src].law||''):''}</span><br>${esc(it.q[0])}<div class="cqt"><i id="cqbar"></i></div><div class="small" id="cqtime" style="text-align:right">${PPLK_QT/1000} s</div><div id="cqexp"></div></div>
      <div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${j+1}</span>${esc(it.q[1][k])}</button>`).join('')}</div><div class="sacts" id="cqact"></div>`;
    $('#cquiz').classList.remove('lite');$('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(bt=>bt.onclick=()=>pick(+bt.dataset.ck));
    clearInterval(PQ);PQ=setInterval(()=>{if(CQ!==myQ||myQ.done){clearInterval(PQ);return}if(PANIC){qEnd+=100;return}const l=Math.max(0,qEnd-Date.now()),bar=$('#cqbar');
      if(bar){bar.style.width=(l/PPLK_QT*100)+'%';bar.style.background=l<PPLK_QT/3?'#ef4444':'#ffcb3d'}const tt=$('#cqtime');if(tt)tt.textContent=Math.ceil(l/1000)+' s';if(l<=0)pick(-1)},100)};
  const pick=k=>{if(!CQ||CQ.done)return;CQ.done=true;clearInterval(PQ);const ok=k===0,it=CQ.it;if(ok)right++;
    document.querySelectorAll('[data-ck]').forEach(bt=>{const kk=+bt.dataset.ck;bt.disabled=true;bt.classList.add(kk===0?'ok':kk===k?'bad':'dim')});
    $('#cqexp').innerHTML=`<div class="sexp ${ok?'ok':'bad'}">${qFb(ok,k,it.q)}</div>`;
    const need=Math.min(PPLK_MIN,pool.length),last=i>=pool.length-1,lost=right+(pool.length-1-i)<need;
    $('#cqact').innerHTML=`<button class="btn" id="cqnext">${last||lost?'ERGEBNIS':'NÄCHSTE FRAGE'}</button>`;
    $('#cqnext').onclick=()=>{if(!last&&!lost){i++;ask();return}$('#cquiz').classList.remove('on');CQ=null;CQ_PICK=null;
      if(right>=need){talk(t.n,`${right} von ${pool.length} – Theorie bestanden! Die PMLK im ${t.law} ist geschafft.`,()=>pplkPass(t))}
      else{storyOf().cd[t.town]=Date.now()+PPLK_CD;save();talk(t.n,`${right} richtig – zu wenig (mindestens ${need}). Den Kampf hast du schon – lern nach (HfPol oder IAuT) und versuch die Theorie in einer Minute nochmal.`)}}};
  CQ_PICK=pick;ask()}
function pplkPass(t){const s=storyOf();s.besch[t.law]=1;save();const dg=dungeonFor(t.law);toast(`📜 Durchsuchungsbeschluss (${t.law}) erhalten!`);
  sysChat(`📜 PMLK ${t.law} bestanden! Dein Durchsuchungsbeschluss öffnet die ${dg?dg.n:'Dungeon'}.`);try{renderTeam()}catch(e){}}
function pplkFight(t){const p=PPLK[t.town],pool=lawSpecies(t.law);const n=4;
  const team=Array.from({length:n},(_,q)=>[pool.length?pool[(hashStr(t.id)+q)%pool.length]:'owigon',p.lv+(q===n-1?3:q)]);
  const tr={id:'klausur_'+t.town,pplk:t.law,town:t.town,fixed:true,x:t.x,y:t.y,n:'Klausur '+t.law,c:t.c,d:t.d,team,reward:6,line:`Ich bin die Klausur im ${t.law}. Keiner besteht mich beim ersten Versuch!`,after:'Bestanden.'};
  if(RUN.beat)delete RUN.beat[tr.id];startTrainer(tr)}
{const _tw=trainerWin;trainerWin=async function(){const t=B&&B.trainer;if(t&&t.boss){G.ewig=1;save();say('👑 Du bist jetzt Polizist auf Ewigkeit!');setTimeout(()=>sysChat('👑 Abschlussprüfung bestanden – Polizist auf Ewigkeit!'),2600)}if(t&&t.pplk){const s=storyOf();(s.pfw=s.pfw||{})[t.town]=1;save();say('Klausur besiegt! Jetzt folgt die Theorie.');
    const np=TRAINERS.find(x=>x.story==='pplk'&&x.town===t.town);if(np){const w=()=>{if(B||$('#modal').classList.contains('on')){setTimeout(w,300);return}
      talk(np.n,`Praxis bestanden! Jetzt die Theorie: ${PPLK_N} Fragen zum ${np.law}, je ${PPLK_QT/1000} s – mindestens ${PPLK_MIN} richtig.`,()=>pplkTheory(np))};setTimeout(w,600)}}
  return _tw.apply(this,arguments)}}
// ---- dungeon doors
function caveDungeon(x,y){return DUNGEONS.find(d=>d.ex===x&&d.ey===y)||null}
{const _tb=tollBlock;tollBlock=function(nx,ny){if(tget(nx,ny)===T_CAVE&&ny<MH){const dg=caveDungeon(nx,ny);if(dg&&RUN&&RUN.phase==='train'&&(!storyOn()||!hasBesch(dg.law))){if((P.bumpCd||0)<=0){P.bumpCd=1.5;
      if(!storyOn())talk('Wachtmeister am Eingang','Gesperrt. Durchsuchungen gibt es nur in der Laufbahn im freien Spiel.');else talk('Wachtmeister am Eingang',`Halt! Hier beginnt die ${dg.n}. Ohne Durchsuchungsbeschluss (${dg.law}) kommt hier keiner rein. Den gibt’s nach bestandener PMLK in ${townName(dg.town)}.`)}return true}}
  return _tb(nx,ny)}}
{const _oa=onArrive;onArrive=function(){_oa();if(P.fly||B)return;const t=tget(P.x,P.y);if(t!==T_CAVE||!RUN||RUN.phase!=='train')return;
  if(P.y<MH){const dg=caveDungeon(P.x,P.y);if(!dg||!storyOn()||!hasBesch(dg.law))return;P.lock=true;transition('fade',()=>{teleport(dg.sx,dg.sy);P.d='up';P.lock=false;toast(`🔦 ${dg.n} – Durchsuchung läuft!`)},300,350)}
  else{const dg=dungeonAt(P.x,P.y);if(!dg)return;P.lock=true;transition('fade',()=>{teleport(dg.ex,dg.ey+1);P.d='down';P.lock=false;toast('☀ Zurück an der frischen Luft.')},300,350)}}}
// ---- darkness inside the dungeons: a light circle around the player
{const _dw=drawWorld;drawWorld=function(){_dw.apply(this,arguments);if(!P||P.fy<MH||typeof wc==='undefined')return;try{const dpr=Math.min(3,devicePixelRatio||1),K=Math.max(1,Math.round(SC*dpr));const c=wc;c.setTransform(K,0,0,K,0,0);
  let camX=Math.round(P.fx*16+8-LW/2),camY=Math.round(P.fy*16+8-LH/2);camX=clamp(camX,0,MW*16-LW);camY=clamp(camY,MH*16,MHT*16-LH);const px=P.fx*16+8-camX,py=P.fy*16+8-camY;
  const g=c.createRadialGradient(px,py,40,px,py,150);g.addColorStop(0,'rgba(8,6,18,0)');g.addColorStop(0.55,'rgba(8,6,18,0.45)');g.addColorStop(1,'rgba(8,6,18,0.85)');c.fillStyle=g;c.fillRect(0,0,LW,LH)}catch(e){}}}
// ---- rank + story box in the side panel; a promotion is celebrated once
{const _rt=renderTeam;renderTeam=function(){_rt.apply(this,arguments);try{if(!G||!RUN||!storyOn())return;const el=$('#pane-team'),st=el&&el.querySelector('.stats');if(!st)return;const s=storyOf(),rk=rankOf();
  const nb=DUNGEONS.filter(d=>hasBesch(d.law)).length,nf=femCaught().length,all=lawRoster(),got=all.filter(x=>G.dex[x]).length;
  const next=!s.met?'Sprich mit dem Karriereberater in Villingen.':nb<4&&nf<4?(()=>{const tw=(DUNGEONS.find(d=>!hasBesch(d.law))||DUNGEONS[0]).town;return`Nächstes Ziel: PMLK in ${esc(townName(tw))} (${routesTo(tw)}).`})():nf<4?'Durchsuche die Dungeons und fang die FEM-Monster!':!G.ewig?'Abschlussprüfung beim Karriereberater in Villingen!':got<all.length?'Bonus: Fang alle Monster der Gesetze!':'Du hast alles geschafft!';
  st.insertAdjacentHTML('beforeend',`<div class="stat" style="grid-column:1/-1;cursor:pointer" id="srank" title="Laufbahn anzeigen">Laufbahn<b style="font-size:16px">${rk.i} ${esc(rk.n)}</b><span class="small">📜 ${nb}/4 Beschlüsse · 🛡 ${nf}/4 FEM · 📖 ${got}/${all.length} · ${next}</span></div>`);
  $('#srank').onclick=()=>{if(s.met)storyStatus();else toast('Sprich zuerst mit dem Karriereberater in Villingen.')};
  G.rankSeen=G.rankSeen||0;if(rk.k>G.rankSeen&&!B&&!modalOpen()){G.rankSeen=rk.k;save();setTimeout(()=>openModal(`<h3>${rk.i} BEFÖRDERUNG!</h3><p>${rk.k===2?'Abschlussprüfung bestanden. Ab heute bist du <b>Polizist auf Ewigkeit</b>!':'Alle vier FEM-Monster gefangen – du bist jetzt <b>einsatzbereit</b>. Der Karriereberater in Villingen erwartet dich zur Abschlussprüfung!'}</p><div class="acts"><button class="btn" id="mno">JAWOHL!</button></div>`)||($('#mno').onclick=closeModal),300)}}catch(e){}}}
// ---- a floating "!" above the advisor while he has something to say (first talk, final exam); red = final exam
function storyMark(t){if(!t||!t.story||!storyOn()||!RUN||RUN.phase!=='train')return 0;const s=storyOf();if(t.story==='berater'){if(!s.met)return 1;if(femCaught().length>=4&&!(G&&G.ewig))return 2}return 0}
