/* ===================== BOOT ===================== */
applyControls();
G=loadSave();
$('#tver').textContent='v'+VERSION;$('#sver').textContent='v'+VERSION;{const v2=$('#sver2');if(v2)v2.textContent='VERSION '+VERSION}
if(G){$('#sname').value=G.name;if(COLORS.includes(G.color))pickColor=G.color;if(G.sex==='f')pickSex='f'}
buildStart();
requestAnimationFrame(frame);
setInterval(()=>{try{if(G){try{pushSb()}catch(e){}matchTick();arenaTick();checkChallenges();if(!RUN||RUN.free||RUN.phase==='lobby')renderLobby();renderPlayers();renderLobbyPane()}}catch(e){console.error(e)}},400);
initRoom();
