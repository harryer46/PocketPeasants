/* ===================== FEIGE WILDE MONSTER (v0.125) =====================
   A wild monster 20+ levels below your active monster does not fight to the end: after a short
   while it runs off if it has not hurt you or your monster is still above half HP. */
const FLEE_GAP=20,FLEE_T=6;
function wfHp(){return B.me.team.reduce((s,m)=>s+Math.max(0,m.hp),0)}
{const _bu=bUpdate;bUpdate=function(dt){
  if(B&&B.state==='foeflee'){const F=B.foe;F.y-=130*dt;F.x+=(F.x<ACX?-40:40)*dt;F.face=F.x<ACX?-1:1;
    if(Math.random()<0.6)B.parts.push({x:F.x,y:F.y+4,vx:(Math.random()-.5)*24,vy:10+Math.random()*15,life:0.45,age:0,c:'#e8dcc0'});
    for(const p of B.parts){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt}B.parts=B.parts.filter(p=>p.age<p.life);
    if(performance.now()-B.wfT>1500&&!B.wfDone){B.wfDone=true;endWild()}return}
  _bu.apply(this,arguments);
  if(!B||B.mode!=='wild'||B.state!=='fight'||B.tb||B.closing)return;
  const me=act(B.me),w=act(B.foe);if(!me||!w||w.hp<=0||me.hp<=0)return;
  if(B.wf0==null){B.wf0=wfHp();B.wfA=0}
  if(w.l>me.l-FLEE_GAP){B.wfA=0;return}
  if(CQ||B.shots.some(s=>s.cap)||B.foe.st&&(B.foe.st.sleep>0||B.foe.st.frz>0)||B.foe.frz>0||B.foe.heldT>0)return;
  B.wfA+=dt;
  if(B.wfA>FLEE_T-2&&!B.wfW){B.wfW=1;say(`${SPECIES[w.s].n} schaut sich nervös nach einem Fluchtweg um …`)}
  if(B.wfA>=FLEE_T){const unhurt=wfHp()>=B.wf0,healthy=me.hp>me.mhp*0.5;
    if(unhurt||healthy){B.state='foeflee';B.wfT=performance.now();B.shots=[];say(`💨 ${SPECIES[w.s].n} ist geflohen!`)}else B.wfA=FLEE_T-1}}}
