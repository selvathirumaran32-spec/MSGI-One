// Small helpers: selectors, escaping, avatars, toasts and the verified badge.
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ini=n=>n.split(" ").map(w=>w[0]).slice(0,2).join("");
const col=n=>["#14234b","#7a3b8f","#0f6b5b","#a4561a","#2d5ea8","#8a2d4a"][[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%6];
// Avatar for a person: their uploaded photo if they have one, otherwise initials. size: 1 = large, 2 = extra large.
const av=(p,l)=>{const c="av"+(l===2?" big":l?" avl":""),photo=shared.photos[p.id];return photo?`<img class="${c}" src="${photo}" alt="${esc(p.n)}" style="object-fit:cover">`:`<div class="${c}" style="background:${col(p.n)}" aria-hidden="true">${ini(p.n)}</div>`};
// Headline: what the person wrote in their profile, otherwise their degree.
const hl=(p)=>{const x=shared.prof[p.id];return x&&x.role?(x.co?`${x.role} at ${x.co}`:x.role):p.r};
const fmtSize=(n)=>n>=1073741824?(n/1073741824).toFixed(1)+" GB":n>=1048576?(n/1048576).toFixed(1)+" MB":Math.max(1,Math.round(n/1024))+" KB";
const isWide=()=>window.matchMedia("(min-width:1000px)").matches;
function toast(m){const t=$("#toast");t.textContent=m;t.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.opacity=0,2200)}

const LOGO="assets/logo.png";
const BADGE={alumni:"✓ Alumnus",student:"✓ Student",faculty:"✓ Faculty",admin:"✓ Admin",super:"✓ Super Admin"};
const badge=(p)=>`<span class="vb">${BADGE[roleOf(p)]||""}</span>`;
// Short label under a name: faculty, year of study, or batch.
const roleLine=(p)=>{const l=ROLE_LABEL[roleOf(p)],t=tag(p);return l===t?l:l+" · "+t};
const tag=(p)=>{const r=roleOf(p);return r==="faculty"?"Faculty":r==="student"?(p.yr||"Student"):r==="alumni"?"Batch "+p.bn:ROLE_LABEL[r]};
// SHA-256 (first 12 hex characters), used to check passwords without storing them.
async function sha(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("").slice(0,12)}

// ---- Icons and small formatters ----
const ICONS = {
  home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  id: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 10h5M13 14h5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  chevron: '<path d="M9 18l6-6-6-6"/>',
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  play: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clip: '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
};
const ic = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
function ago(t) {
  const m = Math.floor((Date.now() - t) / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " hour" + (h > 1 ? "s" : "") + " ago";
  const d = Math.floor(h / 24);
  return d + " day" + (d > 1 ? "s" : "") + " ago";
}
const clock = (t) => new Date(t).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
const hue = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
