// Events and meetups. Admins publish them; alumni, students and faculty can register.
function eventsV() {
  const list = shared.events.slice().sort((a, b) => a.d.localeCompare(b.d));
  const card = (ev) => {
    const d = new Date(ev.d + "T00:00"), on = ev.regs.includes(st.me.id);
    return `<div class="card evc"><div class="eb"><div class="date"><b>${d.getDate()}</b><span>${d.toLocaleString("en", { month: "short" })}</span></div></div><div class="pad"><h3>${esc(ev.t)}</h3><div class="sub">${ic("clock", 15)} ${esc(ev.tm)}</div><div class="sub">${ic("pin", 15)} ${esc(ev.loc)}</div><div class="sub">${ev.regs.length} registered</div>${on ? `<button class="btn out block done" disabled style="margin-top:10px">Registered</button>` : `<button class="btn gold block" data-reg="${ev.id}" style="margin-top:10px">Register Now</button>`}</div></div>`;
  };
  $("#main").innerHTML = `<div class="cgrid">${list.map(card).join("") || `<div class="card pad"><p class="sub">No upcoming events yet.</p></div>`}</div>`;
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-reg]");
  if (!b || !st.me || !can("network")) return;
  const ev = shared.events.find((x) => x.id === +b.dataset.reg);
  if (ev && !ev.regs.includes(st.me.id)) { ev.regs.push(st.me.id); save(); toast("You’re registered for " + ev.t); }
  refresh();
});
