/* ===================== UMGEBUNGS-INTERAKTION =====================
   Geschosse nehmen unterwegs Material aus der Umgebung auf und werden stärker (je Geschoss höchstens einmal):
   Steine (Fels, Findling, Säule, Koralle), Holz, Pflanzen, Kristall, Pfützen, Öl, Feuer, Wurzeln, Funken,
   Sand (Wüste), Schnee/Eis (Gebirge), Meerwasser (Küste). Gegenläufiges schwächt: Feuer durch Pfütze → Dampf. */
const ENV_FX={
  stein:{n:'STEINHAGEL',f:1.4,c:'#a07848',d:'reißt Steine mit'},
  holz:{n:'HOLZSPLITTER',f:1.3,c:'#8a5a2b',d:'schleudert Splitter'},
  brand:{n:'FEUERSBRUNST',f:1.35,c:'#ff7a1a',d:'entzündet die Pflanze'},
  blatt:{n:'BLATTWIRBEL',f:1.3,c:'#4cbf4c',d:'reißt Blätter mit'},
  kristall:{n:'KRISTALLSPLITTER',f:1.35,c:'#9fe8ff',d:'sprengt Kristall ab'},
  flut:{n:'FLUTWELLE',f:1.35,c:'#3d8bff',d:'saugt die Pfütze auf'},
  strom:{n:'STARKSTROM',f:1.4,c:'#ffe14d',d:'jagt durchs Wasser'},
  dampf:{n:'DAMPF',f:0.7,c:'#d8e0e8',d:'verdampft in der Pfütze'},
  oel:{n:'ÖLBRAND',f:1.4,c:'#ff5a1a',d:'zündet das Öl'},
  wirbel:{n:'FEUERWIRBEL',f:1.35,c:'#ff9a3d',d:'facht die Flammen an'},
  wurzel:{n:'WURZELKRAFT',f:1.25,c:'#3d9a3d',d:'zieht Kraft aus den Wurzeln'},
  funke:{n:'FUNKENFLUG',f:1.25,c:'#fff27a',d:'lädt sich an Funken auf'},
  sand:{n:'SANDSTRAHL',f:1.3,c:'#e0c070',d:'wirbelt Sand auf'},
  eis:{n:'EISGESCHOSS',f:1.35,c:'#c8f0ff',d:'gefriert im Schnee'},
  schnee:{n:'SCHNEESTURM',f:1.3,c:'#ffffff',d:'treibt Schnee vor sich her'},
  meer:{n:'BRANDUNG',f:1.25,c:'#2f7fd0',d:'zieht Meerwasser mit'}};
const ENV_HARD={normal:1,fighting:1,rock:1};
function envOk(s){return s&&!s.cap&&!s.mel&&!s.nm&&!s.env&&!s.sub&&(s.p||0)>0&&MOVES[s.mid]&&B&&!B.tb}
function envApply(s,k,x,y){const E=ENV_FX[k];if(!E)return;s.env=k;s.am=(s.am||1)*E.f;if(E.f>1)s.r=Math.min((s.r||4)+2,s.wave?s.r+2:12);
  B.envLab=B.envLab||[];B.envLab.push({x,y:y-10,t0:performance.now(),k});if(B.envLab.length>6)B.envLab.shift();
  burst(x,y-4,E.c,10);B.envSeen=B.envSeen||{};if(!B.envSeen[k]){B.envSeen[k]=1;const A=sideF&&sideF(s.side);say(`Umgebung! ${MOVES[s.mid].n} ${E.d} – ${E.n.charAt(0)+E.n.slice(1).toLowerCase()} (${E.f>1?'+':''}${Math.round((E.f-1)*100)} %).`)}}
