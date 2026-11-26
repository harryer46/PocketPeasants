/* ===================== CAVES + GEAR =====================
   Two cave systems in the second underground band (rows MH+66..): the Speichengrotte (mid game, Lv 36–42) hides the
   bicycle, the Sprungschacht (late game, Lv 64–70) the jump boots. Entrances are cut into a cliff/forest edge next to
   a road near the given spot; inside: rooms in a snake, rubble with wild monsters, cave explorers, and at the end an
   NPC who hands over the gear. Works in every running game (free play and lobby training), progress per run (RUN.gear). */
const CAVES=[
  {id:'bike',gear:'bike',n:'Speichengrotte',near:[30,74],lv:[36,42],x0:3,giver:'Höhlenforscherin Speiche',c:'#2f7a5a',
    lines:['Na, auch hier unten? Ich erkunde die Grotte – mit dem Rad, versteht sich.','Für die Höhle ist es zu holprig, aber oben auf den Wegen bist du damit doppelt so schnell.','Nimm mein Ersatzrad. Mit der Taste B (oder im Team-Menü) steigst du auf und ab. Gute Fahrt!']},
  {id:'boots',gear:'boots',n:'Sprungschacht',near:[257,36],lv:[64,70],x0:153,giver:'Bergwacht-Ausbilder Satz',c:'#8a5a2a',
    lines:['Respekt, bis hierher hat es kaum einer geschafft.','Bei der Bergwacht springen wir über alles, was im Weg steht: Büsche, Felsen, Bäche, Stufen.','Hier, meine alten Springstiefel. Lauf kurz gegen ein niedriges Hindernis – dann springst du einfach drüber!']}];
const GEAR={bike:{n:'Fahrrad',i:'🚲',d:'Doppelt so schnell unterwegs (Taste B). Nicht in Höhlen, nicht beim Surfen oder Fliegen.'},
  boots:{n:'Springstiefel',i:'👢',d:'Lauf kurz gegen ein niedriges Hindernis (Baum, Busch, Fels, schmaler Bach, Stufe) und spring drüber.'}};
const JUMP_T=new Set([2,3,16,31,32,33,34,35]);
function hasGear(k){try{return!!(RUN&&RUN.gear&&RUN.gear[k])}catch(e){return false}}
function caveAt(x,y){if(y<MH)return null;return CAVES.find(c=>c.y0!=null&&x>=c.x0&&x<c.x0+c.w&&y>=c.y0&&y<c.y0+c.h)||null}
function caveDoor(x,y){return CAVES.find(c=>c.ex===x&&c.ey===y)||null}
// door: a cliff/tree tile with solid left/right/top and free ground below that leads to a road within a few steps
function caveFindDoor(cx,cy){let best=null,bs=1e9;const bad=[3,4,7,12,13,22,23,27,T_CAVE,T_WF];
  const roadNear=(x,y)=>{const seen=new Set([x+','+y]);let q=[[x,y]];for(let k=0;k<=6;k++){const nq=[];for(const[a,b]of q){if(tget(a,b)===4)return k;
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=a+dx,Y=b+dy,key=X+','+Y;if(seen.has(key)||Y>=MH||!WALK0.has(tget(X,Y))||tget(X,Y)===3)continue;seen.add(key);nq.push([X,Y])}}q=nq}return 99};
  for(let y=cy-20;y<=cy+20;y++)for(let x=cx-20;x<=cx+20;x++){if(x<3||y<3||x>=MW-3||y>=MH-4)continue;
    if(![2,16,31].includes(tget(x,y))||WALK0.has(tget(x-1,y))||WALK0.has(tget(x+1,y))||WALK0.has(tget(x,y-1)))continue;
    const b=tget(x,y+1);if(!WALK0.has(b)||bad.includes(b)||ENC.has(b)||LEDGE_DIR[b])continue;
    if(SIGNSET.has((y+1)*MW+x)||fieldAt(x,y+1)||TRAINERS.some(q=>Math.abs(q.x-x)+Math.abs(q.y-y)<3)||LEGENDS.some(L=>Math.abs(L.x-x)+Math.abs(L.y-y)<4))continue;
    const rd=roadNear(x,y+1);if(rd>5)continue;const sc=Math.hypot(x-cx,y-cy)+rd*2;if(sc<bs){bs=sc;best={x,y}}}
  return best}
