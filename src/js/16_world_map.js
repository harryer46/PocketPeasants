/* ===================== WORLD MAP ===================== */
const MCOL={37:'#cfeaff',32:'#a07848',33:'#a07848',34:'#a07848',35:'#a07848',21:'#dcc690',22:'#7c4a22',23:'#7c4a22',20:'#6b6f7a',0:'#6cc44f',1:'#3f9a30',2:'#1f5e2a',3:'#3b8fd9',4:'#e0c890',5:'#ecd79a',6:'#efe8dc',7:'#7c4a22',8:'#d23b3b',9:'#7fd060',10:'#5b4bc4',11:'#a9a9bd',12:'#2d2350',13:'#f2e7b8',14:'#3f8a3a',15:'#c4a374',16:'#6d675d',17:'#25652a',18:'#9fbf5a',19:'#9a7d50',24:'#b9cdd9',25:'#c29a58',26:'#1f8a46',27:'#a8743c',28:'#e8eef4',29:'#e4c48a',30:'#2f7a3c',31:'#7a808c'};
const BIO_C=(()=>{const acc={};for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const b=BKEYS[BIOME[y*MW+x]];if(!b)continue;const a=acc[b]||(acc[b]={x:0,y:0,n:0});a.x+=x;a.y+=y;a.n++}const o={};for(const k in acc)o[k]={x:acc[k].x/acc[k].n,y:acc[k].y/acc[k].n};return o})();
function mapOpen(){return $('#mapov').classList.contains('on')}
function openMap(){if(B)return;$('#mapov').classList.add('on');held.length=0;drawMap.rc=1;drawMap();renderMapLegend();renderFly()}
// quick travel: every town you have visited (free), with FLY also every signpost
function flySpots(){const out=TOWNS.filter(T=>T.id==='vil'||(RUN&&RUN.towns&&RUN.towns[T.id])).map(T=>({n:T.n,x:T.x,y:T.y}));return out}
function renderFly(){let el=$('#flybar');if(!el){el=document.createElement('div');el.id='flybar';el.style.cssText='margin:8px 0;display:flex;flex-wrap:wrap;gap:6px;justify-content:center';const mb=$('#mapov .mapbox')||$('#mapov').firstElementChild;mb.insertBefore(el,mb.children[1]||null)}
  if(!RUN||RUN.phase==='arena'||RUN.phase==='lobby'||B){el.innerHTML='';return}
  el.innerHTML=`<span class="small" style="align-self:center">🕊 SCHNELLREISE nach:</span>`+flySpots().map((f,i)=>`<button class="btn ghost" data-fly="${i}" style="font-family:VT323,monospace;font-size:17px;padding:3px 8px">${esc(f.n)}</button>`).join('');
  el.querySelectorAll('[data-fly]').forEach(b=>b.onclick=()=>{const f=flySpots()[+b.dataset.fly];closeMap();transition('fade',()=>{teleport(f.x,f.y);toast('🕊 Schnellreise nach '+f.n+'!')})})}
function closeMap(){$('#mapov').classList.remove('on')}
function toggleMap(){mapOpen()?closeMap():openMap()}
let MINI=null;
function miniMap(){if(MINI)return MINI;const c=mk(MW,MH),x=c.getContext('2d'),id=x.createImageData(MW,MH),d=id.data;const rgb={};
  for(let i=0;i<MW*MH;i++){const t=MAP[i],b=BIOME[i],h=(t===16&&b===7)?'#a87a44':(t===2&&b===6)?'#3f6a5a':(t===2&&b===7)?'#5a8a3a':(t===2&&b===8)?'#1f6a32':MCOL[t]||'#000';const q=rgb[h]||(rgb[h]=hex2rgb(h));d[i*4]=q[0];d[i*4+1]=q[1];d[i*4+2]=q[2];d[i*4+3]=255}x.putImageData(id,0,0);MINI=c;return c}
