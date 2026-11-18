/* ===================== NEW ATTACK KINDS (v0.96) =====================
   Nine moves from the original games that were still missing – every one with its own mechanic:
   Knochmerang  (rock)     boomerang: flies out, slows down, turns and comes back – can hit going out AND coming back
   Walzer       (rock)     the attacker rolls itself: bounces off the arena edge, every bounce makes it stronger; steerable
   Stachler     (rock)     throws 3 caltrops that stay on the ground (12 s); whoever steps on one is hurt and slowed
   Egelsamen    (grass)    a seed that sticks: drains 4 % HP per second to the attacker – sprint to shake it off
   Feuerwirbel  (fire)     a ring of fire around the target that slowly shrinks; touching it burns, it holds you in (or out)
   Spiegelcape  (water)    1.3 s mirror: enemy projectiles bounce back with 150 % power (melee goes through)
   Magnetbombe  (electric) slow mine that locks on and speeds up; explodes nearby – outrun it or shoot it down
   Wirbelwind   (flying)   gust cone: blows enemy projectiles away and hurls the target back – into the edge = slam + stun
   Delegator    (normal)   pay 20 % of your HP for a decoy (8 s): it soaks up hits and the opponent aims at it */
Object.assign(MOVES,{
  bonemerang:{n:'Knochmerang',t:'rock',p:35,k:'boomer'},
  rollout:{n:'Walzer',t:'rock',p:34,k:'roll',cd:3},
  spikes:{n:'Stachler',t:'rock',p:40,k:'spikes',fx:'slow',cd:4},
  leechseed:{n:'Egelsamen',t:'grass',p:15,k:'seed',cd:4},
  firespin:{n:'Feuerwirbel',t:'fire',p:30,k:'ring',fx:'burn',cd:4},
  mirrorcoat:{n:'Spiegelcape',t:'water',p:0,k:'mirror',cd:5},
  magnetbomb:{n:'Magnetbombe',t:'electric',p:70,k:'mine',fx:'stun',cd:3.5},
  whirlwind:{n:'Wirbelwind',t:'flying',p:40,k:'blow',cd:3},
  substitute:{n:'Delegator',t:'normal',p:0,k:'decoy',cd:12}});
// who learns them: every species of the type, at these levels
{const NEW_LS={rock:[[11,'bonemerang'],[16,'rollout'],[25,'spikes']],grass:[[15,'leechseed']],fire:[[16,'firespin']],water:[[17,'mirrorcoat']],
  electric:[[16,'magnetbomb']],flying:[[15,'whirlwind']],normal:[[14,'substitute']]};
 for(const sid in SPECIES){const sp=SPECIES[sid];if(!Array.isArray(sp.ls))continue;let ch=0;for(const e of NEW_LS[sp.t]||[])if(!sp.ls.some(x=>x[1]===e[1])){sp.ls.push(e);ch=1}if(ch)sp.ls.sort((a,b)=>a[0]-b[0])}}
const NK_LABEL={boomer:'Bumerang',roll:'Rollangriff',spikes:'Fallen',seed:'Saugsamen',ring:'Feuerring',mirror:'Spiegel',mine:'Zielmine',blow:'Windstoß',decoy:'Köder'};
{const _md=moveDesc;moveDesc=function(mid){const r=_md(mid),mv=MOVES[mid];return mv&&NK_LABEL[mv.k]?r.replace('Fernkampf',NK_LABEL[mv.k]):r}}
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;
  switch(mv.k){
    case'boomer':return{k:'boomer',nm:1,sp:210,life:2.4,r:6,p:mv.p,n:1};
    case'roll':return{k:'roll',nm:1,sp:1,life:2.6,r:11,p:mv.p,n:1};
    case'spikes':return{k:'spikes',nm:1,sp:1,life:0.55,r:5,p:mv.p,n:1};
    case'seed':return{k:'seed',nm:1,sp:150,life:1.7,r:4,p:mv.p,n:1};
    case'ring':return{k:'ring',nm:1,sp:165,life:1.5,r:6,p:mv.p,n:1};
    case'mirror':return{k:'mirror',nm:1,sp:1,life:1.3,r:17,p:0,n:1};
    case'mine':return{k:'mine',nm:1,sp:45,life:4.2,r:6,p:mv.p,n:1};
    case'blow':return{k:'blow',nm:1,sp:1,life:0.4,r:0,p:mv.p,n:1};
    case'decoy':return{k:'decoy',nm:1,sp:1,life:8,r:10,p:0,n:1}}
  return _sp0(mid)}}
