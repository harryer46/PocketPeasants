/* ===================== PROF-KLAUSUR (biome borders, v0.99.6) =====================
   The professor at the way into a new area sets a Klausur: first a fight against his paragraphs
   (5–10 levels above the area behind him), then 10 questions on his law – at least 6 right opens the area.
   Fewer than 6: the Klausur starts over with the fight. Bribing stays possible. */
const TOLL_N=10,TOLL_MIN=6;
// level of the area behind the gate: the highest wild level close to its entrance
function tollAreaLv(b){const t=tollSpots().find(q=>q.b===b);if(!t)return 10;let hi=0;
  for(let dy=-10;dy<=10;dy++)for(let dx=-10;dx<=10;dx++){const x=t.gx+dx,y=t.gy+dy;if(x<0||y<0||x>=MW||y>=MH||BIOME[y*MW+x]!==b||!WALK0.has(MAP[y*MW+x]))continue;hi=Math.max(hi,routeLo(x,y))}
  return hi||routeLo(t.gx,t.gy)||10}
function tollFwOf(b){return!!(RUN&&RUN.tollFw&&RUN.tollFw[b])}
tollDialog=function(b){const law=TOLL_LAW[b],nm=tollName(b),money=RUN.money||0,fw=tollFwOf(b),L=tollAreaLv(b);
  openModal(`<h3>🎓 ${esc(nm)} — ${esc(law)}</h3><p>„Halt! Wer in ${esc(TOLL_AREA[b]||'dieses Gebiet')} will, schreibt bei mir erst die Klausur im <b>${esc(law)}</b>.“</p>
   <div style="text-align:left" class="small">${fw?'✓ ':'1. '}Praxis: Kampf gegen meine Paragrafen (Lv ${L+5}–${L+10})${fw?' – bestanden':''}.<br>${fw?'➜ ':'2. '}Theorie: ${TOLL_N} Fragen zum ${esc(law)} – mindestens ${TOLL_MIN} richtig, sonst geht es mit dem Kampf von vorne los.</div>
   <div style="display:flex;flex-direction:column;gap:6px;text-align:left;margin-top:8px">
    <button class="btn" id="tex">📝 ${fw?'THEORIE SCHREIBEN':'KLAUSUR BEGINNEN'} <span class="small">— ${fw?TOLL_N+' Fragen':'erst der Kampf'}</span></button>
    <button class="btn ${money>=TOLL_FEE?'':'ghost'}" id="tpay" ${money>=TOLL_FEE?'':'disabled'}>💰 BESTECHEN <span class="small">— ${TOLL_FEE} $${money>=TOLL_FEE?'':' (du hast '+money+' $)'}</span></button></div>
   <div class="acts"><button class="btn ghost" id="mno">ZURÜCK</button></div>`);
  $('#mno').onclick=()=>{closeModal();tollStepBack(b)};$('#tex').onclick=()=>{closeModal();if(fw)tollTheory(b);else tollFight(b)};
  $('#tpay').onclick=()=>{if((RUN.money||0)<TOLL_FEE)return;RUN.money-=TOLL_FEE;updateHud();closeModal();tollPass(b,`${TOLL_FEE} $ — ich habe nichts gesehen`)}};
tollFight=function(b){const t=tollSpots().find(x=>x.b===b);const pool=lawSpecies(TOLL_LAW[b]);if(!t||!pool.length){tollPass(b,'Na gut');return}
  const L=tollAreaLv(b),lv=[L+5,L+7,L+10],h=hashStr(t.id);
  const team=lv.map((l,i)=>[pool[(h+i*7)%pool.length],clamp(l,2,100)]);
  const tr={id:'toll'+b,toll:b,fixed:true,x:t.x,y:t.y,n:tollName(b),c:t.c,d:t.d,team,reward:1,line:`Praxisteil der Klausur im ${TOLL_LAW[b]} – zeig, was du kannst!`,after:''};
  if(RUN.beat)delete RUN.beat[tr.id];startTrainer(tr)};
