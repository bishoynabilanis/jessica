// Content for grade x subject landing pages. Egyptian Arabic for AR pages, real English for EN pages.

export const SUBJECT_META = {
  Arabic: {
    slug: 'arabic',
    ar: 'عربي',
    en: 'Arabic',
    tipsAr: {
      primary: [
        'اقرأ نص الاستماع أو القراءة بصوت عالي مرتين: مرة للفهم ومرة للنطق الصحيح.',
        'اكتب الكلمات الجديدة في جملة من عندك، مش مجرد معناها — الجملة بتثبت الكلمة.',
        'راجع القواعد من تدريبات الكتاب نفسه، لأن أسئلة الامتحان بتيجي على نفس الأسلوب.',
      ],
      prep: [
        'لخص كل نص في ٣ جمل بأسلوبك قبل ما تحل الأسئلة — اللي تقدر تلخصه فهمته فعلاً.',
        'في القواعد، افهم القاعدة بمثالين من الكتاب قبل حفظ التعريف.',
        'خصص ١٠ دقايق أسبوعيًا للإملاء والخط — أخطاء الإملاء بتكلف درجات سهلة.',
      ],
    },
    tipsEn: {
      primary: [
        'Read the text aloud twice: once for meaning, once for correct pronunciation.',
        'Put every new word in a sentence of your own instead of memorizing definitions.',
        'Practice grammar from the textbook exercises, since exam questions follow the same pattern.',
      ],
      prep: [
        'Summarize each text in three sentences of your own before answering questions.',
        'Learn each grammar rule through two textbook examples before memorizing the definition.',
        'Keep ten minutes a week for dictation and handwriting - spelling slips cost easy marks.',
      ],
    },
  },
  English: {
    slug: 'english',
    ar: 'إنجليزي',
    en: 'English',
    tipsAr: {
      primary: [
        'اقرأ كل وحدة بصوت عالي كل يوم ١٠ دقايق — النطق الصح بيثبت الكلمة في الذاكرة.',
        'اكتب كلمات الوحدة على كروت (الكلمة بالإنجليزي ووراها المعنى) وراجعها قبل النوم.',
        'اسمع نصوص الكتاب من أي مصدر وردد وراها، مش بس اقرأها بعينك.',
      ],
      prep: [
        'لكل وحدة اعمل قائمة كلمات جديدة واكتب بكل كلمة جملة عن حياتك.',
        'القواعد بتتفهم بالاستخدام: بعد كل قاعدة اكتب ٣ جمل من عندك بنفس التركيب.',
        'اقرأ القطع مرتين: مرة للمعنى العام ومرة للتفاصيل قبل ما تحل الأسئلة.',
      ],
    },
    tipsEn: {
      primary: [
        'Read each unit aloud for ten minutes daily - saying the words fixes them in memory.',
        'Make flashcards for unit words (English on one side, meaning on the other) and review before bed.',
        'Listen to the texts and repeat after them instead of only reading silently.',
      ],
      prep: [
        'Keep a vocabulary list per unit and write one personal sentence with each new word.',
        'After every grammar point, write three sentences of your own using the same structure.',
        'Read each passage twice: once for the general idea, once for details, before the questions.',
      ],
    },
  },
  Mathematics: {
    slug: 'math',
    ar: 'رياضيات',
    en: 'Math',
    tipsAr: {
      primary: [
        'افهم الفكرة من أمثلة الكتاب الأول، وبعدها حل التدريبات من غير ما تبص على الحل.',
        'أي مسألة غلطت فيها، ارجع ليها بعد يومين وحلها تاني — دي أهم مسألة في الكتاب.',
        'اكتب خطوات الحل كاملة مش الناتج بس، لأن الامتحان بيدّي درجات على الخطوات.',
      ],
      prep: [
        'قبل أي قانون جديد، راجع القانون القديم اللي مبني عليه — أغلب الصعوبة سببها الأساس مش الدرس الجديد.',
        'حل مسائل الكتاب كلها قبل أي ملزمة خارجية، لأن الامتحان مبني على نفس الترتيب.',
        'لخص كل وحدة في ورقة واحدة: القوانين + مثال محلول لكل قانون.',
      ],
    },
    tipsEn: {
      primary: [
        'Understand the idea from the textbook examples first, then solve the exercises without looking at answers.',
        'Any question you get wrong, redo it two days later - it is the most important one in the book.',
        'Write the full solution steps, not only the final answer, because steps carry marks.',
      ],
      prep: [
        'Before any new rule, review the older rule it builds on - most difficulty comes from gaps in the basics.',
        'Solve all textbook problems before any external workbook, since exams follow the same order.',
        'Summarize each unit on one page: the rules plus one solved example per rule.',
      ],
    },
  },
  Science: {
    slug: 'science',
    ar: 'علوم',
    en: 'Science',
    tipsAr: {
      primary: [
        'اربط كل درس بحاجة بتحصل في البيت أو الشارع — العلوم بتتحفظ بالملاحظة مش بالقراءة بس.',
        'ارسم الرسمة التوضيحية اللي في الدرس بأيدك مرة واحدة، ودي أسرع طريقة تفتكرها في الامتحان.',
        'بعد كل درس اشرح اللي فهمته لحد في البيت — لو قدرت تشرحه يبقى اتعلمته.',
      ],
      prep: [
        'العلوم في الإعدادي بتقيس الفهم والربط: اربط كل درس بالدرس اللي قبله في نفس الوحدة.',
        'التجارب والأنشطة اللي في الكتاب مش إضافية — أسئلة الامتحان بتيجي عليها.',
        'اعمل جدول مقارنات لأي مفاهيم متشابهة (زي أنواع الخلايا أو أنواع الصخور).',
      ],
    },
    tipsEn: {
      primary: [
        'Connect every lesson to something at home or in the street - science sticks through observation.',
        'Draw the lesson diagram once with your own hand; it is the fastest way to recall it in the exam.',
        'After each lesson, explain what you learned to someone at home - if you can teach it, you know it.',
      ],
      prep: [
        'Prep science tests understanding: connect each lesson to the one before it in the same unit.',
        'The experiments and activities in the book are not extra - exam questions come from them.',
        'Make a comparison table for any similar concepts, like cell types or rock types.',
      ],
    },
  },
  'Social Studies': {
    slug: 'social-studies',
    ar: 'دراسات اجتماعية',
    arShort: 'دراسات',
    en: 'Social Studies',
    tipsAr: {
      primary: [
        'اقرأ الدرس كقصة الأول وبعدين حدد ٣ عناصر أساسية: مكان، زمان، وشخصيات أو أسباب.',
        'استخدم خريطة مصر أو العالم جنبك وأنت بتذاكر الجغرافيا — المكان بيثبت المعلومة.',
        'اربط التواريخ بأحداث تعرفها بدل حفظ أرقام لوحدها.',
      ],
      prep: [
        'قسم كل درس لمحاور (أسباب، أحداث، نتائج) واكتبهم في جدول صغير.',
        'الخرائط والرسوم البيانية في الكتاب بتتحول لأسئلة مباشرة — راجعها مش النص بس.',
        'اكتب ملخص سطر واحد لكل فقرة مهمة في هامش الورقة، وبعدها راجع الملخصات قبل الامتحان.',
      ],
    },
    tipsEn: {
      primary: [
        'Read the lesson as a story first, then pick three key elements: place, time, and people or causes.',
        'Keep a map of Egypt or the world next to you for geography - location anchors the facts.',
        'Link dates to events you already know instead of memorizing numbers alone.',
      ],
      prep: [
        'Split each lesson into causes, events, and results, and write them in a small table.',
        'The maps and charts in the book turn into direct exam questions - review them, not only the text.',
        'Write a one-line summary per important paragraph, then review the summaries before the exam.',
      ],
    },
  },
  French: {
    slug: 'french',
    ar: 'فرنساوي',
    en: 'French',
    tipsAr: {
      prep: [
        'ذاكر الفرنساوي بصوت عالي دايمًا — اللغة بتتحفظ بالأذن قبل العين.',
        'لكل موديول احفظ الجمل الجاهزة (actes de langage) زي ما هي، لأن الامتحان بيستخدمها حرفيًا.',
        'اكتب الأفعال اللي اتعلمتها في جمل قصيرة عن يومك، وراجع التصريفات في جدول واحد.',
      ],
    },
    tipsEn: {
      prep: [
        'Study French out loud - the language sticks through the ear before the eye.',
        'Memorize the ready-made sentences of each module as they are; the exam uses them word for word.',
        'Write short sentences about your day with each new verb, and keep one table for conjugations.',
      ],
    },
  },
}

