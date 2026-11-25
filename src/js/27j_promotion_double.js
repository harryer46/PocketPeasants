/* Fallhöhe-Fragen:
   - Beförderungsprüfung: Vor der Entwicklungs-Animation 3 Fragen zum Paragraphen des Monsters.
     2 von 3 richtig → Beförderung mit Auszeichnung: +6 % auf alle Werte (stapelt je Entwicklung). Sonst entwickelt es sich ohne Bonus.
   - Doppelt oder nichts (freiwillig) nach einem Trainer-Sieg: eine Fallfrage. Richtig → Preisgeld und EP aus dem Kampf noch einmal;
     falsch → Preisgeld und alle EP aus dem Kampf weg (Monster fallen auf den Stand vor dem Kampf zurück). */
{const _st=stats;stats=function(m){const s=_st.apply(this,arguments);if(m&&m.prom){const f=1+0.06*m.prom;s.mhp=Math.round(s.mhp*f);s.atk=Math.round(s.atk*f);s.def=Math.round(s.def*f);s.spd=Math.round(s.spd*f)}return s}}
// small modal quiz: questions realized ([text, 4 answers (0 = right), explanation]); keys 1–4 answer, Space/Enter continues
function quickQuiz(title,intro,qs,done){let i=0,ok=0,ans=null;const keys=e=>{if(!$('#modal').classList.contains('on')||!$('#qqbox')){removeEventListener('keydown',keys,true);return}
    const n=+e.key;if(ans==null&&n>=1&&n<=4){e.preventDefault();e.stopImmediatePropagation();pick(QQ.order[n-1])}else if(ans!=null&&e.key===' '){e.preventDefault();e.stopImmediatePropagation();next()}};
  const QQ={order:[0,1,2,3]};addEventListener('keydown',keys,true);
  const render=()=>{const q=qs[i];QQ.order=QQ.order&&ans!=null?QQ.order:qShuffle([0,1,2,3]);
    openModal(`<div id="qqbox"><h3>${title}</h3><p class="small">${intro} · Frage ${i+1}/${qs.length} · ${ok} richtig</p><div class="sdlg" style="margin:6px 0">${q.pre?`<span class="slaw">${esc(q.pre)}</span><br>`:''}${esc(q[0])}${ans==null?`<button class="btn ghost" id="qqrep0" style="float:right;font-size:8px;padding:2px 5px;margin:2px 0 0 6px" title="Frage fehlerhaft? Melden">${qReported(q[0])?'⚑ GEMELDET':'⚑ MELDEN'}</button>`:''}</div>
      <div class="sans">${QQ.order.map((k,j)=>`<button class="sa ${ans==null?'':k===0?'ok':k===ans?'bad':'dim'}" data-qq="${k}" ${ans!=null?'disabled':''}><span class="sk">${j+1}</span>${esc(q[1][k])}</button>`).join('')}</div>
      ${ans!=null?`<div class="sexp ${ans===0?"ok":"bad"}" style="margin-top:6px;color:${ans===0?"#0f3d1f":"#fff"};background:${ans===0?"#c8f5d6":"#7a1f1f"}">${ans===0?'✔ Richtig!':'✘ Falsch.'} ${esc(q[2]||'')}</div><div class="acts" style="margin-top:8px"><button class="btn ghost" id="qqrep" style="font-size:9px">${qReported(q[0])?'⚑ GEMELDET':'⚑ FRAGE MELDEN'}</button><button class="btn" id="qqnext">${i+1<qs.length?'WEITER ▶':'ERGEBNIS ▶'}</button></div>`:''}</div>`);
    document.querySelectorAll('[data-qq]').forEach(b=>b.onclick=()=>pick(+b.dataset.qq));const nx=$('#qqnext');if(nx)nx.onclick=next;for(const id of['#qqrep','#qqrep0']){const rp=$(id);if(rp)rp.onclick=()=>{qReport(q[0]);rp.textContent='⚑ GEMELDET';rp.disabled=true}}};
  const pick=k=>{if(ans!=null)return;ans=k;if(k===0)ok++;qsLog(qs[i][0],k===0);render()};
  const next=()=>{if(ans==null)return;ans=null;QQ.order=null;i++;if(i>=qs.length){removeEventListener('keydown',keys,true);closeModal();done(ok);return}render()};
  render()}
function promoQuestions(m){const sid=m.s,sp=SPECIES[sid],base=sp.evoOf||sid,raw=(QZ[sid]||QZ[base]||[]).filter(q=>!qReported(q[0]));const out=[],av=new Set();
  for(const q of qwSample(raw,3)){const r=q.q||q;if(av.has(r[0]))continue;av.add(r[0]);out.push(qReal(r))}
  const book=lawOf(base)||lawOf(sid);while(out.length<3){const q=caseFor(['StGB','StPO','PolG','GG','BtMG'].includes(book)?book:null,av);if(!q)break;av.add(q[0]);out.push(qReal(q))}
  return out}
// queue: exam first, then the animation
{const _gx=gainXp;gainXp=function(m,amt){const s0=m&&m.s;const out=_gx.apply(this,arguments);try{if(m&&s0&&m.s!==s0&&EVO_Q.length)EVO_Q[EVO_Q.length-1].m=m}catch(e){}return out}}
const _evoPlay=evoPlay;evoPlay=function(ev){const m=ev.m;if(!m||!RUN||!RUN.team.includes(m))return _evoPlay(ev);const qs=promoQuestions(m);if(qs.length<3)return _evoPlay(ev);
  return new Promise(res=>{quickQuiz(`🎖 BEFÖRDERUNGSPRÜFUNG`,`${esc(SPECIES[ev.from].n)} steht vor der Beförderung – 2 von 3 richtig für die Auszeichnung`,qs,ok=>{const pass=ok>=2;
    if(pass){m.prom=(m.prom||0)+1;m.hp=Math.min(stats(m).mhp,m.hp+Math.round(stats(m).mhp*0.06));save()}
    _evoPlay(ev).then(()=>{toast(pass?`🎖 Mit Auszeichnung befördert (${ok}/3): ${SPECIES[m.s].n} bekommt +6 % auf alle Werte!`:`Beförderung ohne Auszeichnung (${ok}/3) – kein Bonus diesmal.`);if(pass)sysChat(`🎖 ${SPECIES[m.s].n} wurde mit Auszeichnung befördert (${ok}/3).`);renderTeam();res()})})})};
// ---- Doppelt oder nichts ----
{const _gx=gainXp;gainXp=function(m,amt){try{if(B&&B.mode==='trainer'&&m&&!gainXp._don){(B.trXp=B.trXp||[]).push([m,amt]);B.trSnap=B.trSnap||new Map();if(!B.trSnap.has(m))B.trSnap.set(m,{l:m.l,xp:m.xp,s:m.s,m:m.m.slice(),prom:m.prom||0})}}catch(e){}return _gx.apply(this,arguments)}}
{const _tw=trainerWin;trainerWin=async function(){const t=B&&B.trainer,xs=(B&&B.trXp||[]).slice(),snap=B&&B.trSnap?new Map(B.trSnap):new Map(),m0=RUN?RUN.money:0;const r=await _tw.apply(this,arguments);
  try{const prize=Math.max(0,(RUN?RUN.money:0)-m0);if(t&&!t.pplk&&!t.gift&&!t.toll&&!t.zoll&&!t.boss&&prize>0&&SET.don!=='0'){let n=0;
    const w=()=>{if(++n>200)return;if(B||TALK||$('#modal').classList.contains('on')||$('#evoov')||EVO_Q.length){setTimeout(w,400);return}offerDouble(t,prize,xs,snap)};setTimeout(w,900)}}catch(e){console.warn(e)}return r}}
function offerDouble(t,prize,xs,snap){const ep=xs.reduce((a,x)=>a+x[1],0);
  openModal(`<h3>🎲 DOPPELT ODER NICHTS?</h3><p>Du hast <b>${esc(t.n)}</b> besiegt: <b>$${prize}</b>${ep?` und <b>${Math.round(ep*((RUN.cfg&&RUN.cfg.xp)||1))} EP</b>`:''}.</p><p class="small">Eine Fallfrage: <span style="color:#3ddc6b">richtig → Preisgeld${ep?' und EP':''} noch einmal</span> · <span style="color:#ef4444">falsch → Preisgeld${ep?' und alle EP aus diesem Kampf':''} sind weg</span>${ep?' (auch Level-Aufstiege und Entwicklungen daraus)':''}.</p>
   <div class="acts"><button class="btn ghost" id="dnno">NEIN, LIEBER SICHER</button><button class="btn" id="dnyes">🎲 RISKIEREN</button></div>`);
  $('#dnno').onclick=closeModal;$('#dnyes').onclick=()=>{const q=caseFor(null);if(!q){closeModal();return}
    quickQuiz('🎲 DOPPELT ODER NICHTS','Eine Frage entscheidet',[qReal(q)],ok=>{if(ok){earn(prize,'Doppelt oder nichts');gainXp._don=1;try{for(const[m,a]of xs)if(RUN.team.includes(m))for(const s of gainXp(m,a))sysChat(s)}finally{gainXp._don=0}toast(`🎉 Verdoppelt! +$${prize}${ep?' und EP':''}.`)}
      else{RUN.money=Math.max(0,RUN.money-prize);let back=0;if(snap)for(const[m,o]of snap){if(m.l!==o.l||m.s!==o.s||m.xp!==o.xp)back++;Object.assign(m,{l:o.l,xp:o.xp,s:o.s,m:o.m,prom:o.prom});if(!m.prom)delete m.prom;m.hp=Math.min(m.hp,stats(m).mhp)}
        toast(`💸 Daneben – $${prize}${ep?' und alle EP':''} sind weg.`);if(back)sysChat(`Doppelt oder nichts verloren: ${back} Monster fallen auf ihren Stand vor dem Kampf zurück.`)}save();updateHud();renderTeam();pushMt()})}}
