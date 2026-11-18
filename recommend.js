// "Recommend me": the person fills in their details, attaches a resume, and the request goes to the job poster as a chat message.
function recommendV() {
  const j = shared.jobs.find((x) => x.id === st.rjob);
  if (!j) return go("jobs");
  const m = st.me, x = shared.prof[m.id] || {}, a = byId(j.a);
  const v = (k, d = "") => esc(x[k] || d);
  const area = (name, val, ph) => `<textarea name="${name}" rows="2" maxlength="300" placeholder="${ph}" style="border:1px solid var(--line);border-radius:8px;padding:9px 12px;background:var(--card)">${val}</textarea>`;
  $("#main").innerHTML = `<div class="card pad"><h3>${esc(j.t)}</h3><div>${esc(j.co)} · ${esc(j.loc || a.c + ", India")}</div><div class="sub">Posted by ${esc(a.n)}. Your details below go to them as a chat message, and you will be connected with ${esc(a.n.split(" ")[0])} automatically.</div></div>
    <form id="rqf" class="card pad fg" style="max-width:none"><h3 class="sechead">Your details for the recommender</h3>
      <label>Current location *<input name="loc" required maxlength="80" value="${v("loc", m.c + ", India")}"></label>
      <label>Current role *<input name="role" required maxlength="60" value="${v("role")}" placeholder="e.g. Software Engineer"></label>
      <label>Company *<input name="co" required maxlength="60" value="${v("co")}" placeholder="e.g. TCS"></label>
      <label>Experience (years) *<input name="exp" required maxlength="20" value="${v("exp")}" placeholder="e.g. 3 years"></label>
      <label>Skills *<input name="skills" required maxlength="200" value="${v("skills")}" placeholder="e.g. Java, SQL, React"></label>
      <label>Qualification<input name="qual" maxlength="120" value="${v("qual", `${m.r}, batch ${m.bn || m.yr}`)}"></label>
      <label>Email<input name="email" type="email" maxlength="80" value="${v("email")}"></label>
      <label>Phone<input name="phone" maxlength="20" value="${v("phone")}"></label>
      <label>LinkedIn or portfolio link<input name="link" maxlength="120" value="${v("link")}"></label>
      <label>Message to ${esc(a.n.split(" ")[0])}${area("note", "", "Why you are a good fit for this role")}</label>
      <div><b>Resume</b>${x.resume ? `<label class="chk" style="margin:6px 0"><input type="checkbox" name="usesaved" checked>Attach my saved resume: ${esc(x.resume.name)} (${fmtSize(x.resume.size)})</label>` : `<p class="sub">No resume saved yet. Upload one now and it will be kept in your profile.</p>`}
        <label>${x.resume ? "Or upload a different resume" : "Upload resume"} (up to 100 MB)<input name="rfile" type="file" accept=".pdf,.doc,.docx,.txt,image/*"></label></div>
      <button class="btn gold" type="submit">Send recommendation request</button></form>`;
}

document.addEventListener("submit", async (e) => {
  if (e.target.id !== "rqf") return;
  e.preventDefault();
  const j = shared.jobs.find((x) => x.id === st.rjob);
  if (!j || !st.me) return;
  if (j.a === st.me.id) return toast("This is your own post");
  if (shared.reqs.some((r) => r.job === j.id && r.from === st.me.id)) { st.chat = j.a; st.chatOpen = true; toast("You have already asked for this one"); return go("messages"); }
  const fd = new FormData(e.target), g = (k) => (fd.get(k) || "").trim();
  const prof = { ...(shared.prof[st.me.id] || {}), role: g("role"), co: g("co"), loc: g("loc"), exp: g("exp"), skills: g("skills"), qual: g("qual"), email: g("email"), phone: g("phone"), link: g("link") };
  const file = e.target.rfile.files[0];
  if (file) {
    if (file.size > MAX_RESUME) return toast("The resume must be under 100 MB");
    try { const mid = "m" + Date.now() + Math.random().toString(36).slice(2, 6); await putMedia(mid, file); prof.resume = { mid, name: file.name, size: file.size, type: file.type }; }
    catch { return toast("This browser couldn’t save the resume"); }
  }
  shared.prof[st.me.id] = prof;
  const resume = file ? prof.resume : fd.get("usesaved") && prof.resume ? prof.resume : null;
  connectNow(j.a);
  shared.reqs.push({ id: Date.now(), job: j.id, from: st.me.id, to: j.a, at: Date.now() });
  sendMsg(j.a, "Is asking for a recommendation: " + j.t, { rec: { job: { id: j.id, t: j.t, co: j.co }, name: st.me.n, reg: st.me.reg, qual: prof.qual, loc: prof.loc, role: prof.role, co: prof.co, exp: prof.exp, skills: prof.skills, email: prof.email, phone: prof.phone, link: prof.link, note: g("note"), resume } });
  st.chat = j.a; st.chatOpen = true;
  toast("Request sent. You are now connected with " + byId(j.a).n);
  go("messages");
});
