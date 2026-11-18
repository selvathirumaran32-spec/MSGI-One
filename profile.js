// Alumni profile page with recommendations.
function profileV(){
  const p=byId(st.pid);if(!p){go("network");return}
  const cn=isConn(p.id),recs=shared.recs[p.id]||[],sim=P.filter(x=>listed(x)&&x.id!==p.id&&x.f===p.f&&x.b===p.b).slice(0,4),fn=esc(p.n.split(" ")[0]);
  $("#main").innerHTML=`<div class="hgrid"><div class="stack"><div class="card"><div style="height:70px;background:linear-gradient(120deg,var(--navy),#3a56a5)"></div><div class="pad"><div style="margin-top:-46px">${av(p, 1)}</div><h2 style="font-size:1.4rem;margin-top:8px">${esc(p.n)}${badge(p)}</h2><div>${esc(hl(p))}</div><div class="sub">${p.c} · ${roleLine(p)} · ${p.f}</div><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">${connBtn(p.id)}</div></div></div>
  </div><div class="stack">${detailsCard(p)}
  <div class="card pad"><h3 class="sechead">Recommendations (${recs.length})</h3>${recs.map(r=>{const n=byId(r.a).n;return`<div class="pp">${av(byId(r.a))}<div class="info"><div class="name">${esc(n)}</div><div class="sub">${esc(r.rel)}</div><p style="margin-top:4px">${esc(r.t)}</p></div></div>`}).join("")||`<p class="sub">No recommendations yet.</p>`}
  ${cn?`<form id="rf" class="fg" style="margin-top:12px"><label>How do you know ${fn}?<select name="rl"><option>Classmate</option><option>Worked together</option><option>Mentor</option><option>Met through MSGI Alumni One</option></select></label><label>Your recommendation<textarea name="rt" required maxlength="500" rows="3" style="border:1px solid var(--line);border-radius:8px;padding:9px 12px;background:var(--card)"></textarea></label><button class="btn gold" type="submit">Recommend ${fn}</button></form>`:`<p class="sub" style="margin-top:12px">Connect with ${fn} to write a recommendation.</p>`}</div>
  <div class="card pad"><h3 class="sechead">Alumni with a similar profile</h3>${sim.map(x=>`<div class="pp">${av(x)}<div class="info"><div class="name"><a href="#profile" data-prof="${x.id}" style="color:inherit;text-decoration:none">${esc(x.n)}</a></div><div class="sub">${esc(hl(x))} · ${x.c}</div></div>${connBtn(x.id)}</div>`).join("")}</div></div></div>`;
}

// What a member chose to show publicly: about, location, experience and skills. Email and phone are only sent with a recommendation request.
function detailsCard(p) {
  const x = shared.prof[p.id] || {};
  const row = (k, v) => (v ? `<div class="row"><span>${k}</span><b>${esc(v)}</b></div>` : "");
  if (!(x.about || x.loc || x.exp || x.skills)) return "";
  return `<div class="card pad"><h3 class="sechead">About</h3>${x.about ? `<p style="margin-bottom:8px">${esc(x.about)}</p>` : ""}${row("Location", x.loc)}${row("Experience", x.exp)}${row("Skills", x.skills)}</div>`;
}
