/* ===================== KOMBO-ÜBERSICHT (v0.125) =====================
   One table that explains every combo and field rule: how it is triggered, what it does, which attacks set it up
   and which ones finish it. Used by the attack overview (uebersicht/, exported by tools/export_uebersicht.py). */
const COMBO_INFO=[
  // [key, group, trigger, effect, set-up attacks (filter), finishing attacks (filter)]
  ['kurz','Element','Elektro-Treffer auf ein nasses Ziel','×1,5 Schaden, 0,6 s betäubt, Nässe weg (nicht bei geerdetem Ziel)',m=>m.t==='water'&&m.p>0,m=>m.t==='electric'&&m.p>0],
  ['oel','Element','Feuer-Treffer auf ein öliges Ziel','×1,6 Schaden, Verbrennung 4 s',m=>m.k==='oil',m=>m.t==='fire'&&m.p>0],
  ['lauf','Element','Feuer-Treffer auf ein Ziel mit Egelsamen','×1,4 Schaden, Verbrennung 3 s, Samen verglüht',(m,id)=>id==='leechseed',m=>m.t==='fire'&&m.p>0],
  ['dampf','Element','Feuer-Treffer auf ein nasses Ziel','nur ×0,6 Schaden – das Wasser verdampft (schlechte Kombo)',m=>m.t==='water'&&m.p>0,m=>m.t==='fire'&&m.p>0],
  ['anfach','Element','Flug-Treffer auf ein brennendes Ziel','×1,25 Schaden, Brand dauert 2 s länger',m=>m.fx==='burn',m=>m.t==='flying'&&m.p>0],
  ['loesch','Element','Wasser-Treffer auf ein brennendes Ziel','löscht den Brand (schlechte Kombo)',m=>m.fx==='burn',m=>m.t==='water'&&m.p>0],
  ['schlamm','Element','Pflanzen-Treffer auf ein nasses Ziel','Ziel 2,5 s verlangsamt',m=>m.t==='water'&&m.p>0,m=>m.t==='grass'&&m.p>0],
  ['hinter','Element','Unlicht-Treffer auf ein geblendetes Ziel','×1,5 Schaden',m=>m.k==='gloom',m=>m.t==='dark'&&m.p>0],
  ['magnet','Element','Gesteins- oder Stahl-Treffer auf ein magnetisiertes Ziel','×1,35 Schaden, Geschosse werden angezogen',m=>m.k==='magnet',(m,id)=>(m.t==='rock'||STEEL_MV.has(id))&&m.p>0],
  ['wehrlos','Zustand','beliebiger Treffer auf ein schlafendes Ziel','×1,4 Schaden',m=>m.fx==='sleep',m=>m.p>0&&m.fx!=='sleep'],
  ['nach','Zustand','Nahkampf-Treffer auf ein betäubtes Ziel','×1,3 Schaden',m=>m.fx==='stun',m=>m.k==='melee'&&m.p>0],
  ['ausz','Zustand','Kampf-Attacke gegen ein verwirrtes Ziel','×1,3 Schaden',m=>m.fx==='conf',m=>m.t==='fighting'&&m.p>0],
  ['wand','Feld','Rückstoß schleudert das Ziel gegen ein Hindernis oder den Arenarand','+50 % Schaden, 0,4 s betäubt, das Hindernis nimmt Schaden',m=>m.fx==='knock'||!!KNOCK_X[m.id],null],
  ['frost','Feld','Eis-Treffer auf ein nasses Ziel','1 s im Eisblock eingefroren',m=>m.t==='water'&&m.p>0,m=>m.t==='ice'&&m.p>0],
  ['tau','Feld','Feuer-Treffer auf ein eingefrorenes Ziel','×1,3 Schaden, der Eisblock zerspringt',m=>m.t==='ice'&&m.p>0,m=>m.t==='fire'&&m.p>0],
  ['splitter','Feld','ein Stein- oder Holzhindernis zerbricht','Splitter treffen alle Gegner im Umkreis (7 % ihrer KP)',m=>!!OBS_X[m.id],null],
  ['fest','Koop','festgebissenes oder gefesseltes Ziel wird von Mitspielern getroffen','×1,3 Schaden',(m,id)=>['biss','noodlelash'].includes(id),null],
  ['kratz','Nahkampf','zwei Kratzer-Serien kurz hintereinander am selben Ziel','senkt die Verteidigung',(m,id)=>id==='scratch',null],
  ['fury','Nahkampf','Kratzfurie trifft mehrmals in schneller Folge','jeder weitere Treffer +15 %',(m,id)=>id==='furyswipes',null],
  ['unterbr','Nahkampf','Hieb trifft ein Ziel, das gerade einen Strahl oder Fokusstoß auflädt','das Aufladen bricht ab',(m,id)=>id==='quickjab',null],
  ['parade','Nahkampf','Gegenschlag direkt nach einem erlittenen Treffer','dreifacher Schaden',(m,id)=>id==='gegenschlag2',null]];
function comboTable(){const ids=Object.keys(MOVES).filter(k=>!MOVES[k].hidden);const pick=f=>f?ids.filter(id=>{try{return f(Object.assign({id},MOVES[id]),id)}catch(e){return false}}).map(id=>MOVES[id].n).sort():[];
  return COMBO_INFO.map(([k,g,how,eff,a,b])=>({k,n:COMBO_LBL[k]||k,g,how,eff,set:pick(a),fin:pick(b)}))}
