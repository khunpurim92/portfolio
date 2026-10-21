
var ITEMS = [];
var CFG = window.PORTFOLIO_CONFIG || {};
var DRIVE = { ok: false, files: {} };
var GROUPS = {
  teaching: { g: 1, n: "1", title: "การเรียนการสอน", desc: "เอกสารประกอบการสอนระดับปริญญาตรีและบัณฑิตศึกษา", types: ["T", "M"] },
  research: { g: 2, n: "2", title: "งานวิจัยและวิชาการ", desc: "ตำรา บทความวิชาการ และโครงการวิจัย แยกตามสถานะการเผยแพร่", types: ["B", "P", "R"] },
  service: { g: 3, n: "3", title: "บริการวิชาการและการบริหาร", desc: "บริการวิชาการ คำสั่งแต่งตั้ง และการอบรมพัฒนาตนเอง", types: ["S", "A", "D"] }
};
var TYPE = {
  T: { name: "เอกสารประกอบการสอน ป.ตรี", short: "ป.ตรี" }, M: { name: "เอกสารประกอบการสอน ป.โท", short: "ป.โท" },
  B: { name: "ตำรา", short: "ตำรา" }, P: { name: "บทความวิชาการ", short: "บทความ" }, R: { name: "โครงการวิจัย", short: "โครงการวิจัย" },
  S: { name: "บริการวิชาการ", short: "บริการวิชาการ" }, A: { name: "คำสั่งแต่งตั้ง", short: "คำสั่งแต่งตั้ง" }, D: { name: "การอบรม", short: "การอบรม" }
};
var STATUS = {
  "เผยแพร่แล้ว": { label: "เผยแพร่แล้ว", cls: "ok" },
  "อยู่ระหว่างพิจารณา": { label: "อยู่ระหว่างพิจารณา", cls: "warn" },
  "ระหว่างเลือกวารสาร": { label: "อยู่ระหว่างเตรียมต้นฉบับ", cls: "" },
  "แล้วเสร็จ": { label: "แล้วเสร็จ", cls: "ok" },
  "ตรวจสถานะ": { label: "ทุนวิจัย", cls: "info" }
};
var state = { view: "home", open: true, draft: true, layout: "card", q: "", type: "" };

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function $(id) { return document.getElementById(id); }
function visible() {
  return ITEMS.filter(function (i) { return i.web !== "ไม่" && (state.draft || i.status !== "ระหว่างเลือกวารสาร"); });
}
function byType(list, t) { return list.filter(function (i) { return i.typ === t; }); }
function byStatus(list, s) { return list.filter(function (i) { return i.status === s; }); }

function fileUrl(id) { return "https://drive.google.com/file/d/" + id + "/view"; }
function fileBtn(i) {
  if (i.web === "ชื่อและสถานะเท่านั้น") return '<span class="muted">ไม่เปิดไฟล์บนเว็บ</span>';
  if (CFG.demo) return '<button type="button" class="btn sm" data-open="' + esc(i.code) + '">เปิดไฟล์ฉบับเต็ม ↗</button>';
  if (!state.open) return '<span class="muted">ปิดการเข้าถึงแล้ว</span>';
  if (!i.fileId) return '<span class="muted">ยังไม่พบไฟล์ในไดร์ฟ</span>';
  var h = '<a class="btn sm" href="' + fileUrl(i.fileId) + '" target="_blank" rel="noopener">เปิดไฟล์ฉบับเต็ม ↗</a>';
  (i.extra || []).forEach(function (x) { h += '<a class="btn sm" href="' + fileUrl(x.id) + '" target="_blank" rel="noopener">' + esc(x.label) + " ↗</a>"; });
  return h;
}
function pill(i) { var st = STATUS[i.status]; return st ? '<span class="pill ' + st.cls + '">' + esc(st.label) + "</span>" : ""; }

