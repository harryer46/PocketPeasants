/* ===================== MONEY, ITEMS & SHOP ===================== */
const ITEMS={
 cap:{n:'Handschellen',p:20,d:'Damit nimmst du wilde Monster fest.',i:'⛓'},
 cap5:{n:'Handschellen ×5',p:90,d:'Fünf Paar Handschellen — etwas günstiger.',i:'⛓'},
 great:{n:'Super-Handschellen',p:50,d:'Festnahmequote ×1,7. Im Kampf gegen wilde Monster aus dem Beutel wählen, dann werfen.',i:'🔒'},
 potion:{n:'Trank',p:25,d:'Heilt 20 KP.',i:'🧪',heal:20},
 superp:{n:'Supertrank',p:60,d:'Heilt 60 KP.',i:'🧪',heal:60},
 revive:{n:'Beleber',p:100,d:'Holt ein besiegtes Monster mit halben KP zurück.',i:'✚'},
 ether:{n:'AP-Drink',p:40,d:'Nur im Kampf: füllt alle AP sofort auf.',i:'⚡'},
 candy:{n:'Sonderbonbon',p:250,d:'Hebt ein Monster um ein Level an.',i:'🍬'}};
function money(){return RUN?(RUN.money||0):0}
function inv(k){return RUN&&RUN.items?(RUN.items[k]||0):0}
function earn(n,why){if(!RUN||!(n>0))return;RUN.money=(RUN.money||0)+Math.round(n);save();updateHud();const t=`+$${Math.round(n)}${why?' '+why:''}`;if(B)say(t);else toast(t)}

// ---- town building sprites (16 px per tile) ----
// style after the HfPol campus in Villingen-Schwenningen: octagonal sand-coloured towers with light, faceted roofs and rows of small windows
let SHOPSPR=null,HFSPR=null;
// octagonal tower in 3/4 view: the wall shows a lit left facet, the front facet and a shaded right facet; the roof is a faceted light dome whose eave follows the same facets
function drawTower(x,X,Y,w,rh,wh,opt){opt=opt||{};const P=(col,a,b,ww,hh)=>{x.fillStyle=col;x.fillRect(a,b,ww||1,hh||1)};
  const sw=Math.max(4,Math.round(w*0.2)),mid=(w-1)/2,RISE=Math.max(2,Math.round(w/16));
  const sideOf=i=>i<sw?'L':i>=w-sw?'R':'F',tOf=i=>i<sw?(sw-i)/sw:i>=w-sw?(i-(w-sw-1))/sw:0,riseOf=i=>Math.round(tOf(i)*RISE);
  const topOf=i=>{const d=Math.abs(i-mid)/mid;return Y+Math.round(Math.pow(d,1.6)*rh*0.62)};
  for(let i=0;i<w;i++){const sd=sideOf(i),r=riseOf(i),eave=Y+rh-r,bot=Y+rh+wh-r,top=topOf(i),X0=X+i;
    // roof facets (light from the upper left)
    const rc=sd==='L'?'#f7f7f3':sd==='F'?(i<mid?'#ebedea':'#e1e4e1'):'#c9cecc';
    P('#14141f',X0,top);for(let y=top+1;y<eave;y++)P(rc,X0,y);
    // eave lip
    P('#14141f',X0,eave);P(sd==='R'?'#d6dad8':'#ffffff',X0,eave+1);P('#9aa0a2',X0,eave+2);
    // wall facet
    const wc=sd==='L'?'#e8d6a2':sd==='F'?'#d9c48e':'#bba672';for(let y=eave+3;y<bot;y++)P(wc,X0,y);
    P('#14141f',X0,bot);
    if(i===0||i===w-1){for(let y=top;y<=bot;y++)P('#14141f',X0,y)}
    else if(i===sw||i===w-sw-1){for(let y=eave+3;y<bot;y++)P(sd==='R'?'#a8935f':'#c9b27c',X0,y)}}
  // ridges from the apex to the facet corners, and a skylight on top
  const ax=X+Math.round(mid),ay=topOf(Math.round(mid))+2;
  const line=(x0,y0,x1,y1,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++)P(col,Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n))};
  line(ax,ay,X+sw,Y+rh-1,'#b7bdbf');line(ax,ay,X+w-sw-1,Y+rh-1,'#a9afb1');line(ax,ay,X+Math.round(sw/2),Y+rh-RISE+1,'#cfd3d3');line(ax,ay,X+w-1-Math.round(sw/2),Y+rh-RISE+1,'#a2a8aa');
  P('#14141f',ax-4,ay-2,9,5);P('#b9c6d2',ax-3,ay-1,7,3);P('#e2ebf3',ax-3,ay-1,3,1);
  // window grid: wide on the front, narrow on the side facets, following the facet slant
  for(let row=0;row<(opt.rows||4);row++){
    for(let i=2;i<w-3;){const sd=sideOf(i),ww=sd==='F'?4:2,r=riseOf(i+1),wy=Y+rh+5-r+row*7;
      if(wy+5>Y+rh+wh-r-2){i+=sd==='F'?6:4;continue}
      if(!(opt.skip&&opt.skip(i,row))){P(sd==='R'?'#6d5b38':'#8a7548',X+i,wy,ww+1,5);P(sd==='R'?'#2c3444':'#3b4658',X+i,wy+1,ww,3);if(sd!=='R')P('#9db9dc',X+i,wy+1,1,1)}
      i+=sd==='F'?6:4}}
  return{sw,rise:RISE}}
// Dienststelle in the HfPol look: low wing on the left, octagonal tower with the entrance (door tile x=25 → local x 48..63)
let DSTSPR=null;
function dienstSprite(){if(DSTSPR)return DSTSPR;const W=96,H=64,c=mk(W,H),x=c.getContext('2d');const F=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  // wing
  F('#14141f',0,22,34,42);F('#eceeeb',1,23,32,8);F('#d3d6d4',1,29,32,2);F('#14141f',0,31,34,1);F('#dcc690',1,32,32,31);F('#c4ad78',1,58,32,5);
  for(const r of[0,1,2])for(let a=4;a<30;a+=6){F('#7d6a44',a,35+r*7,5,5);F('#3b4658',a+1,36+r*7,3,3);F('#9db9dc',a+1,36+r*7,1,1)}
  // blue/silver police stripe on the wing
  F('#1d3f8f',1,55,32,2);F('#c9d3e0',1,57,32,1);
  drawTower(x,26,0,60,22,41,{rows:4,skip:(a,r)=>r>=1&&a>16&&a<42});
  // entrance with canopy and blue name band
  F('#14141f',38,30,36,8);F('#1d3f8f',39,31,34,6);
  F('#14141f',46,44,20,2);F('#d9dde4',47,44,18,1);
  F('#14141f',48,46,16,18);F('#3b5f8c',49,47,14,17);F('#9fd8ff',50,48,5,16);F('#9fd8ff',57,48,5,16);F('#d6f0ff',50,48,1,16);F('#14141f',55,47,2,17);
  // blue lamp
  F('#14141f',53,39,6,5);F('#4aa3ff',54,40,4,3);F('#c8e6ff',54,40,1,1);
  return DSTSPR=c}
function shopSprite(){if(SHOPSPR)return SHOPSPR;const W=80,H=64,c=mk(W,H),x=c.getContext('2d');const F=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  // one HfPol tower as the Copshop; the door sits in the middle (door tile = column 2 → x 32..47)
  drawTower(x,6,0,68,24,39,{rows:4,skip:(a,r)=>r>=2&&a>22&&a<46});
  F('#14141f',33,44,14,20);F('#5a5f70',34,45,12,19);F('#9fd8ff',35,46,4,18);F('#9fd8ff',41,46,4,18);F('#d6f0ff',35,46,1,18);F('#14141f',40,45,1,19);
  F('#14141f',28,40,24,4);F('#1d3f8f',29,41,22,2); // blue canopy
  return SHOPSPR=c}
// HfPol: two octagonal towers joined by the curved lecture hall with the glass stair tower in the middle (door tile = column 3 → x 48..63)
function hfpolSprite(){if(HFSPR)return HFSPR;const W=112,H=64,c=mk(W,H),x=c.getContext('2d');const F=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  // connecting hall: low curved light roof and sand facade
  F('#14141f',22,22,68,42);F('#eceeeb',23,23,66,9);F('#d3d6d4',23,29,66,3);F('#14141f',22,32,68,1);
  F('#dcc690',23,33,66,30);F('#c4ad78',23,58,66,5);
  for(const r of[0,1,2])for(let a=26;a<86;a+=5){if(a>40&&a<70)continue;F('#7d6a44',a,36+r*7,4,5);F('#3b4658',a+1,37+r*7,2,3)}
  // towers left and right
  drawTower(x,0,2,40,20,41,{rows:4});drawTower(x,72,2,40,20,41,{rows:4});
  // glass stair tower with round light roof in the middle
  F('#14141f',43,6,26,58);F('#d9dde4',44,7,24,6);F('#c3c8cf',44,11,24,2);F('#14141f',44,13,24,1);
  F('#e9eef4',44,14,24,32);for(let a=46;a<66;a+=4)F('#7fa6cf',a,15,2,30);F('#b7d4f0',46,15,1,30);
  F('#1d3f8f',44,46,24,1);
  F('#14141f',48,46,16,18);F('#3b5f8c',49,47,14,17);F('#9fd8ff',50,48,5,16);F('#9fd8ff',57,48,5,16);F('#d6f0ff',50,48,1,16);F('#14141f',55,47,2,17);
  // blue name band above the hall facade
  F('#14141f',43,40,26,7);F('#1d3f8f',44,41,24,5);
  return HFSPR=c}
