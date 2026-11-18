// App state and the people list, built from the college dataset in alumni-data.js.
const ORDINAL = ["1st", "2nd", "3rd", "4th"];

// Everyone except 1st-year students. Current students are batches that started in 2023 or later.
const P = ALUMNI_ROWS.map((r, i) => {
  const dept = DEPTS[r[2]], start = r[3], cur = start >= 2023;
  return {
    role: cur ? "student" : "alumni", id: i + 1, reg: r[0], n: r[1], f: dept.name, b: start, bn: `${start}-${start + 3}`, c: "Chennai",
    cur, yr: cur ? `${ORDINAL[2026 - start]} year` : "", r: `${dept.deg} ${dept.name}`,
    h: r[4], h2: r[5] || "", s: `${r[1]} ${r[0]} ${dept.name} ${dept.code}`.toLowerCase(),
  };
});
// Staff accounts: faculty appear in the directory, admins and the Super Admin do not.
STAFF.forEach((s, i) => {
  const dept = DEPTS[s.dept], fac = s.role === "faculty";
  P.push({ id: 90001 + i, reg: s.reg, n: s.n, role: s.role, hidden: !fac, f: fac ? dept.name : "Administration", b: 0, bn: "", c: "Chennai", cur: false, yr: "",
    r: fac ? `${s.title}, ${dept.name}` : s.title, h: s.h, h2: "", s: `${s.n} ${s.reg} ${s.role}`.toLowerCase() });
});
const PEOPLE_COUNT = P.filter((p) => !p.hidden).length;
const byIdMap = new Map(P.map((p) => [p.id, p]));
const byReg = new Map(P.map((p) => [p.reg, p]));
const byId = (id) => byIdMap.get(id);
const FIRST_YEAR = new Set(FIRST_YEAR_REGS.split(","));
const jobs = [];
const st = {tab:"home",liked:{},open:{},ref:{},city:"",ct:"overview",cq:"",authMsg:"",splash:!window.matchMedia("(min-width:1000px)").matches,chatOpen:false,draft:{},draftText:"",plimit:20,q:"",fs:"",fd:"",fb:"",me:null,chat:0,pid:0,photo:"",limit:24};
