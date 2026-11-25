// ===== Stärke der Natur: grass attacks make roots burst out of the ground,
// Gigasauger is a slow, fully homing energy orb whose stolen energy floats back to the user,
// Wachstum makes the monster bigger (+10 % size, max HP, AP regeneration; stacks up to 3x).
const ROOT_HOLD={vinelash:0.5,noodlelash:0.4,rankennetz:0.6,brambleburst:0.7};
function rootBurst(x,y,big){if(!B)return;const nw=performance.now();if(!big&&B.rfx&&B.rfx.length&&nw-B.rfx[B.rfx.length-1].t0<260)return;(B.rfx=B.rfx||[]).push({x,y,t0:performance.now(),dur:big?900:650,n:big?9:6,R:big?24:15,seed:Math.random()*99});if(B.rfx.length>10)B.rfx.shift()}
// one tendril: grows up out of the ground in a curl, thorn nubs, then sinks back
function drawTendril(c,x,y,ang,len,k,seed){const grow=k<0.35?k/0.35:k>0.75?1-(k-0.75)/0.25:1,L=len*grow,dir=Math.cos(ang)>0?1:-1;let px=x,py=y;
  for(let t=0;t<L;t+=1.5){const q=t/len,nx=x+Math.cos(ang)*t*0.35+dir*Math.sin(q*3.2+seed)*q*6,ny=y-t+Math.sin(q*2)*1;
    const w=Math.max(1,Math.round(3*(1-q)+0.5));c.fillStyle='#2a1a08';c.fillRect(Math.round(nx)-1,Math.round(ny),w+1,2);c.fillStyle=q<0.6?'#7a4e22':'#4f8a2a';c.fillRect(Math.round(nx),Math.round(ny),w,2);
    if(((t*7+seed*3)|0)%9===0){c.fillStyle='#c8e070';c.fillRect(Math.round(nx)+dir*w,Math.round(ny),1,1)}px=nx;py=ny}
  if(grow>0.8){c.fillStyle='#6fc23a';c.fillRect(Math.round(px)-1,Math.round(py)-1,3,2);c.fillStyle='#a8e070';c.fillRect(Math.round(px),Math.round(py)-1,1,1)}}
function drawRootFx(c,now){if(!B||!B.rfx||!B.rfx.length)return;B.rfx=B.rfx.filter(e=>now-e.t0<e.dur);
  for(const e of B.rfx){const k=(now-e.t0)/e.dur;
    // cracked earth under the target
    c.globalAlpha=k>0.7?(1-k)/0.3:1;c.fillStyle='#3a2a10b0';pxEl(c,e.x,e.y+2,e.R*Math.min(1,k*5),e.R*0.4*Math.min(1,k*5),1);
    for(let i=0;i<e.n;i++){const a=e.seed+i*6.283/e.n,rx=e.x+Math.cos(a)*e.R*0.8,ry=e.y+2+Math.sin(a)*e.R*0.32,kk=clamp(k-i*0.025,0,1);
      drawTendril(c,rx,ry,a,(e.R>20?30:22)+((i*5)%7),kk,e.seed+i)}
    if(k<0.25)for(let i=0;i<4;i++){c.fillStyle='#8a6a48';c.fillRect(Math.round(e.x+Math.cos(e.seed+i)*e.R*k*4),Math.round(e.y-k*30+i*2),2,2)}
    c.globalAlpha=1}}
// roots hazards: tendrils sway up out of them
function drawRootHaz(c,now){for(const h of (B&&B.haz)||[]){if(h.k!=='roots'||h.until<now)continue;const n=4,life=Math.min(1,(now-h.t0)/400,(h.until-now)/600);
  for(let i=0;i<n;i++){const a=(h.seed%100)/16+i*1.57,x=h.x+Math.cos(a)*h.r*0.6,y=h.y+Math.sin(a)*h.r*0.25;drawTendril(c,x,y,a+Math.sin(now/600+i)*0.4,12*life,0.5,i+h.seed%7)}}}

// --- Gigasauger: slow orb that always homes in on the target ---
const GIGA_SP=125;
{const _sp0=shotParams0;shotParams0=function(mid){const r=_sp0(mid);if(mid==='gigadrain'&&r){r.sp=GIGA_SP/1.2;r.life=4.5;r.r=7;r.giga=1}return r}}
function gigaSteer(dt){for(const s of (B&&B.shots)||[]){if(s.mid!=='gigadrain'||s.dead||s.nm)continue;const T=s.side===B.me.side?B.foe:B.me;if(!T||T.out||T.faint>0)continue;
  const a=Math.atan2(T.y-12-s.y,T.x-s.x),cur=Math.atan2(s.vy,s.vx);let d=a-cur;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;
  const na=cur+clamp(d,-5*dt,5*dt);s.vx=Math.cos(na)*GIGA_SP;s.vy=Math.sin(na)*GIGA_SP;
  if(Math.random()<dt*30)B.parts.push({x:s.x+(Math.random()-.5)*6,y:s.y+(Math.random()-.5)*6,vx:-s.vx*0.1,vy:-s.vy*0.1,life:0.4,age:0,c:Math.random()<.5?'#7dff6a':'#d8ffb0'})}}