function card(i) {
  var locked = i.web === "ชื่อและสถานะเท่านั้น", off = !state.open || locked;
  return '<article class="pc"><div class="thumb' + (off ? " off" : "") + '" aria-hidden="true"><div class="paper"><div class="pk">' + esc(i.code) + '</div><span class="pt">' + esc(i.full || i.title) + '</span><span class="pl"></span></div>' + (i.fileId && state.open && !CFG.demo && !locked ? '<img class="shot" loading="lazy" alt="" src="https://drive.google.com/thumbnail?id=' + i.fileId + '&sz=w480" onerror="this.remove()">' : '') + '<span class="fmt">' + esc(i.ext.toUpperCase()) + "</span>" +
    (off ? '<span class="lock">' + (locked ? "ไม่เปิดไฟล์บนเว็บ" : "ปิดการเข้าถึง") + "</span>" : "") + '</div><div class="pcb"><div class="meta1"><span class="code">' + esc(i.code) + "</span><span>" + esc(TYPE[i.typ].short) + "</span>" +
    (i.year ? "<span>พ.ศ. " + esc(i.year) + "</span>" : "") + (i.pages > 1 ? "<span>" + i.pages + " หน้า</span>" : "") + "</div><h3>" + esc(i.full || i.title) + "</h3>" + (pill(i) ? "<div>" + pill(i) + "</div>" : "") +
    (i.desc ? '<p class="desc">' + esc(i.desc) + "</p>" : "") + (i.role ? '<p class="desc">บทบาท: ' + esc(i.role) + "</p>" : "") + '<div class="act">' + fileBtn(i) + "</div></div></article>";
}
function table(items) {
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>รหัส</th><th>ชื่อผลงาน</th><th>ปี</th><th>สถานะ</th><th>ไฟล์</th></tr></thead><tbody>' +
    items.map(function (i) {
      return '<tr><td class="code">' + esc(i.code) + '</td><td class="t">' + esc(i.full || i.title) + (i.desc ? '<div class="muted">' + esc(i.desc) + "</div>" : "") + '</td><td class="nowrap num">' + esc(i.year || "—") + "</td><td>" + (pill(i) || '<span class="muted">—</span>') + '</td><td class="nowrap">' + fileBtn(i) + "</td></tr>";
    }).join("") + "</tbody></table></div>";
}
function list(items) {
  return state.layout === "card" ? '<div class="cards">' + items.map(card).join("") + "</div>" : '<div class="card flush">' + table(items) + "</div>";
}

function counts(l, types) { return types.map(function (t) { var n = byType(l, t).length; return n ? TYPE[t].short + " " + n : ""; }).filter(Boolean).join(" · "); }

function renderNav() {
  var l = visible();
  var items = [["teaching", "การเรียนการสอน"], ["research", "งานวิจัยและวิชาการ"], ["service", "บริการวิชาการและการบริหาร"]];
  $("nav").innerHTML = '<a href="#home" data-v="home"' + (state.view === "home" ? ' aria-current="page"' : "") + ">หน้าแรก</a>" + items.map(function (p) {
    var g = GROUPS[p[0]], n = l.filter(function (i) { return i.g === g.g; }).length;
    return '<a href="#' + p[0] + '" data-v="' + p[0] + '"' + (state.view === p[0] ? ' aria-current="page"' : "") + ">" + p[1] + '<span class="count">' + n + "</span></a>";
  }).join("");
}
function footNote() {
  return CFG.demo ? "โหมดตัวอย่าง: ข้อมูลจากสำเนาในเว็บ ปุ่มเปิดไฟล์ยังไม่เชื่อมไดร์ฟ" : (DRIVE.ok ? "ข้อมูลอ่านสดจาก Google Sheet และ Google Drive" : "ข้อมูลรายการผลงานมาจากสำเนาล่าสุด ไฟล์หลักฐานปิดการเข้าถึงแล้ว");
}
function banner() {
  return '<div class="banner' + (state.open ? "" : " closed") + '" role="status">' + (state.open ? "ไฟล์หลักฐานเปิดให้ดูระหว่างการประเมินต่อสัญญาจ้าง ปีที่ 8 กดปุ่ม เปิดไฟล์ฉบับเต็ม ที่รายการผลงาน" : "ปิดการเข้าถึงไฟล์หลักฐานแล้ว รายการผลงานยังแสดงไว้ตามเดิม") + "</div>";
}

