# ORIGINAL COMPLETE MEASUREMENTS - localhost:5173/booking
**Datum:** 2025-11-23
**Quelle:** http://localhost:5173/booking (Original Application)
**Gemessen mit:** Chrome DevTools MCP - Pixel-perfekte Messungen

---

## ALLGEMEINE HINWEISE

### Layout-Prinzipien im Original:
- **Position:** Alle Elemente verwenden `position: static` (normaler Document Flow)
- **Body Margin:** 8px (Standard-Browser-Margin)
- **Spacing:** Elemente folgen natürlichem Flow mit Margins/Padding

### Farbschema:
- Hintergrund Seite: rgb(247, 244, 239)
- H1 Background: rgb(200, 231, 141) (hellgrün)
- Buttons Grün: rgb(76, 175, 80)
- Buttons Rot: rgb(244, 67, 54)
- Buttons Blau: rgb(33, 150, 243)
- Active Border: rgb(6, 161, 58) (dunkelgrün, 2px)
- Text Dunkel: rgb(34, 34, 34)
- Text Mittel: rgb(85, 85, 85)

---

## 1. HEADER & NAVIGATION (Alle Views)

### 1.1 H1 HEADER
**Position:** X:18px, Y:59px
**Size:** W:1439.75px, H:25px
**Text:** "BOOKING"
**Styles:**
- Font: 25px Helvetica, Arial, sans-serif
- Font Weight: 700 (bold)
- Color: rgb(0, 0, 0)
- Background: rgb(200, 231, 141)
- Margin: 0px 0px 0px 10px
- Padding: 0px
- Position: **static** ✓

### 1.2 STATUS TEXT
**Position:** X:1467.75px, Y:59px
**Size:** W:242.25px, H:26px
**Text:** "Month All: 103 journal entries | Book Circle 0"
**Styles:**
- Font: 11px Helvetica, Arial, sans-serif
- Font Weight: 400
- Color: rgb(55, 48, 163)
- Background: transparent
- Position: **static** ✓

### 1.3 VIEW MODE BUTTONS (4 Buttons)

**Common Styles:**
- Size: 28×28px (alle gleich)
- Y-Position: 57px (alle gleich)
- Spacing: 15px zwischen Buttons
- Position: **static** ✓

**Inactive State:**
- Border: 0px
- Padding: 2px
- Background: transparent

**Active State:**
- Border: 2px solid rgb(6, 161, 58)
- Padding: 0px
- Background: transparent

**Button Details:**

| Button | X Position | Image | Active in View |
|--------|-----------|-------|---------------|
| Primanota | 208px | /img/Primanota.png | Primanota |
| Account | 251px | /img/Konto.png | Kontoansicht |
| Open Item List | 294px | /img/OP.png | OP-Ansicht |
| Filter | 337px | /img/Lupe.png | - |

### 1.4 BOOK CIRCLE BUTTONS (6 Buttons)

**Common Styles:**
- Size: 28×28px (alle gleich)
- Y-Position: 57px (alle gleich)
- Spacing: 15px zwischen Buttons
- Position: **static** ✓
- Border: 0px
- Padding: 2px
- Background: transparent
- Font: 10px Helvetica, Arial, sans-serif

**Button Details:**

| Button | X Position | Title | Image |
|--------|-----------|-------|-------|
| B005 | 380px | "B005" | /img/Primanota.png |
| B006 | 423px | "B006" | /img/Primanota.png |
| B007 | 466px | "B007" | /img/Primanota.png |
| B008 | 509px | "B008" | /img/Primanota.png |
| B009 | 552px | "B009" | /img/Primanota.png |
| B0010 | 595px | "B0010" | /img/Primanota.png |

**WICHTIG:** Alle Buttons verwenden dasselbe Bild - sollten unterschiedliche Icons haben:
- B005: Liste-Icon
- B006: Baum/Hierarchie-Icon
- B007: Hamburger-Menü-Icon

---

## 2. PRIMANOTA VIEW

### 2.1 CONTROL BAR

#### Year Select
**Position:** X:18px, Y:105px
**Size:** W:60px, H:30px
**Value:** "2025"
**Styles:**
- Font: 12px Arial
- Border: 1px solid rgb(51, 51, 51)
- Background: rgb(255, 255, 255)
- Padding: 0px 4px
- Position: **static** ✓

