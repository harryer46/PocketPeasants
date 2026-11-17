/* ===================== DEX & DETAILS ===================== */
const KIND_TXT={melee:'Nahkampf — trifft aus der Nähe',shot:'Fernkampf — ein Geschoss',spread:'Fächer — 3 Geschosse im Fächer',multi:'Salve — schnelle Serie',big:'Schwer — großes, langsames Geschoss',self:'Selbst — stärkt/heilt dich',beam:'Strahl — kurzes Aufladen, dann sofortiger Treffer in Linie',breath:'Atem — kurzer Kegel, mehrere Treffer',air:'Luftschlag — trifft von oben an der markierten Stelle',lob:'Hochwurf — fliegt über Hindernisse, Flächentreffer'};
const FX_LONG={sleep:'Kann das Ziel einschläfern (wacht bei Treffer auf)',conf:'Kann das Ziel verwirren (Steuerung und Zielen gestört)',burn:'Kann verbrennen: Schaden über Zeit',slow:'Verlangsamt das Ziel',stun:'Kann das Ziel kurz betäuben',drain:'Heilt dich um die Hälfte des Schadens',heal:'Heilt 30 % der max. KP',shield:'Halbiert eine Weile den erlittenen Schaden',haste:'Macht dich eine Weile schneller',knock:'Stößt das Ziel zurück'};
function moveInfoHtml(mid,learnLv){const mv=MOVES[mid];if(!mv)return'';const T=TYPES[mv.t];
  return`<div class="mvrow"><b>${esc(mv.n)}</b>${learnLv!=null?` <span class="small">· gelernt mit Lv ${learnLv}</span>`:''}<br><span class="tb" style="background:${T.c}">${T.n.toUpperCase()}</span> <span class="small">${esc(KIND_TXT[mv.k]||mv.k)}${mv.combo>1?` · Serie ×${mv.combo}`:''}</span><br>
   <span class="small">Stärke <b style="font-size:17px;color:var(--text)">${mv.p||'—'}</b> · AP <b style="font-size:17px;color:#4aa3ff">${apCost(mid)}</b> · Abklingzeit ${cdOf(mid).toFixed(1)} s${(B&&B.tb)||(RUN&&RUN.cfg&&RUN.cfg.tb)?` · Genauigkeit ${TB_ACC[mv.k]||100}%`:''}${mv.fx?`<br>Effekt: ${esc(mv.bs?(mv.fx==='debuff'?'senkt beim Ziel ':mv.fx==='selfbuff'?'kann dich stärken: ':'stärkt dich: ')+bsText(mv)+(mv.stc&&mv.stc<1?` (${Math.round(mv.stc*100)} %)`:''):(FX_LONG[mv.fx]||mv.fx))}`:''}</span></div>`}
// attacks you have seen (used by you or an opponent, or known by one of your monsters); everything else stays ??? in the dex
function seenMove(mid){try{if(!G||!MOVES[mid])return;G.mvSeen=G.mvSeen||{};if(!G.mvSeen[mid]){G.mvSeen[mid]=1}}catch(e){}}
function moveSeen(mid){if(G&&G.mvSeen&&G.mvSeen[mid])return true;try{return RUN&&RUN.team.concat(RUN.box).some(m=>m.m.includes(mid))}catch(e){return false}}
function moveUnknownHtml(lv){return`<div class="mvrow"><b>???</b>${lv!=null?` <span class="small">· gelernt mit Lv ${lv}</span>`:''}<br><span class="small">Noch nicht gesehen.</span></div>`}
function prevForm(sid){return Object.keys(SPECIES).find(k=>SPECIES[k].evo&&SPECIES[k].evo[1]===sid)}
function habitatOf(sid){const out=[];if(RAR[sid]==='unique')out.push('Starter (einzigartig — nie wild)');else if(startersNow().includes(sid))out.push('Starter im Match');
  for(const z in ZONES)if(poolOf(z).includes(sid))out.push(ZONES[z].n);for(const L of LEGENDS)if(legSid(L)===sid)out.push('Legendärer Schrein ('+ZONES[L.zone].n+')');
  const pf=prevForm(sid);if(pf)out.push('Entwickelt sich aus '+SPECIES[pf].n+' ab Lv '+SPECIES[pf].evo[0]);return out.length?out.join(' · '):'—'}