function shopOK(){return RUN&&(RUN.phase==='train'||RUN.phase==='lobby')&&!B&&tget(P.x,P.y)===22}
function buy(k){const it=ITEMS[k];if(!it||!RUN)return;if(!shopOK()){toast('Läden gibt es nur in der Stadt.');return}if(money()<it.p){toast('Nicht genug Geld.');return}
  RUN.money-=it.p;if(k==='cap')RUN.kap++;else if(k==='cap5')RUN.kap+=5;else{RUN.items=RUN.items||{};RUN.items[k]=(RUN.items[k]||0)+1}save();updateHud();renderTeam();openShop()}
function openShop(){if(!RUN){toast('Starte zuerst das freie Spiel oder tritt einer Lobby bei.');return}if(!shopOK()){toast(B?"Während eines Kampfes kannst du nicht einkaufen.":RUN.phase==='arena'?'Während des Gerichtsturniers ist der Laden geschlossen.':'Der Copshop ist ein eigenes Gebäude: in der Stadt südlich der Hauptstraße, links (🛒 auf der Karte). Geh durch die Tür hinein.');return}
  openModal(`<h3>🛒 COPSHOP</h3><p class="small" style="margin-bottom:6px">Dein Geld: <b style="color:var(--accent);font-size:20px">$${money()}</b> · Handschellen ⛓ ${RUN.kap}</p>
   ${Object.entries(ITEMS).map(([k,it])=>`<div class="mvrow" style="display:flex;align-items:center;gap:8px"><span style="font-size:22px;width:26px;text-align:center">${it.i}</span><span style="flex:1"><b>${esc(it.n)}</b> <span class="small">· owned ${k==='cap'||k==='cap5'?RUN.kap:inv(k)}</span><br><span class="small">${esc(it.d)}</span></span><button class="btn ${money()>=it.p?'':'ghost'}" data-buy="${k}" ${money()>=it.p?'':'disabled'}>$${it.p}</button></div>`).join('')}
   ${(()=>{const T=shopTown(),L=tmShopList();return L.length?`<h3 style="margin-top:10px">💿 TMs · Angebot ${esc(T.n)}</h3>`+L.map(k=>`<div class="mvrow" style="display:flex;align-items:center;gap:8px"><span style="font-size:22px;width:26px;text-align:center">💿</span><span style="flex:1"><b>${esc(MOVES[k].n)}</b> <span class="tb" style="background:${TYPES[MOVES[k].t].c}">${TYPES[MOVES[k].t].n.toUpperCase()}</span> <span class="small">· Stärke ${MOVES[k].p} · owned ${(RUN.tm&&RUN.tm[k])||0}</span><br><span class="small">Nur für ${esc(TYPES[MOVES[k].t].n)}-Monster${MOVES[k].t==='normal'?' (Normal: alle)':''}.</span></span><button class="btn ${money()>=tmPrice(k)?'':'ghost'}" data-btm="${k}" ${money()>=tmPrice(k)?'':'disabled'}>$${tmPrice(k)}</button></div>`).join(''):''})()}
   <div class="acts" style="margin-top:8px"><button class="btn" id="mok">FERTIG</button></div>`);
  $('#mbox').style.maxHeight='92%';$('#mbox').style.overflow='auto';document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy));document.querySelectorAll('[data-btm]').forEach(b=>b.onclick=()=>buyTM(b.dataset.btm));$('#mok').onclick=closeModal}
// use an item on one of your monsters outside battle
function useItemOn(k,m){const it=ITEMS[k];if(!inv(k)||!m)return;const st=stats(m);
  if(it.heal){if(m.hp<=0){toast('Besiegt — nimm einen Beleber.');return}if(m.hp>=st.mhp){toast('KP sind schon voll.');return}m.hp=Math.min(st.mhp,m.hp+it.heal)}
  else if(k==='revive'){if(m.hp>0){toast("Es ist nicht besiegt.");return}m.hp=Math.ceil(st.mhp/2)}
  else if(k==='candy'){const msgs=gainXp(m,Math.max(1,xpNeed(m.l)-m.xp));msgs.forEach(t=>sysChat(t))}else return;
  RUN.items[k]--;toast(`${ITEMS[k].n} bei ${SPECIES[m.s].n} eingesetzt.`);changed()}
