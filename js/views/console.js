// Console for Super Admins and Admins: overview, users, announcements, admins and the audit log.
function consoleV() {
  const tabs = [["overview", "Overview"], ["users", "Users"], ["ann", "Announcements"], ...(can("manage_events") ? [["events", "Events"]] : []), ...(can("manage_admins") ? [["admins", "Admins"]] : []), ["audit", "Audit log"]];
  if (!tabs.some((t) => t[0] === st.ct)) st.ct = "overview";
  const body = { overview: overviewHTML, users: usersHTML, ann: announceHTML, events: eventsAdminHTML, admins: adminsHTML, audit: auditHTML }[st.ct]();
  $("#main").innerHTML = `<div class="card pad"><h2 class="sechead">${ROLE_LABEL[myRole()]} console</h2><div class="filters">${tabs.map(([k, l]) => `<button type="button" class="btn sm${st.ct === k ? "" : " out"}" data-ct="${k}">${l}</button>`).join("")}</div></div>${body}`;
}

function overviewHTML() {
  const c = {};
  P.forEach((p) => { const r = roleOf(p); c[r] = (c[r] || 0) + 1; });
  const conn = shared.links.filter((l) => l.s === "connected").length;
  const msgs = Object.values(shared.msgs).reduce((n, t) => n + t.length, 0);
  const card = (n, l) => `<div class="card pc"><b style="font-size:1.6rem">${n.toLocaleString()}</b><span class="sub">${l}</span></div>`;
  return `<div class="card pad"><h3 class="sechead">Platform overview</h3><div class="grid">${card(c.alumni || 0, "Alumni")}${card(c.student || 0, "Students")}${card(c.faculty || 0, "Faculty")}${card(c.admin || 0, "Admins")}${card(Object.keys(shared.susp).length, "Suspended")}${card(conn, "Connections")}${card(msgs, "Messages sent")}${card(shared.ann.filter((a) => a.s === "pending").length, "Awaiting approval")}</div></div>`;
}

function userRow(p) {
  const opts = assignable(p), sus = !!shared.susp[p.id];
  return `<div class="q">${av(p)}<div class="info"><div class="name">${esc(p.n)} · ${p.reg}</div><div class="sub">${ROLE_LABEL[roleOf(p)] || roleOf(p)}${sus ? " · Suspended" : ""}</div></div>
    ${opts.length ? `<select data-rs="${p.id}">${opts.map((o) => `<option value="${o}">${ROLE_LABEL[o]}</option>`).join("")}</select><button class="btn sm" data-rset="${p.id}">Set role</button>` : ""}
    ${can("suspend") && p.id !== st.me.id && roleOf(p) !== "super" && !(myRole() === "admin" && roleOf(p) === "admin") ? `<button class="btn out sm" data-susp="${p.id}">${sus ? "Reinstate" : "Suspend"}</button>` : ""}</div>`;
}
function usersList() {
  const q = (st.cq || "").trim().toLowerCase();
  const rows = q ? P.filter((p) => p.s.includes(q)).slice(0, 15) : [];
  return rows.map(userRow).join("") || `<p class="sub">${q ? "No one matches." : "Search to find a user."}</p>`;
}
function usersHTML() {
  return `<div class="card pad"><h3 class="sechead">Manage users</h3><input id="cu" class="search" style="max-width:none;margin-bottom:10px" placeholder="Search by name or register number" value="${esc(st.cq || "")}"><div id="ures">${usersList()}</div></div>`;
}

function announceHTML() {
  const pub = can("approve_announcements");
  const list = shared.ann.slice(0, 15).map((a) => `<div class="q"><div class="info"><div class="name">${esc(a.t)} <span class="${a.s === "published" ? "vb" : "sub"}">${a.s}</span></div><div class="sub">${esc(a.b)}<br>By ${esc(a.by)}</div></div>${a.s === "pending" && pub ? `<button class="btn sm" data-aok="${a.id}">Approve</button><button class="btn out sm" data-ano="${a.id}">Reject</button>` : ""}</div>`).join("") || `<p class="sub">No announcements yet.</p>`;
  return `<div class="card pad"><h3 class="sechead">New announcement</h3><form id="anf" class="fg"><label>Title<input name="at" required maxlength="80"></label><label>Message<textarea name="ab" required rows="3" maxlength="400" style="border:1px solid var(--line);border-radius:8px;padding:9px 12px;background:var(--card)"></textarea></label><button class="btn gold" type="submit">${pub ? "Publish announcement" : "Submit for Super Admin approval"}</button></form></div><div class="card pad"><h3 class="sechead">Announcements</h3>${list}</div>`;
}

function adminsHTML() {
  const rows = P.filter((p) => roleOf(p) === "admin").map((p) => `<div class="q">${av(p)}<div class="info"><div class="name">${esc(p.n)} · ${p.reg}</div><div class="sub">Admin</div></div><button class="btn out sm" data-radm="${p.id}">Remove admin</button></div>`).join("");
  return `<div class="card pad"><h3 class="sechead">Administrator accounts</h3>${rows || `<p class="sub">No administrators.</p>`}<p class="sub" style="margin-top:10px">To make someone an Admin, find them in Users and set their role.</p></div>`;
}

