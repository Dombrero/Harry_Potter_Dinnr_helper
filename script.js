// Timeline Daten - Zeit in Sekunden vom Start
const timeline = [
    { time: 290, description: "Mini Frühstück - kleine Eierspeise mit Würstchen, vegetarischen Ersatz, Tee" },
    { time: 735, description: "Keks - ganz ganz klein" },
    { time: 950, description: "Happy Birthday Harry Cake mini" },
    { time: 1290, description: "Butterbier" },
    { time: 1850, description: "Kürbissuppe" },
    { time: 2215, description: "Harry Potter Süßwaren (vll mit Schokofröschen)" },
    { time: 2630, description: "Kerzen an / Anfangen anzurichten" },
    { time: 2901, description: "\"Lasst das Fest beginnen\" - Brathähnchen mit Gemüse und Kartoffelpüree, Maiskolben, Brokkoli, Kohlsprossen, Früchtteller ungeschnitten" },
    { time: 3220, description: "Zaubertrank - Schwarzer Trank des Todes (Johannisbeersaft oder so)" },
    { time: 4125, description: "Goldener Schnatz Snack (Deko von Amazon)" },
    { time: 4290, description: "2tes Halloween Festmahl - Kürbiskuchen, Lollies rund" },
    { time: 4656, description: "Toast" },
    { time: 5445, description: "Xmas Geschenke" },
    { time: 5908, description: "Kaki Frucht und immer noch Kuchen von vorher, Tee" },
    { time: 6403, description: "Drachenei" },
    { time: 8485, description: "Schokofrosch, Jelly Beans" },
    { time: 8670, description: "Festmahl 3 - Reste vom Festmahl" }
];

let startTime = null;
let elapsedTime = 0;
let isRunning = false;
let animationFrameId = null;
let isSyncing = false; // Verhindert Endlosschleifen bei Sync
let syncRef = null; // Firebase Referenz

const mainTimer = document.getElementById('mainTimer');
const timerLabel = document.getElementById('timerLabel');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const timelineContainer = document.getElementById('timeline');
const currentStepInfo = document.getElementById('currentStepInfo');
const nextStepInfo = document.getElementById('nextStepInfo');
const progressTime = document.getElementById('progressTime');
const progressPercentage = document.getElementById('progressPercentage');
const progressFill = document.getElementById('progressFill');
const progressMarkers = document.getElementById('progressMarkers');
const upcomingScenesList = document.getElementById('upcomingScenesList');
const menuContainer = document.getElementById('menuContainer');

// Gesamtzeit des Films in Sekunden (2:24:30 = 8670 Sekunden)
const TOTAL_FILM_TIME = 8670;

// Menü-Struktur mit Zeit-Zuordnung
const menuData = [
    {
        section: "Morgenmahl im Schloss",
        time: 290, // 4:50
        items: [
            { name: "Muggle-Rührei Häppchen", description: "" },
            { name: "Würstchen oder vegetarische Variante", description: "" },
            { name: "Duftender Kräutertee", description: "" }
        ]
    },
    {
        section: "Kleine Zauberhappen",
        time: 735, // 12:15
        items: [
            { name: "Keks aus der Schlossküche", description: "" }
        ]
    },
    {
        section: "Kleine Zauberhappen",
        time: 950, // 15:50
        items: [
            { name: "Festtagskuchen", description: "Happy Birthday Harry Cake" }
        ]
    },
    {
        section: "Kleine Zauberhappen",
        time: 1290, // 21:30
        items: [
            { name: "Butterbier", description: "" }
        ]
    },
    {
        section: "Kesselgerichte",
        time: 1850, // 30:50
        items: [
            { name: "Cremige Kürbissuppe", description: "" }
        ]
    },
    {
        section: "Süßwaren aus Hogsmeade",
        time: 2215, // 36:55
        items: [
            { name: "Auswahl verzauberter Leckereien", description: "" },
            { name: "Bertie Botts Bohnen jeder Geschmacksrichtung", description: "" }
        ]
    },
    {
        section: "Festtafel der Großen Halle",
        time: 2901, // 48:21
        items: [
            { name: "Brathähnchen mit Gemüse und Kartoffelpüree", description: "" },
            { name: "Ofen-Gemüse", description: "Maiskolben, Brokkoli, Kohlsprossen" },
            { name: "Teller mit frischen Früchten", description: "" }
        ]
    },
    {
        section: "Zaubertränke",
        time: 3220, // 53:40
        items: [
            { name: "Schwarzer \"Trank des Todes\"", description: "Johannisbeersaft" },
            { name: "Elixier der Grünen Quellen", description: "" },
            { name: "Mondmilch-Trunk", description: "" }
        ]
    },
    {
        section: "Besondere Häppchen",
        time: 4125, // 1:08:45
        items: [
            { name: "Goldener Schnatz – Snack", description: "" }
        ]
    },
    {
        section: "Kleine Zauberhappen",
        time: 4290, // 1:11:30
        items: [
            { name: "Kürbiskuchen", description: "2tes Halloween Festmahl" }
        ]
    }
];

