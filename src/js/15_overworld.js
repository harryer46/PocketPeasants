/* ===================== OVERWORLD ===================== */
const STEP=0.16;
function modalOpen(){return $('#modal').classList.contains('on')||$('#study').classList.contains('on')||$('#arena').classList.contains('on')||$('#mapov').classList.contains('on')||!!FX}
// FLY (field skill from Axel): take off right on the map – over trees, water and cliffs, twice as fast,
//   no encounters; areas whose teacher you have not passed stay closed in the air too; land only on walkable ground
function flyable(x,y){if(x<2||y<2||x>=MW-2||y>=MH-2)return false;const b=BIOME[y*MW+x];return!(TOLL_LAW[b]&&!tollPaid(b)&&RUN&&RUN.phase==='train')}
function canFly(){return hasHM('fly')&&!B&&RUN&&RUN.phase!=='arena'}
function toggleFly(){if(!P.fly){if(!canFly())return;if(P.moving)return;P.fly=true;P.flyT=performance.now();held.length=0;pres({fl:1});toast('🕊 Abgehoben! Landen über Team → Feldfähigkeiten oder Taste F.');flyBtn();return}
  if(P.moving)return;const x=P.x,y=P.y;if(!walkable(x,y)||trainerAt(x,y)||LEGENDS.some(L=>L.x===x&&L.y===y)||tollAt(x,y)){toast('Hier kannst du nicht landen – such dir freien Boden.');return}
  P.fly=false;P.flyT=performance.now();P.fol={x,y,tx:x,ty:y,fx:x,fy:y};trailReset(P,x,y);if(P.fols)for(const f of P.fols){f.fx=f.tx=x;f.fy=f.ty=y}pres({fl:0});save();flyBtn();onArrive()}
