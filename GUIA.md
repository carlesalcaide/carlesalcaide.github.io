# Guia del web

Aquest document explica com substituir el web antic pel nou i com afegir-hi obres, partitures, publicacions i novetats sense tocar el codi.

La idea principal: **tot el contingut és a la carpeta `data/`**. Per afegir una sardana, una publicació o una partitura de l'arxiu, només cal editar un fitxer de dades. Els fitxers `index.html`, `assets/css/style.css` i `assets/js/main.js` no cal tocar-los gairebé mai.


## 1. Què hi ha al repositori

```
index.html              La pàgina (portada, Ciència, Música, Arxiu i contacte)
composicio.html         Redirigeix l'adreça antiga /composicio a la secció de Música
404.html                Pàgina que surt si algú entra a una adreça que no existeix
.nojekyll               Diu a GitHub Pages que publiqui els fitxers tal com són
GUIA.md                 Aquesta guia

data/
  obres.json            Catàleg de les teves obres i arranjaments
  arxiu.csv             Partitures del teu arxiu personal (s'edita amb un full de càlcul)
  publicacions.json     Articles
  contribucions.json    Pòsters, presentacions i conferències
  novetats.json         Les novetats de la portada
  textos.json           Tots els textos del web en català i anglès, el correu i les xarxes

assets/
  css/style.css         Disseny
  js/main.js            Funcionament (idiomes, filtres, cercador…)
  fonts/                Tipografies Spectral i Schibsted Grotesk (llicència OFL)
  img/                  Foto, resums gràfics, icones i imatge per compartir a xarxes
  docs/                 PDF de pòsters i presentacions
```

Les adreces de cada secció són:

- `carlesalcaide.github.io/#ciencia`
- `carlesalcaide.github.io/#musica`
- `carlesalcaide.github.io/#arxiu`

Les pots compartir directament.


## 2. Substituir el web antic pel nou

### Abans de començar: fes una còpia de seguretat

Des de la carpeta del repositori, crea una etiqueta amb l'estat actual. Així sempre podràs recuperar el web antic:

```bash
cd carlesalcaide.github.io
git pull
git tag web-antic
git push origin web-antic
```

### Esborra el que ja no serveix

El web nou no fa servir cap d'aquests fitxers. Alguns són restes de la plantilla iPortfolio i de la persona que la feia servir abans: unes publicacions comentades al codi, la foto `foto_carla`, la icona de la proteïna, etc.

```bash
git rm -r assets/vendor assets/scss forms
git rm assets/css/style.css assets/js/main.js
git rm assets/foto_carla.jpeg assets/foto_carla_old.jpeg
git rm assets/img/JACS_IGPS.png assets/img/Slide1.jpg assets/img/Slide1_v1.jpg
git rm assets/img/logo-removebg-preview.png assets/img/logo2-removebg-preview.png
git rm assets/img/favicon.png assets/img/apple-touch-icon.png
git rm assets/img/TADF_OLEDpixels_afb8062b.png assets/img/TADF_OLEDpixels_afb8062b.webp
git rm assets/img/Carles_Alcaide_2_DiMoCat.jpg assets/img/graficalabs_poater.jpg
git rm "assets/img/10.1039-d5sc05248c_figure.jpg"
```

Les tres últimes imatges (la teva foto i els dos resums gràfics) les tens al paquet nou amb un nom més clar i optimitzades: `carles-alcaide.jpg`, `pub-ejoc-2026.jpg` i `pub-chemsci-2025.jpg`.

**Compte amb el README.** El `README.md` el pots conservar, però cal fer-hi dos canvis:

- La foto apunta a `assets/img/Carles_Alcaide_2_DiMoCat.jpg`, que acabes d'esborrar. Canvia-la per `https://carlesalcaide.github.io/assets/img/carles-alcaide.jpg`.
- Hi ha enllaços que apunten a `#publications`, una secció que ja no existeix. Canvia'ls per `https://carlesalcaide.github.io/#ciencia`.

### Copia els fitxers nous i publica

Descomprimeix el paquet i copia'n tot el contingut a l'arrel del repositori, sobreescrivint `index.html` i `composicio.html`. Inclou el fitxer ocult `.nojekyll`. Després:

```bash
git add -A
git status          # comprova que la llista de canvis té sentit
git commit -m "Web nou: ciència, música i arxiu de partitures"
git push
```

GitHub Pages triga un minut o dos a actualitzar el web. Si després veus la versió antiga, força la recàrrega del navegador (Ctrl+Maj+R, o Cmd+Maj+R al Mac).