function openItemsFor(m){const ks=['potion','superp','revive','candy'].filter(k=>inv(k)>0);
  if(!ks.length){toast('Keine nutzbaren Items — kauf welche im Laden in der Stadt.');return}
  openModal(`<h3>🎒 ITEM FÜR ${esc(SPECIES[m.s].n.toUpperCase())}</h3><div style="display:flex;flex-direction:column;gap:6px">${ks.map(k=>`<button class="btn ghost" data-ui="${k}" style="font-family:VT323,monospace;font-size:19px">${ITEMS[k].i} ${esc(ITEMS[k].n)} ×${inv(k)} — ${esc(ITEMS[k].d)}</button>`).join('')}</div><div class="acts" style="margin-top:8px"><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  document.querySelectorAll('[data-ui]').forEach(b=>b.onclick=()=>{closeModal();useItemOn(b.dataset.ui,m)});$('#mok').onclick=closeModal}
// the bag in battle: heal the active monster, revive a benched one, refill AP, ready a Great Capsule
function openBag(){if(!B||B.state==='over')return;if(B.tb&&B.mode==='duel'){say('Keine Items in rundenbasierten Duellen.');return}if(B.tb&&B.state!=='tbChoose')return;if(!B.tb&&(B.itemCd||0)>performance.now()){say('Warte kurz vor dem nächsten Item.');return}
  const F=B.me,a=act(F),opts=[];
  for(const k of['potion','superp'])if(inv(k)&&a.hp>0&&a.hp<a.mhp)opts.push([k,`${ITEMS[k].n} → ${SPECIES[a.s].n}`]);
  if(inv('revive'))F.team.forEach((m,i)=>{if(i!==F.a&&m.hp<=0)opts.push(['revive:'+i,`Beleber → ${SPECIES[m.s].n}`])});
  if(inv('ether')&&!B.tb&&(F.ap??AP_MAX)<AP_MAX)opts.push(['ether','AP-Drink → volle AP']);
  if(inv('great')&&B.mode==='wild'&&!B.capGreat)opts.push(['great','Super-Handschellen → für den nächsten Wurf']);
  if(!opts.length){say('Im Beutel ist gerade nichts Nutzbares.');return}
  openModal(`<h3>🎒 BEUTEL</h3><div style="display:flex;flex-direction:column;gap:6px">${opts.map(([k,t])=>`<button class="btn ghost" data-bag="${k}" style="font-family:VT323,monospace;font-size:19px">${ITEMS[k.split(':')[0]].i} ${esc(t)} (×${inv(k.split(':')[0])})</button>`).join('')}</div><div class="acts" style="margin-top:8px"><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  document.querySelectorAll('[data-bag]').forEach(b=>b.onclick=()=>{closeModal();bagUse(b.dataset.bag)});$('#mok').onclick=closeModal}
// the bag in battle works like the monster reel: swipe (or mouse wheel) cycles the items, a double tap/click uses the shown one
function bagOpts(){if(!B||!B.me)return[];const F=B.me,a=act(F),opts=[];
  for(const k of['potion','superp'])if(inv(k)&&a.hp>0&&a.hp<a.mhp)opts.push([k,`${ITEMS[k].n} → ${SPECIES[a.s].n}`]);
  if(inv('revive'))F.team.forEach((m,i)=>{if(i!==F.a&&m.hp<=0)opts.push(['revive:'+i,`Beleber → ${SPECIES[m.s].n}`])});
  if(inv('ether')&&!B.tb&&(F.ap??AP_MAX)<AP_MAX)opts.push(['ether','AP-Drink → volle AP']);
  if(inv('great')&&B.mode==='wild'&&!B.capGreat)opts.push(['great','Super-Handschellen → nächster Wurf']);
  // the favourite item comes first, so it is pre-selected
  const fav=RUN&&RUN.favItem;if(fav)opts.sort((a,b)=>(b[0].split(':')[0]===fav)-(a[0].split(':')[0]===fav));
  return opts}
function bagCur(){const o=bagOpts();if(!o.length)return null;B.bagI=(((B.bagI||0)%o.length)+o.length)%o.length;return o[B.bagI]}
function bagCycle(d){const o=bagOpts();if(!o.length){say('Im Beutel ist gerade nichts Nutzbares.');return}B.bagI=((B.bagI||0)+d+o.length*4)%o.length;B.bagFlash=performance.now();bagLabel(true)}
function bagTry(){if(!B||B.state==='over')return;if(B.tb&&B.mode==='duel'){say('Keine Items in rundenbasierten Duellen.');return}if(B.tb&&B.state!=='tbChoose')return;if(!B.tb&&(B.itemCd||0)>performance.now()){say('Warte kurz vor dem nächsten Item.');return}
  const c=bagCur();if(!c){say('Im Beutel ist gerade nichts Nutzbares.');return}bagUse(c[0])}
function bagLabel(force){if(!B)return;const c=bagCur(),k=c?c[0].split(':')[0]:'';const key=c?c[0]+inv(k)+c[1]:'none';if(!force&&B.bagK===key)return;B.bagK=key;
  const t=c?`${ITEMS[k].i} ${c[1].split(' → ')[0]} ×${inv(k)}`:'leer';
  const b=$('#bbag');if(b)b.innerHTML=`🎒 ${esc(t)} <span class="small">◀▶</span>`;
  const tb=$('#tbag span');if(tb)tb.innerHTML=c?`${ITEMS[k].i}<br>×${inv(k)}`:'🎒<br>leer'}
function bindBag(el){let x0=null,last=0;
  el.addEventListener('pointerdown',e=>{x0=e.clientX;try{el.setPointerCapture(e.pointerId)}catch(_){}},true);
  el.addEventListener('pointerup',e=>{if(x0==null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>24){last=0;bagCycle(dx<0?1:-1);return}
    const now=performance.now();if(now-last<400){last=0;bagTry();return}last=now;
    const c=bagCur();say(c?`🎒 ${c[1]} — doppelt tippen zum Benutzen, wischen zum Wechseln`:'Im Beutel ist gerade nichts Nutzbares.')});
  el.addEventListener('wheel',e=>{e.preventDefault();bagCycle(e.deltaY>0?1:-1)},{passive:false});
  el.onclick=null}
function bagUse(key){if(!B)return;const[k,ix]=key.split(':'),F=B.me,a=act(F);if(!inv(k))return;
  if(ITEMS[k].heal){const h=Math.min(ITEMS[k].heal,a.mhp-a.hp);a.hp+=h;B.nums.push({x:F.x,y:F.y-34,t:'+'+h,c:'#3ddc6b',at:performance.now()});burst(F.x,F.y-14,'#3ddc6b',12)}
  else if(k==='revive'){const m=F.team[+ix];if(!m||m.hp>0)return;m.hp=Math.ceil(m.mhp/2);F.out=false}
  else if(k==='ether'){F.ap=AP_MAX;burst(F.x,F.y-14,'#4aa3ff',12)}
  else if(k==='great'){B.capGreat=1;say('Super-Handschellen bereit — halte den Handschellen-Knopf zum Werfen!');RUN.items.great--;save();return}
  RUN.items[k]--;save();say(`${ITEMS[k].n} eingesetzt!`);B.itemCd=performance.now()+2500;
  if(B.mode==='duel')publishDuel(true);
  if(B.tb){B.state='tbPlay';setTimeout(()=>{if(B&&B.state==='tbPlay')tbRun(null)},500)}}
function cfgOf(){return(RUN&&RUN.cfg)||DEF_CFG}
function sanitizeCfg(c){c=c&&typeof c==='object'?c:{};const n=(v,d,a,b)=>Number.isFinite(+v)&&v!==''&&v!=null?clamp(Math.floor(+v),a,b):d;
  return{name:String(c.name||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,24),dur:n(c.dur,10,1,60),rounds:n(c.rounds,3,1,7),team:n(c.team,3,1,4),kap:n(c.kap,10,0,50),xp:[1,2,3].includes(+c.xp)?+c.xp:1,enc:[0.6,1,1.6].includes(+c.enc)?+c.enc:1,leg:+c.leg===0?0:1,tb:+c.tb===1?1:0,alt:+c.alt===0?0:1,aim:[0,1,2].includes(+c.aim)?+c.aim:0,money:n(c.money,100,0,5000),fol:n(c.fol,3,0,4),kader:n(c.kader,4,1,4),host:typeof c.host==='string'?c.host.slice(0,40):''}}
function cfgSummary(c){return`${c.tb?'rundenbasiert':'Echtzeit'} · ${c.rounds} Runde${c.rounds>1?'n':''} · Kader ${c.kader??4} · Team aus ${c.team}${c.xp>1?` · ${c.xp}× EP`:''}${c.enc!==1?(c.enc>1?' · viele Begegnungen':' · wenige Begegnungen'):''}${c.leg?'':' · ohne Legendäre'} · ${c.kap} Handschellen · $${c.money??100} · ${c.aim===1?'Auto-Zielen':c.aim===2?'freies Zielen 360°':'Zielen in 8 Richtungen'}`}
function runningMatches(){const seen=new Map();for(const p of others()){const mt=p.presence.mt;if(!mt||typeof mt.id!=='string'||mt.id.length>=40||(RUN&&RUN.id===mt.id))continue;
  const open=mt.st==='lobby'||(mt.st==='train'&&+mt.end>Date.now()+10000);if(!open)continue;
  const e=seen.get(mt.id)||{id:mt.id,end:+mt.end||0,names:[],cfg:sanitizeCfg(mt.cfg),waiting:true,v:String(p.presence.v||'old').slice(0,12)};e.names.push(cleanName(p.presence.n));if(mt.st==='train'){e.waiting=false;e.end=Math.max(e.end,+mt.end)}seen.set(mt.id,e)}return[...seen.values()]}
function lobbyLine(m){return m.waiting?'wartet in der Lobby':`noch ${fmt(m.end-Date.now())}`}
let LOBBY_MIN=true;
function startFree(){
  if(G.freeRun){RUN=G.freeRun;RUN.beat=RUN.beat||{};RUN.leg=RUN.leg||{};afterRunChange();toast('Willkommen zurück! Das freie Spiel geht weiter.');return}
  // same starter choice as in a lobby (no paragraph monsters)
  const go=sid=>{RUN={id:'f'+Math.random().toString(36).slice(2,10),free:true,end:0,phase:'train',team:[newMon(sid,START_LV)],box:[],kap:10,money:100,items:{},r:1,st:'free',res:[],beat:{},leg:{},cfg:Object.assign({},DEF_CFG,{alt:SET.alt==='0'?0:1})};G.dex[sid]=1;G.freeRun=RUN;afterRunChange();teleport(VSPAWN.x,VSPAWN.y);sysChat('Freies Spiel gestartet — dein Team wird gespeichert. Erstelle oder betrete jederzeit eine Lobby.');toast(`Dein Start-Monster: ${SPECIES[sid].n}!`)};
  if(window.AUTO_STARTER){const st=startersNow({alt:SET.alt==='0'?0:1});const sid=st[Math.floor(Math.random()*st.length)];go(sid);return}
  pickStarter(go,{alt:SET.alt==='0'?0:1})
}
// free play: throw away the free-play team and start over with a new random monster (dex and trophies stay)
// full reset: team, box, money, items, story (Beschlüsse, rank, final exam), Monster-Dex, seen moves, trophies – only name and look stay
function fullReset(){const keep={mapv:G.mapv,name:G.name,color:G.color,sex:G.sex};if(RUN&&!RUN.free&&typeof leaveRun==='function'){try{leaveRun(true)}catch(e){}}
  G=Object.assign(keep,{dex:{},tro:0,x:VSPAWN.x,y:VSPAWN.y,d:'down',run:null,freeRun:null,mvSeen:{}});RUN=null;FIELDGONE.clear();try{teleport(VSPAWN.x,VSPAWN.y)}catch(e){}save();renderTeam();updateHud();startFree()}
function restartFree(){if(!RUN||!RUN.free||B)return;
  openModal(`<h3>🎲 NEU ANFANGEN?</h3><p>Dein Team, die Box, Geld, Items, besiegte Cops und Feldfähigkeiten aus dem freien Spiel werden zurückgesetzt. Auch Story-Fortschritt (Beschlüsse, Laufbahn, Abschlussprüfung), Monster-Dex und Trophäen werden gelöscht. Du wählst ein neues Start-Monster.<br><span class="small">Nur dein Name und Aussehen bleiben.</span></p><div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button><button class="btn red" id="myes">NEU ANFANGEN</button></div>`);
  $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();fullReset()}}
