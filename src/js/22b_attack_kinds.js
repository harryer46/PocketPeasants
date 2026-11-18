// ===== attack kinds (v0.78): rapid fire, arc/throw with hang time, rain, fly, dive, vortex, orbiting particles,
//       ground leftovers, regrowing plants, arena events (falling rocks in the mountains, tide at the beach) =====
const LOB_EASE=0.62;
// eased flight progress: the projectile slows down around the highest point (hang time)
function lobU(k){const x=2*clamp(k,0,1)-1;return 0.5+0.5*((1-LOB_EASE)*x+LOB_EASE*x*x*x)}
function sideF(side){return B.me&&B.me.side===side?B.me:B.foe}
function stOn(F,k){if(!F||!F.st)return false;return F.ctrl==='remote'?(F.stShow||[]).includes(k):F.st[k]>0}
function airBusy(F){return!!(F&&F.st&&(F.st.fly>0||F.st.dive>0))}
// height of a flying attacker: rises out of the screen, hangs, dives onto the target spot
function flyZ(F,now){if(!F||!F.flyT0)return 0;const k=(now-F.flyT0)/(F.flyDur*1000);if(k<0||k>=1)return 0;return k<0.3?Math.pow(k/0.3,0.7)*170:k<0.78?170:170*Math.pow(1-(k-0.78)/0.22,1.6)}
function shotId(F){return F.side+(++B.sid)+'_'+Math.floor(Math.random()*1e6)}
function pubShot(F,sh){if(B.mode==='duel'&&F===B.me){B.mySh.push([sh.id,F.a,sh.mid,Math.round(sh.x),Math.round(sh.y),Math.round(sh.vx),Math.round(sh.vy),Math.round(performance.now())]);B.mySh=B.mySh.slice(-9);publishDuel(true)}}
function curDir(F){const T=F===B.me?B.foe:B.me;let dx=T?T.x-F.x:1,dy=T?T.y-F.y:0;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;
  if(F.ctrl==='ai'&&F.aimAng!=null&&isFinite(F.aimAng)){dx=Math.cos(F.aimAng);dy=Math.sin(F.aimAng)}if(F===B.me){const a=myAim();dx=a.x;dy=a.y}return[dx,dy]}
// rapid fire: 5–10 projectiles one after another, each aimed at the moment it leaves
function rapidShot(F,mid){const bt=act(F),sp=shotParams(mid);let[dx,dy]=curDir(F);const j=(Math.random()-0.5)*0.14,c=Math.cos(j),s=Math.sin(j);[dx,dy]=[dx*c-dy*s,dx*s+dy*c];
  if(F.st.conf>0){const w=(Math.random()-0.5)*1.2;[dx,dy]=[dx*Math.cos(w)-dy*Math.sin(w),dx*Math.sin(w)+dy*Math.cos(w)]}F.face=dx<0?-1:1;F.atkT=performance.now();
  const sh={id:shotId(F),side:F.side,att:Object.assign({},bt),mid,x:F.x+dx*8,y:F.y-10+dy*6,vx:dx*sp.sp,vy:dy*sp.sp,age:0,life:sp.life,r:sp.r,p:sp.p,mel:sp.mel,am:stageMul(stgOf(F).a)};if(sp.mel){sh.x=F.x+dx*8;sh.y=F.y-10+dy*6}B.shots.push(sh);pubShot(F,sh)}
function rapidTick(dt){for(const F of[B.me,B.foe]){if(!F||!F.rq)continue;const q=F.rq;if(B.state!=='fight'||F.faint>0||F.out||F.st.stun>0||F.st.sleep>0||act(F).hp<=0){F.rq=null;continue}
  q.t-=dt;while(q.t<=0&&q.left>0){q.t+=q.int;q.left--;rapidShot(F,q.mid)}if(q.left<=0)F.rq=null}}
// dive: under water for a moment (untouchable, a bit faster), then bursts up with a splash around itself
function diveTick(){for(const F of[B.me,B.foe]){if(!F||F.ctrl==='remote'||!F.diveMid)continue;if(F.st.dive>0)continue;const mid=F.diveMid;F.diveMid=null;if(B.state!=='fight'||F.faint>0||act(F).hp<=0)continue;
  const sp=shotParams(mid),sh={id:shotId(F),side:F.side,att:Object.assign({},act(F)),mid,x:F.x,y:F.y,vx:0,vy:0,age:0,life:sp.life,r:sp.r,p:sp.p,k:sp.k,nm:1,am:stageMul(stgOf(F).a),dv:1};
  B.shots.push(sh);pubShot(F,sh);burst(F.x,F.y-6,'#8fc8f0',18);burst(F.x,F.y-6,'#ffffff',10);F.inv=Math.max(F.inv,0.15)}}
