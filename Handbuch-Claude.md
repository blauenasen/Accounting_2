# Umfassendes Handbuch: Slash-Befehle in Claude Code

## Übersicht

Slash-Befehle sind Steuerbefehle, die du in einer interaktiven Claude Code Session mit `/` beginnen kannst. Es gibt vier Kategorien:

1. **Built-in Befehle** - Von Claude Code bereitgestellt
2. **Custom Befehle** - Von dir selbst oder deinem Team erstellt
3. **Plugin-Befehle** - Von Plugins bereitgestellt
4. **MCP-Befehle** - Von MCP-Servern bereitgestellt

---

## 1. BUILT-IN SLASH-BEFEHLE (Komplette Liste mit Beispielen)

Diese Sektion dokumentiert alle 43 Built-in Slash-Befehle mit konkreten Verwendungsbeispielen, Syntax, Parametern und praktischen Anwendungsfällen.

---

### SESSION & CONTEXT MANAGEMENT

#### `/help`

**Zweck:** Zeigt alle verfügbaren Slash-Befehle mit kurzen Beschreibungen an.

**Syntax:**
```
/help
```

**Output:** Listet alle verfügbaren Befehle:
- Built-in Befehle
- Custom Commands (markiert mit `(project)` oder `(user)`)
- Plugin-Befehle
- MCP-Befehle

**Anwendungsfälle:**
- Entdecke verfügbare Commands
- Finde Custom Commands, die du erstellt hast
- Prüfe verbundene MCP-Server-Befehle

**Beispiel-Output:**
```
Built-in commands:
  /help - Show available commands
  /clear - Clear conversation history
  /exit - Exit Claude Code
  ...

Custom commands (project):
  /optimize - Analyze code for performance
  /check-schema - Show database schema
  ...

Custom commands (user):
  /security-check - Review code for vulnerabilities
  ...
```

---

#### `/clear`

**Zweck:** Löscht den gesamten Konversationsverlauf und startet eine frische Session.

**Syntax:**
```
/clear
```

**Verhalten:**
- Entfernt alle bisherigen Nachrichten aus dem Kontext
- Beendet NICHT die Session (im Gegensatz zu `/exit`)
- Reduziert Token-Nutzung für nachfolgende Anfragen
- Nützlich zwischen unabhängigen Aufgaben

**Anwendungsfälle:**
- Wechsel zwischen unverwandten Aufgaben
- Reduzierung der Token-Kosten
- Bereinigung nach abgeschlossenen Projekten
- Vermeidung von Kontext-Vermischung

**Wichtig:** Die CLAUDE.md Memory-Datei bleibt erhalten!

---

#### `/exit`

**Zweck:** Beendet die Claude Code REPL-Session komplett.

**Syntax:**
```
/exit
```

**Hinweis:** Dies beendet die gesamte Session. Verwende `/clear`, wenn du in derselben Session fortfahren möchtest.

**Alternative:** `Ctrl+D` (Unix/Linux) oder `Ctrl+Z` (Windows)

---

#### `/compact [instructions]`

**Zweck:** Komprimiert den Konversationsverlauf, wobei kritischer Kontext erhalten bleibt und Token-Nutzung reduziert wird.

**Syntax:**
```
/compact
/compact preserve only database schema decisions and authentication patterns
/compact Focus on preserving our current implementation and recent debugging notes
/compact Prioritize core function definitions; summarize UI components briefly
```

**Parameter:**
- `instructions` (optional) - Benutzerdefinierte Anweisungen, was priorisiert werden soll

**Funktionsweise:**
1. Claude fasst die gesamte Konversation zusammen
2. Startet einen neuen Chat mit der vorgeladenen Zusammenfassung
3. Alle Kontexte bleiben durch CLAUDE.md erhalten

**Anwendungsbeispiele:**

```
# Grundlegende Komprimierung
/compact

# Behalte spezifische Patterns bei
/compact preserve the coding patterns we established

# Fokussiere auf API-Endpunkte
/compact only keep the names of the API endpoints we designed

# Priorisiere Funktionsdefinitionen
/compact Prioritize core function definitions; summarize UI components briefly

# Behalte Architektur-Entscheidungen
/compact preserve all architectural decisions and design patterns we discussed
```

**Best Practice:** Verwende `/compact` an natürlichen Haltepunkten, nicht wenn Auto-Compact zufällig triggert.

**Wichtig:** Nach `/compact` hat Claude immer noch Zugriff auf:
- CLAUDE.md Memory-Datei
- Projekt-Dateien
- Git-Historie

---

#### `/rewind` (auch: `Esc` `Esc`)

**Zweck:** Kehrt zu einem früheren Punkt in deiner Session zurück und macht Claudes Änderungen rückgängig.

**Syntax:**
```
/rewind
Esc Esc              # Tastaturkürzel
/rewind <checkpoint-id>
```

**Interface:**
- Zeigt Konversationsverlauf mit File-Diffs
- Jeder Checkpoint wird mit git-ähnlichen Diffs angezeigt
- Zeitgestempelt mit deiner letzten Nachricht

**Wiederherstellungs-Optionen (wähle eine):**

1. **Nur Konversation** - Claude's Kontext zurücksetzen, Code-Änderungen behalten
2. **Nur Code** - Dateien zurücksetzen, Konversationsverlauf beibehalten
3. **Beides** - Komplette Wiederherstellung zum Checkpoint

**Anwendungsbeispiele:**

```
# Szenario 1: Nur Code zurücksetzen
# Verwendung: Claude verstand die Architektur korrekt, aber Implementation ist fehlerhaft
> /rewind
[Wähle Checkpoint]
[Wähle "Code only"]

# Szenario 2: Nur Konversation zurücksetzen
# Verwendung: Claude's mentales Modell zurücksetzen, funktionierenden Code behalten
> /rewind
[Wähle Checkpoint]
[Wähle "Conversation only"]

# Szenario 3: Beides zurücksetzen
# Verwendung: Komplett falsche Richtung, von Checkpoint neu starten
> Esc Esc
[Wähle Checkpoint]
[Wähle "Both"]
```

**Verwandte Befehle:**
```
/checkpoints          # Liste alle Checkpoint-IDs
/rewind <id>         # Springe zu spezifischem Checkpoint
```

**Wichtig:** Verfolgt nur Datei-Edits durch Claudes Tools. Bash-Befehle (`rm`, `mv`, `cp`) sind permanent!

---

#### `/context`

**Zweck:** Visualisiert die aktuelle Kontext-Nutzung als farbiges Gitter mit Token-Verbrauch.

**Syntax:**
```
/context
```

**Output zeigt:**
- Gesamte verbrauchte Tokens
- Verfügbare verbleibende Tokens
- Aufschlüsselung nach Kategorie (Konversation, Dateien, Tools, etc.)
- Farbige Visualisierung der Kontext-Nutzung

**Anwendungsfall:** Debug Kontext-Probleme und optimiere Token-Nutzung bevor Limits erreicht werden.

**Beispiel-Output:**
```
Context Usage: 45,231 / 200,000 tokens (22.6%)

Breakdown:
  Conversation: 18,450 tokens (40.8%)
  Files Read:   15,230 tokens (33.7%)
  Tool Results: 8,120 tokens (18.0%)
  System:       3,431 tokens (7.5%)

[████████████░░░░░░░░░░░░░░░░░░░░░] 22.6%
```

