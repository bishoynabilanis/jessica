# -*- coding: utf-8 -*-
import asyncio
import json
import os
import subprocess

import edge_tts

OUT = "/tmp/jessica-narration"
VOICE = "ar-EG-ShakirNeural"
RATE = "+5%"

SEGMENTS = [
    "الفيديو ده جوه تطبيق مذاكرة. مفيش سيرفر، مفيش حساب، وكل حاجة على جهازك.",
    "بتختار كتاب الوزارة لصفك، وتنزّله مرة واحدة. بعدها تسأل جيسيكا عن أي صفحة، وهي تشرح من الكتاب نفسه.",
    "وعشان تتأكد إنك فهمت، بنك أسئلة بيولّد تدريب جديد كل مرة، بيصحح ويشرح، وكل غلطة بتدخل دفتر أخطائك.",
    "ولو العلوم كانت صعبة، فيه تسعة وتلاتين معملاً افتراضياً. حرّك الشمس وشوف المطر، اخلط كاشفين، أو قلّب بتات لحد ما حرف الإيه يتكوّن.",
    "وفيه كمان مؤقت تركيز، وخطة يومية على قد وقتك.",
    "وأحلى حاجة؟ كل ده بيشتغل أوفلاين، وبدون ما تدفع ولا مليم.",
    "جرّبها من اللينك، وابدأ بكتاب واحد.",
]


async def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for index, text in enumerate(SEGMENTS, 1):
        path = os.path.join(OUT, f"seg{index}.mp3")
        await edge_tts.Communicate(text, VOICE, rate=RATE).save(path)
        duration = float(
            subprocess.check_output(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]
            )
            .decode()
            .strip()
        )
        rows.append({"index": index, "duration": duration, "text": text})
        print(index, round(duration, 2), text[:40])
    with open(os.path.join(OUT, "durations.json"), "w", encoding="utf-8") as handle:
        json.dump(rows, handle, ensure_ascii=False, indent=2)
    print("total", round(sum(row["duration"] for row in rows), 2))


asyncio.run(main())
