const SPIN_R=62; // Turbodreher reach
/* ===================== GEN-2-MECHANIKEN (v0.100) =====================
   motion kinds: dash (Tackle), jet (Wasserwerfer), nova (Sturmknall), jumpkick (Turmkick), spin (Turbodreher),
   weather (Sonnentag/Regentanz/Sandsturm), protect (Schutzschild), screen (Reflektor/Lichtschild), belly (Bauchtrommel)
   hit modifiers (decided by the target's own client, like every hit): crit, flinch, toxin, Horrorblick (no flight/
   switch), Zugabe (only the last move), root (Whirlpool), Geowurf (damage = level), Gegenschlag (stronger at low HP),
   weather, Schutzschild, Reflektor/Lichtschild; attacker side: recoil, own stat raise, Dieb (money) */
const G2_LABEL={dash:'Ansturm',jet:'Wasserstrahl',nova:'Schockring',jumpkick:'Sprungtritt',spin:'Rundumschlag',weather:'Wetter',protect:'Schutz',screen:'Schutzwand',belly:'selbst'};
const WEATHER={sun:{n:'Sonnentag',c:'#ffcb3d'},rain:{n:'Regen',c:'#5aa8ff'},sand:{n:'Sandsturm',c:'#c8a060'}};
function weatherOn(w){return!!(B&&B.weather&&B.weather.w===w&&B.weather.until>performance.now())}
{const _md=moveDesc;moveDesc=function(mid){let r=_md(mid);const mv=MOVES[mid];if(!mv)return r;if(G2_LABEL[mv.k])r=r.replace('Fernkampf',G2_LABEL[mv.k]);
  const h=[];if(mv.crit)h.push('oft Volltreffer');if(mv.recoil)h.push('Rückstoß');if(mv.flinch)h.push('kann zurückschrecken');if(mv.tox)h.push('schwere Vergiftung');if(mv.trap)h.push('keine Flucht/kein Wechsel');
  if(mv.encore)h.push('nur noch letzte Attacke');if(mv.fx==='root')h.push('hält fest');if(mv.seismic)h.push('Schaden = Level');if(mv.reversal)h.push('stärker bei wenig KP');if(mv.thief)h.push('klaut Geld');if(mv.selfbs)h.push('kann Vert. erhöhen');
  if(mv.k==='weather')h.push(mv.w==='sun'?'Feuer ↑ Wasser ↓':mv.w==='rain'?'Wasser ↑ Feuer ↓, alle nass':'Schaden für alle außer Gestein');if(mv.k==='protect')h.push('blockt alles kurz');if(mv.k==='screen')h.push(mv.scr==='mel'?'Nahkampf halbiert':'Fernkampf halbiert');
  if(mv.k==='belly')h.push('½ KP → Angriff max');if(mv.k==='spin')h.push('löst Fallen & Samen');
  return h.length?r.replace(/ · (\d+ AP)$/,` · ${h.join(', ')} · $1`):r}}
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;
  const P={dash:{life:0.32},jet:{life:1.2},nova:{life:0.7},jumpkick:{life:0.5},spin:{life:0.9},weather:{life:0.05},protect:{life:0.05},screen:{life:0.05},belly:{life:0.05}}[mv.k];
  if(P)return Object.assign({k:mv.k,nm:1,sp:1,r:8,p:mv.p,n:1},P);return _sp0(mid)}}
{const _cd=cdOf;cdOf=function(mid){const c=_cd(mid);return mid==='solarbeam'&&weatherOn('sun')?c*0.4:c}}
const G2={
  dash:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;dkLock(A,330)}
      if(A.ctrl!=='remote'){A.x+=s.ux*300*dt;A.y+=s.uy*300*dt;arenaClamp(A)}s.x=A.x;s.y=A.y-12;
      if(Math.random()<0.6)B.parts.push({x:A.x-s.ux*10,y:A.y,vx:-s.ux*40,vy:-10,life:0.3,age:0,c:'#c8b08a'});
      if(!s.hit&&alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(T.x-A.x,(T.y-A.y)*1.2)<24){s.hit=1;nkHit(s,T,T.x,T.y-12,{vx:s.ux,vy:s.uy,kb:12});s.dead=1;return}
      if(s.age>s.life)s.dead=1},draw(){}},
  jet:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A||A.out||A.faint>0){s.dead=1;return}if(!s.init){s.init=1;s.nt=0;dkLock(A,1100)}const[ux,uy]=nkDir(s);s.x=A.x+ux*12;s.y=A.y-12+uy*12;s.len=Math.min(170,s.age*600);
      if(s.age>s.life){s.dead=1;return}
      if(alive&&!(T.inv>0)&&!airBusy(T)){const px=T.x-s.x,py=(T.y-12)-s.y,t=px*ux+py*uy,d=Math.abs(px*uy-py*ux);
        if(t>0&&t<s.len&&d<14){if(s.age>=s.nt){s.nt=s.age+0.18;nkHit(s,T,T.x,T.y-12,{p:s.p*0.22,vx:ux,vy:uy,kb:3})}if(T.ctrl!=='remote'){T.x+=ux*90*dt;T.y+=uy*90*dt;arenaClamp(T)}}}},
    draw(c,s,col,now){if(!s.len)return;const[ux,uy]=nkDir(s),n=Math.ceil(s.len/4);for(let i=0;i<n;i++){const x=s.x+ux*i*4,y=s.y+uy*i*4+Math.sin(now/40+i)*1.2,w=3+(i%3===0?1:0);
      c.fillStyle='#14141f';c.fillRect(Math.round(x)-w-1,Math.round(y)-w-1,w*2+2,w*2+2);c.fillStyle=i%2?'#3d8bf2':'#5aa8ff';c.fillRect(Math.round(x)-w,Math.round(y)-w,w*2,w*2)}
      for(let i=0;i<n;i+=3){const x=s.x+ux*i*4,y=s.y+uy*i*4;c.fillStyle='#e6f4ff';c.fillRect(Math.round(x)-1,Math.round(y)-1,2,2)}}},
  nova:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}if(!s.init){s.init=1;s.cx=A.x;s.cy=A.y-10;shockwave(s.cx,s.cy+10,150,'#ffe27a',0.6)}s.R=s.age/s.life*150;s.x=s.cx;s.y=s.cy;
      if(s.age>s.life){s.dead=1;return}
      if(!s.hit&&alive&&!(T.inv>0)&&!airBusy(T)){const d=Math.hypot(T.x-s.cx,(T.y-12-s.cy)*1.3);if(Math.abs(d-s.R)<14){s.hit=1;const ux=(T.x-s.cx)/(d||1),uy=(T.y-12-s.cy)/(d||1);nkHit(s,T,T.x,T.y-12,{vx:ux,vy:uy,kb:14});if(T.ctrl!=='remote'&&T.st.stun<=0)T.st.stun=0.3}}},
    draw(c,s,col,now){if(s.R==null)return;const R=Math.round(s.R),k=s.age/s.life;c.save();c.globalAlpha=1-k*0.6;for(let a=0;a<64;a++){const t=a/64*Math.PI*2,j=(a%4===0?3:0)*Math.sin(now/30+a);const x=Math.round(s.cx+Math.cos(t)*(R+j)),y=Math.round(s.cy+Math.sin(t)*(R+j)*0.75);
      c.fillStyle=a%3?'#ffe27a':'#ffffff';c.fillRect(x-1,y-1,3,3)}c.restore()}},
  jumpkick:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}if(!s.init){s.init=1;const[ux,uy]=nkDir(s);s.ux=ux;s.uy=uy;s.x0=A.x;s.y0=A.y;dkLock(A,520);A.jk=performance.now()+500}
      const k=Math.min(1,s.age/s.life);if(A.ctrl!=='remote'){A.x=s.x0+s.ux*110*k;A.y=s.y0+s.uy*110*k;arenaClamp(A)}A.jz=Math.sin(k*Math.PI)*26;s.x=A.x;s.y=A.y-12;
      if(k>=1){s.dead=1;A.jz=0;shockwave(A.x,A.y,40,'#c03028',0.35);
        if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(T.x-A.x,(T.y-A.y)*1.2)<30)nkHit(s,T,T.x,T.y-12,{vx:s.ux,vy:s.uy,kb:14});
        else if(A.ctrl!=='remote'){const m=act(A),d=Math.max(1,Math.round(m.mhp*0.12));dealDamage(A,d,'#ef6f6f','-'+d);say('Turmkick ging daneben – Rückstoß!')}}},draw(){}},
  spin:{tick(s,dt,T,alive){const A=sideF(s.side);if(!A){s.dead=1;return}s.x=A.x;s.y=A.y-12;const R=SPIN_R;
      if(!s.init){s.init=1;s.hn=0;dkLock(A,150);
        let freed=0;if(A.seed){A.seed=null;freed=1}const N=nkState();const n0=N.traps.length;N.traps=N.traps.filter(t=>t.side===A.side);if(N.traps.length<n0)freed=1;
        for(const b of B.shots||[])if(b.k==='tether'&&b.tied&&b.side!==A.side){b.dead=1;freed=1}if(A.ctrl!=='remote'&&(A.st.root>0||A.st.trap>0)){A.st.root=0;A.st.trap=0;freed=1}
        if(freed)say(`${SPECIES[act(A).s].n} wirbelt sich frei!`)}
      if(A.ctrl!=='remote')A.face=Math.floor(s.age*14)%2?1:-1;   // the monster spins
      // three hits while spinning (every 0.3 s), each throws the target outward
      if(s.age>=s.hn*0.3&&s.hn<3){s.hn++;if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(T.x-A.x,(T.y-A.y)*1.25)<R){const d=Math.hypot(T.x-A.x,T.y-A.y)||1;nkHit(s,T,T.x,T.y-12,{vx:(T.x-A.x)/d,vy:(T.y-A.y)/d,kb:s.hn<3?3:16})}}
      // knocks incoming shots out of the air
      for(const b of B.shots||[]){if(b.dead||b.side===s.side||b.nm||b.cap||b.mel)continue;if(Math.hypot(b.x-A.x,(b.y-A.y+12)*1.25)<R){b.dead=1;burst(b.x,b.y,'#e8ecf2',5)}}
      if(Math.random()<dt*20)B.parts.push({x:A.x+(Math.random()-.5)*R*1.4,y:A.y+4,vx:(Math.random()-.5)*60,vy:-20-Math.random()*20,life:0.4,age:0,c:'#c8b89a'});
      if(s.age>s.life)s.dead=1},
    draw(c,s,col,now){const k=s.age/s.life,R=SPIN_R,fade=k>0.85?(1-k)/0.15:Math.min(1,k*6);c.globalAlpha=Math.max(0,fade);
      // a little tornado: three tilted rings of streaks, wider at the top
      for(let ring=0;ring<3;ring++){const rr=R*(0.55+ring*0.22),yy=s.y+14-ring*12,sp=now/55*(ring%2?1:1.3);
        for(let i=0;i<7;i++){const a0=i/7*Math.PI*2+sp;for(let j=0;j<6;j++){const a=a0+j*0.09,x=Math.round(s.x+Math.cos(a)*rr),y=Math.round(yy+Math.sin(a)*rr*0.32);
          c.fillStyle='#14141f';c.fillRect(x-1,y-1,4,3);c.fillStyle=j<2?'#ffffff':j<4?'#d8dce8':'#9aa1bd';c.fillRect(x,y,2,1)}}}
      c.strokeStyle='#ffffff';pxEl(c,s.x,s.y+16,R*0.9,R*0.3,0);c.globalAlpha=1}},
  weather:{tick(s,dt,T,alive){s.dead=1;const mv=MOVES[s.mid];B.weather={w:mv.w,until:performance.now()+10000,t0:performance.now()};say(mv.w==='sun'?'Die Sonne brennt!':mv.w==='rain'?'Es regnet in Strömen!':'Ein Sandsturm zieht auf!')},draw(){}},
  protect:{tick(s,dt,T,alive){s.dead=1;const A=sideF(s.side);if(!A)return;A.prot=performance.now()+900;say(`${SPECIES[act(A).s].n} schützt sich!`)},draw(){}},
  screen:{tick(s,dt,T,alive){s.dead=1;const A=sideF(s.side);if(!A)return;const mv=MOVES[s.mid];if(mv.scr==='mel')A.scrMel=performance.now()+6000;else A.scrRng=performance.now()+6000;say(`${mv.n} errichtet!`)},draw(){}},
  belly:{tick(s,dt,T,alive){s.dead=1;const A=sideF(s.side);if(!A||A.ctrl==='remote')return;const m=act(A);if(m.hp<=m.mhp/2+1){say('Zu wenig KP für die Bauchtrommel!');return}
      const d=Math.floor(m.mhp/2);m.hp-=d;B.nums.push({x:A.x,y:A.y-40,t:'-'+d,c:'#ef6f6f',at:performance.now(),sz:10,life:1000});applyStages(A,{a:4});say(`${SPECIES[m.s].n} trommelt sich auf maximale Kraft!`)},draw(){}}};
