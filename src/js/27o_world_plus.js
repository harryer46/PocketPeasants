/* ===================== WELT+ (v0.117) =====================
   - Polizeiposten zwischen den Städten: heilen (PÄD), kleiner Laden, Schnellreise-Punkt
   - Typen passend zur Landschaft (mehr Wasser an der Küste, Pflanze/Gift im Dschungel)
   - Professoren nennen die empfohlene Stufe ihres Gebiets
   - Felsenhöhen = Verkehrsrecht (StVO + Verkehrsstraftaten)
   - eine Fallakte pro Gebiet: drei Zeugen befragen, dann beim Ermittler drei Fallfragen
   - Einsatzzentrale in Villingen: Einsatz des Tages und Übungskampf beim Ausbilder
   - Weltkarte: ❗ aktuelles Story-Ziel, 🔎 offene Fallakten, 🚓 Polizeiposten */
const ZONE_ORDER=['north','south','east','snow','west','desert','jungle'];
// ---- helper: a free tile beside the road of an area, at a fraction of the way through it ----
function wpSpot(zone,frac,taken){const b=+Object.keys(BKEYS).find(k=>BKEYS[k]===zone);const R=[];for(let i=0;i<MW*MH;i++)if(BIOME[i]===b&&MAP[i]===4)R.push(i);
  if(!R.length)return null;R.sort((a,c)=>PROG[a]-PROG[c]);const bad=new Set([3,7,12,13,22,23,27,36]);
  const busy=(x,y)=>TRAINERS.some(t=>Math.abs(t.x-x)+Math.abs(t.y-y)<5)||(taken||[]).some(t=>Math.abs(t.x-x)+Math.abs(t.y-y)<8)||TOWNS.some(t=>Math.abs(t.x-x)<9&&Math.abs(t.y-y)<7)||(typeof tollSpots==='function'&&tollSpots().some(t=>Math.abs(t.x-x)+Math.abs(t.y-y)<6));
  const mid=Math.floor(R.length*frac);for(let off=0;off<R.length;off++)for(const sg of[1,-1]){const i=R[mid+sg*off];if(i==null)continue;const x=i%MW,y=(i-x)/MW;
    for(const[dx,dy,d]of[[0,-1,'down'],[0,1,'up'],[1,0,'left'],[-1,0,'right']]){const sx=x+dx,sy=y+dy,j=sy*MW+sx,t=MAP[j];if(sx<2||sy<2||sx>=MW-2||sy>=MH-2||t===4||!WALK0.has(t)||ENC.has(t)||bad.has(t)||busy(sx,sy))continue;return{x:sx,y:sy,d}}}
  return null}
function wpNear(x0,y0,taken){for(let r=2;r<12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=x0+dx,y=y0+dy,t=MAP[y*MW+x];
  if(!WALK0.has(t)||ENC.has(t)||[3,7,12,13,22,23,27,36].includes(t)||TRAINERS.some(q=>Math.abs(q.x-x)+Math.abs(q.y-y)<3)||(taken||[]).some(q=>Math.abs(q.x-x)+Math.abs(q.y-y)<3))continue;return{x,y,d:'down'}}return null}

// ======== 3) Polizeiposten ========
const POSTS=[];
{const NM={south:'Polizeiposten Küste',east:'Polizeiposten Waldrand',snow:'Bergwacht-Posten',west:'Autobahnpolizei Felsenhöhen',desert:'Polizeiposten Canyon',jungle:'Dschungel-Revier'};
 for(const z of ZONE_ORDER.slice(1)){const s=wpSpot(z,0.5,POSTS);if(!s)continue;const t={id:'post_'+z,kind:'post',gift:'post',zone:z,n:NM[z],x:s.x,y:s.y,d:s.d,c:'#1f6fd0',team:[],reward:0,line:'',after:''};POSTS.push(t);TRAINERS.push(t)}}
