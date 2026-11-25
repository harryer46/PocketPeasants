/* Mechanik der Umgebungs-Attacken (Daten: 04f_env_moves.js) + allgemeine Regeln:
   - Wasser leitet Strom: Elektro-Geschosse, die eine Pfütze berühren, setzen sie unter Strom (3 s, Schläge für alle darin)
   - Wasser löscht Feuer: Wasser-Geschosse, Strahlen und Wellen löschen brennenden Boden (Dampf) */
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;
  const P={rockthrow:{life:1.6},shortcircuit:{life:0.9},wildfire:{life:2.4},gale:{life:0.6},bigwave:{life:3.4},whirl4:{life:0.05}}[mv.k];
  if(P)return Object.assign({k:mv.k,nm:1,sp:1,r:8,p:mv.p,n:1},P);return _sp0(mid)}}
const ROCKY=new Set(['rock','boulder','pillar','coral','crystal']);
function envLocal(F){return F&&F.ctrl!=='remote'&&!F.out&&!(F.faint>0)}
function envZap(F,d,why){if(!envLocal(F))return;dealDamage(F,d,'#ffe14d','-'+d);if(F.st.stun<=0)F.st.stun=0.25;burst(F.x,F.y-14,'#ffe14d',8);if(why)say(why)}
function hazPush(h){B.haz=(B.haz||[]).filter(x=>x.until>performance.now());if(B.haz.length>=16)B.haz.shift();B.haz.push(h);return h}
const ENVK={
  rockthrow:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}
      if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;let best=null,bd=40;
        for(const o of B.obs||[]){if(o.dead||o.ind)continue;const isR=ROCKY.has(o.kind)||o.mat==='rock';if(!isR)continue;const d=Math.hypot(o.x-A.x,(o.y-A.y)*1.3)-o.r;if(d<bd){bd=d;best=o}}
        if(best){s.big=1;s.kind=best.kind;best.dead=1;best.hp=0;burst(best.x,best.y-6,'#8a8a8a',10);if(B.mode==='duel'){B.obGone=B.obGone||[];if(!B.obGone.includes(best.id)){B.obGone.push(best.id);try{publishDuel(true)}catch(e){}}}
          s.lift=0.28;say(`${SPECIES[act(A).s].n} reißt einen Fels heraus und wirft ihn!`)}
        else{s.big=0;s.lift=0;s.p=Math.round(s.p*0.35);if(A===B.me)say('Kein Fels direkt neben dir – nur ein Kiesel! (stell dich an einen Fels)')}
        dkLock(A,s.big?380:150);s.x=A.x;s.y=A.y-(s.big?30:14)}
      if(s.lift>0){s.lift-=dt;s.x=A.x;s.y=A.y-30-Math.sin(Math.max(0,s.lift)/0.28*Math.PI)*4;return}
      const sp=s.big?230:260;s.x+=s.ux*sp*dt;s.y+=s.uy*sp*dt;s.spin=(s.spin||0)+dt*12;
      if(outArena(s.x,s.y+10)||s.age>s.life){s.dead=1;burst(s.x,s.y,'#8a8a8a',s.big?14:5);return}
      for(const o of B.obs||[]){if(o.dead)continue;if(Math.hypot(s.x-o.x,s.y-(o.y-8))<o.r+(s.big?10:4)){s.dead=1;if(s.big&&!o.ind&&o.hp<=110)breakObs(o);else hitObs(o,s);burst(s.x,s.y,'#8a8a8a',12);B.shakeUntil=performance.now()+100;return}}
      if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<(s.big?11:4)+11){s.dead=1;nkHit(s,T,T.x,T.y-12,{vx:s.ux,vy:s.uy,kb:s.big?16:4});burst(s.x,s.y,'#8a8a8a',s.big?16:5);if(s.big){B.shakeUntil=performance.now()+160;shockwave(s.x,s.y+10,34,'#a07848',0.3)}}},
    draw(c,s,col,now){const X=Math.round(s.x),Y=Math.round(s.y);if(!s.big){c.fillStyle='#14141f';c.fillRect(X-3,Y-3,6,6);c.fillStyle='#9aa0a6';c.fillRect(X-2,Y-2,4,4);return}
      c.fillStyle='#00000040';c.fillRect(X-8,Y+18,16,3);const o=Math.floor(s.spin||0)%2;c.fillStyle='#14141f';c.fillRect(X-10,Y-8,20,16);c.fillRect(X-8,Y-10,16,20);
      c.fillStyle='#7d838c';c.fillRect(X-9,Y-7,18,14);c.fillRect(X-7,Y-9,14,18);c.fillStyle='#9aa0a6';c.fillRect(X-7+o*2,Y-7,8,6);c.fillStyle='#5a5f68';c.fillRect(X+1-o*2,Y+2,7,5);c.fillStyle='#c8ccd2';c.fillRect(X-6+o*2,Y-6,2,2)}},
  shortcircuit:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}
      if(!s.init){s.init=1;dkLock(A,300);const now=performance.now();s.arcs=[];const pud=(B.haz||[]).filter(h=>h.until>now&&(h.k==='puddle'||h.k==='zap'));
        for(const h of pud){h.k='zap';h.t0=now;h.until=Math.max(h.until,now+3000);h.zs=s.side;s.arcs.push([h.x,h.y])}
        const hitT=alive&&!(T.inv>0)&&!airBusy(T)&&((T.st&&T.st.wet>0)||pud.some(h=>Math.hypot(T.x-h.x,(T.y-h.y)*1.3)<h.r+6));
        if(pud.length)say(`Kurzschluss! Strom jagt durch ${pud.length} Pfütze${pud.length>1?'n':''}!`);else say('Kein Wasser auf dem Feld – der Kurzschluss verpufft fast.');
        if(hitT)nkHit(s,T,T.x,T.y-12,{kb:4});else if(alive&&!pud.length&&Math.hypot(T.x-A.x,T.y-A.y)<70)nkHit(s,T,T.x,T.y-12,{p:Math.round(s.p*0.3),kb:2});
        s.ax=A.x;s.ay=A.y-12}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){if(!s.arcs)return;const pts=[[s.ax,s.ay]].concat(s.arcs);c.save();c.globalAlpha=1-s.age/s.life;for(let i=1;i<pts.length;i++){let[x0,y0]=pts[i-1];const[x1,y1]=pts[i];const n=8;for(let k=1;k<=n;k++){const x=x0+(x1-x0)*k/n+(Math.random()-.5)*8,y=y0+(y1-y0)*k/n+(Math.random()-.5)*8;c.fillStyle=k%2?'#ffe14d':'#ffffff';c.fillRect(Math.round(x)-1,Math.round(y)-1,3,3)}}c.restore()}},
  wildfire:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}const now=performance.now();
      if(!s.init){s.init=1;dkLock(A,300);s.cx=A.x;s.cy=A.y;s.lit=new Set();s.next=0;let n=0;
        for(const o of B.obs||[]){if(o.dead||o.ind)continue;const m=o.mat||'rock';if(m!=='plant'&&m!=='wood')continue;if(Math.hypot(o.x-A.x,(o.y-A.y)*1.3)<130){s.lit.add(o.id);n++}}
        say(n?`Flächenbrand! ${n} Pflanze${n>1?'n fangen':' fängt'} Feuer!`:'Flächenbrand – nichts Brennbares in der Nähe, nur ein Glutring.');
        if(!n)for(let i=0;i<6;i++){const a=i/6*Math.PI*2;hazPush({k:'fire',x:clamp(A.x+Math.cos(a)*34,24,AW-24),y:clamp(A.y+Math.sin(a)*22,24,AH-16),r:12,t0:now,until:now+3500,seed:i*97})}}
      if(s.age>=s.next){s.next=s.age+0.45;const add=[];
        for(const o of B.obs||[]){if(o.dead||!s.lit.has(o.id))continue;hazPush({k:'fire',x:o.x,y:o.y,r:16,t0:now,until:now+4500,seed:Math.floor(Math.random()*1e6)});o.hp-=Math.max(3,o.max*0.35);o.hitT=now;if(o.hp<=0)breakObs(o);
          for(const q of B.obs){if(q.dead||q.ind||s.lit.has(q.id))continue;const m=q.mat||'rock';if((m==='plant'||m==='wood')&&Math.hypot(q.x-o.x,q.y-o.y)<70)add.push(q.id)}}
        add.forEach(id=>s.lit.add(id));
        if(alive&&!(T.inv>0)&&!airBusy(T)&&!s.hit&&(B.haz||[]).some(h=>h.k==='fire'&&h.until>now&&Math.hypot(T.x-h.x,(T.y-h.y)*1.3)<h.r+6)){s.hit=1;nkHit(s,T,T.x,T.y-12,{kb:3})}}
      if(s.age>s.life)s.dead=1},draw(){}},
  gale:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}
      if(!s.init){s.init=1;dkLock(A,250);const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;s.ox=A.x;s.oy=A.y-10;let moved=0;
        for(const h of B.haz||[]){const dx=h.x-A.x,dy=h.y-A.y,along=dx*ux+dy*uy;if(along<-20||Math.abs(dx*uy-dy*ux)>70)continue;h.vx=(h.vx||0)+ux*110;h.vy=(h.vy||0)+uy*80;h.blown=performance.now()+900;moved++;if(h.k==='fire')h.r=Math.min(26,h.r+5)}
        if(moved)say(`Orkan! Der Sturm treibt ${moved} Feld${moved>1?'er':''} vor sich her.`);
        if(alive&&!(T.inv>0)&&!airBusy(T)){const dx=T.x-A.x,dy=T.y-A.y,along=dx*ux+dy*uy;if(along>0&&along<200&&Math.abs(dx*uy-dy*ux)<60){nkHit(s,T,T.x,T.y-12,{vx:ux,vy:uy,kb:26})}}}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){if(s.ox==null)return;const k=s.age/s.life;c.save();c.globalAlpha=0.8*(1-k);for(let i=0;i<22;i++){const t=((i*0.137+k*1.6)%1),d=t*200,w=((i*37)%120)-60,x=s.ox+s.ux*d-s.uy*w,y=s.oy+s.uy*d+s.ux*w*0.75;c.fillStyle=i%3?'#e8f4ff':'#b8d8f0';c.fillRect(Math.round(x),Math.round(y),6,1)}c.restore()}},
  bigwave:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}
      if(!s.init){s.init=1;dkLock(A,400);const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;const te=1/Math.hypot(ux/ARX,uy/ARY);s.cx=ACX-ux*(te+8);s.cy=ACY-uy*(te+8);s.L=440;s.lastP=0;say(`${SPECIES[act(A).s].n} ruft eine riesige Welle vom Rand des Feldes! (Hinter Deckung oder per Sprint ausweichen)`)}
      const sp=165;s.cx+=s.ux*sp*dt;s.cy+=s.uy*sp*dt;s.x=s.cx;s.y=s.cy-10;const now=performance.now();
      const onWave=(x,y,pad)=>{const dx=x-s.cx,dy=y-s.cy,along=dx*s.ux+dy*s.uy,lat=dx*-s.uy+dy*s.ux;return Math.abs(along)<10+pad&&Math.abs(lat)<s.L/2};
      for(const o of B.obs||[]){if(o.dead||o.ind||!onWave(o.x,o.y,o.r))continue;if(o.hp<=60||o.tmp||(o.mat||'')!=='rock'){breakObs(o);burst(o.x,o.y-6,'#8fc8f0',10)}}
      for(const h of B.haz||[]){if(h.k==='fire'&&onWave(h.x,h.y,h.r)){h.until=now;steamPuff(h.x,h.y)}}
      if(s.age-s.lastP>0.6){s.lastP=s.age;for(const i of[-1,1]){const x=s.cx-s.uy*i*70-s.ux*20,y=s.cy+s.ux*i*45-s.uy*14;if(!outArena(x,y))hazPush({k:'puddle',x:clamp(x,24,AW-24),y:clamp(y,24,AH-16),r:15,t0:now,until:now+6000,seed:Math.floor(Math.random()*1e6)})}}
      const covered=F=>(B.obs||[]).some(o=>{if(o.dead)return false;const dx=F.x-o.x,dy=F.y-o.y,al=dx*s.ux+dy*s.uy,lat=Math.abs(dx*-s.uy+dy*s.ux);return al>0&&al<o.r+34&&lat<o.r+4});
      if(!s.hit&&alive&&!airBusy(T)&&onWave(T.x,T.y,8)&&covered(T)){if(!s.cov){s.cov=1;say(`${SPECIES[act(T).s].n} geht hinter Deckung — die Welle bricht am Hindernis!`)}}
      else if(!s.hit&&alive&&!airBusy(T)&&onWave(T.x,T.y,8)){if(T.inv>0||T.dashT>0){if(!s.dodged){s.dodged=1;say(`${SPECIES[act(T).s].n} sprintet durch die Welle!`)}}else{s.hit=1;nkHit(s,T,T.x,T.y-12,{vx:s.ux,vy:s.uy,kb:22});if(T.ctrl!=='remote'){T.st.wet=Math.max(T.st.wet||0,3)}}}
      if(s.age>s.life||(Math.hypot((s.cx-ACX)/ARX,(s.cy-ACY)/ARY)>1.08&&s.age>0.8))s.dead=1},
    draw(c,s,col,now){if(s.cx==null)return;const n=Math.ceil(s.L/4);for(let i=0;i<n;i++){const lat=-s.L/2+i*4,x=s.cx-s.uy*lat,y=s.cy+s.ux*lat*0.75,h=14+Math.round(Math.sin(now/90+i*0.5)*3);if(outArena(x,y+4))continue;
      for(const d of[14,7,0]){const X=Math.round(x-s.ux*d),Y=Math.round(y-s.uy*d*0.75),hh=Math.round(h*(1-d/30));c.fillStyle='#14141f';c.fillRect(X-4,Y-hh-1,8,hh+2);c.fillStyle=d?'#1f5fa8':'#2f7fd0';c.fillRect(X-3,Y-hh,6,hh);c.fillStyle=d?'#3d8bf2':'#5aa8ff';c.fillRect(X-3,Y-hh,6,Math.round(hh*0.45))}c.fillStyle=(i+Math.floor(now/120))%3?'#ffffff':'#d8f0ff';c.fillRect(Math.round(x)-3,Math.round(y)-h-2,6,3)}}},
  whirl4:{tick(s,dt,T,alive){s.dead=1;const A=sideF(s.side);if(!A)return;const now=performance.now(),rnd=mulberry32(hashStr(String(s.id||now)));
      for(let i=0;i<4;i++){const a=rnd()*6.283,q=0.25+rnd()*0.55;hazPush({k:'vortex',x:ACX+Math.cos(a)*ARX*q,y:ACY+Math.sin(a)*ARY*q,r:16,t0:now,until:now+8000,seed:i,side:s.side,p:s.p,mid:s.mid,ang:rnd()*6.28,rad:24+rnd()*26,ox:0,oy:0,cx0:ACX+Math.cos(a)*ARX*q,cy0:ACY+Math.sin(a)*ARY*q,w:(rnd()<.5?-1:1)*(0.9+rnd()*0.6)})}
      say(`${MOVES[s.mid].n}: vier Wasserwirbel ziehen übers Feld!`)},draw(){}}};
