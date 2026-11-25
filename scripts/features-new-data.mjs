/**
 * Newer feature pages. Each page covers ONE feature once and links to the
 * others instead of repeating them. Free, Ministry books only, nothing stored
 * on a server. Every page carries plain Facebook and WhatsApp share links
 * (no script, no tracking) because of `share: true`.
 */

export const NEW_FEATURES = [
  {
    slug: 'comfortable-reading',
    emoji: '👁️',
    color: '#a78bfa',
    appPath: '#/settings',
    share: true,
    related: ['weak-phone', 'egyptian-voice', 'offline'],
    ar: {
      title: 'قراءة مريحة: خط أكبر ومسافات أوسع ولون ورق هادي',
      description:
        'وضع «القراءة المريحة» في جيسيكا: نص أكبر ومسافات أوسع ولون ورق مريح للعين، وخط مناسب لعسر القراءة. مجاني وبيتحفظ على موبايلك بس.',
      eyebrow: 'القراءة المريحة',
      h1: 'كتاب المدرسة بقى أسهل على العين',
      lead:
        'الحروف الصغيرة والسطور الزحمة بتتعب الطالب قبل ما يفهم. من الإعدادات تشغّل «القراءة المريحة» وتختار الخط المناسب، والكتاب كله يتغير.',
      problem: [
        'كتير من الطلبة بيزهقوا من القراءة مش عشان الدرس صعب، لكن عشان الشكل: حروف صغيرة، سطور قريبة من بعض، وورقة بيضا لامعة على شاشة الموبايل.',
        'ولي الأمر غالبًا مش عارف يظبط ده من غير أدوات، والطالب بيسكت ويكمل وهو مرهق.',
      ],
      solution: [
        'زرار واحد في «راحة وسهولة الاستخدام» بيكبّر النص ويوسّع المسافات بين الحروف والسطور ويغيّر لون الخلفية للون ورقي هادي. وفي خيار منفصل لخط مناسب لعسر القراءة.',
        'ده إعداد راحة للعين، مش علاج ومش تشخيص. لو عندك قلق من عسر القراءة، المختص هو اللي يقيّم. كل اللي بتغيّره بيتحفظ على موبايلك فقط.',
      ],
      bullets: [
        'نص أكبر ومسافات أوسع بين الحروف والسطور.',
        'لون ورق هادي بدل الأبيض الشديد.',
        'خيار خط مناسب لعسر القراءة.',
        'بيتحفظ على الجهاز، ومفيش حساب ولا بيانات بتتبعت.',
      ],
      steps: [
        { title: 'افتح الإعدادات', text: 'من القائمة اختار «الإعدادات» وانزل لقسم «راحة وسهولة الاستخدام».' },
        { title: 'شغّل القراءة المريحة', text: 'فعّل الزرار، واختار خط عسر القراءة لو حابب.' },
        { title: 'افتح كتابك', text: 'ارجع للكتاب أو الدرس وشوف الفرق، وغيّره في أي وقت.' },
      ],
      audience:
        'للطالب اللي بيتعب من القراءة الطويلة، ولولي الأمر اللي ملاحظ إن ابنه بيتوه بين السطور، وللكبار كمان.',
      faq: [
        { q: 'هل ده بيعالج عسر القراءة؟', a: 'لأ. ده إعداد بيخلّي القراءة أريح، لكنه مش علاج ولا تشخيص.' },
        { q: 'هل بيتحفظ لو قفلت التطبيق؟', a: 'أيوه، بيتحفظ على جهازك، وتقدر تغيّره من الإعدادات.' },
      ],
    },
    en: {
      title: 'Comfortable reading: bigger text, wider spacing, calm colour',
      description:
        'Comfortable reading mode gives bigger text, wider spacing and an easy paper colour, plus a dyslexia-friendly font. Free, saved on your phone only.',
      eyebrow: 'Comfortable reading',
      h1: 'School books that are easier on the eyes',
      lead:
        'Small letters and crowded lines tire a student before the lesson even starts. Switch on Comfortable reading in Settings and the whole book changes.',
      problem: [
        'Many students give up on reading not because the lesson is hard, but because of how it looks: small letters, tight lines and a bright white page on a phone.',
        'Parents rarely know how to fix this without special tools, so the student carries on tired.',
      ],
      solution: [
        'One switch in Comfort and accessibility makes the text bigger, widens the space between letters and lines, and swaps the background for a calm paper colour. A separate option gives you a dyslexia-friendly font.',
        'This is a comfort setting, not a treatment and not a diagnosis. If you are worried about dyslexia, a specialist should assess it. Your choices are saved on your phone only.',
      ],
      bullets: [
        'Bigger text and wider spacing between letters and lines.',
        'A calm paper colour instead of bright white.',
        'A dyslexia-friendly font option.',
        'Saved on the device. No account and nothing is sent.',
      ],
      steps: [
        { title: 'Open Settings', text: 'From the menu choose Settings and scroll to Comfort and accessibility.' },
        { title: 'Switch on Comfortable reading', text: 'Turn it on, and pick the dyslexia-friendly font if you like.' },
        { title: 'Open your book', text: 'Go back to the book or lesson and see the difference. Change it any time.' },
      ],
      audience:
        'For students who tire during long reading, parents who notice a child losing their place between lines, and adults too.',
      faq: [
        { q: 'Does this treat dyslexia?', a: 'No. It makes reading easier on the eyes, but it is not a treatment or a diagnosis.' },
        { q: 'Is it saved when I close the app?', a: 'Yes, on your device. You can change it in Settings.' },
      ],
    },
  },
  {
    slug: 'weak-phone',
    emoji: '📱',
    color: '#f59e0b',
    appPath: '#/settings',
    share: true,
    related: ['offline', 'comfortable-reading', 'kids'],
    ar: {
      title: 'وضع الموبايل الضعيف: شاشات أخف وتحميل الكتب صفحة صفحة',
      description:
        'جيسيكا على موبايل قديم أو باقة قليلة: شاشات أخف، بدون مؤثرات، الكتاب بيتحمّل صفحة صفحة، وتحذير بحجم الميجابايت قبل أي تحميل كبير.',
      eyebrow: 'الموبايل الضعيف',
      h1: 'تطبيق مذاكرة يمشي على موبايل قديم وباقة صغيرة',
      lead:
        'مش كل بيت عنده موبايل جديد ولا باقة كبيرة. وضع الموبايل الضعيف بيخفّف التطبيق ويحذّرك قبل أي حاجة تاكل من الباقة.',
      problem: [
        'الموبايل القديم بيهنّج مع الشاشات التقيلة والحركات، وكتاب PDF كبير ممكن يقفل التطبيق. والتحميل المفاجئ بيخلّص الباقة من غير ما تاخد بالك.',
      ],
      solution: [
        'من الإعدادات تشغّل «الموبايل الضعيف»: الشاشات أخف، المؤثرات متقفّلة، والكتب بتتفتح صفحة صفحة بدل ما تتحمّل كلها مرة واحدة.',
        'ولو في تحميل كبير جاي، التطبيق بيقولك الحجم بالميجابايت وإنه ممكن ياكل من باقة الموبايل لو مش على واي فاي، وإنت اللي تقرر تكمّل ولا لأ. أداة قراءة الصفحات المصوّرة حوالي ١٨ ميجا (١٣ بيانات وحوالي ٥ كود) وبتتحمّل مرة واحدة لو احتجتها.',
      ],
      bullets: [
        'شاشات أخف وبدون مؤثرات.',
        'الكتاب بيتفتح صفحة صفحة.',
        'تحذير بالميجابايت قبل التحميلات الكبيرة، وإنت اللي تقرر.',
        'من غير حساب، وبيتحفظ على الجهاز.',
      ],
      steps: [
        { title: 'افتح الإعدادات', text: 'من القائمة اختار «الإعدادات».' },
        { title: 'شغّل «الموبايل الضعيف»', text: 'فعّل الزرار، والتطبيق بيخف على طول.' },
        { title: 'اقرا التحذير', text: 'قبل أي تحميل كبير هتشوف الحجم، وتقدر تأجّله لحد ما تبقى على واي فاي.' },
      ],
      audience: 'لأي طالب موبايله قديم أو باقته محدودة، ولولي الأمر اللي بيحسب كل ميجا.',
      faq: [
        { q: 'هل ده بيخلّي الكتاب أقل جودة؟', a: 'لأ، الكتاب نفسه زي ما هو. اللي بيتغيّر إن الصفحات بتتحمّل واحدة واحدة والتأثيرات بتتقفل.' },
        { q: 'هل لازم إنترنت؟', a: 'لأ للمذاكرة اليومية بعد أول تحميل. التحذير بس بيظهر قبل التحميلات الكبيرة.' },
      ],
    },
    en: {
      title: 'Weak phone mode: lighter screens, books that load page by page',
      description:
        'Jessica on an old phone or a small data plan: lighter screens, no effects, books that load page by page, and an MB warning before any big download.',
      eyebrow: 'Weak phone mode',
      h1: 'A study app that runs on an old phone and a small data plan',
      lead:
        'Not every home has a new phone or a big plan. Weak phone mode makes the app lighter and warns you before anything eats your data.',
      problem: [
        'An old phone struggles with heavy screens and animations, and a large PDF can crash the app. A sudden download can also drain a data plan without you noticing.',
      ],
      solution: [
        'Switch on Weak phone mode in Settings. Screens get lighter, effects go off, and books open page by page instead of loading all at once.',
        'When a big download is coming, the app tells you the size in MB and warns that it uses mobile data if you are not on Wi-Fi. You decide whether to continue. The reading tool for picture pages is roughly 18 MB (about 13 of data and 5 of code) and downloads once, only if you need it.',
      ],
      bullets: [
        'Lighter screens and no effects.',
        'Books open page by page.',
        'An MB warning before big downloads. You decide.',
        'No account. Saved on the device.',
      ],
      steps: [
        { title: 'Open Settings', text: 'Choose Settings from the menu.' },
        { title: 'Switch on Weak phone mode', text: 'Turn it on and the app gets lighter straight away.' },
        { title: 'Read the warning', text: 'Before a big download you see the size, and you can wait for Wi-Fi.' },
      ],
      audience: 'For any student with an old phone or a limited plan, and for parents who count every megabyte.',
      faq: [
        { q: 'Does it make the book lower quality?', a: 'No. The book is the same. Pages just load one at a time and effects are turned off.' },
        { q: 'Do I need internet?', a: 'Not for daily study after the first download. The warning only appears before big downloads.' },
      ],
    },
  },
  {
    slug: 'parent-card',
    emoji: '🏅',
    color: '#34d399',
    appPath: '#/achievement',
    share: true,
    related: ['monthly-report', 'certificates', 'profiles'],
    ar: {
      title: 'كارت إنجاز للأهل: ابعته على واتساب ومفيش حاجة بتتخزن',
      description:
        'الطالب يختار إنجاز حقيقي من مذاكرته، جيسيكا ترسم كارت صغير، ويبعته لوالده على واتساب. الاسم اختياري ومفيش بيانات بتتخزن.',
      eyebrow: 'كارت الإنجاز',
      h1: 'خلّي ولي الأمر يشوف إنجاز ابنه من غير تقارير',
      lead:
        'بدل ما ولي الأمر يسأل «ذاكرت؟»، الطالب يبعتله كارت بإنجاز حقيقي: أيام متتالية، موضوع خلص، مستوى جديد أو دقايق مذاكرة الأسبوع.',
      problem: ['الطالب بيذاكر، لكن ولي الأمر ما بيشوفش ده. والتقارير الطويلة محدش بيقراها.'],
      solution: [
        'جيسيكا بتحسب الإنجازات من تقدّمك الحقيقي بس: ٣ أيام متتالية أو أكتر، موضوع خلص، مستوى ٢ أو أعلى، أو ٣٠ دقيقة مذاكرة في الأسبوع. الطالب يختار واحد ويشوف الكارت.',
        'زرار «ابعت على واتساب» بيفتح واتساب بنص قصير ولينك التطبيق من غير أي رقم تليفون، وزرار المشاركة بيبعت صورة الكارت، وفي زرار حفظ الصورة. اسم الطفل على الكارت اختياري وبيبدأ مقفول. مفيش حاجة بتتخزن.',
      ],
      bullets: [
        'الإنجازات حقيقية، مبنية على تقدّمك بس.',
        'ابعت على واتساب، شارك الصورة، أو احفظها.',
        'الاسم على الكارت اختياري ومقفول من الأول.',
        'مفيش تخزين ولا حساب.',
      ],
      steps: [
        { title: 'افتح «شارك إنجازك»', text: 'من الرئيسية أو من صفحة التقرير، بيظهر لما يكون عندك إنجاز.' },
        { title: 'اختار الإنجاز', text: 'واحد من الإنجازات اللي حققتها فعلًا، وضيف الاسم لو حابب.' },
        { title: 'ابعت', text: 'واتساب بنص ولينك، أو شارك صورة الكارت، أو احفظها.' },
      ],
      audience: 'للطالب اللي عايز يفرّح أهله، ولولي الأمر اللي عايز يشوف التقدّم من غير ما يضغط.',
      faq: [
        { q: 'هل صورة الكارت بتتبعت مع زرار واتساب؟', a: 'زرار واتساب بيبعت نص ولينك بس. الصورة بتتبعت من زرار المشاركة أو بعد حفظها.' },
        { q: 'هل جيسيكا بتحتفظ بالكارت؟', a: 'لأ. الكارت بيتعمل على جهازك ومش بنخزّنه.' },
      ],
    },
    en: {
      title: 'Parent card: send a win to parents on WhatsApp, nothing stored',
      description:
        'A student picks a real win from their own study, Jessica draws a small card, and they send it to a parent on WhatsApp. The name is optional and nothing is stored.',
      eyebrow: 'Achievement card',
      h1: 'Let parents see a win without a report',
      lead:
        'Instead of "did you study?", the student sends a card with a real achievement: a streak, a finished topic, a new level or this week\'s minutes.',
      problem: ['A student studies, but the parent does not see it, and nobody reads long reports.'],
      solution: [
        'Jessica works out wins only from your real progress: a streak of 3 days or more, a finished topic, level 2 or higher, or 30 minutes of study in a week. The student picks one and sees the card.',
        "Send on WhatsApp opens WhatsApp with a short text and the app link, with no phone number. Share sends the card image, and Save keeps it. The child's name on the card is optional and off at the start. Nothing is stored.",
      ],
      bullets: [
        'Wins are real, built from your own progress only.',
        'Send on WhatsApp, share the picture, or save it.',
        'The name on the card is optional and off by default.',
        'No storage and no account.',
      ],
      steps: [
        { title: 'Open Share a win', text: 'From the home screen or the Report page. It appears once you have a win.' },
        { title: 'Pick a win', text: 'Choose one you really earned, and add the name if you want.' },
        { title: 'Send', text: 'WhatsApp with text and a link, or share the card image, or save it.' },
      ],
      audience: 'For students who want to make their family proud, and parents who want to see progress without pressure.',
      faq: [
        { q: 'Does the card image go through the WhatsApp button?', a: 'The WhatsApp button sends text and the link only. The image goes through Share, or after you save it.' },
        { q: 'Does Jessica keep the card?', a: 'No. It is made on your device and we do not store it.' },
      ],
    },
  },
  {
    slug: 'daily-question',
    emoji: '🗓️',
    color: '#60a5fa',
    appPath: '#/',
    share: true,
    related: ['flashcards', 'mistakes-review', 'school-exam'],
    ar: {
      title: 'سؤال اليوم: سؤال واحد من كتابك الوزاري كل يوم',
      description:
        'كل يوم سؤال واحد مختار من الأسئلة المحفوظة لكتب الوزارة بتاعتك، على جهازك بس. لو مفيش، بيطلع سؤال مهارة من الصف ومكتوب إنه كده.',
      eyebrow: 'سؤال اليوم',
      h1: 'سؤال واحد كل يوم، من كتابك إنت',
      lead:
        'المذاكرة اليومية الصغيرة بتفضل أحسن من ماراثون ليلة الامتحان. سؤال اليوم بيظهر في الرئيسية، يخلص في دقيقة، وبيقولك ارجع بكرة.',
      problem: ['الطالب بيأجّل المذاكرة لحد ما تتراكم، ومش عارف يبدأ منين.'],
      solution: [
        'جيسيكا بتختار سؤال واحد في اليوم من الأسئلة المحفوظة فعلًا لكتبك من الوزارة. كتاب مش من كتالوج الوزارة عمره ما بيتستخدم.',
        'لو لسه مفيش أسئلة محفوظة، بيطلع سؤال مهارة من بنك الصف الأوفلاين ومكتوب عليه إنه «مش من صفحة كتاب». الاختيار بيحصل على جهازك، ومفيش حاجة بتتبعت.',
      ],
      bullets: [
        'سؤال واحد كل يوم في الرئيسية.',
        'من كتب الوزارة بتاعتك بس.',
        'لو مفيش أسئلة، بيتقال صراحة إنه سؤال مهارة.',
        'بيتختار ويتحفظ على جهازك بس.',
      ],
      steps: [
        { title: 'افتح الرئيسية', text: 'هتلاقي كارت «سؤال اليوم».' },
        { title: 'جاوب', text: 'اختار الإجابة وخلّص السؤال.' },
        { title: 'ارجع بكرة', text: 'بعد ما تخلّص، التطبيق بيقولك ترجع بكرة للسؤال الجاي.' },
      ],
      audience: 'للطالب اللي محتاج عادة يومية صغيرة، ولولي الأمر اللي عايز يطمّن إنه بيفتح كتابه كل يوم.',
      faq: [
        { q: 'السؤال جاي منين؟', a: 'من الأسئلة المحفوظة لكتب الوزارة اللي ضفتها. ولو مفيش، بيتكتب إنه سؤال مهارة من الصف.' },
        { q: 'هل بتتبعت إجاباتي؟', a: 'لأ. كل حاجة على جهازك.' },
      ],
    },
    en: {
      title: 'Daily question: one question a day from your Ministry book',
      description:
        'One question a day from the saved questions of your own Ministry books, on your device only. With none saved, a labelled grade skill question appears.',
      eyebrow: 'Daily question',
      h1: 'One question a day, from your own book',
      lead:
        'A small daily habit beats an exam-night marathon. The daily question shows on the home screen, takes a minute, then tells you to come back tomorrow.',
      problem: ['Students put study off until it piles up, and do not know where to start.'],
      solution: [
        'Jessica picks one question a day from the questions already saved for your own Ministry books. A book that did not come from the Ministry catalogue is never used.',
        'If no book questions are saved yet, a grade skill question from the offline bank appears, labelled as not from a book page. The choice happens on your device and nothing is sent.',
      ],
      bullets: [
        'One question a day on the home screen.',
        'From your own Ministry books only.',
        'With no questions saved, it says plainly that it is a skill question.',
        'Picked and kept on your device only.',
      ],
      steps: [
        { title: 'Open the home screen', text: 'Find the Daily question card.' },
        { title: 'Answer', text: 'Pick an answer and finish the question.' },
        { title: 'Come back tomorrow', text: 'When you finish, the app tells you to return for the next one.' },
      ],
      audience: 'For students who need a small daily habit, and parents who want to know the book is opened each day.',
      faq: [
        { q: 'Where does the question come from?', a: 'From the saved questions of the Ministry books you added. If there are none, it is a labelled grade skill question.' },
        { q: 'Are my answers sent anywhere?', a: 'No. Everything stays on your device.' },
      ],
    },
  },
  {
    slug: 'right-edition',
    emoji: '📚',
    color: '#f472b6',
    appPath: '#/library',
    share: true,
    related: ['offline', 'flashcards', 'profiles'],
    ar: {
      title: 'الكتاب الصح والطبعة الصح، وبدّل الملف من غير ما تخسر مذاكرتك',
      description:
        'جيسيكا بتقارن كتابك بقايمة الوزارة اللي جوه التطبيق وتقولك لو الطبعة مختلفة. ولو بدّلت الملف، القراءة والملاحظات والدروس المخلّصة بتفضل.',
      eyebrow: 'الطبعة الصح',
      h1: 'اتأكد إن كتابك هو الصح قبل ما تذاكر منه',
      lead:
        'ملف PDF مش من الوزارة أو من طبعة قديمة ممكن يخلّي الصفحات تتلخبط. التطبيق بيقارن ويقولك.',
      problem: [
        'الطالب بينزّل أي ملف من النت ومش عارف لو ده كتاب الصف والترم الصح. وبعدها يكتشف إن الطبعة غير طبعة مدرسته.',
      ],
      solution: [
        'بعد ما تضيف الكتاب، «افحص الطبعة» بتقارنه بصفك ومدرستك وبقايمة الوزارة اللي جوه التطبيق، من غير ما تفتح النت. بتقولك «ده الكتاب والطبعة الصح»، أو إن الطبعة مختلفة أو الملف مضغوط، وبتوريك حجم ملفك وحجم ملف الوزارة بالميجا.',
        'ولو جبت ملف أحسن من لينك الوزارة، «استبدل» بيحط الملف الجديد تحت نفس الكتاب. مكان القراءة والملاحظات والتظليل والعلامات والكروت بتفضل، والدروس اللي ليها نفس العنوان بتفضل مخلّصة. الملاحظات بتفضل على نفس أرقام الصفحات.',
      ],
      bullets: [
        'مقارنة بصفك ومدرستك وقايمة الوزارة اللي جوه التطبيق.',
        'من غير نت: القايمة جزء من التطبيق.',
        'بتقولك لو الطبعة مختلفة أو الملف مضغوط.',
        'الاستبدال بيحافظ على القراءة والملاحظات والتظليل والدروس المخلّصة.',
      ],
      steps: [
        { title: 'ضيف كتابك', text: 'من المكتبة أضف ملف الكتاب.' },
        { title: 'افحص الطبعة', text: 'شوف النتيجة وحجم الملفين بالميجا.' },
        { title: 'استبدل لو لازم', text: 'استخدم ملف لينك الوزارة بس، وتقدّمك هيفضل زي ما هو.' },
      ],
      audience: 'لولي الأمر اللي بيجهّز الكتب لابنه، وللطالب اللي نزّل ملف من مصدر مش متأكد منه.',
      faq: [
        { q: 'هل بتحمّل التطبيق كتب من النت؟', a: 'لأ. إنت اللي بتضيف الملف، والتطبيق بيقارنه بقايمة جواه من غير ما يفتح أي موقع.' },
        { q: 'هل ملاحظاتي هتضيع لو استبدلت الملف؟', a: 'لأ، بتفضل. بس لو الطبعة الجديدة رقّمت صفحاتها بشكل مختلف، راجع مكانها.' },
      ],
    },
    en: {
      title: 'Right book, right edition: swap the file, keep your progress',
      description:
        'Jessica compares your book with the Ministry list inside the app and tells you if the edition differs. Swap the file and your notes and finished lessons stay.',
      eyebrow: 'Right edition',
      h1: 'Check your book is the right one before you study from it',
      lead:
        'A PDF that is not from the Ministry, or an older edition, can mix up pages. The app compares and tells you.',
      problem: [
        'Students download any file online and cannot tell whether it is the right grade and term. Later they find the edition is not the one their school uses.',
      ],
      solution: [
        'After you add a book, Check the edition compares it with your grade, your school and the Ministry list built into the app, without going online. It says "This is the right book and edition", or that the edition differs or the file is a compressed copy, and shows your file size and the Ministry file size in MB.',
        'If you get a better file from the Ministry link, Replace puts it under the same book. Your reading place, notes, highlights, bookmarks and flashcards stay, and lessons with the same title stay finished. Notes stay on the same page numbers.',
      ],
      bullets: [
        'Compared with your grade, your school and the Ministry list inside the app.',
        'Works offline: the list is part of the app.',
        'Tells you when the edition differs or the file is compressed.',
        'Replacing keeps your reading place, notes, highlights and finished lessons.',
      ],
      steps: [
        { title: 'Add your book', text: 'Add the book file from the library.' },
        { title: 'Check the edition', text: 'See the result and both file sizes in MB.' },
        { title: 'Replace if needed', text: 'Use only the file from the Ministry link. Your progress stays.' },
      ],
      audience: 'For parents who set up books for a child, and students who downloaded a file from a source they are unsure about.',
      faq: [
        { q: 'Does the app download books from the internet?', a: 'No. You add the file, and the app compares it with a list inside it without opening any site.' },
        { q: 'Will my notes be lost if I replace the file?', a: 'No, they stay. If the new edition numbers its pages differently, check where they sit.' },
      ],
    },
  },
  {
    slug: 'weekly-sheet',
    emoji: '🧾',
    color: '#22d3ee',
    appPath: '#/sheet',
    share: true,
    related: ['monthly-report', 'parent-card', 'mistakes-review'],
    ar: {
      title: 'ورقة المذاكرة الأسبوعية: صفحة واحدة بالفعل اللي اتذاكر',
      description:
        'صفحة واحدة بدقايق المذاكرة والمواضيع المخلّصة والامتحانات والأخطاء المطلوب مراجعتها. بتتعمل على جهازك، وتتشارك لو ولي الأمر ضغط مشاركة.',
      eyebrow: 'الورقة الأسبوعية',
      h1: 'أسبوع كامل في صفحة واحدة',
      lead:
        'من غير تقرير طويل: صورة واحدة بتوري إيه اللي اتذاكر فعلًا الأسبوع ده، وإيه اللي لسه محتاج رجوع.',
      problem: ['الأسبوع بيعدّي، ومحدش فاكر ذاكر إيه ولا فاضل إيه.'],
      solution: [
        'الورقة بتتبني من آخر ٧ أيام بس، ومن بيانات موجودة على جهازك: الدقايق، المواضيع المخلّصة، الامتحانات التجريبية ومتوسطها، والأخطاء الجاهزة للمراجعة. لو لسه مفيش موضوع مخلّص بتقولك إن أسبوع جديد بدأ النهارده.',
        'مفيش حساب ولا سيرفر. الورقة بتترسم على الجهاز وبتسيبه بس لو ضغطت «شارك الورقة»، وإنت اللي بتختار مين ياخدها. اسم الطفل اختياري.',
      ],
      bullets: [
        'دقايق المذاكرة والمواضيع المخلّصة.',
        'الامتحانات التجريبية ومتوسطها.',
        'أخطاء جاهزة للمراجعة الأسبوع الجاي.',
        'تتحفظ صورة وتتشارك باختيارك.',
      ],
      steps: [
        { title: 'افتح الورقة', text: 'من التقرير اختار «ورقة المذاكرة الأسبوعية».' },
        { title: 'راجعها', text: 'شوف الدقايق والمواضيع والأخطاء، وضيف الاسم لو حابب.' },
        { title: 'شاركها أو احفظها', text: 'الورقة مش بتتبعت لحد غير لو ضغطت مشاركة.' },
      ],
      audience: 'لولي الأمر اللي عايز صورة سريعة عن الأسبوع، وللطالب اللي عايز يخطط للأسبوع الجاي.',
      faq: [
        { q: 'هل الورقة بتتخزن عندكم؟', a: 'لأ. بتتعمل وبتتحفظ على جهازك.' },
        { q: 'إيه الفرق بينها وبين التقرير الشهري؟', a: 'الورقة أسبوع واحد في صفحة، والتقرير الشهري صفحة أطول للشهر كله.' },
      ],
    },
    en: {
      title: 'Weekly study sheet: one page of what was really studied',
      description:
        'One page with study minutes, finished topics, practice tests and mistakes to review. Made on your device and shared only if a parent taps Share.',
      eyebrow: 'Weekly sheet',
      h1: 'A whole week on one page',
      lead:
        'No long report: one picture of what was really studied this week, and what still needs a second look.',
      problem: ['The week passes and nobody remembers what was studied or what is left.'],
      solution: [
        'The sheet is built from the last seven days only, from data already on your device: minutes, finished topics, practice tests with their average, and mistakes ready to review. With no finished topic yet, it says a new week starts today.',
        "No account and no server. The sheet is drawn on your device and leaves it only if you press Share, and you choose who gets it. The child's name is optional.",
      ],
      bullets: [
        'Study minutes and finished topics.',
        'Practice tests and their average.',
        'Mistakes ready to review next week.',
        'Saved as an image and shared only by choice.',
      ],
      steps: [
        { title: 'Open the sheet', text: 'From Report, choose the Weekly study sheet.' },
        { title: 'Look it over', text: 'See the minutes, topics and mistakes, and add a name if you want.' },
        { title: 'Share or save', text: 'The sheet goes nowhere unless you press Share.' },
      ],
      audience: 'For parents who want a quick picture of the week, and students planning the next one.',
      faq: [
        { q: 'Is the sheet stored on your side?', a: 'No. It is made and kept on your device.' },
        { q: 'How is it different from the monthly report?', a: 'The sheet is one week on one page. The monthly report is a longer page for the whole month.' },
      ],
    },
  },
  {
    slug: 'science-board',
    emoji: '🔬',
    color: '#4ade80',
    appPath: '#/science-board',
    share: true,
    related: ['virtual-labs', 'camera-solver', 'check-working'],
    ar: {
      title: 'لوحة العلوم: اكتب سؤال علوم وشوف الفكرة في صناديق',
      description:
        'اكتب سؤال علوم، وجيسيكا ترسم الفكرة كصناديق مرقّمة وأسهم. بتشتغل بمفتاح الذكاء الاصطناعي بتاعك إنت، ومفيش حاجة بتترفع عندنا.',
      eyebrow: 'لوحة العلوم',
      h1: 'فهم العلوم في كام صندوق بدل فقرة طويلة',
      lead:
        'اكتب مثلًا «النبات بيعمل أكله إزاي؟» وشوف الفكرة ماشية من صندوق للتاني بأسهم، بدل ما تحفظ فقرة.',
      problem: ['شرح العلوم بالكلام الطويل بيتنسي. العين بتفهم الترتيب أسرع من الفقرة.'],
      solution: [
        'جيسيكا بتبعت سؤالك لمزوّد الذكاء الاصطناعي اللي إنت اخترته بمفتاحك، وبترسم الإجابة كلوحة صغيرة: صناديق مرقّمة وأسهم.',
        'أهم تنبيه: اللوحة بتتعمل بالذكاء الاصطناعي من سؤالك، مش من كتابك، وممكن تغلط. راجعها مع الكتاب أو المدرس. سؤالك بيروح لمزوّدك بس، ومفيش حاجة بتترفع عندنا.',
      ],
      bullets: [
        'صناديق مرقّمة وأسهم بدل فقرة.',
        'بتحتاج مفتاح ذكاء اصطناعي مجاني بتاعك إنت.',
        'السؤال بيروح لمزوّدك بس.',
        'ممكن تغلط، فراجعها مع الكتاب.',
      ],
      steps: [
        { title: 'اكتب سؤال علوم', text: 'مثال: النبات بيعمل أكله إزاي؟' },
        { title: 'ارسم اللوحة', text: 'اضغط «ارسم اللوحة» وانتظر ثواني.' },
        { title: 'راجعها بكتابك', text: 'اتأكد من الخطوات مع الكتاب أو المدرس.' },
      ],
      audience: 'للطالب اللي بيفهم بالصورة، ولولي الأمر اللي عايز يشرح ببساطة.',
      faq: [
        { q: 'هل محتاجة مفتاح؟', a: 'أيوه، مفتاح ذكاء اصطناعي بتاعك إنت. في دليل في الموقع بيوريك إزاي تجيبه.' },
        { q: 'هل اللوحة دايمًا صح؟', a: 'لأ، ممكن تغلط. دايمًا راجعها مع الكتاب.' },
      ],
    },
    en: {
      title: 'Science board: type a science question and see the idea in boxes',
      description:
        'Type a science question and Jessica draws the idea as numbered boxes and arrows. It uses your own AI key, and nothing is uploaded to us.',
      eyebrow: 'Science board',
      h1: 'Science in a few boxes instead of a long paragraph',
      lead:
        'Type, for example, "How does a plant make food?" and watch the idea move from box to box with arrows, instead of memorising a paragraph.',
      problem: ['Long science explanations are forgotten. The eye grasps order faster than a paragraph.'],
      solution: [
        'Jessica sends your question to the AI provider you chose, with your own key, and draws the answer as a small board: numbered boxes and arrows.',
        'The main warning: the board is made by AI from your question, not from your textbook, and it can be wrong. Check it against your book or ask your teacher. Your question goes only to your provider and nothing is uploaded to us.',
      ],
      bullets: [
        'Numbered boxes and arrows instead of a paragraph.',
        'Needs your own AI key.',
        'The question goes only to your provider.',
        'It can be wrong, so check it against your book.',
      ],
      steps: [
        { title: 'Type a science question', text: 'Example: How does a plant make food?' },
        { title: 'Draw the board', text: 'Press Draw the board and wait a few seconds.' },
        { title: 'Check it with your book', text: 'Confirm the steps with the book or your teacher.' },
      ],
      audience: 'For students who understand by picture, and parents explaining something simply.',
      faq: [
        { q: 'Do I need a key?', a: 'Yes, your own AI key. A guide on the site shows how to get one.' },
        { q: 'Is the board always right?', a: 'No, it can be wrong. Always check it against your book.' },
      ],
    },
  },
  {
    slug: 'battle-card',
    emoji: '⚔️',
    color: '#fb7185',
    appPath: '#/battle',
    share: true,
    related: ['flashcards', 'class-pack', 'kids'],
    ar: {
      title: 'تحدّي زميلك: معركة أسئلة بلينك وكارت نتيجة على الجهاز',
      description:
        'ابعت تحدّي أسئلة لزميلك بلينك أو QR، الفايز ياخد +٤٥ نقطة، وكل إجابة صح +١٠. النتيجة بتتسجل على جهازك وكارت تتشارك لو ولي الأمر عايز.',
      eyebrow: 'التحدّي',
      h1: 'ذاكر وإنت بتتحدّى صاحبك',
      lead:
        'التحدّي بيحوّل المراجعة للعبة: نفس الأسئلة، نفس الهدف، واللي يغلب ياخد الفوز. الخسارة مش مشكلة، اقرا الشرح وارجع تاني.',
      problem: ['المراجعة لوحدك مملة، وتحدّي الأصحاب بيخليها لعبة، بس عادةً محتاج سيرفر وحسابات.'],
      solution: [
        'تعمل تحدّي في مادة وعدد أسئلة وهدف إجابات صح، وتبعت لينك أو QR. زميلك يفتحه ويحاول يغلبك. الفايز ياخد +٤٥ نقطة، وكل إجابة صح بتجيب +١٠ سواء كسبت أو خسرت.',
        'النتيجة بتتسجل في لوحة صغيرة على الجهاز لأطفال البيت. وكارت النتيجة بيتعمل على الجهاز ومش بيتبعت غير لو ولي الأمر ضغط مشاركة.',
      ],
      bullets: [
        'تحدّي بلينك أو QR، من غير حسابات.',
        'الفايز +٤٥ نقطة، وكل إجابة صح +١٠.',
        'لوحة نتايج صغيرة على الجهاز.',
        'كارت نتيجة بتشاركه باختيارك.',
      ],
      steps: [
        { title: 'اعمل تحدّي', text: 'اختار المادة وعدد الأسئلة والهدف.' },
        { title: 'ابعت اللينك', text: 'لينك أو QR لزميلك.' },
        { title: 'شوف النتيجة', text: 'اتعلّم من الشرح، واحفظ الكارت أو شاركه.' },
      ],
      audience: 'للطلبة اللي بتحب المنافسة، وللأخوات في نفس البيت.',
      faq: [
        { q: 'لو اللينك ناقص؟', a: 'اطلب من زميلك يبعت اللينك كامل أو يمسح الـQR تاني.' },
        { q: 'هل النتيجة بتتحفظ عندكم؟', a: 'لأ. اللوحة والكارت على جهازك بس.' },
      ],
    },
    en: {
      title: 'Battle a classmate: a quiz duel by link, result card on device',
      description:
        'Challenge a classmate by link or QR. Winner +45 XP, every right answer +10. Results stay on your device, with a card to share if a parent wants.',
      eyebrow: 'Battle',
      h1: 'Study while you challenge a friend',
      lead:
        'A battle turns revision into a game: same questions, same target, and whoever beats it takes the win. Losing is fine, read the explanations and rematch.',
      problem: ['Revising alone is dull. Challenging friends makes it a game, but that usually needs servers and accounts.'],
      solution: [
        'You set a subject, a number of questions and a target of right answers, then send a link or QR. Your classmate opens it and tries to beat you. The winner gets +45 XP, and every right answer earns +10 win or lose.',
        'The result is saved on a small scoreboard on the device, for children who play on it. The result card is made on the device and leaves only if a parent presses Share.',
      ],
      bullets: [
        'Challenge by link or QR, no accounts.',
        'Winner +45 XP, every right answer +10.',
        'A small scoreboard on the device.',
        'A result card you share by choice.',
      ],
      steps: [
        { title: 'Make a battle', text: 'Pick the subject, number of questions and target.' },
        { title: 'Send the link', text: 'A link or QR to your classmate.' },
        { title: 'See the result', text: 'Learn from the explanations, then save or share the card.' },
      ],
      audience: 'For students who like competing, and siblings in the same home.',
      faq: [
        { q: 'What if the link is incomplete?', a: 'Ask your classmate to send the full link or scan the QR again.' },
        { q: 'Is the result stored on your side?', a: 'No. The scoreboard and card stay on your device.' },
      ],
    },
  },
  {
    slug: 'class-pack',
    emoji: '🎒',
    color: '#fbbf24',
    appPath: '#/teacher',
    share: true,
    related: ['class-mode', 'flashcards', 'school-exam'],
    ar: {
      title: 'حزمة الفصل: اختبار وحدة وكروت مذاكرة في لينك واحد',
      description:
        'المدرس أو ولي الأمر يبعت لينك قصير فيه اختبار الوحدة وكروت المذاكرة. لو مفيش مفتاح ذكاء اصطناعي الحزمة بتبقى اختبار بس.',
      eyebrow: 'حزمة الفصل',
      h1: 'لينك واحد: اختبار الوحدة وكروتها',
      lead:
        'بدل ما تبعت ورقة وبعدين كروت، ابعت حزمة واحدة قصيرة بتفتح عند الطالب كاملة.',
      problem: ['اختبار في رسالة وكروت في رسالة تانية، والطالب بيضيّع واحدة منهم.'],
      solution: [
        'الحزمة بتجمع اختبار وحدة وكروت مذاكرة لنفس الوحدة في لينك أو QR مضغوط. كل حاجة مضمّنة في اللينك، فمفيش سيرفر.',
        'الكروت بتتعمل بمفتاح الذكاء الاصطناعي على جهاز اللي بيجهّز الحزمة. لو مفيش مفتاح أو فشلت المرة دي، التطبيق بيقولك والحزمة بتبقى اختبار بس. ولو عايز الحزمة كاملة ابعت اللينك مش الـQR.',
      ],
      bullets: [
        'اختبار وحدة وكروتها في لينك واحد.',
        'من غير سيرفر، كله جوه اللينك.',
        'من غير مفتاح الحزمة بتبقى اختبار بس.',
        'للحزمة الكاملة ابعت اللينك بدل الـQR.',
      ],
      steps: [
        { title: 'اختار الوحدة', text: 'من وضع الفصل اختار وحدة من الكتاب.' },
        { title: 'جهّز الحزمة', text: 'التطبيق بيبني الاختبار والكروت.' },
        { title: 'ابعت اللينك', text: 'اللينك الكامل للحزمة الكاملة.' },
      ],
      audience: 'للمدرس اللي بيجهّز لفصل كامل، ولولي الأمر اللي عايز يبعت مراجعة جاهزة.',
      faq: [
        { q: 'لو مفيش مفتاح ذكاء اصطناعي؟', a: 'الحزمة بتبقى اختبار الوحدة بس، والتطبيق بيقولك كده.' },
        { q: 'ليه اللينك أحسن من الـQR؟', a: 'للحزمة الكاملة التطبيق نفسه بينصح تبعت اللينك مش الـQR.' },
      ],
    },
    en: {
      title: 'Class pack: a unit quiz and study cards in one link',
      description:
        "A teacher or parent sends one short link with the unit quiz and its study cards. With no AI key on the sender's device, the pack is the quiz only.",
      eyebrow: 'Class pack',
      h1: 'One link: the unit quiz and its cards',
      lead:
        "Instead of sending a paper and then cards, send one short pack that opens complete on the student's phone.",
      problem: ['One message with a quiz and another with cards, and the student loses one.'],
      solution: [
        'The pack joins a unit quiz and study cards for the same unit into a compressed link or QR. Everything travels inside the link, so there is no server.',
        "The cards are made with the AI key on the sender's device. With no key, or if it fails this time, the app says so and the pack is the quiz only. For the full pack, send the link and not the QR.",
      ],
      bullets: [
        'A unit quiz and its cards in one link.',
        'No server, everything is inside the link.',
        'With no key the pack is the quiz only.',
        'For the full pack, send the link and not the QR.',
      ],
      steps: [
        { title: 'Pick the unit', text: 'In Class mode choose a unit from the book.' },
        { title: 'Make the pack', text: 'The app builds the quiz and the cards.' },
        { title: 'Send the link', text: 'The full link for the full pack.' },
      ],
      audience: 'For a teacher preparing a whole class, and a parent who wants to send ready revision.',
      faq: [
        { q: 'What if there is no AI key?', a: 'The pack is the unit quiz only, and the app tells you.' },
        { q: 'Why is the link better than the QR?', a: 'For the full pack the app itself advises sending the link and not the QR.' },
      ],
    },
  },
  {
    slug: 'book-games',
    emoji: '🧩',
    color: '#c084fc',
    appPath: '#/games',
    share: true,
    related: ['flashcards', 'kids', 'virtual-labs'],
    ar: {
      title: 'ألعاب من جمل كتابك: رتّب، ركّب الجملة، ودوّر على الدليل',
      description:
        'ألعاب من النص الحقيقي لوحدة في كتابك: رتّب الجمل، ركّب جملة بعربيات الكلمات، دوّر على جملتين فيهم كلمة الدليل، وصلّح الكوبري برقم صح.',
      eyebrow: 'ألعاب الكتاب',
      h1: 'العب بجمل كتابك بدل ما تحفظها',
      lead:
        'كل لعبة من نص الوحدة نفسه. التطبيق مش بيكتب حاجة من عنده، فلو الوحدة مفيهاش نص كفاية مفيش لعبة.',
      problem: ['الحفظ بالتكرار بيزهّق، والطالب بيقرا الجملة من غير ما ينتبه لترتيبها.'],
      solution: [
        'لوحة الدرس: رتّب جمل الصفحة زي ما في الكتاب. قطر الكلمات: ركّب جملة من الكتاب بعربيات الكلمات. المحقق: دوّر على الجملتين اللي فيهم كلمة الدليل.',
        'وفي وحدات الحساب لعبة رابعة: حط الرقم المناسب في كل فجوة في الكوبري عشان الأتوبيس يعدّي. لو الوحدة مش عن أرقام مفيش كوبري. ولو غلطت الرسالة هادية: «خد وقتك».',
      ],
      bullets: [
        'ثلاث ألعاب من جمل الكتاب الحقيقية.',
        'كوبري للوحدات اللي فيها أرقام.',
        'التطبيق مش بيألّف نص من عنده.',
        'من غير حساب، على جهازك.',
      ],
      steps: [
        { title: 'افتح الألعاب', text: 'اختار لعبة واختار وحدة من كتابك.' },
        { title: 'العب', text: 'رتّب أو ركّب أو دوّر، وخد وقتك.' },
        { title: 'جرّب وحدة تانية', text: 'لو مفيش نص كفاية، اختار وحدة غيرها.' },
      ],
      audience: 'للطالب اللي بيزهق من الحفظ، وللطفل اللي بيحب اللعب.',
      faq: [
        { q: 'لو كتابي صفحات صور؟', a: 'اللعبة محتاجة نص في الوحدة. صفحات الصور لازم نصها يتقري الأول.' },
        { q: 'في توقيت؟', a: 'لأ، اللعبة هادية، والرسالة عند الغلط «خد وقتك».' },
      ],
    },
    en: {
      title: "Games from your book's own sentences: restore, build, investigate",
      description:
        'Games from the real text of a unit in your book: restore the page order, build a sentence, find the clue sentences, and fix the bridge with the right number.',
      eyebrow: 'Book games',
      h1: "Play with your book's sentences instead of memorising them",
      lead:
        "Every game comes from the unit's own text. The app writes nothing itself, so a unit without enough text gives no game.",
      problem: ['Learning by repetition gets dull, and students read a sentence without noticing its order.'],
      solution: [
        "Restore the lesson board: put the sentences of a page back in the book's order. Word train: build a sentence from your book out of word cars. Book detective: find the two sentences that hold the clue word.",
        'For maths units there is a fourth: put the right plank in every gap so the bus can cross the bridge. A unit that is not about numbers gets no bridge. When you miss, the message is calm: take your time.',
      ],
      bullets: [
        "Three games built from the real sentences of your book.",
        'A bridge game for units with numbers.',
        'The app does not invent text.',
        'No account, on your device.',
      ],
      steps: [
        { title: 'Open Games', text: 'Pick a game and a unit from your book.' },
        { title: 'Play', text: 'Restore, build or investigate, and take your time.' },
        { title: 'Try another unit', text: 'If there is not enough text, pick a different unit.' },
      ],
      audience: 'For students bored of memorising, and children who like to play.',
      faq: [
        { q: 'What if my book is picture pages?', a: 'The games need text in the unit. Picture pages need their text read first.' },
        { q: 'Is there a timer?', a: 'No. The games are calm, and a miss says "Take your time".' },
      ],
    },
  },
  {
    slug: 'lab-notebook',
    emoji: '📓',
    color: '#2dd4bf',
    appPath: '#/labs',
    share: true,
    related: ['virtual-labs', 'mistakes-review', 'kids'],
    ar: {
      title: 'دفتر المعمل: توقّع، جرّب مرتين، وفسّر بكلامك',
      description:
        'في معمل من وحدة كتابك: اكتب توقّعك، جرّب مرتين، قارن، واكتب تفسيرك. الدفتر بيتحفظ على جهازك بس وكل كلمة فيه بتاعتك.',
      eyebrow: 'دفتر المعمل',
      h1: 'العالِم بيتوقّع الأول',
      lead:
        'مهمة المعمل: توقّع، جرّب، قارن، فسّر. التطبيق مش بيكتب لك العلم، كل كلمة في الدفتر من عندك.',
      problem: ['الطالب بيضغط ويشوف النتيجة من غير ما يفكر هو كان متوقع إيه.'],
      solution: [
        'قبل التجربة تكتب توقّعك. بعد المحاولة الأولى والتانية، التطبيق بيقولك لو توقّعك طابق: «توقّعك طابق المحاولة ١». ولو اختلف بيقولك إن ده مفيد، لأن العلماء بيتعلموا منه.',
        'تحفظ في «دفتري» على الجهاز وترجع له في الدرس. أي غلطة بتروح لدفتر الأخطاء ومعاها شرحها.',
      ],
      bullets: [
        'توقّع، محاولتين، مقارنة، وتفسير.',
        'مرتبط بمعمل من وحدة في كتابك.',
        'بيتحفظ على الجهاز بس.',
        'الأخطاء ليها مكان في دفتر الأخطاء بشرحها.',
      ],
      steps: [
        { title: 'اكتب توقّعك', text: 'قبل ما تلمس أي حاجة.' },
        { title: 'جرّب مرتين', text: 'قارن النتيجة بتوقّعك.' },
        { title: 'فسّر واحفظ', text: 'اكتب تفسيرك واحفظه في دفترك.' },
      ],
      audience: 'للطالب اللي عايز يفهم السبب، وللمدرس اللي بيحب الاستقصاء.',
      faq: [
        { q: 'هل التطبيق بيكتب التفسير؟', a: 'لأ، كل كلمة في الدفتر بتاعتك.' },
        { q: 'فين بيتحفظ الدفتر؟', a: 'على جهازك بس.' },
      ],
    },
    en: {
      title: 'Lab notebook: predict, try twice, explain in your own words',
      description:
        'On a lab from a unit in your book: write your prediction, try twice, compare, and explain. The notebook is saved on your device only and every word is yours.',
      eyebrow: 'Lab notebook',
      h1: 'A scientist predicts first',
      lead:
        'The lab mission: predict, test, compare, explain. The app does not write the science for you, every word in the notebook is yours.',
      problem: ['Students press buttons and see the result without thinking about what they expected.'],
      solution: [
        'Before the experiment you write your prediction. After the first and second tries, the app tells you whether it matched: "Your prediction matched Try 1". If it differed, it says that is useful, because scientists learn from it.',
        'Save it in My notebook, kept on this device, and come back to it in the lesson. Every miss has its place in your mistakes notebook with its explanation.',
      ],
      bullets: [
        'Predict, two tries, compare and explain.',
        'Tied to a lab from a unit in your book.',
        'Saved on the device only.',
        'Misses live in the mistakes notebook with explanations.',
      ],
      steps: [
        { title: 'Write your prediction', text: 'Before you touch anything.' },
        { title: 'Try twice', text: 'Compare the result with your prediction.' },
        { title: 'Explain and save', text: 'Write your explanation and save it in your notebook.' },
      ],
      audience: 'For students who want to understand why, and teachers who like inquiry.',
      faq: [
        { q: 'Does the app write the explanation?', a: 'No, every word in the notebook is yours.' },
        { q: 'Where is the notebook saved?', a: 'On your device only.' },
      ],
    },
  },
  {
    slug: 'check-working',
    emoji: '✅',
    color: '#38bdf8',
    appPath: '#/steps',
    share: true,
    related: ['camera-solver', 'mistakes-review', 'science-board'],
    ar: {
      title: 'راجع خطواتي: جيسيكا تعلّم كل خطوة وتدّيك تلميح من غير الإجابة',
      description:
        'اكتب السؤال وخطواتك، سطر لكل خطوة. جيسيكا تعلّم كل خطوة وتدّي تلميح على الغلط من غير ما تقولك الإجابة. بتشتغل بمفتاحك إنت.',
      eyebrow: 'راجع خطواتي',
      h1: 'حليت صح؟ شوف أول خطوة غلط',
      lead:
        'مش كفاية تعرف إن الإجابة غلط، المهم تعرف فين. اكتب خطواتك وشوف أول خطوة محتاجة تصليح.',
      problem: ['الطالب بيشوف الإجابة النهائية غلط ومش عارف الغلطة في أنهي سطر.'],
      solution: [
        'اكتب السؤال وخطواتك سطر سطر، مثلًا «حل ٣س + ٥ = ٢٠». جيسيكا بتعلّم كل خطوة، وبتدّيك تلميح على الغلط من غير ما تكشف الإجابة، وبتقولك تبدأ بتصليح الخطوة رقم كام.',
        'لو مفيش خطوة غلط بتقولك «شغل حلو». حلّك بيروح لمزوّد الذكاء الاصطناعي بتاعك بس عشان يتصحّح، ومفيش حاجة بتترفع عندنا. ممكن تغلط، فراجعها.',
      ],
      bullets: [
        'تعليم كل خطوة لوحدها.',
        'تلميح من غير الإجابة النهائية.',
        'محتاجة مفتاح ذكاء اصطناعي بتاعك إنت.',
        'الحل بيروح لمزوّدك بس.',
      ],
      steps: [
        { title: 'اكتب السؤال', text: 'مثال: حل ٣س + ٥ = ٢٠.' },
        { title: 'اكتب خطواتك', text: 'سطر لكل خطوة.' },
        { title: 'صلّح أول خطوة غلط', text: 'اتبع التلميح وجرّب تاني.' },
      ],
      audience: 'للطالب اللي بيحل واجب لوحده، ولولي الأمر اللي مش فاكر الطريقة.',
      faq: [
        { q: 'هل بتدّيني الإجابة؟', a: 'لأ، بتدّي تلميح بس.' },
        { q: 'هل ممكن تغلط؟', a: 'ممكن، فراجع مع الكتاب أو المدرس.' },
      ],
    },
    en: {
      title: 'Check my working: marks each step and hints without the answer',
      description:
        'Write the question and your steps, one per line. Jessica marks each step and gives a hint on the wrong one without revealing the answer. Uses your own AI key.',
      eyebrow: 'Check my working',
      h1: 'Did I solve it right? See the first wrong step',
      lead:
        'Knowing the answer is wrong is not enough, you need to know where. Write your steps and see the first one that needs fixing.',
      problem: ['A student sees the final answer is wrong and cannot tell which line went wrong.'],
      solution: [
        'Write the question and your steps line by line, for example "Solve 3x + 5 = 20". Jessica marks each step, gives a hint on the wrong one without giving the answer away, and says which step to start fixing.',
        'If no step is wrong it says nice work. Your working goes only to your own AI provider so it can be marked, and nothing is uploaded to us. It can be wrong, so check it.',
      ],
      bullets: [
        'Each step is marked on its own.',
        'A hint without the final answer.',
        'Needs your own AI key.',
        'Your working goes only to your provider.',
      ],
      steps: [
        { title: 'Write the question', text: 'Example: Solve 3x + 5 = 20.' },
        { title: 'Write your steps', text: 'One step per line.' },
        { title: 'Fix the first wrong step', text: 'Follow the hint and try again.' },
      ],
      audience: 'For students doing homework alone, and parents who forget the method.',
      faq: [
        { q: 'Does it give me the answer?', a: 'No, only a hint.' },
        { q: 'Can it be wrong?', a: 'It can, so check with the book or your teacher.' },
      ],
    },
  },
  {
    slug: 'photo-text',
    emoji: '📷',
    color: '#fb923c',
    appPath: '#/solve',
    share: true,
    related: ['camera-solver', 'offline', 'weak-phone'],
    ar: {
      title: 'قراءة النص من صورة: من غير مفتاح ذكاء اصطناعي',
      description:
        'صوّر سؤال، وجيسيكا تقرا النص على جهازك من غير مفتاح. الصورة ما بتسيبش الموبايل، لكن أداة القراءة بتتحمّل مرة من النت.',
      eyebrow: 'نص من صورة',
      h1: 'صوّر السؤال واقرا الكلام',
      lead:
        'لو صوّرت سؤال، زرار «اقرا النص بس» بيطلّع الكلام من الصورة من غير مفتاح ومن غير حساب.',
      problem: ['مش كل سؤال مكتوب نص. الصورة لوحدها مفيهاش كلام تنسخه.'],
      solution: [
        'اختار صورة للسؤال واضغط «اقرا النص بس (من غير مفتاح)». القراءة بتحصل على جهازك والصورة ما بتسيبوش.',
        'أداة القراءة بتتحمّل مرة واحدة من النت، فلازم اتصال أول مرة. لو الصورة مش واضحة بتقولك إنه ملقاش نص وتجرّب صورة أوضح.',
      ],
      bullets: [
        'قراءة النص من غير مفتاح.',
        'الصورة ما بتسيبش الموبايل.',
        'الأداة بتتحمّل مرة من النت.',
        'صورة أوضح تدّي نتيجة أحسن.',
      ],
      steps: [
        { title: 'صوّر السؤال', text: 'صورة واضحة ومستقيمة.' },
        { title: 'اقرا النص بس', text: 'اضغط الزرار وانتظر.' },
        { title: 'لو مفيش نص', text: 'جرّب صورة أوضح.' },
      ],
      audience: 'للطالب اللي بيصوّر أسئلة، ولولي الأمر اللي مش عايز يدخّل مفتاح.',
      faq: [
        { q: 'هل محتاج إنترنت؟', a: 'أول مرة بس، لتحميل أداة القراءة.' },
        { q: 'هل الصورة بتترفع؟', a: 'لأ، بتفضل على جهازك.' },
      ],
    },
    en: {
      title: 'Read the text in a photo, with no AI key',
      description:
        'Photograph a question and Jessica reads the text on your device with no key. The photo never leaves your phone, but the reading tool downloads once.',
      eyebrow: 'Text from a photo',
      h1: 'Photograph the question and read the words',
      lead:
        'Photograph a question and the Read the text only button pulls the words out of the picture, with no key and no account.',
      problem: ['Not every question is typed text. A picture alone has no words to copy.'],
      solution: [
        'Choose a photo of the question and press Read the text only (no AI key). Reading happens on your device and the photo stays on it.',
        'The reading tool downloads once from the internet, so the first time needs a connection. If the photo is not clear, it says no text was found and you can try a sharper one.',
      ],
      bullets: [
        'Reads text with no key.',
        'The photo never leaves your phone.',
        'The tool downloads once from the internet.',
        'A sharper photo reads better.',
      ],
      steps: [
        { title: 'Photograph the question', text: 'A clear, straight photo.' },
        { title: 'Read the text only', text: 'Press the button and wait.' },
        { title: 'If no text is found', text: 'Try a sharper photo.' },
      ],
      audience: 'For students who photograph questions, and parents who do not want to enter a key.',
      faq: [
        { q: 'Do I need internet?', a: 'Only the first time, to download the reading tool.' },
        { q: 'Is the photo uploaded?', a: 'No, it stays on your device.' },
      ],
    },
  },
]
