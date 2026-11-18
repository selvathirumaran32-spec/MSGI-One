// Photos and videos are kept in IndexedDB, because localStorage is too small for them. Posts only store a media id.
let mediaDB;
const mdb = () => mediaDB || (mediaDB = new Promise((ok, no) => {
  const r = indexedDB.open("msgi-one-media", 1);
  r.onupgradeneeded = () => r.result.createObjectStore("m");
  r.onsuccess = () => ok(r.result);
  r.onerror = () => no(r.error);
}));
async function putMedia(id, blob) {
  const db = await mdb();
  return new Promise((ok, no) => { const t = db.transaction("m", "readwrite"); t.objectStore("m").put(blob, id); t.oncomplete = ok; t.onerror = () => no(t.error); });
}
async function getMedia(id) {
  const db = await mdb();
  return new Promise((ok, no) => { const q = db.transaction("m").objectStore("m").get(id); q.onsuccess = () => ok(q.result); q.onerror = () => no(q.error); });
}
async function delMedia(id) {
  const db = await mdb();
  return new Promise((ok) => { const t = db.transaction("m", "readwrite"); t.objectStore("m").delete(id); t.oncomplete = ok; t.onerror = ok; });
}
const mediaURLs = new Map();
async function mediaURL(id) {
  if (mediaURLs.has(id)) return mediaURLs.get(id);
  const b = await getMedia(id);
  if (!b) return "";
  const u = URL.createObjectURL(b);
  mediaURLs.set(id, u);
  return u;
}
// Give every <img> or <video> that only knows its media id a real source.
async function hydrateMedia(root) {
  for (const el of root.querySelectorAll("[data-mid]")) {
    try { const u = await mediaURL(el.dataset.mid); if (!u) continue; if (el.tagName === "A") el.href = u; else if (el.getAttribute("src") !== u) el.src = u; } catch { /* storage unavailable */ }
  }
}
// Shrink a photo to at most 1000 px before saving it.
function resizeImage(file, max = 1000) {
  return new Promise((ok, no) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? ok(b) : no()), "image/jpeg", 0.82);
    };
    img.onerror = no;
    img.src = URL.createObjectURL(file);
  });
}
