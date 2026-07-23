-- ============================================================
--  بيانات أولية لمنصة أنسام
--  حساب المدير الافتراضي:
--    اسم الدخول: admin
--    كلمة المرور: Ansam@2026     (يُنصح بتغييرها بعد أول دخول)
-- ============================================================

INSERT OR IGNORE INTO employees (name, username, password_hash, emp_code, role, active)
VALUES (
  'مدير النظام',
  'admin',
  'dNzjUkPjxK0nWQ6fEoo0kw==:p8sz8nh90ULXsFXL2UcWToTbGwuI/mmC4GPd+uuJAyA=',
  'ADM-001',
  'admin',
  1
);

-- بيانات الشركة (الهيدر الثابت للفواتير وعروض الأسعار)
INSERT OR REPLACE INTO settings (key, value) VALUES
('company', json('{
  "name_ar": "مؤسسة أنسام",
  "name_en": "ANSAM",
  "activity": "خدمات الصيانة والتبريد والتكييف وصيانة المطابخ والأفران الكبيرة",
  "cr_number": "",
  "vat_number": "",
  "phone": "0555555555",
  "email": "info@ansam.sa",
  "website": "www.ansam.sa",
  "address": "المملكة العربية السعودية",
  "iban": "",
  "bank_name": ""
}')),
('invoice_defaults', json('{
  "vat_rate": 15,
  "currency": "SAR",
  "currency_ar": "ريال",
  "terms": "تسدد المستحقات خلال 15 يوماً من تاريخ الفاتورة.",
  "footer": "شكراً لتعاملكم مع أنسام"
}')),
('integrations', json('{
  "sheets_webhook_url": "",
  "sheets_enabled": false
}')),
('landing', json('{
  "hero_title": "أنسام للصيانة والتبريد",
  "hero_subtitle": "حلول متكاملة للتكييف والتبريد وصيانة المطابخ والأفران الكبيرة للشركات والفنادق والمنشآت.",
  "phone": "0555555555",
  "email": "info@ansam.sa",
  "whatsapp": "0555555555",
  "instagram": "AnsamSA",
  "services": [
    {"title": "صيانة التكييف والتبريد", "desc": "تركيب وصيانة أنظمة التكييف المركزي والمكيفات الكبيرة بكفاءة عالية."},
    {"title": "صيانة المطابخ والأفران", "desc": "صيانة متخصصة للمطابخ التجارية والأفران الكبيرة والمعدات الحرارية."},
    {"title": "عقود التشغيل والصيانة", "desc": "عقود سنوية للشركات والفنادق والمنشآت مع فرق دعم متخصصة."},
    {"title": "صيانة الطوارئ", "desc": "استجابة سريعة على مدار الساعة لأعطال التبريد والتكييف الطارئة."}
  ]
}'));