function flyBtn(){const b=document.querySelector('[data-hmuse="fly"]');if(b)b.textContent=P.fly?'🛬 LANDEN':HM.fly.i+' '+HM.fly.n}
function flyAlt(){const t=(performance.now()-(P.flyT||0))/350;return P.fly?Math.min(1,t):Math.max(0,1-t)}
function updatePlayer(dt){
  if(P.moving){P.mt+=dt/(P.fly?STEP*0.5:STEP);P.ph+=dt;
    if(P.mt>=1){P.moving=false;P.x=P.tx;P.y=P.ty;P.fx=P.x;P.fy=P.y;onArrive();if(B)return}
    else{P.fx=P.sx+(P.tx-P.sx)*P.mt;P.fy=P.sy+(P.ty-P.sy)*P.mt}}
  if(!P.moving&&!B&&!modalOpen()&&!P.lock){const d=heldDir();if(d){const turned=P.d!==d;P.d=d;const[dx,dy]=DIRS[d];const nx=P.x+dx,ny=P.y+dy;
    if(P.fly){if(flyable(nx,ny)){P.moving=true;P.mt=0;P.sx=P.x;P.sy=P.y;P.tx=nx;P.ty=ny;pres({x:nx,y:ny,d})}else if(turned)pres({d});else if(P.bumpCd<=0){P.bumpCd=1.2;const b=BIOME[ny*MW+nx];if(TOLL_LAW[b])toast('Dieses Gebiet ist noch gesperrt – erst am Prof. vorbei, dann darfst du es überfliegen.')}}
    else if(walkable(nx,ny)&&!trainerAt(nx,ny)&&!LEGENDS.some(L=>L.x===nx&&L.y===ny)&&!tollBlock(nx,ny)){P.moving=true;P.mt=0;P.sx=P.x;P.sy=P.y;P.tx=nx;P.ty=ny;P.fol.tx=P.x;P.fol.ty=P.y;trailPush(P,P.x,P.y);pres({x:nx,y:ny,d})}else{if(trainerAt(nx,ny)||LEGENDS.some(L=>L.x===nx&&L.y===ny))bump(nx,ny);if(turned)pres({d})}}}
  P.bumpCd=Math.max(0,(P.bumpCd||0)-dt);
  approach(P.fol,dt);if(P.fols)for(const f of P.fols)approach(f,dt);
}
function approach(o,dt){if(o.fx==null){o.fx=o.x;o.fy=o.y}const dx=o.tx-o.fx,dy=o.ty-o.fy,dist=Math.hypot(dx,dy);if(dist>3){o.fx=o.tx;o.fy=o.ty;return}const sp=dt/STEP*1.05;if(dist<=sp){o.fx=o.tx;o.fy=o.ty}else{o.fx+=dx/dist*sp;o.fy+=dy/dist*sp}}
function legendHere(x,y){if(!RUN||RUN.phase!=='train')return null;return LEGENDS.find(L=>L.x===x&&L.y===y&&!(RUN.leg&&RUN.leg[L.id]))||null}
function trainerAt(x,y){return TRAINERS.find(t=>t.x===x&&t.y===y)||null}
function bump(nx,ny){
  if(P.bumpCd>0)return;P.bumpCd=0.5;
  const fo=fieldAt(nx,ny);if(fo){const k=fo.kind,h=HM[k];if(hasHM(k)){FIELDGONE.add(fo.id);for(const f of FIELD)if(f.kind===k&&Math.abs(f.x-fo.x)+Math.abs(f.y-fo.y)<=1)FIELDGONE.add(f.id);toast(k==='cut'?'✂ Du setzt ZERSCHNEIDER ein — die Bäume fallen!':'💪 Du setzt STÄRKE ein — die Felsen rollen weg!')}
    else toast(k==='cut'?`Diese Bäumchen könnte man zerschneiden… ${TRAINERS.find(t=>t.id===h.from).n} weiß, wie.`:`Ein schwerer Felsbrocken… ${TRAINERS.find(t=>t.id===h.from).n} könnte dir STÄRKE beibringen.`);return}
  if(tget(nx,ny)===3&&!hasHM('swim')){toast(`Das Wasser ist tief… ${TRAINERS.find(t=>t.id==='sue').n} bringt dir SURFER bei.`);return}
  const sg=SIGNS.find(s=>s.x===nx&&s.y===ny);if(sg){if(!$('#signbox').classList.contains('on'))showSign(sg);return}
  const t=trainerAt(nx,ny);
  if(t){if(!RUN||RUN.phase!=='train')toast(`${t.n}: „Komm wieder, wenn dein Spiel begonnen hat!“`);else if(RUN.beat&&RUN.beat[t.id])toast(`${t.n}: "${t.after}"`);else spotted(t);return}
  const L=LEGENDS.find(L=>L.x===nx&&L.y===ny);
  if(L&&!cfgOf().leg){toast('Der Schrein bleibt in diesem Spiel still.');return}
  if(L){if(!RUN||RUN.phase!=='train')toast('Ein geheimnisvoller Schrein. Hier schläft etwas…');else if(RUN.leg&&RUN.leg[L.id])toast('Der Schrein ist jetzt leer.');else startLegend(L)}
}
function spotted(t){if(P.lock||B)return;P.lock=true;held.length=0;t.alert=performance.now();setTimeout(()=>{P.lock=false;if(!B&&RUN&&RUN.phase==='train')startTrainer(t)},900)}
function checkSight(){
  if(!RUN||RUN.phase!=='train')return false;
  for(const t of TRAINERS){if(RUN.beat&&RUN.beat[t.id])continue;const[dx,dy]=DIRS[t.d];
    for(let k=1;k<=4;k++){const x=t.x+dx*k,y=t.y+dy*k;if(!walkable(x,y))break;if(x===P.x&&y===P.y){spotted(t);return true}}}
  return false;
}
function teleport(x,y){if(P.fly){P.fly=false;P.flyT=0;pres({fl:0});flyBtn()}P.x=P.fx=x;P.y=P.fy=y;try{bakeNow()}catch(e){}P.moving=false;P.fol={x,y,tx:x,ty:y};trailReset(P,x,y);G.x=x;G.y=y;pres({x,y,d:P.d})}
function onArrive(){
  if(!P.fly){G.x=P.x;G.y=P.y}G.d=P.d;P.steps++;if(P.steps%8===0)save();updateHud();
  if(P.fly){if(BIOME[P.y*MW+P.x]===0&&RUN){const Tn=TOWNS.find(T=>Math.abs(T.x-P.x)<18&&Math.abs(T.y-P.y)<14);if(Tn&&Tn.id!=='vil'&&!(RUN.towns&&RUN.towns[Tn.id])){RUN.towns=RUN.towns||{};RUN.towns[Tn.id]=1;save();toast(`📍 ${Tn.n} entdeckt!`)}}return}
  const t=tget(P.x,P.y);
  if(t===22){if(RUN)openShop();else toast('Copshop — tritt einer Lobby bei oder starte das freie Spiel.')}
  if(t===23){if(RUN)openHfPol();else toast('HfPol — tritt einer Lobby bei oder starte das freie Spiel, um zu lernen.')}
  if(BIOME[P.y*MW+P.x]===0&&RUN){const Tn=TOWNS.find(T=>Math.abs(T.x-P.x)<26&&Math.abs(T.y-P.y)<24);if(Tn){RUN.towns=RUN.towns||{};if(!RUN.towns[Tn.id]){RUN.towns[Tn.id]=1;save();if(Tn.id!=='vil')toast(`📍 ${Tn.n} entdeckt — Schnellreise über die Weltkarte (M) freigeschaltet!`)}}}
  if(t===7&&RUN){const pd=PADS.find(p=>p.x===P.x&&p.y===P.y);if(pd){RUN.lastPad={x:pd.x,y:pd.y+1};save()}}
  if(t===7){if(RUN)healQuiz();else toast('PÄD — tritt einer Lobby bei oder starte das freie Spiel, um ein Team zu bekommen.')}
  if(t===12){if(RUN&&RUN.phase==='lobby')toast('Das Spiel hat noch nicht begonnen — warte auf den Host.');else if(RUN&&RUN.phase==='train'&&!RUN.free)confirmEarlyArena();else if(RUN&&RUN.free)toast('Im Gericht finden Lobby-Turniere statt — erstelle oder betritt eine Lobby!');else toast('Das Gericht — tritt zuerst einer Lobby bei oder erstelle eine!')}
  if(checkSight())return;
  if((ENC.has(t)||t===20)&&RUN&&RUN.phase==='train'){const z=zoneAt(P.x,P.y);if(z&&Math.random()<(t===20?0.16:0.13)*cfgOf().enc)startWild(z)}
}
// PÄD (Polizeiärztlicher Dienst): one question per 25 % — every correct answer heals the next hurt monster by a quarter (4 per monster); wrong answers just move on
function healQuiz(){RUN.kap=Math.max(RUN.kap,10);updateHud();const all=()=>RUN.team.concat(RUN.box),full=()=>all().every(m=>m.hp>=stats(m).mhp);
  if(full()){toast('PÄD: Dein Team ist gesund. Handschellen aufgefüllt.');save();return}
  const keys=Object.keys(QZ).filter(k=>SPECIES[k]&&QZ[k].length);let n=0;const seen=new Set();
  const pickQ=()=>{for(let t=0;t<40;t++){const k=keys[Math.floor(Math.random()*keys.length)],q=QZ[k][Math.floor(Math.random()*QZ[k].length)];if(!seen.has(q[0])){seen.add(q[0]);return{src:k,q}}}return{src:keys[0],q:QZ[keys[0]][0]}};
  const hpLine=()=>RUN.team.map(m=>`${esc(SPECIES[m.s].n)} ${Math.round(100*m.hp/stats(m).mhp)}%`).join(' · '),target=()=>RUN.team.concat(RUN.box).find(m=>m.hp<stats(m).mhp);
  const ask=()=>{const it=pickQ(),order=shuffleArr([0,1,2,3]);n++;CQ={it,order,end:Infinity,done:false,cb:null};
    $('#cqbox').innerHTML=`<div class="sdlg"><span class="slaw">⚕ PÄD · Polizeiärztlicher Dienst · Frage ${n} · ${esc(SPECIES[it.src].law||'')}</span><br><span class="small">Richtige Antwort = +25 % für <b>${esc(SPECIES[target().s].n)}</b> (4 Fragen pro Monster).<br>${hpLine()}</span><br>${esc(it.q[0])}<div id="cqexp"></div></div>
      <div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${j+1}</span>${esc(it.q[1][k])}</button>`).join('')}</div><div class="sacts" id="cqact"><button class="btn ghost" id="cqstop">GEHEN</button></div>`;
    $('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(bt=>bt.onclick=()=>pick(+bt.dataset.ck));$('#cqstop').onclick=stop};
  const stop=()=>{$('#cquiz').classList.remove('on');CQ=null;CQ_PICK=null;save();renderTeam();updateHud()};
  const pick=k=>{if(!CQ||CQ.done)return;CQ.done=true;const ok=k===0,it=CQ.it;
    document.querySelectorAll('[data-ck]').forEach(bt=>{const kk=+bt.dataset.ck;bt.disabled=true;bt.classList.add(kk===0?'ok':kk===k?'bad':'dim')});
    const tm=target();if(ok&&tm){const mx=stats(tm).mhp;tm.hp=Math.min(mx,tm.hp+Math.ceil(mx*0.25))}
    const done=ok&&full();renderTeam();
    $('#cqexp').innerHTML=`<div class="sexp ${ok?'ok':'bad'}">${ok?(done?'✓ Richtig — dein Team ist wieder fit!':`✓ Richtig — +25 % KP für ${esc(SPECIES[tm.s].n)}.`):'✗ Falsch — keine Heilung, nächste Frage.'} ${esc(it.q[2])}</div>`;
    $('#cqact').innerHTML=!done?`<button class="btn" id="cqnext">NÄCHSTE FRAGE</button><button class="btn ghost" id="cqstop">GEHEN</button>`:`<button class="btn" id="cqstop">WEITER</button>`;
    const nx=$('#cqnext');if(nx)nx.onclick=ask;$('#cqstop').onclick=stop};
  CQ_PICK=pick;ask()}
// respawn after a defeat: in front of the last PÄD you entered (else Villingen)
function padSpawn(){const l=RUN&&RUN.lastPad;if(l&&walkable(l.x,l.y))return l;const p=PADS[0];return p?{x:p.x,y:p.y+1}:VSPAWN}
function healAll(){if(!RUN)return;for(const m of RUN.team.concat(RUN.box))m.hp=stats(m).mhp;RUN.kap=Math.max(RUN.kap,10);save();renderTeam();updateHud()}
function updateHud(){try{flyBtn()}catch(e){}
  const z=zoneAt(P.x,P.y);$('#hzone').textContent=z?ZONES[z].n:'Stadt';
  $('#hkap').textContent=RUN?`$${money()} · ⛓ ${RUN.kap}`:'Kein Team';
  {const R=rosterIds();$('#sdex').textContent=`Dex ${R.filter(s=>G.dex[s]!==undefined).length}/${R.length}`}$('#stro').textContent=`Trophäen ${G.tro}`;
}

/* world render (low-res buffer, scaled up) */
const wcv=$('#world'),wc=wcv.getContext('2d');let SC=3,LW=0,LH=0;
function nameTag(c,x,y,txt,col,icon){
  c.font='8px VT323,monospace';c.textBaseline='alphabetic';const w=Math.ceil(c.measureText(txt).width)+9+(icon?6:0);const X=Math.round(x-w/2);
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
  const sw=Math.round(12-a*4);c.fillStyle='rgba(0,0,0,'+(0.38-a*0.12).toFixed(2)+')';c.fillRect(X+8-sw/2,Y+13,sw,2);c.fillRect(X+8-sw/2+1,Y+12,sw-2,1);c.fillRect(X+8-sw/2+1,Y+15,sw-2,1);
  const y0=Y-h+bob;c.fillStyle='#14141f';const wy=y0+(flap?5:3),wh=flap?3:5;c.fillRect(X-5,wy,7,wh);c.fillRect(X+14,wy,7,wh);c.fillStyle='#f4f4f8';c.fillRect(X-4,wy+1,5,wh-2);c.fillRect(X+15,wy+1,5,wh-2);c.fillStyle='#c8d0e0';c.fillRect(X-4,wy+wh-2,5,1);c.fillRect(X+15,wy+wh-2,5,1);
  c.drawImage(charSprite(e.col,e.d,0,e.sx),X,y0)}
function drawSignCaptions(c,camX,camY){for(const sg of SIGNS){const d=Math.hypot(sg.x-P.fx,sg.y-P.fy);if(d>3.2)continue;nameTag(c,sg.x*16-camX+8,sg.y*16-camY-1,signShort(sg),'#d9a466','')}}
function drawWorld(){
  const cw=wcv.parentElement.clientWidth,ch=wcv.parentElement.clientHeight;const dpr=Math.min(3,devicePixelRatio||1);
  SC=Math.max(2,Math.round(Math.min(cw/240,ch/160)));
  const W=Math.round(cw*dpr),H=Math.round(ch*dpr);
  if(wcv.width!==W||wcv.height!==H){wcv.width=W;wcv.height=H;wcv.style.width=cw+'px';wcv.style.height=ch+'px'}
  const K=Math.max(1,Math.round(SC*dpr));LW=Math.ceil(W/K);LH=Math.ceil(H/K);
  const c=wc;c.setTransform(K,0,0,K,0,0);c.imageSmoothingEnabled=false;
  let camX=Math.round(P.fx*16+8-LW/2),camY=Math.round(P.fy*16+8-LH/2);
  camX=clamp(camX,0,MW*16-LW);camY=clamp(camY,0,MH*16-LH);
  c.fillStyle='#1d6428';c.fillRect(0,0,LW,LH);
  const x0=Math.floor(camX/16),y0=Math.floor(camY/16),x1=x0+Math.ceil(LW/16)+1,y1=y0+Math.ceil(LH/16)+1;const wf=Math.floor(T*1.6)%2;
  if(!WORLD&&!BAKE_FAIL){bakeTick();c.fillStyle='#10121c';c.fillRect(0,0,LW,LH);c.font='8px "Press Start 2P",monospace';c.fillStyle='#ffcb3d';c.textAlign='center';c.fillText('WELT WIRD GELADEN…',LW/2,LH/2);c.fillStyle='#9aa1bd';c.fillText('v'+VERSION,LW/2,LH/2+14);c.textAlign='left';return}
  if(BAKE_FAIL){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(x<0||y<0||x>=MW||y>=MH)continue;c.fillStyle=MCOL[tget(x,y)]||'#000';c.fillRect(x*16-camX,y*16-camY,16,16)}}
  if(WORLD)drawWorldLayer(c,camX,camY,LW,LH,'g');
  // animated water sparkle
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tget(x,y)!==3)continue;const h=th(x,y);const ph=(T*1.3+(h%100)/100)%1;if(ph<0.5){const X=x*16-camX+(h%11)+2,Y=y*16-camY+((h>>4)%11)+2;c.fillStyle=ph<0.25?'#d8f0ff':'#8fc8f0';c.fillRect(X,Y,ph<0.25?3:2,1)}}
  // cuttable trees / boulders
  for(const f of FIELD){if(FIELDGONE.has(f.id)||f.x<x0-1||f.x>x1||f.y<y0-1||f.y>y1)continue;const X=f.x*16-camX,Y=f.y*16-camY;
    if(f.kind==='cut'){c.fillStyle='#00000040';c.fillRect(X+3,Y+13,10,2);c.fillStyle='#3a2410';c.fillRect(X+7,Y+10,2,5);c.fillStyle='#14301a';c.fillRect(X+2,Y+1,12,11);c.fillStyle='#2f7a2c';c.fillRect(X+3,Y+2,10,9);c.fillStyle='#56a83c';c.fillRect(X+4,Y+3,5,3);c.fillStyle='#1f5a22';c.fillRect(X+8,Y+7,4,3)}
    else{c.fillStyle='#00000040';c.fillRect(X+1,Y+12,14,3);c.fillStyle='#2a2a30';c.fillRect(X+1,Y+2,14,12);c.fillStyle='#8a8e96';c.fillRect(X+2,Y+3,12,10);c.fillStyle='#b8bcc4';c.fillRect(X+3,Y+4,6,3);c.fillStyle='#5c606b';c.fillRect(X+9,Y+9,4,3);c.fillRect(X+5,Y+8,1,3)}}
  // wooden signposts
  for(const sg of SIGNS){if(sg.x<x0-1||sg.x>x1||sg.y<y0-1||sg.y>y1)continue;const X=sg.x*16-camX,Y=sg.y*16-camY;
    c.fillStyle='#00000040';c.fillRect(X+3,Y+13,10,2);c.fillStyle='#2a1a0c';c.fillRect(X+6,Y+6,4,9);c.fillStyle='#7a4a22';c.fillRect(X+7,Y+6,2,8);
    c.fillStyle='#2a1a0c';c.fillRect(X+1,Y+1,14,8);c.fillStyle='#b07a3e';c.fillRect(X+2,Y+2,12,6);c.fillStyle='#d9a466';c.fillRect(X+2,Y+2,12,1);c.fillStyle='#6b4220';c.fillRect(X+4,Y+4,8,1);c.fillRect(X+4,Y+6,6,1)}
  // signs on roofs
  c.textBaseline='alphabetic';
  for(const L of LABELS){const X=L.x*16-camX,Y=L.y*16-camY;if(X<-120||Y<-80||X>LW+40||Y>LH+40)continue;if(L.kind==='pad'){c.font='8px VT323,monospace';c.textAlign='center';c.fillStyle='#ffffff';c.fillText('PÄD',X+56,Y+36.5)}
    else{c.font='7px "Press Start 2P",monospace';c.textAlign='center';c.fillStyle='#14141f';c.fillText(L.t,X+L.w*8+1,Y+13);c.fillStyle='#ffcb3d';c.fillText(L.t,X+L.w*8,Y+12)}}
  for(const Bd of BLDG){const X=Bd.x*16-camX,Y=Bd.y*16-camY;if(X<-120||Y<-80||X>LW+40||Y>LH+40)continue;c.font='10px VT323,monospace';c.textAlign='center';c.fillStyle='#ffffff';c.fillText(Bd.n,X+Bd.w*8,Y+(Bd.id==='shop'?43:45.5))}
  c.textAlign='left';
  // entities
  const ents=[];
  for(const o of OTH.values()){if(o.fx==null)continue;ents.push({fx:o.fx,fy:o.fy,col:o.c,sx:o.sx,d:o.d,ph:o.ph,mv:o.moving,name:o.n,bt:o.bt,bub:o.bub,alt:o.fl?1:0});if(o.fl){}else if(o.lf)folEnts(o,o.lf,ents,o.fx,o.fy);else if(o.ld&&o.fol.fx!=null)ents.push({fx:o.fol.fx,fy:o.fol.fy,mon:o.ld})}
  if(G){ents.push({fx:P.fx,fy:P.fy,col:G.color,sx:G.sex,d:P.d,ph:P.ph,mv:P.moving,name:G.name+' (du)',bt:B?(B.mode==='wild'?'wild':'duel'):null,bub:myBubble,me:1,alt:flyAlt()});if(RUN&&!P.fly&&flyAlt()===0)folEnts(P,folInfo(),ents,P.fx,P.fy)}
  for(const t of tollSpots()){const paid=tollPaid(t.b);let fx=t.x,fy=t.y;if(paid){for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(walkable(t.x+dx,t.y+dy)&&BIOME[(t.y+dy)*MW+t.x+dx]===t.b&&!(dx===0&&dy===0)){const side=DIRS[t.d];if(side&&dx===side[0]&&dy===side[1])continue;fx=t.x+dx;fy=t.y+dy;break}}ents.push({fx,fy,col:t.c,sx:/Würde|Strafe/.test(t.n)?'f':'m',d:t.d,npc:t,name:t.n})}
  for(const t of TRAINERS)ents.push({fx:t.x,fy:t.y,col:t.c,sx:/^\S+in\s/.test(t.n)?'f':'m',d:t.d,ph:0,mv:false,name:t.n,npc:t,bt:null});
  for(const L of LEGENDS){const gone=(RUN&&RUN.leg&&RUN.leg[L.id])||!cfgOf().leg;if(!gone)ents.push({fx:L.x,fy:L.y,legend:L})}
  ents.sort((a,b)=>a.fy-b.fy);
  for(const e of ents){const X=Math.round(e.fx*16-camX),Y=Math.round(e.fy*16-camY);
    if(e.alt>0)continue;
    if(e.legend){if(X<-40||X>LW+40||Y<-40||Y>LH+40)continue;const s=monSprite(legSid(e.legend),32);const bob=Math.round(Math.sin(T*2)*1.5);c.globalAlpha=RUN&&RUN.phase==='train'?1:0.45;c.drawImage(s,X-8,Y+15-27+bob,32,32);c.globalAlpha=1;
      c.fillStyle='#ffcb3d';for(let i=0;i<3;i++){const a=T*1.5+i*2.1;c.fillRect(Math.round(X+8+Math.cos(a)*12),Math.round(Y+4+Math.sin(a)*7),1,1)}continue}
    if(e.mon){const s=monSprite(e.mon,24);c.drawImage(s,X-4,Y+15-21,24,24)}
    else{const fr=e.mv?(Math.floor(e.ph/STEP*2)%2?1:2):0;if(tget(Math.round(e.fx),Math.round(e.fy))===3){const wb=Math.round(Math.sin(T*4)*1);c.drawImage(charSprite(e.col,e.d,fr,e.sx),0,0,16,13,X,Y+1+wb,16,13);c.fillStyle='#ffffffb0';c.fillRect(X+1,Y+13+wb,4,1);c.fillRect(X+11,Y+13+wb,4,1);c.fillStyle='#ffffff60';c.fillRect(X-1,Y+14,18,1)}else{const ti=e.npc&&trainerImg(e.npc,e.d);if(ti)c.drawImage(ti,Math.round(X+8-ti.naturalWidth/2),Y+15-ti.naturalHeight);else c.drawImage(charSprite(e.col,e.d,fr,e.sx),X,Y-4)}}
    {const tx=Math.round(e.fx),ty=Math.round(e.fy),tt=tget(tx,ty);if(ENC.has(tt))c.drawImage(TILE[tt][(tx*7+ty*3)%TILE[tt].length],0,8,16,8,X,Y+8,16,8)}}
  if(WORLD)drawWorldLayer(c,camX,camY,LW,LH,'c');
  for(const e of ents)if(e.alt>0)drawFlyer(c,e,Math.round(e.fx*16-camX),Math.round(e.fy*16-camY));
  for(const e of ents){if(e.mon)continue;const X=e.fx*16-camX+8,Y=Math.round(e.fy*16-camY)-2-(e.alt>0?Math.round(e.alt*16):0);
    if(e.legend){nameTag(c,X,Y-14,'???','#ffcb3d','');continue}
    if(e.npc){const beaten=RUN&&RUN.beat&&RUN.beat[e.npc.id];nameTag(c,X,Y-4,e.name,e.col,'');if(e.npc.alert&&performance.now()-e.npc.alert<1000){c.fillStyle='#14141f';c.fillRect(Math.round(X)-3,Y-26,6,11);c.fillStyle='#ffcb3d';c.fillRect(Math.round(X)-2,Y-25,4,6);c.fillRect(Math.round(X)-2,Y-18,4,2)}else if(beaten){vtText(c,'✓',X,Y-15,'#3ddc6b',10,'center')}continue}
    nameTag(c,X,Y-4,e.name,e.col,e.bt==='duel'?'⚔':e.bt==='wild'?'!':'');if(e.bub&&e.bub.until>performance.now())bubble(c,X,Y-14,e.bub.t)}
  drawSignCaptions(c,camX,camY);
}

