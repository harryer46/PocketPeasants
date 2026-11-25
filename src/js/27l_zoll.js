// ===== ZOLL: customs officers on the routes =====
// Every few routes a customs officer stands beside the road. Whoever passes gets checked: one question per monster in the team
// (about that monster's paragraph). Any mistake → pay 100 $ customs duty or fight the officer's own customs monsters.
const ZOLL_FEE=100,ZOLL_EVERY=3;
// the customs monster: a stern bulldog in customs uniform with a stamp (own pixel artwork, 1 sprite px = 1 game px)
SPECIES.zollwaechter={n:'Zollwächter §10 ZollVG',base:'Zollwächter',sfx:'§10 ZollVG',law:'§ 10 ZollVG · Zollkontrolle',t:'normal',img:1,c:['#26406e','#d6a062','#141414'],
  b:[88,90,98,66],xp:120,an:'tank',ls:[[1,'bump'],[1,'harden'],[5,'leer'],[9,'headrush'],[13,'biss'],[17,'bodyslam'],[22,'karateschlag'],[26,'zahlungsaufforderung'],[30,'crunch'],[35,'strafschaerfung'],[40,'gegenschlag']]};
ALT_IDS.add('zollwaechter');RAR.zollwaechter='unique';
{const url='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAtCAYAAAAgJgIUAAADXUlEQVR4Xs2YQWgTQRSGNyEULUWhplA0BpUgoQQPRYqkEkGhhx4kFARPRaoU6Ukw4MHioYgg9CwipdQeRBRC6EEk6MGiQYr0ICEGCVpqlWJCQQlVRKi82cw4Oztv3iYbJR8s2dl9u++fN29m3iZgEYTDkR3KxkStthGgng+ZDEBAb2KMeoeZYnaHEoKq5AL6o3Gtk6XJB+L60PSgUchWMWuMiFYEFYGVm6sup36EBI1dIHj9cp0y8YQvESdORj05oUATc3eygj576ske68Xod3Ef2iZ7RhGX4hLhdUqC43bhSEyvAigOTB5zmXy+95Zd001X4zrRKtd//3Q/OnGUXZuat1zrhkvEnYaxyumzo45LXysll02xtNaSbjIS4Hzf8FXr8bUzwoEqiOVdQ8C5289ZW7anEFMU8gGLgh3G9+wAAbooACCgr+8gOzDAh5p75DrBHVarn9iBCeBwu2YghwN4d/+i4537UxPW1PSClc8/FdcrKw+bGgIZ7RRdnh0R45wYOCTswTkQGzqv7SgIAfJ3b2jvw3AC6jR1DId6UyfACyOXZ1Az3TpB5gTAI8DhPZZRr5mEqLhEgNJUJk92mDuFX52oZtBGAhOC5QLHdB/yAauwjPUfzGeepFRSAnJE1ORsSQRfUKDGzF2oO3Jj7+Fh69vHVyICarsZAQC6i6oFLheiS1TOl+V5dirvIVcaW/6vzTeONJGHRixWcl0JhSkARe7mepmdpxd6xEtylu1MBWzqNSj59LXGpeTfd8wVImI3ZZHACltZhIpaSf0oxJiJLcLN+BG7M4MDUWu1ZNvMFeosIkGqssbgTgH5nIILkPG0WGFUl7o8C1j84Px+kdu+RLSLjhDhaSs3AV9j1NcXZ3wsKc4XZ7fEue9IeBHwKLRmPcv0OvoC7VwkzGZmiC0axaxYnjnyuvCvCcn7gwyskKnMLdR/JceLnRqziaUNlXYkbOyH7+HwQnqjZqnlAbThOoxEAIsEQA0JrI49YedHMbZimvaOIFY7UAJaAXzxQ35eNLDvUL9/F/HNECtoAGNRA4C4rv7j2o7zEJvum5xz/ktiUnSECLLG7O7ehXZke9v+C4CyoYbE094RjydcQsplw/8/TeJJRDsd6uj8nOBTFIsuH2tsjQGofAD+AFulePa4N3+zAAAAAElFTkSuQmCC';ALT_IMG.zollwaechter=url;const im=new Image();im.onload=()=>{for(const k in SPR)if(k.split(':')[0]==='zollwaechter')delete SPR[k]};im.src=url;ALT_IM.zollwaechter=im}
if(typeof DEX_TXT!=='undefined')DEX_TXT.zollwaechter='Der Diensthund des Zolls. Riecht Schmuggelware durch drei Lagen Alufolie und stempelt alles ab, was die Grenze passiert.';
// officers: one beside the road on every third route
{const NM=['Zollinspektorin Weber','Zollsekretär Brandt','Zollinspektor Kaya','Zollobersekretärin Lenz','Zollamtfrau Petrov','Zollinspektor Haas','Zolloberinspektorin Roth','Zollsekretärin Yilmaz'];
 const LINES=['Zollkontrolle! Haben Sie etwas zu verzollen?','Moment mal – Zollkontrolle. Ihre Monster bitte!','Guten Tag, Zoll. Wir machen eine kurze Kontrolle.'];
 const bad=new Set([3,7,12,13,22,23,27,36]);const busy=(x,y)=>TRAINERS.some(t=>Math.abs(t.x-x)+Math.abs(t.y-y)<7)||(typeof tollSpots==='function'&&tollSpots().some(t=>Math.abs(t.x-x)+Math.abs(t.y-y)<7))||TOWNS.some(t=>Math.abs(t.x-x)<14&&Math.abs(t.y-y)<10);
 let k=0;for(let r=1;r<=ROUTE_N;r++){if(r%ZOLL_EVERY!==1)continue;const R=[];for(let i=0;i<MW*MH;i++)if(ROUTE_OF[i]===r&&MAP[i]===4)R.push(i);if(R.length<8)continue;R.sort((a,b)=>PROG[a]-PROG[b]);
   let spot=null;for(let off=0;off<R.length/3&&!spot;off++){for(const sgn of[1,-1]){const i=R[Math.floor(R.length/2)+sgn*off];if(i==null)continue;const x=i%MW,y=(i-x)/MW;
     for(const[dx,dy,d]of[[1,0,'left'],[-1,0,'right'],[0,1,'up'],[0,-1,'down']]){const sx=x+dx,sy=y+dy,j=sy*MW+sx,t=MAP[j];
       if(sx<1||sy<1||sx>=MW-1||sy>=MH-1||MAP[j]===4||!WALK0.has(t)||ENC.has(t)||bad.has(t)||busy(sx,sy))continue;spot={x:sx,y:sy,d};break}if(spot)break}}
   if(!spot)continue;TRAINERS.push({id:'zoll_r'+r,zoll:1,route:r,n:NM[k%NM.length],x:spot.x,y:spot.y,d:spot.d,c:'#1f5f4f',team:[],reward:1,line:LINES[k%LINES.length],after:'Alles verzollt. Gute Weiterfahrt!'});k++}}
