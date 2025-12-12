# Accounting_2 Project - Development Guidelines

# ARBEITSANWEISUNGEN FÜR CLAUDE

**WICHTIG:** 

## GRUNDREGELN

### Sprache
- **Chatsprache:** Deutsch
- **Code, Labels, Messages, Hilfen:** Nur Englisch (EN)

### Code-Qualität
- **Maximale Zeilen pro Modul:** 500 Zeilen
- Nur mit User-Bestätigung darf diese Regel überschritten werden
- Bei mehr als 500 Zeilen → Refactoring erforderlich
- Ampelsystem: >500 = rot, >300 = gelb, <=300 = grün
- Wenn du neue Codezeilen für eine neue Funktion schreiben musst, dann prüfe zuvor die Codezeilenanzahl des bestehenden Modul. Wenn diese mehr als 300 Codezeilen besitzt, lagere diese neue Funktion aus. 
- Wenn du Änderungen an bestehenden Codezeilen vornehmen willst, dann prüfe zuvor die Codezeilenanzahl des bestehenden Module. Wenn diese mehr als 500 Codezeilen besitzt, dann führe für diese bestehende, zu ändernde Funktion eine Refactoring aus und übertrage diese in ein neues Modul

**WICHTIG:** Dieses Projekt arbeitet in zwei Verzeichnissen:
Arbeite nach bestem Gewissen und Industriestandards. VERMEIDE TECHNICAL-DEBT und denke dabei immer an Martin Fowler!
  - **Original-Projekt (Referenz):** `C:\Users\ejuli\Desktop\Projekt\Original`
  - JavaScript-basiert, vollständig funktional
  - Wird NUR als Referenz zum Nachschlagen verwendet
  - NIEMALS hier Änderungen vornehmen
  - Im Chat schreiben wir nur Deutsch

- **Neu-Projekt (Arbeitsverzeichnis):** `C:\Users\ejuli\Desktop\Projekt\Accounting_2`
  - TypeScript-basiert, in Entwicklung
  - Hier werden ALLE Implementierungen durchgeführt
  - Alle neuen Implementierungen werden in neuen Modulen angelegt

---

## MANDATORY: Phase-Based Development Process

**Du MUSST diesen Workflow IMMER einhalten. NIEMALS Phasen überspringen!**

### PHASE 1: EXPLORATION (Read-Only)

**KEIN CODE SCHREIBEN in dieser Phase!**

1. **Original-Projekt analysieren** (falls Feature dort existiert):
   ```
   Read: C:\Users\ejuli\Desktop\Projekt\Accounting\[relevante-dateien]
   ```
   - Wie funktioniert das Feature im Original?
   - Welche Event-Handler werden verwendet?
   - Welche Datenquellen werden genutzt?
   - Welche Edge Cases werden behandelt?

2. **Neu-Projekt analysieren**:
   ```
   Read: C:\Users\ejuli\Desktop\Projekt\Accounting_2\[relevante-dateien]
   ```
   - Welche TypeScript-Patterns werden bereits verwendet?
   - Welche Komponenten existieren bereits?
   - Welche Datenstrukturen sind vorhanden?

3. **Datenquellen identifizieren**:
   - Database Schemas lesen (NIEMALS Werte annehmen!)
   - Config Files prüfen
   - Bestehende API-Calls analysieren

**STOPP HIER:** Zeige mir deine Erkenntnisse aus Phase 1, BEVOR du zu Phase 2 gehst!

---

### PHASE 2: PLANNING

**KEIN CODE SCHREIBEN in dieser Phase!**

Erstelle einen detaillierten Plan mit:

1. **Datenquellen-Mapping**:
   - Welche DB-Tabelle/Spalte liefert welche Daten?
   - Keine Annahmen! Nur konkrete Schema-Referenzen.

2. **Implementierungs-Schritte**:
   - Welche Files müssen geändert werden?
   - Welche TypeScript-Typen sind nötig?
   - Welche Event-Handler sind erforderlich?

3. **Verifikations-Strategie**:
   - Wie wird die Implementierung getestet?
   - Welche Edge Cases müssen abgedeckt werden?

**STOPP HIER:** Zeige mir deinen Plan und warte auf Genehmigung, BEVOR du implementierst!

---

### PHASE 3: IMPLEMENTATION

**NUR nach Genehmigung von Phase 2!**

1. Implementiere exakt nach genehmigtem Plan
2. KEINE hardcoded Werte
3. KEINE Annahmen über Daten
4. ALLE Werte aus identifizierten Quellen

---

## CRITICAL: Strict Behavioral Rules

**Diese Regeln gelten IMMER und ÜBERALL:**

### 1. NIEMALS Werte hardcoden
```
❌ FALSCH:
const taxOptions = ["5%", "19%"];

✅ RICHTIG:
const taxOptions = await db.query("SELECT DISTINCT TaxGroup FROM skr04_accounts");
```