function afterRunChange(){save();LOBBY_MIN=true;$('#lobby').dataset.h='';renderLobby();renderTeam();updateHud();pushMt();lastPlr='';renderPlayers()}
function renderLobby(){
  const el=$('#lobby');
  if(G&&RUN&&!RUN.free&&RUN.phase==='lobby'){const parts=participants(),host=isHost();const h=`<h3>LOBBY${RUN.cfg.name?': '+esc(RUN.cfg.name.toUpperCase()):''}</h3><p>${parts.length} Spieler warten: ${esc(parts.map(p=>p.n+(p.peer===hostPeer()?' ★':'')).join(', '))}<br><span class="small">${esc(cfgSummary(RUN.cfg))} · ${RUN.cfg.dur} Min. Training</span></p><div class="lrow">${host?'<button class="btn green" id="lgo" style="flex:1">▶ SPIEL STARTEN</button>':'<span style="flex:1" class="small">Warte auf den Start durch den Host (★)…</span>'}<button class="btn ghost" id="lleave">VERLASSEN</button></div>`;
    if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;const g=$('#lgo');if(g)g.onclick=hostStart;$('#lleave').onclick=leaveRun}el.classList.add('on');return}
  if(!G||!RUN||RUN.free||(RUN&&!RUN.free)){el.classList.remove('on');if(G&&!RUN&&typeof switchTab==='function'&&curTab!=='lobby'&&!renderLobby.once){renderLobby.once=1;switchTab('lobby')}return}
  const ms=runningMatches();let h;
  if(RUN&&RUN.free){
    if(LOBBY_MIN){h=`<div class="lrow"><span style="flex:1;font-family:'Press Start 2P',monospace;font-size:8px;color:var(--accent)">FREIES SPIEL${ms.length?` · <span style="color:var(--green)">${ms.length} LOBBY${ms.length>1?'S':''} OFFEN</span>`:''}</span><button class="btn ghost" id="lmax">LOBBYS ▲</button></div>`;
      if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;$('#lmax').onclick=()=>{LOBBY_MIN=false;renderLobby()}}el.classList.add('on');return}
    h=`<div class="lrow" style="margin-bottom:6px"><h3 style="flex:1;margin:0">LOBBYS</h3><button class="btn ghost" id="lmin">▼</button></div><p>Dein Team aus dem freien Spiel bleibt gespeichert. Tritt einer Lobby bei oder erstelle eine: Alle bekommen ein neues Starter-Monster, gehen auf Streife und kämpfen dann in einem Gerichtsturnier im Schweizer System.</p>`;
  }else h=`<h3>LOBBY</h3><p>Spiel frei mit einem gespeicherten Team — oder tritt einer Lobby bei bzw. erstelle eine: neues Starter-Monster, Streife bis der Timer abläuft, dann ein Gerichtsturnier im Schweizer System mit Rangliste.</p><div class="lrow" style="margin-bottom:8px"><button class="btn green" id="lfree" style="flex:1">${G.freeRun?'FREIES SPIEL FORTSETZEN':'FREIES SPIEL'}</button></div>`;
  for(const m of ms)h+=`<div class="lrow" style="margin-bottom:8px;align-items:flex-start"><span style="flex:1;line-height:1.05"><span style="color:var(--text)">${esc(m.cfg.name||m.names.slice(0,2).join(', '))}</span> · ${lobbyLine(m)} · ${m.names.length}/${MAX_LOBBY} Spieler<br><span class="small">${esc(cfgSummary(m.cfg))}</span></span>${m.v!==VERSION?verLock(m):m.names.length>=MAX_LOBBY?`<button class="btn ghost" disabled>VOLL ${MAX_LOBBY}/${MAX_LOBBY}</button>`:`<button class="btn green" data-join="${esc(m.id)}">BEITRETEN</button>`}</div>`;
  h+=`<div class="lrow"><button class="btn" id="lcreate" style="flex:1">＋ LOBBY ERSTELLEN</button></div>`;
  if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;
    const lm=$('#lmin');if(lm)lm.onclick=()=>{LOBBY_MIN=true;renderLobby()};
    const lf=$('#lfree');if(lf)lf.onclick=startFree;
    $('#lcreate').onclick=openCreate;
    el.querySelectorAll('[data-join]').forEach(b=>b.onclick=()=>joinLobby(b.dataset.join))}
  el.classList.add('on');
}
function openCreate(){
  const c=G.lastCfg?sanitizeCfg(G.lastCfg):DEF_CFG;const sel=(id,opts,v)=>`<select id="${id}" style="width:100%">${opts.map(([val,l])=>`<option value="${val}" ${+val===+v?'selected':''}>${l}</option>`).join('')}</select>`;
  const row=(l,inp)=>`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:center;text-align:left;margin-bottom:6px"><span>${l}</span>${inp}</div>`;
  const num=(id,v,a,b)=>`<input id="${id}" type="number" min="${a}" max="${b}" value="${v}" style="width:100%;background:#0b0d16;border:2px solid #000;color:var(--text);font-family:inherit;font-size:18px;padding:2px 6px">`;
  openModal(`<h3>LOBBY ERSTELLEN</h3>
   ${row('Lobby-Name',`<input id="cname" maxlength="24" placeholder="optional" value="${esc(c.name)}" style="width:100%;background:#0b0d16;border:2px solid #000;color:var(--text);font-family:inherit;font-size:18px;padding:2px 6px">`)}
   
   ${row('Kampfstil',sel('ctb',[[0,'⚡ Echtzeit'],[1,'⏳ Rundenbasiert']],c.tb))}
   ${row('Zielen',sel('caim',[[0,'🎯 Manuell (8 Richtungen)'],[2,'🎯 Frei (360°)'],[1,'Auto-Zielen']],c.aim||0))}
   ${row('Trainingszeit (Min.)',num('cdur',c.dur,1,60))}
   ${row('Verhandlungsrunden (Schweizer System)',sel('crounds',[1,2,3,4,5,6,7].map(v=>[v,v+(v===3?' (Standard)':'')]),c.rounds))}
   ${row('Kader (aktive Monster, Rest in der Box)',sel('ckader',[1,2,3,4].map(v=>[v,v+(v===4?' (Standard)':'')]),c.kader??4))}
   ${row('Monster pro Gerichtskampf',sel('cteam',[1,2,3,4].map(v=>[v,v]),Math.min(4,c.team)))}
   ${row('Begleiter in der Welt',sel('cfol',[[0,'keine'],[1,'1'],[2,'2'],[3,'3'],[4,'4']],c.fol??3))}
   ${row('Start-Handschellen',num('ckap',c.kap,0,50))}
   ${row('Startgeld ($)',num('cmoney',c.money??100,0,5000))}
   ${row('EP-Gewinn',sel('cxp',[[1,'normal'],[2,'2×'],[3,'3×']],c.xp))}
   ${row('Wilde Begegnungen',sel('cenc',[[0.6,'wenige'],[1,'normal'],[1.6,'viele']],c.enc))}
   ${row('Legendäre Schreine',sel('cleg',[[1,'an'],[0,'aus']],c.leg))}
   <div class="small" style="text-align:left;margin:6px 0 12px;line-height:1.1">Zuerst treten die Spieler deiner Lobby bei; du startest das Spiel, wenn alle da sind. Alle beginnen mit Lv ${START_LV}. Das Gericht tagt, wenn der Timer abläuft — oder früher, sobald alle Spieler (2+) drin sind und ✔ BEREIT gesetzt haben.</div>
   <div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button><button class="btn green" id="myes">ERSTELLEN</button></div>`);
  $('#mno').onclick=closeModal;
  $('#myes').onclick=()=>{const cfg=sanitizeCfg({name:$('#cname').value,dur:$('#cdur').value,rounds:$('#crounds').value,team:$('#cteam').value,kap:$('#ckap').value,xp:$('#cxp').value,enc:$('#cenc').value,leg:$('#cleg').value,tb:$('#ctb').value,money:$('#cmoney').value,aim:$('#caim').value,fol:$('#cfol').value,kader:$('#ckader').value});G.lastCfg=cfg;save();closeModal();
    pickStarter(sid=>startRun('m'+Math.random().toString(36).slice(2,10),0,sid,null,Object.assign({},cfg,{host:MYPEER||'me'}),'lobby'),cfg)};
}
function pickStarter(cb,cfg){const alt=altOn(cfg||{alt:SET.alt==='0'?0:1});
  openModal(`<h3>WÄHLE DEIN STARTER-MONSTER</h3><p>Alle beginnen mit Lv ${START_LV}. Harrymon, Göggeli und Pfisterio sind einzigartig und werden ab Lv 14 zu ihrer goldenen Mega-Form.</p><div class="starters">${startersNow(cfg||{alt:SET.alt==='0'?0:1}).map(s=>`<button class="stc" data-s="${s}"><canvas width="56" height="56"></canvas><br>${nameHtml(s)}<br><span class="tb" style="background:${TYPES[SPECIES[s].t].c}">${TYPES[SPECIES[s].t].n.toUpperCase()}</span> <span class="tb" style="background:${rarOf(s).c};color:#14141f">${rarOf(s).n.toUpperCase()}</span></button>`).join('')}</div><div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button></div>`);
  document.querySelectorAll('.stc').forEach(b=>{{const cx=b.querySelector('canvas').getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(monSprite(b.dataset.s,24),4,4,48,48)}b.onclick=()=>{closeModal();const s_=b.dataset.s;cb(s_);setTimeout(()=>{if(!B&&RUN&&RUN.team[0]&&!$('#modal').classList.contains('on'))dexReveal(s_,RUN.team[0],'★ DEIN STARTER ★')},700)}});
  $('#mno').onclick=closeModal;
}
function startRun(id,end,sid,prev,cfg,phase){
  phase=phase||'train';if(phase==='train'&&end<Date.now()+5000){toast('Dieses Spiel ist fast vorbei.');return}
  cfg=sanitizeCfg(cfg||DEF_CFG);
  RUN={id,jt:Date.now(),starter:sid,rs:cfg.host===(MYPEER||'me')?0:null,end:phase==='lobby'?0:end,cfg,phase,team:[newMon(sid,START_LV)],box:[],kap:cfg.kap,money:cfg.money??100,items:{},r:1,st:phase==='lobby'?'lobby':'train',res:[],prev:prev||null,beat:{},leg:{}};G.dex[sid]=1;$('#arena').classList.remove('on');
  save();$('#lobby').dataset.h='';renderLobby();renderTeam();updateHud();pushMt();teleport(VSPAWN.x,VSPAWN.y);
  if(phase==='lobby'){sysChat(`Du bist in der Lobby${cfg.name?' „'+cfg.name+'“':''} (${cfgSummary(cfg)}). Der Host startet das Spiel.`);switchTab('lobby')}
  else{sysChat(`Spiel${cfg.name?' "'+cfg.name+'"':''} läuft! ${fmt(end-Date.now())} Training (${cfgSummary(cfg)}). Geh ins Gericht, wenn du bereit bist.`);toast('Streife gestartet! Ab ins hohe Gras.')}
}
function verLock(m){return`<button class="btn ghost" disabled title="Alle in einer Lobby brauchen dieselbe Version">v${esc(m.v)}</button>`}
function joinLobby(id){const m=runningMatches().find(x=>x.id===id);if(!m){toast('Diese Lobby gibt es nicht mehr.');return}
  if(m.names.length>=MAX_LOBBY){toast(`Diese Lobby ist voll (max. ${MAX_LOBBY} Spieler).`);return}
  if(m.v!==VERSION){toast(cmpV(m.v,VERSION)>0?`Diese Lobby läuft auf v${m.v} — lade die Seite neu, um zu aktualisieren (du hast v${VERSION}).`:`Diese Lobby läuft auf einer älteren Version (v${m.v}). Ihre Spieler müssen neu laden.`);return}pickStarter(sid=>startRun(m.id,m.end,sid,null,m.cfg,m.waiting?'lobby':'train'),sanitizeCfg(m.cfg))}
