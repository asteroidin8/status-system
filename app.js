let missions = JSON.parse(localStorage.getItem("status_missions")) || [];
let history = JSON.parse(localStorage.getItem("status_history")) || [];
let avatar = localStorage.getItem("status_avatar") || "";
let userName = localStorage.getItem("status_user_name") || "USER";
let missionFilter = "active";

const todayKey = formatLocalDate();

const statNames = {
  focus: "집중력",
  energy: "체력",
  knowledge: "지식",
  life: "생활력"
};

const resultMissionLimit = 3;

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function save() {
  localStorage.setItem("status_missions", JSON.stringify(missions));
  localStorage.setItem("status_history", JSON.stringify(history));
  localStorage.setItem("status_avatar", avatar);
  localStorage.setItem("status_user_name", userName);
}

function addMission() {
  const input = document.getElementById("missionInput");
  const name = input.value.trim();

  if (!name) return;

  missions.push({
    id: Date.now(),
    date: todayKey,
    name,
    stat: document.getElementById("statInput").value,
    exp: Number(document.getElementById("expInput").value),
    done: false
  });

  input.value = "";
  log(`MISSION ACCEPTED :: ${name}`);
  save();
  render();
}

function toggleMission(id) {
  const mission = missions.find(m => m.id === id);
  if (!mission) return;

  mission.done = !mission.done;

  if (mission.done) {
    log(`MISSION CLEARED :: ${mission.name}\nEXP +${mission.exp}\n${statNames[mission.stat]} +1`);
  } else {
    log(`MISSION RESTORED :: ${mission.name}`);
  }

  save();
  render();
}

function removeMission(id) {
  const mission = missions.find(m => m.id === id);
  if (!mission) return;
  if (!confirm(`미션을 삭제할까요?\n${mission.name}`)) return;

  missions = missions.filter(m => m.id !== id);
  log("MISSION DELETED.");
  save();
  render();
}

function getMissionCounts() {
  return {
    all: missions.length,
    active: missions.filter(m => !m.done).length,
    done: missions.filter(m => m.done).length
  };
}

function getFilteredMissions() {
  if (missionFilter === "active") return missions.filter(m => !m.done);
  if (missionFilter === "done") return missions.filter(m => m.done);
  return missions;
}

function getTodayStats() {
  const done = missions.filter(m => m.done);
  const totalExp = done.reduce((sum, m) => sum + m.exp, 0);
  const clearRate = missions.length ? Math.round(done.length / missions.length * 100) : 0;

  const statGain = { focus: 0, energy: 0, knowledge: 0, life: 0 };
  const statExp = { focus: 0, energy: 0, knowledge: 0, life: 0 };
  done.forEach(m => {
    statGain[m.stat] += Math.max(1, Math.round(m.exp / 15));
    statExp[m.stat] += m.exp;
  });

  return { done, totalExp, clearRate, statGain, statExp };
}

function getRecordStats() {
  const totalExpFromHistory = history.reduce((sum, h) => sum + h.exp, 0);
  const totalMissionFromHistory = history.reduce((sum, h) => sum + h.doneCount, 0);

  const today = getTodayStats();

  const totalExp = totalExpFromHistory + today.totalExp;
  const totalMission = totalMissionFromHistory + today.done.length;

  const allClearRates = [
    ...history.map(h => h.clearRate),
    missions.length ? today.clearRate : null
  ].filter(v => v !== null);

  const avgClear = allClearRates.length
    ? Math.round(allClearRates.reduce((sum, v) => sum + v, 0) / allClearRates.length)
    : 0;

  return {
    totalExp,
    totalMission,
    avgClear,
    streak: getStreak()
  };
}

function getLevel(totalExp) {
  return Math.floor(totalExp / 100) + 1;
}

function getCurrentExp(totalExp) {
  return totalExp % 100;
}

function getRank(level) {
  if (level >= 35) return { name: "S급", className: "rank-s" };
  if (level >= 25) return { name: "A급", className: "rank-a" };
  if (level >= 18) return { name: "B급", className: "rank-b" };
  if (level >= 12) return { name: "C급", className: "rank-c" };
  if (level >= 7) return { name: "D급", className: "rank-d" };
  if (level >= 3) return { name: "E급", className: "rank-e" };
  return { name: "F급", className: "rank-f" };
}

