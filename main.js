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

function toggleSettingsButton(show) {
  const btn = document.getElementById("settings-button");
  if (btn) {
    btn.style.display = show ? "block" : "none";
  }
}

function startTraining(genre) {
  toggleSettingsButton(false);
  setCount = parseInt(localStorage.getItem("setCount")) || 25;
  setGoal = parseInt(localStorage.getItem("setGoal")) || 2;
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
  const goals = JSON.parse(localStorage.getItem("goals") || "{}");
  const today = getLocalDateString();
  const logs = JSON.parse(localStorage.getItem("logs") || "{}");
  if (!Array.isArray(logs[today])) {
    logs[today] = [];
  }
  logs[today].push(setCount);
  localStorage.setItem("logs", JSON.stringify(logs));
  goals[today] = setGoal;
  localStorage.setItem("goals", JSON.stringify(goals));
  console.log("[DEBUG] nickname:", localStorage.getItem("nickname"));
  console.log("[DEBUG] setCount:", localStorage.getItem("setCount"));
  console.log("[DEBUG] setGoal:", localStorage.getItem("setGoal"));
  console.log("[DEBUG] logs:", logs);
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
  console.log("[DEBUG] updateNicknameDisplay nickname:", localStorage.getItem("nickname"));
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

// ===== データ管理モーダル用バックアップ＆復元機能 =====

document.addEventListener("DOMContentLoaded", function() {
  // 設定モーダル開閉（既存）
  document.getElementById("settings-button").onclick = function() {
    document.getElementById("settings-modal").style.display = "block";
    document.getElementById("nickname-input").value = localStorage.getItem("nickname") || "";
    document.getElementById("set-count-input").value = localStorage.getItem("setCount") || 25;
    document.getElementById("set-goal-input").value = localStorage.getItem("setGoal") || 2;
  };

  document.getElementById("close-settings").onclick = function() {
    document.getElementById("settings-modal").style.display = "none";
  };

  document.getElementById("save-settings").onclick = function() {
    const nickname = document.getElementById("nickname-input").value;
    const setCountValue = parseInt(document.getElementById("set-count-input").value);
    const setGoalValue = parseInt(document.getElementById("set-goal-input").value);
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("setCount", setCountValue);
    localStorage.setItem("setGoal", setGoalValue);

    const bgInput = document.getElementById("calendar-bg-input");
    const file = bgInput.files[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = function (event) {
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const maxSize = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL("image/jpeg", 0.8);
          localStorage.setItem("calendarBackground", compressed);
          sessionStorage.setItem("calendarBackground", compressed);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    alert("設定を保存しました");
    document.getElementById("settings-modal").style.display = "none";
  };

  // データ管理モーダル開閉
  document.getElementById('open-backup-modal').onclick = function() {
    document.getElementById('backup-modal').style.display = 'block';
  };
  document.getElementById('close-backup-modal').onclick = function() {
    document.getElementById('backup-modal').style.display = 'none';
  };

  // バックアップ処理
  document.getElementById('show-backup-text').onclick = function() {
    const keys = ['logs', 'goals', 'memos', 'nickname', 'setCount', 'setGoal'];
    const backup = {};
    keys.forEach(key => backup[key] = localStorage.getItem(key));
    document.getElementById('backup-textarea').value = JSON.stringify(backup, null, 2);
  };
  document.getElementById('copy-backup-btn').onclick = function() {
    const textarea = document.getElementById('backup-textarea');
    textarea.select();
    document.execCommand('copy');
    alert('クリップボードにコピーしました！\nメモ帳などに貼り付けて保存してください。');
  };

  // 復元処理
  document.getElementById('import-restore-btn').onclick = function() {
    const text = document.getElementById('restore-textarea').value;
    try {
      const backup = JSON.parse(text);
      if (!window.confirm('現在のデータを上書きします。\n本当に復元してもよいですか？')) return;
      Object.keys(backup).forEach(key => {
        if (backup[key] !== undefined && backup[key] !== null) {
          localStorage.setItem(key, backup[key]);
        }
      });
      document.getElementById('restore-msg').textContent = 'データを復元しました！（再読み込み推奨）';
      setTimeout(() => { document.getElementById('restore-msg').textContent = ''; }, 3000);
    } catch(e) {
      document.getElementById('restore-msg').textContent = '復元失敗：内容をご確認ください。';
      setTimeout(() => { document.getElementById('restore-msg').textContent = ''; }, 3000);
    }
  };
});