// host = creator while present, otherwise the member with the lowest id (same answer on every client)
function hostPeer(){if(!RUN||RUN.free)return null;const ids=participants().map(p=>p.peer);if(RUN.cfg.host&&ids.includes(RUN.cfg.host))return RUN.cfg.host;return ids.sort()[0]}
function isHost(){return hostPeer()===(MYPEER||'me')}
function hostStart(){if(!isHost()||RUN.phase!=='lobby')return;RUN.phase='train';RUN.st='train';RUN.end=Date.now()+RUN.cfg.dur*60000;save();pushMt();$('#lobby').dataset.h='';renderLobby();sysChat('Spiel gestartet! Ab ins Training.');toast('Dienstbeginn! Ab ins hohe Gras.')}
function hostArenaNow(){if(!isHost()||RUN.phase==='lobby')return;RUN.end=Date.now()+3000;save();pushMt();sysChat('Der Host hat das Gericht für alle eröffnet!')}
function hostAddTime(){if(!isHost())return;RUN.end=Math.max(RUN.end,Date.now())+5*60000;save();pushMt();sysChat('Der Host hat 5 Minuten hinzugefügt.')}
function syncHost(){
  if(!RUN||RUN.free||!ROOM)return;const h=hostPeer();if(!h||h===(MYPEER||'me'))return;
  const p=findPeer(h),mt=p&&p.presence.mt;if(!mt||mt.id!==RUN.id)return;const end=+mt.end;
  const rs=Math.floor(+mt.rs)||0;if(RUN.rs==null){RUN.rs=rs}else if(rs>RUN.rs){resetRun(rs);return}
  if(RUN.phase==='lobby'&&mt.st!=='lobby'&&end>0){RUN.phase='train';RUN.st='train';RUN.end=end;save();pushMt();$('#lobby').dataset.h='';renderLobby();sysChat('Der Host hat das Spiel gestartet! Ab ins Training.');toast('Dienstbeginn! Ab ins hohe Gras.');return}
  if((RUN.phase==='train'||RUN.phase==='arena')&&end>0&&Math.abs(end-RUN.end)>1500){RUN.end=end;save();pushMt();if(RUN.phase==='train')toast(`Timer vom Host geändert: noch ${fmt(end-Date.now())}.`)}
}
// close a running battle, the arena screen and any open dialog immediately (used when leaving or resetting a lobby)
function hardExit(){
  if(B){B.state='over';B=null;FX=null;$('#bpick').classList.remove('on');try{fxc.clearRect(0,0,fxcv.width,fxcv.height)}catch(e){}$('#battle').classList.remove('on');$('#stage').style.transform='';try{placeDpad()}catch(e){}pres({du:null,bt:null})}
  if(myCh)cancelCh();if(incoming){incoming=null}
  closeModal();closeMap();$('#arena').classList.remove('on');$('#abox').dataset.h='';held.length=0;
}
function leaveRun(){
  hardExit();RUN=G.freeRun||null;if(RUN){RUN.beat=RUN.beat||{};RUN.leg=RUN.leg||{}}
  P.d='down';teleport(VSPAWN.x,VSPAWN.y);save();pres({mt:mtInfo(),ld:leadInfo(),lf:folInfo()});afterRunChange();
  switchTab('lobby');if(isMob())$('#side').classList.add('open');
  if(RUN)toast('Zurück am Start — freies Spiel. Tritt jederzeit einer Lobby bei oder erstelle eine.');else startFree();
}
// host: send everyone in this lobby back to the start (lobby phase, fresh starter, no timer)
function resetRun(n){
  hardExit();const c=RUN.cfg,sid=RUN.starter||(RUN.team[0]&&RUN.team[0].s)||startersNow()[0];
  Object.assign(RUN,{rs:n,phase:'lobby',st:'lobby',end:0,r:1,res:[],gaveUp:0,solo:0,pick:null,dopp:null,trophy:0,team:[newMon(sid,START_LV)],box:[],kap:c.kap,money:c.money??100,items:{},beat:{},leg:{}});
  P.d='down';teleport(VSPAWN.x,VSPAWN.y);save();afterRunChange();switchTab('lobby');
  sysChat('Der Host hat die Sitzung zurückgesetzt — alle sind zurück am Start. Der Host startet das Spiel erneut.');toast('Sitzung zurückgesetzt — zurück am Start!');
}
function hostReset(){if(!isHost())return;openModal(`<h3>SITZUNG ZURÜCKSETZEN?</h3><p>Alle in dieser Lobby gehen zurück zum Start: neues Starter-Monster, keine Fänge, Timer und Urteile gelöscht. Danach könnt ihr neu starten.</p><div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button><button class="btn red" id="myes">ZURÜCKSETZEN</button></div>`);
  $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();resetRun((RUN.rs||0)+1)}}
function lobbyCapCheck(){if(!RUN||RUN.free||RUN.phase==='arena')return;const parts=participants();if(parts.length<=MAX_LOBBY)return;
  const order=parts.slice().sort((a,b)=>(a.jt||0)-(b.jt||0)||(a.peer<b.peer?-1:1));const i=order.findIndex(p=>p.me);
  if(i>=MAX_LOBBY&&Date.now()-(RUN.jt||0)<60000){leaveRun();toast(`Die Lobby war schon voll (max. ${MAX_LOBBY} Spieler).`)}}
