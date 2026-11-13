# Persoonlijk logboek

Twee onderdelen in één app: **Contacten** (wie heb je ontmoet, waar, wat moet je onthouden) en **Verhalen** (wat je zelf hebt meegemaakt, verteld in je eigen woorden). De hele app staat in één bestand: `index.html`, plus een klein hulpbestand `sw.js` dat de app ook zonder internet laat openen. Er is geen server en er zijn geen libraries.

- **Inspreken**: één tik en de app luistert. Bij contacten haalt hij uit "Jan de Vries, ontmoet op de borrel, werkt bij een bank" zelf de naam en de plek. Controleer het even voordat je opslaat. In het tekstvak blijft de app luisteren tot je op Stop tikt, ook na een stilte.
- **Dubbele namen**: bestaat een naam al, dan vraagt de app of het dezelfde persoon is. Zo ja, dan komt je notitie als aanvulling bij de bestaande persoon.
- **Waar ontmoet**: een eigen veld met suggesties uit eerdere plekken. Tik op 📍 bij een persoon om iedereen van die plek te zien.
- **Verhalen**: met een titel (of automatisch de eerste woorden), de datum waarop het gebeurde, en lang achter elkaar inspreken.
- **Aanvullen**: extra tekst bij een persoon of verhaal. Die komt met de datum onder de bestaande tekst.
- **Opschonen**: stopwoordjes ("eh", "zeg maar") en herhalingen eruit. Bij contacten wordt het een kort lijstje, bij verhalen blijft het lopende tekst. Dit gebeurt op je telefoon zelf, zonder AI-dienst. Met *Ongedaan maken* krijg je de ruwe tekst terug.
- **Sorteren**: nieuwste, laatst bijgewerkt, naam A–Z, per maand, per plek (contacten) of per jaar (verhalen).
- **Pincode**: 4–6 cijfers bij het openen en na 30 seconden weg. In de app-wisselaar is het scherm afgedekt. Na 5 foute pogingen moet je even wachten. Let op: dit is een slot op het scherm, geen versleuteling. Pincode vergeten? Dan kun je alles op het toestel wissen en terugzetten via de GitHub-back-up.
- **Back-up**: synchroniseert contacten én verhalen met een JSON-bestand in je eigen private GitHub-repo.

---

## a. De app hosten via GitHub Pages (aparte PUBLIEKE repo, zonder data)

1. Ga op github.com naar **New repository**, bijvoorbeeld `persoonlijk-logboek`, en kies **Public**.
2. Kies **Add file → Upload files**, upload alleen `index.html` en `sw.js` (en eventueel deze README) en klik **Commit changes**.
3. Ga naar **Settings → Pages**. Kies bij *Source* **Deploy from a branch**, met branch `main` en map `/ (root)`. Klik **Save**.
4. Na ongeveer een minuut staat de app op `https://<jouw-gebruikersnaam>.github.io/persoonlijk-logboek/`.

> Zet in deze publieke repo **nooit** je contacten of een token. De app bewaart je gegevens alleen op je telefoon en in de private back-uprepo hieronder.

## b. Een aparte PRIVATE repo voor de back-up

1. Kies **New repository**, bijvoorbeeld `persoonlijk-logboek-backup`, en kies **Private**.
2. Vink **Add a README file** aan, zodat de repo niet leeg is.
3. Meer hoeft niet. Bij de eerste synchronisatie maakt de app zelf `contacten.json` aan.

## c. Het fine-grained token aanmaken

1. Ga op GitHub naar je profielfoto → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Vul in:
   - **Token name**: `persoonlijk-logboek`
   - **Expiration**: bijvoorbeeld 1 jaar. Zet een herinnering, want de app meldt "Token ongeldig of verlopen" als het afloopt.
   - **Repository access**: **Only select repositories** → kies alleen `persoonlijk-logboek-backup`.
   - **Permissions → Repository permissions → Contents**: **Read and write**. (*Metadata: Read* gaat automatisch mee.) Zet verder niets aan.
3. Klik **Generate token** en kopieer het token (`github_pat_…`). Je ziet het maar één keer.
4. Open de app (via het beginscherm-icoon, zie d) en ga naar **⚙ Instellingen**:
   - **Repo**: `<jouw-gebruikersnaam>/persoonlijk-logboek-backup`
   - **Token**: plak het token
   - **Bestandspad**: `contacten.json` (standaard)
   - Tik **Synchroniseer**. Zet desgewenst **Automatisch synchroniseren na opslaan** aan.

Het token staat alleen in de opslag van de app op je telefoon. Het gaat alleen in een header naar `api.github.com`, nooit in een URL. Kwijt of gelekt? Trek het in op GitHub en maak een nieuw token.

## d. Op het iPhone-beginscherm zetten (en daarna alléén dat icoon gebruiken)

1. Open de GitHub Pages-link in **Safari**.
2. Tik op **Deel** (vierkant met pijl) → **Zet op beginscherm**. Laat **Open als webapp** aanstaan en tik **Voeg toe**.
3. Gebruik vanaf nu **alleen het icoon** op je beginscherm.

**Waarom alleen het icoon?** Safari en de beginscherm-app hebben elk hun **eigen, gescheiden opslag**. Wat je in Safari opslaat, zie je niet in de app, en andersom. Kies dus één plek. Het icoon is het handigst, en de back-up via GitHub houdt alles veilig.

Ook goed om te weten:
- iOS kan de opslag van een webapp wissen als je die lang niet gebruikt. Zet daarom de GitHub-back-up aan, of maak af en toe een export (**Instellingen → Exporteer JSON**).
- Werkt de microfoonknop van de app niet (iOS staat spraakherkenning in beginscherm-apps niet altijd toe)? Tik dan in het veld, gebruik de **microfoon op het iOS-toetsenbord** en tik daarna op **✨ Opschonen**. Dicteren moet aanstaan: *Instellingen → Algemeen → Toetsenbord → Dicteren*.
- Synchroniseren en spraakherkenning hebben internet nodig. Lezen, zoeken, typen, opslaan en opschonen werken ook offline. De app opent ook zonder internet, zodra je hem één keer mét internet hebt geopend.

---

## Hoe de back-up werkt

- Elk record heeft `id`, `naam`, `notitie`, `createdAt`, `updatedAt` en `deleted`.
- Een verwijderde persoon blijft als "tombstone" bestaan (`deleted: true`, zonder inhoud). Zo verdwijnt die ook op andere apparaten.
- Bij **Synchroniseer** haalt de app het bestand op en voegt per `id` samen. De nieuwste `updatedAt` wint, en bij gelijke tijd wint een verwijdering. Daarna schrijft de app het resultaat terug, alleen als er iets veranderd is. Bestaat het bestand nog niet (404), dan maakt de app het aan. Is het bestand tussendoor gewijzigd, dan probeert de app het opnieuw.
- Is het bestand op GitHub beschadigd, dan overschrijft de app het **niet** en toont een melding.
- **Exporteer / Importeer JSON** is de noodoplossing. Importeren voegt samen, er gaat niets verloren.
