/* ===================== ROUTES =====================
   Level scaling along numbered routes: the towns are meant to be visited in a fixed order
   Villingen → Marderach → Damental → Lahribar → Felsenhöhen → Unterwertheim → Mostbach.
   Route k: wild monsters Lv lo..lo+4 with lo = 1 + ⌊(k−1)·2.5⌋ (1–5, 3–7, 6–10, 8–12, …), trainers 3 levels above.
   Every overworld tile belongs to the nearest stretch between two consecutive stops (only stretches whose
   shortest path crosses the tile's area count) and gets its route from the progress along that stretch. */
const ROUTE_CHAIN=[{id:'vil'},{id:'mar',r:3},{id:'dam',r:9},{id:'lah',r:15},{pt:[135,26],r:19},{id:'unt',r:24},{id:'mos',r:31}];
const ROUTE_N=31;
function routeRange(k){const lo=1+Math.floor((k-1)*2.5);return[lo,lo+4]}
const ROUTE_OF=new Uint8Array(MW*MH);   // 0 = no route (town), else 1..ROUTE_N
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
  // tiles no stretch reaches (islands, closed valleys): nearest assigned neighbour
  for(let j=0;j<MW*MH;j++)if(prog[j]>=0)ROUTE_OF[j]=clamp(Math.floor(prog[j])+1,1,ROUTE_N);
  for(let it=0;it<40;it++){let ch=0;for(let j=0;j<MW*MH;j++){if(ROUTE_OF[j]||BIOME[j]===0)continue;const x=j%MW;for(const q of[j-1,j+1,j-MW,j+MW])if(q>=0&&q<MW*MH&&ROUTE_OF[q]&&Math.abs((q%MW)-x)<=1){ROUTE_OF[j]=ROUTE_OF[q];ch=1;break}}if(!ch)break}
  // show the new ranges per area (world map labels, pass signs)
  for(const z in ZLV){ZLV[z].lo=999;ZLV[z].hi=0}
  for(let j=0;j<MW*MH;j++){if(!ENC.has(MAP[j]))continue;const z=BKEYS[BIOME[j]];if(!z||!ZLV[z])continue;const x=j%MW,y=(j-x)/MW,lo=storyLv(x,y)||routeRange(ROUTE_OF[j]||1)[0];ZLV[z].lo=Math.min(ZLV[z].lo,lo);ZLV[z].hi=Math.max(ZLV[z].hi,lo+4)}
  ZLV.knast.lo=KNAST_LV[0];ZLV.knast.hi=KNAST_LV[1];
  for(const z in ZLV){if(ZLV[z].lo===999){ZLV[z].lo=1;ZLV[z].hi=5}BIO_MIN[z]=ZLV[z].lo}
})();
function routeAt(x,y){if(x<0||y<0||x>=MW||y>=MH)return 0;return ROUTE_OF[y*MW+x]}
function routeLo(x,y){return routeRange(routeAt(x,y)||1)[0]}
