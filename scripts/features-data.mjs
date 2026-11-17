/**
 * Feature pages: one deep page per capability, in Arabic and English.
 *
 * The landing page lists what the app does; these pages explain why a parent or
 * a teacher should care, how the feature works step by step, and what it does
 * not promise. Each page is a real HTML document (title, canonical, hreflang,
 * Article + FAQ schema) so Google can index it on its own.
 */

export const FEATURES = [
  {
    slug: 'school-exam',
    emoji: '📄',
    color: '#21e6c9',
    appPath: '#/school-exam',
    related: ['grade-paper', 'mistakes-review', 'monthly-report'],
    ar: {
      title: 'امتحان المدرسة — الصق الورقة وشغّلها كامتحان',
      description:
        'ورقة المدرسة أو المدرس الخصوصي تتحوّل لامتحان مؤقت داخل التطبيق: الصق الأسئلة مرة واحدة، وجيسيكا تصحح وتشرح وتضع كل خطأ في الدفتر.',
      eyebrow: 'ورقة المدرسة',
      h1: 'الورقة اللي جاية من المدرسة مش حكم نهائي',
      lead:
        'بدل ما تتحل مرة واحدة وتتنسى، الصقها في جيسيكا وخلّيها امتحان حقيقي: وقت، تصحيح، وشرح لكل إجابة — وبعد أسبوع تعيدها وتشوف الفرق.',
      problem: [
        'المدرسة بتبعت ورقة أسئلة من غير مفتاح إجابة. الطالب بيحلها بسرعة، وولي الأمر بيصحح بالتخمين، والغلطة بتعدّي من غير ما حد يفهم سببها.',
        'ولو حاولت تذاكر تاني، مش هتلاقي نفس الورقة ولا نفس ترتيب الأسئلة. النتيجة إن نفس الغلطة بترجع في الامتحان اللي بعده.',
      ],
      solution: [
        'في صفحة «امتحان المدرسة» بتلصق الأسئلة مرة واحدة، سطر لكل سؤال: السؤال، أربع اختيارات، ورقم الاختيار الصح. الأرقام العربية مقبولة، والتطبيق بيرشّح السطور الغلط برقمها.',
        'جيسيكا بتحوّلها لامتحان مؤقت بساعة، من غير ما تكشف الإجابات، وفي الآخر بتصحح سؤال بسؤال وتشرح السبب وتودّي كل غلطة لدفتر الأخطاء.',
      ],
      bullets: [
        'ساعة تلقائية: دقيقة لكل سؤال + ٥ دقايق مراجعة.',
        'تصحيح كامل مع سبب كل إجابة، مش درجة بس.',
        'كل خطأ بيدخل دفتر الأخطاء ويتجدول للمراجعة.',
        'الورقة بتتحفظ، فتقدر تعيدها قبل الامتحان أو بعد أسبوع.',
      ],
      steps: [
        { title: 'الصق الأسئلة', text: 'سطر واحد لكل سؤال بالشكل: السؤال | اختيار١ | اختيار٢ | اختيار٣ | اختيار٤ | رقم الصح. زر «املأ مثال» بيوريك الشكل في ثانية.' },
        { title: 'ابدأ الامتحان', text: 'اختار اسم الورقة والمادة، واضغط «احفظ وابدأ». التطبيق يشغّل الساعة ويخفي الإجابات.' },
        { title: 'راجع وأعد', text: 'بعد التسليم تشوف الدرجة والشرح وكل غلطة. ارجع للورقة قبل الامتحان وشوف الدرجة اتحسنت ولا لأ.' },
      ],
      audience:
        'لولي الأمر اللي بيستلم ورقة كل أسبوع، وللمدرس الخصوصي اللي عايز يختبر طلبه على نفس الأسئلة اللي هتيجي، وللطالب اللي عايز يتدرب على الورقة بدل ما يحلها مرة ويتنسى.',
      faq: [
        { q: 'هل لازم أعرف صيغة معينة؟', a: 'سطر واحد لكل سؤال: السؤال ثم أربع اختيارات ثم رقم الاختيار الصح، بينهم علامة |. زر «املأ مثال» بيكتبلك مثال جاهز تعدّل عليه.' },
        { q: 'هل الورقة بتتحفظ؟', a: 'أيوه، محفوظة على جهازك. تقدر تفتحها وتعيدها في أي وقت، وتشوف محاولاتك السابقة جنبها.' },
      ],
    },
    en: {
      title: 'School exam — paste the paper and run it',
      description:
        'Turn the question sheet from school into a timed exam inside Jessica: paste it once, get marking, explanations and a mistakes notebook.',
      eyebrow: 'The school paper',
      h1: 'The paper from school is not the final word',
      lead:
        'Instead of solving it once and forgetting it, paste it into Jessica and make it a real exam: a clock, marking, an explanation for every answer — then retake it a week later and see the difference.',
      problem: [
        'Schools send a question sheet with no answer key. The student rushes it, the parent marks by guesswork, and the mistake passes without anyone understanding why.',
        'A week later the paper is gone and the same mistake returns in the real exam.',
      ],
      solution: [
        'In “school exam”, paste the questions once — one line per question: the prompt, four options, and the number of the correct one. Arabic digits work too, and the app names any bad line by number.',
        'Jessica turns it into a timed exam, hides the answers, then marks it question by question, explains the reason and files every miss in the mistakes notebook.',
      ],
      bullets: [
        'A real clock: one minute per question plus five minutes to review.',
        'Full marking with a reason for every answer, not just a score.',
        'Every miss enters the mistakes notebook and is scheduled for review.',
        'The paper is saved, so you can retake it before the exam or a week later.',
      ],
      steps: [
        { title: 'Paste the questions', text: 'One line per question: prompt | option 1 | option 2 | option 3 | option 4 | correct number. “Fill an example” shows the shape in a second.' },
        { title: 'Start the exam', text: 'Name the paper, pick the subject, and press save and start. The clock runs and the answers disappear.' },
        { title: 'Review and retake', text: 'After handing in you see the score, the reason for each answer and every miss. Come back before the exam and compare.' },
      ],
      audience:
        'For the parent who receives a paper every week, the tutor who wants to test students on the same questions, and the student who wants practice instead of a one-time solve.',
      faq: [
        { q: 'Do I need a special format?', a: 'One line per question: prompt, four options, then the correct number, separated by |. The “fill an example” button writes a sample you can edit.' },
        { q: 'Is the paper saved?', a: 'Yes, on your device. Reopen and retake it any time, with your previous attempts beside it.' },
      ],
    },
  },
  {
    slug: 'grade-paper',
    emoji: '✅',
    color: '#6b8cff',
    appPath: '#/grade',
    related: ['school-exam', 'monthly-report', 'mistakes-review'],
    ar: {
      title: 'صحّح ورقة ابنك بلمسة — من غير كاميرا',
      description:
        'افتح كود الورقة المطبوعة أو امسح QR، دوس على الإجابات اللي طفلك كتبها، وخد الدرجة والمهارات الضعيفة ورسالة واتساب جاهزة.',
      eyebrow: 'تصحيح الورق',
      h1: '٣٠ ورقة مش محتاجة ٣٠ دقيقة تصحيح',
      lead:
        'الورقة اللي طبعتها من جيسيكا فيها كود وQR. صوّرها، افتح صفحة التصحيح، دوس على الإجابات اللي طفلك كتبها — والنتيجة بتطلع في ثانية.',
      problem: [
        'تصحيح ورقة محلولة بالإيد بياخد وقت، وبيتحوّل لمجرد «صح وغلط» من غير ما حد يشوف المهارة الضعيفة ورا الغلطة.',
        'والأسوأ إن الدرجة بتتنسى، والغلط بيتكرر في الورقة اللي بعدها.',
      ],
      solution: [
        'كل ورقة بتطبعها من التطبيق بتتحفظ ومعاها كود قصير وQR. الكود بيفتح صفحة «صحّح ورقة» بالورقة مختارة على طول — مفيش كتابة كود ولا بحث.',
        'تدوس على الاختيار اللي طفلك كتبه، والتطبيق يحسب الدرجة، ويحدد المهارات الضعيفة، ويحوّل كل غلطة لبطاقة في دفتر الأخطاء، ويجهّز رسالة واتساب لولي الأمر.',
      ],
      bullets: [
        'QR على الورقة المطبوعة يفتح التصحيح بالورقة جاهزة.',
        'درجة فورية + مهارات ضعيفة، مش رقم بس.',
        'كل غلطة بتدخل دفتر الأخطاء وتتجدول للمراجعة.',
        'رسالة نتيجة جاهزة للواتساب بضغطة.',
      ],
      steps: [
        { title: 'اطبع الورقة', text: 'من بنك الأسئلة، اضغط «اطبع ورقة» — الورقة فيها اسم الطالب والتاريخ والدرجة وكود وQR.' },
        { title: 'افتح التصحيح', text: 'امسح الـQR أو اكتب الكود، أو افتح صفحة «صحّح ورقة» واختار الورقة من القائمة.' },
        { title: 'دوس على الإجابات', text: 'اختار الاختيار اللي الطالب كتبه لكل سؤال، واضغط «صحّح». النتيجة والمهارات والرسالة بتظهر فورًا.' },
      ],
      audience:
        'لولي الأمر اللي بيطبع ورقة كل أسبوع، وللمدرس اللي بيصحح ورق الفصل، ولأي حد عايز يحوّل ورقة ورقية لبيانات بدون كاميرا وبدون تصحيح يدوي.',
      faq: [
        { q: 'هل محتاج كاميرا أو إنترنت؟', a: 'لا. بتدوس على الإجابات بإيدك. الورقة والتصحيح شغالين على الجهاز.' },
        { q: 'الورقة القديمة اللي طبعتها قبل كده؟', a: 'أي ورقة اتحفظت في التطبيق ليها كود ثابت؛ اكتبه في صفحة التصحيح أو افتح اللينك اللي فيه الكود.' },
      ],
    },
    en: {
      title: 'Mark the paper with a tap — no camera',
      description:
        'Open the printed sheet code or QR, tap the answers your child wrote, and get the score, weak skills and a ready WhatsApp result.',
      eyebrow: 'Marking papers',
      h1: 'Thirty sheets should not take thirty minutes',
      lead:
        'Every sheet you print from Jessica carries a code and a QR. Photograph it, open the marking page, tap the answers the child wrote — the result appears in a second.',
      problem: [
        'Marking a handwritten sheet by hand is slow, and it collapses into right or wrong without showing the weak skill behind the miss.',
        'Worse, the score is forgotten and the same mistake returns on the next sheet.',
      ],
      solution: [
        'Every printed sheet is saved with a short code and a QR. The code opens the marking page with the sheet already selected — no typing, no searching.',
        'Tap the option the child wrote, and the app calculates the score, names the weak skills, files every miss in the mistakes notebook and prepares a WhatsApp result.',
      ],
      bullets: [
        'A QR on the printed sheet opens marking with the paper ready.',
        'An instant score plus weak skills, not just a number.',
        'Every miss enters the mistakes notebook and is scheduled.',
        'A parent-ready result message in one tap.',
      ],
      steps: [
        { title: 'Print the sheet', text: 'In the question bank, press print. The A4 sheet carries the student name, date, score line, code and QR.' },
        { title: 'Open marking', text: 'Scan the QR, type the code, or open the marking page and pick the sheet.' },
        { title: 'Tap the answers', text: 'Choose what the student wrote for each question and mark. The score, skills and message appear immediately.' },
      ],
      audience:
        'For the parent printing a weekly sheet, the teacher marking a class set, and anyone turning paper into data without a camera or manual marking.',
      faq: [
        { q: 'Do I need a camera or internet?', a: 'No. You tap the answers yourself, and the sheet and marking work on the device.' },
        { q: 'What about an older printed sheet?', a: 'Every sheet saved in the app keeps its code. Type it on the marking page or open the link that carries it.' },
      ],
    },
  },
  {
    slug: 'monthly-report',
    emoji: '🗓️',
    color: '#f5b544',
    appPath: '#/report-month',
    related: ['grade-paper', 'mistakes-review', 'class-mode'],
    ar: {
      title: 'تقرير الشهر — ٤ أسابيع في صفحة PDF',
      description:
        'دقايق المذاكرة، أضعف المهارات، الأخطاء المستحقة، الامتحانات، ومقارنة الأشقاء — تقرير A4 جاهز للطباعة أو للمدرسة.',
      eyebrow: 'تقرير الشهر',
      h1: 'بدل «ذاكرت كتير»، ورقة بتقول بالظبط إيه اللي حصل',
      lead:
        'تقرير الشهر بيجمع آخر ٢٨ يوم في صفحة واحدة: دقايق، أسابيع، مواد، مهارات، أخطاء، امتحانات، وتوصيات — جاهز للطباعة أو حفظه PDF.',
      problem: [
        'السؤال «ابنك بيعمل إيه في المذاكرة؟» بيتجاوب بإحساس، مش بأرقام. الأسبوع بيعدّي، ومحدش عارف هل التحسن حصل ولا لأ.',
        'ولما المدرسة أو ولي الأمر يطلب تقرير، بيتعمل من الذاكرة أو من رسايل متفرقة.',
      ],
      solution: [
        'كل نشاط في جيسيكا بيتسجل على الجهاز: دقايق، XP، مواد، مهارات، أخطاء، امتحانات. تقرير الشهر بيحوّل ده لصفحة A4 واحدة فيها أربع أسابيع وأضعف ٦ مهارات وحالة دفتر الأخطاء.',
        'وبيقارن الأشقاء على نفس الجهاز، ويقترح ٣ خطوات للشهر الجاي، وفي الآخر خط توقيع ولي الأمر — جاهز للطباعة أو للمدرسة.',
      ],
      bullets: [
        '٤ أسابيع بأعمدة ومقارنة بين نصفي الشهر.',
        'أضعف المهارات اللي تحت ٨٠٪ بس، مش كل حاجة.',
        'حالة المراجعة: مستحق الآن، مجدول، متقن.',
        'مقارنة الأشقاء وتوصيات مبنية على البيانات.',
      ],
      steps: [
        { title: 'افتح التقرير', text: 'من «تقرير الشهر» في القايمة أو من صفحة تقرير الأسبوع. كل الأرقام بتتحسب من جهازك.' },
        { title: 'راجع النظرة العامة', text: 'شوف الدقايق والأسابيع وأضعف المهارات والأخطاء والامتحانات في صفحة واحدة.' },
        { title: 'اطبع أو احفظ PDF', text: 'اضغط «اطبع / احفظ PDF» واختار الطابعة أو حفظ كـPDF. الورقة A4 نضيفة بدون عناصر التطبيق.' },
      ],
      audience:
        'لولي الأمر اللي عايز يعرف الحقيقة بالأرقام، وللمدرس اللي بيطلب تقرير شهري، ولأي أسرة عندها أكتر من طفل على نفس الجهاز.',
      faq: [
        { q: 'الأرقام بتتحسب من إيه؟', a: 'من نشاط التطبيق على الجهاز: الدقايق وXP والمواد والمهارات والأخطاء والامتحانات. مفيش تتبع خارجي ولا سيرفر.' },
        { q: 'هل التقرير بيتأثر لو الطفل غيّر الجهاز؟', a: 'أيوه، التقرير محلي. لو غيّر الجهاز أو مسح بيانات المتصفح، الأرقام بتبدأ من جديد.' },
      ],
    },
    en: {
      title: 'Monthly report — four weeks on one PDF page',
      description:
        'Minutes, weakest skills, due mistakes, exams and sibling comparison — an A4 report ready to print or hand to the school.',
      eyebrow: 'Monthly report',
      h1: 'Instead of “studied a lot”, a page that says exactly what happened',
      lead:
        'The monthly report gathers the last 28 days on one page: minutes, weeks, subjects, skills, mistakes, exams and recommendations — ready to print or save as PDF.',
      problem: [
        '“How is your child doing?” is answered by feeling, not numbers. Weeks pass and nobody knows whether anything improved.',
        'When the school asks for a report, it is rebuilt from memory or scattered messages.',
      ],
      solution: [
        'Every activity in Jessica is recorded on the device: minutes, XP, subjects, skills, mistakes, exams. The monthly report turns that into one A4 page with four weeks, the six weakest skills and the review state.',
        'It also compares siblings on the same device, suggests three next steps, and leaves a parent signature line — ready to print or send to school.',
      ],
      bullets: [
        'Four weekly bars with a first-half vs second-half comparison.',
        'Only skills under 80% appear in the weak table.',
        'Mistake review state: due now, scheduled, mastered.',
        'Sibling comparison and data-driven recommendations.',
      ],
      steps: [
        { title: 'Open the report', text: 'From the menu or the weekly report page. Every number is calculated on your device.' },
        { title: 'Read the overview', text: 'Minutes, weeks, weakest skills, mistakes and exams on one page.' },
        { title: 'Print or save PDF', text: 'Press print / save PDF and choose a printer or PDF. The A4 sheet has no app chrome.' },
      ],
      audience:
        'For the parent who wants the truth in numbers, the teacher asking for a monthly report, and any family with more than one child on the same device.',
      faq: [
        { q: 'Where do the numbers come from?', a: 'From activity in the app on this device: minutes, XP, subjects, skills, mistakes and exams. No external tracking and no server.' },
        { q: 'What if the child changes device?', a: 'The report is local. On a new device or after clearing browser data, the numbers start again.' },
      ],
    },
  },
  {
    slug: 'mistakes-review',
    emoji: '🎯',
    color: '#ff7a7a',
    appPath: '#/mistakes',
    related: ['school-exam', 'monthly-report', 'grade-paper'],
    ar: {
      title: 'الأخطاء بترجع في وقتها — مش بتتنسى',
      description:
        'كل سؤال غلط بيرجع بعد ٣ أيام، أسبوع، ٢١ يوم، ٤٥ يوم. الإجابة الصح بتبعد الخطوة، والغلط بيرجّعه بكرة.',
      eyebrow: 'المراجعة المتباعدة',
      h1: 'دفتر الأخطاء مش أرشيف — ده مدرس بيسألك تاني',
      lead:
        'جيسيكا مش بتسجّل الغلطة وخلاص. بتجدولها ترجع في اللحظة اللي هتنساها فيها، وتفضل ترجع لحد ما تتقنها.',
      problem: [
        'معظم الطلبة بيعملوا دفتر أخطاء وبيقرأوه مرة واحدة. بعد أسبوع، نفس السؤال بيتغلط تاني لأن القراءة مش تذكّر.',
        'والمراجعة العشوائية بتضيّع الوقت على الحاجات اللي اتقنتها وتسيب اللي محتاج مراجعة.',
      ],
      solution: [
        'كل سؤال غلط بيتسجل بجدول: ٣ أيام → أسبوع → ٢١ يوم → ٤٥ يوم → متقن. الإجابة الصح بتقدّم خطوة، والغلط بيرجّعه بكرة.',
        'الدفتر بيعرض «مستحق الآن» و«ترجع بعد كام يوم»، وخطة اليوم بتحط المراجعة المستحقة قبل أي حاجة جديدة.',
      ],
      bullets: [
        'جدول واضح: ٣ / ٧ / ٢١ / ٤٥ يوم.',
        'الغلط الجديد بيرجّع السؤال من أول وجديد.',
        '«مستحق الآن» في الدفتر وخطة اليوم.',
        'المهارة اللي بتتقنها بتخرج من قائمة الضعف.',
      ],
      steps: [
        { title: 'جاوب', text: 'أي تدريب أو امتحان في بنك الأسئلة. الغلط بيتسجل تلقائيًا.' },
        { title: 'راجع المستحق', text: 'افتح دفتر الأخطاء أو خطة اليوم، واضغط «راجع المستحق».' },
        { title: 'راقب التقدم', text: 'شوف السؤال بيتنقل من «مستحق» لـ«مجدول» لـ«متقن» مع كل إجابة صح.' },
      ],
      audience:
        'لأي طالب بيكرر نفس الغلط، ولولي الأمر اللي عايز يشوف الدفتر بيقصر فعلًا مع الوقت، وللمدرس اللي بيدرّب فصل على مهارة واحدة.',
      faq: [
        { q: 'هل كل غلطة بترجع؟', a: 'أيوه، كل غلطة في بنك الأسئلة أو الامتحانات. الغلطة في تدريب عادي بتقرّب ميعاد المراجعة بدل ما تتجاهل.' },
        { q: 'هل بنسى السؤال لو أجبت صح؟', a: 'لا، بيتنقل لخطوة أبعد. بعد ٤ إجابات صح متتالية بيتعلّم «متقن» ويخرج من قائمة المراجعة.' },
      ],
    },
    en: {
      title: 'Mistakes come back on time — not forgotten',
      description:
        'Every missed question returns after 3 days, a week, 21 days, 45 days. A right answer moves it out; a miss brings it back tomorrow.',
      eyebrow: 'Spaced repetition',
      h1: 'The mistakes notebook is not an archive — it is a tutor asking again',
      lead:
        'Jessica does not just record the miss. It schedules the question for the moment you would forget it, and keeps bringing it back until it is mastered.',
      problem: [
        'Most students keep a mistakes notebook and read it once. A week later the same question is wrong again, because reading is not recall.',
        'Random revision also wastes time on mastered topics and skips the ones that need work.',
      ],
      solution: [
        'Every missed question gets a schedule: 3 days → a week → 21 days → 45 days → mastered. A right answer moves it forward; a miss sends it back to tomorrow.',
        'The notebook shows “due now” and “back in N days”, and the daily plan puts due review before anything new.',
      ],
      bullets: [
        'A clear schedule: 3 / 7 / 21 / 45 days.',
        'A fresh miss resets the question to the start.',
        '“Due now” appears in the notebook and the daily plan.',
        'A skill leaves the weak list as it is mastered.',
      ],
      steps: [
        { title: 'Answer', text: 'Any drill or exam in the question bank. A miss is saved automatically.' },
        { title: 'Review what is due', text: 'Open the notebook or the daily plan and press review due.' },
        { title: 'Watch it move', text: 'The question moves from due to scheduled to mastered with each correct answer.' },
      ],
      audience:
        'For any student repeating the same mistake, the parent who wants to see the notebook actually shrink, and the teacher drilling a class on one skill.',
      faq: [
        { q: 'Does every mistake return?', a: 'Yes, every miss in the question bank or exams. A miss in an ordinary drill pulls the review date closer instead of being ignored.' },
        { q: 'Does a right answer remove it?', a: 'No, it moves one step out. After four correct answers it is marked mastered and leaves the review queue.' },
      ],
    },
  },
  {
    slug: 'egyptian-voice',
    emoji: '🗣️',
    color: '#a78bfa',
    appPath: '#/settings',
    related: ['offline', 'kids', 'school-exam'],
    ar: {
      title: 'صوت مصري حقيقي — وبنت، زي جيسيكا',
      description:
        'التطبيق بيختار صوت مصري أنثوي من مكتبة Gemini (ar-EG)، وبيفضّل الأصوات النسائية على الجهاز. ولو النص فيه رياضيات، بيقراها كلام.',
      eyebrow: 'الصوت',
      h1: 'صوت مش روبوت — وبنت، لأن التطبيق اسمه جيسيكا',
      lead:
        'أغلب التطبيقات بتقرأ العربي بصوت فصحى جاف. جيسيكا بتدور على صوت مصري أنثوي حقيقي، ولو الجهاز مفيهوش، بتجيبه من مكتبة Gemini بمفتاحك.',
      problem: [
        'الموبايلات واللابتوبات غالبًا فيها صوت عربي واحد أو اتنين، وغالبًا فصحى. النتيجة إن أي قراءة بالعربي بتبقى بطيئة ورسمية، والطفل بيفصل.',
        'ولو التطبيق بعت النص العربي لصوت إنجليزي بالغلط، الصوت بيطلع مش مفهوم أصلًا.',
      ],
      solution: [
        'جيسيكا بتكتشف العربي من النص نفسه، وبتستخدم صوت مصري لو موجود. ولو مش موجود، بتطلب من مكتبة Gemini صوت ar-EG أنثوي وتختاره تلقائيًا وتحفظه.',
        'ولو مفيش مفتاح أو النت قطع، بترجع لصوت الجهاز — وبتفضّل الأصوات النسائية زي Mariam على Majed، وSamantha على Daniel.',
      ],
      bullets: [
        'طلب صوت ar-EG + Egyptian + female من مكتبة Gemini.',
        'اكتشاف العربي تلقائيًا حتى لو المستدعي قال English.',
        'تفضيل الأصوات النسائية على الجهاز.',
        'الرياضيات بتتقرا كلام: ٢ + ٢ = ٤ → «اتنين زائد اتنين يساوي أربعة».',
      ],
      steps: [
        { title: 'اختار الصوت', text: 'الإعدادات → الصوت واللهجة → «صوت Gemini المصري». لو مفيش مفتاح، ضيفه الأول.' },
        { title: 'حمّل الأصوات', text: 'اضغط «حمّل الأصوات المصرية». التطبيق بيجيب الأصوات الأنثوية ويعرضها بالاسم.' },
        { title: 'اسمع', text: 'اضغط «جرّب الصوت»، أو استخدم «اسمع بالمصري» جنب أي نص عربي في القارئ أو دفتر الأخطاء.' },
      ],
      audience:
        'للطالب اللي بيتعلم بالسمع، ولولي الأمر اللي عايز قراءة مفهومة مش فصحى جافة، ولأي حد بيستخدم التطبيق مع طفل صغير.',
      faq: [
        { q: 'هل الصوت شغال من غير إنترنت؟', a: 'صوت الجهاز شغال أوفلاين. الصوت المصري من Gemini محتاج إنترنت ومفتاح، ولو فشل التطبيق بيرجع لصوت الجهاز.' },
        { q: 'هل بيقرأ أي حاجة؟', a: 'أي نص عربي في التطبيق: صفحة من الكتاب، شرح، سؤال، أو ملخص. وفي الإعدادات بتختار السرعة.' },
      ],
    },
    en: {
      title: 'A real Egyptian voice — female, like Jessica',
      description:
        'The app picks a female Egyptian voice from Gemini’s library (ar-EG) and prefers female device voices. Maths is read as words, not symbols.',
      eyebrow: 'The voice',
      h1: 'Not a robot — and female, because the app is Jessica',
      lead:
        'Most apps read Arabic in stiff formal MSA. Jessica looks for a real female Egyptian voice, and if the device has none, it brings one from Gemini with your key.',
      problem: [
        'Phones and laptops usually ship one or two Arabic voices, often MSA. Reading becomes slow and formal, and a child tunes out.',
        'If the app sends Arabic text to an English voice by mistake, the result is not even intelligible.',
      ],
      solution: [
        'Jessica detects Arabic from the text itself and uses an Egyptian voice when one exists. If not, it asks Gemini’s library for an ar-EG female voice, selects it and remembers it.',
        'Without a key or a connection it falls back to the device voice, preferring female names such as Mariam over Majed and Samantha over Daniel.',
      ],
      bullets: [
        'Requests ar-EG + Egyptian + female from Gemini’s library.',
        'Detects Arabic automatically even when a caller says English.',
        'Prefers female device voices.',
        'Reads maths as words: 2 + 2 = 4 becomes “two plus two equals four”.',
      ],
      steps: [
        { title: 'Pick the voice', text: 'Settings → voice → Gemini Egyptian voice. Add a key first if needed.' },
        { title: 'Load the voices', text: 'Press load Egyptian voices. The app fetches female voices and shows them by name.' },
        { title: 'Listen', text: 'Press test the voice, or “listen in Egyptian” beside any Arabic text in the reader or mistakes notebook.' },
      ],
      audience:
        'For the student who learns by listening, the parent who wants understandable Arabic instead of stiff MSA, and anyone using the app with a young child.',
      faq: [
        { q: 'Does it work offline?', a: 'The device voice works offline. The Gemini Egyptian voice needs internet and a key; if it fails, the app falls back to the device voice.' },
        { q: 'What can it read?', a: 'Any Arabic text in the app: a book page, an explanation, a question or a summary. Speed is set in Settings.' },
      ],
    },
  },
  {
    slug: 'offline',
    emoji: '📴',
    color: '#34d399',
    appPath: '#/install',
    related: ['egyptian-voice', 'kids', 'mistakes-review'],
    ar: {
      title: 'بدون إنترنت — التطبيق كله في جيبك',
      description:
        'بعد أول تحميل، الكتب وبنك الأسئلة والبطاقات والامتحانات بتشتغل أوفلاين. مفيش حساب ومفيش سيرفر.',
      eyebrow: 'أوفلاين',
      h1: 'النت قطع؟ المذاكرة مش لازم تقف',
      lead:
        'جيسيكا بتشتغل من غير إنترنت بعد أول تحميل: الكتب المحفوظة، بنك الأسئلة، البطاقات، ورق الامتحانات، والتصحيح. مفيش حساب ومفيش سيرفر بيقف في النص.',
      problem: [
        'معظم منصات المذاكرة بتفتح صفحة بيضاء أول ما النت يضعف، أو بتطلب تسجيل دخول كل مرة.',
        'والطفل اللي بيذاكر في الأتوبيس أو عند الجدّة مش لازم يكون معاه نت عشان يفتح كتابه.',
      ],
      solution: [
        'أول مرة تنزّل الكتاب وتستورده، جيسيكا بتخزّنه على الجهاز (IndexedDB). بعد كده القراءة والبحث وبنك الأسئلة والبطاقات كلها محلية.',
        'التطبيق نفسه PWA: بتثبّته على الشاشة الرئيسية، وبيقفل النت ويشتغل. ميزات الذكاء الاصطناعي بس هي اللي محتاجة اتصال ومفتاح.',
      ],
      bullets: [
        'كتبك محفوظة على الجهاز، مش على سيرفر.',
        'بنك الأسئلة والامتحانات والبطاقات شغالين أوفلاين.',
        'تثبيت على أندرويد وآيفون والكمبيوتر.',
        'مفيش حساب، مفيش تتبع، ومفيش بيانات بتطلع.',
      ],
      steps: [
        { title: 'ثبّت التطبيق', text: 'من المتصفح: «إضافة إلى الشاشة الرئيسية» على الآيفون، أو «تثبيت التطبيق» على أندرويد وChrome.' },
        { title: 'استورد كتاب', text: 'نزّل كتاب الوزارة مرة، واستورده. الكتاب بيتخزن على الجهاز.' },
        { title: 'اقفل النت', text: 'افتح التطبيق واشتغل عادي: قراءة، تدريب، بطاقات، وتصحيح.' },
      ],
      audience:
        'للطلبة اللي بيذاكروا في مواصلات أو أماكن نتها ضعيف، وللأسر اللي عايزة تطبيق يشتغل من غير اشتراك نت شهري، ولأي حد قلقان على خصوصية بياناته.',
      faq: [
        { q: 'هل كل حاجة شغالة أوفلاين؟', a: 'الكتب المستوردة، بنك الأسئلة، البطاقات، الامتحانات المحفوظة، والتصحيح — أوفلاين. الذكاء الاصطناعي وقراءة صفحات جديدة محتاجين نت.' },
        { q: 'هل بيفضل شغال بعد ما أقفل التطبيق؟', a: 'أيوه، لأن الملفات محفوظة على الجهاز ومحمية بـService Worker. بيفضل شغال لحد ما تمسح بيانات الموقع.' },
      ],
    },
    en: {
      title: 'No internet — the whole app in your pocket',
      description:
        'After the first download, books, the question bank, flashcards and exams work offline. No account and no server.',
      eyebrow: 'Offline',
      h1: 'The connection dropped? Studying does not have to',
      lead:
        'Jessica works without internet after the first load: saved books, the question bank, flashcards, exam papers and marking. No account and no server in the middle.',
      problem: [
        'Most study platforms show a blank page the moment the network weakens, or ask you to sign in again.',
        'A child studying on a bus or at a relative’s house should not need a connection to open a book.',
      ],
      solution: [
        'The first time you download and import a book, Jessica stores it on the device in IndexedDB. After that, reading, search, the question bank and flashcards are local.',
        'The app is a PWA: install it on the home screen and it opens with the network off. Only the AI features need a connection and a key.',
      ],
      bullets: [
        'Your books live on the device, not on a server.',
        'The question bank, exams and flashcards work offline.',
        'Install on Android, iPhone and desktop.',
        'No account, no tracking, no data leaving the device.',
      ],
      steps: [
        { title: 'Install', text: 'From the browser: add to home screen on iPhone, or install app on Android and Chrome.' },
        { title: 'Import a book', text: 'Download a ministry book once and import it. It is stored on the device.' },
        { title: 'Turn off the network', text: 'Open the app and work: reading, drills, flashcards and marking.' },
      ],
      audience:
        'For students studying on transport or with weak internet, families who do not want another monthly data bill, and anyone careful about their data.',
      faq: [
        { q: 'Is everything offline?', a: 'Imported books, the question bank, flashcards, saved exams and marking. AI and reading a brand-new page need a connection.' },
        { q: 'Does it stay after closing?', a: 'Yes. Files are stored on the device and cached by the service worker until you clear site data.' },
      ],
    },
  },
  {
    slug: 'class-mode',
    emoji: '🏫',
    color: '#38bdf8',
    appPath: '#/teacher',
    related: ['grade-paper', 'monthly-report', 'offline'],
    ar: {
      title: 'وضع الفصل — ورقة واحدة لـ٣٠ طالب',
      description:
        'المدرس يبني ورقة من وحدة في الكتاب، يطلع QR/لينك، الطلبة يحلّوا، وكل طالب يرجّع كود نتيجة — والتقرير يتجمع في ثانية.',
      eyebrow: 'وضع الفصل',
      h1: 'وزّع ورقة واحدة… واستلم تقرير الفصل',
      lead:
        'بدون سيرفر وبدون حسابات: المدرس يبني الواجب من وحدة الكتاب، يطلّع QR، الطلبة يحلّوا على موبايلاتهم، وكل واحد يرجّع كود قصير — والتقرير بيتجمع على جهاز المدرس.',
      problem: [
        'المدرس بيفقد وقت كبير في تجهيز ورقة، تصويرها، تصحيحها، وتحويل الدرجات لجدول.',
        'والنتيجة بتوصل متأخرة، وبتكون أرقام من غير ما تعرف مين ضعيف في إيه.',
      ],
      solution: [
        'من صفحة «وضع الفصل» المدرس يختار وحدة من الكتاب، والتطبيق يبني ورقة، ويطلع QR ولينك للطلبة. الطالب يفتح، يكتب اسمه، يحل، ويستلم كود نتيجة قصير.',
        'المدرس يلصق الأكواد، والتطبيق يبني تقرير الفصل: درجة كل طالب، متوسط الفصل، وأسئلة الفصل الضعيفة — كله على جهازه، بدون سيرفر.',
      ],
      bullets: [
        'ورقة واحدة تتوزّع QR أو لينك على الفصل.',
        'كل طالب يرجّع كود نتيجة من غير حساب.',
        'تقرير الفصل: درجات، متوسط، وأضعف سؤال.',
        'مفيش سيرفر — البيانات بتفضل مع المدرس.',
      ],
      steps: [
        { title: 'ابنِ الواجب', text: 'اختار الكتاب والوحدة وعدد الأسئلة. التطبيق يستخدم بنك الوحدة أو يولّد أسئلة منها.' },
        { title: 'وزّع', text: 'المدرس يعرض QR على السبورة أو يبعت اللينك. الطلبة يحلّوا بوقت.' },
        { title: 'اجمع', text: 'كل طالب يبعت كود نتيجته. المدرس يلصق الأكواد ويشوف تقرير الفصل كامل.' },
      ],
      audience:
        'للمدرس الخصوصي اللي عايز يختبر ٣٠ طالب في دقيقة، ولمدرس الفصل اللي بيصحح يدويًا، ولأي مدرسة عايزة تقارير من غير نظام مدفوع.',
      faq: [
        { q: 'هل الطلبة محتاجين حساب؟', a: 'لا. بيفتحوا اللينك أو QR، يكتبوا الاسم، يحلّوا، وياخدوا كود. مفيش تسجيل ومفيش بريد.' },
        { q: 'هل النتايج بتترفع على سيرفر؟', a: 'لا. النتايج بتتنقل كأكواد يلصقها المدرس على جهازه. مفيش سيرفر ولا قاعدة بيانات مركزية.' },
      ],
    },
    en: {
      title: 'Class mode — one paper for thirty students',
      description:
        'Build a paper from a book unit, share a QR/link, students solve it, each returns a result code — and the class report builds in a second.',
      eyebrow: 'Class mode',
      h1: 'Hand out one paper… receive the class report',
      lead:
        'No server and no accounts: the teacher builds the assignment from a book unit, shares a QR, students solve on their phones, each returns a short code — and the report builds on the teacher’s device.',
      problem: [
        'A teacher loses hours preparing a sheet, printing it, marking it and turning scores into a table.',
        'The result arrives late, and it is numbers without knowing who is weak at what.',
      ],
      solution: [
        'In class mode the teacher picks a book unit; the app builds a paper and shows a QR and a link. A student opens it, types a name, solves, and gets a short result code.',
        'The teacher pastes the codes and the app builds the class report: each score, the class average and the weakest questions — all on the teacher’s device, no server.',
      ],
      bullets: [
        'One paper shared as a QR or link.',
        'Each student returns a result code, no account.',
        'Class report: scores, average, weakest question.',
        'No server — the data stays with the teacher.',
      ],
      steps: [
        { title: 'Build it', text: 'Pick the book, unit and question count. The app uses the unit bank or generates from it.' },
        { title: 'Share it', text: 'Show the QR on the board or send the link. Students solve with a timer.' },
        { title: 'Collect it', text: 'Each student sends a result code. The teacher pastes them and sees the full class report.' },
      ],
      audience:
        'For the tutor testing thirty students in a minute, the class teacher marking by hand, and any school that wants reports without a paid system.',
      faq: [
        { q: 'Do students need an account?', a: 'No. They open the link or QR, type a name, solve and get a code. No sign-up and no email.' },
        { q: 'Are results uploaded?', a: 'No. Results travel as codes the teacher pastes on their device. No server and no central database.' },
      ],
    },
  },
  {
    slug: 'kids',
    emoji: '🧸',
    color: '#f472b6',
    appPath: '#/kids',
    related: ['offline', 'egyptian-voice', 'monthly-report'],
    ar: {
      title: 'عالم الأطفال — مذاكرة شكل لعبة',
      description:
        'لأولاد ابتدائي: دروس ٥ دقايق، نجوم وستيكرز، تحدّي أسبوعي، وشاشة ملهاش علاقة بإعدادات الكبار.',
      eyebrow: 'عالم الأطفال',
      h1: 'الطفل بيلعب… وهو بيتعلم فعلًا',
      lead:
        'من أولى لتالتة ابتدائي، جيسيكا بتفتح عالم مختلف: دروس قصيرة، نجوم، ستيكرز، وتحدّي أسبوعي — بدون تعقيد إعدادات الكبار.',
      problem: [
        'شاشة المذاكرة العادية مزدحمة: إعدادات، مفاتيح، تقارير، ومصطلحات. الطفل الصغير بيتوه قبل ما يبدأ.',
        'ولو الدرس طويل، الانتباه بيخلص في دقيقتين، والمذاكرة بتتحول لصراع.',
      ],
      solution: [
        'عالم الأطفال فيه شاشة واحدة بسيطة: درس ٥ دقايق، ١٠ أسئلة، ونجوم على كل إجابة. كل ما يخلص تحدي، بياخد ستيكر.',
        'التحدّي الأسبوعي: ٣ أوراق → ١٥ نجمة + ستيكر. وكل ده محسوب في بوابة الأهل وتقرير الشهر بدون ما الطفل يشوف أرقام معقدة.',
      ],
      bullets: [
        'دروس قصيرة على قد انتباه الطفل.',
        'نجوم وستيكرز واحتفالات صغيرة.',
        'تحدّي أسبوعي بثلاث أوراق.',
        'بوابة أهل منفصلة وإعدادات مبسطة.',
      ],
      steps: [
        { title: 'افتح عالم الأطفال', text: 'الطفل بيدخل من شاشته الخاصة، من غير ما يشوف إعدادات الكبار.' },
        { title: 'العب واتعلم', text: 'درس ٥ دقايق، ١٠ أسئلة، نجوم على كل إجابة صح.' },
        { title: 'اجمع', text: 'ستيكرز وشارات، وتحدّي أسبوعي بثلاث أوراق.' },
      ],
      audience:
        'لأولياء أمور الأطفال من أولى لتالتة ابتدائي، وللمدرسين اللي بيدرّبوا الصغيرين، ولأي حد عايز مذاكرة من غير صراع يومي.',
      faq: [
        { q: 'هل فيه إعلانات أو مشتريات؟', a: 'لا. مفيش إعلانات ولا مشتريات داخل التطبيق، والنجوم والستيكرز مجانية.' },
        { q: 'هل بيانات الطفل بتطلع من الجهاز؟', a: 'لا. كل حاجة محلية على الجهاز، وبوابة الأهل محمية برقم سري.' },
      ],
    },
    en: {
      title: 'Kids world — studying that feels like play',
      description:
        'For primary children: five-minute lessons, stars and stickers, a weekly challenge, and a screen free of adult settings.',
      eyebrow: 'Kids world',
      h1: 'The child plays… and actually learns',
      lead:
        'From Primary 1 to 3, Jessica opens a different world: short lessons, stars, stickers and a weekly challenge — without adult settings getting in the way.',
      problem: [
        'The normal study screen is crowded: settings, keys, reports and jargon. A young child gets lost before starting.',
        'A long lesson loses attention in two minutes, and study becomes a daily fight.',
      ],
      solution: [
        'The kids world is one simple screen: a five-minute lesson, ten questions, and stars for every correct answer. Finish a challenge and earn a sticker.',
        'The weekly challenge: three papers → fifteen stars and a sticker. It all feeds the parent zone and the monthly report without showing the child complicated numbers.',
      ],
      bullets: [
        'Short lessons sized to a child’s attention.',
        'Stars, stickers and small celebrations.',
        'A weekly challenge of three papers.',
        'A separate parent zone and simple settings.',
      ],
      steps: [
        { title: 'Open the kids world', text: 'The child enters from their own screen, away from adult settings.' },
        { title: 'Play and learn', text: 'A five-minute lesson, ten questions, stars for every correct answer.' },
        { title: 'Collect', text: 'Stickers and badges, plus the weekly three-paper challenge.' },
      ],
      audience:
        'For parents of Primary 1–3 children, teachers drilling younger classes, and anyone who wants study without a daily fight.',
      faq: [
        { q: 'Are there ads or purchases?', a: 'No ads and no in-app purchases. Stars and stickers are free.' },
        { q: 'Does the child’s data leave the device?', a: 'No. Everything is local, and the parent zone is protected by a PIN.' },
      ],
    },
  },
]
