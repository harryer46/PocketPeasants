/* ===================== DATA ===================== */
const TYPES={normal:{n:'Normal',c:'#8b8f9c'},fire:{n:'Feuer',c:'#f0642a'},water:{n:'Wasser',c:'#3d8bf2'},grass:{n:'Pflanze',c:'#2fb556'},electric:{n:'Elektro',c:'#d9a90b'},rock:{n:'Gestein',c:'#a2742c'},flying:{n:'Flug',c:'#7c83f0'}};
const EFF={fire:{grass:2,water:.5,fire:.5,rock:.5},water:{fire:2,rock:2,grass:.5,water:.5},grass:{water:2,rock:2,fire:.5,grass:.5,flying:.5},electric:{water:2,flying:2,grass:.5,electric:.5,rock:0},rock:{fire:2,flying:2,electric:2,grass:.5},flying:{grass:2,electric:.5,rock:.5},normal:{rock:.5}};
function eff(a,d){const r=EFF[a];return r&&r[d]!==undefined?r[d]:1}
// k: melee | shot | spread | multi | big | self ; fx: burn | slow | stun | drain | heal | shield | haste | knock
const MOVES={
 bump:{n:'Bump',t:'normal',p:40,k:'melee'},scratch:{n:'Claw Swipe',t:'normal',p:40,k:'melee'},quickjab:{n:'Quick Jab',t:'normal',p:30,k:'melee',cd:0.45},
 whirl:{n:'Whirl Strike',t:'normal',p:65,k:'melee',fx:'conf'},headrush:{n:'Head Rush',t:'normal',p:80,k:'melee',fx:'knock'},powernap:{n:'Power Nap',t:'normal',p:0,k:'self',fx:'heal'},
 sparkshot:{n:'Spark Shot',t:'fire',p:40,k:'shot'},emberrain:{n:'Ember Drizzle',t:'fire',p:45,k:'spread',fx:'burn'},cinderbite:{n:'Cinder Bite',t:'fire',p:65,k:'melee',fx:'burn'},
 scorchline:{n:'Scorch Line',t:'fire',p:60,k:'breath',fx:'burn'},cindershell:{n:'Cinder Shell',t:'fire',p:0,k:'self',fx:'shield'},firestorm:{n:'Firestorm',t:'fire',p:90,k:'spread'},kilnburst:{n:'Kiln Burst',t:'fire',p:105,k:'big',fx:'burn'},
 splash:{n:'Splash Shot',t:'water',p:40,k:'shot'},foamvolley:{n:'Foam Volley',t:'water',p:45,k:'multi'},waveslam:{n:'Wave Slam',t:'water',p:65,k:'melee',fx:'knock'},
 undertow:{n:'Undertow',t:'water',p:60,k:'shot',fx:'slow'},mistveil:{n:'Mist Veil',t:'water',p:0,k:'self',fx:'shield'},torrent:{n:'Riptide Rush',t:'water',p:90,k:'spread'},geyser:{n:'Geyser Pillar',t:'water',p:105,k:'air',fx:'knock'},
 leaftoss:{n:'Leaf Toss',t:'grass',p:40,k:'shot'},sapdrain:{n:'Sap Siphon',t:'grass',p:50,k:'shot',fx:'drain'},vinelash:{n:'Vine Lash',t:'grass',p:65,k:'melee',fx:'slow'},
 drowsyspores:{n:'Drowsy Spores',t:'grass',p:30,k:'shot',fx:'sleep'},bloomheal:{n:'Bloom Mend',t:'grass',p:0,k:'self',fx:'heal'},thornrain:{n:'Thorn Rain',t:'grass',p:90,k:'spread'},brambleburst:{n:'Bramble Burst',t:'grass',p:105,k:'big',fx:'slow'},
 zap:{n:'Static Zap',t:'electric',p:40,k:'shot'},sparkchain:{n:'Spark Chain',t:'electric',p:50,k:'multi'},jolt:{n:'Jolt Jab',t:'electric',p:55,k:'melee',fx:'stun'},
 staticnet:{n:'Static Net',t:'electric',p:35,k:'shot',fx:'stun'},boltstrike:{n:'Volt Lance',t:'electric',p:75,k:'beam'},stormcrack:{n:'Storm Crack',t:'electric',p:105,k:'air',fx:'stun'},
 rocktoss:{n:'Rock Toss',t:'rock',p:50,k:'shot'},gravel:{n:'Gravel Spray',t:'rock',p:55,k:'spread'},stoneskin:{n:'Stone Skin',t:'rock',p:0,k:'self',fx:'shield'},
 quakestomp:{n:'Quake Stomp',t:'rock',p:70,k:'melee',fx:'slow'},boulder:{n:'Boulder Hurl',t:'rock',p:80,k:'lob',fx:'knock'},meteor:{n:'Meteor Drop',t:'rock',p:110,k:'air',fx:'knock'},
 gust:{n:'Breeze Blast',t:'flying',p:40,k:'shot'},featherdarts:{n:'Feather Darts',t:'flying',p:45,k:'multi'},galecutter:{n:'Gale Cutter',t:'flying',p:60,k:'shot',fx:'knock'},
 updraft:{n:'Updraft',t:'flying',p:0,k:'self',fx:'haste'},divebomb:{n:'Dive Bomb',t:'flying',p:70,k:'melee'},skyslam:{n:'Sky Slam',t:'flying',p:90,k:'melee',fx:'knock'}
};
const FX_TXT={buff:'stärkt dich',debuff:'schwächt das Ziel',selfbuff:'kann dich stärken',sleep:'schläfert ein',conf:'verwirrt',burn:'verbrennt',slow:'verlangsamt',stun:'betäubt',drain:'heilt dich',heal:'heilt 30%',shield:'halbiert Schaden',haste:'beschleunigt',knock:'Rückstoß'};
// learnsets (shared by every stage of a line). Everyone starts with 2 moves, more come with levels (max 4 known).
const LS={
 fireSt:[[1,'scratch'],[1,'sparkshot'],[3,'emberrain'],[6,'cinderbite'],[8,'cindershell'],[11,'scorchline'],[14,'headrush'],[17,'firestorm'],[21,'kilnburst']],
 waterSt:[[1,'bump'],[1,'splash'],[3,'foamvolley'],[6,'waveslam'],[8,'mistveil'],[11,'undertow'],[14,'headrush'],[17,'torrent'],[21,'geyser']],
 grassSt:[[1,'bump'],[1,'leaftoss'],[3,'sapdrain'],[6,'vinelash'],[8,'bloomheal'],[11,'drowsyspores'],[14,'headrush'],[17,'thornrain'],[21,'brambleburst']],
 bird:[[1,'bump'],[1,'gust'],[4,'featherdarts'],[7,'galecutter'],[9,'updraft'],[12,'divebomb'],[16,'skyslam']],
 moss:[[1,'bump'],[1,'leaftoss'],[4,'sapdrain'],[7,'bloomheal'],[10,'vinelash'],[13,'rocktoss'],[17,'brambleburst']],
 bug:[[1,'bump'],[1,'sparkshot'],[4,'emberrain'],[7,'cinderbite'],[10,'cindershell'],[13,'scorchline'],[17,'firestorm']],
 otter:[[1,'scratch'],[1,'splash'],[4,'foamvolley'],[7,'quickjab'],[10,'waveslam'],[13,'undertow'],[17,'torrent']],
 mouse:[[1,'bump'],[1,'zap'],[4,'quickjab'],[6,'sparkchain'],[9,'jolt'],[12,'staticnet'],[15,'boltstrike'],[20,'stormcrack']],
 crab:[[1,'scratch'],[1,'rocktoss'],[4,'gravel'],[7,'stoneskin'],[10,'whirl'],[13,'quakestomp'],[16,'boulder'],[21,'meteor']],
 hog:[[1,'bump'],[1,'rocktoss'],[4,'headrush'],[7,'gravel'],[10,'quakestomp'],[13,'stoneskin'],[16,'boulder'],[21,'meteor']],
 sparrow:[[1,'gust'],[1,'zap'],[5,'sparkchain'],[8,'divebomb'],[11,'boltstrike'],[15,'stormcrack'],[18,'updraft']],
 reef:[[1,'scratch'],[1,'splash'],[5,'foamvolley'],[8,'waveslam'],[11,'stoneskin'],[14,'geyser'],[18,'boulder']],
 fox:[[1,'scratch'],[1,'leaftoss'],[5,'quickjab'],[8,'vinelash'],[11,'drowsyspores'],[14,'thornrain'],[18,'brambleburst']],
 wing:[[1,'gust'],[1,'sparkshot'],[5,'emberrain'],[8,'divebomb'],[11,'scorchline'],[14,'firestorm'],[18,'kilnburst']]
};
// b = [HP, Attack, Defense, Speed]; c = [main, belly, outline]
const SPECIES={};
// every line: base form, then evolutions at Lv 5 and Lv 10 (rare lines evolve once, at Lv 10)
function line(rar,ls,stages){let prev=null;stages.forEach((st,i)=>{const[id,n,t,form,f,c,b,xp,sc]=st;SPECIES[id]={n,t,form,f,c,b,xp,sc:sc||1,ls:LS[ls]};RAR_INIT[id]=rar;if(prev)SPECIES[prev].evo=[stages.length===2?10:(i===1?5:10),id];prev=id})}
const RAR_INIT={};
// ===== alternative monster set (from the player's own artwork, pixelated in-game to our 24px style) =====
//@inc js/data/alt_img.js
// extra moves for the alternative set
Object.assign(MOVES,{bottletoss:{n:'Bottle Toss',t:'normal',p:45,k:'lob',fx:'conf'},canewhack:{n:'Cane Whack',t:'normal',p:60,k:'melee',fx:'slow'},flexpunch:{n:'Flex Punch',t:'normal',p:75,k:'melee',fx:'knock'},painkiller:{n:'Painkiller',t:'normal',p:0,k:'self',fx:'heal'},dawncrow:{n:'Dawn Crow',t:'normal',p:0,k:'self',fx:'haste'},goldrush:{n:'Gold Rush',t:'normal',p:50,k:'multi'},heartspore:{n:'Heart Spores',t:'grass',p:35,k:'shot',fx:'sleep'},noodlelash:{n:'Noodle Lash',t:'grass',p:70,k:'melee',fx:'slow'},watercannon:{n:'Water Cannon',t:'water',p:110,k:'beam',fx:'knock'},paragraph:{n:'Paragraph Slam',t:'electric',p:75,k:'shot',fx:'conf'}});
Object.assign(LS,{
 owl:[[1,'bump'],[1,'gust'],[4,'featherdarts'],[7,'galecutter'],[9,'updraft'],[12,'divebomb'],[16,'skyslam'],[20,'whirl']],
 rooster:[[1,'scratch'],[1,'sparkshot'],[3,'emberrain'],[6,'dawncrow'],[8,'cinderbite'],[11,'scorchline'],[14,'divebomb'],[17,'firestorm'],[21,'kilnburst']],
 marten:[[1,'scratch'],[1,'quickjab'],[4,'gravel'],[7,'whirl'],[10,'powernap'],[13,'headrush'],[17,'boulder'],[21,'skyslam']],
 rentner:[[1,'bump'],[1,'bottletoss'],[4,'canewhack'],[7,'powernap'],[10,'rocktoss'],[13,'headrush'],[16,'stoneskin'],[19,'quakestomp'],[23,'meteor']],
 ibu:[[1,'bump'],[1,'quickjab'],[4,'painkiller'],[7,'whirl'],[10,'flexpunch'],[14,'headrush'],[18,'jolt']],
 shroom:[[1,'bump'],[1,'leaftoss'],[4,'heartspore'],[7,'sapdrain'],[10,'bloomheal'],[13,'goldrush'],[16,'vinelash'],[19,'thornrain'],[23,'brambleburst']]
});
// an = idle animation style; img = artwork key (megas reuse their base art with a golden aura)
function altMon(id,o,rar){SPECIES[id]=Object.assign({img:1,sc:1},o);RAR_INIT[id]=rar}
altMon('harrymon',{n:'Harrymon',t:'flying',c:['#9a5a2a','#f3dfb0','#2a1608'],b:[44,52,42,64],xp:62,ls:LS.owl,an:'flap',evo:[14,'harrymonx']},'unique');
altMon('harrymonx',{n:'Mega Harrymon',t:'flying',img:'harrymon',mega:1,c:['#9a5a2a','#f3dfb0','#2a1608'],b:[70,82,62,94],xp:150,sc:1.2,ls:LS.owl,an:'flap'},'unique');
altMon('goeggeli',{n:'Göggeli',t:'fire',c:['#d8341f','#fbeed0','#1a0d10'],b:[42,58,40,60],xp:62,ls:LS.rooster,an:'peck',evo:[14,'goeggelix']},'unique');
altMon('goeggelix',{n:'Mega Göggeli',t:'fire',img:'goeggeli',mega:1,c:['#d8341f','#fbeed0','#1a0d10'],b:[66,90,58,86],xp:150,sc:1.2,ls:LS.rooster,an:'peck'},'unique');
altMon('pfisterio',{n:'Pfisterio',t:'normal',c:['#a5622f','#f6dcae','#1d0f06'],b:[46,54,44,70],xp:62,ls:LS.marten,an:'sniff',evo:[14,'pfisteriox']},'unique');
altMon('pfisteriox',{n:'Mega Pfisterio',t:'normal',img:'pfisterio',mega:1,c:['#a5622f','#f6dcae','#1d0f06'],b:[72,80,64,100],xp:150,sc:1.2,ls:LS.marten,an:'sniff'},'unique');
altMon('zenerentner',{n:'Žene Rentner',t:'normal',c:['#3a3f6a','#f3e3cb','#120c10'],b:[56,46,46,30],xp:52,ls:LS.rentner,an:'wobble',evo:[15,'steini']},'common');
altMon('steini',{n:'Steini',t:'rock',c:['#9c8c76','#e8d8bc','#1e1712'],b:[86,70,100,24],xp:140,sc:1.1,ls:LS.rentner,an:'rock'},'common');
altMon('aaronia',{n:'Aaronia',t:'grass',c:['#d9372a','#f6c08c','#24100a'],b:[50,42,52,40],xp:48,ls:LS.shroom,an:'jelly',evo:[13,'gianlueckmon']},'common');
altMon('gianlueckmon',{n:'Gian-Lückmon',t:'grass',c:['#4f9a35','#f5c6c9','#142a0b'],b:[78,74,80,58],xp:150,sc:1.15,ls:LS.shroom,an:'sway'},'common');
altMon('ibumon',{n:'Ibumon',t:'normal',c:['#d9d6d2','#ffffff','#141414'],b:[62,66,52,48],xp:72,ls:LS.ibu,an:'flex'},'uncommon');
altMon('arenamon',{n:'Arenamon',t:'grass',c:['#e8b62a','#fff3c8','#2a1a05'],b:[100,104,96,90],xp:220,sc:1.2,ls:[[1,'leaftoss'],[1,'noodlelash'],[1,'bloomheal'],[1,'brambleburst']],an:'squirm'},'legendary');
altMon('zhang',{n:'Unmittelbarer Zhang',t:'water',faceR:1,c:['#3a7ed8','#c8d4e6','#0b1020'],b:[98,108,100,82],xp:220,sc:1.2,ls:[[1,'splash'],[1,'undertow'],[1,'mistveil'],[1,'watercannon']],an:'tank'},'legendary');
altMon('schlagstock',{n:'Schlagstock',t:'rock',c:['#3a3a42','#e8e8ee','#0a0a0e'],b:[98,118,96,86],xp:220,sc:1.15,ls:[[1,'headrush'],[1,'quakestomp'],[1,'flexpunch'],[1,'meteor']],an:'flex'},'legendary');
altMon('taser',{n:'Taser',t:'electric',c:['#f2c21a','#3cb4ff','#14141a'],b:[88,112,84,110],xp:220,sc:1.15,ls:[[1,'zap'],[1,'jolt'],[1,'staticnet'],[1,'stormcrack']],an:'rock'},'legendary');
altMon('pfefferspray',{n:'Pfefferspray',t:'fire',c:['#22232a','#d8262a','#f2b21a'],b:[92,114,90,98],xp:220,sc:1.15,ls:[[1,'sparkshot'],[1,'emberrain'],[1,'scorchline'],[1,'firestorm']],an:'flex'},'legendary');
altMon('kelle',{n:'Kelle',t:'normal',c:['#d8262a','#f4f0e8','#14141a'],b:[100,100,104,96],xp:220,sc:1.15,ls:[[1,'quickjab'],[1,'staticnet'],[1,'whirl'],[1,'headrush']],an:'wobble'},'legendary');
altMon('boorberg',{n:'Boorberg',t:'electric',c:['#6a2a5a','#f6e2b4','#1a0812'],b:[92,116,86,96],xp:220,sc:1.2,ls:[[1,'zap'],[1,'paragraph'],[1,'staticnet'],[1,'stormcrack']],an:'float'},'legendary');
// ===== classic moves (Gold/Silber) incl. buffs & debuffs. bs = stat stages {a:atk,d:def,s:spd}; stc = chance
Object.assign(MOVES,{
 tackle:{n:'Tackle',t:'normal',p:40,k:'melee'},bodyslam:{n:'Bodyslam',t:'normal',p:85,k:'melee',fx:'stun'},hyperbeam:{n:'Hyperstrahl',t:'normal',p:150,k:'beam',cd:6},
 swordsdance:{n:'Schwerttanz',t:'normal',p:0,k:'self',fx:'buff',bs:{a:2}},harden:{n:'Härtner',t:'normal',p:0,k:'self',fx:'buff',bs:{d:1}},
 growl:{n:'Heuler',t:'normal',p:10,k:'spread',fx:'debuff',bs:{a:-1}},leer:{n:'Silberblick',t:'normal',p:10,k:'shot',fx:'debuff',bs:{d:-1}},
 screech:{n:'Kreideschrei',t:'normal',p:10,k:'spread',fx:'debuff',bs:{d:-2}},scaryface:{n:'Grimasse',t:'normal',p:10,k:'shot',fx:'debuff',bs:{s:-2}},
 recover:{n:'Genesung',t:'normal',p:0,k:'self',fx:'heal'},confuseray:{n:'Konfustrahl',t:'electric',p:15,k:'beam',fx:'conf'},
 flamethrower:{n:'Flammenwurf',t:'fire',p:90,k:'breath',fx:'burn'},fireblast:{n:'Feuersturm',t:'fire',p:110,k:'air',fx:'burn'},sunnyday:{n:'Sonnentag',t:'fire',p:0,k:'self',fx:'buff',bs:{a:1,s:1}},
 hydropump:{n:'Hydropumpe',t:'water',p:110,k:'beam',fx:'knock'},surf:{n:'Surfer',t:'water',p:90,k:'spread'},bubblebeam:{n:'Blubbstrahl',t:'water',p:65,k:'beam',fx:'debuff',bs:{s:-1},stc:0.4},
 aurorabeam:{n:'Aurorastrahl',t:'water',p:65,k:'beam',fx:'debuff',bs:{a:-1},stc:0.4},withdraw:{n:'Panzerschutz',t:'water',p:0,k:'self',fx:'buff',bs:{d:1}},
 razorleaf:{n:'Rasierblatt',t:'grass',p:55,k:'multi'},solarbeam:{n:'Solarstrahl',t:'grass',p:120,k:'beam',cd:5},gigadrain:{n:'Gigasauger',t:'grass',p:60,k:'shot',fx:'drain'},
 sleeppowder:{n:'Schlafpuder',t:'grass',p:10,k:'spread',fx:'sleep'},growth:{n:'Wachstum',t:'grass',p:0,k:'self',fx:'buff',bs:{a:1}},stringshot:{n:'Fadenschuss',t:'grass',p:10,k:'spread',fx:'debuff',bs:{s:-2}},
 thunderbolt:{n:'Donnerblitz',t:'electric',p:90,k:'beam',fx:'stun'},thunder:{n:'Donner',t:'electric',p:110,k:'air',fx:'stun'},thunderwave:{n:'Donnerwelle',t:'electric',p:10,k:'shot',fx:'stun'},
 charge:{n:'Ladevorgang',t:'electric',p:0,k:'self',fx:'buff',bs:{a:1,d:1}},
 rockslide:{n:'Steinhagel',t:'rock',p:75,k:'air',fx:'stun'},earthquake:{n:'Erdbeben',t:'rock',p:100,k:'big',fx:'knock'},irontail:{n:'Eisenschweif',t:'rock',p:100,k:'melee',fx:'debuff',bs:{d:-1},stc:0.3},
 metalclaw:{n:'Metallklaue',t:'rock',p:50,k:'melee',fx:'selfbuff',bs:{a:1},stc:0.3},crunch:{n:'Knirscher',t:'rock',p:80,k:'melee',fx:'debuff',bs:{d:-1},stc:0.3},defcurl:{n:'Einigler',t:'rock',p:0,k:'self',fx:'buff',bs:{d:2}},
 ancientpower:{n:'Antik-Kraft',t:'rock',p:60,k:'lob',fx:'selfbuff',bs:{a:1,d:1,s:1},stc:0.2},
 wingattack:{n:'Flügelschlag',t:'flying',p:60,k:'melee'},drillpeck:{n:'Bohrschnabel',t:'flying',p:80,k:'melee'},aeroblast:{n:'Luftstoß',t:'flying',p:100,k:'beam'},
 agility:{n:'Agilität',t:'flying',p:0,k:'self',fx:'buff',bs:{s:2}},steelwing:{n:'Stahlflügel',t:'flying',p:70,k:'melee',fx:'selfbuff',bs:{d:1},stc:0.3},featherdance:{n:'Federtanz',t:'flying',p:10,k:'spread',fx:'debuff',bs:{a:-2}}
});
const STAT_DE={a:'Angriff',d:'Verteidigung',s:'Initiative'};
function bsText(mv){return Object.entries(mv.bs||{}).map(([k,v])=>`${STAT_DE[k]} ${v>0?'+':''}${v}`).join(', ')}
// German move names (ids stay the same)
{const DE={bump:'Rempler',scratch:'Kratzer',quickjab:'Schnellhieb',whirl:'Wirbelschlag',headrush:'Kopfnuss',powernap:'Nickerchen',sparkshot:'Funkenschuss',emberrain:'Glutregen',cinderbite:'Glutbiss',scorchline:'Sengstrahl',cindershell:'Glutpanzer',firestorm:'Feuersturm',kilnburst:'Ofenexplosion',splash:'Spritzschuss',foamvolley:'Schaumsalve',waveslam:'Wellenschlag',undertow:'Sog',mistveil:'Nebelschleier',torrent:'Strudelrausch',geyser:'Geysirsäule',leaftoss:'Blattwurf',sapdrain:'Saftsauger',vinelash:'Rankenhieb',drowsyspores:'Schlafsporen',bloomheal:'Blütenheilung',thornrain:'Dornenregen',brambleburst:'Dornenexplosion',zap:'Statikschlag',sparkchain:'Funkenkette',jolt:'Stromstoß',staticnet:'Stromnetz',boltstrike:'Voltlanze',stormcrack:'Sturmknall',rocktoss:'Steinwurf',gravel:'Kieselhagel',stoneskin:'Steinhaut',quakestomp:'Bebenstampfer',boulder:'Felswurf',meteor:'Meteorsturz',gust:'Windstoß',featherdarts:'Federpfeile',galecutter:'Sturmschnitt',updraft:'Aufwind',divebomb:'Sturzflug',skyslam:'Himmelsschlag',bottletoss:'Flaschenwurf',canewhack:'Stockhieb',flexpunch:'Muskelfaust',painkiller:'Schmerzmittel',dawncrow:'Morgenkrähen',goldrush:'Goldrausch',heartspore:'Herzsporen',noodlelash:'Nudelpeitsche',watercannon:'Wasserwerfer',paragraph:'Paragraphenhieb'};
 for(const k in DE)if(MOVES[k])MOVES[k].n=DE[k]}
