/* ===================== ROUTES =====================
   Level scaling along numbered routes: the towns are meant to be visited in a fixed order
   Villingen → Marderach → Damental → Lahribar → Felsenhöhen → Unterwertheim → Mostbach.
   Route k: wild monsters Lv lo..lo+4 with lo = 1 + ⌊(k−1)·2.5⌋ (1–5, 3–7, 6–10, 8–12, …), trainers 3 levels above.
   Every overworld tile belongs to the nearest stretch between two consecutive stops (only stretches whose
   shortest path crosses the tile's area count) and gets its route from the progress along that stretch. */
const ROUTE_CHAIN=[{id:'vil'},{id:'mar',r:3},{id:'dam',r:9},{id:'lah',r:15},{pt:[135,26],r:19},{id:'unt',r:24},{id:'mos',r:31}];
let ROUTE_N=0;const ROUTES=[null],ROUTE_NODES=[],ROUTE_EDGES=[];   // ROUTES[n] = {n,lv:[lo,hi],pix,a,b}
const PROG=new Float32Array(MW*MH);   // progress along the town chain (0 = Villingen … 31 = Mostbach)
function routeRange(k){const R=ROUTES[k];return R?R.lv:[1,5]}
const ROUTE_OF=new Uint8Array(MW*MH);   // route number of every overworld tile (nearest road), 0 = none
const ROUTE_STRETCH=[];                  // per stretch: path tiles, first/last route
(function buildRoutes(){
  const pass=i=>{const t=MAP[i];return WALK0.has(t)||t===3||t===27||(LEDGE_DIR&&LEDGE_DIR[t])};
  const bfs=(sx,sy)=>{const D=new Int32Array(MW*MH).fill(-1),q=new Int32Array(MW*MH);let h=0,n=0;const s0=sy*MW+sx;D[s0]=0;q[n++]=s0;
    while(h<n){const i=q[h++],x=i%MW,y=(i-x)/MW,d=D[i]+1;if(x>0&&D[i-1]<0&&pass(i-1)){D[i-1]=d;q[n++]=i-1}if(x<MW-1&&D[i+1]<0&&pass(i+1)){D[i+1]=d;q[n++]=i+1}
      if(y>0&&D[i-MW]<0&&pass(i-MW)){D[i-MW]=d;q[n++]=i-MW}if(y<MH-1&&D[i+MW]<0&&pass(i+MW)){D[i+MW]=d;q[n++]=i+MW}}return D};
  const spot=c=>{let x,y;if(c.id){const T=TOWNS.find(t=>t.id===c.id);x=T.x;y=T.y}else[x,y]=c.pt;
    for(let r=0;r<12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const X=x+dx,Y=y+dy;if(X<1||Y<1||X>=MW-1||Y>=MH-1)continue;const t=MAP[Y*MW+X];if(WALK0.has(t)&&t!==3)return{x:X,y:Y}}return{x,y}};
  const P=ROUTE_CHAIN.map(spot),D=P.map(p=>bfs(p.x,p.y));
  const best=new Float32Array(MW*MH).fill(1e9),prog=new Float32Array(MW*MH).fill(-1);
  // first pass: the shortest path of every stretch. Villinger Land always belongs to the first stretch,
  //   so the start area stays easy even where later paths cross it; on ties the earlier stretch wins
  const paths=[],own={};
  for(let k=0;k<P.length-1;k++){const A=D[k],Bd=D[k+1],L=A[P[k+1].y*MW+P[k+1].x];if(L<=0){paths.push(null);continue}
    // the shortest path of this stretch, and which areas it crosses
    const path=[];let i=P[k+1].y*MW+P[k+1].x;while(A[i]>0){path.push(i);const x=i%MW,y=(i-x)/MW;let nb=-1;for(const j of[i-1,i+1,i-MW,i+MW])if(j>=0&&j<MW*MH&&A[j]===A[i]-1&&Bd[j]>=0){nb=j;break}if(nb<0)break;i=nb}path.push(i);path.reverse();
    paths.push({path,L})}
  for(let k=0;k<P.length-1;k++){if(!paths[k])continue;const A=D[k],Bd=D[k+1],{path,L}=paths[k],r0=ROUTE_CHAIN[k].r||0,r1=ROUTE_CHAIN[k+1].r;
    const bio=new Set([0,2,3,4,6,7,8]);if(k===0)bio.add(1);ROUTE_STRETCH.push({k,r0,r1,path,L,bio,from:ROUTE_CHAIN[k],to:ROUTE_CHAIN[k+1]});
    for(let j=0;j<MW*MH;j++){const a=A[j],b=Bd[j];if(a<0||b<0||!bio.has(BIOME[j]))continue;const e=a+b-L;if(e<best[j]-0.5){best[j]=e;prog[j]=r0+(r1-r0)*a/(a+b)}}}
  for(let j=0;j<MW*MH;j++)PROG[j]=prog[j];
  buildRouteNet();
  // show the new ranges per area (world map labels, pass signs)
  for(const z in ZLV){ZLV[z].lo=999;ZLV[z].hi=0}
  for(let j=0;j<MW*MH;j++){if(!ENC.has(MAP[j]))continue;const z=BKEYS[BIOME[j]];if(!z||!ZLV[z])continue;const x=j%MW,y=(j-x)/MW,lo=storyLv(x,y)||routeRange(ROUTE_OF[j])[0];ZLV[z].lo=Math.min(ZLV[z].lo,lo);ZLV[z].hi=Math.max(ZLV[z].hi,lo+4)}
  ZLV.knast.lo=KNAST_LV[0];ZLV.knast.hi=KNAST_LV[1];
  for(const z in ZLV){if(ZLV[z].lo===999){ZLV[z].lo=1;ZLV[z].hi=5}BIO_MIN[z]=ZLV[z].lo}
})();
function routeAt(x,y){if(x<0||y<0||x>=MW||y>=MH)return 0;return ROUTE_OF[y*MW+x]}
function routeLo(x,y){return routeRange(routeAt(x,y))[0]}
/* The routes are the ways between the towns: the walking paths between neighbouring towns are traced (later paths
   prefer to follow earlier ones, so they merge) and split at towns and crossings. Long pieces are cut into several
   routes (≈ every 26 tiles or when the difficulty rises by a level band). Routes are numbered by difficulty;
   the level range follows the progress along the town chain (route 1: Lv 1–5, …). Every tile belongs to its nearest route. */
