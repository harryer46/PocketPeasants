/* ===================== TRADING (in the 🏟 Arena / Lobby tab) =====================
   Two players swap one monster each, peer to peer over presence ("tx"):
   1. A offers a monster  2. B answers with one of theirs (or declines)  3. A confirms → both swap locally.
   The received monster goes into the box, fully healed. Only between players in free play, or in the same lobby before the court. */
let TX=null;const TX_DONE=new Set();
function txPub(m){return{s:m.s,l:clamp(Math.floor(+m.l)||1,1,100),m:(m.m||[]).slice(0,4)}}
function txMon(o){if(!o||!SPECIES[o.s])return null;const m=newMon(o.s,clamp(Math.floor(+o.l)||1,1,100));const mv=Array.isArray(o.m)?o.m.filter(k=>MOVES[k]).slice(0,4):[];if(mv.length)m.m=mv;m.hp=stats(m).mhp;return m}
function txAll(){return RUN?RUN.team.concat(RUN.box||[]):[]}
// can I trade with this player right now?
function txOk(p){if(!RUN||B||!p||!p.presence)return false;const mt=p.presence.mt;if(!mt||p.presence.v!==VERSION)return false;
  if(RUN.free)return mt.st==='free';return mt.id===RUN.id&&(RUN.phase==='lobby'||RUN.phase==='train')&&(mt.st==='lobby'||mt.st==='train')}
function txCanGive(m){return!(RUN.team.includes(m)&&RUN.team.length<=1)}
function txPick(title,text,cb,cancelTxt){const all=txAll();openModal(`<h3>${title}</h3><p>${text}</p><div style="display:flex;flex-direction:column;gap:5px;max-height:46vh;overflow:auto">${all.map((m,i)=>`<button class="btn ghost" data-txp="${i}" ${txCanGive(m)?'':'disabled title="Dein letztes Kader-Monster kannst du nicht abgeben"'} style="text-align:left">${nameHtml(m.s)} · Lv ${m.l}${RUN.team.includes(m)?'':' <span class="small">(Box)</span>'}</button>`).join('')}</div><div class="acts"><button class="btn ghost" id="mno">${cancelTxt||'ABBRECHEN'}</button></div>`);
  document.querySelectorAll('[data-txp]').forEach(b=>b.onclick=()=>{closeModal();cb(all[+b.dataset.txp])});$('#mno').onclick=()=>{closeModal();cb(null)}}
function txStart(peer){const p=findPeer(peer);if(!txOk(p)){toast('Tauschen geht gerade nicht.');return}if(TX){toast('Du hast schon einen Tausch offen.');return}const nm=cleanName(p.presence.n);
  txPick('⇄ TAUSCH MIT '+esc(nm.toUpperCase()),`Welches Monster bietest du ${esc(nm)} an?`,m=>{if(!m)return;const id='x'+Math.random().toString(36).slice(2,9);
    TX={peer,id,role:'a',give:m,nm,t:Date.now()};pres({tx:{to:peer,id,give:txPub(m)}});toast(`Angebot an ${nm} geschickt – warte auf die Antwort…`)})}
function txCancel(msg){TX=null;pres({tx:null});if(msg)toast(msg)}
function txSwap(give,got){const i=RUN.team.indexOf(give),j=(RUN.box||[]).indexOf(give);if(i<0&&j<0)return false;if(i>=0)RUN.team.splice(i,1);else RUN.box.splice(j,1);
  RUN.box=RUN.box||[];RUN.box.push(got);G.dex[got.s]=1;save();try{renderTeam()}catch(e){}return true}