function renderHome() {
  var l = visible(), P = byType(l, "P"), R = byType(l, "R");
  var pub = byStatus(P, "เผยแพร่แล้ว").length, rev = byStatus(P, "อยู่ระหว่างพิจารณา").length, dr = byStatus(P, "ระหว่างเลือกวารสาร").length;
  var tot = Math.max(1, pub + rev + dr);
  var feat = ["B01", "B02", "B03", "P01"].map(function (c) { return l.filter(function (i) { return i.code === c; })[0]; }).filter(Boolean);
  var gl = ["teaching", "research", "service"].map(function (k) {
    var g = GROUPS[k], gi = l.filter(function (i) { return i.g === g.g; });
    return '<a href="#' + k + '" data-v="' + k + '"><div><b>กลุ่ม ' + g.n + " · " + esc(g.title) + "</b><span>" + esc(counts(gi, g.types)) + "</span></div><i>›</i></a>";
  }).join("");
  var kpi = function (label, val, note) { return '<div class="card kpi"><span class="kpi-l">' + label + '</span><span class="kpi-v">' + val + '</span><span class="kpi-n">' + note + "</span></div>"; };
  return '<header class="page-head"><div><div class="eyebrow">แฟ้มผลงานทางวิชาการและการปฏิบัติงาน</div><h1 class="title">อ.ดร.ปุริม ศรีสวัสดิ์</h1><div class="sub">ประกอบการประเมินเพื่อต่อสัญญาจ้างพนักงานมหาวิทยาลัยสายวิชาการ ปีที่ 8</div></div></header>' + banner() +
    '<section class="card"><div class="profile"><img class="photo" src="assets/photo.jpg" alt="รูปถ่าย อ.ดร.ปุริม ศรีสวัสดิ์"><div class="pbody"><div><h2 style="font-size:21px">อ.ดร.ปุริม ศรีสวัสดิ์</h2><div class="muted">อาจารย์ประจำ คณะบริหารธุรกิจ มหาวิทยาลัยรามคำแหง</div></div>' +
    '<p>' + esc(CFG.intro || "") + '</p>' +
    '<div class="info"><div><span>ตำแหน่ง</span><b>อาจารย์ประจำ</b></div><div><span>สังกัด</span><b>คณะบริหารธุรกิจ</b></div><div><span>มหาวิทยาลัย</span><b>รามคำแหง</b></div><div><span>ความสนใจ</span><b>โลจิสติกส์ · การขนส่ง · การท่องเที่ยว</b></div></div></div></div></section>' +
    '<section class="grid-kpi">' + kpi("ตำรา", byType(l, "B").length, "ตำราที่ใช้ประกอบการสอน") +
    kpi("บทความวิชาการ", P.length, "เผยแพร่แล้ว " + pub + " · พิจารณา " + rev + " · เตรียมต้นฉบับ " + dr) +
    kpi("โครงการวิจัย", R.length, "แล้วเสร็จ " + byStatus(R, "แล้วเสร็จ").length + " · สัญญาทุน " + byStatus(R, "ตรวจสถานะ").length) +
    kpi("เอกสารประกอบการสอน", byType(l, "T").length + byType(l, "M").length, "ป.ตรี " + byType(l, "T").length + " · ป.โท " + byType(l, "M").length) + "</section>" +
    '<section class="row"><div class="card col2"><div class="card-h"><h2>ผลงานตามกลุ่ม</h2><span class="muted">กดเพื่อดูรายการ</span></div><div class="glist">' + gl + "</div></div>" +
    '<div class="card col1"><div class="card-h"><h2>สถานะบทความวิชาการ</h2><span class="muted">' + P.length + " เรื่อง</span></div><div class=\"split\" role=\"img\" aria-label=\"สัดส่วนสถานะบทความ\">" +
    '<div style="width:' + pub / tot * 100 + '%;background:var(--ok)"></div><div style="width:' + rev / tot * 100 + '%;background:var(--warn)"></div><div style="width:' + dr / tot * 100 + '%;background:var(--idle)"></div></div>' +
    '<div class="legend"><div><i class="dot" style="background:var(--ok)"></i>เผยแพร่แล้ว<b>' + pub + '</b></div><div><i class="dot" style="background:var(--warn)"></i>อยู่ระหว่างพิจารณา<b>' + rev + '</b></div><div><i class="dot" style="background:var(--idle)"></i>อยู่ระหว่างเตรียมต้นฉบับ<b>' + dr + "</b></div></div></div></section>" +
    '<p class="foot-note">' + footNote() + '</p>';
}