export const SUBJECT_FAQ_AR = {
  Arabic: [
    ['هل كتاب العربي كفاية للمذاكرة ولا محتاج ملخص؟', 'الكتاب هو المرجع الأساسي، والامتحان بييجي من نصوصه وقواعده. الملخص مفيد للمراجعة السريعة بعد الفهم، مش بديل عن الكتاب.'],
    ['إزاي أحسن مستواي في التعبير؟', 'اكتب موضوع قصير مرة في الأسبوع بنفس عناصر التعبير اللي في الكتاب: مقدمة، فكرتين، وخاتمة. وبعدها قارن كتابتك بنموذج الكتاب.'],
  ],
  English: [
    ['إزاي أحفظ كلمات الإنجليزي من غير ما أنساها؟', 'راجع الكلمات على فترات متباعدة: بعد يوم، ٣ أيام، أسبوع. واستخدم الكلمة في جملة من عندك — الجملة بتخلي الكلمة تثبت أكتر من التكرار.'],
    ['الكتاب بالإنجليزي كله، إزاي أفهمه لو مستواي ضعيف؟', 'ابدأ بالصور والعناوين قبل القراءة، وبعدها اقرأ جملة جملة مع ترجمة الكلمات الأساسية بس. تطبيق Jessica يقدر يشرح أي صفحة من الكتاب بعد ما تستورده.'],
  ],
  Mathematics: [
    ['إزاي أذاكر رياضيات من الكتاب الرسمي؟', 'افهم المثال المحلول الأول، وبعدها اقفل الحل وحل التمرين بنفسك. لو غلطت، رجّع للمثال وشوف وقفت فين. دي أسرع طريقة لبناء المهارة.'],
    ['هل حل مسائل كتير أهم من فهم الدرس؟', 'الفهم الأول، وبعدها التكرار. ١٠ مسائل مفهومة أحسن من ٥٠ محلولة بطريقة ميكانيكية، لأن الامتحان بيغير صيغة السؤال.'],
  ],
  Science: [
    ['العلوم حفظ ولا فهم؟', 'المنهج الجديد بيقيس الفهم والربط، لكن الحفظ مطلوب للمصطلحات العلمية. افهم الفكرة الأول، وبعدها احفظ المصطلحات في جدول صغير لكل وحدة.'],
    ['إزاي أراجع العلوم قبل الامتحان؟', 'راجع ملخصات الوحدات والرسوم التوضيحية، وحل أسئلة نهاية كل وحدة. متقراش الكتاب من الأول — راجع النقط اللي سجلتها أثناء المذاكرة.'],
  ],
  'Social Studies': [
    ['الدراسات بتنسى بسرعة، إيه الحل؟', 'المراجعة المتباعدة: راجع الدرس بعد يوم وبعد أسبوع. واربط المعلومات بخريطة أو خط زمني — الدماغ بيفتكر الصور والعلاقات أكتر من النصوص.'],
    ['أذاكر الدراسات من الكتاب ولا من الملخصات؟', 'ابدأ بالكتاب عشان تفهم السياق الكامل، وبعدها استخدم ملخصك الشخصي للمراجعة. أسئلة الامتحان بتقيس فهم العلاقات، مش حفظ الجمل.'],
  ],
  French: [
    ['الفرنساوي صعب، إزاي أبدأ؟', 'ابدأ بجمل كل موديول الجاهزة واسمعها ورددها بصوت عالي. بعدها ركز على تصريفات الأفعال الأساسية في جدول واحد — دي أساس ٨٠٪ من الامتحان.'],
    ['أحفظ الكلمات الفرنسية إزاي؟', 'احفظ الكلمة مع جملتها من الكتاب مش لوحدها، وراجعها على فترات. الكتاب مرتب الوحدات بمواقف حقيقية، فاستغل ده واحفظ الموقف كله.'],
  ],
}