function auditHTML() {
  const rows = shared.audit.slice(0, 50).map((a) => `<div class="q"><div class="info"><div class="name">${esc(a.action)}</div><div class="sub">${esc(a.target)}<br>${esc(a.by)} (${ROLE_LABEL[a.role]}) · ${new Date(a.at).toLocaleString()}</div></div></div>`).join("");
  return `<div class="card pad"><h3 class="sechead">Audit log</h3>${rows || `<p class="sub">No administrator actions recorded yet.</p>`}</div>`;
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-ct],[data-rset],[data-susp],[data-aok],[data-ano],[data-radm]");
  if (!t || !st.me || !can("console")) return;
  const d = t.dataset, who = (p) => `${p.n} (${p.reg})`;
  if (d.ct) { st.ct = d.ct; return refresh(); }
  if (d.rset) {
    const p = byId(+d.rset), r = document.querySelector(`select[data-rs="${d.rset}"]`).value;
    if (!assignable(p).includes(r)) return toast("You don’t have permission for that");
    const old = roleOf(p);
    shared.roles[p.id] = r;
    audit(`Changed role from ${ROLE_LABEL[old]} to ${ROLE_LABEL[r]}`, who(p));
    return refresh();
  }
  if (d.susp) {
    const p = byId(+d.susp);
    if (!can("suspend") || p.id === st.me.id || roleOf(p) === "super" || (myRole() === "admin" && roleOf(p) === "admin")) return toast("You don’t have permission for that");
    if (shared.susp[p.id]) { delete shared.susp[p.id]; audit("Reinstated account", who(p)); }
    else { shared.susp[p.id] = Date.now(); audit("Suspended account", who(p)); }
    return refresh();
  }
  if (d.aok || d.ano) {
    if (!can("approve_announcements")) return toast("You don’t have permission for that");
    const a = shared.ann.find((x) => x.id === +(d.aok || d.ano));
    a.s = d.aok ? "published" : "rejected";
    audit(d.aok ? "Approved announcement" : "Rejected announcement", a.t);
    return refresh();
  }
  if (d.radm) {
    if (!can("manage_admins")) return toast("You don’t have permission for that");
    const p = byId(+d.radm);
    shared.roles[p.id] = "removed";
    audit("Removed administrator account", who(p));
    refresh();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "cu") { st.cq = e.target.value; $("#ures").innerHTML = usersList(); }
});

// Announcements from the console and from faculty. Only the Super Admin publishes straight away; everyone else needs approval.
document.addEventListener("submit", (e) => {
  if (e.target.id !== "anf" && e.target.id !== "afac") return;
  e.preventDefault();
  if (!st.me || !(can("publish_announcement") || can("propose_announcement"))) return toast("You don’t have permission for that");
  const fd = new FormData(e.target), pub = can("approve_announcements"), title = fd.get("at").trim();
  shared.ann.unshift({ id: Date.now(), t: title, b: fd.get("ab").trim(), by: st.me.n, s: pub ? "published" : "pending" });
  audit(pub ? "Published announcement" : "Submitted announcement for approval", title);
  toast(pub ? "Announcement published" : "Sent to the Super Admin for approval");
  refresh();
});

// ---- Events (Super Admin and Admin) ----
function eventsAdminHTML() {
  const rows = shared.events.map((ev) => `<div class="q"><div class="info"><div class="name">${esc(ev.t)}</div><div class="sub">${esc(ev.d)} · ${esc(ev.tm)} · ${esc(ev.loc)} · ${ev.regs.length} registered</div></div><button class="btn out sm" data-evdel="${ev.id}">Remove</button></div>`).join("") || `<p class="sub">No events yet.</p>`;
  return `<div class="card pad"><h3 class="sechead">New event</h3><form id="evf" class="fg"><label>Title<input name="et" required maxlength="80"></label><label>Date<input name="ed" type="date" required></label><label>Time<input name="etm" required placeholder="10:00 AM - 1:00 PM"></label><label>Location<input name="el" required maxlength="80" placeholder="MSGI Campus, Chennai"></label><button class="btn gold" type="submit">Publish event</button></form></div><div class="card pad"><h3 class="sechead">Events</h3>${rows}</div>`;
}
document.addEventListener("submit", (e) => {
  if (e.target.id !== "evf") return;
  e.preventDefault();
  if (!st.me || !can("manage_events")) return toast("You don’t have permission for that");
  const fd = new FormData(e.target), title = fd.get("et").trim();
  shared.events.push({ id: Date.now(), t: title, d: fd.get("ed"), tm: fd.get("etm").trim(), loc: fd.get("el").trim(), regs: [] });
  audit("Published event", title);
  toast("Event published");
  refresh();
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-evdel]");
  if (!b || !st.me || !can("manage_events")) return;
  const ev = shared.events.find((x) => x.id === +b.dataset.evdel);
  shared.events = shared.events.filter((x) => x !== ev);
  audit("Removed event", ev.t);
  refresh();
});
