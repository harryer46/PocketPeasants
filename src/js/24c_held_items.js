// v0.102.0 — Mitgegebene Items: Im Kampf kann nur das Item benutzt werden, das dem aktiven Monster mitgegeben wurde (max. 1 je Monster).
const HOLDABLE=['potion','superp','revive','ether','great'];
const HELD_NONE='Kein Item mitgegeben — im Beutel „Mitgeben“ (1 Item je Monster).';
function heldMon(F){try{if(!B||!F||F!==B.me||!RUN)return null;const m=RUN.team[F.a],a=act(F);return m&&a&&m.s===a.s?m:null}catch(e){return null}}
function heldName(k){return k&&ITEMS[k]?ITEMS[k].i+' '+ITEMS[k].n:''}
function giveHeld(m,k){if(!m||!HOLDABLE.includes(k)||!inv(k))return false;if(m.held&&ITEMS[m.held])RUN.items[m.held]=(RUN.items[m.held]||0)+1;RUN.items[k]--;m.held=k;save();return true}
function takeHeld(m){if(!m||!m.held)return;if(ITEMS[m.held])RUN.items[m.held]=(RUN.items[m.held]||0)+1;m.held=null;save()}
// battle bag: only the active monster's held item
function bagOpts(){if(!B||!B.me)return[];const F=B.me,a=act(F),m=heldMon(F),k=m&&m.held,opts=[];if(!k||!ITEMS[k])return opts;
  if((k==='potion'||k==='superp')&&a.hp>0&&a.hp<a.mhp)opts.push([k,`${ITEMS[k].n} → ${SPECIES[a.s].n}`]);
  if(k==='revive')F.team.forEach((t,i)=>{if(i!==F.a&&t.hp<=0)opts.push(['revive:'+i,`Beleber → ${SPECIES[t.s].n}`])});
  if(k==='ether'&&!B.tb&&(F.ap??AP_MAX)<AP_MAX)opts.push(['ether','AP-Drink → volle AP']);
  if(k==='great'&&B.mode==='wild'&&!B.capGreat)opts.push(['great','Super-Handschellen → nächster Wurf']);
  return opts}
{const _bu=bagUse;bagUse=function(key){if(!B)return;const k=key.split(':')[0],m=heldMon(B.me);if(!m||m.held!==k){say(HELD_NONE);return}
  const before=inv(k);RUN.items[k]=before+1;_bu.apply(this,arguments);
  if(inv(k)<=before){RUN.items[k]=before;m.held=null;save();try{bagLabel(true)}catch(e){}}else RUN.items[k]=before}}
{const _say=say;say=function(t){if(t==='Im Beutel ist gerade nichts Nutzbares.'&&B&&B.me){const m=heldMon(B.me);t=m&&m.held?`${heldName(m.held)} (mitgegeben) passt gerade nicht.`:HELD_NONE}return _say.apply(this,[t,...[].slice.call(arguments,1)])}}
{const _bl=bagLabel;bagLabel=function(force){_bl.apply(this,arguments);try{if(!B||bagCur())return;const m=heldMon(B.me),k=m&&m.held;const t=k?`${ITEMS[k].i} ${ITEMS[k].n} (wartet)`:'kein Item';
  const b=$('#bbag'),h=`🎒 ${esc(t)}`;if(b&&b.dataset.hl!==h){b.dataset.hl=h;b.innerHTML=h}const tb=$('#tbag span'),h2=k?`${ITEMS[k].i}<br>·`:'🎒<br>–';if(tb&&tb.innerHTML!==h2)tb.innerHTML=h2}catch(e){}}}
