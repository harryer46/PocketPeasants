/* ===================== WORLD MAP ===================== */
const MCOL={21:'#dcc690',22:'#7c4a22',23:'#7c4a22',20:'#6b6f7a',0:'#6cc44f',1:'#3f9a30',2:'#1f5e2a',3:'#3b8fd9',4:'#e0c890',5:'#ecd79a',6:'#efe8dc',7:'#7c4a22',8:'#d23b3b',9:'#7fd060',10:'#5b4bc4',11:'#a9a9bd',12:'#2d2350',13:'#f2e7b8',14:'#3f8a3a',15:'#c4a374',16:'#6d675d',17:'#25652a',18:'#9fbf5a',19:'#9a7d50'};
const BIO_C=(()=>{const acc={};for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const b=BKEYS[BIOME[y*MW+x]];if(!b)continue;const a=acc[b]||(acc[b]={x:0,y:0,n:0});a.x+=x;a.y+=y;a.n++}const o={};for(const k in acc)o[k]={x:acc[k].x/acc[k].n,y:acc[k].y/acc[k].n};return o})();
function mapOpen(){return $('#mapov').classList.contains('on')}
function openMap(){if(B)return;$('#mapov').classList.add('on');held.length=0;drawMap();renderMapLegend();renderFly()}
// FLY: quick travel to town or a signpost
function flySpots(){const out=[{n:'Villingen-Knastningen',x:30,y:24}];for(const sg of SIGNS){if(sg.kind==='town')continue;for(const[dx,dy]of[[0,1],[1,0],[-1,0],[0,-1]])if(walkable(sg.x+dx,sg.y+dy)){out.push({n:`Schild ${BNAME[sg.to]} (${BNAME[BIOME[sg.y*MW+sg.x]]||'Stadt'})`,x:sg.x+dx,y:sg.y+dy});break}}return out}
function renderFly(){let el=$('#flybar');if(!el){el=document.createElement('div');el.id='flybar';el.style.cssText='margin:8px 0;display:flex;flex-wrap:wrap;gap:6px;justify-content:center';const mb=$('#mapov .mapbox')||$('#mapov').firstElementChild;mb.insertBefore(el,mb.children[1]||null)}
  if(!hasHM('fly')||!RUN||RUN.phase==='arena'){el.innerHTML='';return}
  el.innerHTML=`<span class="small" style="align-self:center">🕊 FLIEGEN nach:</span>`+flySpots().map((f,i)=>`<button class="btn ghost" data-fly="${i}" style="font-family:VT323,monospace;font-size:17px;padding:3px 8px">${esc(f.n)}</button>`).join('');
  el.querySelectorAll('[data-fly]').forEach(b=>b.onclick=()=>{const f=flySpots()[+b.dataset.fly];closeMap();transition('fade',()=>{teleport(f.x,f.y);toast('🕊 Du bist nach '+f.n+' geflogen!')})})}
