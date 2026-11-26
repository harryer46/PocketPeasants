/* ===================== FELDREGELN + NAHKAMPF-UMBAU (v0.123) =====================
   Neue Feldregeln (gelten für alle Attacken):
   Wandaufprall   Rückstoß gegen Hindernis oder Arenarand: +50 % Schaden, 0,4 s betäubt, das Hindernis nimmt Schaden
   Eingefroren    Eis trifft nasses Ziel: 1 s eingefroren (Eisblock). Feuer darauf: Aufgetaut, ×1,3
   Splitterhagel  zerbricht ein Stein- oder Holzhindernis, treffen die Splitter alle Gegner daneben
   Ausgezählt     Kampf-Attacke gegen verwirrtes Ziel ×1,3
   Festgehalten   festgebissenes/gefesseltes Ziel nimmt von Mitspielern ×1,3 (Koop)
   Dazu bekommt jede bisher austauschbare Nahkampfattacke eine eigene Mechanik (MELEE_NEW unten).
   Wie bei den Kombos entscheidet immer der Client des getroffenen Monsters über Treffer-Effekte; Bewegungen des
   Angreifers macht der Angreifer selbst. */
Object.assign(COMBO_LBL,{wand:'Wandaufprall',frost:'Eingefroren',tau:'Aufgetaut',splitter:'Splitterhagel',ausz:'Ausgezählt',fest:'Festgehalten',kratz:'Kratzspuren',unterbr:'Unterbrochen',parade:'Parade',fury:'Kratzfurie'});
const KNOCK_X={geowurf:30,headrush:20,flexpunch:18,whirlwind:24};   // extra Rückstoß in px (Geowurf wirft weit)
const OBS_X={flexpunch:3,headrush:2,dreifachkick:2,dynamopunch:2,quakestomp:2};   // Faktor für Schaden an Hindernissen
Object.assign(MOVE_LINE,{
  scratch:'Dreifacher Kratzer. Zwei Serien kurz hintereinander am selben Ziel senken dessen Verteidigung (Kratzspuren).',
  quickjab:'Blitzschnelle Hiebe, die Aufladen unterbrechen: Strahlen im Zielen und Fokusstoß brechen ab.',
  furyswipes:'Bis zu fünf Kratzer – jeder Treffer in schneller Folge trifft 15 % härter.',
  dreifachkick:'Drei Tritte. Steht ein Fels oder Busch vor dir, kickst du Brocken davon aufs Ziel.',
  drillpeck:'Bohrender Schnabel, dreifach – durchbohrt Schutzschild, Schutzschirme und Deckung.',
  wingattack:'Zwei Flügelschläge, die gegnerische Geschosse vor dir wegfegen.',
  noodlelash:'Dreifache Nudelpeitsche – wickelt das Ziel ein, es kann 1,2 s nicht laufen.',
  jolt:'Elektrischer Doppelschlag, betäubt. Gegen nasse Ziele: Kurzschluss.',
  headrush:'Nimmt Anlauf, bricht Büsche unterwegs, schleudert das Ziel weit weg – gegen Hindernisse doppelt hart.',
  flexpunch:'Muskelfaust mit Rückstoß, zertrümmert Hindernisse – die Splitter treffen das Ziel.',
  vinelash:'Peitschende Ranken mit doppelter Reichweite, verlangsamen das Ziel.',
  canewhack:'Hieb mit dem Gehstock, das Ziel stolpert und liegt 0,6 s am Boden.',
  quakestomp:'Stampfer schickt einen Riss nach vorn: beschädigt Hindernisse, lässt Pfützen versickern, verlangsamt.',
  biss:'Beißt sich fest: das Ziel kann 0,8 s nicht laufen. Im Koop treffen Mitspieler es härter.',
  tempohieb:'Sprintet durch das Ziel hindurch und landet dahinter.',
  karateschlag:'Handkante von oben – doppelter Schaden gegen betäubte oder schlafende Ziele.',
  divebomb:'Springt über Hindernisse und Geschosse auf das Ziel – kurz unverwundbar.',
  gegenschlag2:'Parade: Wurdest du in der letzten halben Sekunde getroffen, schlägt der Hieb dreifach zu.',
  skyslam:'Wuchtiger Schlag aus der Luft mit Schockwelle, betäubt.',
  whirl:'Wirbelnde Schlagserie, zieht das Ziel zu dir heran und kann verwirren.',
  irontail:'Harter Schweifhieb nach vorn UND hinten, senkt die Verteidigung.',
  crunch:'Kräftiger Knirscher, zerbeißt Schutzschild und Schutzschirme, senkt die Verteidigung.',
  steelwing:'Stählerner Flügel: lenkt gegnerische Geschosse vor dir zurück.',
  cinderbite:'Glühender Biss, kann verbrennen – setzt den Boden unter dem Ziel in Brand.',
  dynamopunch:'Explosive Faust: zerstört Geschosse in der Nähe, kann verwirren.',
  geowurf:'Packt das Ziel und schleudert es weit weg – gegen Hindernisse doppelt hart.',
  bump:'Rempelt den Gegner weg – gegen Hindernisse oder den Rand gibt es einen Wandaufprall.'});
