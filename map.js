// World map showing where MSGIans who have signed in are based.
function mapV() {
  let g = "";
  for (let x = 0; x <= 360; x += 30) g += `<line x1="${x}" y1="0" x2="${x}" y2="180" stroke="var(--grid)" stroke-width=".3"/>`;
  for (let y = 0; y <= 180; y += 30) g += `<line x1="0" y1="${y}" x2="360" y2="${y}" stroke="var(--grid)" stroke-width=".3"/>`;
  let pins = "";
  Object.keys(C).forEach((c) => {
    const k = P.filter((p) => p.c === c && listed(p)).length;
    if (!k) return;
    const x = C[c][0] + 180, y = 90 - C[c][1];
    pins += `<circle class="pin${st.city === c ? " on" : ""}" cx="${x}" cy="${y}" r="${(3 + Math.log10(k + 1)).toFixed(1)}" data-city="${c}" tabindex="0" role="button" aria-label="${c}, ${k.toLocaleString()} MSGIans"/><text class="glab" x="${x + 6}" y="${y - 4}">${c} (${k.toLocaleString()})</text>`;
  });
  const all = st.city ? P.filter((p) => p.c === st.city && listed(p) && p.id !== st.me.id) : [], list = all.slice(0, 30);
  $("#main").innerHTML = `<div class="hgrid wide-l"><div class="card pad"><svg id="map" viewBox="0 0 360 180" role="img" aria-label="World map of MSGI alumni"><rect width="360" height="180" fill="var(--map)"/>${g}<path d="${WORLD_LAND}" fill="#3a5fb5" stroke="#6f8fdc" stroke-width=".3"/><path d="${WORLD_WATER}" fill="var(--map)"/>${pins}</svg></div>
  <div class="stack"><div class="card pad"><h3 class="sechead">MSGIans Around the World</h3><div class="stats" style="margin:0"><div><span class="si">${ic("globe", 20)}</span><b>${new Set(P.filter(listed).map((p) => p.c)).size}</b><span>Cities</span></div><div><span class="si">${ic("users", 20)}</span><b>${memberCount().toLocaleString()}</b><span>MSGIans</span></div></div></div>
  <div class="card pad"><h3 class="sechead">${st.city ? "MSGIans in " + st.city : "Select a city"}</h3>${list.map((p) => `<div class="pp">${av(p)}<div class="info"><div class="name">${esc(p.n)}</div><div class="sub">${esc(hl(p))} · ${tag(p)}</div></div>${connBtn(p.id)}</div>`).join("") || `<p class="sub">Tap a pin to see who is there.</p>`}${all.length > 30 ? `<p class="sub">Showing 30 of ${all.length.toLocaleString()}. Use Network to search and filter.</p>` : ""}</div></div></div>`;
}