// vortex (Sog): slow swirl that drags the target in
function vortexShot(s,dt,T,alive){s.x+=s.vx*dt;s.y+=s.vy*dt;
  if(s.age>s.life||outArena(s.x,s.y+10)){s.dead=1;if(!outArena(s.x,s.y+10))leaveHazard(s,s.x,s.y+8);return}
  if(shotVsObs(s))return;
  if(!alive)return;const dx=s.x-T.x,dy=s.y-(T.y-12),d=Math.hypot(dx,dy)||1;
  if(d<92&&T.ctrl!=='remote'&&!airBusy(T)){const pull=78*(1-d/92)+12;T.x+=dx/d*pull*dt;T.y+=dy/d*pull*dt*0.9;arenaClamp(T);obsPush(T)}
  if(d<s.r+11&&T.inv<=0){s.dead=1;shotHit(s,T);leaveHazard(s,T.x,T.y)}}
// mountains: rocks fall from time to time (drop shadow first); beach: the tide washes over one side of the field
function arenaEvTick(dt){if(B.mode==='duel'||B.tb||B.state!=='fight')return;const now=performance.now(),z=B.zone;B.ev=(B.ev||[]).filter(e=>!e.done);
  if(z==='west'||z==='snow'){if(!B.evNext)B.evNext=now+3500+Math.random()*3000;if(now>B.evNext){B.evNext=now+4500+Math.random()*4500;const a=Math.random()*6.28,r=Math.sqrt(Math.random())*0.82;
    const T=Math.random()<0.45?(Math.random()<0.5?B.me:B.foe):null;const x=T?T.x+(Math.random()-0.5)*30:ACX+Math.cos(a)*ARX*r,y=T?T.y+(Math.random()-0.5)*16:ACY+Math.sin(a)*ARY*r;B.ev.push({k:'fall',x,y,t0:now,dur:1400})}}
  if(z==='south'){if(!B.evNext)B.evNext=now+4000+Math.random()*4000;if(now>B.evNext&&!B.ev.some(e=>e.k==='tide')){B.evNext=now+9000+Math.random()*6000;B.ev.push({k:'tide',bot:Math.random()<0.5,t0:now,dur:5200});say('Eine Welle schwappt aufs Feld!')}}
  for(const e of B.ev){const k=(now-e.t0)/e.dur;
    if(e.k==='fall'&&k>=1){e.done=1;burst(e.x,e.y-6,'#8a8a8a',16);burst(e.x,e.y-6,'#d0d0c8',8);B.shakeUntil=now+160;
      for(const F of[B.me,B.foe]){if(!F||F.ctrl==='remote'||F.out||F.faint>0||F.inv>0||airBusy(F))continue;if(Math.hypot(F.x-e.x,(F.y-e.y)*1.3)<17){F.flash=0.25;F.hurtT=now;dealDamage(F,Math.max(1,Math.round(act(F).mhp*0.07)),'#c8a070');say(`${SPECIES[act(F).s].n} wird von einem Stein getroffen!`)}}
      leaveHazard({mid:'rocktoss'},e.x,e.y)}
    if(e.k==='tide'){if(k>=1){e.done=1;continue}const dep=tideDepth(e,now);for(const F of[B.me,B.foe]){if(!F||F.ctrl==='remote'||F.out)continue;if(inTide(e,F.x,F.y,dep)&&!stOn(F,'dive')){F.st.slow=Math.max(F.st.slow,0.3)}}}}}
