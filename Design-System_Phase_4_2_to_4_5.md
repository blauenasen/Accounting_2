# Design-System Migration Protokoll
**Phase 4.2 bis 4.5 - Korrektur & Vervollständigung**
**Erstellt:** 2025-11-18
**Status:** IN ARBEIT

---

## 1. ÜBERSICHT & ZIELE

### Ziel
Das exakte Erscheinungsbild vom Original-Projekt (Accounting) ins neue Design-System (Accounting_2) übertragen.

### Anforderungen
- ✅ CLAUDE.md einhalten (500-Zeilen-Regel, modulare Struktur)
- ✅ Keine Technical Debt
- ✅ Alle Funktionen erhalten
- ✅ Kein `$lib/all.css` mehr verwenden
- ✅ Nahtlose Session-Übergaben ermöglichen

### Quell-Projekt
`C:\Users\ejuli\Desktop\Projekt\Accounting`

### Ziel-Projekt
`C:\Users\ejuli\Desktop\Projekt\Accounting_2`

---

## 2. CSS-MAPPING-TABELLE

### Original CSS-Dateien

| Original | Zeilen | Neu (Accounting_2) | Status |
|----------|--------|-------------------|--------|
| `src/lib/all.css` | ~240 | Aufteilen in: | ⏳ |
| → Body/Globals | | `styles/global.css` | ✅ Korrigiert |
| → h1/h4 | | `styles/global.css` | ✅ Grün hinzugefügt |
| → Menu | | `styles/components/menu.css` | ⚠️ Erstellt, Hover-Problem |
| → Buttons | | `styles/components/buttons.css` | ⚠️ Unvollständig |
| → Focus-States | | `styles/components/forms.css` | ⚠️ Farbe falsch (blau statt rot) |
| `static/css/rates.css` | ~138 | `styles/pages/rates.css` | ⚠️ Farben prüfen |
| `static/css/debtors.css` | ? | `styles/pages/debtors.css` | ⚠️ Prüfen |
| `static/css/creditors.css` | ? | `styles/pages/creditors.css` | ⚠️ Prüfen |
| `static/css/letter.css` | ? | `styles/pages/letter.css` | ❌ Fehlt |
| `static/css/offer.css` | ? | `styles/pages/offer.css` | ❌ Fehlt |

### Legende
- ✅ Vollständig migriert
- ⚠️ Teilweise migriert / Korrekturen nötig
- ❌ Fehlt komplett
- ⏳ In Arbeit

---

## 3. ARBEITSREIHENFOLGE

### Globale Elemente (zuerst)
- [ ] **3.1 Menu/Navigation** - Betrifft alle Seiten

### Seiten (einzeln)
- [ ] **3.2 Startseite** (`/`)
- [ ] **3.3 Rates** (`/rates`)
- [ ] **3.4 Debtors** (`/debtors`)
- [ ] **3.5 Creditors** (`/creditors`)
- [ ] **3.6 Booking** (`/booking`)
- [ ] **3.7 Ledgers** (`/ledgers`)
- [ ] **3.8 Estimate** (`/estimate`)
- [ ] **3.9 Invoice** (`/invoice`)

---

## 4. DETAILPLÄNE PRO ELEMENT/SEITE

---

### 4.1 MENU/NAVIGATION

**Priorität:** HOCH (betrifft alle Seiten)

#### Ist-Zustand (Accounting_2)
- Navigation als blaue Links
- Kein Styling
- Kein Hover-Effekt
- Kein Active-State