const OBK_DE={rock:'Der Stein',boulder:'Der Felsbrocken',crystal:'Der Kristall',coral:'Die Koralle',pillar:'Die Säule',bush:'Der Busch',flower:'Die Blume',fern:'Der Farn',reeds:'Das Schilf',shrub:'Der Strauch',stump:'Der Baumstumpf',log:'Der Baumstamm',drift:'Das Treibholz',crate:'Die Kiste'};
Object.assign(LS,{
 L_platz:[[1,'scratch'],[1,'sparkshot'],[4,'emberrain'],[7,'quickjab'],[10,'scorchline'],[12,'rocktoss'],[14,'stoneskin'],[17,'quakestomp'],[20,'boulder'],[22,'zap'],[24,'staticnet'],[27,'boltstrike'],[31,'stormcrack']],
 L_kiste:[[1,'scratch'],[1,'quickjab'],[4,'rocktoss'],[7,'whirl'],[10,'gravel'],[13,'stoneskin'],[15,'quakestomp'],[18,'boulder'],[22,'meteor']],
 L_sicher:[[1,'gust'],[1,'zap'],[4,'featherdarts'],[7,'sparkchain'],[10,'galecutter'],[13,'jolt'],[16,'staticnet'],[19,'boltstrike'],[23,'stormcrack']],
 L_frag:[[1,'scratch'],[1,'sparkshot'],[4,'zap'],[7,'emberrain'],[10,'sparkchain'],[13,'scorchline'],[15,'staticnet'],[18,'boltstrike'],[22,'stormcrack']],
 L_adler:[[1,'gust'],[1,'featherdarts'],[5,'galecutter'],[9,'updraft'],[13,'divebomb'],[17,'skyslam'],[21,'whirl']],
 L_glaube:[[1,'bump'],[1,'sparkshot'],[4,'powernap'],[7,'emberrain'],[10,'whirl'],[13,'scorchline'],[17,'headrush'],[21,'firestorm']],
 L_meinung:[[1,'gust'],[1,'sparkshot'],[4,'featherdarts'],[7,'emberrain'],[10,'galecutter'],[14,'cinderbite'],[17,'scorchline'],[20,'firestorm'],[24,'kilnburst']],
 L_lang:[[1,'scratch'],[1,'quickjab'],[4,'sparkshot'],[7,'whirl'],[10,'emberrain'],[13,'goldrush'],[15,'scorchline'],[18,'headrush'],[22,'firestorm']],
 L_promille:[[1,'bump'],[1,'bottletoss'],[4,'splash'],[7,'foamvolley'],[10,'canewhack'],[13,'undertow'],[16,'sparkshot'],[18,'scorchline'],[21,'firestorm'],[25,'kilnburst']],
 L_poebel:[[1,'bump'],[1,'zap'],[4,'quickjab'],[7,'sparkchain'],[10,'whirl'],[14,'jolt'],[17,'staticnet'],[20,'boltstrike'],[24,'stormcrack']]
});
altMon("owigon",Object.assign({"n": "Owigon", "law": "§ 26 PolG · Ordnungswidrigkeiten", "t": "flying", "img": "p26", "c": ["#91609d", "#fce6b9", "#141414"], "b": [46, 52, 40, 62], "xp": 56, "an": "flap", "sc": 0.9, "faceR": 1},{ls:LS.bird}),'common');
altMon("ausweisadler",Object.assign({"n": "Ausweisadler", "law": "§ 27 PolG · Personenfeststellung", "t": "flying", "img": "p27", "c": ["#34418b", "#dbcdd7", "#141414"], "b": [56, 62, 52, 66], "xp": 70, "an": "flap", "sc": 0.9, "faceR": 1},{ls:LS.owl}),'uncommon');
altMon("platzfuchs",Object.assign({"n": "Platzfuchs", "law": "§ 30 PolG · Platzverweis & Aufenthaltsverbot", "t": "fire", "img": "p30", "c": ["#344185", "#fce5af", "#141414"], "b": [42, 54, 40, 60], "xp": 56, "an": "sniff", "sc": 0.88, "faceR": 1, "evo": [12, "sperrschild"]},{ls:LS.L_platz}),'common');
altMon("sperrschild",Object.assign({"n": "Sperrschild", "law": "§ 31 PolG · Aufenthaltsvorgabe & Kontaktverbot", "t": "rock", "img": "p31", "c": ["#68638a", "#fdf6f0", "#141414"], "b": [70, 74, 92, 40], "xp": 120, "an": "tank", "sc": 0.9, "evo": [22, "drohnix"]},{ls:LS.L_platz}),'common');
altMon("drohnix",Object.assign({"n": "Drohnix", "law": "§ 32 PolG · Elektronische Aufenthaltsüberwachung", "t": "electric", "img": "p32", "c": ["#f9e390", "#f9e390", "#141414"], "b": [82, 96, 82, 92], "xp": 180, "an": "float", "sc": 0.95},{ls:LS.L_platz}),'common');
altMon("zellbaer",Object.assign({"n": "Zellbär", "law": "§ 33 PolG · Gewahrsam", "t": "rock", "img": "p33", "c": ["#9792ad", "#f7e7c2", "#141414"], "b": [92, 86, 98, 40], "xp": 95, "an": "rock", "sc": 0.95},{ls:LS.hog}),'rare');
altMon("filzhund",Object.assign({"n": "Filzhund", "law": "§ 34 PolG · Durchsuchung von Personen", "t": "normal", "img": "p34", "c": ["#394691", "#fbe0b0", "#141414"], "b": [48, 56, 42, 62], "xp": 56, "an": "sniff", "sc": 0.9, "faceR": 1},{ls:LS.marten}),'common');
altMon("kistenwasch",Object.assign({"n": "Kistenwasch", "law": "§ 35 PolG · Durchsuchung von Sachen", "t": "normal", "img": "p35", "c": ["#4d4561", "#fcf0e3", "#141414"], "b": [50, 48, 52, 54], "xp": 56, "an": "sniff", "sc": 0.9, "faceR": 1, "evo": [15, "wohnkroete"]},{ls:LS.L_kiste}),'common');
altMon("wohnkroete",Object.assign({"n": "Wohnkröte", "law": "§ 36 PolG · Betreten & Durchsuchung von Wohnungen", "t": "rock", "img": "p36", "c": ["#d43937", "#fbcd6c", "#141414"], "b": [86, 70, 102, 30], "xp": 130, "an": "rock", "sc": 0.9},{ls:LS.L_kiste}),'common');
altMon("sichereule",Object.assign({"n": "Sichereule", "law": "§ 37 PolG · Sicherstellung", "t": "flying", "img": "p37", "c": ["#6e608b", "#fce7cd", "#141414"], "b": [52, 58, 48, 62], "xp": 62, "an": "flap", "sc": 0.9, "evo": [16, "beschlagigel"]},{ls:LS.L_sicher}),'uncommon');
altMon("beschlagigel",Object.assign({"n": "Beschlagigel", "law": "§ 38 PolG · Beschlagnahme", "t": "electric", "img": "p38", "c": ["#fbc418", "#fbe198", "#141414"], "b": [72, 86, 82, 70], "xp": 140, "an": "flex", "sc": 0.9, "faceR": 1},{ls:LS.L_sicher}),'uncommon');
altMon("erkennungsleon",Object.assign({"n": "Erkennungsleon", "law": "§ 41 PolG · Erkennungsdienstliche Maßnahmen", "t": "water", "img": "p41", "c": ["#f1c955", "#fcf2e6", "#141414"], "b": [56, 62, 54, 66], "xp": 70, "an": "sway", "sc": 0.88, "faceR": 1},{ls:LS.otter}),'uncommon');
altMon("fragfuchs",Object.assign({"n": "Fragfuchs", "law": "§ 43 PolG · Befragung & Datenerhebung", "t": "fire", "img": "p43", "c": ["#dc7b35", "#e4e6ed", "#141414"], "b": [46, 54, 42, 60], "xp": 56, "an": "sniff", "sc": 0.9, "faceR": 1, "evo": [15, "einwilligfee"]},{ls:LS.L_frag}),'common');
altMon("einwilligfee",Object.assign({"n": "Einwilligfee", "law": "§ 42 PolG · Datenverarbeitung aufgrund einer Einwilligung", "t": "electric", "img": "p42", "c": ["#163560", "#f9f3eb", "#141414"], "b": [64, 84, 62, 86], "xp": 130, "an": "float", "sc": 0.88},{ls:LS.L_frag}),'common');
altMon("bodycamar",Object.assign({"n": "Bodycamar", "law": "§ 44 PolG · Offener Einsatz technischer Mittel zur Bild- & Tonaufzeichnung", "t": "electric", "img": "p44", "c": ["#f74720", "#d8cadd", "#141414"], "b": [72, 92, 70, 98], "xp": 95, "an": "flap", "sc": 0.9, "faceR": 1},{ls:LS.sparrow}),'rare');
altMon("wuerdeadler",Object.assign({"n": "Würdeadler", "law": "Art. 1 GG · Menschenwürde", "t": "flying", "img": "a1", "c": ["#fbc301", "#fcf8ee", "#141414"], "b": [88, 92, 88, 86], "xp": 110, "an": "flap", "sc": 1.15},{ls:LS.L_adler}),'rare');
altMon("freiheitsmarder",Object.assign({"n": "Freiheitsmarder", "law": "Art. 2 GG · Freie Entfaltung der Persönlichkeit", "t": "normal", "img": "a2", "c": ["#de301d", "#fee9bd", "#141414"], "b": [58, 66, 48, 74], "xp": 70, "an": "sniff", "sc": 1.15},{ls:LS.marten}),'uncommon');
altMon("gleichlinge",Object.assign({"n": "Gleichlinge", "law": "Art. 3 GG · Gleichheit vor dem Gesetz", "t": "normal", "img": "a3", "c": ["#c47233", "#fcf8ee", "#141414"], "b": [52, 48, 52, 48], "xp": 54, "an": "jelly", "sc": 1.15},{ls:LS.rentner}),'common');
altMon("glaubine",Object.assign({"n": "Glaubine", "law": "Art. 4 GG · Glaubens- & Gewissensfreiheit", "t": "normal", "img": "a4", "c": ["#f7b10a", "#fcf7ec", "#141414"], "b": [64, 52, 64, 52], "xp": 70, "an": "float", "sc": 1.15},{ls:LS.L_glaube}),'uncommon');
altMon("meinungseule",Object.assign({"n": "Meinungseule", "law": "Art. 5 GG · Meinungsfreiheit", "t": "flying", "img": "a5", "c": ["#7a5540", "#fce7bf", "#141414"], "b": [46, 52, 42, 60], "xp": 56, "an": "flap", "sc": 1.1, "faceR": 1, "evo": [14, "demofuchs"]},{ls:LS.L_meinung}),'common');
altMon("demofuchs",Object.assign({"n": "Demofuchs", "law": "Art. 8 GG · Versammlungsfreiheit", "t": "fire", "img": "a8", "c": ["#f08935", "#fde9bd", "#141414"], "b": [70, 82, 62, 80], "xp": 125, "an": "sniff", "sc": 1.15, "faceR": 1},{ls:LS.L_meinung}),'common');
altMon("posttaube",Object.assign({"n": "Posttaube", "law": "Art. 10 GG · Brief-, Post- & Fernmeldegeheimnis", "t": "flying", "img": "a10", "c": ["#b5b4c4", "#b5b4c4", "#141414"], "b": [44, 46, 40, 68], "xp": 54, "an": "flap", "sc": 1.15, "faceR": 1},{ls:LS.bird}),'common');
altMon("heimkroete",Object.assign({"n": "Heimkröte", "law": "Art. 13 GG · Unverletzlichkeit der Wohnung", "t": "grass", "img": "a13", "c": ["#f8b104", "#f5e7d0", "#141414"], "b": [74, 56, 82, 30], "xp": 70, "an": "rock", "sc": 1.15},{ls:LS.moss}),'uncommon');
altMon("rechtsritter",Object.assign({"n": "Rechtsritter", "law": "Art. 19 GG · Rechtsweggarantie", "t": "rock", "img": "a19", "c": ["#fdc505", "#fbf7f0", "#141414"], "b": [84, 90, 98, 52], "xp": 100, "an": "tank", "sc": 1.15},{ls:LS.crab}),'rare');
altMon("bundesadler",Object.assign({"n": "Bundesadler", "law": "Art. 20 GG · Demokratie, Rechts- & Sozialstaat", "t": "flying", "img": "a20", "c": ["#fdc502", "#fbf5ee", "#141414"], "b": [90, 98, 84, 92], "xp": 110, "an": "flap", "sc": 1.15, "faceR": 1},{ls:LS.L_adler}),'rare');
altMon("langfinger",Object.assign({"n": "Langfinger", "law": "§ 242 StGB · Diebstahl", "t": "normal", "img": "s242", "c": ["#c7a184", "#fcd08f", "#141414"], "b": [44, 56, 40, 68], "xp": 56, "an": "sniff", "sc": 1, "faceR": 1, "evo": [15, "schwindelfuchs"]},{ls:LS.L_lang}),'common');
altMon("schwindelfuchs",Object.assign({"n": "Schwindelfuchs", "law": "§ 263 StGB · Betrug", "t": "fire", "img": "s263", "c": ["#ea843d", "#fdecbf", "#141414"], "b": [64, 84, 58, 92], "xp": 125, "an": "sway", "sc": 1},{ls:LS.L_lang}),'common');
altMon("pruegelklops",Object.assign({"n": "Prügelklops", "law": "§ 223 StGB · Körperverletzung", "t": "normal", "img": "s223", "c": ["#ef4834", "#faf4e5", "#141414"], "b": [58, 64, 50, 42], "xp": 56, "an": "flex", "sc": 1.05, "evo": [16, "schlaegerkopf"]},{ls:LS.ibu}),'common');
altMon("schlaegerkopf",Object.assign({"n": "Schlägerkopf", "law": "§ 224 StGB · Gefährliche Körperverletzung", "t": "rock", "img": "s224", "c": ["#da7c40", "#fbdfc1", "#141414"], "b": [84, 100, 76, 58], "xp": 130, "an": "flex", "sc": 1},{ls:LS.ibu}),'common');
altMon("promillo",Object.assign({"n": "Promillo", "law": "§ 316 StGB · Trunkenheit im Verkehr", "t": "water", "img": "s316", "c": ["#2c662f", "#fdde9b", "#141414"], "b": [54, 50, 48, 46], "xp": 56, "an": "wobble", "sc": 1, "evo": [16, "bleifuss"]},{ls:LS.L_promille}),'common');
altMon("bleifuss",Object.assign({"n": "Bleifuß", "law": "§ 315b StGB · Gefährliche Eingriffe in den Straßenverkehr", "t": "fire", "img": "s315b", "c": ["#cbc0bd", "#e8e3de", "#141414"], "b": [74, 92, 72, 98], "xp": 130, "an": "tank", "sc": 1},{ls:LS.L_promille}),'common');
altMon("poebelblase",Object.assign({"n": "Pöbelblase", "law": "§ 185 StGB · Beleidigung", "t": "normal", "img": "s185", "c": ["#d13c2a", "#fdf5ea", "#141414"], "b": [46, 52, 40, 60], "xp": 56, "an": "jelly", "sc": 1, "evo": [14, "geruechtling"]},{ls:LS.L_poebel}),'common');
altMon("geruechtling",Object.assign({"n": "Gerüchtling", "law": "§ 186 StGB · Üble Nachrede", "t": "electric", "img": "s186", "c": ["#9f8c8f", "#fbf8f1", "#141414"], "b": [64, 80, 58, 84], "xp": 125, "an": "float", "sc": 1, "faceR": 1},{ls:LS.L_poebel}),'common');
altMon("faelschling",Object.assign({"n": "Fälschling", "law": "§ 267 StGB · Urkundenfälschung", "t": "grass", "img": "s267", "c": ["#be4530", "#fef0d3", "#141414"], "b": [58, 62, 62, 52], "xp": 70, "an": "sway", "sc": 1},{ls:LS.grassSt}),'uncommon');
altMon("sprayzi",Object.assign({"n": "Sprayzi", "law": "§ 303 StGB · Sachbeschädigung", "t": "water", "img": "s303", "c": ["#a64f95", "#faf6ea", "#141414"], "b": [48, 56, 44, 58], "xp": 56, "an": "squirm", "sc": 1},{ls:LS.waterSt}),'common');
Object.assign(LS,{
 L_asserv:[[1,'gust'],[1,'quickjab'],[4,'featherdarts'],[7,'goldrush'],[10,'galecutter'],[13,'updraft'],[16,'divebomb'],[19,'paragraph'],[23,'skyslam']],
 L_hund:[[1,'scratch'],[1,'quickjab'],[4,'zap'],[7,'whirl'],[10,'sparkchain'],[13,'headrush'],[16,'jolt'],[19,'boltstrike'],[23,'stormcrack']],
 L_keiler:[[1,'bump'],[1,'rocktoss'],[4,'headrush'],[7,'gravel'],[10,'stoneskin'],[13,'quakestomp'],[16,'boulder'],[20,'flexpunch'],[24,'meteor']],
 L_vernehm:[[1,'scratch'],[1,'sparkshot'],[4,'gust'],[7,'emberrain'],[10,'featherdarts'],[13,'scorchline'],[15,'galecutter'],[18,'divebomb'],[22,'skyslam']],
 L_ident:[[1,'scratch'],[1,'quickjab'],[4,'rocktoss'],[7,'whirl'],[10,'gravel'],[13,'canewhack'],[16,'quakestomp'],[19,'boulder'],[23,'meteor']]
});
altMon("probenwolf",Object.assign({"n": "Probenwolf", "law": "§ 81a StPO · Körperliche Untersuchung", "t": "water", "img": "p81a", "c": ["#b2abbe", "#f9e9df", "#141414"], "b": [58, 62, 52, 60], "xp": 68, "an": "sniff", "sc": 0.95, "faceR": 1},{ls:LS.otter}),'uncommon');
altMon("fotodachs",Object.assign({"n": "Fotodachs", "law": "§ 81b StPO · Erkennungsdienstliche Maßnahmen", "t": "normal", "img": "p81b", "c": ["#c47a4b", "#f7ebdf", "#141414"], "b": [50, 52, 50, 54], "xp": 56, "an": "sniff", "sc": 0.95, "faceR": 1},{ls:LS.marten}),'common');
altMon("asservadler",Object.assign({"n": "Asservadler", "law": "§ 94 StPO · Sicherstellung & Beschlagnahme", "t": "flying", "img": "p94", "c": ["#6c649a", "#b6cfd8", "#141414"], "b": [54, 60, 50, 62], "xp": 64, "an": "flap", "sc": 0.92, "faceR": 1, "evo": [18, "richtereule"]},{ls:LS.L_asserv}),'uncommon');
altMon("richtereule",Object.assign({"n": "Richtereule", "law": "§ 98 StPO · Verfahren bei der Beschlagnahme", "t": "flying", "img": "p98", "c": ["#f6d47f", "#f6d47f", "#141414"], "b": [80, 90, 80, 74], "xp": 150, "an": "float", "sc": 0.95, "faceR": 1},{ls:LS.L_asserv}),'uncommon');
altMon("ermittlerhund",Object.assign({"n": "Ermittlerhund", "law": "§ 163 StPO · Aufgaben der Polizei im Ermittlungsverfahren", "t": "normal", "img": "p163", "c": ["#fbab49", "#f7e7d9", "#141414"], "b": [48, 56, 44, 62], "xp": 56, "an": "sniff", "sc": 1, "faceR": 1, "evo": [16, "spuerhund"]},{ls:LS.L_hund}),'common');
altMon("spuerhund",Object.assign({"n": "Spürhund", "law": "§ 102 StPO · Durchsuchung bei Beschuldigten", "t": "electric", "img": "p102", "c": ["#404672", "#f7f8f3", "#141414"], "b": [70, 88, 64, 86], "xp": 130, "an": "sniff", "sc": 0.95, "faceR": 1},{ls:LS.L_hund}),'common');
altMon("handschuhwasch",Object.assign({"n": "Handschuhwasch", "law": "§ 103 StPO · Durchsuchung bei anderen Personen", "t": "normal", "img": "p103", "c": ["#d4c7d0", "#efded9", "#141414"], "b": [52, 50, 52, 56], "xp": 56, "an": "sniff", "sc": 0.95, "faceR": 1},{ls:LS.marten}),'common');
altMon("lupenkauz",Object.assign({"n": "Lupenkauz", "law": "§ 105 StPO · Verfahren bei der Durchsuchung", "t": "flying", "img": "p105", "c": ["#f6b812", "#fdecc7", "#141414"], "b": [48, 52, 46, 58], "xp": 56, "an": "flap", "sc": 1, "faceR": 1},{ls:LS.owl}),'common');
altMon("stoerkeiler",Object.assign({"n": "Störkeiler", "law": "§ 164 StPO · Festnahme von Störern", "t": "rock", "img": "p164", "c": ["#c27153", "#f7ba80", "#141414"], "b": [60, 60, 62, 40], "xp": 58, "an": "tank", "sc": 0.95, "faceR": 1, "evo": [15, "fesselstachler"]},{ls:LS.L_keiler}),'common');
altMon("fesselstachler",Object.assign({"n": "Fesselstachler", "law": "§ 127 StPO · Vorläufige Festnahme", "t": "rock", "img": "p127", "c": ["#7c73b4", "#d5d4d7", "#141414"], "b": [82, 94, 86, 62], "xp": 130, "an": "flex", "sc": 1, "faceR": 1},{ls:LS.L_keiler}),'common');
altMon("protokollfuchs",Object.assign({"n": "Protokollfuchs", "law": "§ 163a StPO · Vernehmung des Beschuldigten", "t": "fire", "img": "p163a", "c": ["#fd7716", "#fceee1", "#141414"], "b": [46, 54, 42, 62], "xp": 56, "an": "sniff", "sc": 1, "faceR": 1, "evo": [14, "vernehmpapagei"]},{ls:LS.L_vernehm}),'common');
altMon("vernehmpapagei",Object.assign({"n": "Vernehmpapagei", "law": "§ 136 StPO · Vernehmung", "t": "flying", "img": "p136", "c": ["#fb4f34", "#f5ebdd", "#141414"], "b": [66, 82, 60, 86], "xp": 125, "an": "flap", "sc": 0.95, "faceR": 1},{ls:LS.L_vernehm}),'common');
altMon("verbotsnatter",Object.assign({"n": "Verbotsnatter", "law": "§ 136a StPO · Verbotene Vernehmungsmethoden", "t": "grass", "img": "p136a", "c": ["#7172a0", "#fce47c", "#141414"], "b": [78, 94, 74, 88], "xp": 95, "an": "sway", "sc": 1, "faceR": 1},{ls:LS.grassSt}),'rare');
altMon("identiluchs",Object.assign({"n": "Identiluchs", "law": "§ 163b StPO · Maßnahmen zur Identitätsfeststellung", "t": "normal", "img": "p163b", "c": ["#fcba53", "#faf1da", "#141414"], "b": [48, 54, 44, 62], "xp": 56, "an": "sniff", "sc": 0.95, "faceR": 1, "evo": [16, "gewahrsamhirsch"]},{ls:LS.L_ident}),'common');
altMon("gewahrsamhirsch",Object.assign({"n": "Gewahrsamhirsch", "law": "§ 163c StPO · Freiheitsentziehung zur Identitätsfeststellung", "t": "rock", "img": "p163c", "c": ["#fbbe6c", "#f7dea6", "#141414"], "b": [80, 88, 84, 66], "xp": 130, "an": "tank", "sc": 1, "faceR": 1},{ls:LS.L_ident}),'common');
// paragraph as name suffix: "Owigon §26", "Würdeadler Art.1", "Langfinger §242"
for(const k in SPECIES){const sp=SPECIES[k];if(!sp.law)continue;const m=sp.law.match(/^(§|Art\.)\s*(\d+[a-z]?)(?:\s+([A-Za-zÄÖÜäöü]+))?/);if(m){sp.sfx=(m[1]==='§'?'§':'Art.')+m[2]+(m[3]?' '+m[3]:'');sp.base=sp.n;sp.n+=' '+sp.sfx}}
// every learnset gets classics of its type (plus a buff/debuff), so wild monsters and trainers use them too
{const ADD={normal:[[5,'growl'],[9,'leer'],[19,'bodyslam'],[24,'swordsdance'],[30,'hyperbeam']],fire:[[5,'growl'],[12,'scaryface'],[19,'flamethrower'],[23,'sunnyday'],[28,'fireblast']],
  water:[[5,'withdraw'],[12,'bubblebeam'],[18,'aurorabeam'],[22,'surf'],[28,'hydropump']],grass:[[5,'growth'],[9,'stringshot'],[13,'razorleaf'],[18,'sleeppowder'],[22,'gigadrain'],[28,'solarbeam']],
  electric:[[5,'thunderwave'],[9,'charge'],[13,'confuseray'],[20,'thunderbolt'],[28,'thunder']],rock:[[5,'defcurl'],[9,'metalclaw'],[14,'rockslide'],[19,'crunch'],[23,'irontail'],[28,'earthquake']],
  flying:[[5,'featherdance'],[9,'wingattack'],[14,'agility'],[18,'steelwing'],[22,'drillpeck'],[28,'aeroblast']]};
 const done=new Set();for(const sid in SPECIES){const sp=SPECIES[sid],ls=sp.ls;if(!Array.isArray(ls)||done.has(ls))continue;done.add(ls);
  for(const e of ADD[sp.t]||[])if(!ls.some(x=>x[1]===e[1]))ls.push(e);ls.sort((a,b)=>a[0]-b[0])}}
