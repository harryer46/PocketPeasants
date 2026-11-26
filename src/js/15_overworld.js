/* ===================== OVERWORLD ===================== */
const STEP=0.16;
function modalOpen(){return !!TALK||$('#modal').classList.contains('on')||$('#study').classList.contains('on')||$('#arena').classList.contains('on')||$('#mapov').classList.contains('on')||!!FX}
// FLY (field skill from Axel): take off right on the map – over trees, water and cliffs, twice as fast,
//   no encounters; areas whose teacher you have not passed stay closed in the air too; land only on walkable ground
function flyable(x,y){if(x<2||y<2||x>=MW-2||y>=MH-2)return false;const b=BIOME[y*MW+x];return!(TOLL_LAW[b]&&!tollPaid(b)&&RUN&&RUN.phase==='train')}
function canFly(){return canHM('fly')&&!B&&RUN&&RUN.phase!=='arena'&&P.y<MH}
function toggleFly(){if(!P.fly){if(hasHM('fly')&&!hmUser('fly')){toast(`Zum FLIEGEN brauchst du ein ${hmNeed('fly')} im Kader.`);return}if(!canFly())return;if(P.moving)return;P.fly=true;P.flyT=performance.now();held.length=0;pres({fl:1});rideSync();toast(`🕊 ${SPECIES[hmUser('fly').s].n} trägt dich in die Luft! Landen über Team → Feldfähigkeiten oder Taste F.`);flyBtn();return}
  if(P.moving)return;const x=P.x,y=P.y;if(!walkable(x,y)||trainerAt(x,y)||LEGENDS.some(L=>L.x===x&&L.y===y)||tollAt(x,y)){toast('Hier kannst du nicht landen – such dir freien Boden.');return}
  P.fly=false;P.flyT=performance.now();rideSync();P.fol={x,y,tx:x,ty:y,fx:x,fy:y};trailReset(P,x,y);if(P.fols)for(const f of P.fols){f.fx=f.tx=x;f.fy=f.ty=y}pres({fl:0});save();flyBtn();onArrive()}
function flyBtn(){const b=document.querySelector('[data-hmuse="fly"]');if(b)b.textContent=P.fly?'🛬 LANDEN':HM.fly.i+' '+HM.fly.n}
function rideSid(){try{if(P.fly){const u=hmUser('fly');return u?u.s:null}if(P.surf){const u=hmUser('swim');return u?u.s:null}}catch(e){}return null}
function rideSync(){const r=rideSid();if(r!==P.rdS){P.rdS=r;pres({rd:r})}}
function flyAlt(){const t=(performance.now()-(P.flyT||0))/350;return P.fly?Math.min(1,t):Math.max(0,1-t)}
function updatePlayer(dt){
  if(P.moving){P.mt+=dt/(P.fly?STEP*0.5:P.wf?STEP*3.2:P.jump?STEP*2.2:P.bike?STEP*0.5:STEP);P.ph+=dt;
    if(P.mt>=1){P.moving=false;P.jump=false;P.wf=false;P.x=P.tx;P.y=P.ty;P.fx=P.x;P.fy=P.y;onArrive();if(B)return}
    else{P.fx=P.sx+(P.tx-P.sx)*P.mt;P.fy=P.sy+(P.ty-P.sy)*P.mt}}
  if(!P.moving&&!B&&!modalOpen()&&!P.lock){const d=heldDir();if(d){const turned=P.d!==d;P.d=d;const[dx,dy]=DIRS[d];const nx=P.x+dx,ny=P.y+dy;
    if(P.fly){if(flyable(nx,ny)){P.moving=true;P.mt=0;P.sx=P.x;P.sy=P.y;P.tx=nx;P.ty=ny;pres({x:nx,y:ny,d})}else if(turned)pres({d});else if(P.bumpCd<=0){P.bumpCd=1.2;const b=BIOME[ny*MW+nx];if(TOLL_LAW[b])toast('Dieses Gebiet ist noch gesperrt – erst am Prof. vorbei, dann darfst du es überfliegen.')}}
    else if(LEDGE_DIR[tget(nx,ny)]){const jx=nx+dx,jy=ny+dy;if(LEDGE_DIR[tget(nx,ny)]===d&&walkable(jx,jy)&&!trainerAt(jx,jy)&&!LEGENDS.some(L=>L.x===jx&&L.y===jy)){P.moving=true;P.jump=true;P.mt=0;P.sx=P.x;P.sy=P.y;P.tx=jx;P.ty=jy;P.fol.tx=P.x;P.fol.ty=P.y;trailPush(P,P.x,P.y);trailPush(P,nx,ny);pres({x:jx,y:jy,d})}else if(!bootJump(d,dx,dy,nx,ny)&&turned)pres({d})}
    else if(tget(nx,ny)===T_WF||(d==='up'&&tget(nx,ny)===3&&tget(P.x,P.y)===T_WF)){wfMove(d,dx,dy,nx,ny,turned)}
    else if(walkable(nx,ny)&&!trainerAt(nx,ny)&&!LEGENDS.some(L=>L.x===nx&&L.y===ny)&&!tollBlock(nx,ny)){P.moving=true;P.mt=0;P.sx=P.x;P.sy=P.y;P.tx=nx;P.ty=ny;P.fol.tx=P.x;P.fol.ty=P.y;trailPush(P,P.x,P.y);pres({x:nx,y:ny,d})}else if(bootJump(d,dx,dy,nx,ny)){}else{if(trainerAt(nx,ny)||LEGENDS.some(L=>L.x===nx&&L.y===ny))bump(nx,ny);else if(tget(nx,ny)===3&&!P.surf)surfAsk();if(turned)pres({d})}}}
  P.bumpCd=Math.max(0,(P.bumpCd||0)-dt);
  {const fd=dt*(P.bike?2:1);approach(P.fol,fd);if(P.fols)for(const f of P.fols)approach(f,fd)}
}
function approach(o,dt){if(o.fx==null){o.fx=o.x;o.fy=o.y}const dx=o.tx-o.fx,dy=o.ty-o.fy,dist=Math.hypot(dx,dy);if(dist>3){o.fx=o.tx;o.fy=o.ty;return}const sp=dt/STEP*1.05;if(dist<=sp){o.fx=o.tx;o.fy=o.ty}else{o.fx+=dx/dist*sp;o.fy+=dy/dist*sp}}
function legendHere(x,y){if(!RUN||RUN.phase!=='train')return null;return LEGENDS.find(L=>L.x===x&&L.y===y&&!(RUN.leg&&RUN.leg[L.id]))||null}
function trainerAt(x,y){return TRAINERS.find(t=>t.x===x&&t.y===y&&(!t.story||storyOn()))||null}
// SURFER: walking towards deep water asks first; leaving the water ends it
function surfAsk(){if(P.bumpCd>0||modalOpen())return;P.bumpCd=0.8;
  if(!hasHM('swim')){toast(`Das Wasser ist tief… ${TRAINERS.find(t=>t.id==='sue').n} hat die Surf-Lizenz.`);return}
  if(!hmUser('swim')){toast(`Zum SURFEN brauchst du ein ${hmNeed('swim')} im Kader.`);return}
  const u=hmUser('swim');openModal(`<h3>🌊 SURFER?</h3><p>Das Wasser ist tief. Soll ${esc(SPECIES[u.s].n)} dich tragen?</p><div class="acts"><button class="btn ghost" id="mno">NEIN</button><button class="btn" id="myes">SURFEN</button></div>`);
  $('#mno').onclick=closeModal;$('#myes').onclick=()=>{closeModal();P.surf=true;held.length=0;toast(`🌊 ${SPECIES[u.s].n} setzt SURFER ein!`)}}