**Si prefereixes no fer servir el terminal**, ho pots fer amb GitHub Desktop: esborra els fitxers de la llista anterior de la carpeta del repositori, copia-hi els nous, i a GitHub Desktop escriu un missatge i prem *Commit* i *Push*.


## 3. Veure el web al teu ordinador abans de publicar

El web llegeix les dades dels fitxers de `data/`. Per seguretat, els navegadors no ho permeten si obres `index.html` amb doble clic. Per això, si ho fas, el web mostra un avís.

Obre un terminal a la carpeta del repositori i engega un servidor local:

```bash
python3 -m http.server 8000
```

Ara obre `http://localhost:8000` al navegador. Cada cop que desis un fitxer, recarrega la pàgina per veure el canvi. Per aturar el servidor, prem Ctrl+C.

És bona idea fer-ho sempre abans de `git push`, sobretot després d'editar un JSON.


## 4. Les teves obres (`data/obres.json`)

Cada obra és un bloc entre claus `{ }`, separat del següent per una coma. L'ordre dins del fitxer no importa: el web les agrupa per any, de la més nova a la més antiga.

### Exemple complet

```json
{
  "titol": "Tanins i rialles",
  "any": 2025,
  "tipus": "obligada",
  "solistes": {"ca": "Obligada de fiscorn", "en": "Solo fiscorn"},
  "dedicatoria": {"ca": "Presentada al 1r Concurs de Sardanes Obligades de Riudellots de la Selva.", "en": ""},
  "premi": {"ca": "3r premi (ex aequo)", "en": "3rd prize (shared)"},
  "durada": "5 min",
  "estrena": {"ca": "Estrenada per la Cobla […] a […], el […]", "en": ""},
  "estat": "",
  "audio": "https://www.youtube.com/watch?v=…",
  "partitura": "",
  "particelles": ""
}
```

### Què vol dir cada camp

| Camp | Obligatori | Què hi va |
|---|---|---|
| `titol` | sí | Títol de l'obra. |
| `any` | sí | Any, sense cometes: `2026`. Les obres s'agrupen per aquest número. |
| `tipus` | sí | Un d'aquests valors: `sardana`, `obligada`, `banda`, `arranjament` o `altres`. Decideix el text del tipus i en quin filtre surt l'obra. |
| `tipus_text` | no | Per canviar el text del tipus quan el que surt per defecte no encaixa. Per exemple: `{"ca": "Sardana per a cobla i cor", "en": "Sardana for cobla and choir"}`. |
| `solistes` | no | Per a les obligades: `{"ca": "Obligada de tenora", "en": "Solo tenora"}`. |
| `dedicatoria` | no | Dedicatòria o descripció breu. Si deixes buit l'anglès, es mostra el català. |
| `premi` | no | Premis o reconeixements. Surt destacat en color. |
| `original` | no | Per als arranjaments: l'autor de l'obra original. Surt com «Obra original: …». |
| `durada` | no | Text lliure, per exemple `"4 min 30 s"`. |
| `estrena` | no | Text lliure sobre l'estrena: data, lloc i intèrprets. |
| `estat` | no | `"properament"` per a les obres no acabades o per estrenar: surt l'etiqueta «Properament» i no surten botons. Buit (`""`) per a la resta. |
| `audio` | no | Enllaç a l'enregistrament (YouTube, SoundCloud, Drive…). Si hi és, surt el botó «Escolta». |
| `partitura` | no | Enllaç o ruta al PDF de la partitura general. |
| `particelles` | no | Enllaç o ruta al PDF (o .zip) de les particel·les. |

Si una obra no té ni `partitura` ni `particelles`, surt automàticament el botó «Demana partitura i particel·les». Aquest botó obre un correu adreçat a tu amb el títol de l'obra ja escrit.

Els filtres de la secció Música només apareixen si hi ha obres d'aquell tipus. Per exemple, el filtre «Arranjaments» sortirà quan n'afegeixis el primer.

### Afegir un arranjament

```json
{
  "titol": "La Santa Espina",
  "any": 2026,
  "tipus": "arranjament",
  "tipus_text": {"ca": "Arranjament per a banda", "en": "Arrangement for band"},
  "original": "Enric Morera",
  "dedicatoria": {"ca": "", "en": ""},
  "estat": "",
  "audio": "",
  "partitura": "",
  "particelles": ""
}
```

Si l'arranjament és per a cobla, no cal posar `tipus_text`: ja surt «Arranjament per a cobla».

### On posar els PDF de les partitures

Tens dues opcions:

