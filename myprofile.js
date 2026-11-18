// My profile: details filled from my college record, an editable section, photo upload and role permissions.
const ROLE_CAN = {
  super: ["Manage administrators, users and roles", "Approve announcements and platform changes", "View analytics and the audit log"],
  admin: ["Manage student and alumni accounts", "Publish events and propose announcements", "View platform activity and the audit log"],
  faculty: ["Connect with students and alumni", "Share guidance and mentor", "Propose workshops and announcements"],
  alumni: ["Connect with members", "Send and receive messages", "Post jobs and updates"],
  student: ["Connect with alumni, mentors and students", "Send and receive messages", "Apply for jobs and join events"],
};

function myProfileV() {
  const m = st.me, r = roleOf(m), x = shared.prof[m.id] || {};
  const rows = [["Register No", m.reg], [r === "student" ? "Year" : "Batch", r === "student" ? `${m.yr} (${m.bn})` : m.bn || "-"], ["Department", m.f], ["College", COLLEGE], ["Location", m.c + ", India"]];
  const todo = !shared.photos[m.id] || !x.role;
  $("#main").innerHTML = `<div class="hgrid"><div class="stack">${todo ? `<div class="note">Complete your profile: add a photo and your current role so other alumni can find you.</div>` : ""}
    <div class="card pad" style="text-align:center">${av(m, 2)}<h2 style="font-size:1.3rem">${esc(m.n)}</h2><div class="sub">${esc(hl(m))}</div>
    <label class="btn out sm" style="margin-top:12px;cursor:pointer">${shared.photos[m.id] ? "Change photo" : "Upload photo"}<input type="file" accept="image/*" data-photo hidden></label></div>
    <div class="card pad"><h3 class="sechead">Edit profile</h3><form id="pf" class="fg"><label>Current role<input name="pr" maxlength="60" value="${esc(x.role || "")}" placeholder="e.g. Software Engineer"></label><label>Company<input name="pc" maxlength="60" value="${esc(x.co || "")}" placeholder="e.g. TCS"></label>
    <label>Current location<input name="pl" maxlength="80" value="${esc(x.loc || "")}" placeholder="e.g. Bengaluru, India"></label><label>Experience<input name="px" maxlength="20" value="${esc(x.exp || "")}" placeholder="e.g. 3 years"></label>
    <label>Skills<input name="ps" maxlength="200" value="${esc(x.skills || "")}" placeholder="e.g. Java, SQL, React"></label><label>Qualification<input name="pq" maxlength="120" value="${esc(x.qual || "")}" placeholder="${esc(`${m.r}, batch ${m.bn || m.yr}`)}"></label>
    <label>About<textarea name="pa" rows="3" maxlength="300" style="border:1px solid var(--line);border-radius:8px;padding:9px 12px;background:var(--card)">${esc(x.about || "")}</textarea></label>
    <p class="sub" style="margin:0">Private contact details. They are shared only when you ask for a recommendation.</p>
    <label>Email<input name="pe" type="email" maxlength="80" value="${esc(x.email || "")}"></label><label>Phone<input name="pp" maxlength="20" value="${esc(x.phone || "")}"></label><label>LinkedIn or portfolio link<input name="pk" maxlength="120" value="${esc(x.link || "")}"></label>
    <button class="btn gold" type="submit">Save profile</button></form></div>
    <div class="card pad"><h3 class="sechead">My resume</h3>${x.resume ? `<a class="fchip" data-mid="${x.resume.mid}" download="${esc(x.resume.name)}">${ic("file", 20)}<span><b>${esc(x.resume.name)}</b><small>${fmtSize(x.resume.size)} · Download</small></span></a><p style="margin-top:8px"><button type="button" class="linkbtn" data-rmres>Remove resume</button></p>` : `<p class="sub">Upload your resume once and it is kept here, ready to attach when you ask for a recommendation.</p>`}
    <label class="btn out sm" style="margin-top:10px;cursor:pointer">${x.resume ? "Replace resume" : "Upload resume"}<input type="file" accept=".pdf,.doc,.docx,.txt,image/*" data-resume hidden></label><p class="sub" style="margin-top:6px">PDF, Word or image, up to 100 MB.</p></div></div></div>
    <div class="stack"><div class="card pad"><h3 class="sechead">My details</h3>${rows.map(([k, v]) => `<div class="row"><span>${k}</span><b>${esc(String(v))}</b></div>`).join("")}</div>
    <div class="card pad"><h3 class="sechead">Role &amp; Permissions</h3><p style="margin-bottom:8px"><span class="gb">${ROLE_LABEL[r]}</span></p>${(ROLE_CAN[r] || []).map((t) => `<div class="pp" style="padding:4px 0;color:var(--blue)">${ic("shield", 18)}<span style="color:var(--ink)">${t}</span></div>`).join("")}</div>
    <div class="banner"><h3>MSGI Alumni One<br><span style="color:var(--gold)">Stronger Together</span></h3></div>
    <button class="btn out block" data-so>Sign out</button></div></div>`;
}

document.addEventListener("submit", (e) => {
  if (e.target.id !== "pf") return;
  e.preventDefault();
  const fd = new FormData(e.target);
  const g = (k) => fd.get(k).trim();
  shared.prof[st.me.id] = { ...(shared.prof[st.me.id] || {}), role: g("pr"), co: g("pc"), loc: g("pl"), exp: g("px"), skills: g("ps"), qual: g("pq"), about: g("pa"), email: g("pe"), phone: g("pp"), link: g("pk") };
  save();
  toast("Profile saved");
  refresh();
});

// Upload or remove my saved resume.
document.addEventListener("change", async (e) => {
  const inp = e.target.closest ? e.target.closest("[data-resume]") : null;
  if (!inp || !inp.files[0] || !st.me) return;
  const f = inp.files[0];
  if (f.size > MAX_RESUME) return toast("The resume must be under 100 MB");
  try {
    const mid = "m" + Date.now() + Math.random().toString(36).slice(2, 6), old = (shared.prof[st.me.id] || {}).resume;
    await putMedia(mid, f);
    shared.prof[st.me.id] = { ...(shared.prof[st.me.id] || {}), resume: { mid, name: f.name, size: f.size, type: f.type } };
    if (old) delMedia(old.mid);
    save(); toast("Resume saved"); refresh();
  } catch { toast("This browser couldn’t save the resume"); }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-rmres]") || !st.me) return;
  const x = shared.prof[st.me.id] || {};
  if (x.resume) { delMedia(x.resume.mid); delete x.resume; save(); toast("Resume removed"); refresh(); }
});
