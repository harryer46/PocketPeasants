/* ===================== LERNEN+ (v0.110) =====================
   - Fallfragen: kurzer Sachverhalt (1–2 Sätze) → „Welche Norm?“ (4 Antworten, schnell lösbar). In HfPol-Prüfungen,
     Prof-Klausuren und als Weckfrage im Schlaf.
   - Weckfrage im Schlaf statt fallender Paragraphen: Antwort mit den Attacken-Tasten (1–4) oder Antippen.
   - „⚑ Frage melden“ an jeder beantworteten Frage (gemeldete Fragen kommen nicht mehr dran, landen im Export).
   - Lernstand exportieren (JSON-Sicherung + CSV-Tabelle) und wieder importieren.
   - Spicken entfällt → Nachhilfe ($100): Lernpause sofort beenden und die Prüfung direkt schreiben. */
const CASE_NORMS={
  StGB:{'142':'Unerlaubtes Entfernen vom Unfallort','145':'Missbrauch von Notrufen','185':'Beleidigung','186':'Üble Nachrede','187':'Verleumdung','202a':'Ausspähen von Daten','211':'Mord','212':'Totschlag','221':'Aussetzung','223':'Körperverletzung','224':'Gefährliche Körperverletzung','226':'Schwere Körperverletzung','231':'Beteiligung an einer Schlägerei','242':'Diebstahl','243':'Besonders schwerer Fall des Diebstahls','244':'Wohnungseinbruchdiebstahl','246':'Unterschlagung','249':'Raub','250':'Schwerer Raub','253':'Erpressung','258':'Strafvereitelung','258a':'Strafvereitelung im Amt','259':'Hehlerei','263':'Betrug','267':'Urkundenfälschung','303':'Sachbeschädigung','303b':'Computersabotage','304':'Gemeinschädliche Sachbeschädigung','314':'Gemeingefährliche Vergiftung','315b':'Gefährliche Eingriffe in den Straßenverkehr','315c':'Gefährdung des Straßenverkehrs','315d':'Verbotene Kraftfahrzeugrennen','316':'Trunkenheit im Verkehr','323a':'Vollrausch','323c':'Unterlassene Hilfeleistung','324':'Gewässerverunreinigung'},
  StPO:{'81a':'Körperliche Untersuchung, Blutprobe','81b':'Erkennungsdienstliche Maßnahmen','94':'Sicherstellung & Beschlagnahme','102':'Durchsuchung beim Beschuldigten','103':'Durchsuchung bei anderen Personen','127':'Vorläufige Festnahme','136a':'Verbotene Vernehmungsmethoden','163b':'Identitätsfeststellung','164':'Festnahme von Störern'},
  PolG:{'27':'Personenfeststellung','30':'Platzverweis & Aufenthaltsverbot','31':'Aufenthaltsvorgabe & Kontaktverbot','33':'Gewahrsam','34':'Durchsuchung von Personen','35':'Durchsuchung von Sachen','36':'Betreten & Durchsuchung von Wohnungen','37':'Sicherstellung','38':'Beschlagnahme','43':'Befragung & Datenerhebung','44':'Bild- & Tonaufzeichnung'},
  GG:{'1':'Menschenwürde','2':'Freie Entfaltung der Persönlichkeit','5':'Meinungsfreiheit','8':'Versammlungsfreiheit','10':'Fernmeldegeheimnis','13':'Unverletzlichkeit der Wohnung'},
  BtMG:{'29':'Unerlaubter Handel mit Betäubungsmitteln'}};
