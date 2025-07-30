function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = ("0" + (date.getMonth() + 1)).slice(-2);
  const d = ("0" + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

let current = new Date();

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const year = current.getFullYear();
  const month = current.getMonth();
  const logs = JSON.parse(localStorage.getItem("logs") || "{}");
  const goals = JSON.parse(localStorage.getItem("goals") || "{}");
  const setCount = parseInt(localStorage.getItem("setCount")) || 25;

  document.getElementById("month-label").textContent = `${year}年${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  for (const day of weekdays) {
    const cell = document.createElement("div");
    cell.className = "day muted";
    cell.textContent = day;
    calendar.appendChild(cell);
  }

  for (let i = 0; i < startDay; i++) {
    const cell = document.createElement("div");
    cell.className = "day muted";
    calendar.appendChild(cell);
  }

  const valuesByDate = {};
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    const key = getLocalDateString(date);
    if (Array.isArray(logs[key])) {
      const total = logs[key].reduce((sum, val) => sum + (typeof val === 'number' ? val : val.count || 0), 0);
      valuesByDate[key] = total;
    }
  }

  const allValues = Object.values(valuesByDate);
  const sum = allValues.reduce((a, b) => a + b, 0);
  const average = allValues.length > 0 ? Math.floor(sum / allValues.length) : 0;
  const max = allValues.length > 0 ? Math.max(...allValues) : 0;
  const min = allValues.length > 0 ? Math.min(...allValues) : 0;
  document.getElementById("average-label").textContent = `平均：${average}回／日`;

  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement("div");
    const dateObj = new Date(year, month, d);
    dateObj.setHours(0, 0, 0, 0);
    const dateStr = getLocalDateString(dateObj);

    const count = Array.isArray(logs[dateStr]) ? logs[dateStr].reduce((sum, val) => sum + (typeof val === 'number' ? val : val.count || 0), 0) : 0;
    const goal = goals[dateStr] ? parseInt(goals[dateStr]) : null;

    cell.className = "day";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj.getTime() === today.getTime()) cell.classList.add("today");

    if (count > 0) {
      if (count === max) cell.classList.add("max-value");
      else if (count === min) cell.classList.add("min-value");
    }

    let icon = "";
    const entries = Array.isArray(logs[dateStr]) ? logs[dateStr] : [];
    const sets = entries.length;
    if (goal !== null && sets > 0) {
      if (sets >= goal) {
        cell.classList.add("goal-success");
        icon = '<span class="goal-icon">👑</span>';
      } else {
        cell.classList.add("goal-failed");
      }
    }

    cell.innerHTML = `<strong>${d}</strong><br>${count > 0 ? count + "回" : "-"}${icon}`;
    calendar.appendChild(cell);

    cell.addEventListener("click", () => {
      if (!logs[dateStr]) return;
      const modal = document.getElementById("log-modal");
      const label = document.getElementById("modal-date-label");
      const content = document.getElementById("modal-log-content");
      const entries = logs[dateStr];
      const sets = entries.length;
      const total = entries.reduce((sum, val) => sum + (typeof val === 'number' ? val : val.count || 0), 0);
      const goal = goals[dateStr] ? parseInt(goals[dateStr]) : null;
      const percent = goal ? Math.floor((sets / goal) * 100) : "-";

      const times = entries.map(e => {
        if (typeof e === "object" && e.timestamp && e.timestamp.includes("T")) {
          return e.timestamp.split("T")[1].slice(0, 5);
        } else if (typeof e === "object" && e.timestamp) {
          return e.timestamp.slice(11, 16);
        } else {
          return null;
        }
      }).filter(Boolean);

      const hours = times.map(t => parseInt(t.split(":")[0], 10));
      const timeBuckets = { "早朝": 0, "朝": 0, "昼": 0, "夕方": 0, "夜": 0, "深夜": 0 };
      hours.forEach(h => {
        if (h >= 5 && h < 8) timeBuckets["早朝"]++;
        else if (h >= 8 && h < 12) timeBuckets["朝"]++;
        else if (h >= 12 && h < 16) timeBuckets["昼"]++;
        else if (h >= 16 && h < 19) timeBuckets["夕方"]++;
        else if (h >= 19 && h < 24) timeBuckets["夜"]++;
        else timeBuckets["深夜"]++;
      });

      console.log(`[DEBUG] 日付: ${dateStr}`);
      console.log(`[DEBUG] セット数: ${sets}`);
      console.log(`[DEBUG] 合計回数: ${total}`);
      console.log(`[DEBUG] 実施時刻:`, times);
      console.log(`[DEBUG] 時間帯集計:`, timeBuckets);

      const timeDistText = Object.entries(timeBuckets)
        .filter(([_, v]) => v > 0)
        .map(([k, v]) => `${k}: ${v}回`)
        .join("<br>");
      const timeDistHTML = timeDistText ? `<li>時間帯別:<br>${timeDistText}</li>` : "";

      label.textContent = `${dateStr} の詳細`;
      content.innerHTML = `
        <ul>
          <li>合計呼吸回数: ${total}回</li>
          <li>セット数: ${sets}</li>
          <li>目標達成率: ${percent}%</li>

          ${timeDistHTML}
        </ul>`;
      modal.showModal();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prev-month").addEventListener("click", () => {
    current.setMonth(current.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    current.setMonth(current.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
});

function resetBackground() {
  localStorage.removeItem("calendarBackground");
  sessionStorage.removeItem("calendarBackground");
  document.body.style.setProperty("background-image", "none", "important");
}