// out of battle: pick a monster to hold the item
function openGiveHeld(k){const all=RUN.team.map((m,i)=>({m,w:'Kader'})).concat(RUN.box.map(m=>({m,w:'Box'})));
  openModal(`<h3>${ITEMS[k].i} ${esc(ITEMS[k].n.toUpperCase())} MITGEBEN</h3><div class="small" style="margin-bottom:6px">Jedes Monster trägt höchstens ein Item. Im Kampf kann nur das Item des aktiven Monsters benutzt werden. Ein bereits getragenes Item kommt zurück in den Beutel.</div>
  <div style="display:flex;flex-direction:column;gap:5px;max-height:50vh;overflow-y:auto">${all.map((e,i)=>`<button class="btn ghost" data-hm="${i}" style="font-family:VT323,monospace;font-size:19px;text-align:left">${esc(SPECIES[e.m.s].n)} · Lv ${e.m.l} <span class="small">(${e.w})</span>${e.m.held?` <span style="float:right">trägt ${heldName(e.m.held)}</span>`:''}</button>`).join('')}</div>
  <div class="acts" style="margin-top:8px"><button class="btn ghost" id="mno">ZURÜCK</button></div>`);
  document.querySelectorAll('[data-hm]').forEach(b=>b.onclick=()=>{const m=all[+b.dataset.hm].m;if(giveHeld(m,k))toast(`${SPECIES[m.s].n} trägt jetzt ${heldName(k)}.`);renderTeam();openBagMenu(inv(k)?k:undefined)});$('#mno').onclick=()=>openBagMenu(k)}
{const _ob=openBagMenu;openBagMenu=function(sel){_ob.apply(this,arguments);try{const d=$('#bagd');if(!d)return;
  const add=()=>{const cur=$('#bagg .bagCell.sel');const k=cur&&cur.dataset.k;if(!k)return;if(k.startsWith('tm:')){const row=d.querySelector('.mvrow');if(!row||row.querySelector('[data-tmgive]'))return;const mk2=k.slice(3);const sm=row.querySelector('.small:last-of-type');if(sm&&/Einsetzen über/.test(sm.textContent))sm.textContent='Direkt einem Monster beibringen (Typ passend oder Normal).';const b=document.createElement('button');b.className='btn';b.dataset.tmgive=mk2;b.textContent='EINSETZEN';b.onclick=()=>openTMGive(mk2);row.appendChild(b);return}const row=d.querySelector('.mvrow');if(!row||row.querySelector('[data-hold]'))return;
    const g=row.querySelector('[data-give]');if(g){g.textContent='BENUTZEN';g.title='Jetzt (außerhalb des Kampfes) auf ein Monster anwenden'}
    if(HOLDABLE.includes(k)){const b=document.createElement('button');b.className='btn';b.dataset.hold=k;b.textContent='MITGEBEN';b.title='Einem Monster für den Kampf mitgeben (max. 1 Item je Monster)';b.onclick=()=>openGiveHeld(k);row.insertBefore(b,g||row.querySelector('[data-fav]'))}};
  add();new MutationObserver(add).observe(d,{childList:true,subtree:true});
  const carriers=RUN.team.concat(RUN.box).filter(m=>m.held&&ITEMS[m.held]);if(carriers.length)d.insertAdjacentHTML('afterend',`<div class="small" style="margin-top:6px">Mitgegeben: ${carriers.map(m=>`${esc(SPECIES[m.s].n)} ${ITEMS[m.held].i}`).join(' · ')}</div>`)}catch(e){console.warn(e)}}}
// team card: show the held item with a take-back button
{const _mc=monCard;monCard=function(m,i,inTeam){const d=_mc.apply(this,arguments);try{const info=d.querySelector('.info')||d;const row=document.createElement('div');row.className='small';row.style.cssText='margin:2px 0;display:flex;gap:6px;align-items:center';
  if(m.held&&ITEMS[m.held]){row.innerHTML=`Trägt: <b>${heldName(m.held)}</b>`;const b=document.createElement('button');b.className='mini';b.textContent='zurück in Beutel';b.disabled=!!B;b.onclick=()=>{takeHeld(m);changed()};row.appendChild(b)}
  else{row.innerHTML='<span style="opacity:.6">Trägt kein Item</span>';const ks=HOLDABLE.filter(k=>inv(k)>0);if(ks.length&&!B){const sel=document.createElement('select');sel.className='mini';sel.innerHTML='<option value="">+ mitgeben…</option>'+ks.map(k=>`<option value="${k}">${ITEMS[k].i} ${esc(ITEMS[k].n)} (×${inv(k)})</option>`).join('');sel.onchange=()=>{if(sel.value&&giveHeld(m,sel.value))changed()};row.appendChild(sel)}}
  info.appendChild(row)}catch(e){console.warn(e)}return d}}
