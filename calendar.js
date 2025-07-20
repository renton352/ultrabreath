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

  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement("div");
    const date = new Date(year, month, d);
    const dateStr = new Date(year, month, d).toLocaleDateString("sv-SE");
    const count = logs[dateStr] || 0;

    cell.className = "day";
    const today = new Date();
    if (date.toDateString() === today.toDateString()) cell.classList.add("today");

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