### 2. READ BEFORE WRITE
- Lies IMMER existierende Implementierungen, bevor du Code schreibst
- Prüfe IMMER Database Schemas vor DB-Zugriffen
- Analysiere IMMER ähnliche Komponenten für Patterns

### 3. NO ASSUMPTIONS
- Wenn unklar → Frage stellen oder Code lesen
- NIEMALS Lücken mit "sinnvollen" Annahmen füllen
- Bei Unsicherheit: Original-Projekt konsultieren

### 4. NO APOLOGIES
- Fehler korrigieren ohne "Entschuldigung, ich..."
- Fokus auf Lösung, nicht auf Rechtfertigung

---

## Phase Enforcement Examples

### ❌ VIOLATION Example:
```
User: "Implementiere Doppelklick auf Tabellen-Zeile"
Claude: [Schreibt sofort Code ohne Original zu lesen]
→ FEHLER: Phase 1 übersprungen!
```

### ✅ CORRECT Example:
```
User: "Implementiere Doppelklick auf Tabellen-Zeile"

Claude:
"PHASE 1: EXPLORATION

Ich lese jetzt:
1. Original-Projekt: C:\Users\ejuli\Desktop\Projekt\Accounting\[table-files]
2. Neu-Projekt: C:\Users\ejuli\Desktop\Projekt\Accounting_2\[table-files]

[Liest Files...]

Erkenntnisse:
- Original verwendet 'ondblclick' Event
- Original navigiert zu edit-mode mit row.id
- Neu-Projekt hat bereits handleRowClick()
- Neu-Projekt verwendet React Router für Navigation

STOPP: Soll ich jetzt Phase 2 (Planning) beginnen?"
```

---

## Tech Stack & Patterns

**TypeScript/React Setup:**
- React Router für Navigation
- TypeScript für Type Safety
- Event Handler: Standard React Patterns (onClick, onChange, etc.)

**Datenbank:**
- SQLite-basiert
- Schema-Files prüfen vor DB-Zugriffen
- NIEMALS SQL-Werte annehmen

**Original-zu-Neu Konvertierung:**
- JavaScript → TypeScript
- Vanilla DOM → React Components
- Direkte DB-Calls → API-Layer (falls vorhanden)

## MCP Chrome DevTools - Spezielle Fälle

### Date-Input-Felder und Native Browser-Controls

**WICHTIG:** Browser-native Input-Felder wie `<input type="date">`, `<input type="time">`, oder `<input type="number">` haben Spinbuttons und UI-Elemente, die NICHT über `mcp__chrome-devtools__click` klickbar sind.

**❌ FALSCH - führt zu Timeout:**
```javascript
// Timeout nach 5000ms!
mcp__chrome-devtools__click({ uid: "14_704" }) // Date Spinbutton
```

**✅ RICHTIG - verwende evaluate_script:**
```javascript
mcp__chrome-devtools__evaluate_script({
  function: `() => {
    const dateInput = document.getElementById('date');
    dateInput.value = '2025-02-15';
    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    return { success: true, value: dateInput.value };
  }`
})
```

**Grund:** Date-Spinbuttons sind Teil der Browser-UI (Shadow DOM), nicht des zugänglichen DOM. Direkte Wert-Änderung via JavaScript ist der einzige zuverlässige Weg.

**Gilt auch für:**
- `<input type="time">` - Time Picker
- `<input type="number">` - Spinbuttons für Zahlen
- `<input type="color">` - Color Picker
- `<input type="file">` - File Upload Dialog (verwende `mcp__chrome-devtools__upload_file` stattdessen)

**Faustregel:** Wenn `click` auf ein Browser-natives Control mit Timeout fehlschlägt, verwende **immer** `evaluate_script` mit direkter DOM-Manipulation.

---

## Workflow Checklist

**Bei JEDER Aufgabe diese Checklist durchgehen:**

- [ ] **Phase 1 abgeschlossen?** Original-Projekt gelesen, Neu-Projekt analysiert, Datenquellen identifiziert
- [ ] **Phase 1 Pause:** User über Erkenntnisse informiert und auf Genehmigung für Phase 2 gewartet
- [ ] **Phase 2 abgeschlossen?** Plan erstellt mit konkreten Datenquellen-Referenzen
- [ ] **Phase 2 Pause:** User Plan gezeigt und auf Genehmigung für Phase 3 gewartet
- [ ] **Phase 3:** Implementierung startet NUR nach Genehmigung
- [ ] **Keine hardcoded Werte:** Alle Daten aus identifizierten Quellen
- [ ] **Keine Annahmen:** Bei Unklarheiten Original konsultiert oder User gefragt

**Wenn auch nur EINE Checkbox fehlt: STOPP und hole sie nach!**

## MCP Chrome DevTolls starten
> Ich habe jetzt folgendes über Windows+R und cmd folgendes eingegeben:
C:\>"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
Mehr?   --remote-debugging-port=9222 ^
Mehr?   --user-data-dir="%TEMP%\chrome-debug" ^
Mehr?   http://localhost:5173
und es hat funktioniert