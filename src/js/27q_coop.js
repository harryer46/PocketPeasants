/* ===================== KOOP-EINSATZ =====================
   In jeder Stadt steht ein Polizeiführer. Er eröffnet eine Lobby (bis 4 Spieler, jeder mit seinem aktiven Kader) und bringt
   die Streife in eine Bandenhöhle – eine begehbare Höhle (wie die anderen Höhlen) mit 5 Räumen: wilde Monster im Geröll,
   Bandenmitglieder, Polizeiabsperrungen mit Zwischenprüfung und am Ende der Bandenboss. Jede Höhle hat einen
   Gesetzesschwerpunkt (StGB, StPO, PolG, GG). Jeder Kampf in der Höhle ist ein Koop-Kampf: Wer in der Nähe eines Spielers
   steht, der gerade kämpft, kann dazukommen (bis 4). Der Spieler, der den Kampf begonnen hat, simuliert den Gegner
   (Host); jeder ist für sein eigenes Monster zuständig. Festnehmen geht nur per Handschellen-Wurf. */
const COOP_MAX=4,COOP_K=[1.35,1.55,1.7,1.85],COOP_TIMEOUT=9000;
ZONE_OBS.coopcave=[['boulder',2,3],['rock',2,3],['crystal',2,3],['pillar',1,2]];
BBG.coopcave=mk(2,2);
let COOP=null,CLOB=null,COOP_IV=null;
const COOP_CHIEFS=[],COOP_DECL=new Set();
const COOP_LAW=['StGB','StPO','PolG','GG'],COOP_LAWN={StGB:'Strafrecht (StGB)',StPO:'Strafprozessrecht (StPO)',PolG:'Polizeirecht (PolG)',GG:'Grundgesetz (GG)'};
const COOP_DGN={StGB:'Diebeshöhle',StPO:'Schmugglerstollen',PolG:'Krawallgrotte',GG:'Verfassungsfeindbunker'};
const COOP_NAMES=['PHK Brandt','EPHK Kessler','PHKin Vogt','POR Lindner','PHK Aydın','PRin Hartmann','EPHK Nowak','PHK Seidel','POKin Berger','PR Yilmaz','PHK Wagner','EPHKin Roth'];
const COOP_GANG=['Kralle','Rex','Viper','Schatten','Brecher','Nadel','Zange','Funke','Ratte','Messer','Dietrich','Fuchs'];
const COOP_BOSS=['„Der Pate“','„Die Spinne“','„Eisenfaust“','„Der Graf“'];
function coMe(){return MYPEER||'solo'}
function coName(peer){if(peer===coMe())return(G&&G.name)||'Du';const p=findPeer(peer);return p?cleanName(p.presence.n):'Kollege'}
function coRaw(){return RUN.team.map(m=>[m.s,m.l,m.m.slice(0,4)])}
function coTeam(arr){if(!Array.isArray(arr)||!arr.length||arr.length>6)return null;const out=[];
  for(const e of arr){if(!Array.isArray(e)||!SPECIES[e[0]])return null;const l=clamp(Math.floor(+e[1]||1),1,100);let mv=Array.isArray(e[2])?e[2].filter(x=>typeof x==='string'&&MOVES[x]).slice(0,4):[];if(!mv.length)mv=['bump'];const b=battler({s:e[0],l,hp:0,m:mv});b.hp=b.mhp;out.push(b)}return out}
// Stufe eines Kaders = Schnitt seiner drei stärksten Monster; mehrere Spieler = Schnitt über alle Beteiligten
function coTeamL(levels){const a=(levels||[]).map(v=>+v||1).sort((x,y)=>y-x).slice(0,3);return a.length?a.reduce((p,q)=>p+q,0)/a.length:1}
function coPartL(teams){const v=teams.filter(t=>t&&t.length).map(coTeamL);return clamp(Math.round(v.length?v.reduce((p,q)=>p+q,0)/v.length:1),3,95)}
function coMyL(){return coPartL([RUN.team.map(m=>m.l)])}

// ---- Bandenhöhlen: vier begehbare Höhlen in einem eigenen Untergrund-Band ----
const CODG=[];
function coDgAt(x,y){if(y<MH)return null;return CODG.find(d=>x>=d.x0&&x<d.x0+d.w&&y>=d.y0&&y<d.y0+d.h)||null}
// every cave grows differently: the concept decides room positions/sizes, tunnel style and extras.
// Between two rooms: a police-tape shortcut (the exam opens it) and a winding detour through a side cave,
// guarded by two gang members standing in its narrow tunnels. Each layout is checked by flood fill (retries otherwise).
const CODG_CONCEPT=[
  {k:'labyrinth',rooms:[[36,103],[24,81],[47,59],[24,37],[36,14]],rw:[15,19],rh:[10,13],wob:0.5,swob:0.45,pockets:5,amp:1.2},   // Diebeshöhle: small dens, many dead ends
  {k:'stollen',rooms:[[36,104],[36,81],[36,58],[36,35],[36,13]],rw:[24,28],rh:[8,10],wob:0.08,swob:0.1,props:1,amp:0.5,box:1},  // Schmugglerstollen: long galleries, shafts, timber props
  {k:'grotte',rooms:[[31,101],[43,79],[29,57],[43,35],[36,14]],rw:[22,26],rh:[14,17],wob:0.4,swob:0.35,pockets:2,amp:1.4,isl:3},// Krawallgrotte: huge caverns with rock islands
  {k:'bunker',rooms:[[36,104],[27,82],[45,60],[27,38],[36,14]],rw:[17,20],rh:[10,12],wob:0,swob:0.2,pockets:2,amp:0.35,box:1}];  // Verfassungsfeindbunker: squared halls, straight passages
(function genCoopDungeons(){const FL=29,EN=19,W=72,H=116,Y0=MH+194;if(Y0+H>MHT)return;
  COOP_LAW.forEach((law,i)=>{const CC=CODG_CONCEPT[i%CODG_CONCEPT.length];let L=null;
    for(let tr=0;tr<40&&!L;tr++)L=coLayout(CC,mulberry32(7300+i*97+tr*7919),W,H);
    if(!L){console.warn('coop dungeon layout failed',law);return}
    const dg={i,law,n:COOP_DGN[law],k:CC.k,x0:3+i*74,y0:Y0,w:W,h:H,gates:[],side:[]};CODG.push(dg);
    const X=x=>dg.x0+x,Y=y=>dg.y0+y,r=mulberry32(7301+i*97);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=L.g[y*W+x];tset(X(x),Y(y),t===1?FL:t===2?EN:t===3?16:(r()<0.1?31:16));BIOME[Y(y)*MW+X(x)]=7}
    dg.rooms=L.rooms.map(R=>({x:X(R.x),y:Y(R.y),w:R.w,h:R.h,cx:X(R.cx),cy:Y(R.cy),rx:R.x,ry:R.y}));
    let pool=lawSpecies(law).filter(s=>SPECIES[s]);if(!pool.length)pool=['owigon'];let q=0;
    const band=(x,y,d,kind,extra)=>{const t=Object.assign({id:`cb${i}_${q}`,kind,gift:'coop',dg:i,sp:pool[(i*5+q*3)%pool.length],n:'Bandenmitglied '+COOP_GANG[(i*5+q)%COOP_GANG.length],x:X(x),y:Y(y),d,c:'#6a2a2a',team:[],reward:0,line:'',after:''},extra||{});
      t.isGone=()=>!!(COOP&&COOP.beat.has(t.id));q++;TRAINERS.push(t);return t};
    L.gaps.forEach(G=>{const g={id:`cg${i}_${G.k}`,k:G.k,tiles:G.tape.map(([x,y])=>[X(x),Y(y)])};dg.gates.push(g);g.tiles.forEach(([x,y],j)=>FIELD.push({id:g.id+'_'+j,kind:'tape',gate:g.id,x,y}));
      dg.side.push({k:G.k,left:G.left,x:X(G.side.x),y:Y(G.side.y),w:G.side.w,h:G.side.h});
      G.guards.forEach((p,j)=>band(p[0],p[1],p[2],'cobandit',{block:1,n:'Wache '+COOP_GANG[(i*3+G.k+j*5)%COOP_GANG.length]}))});
    for(const p of L.bandits)band(p[0],p[1],p[2],'cobandit');
    TRAINERS.push({id:`cbb${i}`,kind:'coboss',gift:'coop',dg:i,n:'Bandenboss '+COOP_BOSS[i%COOP_BOSS.length],x:X(L.boss[0]),y:Y(L.boss[1]),d:'down',c:'#2a1a3a',team:[],reward:0,line:'',after:''});
    dg.sx=X(L.start[0]);dg.sy=Y(L.start[1]);dg.hx=X(L.start[0]);dg.hy=Y(L.start[1]+1);tset(dg.hx,dg.hy,T_CAVE)})})();