function getStreak() {
  const completedDates = history
    .filter(h => h.doneCount > 0)
    .map(h => h.date);

  if (getTodayStats().done.length > 0) {
    completedDates.push(todayKey);
  }

  const unique = [...new Set(completedDates)].sort().reverse();

  let streak = 0;
  let cursor = new Date(todayKey);

  for (const date of unique) {
    const expected = formatLocalDate(cursor);
    if (date === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return streak;
}

function finishDay() {
  if (!missions.length) {
    log("NO MISSION DATA.");
    return;
  }

  const today = getTodayStats();

  history = history.filter(h => h.date !== todayKey);

  history.push({
    date: todayKey,
    totalCount: missions.length,
    doneCount: today.done.length,
    clearRate: today.clearRate,
    exp: today.totalExp
  });

  missions = [];

  log("DAY RECORD SAVED.\nSYSTEM READY FOR NEXT DAY.");
  save();
  render();
}

function render() {
  const today = getTodayStats();
  const record = getRecordStats();

  const level = getLevel(record.totalExp);
  const currentExp = getCurrentExp(record.totalExp);
  const rank = getRank(level);

  document.getElementById("app").className = `app ${rank.className}`;
  document.getElementById("rankBand").textContent = rank.name;
  document.getElementById("rankText").textContent = rank.name;
  document.getElementById("level").textContent = level;
  document.getElementById("currentExp").textContent = currentExp;
  document.getElementById("expBar").style.width = currentExp + "%";
  document.getElementById("clearRate").textContent = today.clearRate;
  document.getElementById("userNameInput").value = userName;

  document.getElementById("streakRecord").textContent = `${record.streak} DAY`;
  document.getElementById("avgClearRecord").textContent = `${record.avgClear}%`;
  document.getElementById("totalExpRecord").textContent = record.totalExp;
  document.getElementById("totalMissionRecord").textContent = record.totalMission;

  const counts = getMissionCounts();
  const filteredMissions = getFilteredMissions();

  document.getElementById("filterAllCount").textContent = counts.all;
  document.getElementById("filterActiveCount").textContent = counts.active;
  document.getElementById("filterDoneCount").textContent = counts.done;
  document.querySelectorAll("[data-filter]").forEach(button => {
    const isActive = button.dataset.filter === missionFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.getElementById("missionList").innerHTML = filteredMissions.length
    ? filteredMissions.map(m => `
    <div class="mission ${m.done ? "done" : ""}">
      <div class="check" data-action="toggle" data-id="${m.id}"></div>
      <div>
        <div class="name">${escapeHtml(m.name)}</div>
        <div class="meta">${statNames[m.stat]} · +${m.exp} EXP</div>
      </div>
      <button data-action="remove" data-id="${m.id}">X</button>
    </div>
  `).join("")
    : `<div class="mission-empty">표시할 미션이 없습니다.</div>`;

  document.getElementById("statsGrid").innerHTML = Object.entries(today.statGain).map(([key, value]) => `
    <div class="stat-row">
      <div>${statNames[key]}</div>
      <div class="mini-bar">
        <div class="mini-fill" style="width:${Math.min(value * 12, 100)}%"></div>
      </div>
      <div>+${value}</div>
    </div>
  `).join("");

  renderAvatar();
}

function renderAvatar() {
  const html = avatar ? `<img src="${avatar}" alt="user image" />` : "USER<br>IMAGE";
  document.getElementById("avatarBox").innerHTML = html;
  document.getElementById("resultAvatar").innerHTML = avatar ? `<img src="${avatar}" alt="user image" />` : "USER";
  document.getElementById("avatarOverlay").textContent = avatar ? "이미지 수정" : "이미지 삽입";
  document.getElementById("avatarButton").setAttribute(
    "aria-label",
    avatar ? "사용자 이미지 수정" : "사용자 이미지 삽입"
  );
}

function openResult() {
  const today = getTodayStats();
  const record = getRecordStats();
  const level = getLevel(record.totalExp);
  const rank = getRank(level);

  document.getElementById("resultCard").className = `result-card ${rank.className}`;
  document.getElementById("resultRankBand").textContent = rank.name;

  document.getElementById("resultHeader").textContent =
`PLAYER :: ${userName}
RANK :: ${rank.name}
LV :: ${level}
TOTAL EXP :: ${record.totalExp}`;
  document.getElementById("resultDate").textContent = new Date().toLocaleDateString("ko-KR");

  const displayedMissions = today.done.slice(0, resultMissionLimit);
  const hiddenMissionCount = Math.max(today.done.length - displayedMissions.length, 0);
  const cleared = [
    ...displayedMissions.map(m => `■ ${m.name}`),
    hiddenMissionCount ? `■ 외 ${hiddenMissionCount}개` : ""
  ].filter(Boolean).join("\n") || "NONE";

  const statExpEntries = Object.entries(today.statExp)
    .map(([key, value]) => `${statNames[key]} +${value} EXP`);
  const statExp = [
    statExpEntries.slice(0, 2).join(" / "),
    statExpEntries.slice(2).join(" / ")
  ].join("\n");

  document.getElementById("resultText").textContent =
`CLEAR RATE :: ${today.clearRate}%
MISSION :: ${today.done.length}/${missions.length}
STREAK :: ${record.streak} DAY

STAT GAIN
${statExp}

CLEARED
${cleared}`;

  renderAvatar();
  document.getElementById("modal").style.display = "flex";
}

function closeResult() {
  document.getElementById("modal").style.display = "none";
}

function saveImage() {
  if (typeof html2canvas !== "function") {
    log("RESULT IMAGE SAVE FAILED.");
    alert("이미지 저장 도구를 불러오지 못했습니다.");
    return;
  }

  const card = document.getElementById("resultCard");

  html2canvas(card, {
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

function exportData() {
  const data = {
    missions,
    history,
    avatar,
    userName,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");

  link.download = `system-status-${todayKey}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  log("DATA EXPORTED.");
}

function importData(data) {
  if (!Array.isArray(data.missions) || !Array.isArray(data.history)) {
    throw new Error("Invalid status data.");
  }

  missions = data.missions;
  history = data.history;
  avatar = typeof data.avatar === "string" ? data.avatar : "";
  userName = typeof data.userName === "string" && data.userName.trim()
    ? data.userName.trim()
    : "USER";

  save();
  render();
  log("DATA IMPORTED.");
}

function log(text) {
  document.getElementById("log").textContent = text;
}

document.getElementById("avatarButton").addEventListener("click", () => {
  document.getElementById("imageInput").click();
});

document.getElementById("addMissionButton").addEventListener("click", addMission);
document.getElementById("openResultButton").addEventListener("click", openResult);
document.getElementById("finishDayButton").addEventListener("click", finishDay);
document.getElementById("saveImageButton").addEventListener("click", saveImage);
document.getElementById("closeResultButton").addEventListener("click", closeResult);
document.getElementById("exportDataButton").addEventListener("click", exportData);
document.getElementById("importDataButton").addEventListener("click", () => {
  document.getElementById("importDataInput").click();
});

document.getElementById("missionList").addEventListener("click", e => {
  const actionTarget = e.target.closest("[data-action]");
  if (!actionTarget) return;

  const id = Number(actionTarget.dataset.id);
  if (actionTarget.dataset.action === "toggle") {
    const mission = missions.find(m => m.id === id);
    const shouldAnimateClear = missionFilter === "active" && mission && !mission.done;
    if (!shouldAnimateClear) {
      toggleMission(id);
      return;
    }

    const missionElement = actionTarget.closest(".mission");
    if (!missionElement) {
      toggleMission(id);
      return;
    }

    missionElement.classList.add("clearing");
    missionElement.addEventListener("animationend", () => toggleMission(id), { once: true });
  }
  if (actionTarget.dataset.action === "remove") removeMission(id);
});

document.getElementById("missionFilters").addEventListener("click", e => {
  const filterButton = e.target.closest("[data-filter]");
  if (!filterButton) return;

  missionFilter = filterButton.dataset.filter;
  render();
});

document.getElementById("imageInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    avatar = reader.result;
    save();
    renderAvatar();
    log("USER IMAGE UPDATED.");
  };
  reader.readAsDataURL(file);
});

document.getElementById("importDataInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      importData(JSON.parse(reader.result));
    } catch {
      log("DATA IMPORT FAILED.");
      alert("가져올 수 없는 데이터입니다.");
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsText(file);
});

document.getElementById("missionInput").addEventListener("keydown", e => {
  if (e.key === "Enter") addMission();
});

document.getElementById("userNameInput").addEventListener("input", e => {
  userName = e.target.value.trim() || "USER";
  save();
});

render();
