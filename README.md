# Pocket Peasants — Budget Edition™

Multiplayer-Monster-Browserspiel (Pixelart, Echtzeitkämpfe, Match-Modus mit Arena-Turnier).
Alles steckt in **einer Datei: `index.html`** – kein Server, keine Kosten.

## Auf GitHub Pages veröffentlichen (kostenlos, ca. 5 Minuten)

1. Auf **github.com** anmelden (oder kostenloses Konto erstellen).
2. Oben rechts **+ → New repository**.
   - Name z. B. `PocketPeasants`
   - **Public** auswählen
   - **Create repository** klicken.
3. Auf der neuen Repo-Seite: **„uploading an existing file“** anklicken
   (oder *Add file → Upload files*), `index.html` (und optional diese `README.md`) hineinziehen,
   unten **Commit changes** klicken.
4. Im Repo: **Settings → Pages** (linke Leiste).
   - *Source*: **Deploy from a branch**
   - *Branch*: **main**, Ordner **/ (root)** → **Save**.
5. Nach 1–2 Minuten erscheint oben die Adresse, z. B.
   `https://DEINNAME.github.io/PocketPeasants/`

Diesen Link an Freunde schicken – fertig. Kein Claude-Konto nötig.

## Wie der Mehrspieler funktioniert

- Die Spieler verbinden sich **direkt miteinander** (WebRTC über Trystero).
  Zum Finden nutzt das Spiel kostenlose öffentliche Nostr-Relays – es gibt keinen eigenen Server.
- Wer die Seite gleichzeitig offen hat, landet im gleichen Raum („world“).
- **Private Runde:** `…/PocketPeasants/?room=meinefreunde` – nur wer denselben Raumnamen nutzt,
  sieht sich. (Geht auch im Tab *Players* über „JOIN ROOM“.)
- Das Finden kann ein paar Sekunden dauern. In sehr strengen Firmen- oder Schulnetzen
  kann WebRTC blockiert sein – dann läuft das Spiel solo (Arena gegen Champion Bot).

## TURN-Ausweichserver (nur falls sich Spieler nicht sehen)

Manche Netze (Schule, Firma, einige Mobilfunkanbieter) erlauben keine direkte Verbindung.
Dann leitet ein TURN-Server die Daten weiter – nur für die Spieler, die es brauchen.

**Kostenlos mit Metered „Open Relay“ (ca. 20 GB/Monat gratis):**
1. Konto anlegen: https://dashboard.metered.ca/signup (keine Kreditkarte nötig).
2. Im Dashboard: **TURN Server → Credentials → Add Credential**.
3. Dort den **API-Key** der Credential kopieren und deinen App-Namen notieren
   (steht im Dashboard, Form `DEINAPP.metered.live`).
4. In `index.html` ganz oben im Block **MULTIPLAYER NETWORK CONFIG** eintragen:
   ```js
   const TURN_CONFIG = {
     apiUrl: 'https://DEINAPP.metered.live/api/v1/turn/credentials?apiKey=DEIN_KEY',
     servers: []
   };
   ```
   Dieser Key ist laut Metered für die Verwendung im Browser gedacht.
5. `index.html` erneut auf GitHub hochladen. Jetzt nutzen **alle** Spieler automatisch TURN.

**Zum Ausprobieren ohne Datei-Änderung:** Im Spiel **⚙ CONTROLS → NETWORK** die API-URL
(oder TURN-URL + Benutzername + Passwort) eintragen → **TEST** → bei „✓ TURN works“
**SAVE & RECONNECT**. Das gilt aber nur in diesem Browser.

Oben in der Leiste steht dann `· TURN`. Ein `⚠` bedeutet: Eine Verbindung ist gescheitert.
Im Tab *Players* steht bei jedem Mitspieler der **Ping** (grün < 80 ms, gelb < 150 ms, rot darüber).

## Spielablauf

1. **Lobby:** Match starten (3 / 5 / 10 Min.) oder einem laufenden beitreten → Starter wählen.
2. **Training:** Im hohen Gras wilde Monster bekämpfen und fangen (Kapseln werfen!).
   Rotes Dach = Heilzentrum. Im Tab *Players* kannst du andere Trainierende direkt
   zum **Freundschaftskampf** herausfordern (Gewinner bekommt EP).
3. **Arena:** Wenn der Timer abläuft, K.-o.-Turnier in Echtzeit. Ungerade Spielerzahl → Champion Bot.
4. **Rematch:** Danach „NEW MATCH · 10 MIN“ – die anderen sehen „JOIN REMATCH“.

**Steuerung:** WASD/Pfeile laufen · im Kampf 1–4 Attacken, Leertaste Ausweichen,
Q Wechseln, C Kapsel, R Flucht · am Handy: auf dem Kampffeld gedrückt halten zum Laufen.