function postVisited(t){return!!(RUN&&RUN.posts&&RUN.posts[t.id])}
let POST_AT=null;
function postTalk(t){if(!RUN||RUN.phase==='arena'){toast(`${t.n}: „Komm wieder, wenn dein Spiel begonnen hat!“`);return}
  if(!postVisited(t)){RUN.posts=RUN.posts||{};RUN.posts[t.id]=1;save();toast(`🚓 ${t.n}: Schnellreise-Punkt freigeschaltet!`)}
  openModal(`<h3>🚓 ${esc(t.n.toUpperCase())}</h3><p>„Moin, Kollege! Kurze Pause? Hier kannst du dein Team versorgen und dich mit dem Nötigsten eindecken.“</p>
   <div style="display:flex;flex-direction:column;gap:6px"><button class="btn" id="pheal">⚕ ERSTE HILFE <span class="small">— PÄD-Fragen wie in der Stadt</span></button><button class="btn" id="pshop">🛒 KLEINER LADEN <span class="small">— eigenes, kleineres Lager</span></button></div>
   <p class="small" style="margin-top:6px">🕊 Dieser Posten ist ein Schnellreise-Punkt (Weltkarte, Taste M).</p><div class="acts"><button class="btn ghost" id="mno">WEITER</button></div>`);
  $('#mno').onclick=closeModal;$('#pheal').onclick=()=>{closeModal();healQuiz()};$('#pshop').onclick=()=>{closeModal();POST_AT=t;openShop()}}
{const _ok=shopOK;shopOK=function(){return _ok.apply(this,arguments)||!!(POST_AT&&RUN&&!B&&Math.abs(P.x-POST_AT.x)+Math.abs(P.y-POST_AT.y)<=2)}}
{const _st=shopTown;shopTown=function(){if(POST_AT&&Math.abs(P.x-POST_AT.x)+Math.abs(P.y-POST_AT.y)<=2)return{n:POST_AT.n,x:POST_AT.x,y:POST_AT.y,id:POST_AT.id,post:1};return _st.apply(this,arguments)}}
// a post keeps half the stock of a town shop
{const _so=stockOf;stockOf=function(k,tm){const n=_so.apply(this,arguments);try{const T=shopTown();if(T&&T.post){const S=RUN.stock[stockKey()],id=tm?'tm:'+k:k,e=S[id],mx=Math.max(1,Math.ceil(((tm?STOCK_TM:(STOCK[k]||[99]))[0])/2));if(e.n>mx)e.n=mx;return e.n}}catch(e){}return n}}
{const _f=flySpots;flySpots=function(){const out=_f.apply(this,arguments);for(const t of POSTS)if(postVisited(t))out.push({n:'🚓 '+t.n,x:t.x,y:t.y+(t.d==='up'?-1:1)});return out}}

// ======== 4) Typen passend zur Landschaft ========
{const add=(z,ids)=>{const p=ALT_POOLS[z];if(!p)return;for(const s of ids)if(SPECIES[s]&&!p.includes(s))p.push(s)};
 add('south',['sprayzi','probenwolf','kloakenkroete']);add('jungle',['aaronia','heimkroete','kloakenkroete','giftmischer']);add('snow',['aussetzling','kaltherz','notruffrost']);add('desert',['dealermolch'])}

// ======== 6) Felsenhöhen = Verkehrsrecht ========
const TRAFFIC_RE=/^§\s*(142|315b|315c|315d|316|323a)\s+StGB/;
{TOLL_LAW[4]='Verkehrsrecht';PROF_NAMES.Verkehrsrecht=PROF_NAMES.StVO||['Prof. Blinker'];TOLL_AREA[4]='die Felsenhöhen (Verkehrsrecht)';
 try{for(const t of tollSpots())if(t.b===4)t.n=t.pn+' (Verkehrsrecht)'}catch(e){}
 const trafficSpecies=()=>Object.keys(SPECIES).filter(s=>ALT_IDS.has(s)&&!EVOT.has(s)&&RAR[s]!=='legendary'&&(TRAFFIC_RE.test(SPECIES[s].law||'')||['promillo','bleifuss','owigon'].includes(s)));
 const _ls=lawSpecies;lawSpecies=function(law){return law==='Verkehrsrecht'?trafficSpecies():_ls.apply(this,arguments)};
 const _lq=lawQuestions;lawQuestions=function(law){if(law!=='Verkehrsrecht')return _lq.apply(this,arguments);const out=STVO_QZ.map(q=>({src:null,q}));
   for(const s of trafficSpecies())for(const q of QZ[s]||[])out.push({src:s,q:qReal(q)});
   for(const q of CASE_QZ)if(TRAFFIC_RE.test(q[1][0])&&!qReported(q[0]))out.push({src:null,q:qReal(q)});return out}}

