// Voice and video calls between connected people, using WebRTC.
// The two browsers pass their connection details through a BroadcastChannel, so for now both people must be on the same device
// (two tabs or windows). A signalling server is needed to call between different devices.
const callBus = "BroadcastChannel" in window ? new BroadcastChannel("msgi-one-calls") : null;
const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
let call = null; // { id, peer, video, dir: "out" | "in", state: "ringing" | "active", pc, local, remote, started, ringTimer, tick, offer }

// A session description must be turned into a plain object before it can be sent through a BroadcastChannel.
const plainSDP = (pc) => ({ type: pc.localDescription.type, sdp: pc.localDescription.sdp });
const sig = (m) => callBus && callBus.postMessage({ ...m, from: st.me.id });

function iceDone(pc) {
  return new Promise((ok) => {
    if (pc.iceGatheringState === "complete") return ok();
    const f = () => { if (pc.iceGatheringState === "complete") { pc.removeEventListener("icegatheringstatechange", f); ok(); } };
    pc.addEventListener("icegatheringstatechange", f);
    setTimeout(ok, 2500);
  });
}

function wirePC() {
  call.pc.ontrack = (e) => { call.remote = e.streams[0]; attachStreams(); };
  call.pc.onconnectionstatechange = () => {
    if (call && call.state === "active" && ["failed", "closed"].includes(call.pc.connectionState)) finishCall("ended", true);
  };
}

function attachStreams() {
  const rv = $("#rv"), lv = $("#lv");
  if (rv && call && call.remote) rv.srcObject = call.remote;
  if (lv && call && call.local) { lv.srcObject = call.local; lv.muted = true; }
}

async function startCall(video) {
  if (!callBus || !navigator.mediaDevices) return toast("Calls aren’t supported in this browser");
  if (call) return toast("You are already on a call");
  const peer = byId(st.chat);
  if (!peer || !isConn(peer.id)) return toast("You can call people you are connected with");
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video }); }
  catch { return toast(video ? "Couldn’t use the camera and microphone. Please allow access." : "Couldn’t use the microphone. Please allow access."); }
  const pc = new RTCPeerConnection(ICE);
  stream.getTracks().forEach((t) => pc.addTrack(t, stream));
  call = { id: "c" + Date.now(), peer: peer.id, video, dir: "out", state: "ringing", pc, local: stream, remote: null };
  wirePC();
  renderCall();
  await pc.setLocalDescription(await pc.createOffer());
  await iceDone(pc);
  if (!call) return;
  sig({ type: "offer", id: call.id, to: peer.id, video, sdp: plainSDP(pc) });
  call.ringTimer = setTimeout(() => call && call.state === "ringing" && finishCall("missed", true), 30000);
}

async function acceptCall() {
  const c = call;
  if (!c || c.dir !== "in") return;
  try { c.local = await navigator.mediaDevices.getUserMedia({ audio: true, video: c.video }); }
  catch { toast("Couldn’t use the microphone or camera. Please allow access."); return finishCall("declined", true); }
  c.pc = new RTCPeerConnection(ICE);
  c.local.getTracks().forEach((t) => c.pc.addTrack(t, c.local));
  wirePC();
  await c.pc.setRemoteDescription(c.offer);
  await c.pc.setLocalDescription(await c.pc.createAnswer());
  await iceDone(c.pc);
  c.state = "active"; c.started = Date.now();
  sig({ type: "answer", id: c.id, to: c.peer, sdp: plainSDP(c.pc) });
  sig({ type: "taken", id: c.id, to: st.me.id });
  clearTimeout(c.ringTimer);
  renderCall();
}

// End the call. status: ended, missed or declined. The caller writes the call line into the chat.
function finishCall(status, notify) {
  const c = call;
  if (!c) return;
  call = null;
  clearTimeout(c.ringTimer); clearInterval(c.tick);
  if (notify) sig({ type: status === "declined" ? "decline" : c.state === "ringing" && c.dir === "out" ? "cancel" : "end", id: c.id, to: c.peer });
  if (c.pc) c.pc.close();
  if (c.local) c.local.getTracks().forEach((t) => t.stop());
  const el = $("#call");
  if (el) el.hidden = true;
  if (c.dir === "out" && status !== "busy" && st.me) {
    sendMsg(c.peer, (c.video ? "Video" : "Voice") + " call", { call: { video: c.video, status, dur: c.started ? Math.round((Date.now() - c.started) / 1000) : 0 } });
    if (st.tab === "messages") refresh();
  }
}

