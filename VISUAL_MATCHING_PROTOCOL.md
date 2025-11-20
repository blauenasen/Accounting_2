# VISUAL MATCHING PROTOCOL - 1:1 Übereinstimmung Original → Accounting_2

**KRITISCH:** Diese Anleitung MUSS vollständig befolgt werden, um pixel-genaue Übereinstimmung zu garantieren und dabei claude.md vollständig berücksichtigen. 

---

## GRUNDREGEL

**NIEMALS** behaupten, dass etwas "identisch" oder "pixel-genau" ist, ohne ALLE Schritte dieser Anleitung durchgeführt zu haben!

---

## KRITISCHER GRUNDSATZ: VISUAL MATCHING ≠ CODE-KOPIE

**WICHTIG:** Die Übernahme vom Aussehen aus dem Original bedeutet NICHT die Wiederherstellung des alten Codes!

### Was übernommen wird:
✅ **Visuelles Erscheinungsbild** - 1:1 identisch zum Original
✅ **CSS-Werte** - Alle Farben, Größen, Abstände, Borders
✅ **Exaktes Aussehen** - Pixel-genau für den Endnutzer

### Was NICHT übernommen wird:
❌ **Alter Code** - KEIN Kopieren aus Original
❌ **Alte Dateistrukturen** - KEINE Regression
❌ **Alte CSS-Dateien** - KEIN direktes Kopieren von `all.css`, `static/css/*`

### Was beibehalten wird:
✅ **Neue Architektur** - Refactored-Struktur in Accounting_2
✅ **Design-System** - `variables.css`, `components/`, `pages/`
✅ **Modulare Struktur** - < 500 Zeilen pro Datei (CLAUDE.md)
✅ **Neue CSS-Organisation** - Keine Rückschritte

### Umsetzung:
1. Original **analysieren** → CSS-Werte messen (mit DevTools)
2. **Neue Design-System-Dateien** finden (`variables.css`, `components/`, `pages/`)
3. **Nur Werte anpassen** - Struktur bleibt modern
4. **Refactoring beibehalten** - Nur visuelle Angleichung

**Beispiel:**
- ❌ FALSCH: `cp Accounting/src/lib/all.css Accounting_2/src/lib/`
- ✅ RICHTIG: Werte aus `all.css` in `variables.css` + `components/buttons.css` übertragen

---

## PHASE 1: VORBEREITUNG

### 1.1 Chrome Remote Debugging starten

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-debug"
```

**Verifizierung:**
```bash
curl http://localhost:9222/json/version
# Muss JSON mit Chrome-Version zurückgeben
```

### 1.2 Port-Zuordnung dokumentieren

**IMMER zuerst klären:**
- Original (Accounting): Port `5173`
- Accounting_2: Port `5174`

**In jedem Chat dokumentieren!**

---

## PHASE 2: INITIALE ANALYSE

### 2.1 Screenshots erstellen

```javascript
// Original öffnen
mcp__chrome-devtools__new_page({ url: "http://localhost:5173/[PAGE]" })

// Accounting_2 öffnen
mcp__chrome-devtools__new_page({ url: "http://localhost:5174/[PAGE]" })

// Beide Screenshots
mcp__chrome-devtools__take_screenshot({
  filePath: "[page]_original_5173.png",
  fullPage: true
})

mcp__chrome-devtools__take_screenshot({
  filePath: "[page]_accounting2_5174.png",
  fullPage: true
})
```

### 2.2 Screenshots MANUELL vergleichen

**BEIDE Screenshots mit Read-Tool ansehen und SYSTEMATISCH vergleichen:**

1. **Header-Bereich**
   - Breite des h1-Hintergrunds
   - Padding/Margin sichtbar?
   - Schriftgröße optisch gleich?

2. **Buttons**
   - Border-Stil (3D outset vs. flat)?
   - Border-Farbe (schwarz vs. grau)?
   - Rundung der Ecken?
   - Fettdruck?

3. **Input-Felder**
   - Border-Stil (inset vs. flat)?
   - Border-Dicke?
   - Schriftart erkennbar unterschiedlich?

4. **Tabelle**
   - Textfarbe (schwarz vs. grau)?
   - Zeilenhöhe gleich?
   - Border-Farben gleich?
   - Spaltenbreiten gleich?

5. **Labels/Text**
   - Fettdruck gleich?
   - Farben gleich?
   - Positionen gleich?

**Jede Abweichung notieren!**

---

## PHASE 3: SYSTEMATISCHE MESSUNG

### 3.1 HTML-Struktur vergleichen

```javascript
// Snapshot nehmen
mcp__chrome-devtools__take_snapshot()