// one layout attempt on a local grid (0 rock, 1 floor, 2 rubble = wild monsters, 3 pillar); null if a check fails
function coLayout(CC,r,W,H){const g=new Uint8Array(W*H),ri=n=>Math.floor(r()*n),rr=(a)=>a[0]+ri(a[1]-a[0]+1);
  const inb=(x,y)=>x>1&&y>1&&x<W-2&&y<H-2,put=(x,y)=>{if(inb(x,y))g[y*W+x]=1},I=(x,y)=>y*W+x;
  const rooms=[],roomSet=[];
  CC.rooms.forEach(([cx,cy],k)=>{const w=rr(CC.rw)+(k===4?4:0),h=rr(CC.rh)+(k===4?2:0),jx=CC.k==='stollen'?0:ri(5)-2,jy=ri(3)-1;
    const R={x:cx+jx-(w>>1),y:cy+jy-(h>>1),w,h};R.cx=R.x+(w>>1);R.cy=R.y+(h>>1);rooms.push(R);
    const set=new Set();orgBlob(R,r,(x,y)=>{if(inb(x,y)){g[I(x,y)]=1;set.add(I(x,y))}},{amp:CC.amp,box:CC.box});roomSet.push(set)});
  const S=rooms[0];for(let y=S.cy;y<H-3;y++)put(S.cx,y);const start=[S.cx,H-4];
  const prot=new Set(),mark=cells=>{for(const[x,y]of cells)for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++)prot.add(I(x+dx,y+dy))};
  const gaps=[];
  for(let k=1;k<5;k++){const a=rooms[k-1],b=rooms[k];
    // shortcut: 2 wide; straight up if the rooms line up, otherwise a Z with a level middle part
    const aTop=a.y,bBot=b.y+b.h-1;let tape,sc;
    if(Math.abs(a.cx-b.cx)<=1){sc=orgTunnel(a.cx,a.cy,a.cx,b.cy,r,put,{w:2,wob:0});const ty=(aTop+bBot+1)>>1;tape=[[a.cx,ty],[a.cx+1,ty]]}
    else{const my=(aTop+bBot)>>1;sc=[...orgTunnel(a.cx,a.cy,a.cx,my,r,put,{w:2,wob:0}),...orgTunnel(a.cx,my,b.cx,my,r,put,{w:2,wob:0}),...orgTunnel(b.cx,my,b.cx,b.cy,r,put,{w:2,wob:0})];
      const l1=aTop-1-(my+2),l2=(my-1)-(bBot+1);if(Math.max(l1,l2)<0)return null;tape=l1>=l2?[[a.cx,aTop-1-(l1>>1)],[a.cx+1,aTop-1-(l1>>1)]]:[[b.cx,bBot+1+(l2>>1)],[b.cx+1,bBot+1+(l2>>1)]]}
    mark(sc);
    // detour: side cave in the free lane left or right of both rooms
    const lx1=Math.min(a.x,b.x)-3,rx0=Math.max(a.x+a.w,b.x+b.w)+2,lw=lx1-2,rw=W-3-rx0;
    let left=lw>=rw;if(Math.min(lw,rw)>=7)left=(k%2===1)!==(CC.k==='grotte'&&k>2);if((left?lw:rw)<6)return null;
    const sw=Math.min(left?lw:rw,8+ri(4)),sh=Math.min(20,(a.cy-b.cy)-2+ri(4)),sx=left?lx1-sw:rx0,sy=((a.cy+b.cy)>>1)-(sh>>1);
    const SR={x:sx,y:sy,w:sw,h:sh};const sset=new Set();orgBlob(SR,r,(x,y)=>{if(inb(x,y)){g[I(x,y)]=1;sset.add(I(x,y))}},{amp:CC.amp});
    const scx=sx+(sw>>1),scy=sy+(sh>>1);
    const t1=orgTunnel(a.cx,a.cy+(CC.k==='stollen'?0:ri(3)-1),scx,scy+2,r,put,{w:1,wob:CC.swob,maxOff:2}),t2=orgTunnel(scx,scy-2,b.cx,b.cy+(CC.k==='stollen'?0:ri(3)-1),r,put,{w:1,wob:CC.swob,maxOff:2});
    mark(t1);mark(t2);
    const outA=t1.findIndex(([x,y])=>!roomSet[k-1].has(I(x,y))),inB=t2.findIndex(([x,y])=>roomSet[k].has(I(x,y)));
    if(outA<0||inB<4)return null;const g1=t1[outA+1],g2=t2[inB-2];if(!g1||!g2||sset.has(I(g1[0],g1[1]))||sset.has(I(g2[0],g2[1])))return null;
    gaps.push({k,left,tape,side:SR,sset,guards:[[g1[0],g1[1],left?'left':'right'],[g2[0],g2[1],left?'left':'right']]})}
  // checks: tape and guards are the only ways on; each one alone is enough
  const block=new Set();for(const G of gaps){for(const[x,y]of G.tape)block.add(I(x,y));for(const p of G.guards)block.add(I(p[0],p[1]))}
  const ok=()=>{for(const G of gaps){const a=rooms[G.k-1],b=rooms[G.k],s=I(a.cx,a.cy),t=I(b.cx,b.cy);
      if(orgReach(W,H,s,j=>g[j]&&!block.has(j))[t])return false;
      const tp=new Set(G.tape.map(([x,y])=>I(x,y))),gd=new Set(G.guards.map(p=>I(p[0],p[1])));
      if(!orgReach(W,H,s,j=>g[j]&&(!block.has(j)||tp.has(j)))[t])return false;
      if(!orgReach(W,H,s,j=>g[j]&&(!block.has(j)||gd.has(j)))[t])return false}
    return orgReach(W,H,I(start[0],start[1]),j=>g[j]&&!block.has(j))[I(rooms[0].cx,rooms[0].cy)]===1};
  if(!ok())return null;
  // dead-end pockets (kept only if they don't open a way around a tape or a guard)
  for(let n=0;n<(CC.pockets||0);n++){const k=1+ri(3),R=rooms[k],left=r()<0.5,w=6+ri(4),h=5+ri(3),x=left?R.x-w-ri(3):R.x+R.w+ri(3),y=R.cy-(h>>1)+ri(5)-2;
    if(x<2||x+w>W-2)continue;const keep=g.slice();const pc=orgBlob({x,y,w,h},r,put,{amp:CC.amp});orgTunnel(R.cx,R.cy,x+(w>>1),y+(h>>1),r,put,{w:1,wob:CC.swob});
    if(!ok()){g.set(keep);continue}for(const[px,py]of pc)if(r()<0.55&&!prot.has(I(px,py)))g[I(px,py)]=2}
  // rubble with wild monsters, rock islands, timber props
  const freeFl=(x,y)=>g[I(x,y)]===1&&!prot.has(I(x,y));
  const rub=(R,n)=>{for(let m=0;m<n;m++){const px=R.x+2+ri(Math.max(1,R.w-4)),py=R.y+2+ri(Math.max(1,R.h-4)),q=2+ri(2);
    for(let y=py-q;y<=py+q;y++)for(let x=px-q-1;x<=px+q+1;x++)if(((x-px)/(q+1))**2+((y-py)/q)**2<=1&&freeFl(x,y)&&!(Math.abs(x-R.cx)<=2&&Math.abs(y-R.cy)<=2))g[I(x,y)]=2}};
  rooms.forEach((R,k)=>rub(R,[0,1,2,1,0][k]+(CC.k==='grotte'?1:0)));for(const G of gaps)rub(G.side,3);
  if(CC.isl)for(const R of rooms.slice(1,4))for(let m=0;m<CC.isl;m++){const px=R.x+3+ri(Math.max(1,R.w-6)),py=R.y+3+ri(Math.max(1,R.h-6));
    const cl=[[0,0],[1,0],[0,1],[1,1]].filter(()=>r()<0.85);if(cl.every(([dx,dy])=>freeFl(px+dx,py+dy)&&Math.abs(px+dx-R.cx)>2)){const keep=g.slice();for(const[dx,dy]of cl)g[I(px+dx,py+dy)]=3;if(!ok())g.set(keep)}}
  if(CC.props)for(const R of rooms)for(let x=R.x+3;x<R.x+R.w-3;x+=5)for(const y of[R.cy-3,R.cy+3])if(freeFl(x,y)&&Math.abs(x-R.cx)>2){const keep=g.slice();g[I(x,y)]=3;if(!ok())g.set(keep)}
  // gang members in rooms 1 and 3, the boss at the top of the last room
  const spot=(R,fx,fy)=>{let best=null,bd=1e9;for(let y=R.y;y<R.y+R.h;y++)for(let x=R.x;x<R.x+R.w;x++){if(g[I(x,y)]!==1||prot.has(I(x,y)))continue;
      let open=true;for(let dy=-1;dy<=1&&open;dy++)for(let dx=-1;dx<=1;dx++)if(!g[I(x+dx,y+dy)]||g[I(x+dx,y+dy)]===3){open=false;break}if(!open)continue;const d=Math.hypot(x-fx,y-fy);if(d<bd){bd=d;best=[x,y]}}return best};
  const bandits=[];for(const k of[1,3]){const R=rooms[k];const p1=spot(R,R.x+2,R.y+2),p2=spot(R,R.x+R.w-3,R.y+R.h-3);if(p1)bandits.push([p1[0],p1[1],'right']);if(p2&&(!p1||Math.abs(p2[0]-p1[0])+Math.abs(p2[1]-p1[1])>3))bandits.push([p2[0],p2[1],'left'])}
  const T=rooms[4],boss=spot(T,T.cx,T.y+2)||[T.cx,T.cy];
  return{g,rooms,gaps,bandits,boss,start}}
{const _z=zoneAt;zoneAt=function(x,y){if(coDgAt(x,y))return'north';return _z.apply(this,arguments)}}
{const _uh=updateHud;updateHud=function(){_uh.apply(this,arguments);try{const d=coDgAt(P.x,P.y);if(d)$('#hzone').textContent=`🕳 ${d.n} · ${d.law}`}catch(e){}}}
{const _sw=startWild;startWild=function(zk){const d=coDgAt(P.x,P.y);if(d){coWild(d);return}return _sw.apply(this,arguments)}}
{const _oa=onArrive;onArrive=function(){_oa.apply(this,arguments);if(P.fly||B||P.lock)return;const d=coDgAt(P.x,P.y);if(d&&tget(P.x,P.y)===T_CAVE)coExit(d)}}

