console.log("[Ultrabreath] training.js loaded");

// ==== utils ====
function getLocalDateString(date = new Date()) {
  date.setHours(0,0,0,0);
  const y = date.getFullYear();
  const m = ("0"+(date.getMonth()+1)).slice(-2);
  const d = ("0"+date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}
function getLogs(){ try { return JSON.parse(localStorage.getItem("logs")||"{}"); } catch { return {}; } }
function setLogs(v){ localStorage.setItem("logs", JSON.stringify(v||{})); }

// ==== params ====
let setCount = parseInt(localStorage.getItem("setCount")) || 10; // 1セットの目標回数
let setGoal  = parseInt(localStorage.getItem("setGoal"))  || 2;  // 1日の目標セット数
let count = 0; // 現在セットの進捗

// ==== elements ====
const $ = (id)=>document.getElementById(id);
let progressEl, targetEl, remainEl, sumTodayEl, streakDayEl, bannerEl, oneLineEl, circleEl, breathBtn;

// ==== init ====
function hardBindUI() {
  // 要素を取得
  progressEl  = $("progress");
  targetEl    = $("target");
  remainEl    = $("remain");
  sumTodayEl  = $("sum-today");
  streakDayEl = $("streak-day");
  bannerEl    = $("banner");
  oneLineEl   = $("one-line");
  circleEl    = $("circle");
  breathBtn   = $("breath-btn");

  // まだDOMができてない場合は再試行
  if (!progressEl || !breathBtn) {
    setTimeout(hardBindUI, 50);
    return;
  }

  // 初期表示
  targetEl.textContent = setCount;
  progressEl.textContent = 0;
  refreshSummary();

  // ハンドラ
  breathBtn.onclick = onBreath;
  $("to-calendar")?.addEventListener("click", ()=> location.href="calendar.html");
  $("send-mail-btn")?.addEventListener("click", sendTodayByMail);

  // スクロール抑制（1画面完結）
  document.documentElement.style.overflow = "hidden";
  console.log("[Ultrabreath] UI bound.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", hardBindUI);
} else {
  hardBindUI();
}

// ==== actions ====
function onBreath(){
  if (!breathBtn) return;
  count = Math.min(setCount, count + 1);
  progressEl.textContent = count;
  const deg = Math.round((count / setCount) * 360);
  circleEl.style.setProperty("--deg", deg);

  if (count === Math.floor(setCount/2)) {
    oneLineEl.textContent = "半分いきました。いいペース！";
  }

  if (count >= setCount) {
    saveOneSet();
    oneLineEl.textContent = "セット完了！少し整えて続けます？";
    breathBtn.disabled = true;
    setTimeout(()=>{
      count = 0;
      progressEl.textContent = 0;
      circleEl.style.setProperty("--deg", 0);
      breathBtn.disabled = false;
      refreshSummary();
    }, 600);
  }
}

// ==== data ====
function saveOneSet(){
  const key = getLocalDateString();
  const logs = getLogs();
  if (!Array.isArray(logs[key])) logs[key] = [];
  const jst = new Date().toLocaleString("sv-SE",{timeZone:"Asia/Tokyo"}).replace(" ","T");
  logs[key].push({ count: setCount, timestamp: jst });
  setLogs(logs);

  const goals = JSON.parse(localStorage.getItem("goals") || "{}");
  goals[key] = setGoal;
  localStorage.setItem("goals", JSON.stringify(goals));
}

function refreshSummary(){
  const key = getLocalDateString();
  const logs = getLogs();

  const arr = Array.isArray(logs[key]) ? logs[key] : [];
  const toNum = (v)=> typeof v==="number" ? v : Number(v?.count || v);
  const todayTotal = arr.map(toNum).filter(n=>Number.isFinite(n)&&n>=0).reduce((a,b)=>a+b,0);
  sumTodayEl.textContent = todayTotal;

  const todaySets = arr.length;
  const remainSets = Math.max(0, setGoal - todaySets);
  const remainBreaths = Math.max(0, setCount - count);
  remainEl.textContent = remainSets>0 ? `${remainSets}セット` : `${remainBreaths}回`;

  const streak = computeStreak(logs);
  streakDayEl.textContent = streak;
  bannerEl.textContent = `🌟 今日で${streak}日連続！`;

  if (remainSets<=0 && count===0) oneLineEl.textContent = "今日の目標クリア！お見事です👏";
  else if (count===0 && todaySets===0) oneLineEl.textContent = "はじめはゆっくりでOKです";
  else oneLineEl.textContent = "ナイスペース、続けましょう";
}

function computeStreak(logs){
  const today = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  for (let i=0;i<365;i++){
    const d = new Date(today);
    d.setDate(today.getDate()-i);
    const key = getLocalDateString(d);
    const arr = logs[key];
    const has = Array.isArray(arr) && arr.some(v=>{
      const n = (typeof v==="number") ? v : Number(v?.count || v);
      return Number.isFinite(n) && n>0;
    });
    if (has) streak++; else break;
  }
  return streak;
}

function sendTodayByMail(){
  const today = getLocalDateString();
  const logs = getLogs();
  const goals = JSON.parse(localStorage.getItem("goals") || "{}");
  const nickname = localStorage.getItem("nickname") || "あなた";
  const toAddress = localStorage.getItem("mailAddress") || "";

  const arr = Array.isArray(logs[today]) ? logs[today] : [];
  const toNum = (v)=> typeof v==="number" ? v : Number(v?.count || v);
  const todayCount = arr.map(toNum).filter(n=>Number.isFinite(n)&&n>=0).reduce((a,b)=>a+b,0);
  const sets = arr.length;
  const goal = goals[today] || setGoal;

  let body = `${nickname} さんの今日の呼吸トレーニング記録\n`;
  body += `日付: ${today}\n合計回数: ${todayCount}回\nセット数: ${sets}\n目標セット数: ${goal}\n`;
  const mailto = `mailto:${encodeURIComponent(toAddress)}?subject=${encodeURIComponent("ウルトラブレス 今日の記録（"+today+"）")}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