Object.assign(NK,G2);
// Turmkick: the kicker is in the air (drawn higher) – reuse the flight offset if the engine has none
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){_de(c,now,top);if(!B)return;
  if(!top){// weather tint under the fighters
    const W=B.weather;if(W&&W.until>now){const a=Math.min(1,(now-W.t0)/400,(W.until-now)/600);c.save();c.globalAlpha=(W.w==='sand'?0.28:0.18)*a;c.fillStyle=W.w==='sun'?'#ffcb3d':W.w==='rain'?'#1e3a6a':'#c8a060';c.fillRect(0,0,AW,AH);c.restore()}return}
  const W=B.weather;if(W&&W.until>now){const a=Math.min(1,(now-W.t0)/400,(W.until-now)/600);c.save();c.globalAlpha=a;
    if(W.w==='rain'){for(let i=0;i<130;i++){const x=(i*53+now*0.35)%AW,y=(i*97+now*0.9)%AH;c.fillStyle=i%3?'#bfe2ff':'#ffffff';c.fillRect(Math.round(x),Math.round(y),1,7);if(i%9===0){c.fillStyle='#9fd2ff';c.fillRect(Math.round((i*31)%AW),Math.round((i*61+now*0.05)%AH),3,1)}}}
    else if(W.w==='sand'){for(let i=0;i<220;i++){const x=(i*71+now*(0.25+(i%5)*0.06))%AW,y=(i*37+Math.sin(now/300+i)*10+now*0.04)%AH;c.fillStyle=i%3===0?'#6a4a28':i%2?'#b8904e':'#f0dca8';c.fillRect(Math.round(x),Math.round(y),i%4?4:6,i%4?1:2)}}
    else{for(let i=0;i<6;i++){const x=(i*90+now*0.02)%AW;c.fillStyle='rgba(255,236,150,0.18)';c.beginPath();c.moveTo(x,0);c.lineTo(x+30,0);c.lineTo(x-40,AH);c.lineTo(x-70,AH);c.fill()}}
    c.restore();pxText(c,`${WEATHER[W.w].n} ${Math.ceil((W.until-now)/1000)}s`,AW-4,12,WEATHER[W.w].c,7,'right')}
  for(const F of[B.me,B.foe]){if(!F||F.out)continue;const X=Math.round(F.x),Y=Math.round(F.y);
    if(F.prot>now){const k=(F.prot-now)/900;c.save();c.globalAlpha=0.5+0.4*k;c.strokeStyle='#9fe3ff';c.lineWidth=2;pxEl(c,X,Y-14,22,24,0);c.strokeStyle='#ffffff';c.lineWidth=1;pxEl(c,X,Y-14,19,21,0);c.restore()}
    if(F.scrMel>now||F.scrRng>now){const blink=(Math.min(F.scrMel||0,F.scrRng||0)>0?0:0);c.fillStyle=F.scrMel>now?'#ff8a8a':'#ffe27a';c.fillRect(X-12,Y+4,24,2);if(F.scrMel>now&&F.scrRng>now){c.fillStyle='#ffe27a';c.fillRect(X-12,Y+7,24,2)}}}}}
