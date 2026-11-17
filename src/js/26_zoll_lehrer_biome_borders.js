/* ===================== ZOLL-LEHRER (biome borders) ===================== */
// one teacher per area guards the way in: 3 questions on their law; on failure pay 300 $ or fight strong paragraphs of that law
const STVO_QZ=[
 ["Was verlangt die Grundregel des § 1 StVO?",["Ständige Vorsicht und gegenseitige Rücksicht","Möglichst schnelles Vorankommen","Vorrang für größere Fahrzeuge","Hupen vor jeder Kreuzung"],"§ 1 Abs. 1 StVO."],
 ["Wie hoch ist die zulässige Höchstgeschwindigkeit innerorts für alle Kfz (ohne Beschilderung)?",["50 km/h","30 km/h","60 km/h","70 km/h"],"§ 3 Abs. 3 Nr. 1 StVO."],
 ["Was gilt an einer Kreuzung ohne Verkehrszeichen und ohne Ampel?",["Rechts vor links","Links vor rechts","Das größere Fahrzeug hat Vorfahrt","Wer zuerst hupt, fährt zuerst"],"§ 8 Abs. 1 StVO."],
 ["Wessen Zeichen und Weisungen gehen nach § 36 StVO allen anderen Anordnungen und Regeln vor?",["Die der Polizeibeamten","Die der Fahrlehrer","Die der Bauarbeiter","Die der Busfahrer"],"§ 36 Abs. 1 StVO – aber nicht Verkehrsverboten an sich."],
 ["Was müssen andere tun, wenn ein Fahrzeug blaues Blinklicht zusammen mit Einsatzhorn verwendet?",["Sofort freie Bahn schaffen","Nur auf Autobahnen ausweichen","Nur stehen bleiben, wenn es von hinten kommt","Nichts, es ist nur ein Hinweis"],"§ 38 Abs. 1 StVO."],
 ["Wie wird eine Rettungsgasse auf einer Autobahn mit drei Fahrstreifen gebildet?",["Zwischen dem äußerst linken und dem unmittelbar rechts daneben liegenden Fahrstreifen","Zwischen dem mittleren und dem rechten Fahrstreifen","Auf dem Standstreifen","In der Mitte jedes Fahrstreifens"],"§ 11 Abs. 2 StVO."],
 ["Auf welcher Seite wird grundsätzlich überholt?",["Links","Rechts","Beliebig","Nur auf dem Seitenstreifen"],"§ 5 Abs. 1 StVO."],
 ["Was regelt § 23 Abs. 1a StVO?",["Die Nutzung elektronischer Geräte wie dem Handy beim Fahren","Die Anschnallpflicht","Das Parken vor Einfahrten","Die Winterreifenpflicht für Fahrräder"],"Handyverbot am Steuer."],
 ["Was bedeutet Gelb an einer Ampel nach § 37 StVO?",["Vor der Kreuzung auf das nächste Zeichen warten","Schnell noch durchfahren","Die Kreuzung ist freigegeben","Nur Radfahrer dürfen fahren"],"§ 37 Abs. 2 Nr. 1 StVO."],
 ["Wie weit vor und hinter den Schnittpunkten der Fahrbahnkanten einer Kreuzung ist das Parken unzulässig?",["5 Meter","2 Meter","10 Meter","15 Meter"],"§ 12 Abs. 3 Nr. 1 StVO."],
 ["Wer muss während der Fahrt vorgeschriebene Sicherheitsgurte anlegen?",["Alle Fahrzeugführer und Mitfahrer auf Sitzen mit Gurt","Nur der Fahrer","Nur Kinder","Niemand innerorts"],"§ 21a Abs. 1 StVO."],
 ["Welche Pflicht regelt § 4 Abs. 1 StVO?",["Ausreichenden Abstand zum vorausfahrenden Fahrzeug halten","Das Rechtsfahrgebot","Die Beleuchtungspflicht","Das Halten an Bushaltestellen"],"Abstandsgebot."]
];
const TOLL_LAW={2:'PolG',3:'PolG',4:'StVO',5:'StGB',6:'GG',7:'StGB',8:'StPO',9:'StGB'};
const TOLL_NAME={2:'Prof. Gefahr',3:'Prof. Störer',4:'Prof. Blinker',5:'Prof. Strafe',6:'Prof. Dr. Würde',7:'Prof. Vorsatz',8:'Prof. Prozess',9:'Prof. Zelle'};
// every road into an area has its own teacher; the teachers of one area share the law (passing one opens the area)
const PROF_NAMES={PolG:['Prof. Gefahr','Prof. Störer','Prof. Gefahrenabwehr','Prof. Platzverweis','Prof. Gewahrsam'],StVO:['Prof. Blinker','Prof. Vorfahrt','Prof. Rettungsgasse','Prof. Tempo'],
  GG:['Prof. Dr. Würde','Prof. Grundrecht','Prof. Verhältnismäßigkeit','Prof. Rechtsstaat'],StPO:['Prof. Prozess','Prof. Belehrung','Prof. Richtervorbehalt','Prof. Beweis'],StGB:['Prof. Strafe','Prof. Vorsatz','Prof. Tatbestand','Prof. Zelle']};