// [Buch, Norm, Sachverhalt, ähnliche Normen, die nicht als Falschantwort dienen dürfen, kurze Begründung]
const CASES=[
 ['StGB','242','A steckt im Supermarkt eine Tafel Schokolade ein und geht, ohne zu zahlen.',['243','246'],'Wegnahme einer fremden beweglichen Sache mit Zueignungsabsicht.'],
 ['StGB','243','A bricht nachts in eine Lagerhalle ein und nimmt Werkzeug mit.',['242','244'],'Diebstahl mit Einbrechen in einen Geschäftsraum – Regelbeispiel.'],
 ['StGB','244','A steigt durchs Fenster in eine bewohnte Wohnung ein und stiehlt Schmuck.',['242','243'],'Wohnungseinbruchdiebstahl (Abs. 1 Nr. 3, Abs. 4).'],
 ['StGB','246','A behält eine gefundene Geldbörse und gibt das Geld aus.',['242'],'Zueignung ohne Wegnahme – Unterschlagung.'],
 ['StGB','249','A schlägt B nieder und nimmt ihm das Handy weg.',['250','255','242','253'],'Wegnahme mit Gewalt gegen eine Person.'],
 ['StGB','250','A bedroht B mit einem Messer und nimmt ihm die Geldbörse weg.',['249','255','253'],'Raub mit einer Waffe/einem gefährlichen Werkzeug.'],
 ['StGB','253','A verlangt 500 € von B, sonst veröffentliche er peinliche Fotos.',['249','255','185'],'Drohung mit einem empfindlichen Übel zur Bereicherung.'],
 ['StGB','259','A kauft ein offensichtlich gestohlenes E-Bike für 50 €.',['242','246'],'Sich eine vom Vortäter gestohlene Sache verschaffen.'],
 ['StGB','263','A verkauft online eine Konsole, kassiert Vorkasse und verschickt nie etwas.',['246','267'],'Täuschung → Irrtum → Vermögensverfügung → Schaden.'],
 ['StGB','267','A ändert auf einem Rezept die Menge von 10 auf 100 Tabletten.',['263'],'Verfälschen einer echten Urkunde.'],
 ['StGB','303','A sprüht ein Graffiti auf eine fremde Hauswand.',['304'],'Erscheinungsbild einer fremden Sache erheblich verändert.'],
 ['StGB','304','A zerkratzt ein Denkmal im Stadtpark.',['303'],'Gegenstand der öffentlichen Verschönerung – gemeinschädlich.'],
 ['StGB','223','A schlägt B mit der Faust ins Gesicht.',['224','226','231'],'Körperliche Misshandlung – einfache Körperverletzung.'],
 ['StGB','224','A schlägt B mit einem Baseballschläger.',['223','226'],'Mittels eines gefährlichen Werkzeugs.'],
 ['StGB','226','Durch A\'s Angriff verliert B dauerhaft das Sehvermögen auf einem Auge.',['223','224'],'Schwere Folge: Verlust des Sehvermögens.'],
 ['StGB','211','A tötet seinen Onkel aus Habgier, um ihn zu beerben.',['212'],'Mordmerkmal Habgier.'],
 ['StGB','212','A erschlägt im spontanen Streit seinen Nachbarn.',['211','231'],'Vorsätzliche Tötung ohne Mordmerkmal.'],
 ['StGB','185','A nennt einen Polizisten bei der Kontrolle einen „Idioten“.',['186','187'],'Kundgabe von Missachtung – Beleidigung.'],
 ['StGB','187','A behauptet wider besseres Wissen, Nachbar B sei vorbestraft.',['185','186'],'Bewusst unwahre ehrenrührige Tatsache – Verleumdung.'],
 ['StGB','186','A verbreitet das nicht erweislich wahre Gerücht, B betrüge Kunden.',['185','187'],'Nicht erweislich wahre Tatsache – üble Nachrede.'],
 ['StGB','142','A rammt beim Ausparken ein Auto und fährt einfach weg.',['315c','316'],'Unerlaubtes Entfernen vom Unfallort.'],
 ['StGB','316','A fährt mit 1,4 Promille Auto, ohne dass etwas passiert.',['315c','323a'],'Fahruntüchtig gefahren, keine konkrete Gefahr.'],
 ['StGB','315c','A fährt betrunken und hätte beinahe einen Fußgänger überfahren.',['316','315b'],'Trunkenheit + konkrete Gefahr für Leib oder Leben.'],
 ['StGB','315b','A wirft von einer Brücke Steine auf die Autobahn.',['315c','315d'],'Verkehrsfremder Eingriff von außen.'],
 ['StGB','315d','Zwei Fahrer liefern sich nachts ein Rennen durch die Innenstadt.',['315c','315b'],'Verbotenes Kraftfahrzeugrennen.'],
 ['StGB','145','A wählt immer wieder grundlos die 112, um sich zu amüsieren.',[],'Missbrauch von Notrufen.'],
 ['StGB','323c','A fährt an einem Verletzten vorbei, obwohl Hilfe leicht möglich wäre.',['221','142'],'Unterlassene Hilfeleistung bei einem Unglücksfall.'],
 ['StGB','221','A lässt seine hilflose, demente Mutter allein im Wald zurück.',['323c'],'In eine hilflose Lage versetzt – Aussetzung.'],
 ['StGB','323a','A betrinkt sich bis zur Schuldunfähigkeit und schlägt dann zu.',['223','316'],'Rauschtat im schuldunfähigen Zustand.'],
 ['StGB','258','A versteckt seinen Freund vor der Polizei, damit er nicht bestraft wird.',['258a'],'Strafvereitelung.'],
 ['StGB','258a','Ein Polizist lässt die Anzeige gegen seinen Freund verschwinden.',['258'],'Strafvereitelung durch einen Amtsträger.'],
 ['StGB','202a','A knackt das Passwort zum Mailkonto seiner Ex-Freundin.',['303b'],'Überwinden einer Zugangssicherung.'],
 ['StGB','303b','A legt mit Schadsoftware die IT einer Firma lahm.',['202a','303'],'Erhebliche Störung einer Datenverarbeitung.'],
 ['StGB','231','A mischt bei einer Massenschlägerei mit, bei der jemand stirbt.',['212','223','224'],'Beteiligung an einer Schlägerei mit schwerer Folge.'],
 ['StGB','324','A kippt Altöl in einen Bach.',['314'],'Gewässer verunreinigt.'],
 ['StGB','314','A mischt Gift in Flaschen eines Getränkeautomaten.',['324','224'],'Gemeingefährliche Vergiftung.'],
 ['BtMG','29','A verkauft gewinnbringend Kokain an Bekannte.',[],'Handeltreiben mit Betäubungsmitteln.'],
 ['StPO','127','Ein Ladendieb flüchtet – ein Passant hält ihn bis zum Eintreffen der Polizei fest.',['164','163b'],'Jedermann-Festnahme, auf frischer Tat betroffen.'],
 ['StPO','163b','Die Polizei stellt die Personalien eines Graffiti-Verdächtigen fest.',['127','81b'],'Identitätsfeststellung im Strafverfahren.'],
 ['StPO','81a','Bei Verdacht auf Trunkenheitsfahrt soll dem Fahrer Blut entnommen werden.',['81b'],'Körperliche Untersuchung, Blutprobe.'],
 ['StPO','81b','Vom Beschuldigten werden Fotos und Fingerabdrücke genommen.',['81a','163b'],'Erkennungsdienstliche Maßnahmen.'],
 ['StPO','102','Die Wohnung des Beschuldigten wird nach dem Diebesgut durchsucht.',['103'],'Durchsuchung beim Verdächtigen.'],
 ['StPO','103','Die Wohnung eines unverdächtigen Zeugen wird nach Beweisen durchsucht.',['102'],'Durchsuchung bei anderen Personen.'],
 ['StPO','94','Das Tatmesser wird als Beweismittel in Verwahrung genommen.',[],'Sicherstellung von Beweismitteln.'],
 ['StPO','136a','Der Vernehmer droht dem Beschuldigten mit Schlägen, falls er schweigt.',[],'Verbotene Vernehmungsmethode – Drohung.'],
 ['StPO','164','Ein Gaffer stört lautstark die Arbeit am Tatort und wird festgehalten.',['127'],'Festnahme von Störern bei Amtshandlungen.'],
 ['PolG','27','Am gefährlichen Ort Bahnhof werden die Personalien einer Person festgestellt.',['43'],'Personenfeststellung zur Gefahrenabwehr.'],
 ['PolG','30','Ein Schaulustiger behindert Retter und muss den Unfallort verlassen.',['31','33'],'Platzverweis.'],
 ['PolG','33','Ein hilfloser Volltrunkener wird zu seinem Schutz in die Zelle gebracht.',['30'],'Schutzgewahrsam.'],
 ['PolG','34','Vor dem Transport in Gewahrsam wird eine Person nach Waffen abgetastet.',['35'],'Durchsuchung von Personen.'],
 ['PolG','35','Zur Gefahrenabwehr wird der Kofferraum nach einer Waffe durchsucht.',['34','36'],'Durchsuchung von Sachen.'],
 ['PolG','36','Die Polizei betritt nachts eine Wohnung, aus der Hilferufe kommen.',['35'],'Betreten von Wohnungen bei Gefahr.'],
 ['PolG','37','Ein unverschlossenes Fahrrad wird zum Schutz des Eigentümers verwahrt.',['38'],'Sicherstellung zum Schutz des Eigentümers.'],
 ['PolG','38','Einem Randalierer wird zur Gefahrenabwehr sein Messer weggenommen.',['37'],'Beschlagnahme zur Gefahrenabwehr.'],
 ['PolG','31','Ein Stalker darf sich der Wohnung des Opfers nicht mehr nähern.',['30'],'Aufenthaltsvorgabe & Kontaktverbot.'],
 ['PolG','44','Die Bodycam zeichnet eine eskalierende Kontrolle auf.',['43'],'Offene Bild- und Tonaufzeichnung.'],
 ['PolG','43','Ein Zeuge wird zur Gefahrenabwehr nach einem Vermissten befragt.',['27'],'Befragung.'],
 ['GG','1','Folter, um eine Aussage zu erzwingen, ist ausnahmslos verboten.',['2'],'Die Menschenwürde ist unantastbar.'],
 ['GG','8','Bürger versammeln sich friedlich und ohne Waffen auf dem Marktplatz.',['5'],'Versammlungsfreiheit.'],
 ['GG','10','Die Polizei hört ohne Beschluss private Telefonate ab.',['13'],'Eingriff ins Fernmeldegeheimnis.'],
 ['GG','13','Die Polizei durchsucht eine Wohnung – welches Grundrecht ist betroffen?',['10'],'Unverletzlichkeit der Wohnung.']];
