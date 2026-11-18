// Data shared between accounts on this device: connections, messages, posts, recommendations and photos.
// It is saved in localStorage, so a second account signed in on the same browser (or in another tab) sees it.
const SHARED_KEY = "msgi-one-shared";
const emptyShared = () => ({ links: [], msgs: {}, seen: {}, posts: [], recs: {}, photos: {}, roles: {}, susp: {}, audit: [], ann: [], jobs: [], events: [], joined: {}, prof: {}, annSeen: {}, reqs: [] });
function loadShared() {
  try { return { ...emptyShared(), ...JSON.parse(localStorage.getItem(SHARED_KEY) || "{}") }; }
  catch { return emptyShared(); }
}
const shared = loadShared();
function save() {
  try { localStorage.setItem(SHARED_KEY, JSON.stringify(shared)); } catch { /* storage unavailable: data stays in memory */ }
}

// Another tab changed the data: reload it and redraw, keeping anything half-typed.
window.addEventListener("storage", (e) => {
  if (e.key !== SHARED_KEY || !st.me) return;
  Object.assign(shared, loadShared());
  if (st.tab === "profile") return updReq();
  const msg = $("#mf input")?.value, post = $("#np")?.value;
  refresh();
  if (msg && $("#mf input")) $("#mf input").value = msg;
  if (post && $("#np")) $("#np").value = post;
});

// ---- Connections ----
const linkRow = (x, y) => shared.links.find((l) => (l.a === x && l.b === y) || (l.a === y && l.b === x));
function linkState(id) {
  const l = linkRow(st.me.id, id);
  return !l ? "none" : l.s === "connected" ? "connected" : l.a === st.me.id ? "sent" : "received";
}
const isConn = (id) => linkState(id) === "connected";
const connectedIds = () => shared.links.filter((l) => l.s === "connected" && (l.a === st.me.id || l.b === st.me.id)).map((l) => (l.a === st.me.id ? l.b : l.a));
const nConn = () => connectedIds().length;
const invites = () => shared.links.filter((l) => l.s === "pending" && l.b === st.me.id);
function sendInvite(id) { if (!linkRow(st.me.id, id)) { shared.links.push({ a: st.me.id, b: id, s: "pending" }); save(); } }
// Used when someone asks for a recommendation: they are connected with the job poster straight away.
function connectNow(id) {
  const l = linkRow(st.me.id, id);
  if (l) l.s = "connected"; else shared.links.push({ a: st.me.id, b: id, s: "connected" });
  save();
}
function acceptInvite(id) { const l = shared.links.find((x) => x.a === id && x.b === st.me.id); if (l) { l.s = "connected"; save(); } }
function ignoreInvite(id) { shared.links = shared.links.filter((x) => !(x.a === id && x.b === st.me.id && x.s === "pending")); save(); }

// ---- Messages ----
const pairKey = (x, y) => (x < y ? x + "-" + y : y + "-" + x);
const thread = (id) => shared.msgs[pairKey(st.me.id, id)] || [];
function sendMsg(id, t, extra) {
  const k = pairKey(st.me.id, id);
  (shared.msgs[k] = shared.msgs[k] || []).push({ f: st.me.id, t, at: Date.now(), ...extra });
  shared.seen[st.me.id + ":" + id] = shared.msgs[k].length;
  save();
}
function markSeen(id) {
  const k = st.me.id + ":" + id, n = thread(id).length;
  if (shared.seen[k] !== n) { shared.seen[k] = n; save(); }
}
const unread = (id) => thread(id).slice(shared.seen[st.me.id + ":" + id] || 0).filter((m) => m.f === id).length;
const unreadTotal = () => connectedIds().reduce((n, id) => n + unread(id), 0);
