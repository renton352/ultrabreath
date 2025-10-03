(function () {
  // ===== Utilities =====
  function getLocalDateString(date) {
    const d = date || new Date();
    const y = d.getFullYear();
    const m = ("0" + (d.getMonth() + 1)).slice(-2);
    const dd = ("0" + d.getDate()).slice(-2);
    return `${y}-${m}-${dd}`;
  }

  function getLogs() {
    try {
      return JSON.parse(localStorage.getItem("logs") || "{}");
    } catch (e) {
      return {};
    }
  }

  // 1呼吸あたりの秒数（未設定なら4秒）
  function getSecondsPerBreath() {
    const v = parseInt(localStorage.getItem("secondsPerBreath"));
    if (!isNaN(v) && v > 0 && v < 60) return v;
    return 4;
  }

  // 合計値など（数値化＆不正値除去でNaN防止）
  function computeStats(rawLogs) {
    const logs = rawLogs || {};
    let totalBreaths = 0;
    let totalSessions = 0;

    Object.values(logs).forEach(arr => {
      if (Array.isArray(arr)) {
        const nums = arr
          .map(v => Number(v))
          .filter(n => Number.isFinite(n) && n >= 0);
        totalSessions += nums.length;
        totalBreaths += nums.reduce((a, b) => a + b, 0);
      }
    });

    // ストリーク（今日から遡って連続日数）
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = getLocalDateString(d);
      const arr = logs[k];
      const nums = Array.isArray(arr)
        ? arr.map(v => Number(v)).filter(n => Number.isFinite(n) && n > 0)
        : [];
      if (nums.length > 0) streak++; else break;
    }

    const secondsPerBreath = getSecondsPerBreath();
    const totalMinutes = Math.round((totalBreaths * secondsPerBreath) / 60);

    return { totalBreaths, totalSessions, streak, totalMinutes };
  }

  // ===== Calendar rendering =====
  let current = new Date();
  let mode = localStorage.getItem("calendarViewMode") || "detail"; // "simple" | "detail"

  function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year = current.getFullYear();
    const month = current.getMonth();
    const logs = getLogs();

    // 月ラベル
    document.getElementById("month-label").textContent = `${year}年${month + 1}月`;

    // 上部カード数値
    const stats = computeStats(logs);
    const streakEl = document.getElementById("streak-card");
    const minEl = document.getElementById("total-minutes-card");
    const sessEl = document.getElementById("total-sessions-card");
    if (streakEl) streakEl.textContent = `${stats.streak} 日`;
    if (minEl) minEl.textContent = `${stats.totalMinutes} 分`;
    if (sessEl) sessEl.textContent = `${stats.totalSessions} 回`;

    // カレンダー準備
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    // 曜日ヘッダ
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    for (const w of weekdays) {
      const cell = document.createElement("div");
      cell.className = "day muted";
      cell.textContent = w;
      calendar.appendChild(cell);
    }

    // 先行空白
    for (let i = 0; i < startDay; i++) {
      const cell = document.createElement("div");
      cell.className = "day muted";
      calendar.appendChild(cell);
    }

    // 各日の合計（数値化＆不正値除去）
    const valuesByDate = {};
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const key = getLocalDateString(date);
      const arr = logs[key];
      const nums = Array.isArray(arr)
        ? arr.map(v => Number(v)).filter(n => Number.isFinite(n) && n >= 0)
        : [];
      const total = nums.reduce((s, v) => s + v, 0);
      valuesByDate[key] = total;
    }

    const allValues = Object.values(valuesByDate);
    const max = allValues.length ? Math.max(...allValues) : 0;
    const min = allValues.length ? Math.min(...allValues) : 0;
    const sum = allValues.reduce((a, b) => a + b, 0);
    const average = allValues.length ? Math.floor(sum / allValues.length) : 0;
    const avgEl = document.getElementById("average-label");
    if (avgEl) avgEl.textContent = `平均：${average}回／日`;

    // 当日
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 日セル
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      dateObj.setHours(0, 0, 0, 0);
      const dateStr = getLocalDateString(dateObj);
      const count = valuesByDate[dateStr] || 0;

      const cell = document.createElement("div");
      cell.className = "day";
      if (dateObj.getTime() === today.getTime()) cell.classList.add("today");

      if (mode === "detail") {
        if (count > 0) {
          if (count === max) cell.classList.add("max-value");
          else if (count === min) cell.classList.add("min-value");
        }
        cell.innerHTML = `<strong>${d}</strong><br>${count > 0 ? count + "回" : "-"}`;
      } else {
        const dot = count > 0 ? '<span class="dot"></span>' : '&nbsp;';
        cell.innerHTML = `<strong>${d}</strong><br>${dot}`;
      }

      calendar.appendChild(cell);
    }
  }

  // ===== Init & Events =====
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("prev-month").addEventListener("click", () => {
      current.setMonth(current.getMonth() - 1);
      renderCalendar();
    });
    document.getElementById("next-month").addEventListener("click", () => {
      current.setMonth(current.getMonth() + 1);
      renderCalendar();
    });

    // モード切替（保持）
    const radios = document.querySelectorAll('input[name="mode"]');
    radios.forEach(r => {
      r.checked = (r.value === mode);
      r.addEventListener("change", (e) => {
        mode = e.target.value;
        localStorage.setItem("calendarViewMode", mode);
        renderCalendar();
      });
    });

    // ボタン
    document.getElementById("reset-bg").addEventListener("click", () => {
      localStorage.removeItem("calendarBackground");
      sessionStorage.removeItem("calendarBackground");
      document.body.style.setProperty("background-image", "none", "important");
    });
    document.getElementById("back-btn").addEventListener("click", () => {
      location.href = "index.html";
    });

    renderCalendar();
  });
})();
