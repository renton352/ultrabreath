
let count = 0;
let genre = "";
const speechMap = {
    1: "いい呼吸ですねぇ、続けましょう",
    2: "焦らず、ゆっくりどうぞ",
    4: "その調子、その調子",
    6: "いいですね、肺がよろこんでますよ",
    8: "あと少しで終わりですよ、がんばって",
    9: "もうひと息ですね",
    10: "お疲れさまでした！素晴らしい呼吸でしたよ"
};

function startTraining(selectedGenre) {
    genre = selectedGenre;
    document.getElementById("genre-selection").style.display = "none";
    document.getElementById("training-screen").style.display = "block";
    updateStats();
}

function countBreath() {
    if (count >= 10) return;

    count++;
    document.getElementById("breath-count").textContent = count;
    updateCharacterImage(count);

    if (speechMap[count]) {
        document.getElementById("speech").textContent = speechMap[count];
    }

    if (count === 10) {
        saveLog();
        updateStats();
        showRetryButton();
    }
}

function saveLog() {
    const today = new Date().toISOString().split('T')[0];
    const logs = JSON.parse(localStorage.getItem("ultrabreathLogs") || "{}");
    logs[today] = (logs[today] || 0) + 10;
    localStorage.setItem("ultrabreathLogs", JSON.stringify(logs));
    localStorage.setItem("lastDate", today);
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem("ultrabreathLogs") || "{}");
    const totalCount = Object.values(logs).reduce((sum, val) => sum + val, 0);
    const totalDays = Object.keys(logs).length;
    const lastDate = localStorage.getItem("lastDate") || "なし";

    document.getElementById("total-count").textContent = totalCount;
    document.getElementById("total-days").textContent = totalDays;
    document.getElementById("last-date").textContent = lastDate;

    calculateStreak(logs);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = logs[todayStr] || 0;
    document.getElementById("today-count").textContent = todayCount;
    updateBreathChart(logs);
}

document.getElementById("back-button").addEventListener("click", () => {
    document.getElementById("training-screen").style.display = "none";
    document.getElementById("genre-selection").style.display = "block";

    count = 0;
    document.getElementById("breath-count").textContent = count;
    document.getElementById("speech").textContent = "はじめましょうか、深呼吸ですよ。";
    document.getElementById("character-image").src = "img/normal.png";

    const retryBtn = document.getElementById("retry-button");
    if (retryBtn) retryBtn.remove();
});

function calculateStreak(logs) {
    const sortedDates = Object.keys(logs).sort().reverse();
    let streak = 0;
    let current = new Date();
    for (const dateStr of sortedDates) {
        const logDate = new Date(dateStr);
        const diffDays = Math.floor((current - logDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 0 || diffDays === 1) {
            streak++;
            current.setDate(current.getDate() - 1);
        } else {
            break;
        }
    }
    document.getElementById("streak-info").textContent = `今日で${streak}日連続です！`;
}

function getThisWeekData(logs) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0(日)～6(土)
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // 今週の月曜

    const labels = [];
    const data = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        labels.push(dateStr);
        data.push(logs[dateStr] || 0);
    }
    return { labels, data };
}

function updateCharacterImage(count) {
    let imagePath = "img/rehab_normal.png";
    if (count >= 3 && count <= 5) {
        imagePath = "img/rehab_focus.png";
    } else if (count >= 6 && count <= 9) {
        imagePath = "img/rehab_tired.png";
    } else if (count === 10) {
        imagePath = "img/rehab_smile.png";
    }
    document.getElementById("character-image").src = imagePath;
}

function updateBreathChart(logs) {
    const { labels, data } = getThisWeekData(logs);
    const ctx = document.getElementById("breathChart").getContext("2d");

    if (window.breathChart instanceof Chart) {
        window.breathChart.destroy();
    }

    window.breathChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '日別呼吸回数',
                data: data,
                borderColor: '#36a2eb',
                backgroundColor: 'rgba(54,162,235,0.2)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 10 }
                }
            }
        }
    });
}

function showRetryButton() {
    const btn = document.createElement("button");
    btn.id = "retry-button";
    btn.textContent = "もう一度やる";
    btn.onclick = () => {
        count = 0;
        document.getElementById("breath-count").textContent = count;
        document.getElementById("speech").textContent = "はじめましょうか、深呼吸ですよ。";
        document.getElementById("character-image").src = "img/normal.png";
        btn.remove();
    };
    document.getElementById("training-screen").appendChild(btn);
}
