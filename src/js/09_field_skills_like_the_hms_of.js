/* ===================== FIELD SKILLS (like the HMs of the originals) ===================== */
// taught only by the harder trainers: CUT (Rita), SWIM (Sue), STRENGTH (Hank), FLY (Axel)
const HM={cut:{n:'ZERSCHNEIDER',i:'✂',from:'rita',d:'Fällt kleine Bäume auf Nebenwegen (z. B. zu Schreinen).'},swim:{n:'SURFER',i:'🌊',from:'sue',d:'Schwimm über Seen und Flüsse.'},
  str:{n:'STÄRKE',i:'💪',from:'hank',d:'Schiebt Felsbrocken auf Nebenwegen weg.'},fly:{n:'FLIEGEN',i:'🕊',from:'axel',d:'Abheben und frei über die Karte fliegen – über Bäume, Wasser und Felsen (im Team-Menü einsetzen oder Taste F).'}};
const HM_FROM={rita:'cut',sue:'swim',hank:'str',axel:'fly'};
// a field skill is used by a monster of a fitting type in the squad (like teaching the HM to the right Pokémon)
const HM_TYPES={cut:['grass','normal'],swim:['water'],str:['rock','fire'],fly:['flying']};
function hmUser(k){try{return(RUN&&RUN.team||[]).find(m=>m&&m.hp>0&&HM_TYPES[k].includes(SPECIES[m.s].t))||null}catch(e){return null}}
function canHM(k){return hasHM(k)&&!!hmUser(k)}
function hmNeed(k){return HM_TYPES[k].map(t=>TYPES[t].n).join('- oder ')+'-Monster'}
function hasHM(k){try{return!!(RUN&&RUN.hm&&RUN.hm[k])}catch(e){return false}}  // also called while the map is built, before the save is loaded
const FIELD=[],FIELDGONE=new Set();
function fieldAt(x,y){return FIELD.find(f=>f.x===x&&f.y===y&&!FIELDGONE.has(f.id))||null}
function walkable(x,y){const t=tget(x,y);return(WALK.has(t)||(t===3&&canHM('swim')))&&!SIGNSET.has(y*MW+x)&&!fieldAt(x,y)}
// optional side paths to some shrines are blocked by small trees (CUT) or boulders (STRENGTH); islands need SURFER
(function placeField(){let id=0;const spots=[[70,122,'cut'],[71,123,'cut'],[150,22,'str'],[275,36,'str'],[276,124,'cut']];
  for(const[x,y,kind]of spots){let best=null,bd=9;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const X=x+dx,Y=y+dy;if(tget(X,Y)!==4)continue;const d=Math.abs(dx)+Math.abs(dy);if(d<bd){bd=d;best={x:X,y:Y}}}
    if(best&&!FIELD.some(f=>f.x===best.x&&f.y===best.y))FIELD.push({id:id++,x:best.x,y:best.y,kind})}})();
