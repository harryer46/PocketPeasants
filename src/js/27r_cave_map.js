/* ===================== HÖHLENKARTE (v0.125) =====================
   Underground, the map (M) shows the cave/dungeon you are in instead of the world: what you have explored so far
   (fog of war, remembered per cave), exits, police tape, gang members, the boss and your party. A button switches
   to the world map and back. */
const CMAP_R=6;let CMAP_V=0;let CMAP_W=false;const CMAP_SEEN={};
function caveArea(x,y){if(y<MH)return null;const d=(typeof coDgAt==='function'&&coDgAt(x,y))||dungeonAt(x,y)||caveAt(x,y);if(!d)return null;
  return{id:(d.law&&d.gates?'co_'+d.law:d.id||d.n),n:d.n,x0:d.x0,y0:d.y0,w:d.w,h:d.h,d}}
function cmapSeen(A){let s=CMAP_SEEN[A.id];if(s&&s.length===A.w*A.h)return s;s=new Uint8Array(A.w*A.h);
  try{const v=localStorage.getItem('pp_cmap_'+A.id);if(v){const b=atob(v);for(let i=0;i<s.length&&i<b.length*8;i++)s[i]=(b.charCodeAt(i>>3)>>(i&7))&1}}catch(e){}
  return CMAP_SEEN[A.id]=s}
function cmapSave(A){const s=CMAP_SEEN[A.id];if(!s)return;try{let o='';for(let i=0;i<s.length;i+=8){let v=0;for(let k=0;k<8;k++)if(s[i+k])v|=1<<k;o+=String.fromCharCode(v)}localStorage.setItem('pp_cmap_'+A.id,btoa(o))}catch(e){}}
// reveal around the player (a little cheaper than every frame: only when the tile changes)
function cmapReveal(){const A=caveArea(P.x,P.y);if(!A)return;const k=P.x+','+P.y;if(cmapReveal.k===k)return;cmapReveal.k=k;const s=cmapSeen(A);let ch=0;
  for(let dy=-CMAP_R;dy<=CMAP_R;dy++)for(let dx=-CMAP_R;dx<=CMAP_R;dx++){if(dx*dx+dy*dy>CMAP_R*CMAP_R+2)continue;const x=P.x+dx-A.x0,y=P.y+dy-A.y0;if(x<0||y<0||x>=A.w||y>=A.h)continue;const i=y*A.w+x;if(!s[i]){s[i]=1;ch=1}}
  if(ch)CMAP_V++;
  if(ch){clearTimeout(cmapReveal.t);cmapReveal.t=setTimeout(()=>cmapSave(A),1500)}}