function renderGroup(k) {
  var g = GROUPS[k];
  var typeOpts = '<option value="">ทุกประเภท</option>' + g.types.filter(function (t) { return byType(visible().filter(function (i) { return i.g === g.g; }), t).length; }).map(function (t) { return '<option value="' + t + '"' + (state.type === t ? " selected" : "") + ">" + esc(TYPE[t].name) + "</option>"; }).join("");
  return '<header class="page-head"><div><div class="eyebrow">กลุ่ม ' + g.n + '</div><h1 class="title">' + esc(g.title) + '</h1><div class="sub">' + esc(g.desc) + '</div></div>' +
    '<div class="seg" role="group" aria-label="รูปแบบการแสดง"><button type="button" data-layout="card" aria-pressed="' + (state.layout === "card") + '">การ์ด</button><button type="button" data-layout="table" aria-pressed="' + (state.layout === "table") + '">ตาราง</button></div></header>' + banner() +
    '<div class="ctls"><input type="search" id="q" placeholder="ค้นหาชื่อผลงานหรือรหัส เช่น B01" aria-label="ค้นหาผลงาน" value="' + esc(state.q) + '"><select id="typeSel" aria-label="กรองตามประเภท">' + typeOpts + '</select><span class="count" id="cnt"></span></div><div id="results"></div>';
}
function renderResults() {
  var g = GROUPS[state.view], q = state.q.trim().toLowerCase();
  var l = visible().filter(function (i) {
    return i.g === g.g && (!state.type || i.typ === state.type) && (!q || (i.code + " " + i.title + " " + (i.full || "")).toLowerCase().indexOf(q) >= 0);
  });
  $("cnt").textContent = "แสดง " + l.length + " รายการ";
  if (!l.length) { $("results").innerHTML = '<div class="card"><div class="empty">ไม่พบรายการที่ตรงกับเงื่อนไข</div></div>'; return; }
  $("results").innerHTML = g.types.map(function (t) {
    var items = byType(l, t);
    if (!items.length) return "";
    var inner;
    if (t === "P") {
      var notes = { "อยู่ระหว่างพิจารณา": "แสดงชื่อเรื่องและสถานะ ไม่เปิดไฟล์บนเว็บ", "ระหว่างเลือกวารสาร": state.open ? "ต้นฉบับที่ยังไม่ส่งวารสาร เปิดให้ดูเฉพาะช่วงการประเมิน" : "ต้นฉบับที่ยังไม่ส่งวารสาร" };
      inner = ["เผยแพร่แล้ว", "อยู่ระหว่างพิจารณา", "ระหว่างเลือกวารสาร"].map(function (s) {
        var sub = byStatus(items, s);
        if (!sub.length) return "";
        return '<div class="group-h"><span class="pill ' + STATUS[s].cls + '">' + esc(STATUS[s].label) + " · " + sub.length + "</span>" + (notes[s] ? '<span class="muted">' + esc(notes[s]) + "</span>" : "") + "</div>" + list(sub);
      }).join("");
    } else inner = list(items);
    return '<section style="margin-bottom:30px"><div class="zone-h"><i></i><h2>' + esc(TYPE[t].name) + "</h2><span>" + items.length + " รายการ</span></div>" + inner + "</section>";
  }).join("");
}

function render() {
  renderNav();
  if (state.view === "home") $("main").innerHTML = renderHome();
  else { $("main").innerHTML = renderGroup(state.view); renderResults(); }
}
function readHash() { var h = (location.hash || "").replace("#", ""); return GROUPS.hasOwnProperty(h) ? h : "home"; }
function setView(v) { state.view = v; state.q = ""; state.type = ""; render(); window.scrollTo(0, 0); }
var toastTimer;
function toast(msg) { var t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3200); }

document.addEventListener("click", function (e) {
  var v = e.target.closest("[data-v]");
  if (v) { e.preventDefault(); var n = v.getAttribute("data-v"); if (location.hash.replace("#", "") === n || (n === "home" && !location.hash)) setView(n); else location.hash = n; return; }
  var lay = e.target.closest("[data-layout]");
  if (lay) { state.layout = lay.getAttribute("data-layout"); render(); return; }
  var o = e.target.closest("[data-open]");
  if (o) toast("ตัวอย่าง: ในเว็บจริง ปุ่มนี้เปิดไฟล์ " + o.getAttribute("data-open") + " ใน Google Drive");
});
document.addEventListener("input", function (e) { if (e.target.id === "q") { state.q = e.target.value; renderResults(); } });
document.addEventListener("change", function (e) {
  if (e.target.id === "typeSel") { state.type = e.target.value; renderResults(); }
  else if (e.target.id === "optOpen") { state.open = e.target.checked; render(); }
  else if (e.target.id === "optDraft") { state.draft = e.target.checked; render(); }
});
window.addEventListener("hashchange", function () { setView(readHash()); });