// box cells: small icon of the held item
{const _obw=openBoxWin;openBoxWin=function(){_obw.apply(this,arguments);try{const list=boxAll();const tm=list.filter(e=>e.w==='t');let bx=list.filter(e=>e.w==='b');
  const cells=[...document.querySelectorAll('#boxg .boxCell')];const srt={box:null,lv:(a,b)=>b.m.l-a.m.l,name:(a,b)=>SPECIES[a.m.s].n.localeCompare(SPECIES[b.m.s].n),typ:(a,b)=>SPECIES[a.m.s].t.localeCompare(SPECIES[b.m.s].t)||b.m.l-a.m.l}[BOXW.sort];if(srt)bx.sort(srt);
  tm.concat(bx).forEach((e,i)=>{if(e.m.held&&ITEMS[e.m.held]&&cells[i])cells[i].insertAdjacentHTML('beforeend',`<span title="trägt ${esc(ITEMS[e.m.held].n)}" style="position:absolute;right:3px;top:1px;font-size:15px">${ITEMS[e.m.held].i}</span>`)})}catch(e){}}}
// classic bag modal in battle (turn-based / button): same rule
openBag=function(){if(!B||B.state==='over')return;if(B.tb&&B.mode==='duel'){say('Keine Items in rundenbasierten Duellen.');return}if(B.tb&&B.state!=='tbChoose')return;if(!B.tb&&(B.itemCd||0)>performance.now()){say('Warte kurz vor dem nächsten Item.');return}
  const opts=bagOpts();if(!opts.length){say('Im Beutel ist gerade nichts Nutzbares.');return}
  openModal(`<h3>🎒 MITGEGEBENES ITEM</h3><div style="display:flex;flex-direction:column;gap:6px">${opts.map(([k,t])=>`<button class="btn ghost" data-bag="${k}" style="font-family:VT323,monospace;font-size:19px">${ITEMS[k.split(':')[0]].i} ${esc(t)}</button>`).join('')}</div><div class="acts" style="margin-top:8px"><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  document.querySelectorAll('[data-bag]').forEach(b=>b.onclick=()=>{closeModal();bagUse(b.dataset.bag)});$('#mok').onclick=closeModal};

// TM/VM straight from the bag: pick the monster that should learn it
function openTMGive(k){const all=RUN.team.map(m=>({m,w:'Kader'})).concat(RUN.box.map(m=>({m,w:'Box'})));const ok=all.filter(e=>tmOK(e.m,k)&&!e.m.m.includes(k)),no=all.filter(e=>!ok.includes(e));
  openModal(`<h3>${VM_MOVES[k]?'📀 VM':'💿 TM'} ${esc(MOVES[k].n.toUpperCase())} EINSETZEN</h3><div class="small" style="margin-bottom:6px">${esc(TYPES[MOVES[k].t].n)} · Stärke ${MOVES[k].p||0} · ${VM_MOVES[k]?'VM, beliebig oft':'noch ×'+(RUN.tm[k]||0)}. Lernen können es Monster vom Typ ${esc(TYPES[MOVES[k].t].n)}${MOVES[k].t==='normal'?'':' (und Normal-Attacken alle)'}.</div>
  <div style="display:flex;flex-direction:column;gap:5px;max-height:50vh;overflow-y:auto">${ok.length?ok.map((e,i)=>`<button class="btn ghost" data-tg="${i}" style="font-family:VT323,monospace;font-size:19px;text-align:left">${esc(SPECIES[e.m.s].n)} · Lv ${e.m.l} <span class="small">(${e.w}) · ${e.m.m.length}/4 Attacken</span></button>`).join(''):'<div class="small">Kein Monster kann diese Attacke lernen (oder alle können sie schon).</div>'}
  ${no.length?`<div class="small" style="margin-top:4px;opacity:.6">Nicht möglich: ${no.map(e=>esc(SPECIES[e.m.s].n)+(e.m.m.includes(k)?' (kann sie schon)':'')).join(', ')}</div>`:''}</div>
  <div class="acts" style="margin-top:8px"><button class="btn ghost" id="mno">ZURÜCK</button></div>`);
  document.querySelectorAll('[data-tg]').forEach(b=>b.onclick=()=>tmTeach(ok[+b.dataset.tg].m,k));$('#mno').onclick=()=>openBagMenu('tm:'+k)}