// hit modifiers on the target's client
{const _hl=hitLocal;hitLocal=function(T,s){const mv=MOVES[s&&s.mid];if(!mv||!T||!T.st)return _hl.apply(this,arguments);const now=performance.now();
  if(T.prot>now&&(s.p||0)>0){say(`${SPECIES[act(T).s].n} blockt die Attacke!`);burst(T.x,T.y-14,'#9fe3ff',10);T.flash=0.1;return 0}
  const A=sideF(s.side),att=s.att||(A&&act(A));let f=1,crit=false;
  if(mv.t==='fire')f*=weatherOn('sun')?1.5:weatherOn('rain')?0.5:1;if(mv.t==='water')f*=weatherOn('rain')?1.5:weatherOn('sun')?0.5:1;if(mid_is(s,'thunder')&&weatherOn('rain'))f*=1.3;
  if(weatherOn('sand')&&SPECIES[act(T).s].t==='rock'&&!s.mel)f*=0.75;
  if(s.mel&&T.scrMel>now)f*=0.5;if(!s.mel&&T.scrRng>now)f*=0.5;
  if(mv.crit&&Math.random()<mv.crit){f*=1.5;crit=true}
  if(mv.reversal&&att){const k=1-att.hp/Math.max(1,att.mhp);f*=1+k*9}
  if(mv.seismic&&att){const e=eff(mv.t,SPECIES[act(T).s].t);if(e===0){say('Das hatte keine Wirkung…');return 0}T.flash=0.25;T.hurtT=now;T.hitstun=0.14;T.inv=Math.max(T.inv,0.12);dealDamage(T,att.l,'#ffffff','-'+att.l);return att.l}
  const d=_hl.call(this,T,f!==1?Object.assign({},s,{p:s.p*f}):s);
  if(d>0){if(crit)B.nums.push({x:T.x,y:T.y-56,t:'VOLLTREFFER!',c:'#ffcb3d',at:now,sz:9,life:1000});
    if(mv.flinch&&Math.random()<mv.flinch&&T.st.stun<=0){T.st.stun=0.35;say(`${SPECIES[act(T).s].n} schreckt zurück!`)}
    if(mv.tox){T.st.tox=8;T.toxN=0;T.toxMild=0;T.toxT=now+1000;say(`${SPECIES[act(T).s].n} wurde schwer vergiftet!`)}
    if(mv.trap){T.st.trap=10;say(`${SPECIES[act(T).s].n} kann nicht mehr fliehen!`)}
    if(mv.encore){T.st.enc=4;T.encIdx=T.lastSlot??0;say(`Zugabe! ${SPECIES[act(T).s].n} kann nur noch ${MOVES[act(T).m[T.encIdx]]?.n||'dieselbe Attacke'} einsetzen!`)}
    if(mv.fx==='root'){T.st.root=1.6;T.rx=T.x;T.ry=T.y;say(`${SPECIES[act(T).s].n} sitzt im Whirlpool fest!`)}
    if(mv.thief&&T===B.me&&B.mode!=='duel'&&RUN&&(RUN.money||0)>0){const g=Math.min(RUN.money,10+Math.floor(Math.random()*21));RUN.money-=g;updateHud();say(`Der Gegner klaut dir ${g} $!`)}}
  return d}}