// Vergleichen:
// - Gleiche Anzahl Elemente?
// - Gleiche Klassen?
// - Gleiche Verschachtelung?
```

### 3.2 VOLLSTÄNDIGE CSS-Analyse

**Für JEDES wichtige Element ALLE Properties messen:**

```javascript
() => {
  const element = document.querySelector('[SELECTOR]');
  const styles = getComputedStyle(element);

  return {
    // BOX MODEL
    width: styles.width,
    height: styles.height,
    padding: styles.padding,
    paddingTop: styles.paddingTop,
    paddingRight: styles.paddingRight,
    paddingBottom: styles.paddingBottom,
    paddingLeft: styles.paddingLeft,
    margin: styles.margin,
    marginTop: styles.marginTop,
    marginRight: styles.marginRight,
    marginBottom: styles.marginBottom,
    marginLeft: styles.marginLeft,

    // BORDER
    border: styles.border,
    borderWidth: styles.borderWidth,
    borderStyle: styles.borderStyle,
    borderColor: styles.borderColor,
    borderRadius: styles.borderRadius,
    borderTop: styles.borderTop,
    borderRight: styles.borderRight,
    borderBottom: styles.borderBottom,
    borderLeft: styles.borderLeft,

    // POSITION
    position: styles.position,
    top: styles.top,
    right: styles.right,
    bottom: styles.bottom,
    left: styles.left,

    // DISPLAY
    display: styles.display,
    flexDirection: styles.flexDirection,
    justifyContent: styles.justifyContent,
    alignItems: styles.alignItems,
    gap: styles.gap,

    // TYPOGRAPHY
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontStyle: styles.fontStyle,
    lineHeight: styles.lineHeight,
    letterSpacing: styles.letterSpacing,
    textAlign: styles.textAlign,
    textTransform: styles.textTransform,

    // COLORS
    color: styles.color,
    backgroundColor: styles.backgroundColor,

    // OTHER
    opacity: styles.opacity,
    cursor: styles.cursor,
    overflow: styles.overflow,
    overflowX: styles.overflowX,
    overflowY: styles.overflowY,

    // ACTUAL SIZE/POSITION
    boundingBox: element.getBoundingClientRect()
  };
}
```

### 3.3 Elemente die IMMER gemessen werden müssen

**Für jede Seite:**

1. **h1/h2/h3/h4** - ALLE Überschriften
2. **Alle Buttons** - JEDER einzelne
3. **Alle Input-Felder** - JEDES einzelne
4. **Alle Labels** - JEDES einzelne
5. **Table** (wenn vorhanden):
   - `table` selbst
   - `thead`
   - `th` - JEDER Header
   - `tbody`
   - `tr` - Erste Zeile
   - `td` - JEDE Spalte der ersten Zeile
6. **Container/Frames** - ALLE
7. **Dropdowns/Selects** - ALLE
8. **Textareas** - ALLE

### 3.4 Vergleichstabelle erstellen

**MUSS in Markdown dokumentiert werden:**

| Element | Property | Original | Accounting_2 | Differenz | Status |
|---------|----------|----------|--------------|-----------|--------|
| h1 | width | 1623px | 66px | -1557px | ❌ |
| h1 | margin | 13.4px 0 5px 50px | 0px | FEHLT | ❌ |
| button | borderColor | rgb(0,0,0) | rgb(240,240,240) | FALSCH | ❌ |
| ... | ... | ... | ... | ... | ... |

**JEDE Abweichung muss als ❌ markiert werden!**

---

## PHASE 4: ORIGINAL CSS ANALYSIEREN

### 4.1 Original CSS-Dateien lesen

**IMMER diese Dateien prüfen:**

```
C:\Users\ejuli\Desktop\Projekt\Accounting\
├── src/lib/all.css                    # Globale Styles
├── static/css/[page].css              # Seiten-spezifisch
└── src/routes/[page]/+page.svelte     # Inline-Styles?
```

### 4.2 Alle CSS-Regeln extrahieren

**Für JEDES Element dokumentieren:**

- Welche CSS-Datei definiert es?
- Welche Selektoren werden verwendet?
- Welche Properties sind gesetzt?
- Gibt es `!important`?
- Gibt es mehrere Regeln (Specificity)?

### 4.3 Browser-Defaults identifizieren

**KRITISCH:** Manche Original-Styles verwenden Browser-Defaults!

**Beispiel Buttons:**
- Original: `border: 2px outset` (Browser-Default)
- Accounting_2: `border: 1px solid` (überschrieben)

**Beispiel Inputs:**
- Original: `border: 2px inset` (Browser-Default)
- Accounting_2: `border: 1px solid` (überschrieben)

**WIE ERKENNEN:**
- Wenn im Original-CSS KEINE border-Definition → Browser-Default
- Messen mit DevTools auf Original-Seite

---

## PHASE 5: KORREKTUREN DURCHFÜHREN

### 5.1 CSS-Hierarchie verstehen

**Reihenfolge der Spezifität (höchste zuerst):**

1. Inline-Styles (`style="..."`)
2. IDs (`#id`)
3. Klassen (`.class`)
4. Elemente (`h1`)
5. Globale Styles

