/* ===================== COMBOS / SYNERGIES (v0.99) =====================
   Statuses set up the next hit. The target's own client decides (it knows its statuses), so duels stay in sync.
   Water hits make wet (4 s, also standing in a puddle).
   Kurzschluss   Elektro → nass             ×1,5 + 0,6 s gelähmt (nicht bei Erdung)
   Verdampft     Feuer   → nass             ×0,6, the water is gone
   Ölbrand       Feuer   → geölt            ×1,6 + sicherer Brand
   Lauffeuer     Feuer   → Egelsamen        ×1,4 + Brand, the seed burns away
   Anfachen      Flug    → brennt           ×1,25, burns 2 s longer
   Abgelöscht    Wasser  → brennt           puts the fire out
   Schlammfalle  Pflanze → nass             2,5 s langsam
   Hinterhalt    Unlicht → geblendet        ×1,5
   Magnetzug     Gestein/Stahl → magnetisiert ×1,35 (and rock projectiles home in)
   Wehrlos       anything → schläft         ×1,4
   Nachsetzen    Nahkampf → gelähmt         ×1,3 */
const STEEL_MV=new Set(['metalclaw','irontail','steelwing','magnetbomb']);
const COMBO_LBL={kurz:'Kurzschluss',dampf:'Verdampft',oel:'Ölbrand',lauf:'Lauffeuer',anfach:'Anfachen',loesch:'Abgelöscht',schlamm:'Schlammfalle',hinter:'Hinterhalt',magnet:'Magnetzug',wehrlos:'Wehrlos',nach:'Nachsetzen'};
function comboShow(T,k,good){if(!B)return;const now=performance.now();B.nums.push({x:T.x,y:T.y-62,t:'KOMBO: '+COMBO_LBL[k]+'!',c:good?'#ffcb3d':'#9fd2ff',at:now,sz:10,life:1400});say(`Kombo: ${COMBO_LBL[k]}!`);B.comboN=(B.comboN||0)+1}
{const _hl=hitLocal;hitLocal=function(T,s){const mv=MOVES[s&&s.mid];if(!mv||!T||!T.st||!(s.p>0))return _hl.apply(this,arguments);
  const st=T.st,tt=SPECIES[act(T).s].t,t=mv.t,gr=st.ground>0;let f=1;const after=[];
  if(t==='electric'&&st.wet>0){if(gr)say('Geerdet – kein Kurzschluss!');else{f*=1.5;after.push(()=>{st.wet=0;if(st.stun<=0)st.stun=0.6;comboShow(T,'kurz',1);burst(T.x,T.y-12,'#ffe27a',16)})}}
  if(t==='fire'&&st.oil>0){f*=1.6;after.push(()=>{st.oil=0;if(tt!=='fire')st.burn=Math.max(st.burn,4);comboShow(T,'oel',1);burst(T.x,T.y-12,'#ff8a3d',20)})}
  else if(t==='fire'&&T.seed&&T.seed.t>0){f*=1.4;after.push(()=>{T.seed=null;if(tt!=='fire')st.burn=Math.max(st.burn,3);comboShow(T,'lauf',1)})}
  else if(t==='fire'&&st.wet>0){f*=0.6;after.push(()=>{st.wet=0;comboShow(T,'dampf',0);for(let i=0;i<8;i++)B.parts.push({x:T.x+(Math.random()-.5)*16,y:T.y-14,vx:(Math.random()-.5)*20,vy:-30-Math.random()*20,life:0.7,age:0,c:'#e6eef6'})})}
  if(t==='flying'&&st.burn>0){f*=1.25;after.push(()=>{st.burn+=2;comboShow(T,'anfach',1)})}
  if(t==='water'&&st.burn>0)after.push(()=>{st.burn=0;comboShow(T,'loesch',0)});
  if(t==='grass'&&st.wet>0)after.push(()=>{st.slow=Math.max(st.slow,2.5);comboShow(T,'schlamm',1)});
  if(t==='dark'&&st.blind>0){f*=1.5;after.push(()=>comboShow(T,'hinter',1))}
  if((t==='rock'||STEEL_MV.has(s.mid))&&st.mag>0){f*=1.35;after.push(()=>comboShow(T,'magnet',1))}
  if(st.sleep>0&&mv.fx!=='sleep'){f*=1.4;after.push(()=>comboShow(T,'wehrlos',1))}
  if(s.mel&&st.stun>0){f*=1.3;after.push(()=>comboShow(T,'nach',1))}
  const d=_hl.call(this,T,f!==1?Object.assign({},s,{p:s.p*f}):s);
  if(d>0){for(const a of after)a();if(t==='water'&&!gr)st.wet=Math.max(st.wet||0,4)}
  return d}}
