// ===== redrawn GG lines (delivered artwork): types, looks and learnsets that fit the new monsters
// Art. 1 Würdelöwe (normal), Art. 8 Demofalke (flying, protest bird), Art. 19 Kettensprenger (fighting, chain golem)
const GG_LINES={wuerdeadler:['wuerdeadler','wuerdekaiseradler','wuerdeimperator'],demofuchs:['demofuchs','kundgebfuchs','massendemofuchs'],rechtsritter:['rechtsritter','rechtspaladin','rechtswegtitan'],
  bundesadler:['bundesadler','grosserbundesadler','verfassungsadler'],freiheitsmarder:['freiheitsmarder','entfaltungsmarder','persoenlichkeitsmarder'],gleichlinge:['gleichlinge','gleichgruppe','gleichheitsbund'],
  glaubine:['glaubine','glaubaebtissin','bekenntine'],meinungseule:['meinungseule','meinungsuhu','pressefreiheule'],posttaube:['posttaube','fernmeldetaube','geheimnistaube'],heimkroete:['heimkroete','unverletzlichkroete','heimfestungskroete']};
// which way each new artwork looks (1 = to the right)
const GG_FACE={wuerdeadler:1,wuerdekaiseradler:0,wuerdeimperator:0,demofuchs:0,kundgebfuchs:1,massendemofuchs:0,rechtsritter:0,rechtspaladin:0,rechtswegtitan:0,bundesadler:1,grosserbundesadler:1,verfassungsadler:1,
  freiheitsmarder:1,entfaltungsmarder:1,persoenlichkeitsmarder:1,gleichlinge:0,gleichgruppe:0,gleichheitsbund:0,glaubine:1,glaubaebtissin:1,bekenntine:0,meinungseule:1,meinungsuhu:1,pressefreiheule:1,
  posttaube:1,fernmeldetaube:1,geheimnistaube:1,heimkroete:0,unverletzlichkroete:0,heimfestungskroete:0};
const GG_AN={demofuchs:'flap',rechtsritter:'tank',wuerdeadler:'sniff'};
{// moves of the old type are swapped for moves of the new type with similar power (signature move included)
 const swap=(ls,from,to)=>{const used=new Set(ls.map(x=>x[1]));for(const e of ls){const mv=MOVES[e[1]];if(!mv||mv.t!==from)continue;
   const cand=Object.keys(MOVES).filter(k=>MOVES[k].t===to&&!used.has(k)&&!MOVES[k].hidden&&(MOVES[k].k||'shot')!=='self'===((mv.k||'shot')!=='self')).sort((a,b)=>Math.abs((MOVES[a].p||0)-(mv.p||0))-Math.abs((MOVES[b].p||0)-(mv.p||0)));
   if(cand[0]){used.delete(e[1]);e[1]=cand[0];used.add(cand[0])}}};
 const CH={wuerdeadler:['flying','normal'],demofuchs:['fire','flying'],rechtsritter:['rock','fighting']};
 for(const b in GG_LINES){const fT=CH[b];GG_LINES[b].forEach((id,i)=>{const sp=SPECIES[id];if(!sp)return;
   if(GG_FACE[id]!==undefined){if(GG_FACE[id])sp.faceR=1;else delete sp.faceR}
   if(GG_AN[b])sp.an=GG_AN[b];
   if(fT){sp.t=fT[1];sp.ls=sp.ls.map(x=>x.slice());swap(sp.ls,fT[0],fT[1]);
     if(i===GG_LINES[b].length-1&&EVO_SIG[fT[1]]&&!sp.ls.some(x=>x[1]===EVO_SIG[fT[1]]))sp.ls.push([40,EVO_SIG[fT[1]]]);sp.ls.sort((a,c)=>a[0]-c[0]);const seen=new Set();sp.ls=sp.ls.filter(x=>!seen.has(x[1])&&seen.add(x[1]))}})}}