function matchTick(){try{lobbyCapCheck()}catch(e){console.error(e)}
  if(!RUN||!G){$('#htimer').textContent='LOBBY';$('#htimer').classList.remove('hot');return}
  if(RUN.free){$('#htimer').textContent='FREIES SPIEL';$('#htimer').classList.remove('hot');return}const tm=$('#htimer');
  syncHost();const left=RUN.end-Date.now();if(RUN.phase==='lobby'){tm.textContent=`LOBBY · ${participants().length} WARTEN`;tm.classList.remove('hot');return}
  if(RUN.phase==='train'){tm.textContent='STREIFE '+fmt(left);tm.classList.toggle('hot',left<30000);if(left<=0)enterArena()}
  else{tm.textContent=RUN.st==='done'?'BEENDET':`GERICHT ${Math.min(RUN.r,cfgOf().rounds)}/${cfgOf().rounds}`;tm.classList.remove('hot')}
}
function confirmEarlyArena(){
  if(!RUN||RUN.free||RUN.phase!=='train'){return}
  openModal(`<h3>JETZT INS GERICHT?</h3><p>Die Verhandlung beginnt, wenn der Timer abläuft (${fmt(RUN.end-Date.now())}) — oder früher, sobald alle Spieler (2+) drin sind und ✔ BEREIT gesetzt haben. Bis dahin kannst du zurück ins Training.</p><div class="acts"><button class="btn ghost" id="mno">WEITER TRAINIEREN</button><button class="btn" id="myes">INS GERICHT</button></div>`);
  $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();enterArena(true)};
}
function enterArena(early){
  if(!RUN||RUN.free)return;
  if(B&&B.mode==='wild')endWild('Die Zeit ist um!');
  if(B&&(B.spar||B.mode==='trainer'))closeBattle();
  if(myCh)cancelCh();if(incoming){closeModal();incoming=null}
  RUN.rdy=0;RUN.phase='arena';RUN.r=1;RUN.res=[];RUN.st='pick';healAll();teleport(COURT.x,COURT.y);P.d='up';
  sysChat(early?'Du bist früh ins Gericht gegangen. Warte auf die anderen…':'Die Streife ist vorbei — ab ins Gericht!');save();pushMt();showArena();pickArenaTeam();
}
function pickArenaTeam(){
  const n=cfgOf().team;
  if(RUN.team.length<=n){RUN.pick=RUN.team.map((_,i)=>i);RUN.st='wait';save();pushMt();showArena();return}
  let sel=RUN.team.map((_,i)=>i).slice(0,n);let left=30;const run=RUN;
  const render=()=>{openModal(`<h3>WÄHLE ${n} MONSTER</h3><p>Stell dein Gerichts-Team zusammen (${sel.length}/${n}). Automatisch bestätigt in ${left} s.</p><div style="display:flex;flex-direction:column;gap:6px;text-align:left;max-height:50vh;overflow:auto">${RUN.team.map((m,i)=>`<button class="btn ${sel.includes(i)?'green':'ghost'}" data-pk="${i}" style="text-align:left;font-family:VT323,monospace;font-size:19px">${sel.includes(i)?'✓ ':''}${nameHtml(m.s)} · Lv ${m.l} · ${TYPES[SPECIES[m.s].t].n}</button>`).join('')}</div><div class="acts" style="margin-top:10px"><button class="btn" id="myes" ${sel.length? '':'disabled'}>BESTÄTIGEN</button></div>`);
    document.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pk;if(sel.includes(i))sel=sel.filter(x=>x!==i);else if(sel.length<n)sel.push(i);render()});$('#myes').onclick=done};
  const done=()=>{clearInterval(t);if(RUN!==run||RUN.phase!=='arena')return;closeModal();RUN.pick=sel.length?sel.sort((a,b)=>a-b):[0];RUN.st='wait';save();pushMt();showArena()};
  const t=setInterval(()=>{if(RUN!==run||RUN.phase!=='arena'){clearInterval(t);return}left--;if(left<=0)done();else{const p=document.querySelector('#mbox p');if(p)p.textContent=`Stell dein Gerichts-Team zusammen (${sel.length}/${n}). Automatisch bestätigt in ${left} s.`}},1000);
  render();
}
function cleanRes(a){return Array.isArray(a)?a.slice(0,12).filter(x=>Array.isArray(x)&&Number.isFinite(+x[0])&&typeof x[1]==='string'&&x[1].length<40).map(x=>[Math.floor(+x[0]),x[1],[0,0.5,1].includes(+x[2])?+x[2]:0]):[]}
const PACT=new Map(),DECT=new Map();
function peerStale(p,ms){const a=PACT.get(p.peer);return!!a&&!p.me&&Date.now()-a.t>ms}
function participants(){
  const list=[{peer:MYPEER||'me',me:true,n:G.name,c:G.color,r:RUN.r,st:RUN.st,res:RUN.res||[],rd:RUN.rdy?1:0,jt:RUN.jt||0}];
  for(const p of others()){const mt=p.presence.mt;if(mt&&mt.id===RUN.id){const e={peer:p.peer,n:cleanName(p.presence.n),c:validColor(p.presence.c),r:Math.floor(+mt.r)||0,st:typeof mt.st==='string'?mt.st:'train',res:cleanRes(mt.res),rd:mt.rd?1:0,jt:+mt.jt||0};list.push(e);
    const sig=e.st+'|'+e.r+'|'+e.res.length,a=PACT.get(p.peer);if(!a||a.sig!==sig)PACT.set(p.peer,{sig,t:Date.now()})}}
  return list;
}
// Swiss system: score = wins (+0.5 draw); tiebreak Buchholz (sum of opponents' scores)
function standings(parts,upto){
  const sc={},bh={};for(const p of parts)sc[p.peer]=p.res.filter(x=>x[0]<upto).reduce((a,x)=>a+x[2],0);
  for(const p of parts)bh[p.peer]=p.res.filter(x=>x[0]<upto&&x[1]!=='bot'&&x[1]!=='bye').reduce((a,x)=>a+(sc[x[1]]||0),0);
  return parts.slice().sort((a,b)=>sc[b.peer]-sc[a.peer]||bh[b.peer]-bh[a.peer]||(a.peer<b.peer?-1:1)).map(p=>Object.assign({},p,{score:sc[p.peer],bh:bh[p.peer]}));
}
// PvP only: with an odd number of players the lowest-ranked player who has not had one yet gets a bye (free win, no fight)
function pairRound(parts,r){
  const list=standings(parts,r),pairs=[];
  if(list.length%2){let bi=-1;for(let i=list.length-1;i>=0;i--)if(!list[i].res.some(x=>x[1]==='bye')){bi=i;break}if(bi<0)bi=list.length-1;pairs.push([list[bi].peer,'bye']);list.splice(bi,1)}
  const used=new Set(),played=(a,b)=>a.res.some(x=>x[0]<r&&x[1]===b.peer);
  for(const p of list){if(used.has(p.peer))continue;used.add(p.peer);let q=list.find(o=>!used.has(o.peer)&&!played(p,o));if(!q)q=list.find(o=>!used.has(o.peer));if(q){used.add(q.peer);pairs.push([p.peer,q.peer])}}
  return pairs;
}
function readyRoom(parts){return RUN&&RUN.phase==='arena'&&RUN.r===1&&parts.length>1&&!parts.some(p=>p.res.length)}
function toggleReady(){if(!RUN||RUN.phase!=='arena')return;RUN.rdy=!RUN.rdy;save();pushMt();$('#abox').dataset.h='';showArena()}
function arenaTick(){
  if(!RUN||RUN.free||RUN.phase!=='arena')return;
  if(!B)showArena();
  if(B||RUN.st!=='wait')return;
  const parts=participants();
  // players still training/picking hold the start — unless the timer ran out 45 s ago (phone asleep / tab in background)
  const late=Date.now()>RUN.end+45000;
  if(!late&&parts.some(p=>p.st==='train'||p.st==='pick'||p.st==='lobby'))return;
  if(RUN.r===1&&!(RUN.res||[]).length&&Date.now()<RUN.end&&!(parts.length>1))return;
  // ready room: round 1 only starts when everyone ticked ✔ BEREIT (or 90 s after the timer as anti-deadlock)
  if(readyRoom(parts)&&!(parts.filter(p=>p.st!=='train'&&p.st!=='lobby').every(p=>p.rd)||Date.now()>RUN.end+90000))return;
  // nobody to fight → no tournament (the Arena is PvP only)
  if(parts.length<2&&RUN.r===1&&!(RUN.res||[]).length){RUN.st='done';RUN.solo=1;save();pushMt();$('#abox').dataset.h='';showArena();return}
  // a player still in an earlier round only blocks if that round is really undecided (opponent has no result against them) and they are not frozen
  // (a decided player gets 20 s to publish their own result before the others move on without them)
  const decided=p=>{if(!parts.some(q=>q.res.some(x=>x[0]===p.r&&x[1]===p.peer)))return false;const k=p.peer+':'+p.r;if(!DECT.has(k))DECT.set(k,Date.now());return Date.now()-DECT.get(k)>20000};
  if(parts.some(p=>p.st!=='done'&&p.r<RUN.r&&p.r>0&&!decided(p)&&!peerStale(p,150000)))return;
  const pool=parts.filter(p=>p.r>=RUN.r&&p.st!=='done'&&p.st!=='pick'&&p.st!=='train'&&p.st!=='lobby'&&!p.res.some(x=>x[0]===RUN.r));const me=MYPEER||'me';
  const pr=pairRound(pool,RUN.r).find(x=>x[0]===me||x[1]===me);if(!pr)return;
  const opp=pr[0]===me?pr[1]:pr[0];
  if(opp==='bye'){RUN.res=(RUN.res||[]).concat([[RUN.r,'bye',1]]);earn(25,'bye');RUN.r++;RUN.st=RUN.r>cfgOf().rounds?'done':'wait';sysChat(`Runde ${RUN.r-1}: ungerade Spielerzahl — du bekommst einen kampflosen Sieg (Freilos).`);toast('Kampfloser Sieg in dieser Runde (Freilos)!');save();pushMt();$('#abox').dataset.h='';showArena();return}
  startDuel(opp,RUN.id+'-'+RUN.r+'-'+[me,opp].sort().join('-'));
}
function showArena(){
  const el=$('#arena');el.classList.add('on');
  const parts=participants();const R=cfgOf().rounds;const allDone=parts.every(p=>p.st==='done');
  const tab=standings(parts,99);
  if(allDone&&!RUN.trophy&&!RUN.gaveUp&&!RUN.solo&&tab[0]&&tab[0].me&&parts.length>1){RUN.trophy=1;G.tro++;save();pres({tr:G.tro});updateHud();sysChat('🏆 Du hast das Turnier gewonnen!');earn(200,'Siegerprämie')}
  const stTxt={train:'STREIFE',pick:'WÄHLT',wait:'BEREIT',duel:'IM DUELL',done:'FERTIG'};
  const stCol={train:'#6b7280',pick:'#8b5cf6',wait:'#3b82f6',duel:'#f0642a',done:'#3ddc6b'};
  const nameOf=id=>id==='bye'?'niemand (Freilos)':id==='bot'?'Richter-Bot':(parts.find(p=>p.peer===id)||{n:'(weg)'}).n;
  let my;
  if(RUN.solo)my='Keine Gegner — das Gericht ist nur PvP und braucht mindestens 2 Spieler. Verhandlung abgesagt.';
  else if(RUN.gaveUp&&RUN.st==='done')my=allDone?`Du hast aufgegeben. Endergebnis: Platz ${tab.findIndex(p=>p.me)+1} von ${tab.length}.`:'Du hast das Turnier aufgegeben. Die anderen spielen weiter — du kannst die Tabelle verfolgen.';
  else if(allDone)my=tab[0]&&tab[0].me&&parts.length>1?'🏆 Du hast das Turnier gewonnen!':`Turnier vorbei — du bist Platz ${tab.findIndex(p=>p.me)+1} von ${tab.length}.`;
  else if(RUN.st==='done')my='Du hast alle Runden gespielt. Warte auf die letzten Duelle…';
  else if(parts.length>1&&Date.now()<=RUN.end+45000&&parts.some(p=>p.st==='train'||p.st==='lobby'))my=`Warte auf andere Spieler… (${parts.filter(p=>p.st!=='train'&&p.st!=='lobby').length}/${parts.length} im Gericht · Timer ${fmt(RUN.end-Date.now())})`;
  else if(parts.length<=1&&Date.now()<RUN.end&&RUN.r===1&&!(RUN.res||[]).length)my=`Warte auf andere Spieler… Du bist allein — das Turnier beginnt, wenn der Timer abläuft (${fmt(RUN.end-Date.now())}).`;
  else if(parts.some(p=>p.st==='pick'))my='Warte, bis alle ihr Gerichts-Team gewählt haben…';
  else if(RUN.st==='wait'&&readyRoom(parts)&&!parts.every(p=>p.rd))my=`🚪 BEREITSCHAFTSRAUM — alle müssen ✔ BEREIT setzen, dann beginnt Runde 1. (${parts.filter(p=>p.rd).length}/${parts.length} bereit${Date.now()<RUN.end+90000?` · Start spätestens in ${fmt(RUN.end+90000-Date.now())}`:''})`;
  else my=`Runde ${RUN.r} von ${R} — Paarung, sobald die vorherigen Duelle fertig sind…`;
  const rec=p=>{const w=p.res.filter(x=>x[2]===1).length,l=p.res.filter(x=>x[2]===0).length,d=p.res.filter(x=>x[2]===0.5).length;return`${w}-${l}${d?'-'+d:''}`};
  const h=`<h2>⚖ DAS GERICHT</h2><div class="small">${cfgOf().tb?'Rundenbasiert':'Echtzeit'} · Schweizer System · ${R} Runde${R>1?'n':''} · je ${cfgOf().team} Monster · Teams voll geheilt</div><div class="st">${esc(my)}</div>
   <div class="arow" style="background:transparent;border-color:transparent;font-size:16px;color:var(--muted)"><span>#  SPIELER</span><span>PKT · BUCHHOLZ · S-N</span></div>
   ${tab.map((p,i)=>`<div class="arow" ${p.me?'style="border-color:var(--accent)"':''}><span>${i+1}. <span class="sw" style="display:inline-block;width:10px;height:10px;background:${p.c};border:2px solid #000;margin:0 4px"></span>${esc(p.n)}${p.me?' (du)':''}${readyRoom(parts)?(p.rd?' <b style="color:#3ddc6b">✔</b>':' <span style="color:var(--muted)">☐</span>'):''}</span><span>${p.score} · ${p.bh} · ${rec(p)} <span class="tag" style="background:${stCol[p.st]||'#555'}">${stTxt[p.st]||'?'}</span></span></div>`).join('')}
   ${(RUN.res||[]).length?`<div class="small" style="margin-top:8px">Deine Spiele: ${RUN.res.map(x=>`R${x[0]} gegen ${esc(nameOf(x[1]))}: ${x[2]===1?'gewonnen':x[2]===0?'verloren':'unentschieden'}`).join(' · ')}</div>`:''}
   ${RUN.st==='wait'&&readyRoom(parts)?`<div style="margin-top:10px"><button class="btn ${RUN.rdy?'ghost':'green'}" id="ardy" style="width:100%">${RUN.rdy?'☐ DOCH NICHT BEREIT':'✔ BEREIT'}</button></div>`:''}
   ${RUN.st!=='done'?'<div style="margin-top:10px"><button class="btn red" id="agiveup" style="width:100%">🏳 TURNIER AUFGEBEN</button></div>':''}${RUN.st==='done'?rematchHtml():''}${canGoBack()?'<div style="margin-top:10px"><button class="btn ghost" id="aback" style="width:100%">◀ ZURÜCK INS TRAINING</button></div>':''}`;
  if($('#abox').dataset.h!==h){$('#abox').dataset.h=h;$('#abox').innerHTML=h;const b=$('#aleave');if(b)b.onclick=leaveRun;const bk=$('#aback');if(bk)bk.onclick=backToTraining;const gu=$('#agiveup');if(gu)gu.onclick=giveUpArena;const rdb=$('#ardy');if(rdb)rdb.onclick=toggleReady;
    const r=$('#arematch');if(r)r.onclick=()=>{const prev=RUN.id,cfg=Object.assign({},RUN.cfg,{host:MYPEER||'me'});pickStarter(sid=>startRun('m'+Math.random().toString(36).slice(2,10),0,sid,prev,cfg,'lobby'),cfg)};
    document.querySelectorAll('[data-rjoin]').forEach(b=>b.onclick=()=>joinLobby(b.dataset.rjoin))}
}
function giveUpArena(){
  openModal(`<h3>TURNIER AUFGEBEN?</h3><p>Du wirst nicht mehr gepaart. Deine bisherigen Punkte bleiben in der Tabelle${B&&B.mode==='duel'&&!B.spar?' und dein aktuelles Duell zählt als Niederlage':''}.</p><div class="acts"><button class="btn ghost" id="mno">WEITERKÄMPFEN</button><button class="btn red" id="myes">AUFGEBEN</button></div>`);
  $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();if(!RUN||RUN.phase!=='arena')return;RUN.gaveUp=1;
    if(B&&B.mode==='duel'&&!B.spar&&B.state!=='over'){forfeit();return}
    RUN.st='done';save();pushMt();sysChat('Du hast das Turnier aufgegeben.');$('#abox').dataset.h='';showArena()};
}
function canGoBack(){return RUN&&RUN.phase==='arena'&&RUN.r===1&&!(RUN.res||[]).length&&(RUN.st==='wait'||RUN.st==='pick')&&Date.now()<RUN.end&&!B&&!participants().some(p=>p.st==='duel')}
function backToTraining(){if(!canGoBack())return;RUN.phase='train';RUN.st='train';RUN.pick=null;RUN.res=[];RUN.r=1;$('#arena').classList.remove('on');$('#abox').dataset.h='';teleport(COURT.x,COURT.y+2);P.d='down';save();pushMt();toast('Zurück ins Training!')}
function rematchHtml(){
  const seen=new Map();for(const p of others()){const mt=p.presence.mt;if(mt&&mt.prev===RUN.id&&(mt.st==='lobby'||(mt.st==='train'&&+mt.end>Date.now()+10000))&&typeof mt.id==='string'&&mt.id.length<40){const e=seen.get(mt.id)||{id:mt.id,end:+mt.end,n:[]};e.n.push(cleanName(p.presence.n));seen.set(mt.id,e)}}
  let h='<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">';
  for(const m of seen.values())h+=`<button class="btn green" data-rjoin="${esc(m.id)}" data-end="${m.end}">REVANCHE-LOBBY BEITRETEN (${esc(m.n.slice(0,2).join(', '))})</button>`;
  h+=`<div style="display:flex;gap:8px"><button class="btn" id="arematch" style="flex:1">NEUE LOBBY (GLEICHE EINSTELLUNGEN)</button><button class="btn ghost" id="aleave">VERLASSEN</button></div></div>`;return h;
}
function openModal(h){const mb=$('#mbox');mb.style.maxWidth='';mb.style.maxHeight='';mb.style.overflow='';mb.innerHTML=h;$('#modal').classList.add('on')}
function closeModal(){$('#modal').classList.remove('on')}


