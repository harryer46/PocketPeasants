/* ===================== NEW MONSTERS (v0.97) =====================
   New type „Unlicht“ (dark): the underworld of the StGB. Strong against Normal and Flug, weak against Elektro and Feuer
   (Blaulicht and light), resists itself.
   Ten criminal monsters from the StGB for the mid/late game (only from Lv 30 in the wild), the rare brawlers
   Gesetzessammlung Moorberg (replaces Boorberg, waits at the end of its archive dungeon) and Schlechtekunst,
   plus the five single volumes StGB/StPO/PolG/GG/OWiG that guard the archive one after another. */
TYPES.dark={n:'Unlicht',c:'#6a4a8c'};
EFF.dark={normal:2,flying:2,dark:.5,electric:.5,fire:.5};EFF.electric.dark=2;EFF.fire.dark=2;
// new moves (mechanics in 22e_dark_moves.js)
Object.assign(MOVES,{
  finte:{n:'Finte',t:'dark',p:60,k:'blink',cd:2.5},
  verfolgung:{n:'Verfolgung',t:'dark',p:50,k:'chase',cd:2.5},
  tiefschlag:{n:'Tiefschlag',t:'dark',p:80,k:'sucker',cd:2},
  abschlag:{n:'Abschlag',t:'dark',p:55,k:'steal',cd:2},
  finsteraura:{n:'Finsteraura',t:'dark',p:45,k:'gloom',cd:3},
  verhoehner:{n:'Verhöhner',t:'dark',p:0,k:'taunt',cd:6},
  fokusstoss:{n:'Fokusstoß',t:'normal',p:150,k:'focus',cd:5},
  gegenschlag:{n:'Gegenschlag',t:'normal',p:0,k:'counter',cd:5},
  zahlungsaufforderung:{n:'Zahlungsaufforderung',t:'normal',p:25,k:'dun',cd:3},
  vierfaust:{n:'Vierfaustschlag',t:'rock',p:55,k:'quad',cd:2.5}});
{const mk=(id,o,rar)=>{SPECIES[id]=Object.assign({img:1,sc:1,faceR:1},o);RAR_INIT[id]=rar;ALT_IDS.add(id);
   if(o.law){const m=o.law.match(/^(§|Art\.)\s*(\d+[a-z]?)(?:\s+([A-Za-zÄÖÜäöü]+))?/);if(m){const sp=SPECIES[id];sp.sfx='§'+m[2]+(m[3]?' '+m[3]:'');sp.base=sp.n;sp.n+=' '+sp.sfx}}};
 mk('fahrerflucht',{n:'Fahrerflüchtling',law:'§ 142 StGB · Unerlaubtes Entfernen vom Unfallort',t:'dark',c:['#2a2430','#d23b3b','#14141f'],b:[70,88,62,112],xp:160,an:'sniff',minLv:30,
   ls:[[1,'quickjab'],[1,'verfolgung'],[30,'rollout'],[33,'finte'],[37,'agility'],[41,'tiefschlag'],[46,'headrush'],[52,'finsteraura']]},'uncommon');
 mk('totschlagbock',{n:'Totschlagbock',law:'§ 212 StGB · Totschlag',t:'fire',c:['#3a2a30','#d23b3b','#f2e6c8'],b:[86,100,74,70],xp:170,an:'flex',minLv:30,evo:[50,'sensenmord'],
   ls:[[1,'scratch'],[1,'cinderbite'],[30,'abschlag'],[34,'flamethrower'],[38,'swordsdance'],[43,'tiefschlag'],[48,'kilnburst']]},'uncommon');
 mk('sensenmord',{n:'Sensenmord',law:'§ 211 StGB · Mord (Mordmerkmale, Abs. 2)',t:'dark',c:['#5a2a6a','#d23b3b','#f2e6c8'],b:[96,118,84,88],xp:230,sc:1.15,an:'float',minLv:50,
   ls:[[1,'finte'],[1,'tiefschlag'],[50,'finsteraura'],[54,'verhoehner'],[58,'hyperbeam'],[62,'abschlag']]},'rare');
 mk('einbruchkatz',{n:'Einbruchkatz',law:'§ 244 StGB · Wohnungseinbruchdiebstahl (Abs. 1 Nr. 3)',t:'dark',c:['#5a4a78','#8a5a3a','#14141f'],b:[72,92,70,96],xp:160,an:'sniff',minLv:30,
   ls:[[1,'scratch'],[1,'abschlag'],[30,'furyswipes'],[33,'finte'],[37,'metalclaw'],[41,'verhoehner'],[46,'tiefschlag'],[52,'finsteraura']]},'uncommon');
 mk('truhenschluck',{n:'Truhenschluck',law:'§ 246 StGB · Unterschlagung',t:'rock',c:['#5a2a3a','#e2b84a','#d23b3b'],b:[104,86,112,40],xp:165,an:'tank',minLv:30,
   ls:[[1,'harden'],[1,'crunch'],[30,'goldrush'],[34,'abschlag'],[38,'stoneskin'],[42,'earthquake'],[48,'spikes'],[54,'irontail']]},'uncommon');
 mk('raubwolf',{n:'Raubwolf',law:'§ 249 StGB · Raub',t:'dark',c:['#6a5a6a','#d23b3b','#f2e6c8'],b:[84,104,72,86],xp:170,an:'sniff',minLv:30,
   ls:[[1,'bump'],[1,'abschlag'],[30,'crunch'],[34,'verfolgung'],[38,'goldrush'],[42,'tiefschlag'],[47,'bodyslam'],[53,'finsteraura']]},'uncommon');
 mk('erpressnatter',{n:'Erpressnatter',law:'§ 253 StGB · Erpressung',t:'grass',c:['#7a5aa8','#d23b3b','#f2e6c8'],b:[80,94,78,90],xp:165,an:'squirm',minLv:30,
   ls:[[1,'vinelash'],[1,'verhoehner'],[30,'leechseed'],[34,'sleeppowder'],[38,'gigadrain'],[42,'finsteraura'],[47,'noodlelash'],[53,'solarbeam']]},'uncommon');
 mk('vereitelkraehe',{n:'Vereitelkrähe',law:'§ 258 StGB · Strafvereitelung',t:'flying',c:['#4a3a3a','#8a6a3a','#f2e6c8'],b:[74,88,76,104],xp:165,an:'flap',minLv:30,
   ls:[[1,'gust'],[1,'finte'],[30,'featherdance'],[34,'wingattack'],[38,'whirlwind'],[42,'verhoehner'],[47,'drillpeck'],[53,'aeroblast']]},'uncommon');
 mk('hehlfuchs',{n:'Hehlfuchs',law:'§ 259 StGB · Hehlerei',t:'fire',c:['#d23b3b','#f2e6c8','#e2b84a'],b:[72,96,70,102],xp:165,an:'sniff',minLv:30,
   ls:[[1,'ember'],[1,'abschlag'],[30,'goldrush'],[34,'scorchline'],[38,'firespin'],[42,'verfolgung'],[47,'flamethrower'],[53,'fireblast']]},'uncommon');
 mk('datenspaeher',{n:'Datenspäher',law:'§ 202a StGB · Ausspähen von Daten',t:'electric',c:['#6a3aa8','#b07aff','#5a5f73'],b:[70,100,66,104],xp:165,an:'float',minLv:30,
   ls:[[1,'zap'],[1,'finsteraura'],[30,'confuseray'],[34,'magnetbomb'],[38,'sparkchain'],[42,'thunderwave'],[47,'thunderbolt'],[53,'paragraph']]},'uncommon');
 // the rare brawlers
 mk('moorberg',{n:'Gesetzessammlung Moorberg',t:'normal',c:['#2d5fa8','#2f8a4c','#b07ad8'],b:[100,118,92,86],xp:240,sc:1.2,an:'float',minLv:50,
   ls:[[1,'bump'],[1,'zahlungsaufforderung'],[20,'flexpunch'],[30,'furyswipes'],[38,'gegenschlag'],[44,'headrush'],[50,'fokusstoss'],[56,'bodyslam']]},'rare');
 mk('schlechtekunst',{n:'Schlechtekunst',t:'rock',c:['#5a5658','#c8b0a8','#7a3a1a'],b:[98,120,96,62],xp:230,sc:1.15,an:'tank',minLv:30,
   ls:[[1,'tackle'],[1,'vierfaust'],[20,'flexpunch'],[28,'quakestomp'],[34,'gegenschlag'],[40,'crunch'],[46,'fokusstoss'],[52,'irontail']]},'rare');
 // the five volumes
 const VOL={stgb:['StGB','Band StGB','abschlag','#b8322e'],stpo:['StPO','Band StPO','finte','#2d5fa8'],polg:['PolG','Band PolG','gegenschlag','#2f8a4c'],gg:['GG','Band GG','verhoehner','#34343f'],owig:['OWiG','Band OWiG','zahlungsaufforderung','#d9822b']};
 for(const k in VOL){const[book,n,sig,col]=VOL[k];mk('band_'+k,{n,book,t:'normal',c:[col,'#f6f1e1','#14141f'],b:[78,90,84,74],xp:180,an:'wobble',minLv:99,
   ls:[[1,'tackle'],[1,'bottletoss'],[30,'canewhack'],[36,sig],[42,'bodyslam']]},'rare')}
 // Moorberg takes Boorberg's place
 ALT_IDS.delete('boorberg');
 // where they live (only from Lv 30 on, see startWild)
 const add=(z,ids)=>{if(ALT_POOLS[z])for(const s of ids)if(!ALT_POOLS[z].includes(s))ALT_POOLS[z].push(s)};
 add('desert',['fahrerflucht','totschlagbock','raubwolf','hehlfuchs','schlechtekunst']);
 add('knast',['einbruchkatz','truhenschluck','erpressnatter','vereitelkraehe','datenspaeher','raubwolf','totschlagbock','sensenmord']);
 add('jungle',['vereitelkraehe','datenspaeher','erpressnatter','hehlfuchs']);
 add('snow',['einbruchkatz','fahrerflucht','truhenschluck']);
 add('west',['schlechtekunst']);
 for(const s of['fahrerflucht','totschlagbock','einbruchkatz','truhenschluck','raubwolf','erpressnatter','vereitelkraehe','hehlfuchs','datenspaeher','schlechtekunst'])ALT_BASES.push(s);
 EVOT.add('sensenmord');}