// Timeline rendern
function renderTimeline() {
    timelineContainer.innerHTML = '';
    timeline.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.id = `timeline-item-${index}`;
        
        const timeStr = formatTime(item.time);
        
        // Berechne Vorbereitungszeit (Zeit bis zum nächsten Schritt)
        let prepTime = null;
        if (index < timeline.length - 1) {
            prepTime = timeline[index + 1].time - item.time;
        }
        
        div.innerHTML = `
            <div class="timeline-time">${timeStr}</div>
            <div class="timeline-description">${item.description}</div>
        `;
        
        timelineContainer.appendChild(div);
        
        // Füge Vorbereitungszeit zwischen den Einträgen hinzu
        if (prepTime !== null) {
            const prepDiv = document.createElement('div');
            prepDiv.className = 'prep-time';
            prepDiv.innerHTML = `
                <div class="prep-time-label">⏱ Vorbereitungszeit:</div>
                <div class="prep-time-value">${formatTime(prepTime)}</div>
            `;
            timelineContainer.appendChild(prepDiv);
        }
    });
}

// Zeit formatieren (Sekunden zu MM:SS oder HH:MM:SS)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

// Aktuellen und nächsten Schritt finden
function getCurrentAndNextStep(currentSeconds) {
    let currentIndex = -1;
    let nextIndex = -1;
    
    // Finde den aktuellen Schritt (der bereits erreicht wurde)
    for (let i = timeline.length - 1; i >= 0; i--) {
        if (currentSeconds >= timeline[i].time) {
            currentIndex = i;
            break;
        }
    }
    
    // Finde den nächsten Schritt
    for (let i = 0; i < timeline.length; i++) {
        if (currentSeconds < timeline[i].time) {
            nextIndex = i;
            break;
        }
    }
    
    return { currentIndex, nextIndex };
}

// Timeline aktualisieren
function updateTimeline(currentSeconds) {
    const { currentIndex, nextIndex } = getCurrentAndNextStep(currentSeconds);
    
    // Alle Items zurücksetzen
    timeline.forEach((item, index) => {
        const element = document.getElementById(`timeline-item-${index}`);
        element.className = 'timeline-item';
        
        if (index < currentIndex) {
            element.classList.add('completed');
        } else if (index === currentIndex) {
            element.classList.add('active');
        } else if (index === nextIndex) {
            element.classList.add('next');
        }
    });
    
    // Aktuellen Schritt anzeigen
    if (currentIndex >= 0) {
        const current = timeline[currentIndex];
        currentStepInfo.textContent = `${formatTime(current.time)} - ${current.description}`;
    } else {
        currentStepInfo.textContent = "Noch kein Schritt erreicht";
    }
    
    // Nächsten Schritt anzeigen
    if (nextIndex >= 0) {
        const next = timeline[nextIndex];
        const timeUntilNext = next.time - currentSeconds;
        nextStepInfo.textContent = `${formatTime(next.time)} - ${next.description} (in ${formatTime(timeUntilNext)})`;
    } else {
        nextStepInfo.textContent = "Alle Schritte abgeschlossen! 🎉";
    }
}