Object.assign(NK,ENVK);
// hazards that move / act: vortices wander and grab the opponent, electrified puddles shock, blown hazards drift; water puts out fire
function envMovesTick(dt){if(!B||B.tb||!B.haz)return;const now=performance.now();
  for(const h of B.haz){if(h.until<now)continue;
    if(h.k==='vortex'){h.ang+=h.w*dt;h.cx0+=(h.vx||0)*dt;h.cy0+=(h.vy||0)*dt;h.x=h.cx0+Math.cos(h.ang)*h.rad;h.y=h.cy0+Math.sin(h.ang)*h.rad*0.6;
      if(Math.hypot((h.x-ACX)/ARX,(h.y-ACY)/ARY)>0.92){h.cx0+=(ACX-h.cx0)*0.02;h.cy0+=(ACY-h.cy0)*0.02}}
    else if(h.vx||h.vy){if(h.blown>now){h.x=clamp(h.x+h.vx*dt,24,AW-24);h.y=clamp(h.y+h.vy*dt,24,AH-16)}else{h.vx=0;h.vy=0}}}
  if(B.state!=='fight')return;
  for(const F of[B.me,B.foe]){if(!envLocal(F))continue;
    for(const h of B.haz){if(h.until<now||Math.hypot(F.x-h.x,(F.y-h.y)*1.3)>h.r+4)continue;
      if(h.k==='zap'&&!(F.inv>0)&&!(F.st.fly>0)){if(!F.zapT||now-F.zapT>700){F.zapT=now;const d=Math.max(1,Math.round(act(F).mhp*0.03));envZap(F,d,!F.zapSaid?`${SPECIES[act(F).s].n} steht in der Strompfütze!`:'');F.zapSaid=1}}
      if(h.k==='vortex'&&h.side!==F.side&&!(F.inv>0)&&!(F.st.fly>0)){F.x+=(h.x-F.x)*Math.min(1,dt*3);F.y+=(h.y-F.y)*Math.min(1,dt*3);arenaClamp(F);F.st.slow=Math.max(F.st.slow||0,0.4);
        if(!F.vxT||now-F.vxT>700){F.vxT=now;const A=sideF(h.side),def=act(F);if(A){const d=Math.max(1,Math.round(calcDmg(act(A),def,h.mid,(h.p||40)*0.35).d));dealDamage(F,d,'#5aa8ff','-'+d);burst(F.x,F.y-12,'#8fc8f0',6)}}}}}
  // water puts out fire; electricity into puddles
  for(const s of B.shots||[]){if(s.dead||!MOVES[s.mid])continue;const t=MOVES[s.mid].t;if(t!=='water'&&t!=='electric')continue;
    for(const h of B.haz){if(h.until<now)continue;let hit=false;
      if(s.k==='jet'&&s.len){const[ux,uy]=nkDir(s),px=h.x-s.x,py=(h.y-8)-s.y,tt=px*ux+py*uy;hit=tt>0&&tt<s.len&&Math.abs(px*uy-py*ux)<h.r+6}
      else hit=Math.hypot(s.x-h.x,(s.y+8-h.y)*1.3)<h.r+(s.r||4)+(s.wave?s.r:0);
      if(!hit)continue;
      if(t==='water'&&h.k==='fire'){h.until=now;steamPuff(h.x,h.y);if(!B.extSaid||now-B.extSaid>2500){B.extSaid=now;say('Das Wasser löscht das Feuer!')}}
      else if(t==='electric'&&h.k==='puddle'){h.k='zap';h.t0=now;h.until=Math.max(h.until,now+3000);if(!B.zapSaid||now-B.zapSaid>2500){B.zapSaid=now;say('Wasser leitet Strom – die Pfütze steht unter Spannung!')}}}}}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);try{envMovesTick(dt)}catch(e){console.error(e)}}}
{const _dh=drawHazards;drawHazards=function(c,now){_dh(c,now);if(!B||!B.haz)return;for(const h of B.haz){if(h.until<now)continue;const X=Math.round(h.x),Y=Math.round(h.y),a=Math.min(1,(h.until-now)/400,(now-h.t0)/200);c.save();c.globalAlpha=a;
  if(h.k==='zap'){c.fillStyle='#3d8bf2a0';pxEl(c,X,Y,h.r,h.r*0.5,1);for(let i=0;i<5;i++){const t=now/60+i*1.7,x=X+Math.round(Math.cos(t*1.3)*h.r*0.7),y=Y+Math.round(Math.sin(t)*h.r*0.3);c.fillStyle=i%2?'#ffe14d':'#ffffff';c.fillRect(x-1,y-2,2,4);c.fillRect(x,y-1,3,1)}}
  else if(h.k==='vortex'){for(let i=0;i<14;i++){const t=i/14*Math.PI*4+now/150*(h.w>0?1:-1),r=2+i*1.1;c.fillStyle=i%3?'#3d8bf2':'#d8f0ff';c.fillRect(Math.round(X+Math.cos(t)*r)-1,Math.round(Y+Math.sin(t)*r*0.55)-1,3,2)}c.fillStyle='#14141f';c.fillRect(X-1,Y-1,2,2)}
  c.restore()}}}
