/* ===================== MONSTER LOGIC ===================== */
function stats(m){const b=SPECIES[m.s].b,l=m.l,f=v=>Math.floor(v*2*l/100)+5;return{mhp:Math.floor(b[0]*2*l/100)+l+10,atk:f(b[1]),def:f(b[2]),spd:f(b[3])}}
function movesAt(sid,l){return[...new Set(SPECIES[sid].ls.filter(e=>e[0]<=l).map(e=>e[1]))].slice(-4)}
function newMon(sid,l){while(SPECIES[sid].evo&&l>=SPECIES[sid].evo[0])sid=SPECIES[sid].evo[1];const m={s:sid,l,xp:0,m:movesAt(sid,l)};m.hp=stats(m).mhp;return m}
function xpNeed(l){return 14+l*l*2}
function xpGain(sid,l){return Math.floor((SPECIES[sid].xp*l/6+4)*rarOf(sid).xm)}
function battler(m){return Object.assign({s:m.s,l:m.l,hp:m.hp,m:m.m.slice()},stats(m))}
const LQ=[];
function learnTick(){if(!LQ.length||B||CQ||modalOpen()||!G)return;const q=LQ.shift();if(!RUN||!RUN.team.includes(q.m)&&!(RUN.box||[]).includes(q.m)){return}
  const m=q.m,nm=nameHtml(m.s),mv=MOVES[q.mid];
  if(q.done){openModal(`<h3>✨ NEUE ATTACKE</h3><p style="text-align:center">${nm} hat <b>${esc(mv.n)}</b> gelernt!</p>${moveInfoHtml(q.mid)}<div class="acts"><button class="btn" id="myes">OK</button></div>`);$('#myes').onclick=closeModal;return}
  if(m.m.includes(q.mid))return;
  if(m.m.length<4){m.m.push(q.mid);save();renderTeam();LQ.unshift({m,mid:q.mid,done:true});return}
  openModal(`<h3>✨ NEUE ATTACKE</h3><p style="text-align:center">${nm} möchte <b>${esc(mv.n)}</b> lernen — kann aber nur 4 Attacken. Welche soll verlernt werden?</p>
    <div class="small" style="margin:4px 0">NEU:</div>${moveInfoHtml(q.mid)}
    <div class="small" style="margin:8px 0 4px">BISHER (anklicken zum Verlernen):</div>
    <div style="display:flex;flex-direction:column;gap:4px">${m.m.map((mid,i)=>`<button class="btn ghost" data-fg="${i}" style="text-align:left;padding:4px 6px;font-family:VT323,monospace;font-size:17px;text-transform:none">${moveInfoHtml(mid)}</button>`).join('')}</div>
    <div class="acts" style="margin-top:8px"><button class="btn ghost" id="mno">${esc(mv.n).toUpperCase()} NICHT LERNEN</button></div>`);
  document.querySelectorAll('[data-fg]').forEach(b=>b.onclick=()=>{const i=+b.dataset.fg,old=m.m[i];m.m[i]=q.mid;save();renderTeam();pushMt&&pushMt();closeModal();sysChat(`1, 2 und … Poff! ${SPECIES[m.s].n} hat ${MOVES[old].n} vergessen und ${mv.n} gelernt!`);toast(`${mv.n} gelernt!`)});
  $('#mno').onclick=()=>{closeModal();sysChat(`${SPECIES[m.s].n} hat ${mv.n} nicht gelernt.`)}}
setInterval(()=>{try{learnTick()}catch(e){console.error(e)}},400);
function gainXp(m,amt){
  amt=Math.round(amt*((RUN&&RUN.cfg&&RUN.cfg.xp)||1));
  const out=[`${SPECIES[m.s].n} erhält ${amt} EP!`];m.xp+=amt;
  while(m.xp>=xpNeed(m.l)&&m.l<100){
    m.xp-=xpNeed(m.l);const o=stats(m).mhp;m.l++;const n=stats(m).mhp;m.hp=Math.min(n,m.hp+n-o);out.push(`${SPECIES[m.s].n} erreicht Lv ${m.l}!`);
    const sp=SPECIES[m.s];
    if(sp.evo&&m.l>=sp.evo[0]){const from=sp.n,o2=stats(m).mhp;m.s=sp.evo[1];m.hp+=stats(m).mhp-o2;out.push(`${from} hat sich zu ${SPECIES[m.s].n} entwickelt!`);G.dex[m.s]=1}
    // max. 4 moves: with a free slot the move is learned (info dialog), with 4 moves the player decides which one to forget
    for(const e of SPECIES[m.s].ls)if(e[0]===m.l&&!m.m.includes(e[1])&&MOVES[e[1]]){if(m.m.length<4){m.m.push(e[1]);out.push(`${SPECIES[m.s].n} hat ${MOVES[e[1]].n} gelernt!`);LQ.push({m,mid:e[1],done:true})}else{out.push(`${SPECIES[m.s].n} möchte ${MOVES[e[1]].n} lernen…`);LQ.push({m,mid:e[1]})}}
  }
  return out;
}