// name as HTML with the paragraph in bold
function nameHtml(sid){const sp=SPECIES[sid];if(!sp)return'';return sp.sfx?esc(sp.base)+' <b class="psfx">'+esc(sp.sfx)+'</b>':esc(sp.n)}
const ALT_IDS=new Set(['schlagstock','taser','pfefferspray','kelle','harrymon','harrymonx','goeggeli','goeggelix','pfisterio','pfisteriox','zenerentner','steini','aaronia','gianlueckmon','ibumon','owigon','ausweisadler','platzfuchs','sperrschild','drohnix','zellbaer','filzhund','kistenwasch','wohnkroete','sichereule','beschlagigel','erkennungsleon','fragfuchs','einwilligfee','bodycamar','wuerdeadler','freiheitsmarder','gleichlinge','glaubine','meinungseule','demofuchs','posttaube','heimkroete','rechtsritter','bundesadler','langfinger','schwindelfuchs','pruegelklops','schlaegerkopf','promillo','bleifuss','poebelblase','geruechtling','faelschling','sprayzi','probenwolf','fotodachs','asservadler','richtereule','ermittlerhund','spuerhund','handschuhwasch','lupenkauz','stoerkeiler','fesselstachler','protokollfuchs','vernehmpapagei','verbotsnatter','identiluchs','gewahrsamhirsch','arenamon','zhang','boorberg']);
const ALT_STARTERS=['harrymon','goeggeli','pfisterio','zenerentner','aaronia','ibumon'];
// monsters per area (new world): law areas — PolG in the forest and at the coast, traffic & petty crime in the highlands, GG in the snow, StPO in the jungle, StGB in the desert & prison
const ALT_POOLS={north:['zenerentner','aaronia','ibumon','owigon','filzhund','langfinger','poebelblase','fragfuchs','gleichlinge','meinungseule','posttaube'],
 east:['aaronia','ibumon','platzfuchs','kistenwasch','sichereule','wohnkroete','filzhund','fragfuchs','ausweisadler','beschlagigel','freiheitsmarder'],
 south:['zenerentner','promillo','zellbaer','sperrschild','drohnix','erkennungsleon','einwilligfee','bodycamar','posttaube','ausweisadler','beschlagigel'],
 west:['ibumon','bleifuss','promillo','owigon','sprayzi','faelschling','langfinger','pruegelklops','poebelblase','geruechtling','steini'],
 snow:['wuerdeadler','freiheitsmarder','gleichlinge','glaubine','meinungseule','demofuchs','posttaube','heimkroete','rechtsritter','bundesadler'],
 jungle:['probenwolf','fotodachs','asservadler','richtereule','ermittlerhund','spuerhund','handschuhwasch','lupenkauz','stoerkeiler','fesselstachler','protokollfuchs','vernehmpapagei','verbotsnatter','identiluchs','gewahrsamhirsch'],
 desert:['schwindelfuchs','schlaegerkopf','pruegelklops','faelschling','geruechtling','bleifuss','sprayzi','steini','gianlueckmon','gewahrsamhirsch'],
 knast:['langfinger','schwindelfuchs','pruegelklops','schlaegerkopf','promillo','bleifuss','poebelblase','geruechtling','faelschling','sprayzi']};