function zollQs(){const seen=new Set();return RUN.team.map(m=>{const sp=SPECIES[m.s],pool=QZ[m.s]||(sp.evoOf&&QZ[sp.evoOf]);let q;
  if(pool&&pool.length)q=qReal(qFreshPick(pool,seen));else{const law=lawOf(m.s)||'StGB',L=lawQuestions(law);q=L.length?L[Math.floor(qRnd()*L.length)].q:qReal(VAULT_BOOK.StGB[0])}
  seen.add(q[0]);const c=q.slice();c[0]=`🐾 ${sp.base||sp.n}: ${q[0]}`;return c})}
function zollSpotted(t){if(P.lock||B||!RUN||RUN.phase!=='train')return;P.lock=true;held.length=0;t.alert=performance.now();
  setTimeout(()=>talk(t.n,`${t.line} Pro Monster eine Frage zu seinem Paragrafen – alles richtig, und Sie dürfen weiter.`,()=>{P.lock=false;if(!B&&RUN&&RUN.phase==='train')zollQuiz(t)}),700)}
function zollQuiz(t){const qs=zollQs();if(!qs.length){zollPass(t,'Ohne Monster? Na dann, gute Fahrt.');return}
  quickQuiz('🛃 ZOLLKONTROLLE',`${esc(t.n)} · eine Frage pro Monster`,qs,ok=>{const err=qs.length-ok;if(!err){zollPass(t,'Alles korrekt angemeldet. Gute Weiterfahrt!');return}zollFail(t,err)})}
function zollPass(t,why){RUN.beat=RUN.beat||{};RUN.beat[t.id]=1;save();talk(t.n,why)}
function zollFail(t,err){const money=RUN.money||0,can=money>=ZOLL_FEE;
  openModal(`<h3>🛃 BEANSTANDUNG</h3><p>${esc(t.n)}: „${err} ${err>1?'Fehler':'Fehler'} bei der Anmeldung. Entweder Sie zahlen <b>${ZOLL_FEE} $ Zollgeld</b> – oder meine Zollwächter nehmen sich Ihrer Monster an.“</p>
   <div class="acts"><button class="btn ${can?'':'ghost'}" id="zpay" ${can?'':'disabled'}>💰 ${ZOLL_FEE} $ ZOLLGELD${can?'':' (du hast '+money+' $)'}</button><button class="btn red" id="zfight">⚔ KÄMPFEN <span class="small">(${Math.min(3,err)} Zollwächter)</span></button></div>`);
  $('#zpay').onclick=()=>{if((RUN.money||0)<ZOLL_FEE)return;RUN.money-=ZOLL_FEE;updateHud();closeModal();zollPass(t,`${ZOLL_FEE} $ Zollgeld erhalten. Quittung kommt per Post. Gute Weiterfahrt!`)};
  $('#zfight').onclick=()=>{closeModal();const top=Math.max(...RUN.team.map(m=>m.l)),n=Math.min(3,err);
    startTrainer({id:t.id,zoll:1,n:t.n,c:t.c,x:t.x,y:t.y,d:t.d,fixed:true,team:Array.from({length:n},(_,i)=>['zollwaechter',clamp(top+(i===n-1?1:0),3,70)]),reward:1,line:'Dann eben auf die harte Tour!',after:t.after})}}
{const _sp=spotted;spotted=function(t){if(t&&t.zoll)return zollSpotted(t);return _sp.apply(this,arguments)}}
