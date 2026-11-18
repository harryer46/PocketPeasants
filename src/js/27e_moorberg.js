/* ===================== MOORBERG-ARCHIV (v0.97) =====================
   Gesetzessammlung Moorberg takes Boorberg's place: instead of the old shrine north of Villingen there is now an entrance
   to the Moorberg archive. Six halls in a row: the five volumes StGB → StPO → PolG → GG → OWiG wait one after another
   (each one only wakes up once the one before is beaten or caught), at the end Moorberg itself. */
Object.assign(DEX_TXT,NEW_DEX);
{const i=LEGENDS.findIndex(L=>L.id==='thunderroc');if(i>=0)LEGENDS.splice(i,1);delete ALT_LEG.thunderroc}
const MOOR_ORDER=['band_stgb','band_stpo','band_polg','band_gg','band_owig','moorberg'];
const MOOR_LV=[36,39,42,45,48,52];
(function genArchive(){
  const d=caveFindDoor(150,14);if(!d)return;tset(d.x,d.y,T_CAVE);
  const cv={id:'archiv',n:'Moorberg-Archiv',lv:[MOOR_LV[0],MOOR_LV[5]],x0:3,y0:MH+130,w:200,h:58,ex:d.x,ey:d.y,b:BIOME[(d.y+1)*MW+d.x]||1,archive:1};
  const FL=20,inC=(x,y)=>x>cv.x0&&x<cv.x0+cv.w-1&&y>cv.y0&&y<cv.y0+cv.h-1,floor=(x,y)=>{if(inC(x,y))tset(x,y,FL)};
  for(let y=cv.y0;y<cv.y0+cv.h;y++)for(let x=cv.x0;x<cv.x0+cv.w;x++){tset(x,y,11);BIOME[y*MW+x]=5}
  // 2 rows × 3 halls, snake: bottom row left → right, top row right → left
  const halls=[];for(let ry=0;ry<2;ry++)for(let rx=0;rx<3;rx++){const w=30,h=16,x=cv.x0+8+rx*64,y=cv.y0+6+(1-ry)*28;halls.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)})}
  const order=[halls[0],halls[1],halls[2],halls[5],halls[4],halls[3]];
  for(const Q of order)for(let y=Q.y;y<Q.y+Q.h;y++)for(let x=Q.x;x<Q.x+Q.w;x++)floor(x,y);
  for(let k=1;k<order.length;k++){const a=order[k-1],c=order[k];if(a.cy===c.cy){for(let x=Math.min(a.cx,c.cx);x<=Math.max(a.cx,c.cx);x++){floor(x,a.cy);floor(x,a.cy+1)}}
    else{for(let y=Math.min(a.cy,c.cy);y<=Math.max(a.cy,c.cy);y++){floor(a.cx,y);floor(a.cx+1,y)}}}
  const S=order[0];cv.sx=S.cx-8;cv.sy=S.y+S.h-1;tset(cv.sx,S.y+S.h,T_CAVE);
  CAVES.push(cv);
  // the guardians stand in the middle of each hall, blocking the way on
  order.forEach((Q,i)=>{const id=MOOR_ORDER[i];ALT_LEG[id]=id;LEGENDS.push({id,x:Q.cx,y:Q.cy,l:MOOR_LV[i],zone:'knast',moor:i,ex:d.x,ey:d.y})});
  // a sign at the entrance
  for(const dx of[1,-1,2,-2]){const x=d.x+dx,y=d.y+1,t=tget(x,y);if(!WALK0.has(t)||[3,4,27,13,7,12,22,23].includes(t)||ENC.has(t)||SIGNSET.has(y*MW+x)||TRAINERS.some(q=>q.x===x&&q.y===y))continue;SIGNSET.add(y*MW+x);SIGNS.push({x,y,kind:'archiv'});break}
})();
{const _ss=signShort;signShort=function(sg){if(sg.kind==='archiv')return'📚 Moorberg-Archiv · Lv 36–52';return _ss(sg)}}
{const _st=signText;signText=function(sg){if(sg.kind==='archiv')return'<b>📚 MOORBERG-ARCHIV</b><br>Fünf Bände bewachen die Gesetzessammlung – StGB, StPO, PolG, GG und OWiG, einer nach dem anderen. Ganz hinten wartet Moorberg selbst.';return _st(sg)}}
// one after another; the archive monsters are not "legendary"
{const _sl=startLegend;startLegend=function(L){if(L.moor!=null){const prev=MOOR_ORDER[L.moor-1];if(prev&&!(RUN.leg&&RUN.leg[prev])){toast(`${SPECIES[L.id].n} rührt sich nicht – erst ${SPECIES[prev].n} bezwingen!`);return}}
  const r=_sl.apply(this,arguments);if(L.moor!=null&&B){say(L.id==='moorberg'?'📚 Die Gesetzessammlung Moorberg schlägt auf – Zahlungsaufforderungen fliegen!':`📚 ${SPECIES[L.id].n} (Band ${L.moor+1}/5) klappt auf!`)}return r}}
// question pools for the book monsters: everything of their book (own questions + vault), Moorberg: all books, Schlechtekunst: GG (Kunstfreiheit)
(function(){const ofBook=b=>{const out=[];for(const s in QZ){const L=SPECIES[s]&&SPECIES[s].law||'';if(new RegExp('\\s'+b+'\\b').test(L))out.push(...QZ[s])}if(typeof VAULT_BOOK!=='undefined'&&VAULT_BOOK[b])out.push(...VAULT_BOOK[b]);return out};
  const map={band_stgb:'StGB',band_stpo:'StPO',band_polg:'PolG',band_gg:'GG',band_owig:'OWiG'},all=[];
  for(const s in map){QZ[s]=ofBook(map[s]);if(!QZ[s].length)QZ[s]=ofBook('PolG');all.push(...QZ[s])}
  QZ.moorberg=all;QZ.schlechtekunst=ofBook('GG')})();
