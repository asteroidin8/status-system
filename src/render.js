import { expSymbols, statNames, statShortNames } from "./constants.js";
import { byId, setHtml, setText } from "./dom.js";
import { escapeHtml } from "./html.js";
import { state } from "./state.js";
import {
  getFilteredMissions,
  getMissionCounts,
  getStatusSummary
} from "./stats.js";

export function render() {
  const { today, record, level, currentExp, rank } = getStatusSummary(state);

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
  const { today, record, level, rank } = getStatusSummary(state);

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
  setText("filterAllCount", formatCount(counts.all));
  setText("filterActiveCount", formatCount(counts.active));
  setText("filterDoneCount", formatCount(counts.done));

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
    : `<div class="mission-empty">${getEmptyMissionText()}</div>`);
}

function getMissionHtml(mission) {
  return `
    <div class="mission ${mission.done ? "done" : ""}">
      <button class="check" type="button" data-action="toggle" data-id="${mission.id}" aria-label="미션 상태 변경"></button>
      <div class="mission-body">
        <div class="name">${escapeHtml(mission.name)}</div>
        <div class="meta">${statShortNames[mission.stat]} · ${expSymbols[mission.exp]} · +${mission.exp} EXP</div>
      </div>
      <button class="mission-remove" data-action="remove" data-id="${mission.id}" type="button" aria-label="미션 삭제">X</button>
    </div>
  `;
}

function getEmptyMissionText() {
  if (state.missions.length === 0) return "새 미션을 등록하십시오.";
  if (state.missionFilter === "active") return "진행 중인 미션이 없습니다.";
  if (state.missionFilter === "done") return "완료된 미션이 없습니다.";
  return "새 미션을 등록하십시오.";
}

function formatCount(count) {
  return String(count).padStart(2, "0");
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