function drawGiga(c,s,now){const X=Math.round(s.x),Y=Math.round(s.y),p=1+Math.sin(now/90)*0.15;
  c.fillStyle='#2e8a1f70';pxEl(c,X,Y,9*p,9*p,1);c.fillStyle='#5fd24a';pxEl(c,X,Y,6*p,6*p,1);c.fillStyle='#c8ffa0';pxEl(c,X,Y,3,3,1);c.fillStyle='#ffffff';c.fillRect(X-1,Y-2,2,2);
  for(let i=0;i<4;i++){const a=now/150+i*1.57;c.fillStyle='#b8ff90';c.fillRect(Math.round(X+Math.cos(a)*10),Math.round(Y+Math.sin(a)*10),2,2)}}
// drained energy: green orbs float from the target back to the user on a curvy path
function drainOrbs(T,A,n){if(!B||!T||!A)return;const now=performance.now();(B.dfx=B.dfx||[]);for(let i=0;i<n;i++)B.dfx.push({x0:T.x+(Math.random()-.5)*14,y0:T.y-14+(Math.random()-.5)*10,A,t0:now+i*70,dur:850,bend:(Math.random()-.5)*60})
  if(B.dfx.length>30)B.dfx.splice(0,B.dfx.length-30)}
function drawDrain(c,now){if(!B||!B.dfx||!B.dfx.length)return;B.dfx=B.dfx.filter(o=>now-o.t0<o.dur);
  for(const o of B.dfx){const k=(now-o.t0)/o.dur;if(k<0)continue;const e=k*k*(3-2*k),tx=o.A.x,ty=o.A.y-14,dx=tx-o.x0,dy=ty-o.y0,L=Math.hypot(dx,dy)||1;
    const x=o.x0+dx*e+(-dy/L)*o.bend*Math.sin(e*Math.PI),y=o.y0+dy*e+(dx/L)*o.bend*Math.sin(e*Math.PI)-Math.sin(e*Math.PI)*10;
    c.fillStyle='#2e8a1f';c.fillRect(Math.round(x)-2,Math.round(y)-2,5,5);c.fillStyle='#7dff6a';c.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);c.fillStyle='#ffffff';c.fillRect(Math.round(x),Math.round(y)-1,1,1)}}

// hooks
{const _sh=shotHit;shotHit=function(s,T){const r=_sh.apply(this,arguments);try{const mv=s&&MOVES[s.mid];if(mv&&T){
  if(mv.t==='grass'&&(mv.p||0)>0&&!s.wv){rootBurst(T.x,T.y,mv.k==='big'||s.mid==='solarbeam'||s.mid==='rankennetz');
    const h=ROOT_HOLD[s.mid];if(h&&T.ctrl!=='remote'&&!airBusy(T)){if(!(T.st.root>0)){T.rx=T.x;T.ry=T.y}T.st.root=Math.max(T.st.root||0,h)}}
  if(mv.fx==='drain'){const A=s.side===B.me.side?B.me:B.foe;drainOrbs(T,A,s.mid==='gigadrain'?9:5)}}}catch(e){}return r}}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);try{gigaSteer(dt)}catch(e){}}}
{const _da=drawArenaEv;drawArenaEv=function(c,now,top){const r=_da.apply(this,arguments);try{if(!top){drawRootHaz(c,now);drawRootFx(c,now)}else drawDrain(c,now)}catch(e){}return r}}

// --- Wachstum ---
{const _st=stats;stats=function(m){const r=_st(m);if(m&&m.gw){if(m._gwB&&m._gwB===B&&B)r.mhp=Math.round(r.mhp*(1+0.1*m.gw));else{delete m.gw;delete m._gwB;if(m.hp>r.mhp)m.hp=r.mhp}}return r}}
{const _sm=selfMove;selfMove=function(F,mv){const r=_sm.apply(this,arguments);if(B&&mv===MOVES.growth){const m=act(F);if(m){if(m._gwB!==B){m.gw=0;m._gwB=B}
  if(m.gw<3){const o=stats(m).mhp;m.gw++;const n=stats(m).mhp;if(F.ctrl!=='remote'){m.hp=Math.min(n,m.hp+(n-o));F.ap=Math.min(AP_MAX,(F.ap??AP_MAX)+10)}
    rootBurst(F.x,F.y,1);say(`${SPECIES[m.s].n} wächst! (+10 % Größe, KP und AP)`)}else say(`${SPECIES[m.s].n} kann nicht weiter wachsen.`)}}return r}}