function normName(b,n){return(b==='GG'?'Art. '+n+' GG':'§ '+n+' '+b)+' · '+(CASE_NORMS[b]&&CASE_NORMS[b][n]||'')}
// as raw quiz question: [text, correct phrasings, wrong ones, explanation]
const CASE_QZ=CASES.map(([b,n,txt,ex,why])=>{const cat=CASE_NORMS[b]&&Object.keys(CASE_NORMS[b]).length>=6?b:'StGB',wrong=Object.keys(CASE_NORMS[cat]).filter(k=>!(cat===b&&(k===n||ex.includes(k)))).map(k=>normName(cat,k));
  return Object.assign([`⚖ ${txt} Welche Norm?`,[normName(b,n)],wrong,`${normName(b,n)}: ${why}`],{book:b})});
function caseFor(book,avoid){let pool=CASE_QZ.filter(q=>!book||q.book===book);if(!pool.length)pool=CASE_QZ;pool=pool.filter(q=>!qReported(q[0]));return pool.length?qFreshPick(pool,avoid):null}
// ---- gemeldete Fragen ----
const QREP_KEY='pp_qreports';
function qReports(){try{return JSON.parse(localStorage.getItem(QREP_KEY)||'{}')}catch(e){return{}}}
function qReported(t){return!!qReports()[qsId(t)]}
function qReport(t,law){const R=qReports();R[qsId(t)]={t,law:law||'',at:new Date().toISOString()};try{localStorage.setItem(QREP_KEY,JSON.stringify(R))}catch(e){}}
{const _fp=qFreshPick;qFreshPick=function(pool,avoid){const p=pool.filter(q=>!qReported(q[0]));return _fp(p.length?p:pool,avoid)};
 const _wp=qwPick;qwPick=function(pool,avoid){const p=pool.filter(q=>!qReported(q[0]));return _wp(p.length?p:pool,avoid)}}
