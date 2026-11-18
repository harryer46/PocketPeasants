/* ===================== MAP ===================== */
// Large hand-planned world (≈300×200 tiles) after the player's concept art:
// Villingen-Knastingen (police academy + court) in the centre on a plateau, five training towns around it
// (Lahribar/snow NW, Unterwertheim/desert NE, Damental/forest W, Mostbach/jungle E, Marderach/harbour S),
// rivers from the northern lake, the sea with islands in the south, the prison (Knast) in the desert crater.
// tiles: 0 grass,1 tall grass,2 tree,3 water,4 path,5 sand,6 wall,7 PÄD door,8 roof,9 flowers,10 court roof,11 court wall/prison wall,12 court door,
// 13 shrine,14 forest floor,15 hill ground,16 rock/cliff,17 ferns,18 reeds,19 rubble,20 cell floor,21 building,22 shop door,23 HfPol door,
// 24 snow grass,25 desert scrub,26 jungle grass,27 bridge/pier,28 snow,29 desert sand,30 jungle floor,31 mountain peak
const MW=300,MH=200,DH=192,MHT=MH+DH,MAP=new Uint8Array(MW*MHT);MAP.fill(31,MW*MH);const GATES=[];const BIOME=new Uint8Array(MW*MHT);  // rows MH..MHT: underground dungeons (story)
const BKEYS=[null,'north','east','south','west','knast','snow','desert','jungle'];
const WALK0=new Set([0,1,4,5,7,9,12,13,14,15,17,18,19,20,22,23,24,25,26,27,28,29,30]);
const ENC=new Set([1,17,18,19,24,25,26]);const BASE_T=[0,0,14,0,15,20,28,29,30],ENC_T=[0,1,17,18,19,20,24,25,26];
const T_WF=37,WFALLS=[];const BLDG=[],PADS=[],LABELS=[],TOWNS=[],LEDGES=[];const LEDGE_DIR={32:'down',33:'up',34:'left',35:'right'};let VSPAWN={x:150,y:91},COURT={x:149,y:85};
function tget(x,y){return(x<0||y<0||x>=MW||y>=MHT)?31:MAP[y*MW+x]}
function tset(x,y,v){if(x>=0&&y>=0&&x<MW&&y<MHT)MAP[y*MW+x]=v}
function vnoise(seed,cell){
  const r=mulberry32(seed),gw=Math.ceil(MW/cell)+2,gh=Math.ceil(MH/cell)+2,G=[];for(let i=0;i<gw*gh;i++)G.push(r());
  return(x,y)=>{const fx=x/cell,fy=y/cell,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),g=(a,b)=>G[b*gw+a];
    return(g(ix,iy)*(1-sx)+g(ix+1,iy)*sx)*(1-sy)+(g(ix,iy+1)*(1-sx)+g(ix+1,iy+1)*sx)*sy};
}
// town plans (centre tile); biome = the area around it
const TOWN_DEF=[{id:'vil',n:'Villingen-Knastingen',x:149,y:92,b:1,center:1},{id:'lah',n:'Lahribar',x:59,y:27,b:6},{id:'unt',n:'Unterwertheim',x:247,y:33,b:7},
  {id:'dam',n:'Damental',x:46,y:108,b:2},{id:'mos',n:'Mostbach',x:251,y:111,b:8},{id:'mar',n:'Marderach',x:141,y:156,b:3}];
