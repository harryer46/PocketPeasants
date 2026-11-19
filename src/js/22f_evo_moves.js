/* ===================== SIGNATURE MOVES OF THE FINAL EVOLUTIONS (v0.98) =====================
   one per type, each with its own mechanic:
   Strafschärfung   (Normal)  close hit; every further hit within 5 s is 50 % stronger (up to three steps)
   Glutkern         (Feuer)   slow ember that grows while flying – the later it bursts, the bigger and stronger, sets on fire
   Sturzflut        (Wasser)  a wall of water rolls across the arena and washes the target along
   Überspannung     (Elektro) three charged orbs circle you for 4 s; each one zaps the target once on contact
   Rankennetz       (Pflanze) a vine shot ties you to the target for 3 s: it can't get away and you drain HP every 0.5 s
   Felswand         (Gestein) three rocks burst out of the ground in front of you – cover for 6 s, a hit for anyone standing there
   Luftsog          (Flug)    suction cone: pulls the target to you and strikes when it arrives
   Schattenschleier (Unlicht) you fade into shadow for 2.5 s: the AI loses you, your next hit deals 50 % more */
const EV_LABEL={stack:'Steigerungs-Hieb',grow:'Wachsender Kern',wave:'Flutwelle',orbit:'Kreisende Ladungen',tether:'Fessel-Ranke',wall:'Deckung',pull:'Sog',veil:'Tarnung'};
{const _md=moveDesc;moveDesc=function(mid){const r=_md(mid),mv=MOVES[mid];return mv&&EV_LABEL[mv.k]?r.replace('Fernkampf',EV_LABEL[mv.k]):r}}
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;
  const P={stack:{life:0.22},grow:{sp:105,life:1.6,r:5},wave:{life:1.8,r:8},orbit:{life:4,r:6},tether:{sp:220,life:0.75,r:6},wall:{life:0.05},pull:{life:0.9},veil:{life:0.05}}[mv.k];
  if(P)return Object.assign({k:mv.k,nm:1,sp:1,r:6,p:mv.p,n:1},P);return _sp0(mid)}}