function nkState(){return B.nk||(B.nk={traps:[],rings:[],decoy:{}})}
function nkDir(s){const L=Math.hypot(s.vx,s.vy)||1;return[s.vx/L,s.vy/L]}
function nkFoeShots(side){return(B.shots||[]).filter(b=>!b.dead&&b.side!==side&&!b.cap)}
function nkHit(s,T,x,y,extra){shotHit(Object.assign({},s,{x,y},extra||{}),T)}
const NK={
  // ---- boomerang
  boomer:{tick(s,dt,T,alive){const A=sideF(s.side);if(!s.init){s.init=1;s.hit={};s.spd=Math.hypot(s.vx,s.vy)}
      if(!s.back){s.spd-=230*dt;const[ux,uy]=nkDir(s);if(s.spd<=0){s.back=1;s.spd=0}else{s.vx=ux*s.spd;s.vy=uy*s.spd}}
      if(s.back){if(!A||A.out){s.dead=1;return}s.spd=Math.min(260,s.spd+300*dt);const dx=A.x-s.x,dy=(A.y-12)-s.y,d=Math.hypot(dx,dy)||1;s.vx=dx/d*s.spd;s.vy=dy/d*s.spd;
        if(d<12){s.dead=1;burst(s.x,s.y,'#e8dcc0',5);return}}
      s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.age>s.life){s.dead=1;burst(s.x,s.y,'#e8dcc0',6);return}
      const ph=s.back?'b':'o';if(alive&&!s.hit[ph]&&T.inv<=0&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){s.hit[ph]=1;nkHit(s,T,s.x,s.y)}},
    draw(c,s,col,now){const a=now/45,P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};
      for(let i=-2;i<=2;i++){const x=s.x+Math.cos(a)*i*2.6,y=s.y+Math.sin(a)*i*2.6;P(x-2,y-2,4,4,'#14141f')}
      for(let i=-2;i<=2;i++){const x=s.x+Math.cos(a)*i*2.6,y=s.y+Math.sin(a)*i*2.6;P(x-1,y-1,2,2,Math.abs(i)===2?'#ffffff':'#e8dcc0')}}},
  // ---- rollout: the attacker becomes the projectile
  roll:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0){s.dead=1;return}
      if(!s.init){s.init=1;s.b=0;const[ux,uy]=nkDir(s);s.vx=ux*185;s.vy=uy*185;s.hitDone=0}
      s.x=A.x;s.y=A.y-10;if(A.ctrl==='remote')return;A.landT=performance.now()+120;   // no walking or attacking while rolling
      // steer a little: the player with the movement keys, the AI towards its target
      let wx=0,wy=0;if(A===B.me){for(const d of held){wx+=DIRS[d][0];wy+=DIRS[d][1]}if(JOY.active&&Math.hypot(JOY.x,JOY.y)>0.2){wx=JOY.x;wy=JOY.y}}else if(T){wx=T.x-A.x;wy=T.y-A.y}
      if(wx||wy){const a=Math.atan2(s.vy,s.vx),b=Math.atan2(wy,wx);let d=Math.atan2(Math.sin(b-a),Math.cos(b-a));const t=clamp(d,-2.2*dt,2.2*dt),sp=Math.hypot(s.vx,s.vy);s.vx=Math.cos(a+t)*sp;s.vy=Math.sin(a+t)*sp}
      A.x+=s.vx*dt;A.y+=s.vy*dt;A.face=s.vx<0?-1:1;if(Math.random()<0.6)B.parts.push({x:A.x+(Math.random()-.5)*10,y:A.y,vx:-s.vx*0.1,vy:-8,life:0.35,age:0,c:'#c8b89a'});
      const ex=(A.x-ACX)/ARX,ey=(A.y-ACY)/ARY;let bounce=Math.hypot(ex,ey)>=1;
      for(const o of B.obs||[]){if(o.dead||o.ind)continue;if(Math.hypot(A.x-o.x,(A.y-o.y)*1.4)<o.r+10){hitObs(o,s);const nx=A.x-o.x,ny=A.y-o.y,L=Math.hypot(nx,ny)||1,dot=(s.vx*nx+s.vy*ny)/L;if(dot<0){s.vx-=2*dot*nx/L;s.vy-=2*dot*ny/L}A.x+=nx/L*3;A.y+=ny/L*3;bounce=bounce||false;break}}
      if(bounce){arenaClamp(A);const nx=(A.x-ACX)/(ARX*ARX),ny=(A.y-ACY)/(ARY*ARY),L=Math.hypot(nx,ny)||1,ux=nx/L,uy=ny/L,dot=s.vx*ux+s.vy*uy;if(dot>0){s.vx-=2*dot*ux;s.vy-=2*dot*uy}
        s.b++;const k=1.15;s.vx*=k;s.vy*=k;burst(A.x,A.y-4,'#a2742c',10);B.shakeUntil=performance.now()+90;if(A===B.me)say(`Walzer prallt ab – Stufe ${s.b+1}!`);if(s.b>3){s.dead=1;return}}
      if(alive&&!s.hitDone&&T.inv<=0&&!airBusy(T)&&Math.hypot(A.x-T.x,(A.y-T.y)*1.2)<20){s.hitDone=1;nkHit(s,T,T.x,T.y-12,{p:Math.round(s.p*(1+0.45*s.b)),kb:20});burst(T.x,T.y-10,'#ffffff',10);s.dead=1}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){const a=now/40,P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};const R=11;
      for(let i=0;i<10;i++){const q=a+i*0.628,x=s.x+Math.cos(q)*R,y=s.y+Math.sin(q)*R;P(x-2,y-2,4,4,'#14141f');P(x-1,y-1,2,2,i%2?'#e8dcc0':col)}
      if((s.b||0)>0)for(let i=0;i<s.b;i++)P(s.x-6+i*4,s.y-R-6,3,3,'#ffcb3d')}},
  // ---- caltrops
  spikes:{tick(s,dt,T,alive){const N=nkState();if(!s.init){s.init=1;const A=sideF(s.side),[ux,uy]=nkDir(s);let cx=T?T.x:s.x+ux*90,cy=T?T.y:s.y+uy*90;
        if(!T||Math.hypot(cx-s.x,cy-s.y)>150){cx=s.x+ux*100;cy=s.y+12+uy*100}s.pts=[0,1,2].map(i=>{const a=i*2.09+Math.random();return{x0:s.x,y0:s.y,x:clamp(cx+Math.cos(a)*16,AX0+6,AX1-6),y:clamp(cy+Math.sin(a)*10,AY0+6,AY1-6)}})}
      if(s.age<s.life)return;s.dead=1;const now=performance.now();
      for(const p of s.pts){N.traps.push({x:p.x,y:p.y,side:s.side,s:Object.assign({},s,{k:null,nm:0}),until:now+12000});burst(p.x,p.y,'#8a8a8a',3)}
      const mine=N.traps.filter(t=>t.side===s.side);if(mine.length>6)N.traps=N.traps.filter(t=>t.side!==s.side||mine.indexOf(t)>=mine.length-6)},
    draw(c,s,col,now){if(!s.pts)return;const k=clamp(s.age/s.life,0,1);for(const p of s.pts){const x=p.x0+(p.x-p.x0)*k,y=p.y0+(p.y-p.y0)*k-Math.sin(k*Math.PI)*26;c.fillStyle='#14141f';c.fillRect(Math.round(x)-2,Math.round(y)-2,5,5);c.fillStyle='#b8bcc8';c.fillRect(Math.round(x)-1,Math.round(y)-1,3,3)}}},
  // ---- leech seed
  seed:{tick(s,dt,T,alive){s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;return}if(shotVsObs(s))return;
      if(alive&&T.inv<=0&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){s.dead=1;nkHit(s,T,s.x,s.y);if(act(T).hp>0){T.seed={side:s.side,t:6,tick:0};say(`Egelsamen klammert sich an ${SPECIES[act(T).s].n}!${T===B.me&&!B.tb?' Sprinte, um ihn abzuschütteln!':''}`)}}},
    draw(c,s,col,now){const P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};P(s.x-3,s.y-3,6,6,'#14141f');P(s.x-2,s.y-2,4,4,'#8a5a2a');P(s.x-1,s.y-4,2,2,'#3ddc6b')}},
  // ---- fire spin: a shrinking fire ring around the target
  ring:{tick(s,dt,T,alive){s.x+=s.vx*dt;s.y+=s.vy*dt;let at=null;
      if(alive&&T.inv<=0&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){nkHit(s,T,s.x,s.y);at={x:T.x,y:T.y}}
      else if(s.age>s.life||outArena(s.x,s.y+10)||shotVsObs(s))at={x:clamp(s.x,AX0+20,AX1-20),y:clamp(s.y+12,AY0+14,AY1-14)};
      if(!at)return;s.dead=1;const N=nkState();N.rings=N.rings.filter(r=>r.side!==s.side);
      const r={x:at.x,y:at.y,r0:36,t0:performance.now(),dur:4200,side:s.side,s:Object.assign({},s,{k:null,nm:0,p:Math.max(1,Math.round(s.p*0.4))}),inside:{}};
      for(const F of[B.me,B.foe])if(F)r.inside[F.side]=Math.hypot(F.x-r.x,(F.y-r.y)*1.4)<r.r0;N.rings.push(r);burst(at.x,at.y,'#ff8a3d',14)},
    draw(c,s,col,now){const P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};const a=now/60;for(let i=0;i<3;i++){const x=s.x+Math.cos(a+i*2.1)*5,y=s.y+Math.sin(a+i*2.1)*4;P(x-2,y-2,4,4,'#14141f');P(x-1,y-1,2,2,i?'#ffcb3d':'#f0642a')}}},
  // ---- mirror coat
  mirror:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out){s.dead=1;return}s.x=A.x;s.y=A.y-12;if(s.age>s.life){s.dead=1;return}
      for(const b of nkFoeShots(s.side)){if(b.nm||b.mel||b.ref)continue;if(Math.hypot(b.x-s.x,(b.y-s.y)*1.15)<s.r+(b.r||4)){b.side=s.side;b.vx*=-1.15;b.vy*=-1.15;b.age=0;b.ref=1;b.p=Math.round((b.p||20)*1.5);b.x+=b.vx*0.03;b.y+=b.vy*0.03;burst(b.x,b.y,'#bfe2ff',8);if(A===B.me||T===B.me)say('Zurückgespiegelt!')}}},
    draw(c,s,col,now){const k=s.age/s.life,fl=Math.floor(now/70)%2;c.strokeStyle=fl?'#bfe2ffd0':'#ffffffa0';c.lineWidth=1;pxEl(c,Math.round(s.x),Math.round(s.y),s.r,s.r*1.15,0);
      if(fl){c.fillStyle='#ffffffc0';const a=now/200;c.fillRect(Math.round(s.x+Math.cos(a)*s.r)-1,Math.round(s.y+Math.sin(a)*s.r*1.15)-1,3,3)}if(k>0.75&&fl){c.strokeStyle='#3d8bf2';pxEl(c,Math.round(s.x),Math.round(s.y),s.r-3,(s.r-3)*1.15,0)}}},
  // ---- magnet bomb: locks on, speeds up, explodes nearby
  mine:{tick(s,dt,T,alive){const sp=Math.min(118,45+s.age*36);let a=Math.atan2(s.vy,s.vx);
      if(alive&&!airBusy(T)){const b=Math.atan2((T.y-12)-s.y,T.x-s.x);const d=Math.atan2(Math.sin(b-a),Math.cos(b-a));a+=clamp(d,-2.6*dt,2.6*dt)}
      s.vx=Math.cos(a)*sp;s.vy=Math.sin(a)*sp;s.x+=s.vx*dt;s.y+=s.vy*dt;
      const boom=()=>{s.dead=1;const col=TYPES.electric.c;burst(s.x,s.y,col,18);burst(s.x,s.y,'#ffffff',8);(B.rings=B.rings||[]).push({x:s.x,y:s.y+10,t0:performance.now(),r0:4,r1:30,col});B.shakeUntil=performance.now()+120;
        if(alive&&T.inv<=0&&!airBusy(T)&&Math.hypot(T.x-s.x,(T.y-12-s.y)*1.2)<30)nkHit(s,T,T.x,T.y-12)};
      for(const b of nkFoeShots(s.side)){if(b.nm||b.mel)continue;if(Math.hypot(b.x-s.x,b.y-s.y)<(b.r||4)+s.r+1){b.dead=1;s.dead=1;burst(s.x,s.y,'#ffffff',10);burst(s.x,s.y,TYPES.electric.c,6);say('Magnetbombe abgeschossen!');return}}
      if(s.age>s.life||outArena(s.x,s.y+10)){boom();return}
      for(const o of B.obs||[])if(!o.dead&&Math.hypot(s.x-o.x,s.y-(o.y-8))<o.r+s.r){hitObs(o,s);boom();return}
      if(alive&&Math.hypot(T.x-s.x,(T.y-12-s.y))<16)boom()},
    draw(c,s,col,now){const P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};P(s.x-5,s.y-5,10,10,'#14141f');P(s.x-4,s.y-4,8,8,'#5a5f73');P(s.x-4,s.y-4,4,8,'#d23b3b');P(s.x,s.y-4,4,8,'#3d6bd9');
      const bl=Math.floor(now/Math.max(60,260-s.age*55))%2;P(s.x-1,s.y-7,2,2,bl?'#ffcb3d':'#14141f')}},
  // ---- whirlwind: cone gust, deflects shots, hurls the target (into the edge = slam)
  blow:{tick(s,dt,T,alive){const A=sideF(s.side);if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;s.x0=A?A.x:s.x;s.y0=A?A.y-10:s.y;
        const inCone=(x,y,R)=>{const dx=x-s.x0,dy=y-s.y0,d=Math.hypot(dx,dy);return d<120+R&&(d<R+8||Math.acos(clamp((dx*ux+dy*uy)/(d||1),-1,1))<0.62)};
        let n=0;for(const b of nkFoeShots(s.side)){if(b.k==='air'||b.k==='fly'||b.k==='roll')continue;if(inCone(b.x,b.y,b.r||4)){b.dead=1;n++;burst(b.x,b.y,'#e8eef4',6)}}if(n)say(`Wirbelwind fegt ${n>1?n+' Geschosse':'ein Geschoss'} weg!`);
        if(alive&&!airBusy(T)&&inCone(T.x,T.y-12,9)){nkHit(s,T,T.x,T.y-12,{vx:ux,vy:uy,kb:4});if(T.ctrl!=='remote'){T.kv={vx:ux*270,vy:uy*270,t:0.45,mid:s.mid}}}}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){if(s.ux==null)return;const k=s.age/s.life;for(let i=0;i<9;i++){const a=Math.atan2(s.uy,s.ux)+(i/8-0.5)*1.1,d=20+k*100+((i*13)%17),x=s.x0+Math.cos(a)*d,y=s.y0+Math.sin(a)*d;
      c.fillStyle=i%2?'#ffffffc0':'#c8d4ffb0';c.fillRect(Math.round(x),Math.round(y),Math.round(4+6*(1-k)),1)}}},
  // ---- substitute: a decoy that soaks up hits
  decoy:{tick(s,dt,T,alive){const A=sideF(s.side),N=nkState();if(!A){s.dead=1;return}
      if(!s.init){s.init=1;const m=act(A),cost=Math.max(1,Math.round(m.mhp*0.2));if(A.ctrl!=='remote'&&m.hp<=cost+1){s.dead=1;if(A===B.me)say('Zu wenig KP für den Delegator!');return}
        if(A.ctrl!=='remote')dealDamage(A,cost,'#c0c4d6');s.hp=s.max=cost;s.x=A.x;s.y=A.y;s.sid=m.s;if(N.decoy[s.side])N.decoy[s.side].dead=1;N.decoy[s.side]=s;burst(s.x,s.y-10,'#ffffff',12);say(`${SPECIES[m.s].n} stellt einen Delegator auf!`)}
      const pop=()=>{s.dead=1;burst(s.x,s.y-10,'#ffffff',14);burst(s.x,s.y-10,'#c0c4d6',8);if(N.decoy[s.side]===s)N.decoy[s.side]=null};
      if(s.age>s.life){pop();return}
      for(const b of nkFoeShots(s.side)){if(b.k==='air'||b.k==='fly'||b.k==='blow'||b.k==='decoy'||b.k==='mirror')continue;if(Math.hypot(b.x-s.x,b.y-(s.y-10))<(b.r||4)+12){b.dead=1;
          const d=Math.max(1,Math.round(calcDmg(b.att||act(A),act(A),b.mid,b.p).d*(b.am||1)));s.hp-=d;B.nums.push({x:s.x,y:s.y-30,t:'-'+d,c:'#c0c4d6',at:performance.now()});burst(b.x,b.y,'#ffffff',5);if(s.hp<=0){pop();say('Der Delegator ist geplatzt!');return}}}},
    draw(c,s,col,now){if(!s.sid)return;const img=monSprite(s.sid,24),W=img.width,H=img.height,sc=24/Math.max(W,H)*1.0;const bob=Math.round(Math.sin(now/200)*1);
      c.save();c.globalAlpha=0.55+0.2*Math.sin(now/150);c.drawImage(img,Math.round(s.x-W*sc),Math.round(s.y-H*sc*2+bob),Math.round(W*sc*2),Math.round(H*sc*2));c.restore();
      const w=20;c.fillStyle='#14141f';c.fillRect(Math.round(s.x-w/2)-1,Math.round(s.y+3),w+2,4);c.fillStyle='#c0c4d6';c.fillRect(Math.round(s.x-w/2),Math.round(s.y+4),Math.round(w*clamp(s.hp/s.max,0,1)),2)}}};