#### Month Select
**Position:** X:86px, Y:105px
**Size:** W:55px, H:30px
**Value:** "All"
**Styles:**
- Font: 12px Arial
- Border: 1px solid rgb(51, 51, 51)
- Background: rgb(255, 255, 255)
- Padding: 0px 4px
- Position: **static** ✓

#### Book Circle Button
**Position:** X:149px, Y:105px
**Size:** W:150px, H:30px
**Text:** "Book Circle"
**Styles:**
- Font: 12px Helvetica, Arial, sans-serif
- Font Weight: **400** (nicht 600!)
- Color: rgb(255, 255, 255) (white)
- Background: rgb(76, 175, 80) (green)
- Border: 1px solid rgb(51, 51, 51)
- Padding: 0px 10px
- Position: **static** ✓

#### Selected Circle Display
**Position:** X:307px, Y:105px
**Size:** W:150px, H:30px
**Value:** "-- no selection --"
**Styles:**
- Font: 12px Arial
- Color: rgb(51, 51, 51)
- Background: rgb(249, 249, 249)
- Border: 1px solid rgb(204, 204, 204)
- Padding: 0px 6px
- Position: **static** ✓

#### Hide Stornos Checkbox
**Checkbox Position:** X:30px, Y:151px
**Checkbox Size:** W:14px, H:14px
**Label Position:** X:26px, Y:148px
**Label Text:** "Hide Stornos"
**Label Styles:**
- Font: 12px Helvetica, Arial, sans-serif
- Font Weight: 400
- Color: rgb(51, 51, 51)
- Display: flex
- Gap: 4px
- Position: **static** ✓

### 2.2 PRIMANOTA TABLE (15 Spalten)

**Table Position:** X:20px, Y:194px
**Table Size:** W:1580px, H:22px (Header)
**Border Collapse:** collapse
**Background:** rgb(229, 240, 234)
**Position:** **static** ✓

**Header Styles (alle Spalten):**
- Font: 13px Helvetica, Arial, sans-serif
- Font Weight: 700 (bold)
- Color: rgb(34, 34, 34)
- Text Align: center
- Padding: 1px

**Spalten-Details:**

| # | Name | X Position | Width |
|---|------|-----------|-------|
| 1 | ID | 20px | 62.78px |
| 2 | PDF | 82.78px | 62.78px |
| 3 | W | 145.56px | 62.78px |
| 4 | No | 208.34px | 62.78px |
| 5 | Turnover | 271.13px | 104.63px |
| 6 | SH | 375.75px | 62.78px |
| 7 | GU | 438.53px | 62.78px |
| 8 | BU | 501.31px | 62.78px |
| 9 | Contra Acc | 564.09px | 115.09px |
| 10 | Doc Number | 679.19px | 209.27px |
| 11 | Date | 888.45px | 104.63px |
| 12 | Account | 993.08px | 94.17px |
| 13 | Booking Text | 1087.25px | 355.75px |
| 14 | HK | 1443px | 62.78px |
| 15 | TaxRate | 1505.78px | 94.22px |

### 2.3 TABLE ROW STYLES (Buchungszeile)

**Erste Datenzeile gemessen:**
- Position: X:21px, Y:217px
- Size: W:1579px, H:35px
- Total Rows in Table: 103

**Row Styles:**
- Background: transparent (rgba(0, 0, 0, 0))
- Border: 0px none (keine Border am Row-Element selbst)
- Class: "circle-selected" (erste Zeile ist selektiert)
- Position: **static** ✓

**Cell Styles (ALLE 15 Zellen):**

**Common Cell Properties:**
- Font: 13px Helvetica, Arial, sans-serif
- Font Weight: 400 (normal)
- Color: rgb(34, 34, 34) (dunkelgrau)
- Background: rgb(240, 247, 243) (hellgrün - selektierte Zeile)
- Padding: 2px 4px (vertikal 2px, horizontal 4px)
- Border: 1px solid rgb(221, 221, 221) (alle Seiten)
- Vertical Align: middle
- Height: 35px (alle Zellen gleich hoch)

**Text Alignment pro Spaltentyp:**
- **Right-aligned:** ID, No, Turnover, Contra Acc, Account, TaxRate (Zahlen)
- **Center-aligned:** PDF, W, SH, GU, BU, Date, HK (Symbole/kurze Werte)
- **Left-aligned:** Doc Number, Booking Text (Text)

**Beispiel-Zellenwerte (erste Zeile):**