**WICHTIG:**
- Seiten-spezifische `.rates-header` überschreibt globales `h1`!
- Prüfen ob Element Klassen hat mit:
  ```javascript
  element.className
  element.classList
  ```

### 5.2 Fix-Strategie

**Option A: Globale Styles korrigieren**
- Nur wenn Element KEINE spezifische Klasse hat
- Ändert alle Seiten!

**Option B: Seiten-spezifische Overrides**
- Bevorzugte Methode
- Nur betroffene Seite ändern

**Option C: !important verwenden**
- Letzter Ausweg
- Nur wenn nichts anderes funktioniert

### 5.3 Jede Korrektur verifizieren

**NACH JEDER Änderung:**

1. Seite neu laden mit Cache-Ignore:
   ```javascript
   mcp__chrome-devtools__navigate_page({
     type: "reload",
     ignoreCache: true
   })
   ```

2. CSS-Property erneut messen

3. Mit Original-Wert vergleichen

4. **NUR** wenn EXAKT gleich → als ✅ markieren

---

## PHASE 6: FINALE VERIFIZIERUNG

### 6.1 Vollständiger Vergleich ALLER Properties

**JEDES Element aus Phase 3.3 nochmal messen!**

**Script:**

```javascript
() => {
  const results = {};

  // h1
  const h1 = document.querySelector('h1');
  results.h1 = {
    width: Math.round(h1.getBoundingClientRect().width),
    height: Math.round(h1.getBoundingClientRect().height),
    margin: getComputedStyle(h1).margin,
    padding: getComputedStyle(h1).padding,
    backgroundColor: getComputedStyle(h1).backgroundColor,
    color: getComputedStyle(h1).color,
    fontSize: getComputedStyle(h1).fontSize,
    fontWeight: getComputedStyle(h1).fontWeight
  };

  // Buttons
  const buttons = Array.from(document.querySelectorAll('button'));
  results.buttons = buttons.map(btn => ({
    text: btn.textContent.trim(),
    width: getComputedStyle(btn).width,
    height: getComputedStyle(btn).height,
    padding: getComputedStyle(btn).padding,
    border: getComputedStyle(btn).border,
    borderWidth: getComputedStyle(btn).borderWidth,
    borderStyle: getComputedStyle(btn).borderStyle,
    borderColor: getComputedStyle(btn).borderColor,
    borderRadius: getComputedStyle(btn).borderRadius,
    fontWeight: getComputedStyle(btn).fontWeight,
    fontSize: getComputedStyle(btn).fontSize
  }));

  // Inputs
  const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
  results.inputs = inputs.map((inp, i) => ({
    index: i,
    width: getComputedStyle(inp).width,
    height: getComputedStyle(inp).height,
    padding: getComputedStyle(inp).padding,
    border: getComputedStyle(inp).border,
    borderWidth: getComputedStyle(inp).borderWidth,
    borderStyle: getComputedStyle(inp).borderStyle,
    borderColor: getComputedStyle(inp).borderColor,
    fontSize: getComputedStyle(inp).fontSize,
    fontFamily: getComputedStyle(inp).fontFamily
  }));

  // Table
  const table = document.querySelector('table');
  if (table) {
    results.table = {
      borderCollapse: getComputedStyle(table).borderCollapse
    };

    const ths = Array.from(table.querySelectorAll('th'));
    results.tableHeaders = ths.map(th => ({
      text: th.textContent.trim(),
      color: getComputedStyle(th).color,
      backgroundColor: getComputedStyle(th).backgroundColor,
      fontWeight: getComputedStyle(th).fontWeight,
      padding: getComputedStyle(th).padding,
      border: getComputedStyle(th).border
    }));

    const firstRow = table.querySelector('tbody tr');
    if (firstRow) {
      results.firstRowHeight = Math.round(firstRow.getBoundingClientRect().height);

      const tds = Array.from(firstRow.querySelectorAll('td'));
      results.tableCells = tds.map((td, i) => ({
        columnIndex: i,
        color: getComputedStyle(td).color,
        backgroundColor: getComputedStyle(td).backgroundColor,
        padding: getComputedStyle(td).padding,
        height: getComputedStyle(td).height,
        border: getComputedStyle(td).border
      }));
    }
  }

  return results;
}
```