// longer reach for the vine whip, a wider landing for the sky slam
{const _sp=shotParams0;shotParams0=function(mid){const r=_sp(mid);if(mid==='vinelash'&&r&&r.mel)return Object.assign({},r,{life:r.life*2,r:12});if(mid==='skyslam'&&r&&r.mel)return Object.assign({},r,{r:18});return r}}

// ---- Angreifer-Seite: Bewegungen und Effekte beim Auslösen ----
function rwDir(F){let dx,dy;if(F===B.me&&!B.tb&&typeof myAim==='function'){const a=myAim();dx=a.x;dy=a.y}else{const T=F===B.me?B.foe:B.me;dx=T.x-F.x;dy=T.y-F.y}const L=Math.hypot(dx,dy)||1;return[dx/L,dy/L]}
function rwFoeOf(F){return F===B.me?B.foe:B.me}
function rwEnemyShots(F,R,front){const[ux,uy]=rwDir(F);return(B.shots||[]).filter(b=>!b.dead&&b.side!==F.side&&!b.nm&&!b.cap&&!b.mel&&Math.hypot(b.x-F.x,b.y-(F.y-12))<R&&(!front||((b.x-F.x)*ux+(b.y-F.y+12)*uy)>-6))}
{const _f=fire;fire=function(F,i,remote){
  const mid=act(F)&&act(F).m[i];const local=F&&F.ctrl!=='remote'&&!remote&&B&&!B.tb;const n0=B?B.shots.length:0;const cd0=F&&F.cd?F.cd[i]:1;
  const ready=local&&mid&&cd0<=0&&!(F.faint>0)&&!F.out&&!(F.st.stun>0)&&!(F.st.sleep>0)&&!(F.hitstun>0)&&!F.rq&&!airBusy(F)&&(F.ap??AP_MAX)>=apCost(mid);let pre=null;
  if(ready&&MOVES[mid]&&MOVES[mid].k==='melee'){const T=rwFoeOf(F),[ux,uy]=rwDir(F);
    if(mid==='headrush'||mid==='divebomb'){const d=Math.hypot(T.x-F.x,T.y-F.y);const step=Math.min(mid==='headrush'?36:64,Math.max(0,d-22));pre={x:F.x,y:F.y};F.x+=ux*step;F.y+=uy*step;arenaClamp(F);
      if(mid==='headrush'){obsPush(F);for(const o of B.obs||[])if(!o.dead&&(o.mat||o.kind)==='plant'&&Math.hypot(o.x-F.x,o.y-F.y)<o.r+16)breakObs(o)}else F.inv=Math.max(F.inv||0,0.35);
      burst(pre.x,pre.y-6,'#e8eef4',6)}}
  const r=_f.apply(this,arguments);
  if(!ready||!B||B.shots.length===n0&&!(F.cd&&F.cd[i]>0))return r;
  const mv=MOVES[mid];if(!mv||mv.k!=='melee')return r;const T=rwFoeOf(F),[ux,uy]=rwDir(F),now=performance.now();
  try{
    if(mid==='tempohieb'&&Math.hypot(T.x-F.x,T.y-F.y)<74){F.x=T.x+ux*26;F.y=T.y+uy*20;arenaClamp(F);obsPush(F);F.inv=Math.max(F.inv||0,0.25);F.face=-F.face;burst(F.x,F.y-8,'#ffffff',8)}
    if(mid==='irontail'){const s=B.shots.slice(n0).find(q=>q.mel);if(s)B.shots.push(Object.assign({},s,{id:s.id+'b',vx:-s.vx,vy:-s.vy,x:F.x-(s.x-F.x),y:s.y,pb:0}))}
    if(mid==='wingattack'){const L=rwEnemyShots(F,70,true);for(const b of L){b.dead=1;burst(b.x,b.y,'#e8f4ff',5)}if(L.length)say(`${SPECIES[act(F).s].n} fegt ${L.length} Geschoss${L.length>1?'e':''} weg!`)}
    if(mid==='steelwing'){const L=rwEnemyShots(F,70,true);for(const b of L){b.side=F.side;b.vx=-b.vx;b.vy=-b.vy;b.att=act(F);b.rm=0;b.pb=0;burst(b.x,b.y,'#c8ccd8',5)}if(L.length){say(`${SPECIES[act(F).s].n} lenkt ${L.length} Geschoss${L.length>1?'e':''} zurück!`);comboShow(F,'parade',1)}}
    if(mid==='dynamopunch'){const L=rwEnemyShots(F,56,false);for(const b of L){b.dead=1;burst(b.x,b.y,'#ffcb3d',5)}shockwave(F.x+ux*20,F.y-10+uy*14,34,'#ffcb3d',0.3);B.shakeUntil=now+120}
    if(mid==='skyslam')shockwave(F.x+ux*24,F.y+uy*16,46,'#e8f4ff',0.35);
    if(mid==='quakestomp'){for(const o of B.obs||[]){if(o.dead)continue;const dx=o.x-F.x,dy=o.y-F.y,al=dx*ux+dy*uy;if(al>0&&al<130&&Math.abs(dx*uy-dy*ux)<22)hitObs(o,{mid,side:F.side})}
      for(const h of B.haz||[]){const dx=h.x-F.x,dy=h.y-F.y,al=dx*ux+dy*uy;if((h.k==='puddle'||h.k==='zap')&&al>0&&al<130&&Math.abs(dx*uy-dy*ux)<26){h.until=now;burst(h.x,h.y,'#a07848',6)}}
      for(let k=1;k<=8;k++)B.parts.push({x:F.x+ux*k*15,y:F.y+uy*k*11,vx:0,vy:-12,life:0.3+k*0.04,age:0,c:'#6a5038'})}
    if(mid==='dreifachkick'){const o=(B.obs||[]).find(o=>!o.dead&&!o.ind&&Math.hypot(o.x-F.x,o.y-F.y)<o.r+30&&((o.x-F.x)*ux+(o.y-F.y)*uy)>0);
      if(o){hitObs(o,{mid,side:F.side});const tx=T.x-o.x,ty=T.y-12-(o.y-8),tl=Math.hypot(tx,ty)||1;
        for(let k=0;k<3;k++){const w=(k-1)*0.14,c=Math.cos(w),sn=Math.sin(w),vx=(tx/tl*c-ty/tl*sn)*260,vy=(tx/tl*sn+ty/tl*c)*260;
          B.shots.push({id:'kk'+Math.random().toString(36).slice(2,8),side:F.side,att:act(F),mid:'rocktoss',x:o.x,y:o.y-8,vx,vy,age:0,life:0.9,r:4,p:22,am:1})}
        say(`${SPECIES[act(F).s].n} kickt Brocken los!`)}}
  }catch(e){console.error(e)}
  return r}}