// waterfalls: like a long step – surfing down slides over the whole fall, going up needs WHIRLPOOL
function wfMove(d,dx,dy,nx,ny,turned){const top=tget(P.x,P.y)===3&&tget(nx,ny)===T_WF;
  if(!P.surf){if(P.bumpCd<=0){P.bumpCd=1;toast('Ein Wasserfall! Nur surfend erreichbar.')}return}
  if(d==='down'&&top||d==='down'&&tget(P.x,P.y)===T_WF){let y=ny;while(tget(nx,y)===T_WF)y++;if(tget(nx,y)!==3)return;P.moving=true;P.jump=true;P.wf=true;P.mt=0;P.sx=P.x;P.sy=P.y;P.tx=nx;P.ty=y;P.fol.tx=P.x;P.fol.ty=P.y;trailPush(P,P.x,P.y);pres({x:nx,y,d});return}
  if(d==='up'){if(!canWhirl()){if(P.bumpCd<=0){P.bumpCd=1.2;toast(hasHM('swim')?`Der Wasserfall ist zu steil. Mit WHIRLPOOL (${hmNeed('whirl')}) kommst du hoch.`:'Der Wasserfall ist zu steil.')}return}
    let y=ny;while(tget(nx,y)===T_WF)y--;if(tget(nx,y)!==3)return;const u=hmUser('whirl');if(P.bumpCd<=0){P.bumpCd=1;toast(`🌀 ${SPECIES[u.s].n} setzt WHIRLPOOL ein!`)}
    P.moving=true;P.jump=true;P.wf=true;P.mt=0;P.sx=P.x;P.sy=P.y;P.tx=nx;P.ty=y;P.fol.tx=P.x;P.fol.ty=P.y;trailPush(P,P.x,P.y);pres({x:nx,y,d});return}
  if(turned)pres({d})}
function bump(nx,ny){
  if(P.bumpCd>0)return;P.bumpCd=0.5;
  const fo=fieldAt(nx,ny);if(fo){const k=fo.kind,h=HM[k];if(hasHM(k)&&!hmUser(k)){toast(`Für ${h.n} brauchst du ein ${hmNeed(k)} im Kader.`);return}if(hasHM(k)){FIELDGONE.add(fo.id);for(const f of FIELD)if(f.kind===k&&Math.abs(f.x-fo.x)+Math.abs(f.y-fo.y)<=1)FIELDGONE.add(f.id);toast(`${k==='cut'?'✂':'💪'} ${SPECIES[hmUser(k).s].n} setzt ${h.n} ein — ${k==='cut'?'die Bäume fallen!':'die Felsen rollen weg!'}`)}
    else toast(k==='cut'?`Diese Bäumchen könnte man zerschneiden… ${TRAINERS.find(t=>t.id===h.from).n} weiß, wie.`:`Ein schwerer Felsbrocken… ${TRAINERS.find(t=>t.id===h.from).n} könnte dir STÄRKE beibringen.`);return}
  if(tget(nx,ny)===3&&hasHM('swim')&&!hmUser('swim')){toast(`Zum SURFEN brauchst du ein ${hmNeed('swim')} im Kader.`);return}
  if(tget(nx,ny)===3&&!hasHM('swim')){toast(`Das Wasser ist tief… ${TRAINERS.find(t=>t.id==='sue').n} bringt dir SURFER bei.`);return}
  const sg=SIGNS.find(s=>s.x===nx&&s.y===ny);if(sg){if(!$('#signbox').classList.contains('on'))showSign(sg);return}
  const t=trainerAt(nx,ny);
  if(t&&t.story){storyBump(t);return}
  if(t){if(!RUN||RUN.phase!=='train')toast(`${t.n}: „Komm wieder, wenn dein Spiel begonnen hat!“`);else if(RUN.beat&&RUN.beat[t.id])talk(t.n,t.after);else spotted(t);return}
  const L=LEGENDS.find(L=>L.x===nx&&L.y===ny);
  if(L&&!cfgOf().leg){toast('Der Schrein bleibt in diesem Spiel still.');return}
  if(L){if(!RUN||RUN.phase!=='train')toast('Ein geheimnisvoller Schrein. Hier schläft etwas…');else if(RUN.leg&&RUN.leg[L.id])toast('Der Schrein ist jetzt leer.');else startLegend(L)}
}
function spotted(t){if(P.lock||B)return;P.lock=true;held.length=0;t.alert=performance.now();setTimeout(()=>talk(t.n,t.line,()=>{P.lock=false;if(!B&&RUN&&RUN.phase==='train')startTrainer(t)}),700)}
// dialogue box like the originals: text types itself out; a tap/click anywhere on the screen (or any key) completes it, the next tap closes it
let TALK=null;
function talk(who,text,cb){if(TALK)endTalk(true);const ov=document.createElement('div');ov.id='talkov';ov.innerHTML=`<div id="talkbox"><b>${esc(who)}</b><br><span id="talktx"></span><i id="talkarr">▼</i></div>`;document.body.appendChild(ov);
  {const r=$('#stage').getBoundingClientRect(),bx=$('#talkbox');if(r.width>0){bx.style.left=(r.left+r.width/2)+'px';bx.style.width=Math.min(620,r.width*0.94)+'px';bx.style.bottom=(innerHeight-r.bottom+56)+'px'}}
  held.length=0;const full=text||'';TALK={full,n:0,cb,ov,t:setInterval(()=>{if(!TALK)return;TALK.n=Math.min(full.length,TALK.n+1);$('#talktx').textContent=full.slice(0,TALK.n);if(TALK.n>=full.length)talkDone()},28)};
  ov.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();talkTap()})}
