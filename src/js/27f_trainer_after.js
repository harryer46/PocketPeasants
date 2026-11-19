/* ===================== TRAINER CLOSING DIALOG =====================
   After an NPC trainer is beaten, the trainer says a short closing line once the battle screen is gone
   (their `after` line, or a generic one). PMLK examiners keep their own follow-up dialog. */
const AFTER_GEN=['Na gut, du hast gewonnen. Diesmal.','Ich schreib das mal als Erfahrungswert ins Protokoll.','Respekt. Das war sauber gearbeitet.','Meine Monster brauchen erst mal Dienstfrei.','Beim nächsten Mal bin ich besser vorbereitet!','Das melde ich … ach, lass gut sein.'];
{const _tw=trainerWin;trainerWin=async function(){const t=B&&B.trainer;const r=await _tw.apply(this,arguments);
  if(t&&!t.pplk&&!t.gift&&!t.toll){const tx=(t.after&&String(t.after).trim())||AFTER_GEN[hashStr(t.id)%AFTER_GEN.length];let n=0;
    const w=()=>{if(++n>60)return;if(B||TALK||$('#modal').classList.contains('on')){setTimeout(w,300);return}talk(t.n,tx)};setTimeout(w,400)}
  return r}}
