/* ===================== EIS & GIFT (v0.109) =====================
   Neue Typen Eis und Gift, je drei Monster mit eigener Entwicklungslinie (Sprites als Platzhalter, bis Artwork kommt),
   Gift-Attacken (auch für Pflanzen) mit Vergiftung, Eis-Attacken mit Verlangsamen/Einfrieren, neue Felder Giftwolke und Glatteis. */
TYPES.ice={n:'Eis',c:'#74cfe8'};TYPES.poison={n:'Gift',c:'#a24cc4'};
EFF.ice={grass:2,flying:2,fire:.5,water:.5,ice:.5};EFF.fire.ice=2;EFF.rock.ice=2;EFF.fighting=EFF.fighting||{};EFF.fighting.ice=2;
EFF.poison={grass:2,poison:.5,rock:.5};EFF.grass.poison=.5;EFF.fighting.poison=.5;EFF.rock.poison=2;
Object.assign(MOVES,{
  giftstachel:{n:'Giftstachel',t:'poison',p:40,fx:'psn',ch:.35},
  giftpuder:{n:'Giftpuder',t:'poison',p:15,k:'breath',fx:'psn',ch:.9,cd:5},
  saeurespray:{n:'Säurespray',t:'poison',p:40,k:'spread',fx:'debuff',psn:.25},
  schlammbombe:{n:'Schlammbombe',t:'poison',p:85,k:'lob',fx:'psn',ch:.35,cd:4},
  giftwolke:{n:'Giftwolke',t:'poison',p:20,k:'lob',fx:'psn',ch:.6,cd:7},
  eissplitter:{n:'Eissplitter',t:'ice',p:40,fx:'slow'},
  frostatem:{n:'Frostatem',t:'ice',p:55,k:'breath',fx:'slow',cd:4},
  eiszapfen:{n:'Eiszapfenhagel',t:'ice',p:70,k:'lob',fx:'stun',cd:4},
  eisstrahl:{n:'Eisstrahl',t:'ice',p:90,k:'beam',fx:'stun',cd:5},
  blizzard:{n:'Blizzard',t:'ice',p:110,k:'big',fx:'slow',cd:7}});
MOVES.toxin.t='poison';
const ICE_POISON={
  aussetzling:{n:'Aussetzling',law:'§ 221 StGB · Aussetzung',t:'ice',c:['#9fd8f0','#2a5a8a','#f2fbff'],b:[62,58,56,72],xp:58,an:'squirm',r:'common',z:['snow','north'],evo:[[24,'eisgesetzter','Eisgesetzter'],[42,'aussetzgletscher','Aussetzgletscher']]},
  kaltherz:{n:'Kaltherz',law:'§ 323c StGB · Unterlassene Hilfeleistung',t:'ice',c:['#5a8ac8','#d8f0ff','#1a2a4a'],b:[70,66,60,64],xp:62,an:'tank',r:'uncommon',z:['snow'],evo:[[26,'kaltherzog','Kaltherzog'],[44,'frostherzog','Frostherzog']]},
  notruffrost:{n:'Notruffrost',law:'§ 145 StGB · Missbrauch von Notrufen',t:'ice',c:['#d23b3b','#c8ecff','#2a3a5a'],b:[56,62,52,84],xp:58,an:'flap',r:'common',z:['snow','east'],evo:[[22,'fehlalarmfrost','Fehlalarmfrost'],[40,'notrufblizzard','Notrufblizzard']]},
  dealermolch:{n:'Dealermolch',law:'§ 29 BtMG · Unerlaubter Handel mit Betäubungsmitteln',t:'poison',c:['#7ac84a','#4a2a6a','#f2e6c8'],b:[58,66,54,76],xp:58,an:'squirm',r:'common',z:['jungle','south'],evo:[[24,'dealerdrache','Dealerdrache'],[42,'kartellwyrm','Kartellwyrm']]},
  giftmischer:{n:'Giftmischer',law:'§ 314 StGB · Gemeingefährliche Vergiftung',t:'poison',c:['#6a3a8a','#a8e04a','#f2e6c8'],b:[64,72,58,62],xp:62,an:'tank',r:'uncommon',z:['jungle','desert'],evo:[[26,'giftalchemist','Giftalchemist'],[44,'toxikologus','Toxikologus']]},
  kloakenkroete:{n:'Kloakenkröte',law:'§ 324 StGB · Gewässerverunreinigung',t:'poison',c:['#5a6a3a','#9a4ac8','#d8e8a0'],b:[72,56,66,58],xp:58,an:'sniff',r:'common',z:['south','east'],evo:[[22,'kloakenkoenig','Kloakenkönig'],[40,'sickerschlund','Sickerschlund']]}};