setInterval(()=>{try{if(RUN&&P&&P.y>=MH)cmapReveal()}catch(e){}},200);
// party in the same co-op cave share what they have seen
function cmapCol(t,X,Y){if(t===T_CAVE)return'#000000';if(t===3)return'#3b8fd9';if(t===13)return'#ffcb3d';if(ENC.has(t))return'#5f8a3a';if(WALK0.has(t))return'#c8b08a';return null}
function drawCaveMap(A){const cv=$('#mapcv'),st=$('#stage');const ts0=Math.max(3,Math.min((st.clientWidth-40)/A.w,(st.clientHeight*0.7)/A.h)),ts=Math.max(2,ts0*Math.min(MAPZ,3));
  const dpr=Math.min(3,devicePixelRatio||1),W=Math.round(A.w*ts),H=Math.round(A.h*ts);
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';drawMap.rc=1}
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#14141f';c.fillRect(0,0,W,H);
  const s=cmapSeen(A),full=!!(RUN&&RUN.cmapAll);
  const key=A.id+'|'+CMAP_V+'|'+full;if(drawCaveMap.key!==key){drawCaveMap.key=key;const m=mk(A.w,A.h),x2=m.getContext('2d'),id=x2.createImageData(A.w,A.h),d=id.data;
    for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const i=y*A.w+x;if(!full&&!s[i])continue;const X=A.x0+x,Y=A.y0+y,q=hex2rgb(cmapCol(tget(X,Y),X,Y)||'#3a3442');d[i*4]=q[0];d[i*4+1]=q[1];d[i*4+2]=q[2];d[i*4+3]=255}
    x2.putImageData(id,0,0);drawCaveMap.cv=m}
  c.drawImage(drawCaveMap.cv,0,0,W,H);
  // the rock right next to explored floor gets a lighter rim, so the shape reads well
  const seenAt=(X,Y)=>{const x=X-A.x0,y=Y-A.y0;return x>=0&&y>=0&&x<A.w&&y<A.h&&(full||s[y*A.w+x])};
  const dot=(X,Y,col,r)=>{if(!seenAt(X,Y))return;const R=Math.max(2,ts*(r||0.9));c.fillStyle='#000';c.fillRect((X-A.x0+.5)*ts-R-1,(Y-A.y0+.5)*ts-R-1,2*R+2,2*R+2);c.fillStyle=col;c.fillRect((X-A.x0+.5)*ts-R,(Y-A.y0+.5)*ts-R,2*R,2*R)};
  const txt=(X,Y,t,col,f)=>{if(!seenAt(X,Y))return;c.font=`${f||Math.max(12,ts*3)}px VT323,monospace`;c.textAlign='center';c.fillStyle='#000';c.fillText(t,(X-A.x0+.5)*ts+1,(Y-A.y0+.5)*ts+1+ts);c.fillStyle=col;c.fillText(t,(X-A.x0+.5)*ts,(Y-A.y0+.5)*ts+ts)};
  for(const f of FIELD){if(f.kind!=='tape'||f.x<A.x0||f.y<A.y0||f.x>=A.x0+A.w||f.y>=A.y0+A.h)continue;const open=FIELDGONE.has(f.id),fail=COOP&&COOP.fail.has(f.gate);dot(f.x,f.y,open?'#3ddc6b':fail?'#ef4444':'#ffd000',0.55)}
  for(const t of TRAINERS){if(t.x<A.x0||t.y<A.y0||t.x>=A.x0+A.w||t.y>=A.y0+A.h)continue;const gone=(t.isGone&&t.isGone())||(RUN&&RUN.beat&&RUN.beat[t.id]);
    dot(t.x,t.y,gone?'#8a8ea6':t.kind==='coboss'?'#c27bff':t.gift?'#3ddc6b':t.block?'#ef4444':'#ff9a3d',t.kind==='coboss'?1.4:0.9)}
  for(const L of LEGENDS){if(L.x<A.x0||L.y<A.y0||L.x>=A.x0+A.w||L.y>=A.y0+A.h)continue;const gone=RUN&&RUN.leg&&RUN.leg[L.id];txt(L.x,L.y,'★',gone?'#8a8ea6':'#ffcb3d')}
  for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++)if(tget(A.x0+x,A.y0+y)===T_CAVE)txt(A.x0+x,A.y0+y,'⇩ Ausgang','#ffffff',Math.max(12,ts*2.4));
  for(const o of OTH.values()){if(o.fx==null)continue;const X=Math.round(o.fx),Y=Math.round(o.fy);if(X<A.x0||Y<A.y0||X>=A.x0+A.w||Y>=A.y0+A.h)continue;const R=Math.max(3,ts*1.2);c.fillStyle='#000';c.fillRect((X-A.x0+.5)*ts-R-1,(Y-A.y0+.5)*ts-R-1,2*R+2,2*R+2);c.fillStyle=o.c||'#888';c.fillRect((X-A.x0+.5)*ts-R,(Y-A.y0+.5)*ts-R,2*R,2*R)}
  const blink=Math.floor(performance.now()/350)%2,R=Math.max(3,ts*1.4);c.fillStyle='#000';c.fillRect((P.fx-A.x0+.5)*ts-R-1,(P.fy-A.y0+.5)*ts-R-1,2*R+2,2*R+2);c.fillStyle=blink?'#ffffff':G.color;c.fillRect((P.fx-A.x0+.5)*ts-R,(P.fy-A.y0+.5)*ts-R,2*R,2*R);
  c.textAlign='left';
  if(drawMap.rc){drawMap.rc=0;const w=$('#mapwrap');w.scrollLeft=(P.fx-A.x0)*ts-w.clientWidth/2;w.scrollTop=(P.fy-A.y0)*ts-w.clientHeight/2}}
