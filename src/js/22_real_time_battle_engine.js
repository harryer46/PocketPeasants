/* ===================== REAL-TIME BATTLE ENGINE ===================== */
const AW=396,AH=316,ACX=198,ACY=202,ARX=174,ARY=101,YT=ACY-73,YB=ACY+75,AX0=ACX-ARX,AX1=ACX+ARX,AY0=ACY-ARY,AY1=ACY+ARY,XL=ACX,XR=ACX,AYM=ACY,UI=1.5,UW=AW/UI,UH=AH/UI;
// feet stay inside the oval; points outside are pulled back onto its edge
function arenaClamp(F){const dx=(F.x-ACX)/ARX,dy=(F.y-ACY)/ARY,d=Math.hypot(dx,dy);if(d>1){F.x=ACX+dx/d*ARX;F.y=ACY+dy/d*ARY}}
function outArena(x,y){const dx=(x-ACX)/(ARX+24),dy=(y-ACY)/(ARY+30);return dx*dx+dy*dy>1}
// duels: each player sees himself at the bottom — the 'R' player's view is the canonical field turned by 180°
function flipOn(){return!!(B&&B.mode==='duel'&&B.me&&B.me.side==='R')}
function fx_(x){return flipOn()?2*ACX-x:x}function fy_(y){return flipOn()?2*ACY-y:y}
function mkFighter(side,team,x,ctrl){const f={stg:{a:0,d:0,s:0},st:{burn:0,slow:0,stun:0,sleep:0,conf:0,shield:0,haste:0,fly:0,dive:0},burnT:0,ap:AP_MAX,side,team,a:0,x:ACX,y:ctrl==='local'?YB:YT,face:ctrl==='local'?1:-1,cd:[0,0,0,0],dashT:0,dashCd:0,inv:1,swCd:0,flash:0,faint:0,out:false,ctrl,mvx:0,mvy:0,ddx:0,ddy:0,think:0};const i=team.findIndex(m=>m.hp>0);f.a=i<0?0:i;if(i<0)f.out=true;return f}
function act(F){return F.team[F.a]}
// stat stages (buffs/debuffs) like the originals: -4…+4, reset when the monster leaves the field
function stageMul(n){n=clamp(n|0,-4,4);return n>=0?(2+n)/2:2/(2-n)}
function stgOf(F){if(!F)return{a:0,d:0,s:0};if(B&&B.tb){const t=F.tbst||{};return{a:t.ga|0,d:t.gd|0,s:t.gs|0}}return F.stg||(F.stg={a:0,d:0,s:0})}
function applyStages(F,bs){if(!F||!bs)return;const g=F.stg||(F.stg={a:0,d:0,s:0}),now=performance.now();let i=0;
  for(const[k,v]of Object.entries(bs)){const old=g[k]|0;g[k]=clamp(old+v,-4,4);const ch=g[k]-old,nm=STAT_DE[k];
    if(!ch){say(`${SPECIES[act(F).s].n}: ${nm} kann nicht weiter ${v>0?'steigen':'sinken'}!`);continue}
    B.nums.push({x:F.x,y:F.y-46-i*9,t:`${nm.toUpperCase()} ${ch>0?'↑':'↓'}${Math.abs(ch)>1?'↑'.repeat(0)+'×'+Math.abs(ch):''}`,c:ch>0?'#3ddc6b':'#ef6f6f',at:now+i*120,sz:9,life:1200});i++;
    say(`${SPECIES[act(F).s].n}: ${nm} ${ch>0?(ch>1?'steigt stark':'steigt'):(ch<-1?'sinkt stark':'sinkt')}!`);burst(F.x,F.y-14,ch>0?'#3ddc6b':'#ef6f6f',8)}
  if(B.mode==='duel'&&F===B.me)publishDuel(true)}
const TYPE_SPD={flying:1.1,electric:1.08,fire:1.04,normal:1,water:0.97,grass:0.94,rock:0.9};
function fspeed(F){return Math.min(120,48+act(F).spd*1.15)*0.96*(TYPE_SPD[SPECIES[act(F).s].t]||1)*Math.sqrt(stageMul(stgOf(F).s))*(F.ctrl==='ai'?0.82:1)*(F.st&&F.st.slow>0?0.55:1)*(F.st&&F.st.haste>0?1.35:1)*(F.st&&F.st.dive>0?1.25:1)}
function shotParams(mid){const r=shotParams0(mid);if(!r.mel&&!r.self&&r.sp&&r.k!=='vortex')r.sp*=1.2;return r}
function shotParams0(mid){const mv=MOVES[mid]||MOVES.bump;const k=mv.k||(mv.t==='normal'?'melee':'shot');
  if(k==='melee'){const cb=mv.combo||1;return{mel:1,sp:270,life:0.17,r:10,p:cb>1?Math.max(4,Math.round(mv.p*1.35*1.2/cb)):Math.round(mv.p*1.35),n:1,combo:cb}}  // melee hits harder
  if(mid==='surf')return{sp:84,life:2.5,r:10,p:Math.round(mv.p*0.85),n:1,wave:1};
  if(MOVE_VIS[mid]==='wave'&&(k==='spread'||k==='shot'))return{sp:100,life:1.8,r:6,p:Math.round(mv.p*0.85),n:1,wave:1};
  if(k==='rapid'){const n=clamp(mv.rn||6,5,10);return{rapid:n,int:0.085,sp:215,life:1.8,r:2.5,p:Math.max(3,Math.round(mv.p*0.8/n)),n:1}}
  if(k==='arc')return{k:'lob',nm:1,h:30,life:0.85,r:12,p:mv.n3?Math.round(mv.p*0.5):mv.p,n:mv.n3?3:1,ang:0.24};
  if(k==='rain')return{k:'air',nm:1,sp:0,life:0.9,r:12,p:Math.round(mv.p*0.36),n:1,rain:5};
  if(k==='fly')return{k:'fly',nm:1,sp:0,life:1.25,r:20,p:mv.p,n:1};
  if(k==='dive')return{k:'air',nm:1,sp:0,life:0.06,r:30,p:mv.p,n:1,dive:1.1};
  if(k==='vortex')return{k:'vortex',nm:1,sp:74,life:2.6,r:7,p:mv.p,n:1};
  if(k==='spread')return{sp:125,life:2.4,r:4,p:Math.round(mv.p*0.42),n:3,ang:0.24};
  if(k==='multi')return{sp:200,life:2,r:2.5,p:Math.max(4,Math.round(mv.p*0.22)),n:3,ang:0.07};
  if(k==='big')return{sp:92,life:3,r:7,p:mv.p,n:1};
  if(k==='self')return{self:1,p:0,n:0};
  // special mechanics: beam (charged line), breath (short cone, several ticks), air (strike from above at the target spot), lob (high throw over obstacles)
  if(k==='beam')return{k,nm:1,sp:100,life:0.62,charge:0.3,len:250,r:5,p:Math.round(mv.p*0.95),n:1};
  if(k==='breath')return{k,nm:1,sp:100,life:0.6,rng:82,cone:0.5,ticks:3,r:6,p:Math.round(mv.p*0.42),n:1};
  if(k==='air')return{k,nm:1,sp:0,life:0.95,r:22,p:mv.p,n:1};
  if(k==='lob')return{k,nm:1,sp:520,h:54,life:1.15,r:18,p:mv.p,n:1};
  return{sp:178-mv.p,life:2.4,r:3+mv.p/25,p:mv.p,n:1}}
function cdOf(mid){const mv=MOVES[mid]||MOVES.bump;if(mv.fx==='heal')return 3*(mv.k==='self'?16:(mv.cd||0.45+mv.p/62)*1.2);if(MOVES[mid]&&mv.t==='rock'&&(mv.k==='arc'||mv.k==='lob'))return Math.max(2.4,(0.45+mv.p/62)*1.2*2.2);if(mv.k==='rapid')return Math.max(3.2,(0.45+mv.p/62)*2.6);if(mv.fx==='heal'&&mv.k==='self')return 16;const base=mv.cd||(mv.k==='self'?7:mv.k==='big'?2.6:0.45+mv.p/62);return mv.k==='melee'||mv.k==='self'?base:base*1.2}
// AP: one pool per fighter for every attack. Strong moves cost more, weak ones little; AP refill over time (real-time) or per turn (turn-based)
const AP_MAX=100,AP_REGEN=8,TB_AP_REGEN=30;
// healing costs all AP and has a long cooldown; every other move costs half of its former AP price
function apCost(mid){const mv=MOVES[mid]||MOVES.bump;if(mv.k==='rapid')return Math.min(AP_MAX,Math.max(42,Math.round((mv.p||30)*0.75)));if(mv.k==='multi')return Math.min(AP_MAX,Math.max(32,Math.round((mv.p||30)*0.55)));if(mv.fx==='heal'&&mv.k==='self')return 50;if(mv.fx==='buff')return 50;if(mv.k==='self')return 35;if(mv.fx==='debuff'&&(mv.p||0)<=10)return 25;return Math.min(AP_MAX,Math.round(Math.max(18,(mv.p||30)*0.8*(mv.k==='melee'?0.8:1))*0.8*0.5))}
function moveDesc(mid){const mv=MOVES[mid];const k={melee:'Nahkampf',shot:'Fernkampf',spread:'Fächer',multi:'Salve',big:'schwer',self:'selbst',beam:'Strahl',breath:'Atem',air:'Luftschlag',lob:'Hochwurf',arc:'Bogenwurf',rapid:'Schnellfeuer',rain:'Hagel',fly:'Flug-Angriff',dive:'Tauchangriff',vortex:'Sog'}[mv.k]||'Fernkampf';return`${TYPES[mv.t].n} · ${k}${mv.combo>1?' ×'+mv.combo:''}${mv.p?' · '+mv.p:''}${mv.fx?' · '+(mv.bs?(mv.fx==='debuff'?'Ziel: ':mv.fx==='selfbuff'?'evtl. ':'')+bsText(mv)+(mv.stc&&mv.stc<1?` (${Math.round(mv.stc*100)} %)`:''):FX_TXT[mv.fx]):''} · ${apCost(mid)} AP`}
function calcDmg(att,def,mid,p){const mv=MOVES[mid]||MOVES.bump;const e=eff(mv.t,SPECIES[def.s].t);let d=((2*att.l/5+2)*p*att.atk/Math.max(1,def.def))/50+2*Math.min(1,p/30);d*=(mv.t===SPECIES[att.s].t?1.5:1)*e*(0.85+Math.random()*0.15)*0.55;return{d:e===0?0:Math.max(1,Math.round(d)),e}}
function say(t){if(!B)return;if(/erreicht Lv/.test(t))B.lvlFx=performance.now();if(/entwickelt!/.test(t))B.evoFx=performance.now();B.log.push({t,at:performance.now()});if(B.log.length>3)B.log.shift()}
// destructible obstacles: rocks take many hits, plants few (fire burns plants fast). Same layout for both duel players.
// destructible obstacles, themed per location. mat decides what hurts it: plants & wood burn, rock resists fire but cracks under rock/water
const OBK={rock:{mat:'rock',hp:70,r:12},boulder:{mat:'rock',hp:110,r:14},crystal:{mat:'rock',hp:55,r:10},coral:{mat:'rock',hp:45,r:10},pillar:{mat:'rock',hp:150,r:11},
  bush:{mat:'plant',hp:14,r:9},flower:{mat:'plant',hp:8,r:8},fern:{mat:'plant',hp:12,r:9},reeds:{mat:'plant',hp:10,r:8},shrub:{mat:'plant',hp:10,r:8},
  stump:{mat:'wood',hp:45,r:11},log:{mat:'wood',hp:55,r:13},drift:{mat:'wood',hp:30,r:12},crate:{mat:'wood',hp:35,r:10},poller:{mat:'steel',hp:1,r:8,ind:1},menhir:{mat:'steel',hp:1,r:12,ind:1}};
const ZONE_OBS={north:[['bush',3,4],['flower',1,2],['rock',1,2],['menhir',1,1]],east:[['stump',2,3],['fern',2,3],['log',1,2],['menhir',1,1]],south:[['reeds',2,3],['drift',2,2],['coral',1,2],['menhir',1,1]],
  west:[['boulder',2,3],['rock',1,2],['crystal',1,1],['shrub',1,2],['menhir',1,2]],snow:[['crystal',2,3],['rock',1,2],['stump',1,1],['menhir',1,1]],desert:[['boulder',2,3],['rock',1,2],['shrub',1,2],['menhir',1,2]],jungle:[['fern',2,3],['bush',2,2],['log',1,2],['menhir',1,1]],arena:[['pillar',2,3],['crate',2,3],['poller',2,2]],knast:[['pillar',3,3],['crate',2,2],['poller',2,3]]};
function genObs(seed,zone){const r=mulberry32(seed>>>0),out=[];const kinds=[];for(const[k,a,b]of(ZONE_OBS[zone]||ZONE_OBS.north)){const n=a+Math.floor(r()*(b-a+1));for(let i=0;i<n;i++)kinds.push(k)}
  let id=0;for(const kind of kinds){const K=OBK[kind],rad=K.r;for(let t=0;t<140;t++){const a=r()*6.283,q=0.2+r()*0.68,x=ACX+Math.cos(a)*ARX*q,y=ACY+Math.sin(a)*ARY*q;
      if(Math.hypot(x-ACX,(y-YT)*1.3)<48||Math.hypot(x-ACX,(y-YB)*1.3)<48)continue;if(K.ind&&Math.abs(x-ACX)<28)continue;if(out.some(o=>Math.hypot(o.x-x,(o.y-y)*1.3)<o.r+rad+24))continue;
      out.push({id:id++,kind,mat:K.mat,ind:K.ind?1:0,x:Math.round(x),y:Math.round(y),r:rad,hp:K.hp,max:K.hp,v:Math.floor(r()*3)});break}}
  return out}
function obsPush(F){if(!B||!B.obs)return;for(const o of B.obs){if(o.dead)continue;let dx=F.x-o.x,dy=(F.y-o.y)*1.4;const d=Math.hypot(dx,dy),min=o.r+8;if(d<min){if(d<0.01){dx=1;dy=0}const L=Math.hypot(dx,dy);F.x=o.x+dx/L*min;F.y=o.y+dy/L*min/1.4}}}
function shotVsObs(s){if(!B.obs)return false;for(const o of B.obs){if(o.dead)continue;if(Math.hypot(s.x-o.x,s.y-(o.y-8))<o.r+(s.r||4)){s.dead=1;hitObs(o,s);return true}}return false}
function hitObs(o,s){const mv=MOVES[s.mid]||{p:30,t:'normal'};if(o.ind){o.hitT=performance.now();burst(o.x,o.y-8,'#e8ecf2',5);burst(o.x,o.y-8,'#ffcb3d',3);return}let dmg=Math.max(4,(mv.p||30)*0.45);const m=o.mat||(o.kind==='rock'?'rock':'plant');
  if(m==='plant'&&mv.t==='fire')dmg*=2.5;if(m==='wood'&&mv.t==='fire')dmg*=2;if(m==='rock'&&(mv.t==='rock'||mv.t==='water'))dmg*=1.4;if(m==='rock'&&mv.t==='fire')dmg*=0.6;
  o.hp-=dmg;o.hitT=performance.now();burst(o.x,o.y-8,m==='rock'?'#9aa0a6':m==='wood'?'#a0703a':'#5fa236',6);if(o.hp<=0)breakObs(o)}
function breakObs(o){if(o.dead)return;o.dead=1;o.hp=0;const m=o.mat||'rock';burst(o.x,o.y-8,m==='rock'?'#8a8a8a':m==='wood'?'#7a4a22':'#4f8f2e',22);burst(o.x,o.y-8,m==='rock'?'#d0d0c8':m==='wood'?'#d9a466':'#ffd23f',8);
  say(m==='rock'?`${OBK_DE[o.kind]||'Der Stein'} zerbricht!`:m==='wood'?`${OBK_DE[o.kind]||'Das Holz'} zersplittert!`:`${OBK_DE[o.kind]||'Die Pflanze'} wird zerfetzt!`);if(B.mode==='duel'){B.obGone=B.obGone||[];if(!B.obGone.includes(o.id)){B.obGone.push(o.id);publishDuel(true)}}}
const OBSPR={};
function obsSprite(kind,v,stage){const k=kind+v+stage;if(OBSPR[k])return OBSPR[k];const W=16,H=16,c=mk(W,H),x=c.getContext('2d'),id=x.createImageData(W,H),d=id.data;const rr=mulberry32(hashStr(k));
  const P=a=>a.map(hex2rgb),put=(X,Y,col)=>{X=Math.round(X);Y=Math.round(Y);if(X<0||Y<0||X>=W||Y>=H)return;const o=(Y*W+X)*4;d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255};
  const shade=(pal,val)=>pal[clamp(Math.floor(val*pal.length),0,pal.length-1)],dth=(X,Y)=>BAYER[(Y&3)*4+(X&3)]*0.18;
  const ell=(cx,cy,rx,ry,pal,top)=>{for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){const dx=(X-cx)/rx,dy=(Y-cy)/ry,q=dx*dx+dy*dy;if(q>1)continue;let val=0.62-(dx+dy)*0.33+dth(X,Y);if(q>0.72)val-=0.38;put(X,Y,top&&dy<-0.45&&rr()<0.7?shade(top,val):shade(pal,val))}};
  const blobs=(bl,pal)=>{for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){let best=9;for(const[bx,by,br]of bl){const q=((X-bx)**2+(Y-by)**2)/(br*br);if(q<best)best=q}if(best>1)continue;let val=0.6-((X-8)+(Y-8))/14*0.5+dth(X,Y)*1.4;if(best>0.75)val-=0.4;put(X,Y,shade(pal,val))}};
  const cracks=(n,cx,cy,rx,ry)=>{const dk=hex2rgb('#2a2a30');for(let i=0;i<n;i++){let X=cx-3+Math.floor(rr()*6),Y=cy-3+Math.floor(rr()*5);for(let j=0;j<3;j++){const dx=(X-cx)/rx,dy=(Y-cy)/ry;if(dx*dx+dy*dy<0.8)put(X,Y,dk);X+=rr()<0.5?1:-1;Y+=rr()<0.6?1:0}}};
  const dots=(n,cols,area)=>{for(let i=0;i<n;i++){const X=area[0]+Math.floor(rr()*area[2]),Y=area[1]+Math.floor(rr()*area[3]);put(X,Y,cols[i%cols.length])}};
  const wood=P(['#3a2410','#5e3a1a','#8a5a2b','#b07a3e','#d9a466']),stone=P(['#3c3f48','#5c606b','#80858f','#a9adb5','#d0d3d8']);
  switch(kind){
   case'rock':ell(8,9,7-(v===2?1:0),5.5+(v===1?1:0),RGB.rock,RGB.moss);cracks(stage*3,8,9,7,5.5);break;
   case'boulder':ell(8,9,7.6,6.4,RGB.rock);ell(5,7,2.4,2,RGB.rock);cracks(stage*4,8,9,7.6,6.4);break;
   case'crystal':{const cy=P(['#123a52','#1f6e94','#3fb0d8','#9ae6f8','#e6fbff']);for(const[bx,h,w]of[[5,9,2],[8,12,2.5],[11,8,2]]){for(let Y=14-h;Y<15;Y++)for(let X=Math.round(bx-w);X<=Math.round(bx+w);X++){const t=(Y-(14-h))/h,ww=w*Math.min(1,t*2.2);if(Math.abs(X-bx)>ww)continue;put(X,Y,shade(cy,0.75-(X-bx)/w*0.3-t*0.3+dth(X,Y)))}}cracks(stage*2,8,10,5,5);break}
   case'coral':ell(8,10,6.5,4.6,P(['#4a1a2c','#8c3550','#c95f7c','#f29aae','#ffd2da']));dots(5,P(['#ffffff','#ffe0e8']),[4,7,8,5]);cracks(stage*2,8,10,6.5,4.6);break;
   case'poller':{const st=P(['#2a2e36','#4a505c','#7a828f','#b8c0cc','#eef2f6']);for(let Y=3;Y<15;Y++)for(let X=5;X<11;X++){let val=0.8-(X-5)/6*0.6+dth(X,Y);if(X===5||X===10)val-=0.25;put(X,Y,(Y===6||Y===7||Y===10||Y===11)?hex2rgb(Y<9?'#e8c21e':'#2f5fb3'):shade(st,val))}for(let X=6;X<10;X++)put(X,2,shade(st,0.9));for(let X=4;X<12;X++)put(X,14,shade(st,0.25));break}
   case'menhir':{const st=P(['#24262c','#3e424c','#5e6470','#8890a0','#b4bac6']);for(let Y=1;Y<15;Y++){const w=3.2+Math.sin(Y*0.5)*0.6+(Y>10?1:0);for(let X=Math.round(8-w);X<=Math.round(8+w);X++){let val=0.75-(X-8+w)/(2*w)*0.6+dth(X,Y)*1.2;if(Math.abs(X-8)>=w-0.6)val-=0.25;put(X,Y,shade(st,val))}}dots(4,P(['#5fa236','#3f7a2a']),[5,9,6,5]);break}
   case'pillar':for(let Y=2;Y<15;Y++)for(let X=4;X<12;X++){let val=0.75-(X-4)/8*0.55+dth(X,Y);if(Y<4)val+=0.15;if(X===4||X===11)val-=0.3;put(X,Y,shade(stone,val))}for(let X=3;X<13;X++){put(X,2,shade(stone,0.9));put(X,14,shade(stone,0.3))}cracks(stage*3,8,9,4,6);break;
   case'bush':blobs([[8,10,5],[5,8,3.5],[11,8,3.5],[8,6,3.5]],RGB.leaf);if(stage<2)dots(4-stage*2,P([v===0?'#ff7aa8':v===1?'#ffd23f':'#ffffff','#fff3a3']),[4,5,8,6]);break;
   case'flower':blobs([[8,12,5],[5,11,3],[11,11,3]],RGB.leaf);if(stage<2)dots(9-stage*4,P(['#ff5d8f','#ffd23f','#ffffff','#b48cff']),[3,8,10,6]);break;
   case'fern':{const fp=RGB.leafF;for(let f=0;f<5;f++){const a=-Math.PI/2+(f-2)*0.42,L=7-Math.abs(f-2);for(let t=0;t<=L;t++){const X=8+Math.cos(a)*t,Y=14+Math.sin(a)*t;put(X,Y,shade(fp,0.7-t/L*0.3));if(t>1&&t%2===0){put(X-1,Y,shade(fp,0.45));put(X+1,Y,shade(fp,0.55))}}}if(stage>0)dots(stage*3,P(['#5b4a1e']),[4,7,8,7]);break}
   case'reeds':{const st=P(['#2f5a1c','#4f8a2c','#7ab846']),top=P(['#3a2410','#6b4220']);for(let k2=0;k2<5-stage;k2++){const X=4+k2*2+(k2%2),h=8+Math.floor(rr()*4);for(let Y=15-h;Y<15;Y++)put(X,Y,shade(st,0.4+(Y%3)*0.2));put(X,15-h,top[1]);put(X,16-h,top[0]);put(X,17-h,top[1])}break}
   case'shrub':blobs([[8,11,4.5],[5,10,3],[11,10,3]],P(['#3a3a14','#5e5e22','#848436','#a8a24a']));dots(3,P(['#5a3a14']),[5,8,6,5]);break;
   case'stump':for(let Y=6;Y<15;Y++)for(let X=3;X<13;X++){const dx=(X-8)/5;if(Math.abs(dx)>1)continue;put(X,Y,shade(wood,0.5-dx*0.25+dth(X,Y)-(Math.abs(dx)>0.8?0.25:0)))}
     for(let Y=3;Y<9;Y++)for(let X=3;X<13;X++){const dx=(X-8)/5,dy=(Y-6)/2.6,q=dx*dx+dy*dy;if(q>1)continue;put(X,Y,shade(wood,q>0.7?0.55:(Math.round(Math.sqrt(q)*3)%2?0.8:0.95)))}cracks(stage*2,8,10,5,4);break;
   case'log':for(let Y=7;Y<14;Y++)for(let X=1;X<14;X++){const dy=(Y-10.5)/3.5;if(Math.abs(dy)>1)continue;put(X,Y,shade(wood,0.55-dy*0.3+dth(X,Y)-(Math.abs(dy)>0.75?0.25:0)))}
     for(let Y=7;Y<14;Y++)for(let X=12;X<16;X++){const dx=(X-13.5)/2.2,dy=(Y-10.5)/3.5,q=dx*dx+dy*dy;if(q>1)continue;put(X,Y,shade(wood,Math.round(Math.sqrt(q)*3)%2?0.75:0.95))}cracks(stage*2,7,10,6,3);break;
   case'drift':{const dw=P(['#5a5048','#8a7e70','#b8ac9a','#ddd3c2']);for(let X=1;X<15;X++){const Y0=10+Math.round(Math.sin(X*0.6)*1.2);for(let Y=Y0-1;Y<=Y0+1;Y++)put(X,Y,shade(dw,Y===Y0-1?0.85:Y===Y0?0.6:0.35))}for(let t=0;t<4;t++){put(5-t,9-t,dw[2]);put(11+t*0.5,9-t,dw[2])}cracks(stage*2,8,10,6,2);break}
   case'crate':for(let Y=4;Y<15;Y++)for(let X=3;X<14;X++){let val=0.6+dth(X,Y)-(X-3)/11*0.2;if(X===3||X===13||Y===4||Y===14)val=0.2;else if(Y===9||X===8)val=0.35;else if((X+Y)%4===0)val-=0.12;put(X,Y,shade(wood,val))}cracks(stage*3,8,9,5,5);break;
   default:ell(8,9,6,5,RGB.rock)}
  const src=new Uint8ClampedArray(d);for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){const o=(Y*W+X)*4;if(src[o+3])continue;const n=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const X2=X+a,Y2=Y+b;return X2>=0&&Y2>=0&&X2<W&&Y2<H&&src[(Y2*W+X2)*4+3]});if(n){d[o]=20;d[o+1]=22;d[o+2]=26;d[o+3]=255}}
  x.putImageData(id,0,0);OBSPR[k]=c;return c}