const IP_LS={ice:[[1,'eissplitter'],[1,'bump'],[8,'frostatem'],[14,'growl'],[19,'eiszapfen'],[27,'eisstrahl'],[34,'harden'],[40,'blizzard']],
  poison:[[1,'giftstachel'],[1,'bump'],[8,'giftpuder'],[13,'saeurespray'],[19,'giftwolke'],[26,'schlammbombe'],[33,'toxin'],[40,'sludgewave']]};
{const sfx=sp=>{const m=sp.law.match(/^(§|Art\.)\s*(\d+[a-z]?)(?:\s+([A-Za-zÄÖÜäöü]+))?/);if(m){sp.sfx='§'+m[2]+(m[3]?' '+m[3]:'');sp.base=sp.n;sp.n+=' '+sp.sfx}};
 const grow=(b,f)=>{const m=Math.max(...b);return b.map(v=>Math.round(v*f*(v===m?1.06:1)))};
 for(const id in ICE_POISON){const D=ICE_POISON[id];const ls=IP_LS[D.t].filter(x=>MOVES[x[1]]).map(x=>x.slice());
   const sp=SPECIES[id]={n:D.n,law:D.law,t:D.t,c:D.c,b:D.b,xp:D.xp,an:D.an,ls,sc:1,faceR:1,ph:1};sfx(sp);RAR_INIT[id]=D.r;RAR[id]=D.r;ALT_IDS.add(id);if(!ALT_BASES.includes(id))ALT_BASES.push(id);
   let prev=id;D.evo.forEach(([lv,eid,en],i)=>{const e=SPECIES[eid]={n:en,law:D.law,t:D.t,c:D.c,an:D.an,b:grow(D.b,i?1.8:1.4),xp:Math.round(D.xp*(i?3:2.1)),ls:ls.map(x=>x.slice()),sc:1,faceR:1,ph:1,evoOf:id};
     if(EVO_SIG[D.t])e.ls.push([lv+4,EVO_SIG[D.t]]);sfx(e);RAR_INIT[eid]=D.r;RAR[eid]=D.r;ALT_IDS.add(eid);EVOT.add(eid);SPECIES[prev].evo=[lv,eid];prev=eid});
   for(const z of D.z)if(ALT_POOLS[z]&&!ALT_POOLS[z].includes(id))ALT_POOLS[z].push(id)}}
// Gift-Attacken für Pflanzen, Eisstrahl für Wasser
{const ADD={grass:[[14,'giftpuder'],[24,'giftstachel'],[33,'schlammbombe']],water:[[28,'eisstrahl']],flying:[[30,'frostatem']]};
 for(const sid in SPECIES){const sp=SPECIES[sid];if(!Array.isArray(sp.ls)||ICE_POISON[sid])continue;for(const e of ADD[sp.t]||[])if(!sp.ls.some(x=>x[1]===e[1]))sp.ls.push(e.slice());sp.ls.sort((a,b)=>a[0]-b[0])}}