---

#### `/cost`

**Zweck:** Zeigt Token-Nutzungsstatistiken und Kostenabschätzungen für die aktuelle Session.

**Syntax:**
```
/cost
```

**Output:**
```
Total cost: $0.55
Total duration (API): 6m 19.7s
Total duration (wall): 6h 33m 10.2s
Total code changes: 245 lines added, 89 lines removed
```

**Hinweis:** Nicht für Claude Max/Pro-Abonnenten mit Flatrate-Plänen gedacht.

---

### KONFIGURATION & STATUS

#### `/status`

**Zweck:** Zeigt Account-Informationen und Claude Code System-Status an.

**Syntax:**
```
/status
```

**Anzeige:**
- Aktuelle Version
- Aktives Modell
- Konnektivitätsstatus
- Account-Informationen
- API-Verbindungsstatus

**Beispiel-Output:**
```
Claude Code v1.5.2
Model: claude-sonnet-4-5-20250929
Account: user@example.com
Status: Connected
API: Operational
```

**Alternative:** `/config` für detailliertere Einstellungen.

---

#### `/config`

**Zweck:** Öffnet das Settings-Interface (Config-Tab) zur Konfiguration von Claude Code.

**Syntax:**
```
/config
```

**Konfigurierbare Bereiche:**
- Berechtigungen (allow/ask/deny Listen)
- Umgebungsvariablen
- Modell-Auswahl
- Plugin-Einstellungen
- Status-Zeilen-Konfiguration
- Output-Stil-Präferenzen

**Beispiel-Konfigurationsdatei** (`.claude/settings.json`):
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Read(~/.zshrc)"
    ],
    "ask": [
      "Bash(git push:*)"
    ],
    "deny": [
      "WebFetch",
      "Read(./.env)",
      "Read(./secrets/**)"
    ]
  },
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true
  },
  "model": "claude-opus-4-5-20251101"
}
```

---

#### `/permissions`

**Zweck:** Zeigt oder aktualisiert Berechtigungsregeln für Tools und Datei-Operationen.

**Syntax:**
```
/permissions
/permissions add Bash(npm run:*)
/permissions deny Read(./.env)
```

**Berechtigungs-Format:** `Tool(pattern)` oder `Tool` für alle Operationen

**Beispiele:**

```
# Bash-Befehle erlauben
Bash(npm run:*)
Bash(git add:*, git status:*, git commit:*)

# Dateien lesen erlauben
Read(~/.zshrc)
Read(src/**)

# Dateien bearbeiten
Edit(src/**)
Edit(!**/*.lock)      # Alle außer .lock-Dateien

# Tools komplett erlauben/verbieten
WebFetch              # Alle WebFetch-Operationen
```

**Konfigurationsebenen:**
1. **Command Line**: `claude --allowedTools Edit`
2. **Config File**: `.claude/settings.json` (Projekt) oder `~/.claude.json` (User)
3. **Interaktiv**: "Always allow" klicken wenn Claude fragt

**Pattern-Syntax:**
- `*` - Beliebige Zeichen innerhalb eines Pfad-Segments
- `**` - Beliebige Zeichen über mehrere Pfad-Segmente
- `!pattern` - Negation (schließt Pattern aus)

---

#### `/doctor`

**Zweck:** Führt Health-Checks für deine Claude Code Installation durch.

**Syntax:**
```
/doctor
```

**Prüft:**
- Installations-Integrität
- Abhängigkeits-Verifizierung
- Konfigurations-Validierung
- Konnektivitäts-Tests
- MCP-Server-Verbindungen
- Plugin-Status

**Beispiel-Output:**
```
✓ Installation valid
✓ Dependencies OK
✓ Configuration valid
✓ API connectivity OK
✓ MCP server 'chrome-devtools': Connected
⚠ Plugin 'example-plugin': Not responding
```

**Verwende wenn:** Installation-Probleme oder Fehler auftreten.

---

#### `/model`

**Zweck:** Wählt oder wechselt das verwendete KI-Modell.

**Syntax:**
```
/model
/model claude-opus-4-5-20251101
/model claude-sonnet-4-5-20250929
```

**Verfügbare Modelle:**
- `claude-opus-4-5-20251101` - Leistungsfähigstes Modell, höhere Kosten
- `claude-sonnet-4-5-20250929` - Ausgewogen, empfohlen
- `claude-haiku-4` - Schnellstes Modell, niedrigere Kosten

**Anwendungsfall:**
```
# Schnelles Modell für einfache Aufgaben
/model claude-haiku-4

# Leistungsfähiges Modell für komplexe Probleme
/model claude-opus-4-5-20251101

# Standard-Modell
/model claude-sonnet-4-5-20250929
```

---

### ACCOUNT MANAGEMENT

#### `/login`

**Zweck:** Wechselt zwischen Anthropic-Accounts.

**Syntax:**
```
/login
```

**Prozess:**
1. Fordert Account-Credentials an
2. Wechselt aktiven Account für aktuelle Session
3. Pflegt separate API-Keys pro Account

**Anwendungsfall:** Wechsel zwischen persönlichem und Firmen-Account.

---

#### `/logout`

**Zweck:** Meldet sich vom aktuellen Anthropic-Account ab.

**Syntax:**
```
/logout
```

**Effekt:** Löscht Authentifizierungs-Credentials für die aktuelle Session.

---

### PROJECT & MEMORY MANAGEMENT

#### `/init`

**Zweck:** Initialisiert ein neues Projekt mit auto-generierter CLAUDE.md Memory-Datei.

**Syntax:**
```
/init
```

**Erstellt:**
- `.claude/settings.json` - Projekt-spezifische Konfiguration
- `CLAUDE.md` - Projekt-Memory und Guidelines (in Root oder `.claude/`)

**CLAUDE.md Inhalte:**
- Projekt-Beschreibung
- Entwicklungs-Guidelines
- Code-Standards
- Wichtige Entscheidungen
- Team-Regeln

**Anwendungsfall:**
```
# Neues Projekt initialisieren
cd /path/to/new/project
/init

# Claude erstellt CLAUDE.md mit:
# - Projekt-Struktur-Analyse
# - Erkannter Tech Stack
# - Vorgeschlagene Entwicklungs-Guidelines
```

---

#### `/memory`

**Zweck:** Bearbeitet die CLAUDE.md Memory-Datei direkt.

**Syntax:**
```
/memory
```

**Editierbare Speicherorte:**
- **Projekt**: `.claude/CLAUDE.md` oder `CLAUDE.md`
- **User**: `~/.claude/memory.md`

**Inhalts-Ideen:**
```markdown
# Projekt-Architektur
- Backend: Node.js + Express + SQLite
- Frontend: React + TypeScript

# Coding-Patterns
- Max. 500 Zeilen pro Modul
- TypeScript für alle neuen Files
- Keine hardcoded Werte

# Wichtige URLs/Credentials
- API Endpoint: https://api.example.com
- DB Location: ./data/database.db

