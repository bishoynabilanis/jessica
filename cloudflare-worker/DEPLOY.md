# تشغيل التجربة المجانية (Cloudflare Worker)

الفكرة: مفتاح Gemini واحد مشترك على سيرفر Cloudflare، والتطبيق يستخدمه **١٥ مرة في اليوم لكل جهاز/آيبي** بدل ما نطلب مفتاح من كل مستخدم جديد. الـWorker مجاني على خطة Cloudflare Free.

## ١) هات مفتاح Gemini
1. افتح <https://aistudio.google.com/apikey>.
2. **Create API key** → انسخ المفتاح (بيبدأ بـ `AIza...`).

## ٢) اعمل الـWorker
1. سجّل في <https://dash.cloudflare.com> (مجاني، بدون كارت).
2. من القائمة: **Workers & Pages** → **Create** → **Worker**.
3. سمّيه `jessica-ai` → **Deploy**.
4. اضغط **Edit code**، امسح اللي موجود، والصق كل محتوى `worker.js`.
5. **Deploy** تاني.

## ٣) حط المفتاح كـ Secret
1. في صفحة الـWorker: **Settings** → **Variables and Secrets**.
2. **Add** → Type: **Secret** → Name: `GEMINI_API_KEY` → Value: المفتاح اللي نسخته → **Save**.
3. (اختياري) **Add** متغير عادي: Name `GEMINI_MODEL` والقيمة `gemini-2.0-flash` (أو أي موديل تفضله).

## ٤) اختبر
افتح في المتصفح:

```
https://jessica-ai.<اسم-حسابك>.workers.dev/health
```

لازم ترجع:

```json
{ "ok": true, "model": "gemini-2.0-flash", "limit": 15 }
```

ولو ظهر خطأ 500 مع رسالة «الخدمة مش متظبطة» → المفتاح مش متسجل صح (ارجع للخطوة ٣).

## ٥) وصّل التطبيق بالـWorker
افتح `src/lib/ai/config.ts` وحط اللينك:

```ts
export const PROXY_ENDPOINT_URL = 'https://jessica-ai.<اسم-حسابك>.workers.dev'
```

ثم:

```bash
npm run build && npm test --if-present
```

وارفع. من اللحظة دي أي مستخدم جديد يفتح التطبيق بدون مفتاح بيشتغل على التجربة المجانية، ولما الـ١٥ استخدام يخلصوا بيظهر له مودال يشرح إنه يستنى لبكرة أو يحط مفتاحه.

## ملاحظات مهمة
- **الحد لكل IP في اليوم**: العدّاد متخزّن في `caches.default` (مفيش KV ولا قاعدة بيانات). لو أعدت نشر الـWorker العدّاد ممكن يبدأ من الأول — ده مقبول.
- **CORS مقفول** على `bishoynabilanis.github.io` و`localhost` بس، فأي موقع تاني مش هيقدر يستهلك مفتاحك.
- **الصور**: الـWorker بيمرّر `inlineData` زي ما هو، فحل المسائل بالكاميرا شغال على التجربة كمان.
- **الخصوصية**: الـWorker مش بيسجّل محتوى الرسائل ولا بيخزّنها؛ بيمرّرها لـGoogle ويرجّع الرد.
- **التكلفة**: خطة Cloudflare Free بتغطي ١٠٠ ألف طلب في اليوم، وGemini Free Tier كفاية لحجم الاستخدام ده. لو المفتاح خلص كوتا، الـWorker بيرجّع 429 والتطبيق بيقول للمستخدم يحط مفتاحه.
- **تغيير الحد**: عدّل `DAILY_LIMIT` في أول `worker.js` (والقيمة المقابلة في `src/lib/ai/config.ts`).