// obstacles: matching shots smash/burn through the first one and carry the material on instead of stopping
{const _svo=shotVsObs;shotVsObs=function(s){if(envOk(s)&&B.obs){const t=MOVES[s.mid].t;
    for(const o of B.obs){if(o.dead||o.ind)continue;if(Math.hypot(s.x-o.x,s.y-(o.y-8))>=o.r+(s.r||4))continue;const m=o.mat||(o.kind==='rock'?'rock':'plant');let k=null;
      if(m==='rock'&&o.kind==='crystal'&&(t==='water'||t==='rock'||t==='fighting'))k='kristall';
      else if(m==='rock'&&ENV_HARD[t])k='stein';
      else if(m==='wood'&&t==='fire')k='brand';else if(m==='wood'&&ENV_HARD[t])k='holz';
      else if(m==='plant'&&t==='fire')k='brand';else if(m==='plant'&&t==='grass')k='blatt';
      if(!k)break;
      if(k!=='blatt'){try{hitObs(o,s)}catch(e){}s.dead=0}
      envApply(s,k,s.x,s.y);return false}}
  return _svo.apply(this,arguments)}}
// hazards + surroundings, checked every frame for flying shots
function envTick(){if(!B||B.tb||B.state!=='fight'||!B.shots)return;const now=performance.now(),Z=B.zone||'arena',W=B.weather&&B.weather.until>now?B.weather.w:null;
  for(const s of B.shots){if(s.dead)continue;
    if(s.env){const E=ENV_FX[s.env];if(E&&E.f>1&&(!s.envT||now-s.envT>45)){s.envT=now;B.parts.push({x:s.x+(Math.random()-.5)*6,y:s.y+(Math.random()-.5)*6,vx:-s.vx*0.08+(Math.random()-.5)*20,vy:-s.vy*0.08+(Math.random()-.5)*20,life:0.3,age:0,c:E.c})}continue}
    if(!envOk(s))continue;const t=MOVES[s.mid].t;
    for(const h of B.haz||[]){if(h.until<now||Math.hypot(s.x-h.x,(s.y+8-h.y)*1.3)>h.r+(s.r||4))continue;let k=null;
      if(h.k==='puddle'){k=t==='water'?'flut':t==='electric'?'strom':t==='fire'?'dampf':null;
        if(k==='strom'){h.k='spark';h.t0=now;h.until=Math.max(h.until,now+3000)}if(k==='dampf'){h.until=now;steamPuff(h.x,h.y)}if(k==='flut')h.until=now}
      else if(h.k==='oil'&&t==='fire')k='oel';else if(h.k==='fire'&&t==='flying')k='wirbel';else if(h.k==='roots'&&t==='grass')k='wurzel';else if(h.k==='spark'&&t==='electric')k='funke';
      if(k){envApply(s,k,s.x,s.y);break}}
    if(s.env||(s.age||0)<0.15)continue;
    let k=null;if((Z==='desert'||W==='sand')&&(ENV_HARD[t]||t==='flying'))k='sand';else if(Z==='snow'&&t==='water')k='eis';else if(Z==='snow'&&t==='flying')k='schnee';else if(Z==='south'&&t==='water')k='meer';
    if(k)envApply(s,k,s.x,s.y)}}
{const _kt=kindsTick;kindsTick=function(dt){_kt(dt);try{envTick()}catch(e){console.error(e)}}}
// floating labels ("STEINHAGEL ×1,4") above the spot where the shot picked up its material
{const _da=drawArenaEv;drawArenaEv=function(c,now,layer){_da.apply(this,arguments);if(layer!==1||!B||!B.envLab)return;B.envLab=B.envLab.filter(l=>now-l.t0<1100);
  for(const l of B.envLab){const E=ENV_FX[l.k],k=(now-l.t0)/1100;c.globalAlpha=k<.75?1:(1-k)/.25;pxText(c,E.n+' ×'+String(E.f).replace('.',','),Math.round(l.x),Math.round(l.y-k*14),E.f>1?E.c:'#d8e0e8',6,'center');c.globalAlpha=1}}}
// enhanced shots get a coloured rim so they read as "charged"
{const _dv=drawVis;drawVis=function(c,s,col,now){if(s.env&&ENV_FX[s.env]&&ENV_FX[s.env].f>1){const r=Math.max(3,Math.round((s.r||4)/2)*2+2),X=Math.round(s.x/2)*2,Y=Math.round(s.y/2)*2;c.fillStyle=ENV_FX[s.env].c;c.globalAlpha=0.55+0.3*Math.sin(now/60);c.fillRect(X-r-2,Y-r-2,r*2+4,r*2+4);c.globalAlpha=1}return _dv.apply(this,arguments)}}