const NEW_DEX=({
  fahrerflucht:'Rammt im Vorbeirasen, und weg ist es – die Wartepflicht am Unfallort hält es für eine Empfehlung. Hinterlässt nur Reifenspuren.',
  totschlagbock:'Schlägt im Zorn zu, ohne Plan und ohne Mordmerkmal. Wird es zu kaltblütig, entwickelt es sich zu Sensenmord.',
  sensenmord:'Trägt die Mordmerkmale wie Abzeichen: Heimtücke, Habgier, niedrige Beweggründe. Wo es auftaucht, droht lebenslang.',
  einbruchkatz:'Hebelt mit dem Brecheisen jede Terrassentür auf. Privatwohnung? Dann ist es kein minder schwerer Fall mehr.',
  truhenschluck:'Sieht aus wie eine Schatztruhe – und behält, was man ihm anvertraut. Zueignung ohne Wegnahme ist seine Spezialität.',
  raubwolf:'Nimmt mit Gewalt oder Drohung, was nicht ihm gehört. Der Geldsack ist nie seiner.',
  erpressnatter:'Zischt Drohbriefe und verlangt Zahlung. Raub will es nicht, es lässt sein Opfer selbst verfügen.',
  vereitelkraehe:'Versteckt Täter unter ihrem Mantel und lässt Beweise verschwinden. Für Angehörige drückt das Gesetz ein Auge zu.',
  hehlfuchs:'Kauft, was andere gestohlen haben, und verkauft es teurer weiter. Aus jeder Vortat macht es ein Geschäft.',
  datenspaeher:'Überwindet jede Zugangssicherung und liest mit. Ungesicherte Daten interessieren es nicht.',
  moorberg:'Die gefürchtete Loseblattsammlung. Verteilt Zahlungsaufforderungen und prügelt sich mit fünf schweren Bänden den Weg frei. Wer sie bezwingt, bekommt nie wieder eine Ergänzungslieferung.',
  schlechtekunst:'Vier Fäuste, zwei Kettenlaufwerke und ein Handtuch mit Hitzezeichen. Was es malt, ist schrecklich – wie es zuschlägt, auch.',
  band_stgb:'Band I der Sammlung: Strafgesetzbuch. Schwer, hart und voller Strafrahmen.',band_stpo:'Band II: Strafprozessordnung. Folgt einem strengen Verfahren und greift blitzschnell zu.',
  band_polg:'Band III: Polizeigesetz. Wehrt jede Gefahr ab – und schlägt zurück.',band_gg:'Band IV: Grundgesetz. Unantastbar und provoziert jeden, der es angreift.',
  band_owig:'Band V: Ordnungswidrigkeiten. Klein, aber verteilt Bußgeldbescheide im Sekundentakt.'});
