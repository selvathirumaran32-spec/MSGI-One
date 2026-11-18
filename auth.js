// Splash screen, sign in with register number and password, and sign out.
function splashV() {
  $("#main").innerHTML = `<div class="splash"><div><img class="lg big" src="${LOGO}" alt="MSGI, Meenakshi Sundararajan Group of Institutions"><h1>MSGI<br><span>Alumni One</span></h1><p class="tagline">Connect • Collaborate • Grow</p></div>
    <div><p class="oc">One Community…<br><em>A Lifetime Connection</em></p><button class="btn gold block" data-start>Get Started</button><button class="btn ghost block" data-start>Login</button><p class="foot">Meenakshi Sundararajan<br>Group of Institutions</p></div></div>`;
}

function authV() {
  $("#main").innerHTML = `<div class="lsplit"><aside class="brand"><div><img class="lg big" src="${LOGO}" alt="MSGI, Meenakshi Sundararajan Group of Institutions"><h1>MSGI<br><span>Alumni One</span></h1><p class="tagline">Connect • Collaborate • Grow</p></div><p class="oc">One Community…<br><em>A Lifetime Connection</em></p></aside>
    <section class="login"><img class="lg" src="${LOGO}" alt="MSGI"><h1>Login</h1><p class="sub">Enter your Register Number</p>
    ${st.authMsg ? `<div class="note bad" style="text-align:left">${esc(st.authMsg)}</div>` : ""}
    <form id="af"><label class="fi">${ic("id")}<input name="rn" required autocomplete="username" autocapitalize="characters" placeholder="Register Number"></label>
    <label class="fi">${ic("lock")}<input name="pw" type="password" required autocomplete="current-password" placeholder="Password"></label>
    <button class="btn gold block" type="submit">Login</button></form>
    <button type="button" class="linkbtn" data-forgot>Forgot Password?</button><div class="or"><span>OR</span></div>
    <div class="infobox">${ic("info", 26)}<b>Open for Alumni &amp; 2nd to 4th Year Students</b></div>
    <div class="lfoot"><b>MSGI Alumni One</b><span>Building Stronger Together</span></div></section></div>`;
}

function authFail(m) { st.authMsg = m; refresh(); }

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-start]")) { st.splash = false; refresh(); }
  if (e.target.closest("[data-forgot]")) authFail("Your password is the first 5 letters of your name followed by your year of birth, for example selva2002. If it still doesn’t work, contact the college administrator.");
  if (e.target.closest("[data-so]")) {
    if (call) finishCall("ended", true);
    st.me = null; st.photo = ""; st.chat = 0; st.chatOpen = false; st.draft = {}; st.draftText = ""; st.authMsg = ""; st.splash = false;
    toast("Signed out");
    go("home");
  }
});

document.addEventListener("submit", async (e) => {
  if (e.target.id !== "af") return;
  e.preventDefault();
  const fd = new FormData(e.target);
  const reg = fd.get("rn").trim().toUpperCase(), pw = fd.get("pw").trim().toLowerCase();
  if (FIRST_YEAR.has(reg)) return authFail("Your first-year account isn’t eligible yet. MSGI Alumni One opens to students from the 2nd year, as set by the institution’s eligibility policy.");
  const me = byReg.get(reg);
  if (!me) return toast("Register number not found");
  if (!window.crypto || !crypto.subtle) return toast("Sign in needs a secure (https) page");
  const hash = await sha(reg + "|" + pw);
  if (hash !== me.h && hash !== me.h2) return toast("Wrong register number or password");
  if (shared.susp[me.id]) return authFail("Your account is suspended. Please contact the college administrator.");
  if (roleOf(me) === "removed") return authFail("This account has been removed.");
  Object.assign(shared, loadShared()); // pick up anything saved while this page was signed out
  st.authMsg = "";
  st.me = me;
  st.photo = shared.photos[me.id] || "";
  const first = !shared.joined[me.id];
  shared.joined[me.id] = Date.now();
  save();
  toast("Welcome, " + me.n.split(" ")[0]);
  go(first && can("network") ? "myprofile" : "home");
});