// Timer aktualisieren
function updateTimer() {
    if (!isRunning) return;
    
    const now = Date.now();
    elapsedTime = Math.floor((now - startTime) / 1000);
    
    const { currentIndex, nextIndex } = getCurrentAndNextStep(elapsedTime);
    
    // Haupttimer zeigt Zeit bis zum nächsten Schritt
    if (nextIndex >= 0) {
        const nextTime = timeline[nextIndex].time;
        const timeUntilNext = nextTime - elapsedTime;
        mainTimer.textContent = formatTime(timeUntilNext);
        timerLabel.textContent = `Zeit bis: ${timeline[nextIndex].description}`;
        
        // Warnung wenn weniger als 1 Minute
        if (timeUntilNext <= 60) {
            mainTimer.style.color = '#ff6b6b';
            mainTimer.style.textShadow = '0 0 20px rgba(255, 107, 107, 0.8)';
        } else {
            mainTimer.style.color = '#ffd700';
            mainTimer.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
        }
    } else {
        mainTimer.textContent = "00:00:00";
        timerLabel.textContent = "Alle Schritte abgeschlossen! 🎉";
        mainTimer.style.color = '#4caf50';
        mainTimer.style.textShadow = '0 0 20px rgba(76, 175, 80, 0.5)';
    }
    
    updateTimeline(elapsedTime);
    updateProgress(elapsedTime);
    updateMenu(elapsedTime);
    
    // Sync alle 5 Sekunden während der Timer läuft (um Firebase-Limits nicht zu überschreiten)
    if (Math.floor(elapsedTime) % 5 === 0 && Math.floor(elapsedTime) > 0) {
        syncTimerState();
    }
    
    animationFrameId = requestAnimationFrame(updateTimer);
}

// Firebase Sync Funktionen
function initFirebaseSync() {
    // Warte bis Firebase geladen ist
    const checkFirebase = setInterval(() => {
        if (window.firebaseDatabase && window.firebaseRef && window.firebaseSet && window.firebaseOnValue) {
            clearInterval(checkFirebase);
            setupFirebaseSync();
        }
    }, 100);
}

function setupFirebaseSync() {
    if (!window.firebaseDatabase) {
        console.warn('Firebase nicht verfügbar. Timer läuft nur lokal.');
        return;
    }
    
    const database = window.firebaseDatabase;
    const ref = window.firebaseRef;
    const set = window.firebaseSet;
    const onValue = window.firebaseOnValue;
    
    syncRef = ref(database, 'timer/state');
    
    // Lausche auf Änderungen von anderen Geräten
    onValue(syncRef, (snapshot) => {
        if (isSyncing) return; // Verhindere Endlosschleife
        
        const data = snapshot.val();
        if (!data) return;
        
        isSyncing = true;
        
        // Synchronisiere Timer-Status
        if (data.isRunning !== isRunning) {
            isRunning = data.isRunning;
            startBtn.disabled = isRunning;
            pauseBtn.disabled = !isRunning;
        }
        
        if (data.startTime !== null) {
            // Berechne elapsedTime basierend auf startTime
            const now = Date.now();
            const remoteElapsed = Math.floor((now - data.startTime) / 1000);
            
            if (Math.abs(remoteElapsed - elapsedTime) > 2) { // Nur sync wenn Unterschied > 2 Sekunden
                startTime = data.startTime;
                elapsedTime = remoteElapsed;
            }
        } else if (data.elapsedTime !== undefined) {
            elapsedTime = data.elapsedTime;
            startTime = null;
        }
        
        // Starte/Stoppe Timer basierend auf Remote-Status
        if (isRunning && !animationFrameId) {
            if (startTime === null) {
                startTime = Date.now() - (elapsedTime * 1000);
            }
            updateTimer();
        } else if (!isRunning && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Aktualisiere UI
        updateTimeline(elapsedTime);
        updateProgress(elapsedTime);
        updateMenu(elapsedTime);
        
        setTimeout(() => { isSyncing = false; }, 100);
    });
}

function syncTimerState() {
    if (!syncRef || !window.firebaseSet || isSyncing) return;
    
    isSyncing = true;
    
    const state = {
        isRunning: isRunning,
        startTime: startTime,
        elapsedTime: elapsedTime,
        timestamp: Date.now()
    };
    
    window.firebaseSet(syncRef, state).then(() => {
        setTimeout(() => { isSyncing = false; }, 100);
    }).catch((error) => {
        console.error('Sync-Fehler:', error);
        isSyncing = false;
    });
}

// Start
function startTimer() {
    if (!isRunning) {
        if (startTime === null) {
            startTime = Date.now() - (elapsedTime * 1000);
        } else {
            startTime = Date.now() - (elapsedTime * 1000);
        }
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        syncTimerState(); // Sync zu Firebase
        updateTimer();
    }
}

// Pause
function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        syncTimerState(); // Sync zu Firebase
    }
}