const TOLL_AREA={2:'den Damentaler Wald',3:'die Marderacher Küste',4:'die Felsenhöhen',5:'den Knast',6:'das Lahribarer Gebirge',7:'den Unterwertheimer Canyon',8:'den Mostbacher Dschungel',9:'den Zellentrakt'};
const TOLL_FEE=300;
function lawOf(sid){const L=(SPECIES[sid]&&SPECIES[sid].law)||'';const m=L.match(/^(?:§|Art\.)\s*\d+[a-z]?\s+([A-Za-zÄÖÜäöü]+)/);return m?m[1]:null}
function lawSpecies(law){if(law==='StVO')return['promillo','bleifuss','owigon'].filter(s=>SPECIES[s]);return Object.keys(SPECIES).filter(s=>ALT_IDS.has(s)&&RAR[s]!=='legendary'&&lawOf(s)===law)}
function lawQuestions(law){if(law==='StVO')return STVO_QZ.map(q=>({src:null,q}));const out=[];for(const s of lawSpecies(law))for(const q of QZ[s]||[])out.push({src:s,q:qReal(q)});return out}
let TOLLS=null;const TOLL_OPEN=new Set();
function tollSpots(){if(TOLLS)return TOLLS;TOLLS=[];
  // face the side the visitor comes from: the neighbour that is closest to town by walking distance
  const dist=new Int32Array(MW*MH).fill(-1),q=[VSPAWN.y*MW+VSPAWN.x];dist[q[0]]=0;for(let h=0;h<q.length;h++){const i=q[h],x=i%MW,y=(i-x)/MW;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,j=ny*MW+nx;if(nx<0||ny<0||nx>=MW||ny>=MH||dist[j]>=0||!WALK0.has(MAP[j]))continue;dist[j]=dist[i]+1;q.push(j)}}
  for(const g of GATES){if(g.i==null)continue;const x=g.i%MW,y=(g.i-x)/MW;let d='down',bd=1e9;for(const[dx,dy,dn]of[[1,0,'right'],[-1,0,'left'],[0,1,'down'],[0,-1,'up']]){const j=(y+dy)*MW+x+dx;if(dist[j]>=0&&dist[j]<bd){bd=dist[j];d=dn}}
    // the professor waits beside the way and looks across it (like a trainer): whoever walks through the gate is seen
    const ok=(cx,cy)=>{const t=MAP[cy*MW+cx];return cx>0&&cy>0&&cx<MW-1&&cy<MH-1&&WALK0.has(t)&&!ENC.has(t)&&!LEDGE_DIR[t]&&![3,7,12,13,22,23,27,36].includes(t)&&!TRAINERS.some(q=>q.x===cx&&q.y===cy)&&!TOLLS.some(q=>q.x===cx&&q.y===cy)&&!(typeof SIGNSET!=='undefined'&&SIGNSET.has(cy*MW+cx))};
    const W=i=>WALK0.has(MAP[i])&&MAP[i]!==3&&!TOLLS.some(q=>q.y*MW+q.x===i)&&!TRAINERS.some(q=>q.y*MW+q.x===i);
    const noCut=(cx,cy)=>{const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[cx+a,cy+b]).filter(([a,b])=>W(b*MW+a));if(nb.length<=1)return true;
      const seen=new Set([nb[0][0]+','+nb[0][1]]),q=[nb[0]];while(q.length){const[a,b]=q.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=a+dx,Y=b+dy,k=X+','+Y;if(seen.has(k)||(X===cx&&Y===cy)||Math.abs(X-cx)>4||Math.abs(Y-cy)>4||!W(Y*MW+X))continue;seen.add(k);q.push([X,Y])}}
      return nb.every(([a,b])=>seen.has(a+','+b))};
    const passOk=(cx,cy,ddx,ddy)=>{const seen=new Set([y*MW+x]);for(let k=1;k<=5;k++){const X=cx+ddx*k,Y=cy+ddy*k;if(!W(Y*MW+X))break;seen.add(Y*MW+X)}
      const R=8,q=[];for(let yy=y-R;yy<=y+R;yy++)for(let xx=x-R;xx<=x+R;xx++){const j=yy*MW+xx;if(xx===cx&&yy===cy)continue;if(BIOME[j]!==g.b&&BIOME[j]!==0&&W(j)&&Math.abs(xx-x)+Math.abs(yy-y)>=3)q.push(j)}if(!q.length)return false;
      const vis=new Set(q);while(q.length){const i=q.pop(),ix=i%MW,iy=(i-ix)/MW;if(BIOME[i]===g.b&&Math.abs(ix-x)+Math.abs(iy-y)>=3)return true;
        for(const j of[i-1,i+1,i-MW,i+MW]){const jx=j%MW,jy=(j-jx)/MW;if(vis.has(j)||Math.abs(jx-x)>R||Math.abs(jy-y)>R||!W(j)||(jx===cx&&jy===cy))continue;if(BIOME[j]===g.b&&BIOME[i]!==g.b&&!seen.has(j)&&!seen.has(i))continue;vis.add(j);q.push(j)}}return false};
    let best=null;for(let cy=y-6;cy<=y+6;cy++)for(let cx=x-6;cx<=x+6;cx++){if((cx===x&&cy===y)||!ok(cx,cy)||!noCut(cx,cy))continue;
      for(const[dx,dy,dn]of[[1,0,'right'],[-1,0,'left'],[0,1,'down'],[0,-1,'up']])for(let k=1;k<=5;k++){const X=cx+dx*k,Y=cy+dy*k;if(!WALK0.has(MAP[Y*MW+X]))break;if(X===x&&Y===y){const road=MAP[cy*MW+cx]===4?4:0,near=(dist[cy*MW+cx]>=0&&dist[cy*MW+cx]<=dist[g.i])?0:2,sc=k+road+near;if((!best||sc<best.sc)&&passOk(cx,cy,dx,dy))best={x:cx,y:cy,d:dn,sc};break}}}
    if(!best&&g.b!==5&&g.b!==9){TOLL_OPEN.add(g.b+':'+g.i);continue}   // no room beside the way: this crossing stays open
    const px=best?best.x:x,py=best?best.y:y,pd=best?best.d:d;
    const law=TOLL_LAW[g.b],names=PROF_NAMES[law]||[TOLL_NAME[g.b]],k=TOLLS.filter(t=>TOLL_LAW[t.b]===law).length;TOLLS.push({b:g.b,x:px,y:py,gx:x,gy:y,id:'toll'+g.b+'_'+TOLLS.length,pn:names[k%names.length],n:names[k%names.length]+' ('+law+')',c:['#7a5a3a','#5a3a7a','#3a5a7a','#7a3a4a'][k%4],d:pd})}
  return TOLLS}