export const SUBJECT_FAQ_EN = {
  Arabic: [
    ['Is the Arabic textbook enough, or do I need a summary?', 'The textbook is the main reference and exam questions come from its texts and rules. A summary helps for quick review after understanding, not as a replacement.'],
    ['How do I improve my composition marks?', 'Write one short piece a week using the same structure the book teaches: introduction, two ideas, and a conclusion, then compare it with the model in the book.'],
  ],
  English: [
    ['How do I memorize English words without forgetting them?', 'Review words on spaced intervals: after a day, three days, a week. Use each word in your own sentence - a sentence fixes a word better than repetition.'],
    ['The book is fully in English. What if my level is weak?', 'Start with the pictures and headings before reading, then read sentence by sentence translating only the key words. Jessica can explain any page once you import the book.'],
  ],
  Mathematics: [
    ['How do I study math from the official textbook?', 'Understand the solved example first, then close it and solve the exercise yourself. If you get stuck, go back and find exactly where you stopped.'],
    ['Is solving many problems more important than understanding?', 'Understanding first, then repetition. Ten understood problems beat fifty solved mechanically, because the exam changes the question format.'],
  ],
  Science: [
    ['Is science about memorizing or understanding?', 'The new curriculum tests understanding and linking, but scientific terms must be memorized. Understand the idea first, then keep a small term table per unit.'],
    ['How do I review science before the exam?', 'Review unit summaries and diagrams, and solve the end-of-unit questions. Do not re-read the whole book - review the points you noted while studying.'],
  ],
  'Social Studies': [
    ['I forget social studies quickly. What is the fix?', 'Spaced review: revisit the lesson after a day and after a week. Link facts to a map or a timeline - the brain recalls images and relations better than text.'],
    ['Should I study from the textbook or from summaries?', 'Start with the textbook for the full context, then use your own summary for review. Exam questions test understanding of relations, not memorized sentences.'],
  ],
  French: [
    ['French feels hard. Where do I start?', 'Start with the ready-made sentences of each module: listen and repeat them aloud. Then focus on the core verb conjugations in one table - they cover most of the exam.'],
    ['How do I memorize French words?', 'Keep each word with its sentence from the book, not alone, and review on spaced intervals. The book arranges units by real-life situations, so learn the whole situation.'],
  ],
}

