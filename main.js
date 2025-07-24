
function getLocalDateString() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const y = today.getFullYear();
  const m = ("0" + (today.getMonth() + 1)).slice(-2);
  const d = ("0" + today.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

let count = 0;
let setCount = 25;
let setGoal = 2;

function toggleSettingsButton(show) {
  const btn = document.getElementById("settings-button");
  if (btn) {
    btn.style.display = show ? "block" : "none";
  }
}

function startTraining(genre) {
  toggleSettingsButton(false);
  setCount = parseInt(localStorage.getItem("setCount")) || 25;
  document.getElementById("genre-selection").style.display = "none";
  document.getElementById("training-screen").style.display = "block";
  const logo = document.getElementById("logo-image");
  if (logo) logo.style.display = "none";
  const title = document.getElementById("top-title");
  if (title) title.style.display = "none";
  document.getElementById("speech").textContent = "はじめましょうか、深呼吸ですよ。";
  document.getElementById("character-image").src = "img/normal.png";
  count = 0;
  document.getElementById("breath-count").textContent = `${count} / ${setCount}`;
  document.getElementById("breathe-button").disabled = false;
  document.getElementById("retry-button").style.display = "none";
  updateNicknameDisplay();
}

function countBreath() {
  count++;
  document.getElementById("breath-count").textContent = `${count} / ${setCount}`;

  if (count === Math.floor(setCount / 2)) {
    document.getElementById("character-image").src = "img/encourage.png";
    document.getElementById("speech").textContent = "あと半分です、ゆっくりいきましょう。";
  }

  if (count === setCount) {
    document.getElementById("character-image").src = "img/happy.png";
    document.getElementById("speech").textContent = "お疲れさまでした！セット完了です！";
    document.getElementById("breathe-button").disabled = true;
    showRetryButton();
    saveLog();
    updateStats();
  const logo = document.getElementById("logo-image");
  if (logo && document.getElementById("training-screen").style.display !== "none") logo.style.display = "none";
  }
}

function showRetryButton() {
  const btn = document.getElementById("retry-button");
  if (btn) {
    btn.style.display = "inline-block";
  }
}

function resetTraining() {
  count = 0;
  document.getElementById("breath-count").textContent = `${count} / ${setCount}`;
  document.getElementById("speech").textContent = "はじめましょうか、深呼吸ですよ。";
  document.getElementById("character-image").src = "img/normal.png";
  document.getElementById("breathe-button").disabled = false;
  const retryBtn = document.getElementById("retry-button");
  if (retryBtn) retryBtn.style.display = "none";
}

function saveLog() {
  const today = getLocalDateString();
  const logs = JSON.parse(localStorage.getItem("logs") || "{}");
  if (!Array.isArray(logs[today])) {
    logs[today] = [];
  }
  logs[today].push(setCount);
  localStorage.setItem("logs", JSON.stringify(logs));
  localStorage.setItem("nickname", "〇〇") 
}

function updateStats() {
  const logs = JSON.parse(localStorage.getItem("logs") || "{}");
  const today = getLocalDateString();
  const todayLogsRaw = logs[today];
  const todayLogs = Array.isArray(todayLogsRaw) ? todayLogsRaw : [];
  const todayCount = todayLogs.reduce((sum, val) => sum + val, 0);
  const todaySets = todayLogs.length;

  const totalDays = Object.keys(logs).length;
  const lastDate = Object.keys(logs).sort().reverse()[0] || "なし";

  const todayCountEl = document.getElementById("today-count");
  if (todayCountEl) todayCountEl.textContent = todayCount;

  const todaySetEl = document.getElementById("today-set");
  if (todaySetEl) todaySetEl.textContent = todaySets;

  const totalCountEl = document.getElementById("total-count");
  if (totalCountEl) {
    let total = 0;
    Object.values(logs).forEach(value => {
      if (Array.isArray(value)) {
        total += value.reduce((sum, v) => sum + v, 0);
      }
    });
    totalCountEl.textContent = total;
  }

  const totalDaysEl = document.getElementById("total-days");
  if (totalDaysEl) totalDaysEl.textContent = totalDays;

  const lastDateEl = document.getElementById("last-date");
  if (lastDateEl) lastDateEl.textContent = lastDate;

  updateStreak(logs);
}

function updateStreak(logs) {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    if (logs[dateStr] && Array.isArray(logs[dateStr]) && logs[dateStr].length > 0) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("streak-info").textContent = `今日で${streak}日連続です！`;
}

document.getElementById("back-button").onclick = () => {
  toggleSettingsButton(true);
  document.getElementById("training-screen").style.display = "none";
  document.getElementById("genre-selection").style.display = "block";
  const logo = document.getElementById("logo-image");
  if (logo) logo.style.display = "block";
  const title = document.getElementById("top-title");
  if (title) title.style.display = "block";
};

document.addEventListener("DOMContentLoaded", () => {
  setCount = parseInt(localStorage.getItem("setCount")) || 25;
  setGoal = parseInt(localStorage.getItem("setGoal")) || 2;
  updateStats();
  const logo = document.getElementById("logo-image");
  if (logo && document.getElementById("training-screen").style.display !== "none") logo.style.display = "none";
});

function updateNicknameDisplay() {
  const nickname = localStorage.getItem("nickname") || "";
  const el = document.getElementById("nickname-display");
  if (el && nickname) {
    el.textContent = nickname + " さん";
  }
}