// ---- Polizeiführer in jeder Stadt ----
{const taken=[];TOWNS.forEach((T,i)=>{const s=wpNear(T.x+3,T.y+2,taken);if(!s)return;
  const t={id:'coop_'+T.id,kind:'coopchief',gift:'coop',town:T.id,tn:T.n,law:COOP_LAW[i%COOP_LAW.length],n:'Polizeiführer '+COOP_NAMES[i%COOP_NAMES.length],x:s.x,y:s.y,d:'down',c:'#0a3d91',team:[],reward:0,line:'',after:''};
  taken.push(t);COOP_CHIEFS.push(t);TRAINERS.push(t)})}
{const _b=bump;bump=function(nx,ny){if(P.bumpCd>0)return _b.apply(this,arguments);
  const f=fieldAt(nx,ny);if(f&&f.kind==='tape'){P.bumpCd=0.5;return coGateTalk(f)}
  const t=trainerAt(nx,ny);if(t&&t.kind==='coopchief'){P.bumpCd=0.5;return coopChief(t)}
  if(t&&(t.kind==='cobandit'||t.kind==='coboss')){P.bumpCd=0.5;return coBanditTalk(t)}
  return _b.apply(this,arguments)}}

function coLobbies(town){return others().filter(p=>{const c=p.presence.cl;return c&&c.h&&c.st==='open'&&c.town===town})}
function coopChief(t){if(!RUN||B||COOP)return;if(teamDown())return;
  const L=coLobbies(t.town);P.lock=true;
  openModal(`<h3>🚔 KOOP-EINSATZ · ${esc(COOP_DGN[t.law])}</h3><p><b>${esc(t.n)}</b>: „In der ${esc(COOP_DGN[t.law])} hat sich eine Bande verschanzt – ihr Revier ist das <b>${COOP_LAWN[t.law]}</b>. Allein schafft das keiner – bildet eine Streife (bis ${COOP_MAX} Leute), ich bringe euch hin.“</p>
   <p class="small">Fünf Höhlenräume mit wilden Monstern im Geröll, Bandenmitgliedern und dem Bandenboss – alle aus dem ${esc(t.law)}. Zwischen den Räumen gibt es eine kurze Abkürzung hinter einer Polizeiabsperrung – einer von euch legt dort eine Prüfung im ${esc(t.law)} ab. Fällt er durch, bleibt sie zu und ihr müsst den langen Umweg mit mehr Kämpfen nehmen. Kämpft jemand (<b>!</b> über dem Kopf), lauft zu ihm und kommt dazu (bis 4). Es gibt <b>keine Heilung</b> in der Höhle. Festnehmen geht nur per Handschellen-Wurf im Kampf – wer zuerst trifft und die Frage beantwortet. Geld gibt es nur von der Bande.</p>
   ${L.length?`<p><b>Offene Streifen:</b></p>${L.map(p=>{const c=p.presence.cl;const n=1+((c.mem||[]).length);return`<button class="btn" style="width:100%;margin:3px 0" data-cj="${esc(p.peer)}" ${n>=COOP_MAX?'disabled':''}>Beitreten: ${esc(cleanName(p.presence.n))} (${n}/${COOP_MAX})</button>`}).join('')}`:'<p class="small">Gerade ist keine Streife offen.</p>'}
   <div class="acts"><button class="btn ghost" id="mno">ZURÜCK</button><button class="btn" id="cnew">NEUE STREIFE GRÜNDEN</button></div>`);
  $('#mno').onclick=()=>{closeModal();P.lock=false};
  $('#cnew').onclick=()=>{CLOB={id:'k'+Math.random().toString(36).slice(2,9),host:true,hostPeer:coMe(),town:t.town,tn:t.tn,chief:t.n,law:t.law};pres({cl:{id:CLOB.id,h:1,st:'open',town:t.town,tm:coRaw(),mem:[]}});coLobbyView()};
  document.querySelectorAll('[data-cj]').forEach(b=>b.onclick=()=>{const p=findPeer(b.dataset.cj);const c=p&&p.presence.cl;if(!c){toast('Diese Streife gibt es nicht mehr.');return}
    CLOB={id:c.id,host:false,hostPeer:p.peer,town:t.town,tn:t.tn,chief:t.n,law:t.law};pres({cl:{j:c.id,jt:Date.now(),tm:coRaw()}});coLobbyView()})}
function coLeaveLobby(msg){CLOB=null;pres({cl:null});if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}closeModal();P.lock=false;if(msg)toast(msg)}
function coJoiners(){if(!CLOB)return[];return others().filter(p=>p.presence.cl&&p.presence.cl.j===CLOB.id).sort((a,b)=>(+a.presence.cl.jt||0)-(+b.presence.cl.jt||0)).slice(0,COOP_MAX-1)}
function coKader(tm){return(tm||[]).map(e=>`${esc(SPECIES[e[0]]?SPECIES[e[0]].n:'?')} <span class="small">Lv ${e[1]|0}</span>`).join(' · ')||'–'}
function coLobbyView(){if(COOP_IV)clearInterval(COOP_IV);const draw=()=>{if(!CLOB){clearInterval(COOP_IV);COOP_IV=null;return}
    let rows=[],ok=true,info='';
    if(CLOB.host){const J=coJoiners();rows=[[coMe(),coRaw()],...J.map(p=>[p.peer,p.presence.cl.tm])];pres({cl:{id:CLOB.id,h:1,st:'open',town:CLOB.town,tm:coRaw(),mem:J.map(p=>p.peer)}})}
    else{const h=findPeer(CLOB.hostPeer),c=h&&h.presence.cl;if(!c||c.id!==CLOB.id){coLeaveLobby('Die Streife wurde aufgelöst.');return}
      if(c.st==='go'){if((c.mem||[]).includes(coMe())&&c.plan){coLeaveLobbyQuiet();coopStart(c.plan,CLOB0.hostPeer);return}coLeaveLobby('Die Streife ist ohne dich losgezogen – sie war voll.');return}
      rows=[[CLOB.hostPeer,c.tm],...(c.mem||[]).map(id=>{const p=findPeer(id);return[id,p&&p.presence.cl?p.presence.cl.tm:null]})];ok=(c.mem||[]).includes(coMe());info=ok?'Du bist dabei. Warte, bis der Streifenführer startet …':'Die Streife ist voll – du stehst auf der Warteliste.'}
    const html=`<h3>🚔 STREIFE · ${esc(CLOB.tn)}</h3><p class="small">${esc(CLOB.chief)} wartet am Eingang der ${esc(COOP_DGN[CLOB.law])}. Schwerpunkt: <b>${esc(COOP_LAWN[CLOB.law]||CLOB.law)}</b></p>
      <div style="text-align:left">${rows.map(([id,tm],i)=>`<div style="padding:4px 6px;margin:3px 0;background:#ffffff10;border-radius:6px"><b>${i===0?'⭐ ':''}${esc(coName(id))}</b><br>${coKader(tm)}</div>`).join('')}
      ${Array.from({length:Math.max(0,COOP_MAX-rows.length)},()=>'<div class="small" style="padding:4px 6px;margin:3px 0;border:1px dashed #ffffff30;border-radius:6px">freier Platz</div>').join('')}</div>
      ${info?`<p class="small">${info}</p>`:`<p class="small">${rows.length} von ${COOP_MAX} Plätzen belegt. Du kannst auch allein starten.</p>`}
      <div class="acts"><button class="btn ghost" id="cleave">VERLASSEN</button>${CLOB.host?'<button class="btn" id="cgo">EINSATZ STARTEN</button>':''}</div>`;
    if($('#mbox').dataset.co!==html||!$('#modal').classList.contains('on')){openModal(html);$('#mbox').dataset.co=html;
      $('#cleave').onclick=()=>coLeaveLobby();if($('#cgo'))$('#cgo').onclick=()=>coHostGo()}};
  draw();COOP_IV=setInterval(draw,600)}
let CLOB0=null;
function coLeaveLobbyQuiet(){CLOB0=CLOB;CLOB=null;if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}pres({cl:null});closeModal()}


// ---- Einsatz: Streife betritt die Höhle; Absperrungen und besiegte Bandenmitglieder gelten für die ganze Streife ----
function coHostGo(){if(!CLOB||!CLOB.host)return;const J=coJoiners();const mem=[coMe(),...J.map(p=>p.peer)];
  const tops=[coRaw(),...J.map(p=>p.presence.cl.tm)].map(tm=>Math.max(1,...(tm||[]).map(e=>e[1]|0)));const L=clamp(Math.round(tops.reduce((a,b)=>a+b,0)/tops.length),3,95);
  const plan={id:'r'+Math.random().toString(36).slice(2,9),L,mem,law:CLOB.law,tn:CLOB.tn,chief:CLOB.chief,town:CLOB.town};
  pres({cl:{id:CLOB.id,h:1,st:'go',town:CLOB.town,tm:coRaw(),mem:J.map(p=>p.peer),plan}});CLOB=null;if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}closeModal();
  setTimeout(()=>{if(!CLOB)pres({cl:null})},8000);coopStart(plan)}
