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

// Gesamtzeit des Films in Sekunden (2:24:30 = 8670 Sekunden)
const TOTAL_FILM_TIME = 8670;

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
    
    animationFrameId = requestAnimationFrame(updateTimer);
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
        }
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

// Initialisierung
renderTimeline();
renderProgressMarkers();
resetTimer();

