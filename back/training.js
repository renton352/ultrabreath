function getLocalDateString(date = new Date()) {
  date.setHours(0, 0, 0, 0);
  const y = date.getFullYear();
  const m = ("0" + (date.getMonth() + 1)).slice(-2);
  const d = ("0" + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

let count = 0;
let setCount = 25;
let setGoal = 2;

function startTraining() {
  console.log("[DEBUG] training started");
  setCount = parseInt(localStorage.getItem("setCount")) || 25;
  setGoal = parseInt(localStorage.getItem("setGoal")) || 2;
  console.log("[DEBUG] setCount:", setCount, "setGoal:", setGoal);
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
  updateStats();
}

function countBreath() {
  console.log("[DEBUG] countBreath:", count + 1);
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
  console.log("[DEBUG] saveLog() called");
  const goals = JSON.parse(localStorage.getItem("goals") || "{}");
  const today = getLocalDateString();
  const logs = JSON.parse(localStorage.getItem("logs") || "{}");

  if (!Array.isArray(logs[today])) {
    logs[today] = [];
  }

  // 新しいエントリ：日本時間タイムスタンプ付き
  const jstTimestamp = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" }).replace(" ", "T");
  const entry = {
    count: setCount,
    timestamp: jstTimestamp
  };

  logs[today].push(entry);
  localStorage.setItem("logs", JSON.stringify(logs));
  console.log("[DEBUG] logs:", logs);

  goals[today] = setGoal;
  localStorage.setItem("goals", JSON.stringify(goals));
  console.log("[DEBUG] goals:", goals);
}

function updateStats() {
  const logs = JSON.parse(localStorage.getItem("logs") || "{}");
  const today = getLocalDateString();
  const todayLogsRaw = logs[today];
  const todayLogs = Array.isArray(todayLogsRaw) ? todayLogsRaw : [];
  const todayCount = todayLogs.reduce((sum, val) => sum + (typeof val === 'number' ? val : val.count || 0), 0);
  const todaySets = todayLogs.length;

  const todayCountEl = document.getElementById("today-count");
  if (todayCountEl) todayCountEl.textContent = todayCount;

  const todaySetEl = document.getElementById("today-set");
  if (todaySetEl) todaySetEl.textContent = todaySets;

  const lastDateEl = document.getElementById("last-date");
  if (lastDateEl) {
    const lastDate = Object.keys(logs).sort().reverse()[0] || "なし";
    lastDateEl.textContent = lastDate;
  }

  updateStreak(logs);
  updateGoalBar(todaySets);
}

function updateStreak(logs) {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(date);
    if (logs[dateStr] && Array.isArray(logs[dateStr]) && logs[dateStr].length > 0) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("streak-info").textContent = `今日で${streak}日連続です！`;
}

function updateNicknameDisplay() {
  const nickname = localStorage.getItem("nickname") || "";
  const el = document.getElementById("nickname-display");
  if (el && nickname) {
    el.textContent = nickname + " さん";
  }
}

function updateGoalBar(todaySets) {
  const percent = Math.min(100, Math.floor((todaySets / setGoal) * 100));
  const bar = document.getElementById("goal-bar");
  const label = document.getElementById("goal-percent");
  if (!bar || !label) return;
  bar.style.width = percent + "%";
  label.textContent = percent + "%";
  bar.style.background =
    percent >= 100
      ? "linear-gradient(to right, gold, orange)"
      : "linear-gradient(to right, #4caf50, #8bc34a)";
}