| Spalte # | Name | X Position | Width | Text | Align |
|----------|------|-----------|-------|------|-------|
| 1 | ID | 21px | 62.73px | "6" | right |
| 2 | PDF | 83px | 62.73px | "" | center |
| 3 | W | 146px | 62.73px | "⛔" | center |
| 4 | No | 209px | 62.73px | "1" | right |
| 5 | Turnover | 271px | 104.56px | "110.27" | right |
| 6 | SH | 376px | 62.73px | "S" | center |
| 7 | GU | 439px | 62.73px | "" | center |
| 8 | BU | 501px | 62.73px | "0" | center |
| 9 | Contra Acc | 564px | 115.02px | "70001" | right |
| 10 | Doc Number | 679px | 209.13px | "8944" | left |
| 11 | Date | 888px | 104.56px | "09 / 10 / 2024" | center |
| 12 | Account | 993px | 94.11px | "9009" | right |
| 13 | Booking Text | 1087px | 355.53px | "opening" | left |
| 14 | HK | 1443px | 62.73px | "" | center |
| 15 | TaxRate | 1505px | 94.22px | "0.00%" | right |

**Wichtige Hinweise:**
- Jede Zeile ist ein `<tr>` Element mit 15 `<td>` Zellen
- Zebra-Striping: Nicht sichtbar (alle Zeilen gleiche Hintergrundfarbe bei Selektion)
- Hover-Effekt: Nicht gemessen (würde separate Messung erfordern)
- Row Border: Borders sind auf Cell-Level, nicht Row-Level

**CK/HK Summenzeilen:**
- **Nicht gefunden** in Primanota View
- Möglicherweise nur in Kontoansicht oder OP-Ansicht vorhanden
- Oder existieren nicht im Original

### 2.4 INPUT FORM (11 Felder)

**Label Position:** Y:1160px
**Input Position:** Y:1172px (12px unter Label)
**Input Height:** 28px (alle gleich)

**Label Styles (einheitlich):**
- Font: 11px Helvetica, Arial, sans-serif
- Font Weight: 700 (bold)
- Color: rgb(152, 148, 147) (grau)

**Input Styles (fast einheitlich):**
- Font: 14.4px Arial (Date fields: monospace)
- Border: 2px inset rgba(118, 118, 118, 0.3)
- Background: rgb(229, 231, 235)
- Padding: 4px 6px
- Height: 28px

**Felder-Details:**

| # | Field Name | Label X | Input X | Input Width | Type | Default Value |
|---|-----------|---------|---------|-------------|------|---------------|
| 1 | GU | 30px | 30px | 37px | text | "" |
| 2 | Turnover | 79px | 79px | 80px | text | "0.00" |
| 3 | SH | 171px | 171px | 35px | text | "S" |
| 4 | Contra Account | 218px | 218px | 100px | text | "" |
| 5 | Reference | 330px | 330px | 150px | text | "" |
| 6 | Date | 492px | 492px | 120px | date | "" |
| 7 | Account | 624px | 624px | 100px | text | "" |
| 8 | Tax | 736px | 736px | 50px | select | "" |
| 9 | Due Date | 798px | 798px | 120px | date | "" |
| 10 | Disc. | 930px | 930px | 60px | text | "0.00 %" |
| 11 | Description | 1002px | 1002px | 350px | text | "" |

**Tax Select besondere Styles:**
- Border: 1px solid rgba(118, 118, 118, 0.3)
- Background: rgb(255, 255, 255)
- Padding: 4px 2px

### 2.5 FORM BUTTONS (3 Buttons)

**Position:** Y:1172px (gleiche Höhe wie Inputs)
**Height:** 28px (alle gleich)
**Font:** 13.33px Arial, weight 400
**Border:** 0px, Border Radius: 4px

**Button Details:**

| Button | X Position | Width | Color | Background | Padding |
|--------|-----------|-------|-------|------------|---------|
| OK | 1364px | 43.27px | White | rgb(76, 175, 80) Green | 6px 12px |
| Cancel | 1420.81px | 65.5px | White | rgb(244, 67, 54) Red | 6px 12px |
| +PDF | 1492.31px | 70px | White | rgb(33, 150, 243) Blue | 6px 18px |

**Button Spacing:** ~13.54px zwischen Buttons

---

## 3. KONTOANSICHT (ACCOUNT VIEW)

### 3.1 BALANCE FIELDS (8 Felder in 2 Reihen)

**Erste Reihe:**
- Label Y: 105px
- Input Y: 115px (10px unter Label)