// m = an own monster (shows its current values), otherwise the dex entry
// dex entry: a fixed legal fact for § monsters, else a short note from type and rarity
function dexText(sid){const sp=SPECIES[sid];if(!sp)return'';if(typeof DEX_TXT!=='undefined'&&DEX_TXT[sid])return DEX_TXT[sid];return`${rarOf(sid).n}es ${TYPES[sp.t].n}-Monster${sp.evo?`, das sich ab Lv ${sp.evo[0]} weiterentwickelt`:''}.`}
// shown when a new monster joins (catch, new start): the dex card with a banner
function dexReveal(sid,m,title){if(!SPECIES[sid])return;openMonInfo(sid,m?Object.assign(Object.create(Object.getPrototypeOf(m)),m,{isNew:1}):m);const b=document.createElement('div');b.style.cssText="font-family:'Press Start 2P',monospace;font-size:9px;color:#14141f;background:#ffcb3d;border:2px solid #000;padding:5px;margin:-4px 0 8px";b.textContent=title||'★ NEUER DEX-EINTRAG ★';$('#mbox').prepend(b)}
function openMonInfo(sid,m,back){const sp=SPECIES[sid];if(!sp)return;const caught=!!(G.dex&&G.dex[sid])||!!m;
  let h=`<h3>${nameHtml(sid)}${m?` · Lv ${m.l}`:''}</h3><canvas id="minfocv" width="52" height="52" style="width:96px;height:96px;image-rendering:pixelated;display:block;margin:0 auto 4px"></canvas><div><span class="tb" style="background:${TYPES[sp.t].c}">${TYPES[sp.t].n.toUpperCase()}</span> <span class="tb" style="background:${rarOf(sid).c};color:#14141f">${rarOf(sid).n.toUpperCase()}</span></div>
    ${sp.law?`<p style="margin:6px 0 0;color:var(--accent);font-size:17px">${esc(sp.law)}</p>`:''}${caught&&dexText(sid)?`<p style="margin:6px 0 0;text-align:left;font-size:17px;line-height:1.1;background:#0b0d16;border:2px solid #000;padding:4px 6px">📖 ${esc(dexText(sid))}</p>`:''}<p class="small" style="margin:6px 0 8px">Fundort: ${esc(habitatOf(sid))}${sp.evo?` · entwickelt sich ab Lv ${sp.evo[0]} zu ${caught?esc(SPECIES[sp.evo[1]].n):'???'}`:''}</p>`;
  if(!caught){h+=`<p>Nimm eins fest, um Werte und Attacken zu sehen.</p>`}
  else{const st=m?stats(m):null,b=sp.b,names=['KP','Angriff','Verteidigung','Geschwindigkeit'],vals=m?[st.mhp,st.atk,st.def,st.spd]:b,mx=m?Math.max(...vals,1):130;
    h+=`<div style="margin:4px 0 10px">${names.map((n,i)=>`<div class="statrow"><span>${n}</span><span style="background:#0b0d16;border:1px solid #000"><i style="width:${Math.min(100,vals[i]/mx*100)}%"></i></span><span>${vals[i]}</span></div>`).join('')}${(()=>{const z=zielOf(m||{s:sid,l:1});return`<div class="statrow" title="Echtzeit-Zielen: hoch = Zielkreuz sitzt mit leichtem Vorhalt auf dem Gegner, niedrig = zieht träge hinterher"><span>Präzision</span><span style="background:#0b0d16;border:1px solid #000"><i style="width:${z*10}%;background:#ffcb3d"></i></span><span>${z}</span></div>`})()}</div>`;
    if(m)h+=`<div class="small" style="margin-bottom:8px">KP ${m.hp}/${st.mhp}${m.xp!=null?` · EP ${m.xp}/${xpNeed(m.l)} bis Lv ${m.l+1}`:''}</div><div class="lbl2" style="margin-bottom:4px">BEKANNTE ATTACKEN</div>${m.m.map(mid=>moveInfoHtml(mid)).join('')}`;
    const next=sp.ls.filter(e=>!m||!m.m.includes(e[1]));
    if(next.length&&!(m&&m.isNew))h+=`<div class="lbl2" style="margin:8px 0 4px">${m?'WEITERE ATTACKEN DIESER LINIE':'ERLERNBARE ATTACKEN'}</div>${next.map(e=>moveSeen(e[1])?moveInfoHtml(e[1],e[0]):moveUnknownHtml(e[0])).join('')}`}
  h+=`<div class="acts" style="margin-top:10px">${back?'<button class="btn ghost" id="mback">◀ DEX</button>':''}<button class="btn" id="mok">SCHLIESSEN</button></div>`;
  openModal(h);$('#mbox').style.maxHeight='92%';$('#mbox').style.overflow='auto';
  const c=$('#minfocv').getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(monSprite(sid,24),0,0,52,52);
  $('#mok').onclick=closeModal;if(back)$('#mback').onclick=()=>openDex()}
