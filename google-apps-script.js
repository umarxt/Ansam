/**
 * سكربت النسخ الاحتياطي لمنصة أنسام إلى Google Sheets
 * ==================================================
 * الخطوات:
 *  1. افتح https://sheets.google.com وأنشئ جدولاً جديداً باسم: أنسام - نسخة احتياطية
 *  2. من القائمة: الإضافات (Extensions) > Apps Script
 *  3. احذف الكود الموجود والصق هذا الملف بالكامل
 *  4. اضغط Deploy > New deployment > Type: Web app
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  5. انسخ رابط الـ Web App (ينتهي بـ /exec)
 *  6. الصقه في: المنصة > الإعدادات > النسخ الاحتياطي، وفعّل الخيار.
 *
 * سيقوم النظام تلقائياً بإرسال كل فاتورة / عرض سعر / حركة مالية جديدة،
 * وسيتم تسجيلها في ورقة منفصلة حسب النوع.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var kind = data.kind || "unknown";
    var payload = data.payload || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var sheetName =
      kind === "invoice" ? "الفواتير" :
      kind === "quote" ? "عروض الأسعار" :
      kind === "finance" ? "الحركات المالية" : "أخرى";

    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (kind === "invoice" || kind === "quote") {
        sheet.appendRow(["التاريخ", "الرقم", "العميل", "المجموع الفرعي", "الضريبة", "الإجمالي", "طريقة الدفع", "الحالة"]);
      } else if (kind === "finance") {
        sheet.appendRow(["التاريخ", "النوع", "المبلغ", "طريقة الدفع", "البيان", "الموظف"]);
      } else {
        sheet.appendRow(["التاريخ", "البيانات"]);
      }
    }

    if (kind === "invoice" || kind === "quote") {
      sheet.appendRow([
        payload.issue_date || new Date(),
        payload.number || "",
        payload.client_name || "",
        payload.subtotal || 0,
        payload.vat_amount || 0,
        payload.total || 0,
        payload.payment_method || "",
        payload.status || "",
      ]);
    } else if (kind === "finance") {
      sheet.appendRow([
        payload.txn_date || new Date(),
        payload.txn_type || "",
        payload.amount || 0,
        payload.payment_method || "",
        payload.description || "",
        payload.employee_id || "",
      ]);
    } else {
      sheet.appendRow([new Date(), JSON.stringify(payload)]);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
