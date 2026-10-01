// Minimal pub/sub used by store.js (SPA component helpers removed).

const SUB = {};

export function subscribe(id, fn) {
  (SUB[id] ||= []).push(fn);
}

export function notify(id) {
  const list = SUB[id];
  if (!list) return;
  for (let i = 0; i < list.length; i++) list[i](id);
}
