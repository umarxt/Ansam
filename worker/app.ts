import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { ensureSchema } from "./schema";

type Bindings = {
  DB: D1Database;
  SESSION_SECRET: string;
  ASSETS: Fetcher;
};

type SessionUser = {
  id: number;
  name: string;
  username: string;
  role: string;
  emp_code: string | null;
};

export const app = new Hono<{ Bindings: Bindings; Variables: { user: SessionUser } }>().basePath("/api");

// تهيئة قاعدة البيانات تلقائياً عند أول طلب
app.use("*", async (c, next) => {
  await ensureSchema(c.env.DB);
  await next();
});

/* ----------------------------- أدوات مساعدة ----------------------------- */

const enc = new TextEncoder();

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return b64(salt) + ":" + b64(new Uint8Array(bits));
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltB64, hashB64] = stored.split(":");
    const salt = fromB64(saltB64);
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      key,
      256
    );
    return b64(new Uint8Array(bits)) === hashB64;
  } catch {
    return false;
  }
}

function b64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getSetting<T = any>(db: D1Database, key: string, fallback: T): Promise<T> {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first<{ value: string }>();
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

async function setSetting(db: D1Database, key: string, value: any): Promise<void> {
  await db
    .prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')")
    .bind(key, JSON.stringify(value))
    .run();
}

// إرسال نسخة احتياطية إلى Google Sheets (اختياري)
async function backupToSheets(db: D1Database, ctx: ExecutionContext | undefined, kind: string, payload: any) {
  try {
    const integ = await getSetting<{ sheets_webhook_url: string; sheets_enabled: boolean }>(db, "integrations", {
      sheets_webhook_url: "",
      sheets_enabled: false,
    });
    if (!integ.sheets_enabled || !integ.sheets_webhook_url) return;
    const doPost = fetch(integ.sheets_webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, payload, at: new Date().toISOString() }),
    }).catch(() => {});
    if (ctx) ctx.waitUntil(doPost);
    else await doPost;
  } catch {
    /* التجاهل — النسخ الاحتياطي لا يجب أن يعطل العملية */
  }
}

/* ----------------------------- المصادقة ----------------------------- */

async function currentUser(c: any): Promise<SessionUser | null> {
  const token = getCookie(c, "ansam_session");
  if (!token) return null;
  const row = await c.env.DB.prepare(
    `SELECT e.id, e.name, e.username, e.role, e.emp_code, s.expires_at
     FROM sessions s JOIN employees e ON e.id = s.employee_id
     WHERE s.token = ? AND e.active = 1`
  )
    .bind(token)
    .first<SessionUser & { expires_at: string }>();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
    return null;
  }
  return { id: row.id, name: row.name, username: row.username, role: row.role, emp_code: row.emp_code };
}

const requireAuth = async (c: any, next: any) => {
  const user = await currentUser(c);
  if (!user) return c.json({ error: "غير مصرح" }, 401);
  c.set("user", user);
  await next();
};

const requireAdmin = async (c: any, next: any) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") return c.json({ error: "هذه العملية للمدير فقط" }, 403);
  await next();
};

app.post("/auth/login", async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}));
  if (!username || !password) return c.json({ error: "أدخل اسم الدخول وكلمة المرور" }, 400);
  const emp = await c.env.DB.prepare("SELECT * FROM employees WHERE username = ? AND active = 1")
    .bind(username)
    .first<any>();
  if (!emp || !(await verifyPassword(password, emp.password_hash))) {
    return c.json({ error: "بيانات الدخول غير صحيحة" }, 401);
  }
  const token = randomToken();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await c.env.DB.prepare("INSERT INTO sessions (token, employee_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, emp.id, expires.toISOString())
    .run();
  setCookie(c, "ansam_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return c.json({
    user: { id: emp.id, name: emp.name, username: emp.username, role: emp.role, emp_code: emp.emp_code },
  });
});

app.post("/auth/logout", async (c) => {
  const token = getCookie(c, "ansam_session");
  if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  deleteCookie(c, "ansam_session", { path: "/" });
  return c.json({ ok: true });
});

app.get("/auth/me", async (c) => {
  const user = await currentUser(c);
  if (!user) return c.json({ user: null }, 200);
  return c.json({ user });
});

/* ----------------------------- المحتوى العام (صفحة الهبوط) ----------------------------- */