function renderCall() {
  let el = $("#call");
  if (!el) { el = document.createElement("div"); el.id = "call"; document.body.appendChild(el); }
  const c = call, p = byId(c.peer);
  el.hidden = false;
  const incoming = c.dir === "in" && c.state === "ringing";
  const status = incoming ? `Incoming ${c.video ? "video" : "voice"} call` : c.state === "active" ? `<span id="ctime">0:00</span>` : "Calling…";
  const btn = (cls, attr, icon, label) => `<button class="cb ${cls}" ${attr} aria-label="${label}">${ic(icon, 26)}</button>`;
  const controls = incoming ? btn("red", "data-cdec", "phone", "Decline") + btn("green", "data-cacc", c.video ? "video" : "phone", "Accept")
    : btn("", "data-cmute", "mic", "Mute") + (c.video ? btn("", "data-ccam", "video", "Camera") : "") + btn("red", "data-cend", "phone", "End call");
  el.innerHTML = `${c.video ? `<video id="rv" class="cvid" autoplay playsinline></video><video id="lv" autoplay playsinline muted></video>` : `<video id="rv" autoplay playsinline hidden></video>`}
    <div class="cinfo">${c.video && c.state === "active" ? "" : av(p, 2)}<h2>${esc(p.n)}</h2><p>${status}</p></div><div class="cctl">${controls}</div>`;
  attachStreams();
  clearInterval(c.tick);
  if (c.state === "active") c.tick = setInterval(() => { const t = $("#ctime"); if (t) { const s = Math.floor((Date.now() - c.started) / 1000); t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; } }, 500);
}

if (callBus) callBus.onmessage = async (ev) => {
  const m = ev.data;
  if (!st.me) return;
  if (m.type === "taken" && m.to === st.me.id && m.from === st.me.id) { // answered in another tab of mine
    if (call && call.id === m.id && call.dir === "in" && call.state === "ringing") { call = null; const el = $("#call"); if (el) el.hidden = true; }
    return;
  }
  if (m.to !== st.me.id) return;
  if (m.type === "offer") {
    if (call || !byId(m.from) || !isConn(m.from)) return sig({ type: "busy", id: m.id, to: m.from });
    call = { id: m.id, peer: m.from, video: m.video, dir: "in", state: "ringing", offer: m.sdp };
    call.ringTimer = setTimeout(() => call && call.id === m.id && call.state === "ringing" && finishCall("missed", false), 30000);
    return renderCall();
  }
  if (!call || call.id !== m.id) return;
  if (m.type === "answer" && call.dir === "out") {
    await call.pc.setRemoteDescription(m.sdp);
    clearTimeout(call.ringTimer);
    call.state = "active"; call.started = Date.now();
    return renderCall();
  }
  if (m.type === "decline") return finishCall("declined", false);
  if (m.type === "busy") { toast("They are on another call"); return finishCall("busy", false); }
  if (m.type === "cancel") return finishCall("missed", false);
  if (m.type === "end") return finishCall("ended", false);
};

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-call],[data-cacc],[data-cdec],[data-cend],[data-cmute],[data-ccam]");
  if (!t || !st.me) return;
  const d = t.dataset;
  if (d.call) return startCall(d.call === "video");
  if (d.cacc !== undefined) return acceptCall();
  if (d.cdec !== undefined) return finishCall("declined", true);
  if (d.cend !== undefined) return finishCall(call && call.started ? "ended" : "missed", true);
  if (d.cmute !== undefined && call && call.local) { const a = call.local.getAudioTracks()[0]; if (a) { a.enabled = !a.enabled; t.classList.toggle("off", !a.enabled); t.innerHTML = ic(a.enabled ? "mic" : "micoff", 26); } }
  if (d.ccam !== undefined && call && call.local) { const v = call.local.getVideoTracks()[0]; if (v) { v.enabled = !v.enabled; t.classList.toggle("off", !v.enabled); t.innerHTML = ic(v.enabled ? "video" : "videooff", 26); } }
});