(function genCaves(){
  CAVES.forEach((cv,i)=>{const d=caveFindDoor(cv.near[0],cv.near[1]);if(!d)return;cv.ex=d.x;cv.ey=d.y;tset(d.x,d.y,T_CAVE);
    const b=BIOME[(d.y+1)*MW+d.x]||1;cv.b=b;const r=mulberry32(9100+i*53),ri=n=>Math.floor(r()*n);
    cv.y0=MH+66;cv.h=58;cv.w=144;const FL=29,EN=19;   // sandy cave floor; the desert look (BIOME 7) is only cosmetic, wild monsters come from cv.b
    for(let y=cv.y0;y<cv.y0+cv.h;y++)for(let x=cv.x0;x<cv.x0+cv.w;x++){tset(x,y,r()<0.1?31:16);BIOME[y*MW+x]=7}
    const C=4,R=3,cw=Math.floor((cv.w-2)/C),ch=Math.floor((cv.h-2)/R),rooms=[];
    for(let ry=0;ry<R;ry++)for(let rx=0;rx<C;rx++){const w=10+ri(Math.max(1,cw-16)),h=7+ri(Math.max(1,ch-11));const x=cv.x0+1+rx*cw+1+ri(Math.max(1,cw-w-2)),y=cv.y0+1+ry*ch+1+ri(Math.max(1,ch-h-2));rooms[ry*C+rx]={x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)}}
    // snake: bottom row left→right, middle row right→left, top row left→right
    // v0.125: two different growths – the Speichengrotte snakes through wide galleries, the Sprungschacht climbs in columns through narrow cracks
    const ORG=[{o:[8,9,10,11,7,6,5,4,0,1,2,3],amp:1,w:2,wob:0.3,mo:3},{o:[8,4,0,1,5,9,10,6,2,3,7,11],amp:1.4,w:1,wob:0.5,mo:2}][i%2];
    const order=ORG.o.map(k=>rooms[k]);cv.rooms=order;
    const inC=(x,y)=>x>cv.x0&&x<cv.x0+cv.w-1&&y>cv.y0&&y<cv.y0+cv.h-1,floor=(x,y)=>{if(inC(x,y))tset(x,y,FL)};
    for(const Q of order)orgBlob(Q,r,floor,{amp:ORG.amp});
    const lineH=(x0,x1,y)=>{for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++){floor(x,y);floor(x,y+1)}},lineV=(y0,y1,x)=>{for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++){floor(x,y);floor(x+1,y)}};
    for(let k=1;k<order.length;k++){const a=order[k-1],c=order[k];orgTunnel(a.cx,a.cy,c.cx,c.cy,r,floor,{w:ORG.w,wob:ORG.wob,maxOff:ORG.mo})}
    // rubble with wild monsters (never on the room centre, so the way through stays free)
    for(let k=1;k<order.length-1;k++){const Q=order[k];for(let n=0;n<2;n++){const px=Q.x+1+ri(Math.max(1,Q.w-2)),py=Q.y+1+ri(Math.max(1,Q.h-2)),rr=2+ri(2);
      for(let y=py-rr;y<=py+rr;y++)for(let x=px-rr-1;x<=px+rr+1;x++)if(x>Q.x&&x<Q.x+Q.w-1&&y>Q.y&&y<Q.y+Q.h-1&&tget(x,y)===FL&&((x-px)/(rr+1))**2+((y-py)/rr)**2<=1&&!(Math.abs(x-Q.cx)<=1&&Math.abs(y-Q.cy)<=1))tset(x,y,EN)}}
    // way out: a hole in the bottom wall of the first room
    const S=order[0];for(let y=S.cy;y<S.y+S.h;y++)floor(S.cx,y);cv.sx=S.cx;cv.sy=S.y+S.h-1;tset(S.cx,S.y+S.h,T_CAVE);tset(cv.sx,cv.sy,FL);
    // the gear giver in the last room
    const Gr=order[order.length-1];for(let y=Gr.cy-1;y<=Gr.cy+1;y++)for(let x=Gr.cx-1;x<=Gr.cx+1;x++)tset(x,y,FL);
    TRAINERS.push({id:'gift_'+cv.id,gift:cv.gear,cave:cv.id,n:cv.giver,c:cv.c,x:Gr.cx,y:Gr.cy,d:'down',team:[],reward:0,line:'',after:''});
    // three cave explorers on the way (fixed teams from the area's wild pool)
    let pool=[];try{pool=(poolOf(BKEYS[b])||[]).filter(s=>SPECIES[s]&&RAR[s]!=='legendary')}catch(e){}
    const NM=[['Höhlenforscher Stalagmit','Höhlenforscherin Tropf','Geologe Kiesel'],['Bergwächterin Steilwand','Kletterer Überhang','Speläologin Finsternis']][i];
    [3,6,9].forEach((k,j)=>{const Q=order[k];let s=null;for(let rr=0;rr<6&&!s;rr++)for(let dy=-rr;dy<=rr&&!s;dy++)for(let dx=-rr;dx<=rr&&!s;dx++){const x=Q.cx+dx,y=Q.cy+dy;
        if(tget(x,y)===FL&&tget(x-1,y)===FL&&tget(x+1,y)===FL&&tget(x,y-1)===FL&&tget(x,y+1)===FL&&!TRAINERS.some(t=>t.x===x&&t.y===y))s={x,y}}
      if(!s)return;const n=2+j;TRAINERS.push({id:'cave_'+cv.id+'_'+j,n:NM[j],x:s.x,y:s.y,d:['down','left','right'][j],c:['#5a4a3a','#3a4a5a','#4a3a5a'][j],fixed:true,
        team:Array.from({length:n},(_,q)=>[pool.length?pool[(i*7+j*5+q*3)%pool.length]:'owigon',cv.lv[0]+j*2+q]),reward:4+j,line:'Psst! Hier unten hallt jeder Kampf doppelt!',after:'Pass auf, wo du hintrittst.'})});
    // a little sign beside the entrance
    for(const dx of[1,-1,2,-2]){const x=d.x+dx,y=d.y+1,t=tget(x,y);if(!WALK0.has(t)||[3,4,27,13,7,12,22,23].includes(t)||ENC.has(t)||SIGNSET.has(y*MW+x)||TRAINERS.some(q=>q.x===x&&q.y===y))continue;
      SIGNSET.add(y*MW+x);SIGNS.push({x,y,kind:'cave',cave:cv.id});break}
  });
})();
// signs, levels
{const _ss=signShort;signShort=function(sg){if(sg.kind==='cave'){const cv=CAVES.find(c=>c.id===sg.cave);return`🕳 ${cv.n} · Lv ${cv.lv[0]}–${cv.lv[1]}`}return _ss(sg)}}
{const _st=signText;signText=function(sg){if(sg.kind==='cave'){const cv=CAVES.find(c=>c.id===sg.cave);return`<b>🕳 ${esc(cv.n.toUpperCase())}</b> · wilde Monster Lv ${cv.lv[0]}–${cv.lv[1]}<br>Ein verzweigtes Höhlensystem. Ganz hinten soll jemand mit ${GEAR[cv.gear].i} warten…`}return _st(sg)}}
{const _z=zoneAt;zoneAt=function(x,y){const cv=caveAt(x,y);if(cv)return BKEYS[cv.b];return _z(x,y)}}
{const _uh=updateHud;updateHud=function(){_uh.apply(this,arguments);try{if(P.y<MH)return;const cv=caveAt(P.x,P.y),dg=cv?null:dungeonAt(P.x,P.y);if(cv||dg)$('#hzone').textContent='🕳 '+(cv||dg).n}catch(e){}}}
{const _sl=storyLv;storyLv=function(x,y){const cv=caveAt(x,y);if(cv)return cv.lv[0]+((x*7+y*13)%(cv.lv[1]-cv.lv[0]+1));return _sl(x,y)}}
// doors
{const _oa=onArrive;onArrive=function(){_oa();if(P.bike&&(P.surf||P.fly||P.y>=MH))bikeOff(true);if(P.fly||B||P.lock)return;if(tget(P.x,P.y)!==T_CAVE)return;
  if(P.y<MH){const cv=caveDoor(P.x,P.y);if(!cv)return;if(!RUN||RUN.phase!=='train'){toast(`🕳 ${cv.n} – nur im laufenden Spiel begehbar.`);return}
    P.lock=true;bikeOff(true);transition('fade',()=>{teleport(cv.sx,cv.sy);P.d='up';P.lock=false;toast(`🕳 ${cv.n} – wilde Monster Lv ${cv.lv[0]}–${cv.lv[1]}`)},300,350)}
  else{const cv=caveAt(P.x,P.y);if(!cv)return;P.lock=true;transition('fade',()=>{teleport(cv.ex,cv.ey+1);P.d='down';P.lock=false;toast('☀ Zurück an der frischen Luft.')},300,350)}}}
