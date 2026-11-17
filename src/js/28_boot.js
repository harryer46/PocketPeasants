/* ===================== BOOT ===================== */
applyControls();
G=loadSave();
$('#tver').textContent='v'+VERSION;$('#sver').textContent='v'+VERSION;{const v2=$('#sver2');if(v2)v2.textContent='VERSION '+VERSION}
if(G){$('#sname').value=G.name;if(COLORS.includes(G.color))pickColor=G.color;if(G.sex==='f')pickSex='f'}
buildStart();
requestAnimationFrame(frame);
// play time since the last full reset (only counted while the tab is visible)
let PLAY_T=Date.now();setInterval(()=>{const n=Date.now(),d=n-PLAY_T;PLAY_T=n;if(G&&!document.hidden&&d>0&&d<5000)G.play=(G.play||0)+d},1000);
setInterval(()=>{try{if(typeof curTab!=='undefined'&&curTab==='team'&&sideOpen()&&!B)renderTeam()}catch(e){}},60000);
function playTime(){const m=Math.floor((G&&G.play||0)/60000);return m<60?`${m} min`:`${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')} min`}
setInterval(()=>{try{if(G){try{pushSb();tradeTick()}catch(e){console.error(e)}matchTick();arenaTick();checkChallenges();if(!RUN||RUN.free||RUN.phase==='lobby')renderLobby();renderPlayers();renderLobbyPane()}}catch(e){console.error(e)}},400);
initRoom();