function cmapHead(A){const h=$('#mapov .maphead>span');if(!h)return;h.innerHTML=A?`${CMAP_W?'WELTKARTE':'🕳 '+esc(A.n.toUpperCase())} <button class="btn ghost" id="cmsw" style="font-size:9px;padding:4px 8px;margin-left:6px">${CMAP_W?'🕳 HÖHLENKARTE':'🗺 WELTKARTE'}</button>`:'WELTKARTE';
  const b=$('#cmsw');if(b)b.onclick=e=>{e.stopPropagation();CMAP_W=!CMAP_W;const cv=$('#mapcv');cv.width=1;drawMap.rc=1;drawMap();renderMapLegend()}}
{const _dm=drawMap;drawMap=function(){const A=mapOpen()&&P&&caveArea(P.x,P.y);if(!A&&CMAP_W)CMAP_W=false;
  if(A&&!CMAP_W){bindMapZoom();if(cmapHead.a!==A.id+'c'){cmapHead.a=A.id+'c';cmapHead(A)}cmapReveal();return drawCaveMap(A)}
  if(cmapHead.a!==(A?A.id+'w':'')){cmapHead.a=A?A.id+'w':'';cmapHead(A);$('#mapcv').width=1}return _dm.apply(this,arguments)}}
{const _ml=renderMapLegend;renderMapLegend=function(){const A=P&&caveArea(P.x,P.y);if(!A||CMAP_W)return _ml.apply(this,arguments);const s=cmapSeen(A);let n=0,f=0;
  for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++)if(WALK0.has(tget(A.x0+x,A.y0+y))){f++;if(s[y*A.w+x])n++}
  $('#mapleg').innerHTML=`<div class="mleg"><b style="color:var(--accent)">🕳 ${esc(A.n.toUpperCase())}</b> <span class="small" style="color:#ffcb3d">${Math.round(100*n/Math.max(1,f))} % erkundet</span><br><span class="small">Die Karte füllt sich, während du gehst. Grün = Geröll mit wilden Monstern.</span></div>
    <div class="mleg"><b style="color:var(--accent)">LEGENDE</b><br><span style="color:#ffd000">■</span> Absperrung (Abkürzung) · <span style="color:#3ddc6b">■</span> offen · <span style="color:#ef4444">■</span> dauerhaft zu<br><span style="color:#ff9a3d">■</span> Bande · <span style="color:#ef4444">■</span> Wache am Umweg · <span style="color:#c27bff">■</span> Boss · <span style="color:#8a8ea6">■</span> besiegt<br>★ Legendäres Monster · ⇩ Ausgang · ■ blinkend = du</div>`}}
{const _mp=mapPick;mapPick=function(){if(P&&caveArea(P.x,P.y)&&!CMAP_W)return null;return _mp.apply(this,arguments)}}
// co-op: what the party has seen ends up on everybody's map (merged from the shared presence every few seconds)
setInterval(()=>{try{if(!COOP)return;const A=caveArea(P.x,P.y);if(!A)return;const s=cmapSeen(A);
  for(const o of OTH.values()){if(o.fx==null)continue;const X=Math.round(o.fx),Y=Math.round(o.fy);if(X<A.x0||Y<A.y0||X>=A.x0+A.w||Y>=A.y0+A.h)continue;
    for(let dy=-CMAP_R;dy<=CMAP_R;dy++)for(let dx=-CMAP_R;dx<=CMAP_R;dx++){if(dx*dx+dy*dy>CMAP_R*CMAP_R+2)continue;const x=X+dx-A.x0,y=Y+dy-A.y0;if(x>=0&&y>=0&&x<A.w&&y<A.h)if(!s[y*A.w+x]){s[y*A.w+x]=1;CMAP_V++}}}}catch(e){}},600);