// ---- Treffer-Seite: Kombos, Feldregeln, neue Nahkampf-Effekte ----
function rwWallCheck(T,x0,y0,s,d){if(!T||T.ctrl==='remote'||!(d>0))return;const mv=MOVES[s.mid]||{};const kb=s.kb!=null?s.kb:mv.fx==='knock'?16:0;if(kb<12)return;
  const L=Math.hypot(s.vx||0,s.vy||0)||1,ux=(s.vx||0)/L,uy=(s.vy||0)/L,ex=x0+ux*kb,ey=y0+uy*kb*0.8;const clamped=Math.hypot(ex-T.x,ey-T.y)>3;
  const ob=(B.obs||[]).find(o=>!o.dead&&Math.hypot(T.x-o.x,(T.y-o.y)*1.2)<o.r+12&&((o.x-T.x)*ux+(o.y-T.y)*uy)>-4);
  if(!clamped&&!ob)return;const now=performance.now();if(T.wallT&&now-T.wallT<500)return;T.wallT=now;
  const mul=(s.mid==='geowurf'||s.mid==='headrush')?1:0.5,ex2=Math.max(1,Math.round(d*mul));dealDamage(T,ex2,'#ffcb3d','-'+ex2);T.st.stun=Math.max(T.st.stun,0.4);
  if(ob)hitObs(ob,{mid:s.mid,side:s.side});B.shakeUntil=now+160;burst(T.x,T.y-10,'#ffffff',10);shockwave(T.x,T.y-6,22,'#ffffff',0.25);comboShow(T,'wand',1)}
{const _hl=hitLocal;hitLocal=function(T,s){const mv=MOVES[s&&s.mid];if(!mv||!T||!T.st||!B)return _hl.apply(this,arguments);
  const now=performance.now(),st=T.st;let f=1;const after=[];const A=sideF(s.side);
  if(mv.t==='fire'&&T.frz>now){f*=1.3;after.push(()=>{T.frz=0;st.stun=0;steamPuff(T.x,T.y-8);comboShow(T,'tau',1)})}
  if(mv.t==='ice'&&st.wet>0&&!(T.frz>now))after.push(()=>{T.frz=now+1000;st.stun=Math.max(st.stun,1);st.wet=0;burst(T.x,T.y-12,'#c8f0ff',14);comboShow(T,'frost',1)});
  if(mv.t==='fighting'&&st.conf>0){f*=1.3;after.push(()=>comboShow(T,'ausz',1))}
  if(s.rm&&T.heldT>now&&B.mode==='coop'){f*=1.3;after.push(()=>comboShow(T,'fest',1))}
  if(s.mid==='karateschlag'&&(st.stun>0||st.sleep>0))f*=2;
  if(s.mid==='gegenschlag2'&&A&&A.hurtT&&now-A.hurtT<500){f*=3;after.push(()=>comboShow(T,'parade',1))}
  if(s.mid==='furyswipes'){T.fuN=(T.fuT&&now-T.fuT<450)?(T.fuN||0)+1:0;T.fuT=now;f*=1+0.15*T.fuN;if(T.fuN===3)after.push(()=>comboShow(T,'fury',1))}
  // drill beak and crunch go through protection
  let keep=null;if(s.mid==='drillpeck'||s.mid==='crunch'){keep={sh:st.shield,pr:T.prot};st.shield=0;T.prot=0}
  const kx=KNOCK_X[s.mid];const s2=Object.assign({},s,f!==1?{p:(s.p||mv.p||0)*f}:{},kx!=null?{kb:kx}:{});const x0=T.x,y0=T.y;
  const d=_hl.call(this,T,s2);
  if(keep&&s.mid==='drillpeck'){st.shield=keep.sh;T.prot=keep.pr}
  if(d>0){for(const a of after)a();
    rwWallCheck(T,x0,y0,s2,d);
    if(s.mid==='scratch'){T.scrN=(T.scrT&&now-T.scrT<3000)?(T.scrN||0)+1:1;T.scrT=now;if(T.scrN>=6){T.scrN=0;applyStages(T,{d:-1});comboShow(T,'kratz',1)}}
    if(s.mid==='quickjab'){let n=0;for(const b of B.shots)if(b.side===T.side&&!b.dead&&((b.k==='beam'&&!b.fired)||b.k==='focus')){b.dead=1;n++}if(n)comboShow(T,'unterbr',1)}
    if(s.mid==='noodlelash'){st.root=Math.max(st.root||0,1.2);T.heldT=now+1200}
    if(s.mid==='biss'){st.root=Math.max(st.root||0,0.8);T.heldT=now+800}
    if(s.mid==='canewhack'){st.slow=0;st.stun=Math.max(st.stun,0.6);say(`${SPECIES[act(T).s].n} stolpert!`)}
    if(s.mid==='crunch'){if(keep&&(keep.sh>0||keep.pr>now))say('Der Schutz ist durchgebissen!')}
    if(s.mid==='whirl'&&A&&T.ctrl!=='remote'){const dx=A.x-T.x,dy=A.y-T.y,L=Math.hypot(dx,dy)||1;if(L>30){T.x+=dx/L*Math.min(20,L-28);T.y+=dy/L*Math.min(14,L-28);arenaClamp(T)}}
    if(s.mid==='cinderbite'&&typeof hazPush==='function')hazPush({k:'fire',x:T.x,y:T.y+2,r:11,t0:now,until:now+2600,seed:Math.floor(Math.random()*1e6)})}
  else if(keep&&s.mid==='crunch'){st.shield=keep.sh;T.prot=keep.pr}
  return d}}