function drawSpecial(c,s,col,now){const P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};
  if(s.k==='vortex'){drawOrbit(c,s,col,now,s.r+8);drawOrbit(c,s,'#ffffff',now+400,s.r+3);P(s.x-4,s.y-4,8,8,'#14141f');P(s.x-3,s.y-3,6,6,col);P(s.x-1,s.y-1,2,2,'#ffffff');return}
  if(s.k==='fly'){const k=clamp(s.age/s.life,0,1),bl=Math.floor(now/90)%2;c.strokeStyle=bl?'#ff4d4d':'#ffffff';c.lineWidth=1;pxEl(c,Math.round(s.x),Math.round(s.y),s.r*(1.25-k*0.25),s.r*0.45*(1.25-k*0.25),0);
    if(k>0.3){c.fillStyle='#00000040';const r=4+k*10;pxEl(c,Math.round(s.x),Math.round(s.y),r,r*0.45,1)}return}
  if(s.k==='lob'){const k=lobU(s.age/s.life),h=Math.sin(k*Math.PI)*(s.h||54),x0=s.x0??s.x,y0=s.y0??s.y,tx=x0+s.vx*s.life,ty=y0+s.vy*s.life+12;
    c.strokeStyle=col+'90';c.lineWidth=1;pxEl(c,Math.round(tx),Math.round(ty),s.r*(0.5+k*0.5),s.r*0.4*(0.5+k*0.5),0);
    P(s.x-4,s.y+11,8,2,'#00000050');const Y=s.y-h;if(drawVis(c,Object.assign({},s,{y:Y,vy:s.vy-h}),col,now))return;P(s.x-5,Y-5,10,10,'#14141f');P(s.x-4,Y-4,8,8,col);P(s.x-4,Y-4,3,3,'#ffffffb0');return}
  if(s.k==='air'){const k=clamp(s.age/s.life,0,1),bl=Math.floor(now/90)%2;c.strokeStyle=bl?'#ff4d4d':'#ffffff';c.lineWidth=1;pxEl(c,Math.round(s.x),Math.round(s.y),s.r*(1.25-k*0.25),s.r*0.45*(1.25-k*0.25),0);
    P(s.x-1,s.y-6,2,12,bl?'#ff4d4d':'#ffffff');P(s.x-6,s.y-1,12,2,bl?'#ff4d4d':'#ffffff');
    {const r=3+k*8;c.fillStyle='#00000040';pxEl(c,Math.round(s.x),Math.round(s.y),r,r*0.45,1)}
    if(k>0.72){const q=(k-0.72)/0.28,Y=s.y-150*(1-q);c.globalAlpha=0.5;P(s.x-2,Y-40,4,40,col);c.globalAlpha=1;if(!drawVis(c,Object.assign({},s,{y:Y-6,vx:0,vy:1}),col,now)){P(s.x-6,Y-12,12,12,'#14141f');P(s.x-5,Y-11,10,10,col);P(s.x-5,Y-11,3,3,'#ffffffc0')}}return}
  const L=Math.hypot(s.vx,s.vy)||1,ux=s.vx/L,uy=s.vy/L;
  if(s.k==='beam'){if(!s.fired){const k=s.age/0.3;c.globalAlpha=0.35+0.4*Math.abs(Math.sin(now/40));for(let d=0;d<250;d+=6)P(s.x+ux*d-1,s.y+uy*d-1,2,2,col);c.globalAlpha=1;P(s.x-3-k*3,s.y-3-k*3,6+k*6,6+k*6,'#ffffff');return}
    const k=(s.age-0.3)/(s.life-0.3),w=Math.max(1,Math.round(7*(1-k)));c.save();c.lineCap='butt';c.strokeStyle='#14141f';c.lineWidth=w+4;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x+ux*s.len,s.y+uy*s.len);c.stroke();
    c.strokeStyle=col;c.lineWidth=w+2;c.stroke();c.strokeStyle='#ffffff';c.lineWidth=Math.max(1,w-2);c.stroke();c.restore();return}
  if(s.k==='breath'){c.globalAlpha=0.25;c.fillStyle=col;c.beginPath();const a=Math.atan2(uy,ux);c.moveTo(s.x,s.y);c.arc(s.x,s.y,82,a-0.5,a+0.5);c.closePath();c.fill();c.globalAlpha=1}}
function drawObs(c,o,now){const st=o.hp<o.max*0.34?2:o.hp<o.max*0.7?1:0;const s=obsSprite(o.kind,o.v,st);let sx=0;if(o.hitT&&now-o.hitT<160)sx=Math.round(Math.sin(now/18)*2);
  c.fillStyle='rgba(10,20,8,0.28)';pxEl(c,o.x,o.y+2,o.r+2,4,1);c.drawImage(s,Math.round(o.x-16+sx),Math.round(o.y-26),32,32);
  if(!o.ind&&(o.mat||o.kind)!=='plant'&&o.hp<o.max){c.fillStyle='#14141f';c.fillRect(Math.round(o.x-11),Math.round(o.y-30),22,4);c.fillStyle='#c9c9c9';c.fillRect(Math.round(o.x-10),Math.round(o.y-29),Math.round(20*o.hp/o.max),2)}}
function newBattle(o){try{if(typing())document.activeElement.blur()}catch(e){}
  B=Object.assign({shots:[],parts:[],nums:[],log:[],state:'fight',ptr:null,capCd:0,sid:0,vshots:[]},o);held.length=0;
  if(B.tb===undefined)B.tb=!!(RUN&&!RUN.free&&RUN.cfg&&RUN.cfg.tb);
  if(B.tb){B.me.x=ACX;B.me.y=YB;if(B.foe){B.foe.x=ACX;B.foe.y=YT}if(B.state==='fight'||B.state==='count')B.state='tbChoose';B.turn=1;B.tbActs={}}
  // obstacles (real-time only); a duel builds them from its shared id in the canonical view, the 'R' player sees them turned by 180°
  B.obs=B.tb?[]:genObs(B.mode==='duel'?hashStr(String(B.id)):Math.random()*4e9,B.zone||'arena').map(o=>flipOn()?Object.assign(o,{x:2*ACX-o.x,y:2*ACY-o.y}):o);pres({bt:B.mode==='wild'||B.mode==='trainer'?'wild':'duel'});
  const kind=B.legend?'legend':B.mode==='wild'?'wild':'trainer';const myB=B;
  const realState=B.state;B.state='intro';
  transition(kind,()=>{if(B!==myB)return;$('#battle').classList.add('on');buildBattleUI();const now=performance.now();B.enterT=now;B.log.forEach(m=>m.at=now);
    let vx=vsStart(now);B.enterT=now+vx;
    for(const F of[B.me,B.foe])if(F)F.spawnT=now+vx+(F===B.foe?150:450);
    if(B.mode==='wild'){const W=WI_MS;B.wi={t0:now,dur:W};vx=W+ENC_MS;B.enc={t0:now+W,dur:ENC_MS};B.enterT=now+W-600;B.foe.spawnT=0;B.me.spawnT=now+W+ENC_ME;B.losAt=now+W+ENC_ME-400;B.losTO=setTimeout(()=>{if(B===myB)say(`Los, ${SPECIES[act(B.me).s].n}!`)},W+ENC_ME-400)}
    // trainer battles: after the VS screen the trainer's monster is introduced full-screen, just like a wild one (10 s or tap)
    if(B.mode==='trainer'&&B.trainer){const W=WI_MS,st=vx;B.wi={t0:now+st,dur:W,mon:act(B.foe),title:`${B.trainer.n.toUpperCase()} SCHICKT …`};vx=st+W;B.enterT=now+vx;for(const F of[B.me,B.foe])if(F)F.spawnT=now+vx+(F===B.foe?150:450)}
    // own monster is only sent out once the player has picked it (when there is a choice)
    const pickLead=!B.tb&&B.mode!=='duel'&&(realState==='fight'||realState==='count')&&B.me.team.filter(m=>m.hp>0).length>1;if(pickLead){B.me.spawnT=Infinity;if(B.losTO){clearTimeout(B.losTO);B.losTO=null}}
    const introMs=(B.mode==='wild'?0:1000)+vx;
    // every real-time battle starts with a 3-2-1 countdown (the lead can be changed meanwhile)
    B.introAt=performance.now()+introMs;const go=()=>{if(B===myB&&B.state==='intro'){if(!B.tb&&(realState==='fight'||realState==='count')){B.state='count';B.cntEnd=performance.now()+3000;if(B.mode!=='duel'&&B.me.team.filter(m=>m.hp>0).length>1)B.leadWait=true}else B.state=realState}};B.introGo=go;B.introTO=setTimeout(go,introMs)},undefined,350);
}
function closeBattle(){const myB=B;if(!myB)return;myB.closing=true;if(CQ){CQ.done=true;CQ=null}$('#cquiz').classList.remove('on','lite');$('#bpick').classList.remove('on');transition('fade',()=>{if(B===myB)B=null;placeDpad();$('#battle').classList.remove('on');$('#stage').style.transform='';pres({bt:null,du:null,ld:leadInfo(),lf:folInfo()});renderTeam();updateHud()},300,350)}
function fire(F,i,remote){
  const bt=act(F);const mid=bt.m[i];if(!mid||F.cd[i]>0||F.faint>0||F.out||F.st.stun>0||F.st.sleep>0||F.hitstun>0||airBusy(F)||F.rq)return;
  const cost=apCost(mid);if(F.ctrl!=='remote'){if((F.ap??AP_MAX)<cost){if(F===B.me){F.apShake=performance.now();const n=performance.now();if(!B.apMsgT||n-B.apMsgT>1200){B.apMsgT=n;say('Nicht genug AP!')}}return}F.ap=(F.ap??AP_MAX)-cost}
  const T=F===B.me?B.foe:B.me;F.cd[i]=cdOf(mid)*(F.ctrl==='ai'?1.35:1);seenMove(mid);
  const mvv=MOVES[mid];if(mvv.k==='self'){selfMove(F,mvv);return}F.atkT=performance.now();
  if(mvv.fx==='selfbuff'&&F.ctrl!=='remote'&&Math.random()<(mvv.stc??1))applyStages(F,mvv.bs);const am=stageMul(stgOf(F).a);
  let dx=T.x-F.x,dy=T.y-F.y;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;
  if(F.ctrl==='ai'&&!B.tb&&F.aimAng!=null&&isFinite(F.aimAng)){dx=Math.cos(F.aimAng);dy=Math.sin(F.aimAng)}
  if(F===B.me&&!B.tb){const a=myAim();dx=a.x;dy=a.y;try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}}
  if(F.st.conf>0&&!B.tb){const w=(Math.random()-0.5)*1.4,c=Math.cos(w),sn=Math.sin(w);[dx,dy]=[dx*c-dy*sn,dx*sn+dy*c]}
  if(!B.tb&&mvv.k!=='melee'){const w=(Math.random()-0.5)*2*aimSpread(F),c=Math.cos(w),sn=Math.sin(w);[dx,dy]=[dx*c-dy*sn,dx*sn+dy*c]}F.face=dx<0?-1:1;
  const sp=shotParams(mid);
  if(sp.combo>1&&!B.tb){const ci=MOVES[mid].ci||0.17;F.rq={mid,left:sp.combo-1,t:ci,int:ci,mel:1}}
  if(sp.rapid){F.rq={mid,left:sp.rapid,t:0,int:sp.int};return}
  if(sp.dive){F.st.dive=sp.dive;F.inv=Math.max(F.inv,sp.dive+0.05);F.diveMid=mid;burst(F.x,F.y-6,'#8fc8f0',14);return}
  if(sp.nm){const D=Math.max(30,Math.hypot(T.x-F.x,T.y-F.y));let sx=F.x+dx*8,sy=F.y-10+dy*6,vx=dx*sp.sp,vy=dy*sp.sp;
    const pts=[];
    if(sp.k==='air'||sp.k==='fly'){const Dd=sp.k==='fly'?Math.max(24,D-18):D;sx=clamp(F.x+dx*Dd,AX0,AX1);sy=clamp(F.y+dy*Dd,AY0,AY1);vx=vy=0;F.castT=performance.now();
      if(sp.rain){for(let q=0;q<sp.rain;q++){const a=Math.random()*6.28,r=q?10+Math.random()*24:0;pts.push([clamp(sx+Math.cos(a)*r,AX0,AX1),clamp(sy+Math.sin(a)*r*0.6,AY0,AY1),0,0,sp.life+q*0.13])}}
      if(sp.k==='fly'){F.st.fly=sp.life;F.inv=Math.max(F.inv,sp.life+0.05);F.flyT0=performance.now();F.flyDur=sp.life;F.rq=null}}
    else if(sp.k==='lob'){const angs=sp.n===3?[-sp.ang,0,sp.ang]:[0];for(const a of angs){const c=Math.cos(a),s2=Math.sin(a),ex=dx*c-dy*s2,ey=dx*s2+dy*c,tx=F.x+ex*D,ty=F.y+ey*D;sx=F.x;sy=F.y-12;pts.push([sx,sy,(tx-sx)/sp.life,(ty-12-sy)/sp.life,sp.life])}}
    if(!pts.length)pts.push([sx,sy,vx,vy,sp.life]);
    for(const[px,py,pvx,pvy,pl]of pts){const sh={id:F.side+(++B.sid)+'_'+Math.floor(Math.random()*1e6),side:F.side,att:Object.assign({},bt),mid,x:px,y:py,vx:pvx,vy:pvy,age:0,life:pl,r:sp.r,p:sp.p,k:sp.k,h:sp.h,nm:1,am};
      B.shots.push(sh);if(B.mode==='duel'&&F===B.me)B.mySh.push([sh.id,F.a,mid,Math.round(px),Math.round(py),Math.round(pvx),Math.round(pvy),Math.round(performance.now())])}
    if(B.mode==='duel'&&F===B.me){B.mySh=B.mySh.slice(-9);publishDuel(true)}return}
  const angs=sp.n===3?[-sp.ang,0,sp.ang]:[0];
  for(const a of angs){const c=Math.cos(a),s=Math.sin(a);const vx=(dx*c-dy*s)*sp.sp,vy=(dx*s+dy*c)*sp.sp;
    const sh={id:F.side+(++B.sid)+'_'+Math.floor(Math.random()*1e6),side:F.side,att:Object.assign({},bt),mid,x:F.x+dx*8,y:F.y-10+dy*6,vx,vy,age:0,life:sp.life,r:sp.r,p:sp.p,mel:sp.mel,wave:sp.wave,am};
    B.shots.push(sh);if(B.mode==='duel'&&F===B.me)B.mySh.push([sh.id,F.a,mid,Math.round(sh.x),Math.round(sh.y),Math.round(vx),Math.round(vy),Math.round(performance.now())])}
  if(B.mode==='duel'&&F===B.me){B.mySh=B.mySh.slice(-9);publishDuel(true)}
}
function startBreak(F){const now=performance.now();const alive=F.team.filter((m,i)=>i!==F.a&&m.hp>0).length;
  const myAlive=B.me.team.filter(m=>m.hp>0).length;B.state='break';B.brk={F,t0:now,me:F===B.me,choice:null,mine:null,end:now+(F===B.me&&alive>1?4500:F!==B.me&&myAlive>1&&!B.tb?3800:2300)};B.shots=[];B.aimDrag=0;
  for(const X of[B.me,B.foe])if(X){X.vx=X.vy=0;X.dashT=0}
  say(F===B.me?(alive>1?'Runde pausiert — wähle dein nächstes Monster!':'Runde pausiert — nächstes Monster!'):`Runde pausiert — ${B.mode==='wild'?'der Gegner':B.oppName||'der Gegner'} schickt das nächste Monster…`)}
function breakUpdate(now,dt){const k=B.brk,F=k.F;F.faint=Math.max(0.01,F.faint-dt*0.5);
  if(B.mode!=='duel'&&!B.tb){const myAlive=B.me.team.filter(m=>m.hp>0).length;if(k.me&&myAlive>1&&k.choice==null&&now-k.t0>1200)k.end=now+500;if(!k.me&&myAlive>1&&k.mine==null&&now-k.t0>1200)k.end=now+500}
  if(now<k.end)return;
  if(F.ctrl==='remote'&&act(F).hp<=0){if(now-k.t0<9000)return}  // wait until the other player has sent his next monster
  if(F.ctrl!=='remote'&&act(F).hp<=0){let idx=k.choice;if(idx==null||!F.team[idx]||F.team[idx].hp<=0)idx=nextAlive(F);if(idx<0){F.out=true;B.state='fight';B.brk=null;return}
    F.a=idx;F.spawnT=now+(F===B.me?480:0);F.cd=[0.3,0.3,0.3,0.3];say(`${F===B.me?'Los,':'Gegner schickt'} ${SPECIES[act(F).s].n}!`)}
  if(!k.me&&k.mine!=null&&k.mine!==B.me.a&&B.me.team[k.mine]&&B.me.team[k.mine].hp>0){B.me.a=k.mine;B.me.spawnT=now+480;B.me.cd=[0.3,0.3,0.3,0.3];say(`Zurück! Los, ${SPECIES[act(B.me).s].n}!`)}
  F.faint=0;F.st={burn:0,slow:0,stun:0,sleep:0,conf:0,shield:0,haste:0};for(const X of[B.me,B.foe])if(X)X.stg={a:0,d:0,s:0};
  B.me.x=ACX;B.me.y=YB;if(B.foe){B.foe.x=ACX;B.foe.y=YT}for(const X of[B.me,B.foe])if(X){X.vx=X.vy=0;X.ap=AP_MAX;X.inv=1}B.aimV=null;B.enterT=now;
  B.brk=null;B.state='count';B.cntEnd=now+1600;if(B.mode==='duel')publishDuel(true)}
function nextAlive(F){const n=F.team.findIndex((m,i)=>i!==F.a&&m.hp>0);return n}
function doSwitch(F,idx){F.a=idx;F.stg={a:0,d:0,s:0};F.spawnT=performance.now()+(F===B.me?480:0);if(F!==B.me)burst(F.x,F.y-14,'#ffffff',12);F.swCd=1.6;F.inv=0.7;F.cd=[0.3,0.3,0.3,0.3];say(`${F===B.me?'Los,':'Gegner schickt'} ${SPECIES[act(F).s].n}!`);if(B.mode==='duel'&&F===B.me)publishDuel(true)}
function selfMove(F,mv){const m=act(F);F.castT=performance.now();
  if(mv.fx==='heal'){const h=Math.round(m.mhp*0.3);m.hp=Math.min(m.mhp,m.hp+h);B.nums.push({x:F.x,y:F.y-34,t:'+'+h,c:'#3ddc6b',at:performance.now()});burst(F.x,F.y-14,'#3ddc6b',14)}
  else if(mv.fx==='shield'){F.st.shield=3.5;burst(F.x,F.y-14,'#9fd2ff',14)}
  else if(mv.fx==='haste'){F.st.haste=3.5;burst(F.x,F.y-14,'#ffffff',12)}
  else if(mv.fx==='buff'){applyStages(F,mv.bs)}
  say(`${SPECIES[m.s].n} setzt ${mv.n} ein!`);if(B.mode==='duel'&&F===B.me)publishDuel(true)}
// apply damage to a fighter this client is authoritative for
function dealDamage(T,d,col,text){const def=act(T);if(def.hp<=0)return;def.hp=Math.max(0,def.hp-d);
  if(def.hp<=0&&!T.team.some(m=>m.hp>0)){B.slowUntil=performance.now()+700;B.shakeUntil=performance.now()+350}
  B.nums.push({x:T.x+(Math.random()*8-4),y:T.y-34,t:text||'-'+d,c:col||'#ffffff',at:performance.now()});
  if(def.hp<=0){T.faint=0.9;T.st={burn:0,slow:0,stun:0,sleep:0,conf:0,shield:0,haste:0,fly:0,dive:0};if(!(B.legend&&T===B.foe&&typeof FEM!=='undefined'&&FEM.includes(B.legend)))say(`${SPECIES[def.s].n} ist besiegt!`);if(B.mode==='wild'&&T===B.foe)wildWin();else if(B.mode==='trainer'&&T===B.foe)trainerKO(def)}
  if(B.mode==='duel'&&T===B.me)publishDuel(true)}
function hitLocal(T,s){
  const def=act(T);const r=calcDmg(s.att,def,s.mid,s.p);let d=r.d;if(d>0)d=Math.max(1,Math.round(d*(s.am||1)/stageMul(stgOf(T).d)));if(T.st.shield>0&&d>0)d=Math.max(1,Math.round(d*0.5));
  const mv=s.wv?{...(MOVES[s.mid]||MOVES.bump),fx:null}:MOVES[s.mid]||MOVES.bump;
  T.flash=0.25;T.hurtT=performance.now();T.hitstun=0.14;T.inv=Math.max(T.inv,mv.combo?0.06:0.12);const L=Math.hypot(s.vx,s.vy)||1,kb=s.kb!=null?s.kb:mv.fx==='knock'?16:mv.combo?2:5;T.x+=s.vx/L*kb;T.y+=s.vy/L*kb*0.8;arenaClamp(T);
  if(r.e>1)say('Sehr effektiv!');else if(r.e===0)say('Das hatte keine Wirkung…');
  if(d>0&&mv.fx==='burn'&&Math.random()<0.35&&SPECIES[def.s].t!=='fire'){T.st.burn=3;say(`${SPECIES[def.s].n} wurde verbrannt!`)}
  if(d>0&&mv.fx==='slow'){T.st.slow=2.2}
  if(r.e>0&&mv.fx==='debuff'){const n_=performance.now();if(!(T.dbk===s.mid&&n_-T.dbt<600)){T.dbk=s.mid;T.dbt=n_;if(Math.random()<(mv.stc??1))applyStages(T,mv.bs)}}
  if(d>0&&T.st.sleep>0&&mv.fx!=='sleep'){T.st.sleep=0;say(`${SPECIES[def.s].n} ist aufgewacht!`)}
  if(d>0&&mv.fx==='stun'&&T.st.stun<=0){T.st.stun=mv.k==='big'?1:0.6;say(`${SPECIES[def.s].n} ist betäubt!`)}
  if(d>0&&mv.fx==='sleep'&&T.st.sleep<=0&&Math.random()<0.6){T.st.sleep=2.4;say(`${SPECIES[def.s].n} schläft ein!`)}
  if(d>0&&mv.fx==='conf'&&T.st.conf<=0&&Math.random()<0.6){T.st.conf=3;say(`${SPECIES[def.s].n} ist verwirrt!`)}
  dealDamage(T,d,r.e>1?'#ffcb3d':r.e<1?'#c0c4d6':'#ffffff',d?'-'+d:'0');return d;
}
// attacks from above (fly, sky/air strikes): the impact hits as before and pushes outward; around it a small shockwave
// ring hits for ~60 % damage with a push back (no status effects)
function impactWave(s,T,x,y){const W=s.r+18;(B.rings=B.rings||[]).push({x,y,t0:performance.now(),r0:s.r*0.6,r1:W,col:TYPES[MOVES[s.mid].t].c});
  if(T.inv>0||airBusy(T))return;const dx=T.x-x,dy=(T.y-y)*1.3,D=Math.hypot(dx,dy),ux=D>0.5?dx/D:0,uy=D>0.5?dy/D:1;
  if(D<s.r+9){shotHit(Object.assign({},s,{vx:ux*100,vy:uy*100,kb:9}),T);return}
  if(D<W+9)shotHit(Object.assign({},s,{p:Math.max(1,Math.round(s.p*0.6)),vx:ux*100,vy:uy*100,kb:16,wv:1}),T)}
function drawRings(c,now){if(!B||!B.rings||!B.rings.length)return;B.rings=B.rings.filter(g=>now-g.t0<320);for(const g of B.rings){const k=(now-g.t0)/320,r=g.r0+(g.r1-g.r0)*k;
  c.globalAlpha=0.85*(1-k);c.strokeStyle='#ffffff';pxEl(c,g.x,g.y,r,r*0.45,0);c.strokeStyle=g.col;pxEl(c,g.x,g.y,r-1,r*0.45-1,0);c.globalAlpha=1}}
function shotHit(s,T){burst(s.x,s.y,TYPES[MOVES[s.mid].t].c,7);effLabel(s,T);
  if(B.mode!=='duel'||T===B.me){const d=hitLocal(T,s);drainHeal(s,d)}
  else if(MOVES[s.mid].fx==='drain'){drainHeal(s,calcDmg(s.att,act(T),s.mid,s.p).d)}}
// effectiveness of the player's own attacks, shown right at the target
function effLabel(s,T){if(!B.me||s.side!==B.me.side)return;const e=eff(MOVES[s.mid].t,SPECIES[act(T).s].t);if(e===1)return;const now=performance.now();if(T.effT&&now-T.effT<350)return;T.effT=now;
  B.nums.push({x:T.x,y:T.y-50,t:e===0?'KEINE WIRKUNG':e>1?'SEHR EFFEKTIV!':'WENIG EFFEKTIV',c:e>1?'#ffcb3d':'#9aa1bd',at:now,sz:9,life:1100})}
function specialShot(s,dt){const T=s.side===B.me.side?B.foe:B.me,alive=T&&!T.out&&T.faint<=0,mv=MOVES[s.mid],col=TYPES[mv.t].c;s.age+=dt;
  if(s.k==='vortex'){vortexShot(s,dt,T,alive);return}
  if(s.k==='lob'){if(s.x0==null){s.x0=s.x;s.y0=s.y}const u=lobU(s.age/s.life);s.x=s.x0+s.vx*s.life*u;s.y=s.y0+s.vy*s.life*u;if(s.age<s.life)return;s.dead=1;burst(s.x,s.y+12,col,16);burst(s.x,s.y+12,'#ffffff',6);B.shakeUntil=performance.now()+120;
    for(const o of B.obs||[])if(!o.dead&&Math.hypot(o.x-s.x,(o.y-(s.y+12))*1.3)<s.r+o.r)hitObs(o,s);
    if(alive&&T.inv<=0&&!airBusy(T)&&Math.hypot(T.x-s.x,(T.y-(s.y+12))*1.3)<s.r+9)shotHit(s,T);leaveHazard(s,s.x,s.y+12);return}
  if(s.k==='fly'){const A=sideF(s.side);if(!s.started){s.started=1;if(A&&A.ctrl==='remote'){A.flyT0=performance.now()-s.age*1000;A.flyDur=s.life}}
    if(A&&A.ctrl!=='remote'&&s.age>=s.life*0.78&&!s.moved){s.moved=1;A.x=s.x;A.y=s.y+0.1;arenaClamp(A)}
    if(s.age<s.life)return;s.dead=1;burst(s.x,s.y-4,col,18);burst(s.x,s.y-4,'#ffffff',12);B.shakeUntil=performance.now()+180;
    for(const o of B.obs||[])if(!o.dead&&Math.hypot(o.x-s.x,(o.y-s.y)*1.3)<s.r+o.r)hitObs(o,s);
    if(alive)impactWave(s,T,s.x,s.y);return}
  if(s.k==='air'){if(s.age<s.life){if(s.age>s.life-0.18&&!s.fall){s.fall=1}return}s.dead=1;burst(s.x,s.y-4,col,22);burst(s.x,s.y-4,'#ffffff',10);B.shakeUntil=performance.now()+200;
    for(const o of B.obs||[])if(!o.dead&&Math.hypot(o.x-s.x,(o.y-s.y)*1.3)<s.r+o.r)hitObs(o,s);
    if(alive){if(s.r>=18)impactWave(s,T,s.x,s.y);else if(T.inv<=0&&!airBusy(T)&&Math.hypot(T.x-s.x,(T.y-s.y)*1.3)<s.r+9)shotHit(s,T)}leaveHazard(s,s.x,s.y);return}
  const L=Math.hypot(s.vx,s.vy)||1,ux=s.vx/L,uy=s.vy/L;
  if(s.k==='beam'){if(s.age>=s.life){s.dead=1;return}if(s.age<0.3||s.fired)return;s.fired=1;let len=250,hitO=null;
    for(const o of B.obs||[]){if(o.dead)continue;const ox=o.x-s.x,oy=(o.y-8)-s.y,t=ox*ux+oy*uy;if(t<0||t>len)continue;if(Math.hypot(ox-ux*t,oy-uy*t)<o.r){len=t;hitO=o}}
    s.len=len;if(hitO)hitObs(hitO,s);
    if(alive&&T.inv<=0){const tx=T.x-s.x,ty=(T.y-12)-s.y,t=tx*ux+ty*uy;if(t>0&&t<len+6&&Math.hypot(tx-ux*t,ty-uy*t)<s.r+9){s.len=Math.min(len,t);shotHit(Object.assign({},s,{x:T.x,y:T.y-12}),T)}}
    burst(s.x+ux*s.len,s.y+uy*s.len,col,10);return}
  if(s.k==='breath'){if(s.age>=s.life){s.dead=1;return}
    for(let i=0;i<3;i++){const a=Math.atan2(uy,ux)+(Math.random()-0.5)*0.9,v=150+Math.random()*60;B.parts.push({x:s.x,y:s.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0.42+Math.random()*0.12,age:0,c:Math.random()<0.4?'#ffffff':col})}
    const tick=Math.floor(s.age/(s.life/3));if(tick===s.tk)return;s.tk=tick;
    const inCone=(x,y,rad)=>{const dx=x-s.x,dy=y-s.y,d=Math.hypot(dx,dy);if(d>82+rad)return false;return d<rad+6||Math.acos(clamp((dx*ux+dy*uy)/(d||1),-1,1))<0.5};
    for(const o of B.obs||[])if(!o.dead&&inCone(o.x,o.y-8,o.r))hitObs(o,s);
    if(alive&&inCone(T.x,T.y-12,9))shotHit(Object.assign({},s,{x:T.x,y:T.y-12}),T)}}