// classic flat-roof look (before the tower style) – used in every town except Villingen
let SHOPSPR0=null,HFSPR0=null;
function shopSpriteOld(){if(SHOPSPR0)return SHOPSPR0;const W=80,H=64,c=mk(W,H),x=c.getContext('2d');const F=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  // roof: blue shop roof with ridges and a light front edge
  F('#14141f',0,2,W,30);F('#2f6fd0',1,3,W-2,28);for(let y=6;y<30;y+=4)F('#2458b0',1,y,W-2,1);F('#5a92ea',1,3,W-2,2);F('#14141f',0,31,W,1);
  // walls
  F('#14141f',0,32,W,32);F('#f1ece0',1,32,W-2,31);F('#cfc6b0',1,60,W-2,3);
  // striped awning
  for(let i=0;i<W-2;i+=6){F('#d23b3b',1+i,33,3,6);F('#ffffff',4+i,33,3,6)}F('#14141f',1,39,W-2,1);for(let i=0;i<W-2;i+=6){F('#d23b3b',1+i,39,3,2);F('#14141f',1+i,41,3,1)}
  // shop windows with goods (left and right of the door)
  const win=(a)=>{F('#14141f',a,43,22,15);F('#8fd0ff',a+1,44,20,13);F('#c8ecff',a+1,44,6,3);
    F('#a5784a',a+1,51,20,1);F('#a5784a',a+1,55,20,1);
    const g=['#ffcb3d','#3ddc6b','#ef4444','#4aa3ff','#c084fc'];for(let k=0;k<5;k++){F(g[k],a+2+k*4,48,3,3);F(g[(k+2)%5],a+2+k*4,52,3,3)}};
  win(4);win(54);
  // glass sliding door (door tile = column 2 → x 32..47)
  F('#14141f',33,42,14,22);F('#5a5f70',34,43,12,21);F('#9fd8ff',35,44,4,19);F('#9fd8ff',41,44,4,19);F('#d6f0ff',35,44,1,19);F('#d6f0ff',41,44,1,19);F('#14141f',40,43,1,21);
  // little € sign over the door
  F('#14141f',36,34,8,5);F('#ffcb3d',37,35,6,3);F('#14141f',39,35,2,3);
  return SHOPSPR0=c}