let LAST_Q=null;{const _ql=qsLog;qsLog=function(t,ok){LAST_Q={t,at:Date.now()};return _ql.apply(this,arguments)}}
function qrepBtnFor(box){if(!box||!LAST_Q||Date.now()-LAST_Q.at>120000||box.querySelector('[data-qrep]'))return;const row=box.querySelector('#cqact')||box.querySelector('.sacts')||box;if(!row)return;
  const done=qReported(LAST_Q.t),b=document.createElement('button');b.className='btn ghost';b.dataset.qrep='1';b.title='Frage fehlerhaft oder unklar? Melden – sie kommt dann nicht mehr dran und steht im Lernstand-Export.';b.textContent=done?'⚑ GEMELDET':'⚑ FRAGE MELDEN';b.disabled=done;b.style.fontSize='9px';
  const t=LAST_Q.t;b.onclick=e=>{e.stopPropagation();qReport(t);b.textContent='⚑ GEMELDET';b.disabled=true;toast('Danke! Die Frage ist gemeldet und kommt nicht mehr dran (siehe Lernstand-Export).')};row.appendChild(b)}
{const mo=new MutationObserver(()=>{for(const sel of['#cquiz','#study']){const el=$(sel);if(!el||!el.classList.contains('on'))continue;
   const answered=el.querySelector('.sa.ok,.sa.bad,.sexp,#cqnext,#snext');if(answered)qrepBtnFor(el)}});
 addEventListener('load',()=>{for(const sel of['#cquiz','#study']){const el=$(sel);if(el)mo.observe(el,{childList:true,subtree:true})}});
 setTimeout(()=>{for(const sel of['#cquiz','#study']){const el=$(sel);if(el)mo.observe(el,{childList:true,subtree:true})}},0)}
