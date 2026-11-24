/* ===================== UMGEBUNGS-ATTACKEN (v0.106) =====================
   Attacken, die mit Kampffeld und Hindernissen zusammenspielen (Mechanik: 22n_env_moves.js):
   Felswurf (Stein/Kampf) – wirft einen Fels, der direkt neben dir liegt (sonst nur ein Kiesel)
   Kurzschluss (Elektro) – jagt Strom durch alle Pfützen; wer drinsteht oder nass ist, bekommt den Schlag
   Surfer (Wasser) – riesige Welle quer übers Feld, zerstört kleine Hindernisse, löscht Feuer, lässt Pfützen; per Sprint durchquerbar
   Whirlpool (Wasser) – vier wandernde Wasserwirbel, die den Gegner erfassen und festhalten
   Flächenbrand (Feuer) – entzündet Pflanzen und Holz in der Nähe, das Feuer springt weiter
   Orkan (Flug) – Sturmböe schiebt Feuer, Pfützen, Öl und Wirbel übers Feld und den Gegner zurück */
Object.assign(MOVES,{
  felswurf:{n:'Felswurf',t:'rock',p:100,k:'rockthrow',cd:3.2},
  kurzschluss:{n:'Kurzschluss',t:'electric',p:80,k:'shortcircuit',cd:6},
  flaechenbrand:{n:'Flächenbrand',t:'fire',p:55,k:'wildfire',cd:7},
  orkan:{n:'Orkan',t:'flying',p:45,k:'gale',cd:6}});
Object.assign(MOVES.surf,{k:'bigwave',p:90,cd:6});
Object.assign(MOVES.whirlpool,{k:'whirl4',p:40,cd:8,fx:null});
{const ADD={rock:[[27,'felswurf']],fighting:[[26,'felswurf']],electric:[[23,'kurzschluss']],fire:[[25,'flaechenbrand']],flying:[[24,'orkan']],water:[[20,'whirlpool']]};
 for(const sid in SPECIES){const sp=SPECIES[sid];if(!Array.isArray(sp.ls))continue;for(const e of ADD[sp.t]||[])if(!sp.ls.some(x=>x[1]===e[1]))sp.ls.push(e.slice());sp.ls.sort((a,b)=>a[0]-b[0])}}