# Team-Guidelines
- Code Review erforderlich
- Tests vor Commit
```

---

#### `/add-dir`

**Zweck:** Fügt zusätzliche Arbeitsverzeichnisse zur aktuellen Session hinzu.

**Syntax:**
```
/add-dir ../other-project
/add-dir ~/monorepo/packages/frontend
/add-dir C:\Projects\SharedLib
```

**Anwendungsfälle:**
- Arbeit mit Monorepos
- Referenzierung von Dateien aus mehreren Verzeichnissen
- Multi-Projekt-Entwicklung
- Gemeinsame Libraries einbeziehen

**Beispiel:**
```
# Haupt-Projekt + Shared Library
cd ~/my-app
claude
> /add-dir ~/shared-lib
# Claude kann jetzt Dateien aus beiden Verzeichnissen lesen/bearbeiten
```

**Ergebnis:** Claude kann Dateien aus allen hinzugefügten Verzeichnissen lesen/bearbeiten.

---

### AI AGENTS & EXTENSIONS

#### `/agents`

**Zweck:** Erstellt und verwaltet benutzerdefinierte AI-Subagents mit spezialisierten Fähigkeiten.

**Syntax:**
```
/agents
/agents create
/agents list
/agents edit <name>
```

**Funktionsweise:**
1. Definiere spezialisierte AI-Agents mit Custom Prompts
2. Konfiguriere Berechtigungen für jeden Agent
3. Verwende Agents für spezifische Aufgabentypen

**Agent-Konfiguration** (`.claude/agents/reviewer.yaml`):
```yaml
description: Code reviewer agent
system-prompt: |
  You are an expert code reviewer focused on:
  - Security vulnerabilities
  - Performance issues
  - Code style consistency
  - Best practices
allowed-tools:
  - Read
  - Grep
  - Glob
model: claude-opus-4-5-20251101
```

**Anwendungsfälle:**
- Security-fokussierter Agent für Code Reviews
- Performance-Optimizer-Agent
- Dokumentations-Agent
- Testing-Spezialist-Agent
- Architektur-Review-Agent

**Beispiel:**
```
# Agent erstellen
/agents create

# Agent-Name: security-reviewer
# System Prompt: [Security-fokussierte Anweisungen]
# Allowed Tools: Read, Grep

# Agent verwenden
> "Use security-reviewer agent to analyze this authentication code"
```

---

#### `/mcp`

**Zweck:** Verwaltet Model Context Protocol (MCP) Server-Verbindungen.

**Syntax:**
```
/mcp
/mcp add <name> <command> [args...]
/mcp remove <name>
/mcp list
/mcp auth <server-name>
```

**Beispiele:**

```
# GitHub MCP-Server hinzufügen
/mcp add github gh api

# Jira MCP-Server hinzufügen
/mcp add jira jira-mcp --config ~/.jira.json

# Filesystem MCP-Server hinzufügen
/mcp add filesystem file-server stdio

# MCP-Server entfernen
/mcp remove github

# Alle Server auflisten
/mcp list

# OAuth-Authentifizierung
/mcp auth github
```

**Transport-Optionen:**
- `stdio` - Standard Input/Output
- `sse` - Server-Sent Events
- `http` - HTTP-Protokoll

**Anwendungsfälle:**
- GitHub-Verbindung für PR-Operationen
- Jira-Integration für Issue-Tracking
- Custom Data Sources hinzufügen
- Claudes Fähigkeiten erweitern

**MCP-Server-Konfiguration** (`.claude/mcp.json`):
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@cloudflare/mcp-server-chrome-devtools"
      ],
      "env": {
        "CHROME_REMOTE_DEBUGGING_URL": "http://localhost:9222"
      }
    }
  }
}
```

---

#### `/plugin`

**Zweck:** Installiert und verwaltet Claude Code Plugins.

**Syntax:**
```
/plugin
/plugin install @username/plugin-name
/plugin list
/plugin enable plugin-name
/plugin disable plugin-name
```

**Features:**
- Plugins stellen MCP-Server und Hooks bereit
- Ein-/Ausschalten nach Bedarf
- Reduziere Kontext-Overhead durch Deaktivierung ungenutzter Plugins

**Beispiele:**

```
# Plugin installieren
/plugin install @example/pr-review-plugin

# Alle installierten Plugins auflisten
/plugin list

# Plugin deaktivieren
/plugin disable pr-review-plugin

# Plugin aktivieren
/plugin enable pr-review-plugin
```

**Beispiel-Plugins:**
- PR-Review-Plugins
- Security-Guidance-Plugins
- SDK-Development-Plugins
- Custom-Workflow-Plugins

---

#### `/hooks`

**Zweck:** Konfiguriert automatisierte Shell-Befehle an spezifischen Lifecycle-Punkten.

**Syntax:**
```
/hooks
/hooks add <event> <command>
/hooks list
/hooks remove <event>
```

**Hook-Typen:**
- `preToolUse` - Vor jeder Tool-Ausführung
- `postToolUse` - Nach Tool-Abschluss
- `postEdit` - Nach Datei-Bearbeitung
- `postWrite` - Nach Datei-Erstellung

**Hook-Konfiguration** (`.claude/hooks.json`):
```json
{
  "hooks": {
    "postEdit": "prettier --write $FILE && eslint --fix $FILE",
    "postWrite": "git add $FILE",
    "preEdit": "if [ -f $FILE.lock ]; then exit 1; fi"
  }
}
```

**Verfügbare Variablen:**
- `$FILE` - Pfad zur betroffenen Datei
- `$TOOL` - Name des verwendeten Tools
- `$CWD` - Aktuelles Arbeitsverzeichnis

**Anwendungsfälle:**

```
# Auto-Format nach Edits
postEdit: prettier --write $FILE && eslint --fix $FILE

# Auto-Commit nach Changes
postWrite: git add $FILE

# Verhindere Edits an Production-Files
preEdit: if [[ $FILE == *"production"* ]]; then exit 1; fi

# Linting vor Tool-Ausführung
preToolUse: npm run lint

# Tests nach Code-Änderungen
postEdit: npm test -- $FILE
```

**Wichtig:** Hooks können Tool-Ausführung blockieren (Exit-Code != 0).

---

### GITHUB INTEGRATION

#### `/install-github-app`

**Zweck:** Installiert die Claude Code GitHub App für automatisierte PR-Reviews.

**Syntax:**
```
/install-github-app
```

**Prozess:**
1. Leitet durch GitHub App-Setup
2. Fordert notwendige Berechtigungen an
3. Speichert Secrets für Authentifizierung
4. Aktiviert `/review` Befehl

**Anforderungen:**
- GitHub Account
- Repository-Write-Zugriff
- Anthropic API Key

**Nach Installation verfügbar:**
- `/review` - Code Review
- `/pr-comments` - PR-Kommentare abrufen
- GitHub-Status in `/status`

---

#### `/review`

**Zweck:** Fordert Code Review von Claude mit GitHub-Integration an.

**Syntax:**
```
/review
/review this function for performance
/review PR #123 for security issues
/review --focus security,performance
```

**Fähigkeiten:**
- Analysiert PR-Änderungen
- Schlägt Verbesserungen vor
- Implementiert einfache Fixes
- Refactoring-Vorschläge
- Neue Feature-Implementation

**Custom Review-Kriterien** (in `CLAUDE.md`):
```markdown
## Code Review Standards
- Performance: Ensure O(n) complexity or better
- Security: Check for SQL injection, XSS
- Style: Follow ESLint rules
- Testing: Require unit tests for new functions
```