function mid_is(s,m){return s&&s.mid===m}
// attacker side: recoil, own stat raise, stolen money
{const _sh=shotHit;shotHit=function(s,T){const r=_sh.apply(this,arguments);const mv=MOVES[s&&s.mid],A=s&&sideF(s.side);
  if(mv&&A&&T&&A.ctrl!=='remote'&&!(T.prot>performance.now())&&(s.p||0)>0&&!s.wv){
    if(mv.recoil){const e=calcDmg(s.att||act(A),act(T),s.mid,s.p).d,d=Math.max(1,Math.round(e*mv.recoil));dealDamage(A,d,'#ef6f6f','-'+d);say('Rückstoß!')}
    if(mv.selfbs&&Math.random()<(mv.selfc??1))applyStages(A,mv.selfbs);
    if(mv.thief&&A===B.me&&B.mode!=='duel'&&RUN){const g=10+Math.floor(Math.random()*21);RUN.money=(RUN.money||0)+g;updateHud();B.nums.push({x:A.x,y:A.y-44,t:`+${g} $`,c:'#ffcb3d',at:performance.now(),sz:9,life:1000})}}
  return r}}
// statuses over time: toxin gets worse every second, root holds still, Zugabe locks the move, Horrorblick blocks flight and switching
{const _f=fire;fire=function(F,i,remote){if(F&&F.st&&F.st.enc>0&&!remote&&i!==F.encIdx){if(F===B.me&&(!F.encSay||performance.now()-F.encSay>800)){F.encSay=performance.now();say(`Zugabe: nur ${MOVES[act(F).m[F.encIdx]]?.n||'die letzte Attacke'}!`)}return}
  const cd=F&&F.cd?F.cd.slice():null;const r=_f.apply(this,arguments);if(F&&cd&&F.cd.some((v,k)=>v>cd[k]))F.lastSlot=i;return r}}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);if(!B||B.tb||B.state!=='fight')return;const now=performance.now();
  if(B.weather&&B.weather.until<=now)B.weather=null;
  for(const F of[B.me,B.foe]){if(!F||!F.st||F.ctrl==='remote'||F.out||F.faint>0)continue;const m=act(F);if(!m||m.hp<=0)continue;
    if(F.st.tox>0&&now>=(F.toxT||0)){F.toxT=now+1000;F.toxN=(F.toxN||0)+1;const d=Math.max(1,Math.round(m.mhp*0.02*(F.toxMild?1.1:F.toxN)));dealDamage(F,d,'#c070e0','-'+d)}
    if(F.st.root>0&&F.rx!=null){F.x=F.rx;F.y=F.ry;F.vx=F.vy=0}
    if(weatherOn('rain')&&!(F.st.ground>0))F.st.wet=Math.max(F.st.wet||0,1);
    if(weatherOn('sun')&&F.st.wet>0)F.st.wet=0;
    if(weatherOn('sand')&&!['rock','fighting'].includes(SPECIES[m.s].t)){F.sandT=(F.sandT||now+2000);if(now>=F.sandT){F.sandT=now+2000;const d=Math.max(1,Math.round(m.mhp/16));dealDamage(F,d,'#c8a060','-'+d)}}}}}
{const _ff=fleeFallOk;fleeFallOk=function(){if(B&&B.me&&B.me.st&&B.me.st.trap>0)return false;return _ff.apply(this,arguments)}}
{const _bs=battleSwitch;battleSwitch=function(){if(B&&B.me&&B.me.st&&B.me.st.trap>0&&B.state==='fight'){say('Horrorblick – du kannst nicht wechseln!');return}return _bs.apply(this,arguments)}}
{const _cb=closeBattle;closeBattle=function(){if(B){B.weather=null;for(const F of[B.me,B.foe])if(F){F.prot=0;F.scrMel=0;F.scrRng=0;F.toxN=0;F.rx=null}}return _cb.apply(this,arguments)}}
// ---- Druckwelle: a visible shock wave for heavy impacts (explosions, strikes from above, 100+ power hits, Sturmknall)
//      two pixel rings race outward, the ground dust flies, the screen shakes and everyone near is pushed away
function shockwave(x,y,R,col,dur){if(!B)return;const now=performance.now();dur=(dur||0.45)*1000;(B.sw=B.sw||[]).push({x,y,R,col:col||'#ffffff',t0:now,dur});if(B.sw.length>8)B.sw.shift();
  B.shakeUntil=Math.max(B.shakeUntil||0,now+Math.min(260,R*2));
  for(let i=0;i<Math.round(R/5);i++){const a=Math.random()*Math.PI*2,v=60+Math.random()*90;B.parts.push({x:x+Math.cos(a)*6,y:y+Math.sin(a)*3,vx:Math.cos(a)*v,vy:Math.sin(a)*v*0.5-20,life:0.45+Math.random()*0.2,age:0,c:Math.random()<.5?'#c8b08a':'#8a6a48'})}
  for(const F of[B.me,B.foe]){if(!F||F.ctrl==='remote'||F.out||airBusy(F))continue;const dx=F.x-x,dy=(F.y-y)*1.3,d=Math.hypot(dx,dy);if(d<4||d>R)continue;const k=(1-d/R)*14;F.x+=dx/d*k;F.y+=dy/d*k*0.8;arenaClamp(F)}}
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){_de(c,now,top);if(!top||!B||!B.sw||!B.sw.length)return;B.sw=B.sw.filter(w=>now-w.t0<w.dur);
  for(const w of B.sw){const k=(now-w.t0)/w.dur,e=1-(1-k)*(1-k);for(const[f,cl,al,th]of[[1,'#ffffff',1,3],[0.86,w.col,0.95,3],[0.6,'#14141f',0.35,2]]){const r=w.R*e*f;if(r<2)continue;c.save();c.globalAlpha=al*(1-k*k);
      const n=Math.max(20,Math.round(r*1.4));for(let i=0;i<n;i++){const t=i/n*Math.PI*2,px=Math.round(w.x+Math.cos(t)*r),py=Math.round(w.y+Math.sin(t)*r*0.45);c.fillStyle=cl;c.fillRect(px-1,py-1,th,th-(k>0.6?1:0))}c.restore()}
    if(k<0.25){c.save();c.globalAlpha=(0.25-k)*2.4;c.fillStyle='#ffffff';pxEl(c,w.x,w.y,w.R*0.25,w.R*0.11,1);c.restore()}}}}
// strikes from above already push outward (impactWave) – now they also show the wave; big explosions and 100+ hits too
{const _iw=impactWave;impactWave=function(s,T,x,y){const r=_iw.apply(this,arguments);shockwave(x,y,(s.r||12)+36,TYPES[(MOVES[s.mid]||{}).t||'normal'].c,0.5);return r}}
{const _sh=shotHit;shotHit=function(s,T){const r=_sh.apply(this,arguments);const mv=MOVES[s&&s.mid];if(mv&&T&&!s.wv&&!['jet','nova','dash','spin'].includes(mv.k)&&((mv.k==='big')||(mv.p||0)>=100)&&!(s.sw)){shockwave(T.x,T.y,mv.k==='big'?90:60,TYPES[mv.t].c,0.5)}return r}}
