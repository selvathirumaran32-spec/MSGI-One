// Posts feed (photos and videos) and the post, like and comment actions.
function composer() {
  const d = st.draft;
  return `<div class="card pad composer"><div class="ph" style="align-items:flex-start">${av(st.me)}<textarea id="np" rows="2" placeholder="What’s on your mind, ${esc(st.me.n.split(" ")[0])}?" aria-label="New post">${esc(st.draftText || "")}</textarea></div>
    ${d.name ? `<div class="sub" style="margin-top:8px">Attached: ${esc(d.name)} <button type="button" class="linkbtn" data-dclear>Remove</button></div>` : ""}
    <div class="crow"><label class="chipb">${ic("image", 18)} Photo<input type="file" accept="image/*" data-pfile="img" hidden></label><label class="chipb">${ic("video", 18)} Video<input type="file" accept="video/*" data-pfile="vid" hidden></label><button class="btn gold sm" data-post style="margin-left:auto">Post</button></div></div>`;
}

const authorOf = (p) => byId(p.a);
const visiblePosts = () => shared.posts.filter((p) => !shared.susp[p.a]);

function commentsHTML(p) {
  return `<div class="cmts">${p.cm.map((c) => { const u = byId(c.u); return `<div class="c"><b>${esc(u ? u.n : "Member")}</b> ${esc(c.t)}</div>`; }).join("")}<input data-padd="${p.id}" placeholder="Write a comment and press Enter" aria-label="Comment"></div>`;
}

function postHTML(p) {
  const a = authorOf(p), liked = p.likes.includes(st.me.id);
  return `<article class="card post" data-pid="${p.id}"><div class="pph">${av(a)}<div><div class="name"><a href="#profile" data-prof="${a.id}" style="color:inherit;text-decoration:none">${esc(a.n)}</a>${badge(a)}</div><div class="sub">${esc(hl(a))} · ${ago(p.at)}</div></div>${p.a === st.me.id ? `<button class="ib del" data-pdel="${p.id}" aria-label="Delete post">${ic("trash", 18)}</button>` : ""}</div>
    ${p.t ? `<p class="ptext">${esc(p.t)}</p>` : ""}${p.img ? `<img class="pmedia" data-mid="${p.img}" alt="Photo shared by ${esc(a.n)}">` : ""}${p.vid ? `<video class="pmedia" data-mid="${p.vid}" controls playsinline preload="metadata"></video>` : ""}
    <div class="pcount sub">${p.likes.length ? `${p.likes.length} like${p.likes.length > 1 ? "s" : ""}` : ""}${p.likes.length && p.cm.length ? " · " : ""}${p.cm.length ? `${p.cm.length} comment${p.cm.length > 1 ? "s" : ""}` : ""}</div>
    <div class="acts"><button data-plike="${p.id}" class="${liked ? "on" : ""}" aria-pressed="${liked}">${ic("heart", 18)} ${liked ? "Liked" : "Like"}</button><button data-pcm="${p.id}">${ic("chat", 18)} Comment</button></div>${st.open[p.id] ? commentsHTML(p) : ""}</article>`;
}

function feedHTML() {
  const list = visiblePosts(), shown = list.slice(0, st.plimit);
  return shown.map(postHTML).join("") || `<div class="card pad"><p class="sub">No posts yet. Share the first update with the MSGI family.</p></div>`
    + (list.length > shown.length ? `<div style="text-align:center"><button class="btn out" data-pmore>Show more posts</button></div>` : "");
}

// Redraw one post after a like or comment, without redrawing the whole page.
function rerenderPost(id) {
  const p = shared.posts.find((x) => x.id === id);
  document.querySelectorAll(`[data-pid="${id}"]`).forEach((el) => {
    if (!p) return el.remove();
    el.outerHTML = postHTML(p);
  });
  hydrateMedia($("#main"));
}

document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-plike],[data-pcm],[data-pdel],[data-post],[data-dclear],[data-pmore]");
  if (!t || !st.me) return;
  const d = t.dataset;
  if (d.plike) {
    const p = shared.posts.find((x) => x.id === +d.plike), i = p.likes.indexOf(st.me.id);
    if (i < 0) p.likes.push(st.me.id); else p.likes.splice(i, 1);
    save(); return rerenderPost(p.id);
  }
  if (d.pcm) { st.open[d.pcm] = !st.open[d.pcm]; return rerenderPost(+d.pcm); }
  if (d.pdel !== undefined) {
    const p = shared.posts.find((x) => x.id === +d.pdel);
    if (!p || p.a !== st.me.id) return toast("You can only delete your own posts");
    shared.posts = shared.posts.filter((x) => x !== p);
    [p.img, p.vid].filter(Boolean).forEach(delMedia);
    save(); toast("Post deleted"); return rerenderPost(p.id);
  }
  if (d.dclear !== undefined) { st.draft = {}; st.draftText = $("#np").value; return refresh(); }
  if (d.pmore !== undefined) { st.plimit += 20; return refresh(); }
  if (d.post !== undefined) {
    const text = $("#np").value.trim(), dr = st.draft;
    if (!text && !dr.mid) return toast("Write something or add a photo or video");
    const p = { id: Date.now(), a: st.me.id, t: text, at: Date.now(), likes: [], cm: [] };
    if (dr.kind === "img") p.img = dr.mid;
    if (dr.kind === "vid") p.vid = dr.mid;
    shared.posts.unshift(p);
    st.draft = {}; st.draftText = "";
    save(); toast("Posted"); refresh();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || !e.target.dataset || !e.target.dataset.padd) return;
  const p = shared.posts.find((x) => x.id === +e.target.dataset.padd), v = e.target.value.trim();
  if (!p || !v) return;
  p.cm.push({ u: st.me.id, t: v, at: Date.now() });
  save(); rerenderPost(p.id);
});

// Choosing a photo or video: save it in IndexedDB and attach it to the draft.
document.addEventListener("change", async (e) => {
  const inp = e.target.closest ? e.target.closest("[data-pfile]") : null;
  if (!inp || !inp.files[0]) return;
  const f = inp.files[0], kind = inp.dataset.pfile;
  if (kind === "vid" && f.size > 30e6) return toast("Please choose a video under 30 MB");
  try {
    const id = "m" + Date.now() + Math.random().toString(36).slice(2, 6);
    await putMedia(id, kind === "img" ? await resizeImage(f) : f);
    st.draftText = $("#np") ? $("#np").value : "";
    st.draft = { kind, mid: id, name: f.name };
    refresh();
  } catch { toast("This browser couldn’t save that file"); }
});