function buildRouteNet(){
  const NN=MW*MH,pass=i=>{const t=MAP[i];return WALK0.has(t)||t===3||t===27||!!LEDGE_DIR[t]};
  const P=new Uint8Array(NN);
  // the Felsenhöhen pass counts like a town here, so the northern way Lahribar ↔ Unterwertheim becomes routes too
  const STOPS=[...TOWNS,{id:'fel',n:'Felsenhöhen',x:135,y:26,pseudo:1}],SR={vil:0,mar:3,dam:9,lah:15,fel:19,unt:24,mos:31};const PP=new Float32Array(NN).fill(99);
  const townAt=i=>{if(BIOME[i]!==0)return null;const x=i%MW,y=(i-x)/MW;let b=null,bd=1e9;for(const T of TOWNS){const d=Math.abs(T.x-x)+Math.abs(T.y-y);if(d<bd){bd=d;b=T}}return bd<30?b:null};
  const TOWN_OF=new Int8Array(NN).fill(-1);for(let i=0;i<NN;i++){const T=townAt(i);if(T)TOWN_OF[i]=TOWNS.indexOf(T)}
  {const F=STOPS[STOPS.length-1];let bx=F.x,by=F.y,bd=1e9;for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){const i=(F.y+dy)*MW+F.x+dx;if(MAP[i]===4&&Math.abs(dx)+Math.abs(dy)<bd){bd=Math.abs(dx)+Math.abs(dy);bx=F.x+dx;by=F.y+dy}}F.x=bx;F.y=by;TOWN_OF[by*MW+bx]=STOPS.length-1}
  const cost=i=>P[i]?1:(MAP[i]===4||MAP[i]===27)?2:MAP[i]===3?7:3;
  const path=(A,Bt)=>{const D=new Int32Array(NN).fill(1e9),from=new Int32Array(NN).fill(-1),Q=[];const s0=A.y*MW+A.x;D[s0]=0;Q[0]=[s0];let goal=-1;
    for(let d=0;d<Q.length&&goal<0;d++){const L=Q[d];if(!L)continue;for(const i of L){if(D[i]!==d)continue;if(TOWN_OF[i]===Bt){goal=i;break}const x=i%MW;
      for(const j of[x>0?i-1:-1,x<MW-1?i+1:-1,i-MW,i+MW]){if(j<0||j>=NN||!pass(j))continue;const nd=d+cost(j);if(nd<D[j]){D[j]=nd;from[j]=i;(Q[nd]||(Q[nd]=[])).push(j)}}}}
    if(goal<0)return null;const out=[];for(let i=goal;i>=0;i=from[i])out.push(i);return out.reverse()};
  // town pairs, nearest first; a pair is skipped when its way leads through a third town
  const pairs=[];for(let a=0;a<STOPS.length;a++)for(let b=a+1;b<STOPS.length;b++)pairs.push([a,b,Math.hypot(STOPS[a].x-STOPS[b].x,STOPS[a].y-STOPS[b].y)]);pairs.sort((u,v)=>u[2]-v[2]);
  for(const[a,b]of pairs){const pa=path(STOPS[a],b);if(!pa)continue;if(pa.some(i=>TOWN_OF[i]>=0&&TOWN_OF[i]!==a&&TOWN_OF[i]!==b))continue;const ra=SR[STOPS[a].id]??0,rb=SR[STOPS[b].id]??0;pa.forEach((i,k)=>{if(TOWN_OF[i]>=0)return;P[i]=1;PP[i]=Math.min(PP[i],ra+(rb-ra)*k/Math.max(1,pa.length-1),BIOME[i]===1?2.5:99)})}  // Villinger Land stays the beginner area
  // side roads: every road that is not part of a town-to-town way becomes its own branch route
  //   (traced from its far end back to the network; difficulty grows slowly with the distance from the junction)
  for(let it=0;it<250;it++){const D=new Int32Array(NN).fill(-1),from=new Int32Array(NN).fill(-1),q=new Int32Array(NN);let h=0,n=0;
    for(let i=0;i<NN;i++)if(P[i]||TOWN_OF[i]>=0){D[i]=0;q[n++]=i}
    while(h<n){const i=q[h++],x=i%MW;for(const j of[x>0?i-1:-1,x<MW-1?i+1:-1,i-MW,i+MW]){if(j<0||j>=NN||D[j]>=0||!pass(j))continue;D[j]=D[i]+1;from[j]=i;q[n++]=j}}
    let far=-1,fd=7;for(let i=0;i<NN;i++)if((MAP[i]===4||MAP[i]===27)&&TOWN_OF[i]<0&&D[i]>fd){fd=D[i];far=i}
    if(far<0)break;const br=[];for(let i=far;i>=0&&D[i]>0;i=from[i])br.push(i);const join=from[br[br.length-1]];const base=join<0?0:PP[join]<99?PP[join]:TOWN_OF[join]>=0?(SR[STOPS[TOWN_OF[join]].id]??0):0;
    br.reverse().forEach((i,k)=>{P[i]=1;PP[i]=Math.min(PP[i],base+(k+1)*0.03,BIOME[i]===1?2.5:99)})}
  // nodes: towns and crossings
  const nb=i=>{const x=i%MW,o=[];for(const j of[x>0?i-1:-1,x<MW-1?i+1:-1,i-MW,i+MW])if(j>=0&&j<NN&&(P[j]||TOWN_OF[j]>=0))o.push(j);return o};
  const node=new Int32Array(NN).fill(-1),nodes=STOPS.map(T=>T.pseudo?{cross:1,n:T.n,x:T.x,y:T.y}:{town:T.id,n:T.n,x:T.x,y:T.y});
  for(let i=0;i<NN;i++)if(TOWN_OF[i]>=0)node[i]=TOWN_OF[i];
  for(let i=0;i<NN;i++){if(!P[i]||node[i]>=0)continue;if(nb(i).filter(j=>P[j]).length>=3)node[i]=-2}
  for(let i=0;i<NN;i++){if(node[i]!==-2)continue;const k=nodes.length;nodes.push({cross:1,x:0,y:0});const q=[i];node[i]=k;let sx=0,sy=0,n=0;
    while(q.length){const j=q.pop(),x=j%MW,y=(j-x)/MW;sx+=x;sy+=y;n++;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const m=(y+dy)*MW+x+dx;if(m>=0&&m<NN&&node[m]===-2){node[m]=k;q.push(m)}}}
    nodes[k].x=Math.round(sx/n);nodes[k].y=Math.round(sy/n)}
  // trace the pieces between nodes
  const used=new Uint8Array(NN),edges=[];
  for(let i=0;i<NN;i++){if(node[i]<0)continue;for(const j0 of nb(i)){if(!P[j0]||node[j0]>=0||used[j0])continue;
      const pix=[];let prev=i,cur=j0,end=-1;
      while(cur>=0){if(node[cur]>=0){end=node[cur];break}pix.push(cur);used[cur]=1;let nx=-1;for(const m of nb(cur)){if(m===prev||(used[m]&&node[m]<0))continue;if(node[m]>=0&&node[m]===node[i]&&pix.length<3)continue;nx=m;if(node[m]>=0)break}prev=cur;cur=nx}
      edges.push({a:node[i],b:end,pix})}}
  // cut into routes
  const pieces=[];
  for(const e of edges){if(e.pix.length<3&&e.a===e.b)continue;const pr=e.pix.map(j=>PP[j]<99?PP[j]:0);
    // walk in the direction of rising difficulty
    if(pr[0]>pr[pr.length-1]+0.01){e.pix.reverse();pr.reverse();[e.a,e.b]=[e.b,e.a]}
    let st=0;for(let k=1;k<=e.pix.length;k++){const L=k-st;if(k===e.pix.length||(L>=26&&e.pix.length-k>=10)||(pr[k]-pr[st]>=2.4&&L>=12&&e.pix.length-k>=10)){pieces.push({pix:e.pix.slice(st,k),a:st===0?e.a:-1,b:k===e.pix.length?e.b:-1,edge:e,st,p0:Math.min(...pr.slice(st,k))});st=k}}}
  pieces.sort((u,v)=>u.p0-v.p0||u.pix.length-v.pix.length);
  ROUTE_N=pieces.length;
  pieces.forEach((pc,k)=>{const n=k+1,lo=clamp(1+Math.floor(Math.max(0,pc.p0-0.4)*2.5),1,78);ROUTES[n]={n,lv:[lo,lo+4],pix:pc.pix,a:pc.a>=0?nodes[pc.a]:null,b:pc.b>=0?nodes[pc.b]:null,edge:pc.edge};for(const j of pc.pix)ROUTE_OF[j]=n});
  for(const e of edges){e.A=e.a>=0?nodes[e.a]:null;e.B=e.b>=0?nodes[e.b]:null;e.routes=pieces.filter(pc=>pc.edge===e).sort((u,v)=>u.st-v.st).map(pc=>pieces.indexOf(pc)+1);if(e.routes.length)ROUTE_EDGES.push(e)}
  ROUTE_NODES.push(...nodes);
  // every other tile: nearest route (walking distance), then plain neighbour fill for unreachable bits
  const q=new Int32Array(NN);let h=0,n=0;for(let j=0;j<NN;j++)if(ROUTE_OF[j])q[n++]=j;
  while(h<n){const i=q[h++],x=i%MW;for(const j of[x>0?i-1:-1,x<MW-1?i+1:-1,i-MW,i+MW]){if(j<0||j>=NN||ROUTE_OF[j]||!pass(j))continue;ROUTE_OF[j]=ROUTE_OF[i];q[n++]=j}}
  for(let it=0;it<60;it++){let ch=0;for(let j=0;j<NN;j++){if(ROUTE_OF[j])continue;const x=j%MW;for(const q2 of[j-1,j+1,j-MW,j+MW])if(q2>=0&&q2<NN&&ROUTE_OF[q2]&&Math.abs((q2%MW)-x)<=1){ROUTE_OF[j]=ROUTE_OF[q2];ch=1;break}}if(!ch)break}
}

// the routes to walk from one stop of the chain to the next (shortest way over the route network)
function routeWay(fromId,toId){const N=ROUTE_NODES,st=N.findIndex(n=>n.town===fromId||(fromId==='fel'&&n.n==='Felsenhöhen')),go=N.findIndex(n=>n.town===toId);if(st<0||go<0)return[];
  const D=N.map(()=>1e9),prev=N.map(()=>null);D[st]=0;const done=new Set();
  while(true){let u=-1;for(let i=0;i<N.length;i++)if(!done.has(i)&&D[i]<1e9&&(u<0||D[i]<D[u]))u=i;if(u<0||u===go)break;done.add(u);
    for(const e of ROUTE_EDGES){if(!e.A||!e.B)continue;const a=N.indexOf(e.A),b=N.indexOf(e.B);let v=-1,rs=null;if(a===u){v=b;rs=e.routes}else if(b===u){v=a;rs=e.routes.slice().reverse()}if(v<0)continue;const d=D[u]+e.pix.length;if(d<D[v]){D[v]=d;prev[v]={u,rs}}}}
  const out=[];for(let v=go;prev[v];v=prev[v].u)out.unshift(...prev[v].rs);return out}
