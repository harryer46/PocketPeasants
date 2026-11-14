/* ===================== SIDE PANELS ===================== */
let curTab='team',unread=0;
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>switchTab(b.dataset.t));
function switchTab(t){curTab=t;document.querySelectorAll('.tabs button,#topbar button[data-t]').forEach(b=>b.classList.toggle('act',b.dataset.t===t));document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('act',p.id==='pane-'+t));if(t==='chat'){unread=0;$('#cbadge').innerHTML='';const l=$('#chatlog');l.scrollTop=l.scrollHeight}if(t==='players')renderPlayers();if(t==='lobby'){lastLob='';renderLobbyPane()}}
function monCard(m,i,inTeam){
  const st=stats(m),sp=SPECIES[m.s],r=m.hp/st.mhp;const d=document.createElement('div');d.className='card';
  const cv=mk(52,52);{const cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(monSprite(m.s,24),0,0,52,52)}d.appendChild(cv);
  const info=document.createElement('div');info.className='info';
  info.innerHTML=`<div class="nm"><span>${nameHtml(m.s)}</span><span class="lv">Lv ${m.l}</span></div><span class="tb" style="background:${TYPES[sp.t].c}">${TYPES[sp.t].n.toUpperCase()}</span> <span class="tb" style="background:${rarOf(m.s).c};color:#14141f">${rarOf(m.s).n.toUpperCase()}</span> <span class="small">KP ${m.hp}/${st.mhp}</span><div class="bar"><i style="width:${r*100}%;background:${hpColor(r)}"></i></div><div class="bar xp"><i style="width:${Math.min(100,m.xp/xpNeed(m.l)*100)}%"></i></div><div class="small" style="margin-top:3px">${m.m.map(x=>MOVES[x].n).join(' · ')}</div>`;
  const acts=document.createElement('div');const btn=(t,fn,dis)=>{const b=document.createElement('button');b.className='mini';b.textContent=t;b.disabled=!!dis||!!B||(RUN&&RUN.phase==='arena');b.onclick=fn;acts.appendChild(b)};
  if(inTeam){if(i>0)btn('↑ Nach vorn',()=>{RUN.team.unshift(RUN.team.splice(i,1)[0]);changed()});if(RUN.team.length>1)btn('→ Box',()=>{RUN.box.push(RUN.team.splice(i,1)[0]);changed()})}
  else btn('→ Team',()=>{RUN.team.push(RUN.box.splice(i,1)[0]);changed()},RUN.team.length>=TEAM_MAX);
  {const b=document.createElement('button');b.className='mini';b.textContent='ℹ Details';b.onclick=()=>openMonInfo(m.s,m);acts.appendChild(b)}
  {const b=document.createElement('button');b.className='mini';b.textContent='📚 Study';b.disabled=!!B||RUN.phase==='arena';b.title=SPECIES[m.s].law?'Quiz zu '+SPECIES[m.s].law:'Quiz mit zufälligen Paragraphen';b.onclick=()=>openStudy(m);acts.appendChild(b)}
  if(RUN&&RUN.items&&['potion','superp','revive','candy'].some(k=>RUN.items[k]>0)){const b=document.createElement('button');b.className='mini';b.textContent='🎒 Item';b.disabled=!!B||RUN.phase==='arena';b.onclick=()=>openItemsFor(m);acts.appendChild(b)}
  info.appendChild(acts);d.appendChild(info);return d;
}
function changed(){save();renderTeam();pushMt()}
// ===== STUDY: quiz bank (first answer = correct, shuffled at runtime). [question, [answers], explanation]
const QZ={
owigon:[
 ["Wie definiert § 1 OWiG eine Ordnungswidrigkeit?",["Rechtswidrige und vorwerfbare Handlung, die einen Bußgeldtatbestand verwirklicht","Jede fahrlässige Straftat mit geringem Schaden","Ein Vergehen mit Freiheitsstrafe unter einem Jahr","Jeder Verstoß gegen eine polizeiliche Anordnung"],"§ 1 Abs. 1 OWiG: tatbestandsmäßig, rechtswidrig, vorwerfbar – Ahndung mit Geldbuße."],
 ["Welches Prinzip gilt für die Verfolgung von Ordnungswidrigkeiten?",["Opportunitätsprinzip (pflichtgemäßes Ermessen)","Legalitätsprinzip","Anklagemonopol der Staatsanwaltschaft","Offizialprinzip ohne Ermessen"],"§ 47 OWiG: Die Verfolgung liegt im pflichtgemäßen Ermessen der Behörde."],
 ["In welcher Höhe kann bei geringfügigen OWi ein Verwarnungsgeld erhoben werden?",["5 bis 55 Euro","10 bis 100 Euro","1 bis 35 Euro","bis 250 Euro"],"§ 56 Abs. 1 OWiG: Verwarnungsgeld von 5 bis 55 Euro."]],
ausweisadler:[
 ["Welche Maßnahme ist nach § 27 Abs. 2 PolG zur Identitätsfeststellung NICHT ausdrücklich vorgesehen?",["Abnahme einer Blutprobe","Anhalten der Person","Aushändigen mitgeführter Ausweispapiere","Verbringen zur Dienststelle, wenn die Identität sonst nicht feststellbar ist"],"§ 27 Abs. 2: Anhalten, Ausweise aushändigen, festhalten, durchsuchen, zur Dienststelle bringen – keine Blutprobe."],
 ["Wann ist eine Identitätsfeststellung an einem „gefährlichen Ort“ (§ 27 Abs. 1 Nr. 3) zulässig?",["Wenn sich die Person an einem Ort aufhält, an dem erfahrungsgemäß Straftaten verabredet oder begangen werden","Nur bei konkretem Tatverdacht gegen die Person","Nur mit richterlicher Anordnung","Nur nachts zwischen 21 und 6 Uhr"],"Nr. 3 knüpft an den Ort an – ein konkreter Verdacht gegen die Person ist nicht nötig."],
 ["Was gilt für die Durchsuchung einer Person im Rahmen der Identitätsfeststellung?",["Sie darf grundsätzlich nur von Personen gleichen Geschlechts durchgeführt werden","Sie ist stets verboten","Sie erfordert die Zustimmung eines Richters","Sie ist nur bei Minderjährigen erlaubt"],"§ 27 Abs. 2: Personendurchsuchungen nur durch Personen gleichen Geschlechts."]],
platzfuchs:[
 ["Was unterscheidet das Aufenthaltsverbot (§ 30 Abs. 2) vom Platzverweis (§ 30 Abs. 1)?",["Es setzt Tatsachen voraus, die die Annahme einer Straftat rechtfertigen, und ist auf höchstens drei Monate begrenzt","Es ist nur vorübergehend für wenige Stunden zulässig","Es darf nur vom Richter angeordnet werden","Es gilt ausschließlich für Versammlungen"],"Platzverweis: vorübergehend, Gefahrenabwehr. Aufenthaltsverbot: Straftatenprognose, max. drei Monate."],
 ["Worauf darf sich ein Aufenthaltsverbot räumlich NICHT erstrecken?",["Auf den Zugang zur eigenen Wohnung","Auf ein ganzes Gemeindegebiet","Auf einen bestimmten Platz","Auf einen Bahnhofsvorplatz"],"§ 30 Abs. 2: Das Verbot darf den Zugang zur Wohnung des Betroffenen nicht umfassen."],
 ["Welche Voraussetzung hat der Platzverweis nach § 30 Abs. 1?",["Abwehr einer Gefahr oder Beseitigung einer Störung","Dringender Tatverdacht einer Straftat","Richterliche Anordnung","Wiederholte Ordnungswidrigkeiten"],"Der Platzverweis ist eine Standardmaßnahme zur Gefahrenabwehr – vorübergehend."]],
sperrschild:[
 ["Wozu dienen Aufenthaltsvorgabe und Kontaktverbot nach § 31 PolG?",["Zur Verhütung terroristischer Straftaten","Zur Ahndung von Ordnungswidrigkeiten","Zum Schutz vor Lärmbelästigung","Zur Durchsetzung von Schulpflicht"],"§ 31 PolG BW: Aufenthaltsvorgabe und Kontaktverbot zur Verhütung terroristischer Straftaten."],
 ["Wer ordnet Maßnahmen nach § 31 PolG grundsätzlich an?",["Das Gericht auf Antrag der Polizeiführung","Jeder Polizeibeamte vor Ort","Die Ortspolizeibehörde ohne Antrag","Die Staatsanwaltschaft"],"Richtervorbehalt: Anordnung durch das Gericht auf Antrag; bei Gefahr im Verzug Eilkompetenz mit Nachholung."],
 ["Was kann ein Kontaktverbot nach § 31 PolG untersagen?",["Den Kontakt mit bestimmten Personen oder Personengruppen","Jede Nutzung des Internets","Den Besuch von Gottesdiensten","Das Verlassen des Bundesgebiets"],"Kontaktverbot: Untersagung des Kontakts zu bestimmten Personen oder Gruppen."]],
drohnix:[
 ["Wer ordnet die elektronische Aufenthaltsüberwachung (§ 32 PolG) grundsätzlich an?",["Das Gericht, nur auf schriftlichen Antrag der Polizeiführung","Der Streifenführer","Die Ortspolizeibehörde","Der Betroffene selbst"],"§ 32 Abs. 6: richterliche Anordnung auf Antrag (Leitung PP, PP Einsatz oder LKA); Eilkompetenz bei Gefahr im Verzug."],
 ["Wie lange darf eine Anordnung nach § 32 PolG höchstens dauern?",["Sechs Monate, verlängerbar um jeweils höchstens drei Monate","Zwei Wochen","Ein Jahr, nicht verlängerbar","Unbegrenzt, bis die Gefahr entfällt"],"§ 32 Abs. 9: max. sechs Monate, Verlängerung um jeweils max. drei Monate."],
 ["Was gilt für Aufenthaltsdaten aus der Wohnung des Überwachten?",["Möglichst nur die bloße Anwesenheit erfassen; weitergehende Daten nicht verwenden und unverzüglich löschen","Sie dürfen uneingeschränkt verwertet werden","Sie müssen ein Jahr gespeichert werden","Sie werden an den Arbeitgeber übermittelt"],"Schutz des Kernbereichs/der Wohnung: nur Anwesenheit, Überschussdaten löschen."]],
zellbaer:[
 ["Wie lange darf ein Gewahrsam nach § 33 PolG ohne richterliche Entscheidung höchstens dauern?",["Bis zum Ende des Tages nach dem Ergreifen","24 Stunden","48 Stunden","Zwei Wochen"],"§ 33 Abs. 3 (vgl. Art. 104 Abs. 2 GG): bis zum Ende des Tages nach dem Ergreifen."],
 ["Welche Höchstdauer darf das Gericht beim Gewahrsam festlegen?",["Zwei Wochen","Drei Tage","Sechs Monate","Es gibt keine Höchstdauer"],"§ 33 Abs. 3: Das Gericht bestimmt die Dauer, höchstens zwei Wochen."],
 ["Welcher Fall ist KEIN Gewahrsamsgrund nach § 33 Abs. 1 PolG?",["Die Person hat ein Bußgeld nicht bezahlt","Schutz der Person, die sich in hilflosem Zustand befindet","Verhinderung einer unmittelbar bevorstehenden erheblichen Störung","Identität kann anders nicht festgestellt werden"],"Gewahrsam ist Gefahrenabwehr – keine Beugehaft für Bußgelder."]],
filzhund:[
 ["Wann darf eine Person nach § 34 PolG u. a. durchsucht werden?",["Wenn Tatsachen die Annahme rechtfertigen, dass sie Sachen mitführt, die sichergestellt oder beschlagnahmt werden dürfen","Immer bei jeder Verkehrskontrolle","Nur mit Einwilligung","Nur bei Verdacht eines Verbrechens"],"Eine der Fallgruppen des § 34 Abs. 1 PolG."],
 ["Was erlaubt die „Eigensicherungsdurchsuchung“?",["Durchsuchung nach Waffen, gefährlichen Werkzeugen und Explosivmitteln zum Schutz vor Gefahren für Leib oder Leben","Durchsuchung nach Beweismitteln für ein Strafverfahren","Untersuchung von Körperöffnungen","Durchsuchung der Wohnung des Betroffenen"],"Bei rechtmäßiger Identitätsfeststellung darf zur Eigensicherung nach Waffen etc. durchsucht werden."],
 ["Wann darf eine Person ausnahmsweise von jemandem des anderen Geschlechts durchsucht werden?",["Wenn die sofortige Durchsuchung zum Schutz gegen eine Gefahr für Leib oder Leben erforderlich ist","Wenn die Person zustimmt, nur dann","Nie","Wenn kein Arzt verfügbar ist"],"Ausnahme vom Gleichgeschlechtlichkeitsgebot bei Gefahr für Leib oder Leben."]],
kistenwasch:[
 ["Was ist eine „Sache“ im Sinne der Durchsuchung von Sachen (§ 35 PolG)?",["Jeder körperliche Gegenstand, z. B. Taschen oder Fahrzeuge, nicht aber Wohnungen","Nur Behältnisse aus Metall","Auch die Kleidung am Körper (als Personendurchsuchung)","Ausschließlich Fahrzeuge"],"Wohnungen fallen unter § 36; am Körper getragene Kleidung gehört zur Personendurchsuchung."],
 ["Welcher Fall berechtigt NICHT zur Durchsuchung einer Sache nach § 35?",["Die Sache gehört einer Person, die ein Knöllchen bekommen hat","Sie wird von einer Person mitgeführt, die durchsucht werden darf","Tatsachen sprechen dafür, dass sich darin eine hilflose Person befindet","Darin befindet sich vermutlich eine Sache, die sichergestellt werden darf"],"Ein bloßes Verwarnungsgeld ist kein Durchsuchungsgrund."],
 ["Wer darf bei der Durchsuchung einer Sache anwesend sein?",["Der Inhaber der tatsächlichen Gewalt","Nur ein Richter","Niemand außer Polizei","Nur ein Rechtsanwalt"],"Der Inhaber der tatsächlichen Gewalt hat ein Anwesenheitsrecht."]],
wohnkroete:[
 ["Was gehört nach § 36 PolG zum Begriff der Wohnung?",["Wohn- und Nebenräume, Arbeits-, Betriebs- und Geschäftsräume sowie befriedetes Besitztum","Nur Schlafzimmer","Nur Räume mit Mietvertrag","Nur Einfamilienhäuser"],"Weiter Wohnungsbegriff, angelehnt an Art. 13 GG."],
 ["Wer ordnet die Durchsuchung einer Wohnung grundsätzlich an?",["Das Gericht – bei Gefahr im Verzug auch die Polizei","Jeder Polizeibeamte","Die Gemeinde","Der Vermieter"],"Art. 13 Abs. 2 GG: Richtervorbehalt, Ausnahme Gefahr im Verzug."],
 ["Was ist der Unterschied zwischen „Betreten“ und „Durchsuchen“ einer Wohnung?",["Durchsuchen ist das ziel- und zweckgerichtete Suchen nach Personen oder Sachen, Betreten nur das Eintreten und Verweilen","Es gibt keinen Unterschied","Betreten ist nur nachts erlaubt","Durchsuchen ist nur mit Hund erlaubt"],"Betreten: Eintreten/Besichtigen; Durchsuchen: zielgerichtetes Suchen nach Verborgenem."]],
sichereule:[
 ["Zu welchem Zweck ist die Sicherstellung nach § 37 PolG BW zulässig?",["Um den Eigentümer oder rechtmäßigen Inhaber vor Verlust oder Beschädigung der Sache zu schützen","Zur Beweissicherung im Strafverfahren","Zur Einziehung von Tatwerkzeugen","Zur Abwehr jeder Gefahr"],"BW unterscheidet: Sicherstellung = Schutz privater Rechte am Gegenstand; Beschlagnahme = Gefahrenabwehr."],
 ["Ein offenstehendes Fahrrad ohne Schloss wird nachts gefunden. Welche Maßnahme passt nach PolG BW?",["Sicherstellung zum Schutz des Eigentümers","Beschlagnahme nach § 94 StPO","Durchsuchung nach § 102 StPO","Gewahrsam"],"Schutz des Berechtigten vor Verlust → Sicherstellung."],
 ["Was ist bei einer Sicherstellung regelmäßig zu tun?",["Den Berechtigten benachrichtigen und die Sache verwahren","Die Sache sofort vernichten","Die Sache versteigern","Nichts – sie geht ins Eigentum des Landes über"],"Verwahrung und Benachrichtigung des Berechtigten."]],
beschlagigel:[
 ["Wozu dient die Beschlagnahme nach § 38 PolG BW?",["Zum Schutz vor einer unmittelbar bevorstehenden Störung oder zur Beseitigung einer Störung","Zum Schutz des Eigentümers vor Verlust","Zur Beweissicherung im Strafverfahren","Zur Vollstreckung von Geldforderungen"],"Beschlagnahme = Gefahrenabwehr; Beweismittel im Strafverfahren → §§ 94 ff. StPO."],
 ["Einer festgenommenen Person wird das Messer abgenommen, damit sie sich nicht verletzen kann. Rechtsgrundlage?",["Beschlagnahme nach PolG","Sicherstellung zum Schutz des Eigentümers","§ 81a StPO","Art. 13 GG"],"Gegenstände festgehaltener Personen gegen Selbst-/Fremdgefährdung oder Flucht → Beschlagnahme."],
 ["Wann ist eine Beschlagnahme aufzuheben?",["Sobald ihr Zweck erreicht ist","Nach genau 24 Stunden","Erst nach richterlicher Anordnung","Nie"],"Verhältnismäßigkeit: Aufhebung, sobald der Zweck entfällt."]],
erkennungsleon:[
 ["Welche Maßnahmen sind erkennungsdienstliche Maßnahmen?",["Finger- und Handflächenabdrücke, Lichtbilder, äußere körperliche Merkmale, Messungen","Blutprobe und DNA-Analyse","Telefonüberwachung","Wohnungsdurchsuchung"],"Klassischer ED-Katalog; Blutprobe/DNA sind eigene Eingriffe."],
 ["Wann sind ED-Maßnahmen nach § 41 PolG zur vorbeugenden Bekämpfung von Straftaten zulässig?",["Bei Tatverdacht und Wiederholungsgefahr wegen Art oder Ausführung der Tat","Bei jeder Verkehrskontrolle","Nur bei Verbrechen mit Todesfolge","Nur mit Einwilligung"],"Präventive ED-Behandlung: Verdacht + Wiederholungsgefahr."],
 ["Wie grenzt sich § 41 PolG von § 81b Alt. 2 StPO ab?",["§ 81b StPO betrifft Beschuldigte, § 41 PolG auch Personen ohne laufendes Strafverfahren (z. B. Identitätsfeststellung)","Es gibt keinen Unterschied","§ 41 PolG gilt nur für Kinder","§ 81b StPO gilt nur für Zeugen"],"§ 81b StPO setzt Beschuldigteneigenschaft voraus."]],
fragfuchs:[
 ["Wen darf die Polizei nach § 43 PolG befragen?",["Jede Person, wenn anzunehmen ist, dass sie sachdienliche Angaben zur Aufgabenerfüllung machen kann","Nur Beschuldigte","Nur Zeugen nach Ladung der Staatsanwaltschaft","Nur volljährige Personen"],"Befragung ist an jeden möglich, der sachdienliche Angaben machen kann."],
 ["Welche Angaben muss eine befragte Person regelmäßig machen?",["Personalien wie Name, Vorname, Geburtsdatum und -ort, Anschrift, Staatsangehörigkeit","Alle Angaben zur Sache","Ihr Einkommen","Gar keine"],"Auskunftspflicht grundsätzlich nur zu den Personalien; zur Sache nur in Ausnahmefällen."],
 ["Darf die Person für die Dauer der Befragung angehalten werden?",["Ja","Nein, nie","Nur mit richterlichem Beschluss","Nur nachts"],"Für die Dauer der Befragung kann die Person angehalten werden."]],
einwilligfee:[
 ["Welche Anforderung gilt für eine wirksame Einwilligung in die Datenverarbeitung?",["Sie muss freiwillig und in Kenntnis des Zwecks erteilt werden","Sie muss notariell beurkundet sein","Sie gilt für immer und ist unwiderruflich","Sie kann von Angehörigen ersetzt werden"],"Freiwilligkeit und Informiertheit sind Kernvoraussetzungen."],
 ["Kann eine Einwilligung in die Datenverarbeitung widerrufen werden?",["Ja, mit Wirkung für die Zukunft","Nein","Nur innerhalb von 24 Stunden","Nur mit Zustimmung der Polizei"],"Widerruf jederzeit für die Zukunft; bisherige Verarbeitung bleibt rechtmäßig."],
 ["Warum ist die Einwilligung als Rechtsgrundlage im Polizeirecht problematisch?",["Wegen des Über-/Unterordnungsverhältnisses ist Freiwilligkeit oft zweifelhaft","Weil Polizisten keine Formulare haben","Weil sie immer schriftlich in drei Ausfertigungen sein muss","Weil sie nur für Kinder gilt"],"Hoheitliches Gegenüber – deshalb strenge Anforderungen an die Freiwilligkeit."]],
bodycamar:[
 ["Wie müssen Bild- und Tonaufnahmen nach § 44 PolG grundsätzlich eingesetzt werden?",["Offen bzw. erkennbar","Immer verdeckt","Nur mit Einwilligung aller Betroffenen","Nur durch das LKA"],"§ 44 regelt den offenen Einsatz technischer Mittel."],
 ["Wozu dient der Einsatz körpernah getragener Aufnahmegeräte (Bodycam) vor allem?",["Zum Schutz von Polizeibeamten oder Dritten gegen Gefahren für Leib oder Leben","Zur Dauerüberwachung aller Bürger","Zur Gesichtserkennung von Passanten","Zur Verkehrsüberwachung"],"Eigensicherung und Schutz Dritter; deeskalierende Wirkung."],
 ["Bei welchen Anlässen erlaubt § 44 PolG Bild- und Tonaufnahmen u. a.?",["Bei öffentlichen Veranstaltungen und Ansammlungen, wenn Tatsachen Straftaten erwarten lassen","Bei jeder privaten Feier","In Wahlkabinen","Bei Gottesdiensten ohne Anlass"],"Anlassbezogene Aufzeichnung bei Veranstaltungen/Ansammlungen."]],
wuerdeadler:[
 ["Was besagt die „Objektformel“ zu Art. 1 GG?",["Der Mensch darf nicht zum bloßen Objekt staatlichen Handelns gemacht werden","Sachen haben ebenfalls Menschenwürde","Der Staat darf Personen als Beweismittel behandeln","Würde gilt nur für Staatsbürger"],"Menschenwürde ist verletzt, wenn der Mensch zum bloßen Objekt herabgewürdigt wird."],
 ["Kann die Menschenwürde durch Abwägung eingeschränkt werden?",["Nein, sie ist unantastbar und abwägungsfest","Ja, durch einfaches Gesetz","Ja, im Verteidigungsfall","Ja, mit Zustimmung des Bundesrats"],"Art. 1 Abs. 1 GG ist abwägungsfest; Art. 79 Abs. 3 schützt ihn vor Verfassungsänderung."],
 ["Wen bindet Art. 1 Abs. 3 GG an die Grundrechte?",["Gesetzgebung, vollziehende Gewalt und Rechtsprechung","Nur Privatpersonen","Nur den Bundestag","Nur Gerichte"],"Unmittelbar geltendes Recht für alle drei Gewalten."]],
freiheitsmarder:[
 ["Was schützt Art. 2 Abs. 1 GG nach h. M.?",["Die allgemeine Handlungsfreiheit – jedes menschliche Verhalten","Nur die Berufsausübung","Nur die Meinungsäußerung","Nur das Eigentum"],"Weites Verständnis seit dem Elfes-Urteil."],
 ["Was regelt Art. 2 Abs. 2 S. 2 GG?",["Die Freiheit der Person (körperliche Bewegungsfreiheit)","Die Pressefreiheit","Das Briefgeheimnis","Die Religionsfreiheit"],"Freiheit der Person ist unverletzlich; Eingriffe nur auf Grund eines Gesetzes (Art. 104 GG)."],
 ["Welche Schranken nennt Art. 2 Abs. 1 GG („Schrankentrias“)?",["Rechte anderer, verfassungsmäßige Ordnung, Sittengesetz","Jugendschutz, Ehre, Gesetze","Nur das Strafgesetzbuch","Keine – vorbehaltlos"],"Die verfassungsmäßige Ordnung umfasst jede formell und materiell verfassungsgemäße Norm."]],
gleichlinge:[
 ["Was verlangt der allgemeine Gleichheitssatz (Art. 3 Abs. 1 GG)?",["Wesentlich Gleiches gleich und wesentlich Ungleiches ungleich zu behandeln","Alle Menschen müssen gleich viel verdienen","Es darf nie unterschieden werden","Gleichheit nur vor Zivilgerichten"],"Ungleichbehandlungen brauchen einen sachlichen Grund."],
 ["Welches Merkmal steht NICHT in Art. 3 Abs. 3 GG?",["Alter","Abstammung","Glauben","Behinderung"],"Alter ist (noch) kein ausdrückliches Merkmal des Art. 3 Abs. 3 GG."],
 ["Warum ist „Racial Profiling“ bei polizeilichen Kontrollen problematisch?",["Eine Kontrolle allein wegen der Hautfarbe verstößt gegen Art. 3 Abs. 3 GG","Weil Kontrollen generell verboten sind","Weil nur Richter kontrollieren dürfen","Es ist unproblematisch"],"Anknüpfung an ein verpöntes Merkmal ist nicht zu rechtfertigen."]],
glaubine:[
 ["Welche Schranken hat die Glaubensfreiheit des Art. 4 GG?",["Nur verfassungsimmanente Schranken (vorbehaltlos gewährleistet)","Einfacher Gesetzesvorbehalt","Qualifizierter Gesetzesvorbehalt","Allgemeine Gesetze wie bei Art. 5"],"Kollidierendes Verfassungsrecht kann einschränken."],
 ["Was schützt Art. 4 GG neben dem Glauben ausdrücklich?",["Gewissensfreiheit und ungestörte Religionsausübung","Pressefreiheit","Versammlungsfreiheit","Berufsfreiheit"],"Glaubens-, Gewissens-, Bekenntnisfreiheit und Religionsausübung."],
 ["Was regelt Art. 4 Abs. 3 GG?",["Das Recht auf Kriegsdienstverweigerung aus Gewissensgründen","Kirchensteuer","Religionsunterricht","Feiertagsschutz"],"Niemand darf gegen sein Gewissen zum Kriegsdienst mit der Waffe gezwungen werden."]],
meinungseule:[
 ["Welche Schranken nennt Art. 5 Abs. 2 GG?",["Allgemeine Gesetze, Jugendschutz, Recht der persönlichen Ehre","Rechte anderer, verfassungsmäßige Ordnung, Sittengesetz","Nur Strafgesetze","Keine"],"Allgemeine Gesetze = nicht gegen eine bestimmte Meinung gerichtet."],
 ["Sind Tatsachenbehauptungen von Art. 5 Abs. 1 GG geschützt?",["Ja, soweit sie Voraussetzung für Meinungsbildung sind – bewusst unwahre nicht","Nein, nie","Ja, auch bewusst unwahre","Nur in Zeitungen"],"Erwiesen oder bewusst unwahre Tatsachen sind nicht geschützt."],
 ["Was bedeutet „Eine Zensur findet nicht statt“?",["Verbot der Vorzensur (präventive Kontrolle vor Veröffentlichung)","Verbot jeder Strafverfolgung nach Veröffentlichung","Pflicht zur Veröffentlichung","Verbot von Altersfreigaben"],"Nachträgliche Sanktionen bleiben möglich."]],
demofuchs:[
 ["Wie schützt Art. 8 Abs. 1 GG Versammlungen?",["Alle Deutschen dürfen sich ohne Anmeldung oder Erlaubnis friedlich und ohne Waffen versammeln","Jede Person darf sich bewaffnet versammeln","Nur angemeldete Versammlungen sind geschützt","Nur Versammlungen in geschlossenen Räumen"],"Abs. 2: Für Versammlungen unter freiem Himmel Gesetzesvorbehalt (Anzeigepflicht nach VersG)."],
 ["Was ist eine Versammlung im Sinne des Art. 8 GG nach BVerfG?",["Örtliche Zusammenkunft mehrerer Personen zur gemeinsamen Meinungsbildung oder -kundgabe","Jede Menschenansammlung, z. B. Zuschauer eines Unfalls","Nur Parteitage","Jede Party"],"Enger Versammlungsbegriff: gemeinsamer Zweck der öffentlichen Meinungsbildung."],
 ["Welcher Gesetzesvorbehalt gilt nach Art. 8 Abs. 2 GG?",["Für Versammlungen unter freiem Himmel durch Gesetz oder auf Grund eines Gesetzes","Für alle Versammlungen in Räumen","Keiner","Nur durch Verordnung der Gemeinde"],"Versammlungen in geschlossenen Räumen: nur verfassungsimmanente Schranken."]],
posttaube:[
 ["Was schützt das Fernmeldegeheimnis des Art. 10 GG?",["Die Vertraulichkeit individueller Kommunikation über Distanz","Nur Briefe aus Papier","Die Pressefreiheit","Daten auf dem ausgeschalteten Handy"],"Schutz laufender Telekommunikation; gespeicherte Daten im Endgerät fallen eher unter das IT-Grundrecht."],
 ["Wann darf in Art. 10 GG eingegriffen werden?",["Nur auf Grund eines Gesetzes","Nie","Durch jede Verwaltungsvorschrift","Nur mit Zustimmung des Empfängers"],"Art. 10 Abs. 2 GG: Gesetzesvorbehalt (z. B. § 100a StPO)."],
 ["Welche StPO-Maßnahme greift typischerweise in Art. 10 GG ein?",["Telekommunikationsüberwachung (§ 100a StPO)","Blutprobe (§ 81a StPO)","Identitätsfeststellung (§ 163b StPO)","Vorläufige Festnahme (§ 127 StPO)"],"TKÜ ist der klassische Eingriff in das Fernmeldegeheimnis."]],
heimkroete:[
 ["Wer darf Durchsuchungen nach Art. 13 Abs. 2 GG anordnen?",["Der Richter, bei Gefahr im Verzug auch andere gesetzlich vorgesehene Organe","Nur der Bundespräsident","Jeder Bürger","Nur die Gemeinde"],"Richtervorbehalt mit Eilkompetenz."],
 ["Wie ist „Gefahr im Verzug“ nach BVerfG auszulegen?",["Eng – nur wenn die richterliche Anordnung den Erfolg gefährden würde; Ausnahme muss dokumentiert werden","Weit – immer wenn es eilig ist","Nachts automatisch","Bei jeder Straftat"],"Regel-Ausnahme-Verhältnis; Dokumentationspflicht."],
 ["Was regelt Art. 13 Abs. 3 GG?",["Akustische Wohnraumüberwachung zur Strafverfolgung („großer Lauschangriff“)","Mietrecht","Hausrecht des Vermieters","Rundfunkgebühren"],"Anordnung durch einen mit drei Richtern besetzten Spruchkörper."]],
rechtsritter:[
 ["Was garantiert Art. 19 Abs. 4 GG?",["Rechtsschutz gegen Akte der öffentlichen Gewalt","Recht auf Arbeit","Recht auf Wohnung","Asylrecht"],"Rechtsweggarantie – lückenloser gerichtlicher Schutz."],
 ["Was verlangt das Zitiergebot (Art. 19 Abs. 1 S. 2 GG)?",["Ein grundrechtseinschränkendes Gesetz muss das Grundrecht unter Angabe des Artikels nennen","Jedes Urteil muss Gesetze zitieren","Beamte müssen Paragraphen auswendig können","Verträge müssen das GG zitieren"],"Warn- und Besinnungsfunktion für den Gesetzgeber."],
 ["Was bedeutet die Wesensgehaltsgarantie (Art. 19 Abs. 2 GG)?",["Ein Grundrecht darf in keinem Fall in seinem Wesensgehalt angetastet werden","Grundrechte gelten nur im Wesentlichen","Grundrechte dürfen abgeschafft werden","Nur Deutsche haben Grundrechte"],"Absolute Grenze für Einschränkungen."]],
bundesadler:[
 ["Welche Staatsstrukturprinzipien nennt Art. 20 GG?",["Demokratie, Rechtsstaat, Sozialstaat, Bundesstaat, Republik","Monarchie und Zentralstaat","Nur Demokratie","Planwirtschaft"],"Art. 20 Abs. 1–3 GG; durch Art. 79 Abs. 3 GG geschützt."],
 ["Was bedeutet Art. 20 Abs. 3 GG für die Polizei?",["Bindung an Gesetz und Recht (Vorrang und Vorbehalt des Gesetzes)","Freies Ermessen ohne Grenzen","Bindung nur an Weisungen","Keine Bindung im Notfall"],"Eingriffe brauchen eine gesetzliche Grundlage."],
 ["Was regelt Art. 20 Abs. 4 GG?",["Das Widerstandsrecht gegen jeden, der die Ordnung beseitigen will, wenn andere Abhilfe nicht möglich ist","Das Streikrecht","Das Wahlrecht ab 16","Den Verteidigungsfall"],"Subsidiäres Widerstandsrecht zum Schutz der Verfassungsordnung."]],
langfinger:[
 ["Was ist „Wegnahme“ im Sinne des § 242 StGB?",["Bruch fremden und Begründung neuen, nicht notwendig tätereigenen Gewahrsams","Jede Besitzverschaffung, auch mit Einverständnis","Nur das Wegtragen über 10 Meter","Die Zerstörung einer Sache"],"Klassische Definition; Einverständnis schließt den Gewahrsamsbruch aus."],
 ["Welches subjektive Merkmal verlangt § 242 StGB neben dem Vorsatz?",["Absicht rechtswidriger Zueignung","Bereicherungsabsicht","Schädigungsabsicht","Heimtücke"],"Zueignungsabsicht: Aneignungsabsicht + Enteignungsvorsatz."],
 ["Ist der Versuch des Diebstahls strafbar?",["Ja, § 242 Abs. 2 StGB","Nein, Diebstahl ist ein Vergehen ohne Versuchsstrafbarkeit","Nur bei Wert über 50 €","Nur bei Waffenbesitz"],"Versuch ausdrücklich angeordnet."]],
schwindelfuchs:[
 ["Welche objektiven Merkmale hat der Betrug (§ 263 StGB)?",["Täuschung, Irrtum, Vermögensverfügung, Vermögensschaden","Wegnahme, Gewalt, Drohung","Täuschung und Urkunde","Drohung, Nötigung, Schaden"],"Durchgehender Kausalzusammenhang erforderlich."],
 ["Was ist „Stoffgleichheit“ beim Betrug?",["Der erstrebte Vorteil muss die Kehrseite des Schadens sein","Täter und Opfer müssen gleich alt sein","Die Sache muss aus demselben Material sein","Der Schaden muss über 100 € liegen"],"Bereicherung und Schaden müssen auf derselben Verfügung beruhen."],
 ["Worin unterscheidet sich der Betrug vom Diebstahl?",["Beim Betrug verfügt das Opfer selbst (Selbstschädigung), beim Diebstahl wird weggenommen (Fremdschädigung)","Es gibt keinen Unterschied","Betrug ist nur online möglich","Diebstahl setzt Täuschung voraus"],"Abgrenzung nach der Willensrichtung des Getäuschten."]],
pruegelklops:[
 ["Welche zwei Tatvarianten hat § 223 StGB?",["Körperliche Misshandlung und Gesundheitsschädigung","Beleidigung und Bedrohung","Nötigung und Erpressung","Raub und Diebstahl"],"Misshandlung: übles, unangemessenes Behandeln; Gesundheitsschädigung: pathologischer Zustand."],
 ["Ist die einfache Körperverletzung ein Antragsdelikt?",["Ja, relativ – Strafantrag oder besonderes öffentliches Interesse (§ 230 StGB)","Nein, nie","Ja, absolut – ohne Antrag keine Verfolgung","Nur bei Verwandten"],"Die StA kann das besondere öffentliche Interesse bejahen."],
 ["Ist der Versuch der einfachen Körperverletzung strafbar?",["Ja, § 223 Abs. 2 StGB","Nein","Nur mit Waffe","Nur bei Kindern"],"Versuchsstrafbarkeit ausdrücklich angeordnet."]],
schlaegerkopf:[
 ["Welche Variante ist KEINE Qualifikation des § 224 StGB?",["Körperverletzung aus Eifersucht","Mittels einer Waffe oder eines anderen gefährlichen Werkzeugs","Gemeinschaftlich mit einem anderen Beteiligten","Mittels einer das Leben gefährdenden Behandlung"],"Motive sind kein Merkmal des § 224."],
 ["Was ist ein „gefährliches Werkzeug“?",["Ein Gegenstand, der nach Beschaffenheit und konkreter Verwendung geeignet ist, erhebliche Verletzungen herbeizuführen","Nur Messer und Schusswaffen","Jeder Gegenstand aus Metall","Nur Gegenstände über 1 kg"],"Auch ein beschuhter Fuß kann je nach Verwendung gefährliches Werkzeug sein."],
 ["Welcher Strafrahmen gilt für § 224 Abs. 1 StGB?",["Sechs Monate bis zehn Jahre","Geldstrafe bis drei Jahre","Ein bis fünfzehn Jahre","Lebenslang"],"In minder schweren Fällen drei Monate bis fünf Jahre."]],
promillo:[
 ["Welche Deliktsart ist § 316 StGB?",["Abstraktes Gefährdungsdelikt","Erfolgsdelikt","Konkretes Gefährdungsdelikt","Antragsdelikt"],"Eine konkrete Gefahr ist nicht nötig (anders § 315c)."],
 ["Ab welcher BAK gilt ein Kfz-Führer als absolut fahruntüchtig?",["1,1 Promille","0,5 Promille","0,8 Promille","1,6 Promille"],"Absolute Fahruntüchtigkeit bei Kfz ab 1,1 ‰ (Radfahrer: 1,6 ‰)."],
 ["Was gilt bei 0,7 Promille und Schlangenlinien?",["Relative Fahruntüchtigkeit – Ausfallerscheinungen müssen hinzukommen","Immer straflos","Absolute Fahruntüchtigkeit","Nur eine OWi nach § 24a StVG, nie § 316"],"Ab 0,3 ‰ relative Fahruntüchtigkeit bei alkoholbedingten Ausfallerscheinungen."]],
bleifuss:[
 ["Was kennzeichnet § 315b StGB im Gegensatz zu § 315c StGB?",["Verkehrsfremde Eingriffe von außen bzw. „Pervertierung“ des Verkehrsvorgangs","Typische Fehler im fließenden Verkehr","Nur Trunkenheitsfahrten","Nur Fahrerflucht"],"§ 315c erfasst die „sieben Todsünden“ im Verkehr."],
 ["Wann liegt ein „verkehrsfeindlicher Inneneingriff“ vor?",["Wenn ein Fahrzeug bewusst zweckwidrig, z. B. als Waffe, eingesetzt wird – mit mindestens bedingtem Schädigungsvorsatz","Bei jedem Rotlichtverstoß","Bei zu schnellem Fahren","Beim Parken im Halteverbot"],"Pervertierung des Fahrzeugs zur Waffe."],
 ["Welcher Erfolg muss bei § 315b StGB eintreten?",["Konkrete Gefahr für Leib oder Leben eines anderen oder fremde Sachen von bedeutendem Wert","Kein Erfolg nötig","Tod eines Menschen","Schaden über 10.000 €"],"Konkretes Gefährdungsdelikt."]],
poebelblase:[
 ["Was ist eine Beleidigung im Sinne des § 185 StGB?",["Kundgabe eigener Miss- oder Nichtachtung","Jede unhöfliche Äußerung","Jede wahre Tatsachenbehauptung über Dritte","Das Verbreiten von Gerüchten"],"Angriff auf die Ehre durch Kundgabe von Missachtung."],
 ["Wie wird die Beleidigung verfolgt?",["Grundsätzlich nur auf Antrag (§ 194 StGB)","Immer von Amts wegen","Nur durch Privatklage ohne Antrag","Gar nicht"],"Antragsdelikt; Ausnahmen in § 194 StGB."],
 ["Was kann „Wahrnehmung berechtigter Interessen“ (§ 193 StGB) bewirken?",["Rechtfertigung ehrverletzender Äußerungen, z. B. in einer Strafanzeige","Strafschärfung","Verjährungsunterbrechung","Nichts"],"Spezieller Rechtfertigungsgrund im Ehrschutz."]],
geruechtling:[
 ["Worin unterscheidet sich die üble Nachrede (§ 186) von der Beleidigung (§ 185)?",["Ehrenrührige Tatsachenbehauptung gegenüber Dritten, die nicht erweislich wahr ist","Werturteil gegenüber dem Opfer selbst","Es gibt keinen Unterschied","Nur schriftliche Äußerungen"],"Tatsachen gegenüber Dritten; Nichterweislichkeit ist objektive Bedingung der Strafbarkeit."],
 ["Was unterscheidet § 187 StGB (Verleumdung) von § 186?",["Der Täter handelt wider besseres Wissen","Es wird nur gegenüber dem Opfer geäußert","Es ist ein Werturteil","Es betrifft nur Politiker"],"Verleumdung: bewusst unwahre Tatsachen."],
 ["Wer trägt bei § 186 StGB das Risiko, dass die Wahrheit nicht bewiesen werden kann?",["Der Täter","Das Opfer","Die Staatsanwaltschaft","Niemand"],"„nicht erweislich wahr“ geht zulasten des Täters."]],
faelschling:[
 ["Was ist eine Urkunde im Sinne des § 267 StGB?",["Verkörperte Gedankenerklärung, zum Beweis geeignet und bestimmt, die ihren Aussteller erkennen lässt","Jedes Schriftstück","Nur notarielle Dokumente","Jede Fotokopie"],"Perpetuierungs-, Beweis- und Garantiefunktion."],
 ["Wann ist eine Urkunde „unecht“?",["Wenn sie nicht von dem stammt, der als Aussteller erscheint (Identitätstäuschung)","Wenn ihr Inhalt falsch ist","Wenn sie zerknittert ist","Wenn sie handschriftlich ist"],"Schriftliche Lüge des echten Ausstellers ist keine Urkundenfälschung."],
 ["Ist eine einfache Fotokopie eine Urkunde?",["Grundsätzlich nein – sie lässt keinen Aussteller als Garanten erkennen, sofern sie nicht als Original erscheint","Ja, immer","Nur in Farbe","Nur mit Stempel"],"Die Kopie gibt sich als Reproduktion zu erkennen."]],
sprayzi:[
 ["Welche Tathandlungen nennt § 303 Abs. 1 StGB?",["Beschädigen oder Zerstören einer fremden Sache","Wegnehmen einer fremden Sache","Verunreinigen eigener Sachen","Verstecken einer Sache"],"Substanzverletzung oder Brauchbarkeitsminderung."],
 ["Warum werden Graffiti von § 303 Abs. 2 StGB erfasst?",["Unbefugte, nicht nur unerhebliche und nicht nur vorübergehende Veränderung des Erscheinungsbilds","Weil Farbe immer die Substanz zerstört","Weil Kunst verboten ist","Gar nicht"],"Abs. 2 wurde gerade für Graffiti eingeführt."],
 ["Wie wird die einfache Sachbeschädigung verfolgt?",["Auf Antrag oder bei besonderem öffentlichen Interesse (§ 303c StGB)","Immer von Amts wegen ohne Ausnahme","Nur zivilrechtlich","Nur bei Schäden über 1.000 €"],"Relatives Antragsdelikt."]],
probenwolf:[
 ["Wer ordnet eine Blutprobe nach § 81a StPO grundsätzlich an?",["Das Gericht, bei Gefährdung des Untersuchungserfolgs auch StA und Ermittlungspersonen","Jeder Bürger","Nur der Hausarzt","Nur der Beschuldigte selbst"],"Richtervorbehalt mit Eilkompetenz (§ 81a Abs. 2 StPO)."],
 ["Bei welchen Delikten entfällt seit 2017 der Richtervorbehalt für die Blutprobe?",["Bei Verdacht von Verkehrsstraftaten unter Alkohol/Drogen (§§ 315a, 315c Abs. 1 Nr. 1a, 316 StGB)","Bei allen Verbrechen","Bei Diebstahl","Bei Beleidigung"],"§ 81a Abs. 2 S. 2 StPO."],
 ["Wer darf eine Blutprobe nach § 81a StPO entnehmen?",["Nur ein Arzt nach den Regeln der ärztlichen Kunst","Jeder Polizeibeamte","Der Beschuldigte selbst","Ein Sanitäter ohne Weisung"],"Eingriff nur durch Arzt; keine Gesundheitsnachteile zu befürchten."]],
fotodachs:[
 ["Gegen wen richten sich ED-Maßnahmen nach § 81b StPO?",["Gegen den Beschuldigten","Gegen jeden Zeugen","Nur gegen Verurteilte","Gegen Opfer"],"Beschuldigteneigenschaft ist Voraussetzung."],
 ["Was ist der Zweck des § 81b Alt. 2 StPO („für Zwecke des Erkennungsdienstes“)?",["Vorsorge für künftige Strafverfahren – materiell Gefahrenabwehr","Beweisführung im laufenden Verfahren","Ahndung von OWi","Erstellung eines Personalausweises"],"Präventive ED-Behandlung; Rechtsweg zu den Verwaltungsgerichten."],
 ["Dürfen Maßnahmen nach § 81b StPO gegen den Willen des Beschuldigten durchgeführt werden?",["Ja, auch zwangsweise","Nein, nur freiwillig","Nur mit Zustimmung eines Anwalts","Nur bei Minderjährigen"],"Ausdrücklich „auch gegen seinen Willen“."]],
asservadler:[
 ["Was ist nach § 94 StPO Gegenstand der Sicherstellung?",["Gegenstände, die als Beweismittel für die Untersuchung von Bedeutung sein können","Nur Tatwaffen","Nur Bargeld","Jede Sache des Beschuldigten"],"Potenzielle Beweisbedeutung genügt."],
 ["Wann ist eine förmliche Beschlagnahme nach § 94 Abs. 2 StPO nötig?",["Wenn der Gewahrsamsinhaber die Sache nicht freiwillig herausgibt","Immer","Nie","Nur bei Gegenständen über 500 €"],"Freiwillige Herausgabe → formlose Sicherstellung."],
 ["Was kann nach § 94 Abs. 3 StPO ebenfalls beschlagnahmt werden?",["Führerscheine, die der Einziehung unterliegen","Wohnungen","Personen","Telefonate"],"Vorbereitung der Entziehung der Fahrerlaubnis."]],
richtereule:[
 ["Wer ordnet eine Beschlagnahme nach § 98 StPO grundsätzlich an?",["Das Gericht, bei Gefahr im Verzug auch StA und Ermittlungspersonen","Nur die Polizei","Der Bürgermeister","Der Geschädigte"],"Richtervorbehalt mit Eilkompetenz."],
 ["Wann soll die gerichtliche Bestätigung einer nichtrichterlichen Beschlagnahme binnen drei Tagen beantragt werden?",["Wenn weder der Betroffene noch ein erwachsener Angehöriger anwesend war oder ausdrücklich Widerspruch erhoben wurde","Immer","Nie","Nur bei Fahrzeugen"],"§ 98 Abs. 2 S. 1 StPO."],
 ["Was kann der Betroffene gegen eine Beschlagnahme ohne Richter tun?",["Jederzeit die gerichtliche Entscheidung beantragen","Nichts","Nur Dienstaufsichtsbeschwerde","Eine Verfassungsbeschwerde ohne Rechtsweg"],"§ 98 Abs. 2 S. 2 StPO."]],
ermittlerhund:[
 ["Was ist nach § 163 Abs. 1 StPO Aufgabe der Polizei?",["Straftaten zu erforschen und alle keinen Aufschub gestattenden Anordnungen zu treffen","Urteile zu sprechen","Anklage zu erheben","Strafbefehle zu erlassen"],"„Recht und Pflicht des ersten Zugriffs“."],
 ["Welches Prinzip verpflichtet die Polizei zur Strafverfolgung?",["Legalitätsprinzip","Opportunitätsprinzip","Subsidiaritätsprinzip","Föderalismus"],"Bei Anfangsverdacht besteht Verfolgungszwang (§§ 152, 163 StPO)."],
 ["Was hat die Polizei mit ihren Verhandlungen zu tun?",["Sie ohne Verzug der Staatsanwaltschaft übersenden","Sie selbst abschließend bearbeiten","Sie dem Opfer aushändigen","Sie nach einem Jahr vernichten"],"Die StA ist „Herrin des Ermittlungsverfahrens“."]],
spuerhund:[
 ["Bei wem ist eine Durchsuchung nach § 102 StPO zulässig?",["Beim Verdächtigen (Täter, Teilnehmer, Begünstigung, Strafvereitelung, Hehlerei)","Bei jeder unverdächtigen Person ohne weitere Voraussetzungen","Nur beim Opfer","Nur bei Behörden"],"Abgrenzung zu § 103 StPO (andere Personen)."],
 ["Welche zwei Zwecke kennt § 102 StPO?",["Ergreifung des Verdächtigen und Auffinden von Beweismitteln","Bestrafung und Abschreckung","Gefahrenabwehr und Vollstreckung","Pfändung und Versteigerung"],"Ergreifungs- und Ermittlungsdurchsuchung."],
 ["Welche Wahrscheinlichkeit verlangt § 102 StPO für das Auffinden von Beweismitteln?",["Es muss lediglich zu vermuten sein (kriminalistische Erfahrung)","Es müssen bestimmte Tatsachen vorliegen","Es muss sicher sein","Es muss ein Geständnis vorliegen"],"Niedrigere Schwelle als bei § 103 StPO."]],
handschuhwasch:[
 ["Welche besondere Voraussetzung gilt für die Durchsuchung bei Unverdächtigen (§ 103 StPO)?",["Tatsachen, aus denen zu schließen ist, dass sich die gesuchte Person, Spur oder Sache dort befindet","Bloße Vermutung","Einwilligung des Beschuldigten","Keine besondere Voraussetzung"],"Höhere Schwelle als beim Verdächtigen."],
 ["Wozu darf nach § 103 StPO durchsucht werden?",["Zur Ergreifung des Beschuldigten, zur Verfolgung von Spuren oder zur Beschlagnahme bestimmter Gegenstände","Zur allgemeinen Ausforschung","Zur Gefahrenabwehr","Zur Pfändung"],"Die gesuchten Gegenstände müssen bestimmt sein."],
 ["Welche Räume gelten nach § 103 Abs. 2 StPO als „wie beim Verdächtigen“?",["Räume, in denen der Beschuldigte ergriffen wurde oder die er während der Verfolgung betreten hat","Alle Räume in derselben Stadt","Räume seiner Freunde","Öffentliche Gebäude"],"Erleichterung bei Verfolgungssituationen."]],
lupenkauz:[
 ["Wer ordnet Durchsuchungen nach § 105 StPO grundsätzlich an?",["Der Richter, bei Gefahr im Verzug auch StA und Ermittlungspersonen","Nur die Polizei","Der Bürgermeister","Der Beschuldigte"],"Richtervorbehalt (Art. 13 Abs. 2 GG)."],
 ["Wer soll bei einer Wohnungsdurchsuchung ohne Richter oder Staatsanwalt hinzugezogen werden?",["Ein Gemeindebeamter oder zwei Gemeindemitglieder, wenn möglich","Ein Notar","Der Vermieter","Ein Journalist"],"Durchsuchungszeugen nach § 105 Abs. 2 StPO – keine Polizeibeamten."],
 ["Welche Pflicht hat die Polizei bei Inanspruchnahme der Eilkompetenz?",["Die Gründe für Gefahr im Verzug zeitnah zu dokumentieren","Keine","Einen Zeitungsbericht zu veröffentlichen","Den Beschuldigten zu verhaften"],"Dokumentationspflicht nach BVerfG."]],
stoerkeiler:[
 ["Wer darf nach § 164 StPO Störer festnehmen?",["Der Beamte, der die Amtshandlung an Ort und Stelle leitet","Jeder Bürger","Nur der Richter","Nur die Staatsanwaltschaft"],"Sicherung von Amtshandlungen an Ort und Stelle."],
 ["Wie lange darf ein Störer nach § 164 StPO höchstens festgehalten werden?",["Bis zur Beendigung der Amtshandlung, längstens bis zum Ablauf des nächsten Tages","Zwei Wochen","Drei Stunden","Unbegrenzt"],"Zeitliche Höchstgrenze im Gesetz."],
 ["Wen erfasst § 164 StPO?",["Personen, die die Amtshandlung vorsätzlich stören oder Anordnungen nicht befolgen","Nur Beschuldigte","Nur Zeugen","Nur Minderjährige"],"Jeder Störer, unabhängig von der Verfahrensrolle."]],
fesselstachler:[
 ["Wer darf nach § 127 Abs. 1 StPO vorläufig festnehmen?",["Jedermann, wenn jemand auf frischer Tat betroffen oder verfolgt wird","Nur Polizeibeamte","Nur Richter","Nur Staatsanwälte"],"„Jedermann-Festnahmerecht“."],
 ["Welche Festnahmegründe nennt § 127 Abs. 1 StPO?",["Fluchtverdacht oder Identität nicht sofort feststellbar","Nur Wiederholungsgefahr","Verdunkelungsgefahr","Schwere der Tat"],"Andere Haftgründe gehören zu § 127 Abs. 2 StPO."],
 ["Wann dürfen StA und Polizei nach § 127 Abs. 2 StPO festnehmen?",["Bei Gefahr im Verzug, wenn die Voraussetzungen eines Haft- oder Unterbringungsbefehls vorliegen","Immer ohne Grund","Nur nach richterlicher Anordnung","Nur bei OWi"],"Vorführung spätestens am Tag nach der Festnahme (§ 128 StPO)."]],
protokollfuchs:[
 ["Muss ein Beschuldigter einer polizeilichen Ladung zur Vernehmung folgen?",["Nein, eine Erscheinenspflicht besteht nur vor Staatsanwaltschaft und Gericht","Ja, immer","Nur bei Verbrechen","Nur wenn er minderjährig ist"],"§ 163a Abs. 3 StPO: Pflicht nur bei Ladung der StA."],
 ["Was gilt bei der ersten polizeilichen Vernehmung des Beschuldigten?",["Die Belehrungspflichten des § 136 StPO gelten entsprechend (§ 163a Abs. 4)","Es gibt keine Belehrung","Der Beschuldigte muss aussagen","Ein Anwalt ist verboten"],"Hinweis auf Tatvorwurf, Aussagefreiheit, Verteidigerkonsultation."],
 ["Bis wann ist der Beschuldigte nach § 163a Abs. 1 StPO zu vernehmen?",["Spätestens vor dem Abschluss der Ermittlungen","Innerhalb von 24 Stunden","Erst in der Hauptverhandlung","Nie"],"Rechtliches Gehör im Ermittlungsverfahren."]],
vernehmpapagei:[
 ["Worüber ist der Beschuldigte bei der ersten Vernehmung (§ 136 StPO) zu belehren?",["Tatvorwurf, Aussagefreiheit und Recht auf Verteidigerkonsultation","Nur über die Strafhöhe","Über die Pflicht zur Aussage","Über nichts"],"Zentrale Belehrungspflichten."],
 ["Was folgt nach BGH regelmäßig aus einer unterlassenen Belehrung über das Schweigerecht?",["Ein Beweisverwertungsverbot (bei rechtzeitigem Widerspruch in der Hauptverhandlung)","Nichts","Automatischer Freispruch","Strafschärfung"],"Widerspruchslösung des BGH."],
 ["Was ist der Unterschied zwischen Zeugen- und Beschuldigtenvernehmung?",["Der Beschuldigte darf schweigen und lügen, der Zeuge muss grundsätzlich wahrheitsgemäß aussagen","Es gibt keinen","Zeugen dürfen immer schweigen","Beschuldigte müssen die Wahrheit sagen"],"Nemo-tenetur-Grundsatz für Beschuldigte."]],
verbotsnatter:[
 ["Welche Methode ist nach § 136a StPO verboten?",["Täuschung, Drohung mit unzulässigen Maßnahmen, Ermüdung, Hypnose","Wiederholtes Nachfragen","Vorhalt von Beweismitteln","Hinweis auf Strafmilderung durch Geständnis"],"Abschließende Aufzählung verbotener Mittel; zulässige Vorhalte bleiben erlaubt."],
 ["Dürfen unter Verstoß gegen § 136a StPO gewonnene Aussagen mit Zustimmung des Beschuldigten verwertet werden?",["Nein, das Verwertungsverbot gilt auch bei Zustimmung","Ja, immer","Nur bei Verbrechen","Nur vor dem Amtsgericht"],"§ 136a Abs. 3 S. 2 StPO."],
 ["Für wen gilt § 136a StPO?",["Für Beschuldigte und über Verweisungen auch für Zeugen und Sachverständige","Nur für Richter","Nur für Minderjährige","Nur für Ausländer"],"§ 69 Abs. 3, § 72 StPO verweisen auf § 136a."]],
identiluchs:[
 ["Was darf die Polizei nach § 163b Abs. 1 StPO beim Verdächtigen?",["Die zur Identitätsfeststellung erforderlichen Maßnahmen treffen, ihn notfalls festhalten, durchsuchen und ED-behandeln","Ihn ohne Grund verhaften","Seine Wohnung ohne Weiteres durchsuchen","Ihn zu einer Aussage zwingen"],"Durchsuchung/ED nur, wenn die Identität sonst nicht oder nur erheblich erschwert feststellbar ist."],
 ["Was gilt für Unverdächtige nach § 163b Abs. 2 StPO?",["Identitätsfeststellung ist zulässig, wenn zur Aufklärung geboten; Durchsuchung und ED nicht gegen ihren Willen","Sie dürfen nie angesprochen werden","Sie dürfen wie Verdächtige behandelt werden","Sie müssen eine DNA-Probe abgeben"],"Schutz unbeteiligter Zeugen."],
 ["Wodurch unterscheidet sich § 163b StPO von § 27 PolG?",["§ 163b dient der Strafverfolgung, § 27 PolG der Gefahrenabwehr","Es gibt keinen Unterschied","§ 27 PolG gilt nur für Richter","§ 163b gilt nur für Fahrzeuge"],"Repressiv vs. präventiv – Abgrenzung nach dem Schwerpunkt der Maßnahme."]],
gewahrsamhirsch:[
 ["Wie lange darf eine Person zur Identitätsfeststellung nach § 163c StPO höchstens festgehalten werden?",["Insgesamt nicht länger als zwölf Stunden","24 Stunden","Bis zum Ende des nächsten Tages","Zwei Wochen"],"§ 163c Abs. 2 StPO."],
 ["Was muss nach § 163c Abs. 1 StPO grundsätzlich unverzüglich geschehen?",["Die Person ist dem Richter vorzuführen, außer die Entscheidung käme erst nach der Identitätsfeststellung","Die Person ist freizulassen","Der Arbeitgeber ist zu informieren","Eine Pressemitteilung"],"Art. 104 Abs. 2 GG – richterliche Entscheidung über Freiheitsentziehung."],
 ["Welches Recht hat die festgehaltene Person nach § 163c StPO?",["Einen Angehörigen oder eine Person ihres Vertrauens benachrichtigen zu lassen","Einen Anruf beim Bürgermeister","Ein Telefonat mit der Presse","Keines"],"Benachrichtigungsrecht."]]
};
// extra bank: ≥10 questions per paragraph monster
//@inc js/data/quiz_bank.js


