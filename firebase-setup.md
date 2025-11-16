# Firebase Setup Anleitung

Um die Multi-Device-Synchronisation zu aktivieren, musst du Firebase einrichten:

## 1. Firebase-Projekt erstellen

1. Gehe zu https://console.firebase.google.com/
2. Klicke auf "Projekt hinzufügen"
3. Gib deinem Projekt einen Namen (z.B. "harry-potter-timer")
4. Folge den Anweisungen

## 2. Realtime Database aktivieren

1. In deinem Firebase-Projekt, gehe zu "Realtime Database"
2. Klicke auf "Datenbank erstellen"
3. Wähle "Testmodus" (für den Anfang)
4. Wähle eine Region (z.B. "europe-west1")
5. Klicke auf "Aktivieren"

## 3. Firebase-Konfiguration kopieren

1. Gehe zu Projekt-Einstellungen (Zahnrad-Symbol)
2. Scrolle nach unten zu "Deine Apps"
3. Klicke auf das Web-Symbol (</>)
4. Gib einen App-Namen ein (z.B. "Harry Potter Timer")
5. Kopiere die Firebase-Konfiguration

## 4. Konfiguration in index.html einfügen

Öffne `index.html` und ersetze die Platzhalter-Konfiguration (Zeile ~12-19) mit deinen echten Firebase-Credentials:

```javascript
const firebaseConfig = {
    apiKey: "DEINE_API_KEY",
    authDomain: "DEIN_PROJEKT.firebaseapp.com",
    databaseURL: "https://DEIN_PROJEKT-default-rtdb.firebaseio.com",
    projectId: "DEIN_PROJEKT_ID",
    storageBucket: "DEIN_PROJEKT.appspot.com",
    messagingSenderId: "DEINE_SENDER_ID",
    appId: "DEINE_APP_ID"
};
```

## 5. Datenbank-Regeln anpassen (optional, für Sicherheit)

In Firebase Console → Realtime Database → Regeln:

```json
{
  "rules": {
    "timer": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Wichtig:** Diese Regeln erlauben jedem Lese- und Schreibzugriff. Für Produktion solltest du Authentifizierung hinzufügen.

## Fertig! 🎉

Nach dem Setup wird der Timer automatisch über alle Geräte synchronisiert, die die Seite geöffnet haben.

