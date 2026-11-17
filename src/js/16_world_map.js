/* ===================== WORLD MAP ===================== */
const MCOL={32:'#a07848',33:'#a07848',34:'#a07848',35:'#a07848',21:'#dcc690',22:'#7c4a22',23:'#7c4a22',20:'#6b6f7a',0:'#6cc44f',1:'#3f9a30',2:'#1f5e2a',3:'#3b8fd9',4:'#e0c890',5:'#ecd79a',6:'#efe8dc',7:'#7c4a22',8:'#d23b3b',9:'#7fd060',10:'#5b4bc4',11:'#a9a9bd',12:'#2d2350',13:'#f2e7b8',14:'#3f8a3a',15:'#c4a374',16:'#6d675d',17:'#25652a',18:'#9fbf5a',19:'#9a7d50',24:'#b9cdd9',25:'#c29a58',26:'#1f8a46',27:'#a8743c',28:'#e8eef4',29:'#e4c48a',30:'#2f7a3c',31:'#7a808c'};
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
  const dg=P.fy>=MH?dungeonAt(P.x,P.y):null,px=((dg?dg.ex:P.fx)+.5)*ts,py=((dg?dg.ey:P.fy)+.5)*ts;w.scrollLeft=px-w.clientWidth/2;w.scrollTop=py-w.clientHeight/2}
function bindMapZoom(){if(bindMapZoom.done)return;bindMapZoom.done=1;$('#mzin').onclick=()=>mapZoom(1);$('#mzout').onclick=()=>mapZoom(-1);
  $('#mapwrap').addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const r=$('#mapwrap').getBoundingClientRect();mapZoom(e.deltaY<0?1:-1,e.clientX-r.left,e.clientY-r.top)},{passive:false})}
function drawMap(){bindMapZoom();
  if(!mapOpen())return;const cv=$('#mapcv'),st=$('#stage');
  const ts0=Math.max(1.4,Math.min((st.clientWidth-40)/MW,(st.clientHeight*0.7)/MH)),ts=ts0*MAPZ,tf=ts0*Math.min(MAPZ,2);
  const dpr=Math.min(3,devicePixelRatio||1,9000/(MW*ts));const W=Math.round(MW*ts),H=Math.round(MH*ts);
  if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';mapCenter(ts)}else if(drawMap.rc)mapCenter(ts);drawMap.rc=0;
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;c.drawImage(miniMap(),0,0,W,H);
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
  for(const o of OTH.values()){if(o.fx==null)continue;dot(o.fx+.5,o.fy+.5,o.c||'#888',Math.max(3,ts*2.4))}
  const blink=Math.floor(performance.now()/350)%2;{const dg=P.fy>=MH?dungeonAt(P.x,P.y):null;dot((dg?dg.ex:P.fx)+.5,(dg?dg.ey:P.fy)+.5,blink?'#ffffff':G.color,Math.max(4,ts*3))}
  c.textAlign='left';
}
function renderMapLegend(){
  let h='';
  for(const[k,z]of Object.entries(ZONES)){
    h+=`<div class="mleg"><b style="color:${z.col==='#2f7a2c'?'#5fb04a':z.col}">${z.n.toUpperCase()}</b><br><span class="small">Monster verstecken sich in: ${z.enc}</span><br>${poolOf(k).map(sp=>{const seen=G.dex[sp]!==undefined;const r=rarOf(sp);return`<span style="color:${r.c}">${seen?nameHtml(sp):'???'}</span>`}).join(' · ')}</div>`}
  h+=`<div class="mleg"><b style="color:var(--accent)">LEGENDE</b><br>⚕ PÄD · ⚖ Gericht · 🛒 Copshop · 🎓 HfPol (Study)<br>★ Legendärer Schrein · ⛓ Knast · ■ Cop (grau = besiegt) · <span style="color:#c27bff">■</span> Prof. (grün = bestanden)<br>Städte: gelb = besucht (Schnellreise möglich). Jede Stadt hat PÄD, Copshop und HfPol; das Gericht steht in Villingen.<br>Farben: <span style="color:${RARITY.common.c}">häufig</span> · <span style="color:${RARITY.uncommon.c}">ungewöhnlich</span> · <span style="color:${RARITY.rare.c}">selten</span></div>`;
  $('#mapleg').innerHTML=h;
}
$('#hmap').onclick=toggleMap;if($('#hbug'))$('#hbug').onclick=()=>{openModal(`<h3>🐞 BUG MELDEN</h3><p>Lade zuerst das Protokoll herunter und hänge die Datei im GitHub-Ticket an (per Drag & Drop ins Textfeld). Es enthält Verbindungs- und Fehlerereignisse — keine Passwörter.</p><div class="acts"><button class="btn ghost" id="blog">🧾 PROTOKOLL</button><button class="btn" id="bgo">TICKET ÖFFNEN</button></div><div class="acts"><button class="btn ghost" id="mno">SCHLIESSEN</button></div>`);$('#blog').onclick=downloadLog;$('#bgo').onclick=()=>{closeModal();bugReport()};$('#mno').onclick=closeModal};$('#hdex').onclick=()=>{if(G)openDex()};$('#htimer').onclick=()=>{if(isMob())$('#side').classList.add('open');switchTab('lobby')};$('#mclose').onclick=closeMap;
$('#mapov').addEventListener('click',e=>{if(e.target.id==='mapov')closeMap()});