// the gear givers
function giftTalk(t){if(!RUN||RUN.phase!=='train'){toast(`${t.n}: „Komm wieder, wenn dein Spiel begonnen hat!“`);return}const g=GEAR[t.gift],cv=CAVES.find(c=>c.id===t.cave);
  if(hasGear(t.gift)){talk(t.n,t.gift==='bike'?'Na, wie fährt es sich? Mit B steigst du auf und ab.':'Die Stiefel stehen dir! Einfach kurz gegen ein niedriges Hindernis laufen – und hopp.');return}
  P.lock=true;held.length=0;talkChain(t.n,cv?cv.lines:[''],()=>{P.lock=false;RUN.gear=RUN.gear||{};RUN.gear[t.gift]=1;save();toast(`${g.i} ${g.n} erhalten!`);sysChat(`${g.i} ${g.n} erhalten: ${g.d}`);try{renderTeam()}catch(e){}})}
{const _b=bump;bump=function(nx,ny){const t=trainerAt(nx,ny);if(t&&t.gift){if(P.bumpCd>0)return;P.bumpCd=0.5;giftTalk(t);return}return _b(nx,ny)}}
// ---- bicycle: twice as fast on land above ground
function canBike(){return hasGear('bike')&&!P.fly&&!P.surf&&P.y<MH&&!B&&!!RUN&&RUN.phase==='train'}
function toggleBike(){if(!hasGear('bike')){toast('Du hast noch kein Fahrrad – angeblich wartet eins in der Speichengrotte.');return}if(P.bike){bikeOff();return}
  if(!canBike()){toast(P.y>=MH?'In der Höhle wird das Rad geschoben.':P.surf||P.fly?'Erst landen bzw. an Land gehen.':'Hier kannst du nicht Rad fahren.');return}
  P.bike=true;pres({bk:1});toast('🚲 Aufgestiegen – doppelt so schnell! (B zum Absteigen)');gearBtn()}