function openTypeChart(){const T=Object.keys(TYPES);
  openModal(`<h3>TYPEN-TABELLE</h3><p class="small">Attackentyp (links) gegen Typ des verteidigenden Monsters (oben). ×2 sehr effektiv · ½ nicht sehr effektiv · 0 keine Wirkung. Gleicher Typ wie der Angreifer: ×1,5.</p>
   <div style="overflow:auto"><table style="border-collapse:collapse;margin:6px auto;font-size:16px"><tr><td></td>${T.map(d=>`<td style="padding:2px 3px"><span class="tb" style="background:${TYPES[d].c}">${TYPES[d].n.slice(0,4).toUpperCase()}</span></td>`).join('')}</tr>
   ${T.map(a=>`<tr><td style="text-align:right;padding:2px 4px"><span class="tb" style="background:${TYPES[a].c}">${TYPES[a].n.toUpperCase()}</span></td>${T.map(d=>{const e=eff(a,d);return`<td style="text-align:center;padding:3px 5px;border:1px solid #000;background:${e>1?'#1f6e3a':e===0?'#3a1010':e<1?'#5a2020':'#1b1e2e'}">${e>1?'×2':e===0?'0':e<1?'½':''}</td>`}).join('')}</tr>`).join('')}</table></div>
   <div class="acts" style="margin-top:8px"><button class="btn ghost" id="mback">◀ DEX</button><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  $('#mok').onclick=closeModal;$('#mback').onclick=openDex}
function openDex(){const ids=rosterIds();
  const seen=ids.filter(s=>G.dex[s]!==undefined).length,caught=ids.filter(s=>G.dex[s]).length;
  openModal(`<h3>📖 MONSTER-DEX</h3><p class="small" style="margin-bottom:4px">Gesehen ${seen} · festgenommen ${caught} / ${ids.length}</p><div id="dexgrid">${ids.map((s,i)=>{const k=G.dex[s];return`<button class="dexc ${k===undefined?'unk':''}" data-dx="${s}"><canvas width="52" height="52"></canvas>#${String(i+1).padStart(2,'0')} ${k===undefined?'???':nameHtml(s)+(SPECIES[s].law?'<br><span class="small" style="color:var(--accent)">'+esc(SPECIES[s].law.split(' · ')[0])+'</span>':'')}${k?'<br><span class="small">⛓ festgenommen</span>':k===0?'<br><span class="small">gesehen</span>':''}</button>`}).join('')}</div><div class="acts"><button class="btn ghost" id="mtypes">TYPEN-TABELLE</button><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  $('#mtypes').onclick=openTypeChart;$('#mbox').style.maxWidth='760px';$('#mbox').style.maxHeight='92%';$('#mbox').style.overflow='auto';
  document.querySelectorAll('[data-dx]').forEach(b=>{const s=b.dataset.dx,cx=b.querySelector('canvas').getContext('2d');cx.imageSmoothingEnabled=false;if(G.dex[s]!==undefined)cx.drawImage(monSprite(s,24),0,0,52,52);else{cx.globalAlpha=0.3;cx.filter='brightness(0)';cx.drawImage(monSprite(s,24),0,0,52,52)}
    b.onclick=()=>{if(G.dex[s]===undefined){toast('Noch nicht gesehen — geh auf Entdeckungstour!');return}openMonInfo(s,null,true)}});
  $('#mok').onclick=closeModal}
function openProfile(){if(!G)return;let sx=G.sex==='f'?'f':'m',col=G.color;
  const render=()=>{openModal(`<h3>✏ PROFIL</h3><div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:8px"><canvas id="pfprev" width="16" height="19" style="width:64px;height:76px;image-rendering:pixelated"></canvas>
    <div style="text-align:left"><div class="small">NAME</div><input id="pfname" maxlength="16" value="${esc(G.name)}" style="width:190px;background:#0b0d16;border:2px solid #000;color:var(--text);font-family:inherit;font-size:19px;padding:3px 6px">
    <div style="display:flex;gap:6px;margin-top:6px"><button class="btn ${sx==='m'?'green':'ghost'}" data-psx="m" style="font-size:9px;padding:6px 8px">BEAMTER</button><button class="btn ${sx==='f'?'green':'ghost'}" data-psx="f" style="font-size:9px;padding:6px 8px">BEAMTIN</button></div>
    <div class="colors" style="margin-top:6px">${COLORS.map(c=>`<button data-pcol="${c}" class="${c===col?'sel':''}" style="background:${c}"></button>`).join('')}</div></div></div>
    <div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button><button class="btn" id="myes">SPEICHERN</button></div>`);
    const pc=$('#pfprev').getContext('2d');pc.clearRect(0,0,16,19);pc.drawImage(charSprite(col,'down',0,sx),0,0);
    const inp=$('#pfname');const keep=()=>{G._pfn=inp.value};
    document.querySelectorAll('[data-psx]').forEach(b=>b.onclick=()=>{keep();sx=b.dataset.psx;render();$('#pfname').value=G._pfn})
    ;document.querySelectorAll('[data-pcol]').forEach(b=>b.onclick=()=>{keep();col=b.dataset.pcol;render();$('#pfname').value=G._pfn});
    $('#mno').onclick=()=>{delete G._pfn;closeModal()};
    const go=()=>{const nm=cleanName(inp.value);const old=G.name;G.name=nm;G.sex=sx;G.color=col;delete G._pfn;if(G.freeRun===undefined){}save();closeModal();pushFull();renderTeam();if(old!==nm)sysChat(`Du heißt jetzt ${nm}.`);toast('Profil gespeichert.')};
    $('#myes').onclick=go;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();go()}});inp.focus()};
  render()}