app.get("/public/landing", async (c) => {
  const landing = await getSetting(c.env.DB, "landing", {});
  const company = await getSetting(c.env.DB, "company", {});
  return c.json({ landing, company });
});

/* ============================================================
   من هنا فصاعداً: كل شيء يتطلب تسجيل الدخول
   ============================================================ */
app.use("/employees/*", requireAuth);
app.use("/employees", requireAuth);
app.use("/documents/*", requireAuth);
app.use("/documents", requireAuth);
app.use("/finance/*", requireAuth);
app.use("/finance", requireAuth);
app.use("/dashboard", requireAuth);
app.use("/settings/*", requireAuth);
app.use("/account/*", requireAuth);

/* ----------------------------- الموظفون ----------------------------- */

app.get("/employees", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, username, emp_code, role, phone, active, created_at FROM employees ORDER BY id"
  ).all();
  return c.json({ employees: results });
});

app.post("/employees", requireAdmin, async (c) => {
  const b = await c.req.json().catch(() => ({}));
  const { name, username, password, emp_code, role, phone } = b;
  if (!name || !username || !password) return c.json({ error: "الاسم واسم الدخول وكلمة المرور مطلوبة" }, 400);
  const exists = await c.env.DB.prepare("SELECT id FROM employees WHERE username = ?").bind(username).first();
  if (exists) return c.json({ error: "اسم الدخول مستخدم مسبقاً" }, 409);
  const hash = await hashPassword(password);
  const res = await c.env.DB.prepare(
    "INSERT INTO employees (name, username, password_hash, emp_code, role, phone) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(name, username, hash, emp_code || null, role === "admin" ? "admin" : "employee", phone || null)
    .run();
  return c.json({ id: res.meta.last_row_id });
});

app.put("/employees/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json().catch(() => ({}));
  const emp = await c.env.DB.prepare("SELECT * FROM employees WHERE id = ?").bind(id).first<any>();
  if (!emp) return c.json({ error: "الموظف غير موجود" }, 404);

  const name = b.name ?? emp.name;
  const emp_code = b.emp_code ?? emp.emp_code;
  const role = b.role ? (b.role === "admin" ? "admin" : "employee") : emp.role;
  const phone = b.phone ?? emp.phone;
  const active = b.active === undefined ? emp.active : b.active ? 1 : 0;

  if (b.password) {
    const hash = await hashPassword(b.password);
    await c.env.DB.prepare(
      "UPDATE employees SET name=?, emp_code=?, role=?, phone=?, active=?, password_hash=?, updated_at=datetime('now') WHERE id=?"
    )
      .bind(name, emp_code, role, phone, active, hash, id)
      .run();
  } else {
    await c.env.DB.prepare(
      "UPDATE employees SET name=?, emp_code=?, role=?, phone=?, active=?, updated_at=datetime('now') WHERE id=?"
    )
      .bind(name, emp_code, role, phone, active, id)
      .run();
  }
  return c.json({ ok: true });
});