// ======== 5) Professoren nennen die empfohlene Stufe ========
{const _td=tollDialog;tollDialog=function(b){const r=_td.apply(this,arguments);try{const z=BKEYS[b],L=ZLV[z];if(L){const top=Math.max(...RUN.team.map(m=>m.l));const p=document.querySelector('#mbox p');
  if(p)p.insertAdjacentHTML('afterend',`<p class="small" style="margin:4px 0 8px;color:${top<L.lo?'#ef4444':'#3ddc6b'}">📈 Gebiet Lv ${L.lo}–${L.hi} · empfohlen ab Lv ${L.lo} · dein stärkstes Monster: Lv ${top}${top<L.lo?' – hier wird es hart!':''}</p>`)}}catch(e){}return r}}

// ======== 7) Fallakten: eine kleine Ermittlung pro Gebiet ========
const ACASES={
 north:{t:'Fahrradklau am Marktplatz',book:'StGB',boss:'Kommissarin Lenz',intro:'Am Marktplatz verschwinden ständig E-Bikes. Hör dich bei den Zeugen um – dann reden wir.',
   w:[['Bäckerin Rosi','Jeden Morgen um sechs schleicht ein Typ mit Bolzenschneider um die Räder. Hab ihn durchs Schaufenster gesehen.'],['Schüler Timo','Der Typ verkauft die Räder online – viel zu billig! Mein Kumpel hat eins gekauft und wusste, dass es heiß ist.'],['Hausmeister Kurt','Das Schloss war aufgeschnitten, nicht geknackt. Und im Hof lag ein leerer Akku-Karton.']],
   end:'Aufgeschnittene Schlösser – ein Regelbeispiel. Und der Käufer wusste Bescheid … Prüfen wir das rechtlich!'},
 south:{t:'Randale beim Strandfest',book:'PolG',boss:'Hauptkommissar Möwe',intro:'Beim Strandfest eskaliert jedes Jahr dieselbe Clique. Sprich mit den Leuten am Strand.',
   w:[['Strandwächterin Ina','Die Clique hat die Rettungsschwimmer bedrängt und ist nicht gegangen, als wir sie weggeschickt haben.'],['Kioskbesitzer Ole','Einer hat angekündigt, heute Nacht die Bühne anzuzünden. Alle haben’s gehört.'],['Fischer Hein','Sie verstecken Glasflaschen und Pyro in den Dünen – in einer großen Sporttasche.']],
   end:'Wegschicken, Festhalten, Durchsuchen der Tasche – das alles braucht eine Grundlage im Polizeigesetz.'},
 east:{t:'Vermisst im Damentaler Wald',book:'PolG',boss:'Kommissar Eiche',intro:'Eine Wanderin ist seit gestern vermisst. Frag die Leute im Wald, was sie gesehen haben.',
   w:[['Förster Jens','Ihr Auto steht seit gestern am Waldparkplatz. Unverschlossen, der Schlüssel steckt.'],['Pilzsammlerin Grete','Ich hab Hilferufe aus Richtung der alten Jagdhütte gehört. Die Tür ist verriegelt.'],['Hüttenwirt Sepp','Ein Gast hat nach ihr gefragt und war sehr nervös. Er wollte mir nicht sagen, wie er heißt.']],
   end:'Auto sichern, Hütte öffnen, den nervösen Gast befragen – Gefahrenabwehr pur.'},
 snow:{t:'Die Mahnwache am Gipfelkreuz',book:'GG',boss:'Verfassungsschützerin Dr. Firn',intro:'Am Gipfelkreuz wollen Bürger eine Mahnwache abhalten. Der Bürgermeister will sie verbieten. Hör dir beide Seiten an.',
   w:[['Bergführerin Anni','Die Leute sind friedlich, ohne Waffen. Sie wollen nur gegen die neue Seilbahn protestieren.'],['Pfarrer Albert','Die Mahnwache findet spontan statt – es gab keine Zeit, sie 48 Stunden vorher anzumelden.'],['Journalist Max','Der Bürgermeister hat meine Kamera beschlagnahmen lassen und mein Handy abgehört, weil ich darüber berichte!']],
   end:'Versammlungsfreiheit, Pressefreiheit, Fernmeldegeheimnis – hier stehen Grundrechte auf dem Spiel.'},
 west:{t:'Unfallflucht an der Passstraße',book:'Verkehrsrecht',boss:'Verkehrspolizist Blinkmann',intro:'An der Passstraße wurde ein Motorradfahrer abgedrängt, der Verursacher ist abgehauen. Sammle Hinweise.',
   w:[['Motorradfahrer Rocco','Ein schwarzer SUV hat mich in der Kurve überholt und abgedrängt. Danach ist er einfach weitergefahren.'],['Abschleppfahrer Udo','Den SUV hab ich gestern mit Kratzern am Kotflügel gesehen. Der Fahrer roch nach Schnaps.'],['Anwohnerin Frieda','Der SUV liefert sich jeden Abend Rennen mit einem roten Sportwagen auf der Passstraße.']],
   end:'Abhauen, Alkohol am Steuer, Rennen – das ist Verkehrsstrafrecht!'},
 desert:{t:'Überfall auf die Canyon-Tankstelle',book:'StGB',boss:'Kriminalhauptkommissarin Sand',intro:'Die Tankstelle im Canyon wurde überfallen. Die Zeugen sind noch in der Gegend.',
   w:[['Tankwart Ali','Er hat mir ein Messer gezeigt und gesagt: Kasse auf oder ich stech zu.'],['LKW-Fahrerin Bea','Draußen hat ein Komplize gewartet – die zwei sollen schon mehrere Überfälle zusammen gemacht haben.'],['Goldsucher Pit','Ein Typ wollte mir heute Morgen billig Zigarettenstangen verkaufen. Ich wette, die sind aus der Tankstelle.']],
   end:'Messer, Bande, Hehlerware – das wird ein schwerer Fall.'},
 jungle:{t:'Beweise im Dschungelcamp',book:'StPO',boss:'Staatsanwältin Liane',intro:'Im Dschungelcamp sollen Drogen gebunkert sein. Bevor wir zugreifen, brauche ich Zeugenaussagen.',
   w:[['Ranger Kofi','Der Verdächtige wohnt in der Hütte am Fluss. Nachts kommen da ständig Boote an.'],['Botanikerin Dr. Moos','Ich habe gesehen, wie er Päckchen in der Hütte seiner Nachbarin versteckt – die weiß wohl nichts davon.'],['Reiseleiter Jo','Er hat gedroht, jeden zu verprügeln, der redet. Und er hat versucht zu fliehen, als ein Polizeiboot kam.']],
   end:'Durchsuchung beim Verdächtigen und bei der Nachbarin, Sicherstellung, vorläufige Festnahme – jetzt die StPO.'}};