1. **Dins del repositori.** Crea la carpeta `assets/partitures/`, desa-hi el PDF i posa la ruta al camp: `"partitura": "assets/partitures/Tanins i rialles - partitura.pdf"`. Els espais i els accents al nom del fitxer funcionen, però els noms senzills donen menys problemes.
2. **En un servei extern**, com Google Drive o Dropbox. Posa-hi l'enllaç públic sencer.

**Mida dels fitxers.** GitHub no accepta fitxers de més de 100 MB. A més, el repositori s'alenteix si s'hi acumulen molts PDF grans i àudios. Per a l'àudio, és millor YouTube o SoundCloud que pujar MP3.

**Recomanació.** Qualsevol PDF publicat es pot descarregar i reenviar lliurement. Si vols saber qui toca les teves obres, publica només una mostra (per exemple, la primera pàgina, al camp `partitura`). Deixa `particelles` buit: el botó de demanar-les per correu ja hi és.


## 5. L'arxiu de partitures (`data/arxiu.csv`)

És un fitxer CSV, és a dir, una taula de text. La manera més còmoda d'editar-lo és amb un full de càlcul: LibreOffice Calc, Excel o Google Sheets.

### Columnes

| Columna | Què hi va |
|---|---|
| `titol` | Títol de l'obra. |
| `autor` | Compositor. |
| `plantilla` | Per exemple `Cobla`, `Cobla i cor` o `Banda`. El desplegable «Plantilla» es crea sol amb els valors que hi posis. |
| `material` | Què en tens. Si són diverses coses, separa-les amb comes: `Partitura general, Particel·les`. Valors habituals: `Partitura general`, `Particel·les`, `Còpia manuscrita`, `Reducció per a piano`. |
| `notes` | Text lliure: lletrista, edició, estat de la còpia… |
| `propia` | Escriu `sí` si l'obra és teva. Surt l'etiqueta «Obra pròpia». Si no, deixa-ho buit. |

Escriu sempre els mateixos valors de la mateixa manera, per exemple sempre `Cobla i cor` i no a vegades `cobla+cor`. Així els filtres agrupen bé.

### Desar el fitxer

- **LibreOffice o Excel.** *Desa com a* → «CSV (UTF-8)». Si et pregunta el separador, el punt i coma (`;`) i la coma (`,`) funcionen tots dos.
- **Google Sheets.** *Fitxer* → *Baixa* → «Valors separats per comes (.csv)». Després reanomena el fitxer a `arxiu.csv` i substitueix el de la carpeta `data/`.

Ha de ser UTF-8 perquè els accents i la ela geminada surtin bé. Si veus caràcters estranys al web, torna'l a desar triant UTF-8.

**Les teves obres ja hi són.** Al fitxer hi he posat les set obres teves ja acabades, amb «Partitura general, Particel·les». Revisa que el material sigui correcte i afegeix-hi la resta del teu arxiu.

**Drets d'autor.** De les obres d'altres compositors, publica'n només la fitxa, no el PDF: moltes encara tenen drets d'autor vigents. Amb el botó «Consulta» la gent et pot escriure per demanar-te-les.


## 6. Publicacions, contribucions i novetats

### Una publicació nova (`data/publicacions.json`)

```json
{
  "any": 2027,
  "primer_autor": true,
  "autors": "Alcaide, C.; Solà, M.",
  "titol": "Títol de l'article en anglès",
  "revista": "J. Phys. Chem. A",
  "referencia": "2027, 131, 1234–1245",
  "doi": "10.1021/acs.jpca.xxxxxxx",
  "imatge": "assets/img/pub-jpca-2027.jpg"
}
```

- El teu nom (`Alcaide, C.`) surt en negreta automàticament.
- `primer_autor` és `true` o `false`, sense cometes.
- El botó «Llegeix l'article» porta a `https://doi.org/` seguit del DOI.
- Si encara no té DOI, deixa `"doi": ""` i posa l'enllaç en un camp `"url"`.
- La imatge és opcional. Deixa `""` si no en tens.

### Una contribució nova (`data/contribucions.json`)

```json
{
  "any": 2027,
  "tipus": "oral",
  "esdeveniment": "Nom del congrés (sigles i any)",
  "titol": "Títol del pòster o de la presentació",
  "pdf": "assets/docs/nom-del-fitxer.pdf"
}
```

Els valors de `tipus` amb traducció són `poster`, `flash`, `oral` i `convidada`. Si n'escrius un altre, surt tal com l'has escrit.

### Les novetats de la portada (`data/novetats.json`)

```json
{
  "any": 2027,
  "seccio": "musica",
  "ca": "Estrena de <em>Camins de ferro</em> al 54è Aplec de la Sardana de Flaçà.",
  "en": "Premiere of <em>Camins de ferro</em> at the 54th Aplec de la Sardana of Flaçà."
}
```