function bikeOff(quiet){if(!P.bike)return;P.bike=false;pres({bk:0});if(!quiet)toast('🚶 Abgestiegen.');gearBtn()}
function gearBtn(){const b=document.querySelector('[data-gear="bike"]');if(b)b.textContent=P.bike?'🚶 ABSTEIGEN':'🚲 FAHRRAD'}
{const _tf=toggleFly;toggleFly=function(){if(!P.fly)bikeOff(true);return _tf.apply(this,arguments)}}
{const _tp=teleport;teleport=function(x,y){if(y>=MH)bikeOff(true);return _tp.apply(this,arguments)}}
// pixel bicycle under the rider (same 1-px coarseness as the character sprites)
function drawBiker(c,e,X,Y){const side=e.d==='left'||e.d==='right',fl=e.d==='left',ped=e.mv?(Math.floor((e.ph||0)/STEP*4)%2):0;
  const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(fl?X+16-x-w:X+x,Y+y,w,h)};
  const wheel=(x,y)=>{R(x+1,y,4,1,'#14141f');R(x+1,y+5,4,1,'#14141f');R(x,y+1,1,4,'#14141f');R(x+5,y+1,1,4,'#14141f');R(x+2,y+2,2,2,'#9aa1bd')};
  if(side){wheel(0,9);wheel(10,9);R(3,11,9,1,'#c8323c');R(5,8,7,1,'#c8323c');R(5,8,1,4,'#c8323c');R(12,6,1,5,'#c8323c');R(4,7,3,1,'#14141f');R(11,5,3,1,'#14141f');
    c.drawImage(charSprite(e.col,e.d,0,e.sx),0,0,16,15,X,Y-7,16,15);R(ped?6:7,ped?10:12,2,1,'#14141f')}
  else{const back=e.d==='up';if(!back){R(2,6,12,1,'#14141f');R(1,6,2,2,'#2a2a3a');R(13,6,2,2,'#2a2a3a')}
    c.drawImage(charSprite(e.col,e.d,0,e.sx),0,0,16,15,X,Y-7,16,15);
    R(7,8,2,3,'#c8323c');R(7,10,2,6,'#14141f');R(7,11,2,1,'#9aa1bd');R(ped?4:10,11,2,1,'#14141f');if(back){R(2,6,12,1,'#14141f');R(1,6,2,2,'#2a2a3a');R(13,6,2,2,'#2a2a3a')}}}
