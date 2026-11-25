# Cloudflare TURN für Pocket Peasants einrichten (ca. 10 Minuten, kostenlos)

TURN wird nur von Spielern genutzt, die keine direkte Verbindung bekommen (Schul-/Firmen-WLAN, manche Mobilfunknetze).
Cloudflare leitet jeden Spieler automatisch zum nächsten Rechenzentrum (z. B. Frankfurt) → niedriger Ping.
Kostenlos: 1.000 GB pro Monat (nur Daten vom Server zum Spieler werden gezählt).

## 1. Cloudflare-Account
https://dash.cloudflare.com/sign-up – kostenlos, keine Kreditkarte nötig.

## 2. TURN-Schlüssel anlegen
1. Im Dashboard links: **Realtime** (ggf. unter „Media“) → **TURN Server** → **Create**.
2. Name z. B. `pocketpeasants`.
3. Cloudflare zeigt jetzt **Turn Token ID** und **API Token**. Beide kopieren – der API Token wird nur einmal angezeigt!

## 3. Worker anlegen
1. Links: **Workers & Pages** → **Create** → **Create Worker** (Hello World) → Name `pp-turn` → **Deploy**.
2. **Edit code** → gesamten Inhalt durch `worker.js` aus diesem Ordner ersetzen → **Deploy**.
3. Zurück zum Worker → **Settings** → **Variables and Secrets** → **Add**:
   - `TURN_KEY_ID` – Typ *Text* – Wert: die Turn Token ID
   - `TURN_KEY_API_TOKEN` – Typ *Secret* – Wert: der API Token
   - → **Deploy**
4. Die Worker-Adresse steht oben, z. B. `https://pp-turn.DEINNAME.workers.dev`.

## 3b. Kostenbremse (empfohlen)
Der Worker prüft dann alle 10 Minuten den TURN-Verbrauch des Monats und gibt ab 900 GB keine Zugangsdaten mehr aus.
Das Spiel fällt dann automatisch auf Metered bzw. Direktverbindung zurück.
1. **Account-ID**: Dashboard → Workers & Pages → rechts in der Seitenleiste „Account ID“ (oder in der Adresszeile `dash.cloudflare.com/<ACCOUNT-ID>/…`).
2. **Analytics-Token**: oben rechts Profil → **My Profile** → **API Tokens** → **Create Token** → **Create Custom Token**
   → Name `pp-turn-usage` → Permissions: **Account** · **Account Analytics** · **Read** → Account Resources: dein Account → **Continue** → **Create Token** → Token kopieren.
3. Beim Worker unter **Variables and Secrets** hinzufügen:
   - `CF_ACCOUNT_ID` – *Text* – die Account-ID
   - `CF_ANALYTICS_TOKEN` – *Secret* – der Analytics-Token
   - optional `LIMIT_GB` – *Text* – z. B. `500` für ein strengeres Limit
   - → **Deploy**
4. Zusätzlich: **Notifications** (linke Seitenleiste bzw. Account-Startseite) → **Add** → nach „Billing“/„Usage“ suchen und eine E-Mail-Warnung für nutzungsabhängige Kosten anlegen, falls angeboten.
5. Keine Zahlungsmethode hinterlegen und kein Upgrade auf einen bezahlten Plan – für TURN, Worker und Analytics ist beides nicht nötig.

## 4. Testen
Die Adresse im Browser direkt aufzurufen ergibt absichtlich `origin not allowed` (Schutz vor Fremdnutzung) – das heißt, der Worker läuft.

## 5. Im Spiel eintragen
Die Worker-Adresse an Claude schicken (wird fest ins Spiel eingebaut) – oder in `index.html` bei `TURN_CONFIG` → `apiUrl:` eintragen.
Zum sofortigen Testen ohne neue Version: Im Spiel **⚙ STEUERUNG → NETZWERK** → Feld „API-URL“ → Adresse einfügen → **Test**.

Metered (500 MB) bleibt als Reserve eingetragen; der Browser wählt automatisch die schnellste Verbindung.
Verbrauch prüfen: Dashboard → Realtime → TURN → Analytics.
