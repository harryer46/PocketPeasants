// ===== Nebelschleier: fog drifts over the whole arena for 6 s (the caster still gets its shield).
// In the fog the opposing AI aims badly; everyone sees the field only hazily.
const FOG_MS=6000;
{const _sm=selfMove;selfMove=function(F,mv){const r=_sm.apply(this,arguments);if(B&&mv===MOVES.mistveil){const now=performance.now();B.fog={t0:now,until:now+FOG_MS,side:F.side};say('Nebel zieht über das Feld!')}return r}}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);if(!B||!B.fog)return;if(performance.now()>B.fog.until){B.fog=null;return}
  for(const F of[B.me,B.foe])if(F&&F.side!==B.fog.side&&F.ctrl==='ai'&&F.aimAng!=null)F.aimAng+=(Math.random()-.5)*4*dt}}
function drawFog(c,now){const f=B&&B.fog;if(!f)return;const k=(now-f.t0)/FOG_MS;if(k>=1)return;const a=Math.min(1,k*6)*(k>0.85?(1-k)/0.15:1);
  c.save();c.globalAlpha=0.32*a;c.fillStyle='#dfe6ee';c.fillRect(0,0,AW,AH);
  // drifting banks of fog (chunky pixel blobs)
  for(let i=0;i<14;i++){const sp=6+(i%4)*4,x=((i*67+now/1000*sp*(i%2?1:-1))%(AW+120)+AW+120)%(AW+120)-60,y=20+((i*53)%(AH-30));
    c.globalAlpha=0.38*a;c.fillStyle=i%3?'#eef2f6':'#c9d3de';pxEl(c,x,y,34+(i%3)*10,9+(i%2)*4,1);c.globalAlpha=0.25*a;c.fillStyle='#ffffff';pxEl(c,x+10,y-3,18,5,1)}
  c.restore()}
{const _da=drawArenaEv;drawArenaEv=function(c,now,top){const r=_da.apply(this,arguments);if(top)try{drawFog(c,now)}catch(e){}return r}}

// ===== Wellenschlag: besides the hit a small wave rolls forward from the attacker
function miniWave(x,y,a){if(!B)return;(B.mwv=B.mwv||[]).push({x,y,a,t0:performance.now()});if(B.mwv.length>6)B.mwv.shift()}
function drawMiniWaves(c,now){if(!B||!B.mwv||!B.mwv.length)return;B.mwv=B.mwv.filter(w=>now-w.t0<650);
  for(const w of B.mwv){const k=(now-w.t0)/650,d=8+k*78,ux=Math.cos(w.a),uy=Math.sin(w.a),px=-uy,py=ux,X=w.x+ux*d,Y=w.y+uy*d,h=Math.sin(Math.min(1,k*1.4)*Math.PI)*13+3,W=20+k*14;
    c.globalAlpha=k>0.75?(1-k)/0.25:1;
    for(let i=-W;i<=W;i+=2){const q=1-Math.abs(i)/W,hh=Math.max(1,Math.round(h*q)),cx=Math.round(X+px*i),cy=Math.round(Y+py*i*0.7);
      c.fillStyle='#14141f';c.fillRect(cx-1,cy-hh-1,3,hh+2);c.fillStyle='#3d8bf2';c.fillRect(cx,cy-hh,2,hh);c.fillStyle='#ffffff';c.fillRect(cx,cy-hh,2,1)}
    if(Math.random()<0.5)B.parts.push({x:X+(Math.random()-.5)*W,y:Y-h,vx:ux*30,vy:-20,life:0.3,age:0,c:'#d8f0ff'});c.globalAlpha=1}}
{const _da=drawArenaEv;drawArenaEv=function(c,now,top){const r=_da.apply(this,arguments);if(!top)try{drawMiniWaves(c,now)}catch(e){}return r}}
{const _ms=meleeSwing;meleeSwing=function(c,s,col,now){if(s.mid==='waveslam'&&!s.mw){s.mw=1;const A=mOwner(s);if(A)miniWave(A.x,A.y+4,Math.atan2(s.vy,s.vx))}return _ms.apply(this,arguments)}}

// ===== puddles that touch flow together into one bigger puddle; an electrified puddle charges the puddles it touches
const PUD_MAX=44;
function puddleMerge(){const now=performance.now(),H=(B.haz||[]).filter(h=>h.until>now&&(h.k==='puddle'||h.k==='zap'));
  for(let i=0;i<H.length;i++){const a=H[i];if(a.gone)continue;for(let j=i+1;j<H.length;j++){const b=H[j];if(b.gone)continue;
    const d=Math.hypot(a.x-b.x,(a.y-b.y)*1.6);if(d>(a.r+b.r)*0.8)continue;
    if(a.k!==b.k){const p=a.k==='puddle'?a:b;p.k='zap';p.t0=now;p.until=Math.max(p.until,now+3000);continue}
    const A1=a.r*a.r,A2=b.r*b.r;a.x=(a.x*A1+b.x*A2)/(A1+A2);a.y=(a.y*A1+b.y*A2)/(A1+A2);a.r=Math.min(PUD_MAX,Math.sqrt(A1+A2));a.until=Math.max(a.until,b.until);
    b.gone=1;burst(a.x,a.y,'#8fc8f0',6);if(!B.pudSaid||now-B.pudSaid>4000){B.pudSaid=now;say('Die Pfützen fließen zusammen!')}}}
  if(H.some(h=>h.gone))B.haz=B.haz.filter(h=>!h.gone)}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);if(!B||!B.haz||!B.haz.length)return;B.pudT=(B.pudT||0)+dt;if(B.pudT<0.25)return;B.pudT=0;try{puddleMerge()}catch(e){}}}
