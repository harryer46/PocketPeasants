/* ===================== FIELD SKILLS (like the HMs of the originals) ===================== */
// taught only by the harder trainers: CUT (Rita), SWIM (Sue), STRENGTH (Hank), FLY (Axel)
const HM={cut:{n:'ZERSCHNEIDER',i:'✂',from:'rita',d:'Fällt kleine Bäume auf Nebenwegen (z. B. zu Schreinen).'},swim:{n:'SURFER',i:'🌊',from:'sue',d:'Schwimm über Seen und Flüsse.'},
  str:{n:'STÄRKE',i:'💪',from:'hank',d:'Schiebt Felsbrocken auf Nebenwegen weg.'},fly:{n:'FLIEGEN',i:'🕊',from:'axel',d:'Abheben und frei über die Karte fliegen – über Bäume, Wasser und Felsen (Taste F / Knopf).'}};
const HM_FROM={rita:'cut',sue:'swim',hank:'str',axel:'fly'};
function hasHM(k){try{return!!(RUN&&RUN.hm&&RUN.hm[k])}catch(e){return false}}  // also called while the map is built, before the save is loaded
const FIELD=[],FIELDGONE=new Set();
function fieldAt(x,y){return FIELD.find(f=>f.x===x&&f.y===y&&!FIELDGONE.has(f.id))||null}
function walkable(x,y){const t=tget(x,y);return(WALK.has(t)||(t===3&&hasHM('swim')))&&!SIGNSET.has(y*MW+x)&&!fieldAt(x,y)}
// optional side paths to some shrines are blocked by small trees (CUT) or boulders (STRENGTH); islands need SURFER
(function placeField(){let id=0;const spots=[[70,122,'cut'],[71,123,'cut'],[150,22,'str'],[275,36,'str'],[276,124,'cut']];
  for(const[x,y,kind]of spots){let best=null,bd=9;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const X=x+dx,Y=y+dy;if(tget(X,Y)!==4)continue;const d=Math.abs(dx)+Math.abs(dy);if(d<bd){bd=d;best={x:X,y:Y}}}
    if(best&&!FIELD.some(f=>f.x===best.x&&f.y===best.y))FIELD.push({id:id++,x:best.x,y:best.y,kind})}})();
(function placeSigns(){const D4=[[1,0],[-1,0],[0,1],[0,-1]];setTimeout(()=>{const sb=$('#signbox');if(sb)sb.onclick=()=>sb.classList.remove('on')},0);
  const ARW=['→','↘','↓','↙','←','↖','↑','↗'],dirTo=(fx,fy,tx,ty)=>ARW[(Math.round(Math.atan2(ty-fy,tx-fx)/(Math.PI/4))+8)%8];
  const free=(x,y)=>{const i=y*MW+x,t=MAP[i];return x>2&&y>2&&x<MW-3&&y<MH-3&&WALK0.has(t)&&t!==4&&t!==27&&!ENC.has(t)&&t!==13&&!SIGNSET.has(i)&&!TRAINERS.some(q=>Math.abs(q.x-x)+Math.abs(q.y-y)<2)&&!GATES.some(g=>g.i===i)};
  const put=(cx,cy,o,side)=>{for(let rr=1;rr<5;rr++)for(let dy=-rr;dy<=rr;dy++)for(let dx=-rr;dx<=rr;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==rr)continue;const x=cx+dx,y=cy+dy;if(!free(x,y))continue;if(side!=null&&BIOME[y*MW+x]!==side)continue;
      // only beside a road, never inside a 1-wide corridor
      if(!D4.some(([a,b])=>tget(x+a,y+b)===4||tget(x+a,y+b)===27))continue;const open=D4.filter(([a,b])=>WALK0.has(tget(x+a,y+b))).length;if(open<3)continue;
      SIGNSET.add(y*MW+x);SIGNS.push(Object.assign({x,y},o));return true}return false};
  for(const T of TOWNS)put(T.x+2,T.y+1,{kind:'town',town:T.id,n:T.n});
  for(const g of GATES){if(g.b>8)continue;const gx=g.i%MW,gy=(g.i-gx)/MW;if(g.b===5){put(gx,gy+3,{kind:'knast',to:5,lv:[ZLV.knast.lo,ZLV.knast.hi],arrow:'↑'});continue}
    // the side the visitor comes from
    let side=null,sx=gx,sy=gy;for(const[dx,dy]of D4){const j=(gy+dy)*MW+gx+dx;if((MAP[j]===4||MAP[j]===27)&&BIOME[j]!==g.b){side=BIOME[j];sx=gx+dx*3;sy=gy+dy*3;break}}
    const z=BKEYS[g.b],L=ZLV[z]||{lo:1,hi:1};put(sx,sy,{kind:'pass',to:g.b,lv:[L.lo,L.hi],arrow:dirTo(sx,sy,gx,gy)},side)}
})();
function signShort(sg){return sg.kind==='town'?sg.n:`${sg.arrow||''} ${BNAME[sg.to]} · Lv ${sg.lv[0]}–${sg.lv[1]}`}
function signText(sg){if(sg.kind==='knast')return`<b>⛓ KNAST ⛓</b> · Lv ${sg.lv[0]}–${sg.lv[1]}<br>Justizvollzugsanstalt im Unterwertheimer Krater.<br>Hier sitzen nur StGB-Täter — und sie wollen raus! Nur für erfahrene Beamte.`;
  if(sg.kind==='town'){const T=TOWNS.find(t=>t.id===sg.town);return`<b>${esc((sg.n||'').toUpperCase())}</b><br>${sg.town==='vil'?'Polizeischule — ⚖ Gericht (Lobby-Turnier) · ':'Ausbildungsstätte — '}⚕ PÄD (heilen, Wiedereinstieg nach Niederlage) · 🛒 Copshop · 🎓 HfPol (Study)<br>🕊 Besuchte Städte erreichst du jederzeit per Schnellreise über die Weltkarte (M).`}
  const z=BKEYS[sg.to],pool=z?poolOf(z):[],mons=pool.map(s=>G&&G.dex&&G.dex[s]!==undefined?SPECIES[s].n:'???').join(', ');
  return`<b>${sg.arrow||''} ${BNAME[sg.to].toUpperCase()}</b> · empfohlen Lv ${sg.lv[0]}–${sg.lv[1]}<br>${TOLL_LAW&&TOLL_LAW[sg.to]?`Der Weg wird von einem Prof. bewacht (${TOLL_LAW[sg.to]}): Klausur, Bestechung oder Kampf.<br>`:''}Hier gesichtet: ${esc(mons)}`}
function showSign(sg){const el=$('#signbox');el.innerHTML=signText(sg);el.classList.add('on');clearTimeout(showSign.t);showSign.t=setTimeout(()=>el.classList.remove('on'),6000)}
function zoneAt(x,y){if(x<0||y<0||x>=MW||y>=MH)return null;return BKEYS[BIOME[y*MW+x]]}