function talkDone(){if(!TALK||TALK.auto)return;clearInterval(TALK.t);$('#talkarr').style.visibility='visible';const T_=TALK;const au=()=>{if(TALK!==T_)return;if(PANIC){T_.auto=setTimeout(au,500);return}endTalk()};T_.auto=setTimeout(au,10000)}
function talkTap(){if(!TALK)return;if(TALK.n<TALK.full.length){TALK.n=TALK.full.length;$('#talktx').textContent=TALK.full;talkDone();return}endTalk()}
function endTalk(silent){const T_=TALK;if(!T_)return;TALK=null;clearInterval(T_.t);clearTimeout(T_.auto);T_.ov.remove();held.length=0;if(!silent&&T_.cb)T_.cb()}
function checkSight(){
  if(!RUN||RUN.phase!=='train')return false;
  for(const t of TRAINERS){if(RUN.beat&&RUN.beat[t.id]||t.story||t.gift)continue;const[dx,dy]=DIRS[t.d];
    for(let k=1;k<=4;k++){const x=t.x+dx*k,y=t.y+dy*k;if(!walkable(x,y))break;if(x===P.x&&y===P.y){spotted(t);return true}}}
  if(typeof tollSight==='function'&&tollSight())return true;
  return false;
}
function teleport(x,y){P.surf=false;if(P.fly){P.fly=false;P.flyT=0;pres({fl:0});flyBtn()}P.x=P.fx=x;P.y=P.fy=y;try{bakeNow()}catch(e){}P.moving=false;P.fol={x,y,tx:x,ty:y};trailReset(P,x,y);G.x=x;G.y=y;pres({x,y,d:P.d})}
function onArrive(){if(P.surf&&tget(P.x,P.y)!==3&&tget(P.x,P.y)!==T_WF){P.surf=false}
  rideSync();
  if(!P.fly){G.x=P.x;G.y=P.y}G.d=P.d;P.steps++;if(P.steps%8===0)save();updateHud();
  if(P.fly){if(BIOME[P.y*MW+P.x]===0&&RUN){const Tn=TOWNS.find(T=>Math.abs(T.x-P.x)<18&&Math.abs(T.y-P.y)<14);if(Tn&&Tn.id!=='vil'&&!(RUN.towns&&RUN.towns[Tn.id])){RUN.towns=RUN.towns||{};RUN.towns[Tn.id]=1;save();toast(`📍 ${Tn.n} entdeckt!`)}}return}
  const t=tget(P.x,P.y);
  if(t===22){if(RUN)openShop();else toast('Copshop — tritt einer Lobby bei oder starte das freie Spiel.')}
  if(t===23){if(RUN)openHfPol();else toast(`${studyBld().n} — tritt einer Lobby bei oder starte das freie Spiel, um zu lernen.`)}
  if(BIOME[P.y*MW+P.x]===0&&RUN){const Tn=TOWNS.find(T=>Math.abs(T.x-P.x)<26&&Math.abs(T.y-P.y)<24);if(Tn){RUN.towns=RUN.towns||{};if(!RUN.towns[Tn.id]){RUN.towns[Tn.id]=1;save();if(Tn.id!=='vil')toast(`📍 ${Tn.n} entdeckt — Schnellreise über die Weltkarte (M) freigeschaltet!`)}}}
  if(t===7&&RUN){const pd=PADS.find(p=>p.x===P.x&&p.y===P.y);if(pd){RUN.lastPad={x:pd.x,y:pd.y+1};save()}}
  if(t===7){if(RUN)healQuiz();else toast('PÄD — tritt einer Lobby bei oder starte das freie Spiel, um ein Team zu bekommen.')}
  if(t===12){if(RUN&&RUN.phase==='lobby')toast('Das Spiel hat noch nicht begonnen — warte auf den Host.');else if(RUN&&RUN.phase==='train'&&!RUN.free)confirmEarlyArena();else if(RUN&&RUN.free)toast('Im Gericht finden Lobby-Turniere statt — erstelle oder betritt eine Lobby!');else toast('Das Gericht — tritt zuerst einer Lobby bei oder erstelle eine!')}
  if(checkSight())return;
  if((ENC.has(t)||t===20)&&RUN&&RUN.phase==='train'){const z=zoneAt(P.x,P.y);if(z&&Math.random()<(t===20?0.16:0.13)*cfgOf().enc)startWild(z)}
}
// PÄD (Polizeiärztlicher Dienst): overview of all your monsters (picture + KP); pick one → a question; every correct answer heals it by 25 %
const PAD_QT=15000;  // every question has a timer
const PAD_HCD=1000;
function healQuiz(){RUN.kap=Math.max(RUN.kap,10);updateHud();for(const m of RUN.box||[])m.hp=stats(m).mhp;  // boxed monsters rest at the PÄD; only the squad is shown
  const all=()=>RUN.team,full=()=>all().every(m=>m.hp>=stats(m).mhp);
  if(full()){toast('PÄD: Dein Team ist gesund. Handschellen aufgefüllt.');save();return}
  const keys=Object.keys(QZ).filter(k=>SPECIES[k]&&QZ[k].length);let n=0,cur=null;const seen=new Set();
  // questions are about the monster being healed (its own paragraph); monsters without one get random ones
  const pickQ=()=>{const own=cur&&qzHas(cur.s)?cur.s:null;if(own){const q=qzPick(own,seen);seen.add(q[0]);return{src:own,q:qReal(q)}}
    for(let t=0;t<40;t++){const k=keys[Math.floor(Math.random()*keys.length)],q=(qFocus()?qwPick:qFreshPick)(QZ[k],seen);if(!seen.has(q[0])){seen.add(q[0]);return{src:k,q:qReal(q)}}}return{src:keys[0],q:qReal(QZ[keys[0]][0])}};
  const img={};const pic=m=>img[m.s]||(img[m.s]=(()=>{const c=mk(48,48),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(monSprite(m.s,24),0,0,48,48);return c.toDataURL()})());
  const card=(m,i,big)=>{const mx=stats(m).mhp,r=m.hp/mx,col=r>0.5?'#3ddc6b':r>0.2?'#ffcb3d':'#ef4444',hurt=m.hp<mx,inT=i<RUN.team.length;
    return`<div class="pcard${hurt?'':' fit'}" ${big?'':`data-pm="${i}"`} style="display:flex;gap:8px;align-items:center;text-align:left;background:#f6f1e1;color:#14141f;border:3px solid #14141f;box-shadow:3px 3px 0 #000;padding:6px 8px;cursor:${hurt&&!big?'pointer':'default'};opacity:${hurt||big?1:0.6};font-family:VT323,monospace;font-size:18px;width:100%;box-sizing:border-box">
      <span style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:none"><img src="${pic(m)}" width="48" height="48" style="image-rendering:pixelated;background:#e8e0c8;border:2px solid #14141f">${big?'':`<button class="btn" data-pbuy="${i}" ${hurt&&money()>=100?'':'disabled'} title="Sofort voll heilen" style="padding:2px 4px;font-size:9px;min-width:0;width:56px">💊 $100</button>`}</span>
      <span style="flex:1;min-width:0"><b>${esc(SPECIES[m.s].n)}</b> <span style="color:#4b4f63">Lv ${m.l}${inT?'':' · Box'}</span><br>
      <span style="display:block;height:8px;background:#2b2f40;border:2px solid #14141f;margin:3px 0"><i style="display:block;height:100%;width:${Math.round(r*100)}%;background:${col}"></i></span>
      <span style="color:#4b4f63">KP ${m.hp}/${mx}${hurt?(m.hp<=0?' · besiegt':''):' · fit ✓'}</span></span></div>`};
  const healCd=()=>{const l=Math.max(0,(healQuiz.cd||0)-Date.now());document.querySelectorAll('[data-ph]').forEach(b=>{const m=all()[+b.dataset.ph];b.disabled=l>0||!m||m.hp>=stats(m).mhp;b.textContent=l>0?`➕ ${Math.ceil(l/1000)} s`:'➕ 10 %'});const hb=$('#cqheal');if(hb){rbtnSet(hb,l,PAD_HCD,'➕','10 %');if(cur&&cur.hp>=stats(cur).mhp)hb.disabled=true}if(l>0&&($('[data-ph]')||hb))setTimeout(healCd,100)};
  const heal5=m=>{if((healQuiz.cd||0)>Date.now()||!m)return false;const mx=stats(m).mhp;if(m.hp>=mx)return false;m.hp=Math.min(mx,m.hp+Math.max(1,Math.round(mx*0.1)));healQuiz.cd=Date.now()+PAD_HCD;renderTeam();return true};
  const bindHeal=()=>{const b=$('#cqheal');if(!b)return;b.onclick=()=>{if(!heal5(cur))return;if(full()){stop();toast('PÄD: Dein Team ist wieder fit!');return}const c0=document.querySelector('#cqbox .pcard');if(c0)c0.outerHTML=card(cur,all().indexOf(cur),true);if(cur.hp>=stats(cur).mhp)toast(`${SPECIES[cur.s].n} ist wieder fit!`);healCd()};healCd()};
  // penalty after a wrong answer: the next question only comes after 5 s
  const penBtns=()=>{const l=Math.max(0,(healQuiz.pen||0)-Date.now());const b=$('#cqnext');if(b){b.disabled=l>0;b.textContent=l>0?`⏳ ${Math.ceil(l/1000)} s`:'NÄCHSTE FRAGE'}document.querySelectorAll('[data-pm]').forEach(c=>{c.style.filter=l>0?'grayscale(1)':''});const t=$('#cqpen');if(t)t.textContent=l>0?`⏳ Strafzeit: noch ${Math.ceil(l/1000)} s`:'';if(l>0)setTimeout(penBtns,200)};
  const overview=()=>{clearInterval(healQuiz.tm);CQ=null;CQ_PICK=null;cur=null;
    $('#cqbox').innerHTML=`<div class="sdlg" style="margin-bottom:8px"><span class="slaw">⚕ PÄD · Polizeiärztlicher Dienst</span><br><span class="small">Wähle ein Monster: Fragen zu seinem Paragraphen. Richtig = voll geheilt, falsch = keine Heilung und 5 Strafsekunden. Unter dem Bild: 💊 sofort voll heilen für $100.</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px">${all().map((m,i)=>`<div>${card(m,i)}</div>`).join('')}</div>
      <div class="small" id="cqpen" style="text-align:center;color:#ffcb3d;min-height:14px"></div><div class="sacts" style="margin-top:8px"><button class="btn ghost" id="cqstop">GEHEN</button></div>`;
    $('#cquiz').classList.add('on');document.querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>{if((healQuiz.pen||0)>Date.now())return;const m=all()[+b.dataset.pm];if(!m||m.hp>=stats(m).mhp)return;cur=m;ask()});penBtns();
    // per monster: full heal for $100 right under its picture
    document.querySelectorAll('[data-pbuy]').forEach(b=>b.onclick=e=>{e.stopPropagation();const m=all()[+b.dataset.pbuy];if(!m||m.hp>=stats(m).mhp)return;if(money()<100){toast('Nicht genug Geld.');return}RUN.money-=100;m.hp=stats(m).mhp;updateHud();renderTeam();toast(`💊 ${SPECIES[m.s].n} ist wieder fit! (−$100)`);if(full()){stop();toast('PÄD: Dein Team ist wieder fit!');return}overview()});
    // manual heal: +10 % without a question, then 1 s cooldown
    const hcd=healCd;
    document.querySelectorAll('[data-ph]').forEach(b=>b.onclick=e=>{e.stopPropagation();const m=all()[+b.dataset.ph];if(!heal5(m))return;toast(`➕ ${SPECIES[m.s].n}: +10 % KP`);if(full()){stop();toast('PÄD: Dein Team ist wieder fit!');return}overview()});hcd();$('#cqstop').onclick=stop};
  const ask=()=>{const it=pickQ(),order=shuffleArr([0,1,2,3]);n++;CQ={it,order,end:Infinity,done:false,cb:null};CQ_PICK=pick;const QT=qTime(it.q);let qEnd=Date.now()+QT;const myQ=CQ;clearInterval(healQuiz.tm);healQuiz.tm=setInterval(()=>{if(CQ!==myQ||myQ.done){clearInterval(healQuiz.tm);return}if(PANIC){qEnd+=100;return}const l=Math.max(0,qEnd-Date.now()),b=$('#cqbar'),t=$('#cqtime');if(b)b.style.width=(l/QT*100)+'%';if(t)t.textContent=Math.ceil(l/1000)+' s';if(l<=0){clearInterval(healQuiz.tm);pick(-1)}},100);
    $('#cqbox').innerHTML=`<div style="margin-bottom:8px">${card(cur,all().indexOf(cur),true)}</div><div class="sdlg"><span class="slaw">⚕ PÄD · Frage ${n} · ${esc(SPECIES[it.src].law||'')}</span><br>${esc(it.q[0])}<div class="cqt"><i id="cqbar"></i></div><div class="small" id="cqtime" style="text-align:right"></div><div id="cqexp"></div></div>
      <div class="qrow"><div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${j+1}</span>${esc(it.q[1][k])}</button>`).join('')}</div></div><div class="sacts" id="cqact"><button class="btn ghost" id="cqback">ÜBERSICHT</button><button class="btn ghost" id="cqstop">GEHEN</button></div>`;
    $('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(bt=>bt.onclick=()=>pick(+bt.dataset.ck));$('#cqstop').onclick=stop;$('#cqback').onclick=overview;bindHeal()};
  const stop=()=>{clearInterval(healQuiz.tm);$('#cquiz').classList.remove('on');CQ=null;CQ_PICK=null;save();renderTeam();updateHud()};
  const pick=k=>{if(!CQ||CQ.done)return;CQ.done=true;clearInterval(healQuiz.tm);const ok=k===0,it=CQ.it,tm=cur;
    document.querySelectorAll('[data-ck]').forEach(bt=>{const kk=+bt.dataset.ck;bt.disabled=true;bt.classList.add(kk===0?'ok':kk===k?'bad':'dim')});
    {const mx=stats(tm).mhp;if(ok)tm.hp=mx}if(!ok)healQuiz.pen=Date.now()+5000;
    const tmFull=tm.hp>=stats(tm).mhp,done=full();renderTeam();
    $('#cqexp').innerHTML=`<div class="sexp ${ok?'ok':'bad'}">${qFb(ok,k,it.q)}</div>`;
    $('#cqact').innerHTML=done?`<button class="btn" id="cqstop">WEITER</button>`:tmFull?`<button class="btn" id="cqback">ÜBERSICHT</button><button class="btn ghost" id="cqstop">GEHEN</button>`:`<button class="btn" id="cqnext">NÄCHSTE FRAGE</button><button class="btn ghost" id="cqback">ÜBERSICHT</button><button class="btn ghost" id="cqstop">GEHEN</button>`;
    if(done){const hb=$('#cqheal');if(hb)hb.remove()}
    const nx=$('#cqnext');if(nx)nx.onclick=ask;penBtns();const bk=$('#cqback');if(bk)bk.onclick=overview;$('#cqstop').onclick=stop};
  overview()}
// respawn after a defeat: in front of the last PÄD you entered (else Villingen)
function padSpawn(){const l=RUN&&RUN.lastPad;if(l&&walkable(l.x,l.y))return l;const p=PADS[0];return p?{x:p.x,y:p.y+1}:VSPAWN}
function healAll(){if(!RUN)return;for(const m of RUN.team.concat(RUN.box))m.hp=stats(m).mhp;RUN.kap=Math.max(RUN.kap,10);save();renderTeam();updateHud()}
function updateHud(){try{flyBtn()}catch(e){}
  const z=zoneAt(P.x,P.y);$('#hzone').textContent=z?ZONES[z].n:'Stadt';
  $('#hkap').innerHTML=RUN?`$${money()} · ${cuffIcon(22)} ${RUN.kap}`:'Kein Team';
  {const R=rosterIds();$('#sdex').textContent=`Dex ${R.filter(s=>G.dex[s]!==undefined).length}/${R.length}`}$('#stro').textContent=`Trophäen ${G.tro}`;
}

/* world render (low-res buffer, scaled up) */
const wcv=$('#world'),wc=wcv.getContext('2d');let SC=3,LW=0,LH=0;
const NT_W=new Map();try{document.fonts&&document.fonts.addEventListener('loadingdone',()=>NT_W.clear())}catch(e){} // text widths of name tags (measureText every frame was a third of the world's script time)
function nameTag(c,x,y,txt,col,icon){
  c.font='8px VT323,monospace';c.textBaseline='alphabetic';let tw=NT_W.get(txt);if(tw==null){tw=Math.ceil(c.measureText(txt).width);if(NT_W.size>400)NT_W.clear();NT_W.set(txt,tw)}const w=tw+9+(icon?6:0);const X=Math.round(x-w/2);
  c.fillStyle='#000000';c.fillRect(X-0.5,y-9.5,w+1,9);c.fillStyle='#14182af0';c.fillRect(X,y-9,w,8);c.fillStyle=col;c.fillRect(X+2,y-6.5,3,3);
  c.fillStyle='#ffffff';c.fillText(txt,X+7,y-2.6);if(icon){c.fillStyle=icon==='⚔'?'#ffcb3d':'#ff6b6b';c.fillText(icon==='⚔'?'!!':'!',X+w-5,y-2.6)}
}
function bubble(c,x,y,txt){
  c.font='8px VT323,monospace';let lines=[],line='';for(const wd of txt.split(' ')){const t=line?line+' '+wd:wd;if(c.measureText(t).width>70&&line){lines.push(line);line=wd}else line=t}if(line)lines.push(line);lines=lines.slice(0,4);
  const w=Math.ceil(Math.max(...lines.map(l=>c.measureText(l).width)))+6,h=lines.length*7+4;const X=Math.round(x-w/2),Y=Math.round(y-h-3);
  c.fillStyle='#14141f';c.fillRect(X-1,Y-1,w+2,h+2);c.fillStyle='#fff';c.fillRect(X,Y,w,h);c.fillRect(Math.round(x)-1,Y+h,3,2);
  c.fillStyle='#14141f';lines.forEach((l,i)=>c.fillText(l,X+3,Y+8+i*7-1));
}
// a flying player: drop shadow on the ground, the officer up in the air on a flapping pair of wings (drawn above trees)
function drawFlyer(c,e,X,Y){const a=e.alt,h=Math.round(a*16),bob=Math.round(Math.sin(T*5)*1.5*a),flap=Math.floor(T*8)%2;
  if(e.ride&&SPECIES[e.ride]){const sw=Math.round(16-a*5);c.fillStyle='rgba(0,0,0,'+(0.38-a*0.12).toFixed(2)+')';c.fillRect(X+8-sw/2,Y+13,sw,2);c.fillRect(X+8-sw/2+1,Y+12,sw-2,1);c.fillRect(X+8-sw/2+1,Y+15,sw-2,1);
    const y0=Y-h+bob,ms=monSprite(e.ride,24),fl=flap?1:0;c.drawImage(ms,X-6,y0-2+fl,28,28);c.drawImage(charSprite(e.col,e.d,0,e.sx),0,0,16,12,X,y0+4+fl,16,12);return}
  const sw=Math.round(12-a*4);c.fillStyle='rgba(0,0,0,'+(0.38-a*0.12).toFixed(2)+')';c.fillRect(X+8-sw/2,Y+13,sw,2);c.fillRect(X+8-sw/2+1,Y+12,sw-2,1);c.fillRect(X+8-sw/2+1,Y+15,sw-2,1);
  const y0=Y-h+bob;c.fillStyle='#14141f';const wy=y0+(flap?5:3),wh=flap?3:5;c.fillRect(X-5,wy,7,wh);c.fillRect(X+14,wy,7,wh);c.fillStyle='#f4f4f8';c.fillRect(X-4,wy+1,5,wh-2);c.fillRect(X+15,wy+1,5,wh-2);c.fillStyle='#c8d0e0';c.fillRect(X-4,wy+wh-2,5,1);c.fillRect(X+15,wy+wh-2,5,1);
  c.drawImage(charSprite(e.col,e.d,0,e.sx),X,y0)}
function drawSignCaptions(c,camX,camY){for(const sg of SIGNS){if(P.moving||Math.abs(sg.x-P.x)+Math.abs(sg.y-P.y)!==1)continue;nameTag(c,sg.x*16-camX+8,sg.y*16-camY-1,signShort(sg),'#d9a466','')}}
function drawWorld(){
  const cw=wcv.parentElement.clientWidth,ch=wcv.parentElement.clientHeight;const dpr=Math.min(3,devicePixelRatio||1);
  SC=Math.max(2,Math.round(Math.min(cw/240,ch/160)));
  const W=Math.round(cw*dpr),H=Math.round(ch*dpr);
  if(wcv.width!==W||wcv.height!==H){wcv.width=W;wcv.height=H;wcv.style.width=cw+'px';wcv.style.height=ch+'px'}
  const K=Math.max(1,Math.round(SC*dpr));LW=Math.ceil(W/K);LH=Math.ceil(H/K);
  const c=wc;c.setTransform(K,0,0,K,0,0);c.imageSmoothingEnabled=false;
  let camX=Math.round(P.fx*16+8-LW/2),camY=Math.round(P.fy*16+8-LH/2);
  camX=clamp(camX,0,MW*16-LW);camY=P.fy>=MH?clamp(camY,MH*16,MHT*16-LH):clamp(camY,0,MH*16-LH);
  c.fillStyle='#1d6428';c.fillRect(0,0,LW,LH);
  const x0=Math.floor(camX/16),y0=Math.floor(camY/16),x1=x0+Math.ceil(LW/16)+1,y1=y0+Math.ceil(LH/16)+1;const wf=Math.floor(T*1.6)%2;
  if(!WORLD&&!BAKE_FAIL){bakeTick();c.fillStyle='#10121c';c.fillRect(0,0,LW,LH);c.font='8px "Press Start 2P",monospace';c.fillStyle='#ffcb3d';c.textAlign='center';c.fillText('WELT WIRD GELADEN…',LW/2,LH/2);c.fillStyle='#9aa1bd';c.fillText('v'+VERSION,LW/2,LH/2+14);c.textAlign='left';return}
  if(BAKE_FAIL){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(x<0||y<0||x>=MW||y>=MHT)continue;c.fillStyle=MCOL[tget(x,y)]||'#000';c.fillRect(x*16-camX,y*16-camY,16,16)}}
  if(WORLD)drawWorldLayer(c,camX,camY,LW,LH,'g');try{drawFalls(c,camX,camY,LW,LH)}catch(e){}
  // animated water sparkle
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tget(x,y)!==3)continue;const h=th(x,y);const ph=(T*1.3+(h%100)/100)%1;if(ph<0.5){const X=x*16-camX+(h%11)+2,Y=y*16-camY+((h>>4)%11)+2;c.fillStyle=ph<0.25?'#d8f0ff':'#8fc8f0';c.fillRect(X,Y,ph<0.25?3:2,1)}}
  // cuttable trees / boulders
  for(const f of FIELD){if(FIELDGONE.has(f.id)||f.x<x0-1||f.x>x1||f.y<y0-1||f.y>y1)continue;const X=f.x*16-camX,Y=f.y*16-camY;
    if(f.kind==='tape'){c.fillStyle='#00000040';c.fillRect(X+1,Y+13,14,2);c.fillStyle='#3a3a44';c.fillRect(X+1,Y+4,2,10);c.fillRect(X+13,Y+4,2,10);for(let i=0;i<14;i+=4){c.fillStyle='#ffd23d';c.fillRect(X+1+i,Y+6,2,3);c.fillStyle='#14141f';c.fillRect(X+3+i,Y+6,2,3)}c.fillStyle='#ffd23d';c.fillRect(X+1,Y+10,14,1)}
    else if(f.kind==='cut'){c.fillStyle='#00000040';c.fillRect(X+3,Y+13,10,2);c.fillStyle='#3a2410';c.fillRect(X+7,Y+10,2,5);c.fillStyle='#14301a';c.fillRect(X+2,Y+1,12,11);c.fillStyle='#2f7a2c';c.fillRect(X+3,Y+2,10,9);c.fillStyle='#56a83c';c.fillRect(X+4,Y+3,5,3);c.fillStyle='#1f5a22';c.fillRect(X+8,Y+7,4,3)}
    else{c.fillStyle='#00000040';c.fillRect(X+1,Y+12,14,3);c.fillStyle='#2a2a30';c.fillRect(X+1,Y+2,14,12);c.fillStyle='#8a8e96';c.fillRect(X+2,Y+3,12,10);c.fillStyle='#b8bcc4';c.fillRect(X+3,Y+4,6,3);c.fillStyle='#5c606b';c.fillRect(X+9,Y+9,4,3);c.fillRect(X+5,Y+8,1,3)}}
  // wooden signposts
  for(const sg of SIGNS){if(sg.x<x0-1||sg.x>x1||sg.y<y0-1||sg.y>y1)continue;const X=sg.x*16-camX,Y=sg.y*16-camY;
    c.fillStyle='#00000040';c.fillRect(X+3,Y+13,10,2);c.fillStyle='#2a1a0c';c.fillRect(X+6,Y+6,4,9);c.fillStyle='#7a4a22';c.fillRect(X+7,Y+6,2,8);
    c.fillStyle='#2a1a0c';c.fillRect(X+1,Y+1,14,8);c.fillStyle='#b07a3e';c.fillRect(X+2,Y+2,12,6);c.fillStyle='#d9a466';c.fillRect(X+2,Y+2,12,1);c.fillStyle='#6b4220';c.fillRect(X+4,Y+4,8,1);c.fillRect(X+4,Y+6,6,1)}
  // signs on roofs
  c.textBaseline='alphabetic';
  for(const L of LABELS){const X=L.x*16-camX,Y=L.y*16-camY;if(X<-120||Y<-80||X>LW+40||Y>LH+40)continue;if(L.kind==='pad'){c.font='8px VT323,monospace';c.textAlign='center';const pd=PADS.find(p=>p.bx===L.x&&p.by===L.y);if(pd&&pd.old){c.fillStyle='#14141f';c.fillText('PÄD',X+48,Y+28);c.fillStyle='#ffffff';c.fillText('PÄD',X+48,Y+27)}else{c.fillStyle='#ffffff';c.fillText('PÄD',X+56,Y+36.5)}}
    else{c.font='7px "Press Start 2P",monospace';c.textAlign='center';c.fillStyle='#14141f';c.fillText(L.t,X+L.w*8+1,Y+13);c.fillStyle='#ffcb3d';c.fillText(L.t,X+L.w*8,Y+12)}}
  for(const Bd of BLDG){const X=Bd.x*16-camX,Y=Bd.y*16-camY;if(X<-120||Y<-80||X>LW+40||Y>LH+40)continue;c.font='10px VT323,monospace';c.textAlign='center';c.fillStyle='#ffffff';if(Bd.old){c.font='8px VT323,monospace';c.fillText(Bd.id==='shop'?'COPSHOP':Bd.n,X+Bd.w*8,Bd.id==='shop'?Y+20:Y+40)}else c.fillText(Bd.n,X+Bd.w*8,Y+(Bd.id==='shop'?43:45.5))}
  c.textAlign='left';
  // entities
  const ents=[];
  for(const o of OTH.values()){if(o.fx==null)continue;ents.push({fx:o.fx,fy:o.fy,col:o.c,sx:o.sx,d:o.d,ph:o.ph,mv:o.moving,name:o.n,bt:o.bt,bub:o.bub,alt:o.fl?1:0,ride:o.rd||null,bike:!!o.bk});if(o.fl){}else if(o.lf)folEnts(o,o.lf,ents,o.fx,o.fy);else if(o.ld&&o.fol.fx!=null)ents.push({fx:o.fol.fx,fy:o.fol.fy,mon:o.ld})}
  if(G){ents.push({fx:P.fx,fy:P.fy,col:G.color,sx:G.sex,d:P.d,ph:P.ph,mv:P.moving,name:G.name+' (du)',bt:B?(B.mode==='wild'?'wild':'duel'):null,bub:myBubble,me:1,bike:!!P.bike,ride:rideSid(),alt:flyAlt(),hop:P.jump?Math.round(Math.sin(P.mt*Math.PI)*9):0});if(RUN&&!P.fly&&flyAlt()===0)folEnts(P,folInfo(),ents,P.fx,P.fy)}
  for(const t of tollSpots()){const fx=t.x,fy=t.y;ents.push({fx,fy,col:t.c,sx:/Würde|Strafe/.test(t.n)?'f':'m',d:t.d,npc:t,name:t.n})}
  for(const t of TRAINERS)if(!t.story||storyOn())ents.push({fx:t.x,fy:t.y,col:t.c,sx:/^\S+in\s/.test(t.n)?'f':'m',d:t.d,ph:0,mv:false,name:t.n,npc:t,bt:null});
  for(const L of LEGENDS){const gone=(RUN&&RUN.leg&&RUN.leg[L.id])||!cfgOf().leg;if(!gone)ents.push({fx:L.x,fy:L.y,legend:L})}
  ents.sort((a,b)=>a.fy-b.fy);
  for(const e of ents){const X=Math.round(e.fx*16-camX);let Y=Math.round(e.fy*16-camY);
    if(e.alt>0)continue;
    if(e.hop){c.fillStyle='rgba(0,0,0,0.3)';c.fillRect(X+3,Y+13,10,2);Y-=e.hop}
    if(e.legend){if(X<-40||X>LW+40||Y<-40||Y>LH+40)continue;const s=monSprite(legSid(e.legend),32);const bob=Math.round(Math.sin(T*2)*1.5);c.globalAlpha=RUN&&RUN.phase==='train'?1:0.45;c.drawImage(s,X-8,Y+15-27+bob,32,32);c.globalAlpha=1;
      c.fillStyle='#ffcb3d';for(let i=0;i<3;i++){const a=T*1.5+i*2.1;c.fillRect(Math.round(X+8+Math.cos(a)*12),Math.round(Y+4+Math.sin(a)*7),1,1)}continue}
    if(e.mon){const s=monSprite(e.mon,24);c.drawImage(s,X-4,Y+15-21,24,24)}
    else{const fr=e.mv?(Math.floor(e.ph/STEP*2)%2?1:2):0;if(tget(Math.round(e.fx),Math.round(e.fy))===3&&e.ride&&SPECIES[e.ride]){const wb=Math.round(Math.sin(T*4)*1),ms=monSprite(e.ride,24);c.drawImage(ms,X-4,Y-1+wb,24,24);c.fillStyle='#ffffff90';c.fillRect(X-4,Y+19+wb,6,1);c.fillRect(X+14,Y+19+wb,6,1);c.drawImage(charSprite(e.col,e.d,0,e.sx),0,0,16,12,X,Y+3+wb,16,12)}else if(tget(Math.round(e.fx),Math.round(e.fy))===3){const wb=Math.round(Math.sin(T*4)*1);c.drawImage(charSprite(e.col,e.d,fr,e.sx),0,0,16,13,X,Y+1+wb,16,13);c.fillStyle='#ffffffb0';c.fillRect(X+1,Y+13+wb,4,1);c.fillRect(X+11,Y+13+wb,4,1);c.fillStyle='#ffffff60';c.fillRect(X-1,Y+14,18,1)}else{const ti=e.npc&&trainerImg(e.npc,e.d);if(ti)c.drawImage(ti,Math.round(X+8-ti.naturalWidth/2),Y+15-ti.naturalHeight);else if(e.bike)drawBiker(c,e,X,Y);else c.drawImage(charSprite(e.col,e.d,fr,e.sx),X,Y-4)}}
    {const tx=Math.round(e.fx),ty=Math.round(e.fy),tt=tget(tx,ty);if(ENC.has(tt))c.drawImage(TILE[tt][(tx*7+ty*3)%TILE[tt].length],0,8,16,8,X,Y+8,16,8)}}
  if(WORLD)drawWorldLayer(c,camX,camY,LW,LH,'c');
  for(const e of ents)if(e.alt>0)drawFlyer(c,e,Math.round(e.fx*16-camX),Math.round(e.fy*16-camY));
  for(const e of ents){if(e.mon)continue;const X=e.fx*16-camX+8,Y=Math.round(e.fy*16-camY)-2-(e.alt>0?Math.round(e.alt*16):0);
    if(e.legend){nameTag(c,X,Y-14,'???','#ffcb3d','');continue}
    if(e.npc){const beaten=RUN&&RUN.beat&&RUN.beat[e.npc.id];nameTag(c,X,Y-4,e.name,e.col,'');const qm=typeof storyMark==='function'?storyMark(e.npc):0;if(qm){const bob=Math.round(Math.sin(performance.now()/220)*2),yy=Y-34+bob,X0=Math.round(X);c.fillStyle='#14141f';c.fillRect(X0-4,yy-1,8,15);c.fillStyle=qm===2?'#ff4d4d':'#ffcb3d';c.fillRect(X0-3,yy,6,8);c.fillRect(X0-3,yy+10,6,3)}else if(e.npc.alert&&performance.now()-e.npc.alert<1000){c.fillStyle='#14141f';c.fillRect(Math.round(X)-3,Y-26,6,11);c.fillStyle='#ffcb3d';c.fillRect(Math.round(X)-2,Y-25,4,6);c.fillRect(Math.round(X)-2,Y-18,4,2)}else if(beaten){vtText(c,'✓',X,Y-15,'#3ddc6b',10,'center')}continue}
    nameTag(c,X,Y-4,e.name,e.col,e.bt==='duel'?'⚔':e.bt==='wild'?'!':'');if(e.bub&&e.bub.until>performance.now())bubble(c,X,Y-14,e.bub.t)}
  drawSignCaptions(c,camX,camY);
}