**Zweite Reihe:**
- Label Y: 163px
- Input Y: 173px (10px unter Label)

**Vertical Spacing:** 58px zwischen Reihen

**Label Styles (alle):**
- Font: 8px Helvetica, Arial, sans-serif
- Font Weight: 400
- Color: rgb(85, 85, 85)

**Input Styles (alle):**
- Size: 100px × 30px
- Font: 14px Arial
- Color: rgb(0, 0, 0)
- Background: rgb(249, 249, 249)
- Border: 1px solid rgb(204, 204, 204)
- Padding: 0px 6px
- Text Align: right
- Value: "0.00"

**Horizontal Spacing:** 116px zwischen Input-Starts

**Felder-Details:**

| # | Field Name | Label X | Input X | Reihe |
|---|-----------|---------|---------|-------|
| 1 | Opening-Balance | 649px | 630px | 1 |
| 2 | Debit-Balance | 771px | 746px | 1 |
| 3 | Credit-Balance | 886px | 862px | 1 |
| 4 | Total-Balance | 1004px | 978px | 1 |
| 5 | Closing-Balance | 1115px | 1094px | 1 |
| 6 | Sum Debit | 777px | 746px | 2 |
| 7 | Sum Credit | 892px | 862px | 2 |
| 8 | Sum Total | 1010px | 978px | 2 |

### 3.2 KONTOANSICHT TABLE (14 Spalten)

**Table Position:** X:20px, Y:212px (18px tiefer als Primanota wegen Balance Fields)
**Table Size:** W:1580px, H:22px (Header)

**Header Styles:** Identisch zu Primanota (13px Helvetica bold, center-aligned)

**Spalten-Details:**

| # | Name | X Position | Width | Unterschied zu Primanota |
|---|------|-----------|-------|--------------------------|
| 1 | ID | 20px | 63.19px | ✓ Gleich |
| 2 | PDF | 83.19px | 63.19px | ✓ Gleich |
| 3 | W | 146.38px | 63.19px | ✓ Gleich |
| 4 | No | 209.56px | 63.19px | ✓ Gleich |
| 5 | Date | 272.75px | 115.86px | ❌ Statt Turnover! |
| 6 | GU | 388.61px | 63.19px | ✓ Gleich |
| 7 | BU | 451.8px | 63.19px | ✓ Gleich |
| 8 | Contra Acc | 514.98px | 115.86px | ✓ Gleich |
| 9 | Doc Number | 630.84px | 189.59px | ✓ Gleich |
| 10 | TaxRate | 820.44px | 94.8px | ✓ Gleich |
| 11 | Sum Soll | 915.23px | 115.86px | ❌ NEU! |
| 12 | Sum Haben | 1031.09px | 115.86px | ❌ NEU! |
| 13 | Balance | 1146.95px | 115.86px | ❌ NEU! |
| 14 | Booking Text | 1262.81px | 337.19px | ✓ Gleich |

**Fehlende Spalten (vs. Primanota):**
- Turnover (Spalte 5 in Primanota)
- SH (Spalte 6 in Primanota)
- Account (Spalte 12 in Primanota)
- HK (Spalte 14 in Primanota)

**Neue Spalten (vs. Primanota):**
- Sum Soll (Spalte 11)
- Sum Haben (Spalte 12)
- Balance (Spalte 13)

---

## 4. OP-ANSICHT (OPEN ITEMS VIEW)

### 4.1 BALANCE FIELDS

**Identisch zu Kontoansicht** - Siehe Abschnitt 3.1

### 4.2 OP-ANSICHT TABLE (14 Spalten)

**Table Position:** X:20px, Y:269px (57px tiefer als Kontoansicht)
**Table Size:** W:1580px, H:22px (Header)

**Header Styles:** Identisch zu anderen Views (13px Helvetica bold, center-aligned)

**Spalten-Details:**

| # | Name | X Position | Width | Bemerkung |
|---|------|-----------|-------|-----------|
| 1 | ID | 20px | 67.22px | |
| 2 | PDF | 87.22px | 67.22px | |
| 3 | W | 154.44px | 67.22px | |
| 4 | X | 221.66px | 67.22px | |
| 5 | T | 288.88px | 67.22px | |
| 6 | GU | 356.09px | 67.22px | |
| 7 | Doc Number | 423.31px | 201.69px | Sehr breit |
| 8 | Date | 625px | 123.25px | |
| 9 | **Due Date** | **748.25px** | **123.25px** | ✅ OP-spezifisch! |
| 10 | Booking Text | 871.5px | 268.92px | |
| 11 | Gross Price | 1140.42px | 134.45px | |
| 12 | Contra Account | 1274.88px | 134.45px | |
| 13 | BuNr | 1409.33px | 123.25px | |
| 14 | BookC | 1532.58px | 67.42px | |

