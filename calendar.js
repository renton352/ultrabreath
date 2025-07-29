
// (略) ここは既存の calendar.js の冒頭部（前略）

      const times = logs[dateStr].map(entry => entry.timestamp.split("T")[1].slice(0,5));
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
      const timeDistText = Object.entries(timeBuckets)
        .filter(([_, v]) => v > 0)
        .map(([k, v]) => `${k}: ${v}回`)
        .join("<br>");
      const timeDistHTML = timeDistText ? `<li>時間帯別:<br>${timeDistText}</li>` : "";

      modalContent.innerHTML = `
        <ul>
          <li>合計呼吸回数: ${total}回</li>
          <li>セット数: ${sets}</li>
          <li>目標達成率: ${percent}%</li>
          ${times.length ? `<li>実施時刻: ${times.join(", ")}</li>` : ""}
          ${timeDistHTML}
        </ul>`;
      modal.showModal();
