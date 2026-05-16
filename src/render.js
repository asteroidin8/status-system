import { statNames } from "./constants.js";
import { byId, setHtml, setText } from "./dom.js";
import { escapeHtml } from "./html.js";
import { state } from "./state.js";
import {
  getCurrentExp,
  getFilteredMissions,
  getLevel,
  getMissionCounts,
  getRank,
  getRecordStats,
  getTodayStats
} from "./stats.js";

export function render() {
  const today = getTodayStats(state.missions);
  const record = getRecordStats(state);
  const level = getLevel(record.totalExp);
  const currentExp = getCurrentExp(record.totalExp);
  const rank = getRank(level);

  byId("app").className = `app ${rank.className}`;
  setText("rankText", rank.name);
  setText("level", level);
  setText("currentExp", currentExp);
  byId("expBar").style.width = `${currentExp}%`;
  setText("clearRate", today.clearRate);
  byId("userNameInput").value = state.userName;

  setText("streakRecord", `${record.streak} DAY`);
  setText("avgClearRecord", `${record.avgClear}%`);
  setText("totalExpRecord", record.totalExp);
  setText("totalMissionRecord", record.totalMission);

  renderFilters();
  renderMissionList();
  renderStats(today.statGain);
  renderAvatar();
}

export function renderAvatar() {
  const html = state.avatar ? `<img src="${state.avatar}" alt="user image" />` : "USER<br>IMAGE";
  setHtml("avatarBox", html);
  setHtml("resultAvatar", state.avatar ? `<img src="${state.avatar}" alt="user image" />` : "USER");
  setText("avatarOverlay", state.avatar ? "이미지 수정" : "이미지 삽입");
  byId("avatarButton").setAttribute(
    "aria-label",
    state.avatar ? "사용자 이미지 수정" : "사용자 이미지 삽입"
  );
}

export function openResult() {
  const today = getTodayStats(state.missions);
  const record = getRecordStats(state);
  const level = getLevel(record.totalExp);
  const rank = getRank(level);

  byId("resultCard").className = `result-card ${rank.className}`;
  setText("resultHeader", [
    `PLAYER :: ${state.userName}`,
    `RANK :: ${rank.name}`,
    `LV :: ${level}`,
    `TOTAL EXP :: ${record.totalExp}`
  ].join("\n"));
  setText("resultDate", new Date().toLocaleDateString("ko-KR"));
  setText("resultText", getResultText(today, record));

  renderAvatar();
  byId("modal").style.display = "flex";
}

export function closeResult() {
  byId("modal").style.display = "none";
}

export function log(text) {
  setText("log", text);
}

function renderFilters() {
  const counts = getMissionCounts(state.missions);
  setText("filterAllCount", counts.all);
  setText("filterActiveCount", counts.active);
  setText("filterDoneCount", counts.done);

  document.querySelectorAll("[data-filter]").forEach(button => {
    const isActive = button.dataset.filter === state.missionFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderMissionList() {
  const filteredMissions = getFilteredMissions(state.missions, state.missionFilter);

  setHtml("missionList", filteredMissions.length
    ? filteredMissions.map(getMissionHtml).join("")
    : `<div class="mission-empty">표시할 미션이 없습니다.</div>`);
}

function getMissionHtml(mission) {
  return `
    <div class="mission ${mission.done ? "done" : ""}">
      <div class="check" data-action="toggle" data-id="${mission.id}"></div>
      <div>
        <div class="name">${escapeHtml(mission.name)}</div>
        <div class="meta">${statNames[mission.stat]} · +${mission.exp} EXP</div>
      </div>
      <button data-action="remove" data-id="${mission.id}">X</button>
    </div>
  `;
}

function renderStats(statGain) {
  setHtml("statsGrid", Object.entries(statGain).map(([key, value]) => `
    <div class="stat-row">
      <div>${statNames[key]}</div>
      <div class="mini-bar">
        <div class="mini-fill" style="width:${Math.min(value * 12, 100)}%"></div>
      </div>
      <div>+${value}</div>
    </div>
  `).join(""));
}

function getResultText(today, record) {
  const statExp = Object.entries(today.statExp)
    .map(([key, value]) => `${statNames[key]} +${value} EXP`)
    .join("\n");

  return [
    `CLEAR RATE :: ${today.clearRate}%`,
    `MISSION :: ${today.done.length}/${state.missions.length}`,
    `STREAK :: ${record.streak} DAY`,
    "",
    "STAT GAIN",
    statExp
  ].join("\n");
}
