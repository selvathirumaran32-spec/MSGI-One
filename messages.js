// Messages between connected people. Threads are shared, so the other person sees them after signing in on this device.
// Phone: the conversation list, then one thread at a time. Laptop: both side by side.
function convList(list) {
  const row = (p) => {
    const last = thread(p.id).slice(-1)[0], n = unread(p.id);
    return `<button class="dr ci${p.id === st.chat && isWide() ? " on" : ""}" data-chat="${p.id}">${av(p, 1)}<div class="info"><div class="name">${esc(p.n)}${n ? ` <span class="dot">${n}</span>` : ""}</div><div class="sub">${esc(last ? last.t : hl(p))}</div></div>${last ? `<span class="sub">${clock(last.at)}</span>` : ""}</button>`;
  };
  return list.map(row).join("");
}

const fileChip = (f) => `<a class="fchip" data-mid="${f.mid}" download="${esc(f.name)}">${ic("file", 20)}<span><b>${esc(f.name)}</b><small>${fmtSize(f.size)} · Download</small></span></a>`;
function fileMsg(f) {
  const t = f.type || "";
  return `${t.startsWith("image/") ? `<img class="chatimg" data-mid="${f.mid}" alt="${esc(f.name)}">` : t.startsWith("video/") ? `<video class="chatimg" data-mid="${f.mid}" controls playsinline preload="metadata"></video>` : ""}${fileChip(f)}`;
}
function recCard(r) {
  const row = (k, v) => (v ? `<div class="rr"><span>${k}</span><b>${esc(v)}</b></div>` : "");
  return `<div class="reccard"><h4>Recommendation request</h4><p><b>${esc(r.name)}</b> is asking for a recommendation for <b>${esc(r.job.t)}</b> at ${esc(r.job.co)}.</p>${row("Register No", r.reg)}${row("Qualification", r.qual)}${row("Current location", r.loc)}${row("Current role", r.role)}${row("Company", r.co)}${row("Experience", r.exp)}${row("Skills", r.skills)}${row("Email", r.email)}${row("Phone", r.phone)}${row("Link", r.link)}${row("Note", r.note)}${r.resume ? fileChip(r.resume) : `<p class="sub">No resume attached.</p>`}</div>`;
}

function threadHTML(c) {
  const m = thread(c.id);
  markSeen(c.id);
  const lastMine = m.map((x) => x.f).lastIndexOf(st.me.id), readN = shared.seen[c.id + ":" + st.me.id] || 0;
  const head = isWide() ? `<div class="chead">${av(c, 1)}<div><div class="name"><a href="#profile" data-prof="${c.id}" style="color:inherit;text-decoration:none">${esc(c.n)}</a></div><div class="sub">${esc(hl(c))}</div></div></div>` : "";
  const body = (x) => (x.rec ? recCard(x.rec) : x.file ? fileMsg(x.file) : esc(x.t));
  return `<div class="thread">${head}<div class="msgs" id="msgs">${m.length ? m.map((x, i) => `<div class="m ${x.f === st.me.id ? "mine" : "th"}${x.rec ? " rec" : ""}">${body(x)}<small>${clock(x.at)}</small></div>${i === lastMine ? `<div class="tick">${i < readN ? "✓✓ Read" : "✓ Sent"}</div>` : ""}`).join("") : `<p class="sub" style="text-align:center">Say hello to ${esc(c.n.split(" ")[0])}.</p>`}</div>
    <form id="mf" class="mform"><div class="plusw"><button type="button" class="plus" data-plus aria-label="Attach a file, photo or video">${ic("plus", 22)}</button><div class="attmenu" hidden>
      <label>${ic("file", 18)} Document<input type="file" data-afile hidden></label><label>${ic("image", 18)} Photo<input type="file" accept="image/*" data-afile hidden></label><label>${ic("video", 18)} Video<input type="file" accept="video/*" data-afile hidden></label></div></div>
      <input name="mt" placeholder="Type a message..." autocomplete="off" required aria-label="Message"><button class="send" aria-label="Send">${ic("send", 20)}</button></form></div>`;
}

function messagesV() {
  const list = connectedIds().map(byId);
  if (!list.length) {
    $("#main").innerHTML = `<div class="card pad" style="text-align:center"><h2 class="sechead">Messages</h2><p class="sub" style="margin-bottom:14px">You can message someone once they accept your invitation. Send a few connection requests to get started.</p><button class="btn gold" data-t="network">Find alumni</button></div>`;
    return;
  }
  const wide = isWide();
  if (wide && !list.some((p) => p.id === st.chat)) st.chat = list[0].id;
  if (!wide && (!st.chatOpen || !list.some((p) => p.id === st.chat))) {
    st.chatOpen = false;
    $("#main").innerHTML = `<div class="card">${convList(list)}</div>`;
    return;
  }
  const c = byId(st.chat);
  $("#main").innerHTML = wide ? `<div class="split"><div class="clist">${convList(list)}</div>${threadHTML(c)}</div>` : threadHTML(c);
  const el = $("#msgs");
  el.scrollTop = el.scrollHeight;
}

// The + button: open the attach menu.
document.addEventListener("click", (e) => {
  const menu = $(".attmenu");
  if (!menu) return;
  if (e.target.closest("[data-plus]")) { menu.hidden = !menu.hidden; return; }
  if (!e.target.closest(".attmenu")) menu.hidden = true;
});

// Send a file, photo or video (up to 1 GB). It is saved in the browser's IndexedDB and shown as a message.
document.addEventListener("change", async (e) => {
  const inp = e.target.closest ? e.target.closest("[data-afile]") : null;
  if (!inp || !inp.files[0] || !st.me) return;
  const f = inp.files[0];
  if (f.size > MAX_SHARE) return toast("Files can be up to 1 GB");
  toast(`Sending ${f.name} (${fmtSize(f.size)})…`);
  try {
    const mid = "m" + Date.now() + Math.random().toString(36).slice(2, 6);
    await putMedia(mid, f);
    sendMsg(st.chat, f.name, { file: { mid, name: f.name, size: f.size, type: f.type } });
    refresh();
  } catch { toast("This browser couldn’t store that file. Try a smaller one."); }
});