// ---- Fallfragen in Prüfungen ----
{const _sq=studyQuestions;studyQuestions=function(sid){const out=_sq.apply(this,arguments);try{const book=lawOf(sid)||null,av=new Set(out.map(x=>x.q[0]));const n=qRnd()<0.4?2:1;
   for(let i=0;i<n&&out.length;i++){const q=caseFor(book,av);if(!q)break;av.add(q[0]);out[Math.min(out.length-1,1+i*2)]={src:sid,q:qReal(q)}}}catch(e){console.warn(e)}return out}}
{const _lq=lawQuestions;lawQuestions=function(law){const out=_lq.apply(this,arguments);try{const cs=CASE_QZ.filter(q=>q.book===law&&!qReported(q[0]));for(const q of cs)out.push({src:null,q:qReal(q)})}catch(e){}return out}}
// ---- Weckfrage im Schlaf (Antwort mit den Attacken-Tasten) ----
let SLQ=null;
function sleepQuestion(F){const sid=act(F).s,book=lawOf(sid);let q=null;
  if(qRnd()<0.5)q=caseFor(['StGB','StPO','PolG','GG','BtMG'].includes(book)?book:null);
  if(!q){const{book:bk,L}=sleepPairs(sid);if(L.length>=4){const a=L[qRndInt(L.length)],wr=qShuffle(L.filter(x=>x.title!==a.title)).slice(0,9).map(x=>x.title);q=[`💤 ${a.head}: Wie heißt diese Norm?`,[a.title],wr,`${a.head} = ${a.title}`]}}
  return q?qReal(q):null}
sleepGame=function(){if(!B||B.tb||$('#sleepq'))return;const myB=B,F=B.me;let q=sleepQuestion(F);if(!q)return;
  const ov=document.createElement('div');ov.id='sleepq';document.body.appendChild(ov);let order=qShuffle([0,1,2,3]),lock=0;
  const keys=['a1','a2','a3','a4'].map(k=>keyLabel(SET.keys[k]));
  const render=()=>{ov.innerHTML=`<div class="slh">💤 ${esc(SPECIES[act(F).s].n)} schläft – richtig antworten weckt auf!</div><div class="slq">${esc(q[0])}</div><div class="sla">${order.map((k,j)=>`<button data-sl="${k}"><span class="sk">${esc(keys[j])}</span>${esc(q[1][k])}</button>`).join('')}</div>`;
    ov.querySelectorAll('[data-sl]').forEach(b=>b.onclick=e=>{e.stopPropagation();answer(+b.dataset.sl)})};
  const answer=k=>{if(lock||B!==myB)return;lock=1;const ok=k===0;qsLog(q[0],ok);ov.querySelectorAll('[data-sl]').forEach(b=>{const kk=+b.dataset.sl;b.classList.add(kk===0?'ok':kk===k?'bad':'dim')});
    if(ok){F.st.sleep=0;say(`${SPECIES[act(F).s].n} ist aufgewacht!`);burst(F.x,F.y-14,'#ffe066',14);setTimeout(()=>ov.remove(),700)}
    else{F.st.sleep=Math.min(8,F.st.sleep+0.5);say('Falsch – '+(q[2]||'').slice(0,90));setTimeout(()=>{if(B!==myB||F.st.sleep<=0){ov.remove();return}q=sleepQuestion(F)||q;order=qShuffle([0,1,2,3]);lock=0;render()},1300)}};
  SLQ={answer:j=>answer(order[j]),myB};render();
  const tick=()=>{if(B!==myB||!B||B.state==='over'||F.st.sleep<=0||F.out||F.faint>0){ov.remove();SLQ=null;return}const cv=$('#bcv'),r=cv.getBoundingClientRect();ov.style.left=(r.left+r.width*0.08)+'px';ov.style.width=(r.width*0.84)+'px';ov.style.top=(r.top+r.height*0.16)+'px';requestAnimationFrame(tick)};tick()};