const CASE_NPCS=[];
{for(const z in ACASES){const C=ACASES[z],taken=[...POSTS,...CASE_NPCS];
   const bs=z==='north'?wpNear(VSPAWN.x-6,VSPAWN.y+6,taken):wpSpot(z,0.32,taken);if(!bs)continue;const boss={id:'case_'+z+'_boss',kind:'caseboss',story:'case',zone:z,n:C.boss,x:bs.x,y:bs.y,d:bs.d,c:'#7a3fd1',team:[],reward:0,line:'',after:''};CASE_NPCS.push(boss);TRAINERS.push(boss);
   C.w.forEach(([n],i)=>{const s=z==='north'?wpNear(VSPAWN.x+[12,-14,4][i],VSPAWN.y+[-10,-8,14][i],[...CASE_NPCS,...POSTS]):wpSpot(z,[0.15,0.6,0.85][i],[...CASE_NPCS,...POSTS]);if(!s)return;
     const t={id:'case_'+z+'_'+i,kind:'casewit',story:'case',zone:z,wi:i,n,x:s.x,y:s.y,d:s.d,c:'#c9a227',team:[],reward:0,line:'',after:''};CASE_NPCS.push(t);TRAINERS.push(t)})}}
function caseSt(z){RUN.acase=RUN.acase||{};return RUN.acase[z]=RUN.acase[z]||{w:[],done:0}}
function caseFound(z){const st=caseSt(z);return ACASES[z].w.filter((_,i)=>st.w[i]).length}
function caseWitness(t){const C=ACASES[t.zone],st=caseSt(t.zone);P.lock=true;held.length=0;
  talk(t.n,C.w[t.wi][1],()=>{P.lock=false;if(!st.w[t.wi]){st.w[t.wi]=1;save();const n=caseFound(t.zone);toast(`🔎 Fallakte „${C.t}“: Hinweis ${n}/3`);if(n===3)toast(`🔎 Alle Hinweise gesammelt – zurück zu ${C.boss}!`)}})}
