let current = new Date();

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const year = current.getFullYear();
  const month = current.getMonth();
  const logs = JSON.parse(localStorage.getItem("ultrabreathLogs") || "{}");

  document.getElementById("month-label").textContent = `${year}年${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const weekdays = ["日","月","火","水","木","金","土"];
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
    const key = date.toISOString().split("T")[0];
    if (logs[key]) valuesByDate[key] = logs[key];
  }

  const allValues = Object.values(valuesByDate);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const sum = allValues.reduce((a, b) => a + b, 0);
  const average = allValues.length > 0 ? Math.floor(sum / allValues.length) : 0;
  document.getElementById("average-label").textContent = `平均：${average}回／日`;

  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement("div");

    const dateObj = new Date(year, month, d);
    dateObj.setHours(0, 0, 0, 0);
    const dateStr = dateObj.toISOString().split("T")[0];

    const count = logs[dateStr] || 0;

    cell.className = "day";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj.getTime() === today.getTime()) cell.classList.add("today");

    if (count > 0) {
      if (count === max) cell.classList.add("max-value");
      else if (count === min) cell.classList.add("min-value");
    }

    cell.innerHTML = `<strong>${d}</strong><br>${count > 0 ? count + "回" : "-"}`;
    calendar.appendChild(cell);
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