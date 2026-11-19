const crypto = require("crypto");
const REPO = process.env.GITHUB_REPO, BRANCH = process.env.GITHUB_BRANCH || "main";
const gh = (p, o = {}) => fetch(`https://api.github.com/repos/${REPO}/contents/${p}`, {
  ...o,
  headers: { Authorization: "Bearer " + process.env.GITHUB_TOKEN, Accept: "application/vnd.github+json", "User-Agent": "sr-portfolio", "Content-Type": "application/json" }
});
async function put(path, b64, msg) {
  const cur = await gh(`${path}?ref=${BRANCH}`);
  const sha = cur.ok ? (await cur.json()).sha : undefined;
  const r = await gh(path, { method: "PUT", body: JSON.stringify({ message: msg, content: b64, sha, branch: BRANCH }) });
  if (!r.ok) throw new Error("GitHub: " + (await r.text()).slice(0, 200));
}
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const b = req.body || {};
  const a = Buffer.from(String(b.password || "")), e = Buffer.from(process.env.ADMIN_PASSWORD || "");
  if (!(e.length && a.length === e.length && crypto.timingSafeEqual(a, e))) {
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: "كلمة المرور غير صحيحة" });
  }
  try {
    if (b.action === "auth") return res.json({ ok: true });
    if (b.action === "load") {
      const r = await gh(`data/site.json?ref=${BRANCH}`);
      if (!r.ok) throw new Error("تعذر قراءة site.json");
      const j = await r.json();
      return res.json({ data: JSON.parse(Buffer.from(j.content, "base64").toString("utf8")) });
    }
    if (b.action === "save") {
      if (!b.data || !Array.isArray(b.data.sections)) throw new Error("بيانات غير صالحة");
      await put("data/site.json", Buffer.from(JSON.stringify(b.data, null, 2)).toString("base64"), "Update site content");
      return res.json({ ok: true });
    }
    if (b.action === "upload") {
      if (!/^(images\/(designs|case-study)\/[a-z0-9._-]+\.(webp|png|jpg|jpeg|gif)|audio\/[a-z0-9._-]+\.(mp3|m4a|ogg|wav))$/.test(b.path || "")) throw new Error("مسار غير مسموح");
      await put(b.path, b.content, "Add file " + b.path);
      return res.json({ ok: true });
    }
    if (b.action === "delete") {
      if (!/^audio\/[a-z0-9._-]+\.(mp3|m4a|ogg|wav)$/.test(b.path || "")) throw new Error("مسار غير مسموح");
      const cur = await gh(`${b.path}?ref=${BRANCH}`);
      if (!cur.ok) return res.json({ ok: true });
      const sha = (await cur.json()).sha;
      const r = await gh(b.path, { method: "DELETE", body: JSON.stringify({ message: "Remove " + b.path, sha, branch: BRANCH }) });
      if (!r.ok) throw new Error("GitHub: " + (await r.text()).slice(0, 200));
      return res.json({ ok: true });
    }
    res.status(400).json({ error: "action" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