// ===== Schlammbombe: on impact it bursts into 6 mud splatters that fly outward
MOVES.schlammspritzer={n:'Schlammspritzer',t:'poison',p:16,k:'shot',fx:'psn',ch:.12,hidden:1};
{const _ss=specialShot;specialShot=function(s,dt){const r=_ss.apply(this,arguments);
  if(s.mid==='schlammbombe'&&s.k==='lob'&&s.dead&&!s.splat&&B&&B.state==='fight'){s.splat=1;let h=0;for(const ch of String(s.id))h=(h*31+ch.charCodeAt(0))|0;const a0=(Math.abs(h)%628)/100,x=s.x,y=s.y+2;
    for(let i=0;i<6;i++){const a=a0+i*1.047;B.shots.push({id:s.id+'m'+i,side:s.side,att:s.att,mid:'schlammspritzer',x:x+Math.cos(a)*8,y:y+Math.sin(a)*5,vx:Math.cos(a)*165,vy:Math.sin(a)*120,age:0,life:0.42,r:3,p:MOVES.schlammspritzer.p,frag:1})}
    for(let i=0;i<10;i++)B.parts.push({x:x+(Math.random()-.5)*10,y:y,vx:(Math.random()-.5)*90,vy:-30-Math.random()*50,life:0.5,age:0,c:Math.random()<.5?'#7a3d8a':'#5a4a28'})}
  return r}}

// ===== Wurzelfalle: the ground under the target cracks, then roots burst out and hold it tight
MOVES.wurzelfalle={n:'Wurzelfalle',t:'grass',p:40,k:'rootrap',cd:4.5};
{for(const sid in SPECIES){const sp=SPECIES[sid];if(sp.t!=='grass'||!Array.isArray(sp.ls)||sp.ls.some(x=>x[1]==='wurzelfalle'))continue;sp.ls.push([20,'wurzelfalle']);sp.ls.sort((a,b)=>a[0]-b[0])}}
const RT_WARN=0.55,RT_HOLD=1.6,RT_R=22;
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;if(mv.k==='rootrap')return{k:'rootrap',nm:1,sp:1,r:RT_R,p:mv.p,n:1,life:RT_WARN+0.9};return _sp0(mid)}}
NK.rootrap={tick(s,dt,T,alive){
    if(!s.init){s.init=1;const A=sideF(s.side);if(T&&alive){s.tx=T.x;s.ty=T.y}else{s.tx=A?A.x+(A.face||1)*60:AW/2;s.ty=A?A.y:AH/2}s.tx=clamp(s.tx,24,AW-24);s.ty=clamp(s.ty,24,AH-16)}
    if(!s.fired&&s.age>=RT_WARN){s.fired=1;rootBurst(s.tx,s.ty,1);B.shakeUntil=Math.max(B.shakeUntil||0,performance.now()+120);
      if(alive&&Math.hypot(T.x-s.tx,(T.y-s.ty)*1.3)<RT_R+6&&!airBusy(T)){nkHit(s,T,T.x,T.y-12,{});if(T.ctrl!=='remote'){T.rx=T.x;T.ry=T.y;T.st.root=Math.max(T.st.root||0,RT_HOLD)}
        say(`${SPECIES[act(T).s].n} hängt in der Wurzelfalle fest!`)}
      hazPush({k:'roots',x:s.tx,y:s.ty,r:18,t0:performance.now(),until:performance.now()+5000,seed:Math.floor(Math.random()*1e6)})}
    if(s.age>s.life)s.dead=1},
  draw(c,s,col,now){if(s.tx==null)return;const k=s.age/RT_WARN;
    if(!s.fired){// warning: cracks spread on the ground where the trap will spring
      c.fillStyle='#3a2a1060';pxEl(c,s.tx,s.ty,RT_R*k,RT_R*0.45*k,1);
      for(let i=0;i<6;i++){const a=i*1.047+0.3;let px=s.tx,py=s.ty;for(let j=1;j<=3;j++){const L=RT_R*Math.min(1,k)*j/3,nx=s.tx+Math.cos(a+(j%2?0.3:-0.3))*L,ny=s.ty+Math.sin(a)*L*0.45;mLine(c,px,py,nx,ny,'#2a1a08',1);px=nx;py=ny}}
      if(Math.floor(now/120)%2){c.fillStyle='#6fc23a';c.fillRect(Math.round(s.tx)-1,Math.round(s.ty)-1,3,2)}}
    else{// the held target: roots coil around it
      const T=s.side===B.me.side?B.foe:B.me;if(T&&T.st&&T.st.root>0&&Math.hypot(T.x-s.tx,T.y-s.ty)<30)for(let i=0;i<5;i++){const a=i*1.257+now/900;drawTendril(c,T.x+Math.cos(a)*11,T.y+Math.sin(a)*4,a,20,0.5,i)}}}};
{const _md=moveDesc;moveDesc=function(mid){const r=_md(mid);return MOVES[mid]&&MOVES[mid].k==='rootrap'?r.replace('Fernkampf','Bodenfalle am Ziel · hält 1,6 s fest'):r}}