function coopStart(plan){const dg=CODG.find(d=>d.law===plan.law);if(!dg){toast('Diese Höhle gibt es nicht.');P.lock=false;return}
  COOP={id:plan.id,plan,dg:dg.i,L:plan.L,mem:plan.mem,gates:new Set(),beat:new Set(),fail:new Set(),ex:null};P.lock=true;held.length=0;
  transition('fade',()=>{const sl=Math.max(0,plan.mem.indexOf(coMe())),off=[[0,0],[-1,0],[1,0],[0,-1]][sl%4];const ox=dg.sx+off[0],oy=dg.sy+off[1];teleport(WALK.has(tget(ox,oy))&&!fieldAt(ox,oy)?ox:dg.sx,WALK.has(tget(ox,oy))&&!fieldAt(ox,oy)?oy:dg.sy);P.d='up';P.lock=false;coPubParty();try{updateHud()}catch(e){}toast(`🕳 ${dg.n} – Schwerpunkt ${plan.law}`);
    sysChat(`🚔 Koop-Einsatz: ${dg.n} (${plan.law}) mit ${plan.mem.length} ${plan.mem.length===1?'Polizist':'Polizisten'} · Gegner um Lv ${plan.L}`)},300,350)}
function coEnsure(){if(COOP)return COOP;const dg=coDgAt(P.x,P.y);if(!dg)return null;const plan={id:'r'+Math.random().toString(36).slice(2,9),L:coMyL(),mem:[coMe()],law:dg.law};
  COOP={id:plan.id,plan,dg:dg.i,L:plan.L,mem:plan.mem,gates:new Set(),beat:new Set(),fail:new Set(),ex:null};coPubParty();return COOP}
function coPubParty(){if(!COOP)return;pres({co:{r:COOP.id,g:[...COOP.gates],bt:[...COOP.beat],fl:[...COOP.fail],ex:COOP.ex||null}})}
function coApplyGates(){if(!COOP)return;for(const f of FIELD)if(f.kind==='tape'){if(COOP.gates.has(f.gate))FIELDGONE.add(f.id);else FIELDGONE.delete(f.id)}}
function coopEnd(msg){if(COOP_IV){clearInterval(COOP_IV);COOP_IV=null}COOP=null;pres({co:null});for(const f of FIELD)if(f.kind==='tape')FIELDGONE.delete(f.id);if(msg){toast(msg);sysChat('🚔 '+msg)}save()}
function coExit(dg){const ch=COOP_CHIEFS.find(c=>COOP&&COOP.plan.town&&c.town===COOP.plan.town)||COOP_CHIEFS.find(c=>c.law===dg.law)||COOP_CHIEFS[0];P.lock=true;
  transition('fade',()=>{teleport(ch.x,ch.y+1);P.d='down';P.lock=false;coopEnd('☀ Ihr habt die Höhle verlassen.')},300,350)}
// background tick: party sync, opened tape, join offers for nearby fights, cleanup after leaving the cave
setInterval(()=>{try{coTick()}catch(e){}},500);
function coTick(){if(!RUN)return;if(!B&&ARENA_K!==1)arenaScale(1);
  const dg=coDgAt(P.x,P.y);if(COOP&&!dg&&!B&&!P.lock){coopEnd(null);return}
  if(COOP){let ch=false;for(const id of COOP.mem){if(id===coMe())continue;const p=findPeer(id),c=p&&p.presence.co;if(!c||c.r!==COOP.id)continue;
      for(const g of c.g||[])if(typeof g==='string'&&!COOP.gates.has(g)){COOP.gates.add(g);ch=true;toast(`🚧 ${coName(id)} hat eine Absperrung geöffnet.`)}
      for(const t of c.bt||[])if(typeof t==='string'&&!COOP.beat.has(t)){COOP.beat.add(t);ch=true}
      for(const g of c.fl||[])if(typeof g==='string'&&!COOP.fail.has(g)&&!COOP.gates.has(g)){COOP.fail.add(g);ch=true;toast(`🚧 ${coName(id)} ist an einer Absperrung durchgefallen – Umweg nehmen!`)}}
    if(ch)coPubParty();coApplyGates()}
  if(!dg||B||P.lock||$('#modal').classList.contains('on')||TALK)return;
  for(const p of others()){const c=p.presence.cb;if(!c||!c.open||!c.id||COOP_DECL.has(c.id)||!c.fo)continue;if(Math.abs(p.presence.x-P.x)+Math.abs(p.presence.y-P.y)>1)continue;
    coJoinAsk(p);break}}
function coJoinAsk(p){const c=p.presence.cb,fo=c.fo;if(!SPECIES[fo.s])return;P.lock=true;
  openModal(`<h3>⚔ KAMPF IN DER NÄHE</h3><p><b>${esc(cleanName(p.presence.n))}</b> kämpft gegen ${fo.nm?esc(fo.nm)+' · ':''}<b>${esc(SPECIES[fo.s].n)}</b> (Lv ${fo.l|0}).</p><p class="small">${(c.n|0)} von ${COOP_MAX} Plätzen belegt. Der Gegner wird stärker, wenn du dazukommst.${fo.k==='wild'?' Festnehmen: Handschellen werfen – wer trifft und die Frage beantwortet, bekommt das Monster.':''}</p>
    <div class="acts"><button class="btn ghost" id="mno">NEIN</button><button class="btn" id="myes">⚔ BEITRETEN</button></div>`);
  $('#mno').onclick=()=>{COOP_DECL.add(c.id);closeModal();P.lock=false};
  $('#myes').onclick=()=>{closeModal();P.lock=false;const q=findPeer(p.peer);const cc=q&&q.presence.cb;if(!cc||cc.id!==c.id||!cc.open){toast('Der Kampf ist schon vorbei.');return}coJoin(q)}}

// ---- Gegner: stärker mit jedem Mitspieler ----
const CO_HM={wild:1.25,trainer:1.5,extra:1.5,boss:3};
function coHm(k,n){return(1+0.75*(n-1))*(CO_HM[k]||1.25)}
function coFoe(k,s,l){const mon=newMon(s,l);const b=battler(mon);const base=b.mhp;
  b.mhp=b.hp=Math.round(base*coHm(k,1));b.atk=Math.round(b.atk*(k==='boss'?1.2:k==='wild'?1:1.08));b.def=Math.round(b.def*(k==='boss'?1.15:1));if(k==='boss')b.gw=3;b._base=base;return b}
function coSlotX(){return Math.round(ACX+(Math.random()-0.5)*ARX*0.9)}
function coNum(b){const o={};for(const k in b)if(typeof b[k]==='number'&&k!=='hp')o[k]=b[k];return o}
// start a fight in the cave (as host)
function coArena(n,k){arenaScale(COOP_K[clamp(n|0,1,COOP_MAX)-1]*(k==='boss'?1.12:1))}
function coBattle(k,spec){if(B||teamDown())return;coArena(1,k);const foeB=coFoe(k,spec.s,spec.l);
  const me=mkFighter('L',RUN.team.map(battler),ACX,'local');const foe=mkFighter('R',[foeB],ACX,'ai');
  newBattle({mode:'coop',id:'cb'+Math.random().toString(36).slice(2,9),zone:'coopcave',oppName:spec.nm||'',me,foe,allies:[],
    co:{host:true,hp:coMe(),k,off:spec.l-coMyL(),spec:{s:foeB.s,l:spec.l,nm:spec.nm||'',tid:spec.tid||null,gate:spec.gate||null,run:COOP?COOP.id:null},base:foeB._base,n:1,last:null,F:{},seen:new Set(),seenT:{},fq:[],q:0,pubT:0,tgt:null,tgtT:0,fin:false,t0:performance.now()}});
  {const b=act(B.foe);if(b.gw)b._gwB=B}if(k==='wild')B.foe.inv=0.6;G.dex[foeB.s]=G.dex[foeB.s]||0;
  const nm=SPECIES[foeB.s].n;say(k==='boss'?`👑 ${spec.nm} schickt ${nm} (Lv ${spec.l})!`:k==='trainer'?`🦹 ${spec.nm} schickt ${nm} (Lv ${spec.l})!`:k==='extra'?`⚠️ Strafkampf! ${spec.nm} schickt ${nm} (Lv ${spec.l})!`:`🐾 Ein wildes ${nm} (Lv ${spec.l}) greift an!`);
  say('Mitspieler in der Nähe können dazukommen.');coPub(true)}
function coWild(dg){coEnsure();const L=coMyL();const pool=lawSpecies(dg.law).filter(s=>SPECIES[s]);if(!pool.length)return;const l=L+1+Math.floor(Math.random()*3);
  const ok=pool.filter(s=>!(SPECIES[s].minLv>l));const s=(ok.length?ok:pool)[Math.floor(Math.random()*(ok.length||pool.length))];coBattle('wild',{s:newMon(s,l).s,l})}