const KNAST_C={x:262,y:13};
(function gen(){
  const r=mulberry32(4242),n1=vnoise(11,18),n2=vnoise(22,9),n3=vnoise(33,5),wx=vnoise(44,26),wy=vnoise(55,26),n4=vnoise(66,13);
  const B=(x,y)=>BIOME[y*MW+x];
  // ---- biomes: warped Voronoi over hand-placed seeds (layout of the concept map)
  const SEEDS={1:[[150,70],[150,116],[118,98],[182,98],[132,50],[168,50],[150,135]],4:[[150,18],[115,22],[185,22],[98,38],[202,38]],6:[[45,22],[18,45],[74,44],[28,12],[60,8]],
    2:[[28,95],[70,84],[42,124],[80,112],[15,120]],3:[[100,168],[150,172],[205,166],[30,160],[64,150],[250,172],[120,150],[175,150]],8:[[255,100],[287,130],[232,134],[287,88],[265,150]],7:[[250,25],[287,50],[236,48],[283,12],[218,12]]};
  SEEDS[1].push([205,78],[198,60]);
  const SL=[];for(const b in SEEDS)for(const[x,y]of SEEDS[b])SL.push([x,y,+b]);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const X=x+(wx(x,y)-0.5)*30,Y=y+(wy(x,y)-0.5)*30;let bd=1e9,bb=1;for(const[sx,sy,b]of SL){const d=(X-sx)**2+(Y-sy)**2;if(d<bd){bd=d;bb=b}}BIOME[y*MW+x]=bb}
  // every training town sits well inside its own area
  for(const T of TOWN_DEF){if(T.center)continue;for(let y=T.y-20;y<=T.y+20;y++)for(let x=T.x-30;x<=T.x+30;x++){if(x<0||y<0||x>=MW||y>=MH)continue;if(((x-T.x)/30)**2+((y-T.y)/20)**2<1)BIOME[y*MW+x]=T.b}}
  // ---- base terrain + vegetation per biome
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const b=B(x,y),i=y*MW+x;let t=BASE_T[b];const p=n3(x,y)+r()*0.16,q=n2(x,y),z=n4(x,y);
    if(b===1){if(p>0.62)t=1;else if(q>0.72&&r()<0.75)t=2;else if(r()<0.05)t=9}
    else if(b===2){if(q>0.5&&r()<0.82)t=2;else if(p>0.58)t=17;else if(r()<0.02)t=9}
    else if(b===3){if(p>0.64)t=18;else if(q>0.8&&r()<0.4)t=2}
    else if(b===4){if(Math.abs(z-0.5)<0.028)t=16;else if(q>0.58&&r()<0.8)t=2;else if(p>0.62)t=19;else if(r()<0.04)t=16}
    else if(b===6){if(q>0.6&&r()<0.75)t=2;else if(p>0.6)t=24;else if(n1(x,y)>0.7)t=31}
    else if(b===7){if(Math.abs(z-0.5)<0.032||Math.abs(n1(x,y)-0.45)<0.02)t=16;else if(p>0.63)t=25;else if(r()<0.025)t=2;else if(r()<0.02)t=16}
    else if(b===8){if(q>0.5&&r()<0.78)t=2;else if(p>0.56)t=26;else if(r()<0.01)t=16}
    MAP[i]=t}
  // mountains in the far north-west (snow) and canyon rims in the north-east
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const b=B(x,y);const m=(x<14+n1(x,y)*10)||(y<7+n2(x,y)*7&&x<120)||(x+y*1.4<44);if(b===6&&m)tset(x,y,31);if(b===7&&(y<5+n2(x,y)*5||x>MW-6-n1(x,y)*5))tset(x,y,16);if(b===4&&y<5+n2(x,y)*4)tset(x,y,31)}
  // ---- sea, beach, islands
  const coast=x=>167+Math.sin(x/23)*6+Math.sin(x/9)*2+(n1(x,170)-0.5)*8;
  for(let x=0;x<MW;x++){const cy=coast(x);for(let y=0;y<MH;y++){if(y>cy){tset(x,y,3);BIOME[y*MW+x]=3}else if(y>cy-3&&B(x,y)===3&&x>150){tset(x,y,5)}}}
  // swamp in the south-west
  for(let y=126;y<170;y++)for(let x=8;x<80;x++){if(B(x,y)!==3||tget(x,y)===3)continue;const v=n4(x,y);if(v>0.62)tset(x,y,3);else if(v>0.54)tset(x,y,18)}
  const island=(cx,cy,rx,ry,kind)=>{for(let y=cy-ry-1;y<=cy+ry+1;y++)for(let x=cx-rx-1;x<=cx+rx+1;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d>1)continue;BIOME[y*MW+x]=3;tset(x,y,d>0.65?5:kind==='rock'&&r()<0.25?16:r()<0.2?2:r()<0.3?18:0)}};
  island(20,181,8,5,'ruin');island(64,186,6,4);island(98,179,5,4);island(133,188,5,3,'rock');island(183,184,6,4);island(224,181,7,5);island(272,183,9,5);island(292,170,5,4,'rock');
  // ---- lakes and rivers (rivers stop at the coast; bridges are added where roads cross)
  const ell=(cx,cy,rx,ry)=>{for(let y=cy-ry-1;y<=cy+ry+1;y++)for(let x=cx-rx-1;x<=cx+rx+1;x++){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1)tset(x,y,3);else if(d<1.35&&r()<0.6&&tget(x,y)!==31)tset(x,y,B(x,y)===6?28:5)}};
  ell(126,51,10,4);ell(52,80,9,6);ell(262,68,5,3);ell(206,46,4,3);
  const RIVERS=[[[118,53],[104,60],[95,70],[91,82],[89,96],[90,110],[89,124],[87,140],[85,158],[84,178]],[[136,53],[150,56],[164,58],[178,62],[187,72],[190,86],[187,100],[190,114],[187,128],[183,142],[178,160],[177,178]],
    [[36,6],[34,30],[28,50],[20,70],[15,90],[12,110],[13,130],[16,150],[19,172]],[[44,74],[30,64],[28,56]],[[294,62],[280,74],[270,86],[262,96]],[[78,4],[78,16],[70,34],[52,74]]];
  const RIVER_TILES=new Set();
  for(const R of RIVERS)for(let k=0;k+1<R.length;k++){const[a,b2]=[R[k],R[k+1]],L=Math.hypot(b2[0]-a[0],b2[1]-a[1]);for(let s=0;s<=L*3;s++){const f=s/(L*3),x=a[0]+(b2[0]-a[0])*f+(n2((a[0]+s)%MW,a[1])-0.5)*3,y=a[1]+(b2[1]-a[1])*f;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=Math.round(x+dx),Y=Math.round(y+dy);if(X<1||Y<1||X>=MW-1||Y>=MH-1)continue;if(Math.abs(dx)+Math.abs(dy)>1&&r()<0.6)continue;tset(X,Y,3);RIVER_TILES.add(Y*MW+X)}}}
  // ---- the prison in the desert crater
  {const{x:cx,y:cy}=KNAST_C;for(let y=cy-13;y<=cy+13;y++)for(let x=cx-15;x<=cx+15;x++){const d=Math.hypot((x-cx)/15,(y-cy)/12);if(d<1.12&&d>0.9)tset(x,y,16);if(d<=0.9){tset(x,y,29);BIOME[y*MW+x]=7}}
   for(let y=cy-7;y<=cy+7;y++)for(let x=cx-9;x<=cx+9;x++){const wall=y===cy-7||y===cy+7||x===cx-9||x===cx+9;tset(x,y,wall?11:20);BIOME[y*MW+x]=5}
   for(let x=cx-8;x<=cx+8;x++)tset(x,cy-1,x===cx?20:11);for(let y=cy-6;y<cy-1;y++)tset(cx,y,11);tset(cx,cy-3,20)
   for(let y=cy+8;y<=cy+16;y++){tset(cx,y,4);if(tget(cx-1,y)===16)tset(cx-1,y,29);if(tget(cx+1,y)===16)tset(cx+1,y,29)}tset(cx,cy+7,20)}
  // ---- towns
  const fillRect=(x0,y0,x1,y1,t,b)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){tset(x,y,t);if(b!=null)BIOME[y*MW+x]=b}};
  const pad=(x,y)=>{for(let X=x;X<x+6;X++){tset(X,y,8);tset(X,y+1,8);tset(X,y+2,6);tset(X,y+3,6)}tset(x+3,y+3,7);PADS.push({x:x+3,y:y+3,bx:x,by:y,old:!CUR_T||!CUR_T.center})};
  const bld=(id,x,y,w,dxo,door)=>{for(let Y=y;Y<y+4;Y++)for(let X=x;X<x+w;X++)tset(X,Y,21);tset(x+dxo,y+3,door);BLDG.push({id,x,y,w,h:4,dx:x+dxo,door,n:id==='shop'?'COPSHOP':(!CUR_T||CUR_T.id==='vil'?'HfPol':'IAuT'),town:CUR_T&&CUR_T.id,old:!CUR_T||!CUR_T.center})};let CUR_T=null;
  for(const T of TOWN_DEF){CUR_T=T;
    // compact towns like the originals: buildings shoulder to shoulder inside a tree ring
    if(T.center){const{x:cx,y:cy}=T;
      for(let y=cy-13;y<=cy+13;y++)for(let x=cx-17;x<=cx+17;x++){const d=Math.hypot((x-cx)/15.5,(y-cy)/12.5);if(d<1){BIOME[y*MW+x]=0;tset(x,y,d>0.86?2:0);if(d<=0.86&&r()<0.04)tset(x,y,9)}}
      for(let x=cx-15;x<=cx+15;x++)if(tget(x,cy-1)!==2||Math.abs(x-cx)<14)tset(x,cy-1,4);
      for(let y=cy-4;y<=cy+12;y++){tset(cx,y,4);tset(cx-1,y,4)}for(let x=cx-11;x<=cx+10;x++)tset(x,cy+6,4);
      // court (dome) in the middle, PÄD left, sports field right, shop + HfPol below
      for(let x=cx-3;x<=cx+2;x++){for(let y=cy-9;y<=cy-7;y++)tset(x,y,10);tset(x,cy-6,11);tset(x,cy-5,11)}tset(cx-1,cy-5,12);tset(cx,cy-5,12);tset(cx-1,cy-4,4);tset(cx,cy-4,4);
      COURT={x:cx-1,y:cy-4};VSPAWN={x:cx,y:cy+3};
      pad(cx-11,cy-5);
      for(let y=cy-7;y<=cy-3;y++)for(let x=cx+5;x<=cx+11;x++)tset(x,y,(y===cy-7||y===cy-3||x===cx+5||x===cx+11)?5:0);
      bld('shop',cx-9,cy+2,5,2,22);bld('hfpol',cx+3,cy+2,7,3,23);
      LABELS.push({x:cx-11,y:cy-5,w:6,t:'PÄD',kind:'pad'},{x:cx-3,y:cy-9,w:6,t:'GERICHT',kind:'court'});
      TOWNS.push({id:T.id,n:T.n,x:cx,y:cy+3,pad:PADS[PADS.length-1]});continue}
    const{x:cx,y:cy}=T,gr=T.b===6?28:T.b===7?29:0;fillRect(cx-9,cy-6,cx+9,cy+6,gr,0);
    for(let x=cx-9;x<=cx+9;x++){tset(x,cy-6,2);tset(x,cy+6,2)}for(let y=cy-6;y<=cy+6;y++){tset(cx-9,y,2);tset(cx+9,y,2)}
    for(let x=cx-9;x<=cx+9;x++)tset(x,cy-1,4);for(let x=cx-6;x<=cx+6;x++)tset(x,cy+4,4);for(let y=cy+4;y<=cy+6;y++)tset(cx,y,4);
    for(let y=cy-1;y<=cy+4;y++){tset(cx-5,y,4);tset(cx+5,y,4)}
    pad(cx-7,cy-5);bld('shop',cx+1,cy-5,5,2,22);bld('hfpol',cx-3,cy,7,3,23);
    LABELS.push({x:cx-7,y:cy-5,w:6,t:'PÄD',kind:'pad'});
    TOWNS.push({id:T.id,n:T.n,x:cx,y:cy+5,pad:PADS[PADS.length-1]});
    if(T.id==='mar'){for(const px of[cx-6,cx,cx+6])for(let y=cy+6;y<=cy+16;y++){if(tget(px,y)===3||y>cy+7)tset(px,y,27);else tset(px,y,4)}}
  }
  // ---- roads (4-connected, organic wiggle); water → bridge
  const ROAD=new Set();
  const rset=(x,y)=>{if(x<2||y<2||x>=MW-2||y>=MH-2)return;const i=y*MW+x,t=MAP[i];if(t===11||t===20||t===10||t===12||t===6||t===8||t===21||t===7||t===22||t===23)return;MAP[i]=(t===3||t===27)?27:4;ROAD.add(i)};
  // roads run in straight legs with 90° turns (like the routes of the originals): each stretch is split into 2–3 orthogonal legs
  const rr=mulberry32(515);
  const leg=(x,y,tx,ty,w)=>{const st=(nx,ny)=>{rset(nx,ny);if(w>1){rset(nx+1,ny);rset(nx,ny+1)}};while(x!==tx){x+=Math.sign(tx-x);st(x,y)}while(y!==ty){y+=Math.sign(ty-y);st(x,y)}return[x,y]};
  const lpath=(x,y,tx,ty,w)=>{rset(x,y);const dx=tx-x,dy=ty-y;if(Math.abs(dx)<3||Math.abs(dy)<3||rr()<0.35){
      if(rr()<0.5){leg(x,y,tx,y,w);leg(tx,y,tx,ty,w)}else{leg(x,y,x,ty,w);leg(x,ty,tx,ty,w)}return}
    // staircase: horizontal – vertical – horizontal (or the other way round) with a random break point
    const f=0.3+rr()*0.4;if(rr()<0.5){const mx=Math.round(x+dx*f);leg(x,y,mx,y,w);leg(mx,y,mx,ty,w);leg(mx,ty,tx,ty,w)}else{const my=Math.round(y+dy*f);leg(x,y,x,my,w);leg(x,my,tx,my,w);leg(tx,my,tx,ty,w)}};
  const road=(pts,w)=>{for(let k=0;k+1<pts.length;k++){const[x,y]=pts[k],[tx,ty]=pts[k+1];lpath(x,y,tx,ty,w)}};
  // main roads traced from the concept map (1 tile = 5.12 px of the reference), drawn 2 tiles wide
  {const bin=atob(REF_ROADS);for(let i=0;i<MW*MH;i++)if(bin.charCodeAt(i>>3)>>(7-(i&7))&1){const x=i%MW,y=(i-x)/MW;rset(x,y);rset(x+1,y);rset(x,y+1)}}
  // side paths the concept map only hints at: desert canyon, prison, snowfield, shrines
  const RD=[
    [[247,39],[247,46]],[[247,27],[254,22],[262,24],[262,29]],[[238,33],[224,30],[210,32],[196,30]],
    [[121,94],[108,94],[108,86]],[[247,57],[247,61],[226,62],[208,64]],[[134,91],[121,94]],[[164,91],[176,91],[176,97],[196,97]],[[176,91],[184,86],[196,86]],[[256,33],[272,36],[281,36]],
    [[59,33],[59,40]],[[50,27],[38,30],[28,36],[22,40],[22,25]],[[68,27],[80,24],[92,20]],[[150,10],[150,16]],
    [[262,116],[272,126],[282,138]],[[62,104],[70,116],[70,130]],[[22,40],[22,60],[24,92]]
  ];
  for(const p of RD)road(p,1);
  road([[149,104],[149,119]],2);
  // town paths belong to the network, then every loose piece is joined to its nearest neighbour piece (bridges over water)
  for(let i=0;i<MW*MH;i++)if(MAP[i]===4&&BIOME[i]===0)ROAD.add(i);
  {const comps=()=>{const id=new Int32Array(MW*MH).fill(-1),L=[];for(const s0 of ROAD){if(id[s0]>=0)continue;const c=L.length,q=[s0];id[s0]=c;const m=[];
      while(q.length){const i=q.pop();m.push(i);const x=i%MW,y=(i-x)/MW;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const j=(y+dy)*MW+x+dx;if(id[j]<0&&ROAD.has(j)){id[j]=c;q.push(j)}}}L.push(m)}return{id,L}};
   for(let it=0;it<60;it++){const{id,L}=comps();if(L.length<2)break;
     // the smallest piece grows outwards (BFS) until it meets another piece; that link is drawn as a 90° path
     let c=0;for(let k=1;k<L.length;k++)if(L[k].length<L[c].length)c=k;
     const par=new Int32Array(MW*MH).fill(-1),q=[];for(const i of L[c]){par[i]=i;q.push(i)}let hit=-1;
     for(let h=0;h<q.length&&hit<0;h++){const i=q[h],x=i%MW,y=(i-x)/MW;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<2||Y<2||X>=MW-2||Y>=MH-2)continue;const j=Y*MW+X;if(par[j]>=0)continue;par[j]=i;if(id[j]>=0&&id[j]!==c){hit=j;break}q.push(j)}}
     if(hit<0)break;let o=hit;while(par[o]!==o)o=par[o];const ox=o%MW,oy=(o-ox)/MW,hx=hit%MW,hy=(hit-hx)/MW;leg(ox,oy,hx,oy,1);leg(hx,oy,hx,hy,1)}}
  // ---- legendary shrines (+ clear around them)
  for(const L of LEGENDS){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const t=tget(L.x+dx,L.y+dy);if(!WALK0.has(t)||t===27)tset(L.x+dx,L.y+dy,BASE_T[B(L.x+dx,L.y+dy)]||0)}for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)tset(L.x+dx,L.y+dy,13)}
  // ---- dense forests like the concept map: everything away from the routes grows shut (trees, pines, palms, cliffs, peaks);
  //      routes are 2–4 tiles wide, with tall-grass clearings attached to them
  {const D=new Uint8Array(MW*MH).fill(255),q=[];for(let i=0;i<MW*MH;i++){const t=MAP[i];if(ROAD.has(i)||BIOME[i]===0||t===13||t===11||t===20){D[i]=0;q.push(i)}}
   for(let h=0;h<q.length;h++){const i=q[h],x=i%MW,y=(i-x)/MW;if(D[i]>=12)continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const j=ny*MW+nx;if(D[j]<=D[i]+1)continue;D[j]=D[i]+1;q.push(j)}}
   const KEEP=new Uint8Array(MW*MH),rc=mulberry32(77);
   // clearings with tall grass next to the routes
   const RL=[...ROAD];for(let k=0;k<RL.length;k+=19){const i=RL[Math.floor(rc()*RL.length)],x=i%MW,y=(i-x)/MW,b=BIOME[i];if(!b||b===5)continue;const w=5+Math.floor(rc()*5),h=3+Math.floor(rc()*4),side=Math.floor(rc()*4);
     const x0=side===0?x+1:side===1?x-w:x-Math.floor(w/2),y0=side===2?y+1:side===3?y-h:y-Math.floor(h/2);
     for(let Y=y0;Y<y0+h;Y++)for(let X=x0;X<x0+w;X++){if(X<3||Y<3||X>=MW-3||Y>=MH-3)continue;const j=Y*MW+X;if(BIOME[j]!==b||MAP[j]===3||ROAD.has(j))continue;MAP[j]=rc()<0.85?ENC_T[b]:BASE_T[b];KEEP[j]=1}}
   const nW2=vnoise(88,4),nC=vnoise(99,7);const wall=(b,x,y)=>{const v=nW2(x,y);if(b===7)return v>0.62?2:16;if(b===6)return v>0.6?31:2;if(b===4)return v>0.8?16:2;return 2};
   const sea=new Uint8Array(MW*MH);for(let i=0;i<MW*MH;i++)if(MAP[i]===3&&BIOME[i]===3&&(i/MW|0)>150)sea[i]=1;
   for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x,b=BIOME[i],t=MAP[i];if(!b||KEEP[i]||t===3||t===27||t===13||t===11||t===20||t===31)continue;
     const w=2+Math.floor(nC(x,y)*3.2);if(D[i]<=w)continue;
     // open beaches by the sea, open shores at the swamp
     if(b===3){let nearSea=false;for(let dy=-4;dy<=4&&!nearSea;dy++)for(let dx=-4;dx<=4;dx++)if(sea[(y+dy)*MW+x+dx]){nearSea=true;break}if(nearSea||t===18)continue}
     MAP[i]=wall(b,x,y)}}
  // ---- borders between areas: a closed line (trees, cliffs, peaks, water); only roads cross → each road crossing gets a teacher (Prof.)
  const BAR={1:2,2:2,3:3,4:16,5:11,6:31,7:16,8:2};const D4=[[1,0],[-1,0],[0,1],[0,-1]];
  {const set=[];for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x,b=BIOME[i];if(!b||ROAD.has(i)||!WALK0.has(MAP[i])||MAP[i]===13)continue;
     for(const[dx,dy]of D4){const j=(y+dy)*MW+x+dx,nb=BIOME[j];if(!nb||nb===b)continue;set.push([i,b]);break}}
   for(const[i,b]of set)MAP[i]=BAR[b]}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x<2||y<2||x>=MW-2||y>=MH-2){const b=B(x,y);tset(x,y,b===3?3:b===6||b===4?31:b===7?16:2)}
  // ---- gates: first road tile inside an area that is entered from another area
  {const seen=new Set();for(const i of ROAD){const x=i%MW,y=(i-x)/MW,b=BIOME[i];if(b<=1)continue;
     for(const[dx,dy]of D4){const j=(y+dy)*MW+x+dx;if(!ROAD.has(j))continue;const nb=BIOME[j];if(nb===b||nb===0)continue;
       if([...seen].some(k=>{const kx=k%MW,ky=(k-kx)/MW;return BIOME[k]===b&&Math.abs(kx-x)+Math.abs(ky-y)<22}))continue;seen.add(i);GATES.push({b,i});break}}
   GATES.push({b:5,i:(KNAST_C.y+7)*MW+KNAST_C.x},{b:9,i:(KNAST_C.y-1)*MW+KNAST_C.x})}
  // ---- ledges (one-way steps like the originals): the land rises away from Villingen. Going out you walk round the step through
  //      tall grass; coming back you can hop down the step as a shortcut. 32 jump ↓, 33 ↑, 34 ←, 35 →
  {const RD=new Int32Array(MW*MH).fill(-1);let st=-1;for(let r2=0;r2<12&&st<0;r2++)for(const i of ROAD){const x=i%MW,y=(i-x)/MW;if(Math.abs(x-VSPAWN.x)+Math.abs(y-VSPAWN.y)<=r2){st=i;break}}
   const q=[st];RD[st]=0;for(let h=0;h<q.length;h++){const i=q[h],x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const j=(y+dy)*MW+x+dx;if(RD[j]<0&&ROAD.has(j)){RD[j]=RD[i]+1;q.push(j)}}}
   const placed=[],gateNear=(x,y)=>GATES.some(g=>{const gx=g.i%MW,gy=(g.i-gx)/MW;return Math.abs(gx-x)+Math.abs(gy-y)<8}),open=i=>WALK0.has(MAP[i])&&MAP[i]!==27&&MAP[i]!==3&&MAP[i]!==13&&MAP[i]!==7&&MAP[i]<21;
   const order=[...ROAD].filter(i=>RD[i]>=14&&RD[i]%12===2).sort((a,b)=>RD[a]-RD[b]);
   for(const i of order){const x=i%MW,y=(i-x)/MW,b=BIOME[i];if(!b||b===5||gateNear(x,y)||placed.some(([a,c])=>Math.abs(a-x)+Math.abs(c-y)<18))continue;
     // the direction back to Villingen
     let back=null;for(const[dx,dy]of D4){const j=(y+dy)*MW+x+dx;if(RD[j]>=0&&RD[j]<RD[i]){back=[dx,dy];break}}if(!back)continue;
     const[bx,by]=back,px=by!==0?1:0,py=by!==0?0:1;   // ledge runs perpendicular to the road
     // straight road for a few tiles on both sides
     let straight=true;for(let k=-2;k<=2;k++){const j=(y+by*k)*MW+x+bx*k;if(!ROAD.has(j)){straight=false;break}}if(!straight)continue;
     let a=0,c=0;while(a<10&&open((y-py*(a+1))*MW+x-px*(a+1))&&BIOME[(y-py*(a+1))*MW+x-px*(a+1)]===b)a++;while(c<10&&open((y+py*(c+1))*MW+x+px*(c+1))&&BIOME[(y+py*(c+1))*MW+x+px*(c+1)]===b)c++;
     if(a>=10||c>=10||a+c+1<3)continue;
     // detour round one end of the step (through tall grass); pick the side whose rock/trees belong to the same area
     const tryEnd=sgn=>{const e=sgn<0?-(a+1):c+1,cells=[],add=(X,Y)=>{if(X<3||Y<3||X>=MW-3||Y>=MH-3)return false;const j=Y*MW+X;if(ROAD.has(j))return true;if(BIOME[j]!==b||MAP[j]===3||MAP[j]===27||MAP[j]>=21&&MAP[j]<=23||MAP[j]===13||MAP[j]>=32)return false;cells.push(j);return true};
       for(let w=0;w<2;w++)for(let k=-2;k<=2;k++)if(!add(x+px*(e+sgn*w)+bx*k,y+py*(e+sgn*w)+by*k))return null;
       for(const k of[-2,2])for(let m=1;m<=Math.abs(e)+1;m++)if(!add(x+px*sgn*m+bx*k,y+py*sgn*m+by*k))return null;return cells};
     const cells=tryEnd(1)||tryEnd(-1);if(!cells)continue;
     const lt=bx===0?(by>0?32:33):(bx>0?35:34);if(lt===33)continue;   // like the originals: no steps you hop up-screen
     for(let k=-a;k<=c;k++){const j=(y+py*k)*MW+x+px*k;MAP[j]=lt;ROAD.delete(j)}
     for(const j of cells)MAP[j]=ENC_T[b];
     // tall grass right in front of the step on the low side's approach, so the way up leads through it
     for(let k=-a;k<=c;k++)for(const s2 of[1,2]){const j=(y+py*k+by*s2)*MW+x+px*k+bx*s2;if(open(j)&&!ROAD.has(j)&&BIOME[j]===b)MAP[j]=ENC_T[b]}
     // safety: the far side must still be reachable from Villingen without hopping (else undo)
     const save=[];for(let k=-a;k<=c;k++){const j=(y+py*k)*MW+x+px*k;save.push(j)}
     const seen=new Uint8Array(MW*MH),qq=[VSPAWN.y*MW+VSPAWN.x];seen[qq[0]]=1;const far=(y-by*2)*MW+x-bx*2;while(qq.length&&!seen[far]){const u=qq.pop(),ux=u%MW,uy=(u-ux)/MW;for(const[dx,dy]of D4){const j=(uy+dy)*MW+ux+dx;if(!seen[j]&&WALK0.has(MAP[j])){seen[j]=1;qq.push(j)}}}
     if(!seen[far]){for(const j of save){MAP[j]=4;ROAD.add(j)}continue}
     placed.push([x,y]);LEDGES.push({x,y,t:lt})}}
  // ---- reachability: carve pockets back to the network inside their own area (never across a border), else fill them
  const W0=i=>WALK0.has(MAP[i]);
  const reach=()=>{const seen=new Uint8Array(MW*MH),q=[VSPAWN.y*MW+VSPAWN.x];seen[q[0]]=1;while(q.length){const i=q.pop(),x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy;if(nx<1||ny<1||nx>=MW-1||ny>=MH-1)continue;const j=ny*MW+nx;if(seen[j]||!W0(j))continue;seen[j]=1;q.push(j)}}return seen};
  for(let it=0;it<400;it++){const seen=reach();let c=-1;for(let i=0;i<MW*MH;i++){const x=i%MW,y=(i-x)/MW;if(x>=2&&y>=2&&x<MW-2&&y<MH-2&&!seen[i]&&W0(i)&&MAP[i]!==3){c=i;break}}if(c<0)break;
    // component size
    const comp=[c],cs=new Set([c]);for(let h=0;h<comp.length&&comp.length<400;h++){const i=comp[h],x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const j=(y+dy)*MW+x+dx;if(cs.has(j)||!W0(j))continue;cs.add(j);comp.push(j)}}
    const bb=BIOME[c],isl=comp.some(i=>{const x=i%MW,y=(i-x)/MW;return D4.some(([dx,dy])=>MAP[(y+dy)*MW+x+dx]===3)})&&bb===3;
    if(comp.length<10&&!isl){for(const i of comp)MAP[i]=BAR[bb]||2;continue}
    const par=new Int32Array(MW*MH).fill(-1),bq=[];for(const i of comp){par[i]=i;bq.push(i)}let hit=-1;
    for(let h=0;h<bq.length&&hit<0;h++){const i=bq[h],x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy;if(nx<2||ny<2||nx>=MW-2||ny>=MH-2)continue;const j=ny*MW+nx;if(par[j]>=0)continue;if(BIOME[j]!==bb&&!(isl&&MAP[j]===3))continue;if(MAP[j]===11||MAP[j]===20)continue;par[j]=i;if(seen[j]){hit=j;break}bq.push(j)}}
    if(hit<0){if(isl)continue;for(const i of comp)MAP[i]=BAR[bb]||2;continue}
    for(let i=par[hit];par[i]!==i;i=par[i])if(!W0(i)&&MAP[i]!==3)MAP[i]=BASE_T[BIOME[i]]||0}
  // ---- trainers: originals at fixed story spots, many more along the roads of every area
  const near=(x,y,b)=>{for(let rr=1;rr<5;rr++)for(let dy=-rr;dy<=rr;dy++)for(let dx=-rr;dx<=rr;dx++){const X=x+dx,Y=y+dy,i=Y*MW+X;if(X<3||Y<3||X>=MW-3||Y>=MH-3)continue;if(BIOME[i]!==b||ROAD.has(i))continue;
      // standing beside a road, looking at it
      for(const[ddx,ddy,d]of[[1,0,'right'],[-1,0,'left'],[0,1,'down'],[0,-1,'up']]){const j=(Y+ddy)*MW+X+ddx;if(ROAD.has(j)&&BIOME[j]===b)return{x:X,y:Y,d}}}return null};
  const roadsIn=b=>[...ROAD].filter(i=>BIOME[i]===b);
  const FIX={ben:[150,124,1],lina:[150,58,1],gwen:[118,90,1],rita:[78,101,2],hank:[120,30,4],sue:[176,159,3],axel:[262,124,8]};
  const used=[];const okSpot=(x,y)=>!used.some(([a,b])=>Math.abs(a-x)+Math.abs(b-y)<15)&&!GATES.some(g=>{const gx=g.i%MW,gy=(g.i-gx)/MW;return Math.abs(gx-x)+Math.abs(gy-y)<6})&&!TOWNS.some(t=>Math.abs(t.x-x)<18&&Math.abs(t.y-y)<12);
  for(const t of TRAINERS){const f=FIX[t.id];if(!f)continue;const s=near(f[0],f[1],f[2])||{x:f[0],y:f[1],d:t.d};Object.assign(t,s);used.push([s.x,s.y])}
  const RANKS=['Polizeimeisterin','Polizeimeister','Kommissar','Kommissarin','Polizeiobermeister','Oberkommissarin','Hauptkommissar','Anwärterin','Anwärter','Polizeihauptmeister','Kriminalkommissarin','Diensthundeführer','Verkehrspolizist','Bereitschaftspolizistin'];
  const NAMES=['Jonas','Lea','Finn','Mila','Paul','Emma','Luis','Hanna','Ben','Sofia','Noah','Lina','Elias','Clara','Felix','Ida','Max','Nele','Tim','Greta','Moritz','Pia','Jan','Zoe','Karl','Frieda','Emil','Lotta','Oskar','Ella','Theo','Maja','Anton','Leni','Jakob','Marie','David','Ronja','Leon','Amelie'];
  const LINES=['Halt, Personenkontrolle!','Ich hab da ein paar Paragrafen für dich.','Hier kommt keiner ungeprüft vorbei!','Zeig mal, was dein Team drauf hat!','Dienstsport! Los geht’s!','Sie wurden geblitzt — von meinem Monster!','Routinekontrolle. Ganz entspannt…','Meine Monster haben die Prüfung mit Auszeichnung bestanden!'];
  const AFTER=['Weitermachen.','Gute Streife!','Respekt, Kollege.','Das gibt eine Belobigung.','Na gut, du darfst weiter.'];
  const COL=['#2f5fb3','#3b4a8c','#2a6f4f','#7a3a3a','#5b4bc4','#1f7fa8','#8c5a2a','#2b2f3a','#a83a6a','#3a7a3a'];
  const rt=mulberry32(909);let k=0;
  for(const b of[1,2,3,4,6,8,7]){const R=roadsIn(b);for(let n=0;n<R.length;n+=4){const i=R[(n*37)%R.length],x=i%MW,y=(i-x)/MW;if(!okSpot(x,y))continue;const s=near(x,y,b);if(!s||!okSpot(s.x,s.y))continue;
    const cnt=(b===1?Math.min(3,1+(k%3)):b>=6?3+(k%2):2+(k%2)),nm=RANKS[k%RANKS.length]+' '+NAMES[(k*7)%NAMES.length];
    TRAINERS.push({id:'tr'+b+'_'+k,n:nm,x:s.x,y:s.y,d:s.d,c:COL[k%COL.length],team:Array.from({length:cnt},(_,j)=>['owigon',5+j]),reward:2+(b>=6?2:b>=3?1:0),line:LINES[Math.floor(rt()*LINES.length)],after:AFTER[Math.floor(rt()*AFTER.length)]});used.push([s.x,s.y]);k++;
    if(R.length/4<k)break}}
  for(const t of TRAINERS){if(!WALK0.has(tget(t.x,t.y))||ENC.has(tget(t.x,t.y)))tset(t.x,t.y,BASE_T[B(t.x,t.y)]||0);const[dx,dy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[t.d];for(let s=1;s<=4;s++){const x=t.x+dx*s,y=t.y+dy*s;const tt=tget(x,y);if(tt===2||tt===16||tt===31||tt===3)tset(x,y,ROAD.has(y*MW+x)?4:BASE_T[B(x,y)]||0)}}
  // level range per area: grows with the distance from Villingen inside the area
  for(const z in ZLV){ZLV[z].d0=1e9;ZLV[z].d1=0}
  for(let i=0;i<MW*MH;i++){if(!ENC.has(MAP[i])&&MAP[i]!==20)continue;const z=BKEYS[BIOME[i]];if(!z||!ZLV[z])continue;const x=i%MW,y=(i-x)/MW,d=distC(x,y);ZLV[z].d0=Math.min(ZLV[z].d0,d);ZLV[z].d1=Math.max(ZLV[z].d1,d)}
})();
const WALK=WALK0;