// ===== STUDY: quiz duel in the look of a turn-based battle. Correct answers give EP.
const STUDY_N=5,STUDY_CD=60000;
let ST=null;
function lawShort(sid){const l=SPECIES[sid]&&SPECIES[sid].law;return l?l.split(' · ')[0]:''}
function shuffleArr(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function studyQuestions(sid){
  if(QZ[sid])return shuffleArr(QZ[sid]).slice(0,STUDY_N).map(q=>({src:sid,q}));
  // hero monsters (no paragraph): random questions from random paragraph monsters
  const keys=Object.keys(QZ).filter(k=>SPECIES[k]);const out=[];const used=new Set();
  while(out.length<STUDY_N){const k=keys[Math.floor(Math.random()*keys.length)];const q=QZ[k][Math.floor(Math.random()*QZ[k].length)];if(used.has(q[0]))continue;used.add(q[0]);out.push({src:k,q})}
  return out}
function atHfPol(){return tget(P.x,P.y)===23}
function openHfPol(){if(!RUN||B)return;if(RUN.phase==='arena'){toast('Während des Gerichtsturniers ist die HfPol geschlossen.');return}
  const now=Date.now();
  openModal(`<h3>🎓 HfPol — Hochschule für Polizei</h3><p>Villingen-Knastningen · Hörsaal. Wähle ein Monster für die Prüfung (5 Fragen, Multiple Choice). Richtige Antworten geben EP.</p>
   <div style="display:flex;flex-direction:column;gap:6px;max-height:50vh;overflow:auto">${RUN.team.map((m,i)=>{const left=(m.stT||0)+STUDY_CD-now;return`<button class="btn ${left>0?'ghost':''}" data-hs="${i}" style="text-align:left;font-family:VT323,monospace;font-size:19px">📚 ${nameHtml(m.s)} · Lv ${m.l}${left>0?` · Pause ${Math.ceil(left/1000)} s`:''}</button>`}).join('')}</div>
   <div class="acts" style="margin-top:10px"><button class="btn ghost" id="mno">HÖRSAAL VERLASSEN</button></div>`);
  document.querySelectorAll('[data-hs]').forEach(b=>b.onclick=()=>openStudy(RUN.team[+b.dataset.hs]));$('#mno').onclick=closeModal}
function openStudy(m){
  if(!RUN||B||RUN.phase==='arena'){toast('Lernen geht nur außerhalb von Kämpfen und Gericht.');return}
  if(!atHfPol()){toast('Lernen geht nur in der HfPol (Hochschule für Polizei) — in der Stadt südlich der Hauptstraße, rechts (🎓 auf der Karte).');return}
  const left=(m.stT||0)+STUDY_CD-Date.now();if(left>0){toast(`${SPECIES[m.s].n} braucht eine Lernpause — noch ${Math.ceil(left/1000)} s.`);return}
  closeModal();
  ST={m,qs:studyQuestions(m.s),i:0,ok:0,xp:0,state:'ask',fx:null,t0:performance.now()};
  ST.ex=QZ[m.s]?(m.s==='richtereule'?'wuerdeadler':'richtereule'):null;
  $('#study').classList.add('on');renderStudy();studyLoop();
}
function studyExaminer(){return ST.ex||ST.qs[Math.min(ST.i,ST.qs.length-1)].src}
function renderStudy(){if(!ST)return;const m=ST.m,sp=SPECIES[m.s],st=stats(m);const ex=studyExaminer(),cur=ST.qs[ST.i];
  const xpR=clamp(m.xp/xpNeed(m.l),0,1);
  let h=`<div class="shud"><div class="spanel"><div class="snm"><span>${nameHtml(m.s)}</span><span>Lv${m.l}</span></div><div class="sbar"><i style="width:${xpR*100}%;background:#4aa3ff"></i></div><div class="ssm">EP ${m.xp}/${xpNeed(m.l)}</div></div>
    <div class="spanel"><div class="snm"><span>Prüfer: ${nameHtml(ex)}</span></div><div class="shearts">${ST.qs.map((_,i)=>`<b class="${i<ST.i?(ST.res&&ST.res[i]?'hit':'miss'):''}">⚖</b>`).join('')}</div><div class="ssm">Frage ${Math.min(ST.i+1,ST.qs.length)}/${ST.qs.length} · richtig ${ST.ok}</div></div></div>
    <canvas id="stcv" width="360" height="150"></canvas>`;
  if(ST.state==='done'){
    h+=`<div class="sdlg"><b>${ST.ok===ST.qs.length?'Bestanden mit Auszeichnung!':ST.ok>0?'Prüfung beendet.':'Durchgefallen…'}</b><br>${ST.ok}/${ST.qs.length} richtig · +${ST.xp} EP für ${nameHtml(m.s)}${(ST.msgs||[]).filter(t=>!/erhält/.test(t)).map(t=>'<br>'+esc(t)).join('')}</div>
      <div class="sacts"><button class="btn" id="sclose">SCHLIESSEN</button></div>`;
  }else{
    const q=cur.q;if(!cur.order)cur.order=shuffleArr([0,1,2,3]);
    h+=`<div class="sdlg"><span class="slaw">${esc(SPECIES[cur.src].law||'')}</span><br>${esc(q[0])}${ST.state==='shown'?`<div class="sexp ${cur.right?'ok':'bad'}">${cur.right?'✓ Richtig!':'✗ Falsch.'} ${esc(q[2])}</div>`:''}</div>
      <div class="sans">${cur.order.map((k,j)=>`<button class="sa ${ST.state==='shown'?(k===0?'ok':(cur.pick===k?'bad':'dim')):''}" data-k="${k}" ${ST.state==='shown'?'disabled':''}><span class="sk">${'ABCD'[j]}</span>${esc(q[1][k])}</button>`).join('')}</div>
      ${ST.state==='shown'?`<div class="sacts"><button class="btn" id="snext">${ST.i+1<ST.qs.length?'WEITER ▶':'ERGEBNIS ▶'}</button></div>`:`<div class="sacts"><button class="btn ghost" id="squit">AUFGEBEN</button></div>`}`}
  const el=$('#sbox');el.innerHTML=h;
  el.querySelectorAll('.sa').forEach(b=>b.onclick=()=>studyAnswer(+b.dataset.k));
  const n=$('#snext');if(n)n.onclick=()=>{ST.i++;ST.state=ST.i>=ST.qs.length?'done':'ask';if(ST.state==='done')studyFinish();renderStudy()};
  const qq=$('#squit');if(qq)qq.onclick=()=>{ST.state='done';ST.qs=ST.qs.slice(0,ST.i);studyFinish();renderStudy()};
  const c=$('#sclose');if(c)c.onclick=closeStudy;
}
function studyAnswer(k){if(!ST||ST.state!=='ask')return;const cur=ST.qs[ST.i];cur.pick=k;cur.right=k===0;ST.res=ST.res||[];ST.res[ST.i]=cur.right;
  if(cur.right){ST.ok++;const amt=Math.max(4,Math.round(xpNeed(ST.m.l)*0.12/((RUN.cfg&&RUN.cfg.xp)||1)));ST.pend=(ST.pend||0)+amt;ST.fx={k:'hit',t:performance.now()}}
  else ST.fx={k:'miss',t:performance.now()};
  ST.state='shown';renderStudy()}
function studyFinish(){const m=ST.m;m.stT=Date.now();if(ST.pend){const before=m.xp+xpNeed(m.l)*0;ST.msgs=gainXp(m,ST.pend);ST.xp=Math.round(ST.pend*((RUN.cfg&&RUN.cfg.xp)||1));for(const t of ST.msgs)sysChat(t);save();renderTeam();pushMt()}}
function closeStudy(){$('#study').classList.remove('on');ST=null;if(atHfPol())openHfPol()}
function studyLoop(){if(!ST)return;const cv=$('#stcv');if(cv){const c=cv.getContext('2d');c.imageSmoothingEnabled=false;const W=360,H=150,now=performance.now(),t=now/1000;
    c.fillStyle='#3d7a34';c.fillRect(0,0,W,H);c.fillStyle='#4f9441';c.beginPath();c.ellipse(90,120,80,20,0,0,7);c.fill();c.beginPath();c.ellipse(270,62,70,16,0,0,7);c.fill();
    c.fillStyle='#5aa24b';for(let i=0;i<40;i++){c.fillRect((i*53)%W,(i*29)%H,2,2)}
    const fx=ST.fx,fk=fx?(now-fx.t)/500:9;
    const ex=studyExaminer();const es=monSprite(ex,24);let exX=270,exY=66;let exA=1;
    if(fx&&fx.k==='hit'&&fk<1){exX+=Math.sin(fk*30)*4;exA=Math.floor(fk*10)%2?0.4:1}
    c.globalAlpha=exA;c.save();c.translate(exX,exY+Math.sin(t*2)*2);c.scale(-1,1);c.drawImage(es,-40,-70,80,80);c.restore();c.globalAlpha=1;
    const ms=monSprite(ST.m.s,24);let mx=90,my=126;
    if(fx&&fx.k==='hit'&&fk<1){const e=Math.sin(fk*Math.PI);mx+=e*60;my-=e*24}
    if(fx&&fx.k==='miss'&&fk<1){mx+=Math.sin(fk*40)*5}
    const sx=SPECIES[ST.m.s].faceR?1:-1;c.save();c.translate(mx,my+Math.sin(t*3)*1.5);c.scale(sx,1);c.drawImage(ms,-48,-96,96,96);c.restore();
    if(fx&&fk<1.6){c.font='12px "Press Start 2P",monospace';c.textAlign='center';c.fillStyle='#14141f';const txt=fx.k==='hit'?'RICHTIG!':'FALSCH!';c.fillText(txt,W/2+1,31-fk*6);c.fillStyle=fx.k==='hit'?'#3ddc6b':'#ef4444';c.fillText(txt,W/2,30-fk*6)}}
  requestAnimationFrame(studyLoop)}

