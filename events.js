// Events for messages, recommendations, certificate preview and profile photo.
document.addEventListener("submit",e=>{
  if(e.target.id==="mf"){e.preventDefault();const v=new FormData(e.target).get("mt").trim();if(!v)return;sendMsg(st.chat,v);refresh()}
  if(e.target.id==="rf"){e.preventDefault();const fd=new FormData(e.target),t=fd.get("rt").trim();if(t.length<20)return toast("Write at least a couple of sentences");(shared.recs[st.pid]=shared.recs[st.pid]||[]).unshift({a:st.me.id,rel:fd.get("rl"),t});save();toast("Recommendation posted");refresh()}
});
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-chat],[data-prof],[data-msg],[data-view],#mod");if(!t)return;
  if(t.id==="mod"){t.hidden=true;return}
  if(t.dataset.view!==undefined){$("#mimg").src=t.src;$("#mod").hidden=false;return}
  if(t.dataset.chat){st.chat=+t.dataset.chat;st.chatOpen=true;return refresh()}
  if(t.dataset.prof){e.preventDefault();st.pid=+t.dataset.prof;return go("profile")}
  if(t.dataset.msg){st.chat=+t.dataset.msg;st.chatOpen=true;go("messages")}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#mod").hidden=true});
document.addEventListener("change",e=>{
  if(!e.target.matches("[data-photo]"))return;const f=e.target.files[0];if(!f)return;if(!f.type.startsWith("image/"))return toast("Choose an image file");
  const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const c=document.createElement("canvas"),s=Math.min(i.width,i.height);c.width=c.height=200;c.getContext("2d").drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,200,200);st.photo=c.toDataURL("image/jpeg",.85);shared.photos[st.me.id]=st.photo;save();toast("Profile photo updated");refresh()};i.src=r.result};r.readAsDataURL(f)});