- `seccio` pot ser `ciencia` o `musica`. Decideix el color i l'enllaç de la novetat.
- Pots fer servir `<em>…</em>` per posar títols en cursiva.
- Recomanació: tingues-ne entre tres i cinc, i esborra les més antigues.


## 7. Textos, traduccions i contacte (`data/textos.json`)

Aquí hi ha tots els textos del web, primer en català (`"ca"`) i després en anglès (`"en"`). Busca el text que vols canviar i edita'l a tots dos idiomes.

**Pendent d'omplir.** Hi ha un text pensat per a tu que encara és buit: `mus.bio`, a tots dos idiomes. Hi pots posar la teva formació musical: estudis, instrument, la cobla o la banda on toques, mestres. Mentre estigui buit (`""`), no surt res al web. Quan l'omplis, apareixerà sota la presentació de la secció Música.

Altres textos que potser voldràs revisar:

- `sci.bio`: la teva presentació, en tres paràgrafs.
- `sci.lines`: les línies de recerca.
- `sci.proj`: els projectes en curs.
- `path`: la formació.

**Correu i xarxes.** Són a l'apartat `config`, al principi del fitxer. Per afegir el teu ORCID, per exemple:

```json
"xarxes": [
  {"nom": "ORCID", "url": "https://orcid.org/0000-0000-0000-0000"},
  {"nom": "LinkedIn", "url": "https://www.linkedin.com/in/carles-alcaide-i-blaya/"},
  {"nom": "GitHub", "url": "https://github.com/carlesalcaide"},
  {"nom": "X", "url": "https://x.com/calcaide_26"}
]
```

Si canvies les xarxes, actualitza també la llista `sameAs` del bloc `application/ld+json` a `index.html`. És el que fan servir els cercadors per saber que aquests perfils són teus.

**Traduccions de l'arxiu.** Les traduccions a l'anglès de les plantilles i dels materials són a `en.plantilles` i `en.materials`. Si afegeixes un valor nou a l'arxiu (per exemple `Cobla i orquestra`) i el vols traduït, afegeix-lo allà.


## 8. Imatges

- **Resums gràfics de publicacions.** JPG d'uns 700 px d'amplada, a `assets/img/`.
- **Foto de perfil.** `assets/img/carles-alcaide.jpg`. Si la canvies, fes-la vertical i d'uns 520 px d'amplada.
- **Imatge per compartir a xarxes.** `assets/img/og-image.png`, de 1200 × 630 px. És la que surt quan algú comparteix el web a WhatsApp, LinkedIn o X.
- **Icona del web.** `assets/img/favicon.svg`, amb les versions PNG `favicon-32.png` i `apple-touch-icon.png`.


## 9. Si alguna cosa no surt bé

Si un fitxer de dades té un error, el web mostra un avís groc a dalt de tot. L'avís diu quin fitxer falla i la posició aproximada de l'error.

**Errors habituals als fitxers JSON:**

- **Falta una coma entre dos blocs `{ }`, o n'hi ha una de més** després de l'últim element d'una llista.
- **Cometes dins d'un text.** El JSON fa servir cometes dobles rectes (`"`) per delimitar els textos, així que no les pots posar dins d'un text. Per citar alguna cosa, fes servir cometes baixes `« »`. L'apòstrof (`’` o `'`) no dona cap problema.
- **`true`, `false` i els anys** van sense cometes.

**Per trobar l'error exacte**, executa al terminal:

```bash
python3 -m json.tool data/obres.json > /dev/null && echo "Correcte"
```

Si hi ha un error, et dirà la línia i la columna.

**Si el web no canvia** després de publicar, espera un parell de minuts i força la recàrrega (Ctrl+Maj+R). També pots mirar l'estat de la publicació a la pestanya *Actions* del repositori de GitHub.


## 10. Coses pendents

- [ ] Omplir `mus.bio` amb la teva formació musical (apartat 7).
- [ ] Revisar el material de les teves obres a `arxiu.csv` i afegir-hi la resta de partitures de l'arxiu.
- [ ] Afegir enllaços d'àudio i partitures a `obres.json` quan els tinguis.
- [ ] Comprovar el volum de l'article d'*Adv. Sci.*: ara diu «2026, 12», però el volum 12 correspon al 2025.
- [ ] Actualitzar els enllaços `#publications` del `README.md`.
- [ ] Afegir l'ORCID i el teu perfil de Google Scholar a les xarxes (apartat 7).
- [ ] Decidir si les consultes de partitures han d'arribar al correu de la UdG o a un correu personal (camp `correu` de `textos.json`).