function tideDepth(e,now){const k=(now-e.t0)/e.dur;return Math.max(0,Math.sin(Math.min(1,k)*Math.PI))*70}
function inTide(e,x,y,dep){return e.bot?y>AY1+6-dep:y<AY0-6+dep}
function drawArenaEv(c,now,top){if(!B||!B.ev)return;for(const e of B.ev){if(e.done)continue;const k=(now-e.t0)/e.dur;
  if(e.k==='fall'){const X=Math.round(e.x),Y=Math.round(e.y);if(!top){const r=6+k*10;c.fillStyle='#00000050';pxEl(c,X,Y,r,r*0.45,1);if(k>0.5&&Math.floor(now/120)%2){c.strokeStyle='#ffffff90';c.lineWidth=1;pxEl(c,X,Y,r+3,r*0.45+2,0)}continue}
    if(k<0.55)continue;const q=(k-0.55)/0.45,ry=Y-8-220*(1-q)*(1-q);const P=(x,y,w,h,cl)=>{c.fillStyle=cl;c.fillRect(Math.round(x),Math.round(y),w,h)};
    P(X-7,ry-6,14,12,'#14141f');P(X-6,ry-7,12,14,'#14141f');P(X-6,ry-5,12,10,'#8e8e98');P(X-5,ry-6,10,12,'#8e8e98');P(X-4,ry-5,4,3,'#c8c8d0');P(X+1,ry+1,4,3,'#5a5a64');continue}
  if(e.k==='tide'&&!top){const dep=tideDepth(e,now);if(dep<1)continue;c.save();c.beginPath();c.ellipse(ACX,ACY,ARX+22,ARY+28,0,0,7);c.clip();
    const y0=e.bot?AY1+6-dep:AY0-6+dep;c.fillStyle='#3d8bf278';if(e.bot)c.fillRect(0,y0,AW,AH-y0);else c.fillRect(0,0,AW,y0);
    c.fillStyle='#ffffffd0';for(let x=0;x<AW;x+=4){const w=Math.round(Math.sin(x/9+now/260)*2);c.fillRect(x,Math.round(y0+w)-1,4,2)}
    c.fillStyle='#bfe2ff90';for(let i=0;i<14;i++){const x=(i*37+Math.floor(now/40))%AW,yy=e.bot?y0+6+(i*13)%Math.max(4,dep-6):y0-6-(i*13)%Math.max(4,dep-6);c.fillRect(x,Math.round(yy),5,1)}c.restore()}}}
// small particles circling around large projectiles
function drawOrbit(c,s,col,now,R){const n=s.k==='vortex'?7:3,rr=R||(s.r+6),t=now/1000*(s.k==='vortex'?7:5)+(s.age||0);
  for(let i=0;i<n;i++){const a=t+i*6.283/n,q=s.k==='vortex'?rr*(0.55+0.45*((i%3)/2)):rr,x=Math.round(s.x+Math.cos(a)*q),y=Math.round(s.y+Math.sin(a)*q*0.7);c.fillStyle='#14141f';c.fillRect(x-1,y-1,4,4);c.fillStyle=i%2?'#ffffff':col;c.fillRect(x,y,2,2)}}
// plants broken in the arena grow back after a while (not in online duels, which keep obstacles in sync)
function regrowTick(){if(!B.obs||B.mode==='duel')return;const now=performance.now();for(const o of B.obs){if(!o.dead||!o.regrow||now<o.regrow)continue;
  if([B.me,B.foe].some(F=>F&&Math.hypot(F.x-o.x,(F.y-o.y)*1.4)<o.r+14)){o.regrow=now+800;continue}o.dead=0;o.hp=o.max;o.growT=now;o.regrow=0;burst(o.x,o.y-6,'#3ddc6b',8)}}
{const _brk=breakObs;breakObs=function(o){const was=o.dead;_brk(o);if(!was&&o.dead&&((o.mat||(OBK[o.kind]&&OBK[o.kind].mat))==='plant')&&!o.tmp&&B&&B.mode!=='duel')o.regrow=performance.now()+12000+Math.random()*6000}}
{const _dob=drawObs;drawObs=function(c,o,now){if(o.growT&&now-o.growT<700){const k=Math.max(0.05,(now-o.growT)/700);c.save();c.translate(o.x,o.y);c.scale(k,k);c.translate(-o.x,-o.y);_dob(c,o,now);c.restore();return}_dob(c,o,now)}}
// one tick for all of the above; the opponent only starts shooting 0.5 s after the fight begins
function kindsTick(dt){if(!B)return;const now=performance.now();if(B.state==='fight'&&B.prevSt!=='fight')B.fightT=now;B.prevSt=B.state;if(B.tb)return;
  rapidTick(dt);douseTick();diveTick();regrowTick();arenaEvTick(dt);fleeFallTick(dt)}