// ---- Splitterhagel + Hindernis-Schaden der Brecher ----
{const _ho=hitObs;hitObs=function(o,s){if(o&&s&&!o.dead){o.lastSide=s.side;o.lastMid=s.mid;const x=OBS_X[s.mid];if(x&&!o.ind){const before=o.hp;_ho.apply(this,arguments);if(!o.dead&&o.hp<before){o.hp-=(before-o.hp)*(x-1);if(o.hp<=0)breakObs(o)}return}}return _ho.apply(this,arguments)}}
{const _bo=breakObs;breakObs=function(o){const was=o&&o.dead;_bo.apply(this,arguments);if(was||!B||!o||!o.lastSide)return;const m=o.mat||(o.kind==='rock'?'rock':'plant');if(m==='plant')return;
  for(let i=0;i<14;i++){const a=Math.random()*6.283,sp=90+Math.random()*90;B.parts.push({x:o.x,y:o.y-8,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*0.7,life:0.35+Math.random()*0.2,age:0,c:m==='rock'?'#9aa0a6':'#a0703a'})}
  for(const F of[B.me,B.foe].concat(B.allies||[])){if(!F||F.side===o.lastSide||F.ctrl==='remote'||F.out||F.faint>0||F.inv>0)continue;if(Math.hypot(F.x-o.x,(F.y-o.y)*1.2)>48)continue;
    const d=Math.max(1,Math.round(act(F).mhp*0.07));dealDamage(F,d,'#e8e8e8','-'+d);comboShow(F,'splitter',1)}}}
// ---- Eisblock über eingefrorenen Monstern ----
{const _de=drawArenaEv;drawArenaEv=function(c,now,top){const r=_de.apply(this,arguments);if(!top||!B)return r;
  for(const F of[B.me,B.foe].concat(B.allies||[])){if(!F||!(F.frz>now)||F.out)continue;const X=Math.round(F.x),Y=Math.round(F.y),k=Math.min(1,(F.frz-now)/250);c.save();c.globalAlpha=0.55*k;
    c.fillStyle='#bfe8ff';c.fillRect(X-15,Y-34,30,34);c.globalAlpha=0.9*k;c.fillStyle='#ffffff';c.fillRect(X-13,Y-32,3,12);c.fillRect(X+8,Y-30,2,8);c.fillStyle='#7ec8f0';c.fillRect(X-15,Y-34,30,2);c.fillRect(X-15,Y-2,30,2);c.fillRect(X-15,Y-34,2,34);c.fillRect(X+13,Y-34,2,34);c.restore()}
  return r}}