// after the won fight: the theory part
{const _tw=trainerWin;trainerWin=async function(){const t=B&&B.trainer;const r=await _tw.apply(this,arguments);
  if(t&&t.toll){const b=t.toll;let n=0;const w=()=>{if(++n>80)return;if(B||TALK||$('#modal').classList.contains('on')){setTimeout(w,300);return}
    talk(tollName(b),`Praxis bestanden! Jetzt die Theorie: ${TOLL_N} Fragen zum ${TOLL_LAW[b]} – mindestens ${TOLL_MIN} richtig.`,()=>tollTheory(b))};setTimeout(w,600)}
  return r}}
let TQT=null;
function tollTheory(b){const law=TOLL_LAW[b],pool=qwSample(lawQuestions(law),TOLL_N);if(!pool.length){tollPass(b,'Klausur bestanden');return}let i=0,right=0;held.length=0;
  const ask=()=>{const it=pool[i],order=shuffleArr([0,1,2,3]);CQ={it,order,end:Infinity,done:false,cb:null};const QT=qTime(it.q);let qEnd=Date.now()+QT;const myQ=CQ;
    $('#cqbox').innerHTML=`<div class="sdlg"><span class="slaw">🎓 ${esc(tollName(b))} · Klausur ${esc(law)} · Frage ${i+1}/${pool.length} · ${right} richtig${it.src?' · '+esc(SPECIES[it.src].law||''):''}</span><br>${esc(it.q[0])}<div class="cqt"><i id="cqbar"></i></div><div class="small" id="cqtime" style="text-align:right">${Math.round(QT/1000)} s</div><div id="cqexp"></div></div>
      <div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${j+1}</span>${esc(it.q[1][k])}</button>`).join('')}</div><div class="sacts" id="cqact"></div>`;
    $('#cquiz').classList.remove('lite');$('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(bt=>bt.onclick=()=>pick(+bt.dataset.ck));
    clearInterval(TQT);TQT=setInterval(()=>{if(CQ!==myQ||myQ.done){clearInterval(TQT);return}if(PANIC){qEnd+=100;return}const l=Math.max(0,qEnd-Date.now()),bar=$('#cqbar');
      if(bar){bar.style.width=(l/QT*100)+'%';bar.style.background=l<QT/3?'#ef4444':'#ffcb3d'}const tt=$('#cqtime');if(tt)tt.textContent=Math.ceil(l/1000)+' s';if(l<=0)pick(-1)},100)};
  const pick=k=>{if(!CQ||CQ.done)return;CQ.done=true;clearInterval(TQT);const ok=k===0,it=CQ.it;if(ok)right++;
    document.querySelectorAll('[data-ck]').forEach(bt=>{const kk=+bt.dataset.ck;bt.disabled=true;bt.classList.add(kk===0?'ok':kk===k?'bad':'dim')});
    $('#cqexp').innerHTML=`<div class="sexp ${ok?'ok':'bad'}">${qFb(ok,k,it.q)}</div>`;
    const need=Math.ceil(pool.length*TOLL_MIN/TOLL_N),last=i>=pool.length-1,lost=right+(pool.length-1-i)<need;
    $('#cqact').innerHTML=`<button class="btn" id="cqnext">${last||lost?'ERGEBNIS':'NÄCHSTE FRAGE'}</button>`;
    $('#cqnext').onclick=()=>{if(!last&&!lost){i++;ask();return}$('#cquiz').classList.remove('on');CQ=null;CQ_PICK=null;
      if(right>=need){talk(tollName(b),`${right} von ${pool.length} – Klausur bestanden!`,()=>tollPass(b,'Klausur bestanden'))}
      else{RUN.tollFw=RUN.tollFw||{};delete RUN.tollFw[b];save();talk(tollName(b),`${right} von ${pool.length} richtig – weniger als ${need}, durchgefallen! Die Klausur beginnt von vorn: erst wieder der Kampf, dann die Theorie.`)}}};
  CQ_PICK=pick;ask()}