// Windkanal: 2,2 s Dauerwind in Zielrichtung – drückt den Gegner (und seine Geschosse) mit, schleudert ihn gegen Hindernisse und in Gefahrenfelder
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;if(mv.k==='windstream')return{k:'windstream',nm:1,sp:1,r:8,p:mv.p,n:1,life:2.2};const r=_sp0(mid);if(mv.kb&&r)r.kb=mv.kb;return r}}
NK.windstream={tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0){s.dead=1;return}
    if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;s.nt=0;dkLock(A,350);say(`${SPECIES[act(A).s].n} entfesselt einen Windkanal!`)}
    s.ox=A.x;s.oy=A.y-10;const L=230,W=34,inCh=(x,y)=>{const dx=x-s.ox,dy=y-s.oy,al=dx*s.ux+dy*s.uy,lat=Math.abs(dx*s.uy-dy*s.ux);return al>0&&al<L&&lat<W+al*0.15};
    for(const b of B.shots||[]){if(b.dead||b.side===s.side||b.nm||b.cap)continue;if(inCh(b.x,b.y)){const sp=Math.hypot(b.vx,b.vy)||1;b.vx+=s.ux*500*dt;b.vy+=s.uy*500*dt;const n=Math.hypot(b.vx,b.vy);b.vx*=sp/n;b.vy*=sp/n}}
    if(alive&&!airBusy(T)&&inCh(T.x,T.y-10)){
      if(T.ctrl!=='remote'&&!(T.dashT>0)){const x0=T.x,y0=T.y;T.x+=s.ux*210*dt;T.y+=s.uy*150*dt;arenaClamp(T);obsPush(T);
        const moved=Math.hypot(T.x-x0,T.y-y0);if(moved<210*dt*0.35&&!s.slam){s.slam=1;const d=Math.max(1,Math.round(calcDmg(act(A),act(T),s.mid,s.p*1.6).d));dealDamage(T,d,'#ffffff','-'+d);B.shakeUntil=performance.now()+140;burst(T.x,T.y-12,'#e8f4ff',12);say(`${SPECIES[act(T).s].n} wird gegen das Hindernis geschleudert!`)}}
      if(s.age>=s.nt){s.nt=s.age+0.45;nkHit(s,T,T.x,T.y-12,{p:s.p*0.35,vx:s.ux,vy:s.uy,kb:0})}}
    if(s.age>s.life)s.dead=1},
  draw(c,s,col,now){if(s.ox==null)return;c.save();const k=s.age/s.life;c.globalAlpha=0.85*Math.min(1,(1-k)*4);for(let i=0;i<34;i++){const t=((i*0.173+s.age*1.9)%1),d=t*230,w=(((i*53)%100)/100-0.5)*2*(34+d*0.15),x=s.ox+s.ux*d-s.uy*w,y=s.oy+s.uy*d+s.ux*w*0.75;
    c.fillStyle=i%4?'#e8f4ff':'#9fd0f0';c.fillRect(Math.round(x-s.ux*4),Math.round(y-s.uy*3),Math.abs(s.ux)>0.5?8:2,Math.abs(s.ux)>0.5?1:6)}c.restore()}};
{const _hl=hitLocal;hitLocal=function(T,s){const mv=s&&MOVES[s.mid];if(mv&&mv.kb&&s.kb==null)s=Object.assign({},s,{kb:mv.kb});return _hl.call(this,T,s)}}
// Erdbeben: Kamera bebt 1,6 s, 10–20 Steine fallen verteilt aufs Feld (Schatten → Einschlag). Treffer am Gegner, jeder dritte Stein bleibt 8 s liegen (→ Felswurf!)
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;if(mv.k==='quake')return{k:'quake',nm:1,sp:1,r:8,p:mv.p,n:1,life:2.2};return _sp0(mid)}}
NK.quake={tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}const now=performance.now();
    if(!s.init){s.init=1;dkLock(A,500);B.shakeUntil=now+1600;const rnd=mulberry32(hashStr(String(s.id)));const n=10+Math.floor(rnd()*11);s.rocks=[];
      for(let i=0;i<n;i++){let x,y,tries=0;do{const a=rnd()*6.283,q=Math.sqrt(rnd())*0.92;x=ACX+Math.cos(a)*ARX*q;y=ACY+Math.sin(a)*ARY*q;tries++}while(Math.hypot(x-A.x,y-A.y)<26&&tries<8);
        if(i<3&&alive){x=T.x+(rnd()-0.5)*40;y=T.y+(rnd()-0.5)*26}s.rocks.push({x,y,t:0.1+rnd()*1.3,done:0,stay:i%3===0,sz:6+Math.floor(rnd()*4)})}
      say(`ERDBEBEN! ${s.rocks.length} Steine stürzen vom Himmel!`)}
    if(now<B.shakeUntil-200&&Math.random()<0.4)B.parts.push({x:ACX+(Math.random()-.5)*ARX*2,y:ACY+(Math.random()-.5)*ARY*2,vx:0,vy:-14,life:0.4,age:0,c:'#a07848'});
    for(const r of s.rocks){if(r.done||s.age<r.t+0.55)continue;r.done=1;burst(r.x,r.y,'#8a8a8a',8);burst(r.x,r.y,'#a07848',5);B.shakeUntil=Math.max(B.shakeUntil,now+90);
      if(alive&&(s.hits||0)<3&&!airBusy(T)&&!(T.inv>0)&&Math.hypot(T.x-r.x,(T.y-r.y)*1.3)<r.sz+12&&(s.hits=(s.hits||0)+1))nkHit(s,T,T.x,T.y-12,{p:Math.round(s.p*0.32),kb:5});
      if(r.stay&&!outArena(r.x,r.y+6)){B.obs=B.obs||[];if(!B.obs.some(o=>!o.dead&&Math.hypot(o.x-r.x,o.y-r.y)<22)&&Math.hypot(A.x-r.x,A.y-r.y)>20&&Math.hypot(T.x-r.x,T.y-r.y)>20)B.obs.push({id:s.id+'q'+B.obs.length,kind:'rock',mat:'rock',ind:0,x:r.x,y:r.y,r:9,hp:40,max:40,v:0,tmp:now+8000})}}
    if(s.age>s.life)s.dead=1},
  draw(c,s,col,now){if(!s.rocks)return;for(const r of s.rocks){if(r.done)continue;const k=(s.age-r.t)/0.55;if(k<-0.5)continue;const kk=Math.max(0,k),X=Math.round(r.x),Y=Math.round(r.y);
      c.fillStyle='#00000055';const w=Math.round(r.sz*(0.5+kk*0.8));c.fillRect(X-w,Y-1,2*w,3);
      if(k>0){const h=Math.round((1-kk)*(1-kk)*170),sz=r.sz;c.fillStyle='#14141f';c.fillRect(X-sz-1,Y-h-2*sz-1,2*sz+2,2*sz+2);c.fillStyle='#7d838c';c.fillRect(X-sz,Y-h-2*sz,2*sz,2*sz);c.fillStyle='#9aa0a6';c.fillRect(X-sz+1,Y-h-2*sz+1,sz,sz-1);c.fillStyle='#5a5f68';c.fillRect(X,Y-h-sz,sz-1,sz-1)}}}};