**Beispiel:**
```
# Aktuellen Branch reviewen
/review

# Spezifische Datei reviewen
/review src/auth/login.ts

# Mit spezifischem Fokus
/review this authentication code for security vulnerabilities
```

---

#### `/security-review`

**Zweck:** Analysiert Code-Änderungen auf Sicherheitslücken vor dem Commit.

**Syntax:**
```
/security-review
/security-review --strict
```

**Anforderungen:**
- Muss in einem Git-Repository ausgeführt werden
- Analysiert uncommitted Änderungen

**Prüft auf:**
- SQL-Injection-Schwachstellen
- XSS-Risiken
- Credential-Exposition
- Dependency-Schwachstellen
- Access-Control-Probleme
- Hardcoded Secrets
- Unsichere Crypto-Verwendung

**Output:** Detaillierter Schwachstellen-Report mit Erklärungen und Fixes.

**Beispiel-Output:**
```
Security Review Results:
========================

⚠ HIGH: Potential SQL Injection
  File: src/db/users.ts:45
  Issue: Unparameterized SQL query
  Fix: Use prepared statements

✓ PASS: No XSS vulnerabilities found

⚠ MEDIUM: Hardcoded API key detected
  File: src/config.ts:12
  Issue: API key in source code
  Fix: Use environment variable
```

---

#### `/pr-comments`

**Zweck:** Ruft Kommentare von einem GitHub Pull Request ab und zeigt sie an.

**Syntax:**
```
/pr-comments 123
/pr_comments https://github.com/org/repo/pull/456
/pr-comments --latest
```

**Output:** Listet alle PR-Kommentare mit Kontext für Feedback-Bearbeitung.

**Beispiel:**
```
# PR-Kommentare für PR #123 abrufen
/pr-comments 123

# Via URL
/pr-comments https://github.com/myorg/myrepo/pull/456

# Neueste PR-Kommentare
/pr-comments --latest
```

---

### SESSION MANAGEMENT

#### `/resume [session]`

**Zweck:** Setzt eine vorherige Konversation fort (nach ID oder Name).

**Syntax:**
```
/resume
/resume my-feature-work
/resume abc123def456
/resume --list
```

**Anwendungsfälle:**
- Fortführung langfristiger Projekte über Tage
- Wiederaufnahme von Debugging-Sessions
- Kontext-Erhalt über Unterbrechungen

**Beispiele:**

```
# Session-Picker öffnen
/resume

# Nach Name fortsetzen
/resume authentication-implementation

# Nach ID fortsetzen
/resume f3a8b2c1

# Alle Sessions auflisten
/resume --list
```

**Verwandt:** `/rename` um Sessions zu benennen für einfache Wiederherstellung.

---

#### `/rename <name>`

**Zweck:** Benennt die aktuelle Session für einfachere Wiederherstellung.

**Syntax:**
```
/rename my-authentication-feature
/rename bug-fix-deploy-issue
/rename refactor-database-layer
```

**Vorteile:**
- Einfache Session-Identifikation
- Verwende `/resume <name>` statt IDs
- Bessere Projekt-Organisation
- Nachverfolgung paralleler Aufgaben

**Beispiel:**
```
# Session benennen
/rename implementing-oauth-login

# Später fortsetzen
/resume implementing-oauth-login
```

---

#### `/export [filename]`

**Zweck:** Exportiert die aktuelle Konversation in eine Datei oder Zwischenablage.

**Syntax:**
```
/export
/export my-session.md
/export session.json
/export --clipboard
/export --format html
```

**Export-Formate:**
- Markdown (.md) - Standard
- JSON (.json) - Strukturierte Daten
- HTML (mit Styling)
- Plain Text (.txt)

**Anwendungsfälle:**
- Lösungen mit Team teilen
- Dokumentation erstellen
- Komplexe Debugging-Sessions bewahren
- Wichtige Konversationen archivieren

**Beispiele:**

```
# In Zwischenablage exportieren
/export --clipboard

# Als Markdown-Datei
/export debugging-session.md

# Als JSON
/export session-data.json

# Als HTML mit Styling
/export --format html session.html
```

---

### DEVELOPMENT WORKFLOW

#### `/todos`

**Zweck:** Listet alle TODO-Items auf, die Claude aus deiner Konversation verfolgt.

**Syntax:**
```
/todos
/todos list
/todos clear
```

**Todo-Status:**
- `pending` - Nicht gestartet
- `in_progress` - Aktuell in Arbeit
- `completed` - Abgeschlossen

**Beispiel-Output:**
```
Current TODO List:
==================

1. [pending] Implement authentication module
2. [in_progress] Write unit tests for API endpoints
3. [completed] Set up project structure
4. [pending] Configure CI/CD pipeline
5. [pending] Add error handling to user service
```

**Vorteile:**
- Verliere nie Action Items
- Sichtbares Progress-Tracking
- Multi-Step Task Management
- Automatische Updates durch Claude

---

#### `/bashes`

**Zweck:** Listet und verwaltet Background-Bash-Tasks und -Shells.

**Syntax:**
```
/bashes
/bashes kill bash_1
/bashes list
/bashes output bash_2
```

**Output zeigt:**
- Shell-ID (bash_1, bash_2, etc.)
- Ausgeführter Befehl
- Status (running/completed/killed)
- Runtime und Exit-Codes

**Background-Task-Management:**
```
# Task im Hintergrund starten (in Claude's Response)
> "Run npm run build in background"

# Status prüfen
/bashes

# Output abrufen
/bashes output bash_1

# Task beenden
/bashes kill bash_1
```

**Anwendungsfälle:**
```
- Build-/Compile-Prozesse ausführen
- Development-Server starten
- Langfristige Tests
- Hintergrund-Monitoring
- Datei-Watcher
```

**Tastaturkürzel:** `Ctrl+B` um aktuelle Bash in Hintergrund zu verschieben.

---

#### `/terminal-setup`

**Zweck:** Konfiguriert Terminal-Tastenbindungen wie Shift+Enter für neue Zeilen.

**Syntax:**
```
/terminal-setup
```

**Allgemeine Setups:**
- Shift+Enter für neue Zeile in Prompts
- Ctrl+C zum Unterbrechen
- Tab für Autovervollständigung
- Ctrl+R für History-Suche

**Unterstützte Terminals:**
- iTerm2 (macOS)
- VSCode integriertes Terminal
- Weitere in Entwicklung

---

### CUSTOMIZATION & DISPLAY

#### `/output-style [style]`

**Zweck:** Setzt wie Claude Informationen formatiert und anzeigt.

**Syntax:**
```
/output-style
/output-style Markdown
/output-style Explanatory
/output-style Concise
```

**Verfügbare Stile:**
- `Explanatory` - Detaillierte Erklärungen mit Kontext
- `Markdown` - Strukturiert mit Bullet Points, kurz
- `Concise` - Kurz, minimale Ausgabe
- `HTML` - Retro-Terminal-Theme-Output

**Anwendungsfall:**
```
# Bevorzuge kurze Ausgabe für große Codebases
/output-style Markdown

# Detaillierte Erklärungen für Lernzwecke
/output-style Explanatory

# Minimale Ausgabe
/output-style Concise
```

---

#### `/statusline`