// zoom (+/− buttons, keys + and −, ctrl+wheel); the map scrolls inside #mapwrap and centers on the player when zooming
let MAPZ=1;const MAPZS=[1,1.5,2,3,4,6];
function mapZoom(d,cx,cy){const i=MAPZS.indexOf(MAPZ),j=clamp(i+d,0,MAPZS.length-1);if(i===j)return;const w=$('#mapwrap'),cv=$('#mapcv');
  const fx=cx!=null?(w.scrollLeft+cx)/cv.clientWidth:null,fy=cy!=null?(w.scrollTop+cy)/cv.clientHeight:null;MAPZ=MAPZS[j];$('#mzlv').textContent=MAPZ+'×';
  mapZoom.focus=fx!=null?{fx,fy,cx,cy}:null;drawMap()}
function mapCenter(ts){const w=$('#mapwrap'),cv=$('#mapcv');if(!w)return;const f=mapZoom.focus;mapZoom.focus=null;
  if(f){w.scrollLeft=f.fx*cv.clientWidth-f.cx;w.scrollTop=f.fy*cv.clientHeight-f.cy;return}
  const dg=P.fy>=MH?(dungeonAt(P.x,P.y)||caveAt(P.x,P.y)):null,px=((dg?dg.ex:P.fx)+.5)*ts,py=((dg?dg.ey:P.fy)+.5)*ts;w.scrollLeft=px-w.clientWidth/2;w.scrollTop=py-w.clientHeight/2}
function bindMapZoom(){if(bindMapZoom.done)return;bindMapZoom.done=1;$('#mzin').onclick=()=>mapZoom(1);$('#mzout').onclick=()=>mapZoom(-1);
  $('#mapwrap').addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const r=$('#mapwrap').getBoundingClientRect();mapZoom(e.deltaY<0?1:-1,e.clientX-r.left,e.clientY-r.top)},{passive:false})}