// ---- Eis & Gift: Vergiftung, Giftwolken, Glatteis ----
HAZ_KIND.poison={k:'gas',r:18,ms:6000};HAZ_KIND.ice={k:'icefloor',r:17,ms:7000};
function psnApply(T,why){if(!T||T.ctrl==='remote'||SPECIES[act(T).s].t==='poison')return;const now=performance.now();if(T.st.tox>0&&!T.toxMild)return;
  const fresh=!(T.st.tox>0);T.st.tox=Math.max(T.st.tox||0,6);T.toxMild=1;T.toxN=T.toxN||0;if(fresh){T.toxT=now+1000;say(`${SPECIES[act(T).s].n} wurde vergiftet!${why?' ('+why+')':''}`)}}
{const _hl=hitLocal;hitLocal=function(T,s){const r=_hl.apply(this,arguments);try{const mv=s&&MOVES[s.mid];if(mv&&T&&!(T.faint>0)){const ch=mv.fx==='psn'?(mv.ch||0.3):mv.psn||0;if(ch&&Math.random()<ch)psnApply(T)}}catch(e){}return r}}
function ipTick(dt){if(!B||B.tb||!B.haz)return;const now=performance.now();
  if(B.state==='fight')for(const F of[B.me,B.foe]){if(!envLocal(F))continue;for(const h of B.haz){if(h.until<now||Math.hypot(F.x-h.x,(F.y-h.y)*1.3)>h.r+4)continue;
    if(h.k==='gas'&&!(F.st.fly>0))psnApply(F,'Giftwolke');
    if(h.k==='icefloor'&&!(F.st.fly>0)&&SPECIES[act(F).s].t!=='ice'){F.st.slow=Math.max(F.st.slow||0,0.5);if(!F.iceSaid){F.iceSaid=1;say(`${SPECIES[act(F).s].n} rutscht auf dem Glatteis!`)}}}}
  for(const s of B.shots||[]){if(s.dead||!MOVES[s.mid])continue;const t=MOVES[s.mid].t;if(t!=='ice'&&t!=='fire')continue;
    for(const h of B.haz){if(h.until<now||Math.hypot(s.x-h.x,(s.y+8-h.y)*1.3)>h.r+(s.r||4))continue;
      if(t==='ice'&&h.k==='puddle'){h.k='icefloor';h.t0=now;h.until=Math.max(h.until,now+5000);burst(h.x,h.y,'#c8f0ff',8);if(!B.frzSaid||now-B.frzSaid>2500){B.frzSaid=now;say('Die Pfütze gefriert zu Glatteis!')}}
      else if(t==='fire'&&h.k==='icefloor'){h.k='puddle';h.t0=now;steamPuff(h.x,h.y)}
      else if(t==='fire'&&h.k==='gas'){h.until=now;shockwave(h.x,h.y,h.r+26,'#ff9a3d',0.35);burst(h.x,h.y,'#ffcb3d',16);B.shakeUntil=now+200;say('Die Giftwolke explodiert!');
        for(const F of[B.me,B.foe])if(envLocal(F)&&Math.hypot(F.x-h.x,(F.y-h.y)*1.3)<h.r+30){const d=Math.max(1,Math.round(act(F).mhp*0.12));dealDamage(F,d,'#ff9a3d','-'+d)}}}}}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);try{ipTick(dt)}catch(e){console.error(e)}}}
{const _dh=drawHazards;drawHazards=function(c,now){_dh(c,now);if(!B||!B.haz)return;for(const h of B.haz){if(h.until<now)continue;const X=Math.round(h.x),Y=Math.round(h.y),a=Math.min(1,(h.until-now)/400,(now-h.t0)/200);c.save();c.globalAlpha=a;
  if(h.k==='gas'){for(let i=0;i<9;i++){const t=now/700+i*0.7,x=X+Math.round(Math.cos(t+i)*h.r*0.6),y=Y-4+Math.round(Math.sin(t*1.3+i)*h.r*0.35);c.fillStyle=i%3?'#a24cc480':'#c88ae080';c.fillRect(x-4,y-3,8,6);c.fillRect(x-3,y-4,6,8)}}
  else if(h.k==='icefloor'){c.fillStyle='#bfe8f8c0';pxEl(c,X,Y,h.r,h.r*0.5,1);c.fillStyle='#ffffff';c.fillRect(X-h.r*0.4|0,Y-2,4,1);c.fillRect(X+3,Y+1,3,1);if(Math.floor(now/300+h.seed)%5===0)c.fillRect(X-2,Y-1,2,2)}
  c.restore()}}}
