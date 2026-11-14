/* ===================== LOOP ===================== */
let last=performance.now(),slow=0;
function frame(now){if(!WORLD&&!BAKE_FAIL)bakeTick();const dt=Math.max(0,Math.min(0.05,(now-last)/1000));last=now;T+=dt;
  try{if(G){if(!B)updatePlayer(dt);updateOthers(dt);if(B&&!panicPaused())bUpdate(dt);if(B&&$('#battle').classList.contains('on')){drawBattle();updateBattleUI()}else drawWorld();if(mapOpen())drawMap();
}}catch(e){console.error(e);if(!frame.errShown){frame.errShown=1;showErr(e.message+' (frame)')}}
  try{drawFX()}catch(e){console.error(e)}
  try{updateTouch()}catch(e){console.error(e)}
  requestAnimationFrame(frame)}


// bug report: opens a prefilled GitHub issue (version, browser, game state) in a new tab
function bugReport(){
  const st=[`Version: v${VERSION}`,`Browser: ${navigator.userAgent}`,`Bildschirm: ${innerWidth}×${innerHeight}${matchMedia&&matchMedia('(pointer:coarse)').matches?' (Touch)':''}`,
    `Modus: ${!RUN?'—':RUN.free?'Freies Spiel':'Lobby ('+RUN.phase+(RUN.cfg&&RUN.cfg.tb?', rundenbasiert':', Echtzeit')+')'}`,`Kampf: ${B?B.mode+'/'+B.state:'—'}`,`Ort: ${P.x},${P.y}`,`Verbindung: ${ROOM?'online':'offline'}${typeof TURN_ACTIVE!=='undefined'&&TURN_ACTIVE.length?' · TURN':''}`].join('\n');
  const body=`**Was ist passiert?**\n\n\n**Was hätte passieren sollen?**\n\n\n**Schritte zum Nachstellen**\n1. \n2. \n\n---\n<details><summary>Technische Infos (automatisch)</summary>\n\n\`\`\`\n${st}\n\`\`\`\n</details>`;
  const url='https://github.com/harryer46/PocketPeasants/issues/new?labels=bug&title='+encodeURIComponent(`[Bug] v${VERSION}: `)+'&body='+encodeURIComponent(body);
  const w=window.open(url,'_blank','noopener');if(!w)location.href=url}


