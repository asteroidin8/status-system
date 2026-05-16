import {
  addMission,
  exportData,
  findMission,
  finishDay,
  importData,
  removeMission,
  saveImage,
  setMissionFilter,
  toggleMission,
  updateAvatar,
  updateUserName
} from "./actions.js";
import { byId } from "./dom.js";
import { closeResult, openResult, render, log } from "./render.js";
import { state } from "./state.js";

byId("avatarButton").addEventListener("click", () => {
  byId("imageInput").click();
});

byId("addMissionButton").addEventListener("click", addMission);
byId("openResultButton").addEventListener("click", openResult);
byId("finishDayButton").addEventListener("click", finishDay);
byId("saveImageButton").addEventListener("click", saveImage);
byId("closeResultButton").addEventListener("click", closeResult);
byId("exportDataButton").addEventListener("click", exportData);
byId("importDataButton").addEventListener("click", () => {
  byId("importDataInput").click();
});

byId("missionList").addEventListener("click", event => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const id = Number(actionTarget.dataset.id);
  if (actionTarget.dataset.action === "toggle") {
    toggleMissionWithAnimation(actionTarget, id);
  }
  if (actionTarget.dataset.action === "remove") removeMission(id);
});

byId("missionFilters").addEventListener("click", event => {
  const filterButton = event.target.closest("[data-filter]");
  if (!filterButton) return;

  setMissionFilter(filterButton.dataset.filter);
});

byId("imageInput").addEventListener("change", event => {
  updateAvatar(event.target.files[0]);
});

byId("importDataInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      importData(JSON.parse(reader.result));
    } catch {
      log("DATA IMPORT FAILED.");
      alert("가져올 수 없는 데이터입니다.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
});

byId("missionInput").addEventListener("keydown", event => {
  if (event.key === "Enter") addMission();
});

byId("userNameInput").addEventListener("input", event => {
  updateUserName(event.target.value);
});

render();

function toggleMissionWithAnimation(actionTarget, id) {
  const mission = findMission(id);
  const shouldAnimateClear = state.missionFilter === "active" && mission && !mission.done;
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