function tollPaid(b){return!!(RUN&&RUN.toll&&RUN.toll[b])}
function tollAt(x,y){return tollSpots().find(t=>t.x===x&&t.y===y)}
let TOLL_BUSY=0;
function tollBlock(nx,ny){if(!RUN||RUN.phase==='arena'||RUN.phase==='lobby')return false;
  // the professor only blocks his own tile; he is triggered by line of sight (tollSight), like a trainer
  const g=tollSpots().find(t=>t.x===nx&&t.y===ny);
  // crossing into an area you have not settled yet: its professor (the nearest one) calls you over first
  if(!g){const nb=BIOME[ny*MW+nx];if(ny>=MH||nb===BIOME[P.y*MW+P.x]||!TOLL_LAW[nb]||tollPaid(nb))return false;
    if(performance.now()-TOLL_BUSY>1500&&!P.lock&&!modalOpen()&&!CQ&&!B){TOLL_BUSY=performance.now();let t=null,bd=1e9;for(const q of tollSpots())if(q.b===nb){const d=Math.abs(q.x-nx)+Math.abs(q.y-ny);if(d<bd){bd=d;t=q}}
      if(t&&bd<=12)tollSpotted(t);else{TOLL_WHO=t?t.pn:null;tollDialog(nb)}}return true}
  const b=g.b;if(tollPaid(b))return true;
  if(performance.now()-TOLL_BUSY>800&&!modalOpen()&&!CQ){TOLL_BUSY=performance.now();TOLL_WHO=g?g.pn:(tollSpots().find(t=>t.b===b)||{}).pn;tollDialog(b)}return true}
