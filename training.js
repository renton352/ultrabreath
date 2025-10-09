// ===== 共通ユーティリティ =====
function getLocalDateString(date = new Date()) {
  date.setHours(0, 0, 0, 0);
  const y = date.getFullYear();
  const m = ("0" + (date.getMonth() + 1)).slice(-2);
  const d = ("0" + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}
function getLogs() {
  try { return JSON.parse(localStorage.getItem("logs") || "{}"); }
  catch { return {}; }
}
function setLogs(obj) {
  localStorage.setItem("logs", JSON.stringify(obj || {}));
}

// ===== パラメータ（ローカル設定と連動） =====
let setCount = parseInt(localStorage.getItem("setCount")) || 10; // 1回の目標呼吸数
let setGoal  = parseInt(localStorage.getItem("setGoal"))  || 2;  // 1日の目標セット数
let count = 0; // 今セット内の進捗

// ===== 画面要素 =====
const el = (id) => document.getElementById(id);
const progressEl = el("progress");
const targetEl   = el("target");
const remainEl   = el("remain");
const sumTodayEl = el("sum-today");
const streakDayEl= el("streak-day");
const bannerEl   = el("banner");
const oneLineEl  = el("one-line");
const circleEl   = el("circle");
const breathBtn  = el("breath-btn");

// ===== 初期化 =====
function init() {
  // 初期ターゲット表示
  targetEl.textContent = setCount;
  progressEl.textContent = 0;

  // 今日の統計反映
  refreshSummary();

  // ボタン動作
  breathBtn.onclick = onBreath;
  el("to-calendar").onclick = () => location.href = "calendar.html";
  el("send-mail-btn").onclick = sendTodayByMail;

  // 画面サイズ内に収める（1画面完結）
  document.documentElement.style.overflow = "hidden";
}

// ===== 呼吸カウント =====
function onBreath() {
  count = Math.min(setCount, count + 1);
  progressEl.textContent = count;

  // 進捗リング角度を更新
  const deg = Math.round((count / setCount) * 360);
  circleEl.style.setProperty("--deg", deg);

  // 途中メッセージ
  if (count === Math.floor(setCount / 2)) {
    oneLineEl.textContent = "半分いきました。いいペース！";
  }

  if (count >= setCount) {
    // セット完了 → ログ保存して次セットへ
    saveOneSet();
    oneLineEl.textContent = "セット完了！呼吸を整えて続けます？";
    breathBtn.disabled = true;
    setTimeout(() => { // 小休止後に次セットへ
      count = 0;
      progressEl.textContent = 0;
      circleEl.style.setProperty("--deg", 0);
      breathBtn.disabled = false;
      refreshSummary();   // 残り・合計などを更新
    }, 700);
  }
}

// ===== ログ保存（1セット分） =====
function saveOneSet() {
  const todayKey = getLocalDateString();
  const logs = getLogs();
  if (!Array.isArray(logs[todayKey])) logs[todayKey] = [];

  // 旧データ互換: 数値 or {count, timestamp}
  const jst = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" }).replace(" ", "T");
  logs[todayKey].push({ count: setCount, timestamp: jst });

  setLogs(logs);
  // 目標セット数も保存（従来互換）
  const goals = JSON.parse(localStorage.getItem("goals") || "{}");
  goals[todayKey] = setGoal;
  localStorage.setItem("goals", JSON.stringify(goals));
}

// ===== サマリー更新（上の3ピル＋バナー） =====
function refreshSummary() {
  const todayKey = getLocalDateString();
  const logs = getLogs();

  // 今日の合計回数
  const arr = Array.isArray(logs[todayKey]) ? logs[todayKey] : [];
  const toNum = (v) => typeof v === "number" ? v : Number(v?.count || v);
  const todayTotal = arr.map(toNum).filter(n => Number.isFinite(n) && n >= 0)
                          .reduce((a,b)=>a+b, 0);
  sumTodayEl.textContent = todayTotal;

  // 残り（今日のセット進捗）
  const todaySets = arr.length;
  const remainSets = Math.max(0, setGoal - todaySets);
  const remainBreaths = Math.max(0, setCount - count);
  remainEl.textContent = remainSets > 0 ? `${remainSets}セット` : `${remainBreaths}回`;

  // 継続日数（今日から遡って連続）
  const streak = computeStreak(logs);
  streakDayEl.textContent = streak;
  bannerEl.textContent = `🌟 今日で${streak}日連続！`;

  // ひとこと
  if (remainSets <= 0 && count === 0) oneLineEl.textContent = "今日の目標クリア！お見事です👏";
  else if (count === 0 && todaySets === 0) oneLineEl.textContent = "はじめはゆっくりでOKです";
  else oneLineEl.textContent = "ナイスペース、続けましょう";
}

function computeStreak(logs) {
  const today = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  for (let i=0;i<365;i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getLocalDateString(d);
    const arr = logs[key];
    const has = Array.isArray(arr) && arr.some(v => {
      const n = (typeof v === "number") ? v : Number(v?.count || v);
      return Number.isFinite(n) && n > 0;
    });
    if (has) streak++; else break;
  }
  return streak;
}

// ===== メール送信（今日の記録） =====
function sendTodayByMail() {
  const today = getLocalDateString();
  const logs = getLogs();
  const goals = JSON.parse(localStorage.getItem("goals") || "{}");
  const nickname = localStorage.getItem("nickname") || "あなた";
  const toAddress = localStorage.getItem("mailAddress") || "";

  const arr = Array.isArray(logs[today]) ? logs[today] : [];
  const toNum = (v) => typeof v === "number" ? v : Number(v?.count || v);
  const todayCount = arr.map(toNum).filter(n => Number.isFinite(n) && n >= 0)
                           .reduce((a,b)=>a+b, 0);
  const sets = arr.length;
  const goal = goals[today] || setGoal;

  let body = `${nickname} さんの今日の呼吸トレーニング記録\n`;
  body += `日付: ${today}\n合計回数: ${todayCount}回\nセット数: ${sets}\n目標セット数: ${goal}\n`;

  const mailto = `mailto:${encodeURIComponent(toAddress)}?subject=${encodeURIComponent("ウルトラブレス 今日の記録（"+today+"）")}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

// ===== 起動 =====
document.addEventListener("DOMContentLoaded", init);
