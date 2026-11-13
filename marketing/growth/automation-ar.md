# تشغيل تلقائي من غير ما تفتح المحادثة

## اللي بيشتغل لوحده فعلاً

مفيش طريقة أخلي "أنا" شغّال ٢٤ ساعة، لكن الموقع نفسه بقى عنده **رقابة يومية تلقائية** على GitHub:

**Workflow: `SEO watch`**
- بيشتغل **كل يوم ٧:٣٠ صباحًا** (بتوقيت القاهرة).
- بيتأكد إن:
  - الـ sitemap بيرجع 200 وXML وفيه كل الروابط.
  - كل صفحة من الـ 13 بترجع 200 وفيها `title` و`canonical`.
  - بيبعت **IndexNow** تلقائي (بينج/ياندكس).
- لو حاجة وقعت: بيبعتلك **إشعار على ntfy** + GitHub بيبعتلك إيميل بالفشل.
- التقرير اليومي بيتحفظ كـ artifact اسمه `seo-report` لمدة ٣٠ يوم.
- تقدر تشغله في أي وقت يدوي: **Actions → SEO watch → Run workflow**.

### عشان تستقبل الإشعارات
1. نزّل تطبيق **ntfy** (مجاني).
2. Subscribe to topic:
```
jessica-ops-5d2a8c71
```
3. أو افتح: <https://ntfy.sh/jessica-ops-5d2a8c71>

---

## الجزء الاختياري: تقرير جوجل اليومي (١٠ دقايق إعداد)

لو عايز التقرير اليومي يقولك كمان:
- الـ sitemap اتقرأ ولا لسه.
- كل صفحة **Indexed** ولا **Discovered** ولا **Crawled**.
- آخر زحف كان إمتى.

محتاج تديني صلاحية قراءة لحساب خدمة (Service Account). الخطوات:

### ١) في Google Cloud
1. افتح <https://console.cloud.google.com/>.
2. **New project** ← اسمه `jessica-seo` ← Create.
3. من **APIs & Services → Library** دوّر على:
   **Google Search Console API** ← **Enable**.
4. **APIs & Services → Credentials → Create credentials → Service account**.
   - الاسم: `jessica-watch` ← Create.
5. افتح الـ service account ← **Keys → Add key → Create new key → JSON** ← نزّل الملف.

### ٢) في Search Console
1. افتح <https://search.google.com/search-console>.
2. **Settings → Users and permissions → Add user**.
3. الصق **client_email** اللي جوه ملف JSON (شكله `jessica-watch@....iam.gserviceaccount.com`).
4. Permission: **Owner** ← Add.

### ٣) في GitHub
1. افتح: `https://github.com/bishoynabilanis/jessica/settings/secrets/actions`
2. **New repository secret**:
   - Name: `GSC_SERVICE_ACCOUNT`
   - Secret: الصق **محتوى ملف JSON كامل**.
3. من نفس الصفحة، تبويب **Variables** ← **New repository variable**:
   - Name: `GSC_SITE_URL`
   - Value: `https://bishoynabilanis.github.io/jessica/`
4. ارجع لـ **Actions → SEO watch → Run workflow** وشوف النتيجة.

من اللحظة دي، كل يوم الصبح هتلاقي في التقرير:

| URL | Verdict | Coverage | Last crawl |
| --- | --- | --- | --- |
| /welcome/ | PASS | Submitted and indexed | 2026-11-14 |
| /welcome/grades/primary-4/ | NEUTRAL | Discovered – currently not indexed | — |

---

## تنبيهات إضافية (اختيارية)

### الموقع واقع؟
- <https://uptimerobot.com> (مجاني): راقب `https://bishoynabilanis.github.io/jessica/welcome/` كل ٥ دقايق ← إيميل لو وقع.

### الجوجل مش بيفهرس؟
- لو التقرير فضل يقول `Discovered` أكتر من أسبوع، المشكلة بتبقى **باك لينكات**. ساعتها ننشر أكتر ونضيف صفحات محتوى جديدة.

---

## حدود التشغيل التلقائي

| الحاجة | تلقائي؟ |
| --- | --- |
| فحص الموقع والـ sitemap | ✅ كل يوم |
| تقرير جوجل | ✅ بعد إعداد الـ Service Account |
| تنبيه لو حاجة وقعت | ✅ ntfy + إيميل |
| نشر بوستات/ريلز | ❌ يحتاج حسابك |
| كتابة ميزات جديدة في التطبيق | ❌ يحتاج جلسة معايا |
| تحديث المحتوى/الصفحات | ❌ يحتاج commit (أنا بعمله لما تطلب) |

> ملاحظة GitHub: الـ scheduled workflows بتتوقف لو المستودع قعد **٦٠ يوم** من غير أي نشاط. أي commit أو تشغيل يدوي بيرجّعها.