function drawMap(){bindMapZoom();
  if(!mapOpen())return;const cv=$('#mapcv'),st=$('#stage');
  const ts0=Math.max(1.4,Math.min((st.clientWidth-40)/MW,(st.clientHeight*0.7)/MH)),ts=ts0*MAPZ,tf=ts0*Math.min(MAPZ,2);
  const dpr=Math.min(3,devicePixelRatio||1,9000/(MW*ts));const W=Math.round(MW*ts),H=Math.round(MH*ts);
  if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';mapCenter(ts)}else if(drawMap.rc)mapCenter(ts);drawMap.rc=0;
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;c.drawImage(miniMap(),0,0,W,H);
  try{drawLocked(c,W,H,ts)}catch(e){console.error(e)}
  c.textAlign='center';const F=Math.max(10,tf*5);
  for(const[k,p]of Object.entries(BIO_C)){if(!ZONES[k])continue;const L=ZLV[k];c.font=`${Math.max(7,Math.round(tf*3.2))}px "Press Start 2P",monospace`;const t=ZONES[k].n.toUpperCase();c.fillStyle='#000000a0';c.fillText(t,p.x*ts+1,p.y*ts+1);c.fillStyle='#ffffff';c.fillText(t,p.x*ts,p.y*ts);
  }
  // route names only (the level ranges are on the signs)
  {c.font=`${Math.max(9,Math.round(tf*3.8))}px VT323,monospace`;for(let n=1;n<=ROUTE_N;n++){const R=ROUTES[n];if(!R||R.pix.length<6)continue;const i=R.pix[R.pix.length>>1],x=i%MW,y=(i-x)/MW,t=`R ${n}`;
    const w=c.measureText(t).width+4;c.fillStyle='#14141fd0';c.fillRect(x*ts-w/2,y*ts-tf*2.4,w,tf*3.2);c.fillStyle='#ffcb3d';c.fillText(t,x*ts,y*ts)}}
  const mark=(x,y,txt,col,f)=>{c.font=`${f||F}px VT323,monospace`;c.fillStyle='#000';c.fillText(txt,(x+.5)*ts+1,(y+.5)*ts+(f||F)/3+1);c.fillStyle=col;c.fillText(txt,(x+.5)*ts,(y+.5)*ts+(f||F)/3)};
  for(const T of TOWNS){const vis=T.id==='vil'||(RUN&&RUN.towns&&RUN.towns[T.id]);c.fillStyle='#000';c.fillRect((T.x-6)*ts-1,(T.y-7)*ts-1,12*ts+2,8*ts+2);c.fillStyle=vis?'#ffcb3d':'#dcc690';c.fillRect((T.x-6)*ts,(T.y-7)*ts,12*ts,8*ts);
    c.font=`${Math.max(9,Math.round(tf*4))}px VT323,monospace`;c.fillStyle='#000';c.fillText(T.n,T.x*ts+1,(T.y-9)*ts+1);c.fillStyle='#ffffff';c.fillText(T.n,T.x*ts,(T.y-9)*ts)}
  mark(KNAST_C.x,KNAST_C.y,'⛓','#ffffff');
  for(const L of LEGENDS){const gone=RUN&&RUN.leg&&RUN.leg[L.id];mark(L.ex??L.x,L.ey??L.y,'★',gone?'#8a8ea6':'#ffcb3d')}
  const dot=(x,y,col,s)=>{s=s||Math.max(2,ts*1.6);c.fillStyle='#000';c.fillRect(x*ts-s/2-1,y*ts-s/2-1,s+2,s+2);c.fillStyle=col;c.fillRect(x*ts-s/2,y*ts-s/2,s,s)};
  for(const t of tollSpots())dot(t.x+.5,t.y+.5,tollPaid(t.b)?'#3ddc6b':'#c27bff');
  for(const t of TRAINERS){if(t.y>=MH||t.story&&!storyOn())continue;const beat=RUN&&RUN.beat&&RUN.beat[t.id];dot(t.x+.5,t.y+.5,beat?'#8a8ea6':t.c,Math.max(2,ts*1.2))}
  // Lizenzen (Feldfähigkeiten/VMs): Symbol + Rahmen an den Trainern, die sie vergeben
  for(const[tid,k]of Object.entries(HM_FROM)){const t=TRAINERS.find(q=>q.id===tid);if(!t||t.y>=MH)continue;const got=hasHM(k),r=Math.max(7,ts*4.5),cx=(t.x+.5)*ts,cy=(t.y+.5)*ts;
    c.lineWidth=Math.max(2,ts*.6);c.strokeStyle='#000';c.strokeRect(cx-r-1,cy-r-1,2*r+2,2*r+2);c.strokeStyle=got?'#3ddc6b':'#ffcb3d';c.strokeRect(cx-r,cy-r,2*r,2*r);
    const f=Math.max(12,Math.round(F*1.15));c.font=`${f}px sans-serif`;c.fillStyle='#fff';c.fillText(HM[k].i,cx,cy-r-f*.25);
    c.font=`${Math.max(9,Math.round(tf*3.4))}px VT323,monospace`;const lb=(got?'✓ ':'')+'Lizenz '+HM[k].n;const w=c.measureText(lb).width+4;c.fillStyle='#14141fd0';c.fillRect(cx-w/2,cy+r+2,w,tf*3.4);c.fillStyle=got?'#3ddc6b':'#ffcb3d';c.fillText(lb,cx,cy+r+tf*2.6)}
  for(const o of OTH.values()){if(o.fx==null)continue;dot(o.fx+.5,o.fy+.5,o.c||'#888',Math.max(3,ts*2.4))}
  const blink=Math.floor(performance.now()/350)%2;{const dg=P.fy>=MH?(dungeonAt(P.x,P.y)||caveAt(P.x,P.y)):null;dot((dg?dg.ex:P.fx)+.5,(dg?dg.ey:P.fy)+.5,blink?'#ffffff':G.color,Math.max(4,ts*3))}
  c.textAlign='left';
}
function renderMapLegend(){
  let h='';
  for(const[k,z]of Object.entries(ZONES)){
    h+=`<div class="mleg"><b style="color:${z.col==='#2f7a2c'?'#5fb04a':z.col}">${z.n.toUpperCase()}</b><br><span class="small">Monster verstecken sich in: ${z.enc}</span><br>${poolOf(k).map(sp=>{const seen=G.dex[sp]!==undefined;const r=rarOf(sp);return`<span style="color:${r.c}">${seen?nameHtml(sp):'???'}</span>`}).join(' · ')}</div>`}
  h+=`<div class="mleg"><b style="color:var(--accent)">LEGENDE</b><br>⚕ PÄD · ⚖ Gericht · 🛒 Copshop · 🎓 HfPol / IAuT (Lernen)<br>★ Legendärer Schrein · ⛓ Knast · ■ Cop (grau = besiegt) · <span style="color:#ffcb3d">□</span> Lizenz-Trainer (grün = Lizenz erhalten) · <span style="color:#c27bff">■</span> Prof. (grün = bestanden)<br>Städte: gelb = besucht (Schnellreise möglich). Jede Stadt hat PÄD, Copshop und HfPol; das Gericht steht in Villingen.<br>Farben: <span style="color:${RARITY.common.c}">häufig</span> · <span style="color:${RARITY.uncommon.c}">ungewöhnlich</span> · <span style="color:${RARITY.rare.c}">selten</span></div>`;
  h+=`<div class="mleg"><b style="color:var(--accent)">LIZENZEN (FELDFÄHIGKEITEN / VMs)</b><br><span class="small">Gibt es nur durch einen Sieg gegen diese Trainer — gelber Rahmen auf der Karte:</span><br>${Object.entries(HM_FROM).map(([tid,k])=>{const t=TRAINERS.find(q=>q.id===tid);if(!t)return'';const z=ZONES[zoneAt(t.x,t.y)],got=hasHM(k),vm=Object.keys(VM_MOVES).filter(m=>VM_MOVES[m]===k).map(m=>MOVES[m]&&MOVES[m].n).filter(Boolean);
    return`<span style="color:${got?'#3ddc6b':'var(--text)'}">${HM[k].i} <b>${HM[k].n}</b>${got?' ✓':''}</span> — ${esc(t.n)}${z?' · '+z.n:''}<br><span class="small">${esc(HM[k].d)}${vm.length?' VM: '+vm.join(', ')+'.':''} Einsatz braucht ${esc(hmNeed(k))} im Kader.</span>`}).join('<br>')}</div>`;
  $('#mapleg').innerHTML=h;
}
$('#hmap').onclick=toggleMap;if($('#hbug'))$('#hbug').onclick=()=>{openModal(`<h3>🐞 BUG MELDEN</h3><p>Lade zuerst das Protokoll herunter und hänge die Datei im GitHub-Ticket an (per Drag & Drop ins Textfeld). Es enthält Verbindungs- und Fehlerereignisse — keine Passwörter.</p><div class="acts"><button class="btn ghost" id="blog">🧾 PROTOKOLL</button><button class="btn" id="bgo">TICKET ÖFFNEN</button></div><div class="acts"><button class="btn ghost" id="mno">SCHLIESSEN</button></div>`);$('#blog').onclick=downloadLog;$('#bgo').onclick=()=>{closeModal();bugReport()};$('#mno').onclick=closeModal};$('#hdex').onclick=()=>{if(G)openDex()};$('#htimer').onclick=()=>{if(isMob())$('#side').classList.add('open');switchTab('lobby')};$('#mclose').onclick=closeMap;
$('#mapov').addEventListener('click',e=>{if(e.target.id==='mapov')closeMap()});

