// Jobs and internships. Alumni post openings; anyone else can press "Recommend me" to ask the poster for a recommendation.
function jobsV() {
  const form = can("post_job")
    ? `<details class="card pad"><summary style="cursor:pointer;font-weight:600">Post a job or internship</summary><form id="jf" class="fg" style="margin-top:10px"><label>Job title<input name="jt" required maxlength="60"></label><label>Company<input name="jc" required maxlength="60"></label>
      <label>Location<input name="jl" maxlength="60" placeholder="e.g. Chennai or Remote"></label><label>Vacancies<input name="jv" type="number" min="1" max="999" value="1"></label>
      <label>Type<select name="jk"><option>Full-Time</option><option>Internship</option><option>Referral</option></select></label>
      <label>Details<textarea name="jd" rows="3" maxlength="500" placeholder="Skills, experience, how to apply" style="border:1px solid var(--line);border-radius:8px;padding:9px 12px;background:var(--card)"></textarea></label>
      <button class="btn gold" type="submit">Post vacancy</button></form></details>`
    : "";
  const f = st.jf || "all";
  const tab = (k, l) => `<button type="button" class="tabb${f === k ? " on" : ""}" data-jf="${k}">${l}</button>`;
  const list = shared.jobs.filter((j) => f === "all" || (f === "int") === (j.k === "Internship")).map((j) => {
    const a = byId(j.a), mine = j.a === st.me.id, asked = shared.reqs.some((r) => r.job === j.id && r.from === st.me.id), n = shared.reqs.filter((r) => r.job === j.id).length;
    const action = mine ? `<span class="sub">${n ? `${n} recommendation request${n > 1 ? "s" : ""}` : "Your post"}</span>`
      : asked ? `<button class="btn out sm done" disabled>Requested</button>` : `<button class="btn gold sm" data-rec="${j.id}">Recommend me</button>`;
    return `<div class="card job"><div class="clogo" style="background:hsl(${hue(j.co)} 55% 42%)">${esc(j.co[0].toUpperCase())}</div><div class="info"><h3>${esc(j.t)}</h3><div>${esc(j.co)} · ${esc(j.loc || a.c + ", India")}</div><div><span class="typ">${esc(j.k)}</span>${j.vac ? ` <span class="typ">${j.vac} vacanc${j.vac > 1 ? "ies" : "y"}</span>` : ""}</div>${j.d ? `<p class="jd">${esc(j.d)}</p>` : ""}<div class="sub">Posted ${j.at ? ago(j.at) : "recently"} by ${esc(a.n)}</div></div>${action}</div>`;
  }).join("");
  $("#main").innerHTML = `<div class="tabs">${tab("all", "All")}${tab("job", "Jobs")}${tab("int", "Internships")}</div>${form}<div class="cgrid">${list || `<div class="card pad"><p class="sub">No opportunities here yet.</p></div>`}</div>`;
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-jf],[data-rec]");
  if (!b) return;
  if (b.dataset.jf) { st.jf = b.dataset.jf; refresh(); }
  if (b.dataset.rec) { st.rjob = +b.dataset.rec; go("recommend"); }
});

document.addEventListener("submit", (e) => {
  if (e.target.id !== "jf") return;
  e.preventDefault();
  if (!can("post_job")) return toast("You don’t have permission for that");
  const fd = new FormData(e.target);
  shared.jobs.unshift({ id: Date.now(), a: st.me.id, t: fd.get("jt").trim(), co: fd.get("jc").trim(), loc: fd.get("jl").trim(), vac: +fd.get("jv") || 1, k: fd.get("jk"), d: fd.get("jd").trim(), at: Date.now() });
  save();
  toast("Vacancy posted");
  refresh();
});