// the three setter moves
const CB_LABEL={oil:'Öl-Wurf',magnet:'Magnet-Schuss',ground:'selbst'};
{const _md=moveDesc;const HINT={water:'macht nass',electric:'Kombo: nass',fire:'Kombo: Öl/Egelsamen',flying:'Kombo: Brand',dark:'Kombo: geblendet',grass:'Kombo: nass'};
 moveDesc=function(mid){let r=_md(mid);const mv=MOVES[mid];if(!mv)return r;if(CB_LABEL[mv.k])r=r.replace('Fernkampf',CB_LABEL[mv.k]);
   const h=mv.k==='oil'?'macht ölig':mv.k==='magnet'?'magnetisiert':mv.k==='ground'?'schützt vor Kombos':(mv.t==='rock'||STEEL_MV.has(mid))&&mv.p?'Kombo: Magnet':mv.p?HINT[mv.t]:null;return h?r.replace(/ · (\d+ AP)$/,` · ${h} · $1`):r}}
{const _sp0=shotParams0;shotParams0=function(mid){const mv=MOVES[mid]||MOVES.bump;const P={oil:{sp:170,life:1.0,r:6},magnet:{sp:210,life:1.2,r:6},ground:{life:0.05}}[mv.k];
  if(P)return Object.assign({k:mv.k,nm:1,sp:1,r:6,p:mv.p,n:1},P);return _sp0(mid)}}
Object.assign(NK,{
  oil:{tick(s,dt,T,alive){s.x+=s.vx*dt;s.y+=s.vy*dt;const end=()=>{s.dead=1;const now=performance.now();B.haz=(B.haz||[]).filter(h=>h.until>now);if(B.haz.length>=12)B.haz.shift();
        B.haz.push({k:'oil',x:clamp(s.x,24,AW-24),y:clamp(s.y+10,24,AH-16),r:18,t0:now,until:now+8000,seed:Math.floor(Math.random()*1e6)});burst(s.x,s.y,'#3a3020',8)};
      if(s.age>s.life||outArena(s.x,s.y+10)){end();return}if(shotVsObs(s)){end();return}
      if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){s.dead=1;nkHit(s,T,s.x,s.y,{kb:2});if(T.ctrl!=='remote'&&!(T.st.ground>0))T.st.oil=6;burst(T.x,T.y-10,'#3a3020',12);say(`${SPECIES[act(T).s].n} ist voller Öl!`)}},
    draw(c,s,col,now){const x=Math.round(s.x),y=Math.round(s.y);c.fillStyle='#14141f';c.fillRect(x-4,y-4,8,8);c.fillStyle='#3a3020';c.fillRect(x-3,y-3,6,6);c.fillStyle='#c8a040';c.fillRect(x-2,y-2,2,2)}},
  magnet:{tick(s,dt,T,alive){s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;return}if(shotVsObs(s))return;
      if(alive&&!(T.inv>0)&&!airBusy(T)&&Math.hypot(s.x-T.x,s.y-(T.y-12))<s.r+11){s.dead=1;nkHit(s,T,s.x,s.y,{kb:2});if(T.ctrl!=='remote'&&!(T.st.ground>0))T.st.mag=6;burst(T.x,T.y-12,'#ff5a8a',12);say(`${SPECIES[act(T).s].n} ist magnetisiert!`)}},
    draw(c,s,col,now){const x=Math.round(s.x),y=Math.round(s.y);c.fillStyle='#14141f';c.fillRect(x-5,y-4,10,8);c.fillStyle='#d23b3b';c.fillRect(x-4,y-3,4,6);c.fillStyle='#3d6bd8';c.fillRect(x,y-3,4,6);c.fillStyle='#ffffff';c.fillRect(x-4,y+1,2,2);c.fillRect(x+2,y+1,2,2)}},
  ground:{tick(s,dt,T,alive){s.dead=1;const A=sideF(s.side);if(!A||A.ctrl==='remote')return;const st=A.st;st.ground=5;st.wet=0;st.oil=0;st.mag=0;st.burn=0;burst(A.x,A.y-4,'#c49a6c',14);say(`${SPECIES[act(A).s].n} erdet sich!`)},draw(){}}});