// Platzhalter-Artwork (Pixel 1:1 wie die übrigen Sprites), bis echte Sprites geliefert werden: Körper in den Artfarben,
// Eis mit Kristallzacken und Schneeflocke, Gift mit Fühlern, Flecken und Tropfen; jede Stufe größer und mit mehr Details.
function ipArt(id,t,stage,col){const rnd=mulberry32(hashStr(id)),H=[40,50,62][stage],W=Math.round(H*0.92),c=mk(W+8,H+10),x=c.getContext('2d');
  const P=(a,b,cc)=>{x.fillStyle=cc;x.fillRect(Math.round(a),Math.round(b),1,1)};const ox=4,oy=8,cx=ox+W/2,cy=oy+H*0.6,rx=W*0.4,ry=H*0.34;
  const dark=col[2],main=col[0],acc=col[1],hi='#ffffff';
  const inE=(X,Y,ax,ay,bx,by)=>((X-ax)/bx)**2+((Y-ay)/by)**2<=1;
  // feet / tail
  x.fillStyle='#14141f';x.fillRect(cx-rx*0.6-3,cy+ry-3,7,6);x.fillRect(cx+rx*0.6-4,cy+ry-3,7,6);x.fillStyle=dark;x.fillRect(cx-rx*0.6-2,cy+ry-2,5,4);x.fillRect(cx+rx*0.6-3,cy+ry-2,5,4);
  if(stage>=1){x.fillStyle='#14141f';x.fillRect(cx+rx-2,cy-2,10+stage*3,6);x.fillStyle=main;x.fillRect(cx+rx-1,cy-1,9+stage*3,4)}
  // body with outline and shading
  for(let Y=0;Y<c.height;Y++)for(let X=0;X<c.width;X++){if(!inE(X+0.5,Y+0.5,cx,cy,rx+1.2,ry+1.2))continue;if(!inE(X+0.5,Y+0.5,cx,cy,rx,ry)){P(X,Y,'#14141f');continue}
    const sh=((X-cx)/rx+(Y-cy)/ry);P(X,Y,sh>0.75?dark:sh<-0.7?hi:main);if(inE(X+0.5,Y+0.5,cx,cy+ry*0.35,rx*0.55,ry*0.45))P(X,Y,(X+Y)%7===0?main:acc)}
  // head features
  const n=t==='ice'?3+stage+Math.floor(rnd()*2):2+stage;
  for(let i=0;i<n;i++){const px=cx-rx*0.7+(i+0.5)*(rx*1.4/n),top=cy-ry;if(t==='ice'){const h=5+stage*2+Math.floor(rnd()*4);for(let k=0;k<h;k++){const w=Math.max(0,Math.round((h-k)/3));x.fillStyle='#14141f';x.fillRect(px-w-1,top-k-1,2*w+3,1);x.fillStyle=k>h*0.6?hi:'#c8f0ff';x.fillRect(px-w,top-k,2*w+1,1)}}
    else{const h=6+stage*3;x.fillStyle='#14141f';x.fillRect(px-1,top-h,3,h+1);x.fillStyle=dark;x.fillRect(px,top-h+1,1,h);x.fillStyle='#14141f';x.fillRect(px-2,top-h-3,5,4);x.fillStyle=acc;x.fillRect(px-1,top-h-2,3,2)}}
  // eyes
  const ey=cy-ry*0.25,es=rx*0.42;for(const s of[-1,1]){const ex=cx+s*es;x.fillStyle='#14141f';x.fillRect(ex-4,ey-4,9,8);x.fillStyle=hi;x.fillRect(ex-3,ey-3,7,6);x.fillStyle='#14141f';x.fillRect(ex-1+s,ey-1,3,4);x.fillStyle='#14141f';x.fillRect(ex-4,ey-6+(s<0?1:0),9,2)}
  // mouth
  x.fillStyle='#14141f';x.fillRect(cx-4,ey+6,9,2);x.fillStyle=hi;x.fillRect(cx-3,ey+6,2,1);x.fillRect(cx+2,ey+6,2,1);
  // type marks
  if(t==='ice'){const fx=cx,fy=cy+ry*0.4;x.fillStyle=hi;x.fillRect(fx-4,fy,9,1);x.fillRect(fx,fy-4,1,9);x.fillRect(fx-2,fy-2,1,1);x.fillRect(fx+2,fy+2,1,1);x.fillRect(fx+2,fy-2,1,1);x.fillRect(fx-2,fy+2,1,1)}
  else{for(let i=0;i<3+stage*2;i++){const a=rnd()*6.28,r=rnd()*0.7,sx=cx+Math.cos(a)*rx*r,sy=cy+Math.sin(a)*ry*r*0.8;x.fillStyle=acc;x.fillRect(sx,sy,2,2)}for(let i=0;i<2+stage;i++){const dx=cx-rx*0.5+rnd()*rx,dy=cy+ry-1;x.fillStyle='#14141f';x.fillRect(dx-1,dy,3,4+i%2*2);x.fillStyle=acc;x.fillRect(dx,dy,1,3+i%2*2)}}
  return c}
{for(const id in ICE_POISON){const D=ICE_POISON[id];[id,...D.evo.map(e=>e[1])].forEach((sid,st)=>{const url=ipArt(sid,D.t,st,D.c).toDataURL();SPECIES[sid].img=1;ALT_IMG[sid]=url;const im=new Image();im.onload=()=>{for(const key in SPR)if(key.split(':')[0]===sid)delete SPR[key]};im.src=url;ALT_IM[sid]=im})}}
