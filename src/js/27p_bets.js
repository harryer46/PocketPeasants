// ===== Wetten vor freien PvP-Kämpfen (nur im freien Spiel) =====
// Wer herausfordert, wählt den Einsatz (Standard 0 $, in 50-$-Schritten bis zum eigenen Kontostand).
// Der Herausgeforderte sieht den Einsatz und kann nur annehmen, wenn er ihn selbst bezahlen kann. Sieger +Einsatz, Verlierer −Einsatz.
const BET_BY_ID={};let BET_PEND=null;
{const _p=pres;pres=function(o){if(o&&o.ch&&BET_PEND!=null&&o.ch.bet==null)o.ch.bet=BET_PEND;return _p.apply(this,arguments)}}
function betOn(){return!!(RUN&&RUN.free)}
{const _ch=challenge;challenge=function(peer){if(!betOn()||myCh||!canSpar())return _ch.apply(this,arguments);
  const max=Math.floor((RUN.money||0)/50)*50;let bet=0;const p=findPeer(peer);
  const draw=()=>{$('#betv').textContent=bet+' $';$('#betm').disabled=bet<=0;$('#betp').disabled=bet+50>max};
  openModal(`<h3>⚔ KAMPFANFRAGE</h3><p>Herausforderung an <b>${esc(p?cleanName(p.presence.n):'Spieler')}</b>.</p><p>💰 Wetteinsatz – der Sieger bekommt ihn vom Verlierer:</p>
   <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0"><button class="btn ghost" id="betm">−50</button><b id="betv" style="font-size:22px;min-width:90px;text-align:center">0 $</b><button class="btn ghost" id="betp">+50</button></div>
   <p class="small">Dein Geld: ${RUN.money||0} $. Ohne Einsatz geht es nur um EP und Ehre.</p><div class="acts"><button class="btn ghost" id="mno">ABBRECHEN</button><button class="btn" id="myes">ANFRAGE SENDEN</button></div>`);
  draw();$('#betm').onclick=()=>{bet=Math.max(0,bet-50);draw()};$('#betp').onclick=()=>{bet=Math.min(max,bet+50);draw()};$('#mno').onclick=closeModal;
  $('#myes').onclick=()=>{closeModal();BET_PEND=bet;try{_ch.call(null,peer)}finally{BET_PEND=null}if(myCh){myCh.bet=bet;BET_BY_ID[myCh.id]=bet}}}}
{const _sc=showChallenge;showChallenge=function(peer,id,name){const p=findPeer(peer),bet=Math.max(0,Math.floor(+(p&&p.presence.ch&&p.presence.ch.bet)||0));const r=_sc.apply(this,arguments);
  if(!betOn()||!bet){BET_BY_ID[id]=0;return r}BET_BY_ID[id]=bet;const can=(RUN.money||0)>=bet,pp=document.querySelector('#mbox p');
  if(pp)pp.insertAdjacentHTML('afterend',`<p style="color:${can?'#ffcb3d':'#ef4444'}">💰 Wetteinsatz: <b>${bet} $</b> – der Sieger bekommt ihn.${can?'':` Du hast nur ${RUN.money||0} $.`}</p>`);
  if(!can){const y=$('#myes');if(y){y.disabled=true;y.classList.add('ghost');y.textContent='ZU WENIG GELD'}}return r}}
{const _sd=startDuel;startDuel=function(peer,id,spar){const r=_sd.apply(this,arguments);try{if(B&&spar&&betOn())B.bet=BET_BY_ID[id]||0;if(B&&B.bet)say(`💰 Es geht um ${B.bet} $!`)}catch(e){}return r}}
{const _dr=duelResult;duelResult=function(win,why){const bet=B&&B.spar&&B.state!=='over'&&B.bet||0;const r=_dr.apply(this,arguments);
  if(bet&&RUN){if(win===true)earn(bet,'Wetteinsatz gewonnen');else if(win===false){RUN.money=Math.max(0,(RUN.money||0)-bet);save();updateHud();toast(`💸 −${bet} $ Wetteinsatz verloren`)}}return r}}
