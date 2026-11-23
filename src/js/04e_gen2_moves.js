/* ===================== ATTACKEN-ÜBERARBEITUNG nach dem Gen-2-Vergleich (v0.100) =====================
   - new type Kampf (fighting) for the brawlers; Konter, Fokusstoß, Vierfaust and Muskelfaust are fighting moves
   - Knirscher is Unlicht (as in Gen 2); Biss and Dieb join it
   - no two moves of one type share a mechanic any more (Rempler/Kratzer/Tackle, Hydropumpe/Wasserwerfer, …)
   - weather: Sonnentag, Regentanz, Sandsturm
   - Gen-2 classics with their own mechanics: Schutzschild, Turbodreher, Toxin, Horrorblick, Zugabe, Reflektor,
     Lichtschild, Bauchtrommel; fighting moves Tempohieb, Karateschlag, Dynamopunch, Geowurf, Turmkick,
     Dreifachkick, Gegenschlag
   mechanics: 22h_gen2_moves.js */
TYPES.fighting={n:'Kampf',c:'#c03028'};
EFF.fighting={normal:2,rock:2,dark:2,flying:.5};EFF.flying.fighting=2;EFF.rock.fighting=.5;EFF.dark=EFF.dark||{};EFF.dark.fighting=.5;
for(const s of['pruegelklops','schlaegerkopf','schlechtekunst'])if(SPECIES[s])SPECIES[s].t='fighting';
// renamed / retyped
Object.assign(MOVES.firestorm,{n:'Flammenfächer'});                    // "Feuersturm" is Fire Blast
Object.assign(MOVES.crunch,{t:'dark',fx:'debuff',bs:{d:-1},stc:0.2});  // Gen 2: Unlicht, may lower defence
Object.assign(MOVES.gegenschlag,{n:'Konter',t:'fighting'});
for(const m of['fokusstoss','vierfaust','flexpunch'])MOVES[m].t='fighting';
// no doubles: every move of a type works differently
Object.assign(MOVES.bump,{fx:'knock'});                                 // Rempler: pushes far away
Object.assign(MOVES.scratch,{combo:3});                                 // Kratzer: three quick scratches
Object.assign(MOVES.tackle,{k:'dash',cd:1.4});                         // Tackle: charges at the target
Object.assign(MOVES.watercannon,{k:'jet',cd:5});                       // Wasserwerfer: steady jet that pushes back
Object.assign(MOVES.aurorabeam,{fx:'slow'});                            // Aurorastrahl: chills (slow)
Object.assign(MOVES.bubblebeam,{k:'rapid',rn:7});                       // Blubbstrahl: a stream of bubbles
Object.assign(MOVES.stormcrack,{k:'nova',cd:4});                       // Sturmknall: shock ring around you
Object.assign(MOVES.emberrain,{n3:1});                                  // Glutregen: three embers
Object.assign(MOVES.wingattack,{combo:2});                              // Flügelschlag: two wing beats
Object.assign(MOVES.drillpeck,{crit:0.3});                              // Bohrschnabel: often critical
Object.assign(MOVES.steelwing,{selfbs:{d:1},selfc:0.5});                // Stahlflügel: may raise defence
Object.assign(MOVES.divebomb,{recoil:0.25});                            // Sturzflug: strong, but recoil
Object.assign(MOVES.skyslam,{fx:'stun'});                               // Himmelsschlag: stuns
Object.assign(MOVES.whirlpool,{fx:'root'});                             // Whirlpool: holds the target in place
Object.assign(MOVES.sunnyday,{k:'weather',w:'sun',fx:null,bs:null,cd:12});
// new moves
Object.assign(MOVES,{
  biss:{n:'Biss',t:'dark',p:60,k:'melee',flinch:0.3},
  dieb:{n:'Dieb',t:'dark',p:40,k:'melee',thief:1},
  regentanz:{n:'Regentanz',t:'water',p:0,k:'weather',w:'rain',cd:12},
  sandsturm:{n:'Sandsturm',t:'rock',p:0,k:'weather',w:'sand',cd:12},
  schutzschild:{n:'Schutzschild',t:'normal',p:0,k:'protect',cd:7},
  turbodreher:{n:'Turbodreher',t:'normal',p:30,k:'spin',cd:3},
  toxin:{n:'Toxin',t:'grass',p:10,k:'shot',tox:1,cd:6},
  horrorblick:{n:'Horrorblick',t:'dark',p:10,k:'beam',trap:1,cd:8},
  zugabe:{n:'Zugabe',t:'normal',p:10,k:'shot',encore:1,cd:8},
  reflektor:{n:'Reflektor',t:'normal',p:0,k:'screen',scr:'mel',cd:10},
  lichtschild:{n:'Lichtschild',t:'electric',p:0,k:'screen',scr:'rng',cd:10},
  bauchtrommel:{n:'Bauchtrommel',t:'normal',p:0,k:'belly',cd:20},
  tempohieb:{n:'Tempohieb',t:'fighting',p:40,k:'melee',cd:0.4},
  karateschlag:{n:'Karateschlag',t:'fighting',p:50,k:'melee',crit:0.35},
  dynamopunch:{n:'Dynamopunch',t:'fighting',p:100,k:'melee',fx:'conf',cd:4},
  geowurf:{n:'Geowurf',t:'fighting',p:1,k:'melee',seismic:1,cd:2.5},
  turmkick:{n:'Turmkick',t:'fighting',p:85,k:'jumpkick',cd:3},
  dreifachkick:{n:'Dreifachkick',t:'fighting',p:60,k:'melee',combo:3},
  gegenschlag2:{n:'Gegenschlag',t:'fighting',p:20,k:'melee',reversal:1,cd:3}});
