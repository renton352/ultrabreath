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

    if (speechMap[count]) {
        document.getElementById("speech").textContent = speechMap[count];
    }

    if (count === 10) {
        saveLog();
        updateStats();
        document.getElementById("retry-button").style.display = "inline-block";
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

    updateBreathChart(logs); // ← グラフ更新もここで行う
}

// ← 戻るボタン処理
document.getElementById("back-button").addEventListener("click", () => {
    document.getElementById("training-screen").style.display = "none";
    document.getElementById("genre-selection").style.display = "block";
    count = 0;
    document.getElementById("breath-count").textContent = count;
    document.getElementById("speech").textContent = "はじめましょうか、深呼吸ですよ。";
    document.getElementById("retry-button").style.display = "none";
});

// ← もう一度トレーニングボタン処理
document.getElementById("retry-button").addEventListener("click", () => {
    count = 0;
    document.getElementById("breath-count").textContent = count;
    document.getElementById("speech").textContent = "はじめましょうか、深呼吸ですよ。";
    document.getElementById("retry-button").style.display = "none";
});

// ← グラフ描画
let breathChart;

function updateBreathChart(logs) {
    const labels = Object.keys(logs).sort();
    const data = labels.map(date => logs[date]);

    const ctx = document.getElementById("breathChart").getContext("2d");

    if (breathChart) {
        breathChart.destroy();
    }

    breathChart = new Chart(ctx, {
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
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });
}