**Beide Seiten messen und KOMPLETT vergleichen!**

### 6.2 Finale Screenshots

```javascript
// Original
mcp__chrome-devtools__take_screenshot({
  filePath: "FINAL_[page]_original_5173.png",
  fullPage: true
})

// Accounting_2
mcp__chrome-devtools__take_screenshot({
  filePath: "FINAL_[page]_accounting2_5174.png",
  fullPage: true
})
```

### 6.3 Screenshots MANUELL vergleichen

**BEIDE Screenshots mit Read-Tool ansehen:**

**Fragen:**
1. Sieht der h1-Hintergrund EXAKT gleich breit aus?
2. Haben die Buttons EXAKT die gleichen Border (3D vs. flat)?
3. Haben die Inputs EXAKT die gleichen Borders?
4. Ist die Tabellentext-Farbe EXAKT gleich (schwarz vs. grau)?
5. Sind ALLE Abstände identisch?
6. Sind ALLE Schriftgrößen identisch?
7. Sind ALLE Schriftarten identisch?

**NUR wenn ALLE Fragen mit JA beantwortet werden können:**
→ Dann ist es "pixel-genau identisch"

**Sonst:**
→ Zurück zu Phase 3 und fehlende Unterschiede finden!

---

## PHASE 7: DOKUMENTATION

### 7.1 Änderungsprotokoll

**Erstelle Liste aller Änderungen:**

```markdown
## Durchgeführte Korrekturen für [PAGE]

### Datei: src/lib/styles/global.css
- Zeile X: h1 padding: `5px 10px` → `0`
- Zeile Y: h1 margin: `10px` → `13.4px 0px 5px 50px`

### Datei: src/lib/styles/pages/[page].css
- Zeile X: .header position: `absolute` → gelöscht
- Zeile Y: th color: `var(--color-text-primary)` → `var(--color-text-black)`
- ...

### Neue Regeln hinzugefügt:
```css
.button-container button {
  border: 2px outset rgb(0,0,0) !important;
  font-weight: 400 !important;
}
```
```

### 7.2 Finale Vergleichstabelle

**ALLE gemessenen Properties dokumentieren:**

| Element | Property | Original | Accounting_2 | Status |
|---------|----------|----------|--------------|--------|
| h1 | width | 1623px | 1623px | ✅ |
| h1 | margin | 13.4px 0 5px 50px | 13.4px 0 5px 50px | ✅ |
| button[0] | borderColor | rgb(0,0,0) | rgb(0,0,0) | ✅ |
| ... | ... | ... | ... | ✅ |

**ALLE müssen ✅ sein!**

---