// line of sight: an unpaid professor sees 5 tiles ahead; he calls you over to the Zwischenprüfung
function tollSight(){if(!RUN||RUN.phase!=='train'||P.lock||B||CQ||modalOpen())return false;const now=performance.now();
  for(const t of tollSpots()){if(tollPaid(t.b)||(t.cool||0)>now)continue;const[dx,dy]=DIRS[t.d];
    for(let k=1;k<=5;k++){const x=t.x+dx*k,y=t.y+dy*k;if(!walkable(x,y)&&!(x===P.x&&y===P.y))break;if(x===P.x&&y===P.y){tollSpotted(t);return true}}}return false}
function tollSpotted(t){P.lock=true;held.length=0;t.alert=performance.now();TOLL_WHO=t.pn;
  setTimeout(()=>talk(t.n,`Halt! Wer in ${TOLL_AREA[t.b]||'dieses Gebiet'} will, legt bei mir erst die Zwischenprüfung im ${TOLL_LAW[t.b]} ab.`,()=>{P.lock=false;if(!B&&RUN&&RUN.phase==='train')tollDialog(t.b)}),700)}
// "ZURÜCK": one step back the way you came, and the professor looks away for a moment
function tollStepBack(b){const t=tollSpots().find(q=>q.b===b);if(t)t.cool=performance.now()+2500;const back={up:[0,1],down:[0,-1],left:[1,0],right:[-1,0]}[P.d]||[0,1];
  const x=P.x+back[0],y=P.y+back[1];if(walkable(x,y))teleport(x,y)}
