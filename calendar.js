const calendar = document.getElementById("calendar");
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const logs = JSON.parse(localStorage.getItem("ultrabreathLogs") || "{}");

const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);
const startDay = firstDay.getDay();
const totalDays = lastDay.getDate();

// 曜日ヘッダー
const weekdays = ["日","月","火","水","木","金","土"];
for (const day of weekdays) {
  const cell = document.createElement("div");
  cell.className = "day muted";
  cell.textContent = day;
  calendar.appendChild(cell);
}

// 空白
for (let i = 0; i < startDay; i++) {
  const cell = document.createElement("div");
  cell.className = "day muted";
  calendar.appendChild(cell);
}

// 日付
for (let d = 1; d <= totalDays; d++) {
  const cell = document.createElement("div");
  const dateStr = new Date(year, month, d).toISOString().split("T")[0];
  const count = logs[dateStr] || 0;

  cell.className = "day";
  if (d === today.getDate()) cell.classList.add("today");

  cell.innerHTML = `<strong>${d}</strong><br>${count > 0 ? count + "回" : "-"}`;
  calendar.appendChild(cell);
}