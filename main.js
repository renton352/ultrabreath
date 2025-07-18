
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
}