// tiles a professor of area b looks at (and the gate itself): the only places where you may cross into b unpaid
function tollSeen(b,x,y){if(TOLL_OPEN.has(b+':'+(y*MW+x)))return true;for(const t of tollSpots()){if(t.b!==b)continue;if(t.gx===x&&t.gy===y)return true;const[dx,dy]=DIRS[t.d];for(let k=1;k<=5;k++){const X=t.x+dx*k,Y=t.y+dy*k;if(!WALK0.has(tget(X,Y)))break;if(X===x&&Y===y)return true}}return false}
let TOLL_WHO=null;function tollName(b){return TOLL_WHO||TOLL_NAME[b]}
function tollDialog(b){const law=TOLL_LAW[b],nm=tollName(b);
  const money=RUN.money||0;
  openModal(`<h3>🎓 ${esc(nm)} — ${esc(law)}</h3><p>„Halt! Wer in ${esc(TOLL_AREA[b]||'dieses Gebiet')} will, kommt an mir nicht so einfach vorbei. Wie hätten wir’s denn gern?“</p>
   <div style="display:flex;flex-direction:column;gap:6px;text-align:left">
    <button class="btn" id="tex">📝 ZWISCHENPRÜFUNG <span class="small">— 3 Fragen zum ${esc(law)}, alle richtig = frei</span></button>
    <button class="btn ${money>=TOLL_FEE?'':'ghost'}" id="tpay" ${money>=TOLL_FEE?'':'disabled'}>💰 BESTECHEN <span class="small">— ${TOLL_FEE} $${money>=TOLL_FEE?'':' (du hast '+money+' $)'}</span></button>
    <button class="btn red" id="tfight">⚔ KÄMPFEN <span class="small">— gegen starke ${esc(law)}-Paragrafen</span></button></div>
   <div class="acts"><button class="btn ghost" id="mno">ZURÜCK</button></div>`);
  $('#mno').onclick=()=>{closeModal();tollStepBack(b)};$('#tex').onclick=()=>{closeModal();tollQuiz(b)};
  $('#tpay').onclick=()=>{if((RUN.money||0)<TOLL_FEE)return;RUN.money-=TOLL_FEE;updateHud();closeModal();tollPass(b,`${TOLL_FEE} $ — ich habe nichts gesehen`)};
  $('#tfight').onclick=()=>{closeModal();tollFight(b)}}
function tollQuiz(b){const law=TOLL_LAW[b],pool=shuffleArr(lawQuestions(law)).slice(0,3);let i=0;
  const ask=()=>{const it=pool[i],order=shuffleArr([0,1,2,3]);CQ={it,order,end:Infinity,done:false,cb:null};
    $('#cqbox').innerHTML=`<div class="sdlg"><span class="slaw">🎓 ${esc(tollName(b))} · ${esc(law)} · Frage ${i+1}/3${it.src?' · '+esc(SPECIES[it.src].law||''):''}</span><br>${esc(it.q[0])}<div id="cqexp"></div></div>
      <div class="sans">${order.map((k,j)=>`<button class="sa" data-ck="${k}"><span class="sk">${j+1}</span>${esc(it.q[1][k])}</button>`).join('')}</div><div class="sacts" id="cqact"></div>`;
    $('#cquiz').classList.add('on');document.querySelectorAll('[data-ck]').forEach(bt=>bt.onclick=()=>pick(+bt.dataset.ck))};
  const pick=k=>{if(!CQ||CQ.done)return;CQ.done=true;const ok=k===0,it=CQ.it;
    document.querySelectorAll('[data-ck]').forEach(bt=>{const kk=+bt.dataset.ck;bt.disabled=true;bt.classList.add(kk===0?'ok':kk===k?'bad':'dim')});
    $('#cqexp').innerHTML=`<div class="sexp ${ok?'ok':'bad'}">${qFb(ok,k,it.q)}</div>`;
    $('#cqact').innerHTML=`<button class="btn" id="cqnext">${ok&&i<2?'NÄCHSTE FRAGE':'WEITER'}</button>`;
    $('#cqnext').onclick=()=>{if(ok&&i<2){i++;ask();return}$('#cquiz').classList.remove('on');CQ=null;if(ok)tollPass(b,'Prüfung bestanden');else tollFail(b)}};
  CQ_PICK=pick;ask()}
