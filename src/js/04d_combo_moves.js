/* ===================== COMBO MOVES (v0.99) =====================
   Three moves that set up or block combos (mechanics + the combo table in 22g_combos.js):
   Ölfleck   (Normal)  oil shot – the target is oiled for 6 s; a miss leaves a slippery oil slick that fire ignites
   Magnetfeld (Elektro) magnetises the target for 6 s: rock and steel attacks home in on it and hit harder
   Erdung    (Gestein) ground yourself for 5 s: wet, oil, magnet and burn come off, short circuits can't hurt you */
Object.assign(MOVES,{
  oelfleck:{n:'Ölfleck',t:'normal',p:20,k:'oil',cd:3},
  magnetfeld:{n:'Magnetfeld',t:'electric',p:25,k:'magnet',cd:4},
  erdung:{n:'Erdung',t:'rock',p:0,k:'ground',cd:8}});
// who learns them: setters for their own type and for the types that profit from the combo
{const ADD={fire:[[14,'oelfleck']],electric:[[17,'magnetfeld']],rock:[[15,'erdung'],[26,'magnetfeld']],water:[[24,'erdung']]};
 const OIL=new Set(['promillo','bleifuss','fahrerflucht','sprayzi','kistenwasch','handschuhwasch','drohnix']);
 for(const sid in SPECIES){const sp=SPECIES[sid];if(!Array.isArray(sp.ls))continue;if(OIL.has(sid)&&!sp.ls.some(x=>x[1]==='oelfleck'))sp.ls.push([21,'oelfleck']);for(const e of ADD[sp.t]||[])if(!sp.ls.some(x=>x[1]===e[1]))sp.ls.push(e);sp.ls.sort((a,b)=>a[0]-b[0])}}
