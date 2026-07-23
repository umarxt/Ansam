-- ============================================================
--  قاعدة بيانات منصة أنسام الإدارية  (Cloudflare D1 / SQLite)
-- ============================================================

-- الموظفون والمستخدمون
CREATE TABLE IF NOT EXISTS employees (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  username      TEXT    NOT NULL UNIQUE,          -- اسم الدخول
  password_hash TEXT    NOT NULL,                 -- PBKDF2  (salt:hash)
  emp_code      TEXT,                             -- رمز الموظف
  role          TEXT    NOT NULL DEFAULT 'employee', -- admin | employee
  phone         TEXT,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- إعدادات عامة (بيانات الشركة / الهيدر / محتوى صفحة الهبوط / روابط)  key -> json value
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المستندات: الفواتير وعروض الأسعار في جدول واحد
CREATE TABLE IF NOT EXISTS documents (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_type       TEXT    NOT NULL,                -- invoice | quote
  number         TEXT    NOT NULL,                -- رقم الفاتورة / العرض
  issue_date     TEXT    NOT NULL,                -- التاريخ
  due_date       TEXT,
  client_name    TEXT    NOT NULL,
  client_vat     TEXT,                            -- الرقم الضريبي للعميل
  client_phone   TEXT,
  client_address TEXT,
  items          TEXT    NOT NULL DEFAULT '[]',   -- JSON: [{desc, qty, price}]
  subtotal       REAL    NOT NULL DEFAULT 0,
  discount       REAL    NOT NULL DEFAULT 0,
  vat_rate       REAL    NOT NULL DEFAULT 15,
  vat_amount     REAL    NOT NULL DEFAULT 0,
  total          REAL    NOT NULL DEFAULT 0,
  payment_method TEXT,                            -- cash | transfer | pos
  status         TEXT    NOT NULL DEFAULT 'draft',-- draft | issued | paid | cancelled
  notes          TEXT,
  created_by     INTEGER,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES employees(id)
);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(issue_date);

-- الحركات المالية
CREATE TABLE IF NOT EXISTS finance_transactions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  txn_date       TEXT    NOT NULL,
  txn_type       TEXT    NOT NULL DEFAULT 'income',  -- income | expense
  amount         REAL    NOT NULL,
  payment_method TEXT    NOT NULL,                   -- cash | transfer | pos
  description    TEXT,
  category       TEXT,
  employee_id    INTEGER,                            -- الموظف المستلم (مهم للنقدي)
  document_id    INTEGER,                            -- ربط بفاتورة
  created_by     INTEGER,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (created_by)  REFERENCES employees(id)
);
CREATE INDEX IF NOT EXISTS idx_txn_date ON finance_transactions(txn_date);
CREATE INDEX IF NOT EXISTS idx_txn_method ON finance_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_txn_employee ON finance_transactions(employee_id);

-- عدّادات الترقيم التلقائي
CREATE TABLE IF NOT EXISTS counters (
  name  TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO counters (name, value) VALUES ('invoice', 0);
INSERT OR IGNORE INTO counters (name, value) VALUES ('quote', 0);

-- جلسات الدخول
CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
