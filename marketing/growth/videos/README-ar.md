# فيديوهات الديمو

تسجيل حقيقي من التطبيق عبر Playwright (Chrome)، بمقاس 1080×1920 مع كابشنز وموسيقى من `marketing/video/assets/music.m4a`.

| الملف | اللغة | المدة | المحتوى |
| --- | --- | --- | --- |
| `labs-demo.mp4` | عربي | ~29s | 39 معملاً: دورة المياه + النظام الثنائي |
| `labs-demo-en.mp4` | إنجليزي | ~29s | نفس الجولة بكابشنز إنجليزية |
| `full-tour-ar.mp4` | عربي | ~31s | الرئيسية → المكتبة → بنك الأسئلة → التركيز → الخطة → المعامل |

## إعادة التسجيل

```bash
npm run build
npx vite preview --port 4175 --strictPort --host 127.0.0.1   # في تيرمنال تاني
DEMO=labs-ar  node marketing/growth/videos/record-demo.mjs
DEMO=labs-en  node marketing/growth/videos/record-demo.mjs
DEMO=tour-ar  node marketing/growth/videos/record-demo.mjs
```

ينتج كل أمر ملف `.webm` في `/tmp/jessica-demo-<variant>/`. التحويل إلى MP4:

```bash
ffmpeg -i raw.webm -stream_loop -1 -i marketing/video/assets/music.m4a \
  -filter_complex "[0:v]scale=1080:1920:flags=lanczos,unsharp=5:5:0.35:5:5:0[v];[1:a]volume=0.32,afade=t=in:st=0:d=1,afade=t=out:st=25:d=4[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -shortest -movflags +faststart marketing/growth/videos/<name>.mp4
```

`index.html` في نفس المجلد بيعرض الثلاثة في المتصفح.
