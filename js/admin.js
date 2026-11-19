(() => {
  if (window.__adm) return; window.__adm = 1;
  const API = "/api/admin"; let pw = sessionStorage.getItem("srpw") || "", d, pend = {}, prev = {};
  const $ = s => ap.querySelector(s), esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const slug = n => n.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "img";
  const call = async body => { const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw, ...body }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.status); return j };
  const st = document.createElement("style");
  st.textContent = `#ap{position:fixed;inset:0;z-index:99;background:#0a0a10f2;overflow:auto;direction:rtl;text-align:right;font-family:system-ui,Arial,sans-serif;padding:16px}
#ap .bx{max-width:760px;margin:auto}#ap h2,#ap h3{color:#ff4d6d}#ap h3{margin:24px 0 8px}#ap label{display:block;font-size:13px;color:#9b9bab;margin:8px 0 3px}
#ap input,#ap select{width:100%;padding:10px;border-radius:8px;border:1px solid #33334a;background:#0d0d14;color:#fff;font-size:15px}
#ap button{margin:6px 0 0 6px;padding:9px 16px;border-radius:8px;border:0;background:#6c5ce7;color:#fff;cursor:pointer;font-size:14px}
#ap .d{background:#8b1d2e}#ap .g{background:#333}#ap .big{background:#ff4d6d;font-size:16px;padding:13px 22px}
#ap .row{display:flex;gap:8px;align-items:center;margin:6px 0}#ap .row input{flex:1}
#ap .mini{display:flex;flex-wrap:wrap;gap:10px}#ap .mini div{width:112px;font-size:11px;text-align:center;background:#16161f;padding:6px;border-radius:8px}
#ap .mini img{width:100%;height:90px;object-fit:cover;border-radius:6px}#ap .bar{position:sticky;bottom:0;background:#0a0a10;padding:10px 0}`;
  document.head.appendChild(st);
  const ap = document.createElement("div"); ap.id = "ap"; document.body.appendChild(ap);
  const close = () => { ap.remove(); st.remove(); window.__adm = 0; history.replaceState(null, "", location.pathname) };
  function login(msg) {
    ap.innerHTML = `<div class="bx"><h2>🔐 تسجيل الدخول</h2><input id="pw" type="password" placeholder="كلمة المرور" autocomplete="current-password"><button id="go" class="big">دخول</button><button id="cl" class="g">إغلاق</button><p id="er" style="color:#ff6b81">${msg || ""}</p></div>`;
    $("#cl").onclick = close;
    const go = async () => { pw = $("#pw").value; try { await call({ action: "auth" }); sessionStorage.setItem("srpw", pw); load() } catch (e) { login(e.message) } };
    $("#go").onclick = go; $("#pw").onkeydown = e => e.key == "Enter" && go();
  }
  async function load() { ap.innerHTML = '<div class="bx">جارٍ التحميل…</div>'; try { d = (await call({ action: "load" })).data; draw() } catch (e) { sessionStorage.removeItem("srpw"); login(e.message) } }
  function draw() {
    const opts = d.sections.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("");
    ap.innerHTML = `<div class="bx"><h2>⚙️ لوحة التحكم</h2><button id="cl" class="g">إغلاق</button><button id="lo" class="d">تسجيل خروج</button>
<h3>الصفحة الرئيسية</h3><label>الاسم</label><input data-k="name" value="${esc(d.name)}"><label>الوصف</label><input data-k="tag" value="${esc(d.tag)}">
<label><input type="checkbox" data-k="planets" style="width:auto" ${d.planets ? "checked" : ""}> إظهار الكواكب</label>
<h3>الأقسام</h3>${d.sections.map((s, i) => `<div class="row"><input data-sn="${i}" value="${esc(s.name)}"><button data-a="up" data-i="${i}">↑</button><button class="d" data-a="ds" data-i="${i}">حذف</button></div>`).join("")}
<div class="row"><input id="ns" placeholder="قسم جديد"><button data-a="addsec">إضافة</button></div>
<h3>إضافة تصميمات</h3><label>القسم</label><select id="dsec">${opts}</select><label>العنوان</label><input id="dt"><label>الصور (عدة ملفات)</label><input id="df" type="file" accept="image/*" multiple><button data-a="adddes">إضافة</button>
<h3>التصميمات</h3><div class="mini">${d.designs.map((x, i) => `<div><img src="${esc(prev[x.src] || "/" + x.src)}"><input data-dt="${i}" value="${esc(x.title)}"><select data-mv="${i}">${d.sections.map(s => `<option value="${s.id}" ${s.id == x.sec ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select><button class="d" data-a="dd" data-i="${i}">حذف</button></div>`).join("")}</div>
<h3>Case Study</h3><label>العنوان</label><input data-k="cst" value="${esc(d.cs.title)}"><label>صور المشروع</label><input id="cf" type="file" accept="image/*" multiple><button data-a="addcs">إضافة</button>
<div class="mini">${d.cs.images.map((u, i) => `<div><img src="${esc(prev[u] || "/" + u)}"><button data-a="cu" data-i="${i}">↑</button><button class="d" data-a="cd" data-i="${i}">✕</button></div>`).join("")}</div>
<h3>التواصل</h3>${d.socials.map((s, i) => `<div class="row"><input data-sc="n${i}" value="${esc(s.n)}"><input data-sc="u${i}" value="${esc(s.u)}"><button class="d" data-a="sd" data-i="${i}">✕</button></div>`).join("")}<button data-a="addsoc">+ منصة</button>
<div class="bar"><button class="big" data-a="save">💾 حفظ ونشر</button> <span id="msg"></span></div></div>`;
    $("#cl").onclick = close; $("#lo").onclick = () => { sessionStorage.removeItem("srpw"); pw = ""; login() };
  }
  ap.addEventListener("input", e => {
    const t = e.target, k = t.dataset;
    if (k.k == "name") d.name = t.value; if (k.k == "tag") d.tag = t.value; if (k.k == "planets") d.planets = t.checked; if (k.k == "cst") d.cs.title = t.value;
    if (k.sn) d.sections[+k.sn].name = t.value; if (k.dt) d.designs[+k.dt].title = t.value; if (k.mv) d.designs[+k.mv].sec = t.value;
    if (k.sc) d.socials[+k.sc.slice(1)][k.sc[0]] = t.value;
  });
  const b64 = blob => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result.split(",")[1]); f.readAsDataURL(blob) });
  async function shrink(file) {
    const bm = await createImageBitmap(file), s = Math.min(1, 2400 / Math.max(bm.width, bm.height)), c = document.createElement("canvas");
    c.width = Math.round(bm.width * s); c.height = Math.round(bm.height * s); c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height);
    return new Promise(r => c.toBlob(r, "image/webp", .9));
  }
  const addFiles = (inp, dir, fn) => { for (const f of inp.files) { const p = `images/${dir}/${slug(f.name)}-${Date.now().toString(36)}.webp`; pend[p] = f; prev[p] = URL.createObjectURL(f); fn(p) } };
  ap.addEventListener("click", async e => {
    const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a, i = +b.dataset.i, sw = arr => { if (i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]] };
    if (a == "up") sw(d.sections); if (a == "ds" && confirm("حذف القسم؟")) d.sections.splice(i, 1);
    if (a == "addsec") { const v = $("#ns").value.trim(); if (v) d.sections.push({ id: "s" + Date.now(), name: v }) }
    if (a == "adddes") { const t = $("#dt").value || "Design", sec = $("#dsec").value; addFiles($("#df"), "designs", p => d.designs.push({ sec, title: t, src: p })) }
    if (a == "dd") d.designs.splice(i, 1);
    if (a == "addcs") addFiles($("#cf"), "case-study", p => d.cs.images.push(p));
    if (a == "cu") sw(d.cs.images); if (a == "cd") d.cs.images.splice(i, 1);
    if (a == "addsoc") d.socials.push({ n: "New", u: "https://" }); if (a == "sd") d.socials.splice(i, 1);
    if (a == "save") {
      const m = $("#msg"); b.disabled = true;
      try {
        const used = new Set([...d.designs.map(x => x.src), ...d.cs.images]);
        for (const p of Object.keys(pend)) { if (!used.has(p)) { delete pend[p]; continue } m.textContent = "رفع " + p.split("/").pop() + "…"; await call({ action: "upload", path: p, content: await b64(await shrink(pend[p])) }); delete pend[p] }
        m.textContent = "حفظ المحتوى…"; await call({ action: "save", data: d });
        m.textContent = "✅ تم. سيظهر على الموقع خلال دقيقة تقريبًا.";
      } catch (err) { m.textContent = "❌ " + err.message } b.disabled = false; return;
    }
    draw();
  });
  pw ? load() : login();
})();