for(const k in ALT_POOLS)ALT_POOLS[k]=ALT_POOLS[k].filter(s=>SPECIES[s]);
const ALT_LEG={thunderroc:'boorberg',solarion:'arenamon',abyssfin:'zhang',schlagstock:'schlagstock',taser:'taser',pfefferspray:'pfefferspray',kelle:'kelle'};
const ALT_IM={};function imgKey(sid){const v=SPECIES[sid].img;return v===1?sid:v}
for(const k in ALT_IMG){const im=new Image();im.onload=()=>{const drop=o=>{for(const key in o){const sid=key.split(':')[0];if(SPECIES[sid]&&SPECIES[sid].img&&imgKey(sid)===k)delete o[key]}};drop(SPR);if(typeof WSPR!=='undefined')drop(WSPR)};im.src=ALT_IMG[k];ALT_IM[k]=im}
const RARITY={common:{n:'Häufig',c:'#9aa0b4',w:60,cm:1,xm:1},uncommon:{n:'Ungewöhnlich',c:'#3ddc6b',w:28,cm:.85,xm:1.1},rare:{n:'Selten',c:'#4aa3ff',w:9,cm:.6,xm:1.35},legendary:{n:'Legendär',c:'#ffcb3d',w:0,cm:.3,xm:2},unique:{n:'Einzigartig',c:'#c27bff',w:0,cm:1,xm:1}};
const RAR=RAR_INIT;
function rarOf(s){return RARITY[RAR[s]||'common']}
const STARTERS=['harrymon','goeggeli','pfisterio'];
const START_LV=2;
const EVOT=new Set(Object.values(SPECIES).filter(s=>s.evo).map(s=>s.evo[1]));
const BASES=Object.keys(SPECIES).filter(s=>!EVOT.has(s)&&RAR[s]!=='unique'&&RAR[s]!=='legendary'&&!ALT_IDS.has(s));
const ALT_BASES=[...ALT_IDS].filter(s=>RAR[s]!=='unique'&&RAR[s]!=='legendary'&&!EVOT.has(s));
// which monster set is active: lobby parameter, or the setting for free play (default: alternative set)
function altOn(){return true}
function startersNow(c){return altOn(c)?ALT_STARTERS:STARTERS}
function basesNow(){return altOn()?ALT_BASES:BASES}
function poolOf(zk){return altOn()?ALT_POOLS[zk]:ZONES[zk].pool}
function legSid(L){return altOn()?ALT_LEG[L.id]:L.id}
function rosterIds(){return Object.keys(SPECIES).filter(s=>altOn()===ALT_IDS.has(s))}
// biomes: local monster pools (frequency is bound to the biome)
const ZONES={
 north:{n:'Villinger Land',col:'#7fd060',enc:'hohes Gras',pool:[]},
 east:{n:'Damentaler Wald',col:'#2f7a2c',enc:'Farne',pool:[]},
 south:{n:'Marderacher Küste',col:'#3b8fd9',enc:'Schilf',pool:[]},
 west:{n:'Felsenhöhen',col:'#b89a6a',enc:'Geröll',pool:[]},
 snow:{n:'Lahribarer Gebirge',col:'#dfe8f2',enc:'Schneegras',pool:[]},
 desert:{n:'Unterwertheimer Canyon',col:'#e2b766',enc:'Dornbusch',pool:[]},
 jungle:{n:'Mostbacher Dschungel',col:'#2fa36a',enc:'Dschungelgras',pool:[]},
 knast:{n:'Knast',col:'#8e929c',enc:'Zellentrakt',pool:[]}
};
const CX=149,CY=92;
function distC(x,y){return Math.hypot(x-CX,y-CY)}
// level range per area; inside an area the level rises with the distance from Villingen (d0/d1 are measured when the map is built)
const ZLV={north:{lo:1,hi:7},east:{lo:6,hi:12},south:{lo:8,hi:14},west:{lo:10,hi:16},snow:{lo:13,hi:19},jungle:{lo:16,hi:22},desert:{lo:19,hi:25},knast:{lo:26,hi:34}};
const BIO_MIN={};for(const k in ZLV)BIO_MIN[k]=ZLV[k].lo;
function baseLvAt(x,y){const z=zoneAt(x,y),L=ZLV[z];if(!L)return 1;const t=L.d1>L.d0?clamp((distC(x,y)-L.d0)/(L.d1-L.d0),0,1):0.5;return L.lo+(z==='north'?Math.pow(t,1.5):t)*(L.hi-L.lo)}
const KNAST_LV=[26,34];
function lvAt(x,y){if(zoneAt(x,y)==='knast')return KNAST_LV[0]+Math.floor(Math.random()*(KNAST_LV[1]-KNAST_LV[0]+1));return clamp(Math.max(BIO_MIN[zoneAt(x,y)]||1,Math.round(baseLvAt(x,y)+Math.random()*1.4-0.7)),1,40)}
// trainers are always 3–6 levels above the wild monsters around them
function trainerTeam(t){if(t.fixed)return t.team;const z=zoneAt(t.x,t.y),w=z==='knast'?Math.round((KNAST_LV[0]+KNAST_LV[1])/2):Math.max(BIO_MIN[z]||1,Math.round(baseLvAt(t.x,t.y))),h=hashStr(String(t.id||t.n||''));const pool=altOn()?poolOf(zoneAt(t.x,t.y)||'north'):null;
  return t.team.map(([s,l],i)=>[pool?pool[(i+t.id.length)%pool.length]:s,clamp(w+3+((h>>>(i*3))%4),1,40)])}