// statuses from the ground (puddle = wet, oil slick = oily + slippery), fire ignites oil slicks, rock shots curve towards magnetised targets
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);if(!B||B.tb||B.state!=='fight')return;const now=performance.now();
  if(B.haz&&B.haz.some(h=>h.k==='oil')){const fires=B.haz.filter(h=>h.k==='fire');const hot=(B.shots||[]).filter(s=>!s.dead&&MOVES[s.mid]&&MOVES[s.mid].t==='fire').map(s=>[s.x,s.y+10,Math.max(6,s.r||6)]);for(const f of fires)hot.push([f.x,f.y,f.r]);
    for(const h of B.haz){if(h.k!=='oil'||h.until<now)continue;if(hot.some(([x,y,r])=>Math.hypot(h.x-x,(h.y-y)*1.3)<h.r+r)){h.k='fire';h.r=22;h.t0=now;h.until=now+6000;burst(h.x,h.y-6,'#ff8a3d',22);B.shakeUntil=now+150;say('Der Ölfleck geht in Flammen auf!')}}}
  for(const F of[B.me,B.foe]){if(!F||!F.st||F.ctrl==='remote'||F.out||F.faint>0||airBusy(F)||F.st.ground>0)continue;
    for(const h of B.haz||[]){if(h.until<now||Math.hypot(F.x-h.x,(F.y-h.y)*1.3)>h.r+4)continue;if(h.k==='puddle')F.st.wet=Math.max(F.st.wet||0,1.5);else if(h.k==='oil'){F.st.oil=Math.max(F.st.oil||0,2);F.slip=0.45}}}
  for(const s of B.shots||[]){if(s.dead||s.nm||s.mel||!MOVES[s.mid])continue;const mv=MOVES[s.mid];if(mv.t!=='rock'&&!STEEL_MV.has(s.mid))continue;const T=s.side===B.me.side?B.foe:B.me;if(!T||!stOn(T,'mag'))continue;
    const sp=Math.hypot(s.vx,s.vy);if(!sp)continue;const a=Math.atan2(s.vy,s.vx),b=Math.atan2((T.y-12)-s.y,T.x-s.x),d=Math.atan2(Math.sin(b-a),Math.cos(b-a)),na=a+clamp(d,-3*dt,3*dt);s.vx=Math.cos(na)*sp;s.vy=Math.sin(na)*sp}}}
// oil slicks on the ground; magnet + grounding marks on the fighters
{const _dh=drawHazards;drawHazards=function(c,now){_dh(c,now);if(!B||!B.haz)return;for(const h of B.haz){if(h.k!=='oil')continue;const a=Math.min(1,(h.until-now)/(h.until-h.t0)*4,(now-h.t0)/200),X=Math.round(h.x),Y=Math.round(h.y);c.save();c.globalAlpha=a;
  c.fillStyle='#1a160e';pxEl(c,X,Y,h.r,h.r*0.5,1);c.fillStyle='#3a3020';pxEl(c,X,Y,h.r-2,h.r*0.5-2,1);const g=Math.floor(now/400)%3;c.fillStyle=['#8a5ad8','#3ddc6b','#ffcb3d'][g];c.fillRect(X-5,Y-2,4,1);c.fillStyle=['#3d8bf2','#d23b3b','#8a5ad8'][g];c.fillRect(X+2,Y+1,3,1);c.restore()}}}
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){_de(c,now,top);if(!top||!B)return;for(const F of[B.me,B.foe]){if(!F||F.out)continue;const X=Math.round(F.x),Y=Math.round(F.y);
  if(stOn(F,'wet')&&Math.floor(now/200)%2){c.fillStyle='#5aa8ff';c.fillRect(X-9,Y-30+((now/60)%10|0),1,2);c.fillRect(X+8,Y-24+((now/70)%10|0),1,2)}
  if(stOn(F,'oil')){c.fillStyle='#3a3020';c.fillRect(X-7,Y-6,3,2);c.fillRect(X+4,Y-9,2,2)}
  if(stOn(F,'mag')){const a=now/200;c.fillStyle='#ff5a8a';c.fillRect(Math.round(X+Math.cos(a)*13),Math.round(Y-14+Math.sin(a)*8),2,2);c.fillStyle='#3d6bd8';c.fillRect(Math.round(X-Math.cos(a)*13),Math.round(Y-14-Math.sin(a)*8),2,2)}
  if(stOn(F,'ground')){c.strokeStyle='#c49a6c';c.lineWidth=1;pxEl(c,X,Y,14,5,0)}}}}