// learnsets: unused moves get learners, Ölfleck stays with fire and a few road monsters, fighting learns fighting
{const ADD={normal:[[7,'tackle'],[17,'schutzschild'],[22,'turbodreher'],[26,'screech'],[31,'zugabe'],[34,'reflektor'],[40,'bauchtrommel']],
  fire:[[22,'cindershell']],water:[[20,'whirlpool'],[25,'regentanz']],grass:[[19,'toxin'],[30,'schutzschild']],electric:[[24,'lichtschild']],
  rock:[[21,'sandsturm'],[33,'ancientpower']],flying:[[20,'turbodreher']],dark:[[4,'biss'],[10,'dieb'],[18,'crunch'],[26,'horrorblick']],
  fighting:[[1,'tempohieb'],[8,'karateschlag'],[14,'dreifachkick'],[19,'geowurf'],[24,'gegenschlag2'],[29,'turmkick'],[34,'gegenschlag'],[38,'dynamopunch'],[44,'fokusstoss']]};
 const BRAWL=new Set(['moorberg','band_stgb','band_stpo','band_polg','band_gg','band_owig','raubwolf','totschlagbock','sensenmord']);
 const GEN=new Set(['recover']);
 for(const sid in SPECIES){const sp=SPECIES[sid];if(!Array.isArray(sp.ls))continue;
   if(sp.t==='fighting')sp.ls=sp.ls.filter(e=>MOVES[e[1]]&&['normal','fighting','rock'].includes(MOVES[e[1]].t));
   for(const e of ADD[sp.t]||[])if(!sp.ls.some(x=>x[1]===e[1]))sp.ls.push(e.slice());
   if(BRAWL.has(sid))for(const e of[[20,'karateschlag'],[36,'dynamopunch']])if(!sp.ls.some(x=>x[1]===e[1]))sp.ls.push(e.slice());
   if(RAR_INIT[sid]==='legendary'&&!sp.ls.some(x=>x[1]==='recover'))sp.ls.push([30,'recover']);
   // Ibumon heals – painkiller monster
   if(sid==='ibumon'&&!sp.ls.some(x=>x[1]==='recover'))sp.ls.push([26,'recover']);
   if(sid==='schlechtekunst'||sid==='pruegelklops'||sid==='schlaegerkopf')for(const e of[[12,'vierfaust'],[27,'flexpunch']])if(!sp.ls.some(x=>x[1]===e[1]))sp.ls.push(e.slice());
   sp.ls.sort((a,b)=>a[0]-b[0])}
 if(SPECIES.kistenwasch&&!SPECIES.kistenwasch.ls.some(x=>x[1]==='watercannon'))SPECIES.kistenwasch.ls.push([33,'watercannon']);}
