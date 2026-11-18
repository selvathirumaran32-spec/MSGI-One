// Router, header, bottom tabs and page-level events.
const ROUTES = ["recommend", "reels", "announcements", "notifications", "home", "network", "jobs", "map", "messages", "profile", "console", "events", "myprofile"];
const route = () => (ROUTES.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home");
const NAV = [["home", "Home", "home"], ["network", "Network", "users"], ["jobs", "Jobs", "briefcase"], ["events", "Events", "calendar"], ["messages", "Messages", "chat", "wide-only"], ["reels", "Reels", "play", "wide-only"], ["announcements", "Announcements", "volume", "wide-only"], ["map", "Alumni Map", "pin", "wide-only"], ["myprofile", "Profile", "user"]];
const TITLES = { recommend: "Recommendation request", reels: "Reels", announcements: "Announcements", notifications: "Notifications", home: "Home", network: "Alumni Directory", jobs: "Job Opportunities", events: "Events & Meetups", map: "Alumni Map", messages: "Messages", profile: "Profile", myprofile: "My Profile" };
$("#nav").innerHTML = `<div class="nbrand"><img class="lg" src="${LOGO}" alt="MSGI"><b>MSGI Alumni One</b></div>` + NAV.map(([t, l, i, c]) => `<button data-t="${t}" class="${c || ""}">${ic(i)}<span>${l}</span>${t === "network" ? '<span class="dot" id="nreq"></span>' : ""}${t === "messages" ? '<span class="dot" id="nmsg2"></span>' : ""}</button>`).join("") + `<button class="wide-only nso" data-so>${ic("lock")}<span>Sign out</span></button>`;

// Top bar. Phone: logo or back arrow and title. Laptop: page title, search, notifications and my photo.
function header(t, staff) {
  const h = $("#hdr");
  if (staff) { h.innerHTML = `<img class="lg sm" src="${LOGO}" alt="MSGI"><b class="ttl">${ROLE_LABEL[myRole()]} console</b><button class="hbtn" data-so>Sign out</button>`; return; }
  const mt = t === "home" ? "MSGI Alumni One" : t === "messages" && st.chatOpen && byId(st.chat) ? byId(st.chat).n : TITLES[t] || "MSGI Alumni One";
  const lead = t === "home" ? `<img class="lg sm" src="${LOGO}" alt="MSGI">` : `<button class="ib" data-back aria-label="Back">${ic("back")}</button>`;
  h.innerHTML = `${lead}<b class="ttl"><span class="mt">${esc(mt)}</span><span class="wt">${TITLES[t] || ""}</span></b>
    <label class="hsearch">${ic("search", 18)}<input id="hq" type="search" placeholder="Search alumni by name or reg. no." value="${esc(st.q)}" aria-label="Search alumni"></label>
    <button class="ib" data-t="notifications" aria-label="Notifications">${ic("bell")}<span class="bdg" id="nmsg"></span></button><button class="ib hav" data-t="myprofile" aria-label="My profile">${av(st.me)}</button>`;
}

function show(t) {
  // Suspended or removed accounts lose access straight away.
  if (st.me && (shared.susp[st.me.id] || roleOf(st.me) === "removed")) {
    st.authMsg = shared.susp[st.me.id] ? "Your account has been suspended. Please contact the college administrator." : "This account has been removed.";
    st.me = null; st.splash = false;
  }
  st.tab = t;
  const signedIn = !!st.me, staff = signedIn && can("console"), thread = t === "messages" && st.chatOpen && !isWide();
  document.querySelectorAll("#nav button").forEach((b) => b.classList.toggle("on", b.dataset.t === t));
  document.body.classList.toggle("noauth", !signedIn);
  document.body.classList.toggle("staff", staff);
  $("#hdr").style.display = signedIn ? "" : "none";
  $("#nav").style.display = signedIn && !staff && !thread ? "" : "none";
  $("#main").classList.toggle("bare", !signedIn || thread);
  if (!signedIn) return st.splash && !isWide() ? splashV() : authV();
  header(t, staff);
  if (staff) return consoleV();
  ({ home, network, jobs: jobsV, map: mapV, messages: messagesV, profile: profileV, events: eventsV, myprofile: myProfileV, reels: reelsV, recommend: recommendV, announcements: announcementsV, notifications: notificationsV })[t === "console" ? "home" : t]();
  hydrateMedia($("#main"));
  updReq();
}
function refresh(){show(st.tab)}
function go(t){if(location.hash.slice(1)!==t)location.hash=t;else show(t)}
window.addEventListener("hashchange",()=>show(route()));

document.addEventListener("click",e=>{
  const t=e.target.closest("[data-t],[data-conn],[data-accept],[data-ignore],[data-ref],[data-city],[data-more],[data-back]");if(!t)return;
  if(t.dataset.t){e.preventDefault();return go(t.dataset.t)}
  if(t.dataset.conn){const id=+t.dataset.conn;sendInvite(id);toast("Invitation sent to "+byId(id).n);return refresh()}
  if(t.dataset.accept){const id=+t.dataset.accept;acceptInvite(id);toast("You’re now connected with "+byId(id).n);return refresh()}
  if(t.dataset.ignore){ignoreInvite(+t.dataset.ignore);return refresh()}
  if(t.dataset.ref!==undefined){st.ref[t.dataset.ref]=1;toast("Referral request sent");return refresh()}
  if(t.dataset.more!==undefined){st.limit+=24;if($("#dir")){$("#dir").innerHTML=dirHTML();return}return refresh()}
  if(t.dataset.city){st.city=t.dataset.city;if(st.tab!=="map")return go("map");return refresh()}
  if(t.dataset.back!==undefined){
    if(st.tab==="messages"&&st.chatOpen){st.chatOpen=false;return refresh()}
    if(st.tab==="recommend")return go("jobs");
    return st.tab==="profile"&&history.length>1?history.back():go("home");
  }
});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("pin"))e.target.dispatchEvent(new Event("click",{bubbles:true}))});
document.addEventListener("click",e=>{if(e.target.classList?.contains("pin")){st.city=e.target.dataset.city;mapV()}});

// Counters: invitations on the Network tab, and invitations plus unread messages on the bell.
function updReq() {
  if (!st.me || !can("network")) return;
  const set = (sel, n) => { const el = $(sel); if (!el) return; el.textContent = n || ""; el.style.display = n ? "inline-block" : "none"; };
  set("#nreq", invites().length);
  set("#nmsg", invites().length + unreadTotal() + newAnn());
  set("#nmsg2", unreadTotal());
}
// Laptop search box in the top bar drives the directory.
document.addEventListener("input", (e) => {
  if (e.target.id !== "hq") return;
  st.q = e.target.value; st.limit = 24;
  if (st.tab === "network") { $("#dir").innerHTML = dirHTML(); return; }
  go("network");
  setTimeout(() => { const i = $("#hq"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } });
});
window.matchMedia("(min-width:1000px)").addEventListener("change", () => refresh());
show(route());
