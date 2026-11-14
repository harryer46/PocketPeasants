s=open('/home/claude/monsterwelt.html').read()
bundle=open('trystero.bundle.js').read()
def rep(a,b):
    global s
    assert s.count(a)==1,(a[:70],s.count(a)); s=s.replace(a,b)
adapter=open('adapter.js').read()
i0=s.index("async function initRoom(){");i1=s.index("function others(){")
s=s[:i0]+"""async function initRoom(){
  setConn(false,'Verbinde…');
  if(!pwOK()){setConn(false,'Passwort fehlt');return}
  try{TURN_ACTIVE=await getTurnServers()}catch(e){TURN_ACTIVE=[]}
  try{ROOM=makeP2PRoom(ROOM_ID,TURN_ACTIVE);ROOM.onPeers(onRoomPeers);setConnLabel();pushFull()}
  catch(e){console.error(e);ROOM=null;setConn(false,'Solo (offline)')}
}
"""+s[i1:]
rep("/* ===================== MATCHES ===================== */",adapter+"\n/* ===================== MATCHES ===================== */")
rep("""  if(!ROOM)h=`<div class="small" style="line-height:1.15">Mehrspieler ist in dieser Ansicht nicht verbunden — du spielst solo (im Gericht kämpfst du gegen den Richter-Bot).<br><br>Zum gemeinsamen Spielen teile diese Seite: Alle, die sie gleichzeitig offen haben, erscheinen auf der Karte.</div>`;""",
"""  const link=location.origin+location.pathname+(ROOM_ID==='world'?'':'?room='+ROOM_ID);
  h+=`<div class="sec">RAUM: ${esc(ROOM_ID.toUpperCase())}</div><div class="small" style="line-height:1.15;margin-bottom:8px">Alle, die diesen Link gleichzeitig öffnen, spielen zusammen:<br><span style="color:var(--text);word-break:break-all">${esc(link)}</span></div><div class="lrow" style="margin-bottom:12px"><input id="proom" maxlength="32" placeholder="privater Raumname" style="flex:1;min-width:0;background:#0b0d16;border:2px solid #000;color:var(--text);font-family:inherit;font-size:18px;padding:3px 6px"><button class="btn ghost" id="pgo">RAUM BETRETEN</button></div>`;
  if(!ROOM)h+=`<div class="small">Mehrspieler konnte in diesem Browser nicht starten — du spielst solo (im Gericht kämpfst du gegen den Richter-Bot).</div>`;""")
rep("    if(!list.length)h+=`<div class=\"small\" style=\"line-height:1.15;margin-top:8px\">Gerade ist niemand sonst online. Teile die Seite — wer sie gleichzeitig offen hat, erscheint hier und kann deinem Spiel beitreten.</div>`;",
"    if(!list.length)h+=`<div class=\"small\" style=\"line-height:1.15;margin-top:8px\">Noch ist niemand hier. Schick den Link oben an Freunde — bis ihr euch findet, kann es ein paar Sekunden dauern.</div>`;")
rep("  if(h!==lastPlr){lastPlr=h;el.innerHTML=h;bindPlayers(el)}","""  if(h!==lastPlr){if(document.activeElement&&document.activeElement.id==='proom')return;lastPlr=h;el.innerHTML=h;bindPlayers(el);const go=()=>{const v=($('#proom').value||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,32);location.search=v?'?room='+v:''};const b=$('#pgo');if(b){b.onclick=go;$('#proom').addEventListener('keydown',e=>{if(e.key==='Enter')go()})}}""")
rep("<script>\n'use strict';","<script>\n"+bundle+"\n</script>\n<script>\n'use strict';\n"+open('netconfig.js').read())
rep("const SAVE_KEY='mwo-v2';","const SAVE_KEY='discountmon-v1';")
open('index.html','w').write(s)
open('test.html','w').write(s.replace(bundle,open('mock_tr.js').read()).replace("<script>\n'use strict';","<script>try{localStorage.setItem('knast_pw','HFPOL')}catch(e){}</script>\n<script>\n'use strict';",1))
print('built',len(s))