// hover (desktop) / tap (touch) on the world map: names of cops, professors and other players near the pointer
function mapPick(cx,cy){const cv=$('#mapcv'),r=cv.getBoundingClientRect(),ts=r.width/MW,mx=(cx-r.left)/ts,my=(cy-r.top)/ts,rad=Math.max(1.6,7/ts);let best=null,bd=1e9;
  const cand=(x,y,txt)=>{const d=Math.hypot(x+.5-mx,y+.5-my);if(d<rad&&d<bd){bd=d;best=txt}};
  for(const t of TRAINERS){if(t.y>=MH||t.story&&!storyOn())continue;const beat=RUN&&RUN.beat&&RUN.beat[t.id];cand(t.x,t.y,`<b style="color:${t.c||'#fff'}">■</b> ${esc(t.n)}${beat?' <span style="color:#8a8ea6">✓ besiegt</span>':''}`)}
  for(const t of tollSpots())cand(t.x,t.y,`<b style="color:#c27bff">■</b> ${esc(t.n)}${tollPaid(t.b)?' <span style="color:#3ddc6b">✓ bestanden</span>':''}`);
  for(const o of OTH.values())if(o.fx!=null)cand(o.fx,o.fy,`👤 ${esc(o.n||'Spieler')}`);
  return best}
