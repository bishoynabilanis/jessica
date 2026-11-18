# Jessica · Remotion studio

استوديو موشن جرافيك برمجي للفيديوهات، مبني على **Remotion 4.0.544** (React → MP4). منفصل تمامًا عن التطبيق: التطبيق يفضل React 18 بدون أي اعتماد جديد.

## ليه؟

- **عناوين وحركة احترافية** (spring/interpolate) بدون مونتاج يدوي — نفس أسلوب الفيديوهات المرجعية.
- **قوالب بيانات**: كومبوزيشن واحد يتنرندر لكل صف/معمل/إحصائية عبر props، بدل ٩ فيديوهات يدوية.
- **Batch + CI**: `remotion render` من التيرمنال، ويمكن تشغيله في GitHub Actions.
- **يكمّل تسجيل الشاشة**: نسجل التطبيق بـ Playwright، وRemotion يعمل العناوين/الزووم/الكالوت/الانتقالات فوقه.
- **ثابت ودقيق**: ٣٠/٦٠ إطار، 4K، نفس الهوية في كل فيديو.

## التشغيل

```bash
cd marketing/remotion-studio
npm install
npm run studio          # معاينة تفاعلية
npm run render          # out/intro.mp4 (5s, 1080×1920, 30fps)
npm run still           # out/intro.png
```

`remotion.config.ts` بيستخدم Chrome المثبّت على الجهاز بدل تنزيل Headless Shell.

## الديمو

`marketing/growth/videos/remotion-intro.mp4` — ٥ ثوانٍ، 1080×1920، مبني بالكود من `src/Intro.tsx`.

## عن Google Antigravity

الفيديو بيستخدم Antigravity كـ IDE/Agent يكتب كود Remotion. ده مش مطلوب: نفس الشغل بيتم هنا (OpenCode) والنتيجة هي مكتبة Remotion + كومبوزيشن. Antigravity مجرد واجهة للكتابة.
