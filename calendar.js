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

  // 配列の合計を安全に計算
  function safeSum(arr) {
    return (Array.isArray(arr) ? arr : [])
      .map(v => Number(v))
      .filter(n => Number.isFinite(n) && n >= 0)
      .reduce((a, b) => a + b, 0);
  }

  // 1呼吸あたりの秒数（未設定なら4秒）
  function getSecondsPerBreath() {
    const v = Number(localStorage.getItem("secondsPerBreath"));
    return Number.isFinite(v) && v > 0 && v < 60 ? v : 4;
  }

  // 基本統計
  function computeStats(logs) {
    let totalBreaths = 0;
    let totalSessions = 0;
    Object.values(logs).forEach(arr => {
      if (Array.isArray(arr)) {
        const nums = arr.map(v => Number(v)).filter(n => Number.isFinite(n) && n >= 0);
        totalSessions += nums.length;
        totalBreaths += nums.reduce((a, b) => a + b, 0);
      }
    });
    // 継続記録（今日から遡って連続）
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = getLocalDateString(d);
      const arr = logs[key];
      const nums = Array.isArray(arr) ? arr.map(Number).filter(n => n > 0) : [];
      if (nums.length > 0) streak++; else break;
    }
    const secondsPerBreath = getSecondsPerBreath();
    const totalMinutes = Math.round((totalBreaths * secondsPerBreath) / 60);
    return { totalBreaths, totalSessions, streak, totalMinutes };
  }

  // 最長継続日数
  function computeLongestStreak(logs) {
    const days = Object.keys(logs).sort();
    const has = d => Array.isArray(logs[d]) && logs[d].some(v => Number(v) > 0);
    let longest = 0, current = 0, prev = null;
    for (const d of days) {
      if (!has(d)) continue;
      if (!prev) { current = 1; prev = d; longest = 1; continue; }
      const p = new Date(prev), c = new Date(d);
      p.setDate(p.getDate() + 1);
      if (p.toDateString() === c.toDateString()) {
        current += 1;
      } else {
        current = 1;
      }
      prev = d;
      longest = Math.max(longest, current);
    }
    return longest;
  }

  // 平均呼吸/セッション
  function computeAvgPerSession(logs) {
    let breaths = 0, sessions = 0;
    Object.values(logs).forEach(arr => {
      if (!Array.isArray(arr)) return;
      const nums = arr.map(Number).filter(n => Number.isFinite(n) && n >= 0);
      breaths += nums.reduce((a, b) => a + b, 0);
      sessions += nums.length;
    });
    return sessions ? Math.round(breaths / sessions) : 0;
  }

  // ===== Calendar rendering =====
  let current = new Date();
  let mode = localStorage.getItem("calendarViewMode") || "detail";

  function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year = current.getFullYear();
    const month = current.getMonth();
    const logs = getLogs();

    // 月ラベル
    document.getElementById("month-label").textContent = `${year}年${month + 1}月`;

    // 統計
    const stats = computeStats(logs);
    const longest = computeLongestStreak(logs);
    const avgPerSession = computeAvgPerSession(logs);

    document.getElementById("streak-card").textContent = `${stats.streak} 日`;
    document.getElementById("total-minutes-card").textContent = `${stats.totalMinutes} 分`;
    document.getElementById("total-sessions-card").textContent = `${stats.totalSessions} 回`;
    const longestEl = document.getElementById("longest-streak-card");
    if (longestEl) longestEl.textContent = `${longest} 日`;

    const avgEl = document.getElementById("average-label");
    if (avgEl) avgEl.textContent = `平均：${avgPerSession}回／セッション`;

    // カレンダー描画
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const weekdays = ["日","月","火","水","木","金","土"];
    for (const w of weekdays) {
      const cell = document.createElement("div");
      cell.className = "day muted";
      cell.textContent = w;
      calendar.appendChild(cell);
    }
    for (let i=0;i<startDay;i++) {
      const cell=document.createElement("div");
      cell.className="day muted";
      calendar.appendChild(cell);
    }

    const valuesByDate = {};
    for (let d=1; d<=totalDays; d++) {
      const date=new Date(year,month,d);
      date.setHours(0,0,0,0);
      const key=getLocalDateString(date);
      valuesByDate[key] = safeSum(getLogs()[key]);
    }

    const allValues = Object.values(valuesByDate);
    const max = allValues.length ? Math.max(...allValues) : 0;
    const min = allValues.length ? Math.min(...allValues) : 0;

    const today=new Date(); today.setHours(0,0,0,0);

    for (let d=1; d<=totalDays; d++) {
      const dateObj=new Date(year,month,d);
      dateObj.setHours(0,0,0,0);
      const dateStr=getLocalDateString(dateObj);
      const count = valuesByDate[dateStr] || 0;

      const cell=document.createElement("div");
      cell.className="day";
      if (dateObj.getTime()===today.getTime()) cell.classList.add("today");

      if (mode==="detail") {
        if (count>0) {
          if (count===max) cell.classList.add("max-value");
          else if (count===min) cell.classList.add("min-value");
        }
        cell.innerHTML=`<strong>${d}</strong><br>${count>0?count+"回":"-"}`;
      } else {
        const dot = count>0 ? '<span class="dot"></span>' : '&nbsp;';
        cell.innerHTML=`<strong>${d}</strong><br>${dot}`;
      }

      calendar.appendChild(cell);
    }
  }

  // ===== Init & Events =====
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("prev-month").addEventListener("click", () => {
      current.setMonth(current.getMonth()-1);
      renderCalendar();
    });
    document.getElementById("next-month").addEventListener("click", () => {
      current.setMonth(current.getMonth()+1);
      renderCalendar();
    });

    const radios=document.querySelectorAll('input[name="mode"]');
    radios.forEach(r=>{
      r.checked=(r.value===mode);
      r.addEventListener("change", e=>{
        mode=e.target.value;
        localStorage.setItem("calendarViewMode",mode);
        renderCalendar();
      });
    });

    document.getElementById("reset-bg").addEventListener("click",()=>{
      localStorage.removeItem("calendarBackground");
      sessionStorage.removeItem("calendarBackground");
      document.body.style.setProperty("background-image","none","important");
    });
    document.getElementById("back-btn").addEventListener("click",()=>{
      location.href="index.html";
    });

    if (!localStorage.getItem("secondsPerBreath")) {
      localStorage.setItem("secondsPerBreath","4");
    }

    renderCalendar();
  });
})();