function renderTeam(){
  if(!G)return;const el=$('#pane-team');el.innerHTML='';
  el.insertAdjacentHTML('beforeend',`<div class="stats"><div class="stat" id="sprof" style="cursor:pointer" title="Name, Figur und Farbe ändern">${G.sex==='f'?'Beamtin':'Beamter'} <span style="color:var(--accent)">✏</span><b style="color:${G.color}">${esc(G.name)}</b></div><div class="stat">Trophäen<b>🏆 ${G.tro}</b></div><div class="stat">Monster Dex<b>${rosterIds().filter(s=>G.dex[s]).length} / ${rosterIds().length}</b></div><div class="stat">Handschellen<b>⛓ ${RUN?RUN.kap:'-'}</b></div><div class="stat">Geld<b style="color:var(--accent)">$${RUN?money():'-'}</b></div><div class="stat">Beutel<b style="font-size:17px">${RUN&&RUN.items&&Object.values(RUN.items).some(v=>v>0)?Object.entries(RUN.items).filter(e=>e[1]>0).map(([k,v])=>ITEMS[k].i+v).join(' '):'leer'}</b></div><div class="stat" style="grid-column:1/-1">Feldfähigkeiten<b style="font-size:16px">${Object.entries(HM).map(([k,h])=>hasHM(k)?(!hmUser(k)?`<span style="color:var(--muted)" title="${esc(h.d)}">${h.i} ${h.n} (braucht ${esc(hmNeed(k))})</span>`:k==='fly'?`<button class="btn ghost" data-hmuse="fly" title="${esc(h.d)}" style="font-size:14px;padding:3px 8px">${P.fly?'🛬 LANDEN':h.i+' '+h.n}</button> <span class="small">${esc(SPECIES[hmUser(k).s].n)}</span>`:`<span title="${esc(h.d)}">${h.i} ${h.n} <span class="small">(${esc(SPECIES[hmUser(k).s].n)})</span></span>`):`<span style="color:var(--muted)" title="${esc(h.d)}">🔒 ${h.n} (${esc(TRAINERS.find(t=>t.id===h.from).n)})</span>`).join(' · ')}</b></div></div>`);
  el.querySelectorAll('[data-hmuse]').forEach(b=>b.onclick=()=>{if(b.dataset.hmuse==='fly'){if(isMob())$('#side').classList.remove('open');toggleFly()}});
  {const sp=$("#sprof");if(sp)sp.onclick=openProfile}
  if(!RUN){el.insertAdjacentHTML('beforeend',`<div class="sec">IN KEINER LOBBY</div><div class="small" style="line-height:1.1">Tritt einer Lobby bei oder erstelle eine (Reiter LOBBY oder unten auf der Karte). Du wählst ein Starter-Monster, der Host startet das Spiel, dann gehst du auf Streife vor dem Gerichtsturnier.</div>`)}
  else{
    el.insertAdjacentHTML('beforeend',`<div class="sec">KADER (${RUN.team.length}/${teamMax()}) — DAS ERSTE KÄMPFT ZUERST</div>`);RUN.team.forEach((m,i)=>el.appendChild(monCard(m,i,true)));
    if(RUN.box.length){el.insertAdjacentHTML('beforeend',`<div class="sec">BOX (${RUN.box.length})</div>`);RUN.box.forEach((m,i)=>el.appendChild(monCard(m,i,false)))}
    if(!RUN.free){const lb=document.createElement('button');lb.className='mini';lb.textContent='Lobby verlassen';lb.onclick=()=>{openModal(`<h3>LOBBY VERLASSEN?</h3><p>Dein Team aus dieser Lobby geht verloren.</p><div class="acts"><button class="btn ghost" id="mno">BLEIBEN</button><button class="btn red" id="myes">VERLASSEN</button></div>`);$('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();leaveRun()}};
    el.insertAdjacentHTML('beforeend','<div class="sec">LOBBY</div>');el.appendChild(lb);}
  }
  el.insertAdjacentHTML('beforeend',`<div class="sec">GEBIETE</div><div class="small" style="line-height:1.15">Die Level der wilden Monster hängen an den Routen – Route und Level-Spanne stehen auf den Schildern an Ortsausgängen und Kreuzungen. Jedes Gebiet hat eigene Monster.<br>${Object.values(ZONES).map(z=>`<span style="color:var(--text)">${z.n}</span> · ${z.enc}`).join('<br>')}</div>`);
  const mb=document.createElement('button');mb.className='mini';mb.textContent='🗺 Karte öffnen (M)';mb.style.marginTop='8px';mb.onclick=openMap;el.appendChild(mb);
  const cb=document.createElement('button');cb.className='mini';cb.textContent='⚙ Steuerung';cb.style.marginTop='12px';cb.onclick=openSettings;el.appendChild(cb);
  if(RUN&&RUN.free){const nb=document.createElement('button');nb.className='mini';nb.textContent='🎲 Neu anfangen…';nb.style.marginTop='12px';nb.style.marginRight='6px';nb.disabled=!!B;nb.onclick=restartFree;el.appendChild(nb)}
  const rb=document.createElement('button');rb.className='mini';rb.textContent='Spielstand löschen…';rb.style.marginTop='12px';rb.onclick=()=>{openModal(`<h3>SPIELSTAND LÖSCHEN?</h3><p>Name, Trophäen und Dex werden aus diesem Browser gelöscht.</p><div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button><button class="btn red" id="myes">ZURÜCKSETZEN</button></div>`);$('#mno').onclick=closeModal;$('#myes').onclick=()=>{NO_SAVE=true;G=null;RUN=null;try{localStorage.removeItem(SAVE_KEY)}catch(e){}location.reload()}};el.appendChild(rb);
}
let lastPlr='';
function renderPlayers(){
  const el=$('#pane-players');const list=others();$('#pcount').textContent=ROOM?` ${list.length+1}`:'';
  let h='';
  if(!ROOM)h=`<div class="small" style="line-height:1.15">Mehrspieler ist in dieser Ansicht nicht verbunden — du spielst solo (im Gericht kämpfst du gegen den Richter-Bot).<br><br>Zum gemeinsamen Spielen teile diese Seite: Alle, die sie gleichzeitig offen haben, erscheinen auf der Karte.</div>`;
  else{
    const st=p=>{const mt=p.mt;if(!mt)return'keine Lobby';if(mt.st==='free')return'Freies Spiel';if(mt.st==='lobby')return'wartet in einer Lobby';if(mt.st==='train')return`training · ${fmt(+mt.end-Date.now())}`;return({pick:'wählt Gerichts-Team',wait:'im Gericht',duel:'Gerichtsduell',done:'Turnier beendet'})[mt.st]||'in einem Spiel'};
    if(G)h+=`<div class="plr"><span class="sw" style="background:${G.color}"></span><div class="who"><b>${esc(G.name)} (du)</b><span class="small">${st({mt:mtInfo()})} · 🏆${G.tro}</span></div></div>`;
    if(!list.length)h+=`<div class="small" style="line-height:1.15;margin-top:8px">Gerade ist niemand sonst online. Teile die Seite — wer sie gleichzeitig offen hat, erscheint hier und kann deinem Spiel beitreten.</div>`;
    for(const p of list){const pr=p.presence;const same=RUN&&pr.mt&&pr.mt.id===RUN.id;
      const canB=canSpar()&&!myCh&&pr.mt&&(pr.mt.st==='train'||pr.mt.st==='free'||pr.mt.st==='lobby')&&!pr.bt&&pr.v===VERSION;
      const canI=canInvite()&&!same&&pr.v===VERSION&&!(pr.mt&&['wait','duel','pick'].includes(pr.mt.st));const pend=myCh&&myCh.to===p.peer;
      h+=`<div class="plr"><span class="sw" style="background:${validColor(pr.c)}"></span><div class="who"><b>${esc(cleanName(pr.n))}${p.guest?' (guest)':''}${same?' ★':''}</b><span class="small">${esc(st(pr))} · 🏆${Math.max(0,Math.floor(+pr.tr)||0)}${typeof pingOf==='function'&&pingOf(p.peer)!=null?` · <span style="color:${pingOf(p.peer)>150?'#ef4444':pingOf(p.peer)>80?'#f2c230':'#3ddc6b'}">${pingOf(p.peer)} ms</span>`:''}</span></div><div style="display:flex;flex-direction:column;gap:4px">${canI?`<button class="btn green" data-inv="${esc(p.peer)}" ${INVITED.has(p.peer+RUN.id)?'disabled':''}>${INVITED.has(p.peer+RUN.id)?'✓ EINGELADEN':'✉ EINLADEN'}</button>`:''}${pr.mt&&(pr.mt.st==='train'||pr.mt.st==='free'||pr.mt.st==='lobby')?`<button class="btn" data-ch="${esc(p.peer)}" ${canB?'':'disabled'}>${pend?'…':'⚔ KAMPF'}</button>`:''}</div></div>`}
    if(RUN)h+=`<div class="small" style="margin-top:6px;line-height:1.1">★ = in deiner Lobby · ✉ lädt einen Spieler in deine Lobby ein · ⚔ fordert jemanden im freien Spiel, in einer Lobby oder im Training zu einem Freundschaftskampf heraus (Sieger bekommt EP).</div>`;
  }
  if(h!==lastPlr){lastPlr=h;el.innerHTML=h;bindPlayers(el)}
}
function bindPlayers(el){el.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>challenge(b.dataset.ch));el.querySelectorAll('[data-inv]').forEach(b=>b.onclick=()=>invite(b.dataset.inv))}
let lastLob='';
function renderLobbyPane(){
  const el=$('#pane-lobby');if(!el||curTab!=='lobby'||!G)return;let h='';
  const stTxt={lobby:'in der Lobby',train:'trainiert',pick:'wählt Team',wait:'im Gericht',duel:'im Duell',done:'fertig'};
  if(!RUN||RUN.free){
    h+=`<div class="sec">${RUN?'FREIES SPIEL':'IN KEINER LOBBY'}</div>`;
    if(!RUN)h+=`<button class="btn green" data-lb="free" style="width:100%;margin-bottom:8px">${G.freeRun?'FREIES SPIEL FORTSETZEN':'FREIES SPIEL'}</button>`;
    h+=`<button class="btn" data-lb="create" style="width:100%">＋ LOBBY ERSTELLEN</button><div class="sec">OFFENE LOBBYS</div>`;
    const ms=runningMatches();if(!ms.length)h+=`<div class="small">Gerade keine offenen Lobbys${ROOM?'':' (Mehrspieler nicht verbunden)'}. Erstelle eine und lade deine Freunde ein!</div>`;
    for(const m of ms)h+=`<div class="plr" style="align-items:flex-start"><div class="who"><b>${esc(m.cfg.name||"Lobby von "+m.names[0])}</b><span class="small">${m.names.length} Spieler · ${lobbyLine(m)}<br>${esc(cfgSummary(m.cfg))} · ${m.cfg.dur} Min.</span></div>${m.v===VERSION?`<button class="btn green" data-lb="join" data-id="${esc(m.id)}">BEITRETEN</button>`:verLock(m)}</div>`;
  }else{
    const parts=participants(),hp=hostPeer(),host=isHost(),c=RUN.cfg;
    const phase=RUN.phase==='lobby'?'Warte auf den Start durch den Host':RUN.phase==='train'?`Training · noch ${fmt(RUN.end-Date.now())}`:RUN.st==='done'?'Turnier beendet':`Gericht · Runde ${Math.min(RUN.r,c.rounds)}/${c.rounds}`;
    h+=`<div class="sec">LOBBY${c.name?': '+esc(c.name.toUpperCase()):''}</div><div class="stat" style="margin-bottom:8px"><b style="font-size:20px">${esc(phase)}</b>${esc(cfgSummary(c))} · ${c.dur} Min. Training</div>`;
    h+=`<div class="sec">SPIELER (${parts.length})</div>`;
    for(const p of parts)h+=`<div class="plr"><span class="sw" style="background:${p.c}"></span><div class="who"><b>${esc(p.n)}${p.me?' (du)':''}${p.peer===hp?' ★ Host':''}</b><span class="small">${stTxt[p.st]||p.st}</span></div></div>`;
    if(host){h+=`<div class="sec">HOST-STEUERUNG</div>`;
      if(RUN.phase==='lobby')h+=`<button class="btn green" data-lb="start" style="width:100%;margin-bottom:6px">▶ SPIEL STARTEN</button>`;
      if(RUN.phase==='train'||(RUN.phase==='arena'&&parts.some(p=>p.st==='train')))h+=`<div class="lrow" style="margin-bottom:6px"><button class="btn" data-lb="arena" style="flex:1">⚖ GERICHT FÜR ALLE ERÖFFNEN</button><button class="btn ghost" data-lb="time" style="flex:1">+5 MIN.</button></div>`;
      if(RUN.phase!=='lobby')h+=`<button class="btn ghost" data-lb="reset" style="width:100%;margin-bottom:6px">⟲ SITZUNG ZURÜCKSETZEN (ALLE ZUM START)</button>`}
    else if(RUN.phase==='lobby')h+=`<div class="small" style="margin:8px 0">Der Host (★) startet das Spiel.</div>`;
    h+=`<div class="sec">DU</div>`;
    if(RUN.phase==='train')h+=`<button class="btn" data-lb="enter" style="width:100%;margin-bottom:6px">FRÜHER INS GERICHT</button>`;
    h+=`<button class="btn red" data-lb="leave" style="width:100%">LOBBY VERLASSEN</button>`;
  }
  if(h===lastLob)return;lastLob=h;el.innerHTML=h;
  el.querySelectorAll('[data-lb]').forEach(b=>b.onclick=()=>{const a=b.dataset.lb;
    if(a==='free')startFree();else if(a==='create')openCreate();else if(a==='join')joinLobby(b.dataset.id);else if(a==='start')hostStart();else if(a==='arena')hostArenaNow();else if(a==='time')hostAddTime();else if(a==='reset')hostReset();
    else if(a==='enter'){if(B)return;confirmEarlyArena()}else if(a==='leave'){openModal(`<h3>LOBBY VERLASSEN?</h3><p>Dein Team aus dieser Lobby geht verloren.</p><div class="acts"><button class="btn ghost" id="mno">BLEIBEN</button><button class="btn red" id="myes">VERLASSEN</button></div>`);$('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();leaveRun()}}
    lastLob='';setTimeout(renderLobbyPane,50)});
}
function chatPop(name,col,t){let box=$('#chatpop');if(!box){box=document.createElement('div');box.id='chatpop';document.body.appendChild(box)}
  const d=document.createElement('div');d.className='cp';d.innerHTML=`💬 <b style="color:${validColor(col)}">${esc(name)}</b> ${esc(t)}`;d.onclick=()=>{if(isMob())$('#side').classList.add('open');switchTab('chat');d.remove()};box.appendChild(d);while(box.children.length>4)box.firstChild.remove();
  setTimeout(()=>d.classList.add('out'),5200);setTimeout(()=>d.remove(),5800)}
function addChat(name,col,t,remote){if(remote)chatPop(name,col,t);const l=$('#chatlog');const d=document.createElement('div');d.className='m';d.innerHTML=`<span style="color:${validColor(col)}">${esc(name)}:</span> ${esc(t)}`;l.appendChild(d);l.scrollTop=l.scrollHeight;if(curTab!=='chat'){unread++;$('#cbadge').innerHTML=`<span class="badge">${unread}</span>`}}
function sysChat(t){const l=$('#chatlog');const d=document.createElement('div');d.className='m sys';d.textContent='» '+t;l.appendChild(d);l.scrollTop=l.scrollHeight}
$('#chatform').addEventListener('submit',e=>{e.preventDefault();const inp=$('#chatin');const t=inp.value.replace(/[\u0000-\u001f]/g,'').trim().slice(0,120);if(!t||!G)return;inp.value='';chatN++;pres({chat:{i:Date.now()%1e9+chatN,t}});inp.blur();myBubble={t,until:performance.now()+6000};addChat(G.name,G.color,t)});