// Zurücksetzen
function resetTimer() {
    isRunning = false;
    startTime = null;
    elapsedTime = 0;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    mainTimer.textContent = "00:00:00";
    timerLabel.textContent = "Bereit zum Start";
    mainTimer.style.color = '#ffd700';
    mainTimer.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
    
    currentStepInfo.textContent = "-";
    nextStepInfo.textContent = timeline.length > 0 ? `${formatTime(timeline[0].time)} - ${timeline[0].description}` : "-";
    
    // Timeline zurücksetzen
    timeline.forEach((item, index) => {
        const element = document.getElementById(`timeline-item-${index}`);
        element.className = 'timeline-item';
        if (index === 0) {
            element.classList.add('next');
        }
    });
    
    // Fortschritt zurücksetzen
    updateProgress(0);
    updateMenu(0);
    
    syncTimerState(); // Sync zu Firebase
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Fortschrittsbalken aktualisieren
function updateProgress(currentSeconds) {
    const percentage = Math.min((currentSeconds / TOTAL_FILM_TIME) * 100, 100);
    progressFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${Math.round(percentage)}%`;
    progressTime.textContent = `${formatTime(currentSeconds)} / ${formatTime(TOTAL_FILM_TIME)}`;
    
    // Kommende Szenen anzeigen (nächste 3-4 Schritte)
    upcomingScenesList.innerHTML = '';
    const upcoming = timeline.filter(item => item.time > currentSeconds).slice(0, 4);
    
    if (upcoming.length === 0) {
        upcomingScenesList.innerHTML = '<div class="upcoming-scene-item">Alle Szenen abgeschlossen! 🎉</div>';
    } else {
        upcoming.forEach(item => {
            const timeUntil = item.time - currentSeconds;
            const div = document.createElement('div');
            div.className = 'upcoming-scene-item';
            div.innerHTML = `<span class="scene-time">${formatTime(item.time)}</span>${item.description} <span style="color: #4caf50;">(in ${formatTime(timeUntil)})</span>`;
            upcomingScenesList.appendChild(div);
        });
    }
}

// Progress-Marker rendern
function renderProgressMarkers() {
    progressMarkers.innerHTML = '';
    timeline.forEach(item => {
        const percentage = (item.time / TOTAL_FILM_TIME) * 100;
        const marker = document.createElement('div');
        marker.className = 'progress-marker';
        marker.style.left = `${percentage}%`;
        
        const label = document.createElement('div');
        label.className = 'progress-marker-label';
        label.textContent = formatTime(item.time);
        marker.appendChild(label);
        
        progressMarkers.appendChild(marker);
    });
}

// Menü rendern
function renderMenu() {
    menuContainer.innerHTML = '';
    
    // Gruppiere Menüpunkte nach Sektionen
    const sections = {};
    menuData.forEach(menuItem => {
        if (!sections[menuItem.section]) {
            sections[menuItem.section] = [];
        }
        sections[menuItem.section].push(menuItem);
    });
    
    // Rendere jede Sektion
    Object.keys(sections).forEach(sectionName => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'menu-section';
        
        const title = document.createElement('h2');
        title.className = 'menu-section-title';
        title.textContent = sectionName;
        sectionDiv.appendChild(title);
        
        sections[sectionName].forEach(menuItem => {
            menuItem.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'menu-item';
                itemDiv.dataset.time = menuItem.time;
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'menu-item-name';
                nameDiv.textContent = item.name;
                itemDiv.appendChild(nameDiv);
                
                if (item.description) {
                    const descDiv = document.createElement('div');
                    descDiv.className = 'menu-item-description';
                    descDiv.textContent = item.description;
                    itemDiv.appendChild(descDiv);
                }
                
                sectionDiv.appendChild(itemDiv);
            });
        });
        
        menuContainer.appendChild(sectionDiv);
    });
}

// Menü aktualisieren basierend auf aktueller Zeit
function updateMenu(currentSeconds) {
    const menuItems = menuContainer.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const itemTime = parseInt(item.dataset.time);
        const timeWindow = 300; // 5 Minuten Zeitfenster, in dem das Gericht aktiv ist
        
        // Entferne aktive Klasse von allen Items
        item.classList.remove('active');
        
        // Setze aktiv, wenn wir im Zeitfenster sind
        if (currentSeconds >= itemTime && currentSeconds < itemTime + timeWindow) {
            item.classList.add('active');
        }
    });
}

// Tab-Switching
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Entferne active von allen
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Setze active auf geklicktes Tab
            button.classList.add('active');
            document.getElementById(`${targetTab}Tab`).classList.add('active');
        });
    });
}

// Initialisierung
renderTimeline();
renderProgressMarkers();
renderMenu();
initTabs();
initFirebaseSync(); // Firebase Sync initialisieren
resetTimer();

