// ===== Sog (undertow): a whirlpool that snakes across the field in waves and sucks in
// opponents and every light obstacle (plants, crates, driftwood). Captured obstacles spin
// along with the whirlpool and smash into the target for extra damage.
const SOG_LIGHT={bush:1,flower:1,fern:1,reeds:1,shrub:1,crate:1,drift:1};
const SOG_R=110;
function sogRelease(s){for(const o of B.obs||[])if(o.sw===s.id){o.sw=null;o.x=clamp(o.x,24,AW-24);o.y=clamp(o.y,24,AH-16)}}
vortexShot=function(s,dt,T,alive){
  if(s.bx==null){s.bx=s.x;s.by=s.y;const L=Math.hypot(s.vx,s.vy)||1;s.px=-s.vy/L;s.py=s.vx/L;s.sgc=0}
  s.bx+=s.vx*dt;s.by+=s.vy*dt;const w=Math.sin(s.age*3.4)*Math.min(26,4+s.age*9);s.x=s.bx+s.px*w;s.y=s.by+s.py*w*0.8;
  if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;sogRelease(s);if(!outArena(s.x,s.y+10))leaveHazard(s,s.x,s.y+8);return}
  // heavy obstacles (rock, stumps, logs, bollards) still stop it
  for(const o of B.obs||[]){if(o.dead||o.sw===s.id)continue;const dx=s.x-o.x,dy=s.y-(o.y-8),d=Math.hypot(dx,dy);
    if(SOG_LIGHT[o.kind]&&!o.sw){if(d<70){const f=(60*(1-d/70)+14)*dt;o.x+=dx/(d||1)*f;o.y+=dy/(d||1)*f;if(d<s.r+o.r*0.6&&s.sgc<3){o.sw=s.id;o.swA=Math.atan2(dy,dx);s.sgc++;burst(o.x,o.y-8,'#d8f0ff',6)}}continue}
    if(!SOG_LIGHT[o.kind]&&d<o.r+(s.r||4)){s.dead=1;sogRelease(s);hitObs(o,s);leaveHazard(s,s.x,s.y+8);return}}
  // captured obstacles orbit the whirlpool
  let k=0;for(const o of B.obs||[]){if(o.sw!==s.id||o.dead)continue;o.swA+=dt*7;const R=16+k*5;o.x=s.x+Math.cos(o.swA)*R;o.y=s.y+8+Math.sin(o.swA)*R*0.55;k++}
  if(!alive)return;const dx=s.x-T.x,dy=s.y-(T.y-12),d=Math.hypot(dx,dy)||1;
  if(d<SOG_R&&T.ctrl!=='remote'&&!airBusy(T)&&!(T.dashT>0)){const pull=95*(1-d/SOG_R)+14;T.x+=dx/d*pull*dt;T.y+=dy/d*pull*dt*0.9;arenaClamp(T);obsPush(T)}
  if(d<s.r+11&&T.inv<=0){s.dead=1;const n=(B.obs||[]).filter(o=>o.sw===s.id&&!o.dead);
    const hit=n.length?Object.assign({},s,{p:Math.round(s.p*(1+0.25*n.length))}):s;shotHit(hit,T);
    for(const o of n)breakObs(o);if(n.length)say(`Der Sog schleudert ${n.length} Hindernis${n.length>1?'se':''} mit!`);
    sogRelease(s);leaveHazard(s,T.x,T.y)}};
// whirlpool look: spiral arms, foam rim and water drawn inwards
{const _ds=drawSpecial;drawSpecial=function(c,s,col,now){if(s.k!=='vortex')return _ds.apply(this,arguments);
  const X=Math.round(s.x),Y=Math.round(s.y)+4,R=16,sp=now/110;
  c.fillStyle='#1d5fb888';pxEl(c,X,Y,R+2,(R+2)*0.55,1);c.fillStyle='#3d8bf2aa';pxEl(c,X,Y,R-3,(R-3)*0.55,1);
  for(let arm=0;arm<3;arm++)for(let i=0;i<16;i++){const t=i/16,a=sp+arm*2.094+t*5.2,r=2+t*R;c.fillStyle=i%4===0?'#ffffff':i%2?'#d8f0ff':'#7fc0ff';
    c.fillRect(Math.round(X+Math.cos(a)*r)-1,Math.round(Y+Math.sin(a)*r*0.55)-1,i>10?3:2,2)}
  for(let i=0;i<10;i++){const a=-sp*0.7+i*0.628;c.fillStyle=i%2?'#ffffff':'#bfe4ff';c.fillRect(Math.round(X+Math.cos(a)*(R+3)),Math.round(Y+Math.sin(a)*(R+3)*0.55),2,1)}
  c.fillStyle='#0b2a55';c.fillRect(X-2,Y-1,4,2);
  // streaks drawn towards the centre (the pull)
  for(let i=0;i<6;i++){const a=i*1.047+now/700,q=((now/600+i*0.37)%1),r=R+22-q*20;c.fillStyle='#d8f0ff';c.globalAlpha=0.5*q+0.2;c.fillRect(Math.round(X+Math.cos(a)*r),Math.round(Y+Math.sin(a)*r*0.55),3,1)}c.globalAlpha=1}}
