/* ===================== DARK + BRAWL MOVES (v0.97) =====================
   Finte         blinks behind the target and strikes from behind
   Verfolgung    homing lunge – double damage if the target was running away
   Tiefschlag    only works while the target is attacking (then it also interrupts it); otherwise you stumble
   Abschlag      close hit that steals the target's buffs (shield, haste) and 15 AP
   Finsteraura   dark orb – the hit one is blinded for 4 s (you: the arena goes dark around you; AI: its aim shakes)
   Verhöhner     taunt shout in a cone – for 6 s the target can't use non-damaging moves
   Fokusstoß     1 s wind-up, then a 150-power punch – being hit while winding up ruins it
   Gegenschlag   1 s stance – melee hits taken are returned twice as hard
   Zahlungsaufforderung  three payment notices in a fan; the third one on the same target = garnishment (stunned 1 s)
   Vierfaustschlag       four punches in four directions around yourself, each also smashes projectiles */
const DK_LABEL={blink:'Teleport-Hieb',chase:'Verfolgung',sucker:'Konter-Hieb',steal:'Klau-Hieb',gloom:'Blendung',taunt:'Provokation',focus:'Aufladen',counter:'Konterhaltung',dun:'Mahnfächer',quad:'Rundumschlag'};
{const _md=moveDesc;moveDesc=function(mid){const r=_md(mid),mv=MOVES[mid];return mv&&DK_LABEL[mv.k]?r.replace('Fernkampf',DK_LABEL[mv.k]):r}}
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;
  const P={blink:{life:0.05},chase:{life:0.8,r:12},sucker:{life:0.05},steal:{life:0.22},gloom:{sp:120,life:1.8,r:7},taunt:{life:0.5},focus:{life:1.6,r:12},counter:{life:1.1,r:16},dun:{life:0.05},dunp:{sp:175,life:1.4,r:5},quad:{life:0.45}}[mv.k];
  if(P)return Object.assign({k:mv.k,nm:1,sp:1,r:6,p:mv.p,n:1},P);return _sp0(mid)}}