(function placeSigns(){const D4=[[1,0],[-1,0],[0,1],[0,-1]];setTimeout(()=>{const sb=$('#signbox');if(sb)sb.onclick=()=>sb.classList.remove('on')},0);
  const ARW=['→','↘','↓','↙','←','↖','↑','↗'],dirTo=(fx,fy,tx,ty)=>ARW[(Math.round(Math.atan2(ty-fy,tx-fx)/(Math.PI/4))+8)%8];
  const free=(x,y)=>{const i=y*MW+x,t=MAP[i];return x>2&&y>2&&x<MW-3&&y<MH-3&&WALK0.has(t)&&t!==4&&t!==27&&!ENC.has(t)&&t!==13&&!SIGNSET.has(i)&&!TRAINERS.some(q=>Math.abs(q.x-x)+Math.abs(q.y-y)<2)&&!GATES.some(g=>g.i===i)};
  // signs stand right at the roadside: the tile must touch a road; among those prefer close ones with few bushes/trees around
  const isRoad=(x,y)=>{const t=tget(x,y);return t===4||t===27};
  const put=(cx,cy,o,side)=>{let best=null,bs=1e9;for(let rr=0;rr<=8;rr++){for(let dy=-rr;dy<=rr;dy++)for(let dx=-rr;dx<=rr;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==rr)continue;const x=cx+dx,y=cy+dy;if(!free(x,y))continue;if(side!=null&&BIOME[y*MW+x]!==side)continue;
      if(!D4.some(([a,b])=>isRoad(x+a,y+b)))continue;let blk=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if((i||j)&&!WALK0.has(tget(x+i,y+j)))blk++;
      const sc=rr*2+blk*3;if(sc<bs){bs=sc;best=[x,y]}}if(best&&bs<=rr*2+2)break}
    if(!best)return false;const[x,y]=best;SIGNSET.add(y*MW+x);SIGNS.push(Object.assign({x,y},o));return true};
  for(const T of TOWNS)put(T.x+2,T.y+1,{kind:'town',town:T.id,n:T.n});
  for(const g of GATES){if(g.b>8)continue;const gx=g.i%MW,gy=(g.i-gx)/MW;if(g.b===5){put(gx,gy+3,{kind:'knast',to:5,lv:[ZLV.knast.lo,ZLV.knast.hi],arrow:'↑'});continue}
    // the side the visitor comes from
    let side=null,sx=gx,sy=gy;for(const[dx,dy]of D4){const j=(gy+dy)*MW+gx+dx;if((MAP[j]===4||MAP[j]===27)&&BIOME[j]!==g.b){side=BIOME[j];sx=gx+dx*3;sy=gy+dy*3;break}}
    const rr=routeAt(gx,gy)||1;put(sx,sy,{kind:'pass',to:g.b,lv:routeRange(rr),route:rr,arrow:dirTo(sx,sy,gx,gy)},side)}
  // route signs: at every town exit, where a route changes along the way, and one sign at every crossing
  const nodeName=n=>!n?'':n.town?n.n:n.n||'Kreuzung',pt=i=>[i%MW,(i-i%MW)/MW];
  const sign=(i,toI,R,to)=>{const[x,y]=pt(i),[tx,ty]=pt(toI);const o={kind:'route',r:R.n,lv:R.lv,arrow:dirTo(x,y,tx,ty),to};put(x,y,o,null)};
  for(let n=1;n<=ROUTE_N;n++){const R=ROUTES[n],L=R.pix.length;if(L<2)continue;const E=R.edge;
    if(!R.a||R.a.town||R.a.n&&!R.a.cross){if(R.a&&R.a.town)sign(R.pix[Math.min(2,L-1)],R.pix[Math.min(L-1,8)],R,nodeName(E.B))}
    if(!R.a)sign(R.pix[0],R.pix[Math.min(L-1,6)],R,nodeName(E.B));
    if(R.b&&R.b.town)sign(R.pix[Math.max(0,L-3)],R.pix[Math.max(0,L-9)],R,nodeName(E.A))}
  // every road leaving a town gets a route sign right at the exit
  for(const T of TOWNS){const ex=[];for(let y=T.y-26;y<=T.y+26;y++)for(let x=T.x-36;x<=T.x+36;x++){const t=tget(x,y);if((t!==4&&t!==27)||BIOME[y*MW+x]===0||y>=MH)continue;
      if(!D4.some(([a,b])=>BIOME[(y+b)*MW+x+a]===0&&Math.abs(x+a-T.x)<36&&Math.abs(y+b-T.y)<26))continue;if(ex.some(e=>Math.abs(e.x-x)+Math.abs(e.y-y)<6))continue;ex.push({x,y})}
    for(const e of ex){const r=routeAt(e.x,e.y);if(!r||SIGNS.some(g=>(g.kind==='route'||g.kind==='cross')&&Math.abs(g.x-e.x)+Math.abs(g.y-e.y)<8))continue;const R=ROUTES[r];
      const tgt=R.pix[R.pix.length-1],tx=tgt%MW,ty=(tgt-tx)/MW,o={kind:'route',r,lv:R.lv,arrow:dirTo(e.x,e.y,e.x+(e.x-T.x),e.y+(e.y-T.y)),to:nodeName(R.edge&&(R.edge.A&&R.edge.A.town===T.id?R.edge.B:R.edge.A))};
      put(e.x,e.y,o,null)}}
  for(const N of ROUTE_NODES){if(!N.cross)continue;const meet=[];for(let n=1;n<=ROUTE_N;n++){const R=ROUTES[n];if(R.a===N)meet.push({r:n,lv:R.lv,i:R.pix[Math.min(4,R.pix.length-1)]});else if(R.b===N)meet.push({r:n,lv:R.lv,i:R.pix[Math.max(0,R.pix.length-5)]})}
    if(meet.length<2)continue;put(N.x,N.y,{kind:'cross',n:N.n||'',routes:meet.map(m=>{const[x,y]=pt(m.i);return{r:m.r,lv:m.lv,arrow:dirTo(N.x,N.y,x,y)}}).sort((a,b)=>a.r-b.r)},null)}
})();
function signShort(sg){if(sg.kind==='cross')return'KREUZUNG · '+sg.routes.map(r=>`${r.arrow} R${r.r}`).join(' ');if(sg.kind==='route')return`ROUTE ${sg.r} · Lv ${sg.lv[0]}–${sg.lv[1]}`;return sg.kind==='town'?sg.n:`${sg.arrow||''} ${BNAME[sg.to]} · Lv ${sg.lv[0]}–${sg.lv[1]}`}
function signText(sg){if(sg.kind==='cross')return`<b>🪧 KREUZUNG${sg.n?' · '+esc(sg.n):''}</b><br>`+sg.routes.map(r=>`${r.arrow} <b>Route ${r.r}</b> · Lv ${r.lv[0]}–${r.lv[1]}`).join('<br>');if(sg.kind==='route')return`<b>🪧 ROUTE ${sg.r}</b> · wilde Monster Lv ${sg.lv[0]}–${sg.lv[1]} · Trainer ab Lv ${sg.lv[0]+3}<br>${sg.arrow||''} Richtung ${esc(sg.to||'')}${sg.r>=ROUTE_N?'':''}`;if(sg.kind==='knast')return`<b>⛓ KNAST ⛓</b> · Lv ${sg.lv[0]}–${sg.lv[1]}<br>Justizvollzugsanstalt im Unterwertheimer Krater.<br>Hier sitzen nur StGB-Täter — und sie wollen raus! Nur für erfahrene Beamte.`;
  if(sg.kind==='town'){const T=TOWNS.find(t=>t.id===sg.town);return`<b>${esc((sg.n||'').toUpperCase())}</b><br>${sg.town==='vil'?'Polizeischule — ⚖ Gericht (Lobby-Turnier) · ':'Ausbildungsstätte — '}⚕ PÄD (heilen, Wiedereinstieg nach Niederlage) · 🛒 Copshop · 🎓 ${sg.town==='vil'?'HfPol':'IAuT'} (Lernen)<br>🕊 Besuchte Städte erreichst du jederzeit per Schnellreise über die Weltkarte (M).`}
  const z=BKEYS[sg.to],pool=z?poolOf(z):[],mons=pool.map(s=>G&&G.dex&&G.dex[s]!==undefined?SPECIES[s].n:'???').join(', ');
  return`<b>${sg.arrow||''} ${BNAME[sg.to].toUpperCase()}</b> · empfohlen Lv ${sg.lv[0]}–${sg.lv[1]}<br>${TOLL_LAW&&TOLL_LAW[sg.to]?`Am Weg wartet ein Prof. (${TOLL_LAW[sg.to]}): Zwischenprüfung, Bestechung oder Kampf.<br>`:''}Hier gesichtet: ${esc(mons)}`}
function showSign(sg){const el=$('#signbox');el.innerHTML=signText(sg);el.classList.add('on');clearTimeout(showSign.t);showSign.t=setTimeout(()=>el.classList.remove('on'),6000)}
function zoneAt(x,y){if(x<0||y<0||x>=MW||y>=MHT)return null;return BKEYS[BIOME[y*MW+x]]}

