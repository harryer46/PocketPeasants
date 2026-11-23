// v0.100.3 — Beutel als scrollbare Kachel-Matrix, Box als eigenes Fenster mit Tabellen-Matrix aller Monster
function bagKeys(){return RUN&&RUN.items?Object.keys(ITEMS).filter(k=>inv(k)>0):[]}
function bagGridEl(onPick,big){const g=document.createElement('div');g.className='bagGrid'+(big?' big':'');const ks=bagKeys(),tms=RUN?tmOwned():[];
  if(!ks.length&&!tms.length){g.innerHTML='<div class="bagCell emp" style="grid-column:1/-1;height:auto;padding:6px"><span class="nm" style="font-size:15px">Leer — Items gibt es im Copshop.</span></div>';return g}
  for(const k of ks){const c=document.createElement('div');c.className='bagCell';c.dataset.k=k;c.title=ITEMS[k].n+' — '+ITEMS[k].d;
    c.innerHTML=`<span class="q">×${inv(k)}</span><span class="ic">${ITEMS[k].i}</span><span class="nm">${esc(ITEMS[k].n)}</span>${RUN.favItem===k?'<span style="position:absolute;left:3px;top:1px;color:#ffcb3d;font-size:13px">★</span>':''}`;
    c.onclick=()=>onPick&&onPick(k);g.appendChild(c)}
  for(const k of tms){const c=document.createElement('div');c.className='bagCell';c.dataset.k='tm:'+k;const mv=MOVES[k];c.title='TM/VM: '+mv.n;
    c.innerHTML=`<span class="q">${RUN.tm&&RUN.tm[k]?'×'+RUN.tm[k]:'VM'}</span><span class="ic" style="filter:hue-rotate(0deg)">💿</span><span class="nm" style="color:${TYPES[mv.t].c}">${esc(mv.n)}</span>`;
    c.onclick=()=>onPick&&onPick('tm:'+k);g.appendChild(c)}
  return g}