// one fight per gang member: if somebody of the party is already at it, you can only join
function coFighting(tid){for(const p of others()){const c=p.presence.cb;if(c&&c.fo&&c.fo.tid===tid&&!c.res&&(!COOP||COOP.mem.includes(p.peer)||(p.presence.co&&p.presence.co.r===COOP.id)))return p}return null}
function coBanditTalk(t){const C=coEnsure();if(!C||B)return;if(C.beat.has(t.id)){talk(t.n,t.kind==='coboss'?'Schon gut, schon gut … ich komme ja freiwillig mit.':'Ich ergebe mich! Die Handschellen bitte nicht so fest …');return}
  {const p=coFighting(t.id);if(p){const c=p.presence.cb;if(c.open&&!COOP_DECL.has(c.id)&&Math.abs(p.presence.x-P.x)+Math.abs(p.presence.y-P.y)<=3){coJoinAsk(p);return}
    toast(`⚔ ${cleanName(p.presence.n)} kämpft schon gegen ${t.n} – stell dich daneben, um beizutreten.`);return}}
  const dg=CODG[t.dg],pool=lawSpecies(dg.law).filter(s=>SPECIES[s]);
  if(t.kind==='coboss'){const l=coMyL()+6;const bs=s=>{const b=SPECIES[s].b;return b[0]+b[1]+b[2]+b[3]};const sp=pool.map(s=>newMon(s,l).s).sort((a,b)=>bs(b)-bs(a))[0]||'owigon';
    P.lock=true;talk(t.n,'Ihr seid also die Streife, die meine Leute hochgenommen hat. Jetzt bin ICH dran!',()=>{P.lock=false;coBattle('boss',{s:sp,l,nm:t.n,tid:t.id})});return}
  const l=coMyL()+3;P.lock=true;talk(t.n,['Bullen! Hier unten?!','Ihr kommt hier nicht weiter!','Das ist unser Revier!','Keinen Schritt weiter!'][t.id.length%4],()=>{P.lock=false;coBattle('trainer',{s:newMon(t.sp,l).s,l,nm:t.n,tid:t.id})})}
// police tape = shortcut. One of the party takes the exam: pass → open for everybody; fail → closed for good, take the detour
function coGateTalk(f){const C=coEnsure();if(!C||B)return;const g=f.gate,dg=CODG[C.dg]||coDgAt(P.x,P.y);const law=(dg||{}).law||C.plan.law;const sd=dg&&dg.side.find(s=>'cg'+dg.i+'_'+s.k===g);
  if(C.gates.has(g)){coApplyGates();return}
  if(C.fail.has(g)){talk('Absperrung',`Hier kommt eure Streife nicht mehr durch – die Prüfung ist durchgefallen. Nehmt den Umweg über die Nebenhöhle ${sd?(sd.left?'links':'rechts'):''}.`);return}
  for(const id of C.mem){if(id===coMe())continue;const p=findPeer(id),c=p&&p.presence.co;if(c&&c.r===C.id&&c.ex===g){toast(`📝 ${coName(id)} legt hier gerade die Prüfung ab …`);return}}
  P.lock=true;openModal(`<h3>🚧 ABKÜRZUNG · POLIZEIABSPERRUNG</h3><p>Durch diese Absperrung kommt nur, wer sich im <b>${esc(COOP_LAWN[law]||law)}</b> auskennt.</p><p class="small">3 Fragen – du prüfst für die ganze Streife. Mindestens 2 richtig: die Abkürzung ist für alle offen. Sonst bleibt sie <b>für immer zu</b>, und ihr müsst den langen Umweg über die Nebenhöhle ${sd?(sd.left?'links':'rechts'):''} nehmen – mit wilden Monstern und Bandenwachen.</p>
    <div class="acts"><button class="btn ghost" id="mno">LIEBER UMWEG</button><button class="btn" id="myes">📝 PRÜFUNG ABLEGEN</button></div>`);
  $('#mno').onclick=()=>{closeModal();P.lock=false};
  $('#myes').onclick=()=>{const qs=coQs(law);C.ex=g;coPubParty();if(!qs.length){C.ex=null;closeModal();P.lock=false;coOpenGate(g);return}
    quickQuiz(`📝 ABKÜRZUNG · ${law}`,`Du prüfst für die ganze Streife – mindestens 2 von 3 richtig`,qs,ok=>{C.ex=null;try{closeModal()}catch(e){}P.lock=false;
      if(ok>=2){coOpenGate(g);toast(`📝 Bestanden (${ok}/3) – die Abkürzung ist offen!`)}
      else{C.fail.add(g);coPubParty();toast(`📝 Durchgefallen (${ok}/3) – die Abkürzung bleibt zu. Ab durch den Umweg!`);sysChat('🚧 Prüfung nicht bestanden – die Abkürzung bleibt für eure Streife geschlossen.')}})}}
function coOpenGate(g){const C=coEnsure();if(!C)return;C.gates.add(g);coApplyGates();coPubParty();sysChat('🚧 Absperrung geöffnet.')}
function coQs(law){const av=new Set(),qs=[];const pool=lawQuestions(law).map(x=>x.q);
  for(let k=0;k<20&&qs.length<3;k++){const q=(k%2===0&&typeof caseFor==='function')?caseFor(law,av):pool.length?qFreshPick(pool,av):null;if(!q||av.has(q[0]))continue;av.add(q[0]);qs.push(qReal(q))}return qs}

// ---- einem laufenden Kampf beitreten ----
function coJoin(p){const c=p.presence.cb,fo=c&&c.fo;if(!fo||!SPECIES[fo.s]||B||teamDown())return;
  const b=battler(newMon(fo.s,clamp(fo.l|0,1,100)));if(fo.st)for(const k in fo.st)if(typeof fo.st[k]==='number'&&Number.isFinite(fo.st[k]))b[k]=fo.st[k];
  if(Array.isArray(fo.m)){const mv=fo.m.filter(x=>MOVES[x]).slice(0,4);if(mv.length)b.m=mv}b.hp=clamp(Math.floor(+(c.b&&c.b.hp)||b.mhp),0,b.mhp);
  const n=clamp((c.n|0)+1,1,COOP_MAX);coArena(n,fo.k);
  const me=mkFighter('L',RUN.team.map(battler),ACX,'local');me.x=coSlotX();me.y=YB;const foe=mkFighter('R',[b],ACX,'remote');foe.y=YT;if(c.b){foe.x=+c.b.x||ACX;foe.y=+c.b.y||YT}
  newBattle({mode:'coop',id:c.id,zone:'coopcave',oppName:fo.nm||'',me,foe,allies:[],
    co:{host:false,hp:p.peer,k:fo.k,spec:{s:fo.s,l:fo.l,nm:fo.nm||'',tid:fo.tid||null,gate:fo.gate||null,run:fo.run||null},n,last:null,F:{},seen:new Set(),seenT:{[p.peer]:performance.now()},fq:[],q:0,pubT:0,fin:false,t0:performance.now()}});
  {const bb=act(B.foe);if(bb.gw)bb._gwB=B}G.dex[fo.s]=G.dex[fo.s]||0;say(`⚔ Du kommst ${coName(p.peer)} zu Hilfe!`);coPub(true)}
function coLeaveBattle(){if(!B||B.mode!=='coop')return;const C=B.co;syncBack();
  if(C.host){C.fin=true;C.res={w:0,ab:1};coPub(true);B.state='over'}
  if(!C.host)pres({cb:null});closeBattle();toast('Du hast dich aus dem Kampf zurückgezogen.');if(!RUN.team.some(m=>m.hp>0))teamDown()}

// ---- Netz: eigener Zustand + Schüsse (Host zusätzlich der Gegner) ----
function coShotRow(s){const F=s.side==='L'?B.me:B.foe;return[s.id,s.side==='L'?0:1,F.a,s.mid,Math.round(s.x),Math.round(s.y),Math.round(s.vx),Math.round(s.vy)]}
function coPeers(){return Object.keys(B.co.F).concat(B.co.host?[]:[B.co.hp]).filter((v,i,a)=>a.indexOf(v)===i&&v!==coMe())}
function coPub(force){if(!B||B.mode!=='coop'||!B.co)return;const now=performance.now(),C=B.co;
  const nw=[];for(const s of B.shots){if(s.rm||s.pb||s.cap)continue;if(s.side==='L'||(C.host&&s.side==='R')){s.pb=1;nw.push(coShotRow(s))}}
  if(nw.length){(C.out=C.out||[]).push(...nw);C.out=C.out.slice(-12);if(ROOM&&ROOM.fast)for(const id of coPeers())try{ROOM.fast({cs:{id:B.id,sh:nw}},id)}catch(e){}force=true}
  if(!force&&now-C.pubT<60)return;C.pubT=now;const F=B.me;C.q++;
  const o={id:B.id,q:C.q,t:Math.round(now),tm:coRaw(),a:F.a,x:Math.round(F.x),y:Math.round(F.y),f:F.face>0?1:-1,hp:F.team.map(m=>m.hp),out:F.out?1:0,fx:Object.keys(F.st).filter(k=>F.st[k]>0),sh:C.out||[]};
  if(C.capd)o.cap=B.id;
  if(C.host){const T=B.foe,m=act(T);o.n=C.n;o.open=!C.fin&&C.n<COOP_MAX&&(B.state==='fight'||B.state==='count'||B.state==='intro')?1:0;
    o.fo={s:m.s,l:m.l,k:C.k,nm:C.spec.nm,tid:C.spec.tid,gate:C.spec.gate,run:C.spec.run,m:m.m,st:coNum(m)};
    o.b={x:Math.round(T.x),y:Math.round(T.y),f:T.face>0?1:-1,hp:m.hp,mh:m.mhp,fx:Object.keys(T.st).filter(k=>T.st[k]>0)};if(C.res)o.res=C.res}
  pres({cb:o})}