function caseBoss(t){const z=t.zone,C=ACASES[z],st=caseSt(z),n=caseFound(z);
  if(st.done){talk(t.n,'Der Fall ist abgeschlossen – gute Arbeit, Kollege!');return}
  if(n<3){P.lock=true;held.length=0;talkChain(t.n,[`🔎 Fallakte „${C.t}“. ${C.intro}`,`Zeugen: ${C.w.map(w=>w[0]).join(', ')}. Du hast ${n} von 3 Hinweisen.`],()=>{P.lock=false;st.seen=1;save()});return}
  P.lock=true;held.length=0;talk(t.n,C.end,()=>{P.lock=false;
    const av=new Set(),qs=[];const pool=C.book==='Verkehrsrecht'?CASE_QZ.filter(q=>TRAFFIC_RE.test(q[1][0])):null;
    for(let i=0;i<12&&qs.length<3;i++){const q=pool?qFreshPick(pool,av):caseFor(C.book,av);if(!q||av.has(q[0]))continue;av.add(q[0]);qs.push(qReal(q))}
    quickQuiz('🔎 '+C.t.toUpperCase(),`${esc(C.boss)} · 2 von 3 richtig schließen den Fall`,qs,ok=>{if(ok>=2){st.done=1;const L=(ZLV[z]||{lo:5}).lo,money=200+L*12;RUN.money=(RUN.money||0)+money;RUN.items=RUN.items||{};const it=L>=40?'candy':L>=18?'great':'superp';RUN.items[it]=(RUN.items[it]||0)+(it==='candy'?1:2);
      save();updateHud();renderTeam();talk(t.n,`Fall gelöst! Hier sind ${money} $ Belohnung und ${it==='candy'?'ein Sonderbonbon':'2× '+ITEMS[it].n}.`);sysChat(`🔎 Fallakte „${C.t}“ abgeschlossen: +${money} $`)}
      else talk(t.n,'Das reicht vor Gericht noch nicht. Lies nochmal nach und komm wieder!')})})}

// ======== 8) Einsatzzentrale: Einsatz des Tages + Ausbilder ========
const HQ=[];
{const a=wpNear(VSPAWN.x+8,VSPAWN.y+4,[...CASE_NPCS]),b=a&&wpNear(a.x+3,a.y,[...CASE_NPCS,a]);
 if(a){const t={id:'hq_daily',kind:'daily',gift:'hq',n:'Einsatzleiterin Funk',x:a.x,y:a.y,d:'down',c:'#d04a1f',team:[],reward:0,line:'',after:''};HQ.push(t);TRAINERS.push(t)}
 if(b){const t={id:'hq_drill',kind:'drill',gift:'hq',n:'Ausbilder Drill',x:b.x,y:b.y,d:'down',c:'#4a7a2a',team:[],reward:0,line:'',after:''};HQ.push(t);TRAINERS.push(t)}}