let CQ_PICK=null;
function tollPass(b,why){RUN.toll=RUN.toll||{};RUN.toll[b]=1;save();sysChat(`${tollName(b)}: „${why}. Du darfst passieren!“`);toast(`Weg in ${TOLL_AREA[b]||'das Gebiet'} frei!`)}
function tollFail(b){const money=RUN.money||0;
  openModal(`<h3>🎓 NICHT BESTANDEN</h3><p>${esc(tollName(b))}: „Das reicht noch nicht. Entweder ein kleines ‚Geschenk‘ über ${TOLL_FEE} $ — oder du stellst dich meinen Paragrafen aus dem <b>${esc(TOLL_LAW[b])}</b>.“</p>
   <div class="acts"><button class="btn ${money>=TOLL_FEE?'':'ghost'}" id="tpay" ${money>=TOLL_FEE?'':'disabled'}>💰 ${TOLL_FEE} $ BESTECHEN${money>=TOLL_FEE?'':' (du hast '+money+' $)'}</button><button class="btn red" id="tfight">KÄMPFEN</button></div><div class="acts"><button class="btn ghost" id="mno">ZURÜCK</button></div>`);
  $('#mno').onclick=closeModal;$('#tpay').onclick=()=>{if((RUN.money||0)<TOLL_FEE)return;RUN.money-=TOLL_FEE;updateHud();closeModal();tollPass(b,`${TOLL_FEE} $ — ich habe nichts gesehen`)};
  $('#tfight').onclick=()=>{closeModal();tollFight(b)}}
function tollFight(b){const t=tollSpots().find(x=>x.b===b);const pool=lawSpecies(TOLL_LAW[b]);if(!t||!pool.length){tollPass(b,'Na gut');return}
  const alive=RUN.team.filter(m=>m.hp>0),n=clamp(alive.length||1,1,3),top=Math.max(...RUN.team.map(m=>m.l));
  const team=[];for(let i=0;i<n;i++)team.push([pool[Math.floor(Math.random()*pool.length)],clamp(top+1+(i===n-1?1:0),2,60)]);
  const tr={id:'toll'+b,toll:b,fixed:true,x:t.x,y:t.y,n:tollName(b),c:t.c,d:t.d,team,reward:1,line:`Dann zeige ich dir, was im ${TOLL_LAW[b]} steht!`,after:'Du darfst passieren.'};
  startTrainer(tr)}

// manual save + backup file (export/import)
function manualSave(){if(!G){toast('Noch kein Spielstand.');return}NO_SAVE=false;try{save();const raw=localStorage.getItem(SAVE_KEY);if(!raw)throw new Error('leer');toast('💾 Spielstand gespeichert ('+new Date().toTimeString().slice(0,5)+')')}catch(e){toast('Speichern fehlgeschlagen: '+e.message)}}
function exportSave(){if(!G){toast('Noch kein Spielstand.');return}save();try{const raw=localStorage.getItem(SAVE_KEY);const data=JSON.stringify({app:'pocketpeasants',v:VERSION,at:new Date().toISOString(),save:JSON.parse(raw)});
  const b=new Blob([data],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='pocketpeasants-spielstand-'+(G.name||'spieler').replace(/[^a-z0-9]+/gi,'_')+'-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);toast('Sicherungsdatei heruntergeladen.')}catch(e){toast('Export fehlgeschlagen: '+e.message)}}
function importSave(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);const sv=d&&(d.app==='knastemon'||d.app==='pocketpeasants')?d.save:d;if(!sv||typeof sv!=='object'||!sv.name)throw new Error('keine Pocket Peasants-Sicherung');
    openModal(`<h3>⬆ SPIELSTAND IMPORTIEREN</h3><p>Sicherung von <b>${esc(sv.name)}</b>${d.at?' vom '+esc(new Date(d.at).toLocaleString('de-DE')):''}${d.v?' (v'+esc(d.v)+')':''} laden? Dein aktueller Spielstand wird ersetzt.</p><div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button><button class="btn" id="myes">LADEN</button></div>`);
    $('#mno').onclick=closeModal;$('#myes').onclick=()=>{NO_SAVE=true;try{localStorage.setItem(SAVE_KEY,JSON.stringify(sv))}catch(e){toast('Import fehlgeschlagen: '+e.message);NO_SAVE=false;return}location.reload()}}catch(e){toast('Import fehlgeschlagen: '+e.message)}};r.readAsText(f)};inp.click()}