function drainHeal(s,d){if(MOVES[s.mid].fx!=='drain'||!d)return;const A=s.side===B.me.side?B.me:B.foe;if(!A||A.ctrl==='remote')return;const m=act(A);if(m.hp<=0)return;const h=Math.max(1,Math.round(d*0.5));m.hp=Math.min(m.mhp,m.hp+h);B.nums.push({x:A.x,y:A.y-34,t:'+'+h,c:'#3ddc6b',at:performance.now()});if(B.mode==='duel'&&A===B.me)publishDuel(true)}
function burst(x,y,col,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=30+Math.random()*60;B.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.35+Math.random()*0.25,age:0,c:col})}}
// manual aiming (no auto-aim): arrow keys on PC, drag on an attack button on phones; the direction is kept until changed
// auto-aim: leads the target (intercept with the real projectile speed and the target's smoothed velocity)
function autoAimTarget(){const T=B.foe,M=B.me;const dx0=T.x-M.x,dy0=(T.y-12)-(M.y-14);const tv=B.tv||{x:0,y:0};
  const ms=act(M)?act(M).m.map(m=>shotParams(m)).filter(p=>p&&!p.mel&&!p.self&&!p.nm&&p.sp):[];const v=ms.length?ms.reduce((a,p)=>a+p.sp,0)/ms.length:260;
  const a=tv.x*tv.x+tv.y*tv.y-v*v,b=2*(dx0*tv.x+dy0*tv.y),c=dx0*dx0+dy0*dy0;let t=0;
  if(Math.abs(a)<1e-6)t=b?-c/b:0;else{const D=b*b-4*a*c;if(D>=0){const r1=(-b-Math.sqrt(D))/(2*a),r2=(-b+Math.sqrt(D))/(2*a);t=Math.min(...[r1,r2].filter(x=>x>0),9)}}
  // lead grows with Zielsicher: low = no lead at all, high = a slight lead (minimal, not the full intercept)
  const z=zielOf(act(M))/10;t=clamp(isFinite(t)?t:0,0,0.8)*(z*z*0.45);return Math.atan2(dy0+tv.y*t,dx0+tv.x*t)}
function myAim(){if(autoAimOn()&&B.foe){if(B.autoAng==null||!isFinite(B.autoAng)){B.autoAng=autoAimTarget();B.autoW=0}return{x:Math.cos(B.autoAng),y:Math.sin(B.autoAng)}}if(!B.aimV){const T=B.foe;setAim(T?T.x-B.me.x:0,T?T.y-B.me.y:-1)}return B.aimV}
// aiming mode (lobby option / setting for free play): 0 = manual in 8 directions, 2 = free 360°, 1 = auto-aim
function aimMode(){const c=RUN&&RUN.cfg;if(RUN&&!RUN.free&&c)return[0,1,2].includes(c.aim)?c.aim:0;return SET.aim==='1'?1:SET.aim==='2'?2:0}
function autoAimOn(){return aimMode()===1}
function setAim(x,y){if(Math.hypot(x,y)<0.001)return;let a=Math.atan2(y,x);if(aimMode()===0)a=Math.round(a/(Math.PI/4))*(Math.PI/4);B.aimV={x:Math.cos(a),y:Math.sin(a)}}
function controlMe(dt){
  if(autoAimOn()&&B.foe&&!B.tb){const T=B.foe,k=1-Math.exp(-dt*6);B.tv=B.tv||{x:0,y:0};B.tv.x+=((T.vx||0)-B.tv.x)*k;B.tv.y+=((T.vy||0)-B.tv.y)*k;
    // aim inertia: the crosshair follows like a damped spring (lags behind quick direction changes)
    const want=autoAimTarget();if(B.autoAng==null){B.autoAng=want;B.autoW=0}let d=want-B.autoAng;d=Math.atan2(Math.sin(d),Math.cos(d));
    // spring stiffness from Zielsicher: high = locked on almost instantly, low = trails behind
    const z=zielOf(act(B.me))/10,K=6+150*z*z,Dm=2*Math.sqrt(K)*0.9,wm=1.5+9*z;const w0=isFinite(B.autoW)?B.autoW:0;B.autoW=clamp(w0+(d*K-w0*Dm)*dt,-wm,wm);if(!isFinite(B.autoAng))B.autoAng=want;B.autoAng+=B.autoW*dt;if(!isFinite(B.autoAng))B.autoAng=want}
  if(aimHeld.length&&!B.tb){let ax=0,ay=0;for(const d of aimHeld){ax+=DIRS[d][0];ay+=DIRS[d][1]}if(ax||ay)setAim(ax,ay)}
  const F=B.me;if(F.out||F.faint>0||F.st.stun>0||F.st.sleep>0||F.hitstun>0||B.aim||B.qsel){F.vx=F.vy=0;return}
  let dx=0,dy=0,sc=1;for(const d of held){dx+=DIRS[d][0];dy+=DIRS[d][1]}
  if(JOY.active&&!dx&&!dy){const m=Math.hypot(JOY.x,JOY.y);if(m>0.18){dx=JOY.x;dy=JOY.y;sc=clamp((m-0.18)/0.55,0.3,1)}}
  if(B.ptr&&!dx&&!dy){const ex=B.ptr.x-F.x,ey=B.ptr.y-F.y;if(Math.hypot(ex,ey)>3){dx=ex;dy=ey}}
  if(F.st.conf>0){dx=-dx;dy=-dy}
  const L=Math.hypot(dx,dy);if(L){dx/=L;dy/=L;F.ddx=dx;F.ddy=dy}
  move(F,dx*sc,dy*sc,dt);
}
function move(F,dx,dy,dt){if(F.st&&F.st.fly>0)return;
  // slight inertia: velocity eases toward the input instead of jumping (dash stays instant)
  // (post-dash freeze removed in v0.70)
  if(dx||dy||F.dashT>0)F.mvT=performance.now();
  if(F.dashT>0){F.x+=F.ddx*265*dt;F.y+=F.ddy*265*dt;F.vx=F.ddx*fspeed(F);F.vy=F.ddy*fspeed(F)}else{const sp=fspeed(F),k=Math.min(1,dt*((F.slip||0)>0?1.2:7.5));F.vx=(F.vx||0)+(dx*sp-(F.vx||0))*k;F.vy=(F.vy||0)+(dy*sp-(F.vy||0))*k;F.x+=F.vx*dt;F.y+=F.vy*dt}
  obsPush(F);arenaClamp(F);
  const T=F===B.me?B.foe:B.me;if(T)F.face=T.x<F.x?-1:1;
}
function aiUpdate(F,dt){
  const T=B.me;if(F.out||F.faint>0||F.st.stun>0||F.st.sleep>0||F.hitstun>0||F.st.fly>0)return;
  if(F.st.conf>0){F.cw=(F.cw||0)-dt;if(F.cw<=0){F.cw=0.35;F.cdx=Math.random()*2-1;F.cdy=Math.random()*2-1}move(F,F.cdx||0,F.cdy||0,dt);return}
  F.think-=dt;
  const dx=T.x-F.x,dy=T.y-F.y,d=Math.hypot(dx,dy)||1;
  if(F.think<=0){F.think=0.3+Math.random()*0.35;
    const melee=act(F).m.some(m=>MOVES[m].k==='melee')&&Math.random()<0.3;const want=melee?18:100+Math.random()*60;
    const rad=Math.abs(d-want)>12?Math.sign(d-want):0;const perp=Math.random()<0.5?1:-1;
    F.mvx=dx/d*rad+(-dy/d)*perp*0.8;F.mvy=dy/d*rad+(dx/d)*perp*0.8;const L=Math.hypot(F.mvx,F.mvy)||1;F.mvx/=L;F.mvy/=L;
    if(Math.random()<0.7&&aiMayFire()){const m=act(F);const ready=[0,1,2,3].filter(i=>{const mv=m.m[i]&&MOVES[m.m[i]];if(!mv||F.cd[i]>0||(F.ap??AP_MAX)<apCost(m.m[i]))return false;if(mv.k==='self')return mv.fx==='heal'?m.hp<m.mhp*0.45:Math.random()<0.4;return mv.k!=='melee'||d<34});if(ready.length)fire(F,ready[Math.floor(Math.random()*ready.length)])}
    if(B.mode==='ai'&&act(F).hp<act(F).mhp*0.2&&F.swCd<=0&&Math.random()<0.25){const n=F.team.findIndex((m,i)=>i!==F.a&&m.hp>act(F).hp*2);if(n>=0)doSwitch(F,n)}}
  if(F.dashCd<=0&&(F.ap??AP_MAX)>=DASH_AP)for(const s of B.shots)if(s.side!==F.side&&!s.cap&&Math.hypot(s.x-F.x,s.y-F.y+10)<30&&Math.random()<0.06){F.ap=(F.ap??AP_MAX)-DASH_AP;F.noRegen=3;F.dashT=0.14;F.dashCd=1.6;F.inv=0.24;F.pdz=0.14+0.5;F.ddx=-s.vy/(Math.hypot(s.vx,s.vy)||1);F.ddy=s.vx/(Math.hypot(s.vx,s.vy)||1);break}
  move(F,F.mvx,F.mvy,dt);
}
function bUpdate(dt){if(dt>0)B.fps=B.fps?B.fps*0.95+(1/dt)*0.05:1/dt;
  if(B.frozen)return;
  const now=performance.now();if(B.slowUntil&&now<B.slowUntil)dt*=0.3;
  for(const F of[B.me,B.foe]){if(!F)continue;F.cd=F.cd.map(v=>Math.max(0,v-dt));F.dashT=Math.max(0,F.dashT-dt);F.dashCd=Math.max(0,F.dashCd-dt);F.pdz=Math.max(0,(F.pdz||0)-dt);F.hitstun=Math.max(0,(F.hitstun||0)-dt);F.inv=Math.max(0,F.inv-dt);F.swCd=Math.max(0,F.swCd-dt);F.flash=Math.max(0,F.flash-dt)}
  B.capCd=Math.max(0,B.capCd-dt);
  if(B.state==='fight'&&!B.tb)for(const F of[B.me,B.foe])if(F&&F.ctrl!=='remote'){const sp=Math.hypot(F.vx||0,F.vy||0);if(sp<6&&!(F.dashT>0))F.stillT=(F.stillT||0)+dt;else F.stillT=0;
    // standing still: after 0.6 s the regeneration ramps up to 3× within ~1.3 s
    if(F.noRegen>0){F.noRegen-=dt;F.stillT=0;F.apMul=0;continue}const mul=F.stillT<0.6?1:1+Math.min(2,(F.stillT-0.6)*1.5);F.apMul=mul;F.ap=Math.min(AP_MAX,(F.ap??AP_MAX)+AP_REGEN*mul*dt)}
  if(B.state==='fight')for(const F of[B.me,B.foe]){if(!F||!F.st)continue;for(const k in F.st)F.st[k]=Math.max(0,F.st[k]-dt);
    if(F.st.burn>0&&F.ctrl!=='remote'&&act(F).hp>0){F.burnT+=dt;if(F.burnT>=0.5){F.burnT=0;dealDamage(F,Math.max(1,Math.round(act(F).mhp*0.03)),'#ff8a3d')}if(Math.random()<0.3)B.parts.push({x:F.x+(Math.random()*16-8),y:F.y-20,vx:0,vy:-20,life:0.4,age:0,c:'#ff8a3d'})}}
  if(B.state!=='fight')for(const F of[B.me,B.foe])if(F&&F.faint>0&&act(F).hp<=0)F.faint=Math.max(0,F.faint-dt);
  hazardTick(dt);
  for(const p of B.parts){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.conf){p.vx+=Math.sin(p.age*6+p.y)*4*dt}else{p.vx*=0.9;p.vy*=0.9}}B.parts=B.parts.filter(p=>p.age<p.life);
  B.nums=B.nums.filter(n=>now-n.at<(n.life||900));
  if(B.closing)return;
  if(B.mode==='duel')duelSync(dt);
  if(B.state==='intro'){return}
  if(B.tb){tbUpdate(dt,now);return}
  if(B.state==='flee'){fleeUpdate(dt);return}
  if(B.state==='count'){if(B.leadWait){B.cntEnd=now+3000;return}if(now>=B.cntEnd){B.state='fight';B.leadDone=1;say('KAMPF!')}return}
  if(B.state==='break'){breakUpdate(now,dt);return}
  if(B.state==='catch'){catchUpdate(now);return}
  if(B.state!=='fight')return;
  controlMe(dt);
  if(B.foe.ctrl==='ai')aiUpdate(B.foe,dt);
  // fainting -> next monster (only for fighters this client is authoritative for)
  // a monster faints but its trainer has more → the round pauses (faint animation, next pick), then both restart from their start spots
  for(const F of[B.me,B.foe]){if(!F||F.faint<=0||act(F).hp>0)continue;if(B.mode==='wild'&&F===B.foe)continue;
    if(F.team.some((m,i)=>i!==F.a&&m.hp>0)){startBreak(F);return}
    if(F.ctrl==='remote')continue;F.faint-=dt;if(F.faint<=0)F.out=true}
  // shots
  for(const s of B.shots){if(s.nm){specialShot(s,dt);continue}s.age+=dt;homeShot(s,dt);s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.wave){const sf=s.mid==='surf';s.r=Math.min(sf?82:46,(sf?10:6)+s.age*(sf?52:34));if(sf&&Math.random()<dt*2.2)leaveHazard(s,s.x,s.y+8)}if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;if(s.cap)say('Verfehlt!');else if(!s.mel&&!outArena(s.x,s.y+10))leaveHazard(s,s.x,s.y+8);continue}
    if(!s.cap&&s.mid!=='surf'&&shotVsObs(s))continue;
    const T=s.side===B.me.side?B.foe:B.me;if(!T||T.out||T.faint>0)continue;
    if(Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){
      if(s.cap){s.dead=1;if(B.mode==='wild')startCatch(throwBonus());continue}
      if(T.inv>0)continue;
      s.dead=1;shotHit(s,T)}}
  // opposing projectiles that meet cancel each other out (melee hits and capsules are unaffected)
  for(let i=0;i<B.shots.length;i++){const a=B.shots[i];if(a.dead||a.cap||a.mel||a.nm)continue;
    for(let j=i+1;j<B.shots.length;j++){const b=B.shots[j];if(b.dead||b.cap||b.mel||b.nm||b.side===a.side)continue;
      if(Math.hypot(a.x-b.x,a.y-b.y)<(a.r||4)+(b.r||4)+2){a.dead=b.dead=1;const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;burst(mx,my,'#ffffff',10);burst(mx,my,TYPES[MOVES[a.mid].t].c,5);burst(mx,my,TYPES[MOVES[b.mid].t].c,5);break}}}
  B.shots=B.shots.filter(s=>!s.dead);
  if(B.mode==='duel')publishDuel(false);
  checkEnd();
}
function checkEnd(){
  if(B.state!=='fight')return;
  if(B.mode==='wild'){if(B.me.out)wildLose();return}
  if(B.mode==='trainer'){if(B.me.out)wildLose();else if(B.foe.out)trainerWin();return}
  if(B.me.out){duelResult(false);return}
  if(B.foe.out)duelResult(true);
}
/* --- TURN-BASED MODE --- */
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const TB_ACC={big:85,spread:95,multi:95};
function fOf(S){return B.me.side===S?B.me:B.foe}
function tbSnap(){const o={};for(const F of[B.me,B.foe])o[F.side]={ap:F.ap??AP_MAX,a:F.a,team:F.team.map(m=>({s:m.s,l:m.l,hp:m.hp,mhp:m.mhp,atk:m.atk,def:m.def,spd:m.spd,m:m.m.slice()})),st:Object.assign({burn:0,slow:0,stun:0,sleep:0,conf:0,shield:0,haste:0},F.tbst||{}),out:F.out};return o}
function tbCopy(st){return JSON.parse(JSON.stringify(st))}
// pure turn resolution (deterministic with a seeded rng -> identical on both PvP clients)
function tbResolve(st,acts,rng,label){
  const ev=[],cur=S=>st[S].team[st[S].a],other=S=>S==='L'?'R':'L',snap=()=>({L:{ap:st.L.ap,a:st.L.a,hp:st.L.team.map(m=>m.hp),st:Object.assign({},st.L.st),out:st.L.out},R:{ap:st.R.ap,a:st.R.a,hp:st.R.team.map(m=>m.hp),st:Object.assign({},st.R.st),out:st.R.out}});
  for(const S of['L','R'])st[S].ap=Math.min(AP_MAX,(st[S].ap??AP_MAX)+TB_AP_REGEN);
  for(const S of['L','R']){const a=acts[S];if(a&&a.k==='switch'){const t=st[S].team[a.i];if(t&&t.hp>0&&a.i!==st[S].a){st[S].a=a.i;st[S].st.ga=st[S].st.gd=st[S].st.gs=0;ev.push({msg:`${label(S,null)} schickt ${SPECIES[t.s].n} in den Kampf!`,sw:S,snap:snap()})}}}
  const spd=S=>cur(S).spd*(st[S].st.slow>0?0.5:1)*(st[S].st.haste>0?1.5:1)*stageMul(st[S].st.gs|0);
  const bump=(S,bs,who)=>{for(const[k,v]of Object.entries(bs||{})){const key='g'+k,o=st[S].st[key]|0;st[S].st[key]=clamp(o+v,-4,4);const ch=st[S].st[key]-o;ev.push({msg:ch?`${label(S,who)}: ${STAT_DE[k]} ${ch>0?'steigt':'sinkt'}${Math.abs(ch)>1?' stark':''}!`:`${label(S,who)}: ${STAT_DE[k]} verändert sich nicht weiter!`,snap:snap()})}};
  let order=['L','R'].filter(S=>acts[S]&&acts[S].k==='move');
  if(order.length===2){const a=spd('L'),b=spd('R');if(b>a||(b===a&&rng()<0.5))order.reverse()}
  for(const S of order){const O=other(S),att=cur(S),def=cur(O);if(att.hp<=0||st[S].out)continue;
    if(st[S].st.stun>0){st[S].st.stun=0;ev.push({msg:`${label(S,att)} ist betäubt und kann sich nicht bewegen!`,snap:snap()});continue}
    if(st[S].st.sleep>0){st[S].st.sleep--;ev.push({msg:st[S].st.sleep>0?`${label(S,att)} schläft tief und fest…`:`${label(S,att)} schläft noch — wacht aber gleich auf!`,snap:snap()});continue}
    if(st[S].st.conf>0){st[S].st.conf--;if(rng()<0.33){const me_=cur(S);const dmg=Math.max(1,Math.round(me_.mhp/8));me_.hp=Math.max(0,me_.hp-dmg);ev.push({msg:`${label(S,att)} ist verwirrt und verletzt sich selbst!`,hit:1,snap:snap()});continue}}
    const mid=att.m[acts[S].i]||att.m[0]||'bump',mv=MOVES[mid]||MOVES.bump;
    if(st[S].ap<apCost(mid)){ev.push({msg:`${label(S,att)} hat keine AP mehr und muss verschnaufen!`,snap:snap()});continue}st[S].ap-=apCost(mid);
    ev.push({msg:`${label(S,att)} setzt ${mv.n} ein!`,atk:S,mid,snap:snap()});seenMove(mid);
    if(mv.k==='self'&&mv.fx==='buff'){bump(S,mv.bs,att);continue}
    if(mv.fx==='selfbuff'&&rng()<(mv.stc??1))bump(S,mv.bs,att);
    if(mv.k==='self'){if(mv.fx==='heal'){const h=Math.round(att.mhp*0.3);att.hp=Math.min(att.mhp,att.hp+h);ev.push({heal:S,v:h,snap:snap()})}else{st[S].st[mv.fx]=mv.fx==='shield'?2:3;ev.push({msg:mv.fx==='shield'?`${label(S,att)} ist geschützt!`:`${label(S,att)} wird schneller!`,snap:snap()})}continue}
    if(def.hp<=0)continue;
    if(rng()*100>=(TB_ACC[mv.k]||100)){ev.push({msg:'Daneben!'});continue}
    const e=eff(mv.t,SPECIES[def.s].t),crit=rng()<1/16,roll=0.85+rng()*0.15;const p=mv.k==='spread'||mv.k==='multi'?mv.p*0.85:mv.p;
    let d=Math.floor((((2*att.l/5+2)*p*att.atk*stageMul(st[S].st.ga|0)/Math.max(1,def.def*stageMul(st[O].st.gd|0)))/50+2)*(mv.t===SPECIES[att.s].t?1.5:1)*e*(crit?1.5:1)*roll*0.8);
    d=e===0?0:Math.max(1,d);if(st[O].st.shield>0&&d>0)d=Math.max(1,Math.round(d*0.5));
    def.hp=Math.max(0,def.hp-d);ev.push({hit:O,d,e,crit,snap:snap()});
    if(crit&&d)ev.push({msg:'Ein Volltreffer!'});if(e>1)ev.push({msg:'Sehr effektiv!'});else if(e===0)ev.push({msg:'Das hatte keine Wirkung…'});else if(e<1)ev.push({msg:'Nicht sehr effektiv…'});
    if(d>0&&def.hp>0){
      if(mv.fx==='burn'&&rng()<0.3&&SPECIES[def.s].t!=='fire'&&!st[O].st.burn){st[O].st.burn=3;ev.push({msg:`${label(O,def)} was burned!`,snap:snap()})}
      if(mv.fx==='debuff'&&rng()<(mv.stc??1))bump(O,mv.bs,def);
      if(mv.fx==='slow'){st[O].st.slow=2;ev.push({msg:`${label(O,def)} wurde verlangsamt!`,snap:snap()})}
      if(mv.fx==='stun'&&rng()<(mv.k==='big'?0.5:0.3)){st[O].st.stun=1;ev.push({msg:`${label(O,def)} ist betäubt!`,snap:snap()})}
      if(st[O].st.sleep>0&&mv.fx!=='sleep'&&cur(O).hp>0){st[O].st.sleep=0;ev.push({msg:`${label(O,def)} ist aufgewacht!`,snap:snap()})}
      if(mv.fx==='sleep'&&st[O].st.sleep<=0&&rng()<0.45){st[O].st.sleep=2;ev.push({msg:`${label(O,def)} schläft ein!`,snap:snap()})}
      if(mv.fx==='conf'&&st[O].st.conf<=0&&rng()<0.45){st[O].st.conf=3;ev.push({msg:`${label(O,def)} ist verwirrt!`,snap:snap()})}}
    if(mv.fx==='drain'&&d>0&&att.hp>0){const h=Math.max(1,Math.round(d*0.5));att.hp=Math.min(att.mhp,att.hp+h);ev.push({heal:S,v:h,snap:snap()})}
    if(def.hp<=0)ev.push({msg:`${label(O,def)} ist besiegt!`,faint:O,ko:O,snap:snap()});
  }
  for(const S of['L','R']){const m=cur(S);if(m.hp>0&&st[S].st.burn>0){const d=Math.max(1,Math.round(m.mhp/12));m.hp=Math.max(0,m.hp-d);ev.push({msg:`${label(S,m)} leidet unter der Verbrennung!`,hit:S,d,e:1,burn:1,snap:snap()});if(m.hp<=0)ev.push({msg:`${label(S,m)} ist besiegt!`,faint:S,ko:S,snap:snap()})}
    for(const k of['burn','slow','shield','haste'])st[S].st[k]=Math.max(0,st[S].st[k]-1)}
  for(const S of['L','R']){if(cur(S).hp<=0){st[S].st={burn:0,slow:0,stun:0,sleep:0,conf:0,shield:0,haste:0};const n=st[S].team.findIndex(m=>m.hp>0);if(n<0)st[S].out=true;else{st[S].a=n;ev.push({msg:`${label(S,null)} schickt ${SPECIES[st[S].team[n].s].n} in den Kampf!`,sw:S,snap:snap()})}}}
  ev.push({snap:snap()});return ev;
}
function tbLabel(S,m){const mine=S===B.me.side;if(!m)return mine?'Du':(B.mode==='wild'?'Das wilde Monster':B.oppName||'Gegner');const n=SPECIES[m.s].n;if(mine)return n;return B.mode==='wild'?`Wildes ${n}`:`Gegner-${n}`}
function tbApply(sn){for(const S of['L','R']){const F=fOf(S),x=sn[S];if(!F||!x)continue;if(Number.isFinite(x.ap))F.ap=x.ap;if(F.a!==x.a){F.a=x.a;F.spawnT=performance.now();burst(F.x,F.y-14,'#ffffff',10)}F.team.forEach((m,i)=>{if(Number.isFinite(x.hp[i]))m.hp=x.hp[i]});F.tbst=Object.assign({},x.st);F.st=Object.assign({},x.st);F.out=!!x.out;F.faint=act(F).hp<=0?0.9:0}}
function tbAiAct(F){const m=act(F),T=F===B.foe?B.me:B.foe,def=act(T);const ap=Math.min(AP_MAX,(F.ap??AP_MAX)+TB_AP_REGEN);let opts=m.m.map((mid,i)=>({mid,i})).filter(o=>MOVES[o.mid]);const aff=opts.filter(o=>apCost(o.mid)<=ap);if(aff.length)opts=aff;
  const score=o=>{const mv=MOVES[o.mid];if(mv.k==='self')return mv.fx==='heal'?(m.hp<m.mhp*0.4?120:5):(F.tbst&&F.tbst[mv.fx]>0?0:25);return mv.p*eff(mv.t,SPECIES[def.s].t)*(mv.t===SPECIES[m.s].t?1.5:1)*(TB_ACC[mv.k]||100)/100+Math.random()*30};
  opts.sort((a,b)=>score(b)-score(a));return{k:'move',i:(opts[0]||{i:0}).i}}
