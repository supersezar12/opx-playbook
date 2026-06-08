import type { I18nEntry } from '../types';

// ─── UI Labels for i18n ───────────────────────────────────────────────────────
// Currently displayed in English. Structure is ready for Arabic/Kurdish
// translation by swapping the active language key in the consuming components.
// Usage: UI_LABELS.next.en  |  UI_LABELS.next.ar  |  UI_LABELS.next.ku

export const UI_LABELS: Record<string, I18nEntry> = {
  // Navigation
  next: { en: 'Next', ar: 'التالي', ku: 'دواتر' },
  back: { en: 'Back', ar: 'رجوع', ku: 'گەڕانەوە' },
  save: { en: 'Save', ar: 'حفظ', ku: 'پاشەکەوت' },
  cancel: { en: 'Cancel', ar: 'إلغاء', ku: 'هەڵوەشاندنەوە' },
  download: { en: 'Download', ar: 'تحميل', ku: 'دابەزاندن' },
  copy: { en: 'Copy', ar: 'نسخ', ku: 'کۆپیکردن' },
  copied: { en: 'Copied!', ar: 'تم النسخ!', ku: 'کۆپیکرا!' },
  validate: { en: 'Validate & Parse', ar: 'التحقق والتحليل', ku: 'پشتڕاستکردنەوە' },
  export: { en: 'Export', ar: 'تصدير', ku: 'هەناردەکردن' },

  // Steps
  step1: { en: 'Configure', ar: 'إعداد', ku: 'ڕێکخستن' },
  step2: { en: 'Generate', ar: 'توليد', ku: 'دروستکردن' },
  step3: { en: 'Ingest', ar: 'استيعاب', ku: 'وەرگرتن' },
  step4: { en: 'Audit', ar: 'مراجعة', ku: 'پشکنین' },
  step5: { en: 'Export', ar: 'تصدير', ku: 'هەناردەکردن' },

  // Step 1
  selectIndustry: { en: 'Select Industry', ar: 'اختر الصناعة', ku: 'پیشەسازی هەڵبژێرە' },
  jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي', ku: 'ناونیشانی کار' },
  seniorityLayer: { en: 'Seniority Layer', ar: 'المستوى الوظيفي', ku: 'ئاستی کارمەند' },
  policyPatch: { en: 'Paste Raw Company Policy Text (Optional)', ar: 'الصق نص سياسة الشركة (اختياري)', ku: 'دەقی سیاسەتی کۆمپانیا لێرە دابنێ (ئارەزووی)' },
  focusAreas: { en: 'Core Focus Areas', ar: 'مجالات التركيز الأساسية', ku: 'بواری سەرەکی تەمرکوز' },
  keyRisks: { en: 'Key Risk Factors', ar: 'عوامل المخاطر الرئيسية', ku: 'فاکتەری مەترسیی سەرەکی' },
  nextGenerate: { en: 'Next: Generate Prompt', ar: 'التالي: توليد التلقين', ku: 'دواتر: دروستکردنی پرۆمپت' },

  // Step 2
  generatedPrompt: { en: 'Generated Execution Prompt', ar: 'التلقين التنفيذي المُولَّد', ku: 'پرۆمپتی جێبەجێکردن' },
  configSummary: { en: 'Configuration Summary', ar: 'ملخص الإعداد', ku: 'پوختەی ڕێکخستن' },
  copyPrompt: { en: 'Copy Prompt', ar: 'نسخ التلقين', ku: 'کۆپیکردنی پرۆمپت' },
  downloadTxt: { en: 'Download as .txt', ar: 'تحميل كملف .txt', ku: 'دابەزاندن بە .txt' },
  nextIngest: { en: 'Next: Ingest JSON', ar: 'التالي: استيعاب JSON', ku: 'دواتر: وەرگرتنی JSON' },

  // Step 3
  pasteJson: { en: 'Paste AI-Generated JSON Here', ar: 'الصق JSON المُولَّد بالذكاء الاصطناعي هنا', ku: 'JSON ی AI لێرە دابنێ' },
  validationSuccess: { en: 'Payload validated successfully!', ar: 'تم التحقق من البيانات بنجاح!', ku: 'داتاکانت بە سەرکەوتوویی پشتڕاستکراوەتەوە!' },
  nextAudit: { en: 'Next: Audit Content', ar: 'التالي: مراجعة المحتوى', ku: 'دواتر: پشکنینی ناوەرۆک' },

  // Step 4
  runValidation: { en: 'Run Full Validation', ar: 'تشغيل التحقق الكامل', ku: 'پشتڕاستکردنەوەی تەواو' },
  stagesTab: { en: 'Stages (60)', ar: 'المراحل (٦٠)', ku: 'قۆناغەکان (٦٠)' },
  examsTab: { en: 'Exams (7)', ar: 'الاختبارات (٧)', ku: 'تاقیکردنەوەکان (٧)' },
  nextExport: { en: 'Next: Export', ar: 'التالي: تصدير', ku: 'دواتر: هەناردەکردن' },

  // Step 5
  buildConfig: { en: 'Build Configuration', ar: 'إعداد البناء', ku: 'ڕێکخستنی دروستکردن' },
  antiCopy: { en: 'Enable Anti-Copy Protection', ar: 'تفعيل الحماية من النسخ', ku: 'چالاककردنی پاراستن لە کۆپیکردن' },
  bilingualToggle: { en: 'Include Bilingual Toggle UI', ar: 'تضمين واجهة تبديل اللغة', ku: 'تێکەڵکردنی UI ی دودزمان' },
  matrixTitle: { en: 'Training Matrix Title', ar: 'عنوان مصفوفة التدريب', ku: 'ناونیشانی ماتریکسی ڕاهێنان' },
  downloadHtml: { en: 'Download .html File', ar: 'تحميل ملف HTML', ku: 'دابەزاندنی فایلی HTML' },
  startNew: { en: 'Start New Project', ar: 'بدء مشروع جديد', ku: 'پڕۆژەی نوێ دەست پێبکە' },

  // Misc
  complete: { en: 'Complete', ar: 'مكتمل', ku: 'تەواو' },
  incomplete: { en: 'Incomplete', ar: 'غير مكتمل', ku: 'ناتەواو' },
  editStage: { en: 'Edit Stage', ar: 'تعديل المرحلة', ku: 'گۆڕینی قۆناغ' },
  editExam: { en: 'Edit Exam', ar: 'تعديل الاختبار', ku: 'گۆڕینی تاقیکردنەوە' },
  search: { en: 'Search stages...', ar: 'البحث في المراحل...', ku: 'گەڕان لە قۆناغەکان...' },
};

export const L = (key: string): string => UI_LABELS[key]?.en ?? key;
