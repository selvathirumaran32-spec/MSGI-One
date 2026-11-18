// Home: quick access buttons and the posts feed. On a laptop the feed sits on the left and my summary on the right.
function tiles() {
  const tile = (t, label, i, n) => `<button class="tile" data-t="${t}">${n ? `<span class="dot">${n}</span>` : ""}<span class="ti">${ic(i, 26)}</span><span>${label}</span></button>`;
  return tile("messages", "Messages", "chat", unreadTotal()) + tile("network", "Connections", "users", invites().length) + tile("jobs", "Jobs", "briefcase")
    + tile("announcements", "Announcements", "volume", newAnn()) + tile("events", "Events", "calendar", shared.events.length)
    + tile("map", "Alumni Map", "pin") + tile("network", "Directory", "search") + tile("notifications", "Notifications", "bell", invites().length + unreadTotal());
}

function home() {
  const m = st.me;
  const stat = (i, n, l) => `<div><span class="si">${ic(i, 20)}</span><b>${n}</b><span>${l}</span></div>`;
  const latest = shared.ann.filter((a) => a.s === "published").slice(0, 2).map((a) => `<div class="pp"><div class="info"><div class="name">${esc(a.t)}</div><div class="sub">${esc(a.by)} · ${ago(a.id)}</div></div></div>`).join("");
  $("#main").innerHTML = `<div class="qa qa-m">${tiles()}</div><div class="hgrid"><div class="stack">${composer()}${feedHTML()}</div>
    <div class="stack only-wide"><div class="card pad"><div class="ph">${av(m, 1)}<div><h2>${esc(m.n)}</h2><span class="gb">${ROLE_LABEL[myRole()]}</span><div class="sub">${esc(hl(m))}</div></div></div>
    <div class="stats">${stat("users", nConn(), "Connections")}${stat("bell", invites().length, "Invitations")}${stat("briefcase", shared.jobs.filter((j) => j.a === m.id).length, "Jobs posted")}</div></div>
    <h3 class="sechead" style="margin:6px 0 0">Quick Access</h3><div class="qa">${tiles()}</div>
    ${latest ? `<div class="card pad"><div class="rh"><h3 class="sechead">Announcements</h3><a href="#announcements" data-t="announcements">View All</a></div>${latest}</div>` : ""}</div></div>`;
}
