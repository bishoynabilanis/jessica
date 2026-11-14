# فيديوهات Jessica

## اللي موجود

| الملف | إيه هو |
| --- | --- |
| `jessica-launch/` | مشروع فيديو ١٦ ثانية (1080×1920) — «كتب الوزارة بقت درس» |
| `jessica-launch/renders/jessica-launch.mp4` | النسخة النهائية للريلز/ستوري |

## إزاي اتعمل

الرندر بيتم بـ **HyperFrames**: المشروع HTML + GSAP، وكل مشهد بيتحرك على تايم لاين ثابت،
والـ CLI بيصوّر كل فريم ويطلع MP4. مفيش أي API خارجي ولا مفاتيح — يعني نفس النتيجة في أي وقت.

```bash
cd marketing/films/jessica-launch
npx hyperframes check          # فحص الالتزام بالقواعد
npx hyperframes snapshot --at 1.4,5.2,8.6,11.8,15
npx hyperframes render --fps 30 --quality delivery -o renders/jessica-launch.mp4
```

## تعديل النص أو الأرقام

كل النصوص جوه `compositions/*.html` (عربي، RTL). الملفات:

| المشهد | الملف | الوقت |
| --- | --- | --- |
| الخطاف | `compositions/hook.html` | 0–3.4s |
| التعريف | `compositions/reveal.html` | 3.4–6.6s |
| الخطوات | `compositions/steps.html` | 6.6–10s |
| الاختبار | `compositions/proof.html` | 10–13s |
| الكارت الأخير | `compositions/end.html` | 13–16s |

## ملاحظات

- **الخط:** Cairo Variable داخل `assets/fonts/Cairo.ttf` (مش من الإنترنت).
- **الصور:** لقطات حقيقية من التطبيق في `assets/shots/`.
- **بدون صوت** لحد الآن.
- الفيديو متظبط على فيسبوك/ريلز. لو هتنشره على تيك توك، حرّك النصوص بعيد عن يمين الشاشة (شريط الأزرار).

## عن AI-Video-Factory

المستودع اللي طلبته (`ersinkoc/AI-Video-Factory`) متنزّل في `/Volumes/Extreme Pro/ai-video-factory`،
بس نصّه المعتمد على Claude (سكريبت + رسم) محتاج `ANTHROPIC_API_KEY` أو تسجيل دخول Claude Code،
وصوت/صور محتاجين مفاتيح ElevenLabs/Gemini. من غير المفاتيح دي بيقدر يعمل رندر تجريبي بس.
عشان كده الفيديوهات هنا اتعملت بخط الرندر المحلي (HyperFrames + Chrome) بنفس الفكرة: HTML → MP4.