function coOnFast(d,peer){if(!B||B.mode!=='coop'||!d||!d.cs||d.cs.id!==B.id||!Array.isArray(d.cs.sh))return;B.co.fq.push([peer,d.cs.sh.slice(0,12)]);if(B.co.fq.length>40)B.co.fq.shift()}
function coSpawn(peer,F,e){if(!Array.isArray(e))return;const id=String(e[0]).slice(0,40)+'@'+peer;const C=B.co;if(C.seen.has(id))return;C.seen.add(id);if(B.state!=='fight')return;
  const side=e[1]?'R':'L';if(side==='R'&&peer!==C.hp)return;const own=side==='R'?B.foe:F;if(!own)return;
  const ai=clamp(Math.floor(+e[2]),0,own.team.length-1),mid=MOVES[e[3]]?e[3]:'bump';const sp=shotParams(mid);let vx=+e[6]||0,vy=+e[7]||0;const L=Math.hypot(vx,vy)||1;if(L>sp.sp*1.05&&sp.sp){vx=vx/L*sp.sp;vy=vy/L*sp.sp}
  const s={id,side,att:own.team[ai],mid,x:+e[4]||ACX,y:+e[5]||ACY,vx,vy,age:0,life:sp.life,r:sp.r,p:sp.p,mel:sp.mel,wave:sp.wave,k:sp.k,h:sp.h,nm:sp.nm,am:1,rm:1,own:peer};
  if(s.k==='lob'){s.x0=s.x;s.y0=s.y}B.shots.push(s);if(own!==B.foe){own.atkT=performance.now();own.face=vx<0?-1:1}else if(B.foe.ctrl==='remote'){B.foe.atkT=performance.now()}}
function coSync(dt){const C=B.co,now=performance.now(),k=Math.min(1,dt*14);if(ROOM&&ROOM.onFast&&!ROOM._cofh){ROOM._cofh=1;ROOM.onFast(coOnFast)}
  const ids=new Set(Object.keys(C.F));if(!C.host)ids.add(C.hp);for(const p of others()){const c=p.presence.cb;if(c&&c.id===B.id)ids.add(p.peer)}ids.delete(coMe());
  for(const id of ids){const p=findPeer(id),c=p&&p.presence.cb;let F=C.F[id];
    if(!c||c.id!==B.id){if(F&&!F.out&&now-(C.seenT[id]||now)>3000){F.out=true;F.gone=1;say(`${coName(id)} hat den Kampf verlassen.`)}continue}
    C.seenT[id]=now;
    if(!F){if(C.host&&Object.keys(C.F).length>=COOP_MAX-1)continue;const tm=coTeam(c.tm);if(!tm)continue;F=C.F[id]=mkFighter('L',tm,ACX,'remote');F.spawnT=now;F.inv=0;F.peer=id;F.x=+c.x||ACX;F.y=+c.y||YB;
      if(B.state==='fight'||B.state==='count')say(`⚔ ${coName(id)} kommt dazu!`);
      if(C.host){C.n=1+Object.keys(C.F).length;coRescale();coArena(C.n,C.k);coPub(true)}}
    F.tx=+c.x||F.x;F.ty=+c.y||F.y;F.x+=(F.tx-F.x)*k;F.y+=(F.ty-F.y)*k;F.face=c.f<0?-1:1;F.flash=Math.max(0,(F.flash||0)-dt);
    const a=Math.floor(+c.a);if(a>=0&&a<F.team.length&&a!==F.a){F.a=a;F.spawnT=now}
    if(Array.isArray(c.hp))F.team.forEach((m,i)=>{const v=clamp(Math.floor(+c.hp[i]),0,m.mhp);if(Number.isFinite(v)){if(v<m.hp&&i===F.a){F.hurtT=now;F.flash=0.25}m.hp=v}});
    F.out=!!c.out||F.team.every(m=>m.hp<=0);F.faint=act(F).hp<=0?1:0;F.stShow=Array.isArray(c.fx)?c.fx.filter(q=>typeof q==='string'&&q in F.st):[];
    if(Array.isArray(c.sh))for(const e of c.sh)coSpawn(id,F,e);
    if(C.host&&c.cap===B.id&&!C.fin&&C.k==='wild')coFinish(true,C.last||id,id);
    // the host also carries the opponent
    if(id===C.hp&&c.b&&B.foe.ctrl==='remote'){const T=B.foe,b=c.b;T.x+=((+b.x||T.x)-T.x)*k;T.y+=((+b.y||T.y)-T.y)*k;T.face=b.f<0?-1:1;const m=act(T);
      const fo=c.fo;if(fo&&(fo.l|0)!==m.l&&fo.st){for(const q in fo.st)if(typeof fo.st[q]==='number'&&Number.isFinite(fo.st[q])&&q!=='hp')m[q]=fo.st[q];m.l=clamp(fo.l|0,1,100);C.spec.l=m.l;say(`${SPECIES[m.s].n} passt sich an: Lv ${m.l}`)}
      const mh=Math.floor(+b.mh);if(mh>0&&mh!==m.mhp)m.mhp=mh;const v=clamp(Math.floor(+b.hp),0,m.mhp);
      if(Number.isFinite(v)&&v<m.hp){T.hurtT=now;T.flash=0.25;B.nums.push({x:T.x+(Math.random()*8-4),y:T.y-34,t:'-'+(m.hp-v),c:'#ffffff',at:now});if(typeof effConfirm==='function')try{effConfirm(T)}catch(e){}}
      if(Number.isFinite(v))m.hp=v;T.stShow=Array.isArray(b.fx)?b.fx.filter(q=>typeof q==='string'&&q in T.st):[];if(m.hp<=0&&!T.koShown){T.koShown=1;T.faint=0.9;say(`${SPECIES[m.s].n} ist besiegt!`)}
      const n=clamp(c.n|0,1,COOP_MAX);if(n!==C.n){C.n=n;coArena(n,C.k)}
      if(c.res&&!C.fin){if(c.res.ab){C.fin=true;B.state='over';say(`${coName(C.hp)} hat sich zurückgezogen – der Kampf ist vorbei.`);syncBack();setTimeout(()=>{if(B&&B.co===C)closeBattle()},2200)}else coFinish(!!c.res.w,c.res.last,c.res.cap)}}}
  for(const[peer,list]of C.fq.splice(0))list.forEach(e=>coSpawn(peer,C.F[peer],e));
  B.allies=Object.values(C.F).filter(F=>!F.out&&act(F).hp>0)}

// ---- Host: Gegner wechselt zwischen den Spielern als Ziel ----
function coTarget(){const C=B.co,now=performance.now();const alive=[B.me,...Object.values(C.F)].filter(F=>F&&!F.out&&F.faint<=0&&act(F).hp>0);if(!alive.length)return B.me;
  if(!C.tgt||!alive.includes(C.tgt)||now>C.tgtT){const F=B.foe;alive.sort((a,b)=>Math.hypot(a.x-F.x,a.y-F.y)-Math.hypot(b.x-F.x,b.y-F.y));C.tgt=Math.random()<0.55?alive[0]:alive[Math.floor(Math.random()*alive.length)];C.tgtT=now+2500+Math.random()*2500}return C.tgt}
function coSwap(fn){return function(F){if(!B||B.mode!=='coop'||!B.co||!B.co.host||B.state!=='fight')return fn.apply(this,arguments);const T=coTarget();if(T===B.me)return fn.apply(this,arguments);const keep=B.me;B.me=T;try{return fn.apply(this,arguments)}finally{B.me=keep}}}
aiUpdate=coSwap(aiUpdate);aiAimTick=coSwap(aiAimTick);

