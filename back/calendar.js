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
  let memos = {};
  try { memos = JSON.parse(localStorage.getItem("memos") || "{}"); } catch(e) { memos = {}; }

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

    let icons = "";

    // 最高値
    if (count > 0 && count === max) icons += "🌟";
    // 目標判定
    const entries = Array.isArray(logs[dateStr]) ? logs[dateStr] : [];
    const sets = entries.length;
    if (goal !== null && sets > 0) {
      if (sets >= goal) {
        cell.classList.add("goal-success");
        icons += "👑";
      } else {
        cell.classList.add("goal-failed");
        icons += "😔";
      }
    }
    // メモあり
    if ((memos[dateStr] || "").trim().length > 0) icons += "✏";

    cell.innerHTML = `<strong>${d}</strong><br>${count > 0 ? count + "回" : "-"}<br>${icons}`;
    calendar.appendChild(cell);

    // モーダルイベント
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

      let memos = {};
      try {
        memos = JSON.parse(localStorage.getItem("memos") || "{}");
      } catch (e) {
        memos = {};
      }
      const memoText = memos[dateStr] || "";

      const timeDistText = Object.entries(timeBuckets)
        .filter(([_, v]) => v > 0)
        .map(([k, v]) => `${k}: ${v}回`)
        .join("<br>");
      const timeDistHTML = timeDistText ? `<li>時間帯別:<br>${timeDistText}</li>` : "";

      content.innerHTML = `
        <ul style="list-style:none; padding:0; margin-bottom: 10px;">
          <li>合計呼吸回数: ${total}回</li>
          <li>セット数: ${sets}</li>
          <li>目標達成率: ${percent}%</li>
          ${timeDistHTML}
        </ul>
        <div style="margin-top:12px; text-align:left;">
          <label for="memo-area" style="font-weight:bold;">📝 今日のメモ</label>
          <textarea id="memo-area" rows="3" style="width:100%; margin:8px 0 4px; border-radius:8px; border:1px solid #ccc; padding:6px; font-size:1em; box-sizing: border-box;">${memoText}</textarea>
          <button id="save-memo-btn" style="margin-right: 8px;">保存</button>
          <span id="memo-saved-msg" style="color: #2e7d32; font-size:0.9em;"></span>
        </div>
      `;
      label.textContent = `${dateStr} の詳細`;
      modal.showModal();

      setTimeout(() => {
        const saveBtn = document.getElementById("save-memo-btn");
        const memoArea = document.getElementById("memo-area");
        const msg = document.getElementById("memo-saved-msg");
        if (saveBtn && memoArea) {
          saveBtn.onclick = () => {
            memos[dateStr] = memoArea.value;
            localStorage.setItem("memos", JSON.stringify(memos));
            msg.textContent = "保存しました！";
            setTimeout(() => { msg.textContent = ""; }, 1200);
          };
        }
      }, 20);
    });
  }

  // カレンダー描画が完了したあとにボタン制御を呼ぶ
  updateCertificateButton();
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

  // ▼ 「表彰状を見る」ボタンのクリックでその月のcertificate.htmlへ遷移
  const certBtn = document.getElementById("show-certificate-btn");
  if (certBtn) {
    certBtn.onclick = () => {
      const y = current.getFullYear();
      const m = current.getMonth() + 1;
      location.href = `certificate.html?year=${y}&month=${m}`;
    };
  }
});

function resetBackground() {
  localStorage.removeItem("calendarBackground");
  sessionStorage.removeItem("calendarBackground");
  document.body.style.setProperty("background-image", "none", "important");
}

function updateCertificateButton() {
  const y = current.getFullYear();
  const m = current.getMonth() + 1; // 0始まりなので+1
  const today = new Date();
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;
  const btn = document.getElementById("show-certificate-btn");
  if (!btn) return;

  // 今月 または 未来の月はボタン非表示
  if (y > thisYear || (y === thisYear && m >= thisMonth)) {
    btn.style.display = "none";
  } else {
    btn.style.display = "block";
  }
}
