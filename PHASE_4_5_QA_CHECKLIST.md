# Phase 4-5 QA Checkliste
**Datum:** 2025-11-18
**Status:** Bereit für manuelle Tests

---

## CSS-Statistik

### Zeilenanzahl pro Datei (Alle unter 500 ✅)
| Datei | Zeilen | Status |
|-------|--------|--------|
| variables.css | 134 | 🟢 |
| global.css | 128 | 🟢 |
| buttons.css | 124 | 🟢 |
| forms.css | 241 | 🟢 |
| tables.css | 343 | 🟢 |
| booking-form.css | 155 | 🟢 |
| dialogs.css | 300 | 🟢 |
| dropdowns.css | 183 | 🟢 |
| rates.css | 173 | 🟢 |
| debtors.css | 173 | 🟢 |
| creditors.css | 173 | 🟢 |
| booking.css | 115 | 🟢 |
| **Gesamt** | **2242** | ✅ |

### Bundle-Größen (Production Build)
- Layout/Global CSS: ~20KB
- BookingFormContainer: ~16KB
- InvoiceContainer: ~11KB
- Meiste Komponenten: <3KB
- **Gesamt CSS: ~70KB** (akzeptabel)

---

## Manuelle QA Checkliste

### Zu testende Seiten

#### 1. Buchungsseite (`/booking`)
- [ ] Seitentitel wird korrekt angezeigt
- [ ] Formularfelder im Grid-Layout ausgerichtet
- [ ] Keep-Toggles korrekt unter Feldern positioniert
- [ ] Buttons (OK, Cancel, PDF) korrekt gestylt
- [ ] Primanota-Tabelle mit Sticky-Header angezeigt
- [ ] Tabellen-Zeilen Hover-Effekt (sanfter Übergang)
- [ ] Ausgewählte Zeile hervorgehoben
- [ ] Scrollbar sichtbar und gestylt

#### 2. Sätze-Seite (`/rates`)
- [ ] Header an korrekter Position (50px von oben)
- [ ] Eingabefelder mit Design-System gestylt
- [ ] Button-Gruppe korrekt positioniert
- [ ] Tabellen-Container bei 225px von oben
- [ ] Tabellenbreite: 790px
- [ ] Sticky-Headers funktionieren beim Scrollen
- [ ] Zeilen-Hover-Effekte

#### 3. Debitoren-Seite (`/debtors`)
- [ ] Ähnliches Layout wie Sätze
- [ ] Tabellenbreite: 1365px
- [ ] Top-Offset: 265px
- [ ] Alle Eingabefelder gestylt

#### 4. Kreditoren-Seite (`/creditors`)
- [ ] Ähnliches Layout wie Sätze
- [ ] Tabellenbreite: 1140px
- [ ] Top-Offset: 265px
- [ ] Alle Eingabefelder gestylt

#### 5. Konten-Seite (`/ledgers`)
- [ ] Seite lädt ohne CSS-Fehler
- [ ] Formulare und Tabellen gestylt

#### 6. Angebote-Seite (`/estimate`)
- [ ] Seite lädt ohne CSS-Fehler
- [ ] Formulare korrekt gestylt

---

## Komponenten-Tests

### Buttons
- [ ] `.btn-success` - Grüner Hintergrund, weißer Text
- [ ] `.btn-danger` - Roter Hintergrund, weißer Text
- [ ] `.btn-secondary` - Grauer Hintergrund
- [ ] `.btn-primary` - Blauer Hintergrund
- [ ] Hover-Effekte (Helligkeitsänderung)
- [ ] Deaktivierter Zustand (Opacity 0.7)

### Formulare
- [ ] Eingabefelder haben einheitliches Padding
- [ ] Focus-Zustände mit blauem Rahmen/Schatten
- [ ] Deaktivierte Felder ausgegraut
- [ ] Labels fett und zentriert (Buchungsformular)

### Tabellen
- [ ] Sticky-Headers bleiben beim Scrollen fixiert
- [ ] Zeilen-Hover: Hintergrund #f0f0f0
- [ ] Ausgewählte Zeile: Hintergrund #e3f2fd
- [ ] Hervorgehobene Zeile: Hintergrund #fff9c4
- [ ] Blockierte Zeile: Roter Ton
- [ ] Sanfte Übergänge (0.15s)

### Dialoge
- [ ] Overlay bedeckt gesamten Bildschirm
- [ ] Dialog zentriert auf Bildschirm
- [ ] Schließen bei Klick auf Overlay
- [ ] Schließen mit Escape-Taste
- [ ] Button-Styling (Cancel grau, OK blau)

### Dropdowns
- [ ] Einheitlicher Rahmen und Padding
- [ ] Focus-Zustand mit blauem Rahmen
- [ ] Menü unter Trigger positioniert

---

## Browser-Kompatibilität

### Chrome (Primär)
- [ ] Alle Styles werden korrekt gerendert
- [ ] Scrollbars gestylt (Webkit)
- [ ] Übergänge sanft

### Firefox
- [ ] Scrollbars gestylt (scrollbar-width)
- [ ] Alle CSS Custom Properties funktionieren
- [ ] Übergänge funktionieren

### Edge
- [ ] Wie Chrome (Chromium-basiert)

---

## Barrierefreiheit

- [ ] Focus-Zustände auf allen interaktiven Elementen sichtbar
- [ ] Tastaturnavigation in Tabellen funktioniert
- [ ] Ausreichender Farbkontrast
- [ ] Screenreader-freundlich (semantisches HTML)

---

## Performance

- [ ] First Paint < 200ms
- [ ] Keine Layout-Verschiebungen nach Laden
- [ ] Scrollen flüssig (60fps)
- [ ] Keine unnötigen CSS-Repaints

---

## Bekannte Probleme

Keine gemeldet.

---

## Abnahme

- [ ] Alle kritischen Pfade getestet
- [ ] Keine blockierenden Probleme gefunden
- [ ] Bereit für Phase 5 Abschluss

**Getestet von:** ________________
**Datum:** ________________
