(()=>{const selfId='t'+Math.random().toString(36).slice(2,8);
window.Trystero={selfId,joinRoom(cfg,roomId,cb){window.__trCfg=cfg;window.__trCb=cb;const bc=new BroadcastChannel('tr-'+roomId+'|'+(cfg.password||''));const acts={};const known=new Set();
 const room={onPeerJoin:null,onPeerLeave:null,leave(){try{bc.postMessage({t:'bye',from:selfId});bc.close()}catch(e){}},makeAction(n){const a={onMessage:null,send(d,o){bc.postMessage({t:'a',n,from:selfId,to:o&&o.target,d:JSON.parse(JSON.stringify(d))})}};acts[n]=a;return a}};
 const join=id=>{if(!known.has(id)){known.add(id);room.onPeerJoin&&room.onPeerJoin(id)}};
 bc.onmessage=e=>{const m=e.data;if(m.from===selfId)return;if(m.t==='h'){join(m.from);bc.postMessage({t:'hb',from:selfId})}else if(m.t==='hb')join(m.from);else if(m.t==='bye'){if(known.delete(m.from))room.onPeerLeave&&room.onPeerLeave(m.from)}else if(m.t==='a'){if(m.to&&m.to!==selfId)return;join(m.from);const a=acts[m.n];a&&a.onMessage&&a.onMessage(m.d,{peerId:m.from})}};
 setTimeout(()=>bc.postMessage({t:'h',from:selfId}),300);return room}}})();
