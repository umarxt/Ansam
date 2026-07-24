// تهيئة قاعدة البيانات تلقائياً عند أول تشغيل (idempotent)
// الجداول تُنشأ إن لم تكن موجودة، والبيانات الأولية تُزرع فقط إذا كانت القاعدة فارغة.

const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    emp_code TEXT,
    role TEXT NOT NULL DEFAULT 'employee',
    phone TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_type TEXT NOT NULL,
    number TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT,
    client_name TEXT NOT NULL,
    client_vat TEXT,
    client_phone TEXT,
    client_address TEXT,
    items TEXT NOT NULL DEFAULT '[]',
    subtotal REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    vat_rate REAL NOT NULL DEFAULT 15,
    vat_amount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type)`,
  `CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(issue_date)`,
  `CREATE TABLE IF NOT EXISTS finance_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    txn_date TEXT NOT NULL,
    txn_type TEXT NOT NULL DEFAULT 'income',
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    description TEXT,
    category TEXT,
    employee_id INTEGER,
    document_id INTEGER,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_txn_date ON finance_transactions(txn_date)`,
  `CREATE INDEX IF NOT EXISTS idx_txn_method ON finance_transactions(payment_method)`,
  `CREATE INDEX IF NOT EXISTS idx_txn_employee ON finance_transactions(employee_id)`,
  `CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
  )`,
  `INSERT OR IGNORE INTO counters (name, value) VALUES ('invoice', 0)`,
  `INSERT OR IGNORE INTO counters (name, value) VALUES ('quote', 0)`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  )`,
];

// حساب المدير الافتراضي: admin / Ansam@2026
const ADMIN_HASH =
  "dNzjUkPjxK0nWQ6fEoo0kw==:p8sz8nh90ULXsFXL2UcWToTbGwuI/mmC4GPd+uuJAyA=";

const SEED: string[] = [
  `INSERT OR IGNORE INTO employees (name, username, password_hash, emp_code, role, active)
   VALUES ('مدير النظام', 'admin', '${ADMIN_HASH}', 'ADM-001', 'admin', 1)`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('company', json('{
    "name_ar": "مؤسسة أنسام",
    "name_en": "ANSAM",
    "activity": "خدمات الصيانة والتبريد والتكييف وصيانة المطابخ والأفران الكبيرة",
    "cr_number": "", "vat_number": "", "phone": "0555555555",
    "email": "info@ansam.sa", "website": "www.ansam.sa",
    "address": "المملكة العربية السعودية", "iban": "", "bank_name": ""
  }'))`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('invoice_defaults', json('{
    "vat_rate": 15, "currency": "SAR", "currency_ar": "ريال",
    "terms": "تسدد المستحقات خلال 15 يوماً من تاريخ الفاتورة.",
    "footer": "شكراً لتعاملكم مع أنسام"
  }'))`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('integrations', json('{
    "sheets_webhook_url": "", "sheets_enabled": false
  }'))`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('landing', json('{
    "hero_title": "أنسام للصيانة والتبريد",
    "hero_subtitle": "حلول متكاملة للتكييف والتبريد وصيانة المطابخ والأفران الكبيرة للشركات والفنادق والمنشآت.",
    "phone": "0555555555", "email": "info@ansam.sa", "whatsapp": "0555555555", "instagram": "AnsamSA",
    "services": [
      {"title": "صيانة التكييف والتبريد", "desc": "تركيب وصيانة أنظمة التكييف المركزي والمكيفات الكبيرة بكفاءة عالية."},
      {"title": "صيانة المطابخ والأفران", "desc": "صيانة متخصصة للمطابخ التجارية والأفران الكبيرة والمعدات الحرارية."},
      {"title": "عقود التشغيل والصيانة", "desc": "عقود سنوية للشركات والفنادق والمنشآت مع فرق دعم متخصصة."},
      {"title": "صيانة الطوارئ", "desc": "استجابة سريعة على مدار الساعة لأعطال التبريد والتكييف الطارئة."}
    ]
  }'))`,
];

let initialized = false;

export async function ensureSchema(db: D1Database): Promise<void> {
  if (initialized || !db) return;
  try {
    await db.batch(SCHEMA.map((s) => db.prepare(s)));
    const row = await db.prepare("SELECT COUNT(*) AS c FROM employees").first<{ c: number }>();
    if (!row || row.c === 0) {
      await db.batch(SEED.map((s) => db.prepare(s)));
    }
    initialized = true;
  } catch (e) {
    // لا نضبط العلم كي يُعاد المحاولة في الطلب التالي
    console.error("ensureSchema failed", e);
  }
}