const DTYPES=['fire','water','grass','electric','rock','flying','normal','dark','ice','poison','fighting'];
function today(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function daily(){if(!RUN)return null;const d=today();if(!RUN.daily||RUN.daily.d!==d){let h=0;for(const c of d)h=(h*31+c.charCodeAt(0))|0;h=Math.abs(h);const kinds=['catch','win','quiz'];const k=kinds[h%3];
  RUN.daily={d,k,ty:DTYPES[(h>>3)%DTYPES.length],n:0,goal:k==='catch'?1:k==='win'?3:10,done:0,claimed:0}}return RUN.daily}
function dailyText(D){return D.k==='catch'?`Nimm ein ${TYPES[D.ty].n}-Monster fest`:D.k==='win'?`Gewinne ${D.goal} Trainerkämpfe`:`Beantworte ${D.goal} Fragen richtig`}
function dailyBump(k,ty){const D=daily();if(!D||D.done||D.k!==k||(k==='catch'&&ty!==D.ty))return;D.n++;if(D.n>=D.goal){D.done=1;toast(`📋 Einsatz des Tages erfüllt! Hol dir die Belohnung in der Einsatzzentrale.`)}save()}
function onCatch(m){try{dailyBump('catch',SPECIES[m.s].t)}catch(e){}}
{const _tw=trainerWin;trainerWin=async function(){const t=B&&B.trainer;const r=await _tw.apply(this,arguments);try{if(t&&!t.drill)dailyBump('win')}catch(e){}return r}}
{const _ql=qsLog;qsLog=function(text,ok){const r=_ql.apply(this,arguments);try{if(ok)dailyBump('quiz')}catch(e){}return r}}
function dailyTalk(t){const D=daily();if(!D)return;
  if(D.done&&!D.claimed){D.claimed=1;const L=Math.max(...RUN.team.map(m=>m.l)),money=150+L*8;RUN.money=(RUN.money||0)+money;RUN.items=RUN.items||{};RUN.items.great=(RUN.items.great||0)+1;save();updateHud();renderTeam();talk(t.n,`Saubere Arbeit! ${money} $ und Super-Handschellen für dich. Morgen gibt’s einen neuen Einsatz.`);return}
  talk(t.n,D.claimed?'Für heute bist du durch. Morgen wartet ein neuer Einsatz!':`📋 Einsatz des Tages: ${dailyText(D)}. Stand: ${D.n}/${D.goal}. Belohnung: Geld und Super-Handschellen.`)}
const DRILL_CD=10*60000;
function drillTalk(t){const left=(RUN.drillT||0)+DRILL_CD-Date.now();if(left>0){talk(t.n,`Pause, Kollege! Nächste Übung in ${Math.ceil(left/60000)} min.`);return}
  P.lock=true;held.length=0;talk(t.n,'Übungskampf! Zwei Gegner auf deinem Niveau – keine Gnade, aber auch kein Risiko für deine Akte.',()=>{P.lock=false;if(B||!RUN)return;
    const top=Math.max(...RUN.team.map(m=>m.l)),z=ZONE_ORDER.slice().reverse().find(k=>(ZLV[k]||{lo:99}).lo<=top)||'north',pl=poolOf(z);RUN.drillT=Date.now();save();
    startTrainer({id:'drill',drill:1,fixed:true,n:t.n,c:t.c,x:t.x,y:t.y,d:t.d,team:[0,1].map(i=>[pl[Math.floor(Math.random()*pl.length)],clamp(top-1+i,2,99)]),reward:1,line:'',after:'Gut gekämpft! In zehn Minuten wieder.'})})}
{const _tw=trainerWin;trainerWin=async function(){const t=B&&B.trainer;const r=await _tw.apply(this,arguments);try{if(t&&t.drill&&RUN.beat)delete RUN.beat[t.id]}catch(e){}return r}}

// ---- talking to the new NPCs (bump), before the cave-gift handler ----
{const _b=bump;bump=function(nx,ny){const t=trainerAt(nx,ny);if(t&&t.kind){if(P.bumpCd>0)return;P.bumpCd=0.5;
  if(!RUN||RUN.phase==='lobby'){toast(`${t.n}: „Komm wieder, wenn dein Spiel begonnen hat!“`);return}
  if(t.kind==='post')return postTalk(t);if(t.kind==='casewit')return caseWitness(t);if(t.kind==='caseboss')return caseBoss(t);if(t.kind==='daily')return dailyTalk(t);if(t.kind==='drill')return drillTalk(t)}return _b.apply(this,arguments)}}

// ======== 2) Weltkarte: Story-Ziel, Fallakten, Posten ========
function storyTarget(){try{if(!storyOn())return null;const s=storyOf();if(!s.met){const t=TRAINERS.find(q=>q.id==='berater');return t?{x:t.x,y:t.y,n:'Karriereberater'}:null}
  const d=DUNGEONS.find(d=>!hasBesch(d.law));if(d){const T=TOWNS.find(t=>t.id===d.town);return T?{x:T.x,y:T.y,n:'PMLK '+T.n}:null}
  const t=TRAINERS.find(q=>q.id==='berater');return t?{x:t.x,y:t.y,n:'Karriereberater'}:null}catch(e){return null}}
{const _dm=drawMap;drawMap=function(){_dm.apply(this,arguments);try{if(!mapOpen())return;const cv=$('#mapcv'),c=cv.getContext('2d'),ts=parseFloat(cv.style.width)/MW;c.textAlign='center';
  const lab=(x,y,txt,col,f)=>{c.font=`${f}px VT323,monospace`;const w=c.measureText(txt).width+6;c.fillStyle='#14141fd8';c.fillRect(x-w/2,y-f*0.85,w,f*1.05);c.fillStyle=col;c.fillText(txt,x,y)};
  const F=Math.max(11,ts*4.5);
  for(const t of POSTS){const v=postVisited(t);const x=(t.x+.5)*ts,y=(t.y+.5)*ts;c.font=`${F}px sans-serif`;c.fillText('🚓',x,y+F*0.35);if(MAPZ>=1.5)lab(x,y+F*1.3,t.n,v?'#ffcb3d':'#c9ccd6',Math.max(9,ts*3.2))}
  if(storyOn())for(const t of CASE_NPCS){if(t.kind!=='caseboss')continue;const st=RUN&&RUN.acase&&RUN.acase[t.zone];if(st&&st.done)continue;const x=(t.x+.5)*ts,y=(t.y+.5)*ts;c.font=`${F}px sans-serif`;c.fillText('🔎',x,y+F*0.35)}
  const g=storyTarget();if(g){const x=(g.x+.5)*ts,y=(g.y-13)*ts,bl=Math.floor(performance.now()/400)%2;c.font=`bold ${F*1.4}px sans-serif`;c.fillStyle=bl?'#ff4d4d':'#ffcb3d';c.fillText('❗',x,y);lab(x,y-F*1.3,'Ziel: '+g.n,'#ff8a8a',Math.max(10,ts*3.6))}
  c.textAlign='left'}catch(e){console.warn(e)}}}
// map hover: names of the new NPCs
{const _mp=mapPick;mapPick=function(cx,cy){const r=_mp.apply(this,arguments);if(r)return r;const cv=$('#mapcv'),R=cv.getBoundingClientRect(),ts=R.width/MW,mx=(cx-R.left)/ts,my=(cy-R.top)/ts;
  for(const t of [...POSTS,...HQ,...CASE_NPCS]){if(t.story&&!storyOn())continue;if(Math.hypot(t.x+.5-mx,t.y+.5-my)<Math.max(1.6,7/ts))return(t.kind==='post'?'🚓 ':t.kind==='caseboss'?'🔎 ':'')+esc(t.n)+(t.kind==='caseboss'?' – Fallakte „'+esc(ACASES[t.zone].t)+'“':'')}return null}}
// laufbahn box: open case files
{const _ss=storyStatus;storyStatus=function(){_ss.apply(this,arguments);try{const mb=$('#mbox');if(!mb)return;const rows=Object.entries(ACASES).map(([z,C])=>{const st=RUN.acase&&RUN.acase[z]||{w:[]};const n=C.w.filter((_,i)=>st.w&&st.w[i]).length;
  return`<div>${st.done?'✅':'🔎'} <b>${esc(C.t)}</b> <span class="small">· ${esc(ZONES[z].n)} · ${st.done?'gelöst':n+'/3 Hinweise · '+esc(C.boss)}</span></div>`}).join('');
  const h=document.createElement('div');h.style.cssText='text-align:left;margin-top:8px';h.innerHTML=`<b style="display:block;margin-top:8px">Fallakten</b>${rows}`;const acts=mb.querySelector('.acts');mb.insertBefore(h,acts)}catch(e){}}}
