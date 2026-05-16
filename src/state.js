import { defaultState, storageKeys } from "./constants.js";
import { formatLocalDate } from "./date.js";
import { readJson, writeJson } from "./storage.js";

export const state = {
  missions: readJson(storageKeys.missions, []),
  history: readJson(storageKeys.history, []),
  avatar: localStorage.getItem(storageKeys.avatar) || defaultState.avatar,
  userName: localStorage.getItem(storageKeys.userName) || defaultState.userName,
  missionFilter: defaultState.missionFilter,
  todayKey: formatLocalDate()
};

export function saveState() {
  writeJson(storageKeys.missions, state.missions);
  writeJson(storageKeys.history, state.history);
  localStorage.setItem(storageKeys.avatar, state.avatar);
  localStorage.setItem(storageKeys.userName, state.userName);
}