function hfpolSpriteOld(){if(HFSPR0)return HFSPR0;const W=112,H=64,c=mk(W,H),x=c.getContext('2d');const F=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  // flat roof (seen from above): grey membrane, parapet, skylights and solar panels
  F('#14141f',0,4,W,28);F('#9a9fa8',1,5,W-2,26);F('#b4b9c2',1,5,W-2,2);F('#7d828c',1,29,W-2,2);
  for(let i=0;i<4;i++){F('#14141f',8+i*12,10,9,7);F('#2a3f6a',9+i*12,11,7,5);F('#4f6fa8',9+i*12,11,7,1)}
  for(let i=0;i<3;i++){F('#14141f',64+i*14,9,11,9);F('#d9e6f5',65+i*14,10,9,7);F('#ffffff',65+i*14,10,3,2)}
  F('#7d828c',10,21,92,1);F('#14141f',50,20,12,8);F('#6b7080',51,21,10,6); // roof hatch / technics
  // facade: wooden slats
  F('#14141f',0,32,W,32);F('#c9a46a',1,32,W-2,31);for(let a=2;a<W-1;a+=3)F('#b08a50',a,32,1,31);F('#e0c08a',1,32,W-2,1);F('#8a6a3a',1,61,W-2,2);
  // two ribbon-window floors
  const ribbon=(y)=>{for(let a=3;a<W-3;a+=11){if(a>44&&a<64)continue;F('#14141f',a,y,9,8);F('#2f4c78',a+1,y+1,7,6);F('#6f9bd6',a+1,y+1,3,2)}};ribbon(35);ribbon(48);
  // blue name band + police star
  F('#14141f',38,33,36,9);F('#1d3f8f',39,34,34,7);
  // glazed entrance (door tile = column 3 → x 48..63) with canopy
  F('#14141f',44,43,24,2);F('#d9dde4',45,43,22,1);
  F('#14141f',48,46,16,18);F('#3b5f8c',49,47,14,17);F('#9fd8ff',50,48,5,16);F('#9fd8ff',57,48,5,16);F('#d6f0ff',50,48,1,16);F('#14141f',55,47,2,17);
  // flagpole with the Baden-Württemberg colours (black/yellow)
  F('#14141f',104,30,1,32);F('#14141f',105,30,7,6);F('#14141f',106,31,5,2);F('#ffcb3d',106,33,5,2);
  return HFSPR0=c}

// ===== TMs: random regular attacks, type-bound (the monster's own type, Normal moves for everyone). From trainers and regional shop offers
const TM_SHOP={vil:['normal','electric'],lah:['water','rock'],unt:['fire','rock'],dam:['grass','normal'],mos:['grass','flying'],mar:['water','flying']};
function tmMoves(){return Object.keys(MOVES).filter(k=>{const v=MOVES[k];return v.k!=='self'&&(v.p||0)>=25&&TYPES[v.t]})}
function tmRandom(r,tier){const lo=[0,30,55,80][tier||1],hi=[0,60,85,130][tier||1];const c=tmMoves().filter(k=>MOVES[k].p>=lo&&MOVES[k].p<=hi);return c.length?c[Math.floor(r()*c.length)]:null}
function tmGive(k){RUN.tm=RUN.tm||{};RUN.tm[k]=(RUN.tm[k]||0)+1;save()}
function tmOK(m,k){const v=MOVES[k];return!!v&&!m.m.includes(k)&&(v.t===SPECIES[m.s].t||v.t==='normal')}
function tmOwned(){return Object.entries(RUN&&RUN.tm||{}).filter(e=>e[1]>0).map(e=>e[0])}
function tmPrice(k){return 120+Math.round((MOVES[k].p||40)*4)}
function shopTown(){let best=null,bd=1e9;for(const T of TOWNS){const d=Math.abs(T.x-P.x)+Math.abs(T.y-P.y);if(d<bd){bd=d;best=T}}return best}
function tmShopList(){const T=shopTown();if(!T)return[];const ty=TM_SHOP[T.id]||['normal'],r=mulberry32(hashStr('tm:'+T.id)),pool=tmMoves().filter(k=>ty.includes(MOVES[k].t)&&MOVES[k].p<=95),out=[];
  while(out.length<4&&pool.length){out.push(pool.splice(Math.floor(r()*pool.length),1)[0])}return out}
function buyTM(k){if(!shopOK()||!tmShopList().includes(k))return;const p=tmPrice(k);if(money()<p){toast('Nicht genug Geld.');return}RUN.money-=p;tmGive(k);updateHud();toast(`💿 TM ${MOVES[k].n} gekauft.`);openShop()}
function openTMFor(m){const ks=tmOwned().filter(k=>tmOK(m,k));if(!ks.length){toast('Keine passende TM — TMs gibt es von Trainern und regional im Copshop.');return}
  openModal(`<h3>💿 TM FÜR ${esc(SPECIES[m.s].n.toUpperCase())}</h3><p class="small">Nur Attacken vom Typ ${esc(TYPES[SPECIES[m.s].t].n)} oder Normal.</p><div style="display:flex;flex-direction:column;gap:6px">${ks.map(k=>`<button class="btn ghost" data-tm="${k}" style="font-family:VT323,monospace;font-size:19px">💿 ${esc(MOVES[k].n)} · ${esc(TYPES[MOVES[k].t].n)} · Stärke ${MOVES[k].p} ×${RUN.tm[k]}</button>`).join('')}</div><div class="acts" style="margin-top:8px"><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  document.querySelectorAll('[data-tm]').forEach(b=>b.onclick=()=>tmTeach(m,b.dataset.tm));$('#mok').onclick=closeModal}
function tmTeach(m,k){const fin=()=>{RUN.tm[k]--;closeModal();toast(`${SPECIES[m.s].n} hat ${MOVES[k].n} gelernt!`);changed()};
  if(m.m.length<4){m.m.push(k);fin();return}
  openModal(`<h3>WELCHE ATTACKE VERGESSEN?</h3><p class="small">${esc(SPECIES[m.s].n)} lernt ${esc(MOVES[k].n)}.</p><div style="display:flex;flex-direction:column;gap:6px">${m.m.map((mv,i)=>`<button class="btn ghost" data-fg="${i}" style="font-family:VT323,monospace;font-size:19px">${esc(MOVES[mv].n)} · ${esc(TYPES[MOVES[mv].t].n)} · Stärke ${MOVES[mv].p||0}</button>`).join('')}</div><div class="acts" style="margin-top:8px"><button class="btn ghost" id="mno">ABBRECHEN</button></div>`);
  document.querySelectorAll('[data-fg]').forEach(b=>b.onclick=()=>{m.m[+b.dataset.fg]=k;fin()});$('#mno').onclick=closeModal}

// ===== Beutel (top bar): all items; give one to a monster, or mark it as favourite (pre-selected in battle)
const BAG_GIVE=['potion','superp','revive','candy'],BAG_FAV=['potion','superp','revive','ether','great'];
function openBagMenu(){if(!RUN){toast('Erst ein Spiel starten.');return}if(B){toast('Im Kampf: Beutel-Knopf unten nutzen.');return}
  const ks=Object.keys(ITEMS).filter(k=>inv(k)>0),tms=tmOwned();
  openModal(`<h3>🎒 BEUTEL</h3>${ks.length?`<div style="display:flex;flex-direction:column;gap:6px">${ks.map(k=>`<div class="mvrow" style="display:flex;align-items:center;gap:8px"><span style="font-size:22px;width:28px;text-align:center">${ITEMS[k].i}</span><span style="flex:1"><b>${esc(ITEMS[k].n)}</b> ×${inv(k)}${RUN.favItem===k?' <span style="color:#ffcb3d">★ Favorit</span>':''}<br><span class="small">${esc(ITEMS[k].d)}</span></span>
      ${BAG_GIVE.includes(k)?`<button class="btn" data-give="${k}">GEBEN</button>`:''}${BAG_FAV.includes(k)?`<button class="btn ghost" data-fav="${k}" title="Favorit: im Kampf zuerst ausgewählt" style="font-family:sans-serif;font-size:18px;padding:2px 8px;color:#ffcb3d">${RUN.favItem===k?'★':'☆'}</button>`:''}</div>`).join('')}</div>`:'<p class="small">Der Beutel ist leer — Items gibt es im Copshop.</p>'}
    ${tms.length?`<div class="lbl2" style="margin:10px 0 4px">💿 TMs</div><div class="small">${tms.map(k=>`${esc(MOVES[k].n)} (${esc(TYPES[MOVES[k].t].n)}) ×${RUN.tm[k]}`).join(' · ')}<br>Einsetzen über 💿 TM am Monster im Team.</div>`:''}
    <div class="acts" style="margin-top:10px"><button class="btn" id="mok">SCHLIESSEN</button></div>`);
  document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>{const k=b.dataset.fav;RUN.favItem=RUN.favItem===k?null:k;save();openBagMenu()});
  document.querySelectorAll('[data-give]').forEach(b=>b.onclick=()=>bagGivePick(b.dataset.give));$('#mok').onclick=closeModal}
function bagGivePick(k){const all=RUN.team.concat(RUN.box);const ok=m=>{const st=stats(m);return k==='revive'?m.hp<=0:k==='candy'?true:m.hp>0&&m.hp<st.mhp};
  const list=all.filter(ok);if(!list.length){toast(k==='revive'?'Kein besiegtes Monster.':k==='candy'?'Keine Monster.':'Kein Monster braucht das gerade.');return}
  openModal(`<h3>${ITEMS[k].i} ${esc(ITEMS[k].n.toUpperCase())} GEBEN</h3><div style="display:flex;flex-direction:column;gap:6px">${list.map((m,i)=>`<button class="btn ghost" data-gm="${i}" style="font-family:VT323,monospace;font-size:19px;text-align:left">${esc(SPECIES[m.s].n)} · Lv ${m.l} · KP ${m.hp}/${stats(m).mhp}</button>`).join('')}</div><div class="acts" style="margin-top:8px"><button class="btn ghost" id="mno">ZURÜCK</button></div>`);
  document.querySelectorAll('[data-gm]').forEach(b=>b.onclick=()=>{useItemOn(k,list[+b.dataset.gm]);renderTeam();openBagMenu()});$('#mno').onclick=openBagMenu}
