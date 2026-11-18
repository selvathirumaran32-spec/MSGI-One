// Announcements (everything that was published) and notifications (invitations, unread messages, new events).
const newAnn = () => shared.ann.filter((a) => a.s === "published" && a.id > (shared.annSeen[st.me.id] || 0)).length;

function announcementsV() {
  const list = shared.ann.filter((a) => a.s === "published");
  shared.annSeen[st.me.id] = Date.now();
  save();
  const form = can("propose_announcement")
    ? `<details class="card pad"><summary style="cursor:pointer;font-weight:600">Propose an announcement</summary><form id="afac" class="fg" style="margin-top:10px"><label>Title<input name="at" required maxlength="80"></label><label>Message<textarea name="ab" required rows="3" maxlength="400" style="border:1px solid var(--line);border-radius:8px;padding:9px 12px;background:var(--card)"></textarea></label><button class="btn gold" type="submit">Submit for approval</button></form></details>`
    : "";
  $("#main").innerHTML = `${form}<div class="cgrid">${list.map((a) => `<div class="card pad"><h3 class="sechead">${esc(a.t)}</h3><p>${esc(a.b)}</p><div class="sub" style="margin-top:6px">${esc(a.by)} · ${ago(a.id)}</div></div>`).join("") || `<div class="card pad"><p class="sub">No announcements yet.</p></div>`}</div>`;
}

function notificationsV() {
  const rows = [];
  invites().forEach((l) => { const p = byId(l.a); rows.push(`<div class="pp">${av(p)}<div class="info"><b>${esc(p.n)}</b> sent you a connection request</div><button class="btn sm" data-accept="${p.id}">Accept</button><button class="btn out sm" data-ignore="${p.id}">Ignore</button></div>`); });
  connectedIds().forEach((id) => { const u = unread(id); if (u) { const p = byId(id); rows.push(`<button class="pp dr" data-msg="${id}">${av(p)}<div class="info"><b>${esc(p.n)}</b> sent you ${u} new message${u > 1 ? "s" : ""}</div>${ic("chevron", 18)}</button>`); } });
  shared.events.slice(-3).reverse().forEach((ev) => rows.push(`<button class="pp dr" data-t="events"><span class="si">${ic("calendar", 20)}</span><div class="info">New event: <b>${esc(ev.t)}</b></div>${ic("chevron", 18)}</button>`));
  shared.ann.filter((a) => a.s === "published").slice(0, 3).forEach((a) => rows.push(`<button class="pp dr" data-t="announcements"><span class="si">${ic("volume", 20)}</span><div class="info"><b>${esc(a.t)}</b><div class="sub">${esc(a.by)} · ${ago(a.id)}</div></div>${ic("chevron", 18)}</button>`));
  $("#main").innerHTML = `<div class="card pad"><h3 class="sechead">Notifications</h3>${rows.join("") || `<p class="sub">You’re all caught up.</p>`}</div>`;
}