function closeMap(){$('#mapov').classList.remove('on')}
function toggleMap(){mapOpen()?closeMap():openMap()}
function drawMap(){
  if(!mapOpen())return;const cv=$('#mapcv'),st=$('#stage');
  const ts=Math.max(3,Math.floor(Math.min((st.clientWidth-50)/MW,(st.clientHeight*0.66)/MH)));
  const dpr=Math.min(3,devicePixelRatio||1);const W=MW*ts,H=MH*ts;
  if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px'}
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){c.fillStyle=MCOL[tget(x,y)]||'#000';c.fillRect(x*ts,y*ts,ts,ts)}
  // level rings (difficulty rises with distance from town)
  c.setLineDash([ts,ts]);c.lineWidth=Math.max(1,ts/3);
  for(const lv of[5,10,15]){const d=9+(lv-1)/0.47;c.strokeStyle='#ffffffaa';c.beginPath();c.arc((CX+.5)*ts,(CY+.5)*ts,d*ts,0,7);c.stroke();
    c.font=`${Math.max(9,ts*2)}px VT323,monospace`;const ang=-0.42,lx=(CX+.5+Math.cos(ang)*d)*ts,ly=(CY+.5+Math.sin(ang)*d)*ts+ts*0.6;if(ly>ts*2&&lx<MW*ts-ts*2){c.fillStyle='#0b0d16c0';const tw=c.measureText('Lv ~'+lv).width+6;c.fillRect(lx-tw/2,ly-ts*1.6,tw,ts*2);c.fillStyle='#fff';c.textAlign='center';c.fillText('Lv ~'+lv,lx,ly)}}
  c.setLineDash([]);c.textAlign='center';
  const F=Math.max(9,ts*2);
  for(const[k,p]of Object.entries(BIO_C)){c.font=`${Math.max(7,Math.round(ts*1.4))}px "Press Start 2P",monospace`;c.fillStyle='#000000a0';c.fillText(ZONES[k].n.toUpperCase(),p.x*ts+1,p.y*ts+1);c.fillStyle='#ffffff';c.fillText(ZONES[k].n.toUpperCase(),p.x*ts,p.y*ts)}
  const mark=(x,y,txt,col)=>{c.font=`${F}px VT323,monospace`;c.fillStyle='#000';c.fillText(txt,(x+.5)*ts+1,(y+.5)*ts+F/3+1);c.fillStyle=col;c.fillText(txt,(x+.5)*ts,(y+.5)*ts+F/3)};
  mark(25,19,'✚','#ffffff');mark(35.5,18,'⚔','#ffcb3d');mark(25,25.5,'🛒','#ffffff');mark(35,25.5,'🎓','#ffffff');
  for(let y=24;y<28;y++)for(let x=23;x<39;x++){if(x>27&&x<32)continue;c.fillStyle='#dcc690';c.fillRect(x*ts,y*ts,ts,ts)}
  for(const L of LEGENDS){const gone=RUN&&RUN.leg&&RUN.leg[L.id];mark(L.x,L.y,'★',gone?'#8a8ea6':'#ffcb3d')}
  for(const f of FIELD){if(FIELDGONE.has(f.id))continue;c.fillStyle='#000';c.fillRect(f.x*ts-1,f.y*ts-1,ts+2,ts+2);c.fillStyle=f.kind==='cut'?'#56a83c':'#b8bcc4';c.fillRect(f.x*ts,f.y*ts,ts,ts)}
  for(const sg of SIGNS){c.fillStyle='#000';c.fillRect(sg.x*ts-1,sg.y*ts-1,ts+2,ts+2);c.fillStyle='#d9a466';c.fillRect(sg.x*ts,sg.y*ts,ts,ts)}
  for(const t of TRAINERS){const beat=RUN&&RUN.beat&&RUN.beat[t.id];c.fillStyle='#000';c.fillRect(t.x*ts-1,t.y*ts-1,ts+2,ts+2);c.fillStyle=beat?'#8a8ea6':t.c;c.fillRect(t.x*ts,t.y*ts,ts,ts);if(beat){c.fillStyle='#3ddc6b';c.font=`${F}px VT323,monospace`;c.fillText('✓',(t.x+.5)*ts,t.y*ts-2)}}
  for(const o of OTH.values()){if(o.fx==null)continue;c.fillStyle='#000';c.fillRect(o.fx*ts-2,o.fy*ts-2,ts+4,ts+4);c.fillStyle=o.c||'#888';c.fillRect(o.fx*ts-1,o.fy*ts-1,ts+2,ts+2)}
  const blink=Math.floor(performance.now()/350)%2;c.fillStyle=blink?'#ffffff':'#000';c.fillRect(P.fx*ts-3,P.fy*ts-3,ts+6,ts+6);c.fillStyle=G.color;c.fillRect(P.fx*ts-1,P.fy*ts-1,ts+2,ts+2);
  c.textAlign='left';
}
function renderMapLegend(){
  let h='';
  for(const[k,z]of Object.entries(ZONES)){
    h+=`<div class="mleg"><b style="color:${z.col==='#2f7a2c'?'#5fb04a':z.col}">${z.n.toUpperCase()}</b><br><span class="small">Monster verstecken sich in: ${z.enc}</span><br>${poolOf(k).map(sp=>{const seen=G.dex[sp]!==undefined;const r=rarOf(sp);return`<span style="color:${r.c}">${seen?nameHtml(sp):'???'}</span>`}).join(' · ')}</div>`}
  h+=`<div class="mleg"><b style="color:var(--accent)">LEGENDE</b><br>🚓 Dienststelle · ⚖ Gericht · 🛒 Copshop · 🎓 HfPol (Study)<br>★ Legendärer Schrein · ■ Cop (✓ besiegt) ·<span style="color:#d9a466">■</span> Schild ·<span style="color:#56a83c">■</span> Bäumchen (Zerschneider) ·<span style="color:#b8bcc4">■</span> Felsbrocken<br>Ringe: Wilde Monster werden mit Abstand zur Stadt stärker.<br>Farben: <span style="color:${RARITY.common.c}">häufig</span> · <span style="color:${RARITY.uncommon.c}">ungewöhnlich</span> · <span style="color:${RARITY.rare.c}">selten</span></div>`;
  $('#mapleg').innerHTML=h;
}
$('#hmap').onclick=toggleMap;$('#hsave').onclick=manualSave;$('#hbug').onclick=()=>{openModal(`<h3>🐞 BUG MELDEN</h3><p>Lade zuerst das Protokoll herunter und hänge die Datei im GitHub-Ticket an (per Drag & Drop ins Textfeld). Es enthält Verbindungs- und Fehlerereignisse — keine Passwörter.</p><div class="acts"><button class="btn ghost" id="blog">🧾 PROTOKOLL</button><button class="btn" id="bgo">TICKET ÖFFNEN</button></div><div class="acts"><button class="btn ghost" id="mno">SCHLIESSEN</button></div>`);$('#blog').onclick=downloadLog;$('#bgo').onclick=()=>{closeModal();bugReport()};$('#mno').onclick=closeModal};$('#hdex').onclick=()=>{if(G)openDex()};$('#hshop').onclick=()=>{if(G)openShop()};$('#htimer').onclick=()=>{if(isMob())$('#side').classList.add('open');switchTab('lobby')};$('#mclose').onclick=closeMap;
$('#mapov').addEventListener('click',e=>{if(e.target.id==='mapov')closeMap()});