function pickWild(pool,boost){boost=boost||1;const w=s=>rarOf(s).w*(RAR[s]==='rare'?boost:1);const tot=pool.reduce((a,s)=>a+w(s),0);let r=Math.random()*tot;for(const s of pool){r-=w(s);if(r<=0)return s}return pool[0]}
// legendary shrines (one encounter per player per match)
const LEGENDS=[{id:'thunderroc',x:150,y:14,l:20,zone:'west'},{id:'solarion',x:283,y:36,l:24,zone:'desert'},{id:'abyssfin',x:98,y:179,l:18,zone:'south'},{id:'schlagstock',x:22,y:24,l:22,zone:'snow'},{id:'taser',x:283,y:140,l:23,zone:'jungle'},{id:'pfefferspray',x:20,y:181,l:20,zone:'south'},{id:'kelle',x:70,y:131,l:16,zone:'east'}];
// static AI trainers: spot you in their line of sight (4 tiles)
const TRAINERS=[
 {id:'ben',n:'Polizeimeister Ben',x:24,y:10,d:'down',c:'#2f5fb3',team:[['owigon',5],['filzhund',5]],reward:2,line:'Allgemeine Verkehrskontrolle! Führerschein und Monster, bitte!',after:'Gute Fahrt. Und schnallen Sie Ihre Monster an.'},
 {id:'lina',n:'Kommissarin Lina',x:37,y:7,d:'left',c:'#3b4a8c',team:[['posttaube',6],['langfinger',7]],reward:2,line:'Sie haben mich angesehen. Das ist verdächtig!',after:'Okay, Verdacht ausgeräumt.'},
 {id:'gwen',n:'Ausbilderin Gwen',x:21,y:25,d:'right',c:'#2a6f4f',team:[['gleichlinge',5],['fragfuchs',5],['meinungseule',6]],reward:3,line:'Dienstsport, Anwärter! Zeig, was du an der Hochschule gelernt hast!',after:'Bestanden. Jetzt ab auf Streife.'},
 {id:'rita',n:'Revierpolizistin Rita',x:48,y:12,d:'down',c:'#3a7a3a',team:[['platzfuchs',9],['kistenwasch',10]],reward:3,line:'Mein Revier, meine Regeln! Platzverweis — außer du gewinnst!',after:'Na gut. Du darfst durch mein Revier.'},
 {id:'hank',n:'SEK-Beamter Hank',x:13,y:20,d:'down',c:'#2b2f3a',team:[['pruegelklops',9],['heimkroete',10]],reward:3,line:'Zugriff! Zugriff! ZUGRIFF!',after:'Lage bereinigt. Respekt.'},
 {id:'sue',n:'Wasserschutzpolizistin Sue',x:20,y:35,d:'right',c:'#1f7fa8',team:[['promillo',9],['erkennungsleon',10]],reward:3,line:'Bootskontrolle! Ist Ihr Team überhaupt seetauglich?',after:'Okay, Ihr Team ist seetauglich.'},
 {id:'axel',n:'Hubschrauberpilot Axel',x:5,y:31,d:'right',c:'#244a9a',team:[['ausweisadler',13],['sichereule',13],['bodycamar',14]],reward:5,line:'Polizeihubschrauber Christoph 1 — Sie sind umstellt!',after:'Geh weiter. Das Gericht wartet.'}
];


