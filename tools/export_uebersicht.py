import os
import asyncio,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page();await pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))+'');await pg.wait_for_timeout(800)
        d=await pg.evaluate("""(()=>{const ids=rosterIds();const prev=s=>Object.keys(SPECIES).find(k=>SPECIES[k].evo&&SPECIES[k].evo[1]===s);
          const sp=ids.map(s=>{const S=SPECIES[s];let img='';try{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const im=monSprite(s,64);if(im){x.drawImage(im,0,0,64,64);img=c.toDataURL()}}catch(e){}
            return{id:s,n:S.n,t:TYPES[S.t].n,tc:TYPES[S.t].c,law:S.law||'',rar:RAR[s]||'',evo:S.evo?[S.evo[0],SPECIES[S.evo[1]]?SPECIES[S.evo[1]].n:S.evo[1]]:null,prev:prev(s)?SPECIES[prev(s)].n:null,b:S.b,dex:(typeof DEX_TXT!=='undefined'&&DEX_TXT[s])||'',img,
              q:(QZ[s]||[]).map(q=>[q[0],q[1][0],q[3]||''])}});
          return{sp,book:Object.fromEntries(Object.entries(VAULT_BOOK).map(([k,v])=>[k,v.map(q=>[q[0],q[1][0],q[3]||''])])),ver:VERSION}})()""")
        json.dump(d,open(''+os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','uebersicht','data.json')+'','w'),ensure_ascii=False)
        print(len(d['sp']),sum(len(s['q']) for s in d['sp']),sum(1 for s in d['sp'] if s['img']),{k:len(v) for k,v in d['book'].items()})
        await b.close()
asyncio.run(main())
