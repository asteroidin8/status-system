export function byId(id) {
  return document.getElementById(id);
}

export function setText(id, value) {
  byId(id).textContent = value;
}

export function setHtml(id, value) {
  byId(id).innerHTML = value;
}