// ---- jump boots: push briefly against a low obstacle and hop over it (above ground, landing must be free)
function bootJump(d,dx,dy,nx,ny){if(!hasGear('boots')||P.surf||P.fly||P.y>=MH||ny>=MH)return false;
  const t=tget(nx,ny);if(!(JUMP_T.has(t)||fieldAt(nx,ny)))return false;if(SIGNSET.has(ny*MW+nx)||trainerAt(nx,ny)||LEGENDS.some(L=>L.x===nx&&L.y===ny)||tollAt(nx,ny))return false;
  const jx=nx+dx,jy=ny+dy;if(jy>=MH||!walkable(jx,jy)||tget(jx,jy)===3||tget(jx,jy)===T_WF||trainerAt(jx,jy)||LEGENDS.some(L=>L.x===jx&&L.y===jy)||tollAt(jx,jy))return false;
  const now=performance.now(),k=nx+','+ny;if(P.pushK!==k||now-(P.pushL||0)>150){P.pushK=k;P.pushS=now}P.pushL=now;if(now-P.pushS<220)return true;
  if(tollBlock(jx,jy))return true;
  P.pushK=null;P.moving=true;P.jump=true;P.mt=0;P.sx=P.x;P.sy=P.y;P.tx=jx;P.ty=jy;P.fol.tx=P.x;P.fol.ty=P.y;trailPush(P,P.x,P.y);trailPush(P,nx,ny);pres({x:jx,y:jy,d});return true}
// ---- equipment line in the team panel
{const _rt=renderTeam;renderTeam=function(){_rt.apply(this,arguments);try{if(!G||!RUN)return;const el=$('#pane-team'),st=el&&el.querySelector('.stats');if(!st)return;
  const it=k=>{const g=GEAR[k];if(!hasGear(k))return`<span style="color:var(--muted)" title="${esc(g.d)}">${g.i} ???</span>`;
    return k==='bike'?`<button class="btn ghost" data-gear="bike" title="${esc(g.d)}" style="font-size:14px;padding:3px 8px">${P.bike?'🚶 ABSTEIGEN':'🚲 FAHRRAD'}</button>`:`<span title="${esc(g.d)}">${g.i} ${g.n}</span>`};
  st.insertAdjacentHTML('beforeend',`<div class="stat" style="grid-column:1/-1">Ausrüstung<b style="font-size:16px">${it('bike')} ${it('boots')}</b></div>`);
  const bb=st.querySelector('[data-gear="bike"]');if(bb)bb.onclick=()=>{if(isMob())$('#side').classList.remove('open');toggleBike()}}catch(e){}}}