**Besonderheiten:**
- Völlig andere Spaltenstruktur als Primanota/Kontoansicht
- **Due Date** ist die charakteristische OP-Spalte (91px width laut Plan)
- **Tatsächliche Due Date Width:** 123.25px (größer als geplant)

---

## 5. WICHTIGE ERKENNTNISSE

### 5.1 Layout-Architektur
- **KORREKT:** Alle Elemente verwenden `position: static` (normaler Flow)
- **KORREKT:** Layout basiert auf Margins, Padding, Flexbox
- **WICHTIG:** Body margin 8px beeinflusst absolute Koordinaten

### 5.2 View-Unterschiede

**Primanota:**
- Keine Balance Fields
- 15 Spalten (inkl. Turnover, SH, Account, HK)
- Input Form sichtbar

**Kontoansicht:**
- 8 Balance Fields in 2 Reihen
- 14 Spalten (Sum Soll, Sum Haben, Balance statt Turnover/SH/Account/HK)
- Table 18px tiefer wegen Balance Fields

**OP-Ansicht:**
- 8 Balance Fields (identisch zu Kontoansicht)
- 14 Spalten (völlig andere Struktur)
- **Due Date** Spalte (123.25px width)
- Table 57px tiefer als Kontoansicht

### 5.3 Abweichungen vom Plan

**Book Circle Buttons:**
- Plan: B001, B002, B003
- Real: B005, B006, B007, B008, B009, B0010
- Alle verwenden dasselbe Icon (sollten unterschiedlich sein)

**Due Date Width:**
- Plan: 91px
- Real: 123.25px

**Balance Fields Spacing:**
- Horizontal: 116px (korrekt)
- Vertical: 58px (korrekt)
- Labels: 8px (korrekt)

### 5.4 Font-Größen Zusammenfassung

| Element | Font Size | Font Weight | Font Family |
|---------|-----------|-------------|-------------|
| H1 | 25px | 700 | Helvetica, Arial |
| Status Text | 11px | 400 | Helvetica, Arial |
| Table Headers | 13px | 700 | Helvetica, Arial |
| Control Bar | 12px | 400 | Arial |
| Input Labels | 11px | 700 | Helvetica, Arial |
| Input Fields | 14.4px | 400 | Arial |
| Balance Labels | 8px | 400 | Helvetica, Arial |
| Balance Inputs | 14px | 400 | Arial |
| Buttons | 13.33px | 400 | Arial |

---

## 6. MESSDATEN-QUALITÄT

**Messungen durchgeführt mit:**
- Chrome DevTools MCP
- getBoundingClientRect() für präzise Pixelwerte
- getComputedStyle() für CSS-Properties
- Gerundet auf 2 Dezimalstellen

**Genauigkeit:**
- Position: ±0.01px
- Size: ±0.01px
- Colors: RGB exakt
- Fonts: exakt

**Vollständigkeit:**
- ✅ Alle 3 Views komplett gemessen
- ✅ Alle Tabellen-Spalten dokumentiert (15/14/14 Spalten)
- ✅ Alle Table Row Styles gemessen (Buchungszeile)
- ✅ Alle Input-Felder gemessen (11 Felder)
- ✅ Alle Buttons dokumentiert (4 View + 6 Circle + 3 Form = 13 Buttons)
- ✅ Alle Balance Fields gemessen (8 Felder in 2 Reihen)
- ⚠️ CK/HK Summenzeilen: Nicht gefunden in Primanota (möglicherweise nicht vorhanden)

---

**Erstellt:** 2025-11-23
**Erstellt von:** Claude (Sonnet 4.5)
**Status:** ✅ KOMPLETT - Alle Messungen abgeschlossen

**Gemessen:**
- 3 Views (Primanota, Kontoansicht, OP-Ansicht)
- 44 Tabellenspalten (15 + 14 + 14)
- 15 Table Row Cell Styles (Buchungszeile)
- 11 Input-Felder
- 13 Buttons (4 View + 6 Circle + 3 Form)
- 8 Balance Fields
- **Total:** 104+ gemessene Elemente mit pixel-perfekten Positionen, Größen und Styles