function dkFace(A,T){if(A&&T)A.face=T.x<A.x?-1:1}
function dkLock(A,ms){if(A&&A.ctrl!=='remote')A.landT=performance.now()+ms}
const DK={
  blink:{tick(s,dt,T,alive){const A=sideF(s.side);s.dead=1;if(!A||A.ctrl==='remote')return;burst(A.x,A.y-12,'#6a4a8c',12);
      for(let i=0;i<6;i++)B.parts.push({x:A.x+(Math.random()-.5)*14,y:A.y-6-Math.random()*20,vx:0,vy:-10,life:0.5,age:0,c:'#2a1838'});
      if(alive&&!airBusy(T)&&Math.hypot(T.x-A.x,T.y-A.y)<160){const sd=T.x>=A.x?1:-1;A.x=T.x+sd*22;A.y=T.y;arenaClamp(A);obsPush(A);dkFace(A,T);A.inv=Math.max(A.inv||0,0.15);
        nkHit(s,T,T.x,T.y-12,{vx:-sd,vy:0,kb:7});burst(T.x,T.y-14,'#b07aff',10);if(A===B.me||T===B.me)say('Finte – von hinten!')}
      else{const[ux,uy]=nkDir(s);A.x+=ux*60;A.y+=uy*45;arenaClamp(A);obsPush(A)}
      burst(A.x,A.y-12,'#6a4a8c',10)},draw(){}},
  chase:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0){s.dead=1;return}s.x=A.x;s.y=A.y-10;
      if(T){if(s.tlx!=null&&dt>0){const vx=(T.x-s.tlx)/dt,vy=(T.y-s.tly)/dt;s.tvx=(s.tvx||0)*0.7+vx*0.3;s.tvy=(s.tvy||0)*0.7+vy*0.3}s.tlx=T.x;s.tly=T.y}
      if(A.ctrl==='remote'){if(s.age>s.life)s.dead=1;return}dkLock(A,120);
      if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.vx=ux*230;s.vy=uy*230}
      if(alive){const a=Math.atan2(s.vy,s.vx),b=Math.atan2(T.y-A.y,T.x-A.x),d=Math.atan2(Math.sin(b-a),Math.cos(b-a)),t=clamp(d,-5*dt,5*dt);s.vx=Math.cos(a+t)*230;s.vy=Math.sin(a+t)*230}
      A.x+=s.vx*dt;A.y+=s.vy*dt;arenaClamp(A);obsPush(A);A.face=s.vx<0?-1:1;
      if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(A.x-T.x,(A.y-T.y)*1.2)<20){const ux=(T.x-A.x),uy=(T.y-A.y),L=Math.hypot(ux,uy)||1,away=((s.tvx||0)*ux+(s.tvy||0)*uy)/L>18;
        nkHit(s,T,T.x,T.y-12,{p:s.p*(away?2:1),vx:ux/L,vy:uy/L,kb:9});s.dead=1;if(away){burst(T.x,T.y-12,'#b07aff',14);say('Verfolgung – wer wegläuft, kassiert doppelt!')}return}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){for(let i=1;i<5;i++){c.fillStyle=`rgba(106,74,140,${0.5-i*0.1})`;c.fillRect(Math.round(s.x-s.vx*0.012*i)-6,Math.round(s.y-s.vy*0.012*i)-6,12,12)}}},
  sucker:{tick(s,dt,T,alive){const A=sideF(s.side);s.dead=1;if(!A||A.ctrl==='remote')return;const now=performance.now();
      const att=alive&&((T.lastFire&&now-T.lastFire<650)||(B.shots||[]).some(b=>!b.dead&&b.side===T.side&&b.age<0.45));
      if(att&&!airBusy(T)&&Math.hypot(T.x-A.x,T.y-A.y)<180){const sd=A.x<=T.x?-1:1;A.x=T.x+sd*18;A.y=T.y;arenaClamp(A);obsPush(A);dkFace(A,T);
        nkHit(s,T,T.x,T.y-12,{vx:-sd,vy:0,kb:8});if(T.ctrl!=='remote'){T.cd=T.cd.map(x=>x+0.7);T.hitstun=Math.max(T.hitstun||0,0.25)}for(const b of B.shots)if(b.side===T.side&&b.mel)b.dead=1;
        burst(T.x,T.y-12,'#ffffff',12);say('Tiefschlag – mitten in den Angriff!')}
      else{A.st.stun=Math.max(A.st.stun,0.45);burst(A.x,A.y-10,'#8a8ea6',6);if(A===B.me)say('Tiefschlag geht ins Leere – der Gegner hat nicht angegriffen!')}},draw(){}},
  steal:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}s.x=A.x;s.y=A.y-12;if(s.age>s.life){s.dead=1;return}if(s.init)return;s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;
      if(!alive||airBusy(T)||Math.hypot(T.x-A.x,(T.y-A.y)*1.2)>40)return;nkHit(s,T,T.x,T.y-12,{vx:ux,vy:uy,kb:5});
      const got=[];for(const k of['shield','haste'])if(T.st[k]>0){if(A.ctrl!=='remote')A.st[k]=Math.max(A.st[k]||0,T.st[k]);if(T.ctrl!=='remote')T.st[k]=0;got.push(k==='shield'?'Schild':'Tempo')}
      const ap=Math.min(15,T.ap??0);if(T.ctrl!=='remote')T.ap-=ap;if(A.ctrl!=='remote')A.ap=Math.min(AP_MAX,(A.ap??AP_MAX)+ap);
      for(let i=0;i<8;i++)B.parts.push({x:T.x,y:T.y-16,vx:(A.x-T.x)*1.6+(Math.random()-.5)*30,vy:(A.y-T.y)*1.6-20,life:0.5,age:0,c:'#ffcb3d'});
      say(`Abschlag! ${ap} AP${got.length?' und '+got.join(' + '):''} geklaut.`)},
    draw(c,s,col,now){if(s.ux==null)return;const k=s.age/s.life,a0=Math.atan2(s.uy,s.ux)-1+k*2;for(let i=0;i<3;i++){const a=a0+i*0.12,x=s.x+Math.cos(a)*22,y=s.y+Math.sin(a)*16;c.fillStyle=i?'#b07aff':'#ffffff';c.fillRect(Math.round(x)-2,Math.round(y)-1,4,2)}}},
  gloom:{tick(s,dt,T,alive){s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;burst(s.x,s.y,'#2a1838',8);return}if(shotVsObs(s))return;
      if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){s.dead=1;nkHit(s,T,s.x,s.y);if(T.ctrl!=='remote'||T===B.me)T.st.blind=Math.max(T.st.blind||0,4);burst(T.x,T.y-14,'#2a1838',16);say(`${SPECIES[act(T).s].n} ist geblendet!`)}},
    draw(c,s,col,now){const P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};P(s.x-6,s.y-6,12,12,'#14141f');P(s.x-5,s.y-5,10,10,'#2a1838');const a=now/90;
      for(let i=0;i<3;i++)P(s.x+Math.cos(a+i*2.1)*5-1,s.y+Math.sin(a+i*2.1)*5-1,2,2,'#b07aff')}},
  taunt:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}s.x=A.x;s.y=A.y-16;if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;
        if(alive&&!airBusy(T)){const dx=T.x-A.x,dy=(T.y-12)-(A.y-14),d=Math.hypot(dx,dy);if(d<150&&(d<20||Math.acos(clamp((dx*ux+dy*uy)/d,-1,1))<0.8)){T.st.taunt=6;say(`${SPECIES[act(T).s].n} ist verhöhnt – 6 s nur Angriffe!`)}}}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){if(s.ux==null)return;const k=s.age/s.life,a=Math.atan2(s.uy,s.ux);c.strokeStyle=`rgba(255,203,61,${1-k})`;c.lineWidth=2;for(let i=0;i<3;i++){const r=14+k*90+i*12;c.beginPath();c.arc(Math.round(s.x),Math.round(s.y),r,a-0.7,a+0.7);c.stroke()}
      c.fillStyle='#d23b3b';c.font='bold 12px VT323,monospace';c.fillText('!!',Math.round(s.x)-4,Math.round(s.y)-14-k*6)}},
  focus:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0){s.dead=1;return}s.x=A.x;s.y=A.y-12;const m=act(A);if(s.hp0==null)s.hp0=m.hp;
      if(s.age<1.0){dkLock(A,140);if(m.hp<s.hp0){s.dead=1;burst(A.x,A.y-14,'#8a8ea6',10);say('Fokusstoß verpatzt – beim Aufladen getroffen!');return}
        if(Math.random()<0.7)B.parts.push({x:A.x+(Math.random()-.5)*50,y:A.y-12+(Math.random()-.5)*40,vx:0,vy:0,life:0.3,age:0,c:'#ffcb3d'});return}
      if(s.done)return;s.done=1;s.dead=1;dkFace(A,T);
      if(alive&&!airBusy(T)&&Math.hypot(T.x-A.x,(T.y-A.y)*1.2)<52){if(A.ctrl!=='remote'){const sd=T.x>=A.x?1:-1;A.x=T.x-sd*16;arenaClamp(A)}nkHit(s,T,T.x,T.y-12,{vx:Math.sign(T.x-A.x)||1,vy:0,kb:16});
        B.shakeUntil=performance.now()+220;burst(T.x,T.y-12,'#ffcb3d',20);burst(T.x,T.y-12,'#ffffff',10);say('FOKUSSTOSS!')}
      else{burst(A.x+(A.face||1)*20,A.y-12,'#ffcb3d',8);if(A===B.me)say('Fokusstoß ins Leere – geh näher ran!')}},
    draw(c,s,col,now){const k=Math.min(1,s.age/1.0),fl=Math.floor(now/60)%2;c.strokeStyle=fl?'#ffcb3d':'#ffffff';c.lineWidth=1;pxEl(c,Math.round(s.x),Math.round(s.y),Math.round(26-16*k),Math.round(22-14*k),0)}},
  counter:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0){s.dead=1;return}s.x=A.x;s.y=A.y-12;const m=act(A);if(s.hp0==null){s.hp0=m.hp;s.sum=0}
      // melee hits taken in the stance are collected (combos count in full) and returned twice as hard shortly after the first one
      if(m.hp<s.hp0){const lost=s.hp0-m.hp;s.hp0=m.hp;if(alive&&Math.hypot(T.x-A.x,(T.y-A.y)*1.2)<52){s.sum+=lost;if(s.trig==null)s.trig=s.age}}
      if(s.trig!=null&&(s.age-s.trig>0.3||s.age>s.life)){s.dead=1;if(alive){const d=Math.max(1,s.sum*2);if(T.ctrl!=='remote'){dealDamage(T,d,'#ff8a3d');const sd=Math.sign(T.x-A.x)||1;T.x+=sd*14;arenaClamp(T)}
          burst(T.x,T.y-12,'#ff8a3d',16);B.shakeUntil=performance.now()+180;say(`Gegenschlag! ${d} Schaden zurück.`)}return}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){const fl=Math.floor(now/80)%2;c.strokeStyle=fl?'#ff8a3d':'#ffcb3d';c.lineWidth=1;pxEl(c,Math.round(s.x),Math.round(s.y),15,19,0);if(fl){c.fillStyle='#ff8a3d';c.fillRect(Math.round(s.x)-1,Math.round(s.y)-24,3,5)}}},
  dun:{tick(s,dt,T,alive){s.dead=1;const[ux,uy]=nkDir(s),a=Math.atan2(uy,ux);for(const o of[-0.28,0,0.28]){const b=Object.assign({},s,{k:'dunp',dead:false,age:0,life:1.4,r:5,vx:Math.cos(a+o)*175,vy:Math.sin(a+o)*175,spin:Math.random()*6});B.shots.push(b)}},draw(){}},
  dunp:{tick(s,dt,T,alive){s.x+=s.vx*dt;s.y+=s.vy*dt;s.spin+=dt*9;if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;return}if(shotVsObs(s))return;
      if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){s.dead=1;nkHit(s,T,s.x,s.y,{kb:2});const now=performance.now();if(!T.mahnT||now>T.mahnT)T.mahn=0;T.mahn=(T.mahn||0)+1;T.mahnT=now+6000;
        if(T.mahn>=3){T.mahn=0;if(T.ctrl!=='remote')T.st.stun=Math.max(T.st.stun,1);burst(T.x,T.y-16,'#d23b3b',14);say('PFÄNDUNG! Drei Zahlungsaufforderungen – 1 s gelähmt.')}else say(`Zahlungsaufforderung ${T.mahn}/3`)}},
    draw(c,s,col,now){const w=Math.round(4+3*Math.abs(Math.cos(s.spin)));const P=(x,y,ww,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),ww,h)};P(s.x-w-1,s.y-5,w*2+2,10,'#14141f');P(s.x-w,s.y-4,w*2,8,'#f6f1e1');P(s.x-w+1,s.y-2,w*2-2,1,'#d23b3b');P(s.x-w+1,s.y+1,w*2-3,1,'#d23b3b')}},
  quad:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}s.x=A.x;s.y=A.y-12;dkLock(A,120);if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.a0=Math.atan2(uy,ux);s.n=0}
      while(s.n<4&&s.age>=s.n*0.1){const a=s.a0+s.n*Math.PI/2,px=A.x+Math.cos(a)*24,py=A.y-12+Math.sin(a)*18;s.n++;burst(px,py,'#c8b0a8',5);
        for(const b of nkFoeShots(s.side)){if(b.nm)continue;if(Math.hypot(b.x-px,b.y-py)<18){b.dead=1;burst(b.x,b.y,'#ffffff',4)}}
        if(alive&&!airBusy(T)&&!(T.inv>0)&&!(s.hitT&&s.hitT[s.n])){const dx=T.x-A.x,dy=(T.y-12)-(A.y-12),d=Math.hypot(dx,dy);if(d<46){const da=Math.atan2(Math.sin(Math.atan2(dy,dx)-a),Math.cos(Math.atan2(dy,dx)-a));
          if(Math.abs(da)<1.0){nkHit(s,T,T.x,T.y-12,{vx:Math.cos(a),vy:Math.sin(a),kb:6});B.shakeUntil=performance.now()+80}}}}
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){if(s.a0==null)return;for(let i=0;i<s.n;i++){const a=s.a0+i*Math.PI/2,k=clamp((s.age-i*0.1)/0.15,0,1),r=10+14*k,x=s.x+Math.cos(a)*r,y=s.y+Math.sin(a)*r*0.75;
      c.fillStyle='#14141f';c.fillRect(Math.round(x)-4,Math.round(y)-4,8,8);c.fillStyle='#c8b0a8';c.fillRect(Math.round(x)-3,Math.round(y)-3,6,6);c.fillStyle='#5a5658';c.fillRect(Math.round(x)-3,Math.round(y)+1,6,2)}}}};