**Zweck:** Konfiguriert eine benutzerdefinierte Status-Zeile für Claude Code (ähnlich Terminal PS1).

**Syntax:**
```
/statusline
/statusline enable
/statusline disable
```

**Anzeigbare Metriken:**
- Kontext-Fenster-Nutzung (Prozentsatz)
- Aktueller Modell-Name
- Session-Name
- Verzeichnis-Pfad
- Kosten für aktuellen Block
- Burn Rate

**Beispiel-Konfiguration** (`.claude/settings.json`):
```json
{
  "statusLine": {
    "type": "command",
    "command": "bun x ccusage statusline"
  }
}
```

**Beispiel-Ausgabe:**
```
[claude-sonnet-4-5] [22.6% ctx] [$0.12] ~/my-project
```

---

#### `/release-notes`

**Zweck:** Zeigt Claude Code Release Notes und Changelog an.

**Syntax:**
```
/release-notes
/release-notes --latest
/release-notes v1.5.0
```

**Informationen:**
- Feature-Ergänzungen
- Bug-Fixes
- Deprecations
- Versions-Historie
- Breaking Changes

---

#### `/ide`

**Zweck:** Konfiguriert IDE-Integration-Einstellungen.

**Syntax:**
```
/ide
/ide status
/ide connect vscode
```

**Einstellungen:**
- VS Code Sidebar-Platzierung
- Multiple Terminal Client-Support
- IDE-Appearance-Präferenzen
- Keyboard-Shortcuts

---

#### `/privacy-settings`

**Zweck:** Konfiguriert Datenschutz- und Datensammlungs-Präferenzen.

**Syntax:**
```
/privacy-settings
```

**Hinweis:** Dieser Befehl ist möglicherweise nicht in allen Versionen verfügbar.

---

### INFORMATION & HELP

#### `/stats`

**Zweck:** Zeigt detaillierte Statistiken über deine Claude Code Nutzung.

**Syntax:**
```
/stats
/stats --detailed
```

**Metriken:**
- Gesamte Sessions
- Ausgeführte Befehle
- Modifizierte Dateien
- Verbrauchte Tokens
- Kosten-Aufschlüsselung
- Nutzungs-Trends

**Beispiel-Output:**
```
Claude Code Statistics
======================

Total Sessions: 127
Total Messages: 3,456
Files Modified: 892
Lines Added: 12,345
Lines Removed: 5,678

Model Usage:
  Sonnet 4.5: 85%
  Opus 4.5: 12%
  Haiku 4: 3%

Daily Streak: 15 days
```

---

#### `/usage`

**Zweck:** Zeigt detaillierte Token-Nutzung und Kosten-Aufschlüsselung.

**Syntax:**
```
/usage
/usage --today
/usage --week
```

**Output:**
- Aktuelle Session-Nutzung
- Heutige Gesamt-Nutzung
- Zeitbasierte Nutzungs-Patterns
- Kosten pro Befehl/Operation

**Beispiel:**
```
Token Usage
===========

Current Session: 45,231 tokens ($0.22)
Today: 128,450 tokens ($0.64)
This Week: 892,340 tokens ($4.46)

Breakdown:
  Input Tokens: 58%
  Output Tokens: 42%
```

---

#### `/settings`

**Zweck:** Öffnet Einstellungen (Alternative zu `/config`).

**Syntax:**
```
/settings
```

**Identisch mit:** `/config`

---

### VIM MODE

#### `/vim`

**Zweck:** Aktiviert Vim-Modus für wechselnde Insert- und Command-Modi.

**Syntax:**
```
/vim
/vim enable
/vim disable
```

**Modi:**
- **Insert Mode (i)** - Normal tippen
- **Command Mode (Esc)** - Vim-Befehle
- **Exit (:q)** - Vim-Modus verlassen

**Vim-Befehle verfügbar:**
- Navigation: `h`, `j`, `k`, `l`, `w`, `b`, `0`, `$`
- Edit: `i`, `a`, `o`, `O`, `x`, `dd`, `yy`, `p`
- Search: `/`, `?`, `n`, `N`
- Save/Quit: `:w`, `:q`, `:wq`

**Vorteile:** Schnellere Text-Bearbeitung für Vim-Nutzer.

---

### ADVANCED FEATURES

#### `/sandbox`

**Zweck:** Aktiviert sandboxed Bash-Umgebung mit Dateisystem- und Netzwerk-Isolation.

**Syntax:**
```
/sandbox
/sandbox enable
/sandbox disable
/sandbox status
```

**Konfiguration** (`.claude/settings.json`):
```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker", "kubectl"],
    "network": {
      "allowUnixSockets": ["~/.ssh/agent-socket"],
      "allowLocalBinding": true
    }
  }
}
```

**Vorteile:**
- Isoliert Befehle vom Haupt-Dateisystem
- Netzwerk-Isolation für Sicherheit
- Sichere Experimente
- Verhindert versehentliche Destruktive Operationen

**Was wird isoliert:**
- Dateisystem (temporäres Overlay)
- Netzwerk-Zugriff (konfigurierbar)
- Prozess-Namespace

**Ausnahmen:**
- Unix-Sockets (konfigurierbar)
- Lokales Binding (konfigurierbar)

---

### WEITERE BEFEHLE

#### `/bug`

**Zweck:** Meldet Fehler (sendet Konversation an Anthropic).

**Syntax:**
```
/bug
/bug "Describe the issue here"
```

**Sendet:**
- Aktuelle Konversation
- Fehler-Beschreibung
- System-Informationen
- Claude Code Version

**Datenschutz:** Fragt vor dem Senden um Erlaubnis.

---

### ZUSAMMENFASSUNGS-TABELLE

| Befehl | Zweck | Kategorie |
|--------|-------|----------|
| `/help` | Zeigt verfügbare Befehle | Info |
| `/clear` | Löscht Konversationsverlauf | Context |
| `/exit` | Beendet Session | Session |
| `/compact` | Komprimiert Kontext | Context |
| `/rewind` | Macht Änderungen rückgängig | Session |
| `/context` | Zeigt Token-Nutzung | Info |
| `/cost` | Zeigt Kosten | Info |
| `/status` | System-Status | Info |
| `/config` | Einstellungen | Config |
| `/permissions` | Tool-Berechtigungen | Config |
| `/doctor` | Health-Check | Config |
| `/model` | Modell wechseln | Config |
| `/login` | Account wechseln | Auth |
| `/logout` | Abmelden | Auth |
| `/init` | Projekt initialisieren | Project |
| `/memory` | CLAUDE.md bearbeiten | Project |
| `/add-dir` | Verzeichnisse hinzufügen | Project |
| `/agents` | Agents verwalten | Extension |
| `/mcp` | MCP-Server | Extension |
| `/plugin` | Plugins verwalten | Extension |
| `/hooks` | Hooks konfigurieren | Extension |
| `/install-github-app` | GitHub-Setup | GitHub |
| `/review` | Code Review | GitHub |
| `/security-review` | Security-Check | GitHub |
| `/pr-comments` | PR-Kommentare | GitHub |
| `/resume` | Session fortsetzen | Session |
| `/rename` | Session benennen | Session |
| `/export` | Chat exportieren | Export |
| `/todos` | Tasks verfolgen | Workflow |
| `/bashes` | Background-Tasks | Workflow |
| `/terminal-setup` | Tastenbindungen | Config |
| `/output-style` | Display-Format | Display |
| `/statusline` | Status-Zeilen-Config | Display |
| `/release-notes` | Changelog | Info |
| `/ide` | IDE-Config | Config |
| `/privacy-settings` | Datenschutz | Config |
| `/stats` | Nutzungs-Stats | Info |
| `/usage` | Token-Nutzung | Info |
| `/settings` | Einstellungen | Config |
| `/vim` | Vim-Modus | Editor |
| `/sandbox` | Isolierte Umgebung | Security |
| `/bug` | Fehler melden | Help |

