// Roles and permissions. In this prototype the checks run in the browser; the real app must enforce them on the backend and database.
const ROLE_LABEL = { super: "Super Admin", admin: "Admin", faculty: "Faculty", alumni: "Alumnus", student: "Student", first: "First-year student" };
const PERMS = {
  super: ["console", "approve_announcements", "publish_announcement", "manage_admins", "manage_events", "change_roles", "suspend", "view_audit", "view_analytics"],
  admin: ["console", "manage_events", "publish_announcement", "change_roles", "suspend", "view_audit", "view_analytics"],
  faculty: ["network", "message", "propose_announcement"],
  alumni: ["network", "message", "post_job"],
  student: ["network", "message"],
  first: [],
};
const roleOf = (p) => shared.roles[p.id] || p.role;
const myRole = () => roleOf(st.me);
const can = (action) => (PERMS[myRole()] || []).includes(action);
// Only people who have signed in to the app are listed (directory, map, suggestions).
const listed = (p) => !p.hidden && !!shared.joined[p.id] && !shared.susp[p.id] && roleOf(p) !== "removed";
const memberCount = () => P.filter(listed).length;

// Roles the signed-in person may give to someone else. Nobody can change their own role, and Admins can't touch Admins or the Super Admin.
function assignable(target) {
  if (!st.me || target.id === st.me.id || !can("change_roles")) return [];
  const tr = roleOf(target);
  if (tr === "super" || tr === "removed") return [];
  if (myRole() === "super") return ["admin", "faculty", "alumni", "student"].filter((r) => r !== tr);
  return tr === "admin" ? [] : ["faculty", "alumni", "student"].filter((r) => r !== tr);
}

// Every administrator action is written to the audit log.
function audit(action, target) {
  shared.audit.unshift({ at: Date.now(), by: st.me.n, role: myRole(), action, target });
  shared.audit = shared.audit.slice(0, 200);
  save();
}