// Zielsicher (real-time aiming skill, 1–10): replaces accuracy. High = the aim sits on the target with a slight lead,
// low = the monster's aim drags sluggishly behind. Set by type, a fixed per-species offset and a little by level.
const ZIEL_T={electric:7.5,flying:7,water:6,fire:5.5,normal:5,grass:4.5,rock:3.5};
function zielOf(m){if(!m||!SPECIES[m.s])return 5;let h=0;for(const ch of m.s)h=(h*31+ch.charCodeAt(0))>>>0;const base=(ZIEL_T[SPECIES[m.s].t]||5)+((h%5)-2)*0.6;return clamp(Math.round((base+(m.l||1)*0.04)*10)/10,1,10)}
function zielStars(v){const n=Math.round(v/2);return'●'.repeat(n)+'○'.repeat(5-n)}

// how a projectile looks/behaves. 'wave' = sound/water/shock wave: one arc that widens as it travels (hits a growing area).
// Everything else is a look only; plain balls stay for basic normal attacks.
const MOVE_VIS={growl:'wave',screech:'wave',surf:'wave',thunderwave:'wave',torrent:'wave',
  drowsyspores:'spore',heartspore:'spore',sleeppowder:'spore',stringshot:'string',goldrush:'coin',featherdarts:'feather',featherdance:'feather',
  paragraph:'para',leer:'glare',scaryface:'glare',staticnet:'net',gravel:'rock',rocktoss:'rock',galecutter:'blade',razorleaf:'leaf'};
