/* ===================== EVOLUTION LINES: quiz + dex texts =====================
   (QZ and DEX_TXT exist only from 23 on.) An evolution asks the questions of its base form; the dex text says
   what changed and, for StGB lines, which sentencing rule the new stage stands for. */
{const T1=['hat im Dienst ordentlich zugelegt: größer, kräftiger und schwerer zu bremsen.','ist die erfahrene Form – wer sie trifft, merkt sofort den Unterschied.','hat die Probezeit hinter sich und tritt jetzt deutlich selbstbewusster auf.'];
 const T2=['Die Endstufe der Linie. Kaum ein Monster hält ihrem Auftritt stand.','Voll ausgebildet und mit goldenem Abzeichen – die höchste Stufe dieser Art.','Ganz oben angekommen: mächtig, erfahren und ausgesprochen ungemütlich.'];
 for(const id in SPECIES){const sp=SPECIES[id];if(!sp.evoOf)continue;const b=sp.evoOf,B=SPECIES[b];
   // an evolution asks its own questions plus those of its base form (a few own questions alone get repetitive)
   if(typeof QZ!=='undefined'&&QZ[b]){if(!QZ[id])QZ[id]=QZ[b];else if(QZ[id]!==QZ[b]&&QZ[id].length<8){const seen=new Set(QZ[id].map(q=>q[0]));QZ[id]=QZ[id].concat(QZ[b].filter(q=>!seen.has(q[0])))}}
   if(typeof DEX_TXT==='undefined'||DEX_TXT[id])continue;
   const fin=!sp.evo,h=hashStr(id),bn=B.base||B.n,me=sp.base||sp.n;
   let t=fin?`${me}: ${T2[h%T2.length]} Entwickelt aus ${bn}.`:`${me} ist die nächste Stufe von ${bn} und ${T1[h%T1.length]}`;
   if(sp.law&&sp.law!==B.law){const lt=lawTitle(id);if(lt)t+=` Rechtlich: ${lt.head} – ${lt.title}.`}
   DEX_TXT[id]=t}
 // questions of a line count once in the law pools
 const _lq=lawQuestions;lawQuestions=function(law){const seen=new Set();return _lq(law).filter(x=>{const k=x.q&&x.q[0];if(seen.has(k))return false;seen.add(k);return true})}}