function aiMayFire(){return!B.fightT||performance.now()-B.fightT>500}

// water puts out fire: water shots (waves, jets, splashes after landing) and puddles extinguish fire hazards with a steam puff
function douseTick(){if(!B||!B.haz||!B.haz.some(h=>h.k==='fire'))return;const wet=[];
  for(const s of B.shots||[]){const mv=MOVES[s.mid];if(!mv||mv.t!=='water')continue;if((s.k==='lob'||s.k==='air')&&s.age<s.life*0.85)continue;wet.push([s.x,s.y+(s.k==='lob'||s.k==='air'?0:10),s.wave?16:Math.max(6,s.r)])}
  for(const h of B.haz)if(h.k==='puddle')wet.push([h.x,h.y,h.r-4]);if(!wet.length)return;
  B.haz=B.haz.filter(h=>{if(h.k!=='fire')return true;for(const[x,y,r]of wet)if(Math.hypot(h.x-x,(h.y-y)*1.3)<h.r+r){steamPuff(h.x,h.y);return false}return true})}
function steamPuff(x,y){burst(x,y-4,'#e8eef4',12);burst(x,y-8,'#b8c4cc',6)}

// ---- sleep mini-game: while your monster sleeps, paragraphs of its law book fall down on the right side of the arena.
// Only about 1 in 10 shows the number with its matching name — tap that one and your monster wakes up (a wrong tap: +0.5 s sleep)
function sleepPairs(sid){let book=lawOf(sid);const all=b=>Object.keys(SPECIES).map(s=>lawTitle(s)&&lawOf(s)===b?lawTitle(s):null).filter(Boolean);
  let L=book?all(book):[];if(L.length<4){book='StGB';L=all(book)}const seen=new Set();L=L.filter(t=>{const k=t.head;if(seen.has(k))return false;seen.add(k);return true});return{book,L}}
function sleepGame(){if(!B||B.tb||$('#sleepfall'))return;const myB=B,F=B.me;const{book,L}=sleepPairs(act(F).s);if(L.length<2)return;
  const ov=document.createElement('div');ov.id='sleepfall';ov.innerHTML=`<div class="sfh">💤 ${esc(book)}: passenden § antippen</div>`;document.body.appendChild(ov);
  const items=[];let spawnT=0,cnt=0,lastOk=-99,last=performance.now();
  const spawn=()=>{cnt++;const ok=Math.random()<0.1||cnt-lastOk>=10;if(ok)lastOk=cnt;const a=L[Math.floor(Math.random()*L.length)];let t=a.title;
    if(!ok){let o;do o=L[Math.floor(Math.random()*L.length)];while(o.title===a.title&&L.length>1);t=o.title}
    const el=document.createElement('button');el.className='sfi';el.innerHTML=`<b>${esc(a.head.replace(' '+book,''))}</b>${esc(t)}`;
    const it={el,ok,y:-50,lane:cnt%2,v:62};el.onclick=e=>{e.stopPropagation();if(it.done)return;it.done=1;
      if(ok){F.st.sleep=0;say(`${SPECIES[act(F).s].n} ist aufgewacht! (${a.head} – ${a.title})`);burst(F.x,F.y-14,'#ffe066',14);el.classList.add('ok')}
      else{F.st.sleep=Math.min(8,F.st.sleep+0.5);el.classList.add('bad');say(`Falsch – ${a.head} ist nicht „${t}“.`)}setTimeout(()=>el.remove(),350)};
    ov.appendChild(el);items.push(it)};
  const tick=()=>{const now=performance.now(),dt=Math.min(0.1,(now-last)/1000);last=now;if(PANIC&&B===myB){requestAnimationFrame(tick);return}
    if(B!==myB||!B||B.state==='over'||F.st.sleep<=0||F.out||F.faint>0){ov.remove();return}
    const cv=$('#bcv'),r=cv.getBoundingClientRect();const w=Math.max(130,r.width*0.34);ov.style.left=(r.right-w)+'px';ov.style.top=r.top+'px';ov.style.width=w+'px';ov.style.height=r.height+'px';
    spawnT-=dt;if(spawnT<=0){spawn();spawnT=0.5}
    for(const it of items){if(it.done)continue;it.y+=it.v*dt*(r.height/320);const lw=w/2;it.el.style.maxWidth=(lw-6)+'px';it.el.style.transform=`translate(${Math.round(it.lane*lw+3)}px,${Math.round(it.y)}px)`;if(it.y>r.height){it.done=1;it.el.remove()}}
    requestAnimationFrame(tick)};tick()}