#### Soll-Zustand (Original)
- `.menu-bar` mit beigem Hintergrund
- Logo links (50px Höhe)
- Navigation rechts vom Logo
- Links: grau (#333), kein Underline
- Hover: Border + rote Farbe
- Active: Border + fett + rot

#### Betroffene Dateien
**Original:**
- `src/lib/all.css` (Zeilen 48-94)

**Neu zu erstellen/ändern:**
- `src/lib/styles/components/menu.css` (NEU)
- `src/lib/+menu.svelte` (prüfen)
- `src/routes/+layout.svelte` (Import hinzufügen)

#### Umsetzungsschritte
1. [ ] `menu.css` erstellen mit Original-Styles
2. [ ] Import in `+layout.svelte` hinzufügen
3. [ ] `+menu.svelte` prüfen - hat es die richtigen Klassen?
4. [ ] Visueller Vergleich
5. [ ] F12-Konsole prüfen

#### Test-Checkliste
- [ ] Logo sichtbar (50px Höhe)
- [ ] Navigation-Links horizontal
- [ ] Hover-Effekt (Border + rot)
- [ ] Active-State funktioniert
- [ ] Keine Konsolen-Fehler

#### Ergebnis
**Status:** ⚠️ IN ARBEIT - Hover-Problem ungelöst
**Notizen:**
- ✅ `menu.css` erstellt (53 Zeilen)
- ✅ Import in `+layout.svelte` hinzugefügt
- ✅ `+menu.svelte` - Logo statt Placeholder
- ✅ Logo kopiert von Original nach `static/img/logo.png`
- ❌ **PROBLEM:** Hover fügt Border+Padding hinzu → Größenänderung → Flackern/Springen
- ❌ **PROBLEM:** Abstände zwischen Menüpunkten nicht identisch zum Original
- ⏳ **NÄCHSTER SCHRITT:** MCP Chrome DevTools Test um exakte CSS-Unterschiede zu finden

---

### 4.2 STARTSEITE

**Priorität:** HOCH

#### Ist-Zustand (Accounting_2)
- Weißer Hintergrund
- "Welcome to Apelt Accounting" ohne grünen Hintergrund
- Keine Daten geladen (API fehlt)
- Buttons unstyled

#### Soll-Zustand (Original)
- Beiger Hintergrund (#f7f4ef)
- h1 mit grünem Hintergrund (#c8e78d)
- Master Data mit echten Daten
- Gestylte Buttons

#### Betroffene Dateien
**Original:**
- `src/lib/all.css` (h1 Styles)
- `src/routes/+page.svelte`

**Neu zu erstellen/ändern:**
- `src/lib/styles/global.css` (h1 korrigieren)
- `src/lib/styles/pages/home.css` (NEU)
- `src/routes/api/stammdaten/+server.ts` (NEU - API)

#### Umsetzungsschritte
1. [ ] `global.css` - h1 grüner Hintergrund hinzufügen
2. [ ] `home.css` erstellen
3. [ ] API-Endpoint `/api/stammdaten` erstellen
4. [ ] `+page.svelte` - CSS-Import ändern
5. [ ] Visueller Vergleich

#### Test-Checkliste
- [ ] Beiger Hintergrund
- [ ] h1 grün
- [ ] Daten werden geladen
- [ ] Buttons gestyled
- [ ] Keine Konsolen-Fehler

#### Ergebnis
**Status:** ⏳ Nicht gestartet
**Notizen:** JSON-Fehler bereits gefixt (try/catch)

---

### 4.3 RATES

**Priorität:** MITTEL

#### Ist-Zustand (Accounting_2)
- Styles teilweise migriert
- Farben möglicherweise falsch

#### Soll-Zustand (Original)
- Header bei 50px links
- Inputs bei 120px links
- Buttons bei 250px links
- Tabelle bei 60px links, 225px top
- Hover: #d9fbe1 (grünlich)
- Selected: #cce4ff (blau)

#### Betroffene Dateien
**Original:**
- `static/css/rates.css`

**Neu:**
- `src/lib/styles/pages/rates.css` (korrigieren)

#### Umsetzungsschritte
1. [ ] Original rates.css mit neuem vergleichen
2. [ ] Fehlende/falsche Styles korrigieren
3. [ ] Visueller Vergleich

#### Test-Checkliste
- [ ] Positionen stimmen
- [ ] Hover-Farbe grünlich
- [ ] Selected-Farbe blau
- [ ] Sticky Header funktioniert

#### Ergebnis
**Status:** ⏳ Nicht gestartet
**Notizen:** -

---

### 4.4 - 4.9 (Weitere Seiten)

**Hinweis:** Details werden bei Bearbeitung ergänzt.

---

## 5. API-ENDPOINTS

### Fehlende Endpoints

| Endpoint | Beschreibung | Status |
|----------|-------------|--------|
| `/api/stammdaten` | Lädt Firmendaten für Startseite | ❌ Fehlt |

### Existierende Endpoints
- `/api/booking/*` - Booking-relevante APIs
- `/api/ledgers/*` - Konten-APIs
- `/api/invoice/*` - Rechnungs-APIs
- usw.

---

## 6. BEKANNTE PROBLEME

### Gelöst
- ✅ Konsolen-Warnungen (missing props) - Commit `8c90018`
- ✅ JSON-Fehler auf Startseite (try/catch) - Commit `8c90018`

### Offen
- ⚠️ Menu-Hover-Verhalten: Flackern/Springen bei Hover (Border+Padding Änderung)
- ⚠️ Menu-Abstände: Nicht identisch zum Original
- ⏳ Focus-States falsche Farbe (blau statt rot)
- ⏳ CSS-Reset in global.css entfernt - mögliche Nebeneffekte prüfen

### Erledigt (diese Session)
- ✅ Menu-Styling grundsätzlich erstellt
- ✅ h1/h4 grüner Hintergrund hinzugefügt
- ✅ Body-Textfarbe korrigiert (#989493)
- ✅ Logo eingerichtet

---

## 7. SESSION-LOG

### Session 1: 2025-11-18 (Aktuelle Session)

**Start-Token:** ~0
**Aktueller Token-Stand:** ~109.000 / 200.000

**Erledigt:**
- ✅ Phase 4.4: Component Styles (booking-form, dialogs, dropdowns)
- ✅ Phase 4.5: Enhanced Table Styling
- ✅ Phase 5: QA Documentation
- ✅ Konsolen-Warnungen gefixt
- ✅ Analyse der Original-CSS-Struktur
- ✅ Dieses Protokoll erstellt

**Commits:**
- `9fdec75` - Phase 4.4 Component Styles
- `921072e` - Phase 4.5 Table Styling
- `d972168` - Phase 5 QA Documentation
- `8c90018` - Fix console warnings

**Nächste Schritte:**
1. Menu-Styles erstellen (4.1)
2. Startseite korrigieren (4.2)
3. Weitere Seiten...

**Offene Fragen:**
- Keine

---

### Session 2: 2025-11-18 (Abend)

**Übergabe von:** Session 1
**Token-Stand Start:** ~0 (nach Context-Compaction)
**Aktueller Token-Stand:** ~45.000 / 200.000

**Erledigt:**
- ✅ menu.css erstellt (53 Zeilen, 1:1 Kopie vom Original)
- ✅ +menu.svelte - Logo eingerichtet statt Placeholder
- ✅ Logo kopiert: `static/img/logo.png`
- ✅ global.css - h1/h4 grüner Hintergrund (#c8e78d)
- ✅ global.css - CSS-Reset entfernt (verursachte Probleme)
- ✅ variables.css - Body-Textfarbe korrigiert (#989493)
- ✅ MCP Chrome DevTools installiert (`chrome-devtools-mcp`)
- ✅ `.mcp.json` Konfiguration erstellt
- ✅ Chrome mit Remote Debugging gestartet (Port 9222)

**Probleme erkannt:**
- ❌ Menu-Hover: Flackern/Springen (Border+Padding Änderung verursacht Größenänderung)
- ❌ Menu-Abstände: Nicht identisch zum Original
- ❌ Mehrere CSS-Korrekturversuche ohne visuellen Vergleich → keine Lösung

**Nächste Schritte:**
1. Claude Code neu starten (MCP aktivieren)
2. MCP Chrome DevTools Test: Original (5174) vs. Accounting_2 (5173)
3. Exakte CSS-Unterschiede in .menu-nav a identifizieren
4. Gezielte Korrektur basierend auf DevTools-Analyse

**Commits:**
- (noch keine - Änderungen nicht committet)

---

### Session 3: [DATUM]

**Übergabe von:** Session 2
**Token-Stand Start:** -

**Zu erledigen:**
- MCP Chrome DevTools Test durchführen
- Menu-Problem lösen
- Weiter mit 4.2 (Startseite)

---

## 8. WICHTIGE HINWEISE FÜR NÄCHSTE SESSION

### Original-Projekt Pfad
`C:\Users\ejuli\Desktop\Projekt\Accounting`

### CSS-Farben aus Original (wichtig!)
```css
/* Body */
background-color: #f7f4ef;  /* Beige */
color: #989493;             /* Grauer Text */

/* h1/h4 Header */
background-color: #c8e78d;  /* Grün */

/* Focus-States */
border-color: #ff0000;      /* Rot */

/* Hover (Tabellen) */
background-color: #d9fbe1;  /* Hellgrün */

/* Selected */
background-color: #cce4ff;  /* Hellblau */
```

### CLAUDE.md Erinnerung
- Max 500 Zeilen pro Modul
- TypeScript verwenden
- Svelte 4 (NICHT 5!)
- Decimal.js für Berechnungen

---

## 9. CHANGELOG

| Datum | Was | Wer |
|-------|-----|-----|
| 2025-11-18 | Protokoll erstellt | Claude Session 1 |
| 2025-11-18 | Menu-Styling, Logo, Global-CSS, MCP Setup | Claude Session 2 |

---

**Ende des Protokolls**