function tbChoose(a){
  if(!B||!B.tb||B.state!=='tbChoose')return;
  const me=act(B.me);
  if(a.k==='move'&&!me.m[a.i])return;
  if(a.k==='move'&&Math.min(AP_MAX,(B.me.ap??AP_MAX)+TB_AP_REGEN)<apCost(me.m[a.i])&&me.m.some(mid=>Math.min(AP_MAX,(B.me.ap??AP_MAX)+TB_AP_REGEN)>=apCost(mid))){B.me.apShake=performance.now();say('Dafür reichen die AP nicht — wähle eine günstigere Attacke.');return}
  if(a.k==='cap'){capPress();return;
    const now=performance.now();B.vshots.push({cap:1,x:B.me.x,y:B.me.y-14,tx:B.foe.x,ty:B.foe.y-14,t0:now,dur:550});setTimeout(()=>{if(!B)return;B.vshots=[];startCatch()},560);return}
  if(a.k==='run'){if(B.mode!=='wild')return;const m=act(B.me),w=act(B.foe),q=B.runQ;B.runQ=null;if(q===1||(q==null&&Math.random()<0.5+0.5*m.spd/(m.spd+w.spd))){B.state='flee';B.fleeT=performance.now();B.me.face=-1;say('Erfolgreich geflohen!')}else{say("Flucht gescheitert!");B.state='tbPlay';setTimeout(()=>{if(B&&B.state==='tbPlay')tbRun(null)},700)}return}
  if(B.mode==='duel'){B.tbActs['t'+B.turn]=a;B.state='tbWait';publishDuel(true);return}
  B.state='tbPlay';tbRun(a);
}
function tbSwitchMenu(){
  if(!B||!B.tb||B.state!=='tbChoose')return;
  if(isMob()){const F=B.me;openModal(`<h3>MONSTER WECHSELN</h3><div style="display:flex;flex-direction:column;gap:6px">${F.team.map((m,i)=>`<button class="btn ${i===F.a||m.hp<=0?'ghost':''}" data-sw="${i}" ${i===F.a||m.hp<=0?'disabled':''} style="font-family:VT323,monospace;font-size:19px">${nameHtml(m.s)} Lv ${m.l} · KP ${m.hp}/${m.mhp}</button>`).join('')}</div><div class="acts" style="margin-top:10px"><button class="btn ghost" id="mno">BACK</button></div>`);
    document.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>{closeModal();tbChoose({k:'switch',i:+b.dataset.sw})});$('#mno').onclick=closeModal;return}const el=$('#bact');el.innerHTML='';const F=B.me;
  F.team.forEach((m,i)=>{const b=document.createElement('button');b.className='mv';b.style.background=i===F.a?'#3a4160':TYPES[SPECIES[m.s].t].c;b.disabled=m.hp<=0||i===F.a;if(b.disabled)b.style.opacity=.45;
    b.innerHTML=`${nameHtml(m.s)} Lv ${m.l}<small>KP ${m.hp}/${m.mhp}${i===F.a?' · im Kampf':''}</small>`;b.onclick=()=>{buildBattleUI();tbChoose({k:'switch',i})};el.appendChild(b)});
  const back=document.createElement('button');back.className='btn ghost';back.style.gridColumn='1/-1';back.textContent='ZURÜCK';back.onclick=buildBattleUI;el.appendChild(back);
}
// local battles (wild / trainer / bot): my action + AI action
function tbRun(myAct){const acts={};acts[B.me.side]=myAct;acts[B.foe.side]=B.foe.out?null:tbAiAct(B.foe);tbPlay(tbResolve(tbCopy(tbSnap()),acts,Math.random,tbLabel))}
async function tbPlay(ev){
  const myB=B;B.state='tbPlay';
  for(const e of ev){if(B!==myB||B.state==='over')return;
    if(e.atk){const F=fOf(e.atk),T=fOf(e.atk==='L'?'R':'L'),mv=MOVES[e.mid];say(e.msg);
      if(mv.k==='melee'){F.lungeT=performance.now();await sleep(380)}else if(mv.k==='self'){F.castT=performance.now();await sleep(400);continue}else{F.atkT=performance.now();const now=performance.now();const sp=shotParams(e.mid);B.vshots.push({x:F.x,y:F.y-12,tx:T.x,ty:T.y-12,t0:now,dur:420,mid:e.mid,r:clamp(sp.r||3,2.5,7)});await sleep(430);B.vshots=[];burst(T.x,T.y-12,TYPES[mv.t].c,8)}continue}
    if(e.snap){const before=tbSnap();tbApply(e.snap);
      if(e.hit){const T=fOf(e.hit);T.flash=0.3;T.hurtT=performance.now();B.nums.push({x:T.x,y:T.y-34,t:e.d?'-'+e.d:'0',c:e.burn?'#ff8a3d':e.e>1?'#ffcb3d':e.e<1?'#c0c4d6':'#ffffff',at:performance.now()});if(B.foe&&e.hit===B.foe.side&&!e.burn&&e.e!=null&&e.e!==1)B.nums.push({x:T.x,y:T.y-50,t:e.e===0?'KEINE WIRKUNG':e.e>1?'SEHR EFFEKTIV!':'WENIG EFFEKTIV',c:e.e>1?'#ffcb3d':'#9aa1bd',at:performance.now(),sz:9,life:1100})}
      if(e.heal){const F=fOf(e.heal);B.nums.push({x:F.x,y:F.y-34,t:'+'+e.v,c:'#3ddc6b',at:performance.now()});burst(F.x,F.y-14,'#3ddc6b',12)}
      if(e.ko&&e.ko===B.foe.side&&B.mode==='trainer'){const def=before[e.ko].team[before[e.ko].a];trainerKO(B.foe.team[before[e.ko].a]||def)}}
    if(e.msg&&!e.atk){say(e.msg);await sleep(e.faint?900:650)}else if(e.snap)await sleep(e.hit?350:120);
  }
  if(B!==myB)return;
  const meOut=B.me.out,foeOut=B.foe.out;
  if(B.mode==='wild'){if(foeOut||act(B.foe).hp<=0){B.foe.out=true;wildWin();return}if(meOut){wildLose();return}}
  else if(B.mode==='trainer'){if(meOut){wildLose();return}if(foeOut){trainerWin();return}}
  else{if(meOut&&foeOut){duelResult(null);return}if(meOut){duelResult(false);return}if(foeOut){duelResult(true);return}}
  B.turn++;B.state='tbChoose';if(B.mode==='duel')tbDuelSync(null);
}
function tbUpdate(dt,now){
  if(B.slowUntil&&now<B.slowUntil)dt*=0.3;
  for(const s of B.shots){if(!s.cap)continue;s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;const T=B.foe;
    if(Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){s.dead=1;startCatch(throwBonus())}
    else if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;say('Verfehlt!');setTimeout(()=>{if(B&&B.state==='tbPlay')tbRun(null)},600)}}
  B.shots=B.shots.filter(s=>!s.dead);
  if(B.state==='catch'){catchUpdate(now);return}
  if(B.state==='flee'){fleeUpdate(dt);return}
  if(B.state==='count')B.state='tbChoose';
}
// PvP: both pick, actions exchanged via presence, resolved with the same seeded rng on both sides
function tbDuelSync(du){
  if(!du){const op=findPeer(B.opp);du=op&&op.presence.du;if(!du||du.id!==B.id)return}
  if(!B.foe){let ot=sanitizeTeam(du.team);const mt=sanitizeTeam(B.raw);if(!ot||!mt)return;if(!B.spar)ot=ot.slice(0,cfgOf().team);const left=B.me.side==='L';B.me=mkFighter(B.me.side,mt,left?XL:XR,'local');B.foe=mkFighter(left?'R':'L',ot,left?XR:XL,'remote');B.foe.y=AYM;
    const now=performance.now();const vx=vsStart(now);B.me.spawnT=now+vx;B.foe.spawnT=now+vx+200;B.state='tbChoose';say(`${B.oppName} betritt den Gerichtssaal!`);buildBattleUI();return}
  if(B.state!=='tbWait')return;
  const mine=B.tbActs['t'+B.turn],th=du.ta&&du.ta['t'+B.turn];if(!mine||!th)return;
  const theirs=th.k==='ff'?{k:'ff'}:th.k==='switch'?{k:'switch',i:clamp(th.i|0,0,5)}:{k:'move',i:clamp(th.i|0,0,3)};
  if(theirs.k==='ff'){duelResult(true,`${B.oppName} hat aufgegeben!`);return}
  const acts={};acts[B.me.side]=mine;acts[B.foe.side]=theirs;
  tbPlay(tbResolve(tbCopy(tbSnap()),acts,mulberry32(hashStr(B.id+':'+B.turn)),tbLabel));
}

/* --- player actions --- */
function battleMove(i){if(!B)return;if(B.tb){tbChoose({k:'move',i});return}if(B.state==='fight')fire(B.me,i)}
const DASH_AP=0;
// squad size (lobby setting „Kader“, 1–4); everything else waits in the box
function teamMax(){const k=+((RUN&&RUN.cfg&&RUN.cfg.kader)??4);return clamp(Number.isFinite(k)?k:4,1,4)}
// the arena edge: fleeing and switching only work there
function atEdge(F){const dx=(F.x-ACX)/ARX,dy=(F.y-ACY)/ARY;return Math.hypot(dx,dy)>=0.86}
function battleDash(){if(!B||B.tb||B.state!=='fight')return;const F=B.me;if(F.dashCd>0||F.faint>0||F.out||F.st.stun>0||F.st.sleep>0||F.hitstun>0)return;if(!F.ddx&&!F.ddy){F.ddx=F.face>0?-1:1;F.ddy=0}let dx=0,dy=0;for(const d of held){dx+=DIRS[d][0];dy+=DIRS[d][1]}if(JOY.active&&Math.hypot(JOY.x,JOY.y)>0.2){dx=JOY.x;dy=JOY.y}const L=Math.hypot(dx,dy);if(L){F.ddx=dx/L;F.ddy=dy/L}if(DASH_AP&&(F.ap??AP_MAX)<DASH_AP){F.apShake=performance.now();const n=performance.now();if(!B.apMsgT||n-B.apMsgT>1200){B.apMsgT=n;say('Nicht genug AP zum Sprinten!')}return}F.ap=(F.ap??AP_MAX)-DASH_AP;F.dashT=0.15;F.dashCd=1.0;F.inv=0.26;F.noRegen=3;F.pdz=0.15+0.5}
function battleSwitch(){if(B&&B.tb){tbSwitchMenu();return}if(!B)return;if(B.state==='fight'&&B.qsel){reelConfirm();return}if(B.state!=='fight')return;const F=B.me;if(F.faint>0||F.out)return;if(!F.team.some((m,i)=>i!==F.a&&m.hp>0)){say('Kein anderes Monster einsatzbereit.');return}
  if(!atEdge(F)){say('Zum Wechseln an den Rand der Arena laufen!');return}B.qsel=true;B.reel=null;held.length=0;$('#bpick').dataset.k=''}
function quickPick(i){const F=B.me;B.qsel=false;$('#bpick').dataset.k='';if(i===F.a||!F.team[i]||F.team[i].hp<=0)return;if(F.swCd>0){say('Wechsel gleich wieder möglich…');return}doSwitch(F,i)}
// aiming: hold CAPSULE -> the aim line swings; release to throw. A pulsing ring on the target gives a throw bonus.
function capPress(){if(!B||B.mode!=='wild'||B.aim)return;if(!(B.state==='fight'||(B.tb&&B.state==='tbChoose'))||B.capCd>0)return;if(RUN.kap<=0&&!B.capGreat){say('Keine Handschellen mehr!');return}B.aim={t0:performance.now()};say('Zielen… loslassen zum Werfen!')}
function aimAngle(now){const F=B.me,T=B.foe;if(!B.tb){const a=myAim();return Math.atan2(a.y,a.x)}return Math.atan2((T.y-12)-(F.y-14),T.x-F.x)+Math.sin((now-B.aim.t0)/1000*3.4)*0.55}
function ringR(now){return 5+11*(0.5+0.5*Math.sin(now/240))}
function capRelease(){if(!B||!B.aim)return;const now=performance.now(),a=aimAngle(now);B.aim=null;if(B.capGreat){B.capGreat=0;B.greatThrown=1}else{RUN.kap--;B.greatThrown=0}B.capCd=1.2;updateHud();
  const F=B.me,sp=215;B.shots.push({cap:1,side:F.side,x:F.x,y:F.y-14,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,age:0,life:1.3,r:5,mid:'bump',flight:Math.hypot(B.foe.x-F.x,B.foe.y-F.y)/sp});
  say('Handschellen geworfen!');if(B.tb)B.state='tbPlay'}
function throwCap(){capPress()}
function throwCapOld(){if(!B||B.mode!=='wild'||B.state!=='fight'||B.capCd>0)return;if(RUN.kap<=0){say('Keine Handschellen mehr!');return}
  RUN.kap--;B.capCd=1.2;updateHud();const F=B.me,T=B.foe;let dx=T.x-F.x,dy=(T.y-12)-(F.y-12);const L=Math.hypot(dx,dy)||1;
  B.shots.push({cap:1,side:F.side,x:F.x,y:F.y-14,vx:dx/L*190,vy:dy/L*190,age:0,life:1.6,r:6,mid:'bump',flight:L/190});say('Handschellen geworfen!')}
function fleeItem(sid){if(!QZ[sid]){const it=secondChanceItem(sid);if(it){it.q[0]=it.q[0].replace('Zweite Chance! ','');return it}}const pool=QZ[sid]||Object.values(QZ).flat().map(q=>q);const q=QZ[sid]?QZ[sid][Math.floor(Math.random()*QZ[sid].length)]:pool[Math.floor(Math.random()*pool.length)];return{src:sid,q:qReal(q)}}
// fleeing always needs a correct answer (3 s): real-time only at the arena edge, turn-based as the turn's action
function tryRun(){if(!B||B.mode!=='wild'||CQ)return;
  if(B.tb){if(B.state!=='tbChoose')return;const myB=B;fleeQuiz(ok=>{if(B!==myB||B.state!=='tbChoose')return;B.runQ=ok?1:0;tbChoose({k:'run'})});return}
  if(B.state!=='fight')return;
  if(!atEdge(B.me)){say('Lauf an den Rand der Arena, um zu fliehen!');return}
  // the fight keeps running while the question is answered (small panel at the bottom, arena stays visible)
  const myB=B;fleeQuiz(ok=>{if(B===myB)B.frozen=false;if(B!==myB||B.state!=='fight')return;if(ok){B.state='flee';B.fleeT=performance.now();B.me.face=-1;B.shots=[];say('Erfolgreich geflohen!')}else say('Flucht gescheitert!')})}