---

### QUELLEN

Diese Dokumentation basiert auf:
- [Slash commands - Claude Code Docs](https://code.claude.com/docs/en/slash-commands)
- [Claude Code Developer Cheatsheet](https://awesomeclaude.ai/code-cheatsheet)
- [Claude Code Settings Documentation](https://code.claude.com/docs/en/settings)
- [Checkpointing - Claude Code Docs](https://code.claude.com/docs/en/checkpointing)
- [The Ultimate Claude Code Cheat Sheet](https://medium.com/@tonimaxx/the-ultimate-claude-code-cheat-sheet-your-complete-command-reference-f9796013ea50)
- [Rewind a coding session in Claude Code](https://m.academy/lessons/rewind-coding-session-claude-code/)
- [Claude Code Compaction Guide](https://stevekinney.com/courses/ai-development/claude-code-compaction)
- [Managing Claude Code Context](https://mcpcat.io/guides/managing-claude-code-context/)
- [First Principles Consulting - Complete Reference Guide](https://firstprinciplescg.com/resources/claude-code-slash-commands-the-complete-reference-guide/)

---

## 2. CUSTOM SLASH-BEFEHLE (Benutzerdefinierte Befehle)

Mit Custom Slash-Befehlen kannst du häufig verwendete Prompts als Markdown-Dateien definieren, die Claude Code ausführen kann.

### 2.1 Grundstruktur & Syntax

```
/<befehlsname> [argumente]
```

### 2.2 Speicherorte

#### Project Commands (Team-weit)
- **Speicherort**: `.claude/commands/` im Repository
- **Gültigkeitsbereich**: Nur in diesem Projekt
- **Sichtbarkeit**: Werden mit "(project)" gekennzeichnet in `/help`
- **Sharing**: Über Git mit dem Team teilbar

#### Personal Commands (Persönlich)
- **Speicherort**: `~/.claude/commands/` in deinem Home-Verzeichnis
- **Gültigkeitsbereich**: Alle deine Projekte
- **Sichtbarkeit**: Werden mit "(user)" gekennzeichnet in `/help`
- **Sharing**: Nur auf diesem Computer

### 2.3 Erstellen von Custom Befehlen

#### Beispiel 1: Einfacher Projekt-Befehl

```bash
# Verzeichnis erstellen
mkdir -p .claude/commands

# Befehl erstellen
echo "Analyze this code for performance issues and suggest optimizations:" > .claude/commands/optimize.md
```

Dies erstellt den Befehl `/optimize`

#### Beispiel 2: Persönlicher Befehl

```bash
# Verzeichnis erstellen
mkdir -p ~/.claude/commands

# Befehl erstellen
echo "Review this code for security vulnerabilities:" > ~/.claude/commands/security-check.md
```

Dies erstellt den Befehl `/security-check` (in allen Projekten verfügbar)

### 2.4 Namespacing (Organisierung)

Nutze Unterverzeichnisse, um verwandte Befehle zu gruppieren:

```
.claude/commands/
├── optimize.md              → /optimize
├── frontend/
│   ├── component.md         → /component (zeigt: "(project:frontend)")
│   └── test.md              → /test (zeigt: "(project:frontend)")
└── backend/
    └── test.md              → /test (zeigt: "(project:backend)")
```

**Wichtig**: Das Unterverzeichnis wird in der Beschreibung angezeigt, aber nicht der Befehlsname selbst.

**Konfliktauflösung**: Wenn `project:optimize.md` und `user:optimize.md` existieren, wird das Project-Verzeichnis bevorzugt.

### 2.5 Argumente in Custom Befehlen

#### Option A: Alle Argumente mit `$ARGUMENTS`

Alle übergebenen Argumente werden in `$ARGUMENTS` zusammengefasst:

```markdown
# .claude/commands/fix-issue.md

Fix issue #$ARGUMENTS following our coding standards and best practices.
```

**Verwendung**:
```
> /fix-issue 123 high-priority
# $ARGUMENTS wird zu: "123 high-priority"
```

#### Option B: Einzelne Argumente mit `$1`, `$2`, etc.

Zugriff auf spezifische Argumente nach Position (wie in Shell-Scripts):

```markdown
# .claude/commands/review-pr.md

Review PR #$1 with priority $2 and assign to $3.
Focus on security, performance, and code style.
```

**Verwendung**:
```
> /review-pr 456 high alice
# $1 = "456", $2 = "high", $3 = "alice"
```

**Wann welche Option?**
- **`$ARGUMENTS`**: Wenn alle Argumente zusammen behandelt werden
- **`$1`, `$2`**: Wenn Argumente einzeln an verschiedenen Stellen verwendet werden

### 2.6 Bash-Command-Ausführung in Befehlen

Befehle können Bash-Befehle ausführen und deren Ausgabe in den Kontext einbeziehen. Nutze das `!` Präfix:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Erstelle einen Git-Commit
---

## Kontext

- Aktueller Git-Status: !`git status`
- Aktuelle Änderungen (staged und unstaged): !`git diff HEAD`
- Aktueller Branch: !`git branch --show-current`
- Letzte Commits: !`git log --oneline -10`

## Deine Aufgabe

Erstelle einen Git-Commit basierend auf den obigen Änderungen.
```

**Wichtig**: Du musst `allowed-tools` mit dem `Bash` Tool definieren, kannst aber spezifisch wählen, welche Bash-Befehle erlaubt sind.

### 2.7 Dateireferenzen in Befehlen

Beziehe Datei-Inhalte mit dem `@` Präfix ein:

```markdown
# .claude/commands/compare.md

Vergleiche die Implementierungen:

@src/old-version.js
@src/new-version.js

Was sind die Unterschiede?
```

### 2.8 Extended Thinking aktivieren

Slash-Befehle können Extended Thinking triggern:

```markdown
---
description: Tiefanalyse des Codes
---

# Analysiere diesen Code gründlich

Think carefully about:
- Edge cases
- Performance implications
- Security concerns
```

### 2.9 Frontmatter (Metadaten)

Befehle können Frontmatter für Metadaten nutzen:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Erstelle einen Git-Commit
model: claude-opus-4-5-20251101
disable-model-invocation: false
---

Erstelle einen Git-Commit mit der Nachricht: $ARGUMENTS
```

**Verfügbare Frontmatter-Felder**:

| Feld | Zweck | Standard |
|------|-------|----------|
| `allowed-tools` | Welche Tools darf der Befehl nutzen? | Erbt von Konversation |
| `argument-hint` | Hinweis für erwartete Argumente. Z.B. `[pr-number] [priority]` | Keine |
| `description` | Kurzbeschreibung des Befehls | Erste Zeile vom Prompt |
| `model` | Spezifisches KI-Modell | Erbt von Konversation |
| `disable-model-invocation` | Verhindert, dass der SlashCommand-Tool diesen Befehl aufruft | false |

### 2.10 Vollständige Beispiele für Custom Befehle

#### Beispiel 1: Code-Review mit Bash

```markdown
---
allowed-tools: Bash(git diff:*), Bash(git branch:*)
description: Review den aktuellen Diff
---

# Code Review

Aktuelle Branch-Änderungen:
!`git diff HEAD`

Bitte überprüfe:
- Sicherheitsrisiken
- Performance-Probleme
- Code-Style-Verstöße
- Logging und Error-Handling
```

#### Beispiel 2: Feature-Anfrage mit Argumenten

```markdown
---
argument-hint: [feature-name] [priority] [owner]
description: Neue Feature anfragen
---

# Feature Request

Feature: $1
Priority: $2
Owner: $3

Bitte implementiere diese Feature mit:
- Vollständige Tests
- Dokumentation
- Performance-Überlegungen
```

#### Beispiel 3: Persönlicher Sicherheits-Check

```markdown
---
allowed-tools: Bash(npm audit:*)
description: Sicherheitsprüfung durchführen
---

# Security Check

Installierte Dependencies überprüfen:
!`npm audit`

Prüfe den Code auf:
- Häufige Sicherheitsmängel (OWASP Top 10)
- SQL-Injection-Anfälligkeit
- XSS-Anfälligkeit
- Hardcodierte Secrets
```

---

## 3. PLUGIN-BEFEHLE

Plugin-Befehle werden von Plugins bereitgestellt und funktionieren wie benutzerdefinierte Befehle.

### 3.1 Wie Plugin-Befehle funktionieren

- **Namespacing**: Format `/plugin-name:command-name` zur Vermeidung von Konflikten
- **Automatische Verfügbarkeit**: Nach Installation und Aktivierung erscheinen sie in `/help`
- **Volle Integration**: Unterstützen Argumente, Frontmatter, Bash-Ausführung und Dateireferenzen

### 3.2 Plugin-Befehlsstruktur

**Speicherort**: `commands/` Verzeichnis im Plugin-Root

**Dateiformat**: Markdown-Dateien mit Frontmatter

```markdown
---
description: Kurzbeschreibung
---

# Befehlsname

Detaillierte Anweisungen für Claude zur Ausführung
```

### 3.3 Aufrufen von Plugin-Befehlen

```bash
# Direkter Aufruf (wenn keine Konflikte existieren)
/command-name

# Mit Plugin-Präfix (bei Bedarf zur Unterscheidung)
/plugin-name:command-name

# Mit Argumenten
/command-name arg1 arg2
```

---

## 4. MCP SLASH-BEFEHLE

MCP-Server können Prompts als Slash-Befehle bereitstellen, die automatisch in Claude Code verfügbar werden.

### 4.1 Befehlsformat

```
/mcp__<server-name>__<prompt-name> [argumente]
```

### 4.2 Beispiele

```bash
# Ohne Argumente
/mcp__github__list_prs

# Mit Argumenten
/mcp__github__pr_review 456
/mcp__jira__create_issue "Bug-Titel" high
```

### 4.3 Funktionen von MCP-Befehlen

#### Dynamische Entdeckung
- MCP-Befehle sind automatisch verfügbar, wenn:
  - Ein MCP-Server verbunden und aktiv ist
  - Der Server Prompts über das MCP-Protokoll bereitstellt
  - Prompts erfolgreich während der Verbindung abgerufen wurden

#### Argumente
- Server definieren, welche Argumente ihre Prompts akzeptieren
- Argument-Syntax wird vom Server definiert

#### Naming-Konventionen
- Leerzeichen und Sonderzeichen werden zu Unterstrichen
- Namen sind normalerweise kleingeschrieben

### 4.4 MCP-Verbindungen verwalten

```bash
/mcp
```

Dieser Befehl erlaubt dir:
- Alle konfigurierten MCP-Server anzeigen
- Verbindungsstatus prüfen
- Mit OAuth-aktivierten Servern authentifizieren
- Authentifizierungs-Tokens löschen
- Verfügbare Tools und Prompts sehen

### 4.5 MCP-Berechtigungen

MCP-Tools benötigen Berechtigungen:

```bash
# Alle Tools eines Servers erlauben (beide Varianten gleichwertig)
mcp__github
mcp__github__*

# Spezifische Tools erlauben
mcp__github__get_issue
mcp__github__list_issues
```

---

## 5. SLASHCOMMAND TOOL

Das `SlashCommand` Tool erlaubt Claude, benutzerdefinierte Slash-Befehle programmatisch auszuführen.

### 5.1 Aktivierung

Um Claude zu ermutigen, das Tool zu nutzen, referenziere den Befehl in deinem Prompt oder `CLAUDE.md`:

```
Nutze /write-unit-test wenn du Tests schreiben möchtest.
```

### 5.2 Unterstützte Befehle

Das `SlashCommand` Tool unterstützt **nur** Custom Slash-Befehle, die:

- Benutzerdefiniert sind (nicht built-in wie `/compact` oder `/init`)
- Ein `description` Frontmatter-Feld haben

### 5.3 Deaktivieren des SlashCommand Tools

```bash
/permissions
# Füge zu Deny-Regeln hinzu: SlashCommand
```

### 5.4 Spezifische Befehle deaktivieren

Füge zu einem Befehl hinzu:

```markdown
---
disable-model-invocation: true
---
```

### 5.5 Berechtigungen für SlashCommand

```bash
# Exakte Übereinstimmung (nur ohne Argumente)
SlashCommand:/commit

# Präfix-Übereinstimmung (mit Argumenten)
SlashCommand:/review-pr:*
```

### 5.6 Character Budget Limit

- **Standard**: 15.000 Zeichen für alle Befehlsbeschreibungen
- **Anpassung**: Environment-Variable `SLASH_COMMAND_TOOL_CHAR_BUDGET`

Wenn das Budget überschritten wird, sieht Claude nur einen Teil der verfügbaren Befehle.

---

## 6. SKILLS vs. SLASH-BEFEHLE

Beide sind Erweiterungsmöglichkeiten, dienen aber unterschiedlichen Zwecken:

### 6.1 Wann Slash-Befehle verwenden?

**Schnelle, häufig genutzte Prompts:**
- Einfache Prompt-Schnipsel, die du oft verwendest
- Schnelle Erinnerungen oder Vorlagen
- Häufig genutzte Anweisungen, die in eine Datei passen

**Beispiele:**
```
/review → "Überprüfe diesen Code auf Fehler"
/explain → "Erkläre diesen Code einfach"
/optimize → "Analysiere diesen Code auf Performance-Probleme"
```

### 6.2 Wann Skills verwenden?

**Umfassende Fähigkeiten mit Struktur:**
- Komplexe Workflows mit mehreren Schritten
- Fähigkeiten, die Scripts oder Utilities benötigen
- Wissen über mehrere Dateien verteilt
- Team-Workflows, die standardisiert sein sollen

**Beispiele:**
- PDF-Processing Skill mit Form-Filling Scripts
- Datenanalyse Skill mit Referenzdokumenten
- Dokumentations Skill mit Style-Guides

### 6.3 Vergleichstabelle

| Aspekt | Slash-Befehle | Skills |
|--------|--------------|--------|
| **Komplexität** | Einfache Prompts | Komplexe Fähigkeiten |
| **Struktur** | Einzelne `.md`-Datei | Verzeichnis mit SKILL.md + Ressourcen |
| **Entdeckung** | Explizite Aufrufe (`/befehl`) | Automatisch (basierend auf Kontext) |
| **Dateien** | Eine Datei | Mehrere Dateien, Scripts, Templates |
| **Gültigkeitsbereich** | Projekt oder persönlich | Projekt oder persönlich |
| **Sharing** | Via Git | Via Git |

### 6.4 Beispiel-Vergleich

#### Als Slash-Befehl:
```markdown
# .claude/commands/review.md
Überprüfe diesen Code auf:
- Sicherheitslücken
- Performance-Probleme
- Code-Style-Verstöße
```
Verwendung: `/review` (manueller Aufruf)

#### Als Skill:
```
.claude/skills/code-review/
├── SKILL.md (Übersicht und Workflows)
├── SECURITY.md (Sicherheit-Checkliste)
├── PERFORMANCE.md (Performance-Patterns)
├── STYLE.md (Style-Guide-Referenz)
└── scripts/
    └── run-linters.sh
```
Verwendung: "Kannst du diesen Code überprüfen?" (automatische Entdeckung)

---

## 7. BEST PRACTICES

### 7.1 Befehl-Design

**Good:**
```markdown
---
description: Überprüfe Code auf Sicherheitslücken
argument-hint: [file-path]
---

Analysiere die Datei $1 auf häufige Sicherheitsmängel
```

**Bad:**
```markdown
Überprüfe das Zeug auf Fehler
```

### 7.2 Naming-Konventionen

- **Kurz und aussagekräftig**: `/optimize` statt `/optimize-code-for-performance`
- **Verb-basiert**: `/review`, `/test`, `/generate` statt `/code-review`, `/testing`, `/generation`
- **Englisch**: `/fix-bug` nicht `/behebe-fehler`

### 7.3 Argument-Hinweise

Sei spezifisch:

```markdown
---
argument-hint: [pr-number] [priority: high|medium|low] [reviewer]
---
```

Nicht einfach `[arguments]` verwenden.

### 7.4 Dokumentation

Schreibe klare Beschreibungen:

```markdown
---
description: Review PR mit Fokus auf Security, Performance und Code Style
---
```

### 7.5 Sicherheit

- Nutze `allowed-tools` um Tools einzuschränken
- Sei spezifisch mit Bash-Befehlen: `Bash(git add:*)` nicht `Bash(*)`
- Überprüfe, welche Dateien referenced werden

---

## 8. DEIN PROJEKT-SETUP

Basierend auf deiner aktuellen Konfiguration in `C:\Users\ejuli\Desktop\Projekt\Accounting_2`:

### 8.1 Deine Custom Commands

Du hast bereits folgende Custom Commands:

```
.claude/commands/
├── init.md              → /init
├── pr-comments.md       → /pr-comments
├── review.md            → /review
├── security-review.md   → /security-review
└── statusline.md        → /statusline
```

### 8.2 Chrome DevTools MCP

Du hast `chrome-devtools` als MCP-Server konfiguriert. Die Befehle sind:

```
/mcp__chrome-devtools__evaluate_script
/mcp__chrome-devtools__click
/mcp__chrome-devtools__take_screenshot
/mcp__chrome-devtools__press_key
/mcp__chrome-devtools__list_pages
/mcp__chrome-devtools__navigate_page
/mcp__chrome-devtools__take_snapshot
/mcp__chrome-devtools__wait_for
/mcp__chrome-devtools__list_console_messages
/mcp__chrome-devtools__list_network_requests
/mcp__chrome-devtools__get_network_request
```

### 8.3 Empfohlene zusätzliche Commands für dein Projekt

Basierend auf dem CLAUDE.md könntest du folgende Commands hinzufügen:

#### 1. Code Quality Check
```markdown
# .claude/commands/check-size.md

---
description: Überprüfe Dateigröße gegen 500-Zeilen Limit
argument-hint: [file-path]
---

Überprüfe die Datei $1 auf Codezeilen:
- Zeigen Sie die Zeilenzahl
- Warnen Sie, wenn > 300 Zeilen (gelb)
- Fehler, wenn > 500 Zeilen (rot)
```

#### 2. Database Schema Checker
```markdown
# .claude/commands/check-schema.md

---
description: Zeige das Database Schema
argument-hint: [table-name]
allowed-tools: Bash(sqlite3:*)
---

Zeige das Schema für Tabelle: $1

!`sqlite3 database.db ".schema $1"`
```

#### 3. Refactoring Guide
```markdown
# .claude/commands/refactor-guide.md

---
description: Anleitung für Code-Refactoring
---

Wenn eine Datei > 500 Zeilen hat:

1. Teile den Code in logische Module
2. Lagere verwandte Funktionen aus
3. Nutze TypeScript Interfaces für Types
4. Schreibe Unit-Tests für neue Module
```

---

## 9. HÄUFIG GESTELLTE FRAGEN

### F: Wie teste ich einen Custom Command lokal?

```bash
# Erstelle eine Test-Datei
echo "Test prompt content" > .claude/commands/test-command.md

# Starte eine Claude Code Session in deinem Project
claude

# Nutze den Befehl
> /test-command
```

### F: Können Custom Commands andere Commands aufrufen?

Ja, du kannst referenzieren:
```markdown
Führe zuerst /init aus, dann /review
```

Claude wird diese als separate Befehle erkennen.

### F: Wie gebe ich ein Leerzeichen in Argumenten?

Nutze Anführungszeichen:
```
/my-command "Argument mit Leerzeichen"
```

### F: Kann ich einen Project-Command von jedem Computer aus nutzen?

Nein, nur auf Computern, auf denen das Repository gecloned ist. Personal Commands sind auf allen Computern verfügbar.

### F: Wie liste ich alle verfügbaren Commands auf?

```bash
/help
```

Dies zeigt alle built-in Commands, Custom Commands und Plugin Commands.

### F: Kann Claude automatisch Custom Commands aufrufen?

Ja, wenn:
- Der Command ein `description` Frontmatter-Feld hat
- Das `SlashCommand` Tool nicht deaktiviert ist
- Du den Command in deinem Prompt oder CLAUDE.md referenzierst

---

## 10. LEARNING RESOURCES

**Offizielle Dokumentation:**
- [Slash Commands](https://code.claude.com/docs/en/slash-commands.md)
- [Common Workflows - Custom Slash Commands](https://code.claude.com/docs/en/common-workflows.md#create-custom-slash-commands)
- [Agent Skills](https://code.claude.com/docs/en/skills.md)
- [Plugins](https://code.claude.com/docs/en/plugins.md)
- [MCP Documentation](https://code.claude.com/docs/en/mcp.md)

**Weitere Ressourcen:**
- `/help` - In deiner Claude Code Session
- `/doctor` - Zur Diagnose deiner Installation
- `/feedback` - Für Feature-Requests oder Bug-Reports

---

Diese umfassende Dokumentation deckt alle Aspekte von Slash-Befehlen ab. Du kannst sie gerne als deutsches Handbuch verwenden!
