/* ===================== FIELD SKILLS (like the HMs of the originals) ===================== */
// taught only by the harder trainers: CUT (Rita), SWIM (Sue), STRENGTH (Hank), FLY (Axel)
const HM={cut:{n:'ZERSCHNEIDER',i:'✂',from:'rita',d:'Fällt die Bäumchen, die eine Abkürzung von der Stadt in den Ostwald verstecken.'},swim:{n:'SURFER',i:'🌊',from:'sue',d:'Schwimm über Seen und Flüsse.'},
  str:{n:'STÄRKE',i:'💪',from:'hank',d:'Schiebt die Felsen weg, die eine Abkürzung von der Stadt in die Westhügel versperren.'},fly:{n:'FLIEGEN',i:'🕊',from:'axel',d:'Flieg von der Weltkarte aus in die Stadt oder zu jedem Schild.'}};
const HM_FROM={rita:'cut',sue:'swim',hank:'str',axel:'fly'};
function hasHM(k){try{return!!(RUN&&RUN.hm&&RUN.hm[k])}catch(e){return false}}  // also called while the map is built, before the save is loaded
const FIELD=[],FIELDGONE=new Set();
function fieldAt(x,y){return FIELD.find(f=>f.x===x&&f.y===y&&!FIELDGONE.has(f.id))||null}
function walkable(x,y){const t=tget(x,y);return(WALK.has(t)||(t===3&&hasHM('swim')))&&!SIGNSET.has(y*MW+x)&&!fieldAt(x,y)}
// shortcuts through the tree line (town→Woods) and the cliffs (town→Hills), blocked by cuttable trees / boulders
(function placeField(){const D4=[[1,0],[-1,0],[0,1],[0,-1]];let id=0;
  for(const[b,kind]of[[2,'cut'],[4,'str']]){let best=null,bd=1e9;
    for(let y=3;y<MH-3;y++)for(let x=3;x<MW-3;x++){if(BIOME[y*MW+x]!==0||!WALK0.has(MAP[y*MW+x]))continue;let near=false;for(let dy=-3;dy<=3&&!near;dy++)for(let dx=-3;dx<=3;dx++)if(BIOME[(y+dy)*MW+x+dx]===b){near=true;break}if(!near)continue;
      const d=Math.hypot(x-30,y-24);if(d<bd){bd=d;best={x,y}}}
    if(!best)continue;const par=new Int32Array(MW*MH).fill(-1),q=[best.y*MW+best.x];par[q[0]]=q[0];let hit=-1;
    for(let h=0;h<q.length&&hit<0;h++){const i=q[h],x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy;if(nx<3||ny<3||nx>=MW-3||ny>=MH-3)continue;const j=ny*MW+nx;if(par[j]>=0)continue;
      if(WALK0.has(MAP[j])&&BIOME[j]===0){par[j]=i;q.push(j);continue}par[j]=i;if(BIOME[j]===b&&WALK0.has(MAP[j])&&MAP[j]!==3){hit=j;break}q.push(j)}}
    if(hit<0)continue;const path=[];for(let i=par[hit];i!==par[i];i=par[i])path.push(i);
    for(const i of path)if(!WALK0.has(MAP[i])||MAP[i]===3){MAP[i]=BASE_T[BIOME[i]]||0;FIELD.push({id:id++,x:i%MW,y:(i-i%MW)/MW,kind})}}
})();
(function placeSigns(){
  const D4=[[1,0],[-1,0],[0,1],[0,-1]],cen={},lv={};setTimeout(()=>{const sb=$('#signbox');if(sb)sb.onclick=()=>sb.classList.remove('on')},0);
  for(let i=0;i<MW*MH;i++){if(!ENC.has(MAP[i]))continue;const b=BIOME[i],x=i%MW,y=(i-x)/MW,l=Math.max(BIO_MIN[BKEYS[b]]||1,Math.round(baseLvAt(x,y)));const c=cen[b]||(cen[b]={x:0,y:0,n:0});c.x+=x;c.y+=y;c.n++;const r=lv[b]||(lv[b]=[99,0]);r[0]=Math.min(r[0],l);r[1]=Math.max(r[1],l)}
  for(const b in cen){cen[b].x/=cen[b].n;cen[b].y/=cen[b].n}
  const reach=()=>{const seen=new Uint8Array(MW*MH),q=[24*MW+30];seen[q[0]]=1;let n=1;while(q.length){const i=q.pop(),x=i%MW,y=(i-x)/MW;for(const[dx,dy]of D4){const j=(y+dy)*MW+x+dx;if(seen[j]||!walkable(x+dx,y+dy))continue;seen[j]=1;n++;q.push(j)}}return n};
  let base=reach();
  const free=(x,y)=>x>2&&y>2&&x<MW-3&&y<MH-3&&WALK0.has(MAP[y*MW+x])&&MAP[y*MW+x]!==4&&!ENC.has(MAP[y*MW+x])&&!SIGNSET.has(y*MW+x)&&!SIGNSET.has(y*MW+x+1)&&!SIGNSET.has(y*MW+x-1)&&!TRAINERS.some(t=>Math.abs(t.x-x)+Math.abs(t.y-y)<2)&&!LEGENDS.some(L=>Math.abs(L.x-x)<3&&Math.abs(L.y-y)<3)&&!(Math.abs(x-30)<2&&Math.abs(y-24)<2)&&!FIELD.some(f=>Math.abs(f.x-x)<=2&&Math.abs(f.y-y)<=2);
  const add=(x,y,o)=>{const i=y*MW+x;SIGNSET.add(i);if(reach()!==base-1){SIGNSET.delete(i);return false}base--;SIGNS.push(Object.assign({x,y},o));return true};
  const near=(tx,ty,side,o)=>{for(let r=1;r<7;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=Math.round(tx)+dx,y=Math.round(ty)+dy;if(!free(x,y)||BIOME[y*MW+x]!==side)continue;if(add(x,y,o))return true}return false};
  // town exit nearest to the centre toward biome b (walkable for Meadow/Shore, a wall for Woods/Hills)
  const exitTo=(b,open)=>{let best=null,bd=1e9;for(let y=3;y<MH-3;y++)for(let x=3;x<MW-3;x++){if(BIOME[y*MW+x]!==0||!WALK0.has(MAP[y*MW+x]))continue;
      const R=open?1:3;let hit=false;for(let dy=-R;dy<=R&&!hit;dy++)for(let dx=-R;dx<=R;dx++){if(Math.abs(dx)+Math.abs(dy)>R)continue;if(BIOME[(y+dy)*MW+x+dx]===b&&(!open||WALK0.has(MAP[(y+dy)*MW+x+dx]))){hit=true;break}}if(!hit)continue;const d=Math.hypot(x-30,y-24)+(MAP[y*MW+x]===4?-3:0);if(d<bd){bd=d;best={x,y}}}return best};
  for(const b of[1,3]){const g=exitTo(b,true);if(g)near(g.x,g.y,0,{to:b,kind:'gate'})}
  for(const[b,via]of[[2,1],[4,3]]){const g=exitTo(b,false);if(g)near(g.x,g.y,0,{to:b,kind:'wall',via})}
  // passes: path tiles on the Meadow|Woods and Shore|Hills borders
  for(const[a,b]of[[1,2],[3,4]]){let sx=0,sy=0,n=0;for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){const i=y*MW+x;if(MAP[i]!==4||(BIOME[i]!==a&&BIOME[i]!==b))continue;if(D4.some(([dx,dy])=>{const nb=BIOME[(y+dy)*MW+x+dx];return(nb===a||nb===b)&&nb!==BIOME[i]})){sx+=x;sy+=y;n++}}
    if(!n)continue;const px=sx/n,py=sy/n;near(px,py,a,{to:b,kind:'pass'});near(px,py,b,{to:a,kind:'back'})}
  near(30,26,0,{kind:'town'});
  SIGNS.push({x:10,y:12,kind:'knast',to:5,arrow:'↑',lv:KNAST_LV.slice()});SIGNSET.add(12*MW+10);
  // arrows follow the real walking route (obstacles, cliffs, tree lines, CUT trees and boulders included), not the straight line to the area centre
  const ARW=['→','↘','↓','↙','←','↖','↑','↗'],dirTo=(fx,fy,tx,ty)=>ARW[(Math.round(Math.atan2(ty-fy,tx-fx)/(Math.PI/4))+8)%8];
  const route=(sx,sy,goal)=>{const par=new Int32Array(MW*MH).fill(-1),q=[];for(const[dx,dy]of D4){const x=sx+dx,y=sy+dy;if(walkable(x,y)){const j=y*MW+x;par[j]=j;q.push(j)}}
    for(let h=0;h<q.length;h++){const i=q[h],x=i%MW,y=(i-x)/MW;if(goal(i))return{i,par};for(const[dx,dy]of D4){const nx=x+dx,ny=y+dy,j=ny*MW+nx;if(nx<1||ny<1||nx>=MW-1||ny>=MH-1||par[j]>=0||!walkable(nx,ny))continue;par[j]=i;q.push(j)}}return null};
  for(const sg of SIGNS){if(sg.to==null||sg.kind==='knast')continue;sg.lv=lv[sg.to]?[Math.max(BIO_MIN[BKEYS[sg.to]]||1,lv[sg.to][0]-1),lv[sg.to][1]]:[1,1];
    const target=sg.kind==='back'?0:sg.to;const r=route(sg.x,sg.y,i=>BIOME[i]===target&&(target!==sg.to||ENC.has(MAP[i])||BIOME[i]!==BIOME[sg.y*MW+sg.x]));
    if(r){const path=[];for(let i=r.i;;i=r.par[i]){path.unshift(i);if(r.par[i]===i)break}const p=path[Math.min(path.length-1,10)],px=p%MW,py=(p-px)/MW;sg.arrow=dirTo(sg.x,sg.y,px,py);sg.steps=path.length}
    else{const c=cen[sg.to];if(c)sg.arrow=dirTo(sg.x,sg.y,c.x,c.y)}
    if(sg.kind==='wall')sg.field=FIELD.some(f=>f.kind===(sg.to===2?'cut':'str'))?(sg.to===2?'cut':'str'):null}
})();
function signShort(sg){return sg.kind==='town'?'Villingen-Knastningen':`${sg.arrow||''} ${BNAME[sg.to]} · Lv ${sg.lv[0]}–${sg.lv[1]}`}
function signText(sg){if(sg.kind==='knast')return`<b>⛓ KNAST ⛓</b> · Lv ${sg.lv[0]}–${sg.lv[1]}<br>Justizvollzugsanstalt Villingen-Knastningen.<br>Hier sitzen nur StGB-Täter — und sie wollen raus! Nur für erfahrene Beamte.`;if(sg.kind==='town')return`<b>VILLINGEN-KNASTNINGEN</b><br>„Schnapp sie dir alle — und ab vors Gericht!“<br>🚓 Dienststelle (Blaulicht) · ⚖ Gericht (lila Dach) · 🛒 Copshop (Turm links) · 🎓 HfPol (rechts): Study<br>Wiese ↑ und Küste ↓ sind offen. Wald und Hügel liegen dahinter.`;
  const z=BKEYS[sg.to],pool=z?poolOf(z):[],mons=pool.map(s=>G&&G.dex&&G.dex[s]!==undefined?SPECIES[s].n:'???').join(', ');
  const head=`<b>${sg.arrow||''} ${BNAME[sg.to].toUpperCase()}</b> · empfohlen Lv${sg.lv[0]}–${sg.lv[1]}`;
  if(sg.kind==='wall')return`${head}<br>${sg.to===2?'Die Baumreihe versperrt':'Die Klippen versperren'} hier den direkten Weg.<br>Der Pfeil zeigt den Weg durch ${BNAME[sg.via]} — dort gibt es einen Durchgang.${sg.field?`<br>Abkürzung: ${sg.field==='cut'?'Bäumchen mit ✂ ZERSCHNEIDER fällen':'Felsen mit 💪 STÄRKE wegschieben'} (${esc(TRAINERS.find(t=>t.id===HM[sg.field].from).n)}).`:''}`;
  if(sg.kind==='back')return`<b>${sg.arrow||''} ${BNAME[sg.to].toUpperCase()}</b> · Lv ${sg.lv[0]}–${sg.lv[1]}<br>Der Pfeil zeigt den Weg zurück nach ${BNAME[sg.to]} und weiter in die Stadt.`;
  return`${head}<br>${sg.kind==='pass'?'Bergpass — dahinter warten stärkere Monster!':'Wilde Monster werden stärker, je weiter du gehst.'}<br>Hier gesichtet:${esc(mons)}`}
function showSign(sg){const el=$('#signbox');el.innerHTML=signText(sg);el.classList.add('on');clearTimeout(showSign.t);showSign.t=setTimeout(()=>el.classList.remove('on'),6000)}
function zoneAt(x,y){if(x<0||y<0||x>=MW||y>=MH)return null;return BKEYS[BIOME[y*MW+x]]}