app.delete("/employees/:id", requireAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  const user = c.get("user");
  if (id === user.id) return c.json({ error: "لا يمكنك حذف حسابك الحالي" }, 400);
  await c.env.DB.prepare("DELETE FROM sessions WHERE employee_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM employees WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// تغيير كلمة المرور للحساب الحالي
app.post("/account/password", async (c) => {
  const user = c.get("user");
  const { current, next } = await c.req.json().catch(() => ({}));
  if (!next || next.length < 6) return c.json({ error: "كلمة المرور الجديدة قصيرة" }, 400);
  const emp = await c.env.DB.prepare("SELECT * FROM employees WHERE id = ?").bind(user.id).first<any>();
  if (!emp || !(await verifyPassword(current || "", emp.password_hash)))
    return c.json({ error: "كلمة المرور الحالية غير صحيحة" }, 401);
  const hash = await hashPassword(next);
  await c.env.DB.prepare("UPDATE employees SET password_hash=?, updated_at=datetime('now') WHERE id=?")
    .bind(hash, user.id)
    .run();
  return c.json({ ok: true });
});

/* ----------------------------- الترقيم التلقائي ----------------------------- */

async function nextNumber(db: D1Database, type: "invoice" | "quote"): Promise<string> {
  await db.prepare("UPDATE counters SET value = value + 1 WHERE name = ?").bind(type).run();
  const row = await db.prepare("SELECT value FROM counters WHERE name = ?").bind(type).first<{ value: number }>();
  const n = row?.value ?? 1;
  const year = new Date().getFullYear();
  const prefix = type === "invoice" ? "INV" : "QUO";
  return `${prefix}-${year}-${String(n).padStart(4, "0")}`;
}

app.get("/documents/next-number", async (c) => {
  const type = (c.req.query("type") as "invoice" | "quote") || "invoice";
  // معاينة فقط دون استهلاك العدّاد
  const row = await c.env.DB.prepare("SELECT value FROM counters WHERE name = ?").bind(type).first<{ value: number }>();
  const n = (row?.value ?? 0) + 1;
  const year = new Date().getFullYear();
  const prefix = type === "invoice" ? "INV" : "QUO";
  return c.json({ number: `${prefix}-${year}-${String(n).padStart(4, "0")}` });
});

/* ----------------------------- المستندات (فواتير / عروض) ----------------------------- */

function computeTotals(items: any[], discount: number, vatRate: number) {
  const subtotal = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
  const afterDiscount = Math.max(0, subtotal - Number(discount || 0));
  const vatAmount = afterDiscount * (Number(vatRate || 0) / 100);
  const total = afterDiscount + vatAmount;
  return {
    subtotal: round2(subtotal),
    vat_amount: round2(vatAmount),
    total: round2(total),
  };
}
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

app.get("/documents", async (c) => {
  const type = c.req.query("type");
  const q = c.req.query("q");
  let sql =
    "SELECT d.*, e.name AS created_by_name FROM documents d LEFT JOIN employees e ON e.id = d.created_by WHERE 1=1";
  const binds: any[] = [];
  if (type) {
    sql += " AND d.doc_type = ?";
    binds.push(type);
  }
  if (q) {
    sql += " AND (d.client_name LIKE ? OR d.number LIKE ?)";
    binds.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY d.id DESC LIMIT 500";
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return c.json({ documents: results });
});

app.get("/documents/:id", async (c) => {
  const doc = await c.env.DB.prepare(
    "SELECT d.*, e.name AS created_by_name FROM documents d LEFT JOIN employees e ON e.id = d.created_by WHERE d.id = ?"
  )
    .bind(c.req.param("id"))
    .first();
  if (!doc) return c.json({ error: "المستند غير موجود" }, 404);
  return c.json({ document: doc });
});

app.post("/documents", async (c) => {
  const user = c.get("user");
  const b = await c.req.json().catch(() => ({}));
  const type = b.doc_type === "quote" ? "quote" : "invoice";
  const defaults = await getSetting<any>(c.env.DB, "invoice_defaults", { vat_rate: 15 });
  const vatRate = b.vat_rate ?? defaults.vat_rate ?? 15;
  const items = Array.isArray(b.items) ? b.items : [];
  const discount = Number(b.discount || 0);
  const totals = computeTotals(items, discount, vatRate);
  const number = b.number || (await nextNumber(c.env.DB, type));
  const issueDate = b.issue_date || new Date().toISOString().slice(0, 10);

  const res = await c.env.DB.prepare(
    `INSERT INTO documents
      (doc_type, number, issue_date, due_date, client_name, client_vat, client_phone, client_address,
       items, subtotal, discount, vat_rate, vat_amount, total, payment_method, status, notes, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  )
    .bind(
      type,
      number,
      issueDate,
      b.due_date || null,
      b.client_name || "",
      b.client_vat || null,
      b.client_phone || null,
      b.client_address || null,
      JSON.stringify(items),
      totals.subtotal,
      discount,
      vatRate,
      totals.vat_amount,
      totals.total,
      b.payment_method || null,
      b.status || "issued",
      b.notes || null,
      user.id
    )
    .run();

  const docId = res.meta.last_row_id;

  // فاتورة مدفوعة => قيد مالي تلقائي
  if (type === "invoice" && (b.status === "paid" || b.create_txn)) {
    await c.env.DB.prepare(
      `INSERT INTO finance_transactions (txn_date, txn_type, amount, payment_method, description, category, employee_id, document_id, created_by)
       VALUES (?, 'income', ?, ?, ?, 'فاتورة', ?, ?, ?)`
    )
      .bind(
        issueDate,
        totals.total,
        b.payment_method || "cash",
        `تحصيل فاتورة ${number} - ${b.client_name || ""}`,
        b.received_by_employee_id || null,
        docId,
        user.id
      )
      .run();
  }

  await backupToSheets(c.env.DB, c.executionCtx, type, { id: docId, number, ...b, ...totals });
  return c.json({ id: docId, number });
});

app.put("/documents/:id", async (c) => {
  const id = c.req.param("id");
  const b = await c.req.json().catch(() => ({}));
  const doc = await c.env.DB.prepare("SELECT * FROM documents WHERE id = ?").bind(id).first<any>();
  if (!doc) return c.json({ error: "المستند غير موجود" }, 404);

  const items = Array.isArray(b.items) ? b.items : JSON.parse(doc.items || "[]");
  const discount = b.discount ?? doc.discount;
  const vatRate = b.vat_rate ?? doc.vat_rate;
  const totals = computeTotals(items, discount, vatRate);

  await c.env.DB.prepare(
    `UPDATE documents SET
      issue_date=?, due_date=?, client_name=?, client_vat=?, client_phone=?, client_address=?,
      items=?, subtotal=?, discount=?, vat_rate=?, vat_amount=?, total=?, payment_method=?, status=?, notes=?,
      updated_at=datetime('now')
     WHERE id=?`
  )
    .bind(
      b.issue_date ?? doc.issue_date,
      b.due_date ?? doc.due_date,
      b.client_name ?? doc.client_name,
      b.client_vat ?? doc.client_vat,
      b.client_phone ?? doc.client_phone,
      b.client_address ?? doc.client_address,
      JSON.stringify(items),
      totals.subtotal,
      discount,
      vatRate,
      totals.vat_amount,
      totals.total,
      b.payment_method ?? doc.payment_method,
      b.status ?? doc.status,
      b.notes ?? doc.notes,
      id
    )
    .run();
  return c.json({ ok: true });
});

app.delete("/documents/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM finance_transactions WHERE document_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM documents WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// تحويل عرض سعر إلى فاتورة
app.post("/documents/:id/convert", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const q = await c.env.DB.prepare("SELECT * FROM documents WHERE id = ? AND doc_type = 'quote'").bind(id).first<any>();
  if (!q) return c.json({ error: "عرض السعر غير موجود" }, 404);
  const number = await nextNumber(c.env.DB, "invoice");
  const issueDate = new Date().toISOString().slice(0, 10);
  const res = await c.env.DB.prepare(
    `INSERT INTO documents
      (doc_type, number, issue_date, client_name, client_vat, client_phone, client_address,
       items, subtotal, discount, vat_rate, vat_amount, total, status, notes, created_by)
     VALUES ('invoice',?,?,?,?,?,?,?,?,?,?,?,?,'issued',?,?)`
  )
    .bind(
      number,
      issueDate,
      q.client_name,
      q.client_vat,
      q.client_phone,
      q.client_address,
      q.items,
      q.subtotal,
      q.discount,
      q.vat_rate,
      q.vat_amount,
      q.total,
      q.notes,
      user.id
    )
    .run();
  return c.json({ id: res.meta.last_row_id, number });
});

/* ----------------------------- المالية ----------------------------- */

app.get("/finance", async (c) => {
  const method = c.req.query("method");
  const empId = c.req.query("employee_id");
  const from = c.req.query("from");
  const to = c.req.query("to");
  let sql = `SELECT t.*, e.name AS employee_name, d.number AS document_number
             FROM finance_transactions t
             LEFT JOIN employees e ON e.id = t.employee_id
             LEFT JOIN documents d ON d.id = t.document_id WHERE 1=1`;
  const binds: any[] = [];
  if (method) { sql += " AND t.payment_method = ?"; binds.push(method); }
  if (empId) { sql += " AND t.employee_id = ?"; binds.push(empId); }
  if (from) { sql += " AND t.txn_date >= ?"; binds.push(from); }
  if (to) { sql += " AND t.txn_date <= ?"; binds.push(to); }
  sql += " ORDER BY t.txn_date DESC, t.id DESC LIMIT 1000";
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return c.json({ transactions: results });
});

app.post("/finance", async (c) => {
  const user = c.get("user");
  const b = await c.req.json().catch(() => ({}));
  if (!b.amount || !b.payment_method) return c.json({ error: "المبلغ وطريقة الدفع مطلوبة" }, 400);
  // الدفع النقدي يتطلب تحديد الموظف المستلم
  if (b.payment_method === "cash" && !b.employee_id) {
    return c.json({ error: "الدفع النقدي يتطلب تحديد الموظف المستلم" }, 400);
  }
  const res = await c.env.DB.prepare(
    `INSERT INTO finance_transactions (txn_date, txn_type, amount, payment_method, description, category, employee_id, document_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?)`
  )
    .bind(
      b.txn_date || new Date().toISOString().slice(0, 10),
      b.txn_type === "expense" ? "expense" : "income",
      round2(Number(b.amount)),
      b.payment_method,
      b.description || null,
      b.category || null,
      b.employee_id || null,
      b.document_id || null,
      user.id
    )
    .run();
  await backupToSheets(c.env.DB, c.executionCtx, "finance", { id: res.meta.last_row_id, ...b });
  return c.json({ id: res.meta.last_row_id });
});

app.delete("/finance/:id", requireAdmin, async (c) => {
  await c.env.DB.prepare("DELETE FROM finance_transactions WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

// ملخص المالية حسب طريقة الدفع + حسب الموظف (النقدي)
app.get("/finance/summary", async (c) => {
  const byMethod = await c.env.DB.prepare(
    `SELECT payment_method,
            SUM(CASE WHEN txn_type='income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN txn_type='expense' THEN amount ELSE 0 END) AS expense
     FROM finance_transactions GROUP BY payment_method`
  ).all();
  const cashByEmployee = await c.env.DB.prepare(
    `SELECT e.id, e.name,
            SUM(CASE WHEN t.txn_type='income' THEN t.amount ELSE 0 END) AS collected
     FROM finance_transactions t JOIN employees e ON e.id = t.employee_id
     WHERE t.payment_method='cash' GROUP BY e.id, e.name ORDER BY collected DESC`
  ).all();
  return c.json({ byMethod: byMethod.results, cashByEmployee: cashByEmployee.results });
});

/* ----------------------------- لوحة المعلومات ----------------------------- */

app.get("/dashboard", async (c) => {
  const db = c.env.DB;
  const totals = await db.prepare(
    `SELECT
       (SELECT COUNT(*) FROM documents WHERE doc_type='invoice') AS invoices_count,
       (SELECT COUNT(*) FROM documents WHERE doc_type='quote') AS quotes_count,
       (SELECT COUNT(*) FROM employees WHERE active=1) AS employees_count,
       (SELECT COALESCE(SUM(total),0) FROM documents WHERE doc_type='invoice') AS invoices_total,
       (SELECT COALESCE(SUM(amount),0) FROM finance_transactions WHERE txn_type='income') AS income_total,
       (SELECT COALESCE(SUM(amount),0) FROM finance_transactions WHERE txn_type='expense') AS expense_total`
  ).first<any>();

  const byMethod = await db.prepare(
    `SELECT payment_method, COALESCE(SUM(amount),0) AS amount
     FROM finance_transactions WHERE txn_type='income' GROUP BY payment_method`
  ).all();

  const monthly = await db.prepare(
    `SELECT substr(txn_date,1,7) AS month,
            SUM(CASE WHEN txn_type='income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN txn_type='expense' THEN amount ELSE 0 END) AS expense
     FROM finance_transactions
     GROUP BY month ORDER BY month DESC LIMIT 6`
  ).all();

  const recent = await db.prepare(
    `SELECT id, doc_type, number, client_name, total, status, issue_date FROM documents ORDER BY id DESC LIMIT 6`
  ).all();

  return c.json({
    totals,
    byMethod: byMethod.results,
    monthly: (monthly.results || []).reverse(),
    recent: recent.results,
  });
});

/* ----------------------------- الإعدادات ----------------------------- */

const PUBLIC_SETTINGS = ["company", "invoice_defaults", "landing"];

app.get("/settings/:key", async (c) => {
  const key = c.req.param("key");
  const value = await getSetting(c.env.DB, key, {});
  return c.json({ key, value });
});

app.put("/settings/:key", requireAdmin, async (c) => {
  const key = c.req.param("key");
  const body = await c.req.json().catch(() => ({}));
  await setSetting(c.env.DB, key, body.value ?? body);
  return c.json({ ok: true });
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "خطأ داخلي في الخادم" }, 500);
});
