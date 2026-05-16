import { rankRules, statKeys } from "./constants.js";
import { formatLocalDate } from "./date.js";

function createStatTotals() {
  return Object.fromEntries(statKeys.map(key => [key, 0]));
}

export function getMissionCounts(missions) {
  return {
    all: missions.length,
    active: missions.filter(mission => !mission.done).length,
    done: missions.filter(mission => mission.done).length
  };
}

export function getFilteredMissions(missions, missionFilter) {
  if (missionFilter === "active") return missions.filter(mission => !mission.done);
  if (missionFilter === "done") return missions.filter(mission => mission.done);
  return missions;
}

export function getTodayStats(missions) {
  const done = missions.filter(mission => mission.done);
  const totalExp = done.reduce((sum, mission) => sum + mission.exp, 0);
  const clearRate = missions.length ? Math.round(done.length / missions.length * 100) : 0;

  const statGain = createStatTotals();
  const statExp = createStatTotals();

  done.forEach(mission => {
    statGain[mission.stat] += Math.max(1, Math.round(mission.exp / 15));
    statExp[mission.stat] += mission.exp;
  });

  return { done, totalExp, clearRate, statGain, statExp };
}

export function getRecordStats(currentState, today = getTodayStats(currentState.missions)) {
  const totalExpFromHistory = currentState.history.reduce((sum, history) => sum + history.exp, 0);
  const totalMissionFromHistory = currentState.history.reduce((sum, history) => sum + history.doneCount, 0);

  const allClearRates = [
    ...currentState.history.map(history => history.clearRate),
    currentState.missions.length ? today.clearRate : null
  ].filter(value => value !== null);

  return {
    totalExp: totalExpFromHistory + today.totalExp,
    totalMission: totalMissionFromHistory + today.done.length,
    avgClear: getAverage(allClearRates),
    streak: getStreak(currentState, today)
  };
}

export function getStatusSummary(currentState) {
  const today = getTodayStats(currentState.missions);
  const record = getRecordStats(currentState, today);
  const level = getLevel(record.totalExp);

  return {
    today,
    record,
    level,
    currentExp: getCurrentExp(record.totalExp),
    rank: getRank(level)
  };
}

export function getLevel(totalExp) {
  return Math.floor(totalExp / 100) + 1;
}

export function getCurrentExp(totalExp) {
  return totalExp % 100;
}

export function getRank(level) {
  return rankRules.find(rule => level >= rule.minLevel);
}

function getAverage(values) {
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0;
}

function getStreak(currentState, today) {
  const completedDates = currentState.history
    .filter(history => history.doneCount > 0)
    .map(history => history.date);

  if (today.done.length > 0) {
    completedDates.push(currentState.todayKey);
  }

  const uniqueDates = [...new Set(completedDates)].sort().reverse();
  let streak = 0;
  let cursor = new Date(currentState.todayKey);

  for (const date of uniqueDates) {
    const expected = formatLocalDate(cursor);
    if (date !== expected) continue;

    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