// flee question: about your own active monster (its paragraph)
function fleeQuiz(cb){const it=fleeItem(act(B.me).s),order=shuffleArr([0,1,2,3]);
  CQ={it,order,end:performance.now()+5000,T:5000,flee:1,done:false,cb,okMsg:'✓ Richtig — die Flucht gelingt!'};held.length=0;aimHeld.length=0;
  $('#cqbox').innerHTML=`<div class="sdlg"><span class="slaw">🏃 FLUCHT — 5 SEKUNDEN</span><br>${esc(it.q[0])}<div class="cqt"><i id="cqbar"></i></div><div class="small" id="cqtime" style="text-align:right">5 s</div><div id="cqexp"></div></div>
    <div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${j+1}</span>${esc(it.q[1][k])}</button>`).join('')}</div><div class="sacts" id="cqact"></div>`;
  $('#cquiz').classList.toggle('lite',!B.tb);$('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(b=>b.onclick=()=>cqAnswer(+b.dataset.ck));cqTick()}
function fleeUpdate(dt){const F=B.me;F.y+=150*dt;if(Math.random()<0.5)B.parts.push({x:F.x,y:F.y-8,vx:(Math.random()-.5)*20,vy:-20-Math.random()*15,life:0.4,age:0,c:'#e8dcc0'});
  for(const p of B.parts){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt}B.parts=B.parts.filter(p=>p.age<p.life);
  if(F.y>AH+50&&!B.fleeDone){B.fleeDone=true;endWild()}}
function forfeit(){if(B&&B.tb&&B.state!=='over'&&B.mode!=='wild'&&B.mode!=='trainer'){if(B.mode==='duel'&&B.foe){B.tbActs['t'+B.turn]={k:'ff'};publishDuel(true)}duelResult(false,'Du hast aufgegeben.');return}if(!B||B.mode==='wild'||B.state==='over')return;if(B.state==='fight'||B.state==='count'||B.state==='wait'){B.me.team.forEach(m=>m.hp=0);B.me.out=true;if(B.mode==='duel')publishDuel(true);duelResult(false,'Du hast aufgegeben.')}}

/* --- wild --- */
// a knocked-out team has to be healed at a PÄD (questions) before the next fight
// whole team knocked out: back to the last PÄD and the heal window opens right away
function respawnHeal(){if(!RUN)return;RUN.kap=Math.max(RUN.kap,10);P.lock=false;held.length=0;{const sp=padSpawn();teleport(sp.x,sp.y)}try{closeModal()}catch(e){}if(TALK)endTalk(true);let n=0;const open=()=>{if(!RUN)return;if((B||CQ)&&n++<40){setTimeout(open,100);return}if(!B&&!CQ&&!$('#cquiz').classList.contains('on'))healQuiz()};open();toast('Du bist zurück zum PÄD geeilt.')}
function teamDown(){if(RUN&&RUN.team.some(m=>m.hp>0))return false;const n=performance.now();if(!teamDown.t||n-teamDown.t>1500){teamDown.t=n;setTimeout(respawnHeal,0)}return true}
function startWild(zk){if(teamDown())return;
  const z=ZONES[zk];const sid=pickWild(poolOf(zk),1+distC(P.x,P.y)/80);const l=lvAt(P.x,P.y);
  const wild=newMon(sid,l);G.dex[sid]=G.dex[sid]||0;
  newBattle({mode:'wild',zone:zk,wild,me:mkFighter('L',RUN.team.map(battler),XL,'local'),foe:mkFighter('R',[battler(wild)],XR,'ai')});
  B.foe.inv=0.6;const rr=RAR[sid];say(rr==='rare'?`✦ Ein SELTENES ${SPECIES[wild.s].n} (Lv ${l}) erscheint! ✦`:rr==='uncommon'?`Ein ungewöhnliches ${SPECIES[wild.s].n} (Lv ${l}) erscheint!`:`Ein wildes ${SPECIES[wild.s].n} (Lv ${l}) erscheint!`);if(rr==='rare')burst(XR,64,'#4aa3ff',24);
}
function startLegend(L){
  if(teamDown())return;
  const LS_=legSid(L),wild=newMon(LS_,L.l);G.dex[LS_]=G.dex[LS_]||0;
  newBattle({mode:'wild',legend:L.id,zone:L.zone,wild,me:mkFighter('L',RUN.team.map(battler),XL,'local'),foe:mkFighter('R',[battler(wild)],XR,'ai'),state:'count',cntEnd:performance.now()+2000});
  say(`★ Das legendäre ${SPECIES[LS_].n} erwacht! ★`);burst(ACX,YT-20,'#ffcb3d',40);
}
// trainers teach their monsters TMs (type-bound): own type or Normal; stronger trainers get stronger moves
function vmTier(t){const b=Math.round(baseLvAt(t.x,t.y))+1;return b>=10?3:b>=5?2:1}
function vmPick(type,lo,hi,r,not){const c=Object.keys(MOVES).filter(m=>{const v=MOVES[m];return v.t===type&&v.k!=='self'&&(v.p||0)>=lo&&(v.p||0)<=hi&&!not.includes(m)});return c.length?c[Math.floor(r()*c.length)]:null}
function giveVMs(t,mon,i){const r=mulberry32(hashStr(t.id+':'+i)),tier=vmTier(t),own=SPECIES[mon.s].t,cov='normal',vms=[];
  if(tier===1){const m=vmPick(cov,30,55,r,mon.m);if(m)vms.push(m)}
  else if(tier===2){const a=vmPick(own,60,85,r,mon.m),b=vmPick(cov,50,75,r,mon.m);if(a)vms.push(a);if(b)vms.push(b)}
  else{const a=vmPick(own,85,140,r,mon.m)||vmPick(own,70,140,r,mon.m),b=vmPick(cov,70,110,r,mon.m);if(a)vms.push(a);if(b)vms.push(b)}
  for(const m of vms){if(mon.m.length<4)mon.m.push(m);else{let wi=0;for(let k=1;k<mon.m.length;k++)if((MOVES[mon.m[k]].p||0)<(MOVES[mon.m[wi]].p||0))wi=k;mon.m[wi]=m}}
  return vms}
function startTrainer(t){
  if(teamDown()){P.lock=false;return}
  const vmList=[];const team=trainerTeam(t).map(([s,l],i)=>{const mon=newMon(s,l);const v=giveVMs(t,mon,i);if(v.length)vmList.push(SPECIES[s].n+': '+v.map(m=>MOVES[m].n).join(', '));return battler(mon)});
  newBattle({mode:'trainer',trainer:t,oppName:t.n,zone:zoneAt(t.x,t.y)||'north',me:mkFighter('L',RUN.team.map(battler),XL,'local'),foe:mkFighter('R',team,XR,'ai'),state:'count',cntEnd:performance.now()+2600});
  if(vmList.length){say(`${t.n} hat TMs beigebracht (${['','Basis','Fortgeschritten','Elite'][vmTier(t)]})!`);sysChat(`TMs von ${t.n} — ${vmList.join(' · ')}`)}
  say(`${t.n} will kämpfen!`);{const ty=trainerType(t);if(ty)say(`${t.n} setzt auf ${TYPES[ty].n}-Monster!`)}
}
function trainerKO(def){const idx=B.me.a;syncBack();const m=RUN.team[idx];if(m){const msgs=gainXp(m,Math.round(xpGain(def.s,def.l)*1.4));Object.assign(B.me.team[idx],battler(m));msgs.forEach(say)}}
async function trainerWin(){B.state='over';finale(true);const t=B.trainer;RUN.beat[t.id]=1;if(t.toll){RUN.toll=RUN.toll||{};RUN.toll[t.toll]=1;setTimeout(()=>sysChat(`${t.n}: „Respekt. Du darfst passieren!“`),2600)}RUN.kap+=t.reward;{const k=HM_FROM[t.id];if(k&&!hasHM(k)){RUN.hm=RUN.hm||{};RUN.hm[k]=1;say(`Du hast die VM ${HM[k].i} ${HM[k].n} bekommen! Einsetzbar mit einem ${hmNeed(k)} im Kader.`);sysChat(`${t.n} hat dir ${HM[k].n} beigebracht: ${HM[k].d}`)}}earn(t.reward*40,'von '+t.n);{const tm=tmRandom(mulberry32((Date.now()^hashStr(t.id))>>>0),vmTier(t));if(tm){tmGive(tm);say(`Belohnung: 💿 TM ${MOVES[tm].n} (${TYPES[MOVES[tm].t].n})!`)}}syncBack();say(`Du hast ${t.n} besiegt!`);say(`Belohnung: ${t.reward} Handschellen.`);sysChat(`Du hast ${t.n} besiegt und ${t.reward} Handschellen bekommen.`);updateHud();const myB=B;await sleep(2400);if(B===myB)endWild()}
function syncBack(){if(B&&(B.mode==='wild'||B.mode==='trainer'))B.me.team.forEach((b,i)=>{if(RUN.team[i])RUN.team[i].hp=b.hp})}
async function wildWin(){
  if(B.legend&&typeof FEM!=='undefined'&&FEM.includes(B.legend)){B.state='over';finale(false);syncBack();const n=SPECIES[B.legend].n;say(`${n} ist geflohen!`);setTimeout(()=>sysChat(`${n} lässt sich nicht besiegen – fang es, bevor seine KP auf 0 sinken!`),900);const myB=B;setTimeout(()=>{if(B===myB)endWild(`${n} ist geflohen – versuch es nochmal!`)},2600);return}
  B.state='over';finale(true);const idx=B.me.a;syncBack();const m=RUN.team[idx];earn(B.legend?150:6+B.wild.l*3,'Preisgeld');if(B.legend){RUN.leg[B.legend]=1;say(`${SPECIES[B.legend].n} verschwindet im Licht…`)}
  const msgs=m?gainXp(m,xpGain(B.wild.s,B.wild.l)):[];if(m)Object.assign(B.me.team[idx],battler(m));
  const myB=B;for(const t of msgs){say(t);await sleep(1000);if(B!==myB)return}await sleep(700);if(B===myB)endWild();
}
// second chance (once per battle): lost against a paragraph monster → name its paragraph within 5 s → 25 % HP back after a 3-2-1
function lawTitle(sid){const L=(SPECIES[sid]&&SPECIES[sid].law)||'';const i=L.indexOf(' · ');return i>0?{head:L.slice(0,i),title:L.slice(i+3)}:null}
// extra real paragraph titles as plausible wrong answers
const LAW_TITLES={StGB:['Fahrlässige Körperverletzung','Schwere Körperverletzung','Körperverletzung mit Todesfolge','Gefährliche Körperverletzung','Raub','Räuberischer Diebstahl','Diebstahl mit Waffen','Besonders schwerer Fall des Diebstahls','Unterschlagung','Computerbetrug','Erpressung','Hehlerei','Nötigung','Bedrohung','Hausfriedensbruch','Verleumdung','Üble Nachrede','Fälschung technischer Aufzeichnungen','Gemeinschädliche Sachbeschädigung','Datenveränderung','Gefährdung des Straßenverkehrs','Gefährliche Eingriffe in den Straßenverkehr','Unerlaubtes Entfernen vom Unfallort','Verbotene Kraftfahrzeugrennen','Vollrausch','Beleidigung'],
  StPO:['Untersuchung anderer Personen','Molekulargenetische Untersuchung','Durchsuchung bei anderen Personen','Verfahren bei der Durchsuchung','Beschlagnahmeverbot','Vorläufige Festnahme','Vernehmung des Beschuldigten','Verbotene Vernehmungsmethoden','Haftbefehl','Zeugnisverweigerungsrecht','Erkennungsdienstliche Maßnahmen','Aufgaben der Polizei im Ermittlungsverfahren'],
  PolG:['Gewahrsam','Sicherstellung','Beschlagnahme','Durchsuchung von Sachen','Durchsuchung von Personen','Erkennungsdienstliche Maßnahmen','Vorladung','Meldeauflage','Personenfeststellung','Elektronische Aufenthaltsüberwachung'],
  GG:['Schutz der Familie','Versammlungsfreiheit','Vereinigungsfreiheit','Freizügigkeit','Berufsfreiheit','Meinungsfreiheit','Eigentum','Asylrecht','Petitionsrecht','Gleichheit vor dem Gesetz','Rechtsweggarantie','Menschenwürde','Unverletzlichkeit der Wohnung','Brief-, Post- & Fernmeldegeheimnis']};
function secondChanceItem(sid){const t=lawTitle(sid);if(!t)return null;const book=lawOf(sid);const words=t.title.toLowerCase().split(/[^a-zäöüß]+/).filter(w=>w.length>4);
  const norm=x=>x.toLowerCase().replace(/&/g,'und').replace(/[^a-zäöüß]/g,'');const same=new Set(LAW_TITLES[book]||[]);
  const seenN=new Set();const cands=[...new Set([...Object.keys(SPECIES).filter(s=>s!==sid&&lawTitle(s)).map(s=>lawTitle(s).title),...Object.values(LAW_TITLES).flat()])].filter(x=>{const n=norm(x);if(seenN.has(n))return false;seenN.add(n);return true}).filter(x=>norm(x)!==norm(t.title)&&!norm(t.title).includes(norm(x))&&!(norm(x).includes(norm(t.title))&&norm(t.title).length>12));
  const score=x=>{const lx=x.toLowerCase();let sc=0;for(const w of words){if(lx.includes(w))sc+=3;else if(lx.includes(w.slice(0,6)))sc+=1}return sc+(Math.random()*0.9)};
  const ranked=cands.map(x=>({x,sc:score(x)+(same.has(x)||Object.keys(SPECIES).some(s=>lawTitle(s)&&lawTitle(s).title===x&&lawOf(s)===book)?0.8:0)})).sort((a,b)=>b.sc-a.sc);
  const wrong=ranked.slice(0,3).map(r=>r.x);if(wrong.length<3)return null;
  return{src:sid,q:[`Zweite Chance! Wie heißt ${t.head}?`,[t.title,...wrong],`${t.head}: ${t.title}.`]}}
function secondChance(sid,cb){const it=secondChanceItem(sid);if(!it){cb(false);return}const order=shuffleArr([0,1,2,3]),T=5000;
  CQ={it,order,end:performance.now()+T,cb,done:false};held.length=0;aimHeld.length=0;
  $('#cqbox').innerHTML=`<div class="sdlg"><span class="slaw">⚡ ZWEITE CHANCE — 5 SEKUNDEN</span><br>${esc(it.q[0])}<div class="cqt"><i id="cqbar"></i></div><div class="small" id="cqtime" style="text-align:right">5 s</div><div id="cqexp"></div></div>
    <div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${'ABCD'[j]}</span>${esc(it.q[1][k])}</button>`).join('')}</div><div class="sacts" id="cqact"></div>`;
  $('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(b=>b.onclick=()=>cqAnswer(+b.dataset.ck));CQ.T=T;cqTick()}
async function wildLose(){
  if(B&&!B.second&&B.foe&&act(B.foe)&&lawTitle(act(B.foe).s)){B.second=1;const myB=B;B.state='second';say('Alle deine Monster sind besiegt — zweite Chance!');
    const ok=await new Promise(r=>secondChance(act(B.foe).s,r));if(B!==myB)return;
    if(ok){const F=B.me;const i=F.team[F.a]?F.a:0;const m=F.team[i];m.hp=Math.max(1,Math.round(m.mhp*0.25));F.a=i;F.out=false;F.faint=0;F.inv=1;F.spawnT=performance.now()+480;F.cd=[0.3,0.3,0.3,0.3];
      if(B.mode==='wild'||B.mode==='trainer'){const rm=RUN.team[i];if(rm)rm.hp=m.hp}
      say(`${SPECIES[m.s].n} rappelt sich mit 25 % KP wieder auf!`);if(B.tb){B.state='tbChoose'}else{B.state='count';B.leadDone=1;B.leadWait=false;B.cntEnd=performance.now()+3000}return}
    B.state='fight'}
  B.state='over';finale(false);say('Alle deine Monster sind besiegt…');const myB=B;await sleep(2400);if(B!==myB)return;endWild();respawnHeal()}
function throwBonus(){const r=ringR(performance.now());if(r<8){say('Hervorragender Wurf!');return 1.6}if(r<11.5){say('Toller Wurf!');return 1.3}return 1}
// catch chance: low HP + weak (low level / common) -> high; full HP / strong / rare -> low. Three shake checks decide.
function catchChance(w,bonus){const hpF=1-(w.hp/w.mhp)*0.85,lvF=clamp(1.15-w.l*0.03,0.35,1.1);return clamp(hpF*lvF*rarOf(w.s).cm*(bonus||1)+0.04,0.02,0.97)}
function startCatch(bonus){const w=act(B.foe);const chance=catchChance(w,(bonus||1)*(B.greatThrown?1.7:1));const q=Math.pow(chance,1/3);let sh=0;while(sh<3&&Math.random()<q)sh++;
  B.aim=null;B.state='catch';B.catch={t0:performance.now(),ok:sh===3,sh,x:B.foe.x,y:B.foe.y-14,gy:B.foe.y-3};B.shots=[];return;
  B.state='catch';B.catch={t0:performance.now(),ok:Math.random()<chance,x:B.foe.x,y:B.foe.y-14,gy:B.foe.y-3};B.catch.sh=B.catch.ok?3:1+Math.floor(Math.random()*2);B.shots=[]}
function catchUpdate(now){const c=B.catch;const el=(now-c.t0)/1000;if(el<0.95+c.sh*0.7+0.2)return;
  // the cuffs held — now a question about the paragraph decides: right → arrested, wrong or too slow → it breaks free and flees
  if(c.ok&&!c.done&&!c.qz){c.qz=1;const myB=B;catchQuiz(B.wild.s,ok=>{if(B!==myB||!B.catch)return;if(ok)c.qok=1;else{c.done=1;B.state='over';burst(c.x,c.gy-4,'#ffcb3d',16);B.catch=null;say(`Falsch! ${SPECIES[B.wild.s].n} reißt sich los und flieht!`);setTimeout(()=>{if(B===myB)endWild()},1600)}});return}
  if(c.ok&&!c.done&&!c.qok)return;
  if(c.ok&&!c.done){c.done=1;B.state='over';const m=B.wild;if(B.legend)RUN.leg[B.legend]=1;m.hp=act(B.foe).hp;const newDex=!G.dex[m.s];G.dex[m.s]=1;syncBack();const toTeam=RUN.team.length<teamMax();(toTeam?RUN.team:RUN.box).push(m);
    say(`Geschafft! ${SPECIES[m.s].n} wurde festgenommen!`);earn(5+m.l,'Festnahmebonus');say(toTeam?'Es ist jetzt in deinem Team.':'Dein Team ist voll — ab in die Box.');sysChat(`Du hast ${SPECIES[m.s].n} (Lv ${m.l}) festgenommen!`);const myB=B;setTimeout(()=>{if(B===myB){endWild();setTimeout(()=>{if(!B&&!$('#modal').classList.contains('on'))dexReveal(m.s,m,newDex?'★ NEUER DEX-EINTRAG ★':'FESTGENOMMEN')},900)}},1900)}
  else if(!c.ok){B.state=B.tb?'tbPlay':'fight';if(B.tb)setTimeout(()=>{if(B&&B.state==='tbPlay')tbRun(null)},900);burst(c.x,c.gy-4,'#ffcb3d',16);burst(c.x,c.gy-4,'#2fb7b0',10);B.catch=null;B.foe.inv=0.8;B.foe.spawnT=performance.now();say('Oh nein! Es hat sich befreit!')}}
let CQ=null;
function catchQuiz(sid,cb){
  let pool=QZ[sid]?QZ[sid].map(q=>({src:sid,q})):null;if(!pool){const keys=Object.keys(QZ).filter(k=>SPECIES[k]);const k=keys[Math.floor(Math.random()*keys.length)];pool=QZ[k].map(q=>({src:k,q}))}
  const it0=pool[Math.floor(Math.random()*pool.length)],it={src:it0.src,q:qReal(it0.q)},order=shuffleArr([0,1,2,3]);const T=15000;
  CQ={it,order,end:performance.now()+T,cb,done:false};held.length=0;aimHeld.length=0;
  const law=SPECIES[it.src].law||'';
  $('#cqbox').innerHTML=`<div class="sdlg"><span class="slaw">⛓ FESTNAHME — ${esc(law||nameHtml(it.src))}</span><br>${esc(it.q[0])}<div class="cqt"><i id="cqbar"></i></div><div class="small" id="cqtime" style="text-align:right">15 s</div><div id="cqexp"></div></div>
    <div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${j+1}</span>${esc(it.q[1][k])}</button>`).join('')}</div><div class="sacts" id="cqact"></div>`;
  $('#cquiz').classList.toggle('lite',!B.tb);$('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(b=>b.onclick=()=>cqAnswer(+b.dataset.ck));cqTick()}
function cqTick(){if(!CQ||CQ.done)return;const now=performance.now();if(PANIC){CQ.end+=50;setTimeout(cqTick,50);return}
  const left=Math.max(0,CQ.end-now),bar=$('#cqbar');if(bar){bar.style.width=(left/((CQ.T||15000)/100))+'%';bar.style.background=left<(CQ.T||15000)/3?'#ef4444':'#ffcb3d'}const tt=$('#cqtime');if(tt)tt.textContent=Math.ceil(left/1000)+' s';
  if(left<=0){cqAnswer(-1);return}setTimeout(cqTick,50)}
function cqAnswer(k){if(!CQ||CQ.done)return;CQ.done=true;const ok=k===0,it=CQ.it;if(ok&&CQ.flee&&B)B.frozen=true;
  document.querySelectorAll('[data-ck]').forEach(b=>{const kk=+b.dataset.ck;b.disabled=true;b.classList.add(kk===0?'ok':kk===k?'bad':'dim')});
  $('#cqexp').innerHTML=`<div class="sexp ${ok?'ok':'bad'}">${ok?'✓ Richtig.':k<0?'⏱ Zeit abgelaufen.':'✗ Falsch.'} ${esc(it.q[2])}</div>`;
  const cb=CQ.cb,fast=!!CQ.T;setTimeout(()=>{$('#cquiz').classList.remove('on','lite');CQ=null;cb(ok)},ok?(fast?900:1400):(fast?1800:2600))}
function endWild(msg){if(!B)return;syncBack();if(msg)toast(msg);closeBattle();save();pushMt()}

/* --- duels (AI + PvP) --- */
function arenaIdx(){const n=cfgOf().team;const p=(RUN.pick||[]).filter(i=>RUN.team[i]);return(p.length?p:RUN.team.map((_,i)=>i)).slice(0,n)}
function tourneyTeam(spar){const idx=spar?RUN.team.map((_,i)=>i):arenaIdx();return idx.map(i=>{const b=battler(RUN.team[i]);b.hp=b.mhp;return b})}
function startAiDuel(){
  RUN.st='duel';pushMt();
  const mine=tourneyTeam(),n=mine.length,avg=Math.round(mine.reduce((a,m)=>a+m.l,0)/n)+Math.floor((RUN.r-1)/2);
  const team=[];for(let i=0;i<n;i++){const BS=basesNow(),s=BS[Math.floor(Math.random()*BS.length)];team.push(battler(newMon(s,clamp(avg+Math.floor(Math.random()*3)-1,2,60))))}
  newBattle({mode:'ai',opp:'bot',oppName:'Richter-Bot',me:mkFighter('L',mine,XL,'local'),foe:mkFighter('R',team,XR,'ai'),state:'count',cntEnd:performance.now()+3000});
  say(`Runde ${RUN.r}: Der Richter-Bot fordert dich heraus!`);
}
function sanitizeTeam(arr){
  if(!Array.isArray(arr)||arr.length<1||arr.length>6)return null;const out=[];
  for(const e of arr){if(!Array.isArray(e)||!SPECIES[e[0]])return null;const l=clamp(Math.floor(+e[1]||1),1,60);let mv=Array.isArray(e[2])?e[2].filter(x=>typeof x==='string'&&MOVES[x]).slice(0,4):[];if(!mv.length)mv=['bump'];const b=battler({s:e[0],l,hp:0,m:mv});b.hp=b.mhp;out.push(b)}
  return out;
}
function startDuel(opp,id,spar){
  if(!spar){RUN.st='duel';RUN.dopp=opp;save();pushMt()}
  const op=findPeer(opp);const oppName=op?cleanName(op.presence.n):'Gegner';const left=(MYPEER||'')<opp;
  const raw=(spar?RUN.team.map((_,i)=>i):arenaIdx()).map(i=>RUN.team[i]).map(m=>[m.s,m.l,m.m.slice(0,4)]);
  const sameTb=!!(RUN.cfg&&RUN.cfg.tb&&!RUN.free&&op&&op.presence.mt&&op.presence.mt.id===RUN.id);
  newBattle({mode:'duel',tb:sameTb,spar:!!spar,id,opp,oppName,raw,me:mkFighter(left?'L':'R',tourneyTeam(spar),left?XL:XR,'local'),foe:null,state:'wait',mySh:[],seen:new Set(),pubT:0,missing:0,t0:performance.now()});
  say(spar?`Freundschaftskampf: warte auf ${oppName}…`:`Runde ${RUN.r}: warte auf ${oppName}…`);publishDuel(true);
}
function publishDuel(force){const now=performance.now();if(!force&&now-B.pubT<60)return;B.pubT=now;const F=B.me;
  if(B.tb){const ta={};for(let t=B.turn-2;t<=B.turn;t++)if(B.tbActs['t'+t])ta['t'+t]=B.tbActs['t'+t];B.q=(B.q||0)+1;pres({du:{id:B.id,opp:B.opp,team:B.raw,tb:1,ta,q:B.q,pm:PANIC?1:0}});return}
  const shm=e=>flipOn()?[e[0],e[1],e[2],2*ACX-e[3],2*ACY-e[4],-e[5],-e[6],e[7]]:e;
  if(ROOM&&ROOM.fast){B.fsS=B.fsS||new Set();const nw=B.mySh.filter(e=>!B.fsS.has(e[0]));if(nw.length){nw.forEach(e=>B.fsS.add(e[0]));try{ROOM.fast({fs:{id:B.id,t:Math.round(now),sh:nw.map(shm)}},B.opp)}catch(e){}}}
  B.q=(B.q||0)+1;pres({du:{id:B.id,opp:B.opp,q:B.q,t:Math.round(now),team:B.raw,a:F.a,x:Math.round(fx_(F.x)),y:Math.round(fy_(F.y)),hp:F.team.map(m=>m.hp),ob:B.obGone||[],sh:B.mySh.map(shm),fx:Object.keys(F.st).filter(k=>F.st[k]>0),sg:[F.stg.a|0,F.stg.d|0,F.stg.s|0],pm:PANIC?1:0}})}
function duelSync(dt){
  const op=findPeer(B.opp);const du=op&&op.presence.du;
  if(B.state==='over')return;const now=performance.now();
  // the opponent already booked this round against me (e.g. my phone was asleep) → take the mirrored result so both sides agree
  if(!B.spar&&RUN&&op&&op.presence.mt&&op.presence.mt.id===RUN.id){const x=cleanRes(op.presence.mt.res).find(e=>e[0]===RUN.r&&e[1]===(MYPEER||'me'));
    if(x){duelResult(x[2]===1?false:x[2]===0?true:null,x[2]===1?`${B.oppName} hat den Sieg zugesprochen bekommen, während du weg warst.`:`${B.oppName} hat die Runde aufgegeben.`);return}}
  if(du&&du.id===B.id){if(du.q!==B.lq){B.lq=du.q;B.lqT=now;netSample(du,now)}
    const idle=now-(B.lqT||now);
    if(!B.tb&&(B.state==='fight'||B.state==='count')&&idle>12000&&!document.hidden){duelResult(true,`${B.oppName} reagiert nicht mehr.`);return}
    if(B.tb){const key=B.state+B.turn;if(B.tbK!==key){B.tbK=key;B.tbT=now;B.tbWarn=0}const el=now-B.tbT;
      if(B.state==='tbChoose'&&el>30000&&!B.tbWarn){B.tbWarn=1;say('Noch 10 Sekunden zum Wählen!')}
      if(B.state==='tbChoose'&&el>40000){const me=act(B.me);let i=me.m.findIndex(Boolean);say('Zeit abgelaufen — automatischer Angriff!');tbChoose({k:'move',i:Math.max(0,i)});return}
      if(B.state==='tbWait'&&el>75000&&!document.hidden){duelResult(true,`${B.oppName} hat nicht rechtzeitig gewählt.`);return}}}
  if(!du||du.id!==B.id){if(B.state==='wait'){if(performance.now()-B.t0>25000)duelResult(true,`${B.oppName} ist nie aufgetaucht.`)}else{B.missing+=dt;if(B.missing>6)duelResult(true,`${B.oppName} hat den Gerichtssaal verlassen.`)}return}
  B.missing=0;B.oppPanic=du.pm===1;
  if(B.tb){tbDuelSync(du);return}
  if(!B.foe){let ot=sanitizeTeam(du.team);if(!ot)return;if(!B.spar)ot=ot.slice(0,cfgOf().team);const left=B.me.side==='L';B.foe=mkFighter(left?'R':'L',ot,left?XR:XL,'remote');if(Number.isFinite(+du.x)&&Number.isFinite(+du.y)&&+du.x){B.foe.x=fx_(+du.x);B.foe.y=fy_(+du.y)}arenaClamp(B.foe);
    if(Array.isArray(du.sh))du.sh.forEach(e=>Array.isArray(e)&&B.seen.add(String(e[0])));{const n_=performance.now(),vx=vsStart(n_);B.state='count';B.cntEnd=n_+3000+vx;B.foe.spawnT=n_+vx}say(`${B.oppName} betritt den Gerichtssaal!`);return}
  const F=B.foe;const P_=netPos(now)||{x:+du.x?fx_(+du.x):F.x,y:+du.y?fy_(+du.y):F.y,old:1};arenaClamp(P_);if(P_.snap){F.x=P_.x;F.y=P_.y}else{const k=Math.min(1,dt*(P_.old?14:28));F.x+=(P_.x-F.x)*k;F.y+=(P_.y-F.y)*k}F.face=B.me.x<F.x?-1:1;netFast(F);
  if(Array.isArray(du.ob)&&B.obs)for(const id of du.ob){const o=B.obs.find(o=>o.id===+id);if(o&&!o.dead)breakObs(o)}
  const a=Math.floor(+du.a);if(a>=0&&a<F.team.length&&a!==F.a){F.a=a;say(`${B.oppName} schickt ${SPECIES[act(F).s].n} in den Kampf!`)}
  if(Array.isArray(du.hp))F.team.forEach((m,i)=>{const v=clamp(Math.floor(+du.hp[i]),0,m.mhp);if(Number.isFinite(v)&&v<m.hp){F.hurtT=performance.now();B.nums.push({x:F.x,y:F.y-34,t:'-'+(m.hp-v),c:'#fff',at:performance.now()});F.flash=0.25;if(v===0)say(`${SPECIES[m.s].n} ist besiegt!`)}if(Number.isFinite(v))m.hp=v});
  if(Array.isArray(du.sg))F.stg={a:clamp(du.sg[0]|0,-4,4),d:clamp(du.sg[1]|0,-4,4),s:clamp(du.sg[2]|0,-4,4)};
  F.stShow=Array.isArray(du.fx)?du.fx.filter(k=>typeof k==='string'&&k in F.st):[];
  F.out=F.team.every(m=>m.hp<=0);F.faint=act(F).hp<=0?1:0;
  if(Array.isArray(du.sh))remoteShots(F,du.sh)
}
// ---- netcode: clock offset, snapshot interpolation of the opponent, lag-compensated shots, measurement overlay
function netSample(du,now){const t=+du.t;if(!Number.isFinite(t)||!Number.isFinite(+du.x))return;const smp=now-t;B.off=B.off==null||smp<B.off?smp:B.off+(smp-B.off)*0.02;
  B.snaps=B.snaps||[];const L=B.snaps[B.snaps.length-1];if(L&&t<=L.st)return;if(L){const iv=Math.min(t-L.st,300);B.pint=B.pint==null?iv:B.pint*0.85+iv*0.15;B.pjit=B.pjit==null?0:B.pjit*0.85+Math.abs(iv-B.pint)*0.15}
  const p={x:fx_(+du.x),y:fy_(+du.y)};arenaClamp(p);B.snaps.push({st:t,x:p.x,y:p.y,jump:!!(L&&Math.hypot(p.x-L.x,p.y-L.y)>70)});if(B.snaps.length>12)B.snaps.shift()}
function netDelay(){return clamp((B.pint||66)*1.1+(B.pjit||0)*1.5+10,60,170)}
function netPos(now){const S=B.snaps;if(!S||!S.length||B.off==null)return null;const rt=now-B.off-netDelay();
  for(let i=S.length-1;i>0;i--){const a=S[i-1],b=S[i];if(rt>=a.st){if(rt>b.st)break;if(b.jump)return{x:a.x,y:a.y};const u=(rt-a.st)/Math.max(1,b.st-a.st);return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u}}}
  const b=S[S.length-1],a=S[S.length-2];if(rt<S[0].st)return{x:S[0].x,y:S[0].y};
  if(!a||b.jump)return{x:b.x,y:b.y,snap:b.jump&&!b.used&&(b.used=1)};const ex=Math.min(150,rt-b.st)/Math.max(1,b.st-a.st);return{x:b.x+(b.x-a.x)*ex,y:b.y+(b.y-a.y)*ex}}
function remoteShots(F,list){for(const e of list){if(!Array.isArray(e))continue;const id=String(e[0]).slice(0,40);if(B.seen.has(id))continue;B.seen.add(id);if(B.state!=='fight')continue;
    const ai=clamp(Math.floor(+e[1]),0,F.team.length-1),mid=MOVES[e[2]]?e[2]:'bump';const sp=shotParams(mid);let vx=+e[5]||0,vy=+e[6]||0;const L=Math.hypot(vx,vy)||1;if(L>sp.sp*1.05){vx=vx/L*sp.sp;vy=vy/L*sp.sp}
    const s={id,side:F.side,att:F.team[ai],mid,x:clamp(fx_(+e[3]||0),0,AW),y:clamp(fy_(+e[4]||0),0,AH),vx:flipOn()?-vx:vx,vy:flipOn()?-vy:vy,age:0,life:sp.life,r:sp.r,p:sp.p,mel:sp.mel,wave:sp.wave,k:sp.k,h:sp.h,nm:sp.nm,am:stageMul(stgOf(F).a)};
    // lag compensation: the shot already flew for (transfer time) on the sender's side → fast-forward it
    const st=+e[7];if(Number.isFinite(st)&&B.off!=null&&!s.mel){const ow=(pingOf(B.opp)||80)/2,el=clamp((performance.now()-B.off-st+ow)/1000,0,Math.min(0.25,s.life*0.5));
      if(!s.k){s.x+=s.vx*el;s.y+=s.vy*el;s.age=el}else if(s.k==='lob'){s.x0=s.x;s.y0=s.y;s.age=el}else if(s.k==='air')s.age=el}
    B.shots.push(s)}}
function onFastMsg(d,peer){if(!B||B.mode!=='duel'||!d||!d.fs||d.fs.id!==B.id||(B.opp&&peer&&peer!==B.opp))return;(B.fq=B.fq||[]).push(d.fs);if(B.fq.length>20)B.fq.shift()}
function netFast(F){if(ROOM&&ROOM.onFast&&!ROOM._fh){ROOM._fh=1;ROOM.onFast(onFastMsg)}if(!B.fq||!B.fq.length)return;const q=B.fq;B.fq=[];const now=performance.now();
  for(const m of q){const t=+m.t;if(Number.isFinite(t)){const smp=now-t;if(B.off==null||smp<B.off)B.off=smp}if(Array.isArray(m.sh))remoteShots(F,m.sh.slice(0,12))}}
function drawNetInfo(c,K){if(!B||B.mode!=='duel'||B.tb||!B.foe)return;const p=pingOf(B.opp);c.setTransform(K,0,0,K,0,0);
  const fq=B.fps?Math.round(B.fps):0,col=(p||0)>250||fq&&fq<40?'#ff8a8a':(p||0)>120||fq&&fq<55?'#ffcb3d':'#bfe2ff';
  vtText(c,`Ping ${p!=null?p+' ms':'–'} · Paket ${B.pint?Math.round(B.pint)+'±'+Math.round(B.pjit||0)+' ms':'–'} · ${fq||'–'} FPS`,6,AH-6,col,10)}
function duelResult(win,why){
  if(!B||B.state==='over')return;B.state='over';finale(win);say(win===true?'GEWONNEN!':win===false?'VERLOREN…':'UNENTSCHIEDEN!');if(why)say(why);
  if(B.mode==='duel')publishDuel(true);
  if(B.spar){
    if(win){const m=RUN.team[B.me.a]||RUN.team[0];const lv=B.foe?Math.round(B.foe.team.reduce((a,x)=>a+x.l,0)/B.foe.team.length):m.l;gainXp(m,xpGain(B.foe?act(B.foe).s:m.s,lv)+10).forEach(t=>say(t))}
    if(win)earn(30,'für den Sieg');sysChat(win?`Du hast den Freundschaftskampf gegen ${B.oppName} gewonnen!`:`${B.oppName} hat den Freundschaftskampf gewonnen.`);save();
    const myS=B;setTimeout(()=>{if(B===myS){closeBattle();pushMt()}},3200);return;
  }
  const sc=win===true?1:win===false?0:0.5;RUN.res=(RUN.res||[]).concat([[RUN.r,B.opp||'bot',sc]]);earn(sc===1?50:sc===0.5?20:10,'Prozesskosten-Erstattung');
  sysChat(`Runde ${RUN.r}: ${sc===1?'gewonnen':sc===0?'verloren':'draw'} against ${B.oppName||'opponent'}.`);
  RUN.r++;RUN.st=RUN.r>cfgOf().rounds||RUN.gaveUp?'done':'wait';
  save();const myB=B;setTimeout(()=>{if(B===myB){closeBattle();pushMt();showArena()}},2800);
}

/* --- battle UI --- */
function buildBattleUI(){
  const el=$('#bact');el.innerHTML='';
  for(let i=0;i<4;i++){const b=document.createElement('button');b.className='mv';b.dataset.i=i;b.onclick=()=>battleMove(i);b.innerHTML='<span class="cd"></span><span class="lbl"></span>';el.appendChild(b)}
  const row=document.createElement('div');row.className='brow';
  const add=(t,cls,fn,id)=>{const b=document.createElement('button');b.className='btn '+cls;b.textContent=t;b.onclick=fn;if(id)b.id=id;row.appendChild(b)};
  if(!B.tb)add(DASH_AP?'SPRINT · '+DASH_AP+' AP':'SPRINT','ghost',battleDash);add('WECHSELN','ghost',battleSwitch,'bsw');
  if(B.mode==='wild'){add('HALTEN: HANDSCHELLEN','',()=>{},'bcap');add('FLIEHEN','ghost',tryRun)}else if(B.mode!=='trainer')add('AUFGEBEN','red',forfeit);
  add('🎒 BEUTEL','ghost',()=>{},'bbag');add('ℹ ATTACKEN','ghost',()=>{if(B&&B.me)openMonInfo(act(B.me).s,act(B.me))});add('⚙','ghost',openSettings);
  el.appendChild(row);
  const K=SET.keys;
  if(B.tb)el.insertAdjacentHTML('beforeend',`<div class="keys">Rundenbasiert · wähle eine Aktion: Attacken${['a1','a2','a3','a4'].map(a=>keyLabel(K[a])).join('/')} · Wechseln: ${keyLabel(K.sw)}${B.mode==='wild'?` · Handschellen: ${keyLabel(K.cap)} · Fliehen: ${keyLabel(K.run)}`:''}</div>`);else
  el.insertAdjacentHTML('beforeend',`<div class="keys">Laufen: WASD (oder aufs Kampffeld drücken) · Zielen: Pfeiltasten (frei: auch die Maus) · Attacken: ${['a1','a2','a3','a4'].map(a=>keyLabel(K[a])).join('/')} · Sprint: ${keyLabel(K.dash)} · Wechseln: ${keyLabel(K.sw)}${B.mode==='wild'?` · Handschellen: ${keyLabel(K.cap)} · Fliehen: ${keyLabel(K.run)}`:''}</div>`);
  {const bb=$('#bbag');if(bb){bindBag(bb);B.bagK=null;bagLabel(true)}}
  const cb=$('#bcap');if(cb){cb.onclick=null;cb.addEventListener('pointerdown',e=>{e.preventDefault();capPress()});['pointerup','pointerleave','pointercancel'].forEach(ev=>cb.addEventListener(ev,()=>capRelease()))}
  placeDpad();
  B.uiKey='';
}
// choose the lead during the start countdown, or the next monster during a round pause
// monster choice as a slot-machine reel: A/D (or ◀ ▶) spin left/right, X or a tap on the middle card confirms
function pickMode(){if(!(B&&!B.tb&&B.me&&!B.closing))return null;const alive=B.me.team.filter(m=>m.hp>0).length;
  if(B.state==='count'&&!B.leadDone&&alive>1)return'lead';if(B.state==='break'&&B.brk&&B.brk.me&&alive>1)return'next';if(B.state==='break'&&B.brk&&!B.brk.me&&alive>1)return'swap';if(B.state==='fight'&&B.qsel&&alive>1)return'quick';return null}
function reelList(){return B.me.team.map((m,i)=>i).filter(i=>B.me.team[i].hp>0)}
function reelInit(mode){const L=reelList();let cur=mode==='next'?L.find(i=>i!==B.me.a)??L[0]:B.me.a;if(!L.includes(cur))cur=L[0];B.reel={mode,pos:L.indexOf(cur),dir:0}}
function reelSpin(d){const mode=pickMode();if(!mode)return;if(!B.reel||B.reel.mode!==mode)reelInit(mode);const L=reelList();B.reel.pos=(B.reel.pos+d+L.length)%L.length;B.reel.dir=d;$('#bpick').dataset.k=''}
function reelConfirm(){const mode=pickMode();if(!mode)return;if(!B.reel||B.reel.mode!==mode)reelInit(mode);const i=reelList()[B.reel.pos];if(i==null)return;B.reel=null;
  if(mode==='quick'){quickPick(i);return}
  if(mode==='lead'){if(i!==B.me.a||B.me.spawnT===Infinity){B.me.a=i;B.me.spawnT=performance.now()+480;say(`Los, ${SPECIES[act(B.me).s].n}!`);if(B.mode==='duel')publishDuel(true)}if(B.leadWait){B.leadWait=false;B.leadDone=1;B.cntEnd=performance.now()+3000}else B.leadPicked=1}
  else if(mode==='swap'){B.brk.mine=i;if(B.mode!=='duel')B.brk.end=Math.min(B.brk.end,performance.now()+300)}
  else if(mode==='next'){B.brk.choice=i;B.brk.end=Math.min(B.brk.end,performance.now()+500)}
  $('#bpick').dataset.k=''}
function renderPick(){const el=$('#bpick');if(!el)return;const mode=pickMode();
  if(mode!=='quick'&&B)B.qsel=false;
  if(!mode||(mode==='lead'&&B.leadPicked)){if(el.classList.contains('on')){el.classList.remove('on');el.dataset.k=''}if(B&&!mode)B.reel=null;return}
  if(!B.reel||B.reel.mode!==mode)reelInit(mode);
  const L=reelList(),n=L.length,pos=B.reel.pos,timed=B.mode==='duel'&&mode!=='quick';
  const left=timed?Math.max(0,Math.ceil(((mode==='lead'?B.cntEnd:B.brk.end)-performance.now())/1000)):'';
  const key=mode+pos+n+B.me.a+B.me.team.map(m=>m.s+m.hp).join()+left;if(el.dataset.k===key)return;el.dataset.k=key;
  const card=(off,cls)=>{const i=L[((pos+off)%n+n)%n],m=B.me.team[i];const act_=i===B.me.a;
    return`<div class="rc ${cls}" data-rk="${off}"><canvas width="52" height="52"></canvas><div class="rn">${nameHtml(m.s)}</div><div class="small">Lv ${m.l} · ${m.hp}/${m.mhp}${act_&&mode!=='next'?' · aktiv':''}</div><div class="rh"><i style="width:${Math.round(m.hp/m.mhp*100)}%;background:${m.hp/m.mhp>0.5?'#3ddc6b':m.hp/m.mhp>0.2?'#ffcb3d':'#ef4444'}"></i></div></div>`};
  const title=mode==='lead'?'WER BEGINNT?':mode==='swap'?'GEGNER WECHSELT — DU AUCH?':mode==='quick'?'WECHSELN':'NÄCHSTES MONSTER';
  const curI=L[pos],btxt=mode==='swap'&&curI===B.me.a?'BEHALTEN':mode==='quick'&&curI===B.me.a?'ABBRECHEN':'LOS!';
  el.innerHTML=`<div class="t">${title}${left!==''?' · '+left:''}</div>
    <div class="reel ${B.reel.dir>0?'spinR':B.reel.dir<0?'spinL':''}"><button class="ra" data-rd="-1">◀</button>${n>2?card(-1,'side'):''}${card(0,'mid')}${n>1?card(1,'side'):''}<button class="ra" data-rd="1">▶</button></div>
    <button class="btn" id="rgo" style="margin-top:6px">${btxt} <span class="small">(${esc(keyLabel(SET.keys.sw))})</span></button>
    <div class="small" style="margin-top:4px">A / D drehen · ${esc(keyLabel(SET.keys.sw))} bestätigen${mode==='quick'?' · Esc schließt':''}</div>`;
  B.reel.dir=0;
  el.querySelectorAll('.rc').forEach(c=>{const off=+c.dataset.rk,i=L[((pos+off)%n+n)%n];const cx=c.querySelector('canvas').getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(monSprite(B.me.team[i].s,24),0,0,52,52);
    c.onpointerdown=e=>{e.preventDefault();e.stopPropagation();if(off===0)reelConfirm();else reelSpin(off)}});
  el.querySelectorAll('[data-rd]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();e.stopPropagation();reelSpin(+b.dataset.rd)});
  $('#rgo').onpointerdown=e=>{e.preventDefault();e.stopPropagation();reelConfirm()};
  el.classList.add('on')}
function updateBattleUI(){try{renderPick()}catch(e){console.error(e)}try{bagLabel()}catch(e){}
  const F=B.me;const mon=act(F);const key=mon.s+F.a+mon.m.join();
  const btns=document.querySelectorAll('#bact .mv');
  if(key!==B.uiKey){B.uiKey=key;btns.forEach((b,i)=>{const mid=mon.m[i];b.style.visibility=mid?'visible':'hidden';if(!mid)return;const mv=MOVES[mid];b.style.background=TYPES[mv.t].c;b.querySelector('.lbl').innerHTML=`<span class="k">${isMob()?'':esc(keyLabel(SET.keys['a'+(i+1)]))}</span> ${esc(mv.n)}<small>${esc(moveDesc(mid).replace(/^\w+ · /,''))}</small>`})}
  const lock=B.tb&&B.state!=='tbChoose';document.querySelectorAll('#bact button').forEach(b=>{if(b.textContent!=='⚙')b.disabled=lock});
  btns.forEach((b,i)=>{const mid=mon.m[i];if(!mid)return;b.querySelector('.cd').style.width=B.tb?'0%':(F.cd[i]/cdOf(mid)*100)+'%';const have=B.tb?Math.min(AP_MAX,(F.ap??AP_MAX)+TB_AP_REGEN):(F.ap??AP_MAX);b.style.filter=have<apCost(mid)?'grayscale(.8) brightness(.7)':''});
  const cap=$('#bcap');if(cap)cap.textContent=B.aim?'LOSLASSEN ZUM WERFEN!':B.capGreat?'HALTEN: SUPER-HANDSCHELLEN':`HALTEN: HANDSCHELLEN (${RUN.kap})`;
  if(B.aim&&performance.now()-B.aim.t0>4500)capRelease();
}
const bcv=$('#bcv'),bc=bcv.getContext('2d');
// battle camera: follows both fighters and zooms in when they are close (more on phones, most when held upright); never shows past the rim
const CAMY=(58+AH)/2;
function camZMax(){return isMob()?(document.body.classList.contains('portrait')?1.7:1.4):1.2}
function updateCam(now){const C=B.cam||(B.cam={x:AW/2,y:CAMY,z:1,t:now});const dt=Math.min(0.1,(now-C.t)/1000);C.t=now;
  const fs=[B.me,B.foe].filter(F=>F&&!(F.out&&act(F).hp<=0));let tx=AW/2,ty=CAMY,tz=1;
  if(fs.length){const x0=Math.min(...fs.map(F=>F.x))-64,x1=Math.max(...fs.map(F=>F.x))+64,y0=Math.min(...fs.map(F=>F.y))-58,y1=Math.max(...fs.map(F=>F.y))+16;
    tz=clamp(Math.min(AW/(x1-x0),(AH-58)/(y1-y0)),1,camZMax());tx=(x0+x1)/2;ty=(y0+y1)/2}
  const k=C.init?Math.min(1,dt*3.2):1;C.init=1;C.z+=(tz-C.z)*k;C.x+=(tx-C.x)*k;C.y+=(ty-C.y)*k;
  C.x=clamp(C.x,AW/2/C.z,AW-AW/2/C.z);C.y=clamp(C.y,CAMY/C.z,AH-(AH-CAMY)/C.z);return C}
function w2s(x,y){const C=B.cam||{x:AW/2,y:CAMY,z:1};return[(x-C.x)*C.z+AW/2,(y-C.y)*C.z+CAMY]}
function toArena(e){const r=bcv.getBoundingClientRect(),C=B.cam||{x:AW/2,y:CAMY,z:1};const sx=(e.clientX-r.left)/r.width*AW,sy=(e.clientY-r.top)/r.height*AH;return{x:C.x+(sx-AW/2)/C.z,y:C.y+(sy-CAMY)/C.z+18/C.z}}
bcv.addEventListener('pointerdown',e=>{if(!B||isMob())return;bcv.setPointerCapture(e.pointerId);B.ptr=toArena(e)});
bcv.addEventListener('pointermove',e=>{if(B&&B.ptr)B.ptr=toArena(e);if(B&&!B.tb&&!isMob()&&aimMode()===2&&B.me){const p=toArena(e);setAim(p.x-B.me.x,p.y-18/((B.cam&&B.cam.z)||1)-(B.me.y-14))}});
['pointerup','pointercancel'].forEach(ev=>bcv.addEventListener(ev,()=>{if(B)B.ptr=null}));
const BBG={};
// GERICHTSSAAL: parquet floor inside a wooden barrier, judge's bench with ⚖ at the top, public benches at the sides
function courtBG(){const W=AW/2,H=AH/2,cv=mk(W,H),c=cv.getContext('2d'),r=mulberry32(4711);
  const cx=ACX/2,cy=(ACY-10)/2,rx=(ARX+20)/2,ry=(ARY+22)/2,P=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  // walls: dark wood panelling
  P(0,0,W,H,'#3b2414');for(let x=0;x<W;x+=6){P(x,0,1,H,'#2c190d');P(x+1,0,1,H,'#46301c')}
  for(let y=10;y<H;y+=24)P(0,y,W,1,'#2c190d');
  // public benches left and right
  for(const sx of[6,W-34])for(let y=34;y<H-14;y+=14){P(sx,y,28,7,'#1c0f07');P(sx+1,y+1,26,4,'#7a4a24');P(sx+1,y+1,26,1,'#9a6232');P(sx+2,y+5,2,3,'#1c0f07');P(sx+24,y+5,2,3,'#1c0f07')}
  // floor inside the barrier: parquet planks
  const id=c.getImageData(0,0,W,H),d=id.data,wood=[[150,96,52],[168,110,60],[138,86,46],[180,122,70]];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const e=((x-cx)/rx)**2+((y-cy)/ry)**2;if(e>=1)continue;
    const row=Math.floor(y/3),off=(row%2)*6,pl=Math.floor((x+off)/12);let col=wood[(pl*7+row*3)%4].slice();
    if(y%3===0||(x+off)%12===0)col=col.map(v=>v*0.72);if(BAYER[(y&3)*4+(x&3)]>0.85)col=col.map(v=>v*1.06);
    if(Math.abs(x-cx)<7&&y>cy-ry)col=[128,36,36].map((v,i)=>v*(Math.abs(x-cx)>5?0.75:1));   // red carpet runner
    if(e>0.86)col=col.map(v=>v*0.82);
    const o=(y*W+x)*4;d[o]=Math.min(255,col[0]);d[o+1]=Math.min(255,col[1]);d[o+2]=Math.min(255,col[2]);d[o+3]=255}
  c.putImageData(id,0,0);
  // wooden barrier (Schranke) around the floor, balusters
  for(let a=0;a<720;a++){const t=a/720*6.283,x=Math.round(cx+Math.cos(t)*(rx+1)),y=Math.round(cy+Math.sin(t)*(ry+1));P(x,y,2,2,'#5a3418');P(x,y-1,2,1,'#8a5530')}
  for(let a=0;a<48;a++){const t=a/48*6.283,x=Math.round(cx+Math.cos(t)*(rx+3)),y=Math.round(cy+Math.sin(t)*(ry+3));P(x,y,1,3,'#2c190d')}
  // judge's bench
  const bw=84,bx=Math.round(cx-bw/2);P(bx-2,3,bw+4,22,'#1c0f07');P(bx,4,bw,8,'#8a5530');P(bx,4,bw,1,'#b07a45');P(bx,12,bw,12,'#6b3f1f');
  for(let x=bx+6;x<bx+bw-4;x+=13)P(x,14,9,8,'#5a3418');
  for(const sx of[bx+16,bx+bw/2-5,bx+bw-26]){P(sx,0,10,5,'#1c0f07');P(sx+1,0,8,4,'#8a1f2a')}   // judges' chairs (red)
  // ⚖ emblem in gold
  const ex=Math.round(cx),ey=14;P(ex-1,ey-1,3,9,'#9a6a00');P(ex,ey-1,1,9,'#ffcb3d');P(ex-7,ey,15,1,'#ffcb3d');
  for(const s_ of[-6,5]){P(ex+s_-1,ey+1,1,3,'#ffcb3d');P(ex+s_-3,ey+4,6,1,'#ffcb3d');P(ex+s_-2,ey+5,4,1,'#9a6a00')}P(ex-3,ey+8,7,1,'#ffcb3d');
  // witness stand and prosecutor/defence desks just outside the barrier
  P(6,8,24,12,'#1c0f07');P(7,9,22,4,'#8a5530');P(7,13,22,6,'#6b3f1f');P(W-30,8,24,12,'#1c0f07');P(W-29,9,22,4,'#8a5530');P(W-29,13,22,6,'#6b3f1f');
  P(12,10,6,1,'#f2f2f2');P(W-22,10,5,1,'#f2f2f2');P(W-22,11,4,1,'#d9d9d9');
  return cv}
function battleBG(z){if(BBG[z])return BBG[z];if(z==='arena')return BBG[z]=courtBG();
  // new areas reuse a base layout with their own palettes
  if(z==='snow'||z==='desert'||z==='jungle'){const sw={snow:{meadow:RGB.snow,leaf:RGB.pine,dirt:RGB.stone},desert:{hills:RGB.desert,dirt:RGB.sand},jungle:{forest:RGB.jungle,dirt:RGB.dirt}}[z],base={snow:'north',desert:'west',jungle:'east'}[z],keep={};
    for(const k in sw){keep[k]=RGB[k];RGB[k]=sw[k]}let out;try{const saved=BBG[base];delete BBG[base];out=battleBG(base);if(saved)BBG[base]=saved;else delete BBG[base]}finally{for(const k in keep)RGB[k]=keep[k]}return BBG[z]=out}const W=AW/2,H=AH/2,cv=mk(W,H),c=cv.getContext('2d'),id=c.createImageData(W,H),d=id.data;
  const seed=hashStr(z),nL=noise2(seed,22,W,H),nS=noise2(seed+1,6,W,H),nD=noise2(seed+2,10,W,H);
  const gp=z==='east'?RGB.forest:z==='south'?RGB.shore:z==='west'?RGB.hills:RGB.meadow;
  // round arena seen from above: floor oval (a bit larger than where the feet may go), a rim, scenery outside
  const cx=ACX/2,cy=(ACY-10)/2,rx=(ARX+20)/2,ry=(ARY+22)/2;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dth=BAYER[(y&3)*4+(x&3)]*0.22,e=((x-cx)/rx)**2+((y-cy)/ry)**2;let v,pal;
    // floor of the round arena, themed per location
    if(e<1){v=nL(x,y)*0.62+nS(x,y)*0.38+dth;pal=gp;
      if(z==='knast'){pal=RGB.stone;v=0.52+nS(x,y)*0.22+dth+(e>0.82?-0.12:0)-((x%9===0||y%7===0)?0.16:0)}
      else if(z==='south'){pal=RGB.sand;v=0.45+nL(x,y)*0.35+dth-(e>0.78?0.22:0)}
      else if(z==='east'){pal=nD(x,y)>0.5?RGB.dirt:RGB.forest;v=nL(x,y)*0.5+nS(x,y)*0.3+dth-(pal===RGB.dirt?0.12:0)}
      else if(z==='west'){pal=nD(x,y)>0.62?RGB.hills:RGB.dirt;v=0.3+nS(x,y)*0.45+dth}
      else if(nD(x,y)>0.68)pal=RGB.dirt;
      if(e>0.9&&z!=='knast'&&z!=='south')v-=0.18}
    // rim: flower hedge (meadow), roots (woods), surf (shore), cliffs (hills), stone wall (arena)
    else if(e<1.16){if(z==='north'){pal=RGB.leaf;v=0.25+nS(x,y)*0.5+dth}else if(z==='east'){pal=RGB.dirt;v=0.06+nS(x,y)*0.3+dth*0.6}
      else if(z==='south'){pal=RGB.water;v=0.62+nS(x,y)*0.3+dth}else if(z==='knast'){pal=RGB.stone;v=0.3+nS(x,y)*0.3+dth+(e<1.05?0.3:0)-(y<cy?0.1:0)}
      else{pal=RGB.rock;v=0.2+nS(x,y)*0.45+dth-(y<cy?0.15:0)+(e<1.05?0.25:0)}}
    else{if(z==='south'){pal=RGB.water;v=0.35+nL(x,y)*0.4+dth*0.6}else if(z==='knast'){pal=RGB.stone;v=0.12+((x+y*3)%5===0?0.25:0)+nS(x,y)*0.15}
      else if(z==='west'){pal=RGB.hills;v=0.15+nL(x,y)*0.5+dth}else{pal=z==='east'?RGB.forest:RGB.meadow;v=0.1+nL(x,y)*0.45+dth}}
    const cc=pal[clamp(Math.floor(v*pal.length),0,pal.length-1)],o=(y*W+x)*4;d[o]=cc[0];d[o+1]=cc[1];d[o+2]=cc[2];d[o+3]=255}
  const r=mulberry32(seed+9),outside=(x,y,m)=>((x-cx)/(rx+m))**2+((y-cy)/(ry+m))**2>1,onRim=(x,y)=>{const e=((x-cx)/rx)**2+((y-cy)/ry)**2;return e>=1&&e<1.16};
  if(z==='north'||z==='east'){const lp=z==='east'?RGB.leafF:RGB.leaf;for(let i=0;i<70;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);if(outside(x,y,6))paintCanopy(d,W,H,x,y,4+Math.floor(r()*3),lp,seed+i*7)}}
  c.putImageData(id,0,0);
  if(z==='west'){for(let i=0;i<26;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);if(outside(x,y,5))paintRock(c,x,y,2+Math.floor(r()*3),r)}}
  if(z==='south'){c.fillStyle='#ffffff55';for(let i=0;i<40;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);if(outside(x,y,4))c.fillRect(x,y,2+Math.floor(r()*3),1)}}
  if(z==='knast'){const cols=['#ef4444','#3b82f6','#ffcb3d','#3ddc6b','#a855f7','#f2f2f2'];for(let i=0;i<260;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);if(outside(x,y,3)){c.fillStyle=cols[i%cols.length];c.fillRect(x,y,1,1);c.fillStyle='#e8c9a0';c.fillRect(x,y-1,1,1)}}
    c.fillStyle='#ffffff50';for(let a=0;a<96;a++){const t=a/96*6.283;c.fillRect(Math.round(cx+Math.cos(t)*14),Math.round(cy+Math.sin(t)*9),1,1)}c.fillRect(Math.round(cx-rx+6),Math.round(cy),Math.round(rx*2-12),1)}
  // rim details
  for(let i=0;i<900;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);if(!onRim(x,y))continue;
    if(z==='north'&&i%3===0){c.fillStyle=['#ff7aa8','#ffd23f','#ffffff','#b48cff'][i%4];c.fillRect(x,y,1,1)}
    else if(z==='south'&&i%2===0){c.fillStyle='#ffffffb0';c.fillRect(x,y,1+(i%3===0?1:0),1)}
    else if(z==='east'&&i%5===0){c.fillStyle='#2a1a0c';c.fillRect(x,y,2,1)}
    else if(z==='west'&&i%6===0){c.fillStyle='#e0e0d8';c.fillRect(x,y,1,1)}}
  if(z==='west')for(let i=0;i<60;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);if(!outside(x,y,-3)){c.fillStyle=i%2?'#8a8a86':'#5e5e5a';c.fillRect(x,y,1,1)}}
  if(z==='east')for(let i=0;i<40;i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);if(!outside(x,y,-3)){c.fillStyle=i%2?'#a06a2a':'#c98a3a';c.fillRect(x,y,1,1)}}
  for(let i=0;i<18&&z!=='knast';i++){const x=Math.floor(r()*W),y=Math.floor(r()*H);if(!outside(x,y,-4)){c.fillStyle=z==='east'?'#1d4416':'#3a7424';c.fillRect(x,y,1,1);c.fillRect(x+1,y-1,1,1)}}
  BBG[z]=cv;return cv}
const FLOORS0={north:['#5cb848','#53ad40'],east:['#3f8f3a','#378234'],south:['#ecd79a','#e2cb8a'],west:['#c9a66b','#bb985f'],arena:['#8a8ea6','#7d8199'],knast:['#8a8ea6','#7d8199']};
function pxText(c,t,x,y,col,size,align){c.font=`${size||8}px "Press Start 2P",monospace`;c.textAlign=align||'left';if(!isDarkCol(col)){c.fillStyle='#14141f';c.fillText(t,x+1,y+1)}c.fillStyle=col;c.fillText(t,x,y);c.textAlign='left'}
function isDarkCol(col){if(typeof col!=='string'||col[0]!=='#'||col.length<7)return false;const[r,g,b]=hex2rgb(col.slice(0,7));return r*0.3+g*0.59+b*0.11<90}
function vtText(c,t,x,y,col,size,align){c.font=`${size||10}px VT323,monospace`;c.textAlign=align||'left';if(!isDarkCol(col)){c.fillStyle='#14141f';c.fillText(t,x+1,y+1)}c.fillStyle=col;c.fillText(t,x,y);c.textAlign='left'}
// original two-tone pill capsule (teal / yellow)
// handcuffs (they replace the old capsule balls): two steel cuffs on a short chain, they spring open when the catch fails
function drawCapsule(c,x,y,rot,open){c.save();c.translate(Math.round(x/2)*2,Math.round(y/2)*2);c.rotate(rot||0);c.scale(1.5,1.5);
  const g=open?2:0;
  const cuff=(cx)=>{c.fillStyle='#14141f';c.fillRect(cx-3,-4,7,8);c.fillRect(cx-4,-3,9,6);
    c.fillStyle='#c8ccd6';c.fillRect(cx-3,-3,7,6);c.fillRect(cx-2,-4,5,8);
    c.fillStyle='#14141f';c.fillRect(cx-1,-2,3,4);c.fillRect(cx-2,-1,5,2);
    c.fillStyle='#ffffff';c.fillRect(cx-2,-3,2,1);c.fillStyle='#7d8290';c.fillRect(cx+1,2,2,1)};
  cuff(-5-g);cuff(5+g);
  c.fillStyle='#14141f';c.fillRect(-2-g,-1,4+2*g,3);c.fillStyle='#9aa0ad';c.fillRect(-2-g,0,1+g,1);c.fillRect(1,0,1+g,1);c.fillStyle='#c8ccd6';c.fillRect(-1,0,2,1);
  c.restore()}
const KSPR={};function darkSprite(sid,N){const k=sid+':'+N;if(KSPR[k])return KSPR[k];const src=monSprite(sid,N);const c=mk(src.width,src.height),x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#14141f';x.fillRect(0,0,src.width,src.height);KSPR[k]=c;return c}
const ENC_MS=1100,ENC_ME=800;
// wild encounter like the handhelds: the monster slides in as a dark silhouette, flashes into colour, then a short ID card introduces it
// wild monsters first appear full-screen with an info card (10 s, tap/click/key skips)
const WI_MS=10000;
function wiSkip(){const W=B.wi,now=performance.now(),e=now-W.t0;if(e<350||W.dur-e<350)return false;const cut=W.dur-e-250;W.dur=e+250;
  if(B.enc)B.enc.t0-=cut;B.enterT-=cut;for(const F of[B.me,B.foe])if(F&&F.spawnT)F.spawnT-=cut;
  clearTimeout(B.introTO);B.introTO=setTimeout(B.introGo,Math.max(0,B.introAt-cut-now));B.introAt-=cut;
  if(B.losTO){clearTimeout(B.losTO);const myB=B;B.losTO=setTimeout(()=>{if(B===myB)say(`Los, ${SPECIES[act(B.me).s].n}!`)},Math.max(0,B.losAt-cut-now))}return true}
function drawWildIntro(c,now){const V=B.wi,e=now-V.t0;if(e<0)return;if(e>V.dur){B.wi=null;return}const W=V.mon||B.wild;if(!W){B.wi=null;return}const sp=SPECIES[W.s],col=TYPES[sp.t].c;
  const fin=clamp(e/250,0,1),fout=e>V.dur-250?clamp((V.dur-e)/250,0,1):1;c.save();c.globalAlpha=Math.min(fin,fout);
  c.fillStyle='#0b0d16';c.fillRect(0,0,UW,UH);
  // classic encounter look: a broad diagonal band in the monster's type colour slides in, with speed streaks running along it
  {const sl=1-Math.pow(1-clamp(e/380,0,1),3),off=Math.round((1-sl)*UW*1.2),yA=36,yB=126,dy=34,band=(c0,a,b)=>{c.fillStyle=c0;c.beginPath();c.moveTo(-off,a+dy);c.lineTo(UW-off+UW*0.2,a-dy);c.lineTo(UW-off+UW*0.2,b-dy);c.lineTo(-off,b+dy);c.closePath();c.fill()};
   band('#14141f',yA-6,yB+6);band(col,yA,yB);band('#ffffff30',yA,yA+10);band('#00000030',yB-12,yB);
   c.save();c.beginPath();c.moveTo(-off,yA+dy);c.lineTo(UW-off+UW*0.2,yA-dy);c.lineTo(UW-off+UW*0.2,yB-dy);c.lineTo(-off,yB+dy);c.closePath();c.clip();
   c.fillStyle='#ffffff40';for(let i=0;i<14;i++){const t=((i*61+e*0.35)%(UW+80))-40,y=yA+8+(i*29)%(yB-yA-16),x=UW-t;c.save();c.translate(x,y+(UW/2-x)*(2*dy/UW)*-1);c.rotate(-Math.atan2(2*dy,UW*1.2));c.fillRect(0,0,24+i%3*14,2);c.restore()}c.restore()}
  const pop=1-Math.pow(1-clamp(e/420,0,1),3),bob=Math.round(Math.sin(e/260)*2),img=monSprite(W.s,24),S=Math.round(118*pop);
  c.imageSmoothingEnabled=false;c.fillStyle='#00000055';c.beginPath();c.ellipse(UW/2,130,46*pop,7*pop,0,0,7);c.fill();
  if(S>0)c.drawImage(e<420?whiteSprite(W.s,24):img,Math.round(UW/2-S/2),Math.round(136-S)+bob,S,S);
  vtText(c,V.title||(B.legend?'★ EIN LEGENDÄRES MONSTER! ★':'EIN WILDES MONSTER!'),UW/2,12,B.legend?'#ffcb3d':'#ffffff',10,'center');
  // info card
  const x=8,w=UW-16,y=142,h=UH-y-14,slide=1-Math.pow(1-clamp((e-200)/350,0,1),3),yy=Math.round(y+(1-slide)*80);
  c.fillStyle='#14141f';c.fillRect(x-2,yy-2,w+4,h+4);c.fillStyle='#f6f1e1';c.fillRect(x,yy,w,h);c.fillStyle=col;c.fillRect(x,yy,4,h);
  vtText(c,sp.n,x+9,yy+11,'#14141f',11);vtText(c,'Lv '+W.l,x+w-5,yy+11,'#14141f',10,'right');
  c.fillStyle=col;c.fillRect(x+9,yy+16,40,10);vtText(c,TYPES[sp.t].n.toUpperCase(),x+29,yy+24,'#ffffff',8,'center');
  const rr=rarOf(W.s);c.fillStyle='#14141f';c.fillRect(x+53,yy+16,58,10);vtText(c,rr.n.toUpperCase(),x+82,yy+24,rr.c,8,'center');
  if(sp.law){c.font='8px VT323,monospace';let L=sp.law;const mw=w-122;while(L.length>4&&c.measureText(L).width>mw)L=L.slice(0,-2);if(L!==sp.law)L=L.slice(0,-1)+'…';vtText(c,L,x+117,yy+24,'#4b4f63',8)}
  const txt=(typeof dexText==='function'?dexText(W.s):'')||'';const lines=vsWrap(c,txt,w-18).slice(0,3);lines.forEach((l,i)=>vtText(c,l,x+9,yy+37+i*9,'#2b2f40',9));
  vtText(c,isMob()?'▶ tippen zum Überspringen':'▶ Klick/Taste zum Überspringen',UW/2,UH-3,'#9aa1bd',8,'center');
  c.restore()}
function drawEncounter(c,now){const E=B.enc,e=now-E.t0;if(e>E.dur+200){B.enc=null;return}const W=B.wild;if(!W)return;const sp=SPECIES[W.s];
  if(e>520&&e<640){c.fillStyle='#ffffff';c.globalAlpha=1-(e-520)/120;c.fillRect(0,0,UW,UH);c.globalAlpha=1}
}
const WSPR={};function whiteSprite(sid,N){const k=sid+':'+N;if(WSPR[k])return WSPR[k];const src=monSprite(sid,N);const c=mk(src.width,src.height),x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#ffffff';x.fillRect(0,0,src.width,src.height);WSPR[k]=c;return c}
function finale(win){if(!B||B.fin)return;const now=performance.now();B.fin={t0:now,win};B.shakeUntil=now+400;
  if(win===true){const W=B.me;for(let i=0;i<70;i++)B.parts.push({x:Math.random()*AW,y:-10-Math.random()*60,vx:(Math.random()-.5)*30,vy:40+Math.random()*60,life:3,age:0,c:['#ffcb3d','#3ddc6b','#4aa3ff','#ef4444','#c27bff','#ffffff'][i%6],conf:1})}}
function drawFinale(c,now){const f=B.fin,k=(now-f.t0)/1000;
  if(k<0.18){c.fillStyle=`rgba(255,255,255,${0.8*(1-k/0.18)})`;c.fillRect(0,0,UW,UH)}
  if(f.win===false){c.fillStyle=`rgba(10,10,20,${Math.min(0.55,k*0.6)})`;c.fillRect(0,0,UW,UH)}
  const txt=f.win===true?'SIEG!':f.win===false?'NIEDERLAGE…':'UNENTSCHIEDEN',col=f.win===true?'#ffcb3d':f.win===false?'#ef4444':'#ffffff';
  const sk=clamp((k-0.35)/0.45,0,1),ease=1-Math.pow(1-sk,3);const bx=-140+(UW/2+140)*ease+Math.sin(k*8)*(1-sk)*6;
  if(k>0.35){c.fillStyle='#0b0d16d8';c.fillRect(0,86,UW,26);c.fillStyle=col;c.fillRect(0,86,UW,2);c.fillRect(0,110,UW,2);
    const sc=1+Math.max(0,0.25-Math.abs(k-0.8))*1.2;c.save();c.translate(bx,104);c.scale(sc,sc);pxText(c,txt,0,0,col,14,'center');c.restore()}
  if(f.win===true&&B.me&&act(B.me).hp>0&&k>0.4){const[wx_,wy_]=w2s(B.me.x,B.me.y),X=Math.round(wx_/UI),Y=Math.round(wy_/UI);c.fillStyle='#ffe14d';for(let i=0;i<8;i++){const a=i/8*6.28+k*3;c.fillRect(Math.round(X+Math.cos(a)*22),Math.round(Y-20+Math.sin(a)*14),2,2)}}
}
// sleeping: three Z's drifting up and swaying; confused: birds and question marks circling the head
function drawZzz(c,X,Y,now){for(let i=0;i<3;i++){const k=((now/1400)+i/3)%1,x=X+8+k*10+Math.sin(k*6+i)*3,y=Y-34-k*22,sz=k<0.5?3:k<0.8?4:5,a=k<0.15?k/0.15:k>0.8?(1-k)/0.2:1;
  c.globalAlpha=a;c.fillStyle='#14141f';const Z=(ox,oy,col)=>{c.fillStyle=col;c.fillRect(Math.round(x+ox),Math.round(y+oy),sz,1);c.fillRect(Math.round(x+ox),Math.round(y+oy+sz-1),sz,1);for(let j=1;j<sz-1;j++)c.fillRect(Math.round(x+ox+sz-1-j),Math.round(y+oy+j),1,1)};Z(1,1,'#14141f');Z(0,0,'#c4b5fd');c.globalAlpha=1}}
function drawConf(c,X,Y,now){const t=now/1000;for(let i=0;i<4;i++){const a=t*3.2+i*Math.PI/2,x=Math.round(X+Math.cos(a)*12),y=Math.round(Y-38+Math.sin(a)*4),front=Math.sin(a)>0;
  c.globalAlpha=front?1:0.55;if(i%2){c.fillStyle='#14141f';c.fillRect(x-1,y-2,4,6);c.fillStyle='#f472b6';c.fillRect(x,y-1,2,1);c.fillRect(x+1,y,1,1);c.fillRect(x,y+1,1,1);c.fillRect(x,y+3,1,1)}
  else{const fl=Math.floor(t*10+i)%2;c.fillStyle='#14141f';c.fillRect(x-2,y-1,5,3);c.fillStyle='#ffe14d';c.fillRect(x-1,y,3,1);c.fillRect(x+(fl?-2:2),y-(fl?1:0),1,1);c.fillStyle='#ff8a3d';c.fillRect(x+2,y,1,1)}}c.globalAlpha=1}
function hudPanel(c,x,y,F,right,label){
  const mon=act(F);const w=112,h=33;const X=right?x-w:x;
  c.fillStyle='#14141f';c.fillRect(X-1,y-1,w+2,h+2);c.fillStyle='#f6f1e1';c.fillRect(X,y,w,h);c.fillStyle='#d9d2bb';c.fillRect(X,y+h-2,w,2);
  {c.font='10px VT323,monospace';const lv='Lv'+mon.l,max=w-12-c.measureText(lv).width;let t=(label?label+': ':'')+SPECIES[mon.s].n;let fs=10;
   while(fs>7&&(c.font=fs+'px VT323,monospace',c.measureText(t).width>max))fs--;c.font=fs+'px VT323,monospace';
   if(c.measureText(t).width>max){while(t.length>3&&c.measureText(t+'…').width>max)t=t.slice(0,-1);t+='…'}
   {const sp_=SPECIES[mon.s],sx_=sp_.sfx&&t.endsWith(sp_.sfx)?sp_.sfx:null;vtText(c,t,X+4,y+10,'#14141f',fs);if(sx_){c.font=fs+'px VT323,monospace';const ox=c.measureText(t.slice(0,t.length-sx_.length)).width;c.fillStyle='#14141f';c.fillText(sx_,X+4+ox+0.6,y+10)}}vtText(c,lv,X+w-4,y+10,'#14141f',10,'right')}
  c.fillStyle='#14141f';c.fillRect(X+4,y+13,w-8,6);c.fillStyle='#4b4f63';c.fillRect(X+5,y+14,w-10,4);
  const r=clamp(mon.hp/mon.mhp,0,1);c.fillStyle=hpColor(r);c.fillRect(X+5,y+14,Math.round((w-10)*r),4);
  c.fillStyle='#ffffff55';c.fillRect(X+5,y+14,Math.round((w-10)*r),1);
  if(F.ctrl!=='remote'){const ap=clamp((F.ap??AP_MAX)/AP_MAX,0,1),sh=F.apShake&&performance.now()-F.apShake<300?Math.round(Math.sin(performance.now()/25)*1.5):0;
    c.fillStyle='#14141f';c.fillRect(X+4+sh,y+21,62,4);c.fillStyle='#2b3350';c.fillRect(X+5+sh,y+22,60,2);const boost=(F.apMul||1)>1.2&&(F.ap??AP_MAX)<AP_MAX,frozen=F.noRegen>0;c.fillStyle=ap<0.2?'#ef4444':frozen?'#7a8094':boost?'#7fd8ff':'#4aa3ff';c.fillRect(X+5+sh,y+22,Math.round(60*ap),2);vtText(c,'AP '+Math.floor(F.ap??AP_MAX)+(frozen?' ⏸':boost?' ▲':''),X+68,y+25,frozen?'#7a8094':boost?'#1f8a3a':'#2b5fa8',8)}
  vtText(c,`${mon.hp}/${mon.mhp}`,X+4,y+31,'#4b4f63',9);
  for(let i=0;i<F.team.length;i++){c.fillStyle='#14141f';c.fillRect(X+w-6-i*7,y+25,6,6);c.fillStyle=F.team[i].hp>0?'#e8453c':'#8a8ea6';c.fillRect(X+w-5-i*7,y+26,4,4)}
}
function sizeBattle(){
  const wrap=$('#bwrap'),st=$('#stage');const mob=isMob();const ctl=mob?0:($('#bctl').offsetHeight||0);
  const port=mob&&document.body.classList.contains('portrait');const avail=Math.max(120,(port?st.clientHeight*0.58:st.clientHeight)-ctl-(mob?0:40));const w=Math.max(200,Math.min(mob?st.clientWidth:wrap.clientWidth,avail*AW/AH));
  bcv.style.width=w+'px';const dpr=Math.min(3,devicePixelRatio||1);const W=Math.round(w*dpr),H=Math.round(W*AH/AW);
  if(bcv.width!==W||bcv.height!==H){bcv.width=W;bcv.height=H}
  return W/AW;
}
function drawBattle(){
  if(!B)return;const c=bc;const K=sizeBattle();const CM=updateCam(performance.now());c.setTransform(K*CM.z,0,0,K*CM.z,K*(AW/2-CM.x*CM.z),K*(CAMY-CM.y*CM.z));const _n=performance.now();if(B.shakeUntil&&_n<B.shakeUntil)c.translate(Math.round((Math.random()-.5)*4),Math.round((Math.random()-.5)*4));c.imageSmoothingEnabled=false;const now=performance.now();
  c.drawImage(battleBG(B.zone||'arena'),0,0,AW,AH);

  drawHazards(c,_n);drawArenaEv(c,_n,0);drawRings(c,_n);
  const ents=[B.me,B.foe].filter(Boolean).concat((B.obs||[]).filter(o=>!o.dead)).sort((a,b)=>a.y-b.y);
  for(const F of ents){if(F.kind){drawObs(c,F,now);continue}if(F.out&&act(F).hp<=0&&F.faint<=0&&F.ctrl!=='remote')continue;const mon=act(F);
    let catchK=-1;if(F===B.foe&&B.catch){const el=(now-B.catch.t0)/1000;if(el>0.4||B.catch.done)continue;catchK=el/0.4}
    if(F.spawnT&&now<F.spawnT)continue;
    const s=monSprite(mon.s,24);let X=Math.round(F.x/2)*2,Y=Math.round(F.y/2)*2;
    // entrance: slide in from the side at battle start
    if(B.enterT){const ek=clamp((now-B.enterT)/550,0,1),off=(1-ek)*(1-ek)*110;Y=Math.round(Y+(F===B.me?off:-off))}
    if(B.fin&&B.fin.win===true&&F===B.me&&mon.hp>0){Y=Math.round(Y-Math.abs(Math.sin((now-B.fin.t0)/1000*7))*7)}
    if(F.lungeT){const lk=(now-F.lungeT)/350,O=F===B.me?B.foe:B.me;if(lk<1&&O){const ux=O.x-F.x,uy=O.y-F.y,ul=Math.hypot(ux,uy)||1,k=Math.sin(lk*Math.PI)*26;X=Math.round(X+ux/ul*k);Y=Math.round(Y+uy/ul*k)}}
    let sc=1,white=0,yoff=0,clipY=null;const ssc=SPECIES[mon.s].sc||1;
    const sk=F.spawnT?(now-F.spawnT)/380:1;if(sk<1){sc=0.2+0.8*sk;white=1-sk}
    if(catchK>=0){sc=1-catchK*0.9;white=1}
    sc*=ssc;
    if(mon.hp<=0&&F.ctrl!=='remote'){const fk=1-clamp(F.faint/0.9,0,1);yoff=fk*fk*36;clipY=Y+2}else if(mon.hp<=0)yoff=36;
    if(B.evoFx&&now-B.evoFx<1800&&F===B.me)white=Math.max(white,Math.abs(Math.sin((now-B.evoFx)/90))*0.9);
    const az=flyZ(F,now),dv=stOn(F,'dive');
    if(dv){const t2=now/1000;c.strokeStyle='#bfe2ff';c.lineWidth=1;for(let q=0;q<2;q++){const rr=7+((t2*14+q*7)%14);c.globalAlpha=1-rr/22;pxEl(c,X,Y,rr,rr*0.4,0)}c.globalAlpha=1;c.fillStyle='#3d8bf260';pxEl(c,X,Y,11,4,1);continue}
    if(az>150)continue;
    c.fillStyle='#00000040';{const ss=sc*(1-az/240);c.fillRect(X-12*ss,Y-2,24*ss,4);c.fillRect(X-9*ss,Y-3,18*ss,6)}Y-=Math.round(az);
    let alpha=1;if(F.flash>0)alpha=Math.floor(F.flash*30)%2?0.3:1;else if(F.inv>0&&F.dashT>0)alpha=0.5;
    if(B.state==='flee'&&F===B.me){/* running away */}
    c.save();if(clipY!=null){c.beginPath();c.rect(X-40,0,80,clipY);c.clip()}
    // sprite animation: idle breathing, hop while moving, attack lunge, hit recoil, cast glow
    const dir=F.face>0?1:-1,tt=now/1000+(F.side==='L'?0:0.7);let{sx,sy,rot,ox,oy}=idleAnim(SPECIES[mon.s].an,tt);
    if(F.lx===undefined){F.lx=F.x;F.ly=F.y}const mvs=Math.hypot(F.x-F.lx,F.y-F.ly);F.lx=F.x;F.ly=F.y;F.mvs=(F.mvs||0)*0.8+mvs*0.2;
    if(F.mvs>0.25&&mon.hp>0){const hp=Math.abs(Math.sin(tt*13));oy-=hp*4;rot=Math.sin(tt*13)*0.07;sy*=1+hp*0.05;sx*=1-hp*0.03}
    if(F.atkT){const k=(now-F.atkT)/280;if(k<1){const e=Math.sin(k*Math.PI);ox+=e*7*dir;sx*=1+e*0.14;sy*=1-e*0.1;rot+=e*0.12*dir}}
    if(F.hurtT){const k=(now-F.hurtT)/340;if(k<1){const e=Math.sin(k*Math.PI);ox-=e*5*dir;rot-=e*0.28*dir;sy*=1-e*0.08;if(k<0.4){const q=1-k/0.4;sx*=1+q*0.18;sy*=1-q*0.16;ox+=Math.round(Math.sin(now/16)*2*q);white=Math.max(white,q*0.85)}}}
    if(F.castT){const k=(now-F.castT)/700;if(k<1){sy*=1+Math.sin(k*Math.PI)*0.12;oy-=Math.sin(k*Math.PI)*5;white=Math.max(white,Math.sin(k*Math.PI)*0.5)}}
    let encDark=false,encX=0;if(B.enc&&F===B.foe){const ee=now-B.enc.t0;encDark=ee<560;if(ee<520){const q=1-ee/520;encX=-q*q*150}}
    c.globalAlpha=alpha;c.translate(Math.round(X+ox+encX),Math.round(Y+yoff+oy));c.rotate(rot);if((F.face>0)!==!!SPECIES[mon.s].faceR)c.scale(-1,1);c.scale(sc*sx,sc*sy);const dw=s.width>24?64:48;c.drawImage(encDark?darkSprite(mon.s,24):s,-dw/2,6-dw,dw,dw);
    if(white>0){c.globalAlpha=alpha*white;c.drawImage(whiteSprite(mon.s,24),-dw/2,6-dw,dw,dw)}
    c.restore();c.globalAlpha=1;
    if(F===B.me&&B.lvlFx&&now-B.lvlFx<1400){const k=(now-B.lvlFx)/1400;c.fillStyle='#ffe14d';for(let i=0;i<10;i++){const a=i/10*6.28+k*4;c.fillRect(Math.round(X+Math.cos(a)*18),Math.round(Y-20-k*26+Math.sin(a)*6),2,2)}pxText(c,'LEVEL-UP!',X,Math.round(Y-48-k*8),'#ffe14d',6,'center')}
    if(F===B.me){c.fillStyle=G.color;c.fillRect(X-2,Y+3,5,2);c.fillRect(X-1,Y+5,3,1)}}
  for(const s of B.shots){const X=Math.round(s.x),Y=Math.round(s.y);
    if(s.cap){const pk=clamp(s.age/(s.flight||1),0,1),arc=Math.sin(pk*Math.PI)*28;c.fillStyle='#00000040';c.fillRect(X-3,Y+12,6,2);drawCapsule(c,X,Math.round(Y-arc),s.age*18);continue}
    const col=TYPES[MOVES[s.mid].t].c;
    if(s.nm){drawSpecial(c,s,col,now);continue}
    if(s.mel){c.fillStyle='#ffffff';const a=Math.atan2(s.vy,s.vx);for(let i=-3;i<=3;i++){const aa=a+i*0.25;c.fillRect(Math.round(s.x+Math.cos(aa)*6)-1,Math.round(s.y+Math.sin(aa)*6)-1,2,2)}continue}
    if(s.r>=6&&!s.wave)drawOrbit(c,s,col,now);
    if(drawVis(c,s,col,now))continue;
    const r=Math.max(2,Math.round(s.r/2)*2),SX=Math.round(X/2)*2,SY=Math.round(Y/2)*2;c.fillStyle='#14141f';c.fillRect(SX-r-2,SY-r-2,r*2+4,r*2+4);c.fillStyle=col;c.fillRect(SX-r,SY-r,r*2,r*2);c.fillStyle='#ffffffb0';c.fillRect(SX-r,SY-r,2,2);
    c.fillStyle=col+'90';c.fillRect(Math.round(X-s.vx*0.04)-1,Math.round(Y-s.vy*0.04)-1,3,3)}
  for(const v of B.vshots||[]){const k=clamp((now-v.t0)/v.dur,0,1);const x=v.x+(v.tx-v.x)*k,y=v.y+(v.ty-v.y)*k-(v.cap?Math.sin(k*Math.PI)*28:0);if(v.cap){drawCapsule(c,Math.round(x),Math.round(y),k*12);continue}const r=Math.round(v.r);c.fillStyle='#14141f';c.fillRect(Math.round(x)-r-1,Math.round(y)-r-1,r*2+2,r*2+2);c.fillStyle=TYPES[MOVES[v.mid].t].c;c.fillRect(Math.round(x)-r,Math.round(y)-r,r*2,r*2);c.fillStyle='#ffffffb0';c.fillRect(Math.round(x)-r+1,Math.round(y)-r+1,Math.max(1,r-1),Math.max(1,r-1))}
  drawArenaEv(c,now,1);
  for(const p of B.parts){c.fillStyle=p.c;c.fillRect(Math.round(p.x/2)*2,Math.round(p.y/2)*2,2,2)}
  // our monster is sent out with a thrown pair of cuffs: arc from the lower left, spring open, flash
  {const F=B.me;if(F&&F.spawnT&&!B.tb||F&&F.spawnT){const k=1-(F.spawnT-now)/480;if(k>=0&&k<1){const sx=ACX-120,sy=YB+40,x=sx+(F.x-sx)*k,y=sy+(F.y-14-sy)*k-Math.sin(k*Math.PI)*60;drawCapsule(c,Math.round(x),Math.round(y),k*14,k>0.85)}
    else if(k>=1&&F.thrownFor!==F.spawnT){F.thrownFor=F.spawnT;burst(F.x,F.y-14,'#ffffff',14);burst(F.x,F.y-14,'#ffcb3d',8)}}}
  if(B.catch){const c2=B.catch,el=(now-c2.t0)/1000;let X=c2.x,Y=c2.y,rot=0,open=0;
    if(el<0.4){open=1;if(Math.random()<0.6)B.parts.push({x:c2.x+(Math.random()-.5)*30,y:c2.y+(Math.random()-.5)*30,vx:0,vy:0,life:0.15,age:0,c:'#ffffff'})}
    else if(el<0.95){const k=(el-0.4)/0.55;const b=Math.abs(Math.cos(k*Math.PI*2.5))*(1-k);Y=c2.y+(c2.gy-c2.y)*Math.min(1,k*2)-b*14}
    else{Y=c2.gy;const wi=Math.floor((el-0.95)/0.7);const wk=((el-0.95)%0.7)/0.7;if(wi<c2.sh&&wk<0.45)rot=Math.sin(wk/0.45*Math.PI*2)*0.5;if(!c2.ok&&wi>=c2.sh)open=1}
    c.fillStyle='#00000040';c.fillRect(Math.round(X)-4,Math.round(c2.gy)+5,8,2);
    drawCapsule(c,Math.round(X),Math.round(Y),rot,open);
    if(c2.done){c.globalAlpha=0.5;drawCapsule(c,Math.round(X),Math.round(Y),0);c.globalAlpha=1;c.fillStyle='#ffcb3d';const k=Math.min(1,(el-(0.95+c2.sh*0.7))/0.5);for(let i=0;i<3;i++){c.fillRect(Math.round(X-10+i*10),Math.round(Y-8-k*10),2,2);c.fillRect(Math.round(X-11+i*10),Math.round(Y-7-k*10),4,1)}}}
  // opponent hid the game (Notfallmodus): a graduate cap floats above his monster
  if(B.mode==='duel'&&B.oppPanic&&B.foe){const X=Math.round(B.foe.x)+16,Y=Math.round(B.foe.y)-44+Math.round(Math.sin(now/260)*2);c.save();c.fillStyle='#f6f1e1';c.strokeStyle='#14141f';c.lineWidth=2;c.beginPath();c.arc(X,Y,13,0,7);c.fill();c.stroke();c.font='18px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('👨‍🎓',X,Y);c.restore();if(!B.pmSaid){B.pmSaid=1;say(`${B.oppName||'Der Gegner'} ist gerade im Notfallmodus 🎓`)}}else if(B)B.pmSaid=0;
  // status rings, aim helper and pointer live in the battlefield
  for(const F of[B.me,B.foe]){if(!F||!F.st)continue;const X=Math.round(F.x),Y=Math.round(F.y);const shown=F.ctrl==='remote'?(F.stShow||[]):Object.keys(F.st).filter(k=>F.st[k]>0);
    if(shown.includes('shield')){c.strokeStyle='#9fd2ffaa';c.lineWidth=1;pxEl(c,X,Y-16,20,22,0)}
    if(shown.includes('stun')){c.fillStyle='#ffe14d';for(let i=0;i<3;i++){const a=now/150+i*2.1;c.fillRect(Math.round(X+Math.cos(a)*10),Math.round(Y-40+Math.sin(a)*3),2,2)}}
    if(shown.includes('sleep')||shown.includes('conf')){c.save();c.translate(X,Y-44);c.scale(2,2);if(shown.includes('sleep'))drawZzz(c,0,40,now);if(shown.includes('conf'))drawConf(c,0,38+(shown.includes('sleep')?-4:0),now);c.restore()}}
  if(B.aim&&B.foe){const a=aimAngle(now),F=B.me;c.fillStyle='#ffffff';for(let i=1;i<9;i++){const d=i*9;if(i%2)c.fillRect(Math.round(F.x+Math.cos(a)*d)-1,Math.round(F.y-14+Math.sin(a)*d)-1,2,2)}
    const ex=F.x+Math.cos(a)*84,ey=F.y-14+Math.sin(a)*84;c.strokeStyle='#ffcb3d';c.lineWidth=1;c.strokeRect(Math.round(ex)-3,Math.round(ey)-3,6,6);
    const r=ringR(now),T=B.foe;c.strokeStyle=r<8?'#3ddc6b':r<11.5?'#ffcb3d':'#ffffff';c.beginPath();c.arc(T.x,T.y-12,r,0,7);c.stroke();c.strokeStyle='#ffffff60';c.beginPath();c.arc(T.x,T.y-12,16,0,7);c.stroke()}
  if(B.ptr){c.fillStyle='#ffffff80';c.fillRect(Math.round(B.ptr.x)-1,Math.round(B.ptr.y)-1,3,3)}
  if(!B.tb&&B.me&&!B.aim&&(B.state==='fight'||B.state==='count')&&!B.me.out){const a=myAim(),F=B.me,on=!!B.aimDrag||aimHeld.length>0;c.fillStyle=on?'#ffcb3d':'#ffffff70';
    for(let i=2;i<10;i++){const d=i*8;c.fillRect(Math.round(F.x+a.x*d)-1,Math.round(F.y-14+a.y*d)-1,2,2)}
    const tx=F.x+a.x*82,ty=F.y-14+a.y*82,px=-a.y,py=a.x;for(let k=0;k<5;k++){c.fillRect(Math.round(tx-a.x*k*2+px*k*1.5)-1,Math.round(ty-a.y*k*2+py*k*1.5)-1,2,2);c.fillRect(Math.round(tx-a.x*k*2-px*k*1.5)-1,Math.round(ty-a.y*k*2-py*k*1.5)-1,2,2)}}
  // ---- UI layer: drawn 1.5x larger than the battlefield pixels ----
  c.setTransform(K*UI,0,0,K*UI,0,0);c.imageSmoothingEnabled=false;
  c.fillStyle='#0b0d16b8';c.fillRect(0,0,UW,58/UI);c.fillStyle='#14141f';c.fillRect(0,58/UI,UW,2/UI);
  for(const n of B.nums){const k=(now-n.at)/(n.life||900),[sx,sy]=w2s(n.x,n.y);vtText(c,n.t,Math.round(sx/UI),Math.round(sy/UI-k*14),n.c,n.sz||12,'center')}
  if(B.tb&&B.state==='tbChoose'){const t=B.mode==='duel'?`ZUG ${B.turn} · wähle eine Aktion`:'Wähle eine Aktion';c.fillStyle='#0b0d16c8';c.font='10px VT323,monospace';const w=c.measureText(t).width+10;c.fillRect(UW/2-w/2,46,w,11);vtText(c,t,UW/2,55,'#ffcb3d',10,'center')}
  if(B.tb&&B.state==='tbWait'){c.fillStyle='#0b0d16c8';c.fillRect(UW/2-55,46,110,11);vtText(c,'warte auf den Gegner…',UW/2,55,'#ffffff',10,'center')}
  if(B.me.spawnT!==Infinity)hudPanel(c,4,4,B.me,false,'');
  const stTag={sleep:['SLF','#c4b5fd'],conf:['VRW','#f472b6'],burn:['BRN','#ff8a3d'],slow:['SLW','#6db6f0'],stun:['STN','#ffe14d'],shield:['SHD','#9fd2ff'],haste:['HST','#3ddc6b']};
  const tags=(F,x,right)=>{const g=stgOf(F);const ks=(F.ctrl==='remote'?(F.stShow||[]):Object.keys(F.st).filter(k=>F.st[k]>0)).filter(k=>stTag[k]);for(const q of['a','d','s'])if(g[q]){const t=q.toUpperCase().replace('S','I')+(g[q]>0?'+':'')+g[q];stTag[t]=[t,g[q]>0?'#3ddc6b':'#ef6f6f'];ks.push(t)}ks.forEach((k,i)=>{const[t,col]=stTag[k];const X=right?x-24-i*24:x+i*24;c.fillStyle='#14141f';c.fillRect(X,40,22,9);vtText(c,t,X+11,47,col,9,'center')})};
  tags(B.me,4,false);if(B.foe)tags(B.foe,UW-4-62,true);
  if(B.foe)hudPanel(c,UW-4,4,B.foe,true,B.legend?'★':'');
  if(B.foe&&B.mode==='wild'){const rc=rarOf(act(B.foe).s);if(RAR[act(B.foe).s]!=='common'){c.fillStyle='#14141f';c.fillRect(UW-116,40,58,9);vtText(c,rc.n.toUpperCase(),UW-113,47,rc.c,9)}}
  if(B.mode!=='wild'&&B.zone===undefined&&B.oppName)vtText(c,'gegen '+B.oppName,UW/2,48,'#ffffff',9,'center');
  const msgs=B.log.filter(m=>now-m.at<2600);msgs.forEach((m,i)=>{const y=UH-6-(msgs.length-1-i)*10;c.font='10px VT323,monospace';const w=c.measureText(m.t).width+8;c.fillStyle='#0b0d16c8';c.fillRect(Math.round(UW/2-w/2),y-8,Math.ceil(w),10);vtText(c,m.t,UW/2,y,'#ffffff',10,'center')});
  if(B.state==='count'&&!B.leadWait){const n=Math.ceil((B.cntEnd-now)/1000);pxText(c,n>0?String(n):'LOS!',UW/2,UH/2+8,'#ffcb3d',16,'center')}
  if(B.state==='wait'){pxText(c,'WARTE AUF GEGNER',UW/2,UH/2+4,'#ffffff',8,'center')}
  if(B.state==='fight'&&!B.tb&&B.me&&!B.me.out&&atEdge(B.me)&&!B.qsel){const x=B.me.x/UI,y=(B.me.y-64)/UI;const a=0.65+Math.sin(now/180)*0.35;c.globalAlpha=a;vtText(c,`⇄ ${keyLabel(SET.keys.sw)}${B.mode==='wild'?' · 🏃 '+keyLabel(SET.keys.run):''}`,x,y,'#ffcb3d',10,'center');c.globalAlpha=1}
  if(B.enc)drawEncounter(c,now);
  if(B.vs)drawVS(c,now);
  if(B.wi)drawWildIntro(c,now);
  if(B.resumeEnd&&now<B.resumeEnd){const n=Math.ceil((B.resumeEnd-now)/1000);c.fillStyle='#0b0d1690';c.fillRect(0,0,UW,UH);pxText(c,String(n),UW/2,UH/2+10,'#ffcb3d',24,'center');vtText(c,'Gleich geht es weiter…',UW/2,UH/2+26,'#ffffff',10,'center')}
  if(B.fin)drawFinale(c,now);
  drawNetInfo(c,K);
}


// ---- VS intro (trainer, Richter-Bot and player duels), in the style of the classic handheld games ----
const VS_MS=3400;
const VS_LINES=['Im Namen des Volkes — ich fordere dich heraus!','Du hast das Recht zu schweigen. Ich nicht!','Hände hoch und Monster raus!','Das Gericht ist eröffnet — zeig, was du kannst!','Allgemeine Kontrolle: Wir kämpfen!','Heute schreibe ich den Bericht über deine Niederlage.'];
function vsStart(now){if(!B||B.vs||!(B.mode==='trainer'||B.mode==='ai'||B.mode==='duel'))return 0;
  let tr=null,rn=B.oppName||'Gegner',rc='#5b4bc4',rs='m',line='Die Verhandlung ist eröffnet!';
  if(B.mode==='trainer'&&B.trainer){rc=B.trainer.c||rc;line=B.trainer.line||line;rs=/^\S+in\s/.test(B.trainer.n)?'f':'m';tr=B.trainer}
  else if(B.mode==='duel'){const op=findPeer(B.opp);if(op){rc=validColor(op.presence.c);rs=op.presence.sx==='f'?'f':'m'}line=VS_LINES[Math.abs(hashStr(String(B.id)+String(B.opp)))%VS_LINES.length]}
  const dur=B.mode==='trainer'?3600:VS_MS;B.vs={t0:now,dur,ln:G.name||'Du',lc:G.color||'#2f5fb3',ls:G.sex,rn,rc,rs,tr,line};return dur}
// tap / click / any key during the trainer intro skips the rest of it
function vsSkip(){if(B&&B.wi&&performance.now()>=B.wi.t0)return wiSkip();if(!B||!B.vs||B.mode==='duel'||B.state!=='intro')return false;const now=performance.now(),V=B.vs,e=now-V.t0;if(e<500||V.dur-e<400)return false;
  const cut=V.dur-e-300;V.dur=e+300;if(B.wi)B.wi.t0-=cut;for(const F of[B.me,B.foe])if(F&&F.spawnT)F.spawnT-=cut;B.enterT-=cut;clearTimeout(B.introTO);B.introTO=setTimeout(B.introGo,Math.max(0,B.introAt-cut-now));return true}
function vsWrap(c,t,max){c.font='10px VT323,monospace';const w=t.split(' '),out=[];let l='';for(const x of w){const tt=l?l+' '+x:x;if(c.measureText(tt).width>max&&l){out.push(l);l=x}else l=tt}if(l)out.push(l);return out}
function drawVS(c,now){const V=B.vs,e=now-V.t0;if(e>V.dur){B.vs=null;return}
  const k=e/V.dur,fade=e>V.dur-300?(V.dur-e)/300:1;c.save();c.globalAlpha=clamp(fade,0,1);
  // dark backdrop with speed lines
  c.fillStyle='#0b0d16';c.fillRect(0,0,UW,UH);if(B.mode!=='duel'&&e>500)vtText(c,isMob()?'▶ tippen zum Überspringen':'▶ Klick/Taste zum Überspringen',UW/2,10,'#c0c4d6',9,'center');c.fillStyle='#ffffff14';for(let i=0;i<14;i++){const y=(i*29+Math.floor(e/16)*7)%UH;c.fillRect(((i*53+e*0.6)%(UW+60))-60,y,40+i%3*20,1)}
  const slide=q=>1-Math.pow(1-clamp(q,0,1),3);
  const a=slide(e/380),b=slide((e-120)/380);
  // opponent band (top, from the right), my band (bottom, from the left)
  const band=(y,h,off,col,flip)=>{c.save();c.translate(off,0);c.fillStyle='#14141f';c.beginPath();c.moveTo(0,y-2);c.lineTo(UW+20,y-2-10);c.lineTo(UW+20,y+h+2-10);c.lineTo(0,y+h+2);c.fill();
    c.fillStyle=col;c.beginPath();c.moveTo(0,y);c.lineTo(UW+20,y-10);c.lineTo(UW+20,y+h-10);c.lineTo(0,y+h);c.fill();
    c.fillStyle='#ffffff30';c.beginPath();c.moveTo(0,y);c.lineTo(UW+20,y-10);c.lineTo(UW+20,y-6);c.lineTo(0,y+4);c.fill();c.restore()};
  band(28,46,(1-a)*UW,V.rc);band(104,46,-(1-b)*UW,V.lc);
  c.imageSmoothingEnabled=false;
  const bob=Math.round(Math.sin(e/120)*1);
  {const ti=V.tr&&trainerBig(V.tr,'left');if(ti){const w=ti.naturalWidth*1.8,h=ti.naturalHeight*1.8;c.drawImage(ti,Math.round(UW-36-w/2+(1-a)*UW),Math.round(58-h)+bob,w,h)}else c.drawImage(copBig(V.rc,'left',V.rs),Math.round(UW-54+(1-a)*UW),2+bob,36,56)}
  c.drawImage(copBig(V.lc,'right',V.ls),Math.round(16-(1-b)*UW),80-bob,36,56);
  pxText(c,V.rn.toUpperCase().slice(0,18),Math.round(UW-66+(1-a)*UW),56,'#ffffff',7,'right');
  pxText(c,V.ln.toUpperCase().slice(0,18),Math.round(66-(1-b)*UW),134,'#ffffff',7,'left');
  // VS with a pop and flashes
  if(e>420){const p=slide((e-420)/220),sz=Math.round(8+p*12+(e<760?Math.sin((e-420)/30)*2:0));if(e<520){c.fillStyle='#ffffff';c.globalAlpha=0.6*fade;c.fillRect(0,0,UW,UH);c.globalAlpha=fade}
    pxText(c,'VS',UW/2,UH/2+sz/2-6,'#ffcb3d',sz,'center')}
  // speech box with typewriter text
  if(e>700&&B.mode!=='trainer'){const full=`${V.rn}: „${V.line}“`,n=Math.min(full.length,Math.floor((e-700)/14)),lines=vsWrap(c,full.slice(0,n),UW-24);
    const h=6+Math.max(1,lines.length)*10;c.fillStyle='#14141f';c.fillRect(6,UH-h-6,UW-12,h+2);c.fillStyle='#f6f1e1';c.fillRect(7,UH-h-5,UW-14,h);
    lines.forEach((l,i)=>vtText(c,l,12,UH-h+5+i*10,'#14141f',10))}
  c.restore()}

// ===== ground hazards: attacks that miss leave something behind (water → puddle, slippery; fire → flames, burn;
//       rock → light rubble obstacle; grass → roots, slow; electric → sparks, short stun). They fade after a few seconds and hit both sides.
const HAZ_KIND={water:{k:'puddle',r:16,ms:7000},fire:{k:'fire',r:13,ms:7000},grass:{k:'roots',r:15,ms:6000},electric:{k:'spark',r:12,ms:4000}};
function leaveHazard(s,x,y){if(!B||B.tb||B.state!=='fight')return;const mv=MOVES[s.mid];if(!mv||(mv.p||0)<=0)return;const now=performance.now();x=clamp(x,24,AW-24);y=clamp(y,24,AH-16);
  if(mv.t==='rock'){if([B.me,B.foe].some(F=>F&&Math.hypot(F.x-x,(F.y-y)*1.3)<16))return;B.obs=B.obs||[];if(B.obs.filter(o=>o.tmp&&!o.dead).length>=6)return;
    B.obs.push({id:'h'+now,kind:'rock',mat:'rock',ind:0,x:Math.round(x),y:Math.round(y),r:8,hp:18,max:18,v:Math.floor(Math.random()*3),tmp:now+15000});burst(x,y-6,'#a07848',10);return}
  const H=HAZ_KIND[mv.t];if(!H)return;B.haz=(B.haz||[]).filter(h=>h.until>now);if(B.haz.length>=12)B.haz.shift();B.haz.push({k:H.k,x,y,r:H.r,t0:now,until:now+H.ms,seed:Math.floor(Math.random()*1e6)})}
// opponents (AI) aim with the same Zielsicher spring as your auto-aim
function aiAimTick(dt){if(!B||B.tb)return;for(const F of[B.me,B.foe]){if(!F||F.ctrl!=='ai')continue;const T=F===B.me?B.foe:B.me;if(!T)continue;const want=Math.atan2((T.y-12)-(F.y-14),T.x-F.x);if(F.aimAng==null||!isFinite(F.aimAng)){F.aimAng=want;F.aimW=0;continue}
  let d=want-F.aimAng;d=Math.atan2(Math.sin(d),Math.cos(d));const z=zielOf(act(F))/10,K=6+150*z*z,Dm=2*Math.sqrt(K)*0.9,wm=1.5+9*z;F.aimW=clamp((F.aimW||0)+(d*K-(F.aimW||0)*Dm)*dt,-wm,wm);F.aimAng+=F.aimW*dt}}
function hazardTick(dt){if(!B)return;aiAimTick(dt);kindsTick(dt);const now=performance.now();if(B.haz)B.haz=B.haz.filter(h=>h.until>now);
  if(B.obs)for(const o of B.obs)if(o.tmp&&!o.dead&&o.tmp<now){o.dead=1;burst(o.x,o.y-6,'#a07848',8)}
  if(B.state!=='fight'||!B.haz)return;
  for(const F of[B.me,B.foe]){if(!F||F.ctrl==='remote'||F.out||F.faint>0)continue;F.slip=Math.max(0,(F.slip||0)-dt);
    for(const h of B.haz){if(Math.hypot(F.x-h.x,(F.y-h.y)*1.3)>h.r+4)continue;
      if(h.k==='puddle')F.slip=0.35;
      else if(h.k==='fire'){if(SPECIES[act(F).s].t==='fire'||F.st.dive>0||F.st.fly>0)continue;if(F.st.burn<=0)say(`${SPECIES[act(F).s].n} läuft durchs Feuer und brennt!`);F.st.burn=Math.max(F.st.burn,1.2)}
      else if(h.k==='roots')F.st.slow=Math.max(F.st.slow,0.4);
      else if(h.k==='spark'&&Math.random()<dt*0.9&&F.st.stun<=0)F.st.stun=0.35}}}
function drawHazards(c,now){if(!B||!B.haz)return;for(const h of B.haz){const life=(h.until-now)/(h.until-h.t0),a=Math.min(1,life*4,(now-h.t0)/200),X=Math.round(h.x),Y=Math.round(h.y),r=mulberry32(h.seed);c.save();c.globalAlpha=a;
  if(h.k==='puddle'){c.fillStyle='#1f5fa0';pxEl(c,X,Y,h.r,h.r*0.55,1);c.fillStyle='#3d8bf2';pxEl(c,X,Y,h.r-2,h.r*0.55-2,1);c.fillStyle='#8fc8f0';c.fillRect(X-6,Y-3,5,1);c.fillRect(X+2,Y+1,3,1)}
  else if(h.k==='fire'){c.fillStyle='#3a1a0a80';pxEl(c,X,Y,h.r,h.r*0.5,1);for(let i=0;i<6;i++){const fx=X+Math.round((r()-0.5)*h.r*1.6),fy=Y+Math.round((r()-0.5)*h.r*0.7),fl=(Math.floor(now/90)+i)%3,hh=4+fl*2;c.fillStyle='#ef4444';c.fillRect(fx-2,fy-hh,4,hh);c.fillStyle='#ffcb3d';c.fillRect(fx-1,fy-hh+2,2,hh-2)}}
  else if(h.k==='roots'){c.fillStyle='#3a2a10b0';pxEl(c,X,Y,h.r,h.r*0.5,1);c.fillStyle='#8a5a28';for(let i=0;i<7;i++){const a2=r()*6.28,L=5+r()*8;for(let t=0;t<L;t+=1.5)c.fillRect(Math.round(X+Math.cos(a2)*t),Math.round(Y+Math.sin(a2)*t*0.5),2,1)}c.fillStyle='#3ddc6b';for(let i=0;i<4;i++)c.fillRect(X+Math.round((r()-0.5)*h.r*1.4),Y+Math.round((r()-0.5)*h.r*0.6),2,2)}
  else if(h.k==='spark'){c.fillStyle='#d9a90b70';pxEl(c,X,Y,h.r,h.r*0.5,1);if(Math.floor(now/70)%3){c.fillStyle='#ffe36b';for(let i=0;i<5;i++){const sx=X+Math.round((r()-0.5)*h.r*1.6),sy=Y+Math.round((r()-0.5)*h.r*0.7);c.fillRect(sx,sy,3,1);c.fillRect(sx+2,sy+1,1,2)}}}
  c.restore()}}


// ===== projectile looks: chunky pixel shapes per attack (wave arcs, flames, bubbles, leaves, bolts, rocks, wind blades, spores, coins, feathers, § …)
function drawVis(c,s,col,now){const v=s.wave?'wave':visOf(s.mid);if(v==='ball')return false;const a=Math.atan2(s.vy,s.vx),X=Math.round(s.x),Y=Math.round(s.y),ca=Math.cos(a),sa=Math.sin(a),
  P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,w,h)},R=(u,v2)=>[X+ca*u-sa*v2,Y+sa*u+ca*v2],t=now/1000+(s.age||0);
  if(v==='wave'){const al=0.45+0.55*Math.max(0,1-s.age/(s.life||1.8)),span=0.55+s.r/80;for(let k=0;k<3;k++){const rr=s.r-k*7;if(rr<3)continue;const n=Math.max(6,Math.round(rr*span*0.9));for(let q=-n;q<=n;q++){const an=a+q/n*span,x=X+Math.cos(an)*rr-ca*s.r*0.6,y=Y+Math.sin(an)*rr-sa*s.r*0.6;c.globalAlpha=al*(1-k*0.25);P(x-2,y-2,4,4,'#14141f70');P(x-1,y-1,3,3,k===0?'#ffffff':k===1?col:'#ffffffa0')}}c.globalAlpha=1;return true}
  if(v==='flame'){for(let i=4;i>=0;i--){const[x,y]=R(-i*3,Math.sin(t*20+i)*1.5);const sz=6-i;P(x-sz/2,y-sz/2,sz,sz,i<2?'#ffe36b':i<4?'#ff8a1f':'#ef4444')}const[x,y]=R(2,0);P(x-3,y-3,6,6,'#ffe36b');P(x-1,y-1,2,2,'#ffffff');return true}
  if(v==='bubble'){for(const[o,r0]of[[0,4],[-7,2],[-12,1]]){const[x,y]=R(o,Math.sin(t*9+o)*2);P(x-r0-1,y-r0-1,r0*2+2,r0*2+2,'#14141f');P(x-r0,y-r0,r0*2,r0*2,'#8fc8f0');P(x-r0+1,y-r0+1,r0*2-2>0?r0*2-2:1,r0*2-2>0?r0*2-2:1,'#3d8bf2');P(x-r0,y-r0,2,2,'#ffffff')}return true}
  if(v==='leaf'){const sp=t*14;for(let i=-3;i<=3;i++){const w=3-Math.abs(i)*0.7,x=X+Math.cos(sp)*i*1.6,y=Y+Math.sin(sp)*i*1.6;P(x-w,y-w,w*2+1,w*2+1,'#14141f')}for(let i=-3;i<=3;i++){const w=2-Math.abs(i)*0.5,x=X+Math.cos(sp)*i*1.6,y=Y+Math.sin(sp)*i*1.6;P(x-w,y-w,Math.max(2,w*2),Math.max(2,w*2),i<0?'#3ddc6b':'#2fa84f')}P(X,Y,2,2,'#d8f8c0');return true}
  if(v==='bolt'){let px=0,py=0;const pts=[[0,0]];for(let i=1;i<=4;i++){px-=4;py=((i+Math.floor(t*25))%2?3:-3);pts.push([px,py])}for(const[u,w]of pts){const[x,y]=R(u+4,w);P(x-2,y-2,5,5,'#14141f')}for(const[u,w]of pts){const[x,y]=R(u+4,w);P(x-1,y-1,3,3,'#ffe36b')}const[x,y]=R(4,0);P(x-1,y-1,2,2,'#ffffff');return true}
  if(v==='rock'){const rot=Math.floor(t*10)%2;P(X-5,Y-4,10,8,'#14141f');P(X-4,Y-5,8,10,'#14141f');P(X-4,Y-3,8,6,'#8e8e98');P(X-3,Y-4,6,8,'#8e8e98');P(X-3,Y-3,rot?4:2,2,'#c8c8d0');P(X+1,Y+1,2,2,'#5a5a64');return true}
  if(v==='blade'){for(let q=-4;q<=4;q++){const an=a+Math.PI/2+q*0.28,rr=7-Math.abs(q)*0.4,x=X+Math.cos(an)*rr*0.5+ca*(3-Math.abs(q)),y=Y+Math.sin(an)*rr+sa*(3-Math.abs(q));P(x-1,y-1,3,3,'#14141f');P(x,y,2,2,Math.abs(q)<2?'#ffffff':'#c8ecff')}return true}
  if(v==='spore'){for(let i=0;i<6;i++){const an=t*3+i*1.05,rr=4+Math.sin(t*5+i)*2,x=X+Math.cos(an)*rr,y=Y+Math.sin(an)*rr*0.8;P(x-1,y-1,3,3,'#14141f');P(x,y,2,2,i%2?'#f8c8f0':'#c8f0a0')}P(X-1,Y-1,2,2,'#ffffff');return true}
  if(v==='string'){for(let i=0;i<7;i++){const[x,y]=R(-i*3,Math.sin(t*12+i*0.9)*2);P(x,y,2,2,'#f4f4f8')}return true}
  if(v==='coin'){const w=Math.max(2,Math.round(Math.abs(Math.cos(t*12))*6));P(X-w/2-1,Y-4,w+2,8,'#14141f');P(X-w/2,Y-3,w,6,'#ffcb3d');if(w>3)P(X-w/2+1,Y-2,2,2,'#fff3b0');return true}
  if(v==='feather'){for(let i=0;i<6;i++){const[x,y]=R(-i*2,0);P(x-1,y-1,3,3,'#14141f')}for(let i=0;i<6;i++){const[x,y]=R(-i*2,(i%2?2:-2)*(i>0?1:0));P(x,y,2,2,'#f4f4f8')}const[x,y]=R(0,0);P(x,y,2,2,'#c8c8d0');return true}
  if(v==='para'){P(X-5,Y-6,10,12,'#14141f');P(X-4,Y-5,8,10,'#f6f1e1');c.fillStyle='#2f6fd0';c.font='bold 10px monospace';c.textAlign='center';c.fillText('§',X,Y+4);return true}
  if(v==='glare'){for(let i=0;i<5;i++){const[x,y]=R(-i*4,0);c.globalAlpha=1-i*0.18;P(x-1,y-1,3,3,'#c8c8d0')}c.globalAlpha=1;P(X-3,Y-1,6,2,'#ffffff');P(X-1,Y-3,2,6,'#ffffff');return true}
  if(v==='net'){for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)if((i+j)%2===0){const x=X+i*3,y=Y+j*3;P(x,y,2,2,Math.random()<0.3?'#ffffff':'#ffe36b')}return true}
  return false}

// accuracy: standing still makes shots precise, moving spreads them (up to ±13°); 0.7 s of standing = full precision
function aimSpread(F){const m=clamp(1-(performance.now()-(F.mvT||0))/700,0,1);return 0.015+0.21*m}
// simple projectiles curve slightly toward the target (only when it is roughly in front)
function homeShot(s,dt){if(s.wave||s.mel||s.cap||s.dead||s.age<0.08)return;const mv=MOVES[s.mid];if(!mv||mv.k!=='shot')return;const T=s.side===B.me.side?B.foe:B.me;if(!T||T.out||T.faint>0)return;
  const a=Math.atan2(s.vy,s.vx),b=Math.atan2(T.y-12-s.y,T.x-s.x);let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;if(Math.abs(d)>0.9)return;
  const t=clamp(d,-1.1*dt,1.1*dt),sp=Math.hypot(s.vx,s.vy),na=a+t;s.vx=Math.cos(na)*sp;s.vy=Math.sin(na)*sp}