Object.assign(NK,DK);
// taunt blocks status moves; remember when someone attacked (for Tiefschlag)
{const _f=fire;fire=function(F,i,remote){if(F&&F.st&&F.st.taunt>0){const mid=act(F).m[i],mv=MOVES[mid];if(mv&&!mv.p){if(F===B.me){const n=performance.now();if(!B.tauntMsg||n-B.tauntMsg>1000){B.tauntMsg=n;say('Verhöhnt – gerade gehen nur Angriffe!')}}return}}
  const cd=F&&F.cd?F.cd.slice():null;const r=_f.apply(this,arguments);if(F&&cd&&F.cd.some((v,k)=>v>cd[k]))F.lastFire=performance.now();return r}}
// blind and taunt wear off; the blinded AI's aim shakes
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);if(!B||B.tb)return;for(const F of[B.me,B.foe]){if(!F||!F.st)continue;if(F.st.blind>0)F.st.blind=Math.max(0,F.st.blind-dt);if(F.st.taunt>0)F.st.taunt=Math.max(0,F.st.taunt-dt);
  if(F.st.blind>0&&F.ctrl==='ai'&&F.aimAng!=null)F.aimAng+=(Math.random()-.5)*6*dt}}}
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){_de(c,now,top);if(!top||!B||!B.me)return;
  for(const F of[B.me,B.foe]){if(!F||F.out)continue;if(F.mahn>0&&F.mahnT>now)for(let i=0;i<F.mahn;i++){const x=F.x-8+i*7,y=F.y-46;c.fillStyle='#14141f';c.fillRect(x-1,y-1,7,8);c.fillStyle='#f6f1e1';c.fillRect(x,y,5,6);c.fillStyle='#d23b3b';c.fillRect(x+1,y+2,3,1)}
    if(F.st&&F.st.taunt>0&&Math.floor(now/250)%2){c.fillStyle='#d23b3b';c.font='bold 13px VT323,monospace';c.fillText('💢',F.x+8,F.y-38)}}
  const me=B.me;if(me.st&&me.st.blind>0&&!me.out){const k=Math.min(1,me.st.blind/0.6),cv=c.canvas;c.save();c.setTransform(1,0,0,1,0,0);const W=cv.width,H=cv.height;
    // dark everywhere except a small light around your monster (screen space via the current camera)
    const g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.6);c.restore();c.save();const r=58;const gr=c.createRadialGradient(me.x,me.y-12,r*0.5,me.x,me.y-12,r*1.6);
    gr.addColorStop(0,'rgba(8,4,16,0)');gr.addColorStop(1,`rgba(8,4,16,${0.92*k})`);c.fillStyle=gr;c.fillRect(-2000,-2000,5000,5000);c.restore()}}}
// a new fight starts clean
{const _cb=closeBattle;closeBattle=function(){for(const F of[B&&B.me,B&&B.foe])if(F){F.mahn=0;F.st&&(F.st.blind=0,F.st.taunt=0)}return _cb.apply(this,arguments)}}
