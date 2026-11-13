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

### عشان تستقبل الإشعارات على الموبايل

**أسهل طريقة: تطبيق ntfy (مجاني)**

| الجهاز | اللينك |
| --- | --- |
| iPhone / iPad | https://apps.apple.com/app/ntfy/id1625396347 |
| Android | https://play.google.com/store/apps/details?id=io.heckel.ntfy |

بعد التثبيت:
1. افتح التطبيق واسمح بالإشعارات.
2. دوس **+** ← **Subscribe to topic**.
3. اكتب: `jessica-ops-5d2a8c71`.
4. خلاص — هتوصلك التنبيهات.

> مش محتاج تسجل دخول في التطبيق. الحساب على ntfy.sh بيفيد بس في حجز الموضوع أو مزامنة الاشتراكات (Pro)، مش في الاستقبال.

**من غير تطبيق (PWA):**
1. افتح من الموبايل: <https://is.gd/jessicaalerts>
2. اسمح بالإشعارات.
3. Safari: مشاركة ← **إضافة إلى الشاشة الرئيسية**. Chrome: ⋮ ← **تثبيت التطبيق**.

**QR جاهز للاسكان:** `marketing/growth/jessica-alerts-qr.png`

### عشان تستقبل الإشعارات
1. نزّل تطبيق **ntfy** (مجاني).
2. Subscribe to topic:
```
jessica-ops-5d2a8c71
```
3. أو افتح: <https://ntfy.sh/jessica-ops-5d2a8c71>

---

## تقرير جوجل اليومي — ✅ متفعّل بالفعل

مش محتاج تعمل أي حاجة. اتظبط كده:

- **Service Account**: `jessica-watch@hermes-youtube-513013.iam.gserviceaccount.com`
- **صلاحيته في Search Console**: Owner على `https://bishoynabilanis.github.io/jessica/`
- **التحقق**: keyless عن طريق Workload Identity Federation من GitHub Actions (مفيش مفاتيح مخزنة).
- **الصلاحية**: `webmasters` (قراءة + كتابة) — عشان يقدر يعيد إرسال الـ sitemap لوحده.

### اللي بيظهر في التقرير اليومي
- حالة الـ sitemap: آخر قراءة + عدد الروابط المكتشفة + أخطاء.
- لكل صفحة مهمة: **Verdict** (PASS / NEUTRAL / FAIL) و**Coverage** (Indexed / Crawled – not indexed / Discovered) وآخر زحف.

### إعادة إرسال الـ sitemap يدويًا
لو التقرير قال إن الـ sitemap مش مقروء:
1. **Actions → SEO watch → Run workflow**.
2. فعّل خيار **reset_sitemap**.
3. Run.

هيحذف القديم ويعيد إرساله من جديد (بيحتاج صلاحية Owner، وهي متفعّلة).

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
