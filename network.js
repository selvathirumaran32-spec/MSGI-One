// Alumni directory: search, filters, invitations and connect buttons.
function connBtn(id){
  const s=linkState(id);
  if(s==="connected")return`<button class="btn out sm done" disabled>Connected</button> <button class="btn sm" data-msg="${id}">Message</button>`;
  if(s==="sent")return`<button class="btn out sm done" disabled>Pending</button>`;
  if(s==="received")return`<button class="btn sm" data-accept="${id}">Accept</button> <button class="btn out sm" data-ignore="${id}">Ignore</button>`;
  return`<button class="btn sm" data-conn="${id}">Connect</button>`;
}

// Invitations other people sent to the signed-in user.
function inviteCard(){
  const inv=invites();if(!inv.length)return"";
  return`<div class="card pad"><h3 class="sechead">Invitations (${inv.length})</h3>${inv.map(l=>{const p=byId(l.a);return`<div class="pp">${av(p)}<div class="info"><div class="name"><a href="#profile" data-prof="${p.id}" style="color:inherit;text-decoration:none">${esc(p.n)}</a></div><div class="sub">${esc(p.f)} · ${tag(p)}</div></div><button class="btn sm" data-accept="${p.id}">Accept</button><button class="btn out sm" data-ignore="${p.id}">Ignore</button></div>`}).join("")}</div>`;
}

const BATCHES = [...new Set(P.filter((p) => p.b).map((p) => p.b))].sort((a, b) => b - a);
const DEPT_NAMES = DEPTS.map((d) => d.name);

function dirHTML() {
  const q = st.q.trim().toLowerCase();
  const rows = P.filter((p) => listed(p) && p.id !== st.me.id && (!st.fb || String(p.b) === st.fb) && (!st.fd || p.f === st.fd) && (!st.fs || roleOf(p) === st.fs) && (!q || p.s.includes(q)));
  const shown = rows.slice(0, st.limit);
  return shown.map((p) => `<div class="dr">${av(p, 1)}<div class="info"><div class="name"><a href="#profile" data-prof="${p.id}" style="color:inherit;text-decoration:none">${esc(p.n)}</a></div><div class="sub">${p.reg} · ${ROLE_LABEL[roleOf(p)]}</div><div>${esc(hl(p))}</div><div class="sub">${p.c}, India</div></div>${connBtn(p.id)}</div>`).join("")
    || `<p class="empty">${st.q||st.fd||st.fb||st.fs?"No one matches that search.":"No one has joined yet. People appear here after they sign in to MSGI Alumni One."}</p>`
    + (rows.length > shown.length ? `<div style="text-align:center;padding:12px"><button class="btn out" data-more>Show More ↓</button></div>` : "");
}

function network() {
  const chip = (k, l) => `<button type="button" class="chipb${st.fs === k ? " on" : ""}" data-fs="${k}">${l}</button>`;
  const opt = (v, label, cur) => `<option value="${v}" ${v === cur ? "selected" : ""}>${label}</option>`;
  $("#main").innerHTML = `${inviteCard()}<label class="searchbar">${ic("search", 20)}<input id="dq" type="search" placeholder="Search by name or reg. no." value="${esc(st.q)}" aria-label="Search alumni"></label>
    <div class="chips">${chip("", "All")}${chip("alumni", "Alumni")}${chip("student", "Students")}${chip("faculty", "Faculty")}
    <select id="fd" aria-label="Department"><option value="">Department</option>${DEPT_NAMES.map((x) => opt(x, x, st.fd)).join("")}</select>
    <select id="fb" aria-label="Batch"><option value="">Batch</option>${BATCHES.map((x) => opt(String(x), `${x}-${x + 3}`, st.fb)).join("")}</select></div>
    <div class="card" id="dir">${dirHTML()}</div>`;
  $("#fd").onchange = (e) => { st.fd = e.target.value; st.limit = 24; $("#dir").innerHTML = dirHTML(); };
  $("#fb").onchange = (e) => { st.fb = e.target.value; st.limit = 24; $("#dir").innerHTML = dirHTML(); };
}

document.addEventListener("input", (e) => {
  if (e.target.id === "dq") { st.q = e.target.value; st.limit = 24; $("#dir").innerHTML = dirHTML(); }
});
document.addEventListener("click", (e) => {
  const c = e.target.closest("[data-fs]");
  if (c) { st.fs = c.dataset.fs; st.limit = 24; refresh(); }
});
