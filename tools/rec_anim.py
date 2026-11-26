import asyncio,base64,os,sys,subprocess,json
from playwright.async_api import async_playwright
OUT=os.path.join(os.path.dirname(__file__),'..','uebersicht','anim');ONLY=sys.argv[1:] 
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1000,'height':700})
        await pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','gp','test.html'))+'');await pg.wait_for_timeout(1500)
        await pg.fill('#sname','R');await pg.click('#sgo');await pg.wait_for_timeout(400);await pg.evaluate("startFree()");await pg.wait_for_timeout(1500);await pg.evaluate("closeModal();P.lock=true")
        ids=await pg.evaluate("""(()=>{const by={};for(const s of Object.keys(SPECIES)){for(const e of (SPECIES[s].ls||[])){if(!by[e[1]]||e[0]<by[e[1]][1])by[e[1]]=[s,e[0]]}}
          return Object.keys(MOVES).filter(k=>!MOVES[k].hidden).map(k=>[k,by[k]?by[k][0]:'harrymon'])})()""")
        if ONLY: ids=[x for x in ids if x[0] in ONLY]
        for n,(mid,sid) in enumerate(ids):
            fr=await pg.evaluate("""async([mid,sid])=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));pvShow(document.body,mid,sid);const cv=MVP.querySelector('canvas');const out=[];
              for(let i=0;i<42;i++){await sl(62);out.push(cv.toDataURL('image/png'))}pvHide();await sl(80);return out}""",[mid,sid])
            d=f'/tmp/fr/{mid}';os.makedirs(d,exist_ok=True)
            for i,u in enumerate(fr):open(f'{d}/{i:03d}.png','wb').write(base64.b64decode(u.split(',')[1]))
            subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','16','-i',f'{d}/%03d.png','-loop','0','-c:v','libwebp_anim','-lossless','1','-compression_level','6',f'{OUT}/{mid}.webp'])
            print(n,mid,os.path.getsize(f'{OUT}/{mid}.webp'),flush=True)
        await b.close()
asyncio.run(main())