// One reel per page, topic-matched. Assets live in public/welcome/media/reels/ (mp4 + jpg poster).
export const REELS = {
  '1|Mathematics': {
    ar: { id: 'jessica-12', caption: 'الفرق بين التحميل والاستيراد في Jessica، وإزاي تضيف الكتاب لمكتبتك خطوة بخطوة.' },
    en: { id: 'jessica-13', caption: 'Choosing the right grade, subject, and term before adding a book in Jessica.' },
  },
  '3|Mathematics': {
    ar: { id: 'jessica-11', caption: 'رفيق المذاكرة في Jessica: ملصقات وأنشطة بتشجعك تكمل كل يوم.' },
  },
  '4|Mathematics': {
    ar: { id: 'jessica-03', caption: 'عدّاد الضرب في Jessica: مسألة ٤×٧ مع تأكيد الإجابة في ثواني.' },
    en: { id: 'jessica-04', caption: 'Learning from wrong answers in Jessica: retry 5x3 until it sticks.' },
  },
  '5|Mathematics': {
    ar: { id: 'jessica-01', caption: 'لعبة كسور البيتزا جوه Jessica: البسط والمقام على مثال حقيقي.' },
    en: { id: 'jessica-01', caption: 'The pizza fractions game inside Jessica: numerator and denominator on a real example.' },
  },
  '6|Mathematics': {
    ar: { id: 'jessica-16', caption: 'الفرق بين إعداد كويز بالذكاء الاصطناعي والتدريب الجاهز جوه Jessica.' },
    en: { id: 'jessica-17', caption: 'Asking a clear question in Jessica: adding the idea and the page context.' },
  },
  '8|Mathematics': {
    ar: { id: 'jessica-20', caption: 'قاعدة مهمة: الذكاء الاصطناعي ممكن يغلط - راجع الإجابة على الكتاب الأصلي دايمًا.' },
  },
  '9|Mathematics': {
    ar: { id: 'jessica-18', caption: 'قائمة أدوات الاستوديو في Jessica: اختار هدف المذاكرة اللي يناسبك.' },
    en: { id: 'jessica-19', caption: 'Flashcards in Jessica: the create button and where the Gemini key goes.' },
  },
  '4|Science': {
    ar: { id: 'jessica-06', caption: 'قصة دورة الماء في الطبيعة: من البخار للمطر، شرح مصور جوه التطبيق.' },
    en: { id: 'jessica-06', caption: 'The water cycle as a visual story: from vapor to rain, inside the app.' },
  },
  '5|Science': {
    ar: { id: 'jessica-05', caption: 'أجزاء النبات ووظيفة كل جزء - شرح مصور جوه Jessica.' },
    en: { id: 'jessica-05', caption: 'Plant parts and what each part does, explained visually in Jessica.' },
  },
  '6|Science': {
    ar: { id: 'jessica-02', caption: 'محاكاة جزيئات المادة: الفرق بين الصلب والسائل والغاز بشكل ملموس.' },
    en: { id: 'jessica-02', caption: 'A particle simulation of the states of matter: solid, liquid, and gas made visible.' },
  },
  '4|Arabic': {
    ar: { id: 'jessica-07', caption: 'خريطة المغامرة في كتاب عربي رابعة ابتدائي: التنقل بين الدروس ونطاقات الصفحات.' },
    en: { id: 'jessica-08', caption: 'Resuming reading from the home screen in the Primary 4 Arabic book.' },
  },
  '4|English': {
    ar: { id: 'jessica-09', caption: 'لوحة النجوم الأسبوعية في Jessica: تابع نشاطك وتقدمك يوم بيوم.' },
    en: { id: 'jessica-10', caption: 'The daily gift in Jessica: a small reward that keeps the study streak going.' },
  },
  '4|Social Studies': {
    ar: { id: 'jessica-14', caption: 'محدد التدريب في Jessica: ست مواد للتدريب في مكان واحد.' },
  },
}
