import { byId } from "./dom.js";
import { readFileAsDataUrl } from "./file.js";
import { render, renderAvatar, log } from "./render.js";
import { saveState, state } from "./state.js";
import { getTodayStats } from "./stats.js";
import { defaultUserName, statNames } from "./constants.js";

export function addMission() {
  const input = byId("missionInput");
  const name = input.value.trim();

  if (!name) return;

  state.missions.push({
    id: Date.now(),
    date: state.todayKey,
    name,
    stat: byId("statInput").value,
    exp: Number(byId("expInput").value),
    done: false
  });

  input.value = "";
  log(`MISSION ACCEPTED :: ${name}`);
  saveState();
  render();
}

export function toggleMission(id) {
  const mission = findMission(id);
  if (!mission) return;

  mission.done = !mission.done;

  if (mission.done) {
    log(`MISSION CLEARED :: ${mission.name}\nEXP +${mission.exp}\n${statNames[mission.stat]} +1`);
  } else {
    log(`MISSION RESTORED :: ${mission.name}`);
  }

  saveState();
  render();
}

export function removeMission(id) {
  const mission = findMission(id);
  if (!mission) return;
  if (!confirm(`미션을 삭제할까요?\n${mission.name}`)) return;

  state.missions = state.missions.filter(item => item.id !== id);
  log("MISSION DELETED.");
  saveState();
  render();
}

export function finishDay() {
  if (!state.missions.length) {
    log("NO MISSION DATA.");
    return;
  }

  const today = getTodayStats(state.missions);
  state.history = state.history.filter(history => history.date !== state.todayKey);
  state.history.push({
    date: state.todayKey,
    totalCount: state.missions.length,
    doneCount: today.done.length,
    clearRate: today.clearRate,
    exp: today.totalExp
  });
  state.missions = [];

  log("DAY RECORD SAVED.\nSYSTEM READY FOR NEXT DAY.");
  saveState();
  render();
}

export function saveImage() {
  if (typeof window.html2canvas !== "function") {
    log("RESULT IMAGE SAVE FAILED.");
    alert("이미지 저장 도구를 불러오지 못했습니다.");
    return;
  }

  window.html2canvas(byId("resultCard"), {
    backgroundColor: null,
    scale: 3
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "system-status-result.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    link.remove();
    log("RESULT IMAGE SAVED.");
  }).catch(() => {
    log("RESULT IMAGE SAVE FAILED.");
    alert("이미지 저장에 실패했습니다.");
  });
}

export function exportData() {
  const data = {
    missions: state.missions,
    history: state.history,
    avatar: state.avatar,
    userName: state.userName,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");

  link.download = `system-status-${state.todayKey}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  log("DATA EXPORTED.");
}

export function importData(data) {
  if (!Array.isArray(data.missions) || !Array.isArray(data.history)) {
    throw new Error("Invalid status data.");
  }

  state.missions = data.missions;
  state.history = data.history;
  state.avatar = typeof data.avatar === "string" ? data.avatar : "";
  state.userName = typeof data.userName === "string" && data.userName.trim()
    ? data.userName.trim()
    : defaultUserName;

  saveState();
  render();
  log("DATA IMPORTED.");
}

export function updateAvatar(file) {
  if (!file) return;

  readFileAsDataUrl(file).then(result => {
    state.avatar = result;
    saveState();
    renderAvatar();
    log("USER IMAGE UPDATED.");
  }).catch(() => {
    log("USER IMAGE UPDATE FAILED.");
    alert("이미지를 불러오지 못했습니다.");
  });
}

export function updateUserName(value) {
  state.userName = value.trim() || defaultUserName;
  saveState();
}

export function setMissionFilter(filter) {
  state.missionFilter = filter;
  render();
}

export function findMission(id) {
  return state.missions.find(mission => mission.id === id);
}
