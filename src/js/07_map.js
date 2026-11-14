/* ===================== MAP ===================== */
// 0 grass,1 tall,2 tree,3 water,4 path,5 sand,6 wall,7 heal door,8 roof,9 flowers,10 arena roof,11 arena wall,12 arena door
const MW=60,MH=44,MAP=new Uint8Array(MW*MH);const GATES=[];const BIOME=new Uint8Array(MW*MH);const BKEYS=[null,'north','east','south','west','knast'];
const WALK0=new Set([0,1,4,5,7,9,12,13,14,15,17,18,19,20,22,23]);
// extra town buildings (drawn as whole sprites; tile 21 = solid, 22/23 = doors)
const BLDG=[{id:'shop',x:23,y:24,w:5,h:4,dx:25,door:22,n:'COPSHOP'},{id:'hfpol',x:32,y:24,w:7,h:4,dx:35,door:23,n:'HfPol'}];const ENC=new Set([1,17,18,19]);const BASE_T=[0,0,14,0,15],ENC_T=[0,1,17,18,19];
function tget(x,y){return(x<0||y<0||x>=MW||y>=MH)?2:MAP[y*MW+x]}
function tset(x,y,v){if(x>=0&&y>=0&&x<MW&&y<MH)MAP[y*MW+x]=v}
function vnoise(seed,cell){
  const r=mulberry32(seed),gw=Math.ceil(MW/cell)+2,gh=Math.ceil(MH/cell)+2,G=[];for(let i=0;i<gw*gh;i++)G.push(r());
  return(x,y)=>{const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),g=(a,b)=>G[b*gw+a];
    return(g(ix,iy)*(1-sx)+g(ix+1,iy)*sx)*(1-sy)+(g(ix,iy+1)*(1-sx)+g(ix+1,iy+1)*sx)*sy};
}
(function gen(){
  const r=mulberry32(4242),n1=vnoise(11,7),n2=vnoise(22,9),n3=vnoise(33,5);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){
    const d=distC(x,y);let b;
    if(d<8.5+n1(x,y)*2.5)b=0;else{const a=Math.atan2((y-CY)*1.3,x-CX)+(n2(x,y)-0.5)*1.1,q=Math.PI/4;b=a>=-3*q&&a<-q?1:a>=-q&&a<q?2:a>=q&&a<3*q?3:4}
    BIOME[y*MW+x]=b;let t=BASE_T[b];
    if(b>0&&n3(x,y)+r()*0.18>0.6)t=ENC_T[b];
    else if(b===2&&r()<0.22)t=2;else if(b===4&&r()<0.08)t=16;else if(b===1&&r()<0.03)t=2;else if((b===1||b===0)&&r()<0.05)t=9;else if(b===3&&r()<0.02)t=2;
    tset(x,y,t);
  }
  // south: lake with sand shore, reeds near the water
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const d=((x-30)/10)**2+((y-36)/4.5)**2;if(d<1)tset(x,y,3);else if(d<1.55)tset(x,y,5);else if(d<2.3&&BIOME[y*MW+x]===3&&r()<0.5)tset(x,y,18)}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(BIOME[y*MW+x]===3&&(y>=MH-5)&&tget(x,y)!==3&&r()<0.55)tset(x,y,5);
  // roads
  for(let x=2;x<MW-2;x++)tset(x,23,4);
  for(let y=2;y<=30;y++)tset(30,y,4);
  for(let y=11;y<=22;y++)tset(54,y,4);
  for(let y=24;y<=34;y++)tset(9,y,4);
  // buildings
  for(let x=22;x<=27;x++){tset(x,17,8);tset(x,18,8);tset(x,19,6);tset(x,20,6)}
  tset(25,20,7);tset(25,21,4);tset(25,22,4);
  for(let x=33;x<=38;x++){tset(x,16,10);tset(x,17,10);tset(x,18,10);tset(x,19,11);tset(x,20,11)}
  tset(35,20,12);tset(36,20,12);tset(35,21,4);tset(35,22,4);tset(36,21,4);tset(36,22,4);
  for(const Bd of BLDG){for(let y=Bd.y;y<Bd.y+Bd.h;y++)for(let x=Bd.x;x<Bd.x+Bd.w;x++)tset(x,y,21);tset(Bd.dx,Bd.y+Bd.h-1,Bd.door)}
  for(let x=23;x<=38;x++)tset(x,28,4);
  const blocked=t=>t===2||t===16;
  for(const L of LEGENDS){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(blocked(tget(L.x+dx,L.y+dy)))tset(L.x+dx,L.y+dy,BASE_T[BIOME[(L.y+dy)*MW+L.x+dx]]||0);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)tset(L.x+dx,L.y+dy,13)}
  for(const t of TRAINERS){if(!WALK0.has(tget(t.x,t.y))||ENC.has(tget(t.x,t.y)))tset(t.x,t.y,BASE_T[BIOME[t.y*MW+t.x]]||0);const[dx,dy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[t.d];for(let k=1;k<=4;k++){const x=t.x+dx*k,y=t.y+dy*k;if(blocked(tget(x,y))||tget(x,y)===3)tset(x,y,BASE_T[BIOME[y*MW+x]]||0)}}
  // biome borders: progression Town → Meadow → Woods and Town → Shore → Hills.
  // Woods and Hills are walled off from town (tree line / cliffs); Meadow|Woods and Shore|Hills each have one pass; Woods|Shore (river) and Meadow|Hills (cliffs) are closed.
  {const BAR={'0-2':2,'0-4':16,'1-2':2,'2-3':3,'3-4':16,'1-4':16},PASS={'1-2':1,'3-4':1},D=[[1,0],[-1,0],[0,1],[0,-1]],bar=[],keep=new Set();
   for(const L of LEGENDS)for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)keep.add((L.y+dy)*MW+L.x+dx);for(const t of TRAINERS)keep.add(t.y*MW+t.x);
   for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x,b=BIOME[i];if(keep.has(i))continue;
     for(const[dx,dy]of D){const nb=BIOME[(y+dy)*MW+x+dx];if(nb===b)continue;const k=b<nb?b+'-'+nb:nb+'-'+b;if(BAR[k]!==undefined){bar.push([x,y,k]);break}}}
   for(const[x,y,k]of bar){const d=distC(x,y);tset(x,y,PASS[k]&&d>16.5&&d<19.5?4:BAR[k])}}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x<2||y<2||x>=MW-2||y>=MH-2)tset(x,y,BIOME[y*MW+x]===4?16:2);
  // KNAST: walled prison yard in the far north-west of the hills; cell-block floor (tile 20) = encounters with StGB offenders only
  for(let y=3;y<=11;y++)for(let x=4;x<=14;x++){const wall=y===3||y===11||x===4||x===14;tset(x,y,wall?11:20);BIOME[y*MW+x]=5}
  for(const[x,y]of[[9,6],[9,7],[9,8]])tset(x,y,11);   // a cell block in the middle
  tset(9,11,4);for(let y=12;y<=22;y++){tset(9,y,4);if(tget(8,y)===16||tget(8,y)===2)tset(8,y,15);if(tget(10,y)===16||tget(10,y)===2)tset(10,y,15)}
  tset(10,12,15);
  // GATES: town → Nordwiese is free; everything further is reached through single choke points guarded by teachers
  {const W0=i=>WALK0.has(MAP[i]),D2=[[1,0],[0,1]];
   const cross=(a,b)=>{const out=[];for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;if(!W0(i))continue;for(const[dx,dy]of D2){const j=(y+dy)*MW+x+dx;if(!W0(j))continue;const bi=BIOME[i],bj=BIOME[j];if(bi===a&&bj===b)out.push([i,j]);else if(bi===b&&bj===a)out.push([j,i])}}return out};
   const block=i=>{MAP[i]=2};
   // town → Südküste closed
   for(const[,j]of cross(0,3))block(j);
   // keep one crossing per pair (prefer a path tile), close the others on the far side
   const keep=(a,b)=>{const cs=cross(a,b);if(!cs.length)return null;cs.sort((p,q)=>(MAP[q[1]]===4)-(MAP[p[1]]===4)||Math.abs(cs.length/2-cs.indexOf(p))-Math.abs(cs.length/2-cs.indexOf(q)));const g=cs[0];
     for(let it=0;it<6;it++){const left=cross(a,b).filter(([i,j])=>!(i===g[0]&&j===g[1]));if(!left.length)break;for(const[i,j]of left){if(j!==g[1])block(j);else if(i!==g[0])block(i)}}
     // also make sure the gate is a true choke point: close far-side neighbours of the gate that touch side a
     return g[1]};
   const gE=keep(1,2),gW=keep(3,4);
   // corridor Ostwald → Südküste (new): shortest straight-ish carve between the two areas, owned by the woods
   let best=null;for(let i=0;i<MW*MH;i++){if(BIOME[i]!==2||!W0(i))continue;const x=i%MW,y=(i-x)/MW;if(y<30)continue;for(let j=0;j<MW*MH;j++){if(BIOME[j]!==3||!W0(j))continue;const u=j%MW,v=(j-u)/MW;const d=Math.abs(u-x)+Math.abs(v-y);if(!best||d<best.d)best={d,x,y,u,v}}}
   let gS=null;if(best){let x=best.x,y=best.y;while(x!==best.u||y!==best.v){if(x!==best.u)x+=Math.sign(best.u-x);else y+=Math.sign(best.v-y);const k=y*MW+x;if(x===best.u&&y===best.v){gS=k;break}if(!W0(k)||BIOME[k]!==2){MAP[k]=4;BIOME[k]=2}}}
   // Knast: inner cell block reachable only through one door
   for(let x=5;x<=13;x++)tset(x,9,x===9?20:11);for(const[x,y]of[[9,6],[9,7],[9,8]])tset(x,y,20);
   GATES.push({b:2,i:gE},{b:3,i:gS},{b:4,i:gW},{b:5,i:11*MW+9},{b:6,i:9*MW+9});
  }
  // make sure every walkable spot can be reached from town: carve the shortest way through obstacles into any cut-off pocket
  const D4=[[1,0],[-1,0],[0,1],[0,-1]];
  for(let it=0;it<60;it++){const seen=new Uint8Array(MW*MH),q=[24*MW+30];seen[q[0]]=1;
    while(q.length){const i=q.pop(),x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy;if(nx<1||ny<1||nx>=MW-1||ny>=MH-1)continue;const j=ny*MW+nx;if(seen[j]||!WALK0.has(MAP[j]))continue;seen[j]=1;q.push(j)}}
    let c=-1;for(let i=0;i<MW*MH;i++){const x=i%MW,y=(i-x)/MW;if(x>=2&&y>=2&&x<MW-2&&y<MH-2&&!seen[i]&&WALK0.has(MAP[i])){c=i;break}}if(c<0)break;
    const par=new Int32Array(MW*MH).fill(-1),bq=[c];par[c]=c;let hit=-1;
    for(let h=0;h<bq.length&&hit<0;h++){const i=bq[h],x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy;if(nx<2||ny<2||nx>=MW-2||ny>=MH-2)continue;const j=ny*MW+nx;if(par[j]>=0)continue;par[j]=i;if(seen[j]){hit=j;break}bq.push(j)}}
    if(hit<0)break;for(let i=par[hit];i!==c;i=par[i])if(!WALK0.has(MAP[i]))MAP[i]=BASE_T[BIOME[i]]||0}
  // the carving above may have opened extra biome crossings next to the gates → close them again; pockets that become
  // unreachable are connected through their own biome only (or filled with trees)
  {const W0=i=>WALK0.has(MAP[i]),gateSet=new Set(GATES.map(g=>g.i));
   const reach=()=>{const seen=new Uint8Array(MW*MH),q=[24*MW+30];seen[q[0]]=1;while(q.length){const i=q.pop(),x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const j=(y+dy)*MW+x+dx;if(seen[j]||!W0(j))continue;seen[j]=1;q.push(j)}}return seen};
   const allowed=(a,b)=>a===b||(Math.min(a,b)===0&&Math.max(a,b)===1);
   for(let it=0;it<8;it++){let changed=false;
     for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;if(!W0(i))continue;for(const[dx,dy]of D4){const j=(y+dy)*MW+x+dx;if(!W0(j))continue;const a=BIOME[i],b=BIOME[j];if(allowed(a,b)||gateSet.has(i)||gateSet.has(j))continue;
       // close the tile on the "later" side (higher biome index, but never town/north)
       const k=(b>a?j:i);if(BIOME[k]<=1)continue;MAP[k]=2;changed=true}}
     const seen=reach();
     for(let i=0;i<MW*MH;i++){if(!W0(i)||seen[i])continue;const x0=i%MW,y0=(i-x0)/MW;if(x0<2||y0<2||x0>=MW-2||y0>=MH-2)continue;const bb=BIOME[i];
       const par=new Int32Array(MW*MH).fill(-1),bq=[i];par[i]=i;let hit=-1;
       for(let h=0;h<bq.length&&hit<0;h++){const c=bq[h],x=c%MW,y=(c-x)/MW;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy;if(nx<2||ny<2||nx>=MW-2||ny>=MH-2)continue;const j=ny*MW+nx;if(par[j]>=0||BIOME[j]!==bb)continue;par[j]=c;if(seen[j]){hit=j;break}bq.push(j)}}
       if(hit>=0){for(let c=par[hit];c!==i;c=par[c])if(!W0(c))MAP[c]=BASE_T[bb]||0}else MAP[i]=2;changed=true;break}
     if(!changed)break}}
})();
const WALK=WALK0;