// ---- fleeing (real time, wild fights): at the arena edge paragraphs of your monster's law book fall down on the left and
// right of the arena. About 1 in 10 shows the number with its matching heading – tap it and you get away. A wrong tap makes
// the right one currently falling burst. The fight goes on meanwhile; walking away from the edge clears the column.
let FF=null;
function fleeFallStop(){if(FF){FF.ov.remove();FF=null}}
function fleeFallTick(dt){
  const want=B&&!B.tb&&B.mode==='wild'&&B.state==='fight'&&!B.over&&B.me&&!B.me.out&&!(B.me.faint>0)&&!(B.me.st&&B.me.st.sleep>0)&&atEdge(B.me)&&!CQ&&!PANIC;
  if(!want){fleeFallStop();return}
  const F=B.me,sid=act(F).s;if(FF&&FF.sid!==sid)fleeFallStop();
  if(!FF){const{book,L}=sleepPairs(sid);if(L.length<2)return;const ov=document.createElement('div');ov.id='fleefall';
    ov.innerHTML=`<div class="ffh">🏃 FLUCHT – ${esc(book)}: passenden § antippen</div>`;document.body.appendChild(ov);FF={ov,B,sid,book,L,items:[],spawnT:0.15,cnt:0,lastOk:-99}}
  const cv=$('#bcv'),r=cv.getBoundingClientRect();FF.ov.style.left=r.left+'px';FF.ov.style.top=r.top+'px';FF.ov.style.width=r.width+'px';FF.ov.style.height=r.height+'px';
  const cw=Math.max(110,r.width*0.2);
  FF.spawnT-=dt;if(FF.spawnT<=0){FF.spawnT=0.55;fleeFallSpawn()}
  for(const it of FF.items){if(it.done)continue;it.y+=it.v*dt*(r.height/320);it.el.style.maxWidth=(cw-6)+'px';
    const x=it.side?r.width-cw+3:3;it.el.style.transform=`translate(${Math.round(x)}px,${Math.round(it.y)}px)`;if(it.y>r.height){it.done=1;it.el.remove()}}
  FF.items=FF.items.filter(it=>!it.done||it.el.isConnected)}
function fleeFallSpawn(){const{L,book}=FF;FF.cnt++;const ok=Math.random()<0.1||FF.cnt-FF.lastOk>=10;if(ok)FF.lastOk=FF.cnt;
  const a=L[Math.floor(Math.random()*L.length)];let t=a.title;if(!ok){let o;do o=L[Math.floor(Math.random()*L.length)];while(o.title===a.title&&L.length>1);t=o.title}
  const el=document.createElement('button');el.className='sfi';el.innerHTML=`<b>${esc(a.head.replace(' '+book,''))}</b>${esc(t)}`;
  const it={el,ok,a,t,y:-50,side:FF.cnt%2,v:58};const myB=B;
  el.onclick=e=>{e.stopPropagation();if(it.done||!FF||B!==myB)return;it.done=1;
    if(ok){el.classList.add('ok');B.state='flee';B.fleeT=performance.now();B.me.face=-1;B.shots=[];say(`Erfolgreich geflohen! (${a.head} – ${a.title})`);burst(B.me.x,B.me.y-14,'#3ddc6b',14);setTimeout(fleeFallStop,300);return}
    el.classList.add('bad');setTimeout(()=>el.remove(),350);
    const good=FF.items.filter(x=>x.ok&&!x.done);for(const g of good){g.done=1;g.el.classList.add('pop');setTimeout(()=>g.el.remove(),420)}
    say(good.length?`Falsch – ${a.head} ist nicht „${t}“. Der richtige § ist zerplatzt!`:`Falsch – ${a.head} ist nicht „${t}“.`)};
  FF.ov.appendChild(el);FF.items.push(it)}
{const _cb=closeBattle;closeBattle=function(){fleeFallStop();return _cb.apply(this,arguments)}}