addEventListener('keydown',e=>{if(!SLQ||!$('#sleepq')||typeof e.key!=='string'||e.repeat)return;const k=normKey(e.key),K=SET.keys,j=['a1','a2','a3','a4'].findIndex(a=>K[a]===k);if(j<0)return;e.preventDefault();e.stopImmediatePropagation();SLQ.answer(j)},true);
(function(){const st=document.createElement('style');st.textContent=`#sleepq{position:fixed;z-index:41;background:#14141fe8;border:3px solid #000;box-shadow:4px 4px 0 #000;padding:6px 8px;font-family:VT323,monospace;color:#f2f2f2}
#sleepq .slh{font-size:15px;color:#c9b8ff}#sleepq .slq{font-size:19px;margin:3px 0 6px;line-height:1.05}#sleepq .sla{display:grid;grid-template-columns:1fr 1fr;gap:4px}
#sleepq button{font-family:VT323,monospace;font-size:17px;text-align:left;background:#f6f1e1;color:#14141f;border:2px solid #14141f;padding:3px 6px;cursor:pointer;line-height:1}#sleepq button .sk{display:inline-block;font:8px 'Press Start 2P',monospace;background:#14141f;color:#ffcb3d;padding:2px 3px;margin-right:5px;vertical-align:1px}
#sleepq button.ok{background:#3ddc6b}#sleepq button.bad{background:#ef4444;color:#fff}#sleepq button.dim{opacity:.5}
@media (max-width:560px){#sleepq .sla{grid-template-columns:1fr}}
#study #slearn{position:fixed!important;right:max(16px,env(safe-area-inset-right));bottom:max(22px,env(safe-area-inset-bottom));z-index:31;width:74px;height:74px}`;document.head.appendChild(st)})();
// ---- Lernstand exportieren / importieren ----
function qExportRows(){const S=qsLoad(),R=qReports(),idx=qIndex(),rows=[];const text=new Map();
  for(const sid in QZ)for(const q of QZ[sid])text.set(qsId(q[0]),[q[0],(SPECIES[sid]&&SPECIES[sid].law)||'']);
  if(typeof VAULT_BOOK!=='undefined')for(const b in VAULT_BOOK)for(const q of VAULT_BOOK[b])text.set(qsId(q[0]),[q[0],b]);
  for(const q of CASE_QZ)text.set(qsId(q[0]),[q[0],'Fallfrage '+q.book]);
  for(const[k,[t,law]]of text){const r=S[k];if(!r&&!R[k])continue;rows.push({frage:t,gesetz:law,gestellt:r?r[0]+r[1]:0,richtig:r?r[0]:0,falsch:r?r[1]:0,serie:r?r[2]:0,gemeldet:R[k]?'ja':''})}
  return rows}