function mapTip(e){let tip=$('#maptip');if(!tip){tip=document.createElement('div');tip.id='maptip';tip.style.cssText='position:fixed;z-index:60;pointer-events:none;background:#14141fe8;border:1px solid #ffcb3d;color:#fff;font:18px VT323,monospace;padding:2px 7px;border-radius:4px;white-space:nowrap;display:none';document.body.appendChild(tip)}
  const h=e&&mapOpen()?mapPick(e.clientX,e.clientY):null;if(!h){tip.style.display='none';return}
  tip.innerHTML=h;tip.style.display='block';const w=tip.offsetWidth;tip.style.left=Math.min(innerWidth-w-4,e.clientX+12)+'px';tip.style.top=Math.max(4,e.clientY-30)+'px'}
{const cv=$('#mapcv');cv.addEventListener('mousemove',mapTip);cv.addEventListener('mouseleave',()=>mapTip(null));cv.addEventListener('click',mapTip);$('#mapwrap').addEventListener('scroll',()=>mapTip(null),{passive:true})}
{const _cm=closeMap;closeMap=function(){mapTip(null);return _cm.apply(this,arguments)}}

// areas whose professor has not been passed yet: diagonal pixel hatching and a pixel-art padlock
const LOCK_PX=["..XXXXX..",".X.....X.",".X.....X.",".X.....X.","XXXXXXXXX","XYYYYYYYX","XYYYZYYYX","XYYYZYYYX","XYYYYYYYX","XXXXXXXXX"];
function lockedBiomes(){if(!RUN||RUN.phase!=='train')return[];const out=[];for(const k in TOLL_LAW){const b=+k;if(!tollPaid(b)&&tollSpots().some(t=>t.b===b))out.push(b)}return out}
function drawLocked(c,W,H,ts){const L=lockedBiomes();if(!L.length)return;const key=L.join(',');
  if(drawLocked.key!==key){drawLocked.key=key;const m=mk(MW,MH),x=m.getContext('2d'),id=x.createImageData(MW,MH),d=id.data;const set=new Set(L);
    for(let i=0;i<MW*MH;i++){if(!set.has(BIOME[i]))continue;const tx=i%MW,ty=(i-tx)/MW;const st=((tx+ty)%6)<2;d[i*4]=20;d[i*4+1]=20;d[i*4+2]=31;d[i*4+3]=st?175:60}
    x.putImageData(id,0,0);drawLocked.cv=m;
    // one padlock per locked area, at its middle
    drawLocked.pos=L.map(b=>{let sx=0,sy=0,n=0;for(let i=0;i<MW*MH;i++)if(BIOME[i]===b){const tx=i%MW;sx+=tx;sy+=(i-tx)/MW;n++}return n?{x:sx/n,y:sy/n}:null}).filter(Boolean)}
  c.drawImage(drawLocked.cv,0,0,W,H);
  const px=Math.max(2,Math.round(ts*1.6));for(const p of drawLocked.pos){const x0=Math.round(p.x*ts-px*4.5),y0=Math.round(p.y*ts+px*2);
    c.fillStyle='#000';c.fillRect(x0-px,y0-px,px*11,px*12);
    for(let y=0;y<LOCK_PX.length;y++)for(let x=0;x<9;x++){const ch=LOCK_PX[y][x];if(ch==='.')continue;c.fillStyle=ch==='X'?(y<4?'#c9ccd6':'#7a5a12'):ch==='Y'?'#ffcb3d':'#14141f';c.fillRect(x0+x*px,y0+y*px,px,px)}}}
