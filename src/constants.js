export const statNames = {
  focus: "집중력",
  energy: "체력",
  knowledge: "지식",
  life: "생활력"
};

export const storageKeys = {
  missions: "status_missions",
  history: "status_history",
  avatar: "status_avatar",
  userName: "status_user_name"
};

export const defaultAvatar = "";
export const defaultUserName = "USER";
export const defaultMissionFilter = "active";

export const rankRules = [
  { minLevel: 35, name: "S급", className: "rank-s" },
  { minLevel: 25, name: "A급", className: "rank-a" },
  { minLevel: 18, name: "B급", className: "rank-b" },
  { minLevel: 12, name: "C급", className: "rank-c" },
  { minLevel: 7, name: "D급", className: "rank-d" },
  { minLevel: 3, name: "E급", className: "rank-e" },
  { minLevel: 1, name: "F급", className: "rank-f" }
];

export const statKeys = Object.keys(statNames);