function qDownload(name,data,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function qExportCSV(){const rows=qExportRows(),esc2=v=>'"'+String(v).replace(/"/g,'""')+'"';const csv='﻿'+['Gesetz','Frage','gestellt','richtig','falsch','Serie','gemeldet'].join(';')+'\n'+rows.map(r=>[r.gesetz,r.frage,r.gestellt,r.richtig,r.falsch,r.serie,r.gemeldet].map(esc2).join(';')).join('\n');
  qDownload(`PocketPeasants_Lernstand_${new Date().toISOString().slice(0,10)}.csv`,csv,'text/csv;charset=utf-8')}
function qExportJSON(){qDownload(`PocketPeasants_Lernstand_${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({v:1,game:'Pocket Peasants',at:new Date().toISOString(),stats:qsLoad(),reports:qReports()},null,1),'application/json')}
function qImportJSON(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.onchange=()=>{const f=inp.files[0];if(!f)return;f.text().then(t=>{try{const d=JSON.parse(t);if(!d||!d.stats)throw 0;const S=qsLoad();
  for(const k in d.stats){const a=S[k],b=d.stats[k];S[k]=a?[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.max(a[2],b[2])]:b}QSTAT=S;try{localStorage.setItem(QS_KEY,JSON.stringify(S))}catch(e){}
  const R=Object.assign(qReports(),d.reports||{});try{localStorage.setItem(QREP_KEY,JSON.stringify(R))}catch(e){}toast(`Lernstand importiert (${Object.keys(d.stats).length} Fragen).`);renderTeam()}catch(e){toast('Das ist keine Lernstand-Datei.')}})};inp.click()}
{const _ov=qsOverviewEl;qsOverviewEl=function(){const d=_ov.apply(this,arguments);try{const nR=Object.keys(qReports()).length,row=document.createElement('div');row.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-top:5px';
  row.innerHTML=`<button class="mini" id="qexcsv" title="Tabelle für Excel/LibreOffice: jede beantwortete Frage mit richtig/falsch und Meldungen">⬇ Export CSV</button><button class="mini" id="qexjson" title="Sicherung zum Übertragen auf ein anderes Gerät">⬇ Sicherung (JSON)</button><button class="mini" id="qimjson" title="Sicherung von einem anderen Gerät übernehmen (wird zusammengeführt)">⬆ Import</button>${nR?`<span class="small">⚑ ${nR} gemeldet</span>`:''}`;
  d.appendChild(row);row.querySelector('#qexcsv').onclick=qExportCSV;row.querySelector('#qexjson').onclick=qExportJSON;row.querySelector('#qimjson').onclick=qImportJSON}catch(e){}return d}}
// ---- Nachhilfe statt Spicken ----
studyCrib=function(m){if(!m||!atHfPol())return;if((m.stT||0)+STUDY_CD<=Date.now()){openStudy(m);return}if(money()<CRIB_P){toast('Nicht genug Geld für Nachhilfe.');return}
  RUN.money-=CRIB_P;m.stT=0;save();updateHud();toast(`👩‍🏫 Nachhilfe gebucht: ${SPECIES[m.s].n} schreibt die Prüfung sofort.`);openStudy(m)};
{const _oh=openHfPol;openHfPol=function(){_oh.apply(this,arguments);try{document.querySelectorAll('[data-cp]').forEach(b=>{const m=RUN.team[+b.dataset.cp],left=(m.stT||0)+STUDY_CD-Date.now();b.textContent=`👩‍🏫 NACHHILFE $${CRIB_P}`;b.title='Lernpause sofort beenden und die Prüfung direkt schreiben (die Fragen musst du trotzdem beantworten)';b.disabled=!(left>0)||money()<CRIB_P})}catch(e){}}}
{const _qi=qIndex;qIndex=function(){const had=QIDX;const m=_qi();if(!had)for(const q of CASE_QZ){const k=qsId(q[0]);if(!m.has(k))m.set(k,q.book)}return m}}
// ---- Fragen-Stand je Monster (Dex) ----
function qPoolOf(sid){const sp=SPECIES[sid];if(!sp)return[];const m=new Map();const base=sp.evoOf||sid;
  for(const q of(QZ[sid]||QZ[base]||[]))m.set(qsId(q[0]),q[0]);
  const lm=(sp.law||'').match(/^(?:§|Art\.)\s*(\d+[a-z]?)\s+([A-Za-zÄÖÜäöü]+)/);if(lm)for(let i=0;i<CASES.length;i++){const c=CASES[i];if(c[0]===lm[2]&&c[1]===lm[1])m.set(qsId(CASE_QZ[i][0]),CASE_QZ[i][0])}
  return[...m.keys()]}
function qStatsFor(sid){const S=qsLoad(),ks=qPoolOf(sid);let r=0,w=0,o=0;for(const k of ks){const x=S[k];if(!x||x[0]+x[1]===0)o++;else if(x[2]>0)r++;else w++}return{n:ks.length,r,w,o}}
function qDexLine(sid,short){const q=qStatsFor(sid);if(!q.n)return'';return short?`<br><span class="small" title="Fragen zu diesem Monster: zuletzt richtig · zuletzt falsch · noch offen"><span style="color:#3ddc6b">✓${q.r}</span> <span style="color:#ef4444">✗${q.w}</span> <span style="color:var(--muted)">○${q.o}</span></span>`
  :`<p class="small" style="margin:4px 0 0">📚 Fragen zu diesem Monster: <span style="color:#3ddc6b">${q.r} richtig</span> · <span style="color:#ef4444">${q.w} falsch</span> · ${q.o} offen <span style="opacity:.7">(von ${q.n})</span></p>`}
{const _omi2=openMonInfo;openMonInfo=function(s){const r=_omi2.apply(this,arguments);try{const box=$('#mbox'),law=[...box.querySelectorAll('p')].find(p=>/§|Art\./.test(p.textContent));const h=qDexLine(s,false);if(h){if(law)law.insertAdjacentHTML('afterend',h);else box.querySelector('h3')&&box.querySelector('h3').insertAdjacentHTML('afterend',h)}}catch(e){}return r}}