// hooks into the engine
{const _ss=specialShot;specialShot=function(s,dt){const h=NK[s.k];if(h){s.age+=dt;const T=s.side===B.me.side?B.foe:B.me,alive=!!(T&&!T.out&&T.faint<=0);h.tick(s,dt,T,alive);return}return _ss(s,dt)}}
{const _ds=drawSpecial;drawSpecial=function(c,s,col,now){const h=NK[s.k];if(h){h.draw(c,s,col,now);return}return _ds(c,s,col,now)}}
// persistent things: caltrops, fire rings, seeds on fighters, the push of the whirlwind
function nkTick(dt){if(!B||B.tb||!B.me)return;const N=nkState(),now=performance.now();if(B.state!=='fight'){return}
  N.traps=N.traps.filter(t=>{if(now>t.until)return false;for(const F of[B.me,B.foe]){if(!F||F.side===t.side||F.out||F.faint>0||F.ctrl==='remote'||airBusy(F)||F.inv>0)continue;
      if(Math.hypot(F.x-t.x,(F.y-t.y)*1.3)<9){shotHit(Object.assign({},t.s,{x:F.x,y:F.y-6,vx:0,vy:0.01,kb:0}),F);F.st.slow=Math.max(F.st.slow,2.2);burst(t.x,t.y,'#b8bcc8',8);return false}}return true});
  N.rings=N.rings.filter(r=>{const k=(now-r.t0)/r.dur;if(k>=1)return false;const R=r.r0-(r.r0-14)*k;
    for(const F of[B.me,B.foe]){if(!F||F.side===r.side||F.out||F.faint>0||F.ctrl==='remote'||airBusy(F))continue;const dx=F.x-r.x,dy=(F.y-r.y)*1.4,d=Math.hypot(dx,dy)||0.01,ux=dx/d,uy=dy/d;
      const inside=r.inside[F.side];let touch=false;if(inside&&d>R-5){F.x=r.x+ux*(R-5);F.y=r.y+uy*(R-5)/1.4;touch=true}else if(!inside&&d<R+7){F.x=r.x+ux*(R+7);F.y=r.y+uy*(R+7)/1.4;arenaClamp(F);touch=true}
      if(touch&&(!F.ringT||now-F.ringT>500)){F.ringT=now;shotHit(Object.assign({},r.s,{x:F.x,y:F.y-10,vx:-ux,vy:-uy,kb:2}),F)}}return true});
  for(const F of[B.me,B.foe]){if(!F)continue;
    if(F.seed){const sd=F.seed;if(F.out||F.faint>0||act(F).hp<=0){F.seed=null}else if(F.dashT>0){F.seed=null;burst(F.x,F.y-28,'#3ddc6b',8);say('Egelsamen abgeschüttelt!')}
      else{sd.t-=dt;sd.tick+=dt;if(sd.tick>=1){sd.tick=0;const m=act(F),d=Math.max(1,Math.round(m.mhp*0.04));if(F.ctrl!=='remote')dealDamage(F,d,'#3ddc6b');
          const A=sideF(sd.side);if(A&&A.ctrl!=='remote'&&!A.out){const am=act(A);if(am.hp>0){am.hp=Math.min(am.mhp,am.hp+d);B.nums.push({x:A.x,y:A.y-34,t:'+'+d,c:'#3ddc6b',at:now})}}
          for(let i=0;i<5;i++)B.parts.push({x:F.x,y:F.y-24,vx:(A?A.x-F.x:0)*0.9+(Math.random()-.5)*20,vy:(A?A.y-F.y:0)*0.9-10,life:0.9,age:0,c:'#3ddc6b'})}
        if(sd.t<=0)F.seed=null}}
    if(F.kv&&F.ctrl!=='remote'){const v=F.kv;v.t-=dt;F.x+=v.vx*dt;F.y+=v.vy*dt*0.8;v.vx*=0.9;v.vy*=0.9;const e=Math.hypot((F.x-ACX)/ARX,(F.y-ACY)/ARY);
      if(e>=0.99&&act(F).hp>0){arenaClamp(F);F.kv=null;const d=Math.max(1,Math.round(act(F).mhp*0.07));dealDamage(F,d,'#c8d4ff');F.st.stun=Math.max(F.st.stun,0.7);B.shakeUntil=now+200;burst(F.x,F.y-8,'#ffffff',14);say(`${SPECIES[act(F).s].n} knallt gegen die Bande!`)}
      else{obsPush(F);if(v.t<=0)F.kv=null}}}}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);try{nkTick(dt)}catch(e){console.error(e)}}}
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){_de(c,now,top);if(!B||!B.nk&&!B.me)return;const N=B.nk;const P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};
  if(!top&&N){for(const t of N.traps){const bl=t.until-now<2000&&Math.floor(now/150)%2;if(bl)continue;P(t.x-3,t.y-1,7,3,'#14141f');P(t.x-1,t.y-3,3,7,'#14141f');P(t.x-2,t.y,5,1,'#b8bcc8');P(t.x,t.y-2,1,5,'#b8bcc8');P(t.x,t.y-3,1,1,'#ffffff')}
    for(const r of N.rings){const k=(now-r.t0)/r.dur,R=r.r0-(r.r0-14)*k,n=Math.round(10+R*0.6);for(let i=0;i<n;i++){const a=i/n*6.283+now/500,x=r.x+Math.cos(a)*R,y=r.y+Math.sin(a)*R/1.4,f=(i+Math.floor(now/80))%3;
        P(x-2,y-4-f,4,5+f,'#14141f');P(x-1,y-3-f,2,4+f,f===0?'#ffcb3d':'#f0642a')}}}
  if(top)for(const F of[B.me,B.foe]){if(!F||!F.seed||F.out)continue;const x=F.x,y=F.y-40+Math.round(Math.sin(now/180)*1);P(x-3,y-1,6,5,'#14141f');P(x-2,y,4,3,'#8a5a2a');P(x-3,y-4,3,3,'#3ddc6b');P(x,y-5,3,3,'#2fb556');
      if(Math.floor(now/250)%2){P(x-6,y+4,2,1,'#3ddc6b');P(x+5,y+5,2,1,'#3ddc6b')}}}}
// the opponent's AI aims at (and walks towards) the decoy while it stands
function nkWithDecoy(fn){return function(){const D=B&&B.nk&&B.me&&B.nk.decoy[B.me.side];if(!D||D.dead)return fn.apply(this,arguments);const M=B.me,x=M.x,y=M.y;M.x=D.x;M.y=D.y;try{return fn.apply(this,arguments)}finally{M.x=x;M.y=y}}}
aiAimTick=nkWithDecoy(aiAimTick);aiUpdate=nkWithDecoy(aiUpdate);
// a new fight starts clean
{const _cb=closeBattle;closeBattle=function(){for(const F of[B&&B.me,B&&B.foe])if(F){F.seed=null;F.kv=null}return _cb.apply(this,arguments)}}