function tradeTick(){if(!G||!ROOM)return;const me=MYPEER||'me';
  if(TX&&Date.now()-TX.t>120000){txCancel('Tausch abgebrochen (keine Antwort).');return}
  for(const p of others()){const x=p.presence.tx;if(!x||x.to!==me||typeof x.id!=='string'||x.id.length>12)continue;const k=p.peer+x.id+(x.re?'r':'')+(x.ok?'o':'')+(x.no?'n':'');if(TX_DONE.has(k))continue;
    const nm=cleanName(p.presence.n);
    // 1 → B: an offer came in
    if(!x.re&&!x.ok&&!x.no){TX_DONE.add(k);const got=txMon(x.give);if(!got||TX||B||!txOk(p)||modalOpen()){pres({tx:{to:p.peer,id:x.id,no:1}});continue}
      TX={peer:p.peer,id:x.id,role:'b',got,nm,t:Date.now()};
      txPick(`⇄ ${esc(nm.toUpperCase())} WILL TAUSCHEN`,`${esc(nm)} bietet dir <b>${nameHtml(got.s)} Lv ${got.l}</b> an. Was gibst du dafür?`,m=>{if(!TX||TX.id!==x.id)return;
        if(!m){pres({tx:{to:p.peer,id:x.id,no:1}});TX=null;setTimeout(()=>pres({tx:null}),4000);return}TX.give=m;TX.t=Date.now();pres({tx:{to:p.peer,id:x.id,re:1,give:txPub(m)}});toast('Gegenangebot geschickt – warte auf Bestätigung…')},'ABLEHNEN');continue}
    if(!TX||TX.peer!==p.peer||TX.id!==x.id)continue;TX_DONE.add(k);
    if(x.no){TX=null;pres({tx:null});toast(`${nm} hat den Tausch abgelehnt.`);try{closeModal()}catch(e){}continue}
    // 2 → A: counter offer, confirm?
    if(x.re&&TX.role==='a'){const got=txMon(x.give);if(!got){txCancel();continue}TX.got=got;TX.t=Date.now();
      openModal(`<h3>⇄ TAUSCH BESTÄTIGEN</h3><p>Du gibst <b>${nameHtml(TX.give.s)} Lv ${TX.give.l}</b> und bekommst von ${esc(nm)} <b>${nameHtml(got.s)} Lv ${got.l}</b> (kommt voll geheilt in die Box).</p><div class="acts"><button class="btn ghost" id="mno">ABLEHNEN</button><button class="btn green" id="myes">TAUSCHEN</button></div>`);
      $('#mno').onclick=()=>{closeModal();pres({tx:{to:p.peer,id:x.id,no:1}});TX=null;setTimeout(()=>pres({tx:null}),4000)};
      $('#myes').onclick=()=>{closeModal();if(!TX||TX.id!==x.id)return;const ok=txSwap(TX.give,TX.got);pres({tx:{to:p.peer,id:x.id,ok:ok?1:0,no:ok?0:1}});if(ok){toast(`⇄ Tausch erfolgreich: ${SPECIES[TX.got.s].n} ist in deiner Box!`);sysChat(`⇄ Tausch mit ${nm}: ${SPECIES[TX.give.s].n} gegen ${SPECIES[TX.got.s].n}.`)}TX=null;setTimeout(()=>pres({tx:null}),6000)};continue}
    // 3 → B: confirmed
    if(x.ok&&TX.role==='b'){const ok=txSwap(TX.give,TX.got);if(ok){toast(`⇄ Tausch erfolgreich: ${SPECIES[TX.got.s].n} ist in deiner Box!`);sysChat(`⇄ Tausch mit ${nm}: ${SPECIES[TX.give.s].n} gegen ${SPECIES[TX.got.s].n}.`)}TX=null;pres({tx:null})}}}
// the trade list inside the 🏟 tab
function tradeListHtml(){if(!RUN||!ROOM)return'';const ps=others().filter(txOk);let h=`<div class="sec">⇄ MONSTER TAUSCHEN</div>`;
  if(!ps.length)return h+`<div class="small">Gerade niemand zum Tauschen da (${RUN.free?'andere Spieler im freien Spiel':'Spieler deiner Lobby vor dem Gericht'}).</div>`;
  return h+ps.map(p=>`<div class="plr"><span class="sw" style="background:${validColor(p.presence.c)}"></span><div class="who"><b>${esc(cleanName(p.presence.n))}</b></div><button class="btn" data-txs="${esc(p.peer)}" ${TX?'disabled':''}>⇄ TAUSCHEN</button></div>`).join('')}