function openBagMenu(sel){if(!RUN){toast('Erst ein Spiel starten.');return}if(B){toast('Im Kampf: Beutel-Knopf unten nutzen.');return}
  const ks=bagKeys(),tms=tmOwned();if(sel===undefined||(sel&&!sel.startsWith('tm:')&&!inv(sel)))sel=ks[0]||(tms[0]?'tm:'+tms[0]:null);
  openModal(`<h3>🎒 BEUTEL</h3><div id="bagg"></div><div id="bagd" style="margin-top:8px;min-height:60px"></div><div class="acts" style="margin-top:10px"><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  const mb=$('#mbox');mb.style.maxWidth='560px';
  const g=bagGridEl(k=>{sel=k;paint()},true);$('#bagg').appendChild(g);
  const paint=()=>{g.querySelectorAll('.bagCell').forEach(c=>c.classList.toggle('sel',c.dataset.k===sel));const d=$('#bagd');if(!sel){d.innerHTML='';return}
    if(sel.startsWith('tm:')){const k=sel.slice(3),mv=MOVES[k];d.innerHTML=`<div class="mvrow" style="display:flex;gap:8px;align-items:center"><span style="font-size:26px">💿</span><span style="flex:1"><b>${esc(mv.n)}</b> <span class="tb" style="background:${TYPES[mv.t].c}">${TYPES[mv.t].n.toUpperCase()}</span> ${RUN.tm&&RUN.tm[k]?'×'+RUN.tm[k]:'(VM, beliebig oft)'}<br><span class="small">${esc(moveDesc?moveDesc(k):'')}</span><br><span class="small">Einsetzen über 💿 TM am Monster (Kader oder Box).</span></span></div>`;return}
    const k=sel;d.innerHTML=`<div class="mvrow" style="display:flex;align-items:center;gap:8px"><span style="font-size:26px;width:30px;text-align:center">${ITEMS[k].i}</span><span style="flex:1"><b>${esc(ITEMS[k].n)}</b> ×${inv(k)}${RUN.favItem===k?' <span style="color:#ffcb3d">★ Favorit</span>':''}<br><span class="small">${esc(ITEMS[k].d)}</span></span>${BAG_GIVE.includes(k)?`<button class="btn" data-give="${k}">GEBEN</button>`:''}${BAG_FAV.includes(k)?`<button class="btn ghost" data-fav="${k}" title="Favorit: im Kampf zuerst ausgewählt" style="font-family:sans-serif;font-size:18px;padding:2px 8px;color:#ffcb3d">${RUN.favItem===k?'★':'☆'}</button>`:''}</div>`;
    d.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>{RUN.favItem=RUN.favItem===k?null:k;save();renderTeam();openBagMenu(k)});
    d.querySelectorAll('[data-give]').forEach(b=>b.onclick=()=>bagGivePick(k))};
  paint();$('#mok').onclick=closeModal}

// ---- Box-Fenster ----
let BOXW={sel:null,sort:'box'};
function boxAll(){return RUN.team.map((m,i)=>({m,w:'t',i})).concat(RUN.box.map((m,i)=>({m,w:'b',i})))}
function openBoxWin(){if(!RUN)return;const locked=!!B||RUN.phase==='arena';
  let list=boxAll();const bx=list.filter(e=>e.w==='b'),tm=list.filter(e=>e.w==='t');
  const srt={box:null,lv:(a,b)=>b.m.l-a.m.l,name:(a,b)=>SPECIES[a.m.s].n.localeCompare(SPECIES[b.m.s].n),typ:(a,b)=>SPECIES[a.m.s].t.localeCompare(SPECIES[b.m.s].t)||b.m.l-a.m.l}[BOXW.sort];
  if(srt)bx.sort(srt);list=tm.concat(bx);
  const s=BOXW.sel;if(s&&!list.some(e=>e.w===s.w&&e.i===s.i))BOXW.sel=null;
  openModal(`<h3>📦 BOX — ALLE MONSTER (${list.length})</h3><div class="boxBar"><span class="small">Kader ${RUN.team.length}/${teamMax()} · Box ${RUN.box.length}</span><span style="flex:1"></span><span class="small">Sortieren:</span>${[['box','Eingang'],['lv','Level'],['name','Name'],['typ','Typ']].map(([k,n])=>`<button class="mini" data-srt="${k}" style="margin:0;${BOXW.sort===k?'background:var(--accent);color:#1b1300':''}">${n}</button>`).join('')}</div><div class="boxGrid" id="boxg"></div><div id="boxa" style="min-height:44px;margin-top:6px"></div>${locked?'<div class="small" style="color:var(--red)">Während eines Kampfes/Turniers kann nicht getauscht werden.</div>':''}<div class="acts" style="margin-top:8px"><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  const mb=$('#mbox');mb.style.maxWidth='min(920px,96vw)';
  const g=$('#boxg');
  list.forEach(e=>{const m=e.m,st=stats(m),r=Math.max(0,m.hp/st.mhp),sp=SPECIES[m.s];const c=document.createElement('div');c.className='boxCell'+(e.w==='t'?' team':'');
    if(BOXW.sel&&BOXW.sel.w===e.w&&BOXW.sel.i===e.i)c.classList.add('sel');
    const cv=mk(56,56);{const cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(monSprite(m.s,24),0,0,56,56)}
    c.innerHTML=(e.w==='t'?`<span class="tag">K${e.i+1}</span>`:'');c.appendChild(cv);
    c.insertAdjacentHTML('beforeend',`<div class="bn" title="${esc(sp.n)}">${esc(sp.n)}</div><div class="bl"><span style="color:${TYPES[sp.t].c}">■</span> Lv ${m.l} · ${m.hp}/${st.mhp}</div><div class="bar"><i style="width:${r*100}%;background:${hpColor(r)}"></i></div>`);
    c.onclick=()=>{BOXW.sel={w:e.w,i:e.i};g.querySelectorAll('.boxCell').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');acts()};
    c.ondblclick=()=>{if(locked)return;move(e)};
    g.appendChild(c)});
  const ref=()=>{changed();openBoxWin()};
  const move=e=>{if(e.w==='t'){if(RUN.team.length<=1){toast('Mindestens ein Monster muss im Kader bleiben.');return}RUN.box.push(RUN.team.splice(e.i,1)[0]);BOXW.sel={w:'b',i:RUN.box.length-1}}
    else{if(RUN.team.length>=teamMax()){toast('Kader voll — erst ein Monster in die Box legen.');return}RUN.team.push(RUN.box.splice(e.i,1)[0]);BOXW.sel={w:'t',i:RUN.team.length-1}}ref()};
  const acts=()=>{const a=$('#boxa');const s=BOXW.sel;if(!s){a.innerHTML='<span class="small">Monster anklicken für Aktionen · Doppelklick = zwischen Kader und Box tauschen.</span>';return}
    const m=(s.w==='t'?RUN.team:RUN.box)[s.i];if(!m){a.innerHTML='';return}const sp=SPECIES[m.s];
    a.innerHTML=`<div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px"><b style="margin-right:6px">${nameHtml(m.s)} <span class="small">Lv ${m.l} · ${s.w==='t'?'Kader #'+(s.i+1):'Box'}</span></b><span class="small" style="flex-basis:100%">${m.m.map(x=>MOVES[x].n).join(' · ')}</span></div>`;
    const row=document.createElement('div');a.appendChild(row);
    const btn=(t,fn,dis)=>{const b=document.createElement('button');b.className='mini';b.textContent=t;b.disabled=!!dis;b.onclick=fn;row.appendChild(b)};
    if(s.w==='t'){btn('→ Box',()=>move(s),locked||RUN.team.length<=1);btn('↑ Nach vorn',()=>{RUN.team.unshift(RUN.team.splice(s.i,1)[0]);BOXW.sel={w:'t',i:0};ref()},locked||s.i===0)}
    else btn('→ Kader',()=>move(s),locked||RUN.team.length>=teamMax());
    btn('ℹ Details',()=>{openMonInfo(m.s,m,true);const bk=$('#mback');if(bk){bk.textContent='ZURÜCK';bk.onclick=()=>openBoxWin()}});
    btn('📚 Study',()=>openStudy(m),locked);
    if(['potion','superp','revive','candy'].some(k=>inv(k)>0))btn('🎒 Item',()=>openItemsFor(m),locked);
    if(tmOwned().some(k=>tmOK(m,k)))btn('💿 TM',()=>openTMFor(m),locked)};
  acts();
  document.querySelectorAll('[data-srt]').forEach(b=>b.onclick=()=>{BOXW.sort=b.dataset.srt;BOXW.sel=null;openBoxWin()});
  $('#mok').onclick=closeModal}

// ---- Lernstand: Übersicht über beantwortete / offene / falsche Fragen (ganz unten im Team-Reiter) ----
let QIDX=null;
function qIndex(){if(QIDX)return QIDX;const seen=new Map(),bookOf=sid=>{const L=(SPECIES[sid]&&SPECIES[sid].law)||'',m=L.match(/^(?:§|Art\.)\s*\d+[a-z]?\s+([A-Za-zÄÖÜäöü]+)/);return m?m[1]:'Sonstige'};
  const add=(t,b)=>{if(!t)return;const k=qsId(t);if(!seen.has(k))seen.set(k,b)};
  for(const sid in QZ){if(!SPECIES[sid])continue;const b=bookOf(sid);for(const q of QZ[sid])add(q[0],b)}
  if(typeof VAULT_BOOK!=='undefined')for(const b in VAULT_BOOK)for(const q of VAULT_BOOK[b])add(q[0],b);
  return QIDX=seen}
function qOverview(){const S=qsLoad(),idx=qIndex(),B0=()=>({n:0,ans:0,r:0,w:0,sure:0,weak:0,everW:0}),all=B0(),per={};
  for(const[k,b]of idx){const o=per[b]||(per[b]=B0());const r=S[k];for(const x of[o,all]){x.n++;if(r&&(r[0]+r[1])>0){x.ans++;x.r+=r[0];x.w+=r[1];if(r[1]>0)x.everW++;if(r[2]>=3)x.sure++;else if(r[2]===0&&r[1]>0)x.weak++}}}
  return{all,per}}
function qsOverviewEl(){const d=document.createElement('div');const{all,per}=qOverview(),pct=(a,b)=>b?Math.round(100*a/b)+'%':'–';
  const row=(n,o,bold)=>`<tr${bold?' style="font-weight:bold;border-top:2px solid #000"':''}><td style="text-align:left">${n}</td><td>${o.n}</td><td>${o.ans}</td><td>${o.n-o.ans}</td><td style="color:var(--green,#3ddc6b)">${o.r}</td><td style="color:var(--red,#ff5a5a)">${o.w}</td><td>${pct(o.r,o.r+o.w)}</td><td>${o.sure}</td><td style="color:#ffcb3d">${o.weak}</td></tr>`;
  const books=Object.keys(per).sort((a,b)=>per[b].n-per[a].n);const fo=qFocus();
  d.innerHTML=`<div class="sec">LERNSTAND (FRAGEN)</div>
  <div class="small" style="margin:2px 0 4px">${all.ans} von ${all.n} Fragen beantwortet (${pct(all.ans,all.n)}) · ${all.n-all.ans} noch offen · ${all.everW} mindestens einmal falsch · Trefferquote ${pct(all.r,all.r+all.w)}</div>
  <div class="bar" style="margin-bottom:5px"><i style="width:${all.n?100*all.ans/all.n:0}%;background:#4aa3ff"></i></div>
  <div style="overflow-x:auto"><table class="qstat" style="width:100%;border-collapse:collapse;font-family:VT323,monospace;font-size:15px;text-align:right">
  <tr style="color:var(--muted)"><th style="text-align:left">Gesetz</th><th title="Fragen insgesamt">ges.</th><th title="mindestens einmal beantwortet">beantw.</th><th title="noch nie gestellt">offen</th><th title="richtige Antworten insgesamt">✓</th><th title="falsche Antworten insgesamt">✗</th><th title="Trefferquote">Quote</th><th title="3× in Folge richtig">sitzt</th><th title="zuletzt falsch beantwortet">Problem</th></tr>
  ${books.map(b=>row(esc(b),per[b])).join('')}${row('Gesamt',all,1)}</table></div>
  <div class="small" style="margin-top:4px">Auswahl: echter Zufall (Krypto-Zufallsgenerator), gleichmäßig über alle Fragen — keine Wiederholung, bevor der Fragenpool eines Monsters durch ist.</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:5px"><button class="mini" id="qfocus" title="An: falsch beantwortete Fragen kommen deutlich häufiger, sichere seltener">🎯 Fehler-Fokus: ${fo?'AN':'AUS'}</button><button class="mini" id="qreset" title="Lernstand dieses Geräts löschen">↺ Lernstand zurücksetzen</button></div>`;
  d.querySelector('#qfocus').onclick=()=>{try{localStorage.setItem('pp_qfocus',fo?'0':'1')}catch(e){}renderTeam()};
  d.querySelector('#qreset').onclick=e=>{const b=e.currentTarget;if(!b.dataset.sure){b.dataset.sure=1;b.textContent='⚠ Wirklich alles löschen? Nochmal klicken';b.style.background='var(--red,#ff5a5a)';setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent='↺ Lernstand zurücksetzen';b.style.background=''}},4000);return}QSTAT={};try{localStorage.removeItem(QS_KEY)}catch(e){}renderTeam()};
  return d}
{const _rt=renderTeam;renderTeam=function(){const r=_rt.apply(this,arguments);try{const el=$('#pane-team');if(el&&RUN&&!el.querySelector('.qstat'))el.appendChild(qsOverviewEl())}catch(e){console.warn(e)}return r}}