/* ---------- โหลดข้อมูล: Google Sheet (รายการ) + Google Drive (ไฟล์จริง) ---------- */
function parseCSV(text) {
  var rows = [], row = [], cur = "", q = false, k;
  for (k = 0; k < text.length; k++) {
    var c = text[k];
    if (q) { if (c === '"') { if (text[k + 1] === '"') { cur += '"'; k++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
var GROUP_OF = { T: 1, M: 1, B: 2, P: 2, R: 2, S: 3, A: 3, D: 3 };
function rowsToItems(rows) {
  var head = rows[0].map(function (h) { return h.trim(); });
  function col(n) { return head.indexOf(n); }
  var ix = { code: col("รหัส"), kind: col("ชนิดไฟล์"), year: col("ปี พ.ศ."), ext: col("นามสกุล"), status: col("สถานะ"), web: col("แสดงบนเว็บ"), full: col("ชื่อเต็มของผลงาน"), name: col("ชื่อสำหรับตั้งชื่อไฟล์"), desc: col("รายละเอียดสั้น"), role: col("บทบาท") };
  var main = {}, extras = [], list = [];
  rows.slice(1).forEach(function (r) {
    var code = (r[ix.code] || "").trim();
    if (!/^[A-Z]\d{2}$/.test(code)) return;
    var rec = { code: code, g: GROUP_OF[code[0]], typ: code[0], year: (r[ix.year] || "").trim(), full: (r[ix.full] || "").trim(), title: (r[ix.name] || "").trim(), status: (r[ix.status] || "").trim(), web: (r[ix.web] || "ใช่").trim() || "ใช่", desc: (r[ix.desc] || "").trim(), role: (r[ix.role] || "").trim(), ext: (r[ix.ext] || "pdf").trim(), pages: 0, kind: (r[ix.kind] || "หลัก").trim() };
    if (rec.kind === "ประกอบ") extras.push(rec); else { main[code] = rec; list.push(rec); }
  });
  extras.forEach(function (x) { if (main[x.code]) (main[x.code].extraRows = main[x.code].extraRows || []).push(x); });
  return list;
}
function fetchSheet() {
  var u = "https://docs.google.com/spreadsheets/d/" + CFG.sheetId + "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(CFG.sheetName || "สารบัญผลงาน");
  return fetch(u).then(function (r) { if (!r.ok) throw new Error("sheet " + r.status); return r.text(); }).then(function (t) {
    if (t.charAt(0) === "<") throw new Error("sheet not public");
    return rowsToItems(parseCSV(t));
  });
}
function listFolder(id, out) {
  var u = "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent("'" + id + "' in parents and trashed=false") + "&fields=files(id,name,mimeType)&pageSize=1000&key=" + CFG.apiKey;
  return fetch(u).then(function (r) { if (!r.ok) throw new Error("drive " + r.status); return r.json(); }).then(function (d) {
    var subs = [];
    (d.files || []).forEach(function (f) {
      if (f.mimeType === "application/vnd.google-apps.folder") subs.push(listFolder(f.id, out));
      else out.push(f);
    });
    return Promise.all(subs);
  });
}
function fetchDrive() {
  var out = [];
  return listFolder(CFG.rootFolderId, out).then(function () { return out; });
}
function attachFiles(items, files) {
  var byCode = {};
  files.forEach(function (f) {
    var m = /^([A-Z]\d{2})_(.+)\.[A-Za-z0-9]+$/.exec(f.name);
    if (!m) return;
    var supporting = !/^\d{4}_/.test(m[2]);
    (byCode[m[1]] = byCode[m[1]] || { main: null, extra: [] });
    if (supporting) byCode[m[1]].extra.push({ id: f.id, label: m[2].replace(/_/g, " ") }); else byCode[m[1]].main = f;
  });
  items.forEach(function (i) {
    var b = byCode[i.code];
    if (!b) return;
    if (b.main) i.fileId = b.main.id;
    i.extra = b.extra;
  });
}
function start() {
  var sheet = CFG.demo ? fetch("data/snapshot.json").then(function (r) { return r.json(); }) : fetchSheet().catch(function () { return fetch("data/snapshot.json").then(function (r) { return r.json(); }); });
  sheet.then(function (items) {
    ITEMS = items;
    if (CFG.demo) { DRIVE.ok = false; state.open = true; render(); return; }
    return fetchDrive().then(function (files) { DRIVE.ok = true; state.open = true; attachFiles(ITEMS, files); }).catch(function () { DRIVE.ok = false; state.open = false; }).then(render);
  }).catch(function () { $("main").innerHTML = '<div class="card"><div class="empty">โหลดรายการผลงานไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง</div></div>'; });
}
state.view = readHash();
render();
start();