const TYPE_VIS={fire:'flame',water:'bubble',grass:'leaf',electric:'bolt',rock:'rock',flying:'blade',normal:'ball'};
function visOf(mid){const mv=MOVES[mid];if(!mv)return'ball';return MOVE_VIS[mid]||TYPE_VIS[mv.t]||'ball'}

// quiz items come in two shapes: old [question,[correct,w1,w2,w3],explanation] and new
// [question,[correct phrasings…],[wrong answers…],explanation]. qReal() turns one into a playable 4-answer item:
// one random phrasing of the right answer + three random wrong ones (index 0 = correct, shuffled at display time).
// the length of an answer must not give it away: at least one (usually more) of the three wrong answers is about as long or longer
function qReal(q){if(!q||q.length<4)return q;const mx=Math.max(...q[2].map(w=>w.length)),okC=q[1].filter(c=>c.length*0.9<=mx),cs=okC.length?okC:[q[1].slice().sort((a,b)=>a.length-b.length)[0]];
  const c=cs[Math.floor(Math.random()*cs.length)],L=c.length,ws=shuffleArr(q[2].slice());
  const th=ws.some(w=>w.length>L)?L+1:L*0.9,lng=ws.filter(w=>w.length>=th),sh=ws.filter(w=>w.length<th).sort((a,b)=>Math.abs(a.length-L)-Math.abs(b.length-L));
  const nL=Math.min(lng.length,1+Math.floor(Math.random()*3)),pick=lng.slice(0,nL);for(const w of sh.slice(0,6).sort(()=>Math.random()-0.5)){if(pick.length>=3)break;pick.push(w)}
  for(const w of lng.slice(nL)){if(pick.length>=3)break;pick.push(w)}return[q[0],[c,...pick.slice(0,3)],q[3]]}
