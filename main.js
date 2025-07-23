let count = 0;
let setCount = 25;
let setGoal = 2;

function startTraining(genre) {
  document.getElementById("genre-selection").style.display = "none";
  document.getElementById("training-screen").style.display = "block";
  document.getElementById("speech").textContent = "はじめましょうか、深呼吸ですよ。";
  document.getElementById("character-image").src = "img/normal.png";
  count = 0;
  document.getElementById("breath-count").textContent = `${count} / ${setCount}`;
  document.getElementById("breathe-button").disabled = false;
  document.getElementById("retry-button").style.display = "none";
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
  const today = new Date().toISOString().slice(0, 10);
  const logs = JSON.parse(localStorage.getItem("logs") || "{}");
  logs[today] = (logs[today] || 0) + 1;
  localStorage.setItem("logs", JSON.stringify(logs));
}

function updateStats() {
  const logs = JSON.parse(localStorage.getItem("logs") || "{}");
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = logs[today] || 0;
  const totalDays = Object.keys(logs).length;
  const lastDate = Object.keys(logs).sort().reverse()[0] || "なし";

  document.getElementById("today-count").textContent = todayCount * setCount;
  document.getElementById("total-count").textContent = Object.values(logs).reduce((sum, val) => sum + val * setCount, 0);
  document.getElementById("total-days").textContent = totalDays;
  document.getElementById("last-date").textContent = lastDate;

  updateStreak(logs);
}

function updateStreak(logs) {
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    if (logs[dateStr]) {
      streak++;
    } else {
      break;
    }
  }

  document.getElementById("streak-info").textContent = `今日で${streak}日連続です！`;
}

document.getElementById("back-button").onclick = () => {
  document.getElementById("training-screen").style.display = "none";
  document.getElementById("genre-selection").style.display = "block";
};

document.addEventListener("DOMContentLoaded", () => {
  setCount = parseInt(localStorage.getItem("setCount")) || 25;
  setGoal = parseInt(localStorage.getItem("setGoal")) || 2;
  updateStats();
});