const EV={
  stack:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}s.x=A.x;s.y=A.y-12;if(s.age>s.life){s.dead=1;return}if(s.init)return;s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;dkLock(A,150);
      const now=performance.now();if(!(A.ssUntil>now))A.ss=0;
      if(!alive||airBusy(T)||T.inv>0||Math.hypot(T.x-A.x,(T.y-A.y)*1.2)>44){A.ss=0;A.ssUntil=0;return}
      const lv=A.ss||0;nkHit(s,T,T.x,T.y-12,{p:s.p*(1+0.5*lv),vx:ux,vy:uy,kb:5+lv*3});A.ss=Math.min(3,lv+1);A.ssUntil=now+5000;
      burst(T.x,T.y-12,lv>=2?'#ff5a3d':'#ffcb3d',8+lv*4);if(lv)say(`Strafschärfung ×${(1+0.5*lv).toFixed(1).replace('.',',')}!`)},
    draw(c,s,col,now){if(s.ux==null)return;const k=s.age/s.life,a=Math.atan2(s.uy,s.ux);c.strokeStyle=k<0.5?'#ffffff':'#ffcb3d';c.lineWidth=2;c.beginPath();c.arc(Math.round(s.x),Math.round(s.y),20,a-1+k*1.6,a-0.4+k*1.6);c.stroke()}},
  grow:{tick(s,dt,T,alive){if(!s.init){s.init=1;s.vx0=s.vx;s.vy0=s.vy}const L=Math.hypot(s.vx0,s.vy0)||1;s.vx=s.vx0/L*105;s.vy=s.vy0/L*105;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r=5+s.age*9;
      const boom=()=>{s.dead=1;const R=s.r+14;burst(s.x,s.y,'#ff8a3d',10+Math.round(s.age*10));burst(s.x,s.y,'#ffe27a',8);
        if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<R+10){nkHit(s,T,T.x,T.y-12,{p:s.p*(1+s.age*0.5),kb:4+s.age*4});if(T.ctrl!=='remote')T.st.burn=Math.max(T.st.burn||0,3)}};
      if(s.age>s.life||outArena(s.x,s.y+10)){boom();return}if(shotVsObs(s)){boom();return}
      if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+10)boom()},
    draw(c,s,col,now){const r=Math.round(s.r),fl=Math.floor(now/70)%2;c.fillStyle='#14141f';pxEl(c,Math.round(s.x),Math.round(s.y),r+1,r+1,1);c.fillStyle='#d8341f';pxEl(c,Math.round(s.x),Math.round(s.y),r,r,1);
      c.fillStyle=fl?'#ff8a3d':'#ffb03d';pxEl(c,Math.round(s.x)-1,Math.round(s.y)-1,Math.max(1,r-2),Math.max(1,r-2),1);c.fillStyle='#ffe27a';c.fillRect(Math.round(s.x)-2,Math.round(s.y)-2,3,3)}},
  wave:{tick(s,dt,T,alive){const A=sideF(s.side);if(!s.init){s.init=1;const[ux]=nkDir(s);s.dir=ux<0?-1:1;s.y0=A?A.y:s.y;s.x=(A?A.x:s.x)+s.dir*16}
      s.x+=s.dir*175*dt;if(s.age>s.life||s.x<ACX-ARX-30||s.x>ACX+ARX+30){s.dead=1;return}
      if(Math.random()<0.6)B.parts.push({x:s.x+(Math.random()-.5)*6,y:s.y0-60+Math.random()*100,vx:s.dir*60,vy:-30,life:0.4,age:0,c:'#bfe2ff'});
      if(!s.hit&&alive&&!(T.inv>0)&&!airBusy(T)&&Math.abs(T.x-s.x)<14&&Math.abs(T.y-s.y0)<58){s.hit=1;nkHit(s,T,T.x,T.y-12,{vx:s.dir,vy:0,kb:4});if(T.ctrl!=='remote')T.kv={vx:s.dir*260,vy:0,t:0.55,mid:s.mid};say('Sturzflut!')}},
    draw(c,s,col,now){if(s.y0==null)return;const x=Math.round(s.x),k=Math.min(1,s.age/0.25);for(let i=0;i<10;i++){const y=Math.round(s.y0-56+i*11),w=Math.round((6+3*Math.sin(now/90+i))*k);
      c.fillStyle='#14141f';c.fillRect(x-w-1,y,w*2+2,12);c.fillStyle=i%2?'#3d8bf2':'#5aa8ff';c.fillRect(x-w,y,w*2,11);c.fillStyle='#e6f4ff';c.fillRect(x+s.dir*(w-2)-1,y+1,2,9)}}},
  orbit:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0){s.dead=1;return}s.x=A.x;s.y=A.y-12;if(!s.init){s.init=1;s.on=[1,1,1]}
      if(s.age>s.life||!s.on.some(Boolean)){s.dead=1;return}
      for(let i=0;i<3;i++){if(!s.on[i])continue;const a=s.age*4+i*2.094,ox=s.x+Math.cos(a)*28,oy=s.y+Math.sin(a)*20;
        if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(ox-T.x,oy-(T.y-12))<15){s.on[i]=0;nkHit(s,T,ox,oy,{kb:3});if(T.ctrl!=='remote')T.st.stun=Math.max(T.st.stun,0.25);burst(ox,oy,'#ffe27a',10)}}},
    draw(c,s,col,now){if(!s.on)return;for(let i=0;i<3;i++){if(!s.on[i])continue;const a=s.age*4+i*2.094,x=Math.round(s.x+Math.cos(a)*28),y=Math.round(s.y+Math.sin(a)*20),fl=Math.floor(now/60+i)%2;
      c.fillStyle='#14141f';c.fillRect(x-4,y-4,8,8);c.fillStyle=fl?'#ffe27a':'#ffcb3d';c.fillRect(x-3,y-3,6,6);c.fillStyle='#ffffff';c.fillRect(x-1,y-1,2,2);
      if(fl){c.fillStyle='#ffe27a';c.fillRect(x+4,y-2,2,1);c.fillRect(x-6,y+1,2,1)}}}},
  tether:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0||!alive){s.dead=1;return}
      if(!s.tied){s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;return}if(shotVsObs(s))return;
        if(!(T.inv>0)&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){s.tied=1;s.t0=s.age;s.life=s.age+3;s.nt=s.age;burst(T.x,T.y-12,'#4f9a35',10);say(`${SPECIES[act(T).s].n} hängt im Rankennetz!`)}return}
      s.x=T.x;s.y=T.y-12;if(s.age>s.life||airBusy(T)){s.dead=1;return}
      if(T.ctrl!=='remote'){const dx=T.x-A.x,dy=T.y-A.y,d=Math.hypot(dx,dy);if(d>95){T.x=A.x+dx/d*95;T.y=A.y+dy/d*95;arenaClamp(T)}}
      if(s.age>=s.nt){s.nt+=0.5;nkHit(s,T,T.x,T.y-12,{kb:0});if(A.ctrl!=='remote'){const m=act(A);m.hp=Math.min(m.mhp,m.hp+Math.max(1,Math.round(m.mhp*0.025)))}
        B.parts.push({x:T.x,y:T.y-14,vx:(A.x-T.x)*2,vy:(A.y-T.y)*2,life:0.45,age:0,c:'#8fd16a'})}},
    draw(c,s,col,now){const A=sideF(s.side);if(!s.tied){c.fillStyle='#14141f';c.fillRect(Math.round(s.x)-4,Math.round(s.y)-4,8,8);c.fillStyle='#4f9a35';c.fillRect(Math.round(s.x)-3,Math.round(s.y)-3,6,6);return}
      if(!A)return;const n=12;for(let i=0;i<=n;i++){const k=i/n,x=A.x+(s.x-A.x)*k,y=(A.y-12)+(s.y-(A.y-12))*k+Math.sin(k*Math.PI*3+now/120)*3;c.fillStyle=i%3?'#4f9a35':'#2a6a1f';c.fillRect(Math.round(x)-1,Math.round(y)-1,3,3)}}},
  wall:{tick(s,dt,T,alive){s.dead=1;const A=sideF(s.side);if(!A)return;const[ux,uy]=nkDir(s),px=-uy,py=ux,now=performance.now();B.obs=B.obs||[];
      for(let i=-1;i<=1;i++){const x=clamp(A.x+ux*42+px*20*i,24,AW-24),y=clamp(A.y+uy*30+py*16*i,24,AH-16);
        B.obs.push({id:'w'+now+'_'+i,kind:'rock',mat:'rock',ind:0,x:Math.round(x),y:Math.round(y),r:9,hp:30,max:30,v:(i+1)%3,tmp:now+6000});burst(x,y-6,'#a07848',8);
        if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(T.x-x,(T.y-y)*1.3)<20&&!s.hit){s.hit=1;nkHit(s,T,T.x,T.y-12,{vx:ux,vy:uy,kb:12})}}
      for(const F of[B.me,B.foe])if(F&&F.ctrl!=='remote')obsPush(F);B.shakeUntil=now+150;say('Felswand!')},draw(){}},
  pull:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0){s.dead=1;return}s.x=A.x;s.y=A.y-12;dkLock(A,120);
      if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;const dx=T.x-A.x,dy=(T.y-A.y),d=Math.hypot(dx,dy);
        s.got=alive&&!airBusy(T)&&!(T.inv>0)&&d<180&&(d<24||Math.acos(clamp((dx*ux+dy*uy)/d,-1,1))<0.6);if(s.got)say(`${SPECIES[act(T).s].n} wird angesogen!`)}
      if(s.got&&alive){const dx=A.x-T.x,dy=A.y-T.y,d=Math.hypot(dx,dy)||1;if(d<26){s.dead=1;nkHit(s,T,T.x,T.y-12,{vx:-dx/d,vy:-dy/d,kb:10});burst(T.x,T.y-12,'#e6f0ff',12);return}
        if(T.ctrl!=='remote'){T.x+=dx/d*230*dt;T.y+=dy/d*230*dt;arenaClamp(T)}}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){if(s.ux==null)return;const a=Math.atan2(s.uy,s.ux);for(let i=0;i<5;i++){const k=((now/400+i/5)%1),r=170*(1-k),aa=a+Math.sin(i*1.7)*0.45,x=s.x+Math.cos(aa)*r,y=s.y+Math.sin(aa)*r*0.75;
      c.fillStyle=`rgba(230,240,255,${0.3+0.6*k})`;c.fillRect(Math.round(x)-3,Math.round(y),6,1);c.fillRect(Math.round(x),Math.round(y)-1,1,3)}}},
  veil:{tick(s,dt,T,alive){s.dead=1;const A=sideF(s.side);if(!A)return;A.veilUntil=performance.now()+2500;A.veilBoost=1;burst(A.x,A.y-12,'#2a1838',16);say(`${SPECIES[act(A).s].n} verschwindet im Schatten!`)},draw(){}}};