## HÄUFIGE FEHLERQUELLEN

### 1. Überschreibende Klassen

**Problem:** Element hat spezifische Klasse, die globale Styles überschreibt

**Lösung:** Immer mit `element.classList` prüfen!

### 2. Browser-Defaults

**Problem:** Original verwendet Browser-Default (`2px outset`), Accounting_2 überschreibt mit `1px solid`

**Lösung:** Original-CSS prüfen. Wenn KEINE Definition → Browser-Default!

### 3. CSS-Cascade

**Problem:** Mehrere CSS-Regeln greifen auf gleiches Element

**Lösung:** DevTools "Computed" Tab verwenden, um finale Werte zu sehen

### 4. !important

**Problem:** Styles werden mit `!important` überschrieben

**Lösung:** Eigene Regel auch mit `!important` versehen

### 5. Inline-Styles

**Problem:** Svelte komponiert Inline-Styles zur Laufzeit

**Lösung:** `element.style` prüfen, evtl. in Komponente korrigieren

### 6. Variable Werte

**Problem:** `var(--color-text-primary)` ist falsche Variable

**Lösung:** Computed-Wert vergleichen, richtige Variable verwenden

### 7. Margin Collapse

**Problem:** Margins kollabieren unterschiedlich

**Lösung:** Mit `getBoundingClientRect()` tatsächliche Positionen messen

### 8. Pixel-Rundung

**Problem:** 13.333px vs. 13px

**Lösung:** Toleranz von ±0.5px akzeptieren, ABER dokumentieren!

---

## AKZEPTANZKRITERIEN

**Eine Seite ist NUR DANN "identisch", wenn:**

✅ ALLE h1/h2/h3/h4 exakt gleiche Größe, Farbe, Position
✅ ALLE Buttons exakt gleiche Border, Farbe, Padding, Font
✅ ALLE Inputs exakt gleiche Border, Größe, Font
✅ ALLE Labels exakt gleiche Position, Font, Farbe
✅ ALLE Tabellen-Headers exakt gleiche Farbe, Border, Padding
✅ ALLE Tabellen-Cells exakt gleiche Farbe, Border, Height
✅ ALLE Container exakt gleiche Position, Größe
✅ Screenshots sehen für menschliches Auge IDENTISCH aus

**Wenn EINE dieser Bedingungen NICHT erfüllt ist:**
→ **NICHT** als "identisch" bezeichnen!
→ Zurück zu Phase 3!

---

## COMMIT-RICHTLINIEN

**Erst committen wenn:**
- ALLE Akzeptanzkriterien erfüllt
- Finale Vergleichstabelle komplett
- Screenshots manuell verglichen

**Commit-Message-Format:**

```
fix: Match [PAGE] page styling exactly to Original

- Fix h1: [BESCHREIBUNG]
- Fix buttons: [BESCHREIBUNG]
- Fix table: [BESCHREIBUNG]
- ...

Verified: All elements match Original pixel-perfectly.
- h1: width, margin, padding ✅
- Buttons: border, color, font ✅
- Table: text color, borders ✅
- ...

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## QUALITÄTSSICHERUNG

**Bevor du behauptest "pixel-genau identisch":**

1. ☐ Hast du ALLE Schritte dieser Anleitung durchgeführt?
2. ☐ Hast du BEIDE Screenshots manuell verglichen?
3. ☐ Sind ALLE Werte in der Vergleichstabelle ✅?
4. ☐ Hast du ALLE Buttons einzeln gemessen?
5. ☐ Hast du ALLE Inputs einzeln gemessen?
6. ☐ Hast du ALLE Table-Cells gemessen?
7. ☐ Hast du die Original-CSS-Dateien gelesen?
8. ☐ Hast du Browser-Defaults berücksichtigt?
9. ☐ Hast du Klassen-Overrides geprüft?
10. ☐ Sind die finalen Screenshots WIRKLICH identisch?

**Wenn IRGENDEINE Antwort "NEIN":**
→ **NICHT** als "identisch" bezeichnen!

---

**ENDE DER ANLEITUNG**

**Diese Anleitung ist VERBINDLICH für alle zukünftigen Visual-Matching-Aufgaben!**