// ---- Engine-Anpassungen für den Koop-Modus ----
{const _h=hitLocal;hitLocal=function(T,s){if(B&&B.mode==='coop'){if(T&&T.ctrl==='remote')return 0;if(T===B.foe&&B.co&&B.co.host)B.co.last=(s&&s.own)||coMe()}return _h.apply(this,arguments)}}
{const _d=dealDamage;dealDamage=function(T){if(B&&B.mode==='coop'&&T&&T.ctrl==='remote')return;return _d.apply(this,arguments)}}
{const _dh=drainHeal;drainHeal=function(s){if(B&&B.mode==='coop'&&s&&s.rm)return;return _dh.apply(this,arguments)}}
{const _sb=startBreak;startBreak=function(F){if(B&&B.mode==='coop'){if(F===B.me){const n=nextAlive(F);if(n>=0){doSwitch(F,n);F.faint=0;F.inv=1.2;say(`Los, ${SPECIES[act(F).s].n}!`)}}return}return _sb.apply(this,arguments)}}
{const _ce=checkEnd;checkEnd=function(){if(B&&B.mode==='coop'){coCheck();return}return _ce.apply(this,arguments)}}
{const _bu=bUpdate;bUpdate=function(dt){_bu.apply(this,arguments);if(B&&B.mode==='coop'&&B.co&&!B.closing){coSync(dt);coPub(false)}}}
// big arena, normal pixel scale: the camera follows the fight (you + the foe, allies when they fit) instead of zooming out
{const _uc=updateCam;updateCam=function(now){if(!(B&&B.mode==='coop'))return _uc.apply(this,arguments);
  const C=B.cam||(B.cam={x:ACX,y:ACY-20,z:1,t:now});const dt=Math.min(0.1,(now-C.t)/1000);C.t=now;const ZMIN=0.86,ZMAX=camZMax();
  const box=L=>{L=L.filter(F=>F&&!(F.out&&act(F)&&act(F).hp<=0));if(!L.length)return null;const x0=Math.min(...L.map(F=>F.x))-64,x1=Math.max(...L.map(F=>F.x))+64,y0=Math.min(...L.map(F=>F.y))-58,y1=Math.max(...L.map(F=>F.y))+16;
    return{x:(x0+x1)/2,y:(y0+y1)/2,z:Math.min(AW/(x1-x0),(AH-58)/(y1-y0))}};
  let b=box([B.me,B.foe,...(B.allies||[])]);if(!b||b.z<ZMIN)b=box([B.me,B.foe]);if(!b||b.z<ZMIN){const m=B.me;b={x:m.x*0.7+B.foe.x*0.3,y:m.y*0.7+B.foe.y*0.3,z:ZMIN}}
  const tz=clamp(b.z,ZMIN,ZMAX);const k=C.init?Math.min(1,dt*3.2):1;C.init=1;C.z+=(tz-C.z)*k;C.x+=(b.x-C.x)*k;C.y+=(b.y-C.y)*k;
  const hw=AW/2/C.z,ht=CAMY/C.z,hb=(AH-CAMY)/C.z,X0=ACX-ARX-70,X1=ACX+ARX+70,Y0=ACY-ARY-110,Y1=ACY+ARY+60;
  C.x=X1-X0<2*hw?ACX:clamp(C.x,X0+hw,X1-hw);C.y=Y1-Y0<ht+hb?ACY-20:clamp(C.y,Y0+ht,Y1-hb);return C}}
{const _dz=drawHazards;drawHazards=function(c,now){if(B&&B.mode==='coop'){const bg=coCaveBG();c.drawImage(bg.cv,bg.x,bg.y,bg.w,bg.h)}return _dz.apply(this,arguments)}}
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){const r=_de.apply(this,arguments);if(top&&B&&B.mode==='coop')coDrawTags(c,now);return r}}
{const _ff=forfeit;forfeit=function(){if(B&&B.mode==='coop'){const host=B.co.host;openModal(`<h3>KAMPF VERLASSEN?</h3><p>${host&&B.allies.length?'Du ziehst dich zurück – der Kampf ist damit für alle vorbei.':'Du ziehst dich aus dem Kampf zurück.'}</p><div class="acts"><button class="btn ghost" id="mno">BLEIBEN</button><button class="btn red" id="myes">ZURÜCKZIEHEN</button></div>`);$('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();coLeaveBattle()};return}return _ff.apply(this,arguments)}}
{const _vs=vsStart;vsStart=function(now){if(B&&B.mode==='coop')return 0;return _vs.apply(this,arguments)}}
function coCheck(){if(B.state!=='fight'||B.co.fin)return;const C=B.co;
  if(C.host){const T=B.foe;if(T.out||act(T).hp<=0){if(!C.koT)C.koT=performance.now()+700;if(performance.now()>C.koT)coFinish(true,C.last||coMe());return}
    if([B.me,...Object.values(C.F)].every(F=>F.out))coFinish(false,null);return}
  const h=C.seenT[C.hp];if(h&&performance.now()-h>COOP_TIMEOUT){C.fin=true;B.state='over';finale(false);say('Verbindung zum Kampf verloren.');syncBack();setTimeout(()=>{if(B&&B.co===C)closeBattle()},2200)}}

// ---- Kampfende: Belohnung, Fangen (nur letzter Treffer), Absperrung, Bandenstatus ----
async function coFinish(win,last,cap){const C=B.co;if(C.fin)return;C.fin=true;B.state='over';if(C.host){C.res={w:win?1:0,last:last||null,cap:cap||null};coPub(true)}
  finale(win);const k=C.k,sp=C.spec,myB=B;say(win?(k==='boss'?'BANDE ZERSCHLAGEN!':k==='wild'?(cap?'Festnahme!':'Gegner besiegt!'):'Festgenommen!'):'Ihr wurdet überwältigt…');syncBack();
  if(win){const idx=B.me.a,m=RUN.team[idx];if(m&&m.hp>0&&!B.me.out){const msgs=gainXp(m,Math.round(xpGain(sp.s,sp.l)*(k==='boss'?2.5:1.3)));Object.assign(B.me.team[idx],battler(m));for(const t of msgs){say(t);await finSleep(900);if(B!==myB)return}}
    const same=COOP&&sp.run&&COOP.id===sp.run;
    if(k==='trainer'){earn(Math.round(sp.l*14),'Bandenprämie');if(same&&sp.tid){COOP.beat.add(sp.tid);coPubParty()}}
    if(k==='boss'){earn(Math.round(sp.l*40),'Einsatzprämie');RUN.items=RUN.items||{};RUN.items.candy=(RUN.items.candy||0)+1;RUN.items.great=(RUN.items.great||0)+2;RUN.coopWins=(RUN.coopWins||0)+1;say('Belohnung: 1× Sonderbonbon und 2× '+ITEMS.great.n);if(same&&sp.tid){COOP.beat.add(sp.tid);coPubParty()}}
    if(k==='extra'&&sp.gate){if(same||C.host)coOpenGate(sp.gate);say('🚧 Die Absperrung ist frei.')}
    if(k==='wild'){if(cap===coMe())say(`${SPECIES[sp.s].n} ist festgenommen!`);else if(cap)say(`${coName(cap)} hat ${SPECIES[sp.s].n} festgenommen.`);else say(`${SPECIES[sp.s].n} flieht geschlagen in die Höhle.`)}}
  save();await finSleep(2200);if(B!==myB)return;closeBattle();
  if(!RUN.team.some(m=>m.hp>0)){setTimeout(()=>teamDown(),600);return}
  if(win&&k==='boss')setTimeout(()=>{if(B)return;P.lock=true;const dg=coDgAt(P.x,P.y);
    openModal(`<h3>🏅 EINSATZ ERFOLGREICH</h3><p>Die Bande ist zerschlagen! Der Polizeiführer holt euch aus der Höhle.</p><div class="acts"><button class="btn" id="myes">ZURÜCK IN DIE STADT</button></div>`);
    $('#myes').onclick=()=>{closeModal();P.lock=false;if(dg)coExit(dg)}},700)}

// ---- Darstellung: Höhlenboden + Namensschilder der Mitspieler ----
let CO_BG=null;
function coCaveBG(){const boss=!!(B&&B.co&&B.co.k==='boss');if(CO_BG&&CO_BG.k===ARENA_K&&CO_BG.boss===boss)return CO_BG;const pad=90,x0=ACX-ARX-pad,y0=ACY-ARY-pad-40,w=2*ARX+2*pad,h=2*ARY+2*pad+60,W=Math.ceil(w/2),H=Math.ceil(h/2);
  const cv=mk(W,H),c=cv.getContext('2d'),id=c.createImageData(W,H),d=id.data,nL=noise2(9127,18,W,H),nS=noise2(9128,5,W,H),rr=mulberry32(77);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const wx=x0+x*2,wy=y0+y*2,ex=(wx-ACX)/(ARX+6),ey=(wy-ACY)/(ARY+8),e=Math.hypot(ex,ey),i=(y*W+x)*4,n=nL(x,y),s=nS(x,y)*0.6+rr()*0.4;
    let r,g,b;if(e<1){const v=0.78+n*0.18+(s>0.82?0.08:0)-(e>0.9?0.12:0);r=92*v;g=82*v;b=74*v;if(s<0.07){r*=0.75;g*=0.75;b*=0.75}}
    else{const v=0.5+n*0.3+(s>0.8?0.12:0)-Math.min(0.22,(e-1)*0.35);r=62*v;g=57*v;b=70*v;if(s>0.965&&e<1.4){r=90;g=150;b=200}}
    d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255}
  c.putImageData(id,0,0);
  const P2=(wx,wy)=>[Math.round((wx-x0)/2),Math.round((wy-y0)/2)];
  // boss hall: glowing cracks in the floor
  if(boss){const rc=mulberry32(4411);for(let n=0;n<9;n++){let a=rc()*7,px=ACX+Math.cos(a)*ARX*0.25,py=ACY+Math.sin(a)*ARY*0.25;for(let k=0;k<26;k++){a+=(rc()-0.5)*0.9;px+=Math.cos(a)*5;py+=Math.sin(a)*3.4;
      const e=Math.hypot((px-ACX)/ARX,(py-ACY)/ARY);if(e>0.93)break;const[qx,qy]=P2(px,py);c.fillStyle='#ff6a1a';c.fillRect(qx,qy,1,1);c.fillStyle='#ff6a1a33';c.fillRect(qx-1,qy-1,3,3)}}}
  // stalagmites and crystal clusters around the rim
  {const rs=mulberry32(5150),N=Math.round(14*ARENA_K);for(let n=0;n<N;n++){const a=n/N*Math.PI*2+rs()*0.25,e=1.12+rs()*0.22,wx=ACX+Math.cos(a)*(ARX+6)*e,wy=ACY+Math.sin(a)*(ARY+8)*e;if(wy<ACY-ARY-30)continue;
    const[qx,qy]=P2(wx,wy),hh=5+Math.floor(rs()*7),cr=rs()<0.3;
    for(let y=0;y<hh;y++){const hw=Math.max(0,Math.round((hh-y)/hh*3));c.fillStyle=cr?(y<2?'#cfe9ff':'#6fb6e8'):(y%3===0?'#4a4352':'#5c5466');c.fillRect(qx-hw,qy-y,hw*2+1,1)}
    c.fillStyle='#00000033';c.fillRect(qx-3,qy+1,7,1);if(cr){c.fillStyle='#6fb6e822';c.beginPath();c.arc(qx,qy-3,7,0,7);c.fill()}}}
  // torches along the cave wall (more in a bigger hall)
  {const N=Math.max(2,Math.round(2*ARENA_K+(boss?2:0)));for(let n=0;n<N;n++){const fx=-0.75+1.5*(N===1?0.5:n/(N-1)),wx=ACX+fx*ARX,wy=ACY-ARY*Math.sqrt(Math.max(0,1-fx*fx))-16;const[tx,ty]=P2(wx,wy);
    c.fillStyle='#ffcb3d22';c.beginPath();c.arc(tx,ty,14,0,7);c.fill();c.fillStyle='#5a3a1a';c.fillRect(tx-1,ty,2,6);c.fillStyle=boss?'#ff5a2a':'#ff8a3d';c.fillRect(tx-2,ty-3,4,3);c.fillStyle='#ffe14d';c.fillRect(tx-1,ty-4,2,2)}}
  return CO_BG={k:ARENA_K,boss,cv,x:x0,y:y0,w:W*2,h:H*2}}
function coDrawTags(c,now){for(const F of B.allies||[]){const m=act(F);if(!m)continue;const X=Math.round(F.x),Y=Math.round(F.y);
  const k=m.hp/Math.max(1,m.mhp);c.fillStyle='#14141f';c.fillRect(X-13,Y-46,26,4);c.fillStyle=k<0.25?'#ef4444':k<0.5?'#ffcb3d':'#3ddc6b';c.fillRect(X-12,Y-45,Math.round(24*k),2);
  vtText(c,coName(F.peer),X,Y-49,'#bfe2ff',10,'center')}
  if(B.co&&B.co.host&&B.co.tgt&&B.co.tgt!==B.me&&B.state==='fight'){const T=B.co.tgt;c.fillStyle='#ef444490';c.fillRect(Math.round(T.x)-2,Math.round(T.y)+4,4,2)}}

// ---- Festnahme in der Koop-Höhle: nur per Handschellen-Wurf, nicht automatisch nach dem Sieg ----
async function coCatch(bonus){if(!B||B.mode!=='coop'||!B.co||B.co.k!=='wild'||B.co.fin||B.co.catching)return;const C=B.co,myB=B,w=act(B.foe),sp=C.spec;
  const chance=catchChance(w,(bonus||1)*(B.greatThrown?1.7:1));const q=Math.pow(chance,1/3);let sh=0;while(sh<3&&Math.random()<q)sh++;
  burst(B.foe.x,B.foe.y-14,'#c8ccd8',10);if(sh<3){say(sh?`Die Handschellen klicken ${sh}× – ${SPECIES[w.s].n} reißt sich los!`:`${SPECIES[w.s].n} weicht den Handschellen aus!`);return}
  C.catching=true;const inv0=B.me.inv;B.me.inv=999;say(`Die Handschellen halten! Jetzt die Frage …`);
  const ok=await new Promise(r=>catchQuiz(sp.s,r));if(B!==myB){return}B.me.inv=inv0||0;C.catching=false;
  if(!ok){say(`${SPECIES[w.s].n} reißt sich los!`);return}if(C.fin){say('Zu spät – der Kampf ist schon vorbei.');return}
  const m=newMon(sp.s,sp.l);m.hp=Math.max(1,Math.round(stats(m).mhp*Math.max(0.1,w.hp/Math.max(1,w.mhp))));const newDex=!G.dex[m.s];G.dex[m.s]=1;if(typeof onCatch==='function')try{onCatch(m)}catch(e){}
  const toTeam=RUN.team.length<teamMax();(toTeam?RUN.team:RUN.box).push(m);save();
  sysChat(`Du hast ${SPECIES[m.s].n} (Lv ${m.l}) im Koop-Kampf festgenommen!${toTeam?'':' (Box)'}`);if(newDex)setTimeout(()=>{if(!B&&!$('#modal').classList.contains('on'))dexReveal(m.s,m,'★ NEUER DEX-EINTRAG ★')},4200);
  if(C.host)coFinish(true,C.last||coMe(),coMe());else{C.capd=1;coPub(true);say(`${SPECIES[m.s].n} ist festgenommen!`)}}

// ---- kompakte Anzeige der Mitspieler unter der eigenen KP-Box ----
function coAllyHud(c){const L=Object.values(B.co.F||{});if(!L.length)return;const x=4,w=112,h=14;let y=51;
  for(const F of L){const m=act(F);if(!m)continue;const out=F.out||F.gone,r=out?0:clamp(m.hp/Math.max(1,m.mhp),0,1);
    c.fillStyle='#14141f';c.fillRect(x-1,y-1,w+2,h+2);c.fillStyle=out?'#2a2d3a':'#f6f1e1';c.fillRect(x,y,w,h);
    let t=`${coName(F.peer)} · ${SPECIES[m.s].n}`;c.font='8px VT323,monospace';const lv=out?'K.O.':'Lv'+m.l,max=w-8-c.measureText(lv).width;if(c.measureText(t).width>max){while(t.length>3&&c.measureText(t+'…').width>max)t=t.slice(0,-1);t+='…'}
    vtText(c,t,x+3,y+7,out?'#8a8ea6':'#14141f',8);vtText(c,lv,x+w-3,y+7,out?'#8a8ea6':'#14141f',8,'right');
    c.fillStyle='#14141f';c.fillRect(x+3,y+9,w-6,4);c.fillStyle='#4b4f63';c.fillRect(x+4,y+10,w-8,2);if(r>0){c.fillStyle=hpColor(r);c.fillRect(x+4,y+10,Math.round((w-8)*r),2)}
    // Kader-Punkte: wie viele Monster des Mitspielers noch stehen
    F.team.forEach((q,i)=>{c.fillStyle=q.hp>0?'#3ddc6b':'#4b4f63';c.fillRect(x+w+3,y+1+i*2,2,1)});
    y+=h+3}}

// Host: Gegner an die Stufe aller Beteiligten anpassen (beim Beitritt): Stufe = Schnitt der Kader + Raum-Aufschlag,
// Werte neu aus der Stufe, KP mit dem Mitspieler-Faktor; der KP-Anteil bleibt erhalten
function coRescale(){const C=B.co,T=act(B.foe);if(!T)return;const teams=[B.me.team.map(m=>m.l),...Object.values(C.F).filter(F=>!F.gone).map(F=>F.team.map(m=>m.l))];
  const L=clamp(coPartL(teams)+(C.off||0),1,100),n=clamp(C.n||1,1,4),ratio=T.hp/Math.max(1,T.mhp);
  if(L!==T.l){const nb=battler({s:T.s,l:L,hp:0,m:T.m.slice()});const k=C.k;C.base=nb.mhp;
    for(const q of['atk','def','spa','spd','sp','spe'])if(typeof nb[q]==='number'&&typeof T[q]==='number')T[q]=nb[q];
    T.atk=Math.round(T.atk*(k==='boss'?1.2:k==='wild'?1:1.08));T.def=Math.round(T.def*(k==='boss'?1.15:1));T.l=L;C.spec.l=L;say(`${SPECIES[T.s].n} passt sich an: Lv ${L}`)}
  const nm=Math.round(C.base*coHm(C.k,n));T.mhp=nm;T.hp=Math.max(1,Math.round(nm*ratio))}
// Sprungstiefel springen nicht über Polizeiabsperrungen
{const _bj=bootJump;bootJump=function(d,dx,dy,nx,ny){const f=fieldAt(nx,ny);if(f&&f.kind==='tape')return false;return _bj.apply(this,arguments)}}
// ---- LOBBY tab while in a co-op cave: party overview + give up (back to the world map) ----
{const _rl=renderLobbyPane;renderLobbyPane=function(){_rl.apply(this,arguments);const el=$('#pane-lobby');if(!el||curTab!=='lobby')return;
  const old=el.querySelector('#colob');const dg=COOP&&coDgAt(P.x,P.y);if(!dg){if(old)old.remove();return}
  const mem=COOP.mem.map(id=>{const p=id===coMe()?null:findPeer(id);const here=id===coMe()||(p&&p.presence.co&&p.presence.co.r===COOP.id);return`<div class="plr"><div class="who"><b>${esc(coName(id))}${id===coMe()?' (du)':''}</b><span class="small">${here?(p&&p.presence.cb&&!p.presence.cb.res?'⚔ im Kampf':'in der Höhle'):'nicht mehr dabei'}</span></div></div>`}).join('');
  const done=dg.gates.filter(g=>COOP.gates.has(g.id)).length,fl=dg.gates.filter(g=>COOP.fail.has(g.id)).length;
  const h=`<div class="sec">🚔 KOOP-EINSATZ: ${esc(dg.n.toUpperCase())}</div><div class="small" style="margin-bottom:6px">Schwerpunkt ${esc(dg.law)} · Gegner um Lv ${COOP.L} · Absperrungen offen ${done}/${dg.gates.length}${fl?` · ${fl} dauerhaft zu`:''}</div>${mem}
    <button class="btn red" id="cogiveup" style="width:100%;margin:6px 0 10px">🏳 EINSATZ AUFGEBEN · ZUR WELTKARTE</button>`;
  const key=h;if(old&&old.dataset.k===key)return;if(old)old.remove();const d=document.createElement('div');d.id='colob';d.dataset.k=key;d.innerHTML=h;el.prepend(d);
  d.querySelector('#cogiveup').onclick=()=>{if(B){toast('Erst den Kampf beenden.');return}P.lock=true;
    openModal(`<h3>🏳 EINSATZ AUFGEBEN?</h3><p>Du verlässt ${esc(dg.n)} und kehrst zum Polizeiführer auf der Weltkarte zurück. Dein Fortschritt in dieser Höhle geht verloren; deine Kollegen können weitermachen.</p><div class="acts"><button class="btn ghost" id="mno">WEITERMACHEN</button><button class="btn red" id="myes">AUFGEBEN</button></div>`);
    $('#mno').onclick=()=>{closeModal();P.lock=false};$('#myes').onclick=()=>{closeModal();P.lock=false;sysChat(`🏳 ${coName(coMe())} hat den Einsatz aufgegeben.`);coExit(dg)}}}}
setInterval(()=>{try{if(curTab==='lobby'&&(COOP||document.querySelector('#colob')))renderLobbyPane()}catch(e){}},1500);