Object.assign(NK,EV);
// the hit out of the shadow is 50 % stronger and ends the veil
{const _sh=shotHit;shotHit=function(s,T){const A=s&&sideF(s.side);if(A&&A.veilBoost&&(s.p||0)>0&&A.veilUntil>performance.now()){A.veilBoost=0;A.veilUntil=0;s=Object.assign({},s,{p:s.p*1.5});burst(T.x,T.y-12,'#b07aff',12)}return _sh.call(this,s,T)}}
// the AI loses a veiled target: its aim drifts; the veiled monster is covered in shadow
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);if(!B||B.tb)return;const now=performance.now();for(const[F,O]of[[B.me,B.foe],[B.foe,B.me]]){if(!F||!O)continue;
  if(F.veilUntil>now&&O.ctrl==='ai'&&O.aimAng!=null)O.aimAng+=(Math.random()-.5)*9*dt;if(F.ssUntil&&F.ssUntil<now)F.ss=0}}}
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){_de(c,now,top);if(!top||!B)return;for(const F of[B.me,B.foe]){if(!F||F.out)continue;
  if(F.veilUntil>now){const k=Math.min(1,(F.veilUntil-now)/400);for(let i=0;i<14;i++){const a=i*0.45+now/300,r=6+(i%4)*4;c.fillStyle=`rgba(20,10,32,${0.55*k})`;c.fillRect(Math.round(F.x+Math.cos(a)*r)-5,Math.round(F.y-14+Math.sin(a)*r*1.3)-5,10,10)}}
  if(F.ss>0&&F.ssUntil>now)for(let i=0;i<F.ss;i++){c.fillStyle='#14141f';c.fillRect(F.x-9+i*7,F.y-49,6,6);c.fillStyle=i>=2?'#ff5a3d':'#ffcb3d';c.fillRect(F.x-8+i*7,F.y-48,4,4)}}}}
{const _cb=closeBattle;closeBattle=function(){for(const F of[B&&B.me,B&&B.foe])if(F){F.ss=0;F.ssUntil=0;F.veilUntil=0;F.veilBoost=0}return _cb.apply(this,arguments)}}
