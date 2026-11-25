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
    slug: 'virtual-labs',
    emoji: '🧪',
    color: '#21e6c9',
    appPath: '#/labs',
    related: ['kids', 'flashcards', 'school-exam'],
    ar: {
      title: 'المعامل الافتراضية — ٣٩ تجربة من الصف ١ إلى ٩',
      description:
        '٣٩ معملاً افتراضياً في الرياضيات والعلوم والكيمياء والأحياء والعربي والإنجليزي: غيّر متغير، شوف النتيجة، وافهم السبب — بدون تحميل ولا إنترنت.',
      eyebrow: 'المعامل',
      h1: 'التجربة اللي المدرسة مش دايمًا بتقدر تعملها',
      lead:
        'المعمل في المدرسة بيعدّي في دقايق، والكتاب بيشرح التجربة بالكلام. جيسيكا بتحوّل الدرس لمعمل صغير على شاشتك: ٣٩ تجربة من الصف الأول للتاسع، بتشتغل أوفلاين وبتتقاس بأرقام حقيقية.',
      problem: [
        'مش كل مدرسة فيها معمل، واللي فيها بيدخله مرة في الترم. الطالب بيحفظ «الضغط = القوة ÷ المساحة» من غير ما يشوف حاجة بتغوص في الرمل، وبيحفظ «التماثل» من غير ما يلف محور بنفسه.',
        'الفيديوهات بتوري التجربة، لكن الطالب فيها متفرج. والشرح بالكلام بيخلّي المفاهيم المجردة تتنسى بعد الامتحان.',
      ],
      solution: [
        'كل معمل في جيسيكا مبني على نفس القاعدة: متغير واحد، نتيجة بتتغير قدامك، وقياس حقيقي. اسحب المسافة بين مغناطيسين وشوف القوة، غيّر زاوية الشمس وشوف الظل، أو اقلب بتات ثنائية وشوف الحرف بيتكوّن.',
        'كل معمل بيبدأ بهدف، وبيسألك تتوقّع النتيجة قبل ما تلمس أي حاجة، وبعد التجربة بيفسّر السبب — عشان الفهم يفضل بعد ما تقفل التطبيق. وكل ده SVG وCSS جوه التطبيق، مفيش فيديو ولا تحميل ولا حساب.',
      ],
      bullets: [
        '٣٩ معملاً من الصف ١ إلى ٩، متجمّعة حسب المادة والمرحلة.',
        'قياسات حية: نيوتن، باسكال، هيرتز، فولت، pH، نبضات القلب.',
        'تحدي صغير في كل معمل: ظل ٢٫٥ متر، راسب، رافعة متوازنة، أو كود الحرف A.',
        'فلترة بالمادة والمرحلة وبحث، والمعامل اللي تخص صفك بتظهر الأول.',
        'كل معمل بيدي XP وبيشتغل بدون إنترنت.',
      ],
      steps: [
        { title: 'اختار معملك', text: 'افتح «المعامل»، فلتر بالمادة أو المرحلة، أو دوّر باسم التجربة.' },
        { title: 'توقّع قبل ما تجرّب', text: 'اقرأ الهدف وأجب على سؤال التوقّع. الإجابة مش شرط تكون صح عشان تكمّل، لكنها بتخليك تشوف الفرق بعد التجربة.' },
        { title: 'جرّب واشرح', text: 'حرّك المتغير، شوف القياس، حقّق التحدي، وبعدها اقرأ الشرح وارجع للمدرسة وأنت فاهم.' },
      ],
      audience:
        'للطالب اللي عايز يشوف العلم بدل ما يحفظه، ولولي الأمر اللي عايز يشرح لابنه من غير أدوات، وللمدرس اللي محتاج تجربة سريعة على السبورة.',
      faq: [
        { q: 'هل المعامل محتاجة إنترنت؟', a: 'لأ. كلها SVG وCSS جوه التطبيق، وبتشتغل أوفلاين بعد أول تحميل.' },
        { q: 'هل بتغني عن معمل المدرسة؟', a: 'لأ، دي طريقة تفهم بيها الفكرة وتجرّبها بأمان. المعمل الحقيقي يفضل أهم للتجارب اللي محتاجة مواد وأجهزة.' },
        { q: 'مين المناسب لها؟', a: 'من الصف الأول الابتدائي للتاسع الإعدادي، وكل معمل مكتوب عليه الصفوف المناسبة له.' },
      ],
    },
    en: {
      title: 'Virtual labs — 39 simulations from grade 1 to grade 9',
      description:
        '39 hands-on simulations across maths, science, chemistry, biology, Arabic and English. Change a variable, watch the result and understand why — offline.',
      eyebrow: 'Virtual labs',
      h1: 'The experiment your school cannot always run',
      lead:
        'A school lab is over in minutes, and the book explains the experiment in words. Jessica turns the lesson into a small lab on your screen: 39 simulations from grade 1 to 9, offline, with real measurements.',
      problem: [
        'Not every school has a lab, and the ones that do use it once a term. A student memorises “pressure = force ÷ area” without ever seeing something sink into sand, and memorises symmetry without turning a mirror line by hand.',
        'Videos show the experiment, but the student is only watching. Words alone let abstract ideas fade after the exam.',
      ],
      solution: [
        'Every lab follows the same rule: one variable, a result that changes in front of you, and a real measurement. Drag two magnets apart and watch the force, change the sun angle and watch the shadow, or flip bits and watch a letter appear.',
        'Each lab starts with a goal, asks you to predict before you touch anything, then explains why after the experiment — so the idea stays after you close the app. Everything is SVG and CSS inside the app: no video, no download, no account.',
      ],
      bullets: [
        '39 labs from grade 1 to 9, grouped by subject and stage.',
        'Live readings: newtons, pascals, hertz, volts, pH, heart rate.',
        'A small challenge in every lab: a 2.5 m shadow, a precipitate, a balanced lever, the code for A.',
        'Filter by subject and stage, search, and the labs for your grade come first.',
        'Every lab awards XP and works without internet.',
      ],
      steps: [
        { title: 'Pick a lab', text: 'Open Labs, filter by subject or stage, or search for the experiment by name.' },
        { title: 'Predict first', text: 'Read the goal and answer the prediction. You do not have to be right to continue, but it makes the difference visible afterwards.' },
        { title: 'Experiment and explain', text: 'Move the variable, read the measurement, clear the challenge, then read the explanation and go back to school understanding it.' },
      ],
      audience:
        'For the student who wants to see science instead of memorising it, the parent explaining without equipment, and the teacher who needs a quick experiment at the board.',
      faq: [
        { q: 'Do the labs need internet?', a: 'No. They are SVG and CSS inside the app and work offline after the first load.' },
        { q: 'Do they replace the school lab?', a: 'No. They help you understand the idea and try it safely. A real lab is still better for experiments that need materials and equipment.' },
        { q: 'Who are they for?', a: 'Grades 1 to 9, and every lab states the grades it fits.' },
      ],
    },
  },
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

  {
    slug: 'camera-solver',
    emoji: '📷',
    color: '#fb923c',
    appPath: '#/solve',
    related: ['school-exam', 'flashcards', 'offline'],
    ar: {
      title: 'حل الواجب بالكاميرا — خطوات مش إجابة جاهزة',
      description:
        'صوّر السؤال، وجيسيكا تقرأه، تشرح الخطوات، وتديك سؤال شبيه للتدريب — بمفتاحك، ومن غير ما ترفع الصورة لسيرفرنا.',
      eyebrow: 'الكاميرا',
      h1: 'صوّر السؤال… وافهمه، مش تنسخه',
      lead:
        'تطبيقات كتير بتديك الإجابة النهائية وخلاص. جيسيكا بتقرأ السؤال من الصورة، تشرح كل خطوة، وبعدها تديك سؤال شبيه عشان تتأكد إنك فهمت.',
      problem: [
        'الطالب بيصوّر الواجب وبياخد الإجابة، وبيحس إنه خلّص. في الامتحان بيقف لأن مفيش صورة ينسخ منها ولا خطوات يفهمها.',
        'وبعض الحلول بتقرأ الصورة غلط، خصوصًا مع خط الإيد أو الرموز الرياضية، وبتدي إجابة لسؤال تاني.',
      ],
      solution: [
        'صفحة «حل بالكاميرا» بتصوّر السؤال أو تختار صورة من الجهاز. التطبيق يقرأ النص، ويعرضه لك تراجعه وتصححه قبل ما يتحل.',
        'بعد كده جيسيكا تشرح خطوة بخطوة، وتربط الحل بالقاعدة، وتولّد سؤال شبيه للتدريب، وتحفظ الشرح في الخزنة لو حبيت.',
      ],
      bullets: [
        'خطوات كاملة مع سبب كل خطوة، مش رقم نهائي.',
        'سؤال شبيه عشان تتأكد إن الفهم حصل.',
        'مراجعة النص اللي اتقرأ قبل الحل.',
        'الصورة بتروح لمزود الذكاء الاصطناعي بمفتاحك، مفيش سيرفر لجيسيكا.',
      ],
      steps: [
        { title: 'صوّر', text: 'افتح «حل بالكاميرا»، صوّر السؤال أو اختار صورة من المعرض.' },
        { title: 'راجع النص', text: 'التطبيق يعرض اللي اتقرأ. صحّح أي كلمة أو رمز قبل الحل.' },
        { title: 'افهم واتدرب', text: 'اقرأ الخطوات، وبعدها حل السؤال الشبيه بنفسك.' },
      ],
      audience:
        'للطالب اللي بيوقف عند سؤال مش فاهمه، ولولي الأمر اللي عايز يشرح لابنه بدل ما يديله إجابة، ولأي حد بيذاكر من كتاب مش موجود في التطبيق.',
      faq: [
        { q: 'هل محتاج مفتاح؟', a: 'أيوه، الكاميرا والشرح بيستخدموا مزود الذكاء الاصطناعي بمفتاحك. التطبيق نفسه مجاني ومفتوح.' },
        { q: 'هل الصورة بتترفع على سيرفركم؟', a: 'لا. مفيش سيرفر لجيسيكا. الصورة بتروح للمزود اللي انت اخترته بمفتاحك، وبنفس شروطه.' },
      ],
    },
    en: {
      title: 'Camera solver — steps, not a copied answer',
      description:
        'Photograph the question, Jessica reads it, explains every step and gives a similar question to practise — with your key and no upload to our server.',
      eyebrow: 'Camera',
      h1: 'Photograph the question… and understand it',
      lead:
        'Many apps hand over the final answer. Jessica reads the question from the photo, explains each step, then gives a similar question to prove you understood.',
      problem: [
        'A student photographs homework, copies the answer and feels done. In the exam there is no photo to copy and no steps to follow.',
        'Some solvers also misread handwriting or maths symbols and answer a different question.',
      ],
      solution: [
        'The camera page takes a photo or a gallery image. The app reads the text and shows it so you can correct a word or symbol before solving.',
        'Jessica then explains step by step, ties the solution to the rule, generates a similar question and can save the explanation to the vault.',
      ],
      bullets: [
        'Full steps with a reason for each, not just a number.',
        'A similar question to confirm understanding.',
        'Review the recognised text before solving.',
        'The image goes to your AI provider with your key; no Jessica server.',
      ],
      steps: [
        { title: 'Photograph', text: 'Open the camera solver, take a photo or pick one from the gallery.' },
        { title: 'Check the text', text: 'The app shows what it read. Fix any word or symbol before solving.' },
        { title: 'Understand and practise', text: 'Read the steps, then solve the similar question yourself.' },
      ],
      audience:
        'For the student stuck on a question, the parent who wants to explain instead of handing over an answer, and anyone studying from a book that is not in the app.',
      faq: [
        { q: 'Do I need a key?', a: 'Yes, the camera and explanation use your AI provider with your key. The app itself is free and open source.' },
        { q: 'Is the image uploaded to your server?', a: 'No. Jessica has no server. The image goes to the provider you chose with your key, under their terms.' },
      ],
    },
  },
  {
    slug: 'flashcards',
    emoji: '🃏',
    color: '#22d3ee',
    appPath: '#/study',
    related: ['mistakes-review', 'offline', 'monthly-report'],
    ar: {
      title: 'بطاقات المراجعة — تذكّر، مش تعيد القراءة',
      description:
        'بطاقات بتتباعد ذكي: كل بطاقة بترجع في الوقت اللي هتنساها فيه، مع مراجعة يومية ٥ دقايق.',
      eyebrow: 'البطاقات',
      h1: 'القراءة بتحسّسك إنك فاهم… البطاقة بتثبت',
      lead:
        'بدل ما تعيد قراءة نفس الصفحة ٥ مرات، حوّل النقطة لبطاقة. جيسيكا بتسألك في الوقت اللي هتنساها فيه، وتفضّل تسألك لحد ما تثبت.',
      problem: [
        'إعادة القراءة والتظليل بيدّيوا إحساسًا زائفًا بالإنجاز. بعد يومين مش فاكر حاجة، والوقت كله راح على مراجعة عشوائية.',
        'والبطاقات الورقية بتتكدس، ومحدش عارف يبدأ بإيه ولا إمتى.',
      ],
      solution: [
        'كل بطاقة ليها جدول تباعد: تبدأ قريبة، وبعد كل إجابة صح بتبعد. الإجابة الغلط بترجّعها بكرة.',
        'تقدر تعمل بطاقة من خطأ في دفتر الأخطاء، أو من صفحة في كتابك، أو من شرح في الخزنة. والمراجعة المستحقة بتظهر في خطة اليوم.',
      ],
      bullets: [
        'تباعد ذكي بدل مراجعة عشوائية.',
        'بطاقات من الأخطاء والكتب والشرح.',
        'مراجعة يومية قصيرة (٥ دقايق).',
        'شغالة أوفلاين بعد أول تحميل.',
      ],
      steps: [
        { title: 'أنشئ البطاقة', text: 'من خطأ في الدفتر أو من صفحة في الكتاب، حوّلها لبطاقة بسؤال وجواب.' },
        { title: 'راجع المستحق', text: 'افتح مراجعة اليوم، أو ابدأ من خطة اليوم. البطاقات المستحقة بس هي اللي بتظهر.' },
        { title: 'قيّم نفسك', text: 'صح / غلط، والجدول بيتظبط تلقائيًا. البطاقة اللي بتتقنها بتبعد.' },
      ],
      audience:
        'للطالب اللي بيعيد القراءة من غير نتيجة، ولولي الأمر اللي عايز مراجعة قصيرة يومية، ولأي حد عنده امتحان قريب وعايز يثبت المعلومات.',
      faq: [
        { q: 'البطاقات من الكتاب إزاي؟', a: 'من صفحة في القارئ أو من شرح في الخزنة، اضغط «أضف بطاقة». التطبيق يحفظ السؤال والجواب.' },
        { q: 'هل بتشتغل أوفلاين؟', a: 'أيوه، البطاقات والجدول محفوظين على الجهاز، والمراجعة شغالة بدون نت.' },
      ],
    },
    en: {
      title: 'Flashcards — recall, not rereading',
      description:
        'Cards on a spaced schedule: each one returns when you would forget it, with a five-minute daily review.',
      eyebrow: 'Flashcards',
      h1: 'Rereading feels like learning… a card proves it',
      lead:
        'Instead of reading the same page five times, turn the point into a card. Jessica asks at the moment you would forget, and keeps asking until it sticks.',
      problem: [
        'Rereading and highlighting give a false sense of progress. Two days later nothing is left, and the time went into random revision.',
        'Paper cards pile up, and nobody knows what to review first or when.',
      ],
      solution: [
        'Every card gets a spaced schedule: close at first, further after each correct answer, back tomorrow after a miss.',
        'Create a card from a mistake in the notebook, a page in your book, or an explanation in the vault. Due cards appear in the daily plan.',
      ],
      bullets: [
        'Spaced scheduling instead of random revision.',
        'Cards from mistakes, books and explanations.',
        'A short daily review (five minutes).',
        'Works offline after the first load.',
      ],
      steps: [
        { title: 'Create a card', text: 'From a mistake in the notebook or a book page, turn it into a question and answer.' },
        { title: 'Review what is due', text: 'Open today’s review or the daily plan. Only due cards appear.' },
        { title: 'Grade yourself', text: 'Right or wrong, and the schedule adjusts. A mastered card moves further out.' },
      ],
      audience:
        'For the student rereading without results, the parent who wants a short daily review, and anyone close to an exam who needs the facts to stick.',
      faq: [
        { q: 'How do cards come from a book?', a: 'From a page in the reader or an explanation in the vault, press add card. The app stores the question and answer.' },
        { q: 'Do they work offline?', a: 'Yes. Cards and the schedule live on the device, and review works without a connection.' },
      ],
    },
  },
  {
    slug: 'profiles',
    emoji: '👧',
    color: '#c084fc',
    appPath: '#/profiles',
    related: ['monthly-report', 'kids', 'offline'],
    ar: {
      title: 'أكتر من طفل على نفس الجهاز — كل واحد لوحده',
      description:
        'ملف مستقل لكل طفل: تقدمه، مهاراته، أخطاؤه، كتبه وإعداداته. بدّل في ثانية، والجهاز واحد.',
      eyebrow: 'ملفات الأطفال',
      h1: 'جهاز واحد… ومفيش طفل بياخد إنجاز التاني',
      lead:
        'لو أكتر من طفل بيستخدموا نفس الموبايل، كل واحد محتاج ملفه: XP وسلسلة ومهارات وأخطاء وكتب خاصة بيه. التبديل في ثانية، والبيانات كلها على الجهاز.',
      problem: [
        'لما طفلين يستخدموا نفس الحساب، سلسلة واحد بتخلط مع التاني، والأخطاء بتتجمّع، والتقرير بيبقى مش مفهوم.',
        'والأسوأ إن الطفل الصغير بيشوف إعدادات الكبار وتقارير مش بتاعته.',
      ],
      solution: [
        'كل ملف بيحفظ نسخة من حالة التطبيق: الاسم، الصف، XP، السلسلة، المهارات، الأخطاء، الكتب، والإعدادات. التبديل بيغيّر الحالة كلها مرة واحدة.',
        'تقرير الشهر بيقارن الأشقاء على نفس الجهاز، وبوابة الأهل بتشوف كل طفل لوحده. والكتب تقدر تكون مشتركة أو لكل طفل.',
      ],
      bullets: [
        'ملف مستقل لكل طفل (XP، سلسلة، مهارات، أخطاء).',
        'تبديل فوري من شاشة الملفات.',
        'مقارنة الأشقاء في تقرير الشهر.',
        'كل البيانات محلية، بدون حساب أو سيرفر.',
      ],
      steps: [
        { title: 'أنشئ ملف', text: 'من «الملفات»، اضغط «إضافة طفل»، اكتب الاسم واختار الصف.' },
        { title: 'بدّل', text: 'اختار الطفل من القائمة، والتطبيق يفتح على حالته هو.' },
        { title: 'قارن', text: 'افتح تقرير الشهر عشان تشوف كل طفل ومقارنة الأشقاء.' },
      ],
      audience:
        'لأي أسرة عندها أكتر من طفل على نفس الموبايل أو التابلت، ولولي الأمر اللي عايز تقرير لكل طفل لوحده، وللمدرس اللي بيستخدم جهاز واحد لأكتر من طالب.',
      faq: [
        { q: 'هل الكتب بتتكرر؟', a: 'الكتب مشتركة على الجهاز عشان مساحة التخزين، لكن التقدم والمهارات والأخطاء لكل طفل لوحده.' },
        { q: 'هل البيانات بتختلط لما أبدّل؟', a: 'لا. كل ملف بيتحفظ قبل التبديل، والحالة الجديدة بتتحمّل بالكامل.' },
      ],
    },
    en: {
      title: 'More than one child on one device — kept apart',
      description:
        'A separate profile for each child: progress, skills, mistakes, books and settings. Switch in a second on the same device.',
      eyebrow: 'Child profiles',
      h1: 'One device… and no child inherits another’s progress',
      lead:
        'When more than one child uses the same phone, each needs a profile: XP, streak, skills, mistakes and books. Switching takes a second, and the data stays on the device.',
      problem: [
        'Two children on one account mix streaks, pile up each other’s mistakes, and make every report meaningless.',
        'A younger child also sees adult settings and reports that are not theirs.',
      ],
      solution: [
        'Each profile saves a snapshot of the app state: name, grade, XP, streak, skills, mistakes, books and settings. Switching swaps the whole state at once.',
        'The monthly report compares siblings on the same device, the parent zone sees each child separately, and books can be shared or per child.',
      ],
      bullets: [
        'A separate profile per child (XP, streak, skills, mistakes).',
        'Instant switching from the profiles screen.',
        'Sibling comparison in the monthly report.',
        'All data local, with no account or server.',
      ],
      steps: [
        { title: 'Create a profile', text: 'On the profiles screen, add a child, type a name and pick a grade.' },
        { title: 'Switch', text: 'Pick the child from the list and the app opens on their state.' },
        { title: 'Compare', text: 'Open the monthly report to see each child and the sibling comparison.' },
      ],
      audience:
        'For any family with more than one child on a phone or tablet, the parent who wants a separate report per child, and the tutor using one device for several students.',
      faq: [
        { q: 'Are books duplicated?', a: 'Books are shared on the device to save storage; progress, skills and mistakes are per child.' },
        { q: 'Does switching mix data?', a: 'No. The current profile is saved before switching, and the new state is loaded completely.' },
      ],
    },
  },
  {
    slug: 'certificates',
    emoji: '🏅',
    color: '#facc15',
    appPath: '#/certificate',
    related: ['monthly-report', 'kids', 'class-mode'],
    ar: {
      title: 'شهادة إنجاز — تتطبع وتتعلّق على الحيطة',
      description:
        'شهادة A4 باسم الطفل ومستواه وسلسلته، جاهزة للطباعة أو PDF — تحفيز حقيقي مش نجمة على الشاشة.',
      eyebrow: 'الشهادة',
      h1: 'النجمة على الشاشة بتتنسى… الورقة على الحيطة لأ',
      lead:
        'في آخر شهر أو ترم، جيسيكا بتطلّع شهادة A4 باسم الطفل ومستواه وسلسلته، جاهزة للطباعة أو حفظها PDF. حاجة ملموسة يفتخر بيها.',
      problem: [
        'الشارات الرقمية بتبهت بسرعة. الطفل بياخد نجمة، بيقفل التطبيق، ومفيش حاجة ملموسة تفضل.',
        'وفي نهاية الترم، المدرسة والأهل محتاجين حاجة تتطبع وتتحط في الملف أو على الحيطة.',
      ],
      solution: [
        'صفحة الشهادة بتجمع اسم الطالب، الصف، المستوى، السلسلة، وتاريخ الإنجاز في تصميم A4 نضيف.',
        'بتضغط «اطبع» وبتطلع ورقة جاهزة، أو «حفظ PDF» وتبعتها للمدرسة أو الجروب. وفي آخرها مساحة لتوقيع ولي الأمر.',
      ],
      bullets: [
        'A4 باسم الطفل ومستواه وسلسلته.',
        'طباعة أو حفظ PDF بضغطة.',
        'تصميم نضيف بدون عناصر التطبيق.',
        'مساحة لتوقيع ولي الأمر.',
      ],
      steps: [
        { title: 'افتح الشهادة', text: 'من القايمة، افتح «الشهادة». كل البيانات بتتجمع من ملف الطفل.' },
        { title: 'راجع', text: 'شوف الاسم والصف والمستوى والسلسلة، وعدّل الاسم من الإعدادات لو محتاج.' },
        { title: 'اطبع', text: 'اضغط «اطبع» للطابعة، أو «حفظ PDF» وابعت الملف.' },
      ],
      audience:
        'لولي الأمر اللي عايز يحفّز طفله بحاجة ملموسة، وللمدرس اللي بيكرّم طلبة الفصل، ولأي حد بيجمع إنجازات الترم في ملف.',
      faq: [
        { q: 'هل فيها بيانات حقيقية؟', a: 'أيوه، من ملف الطفل على الجهاز: الاسم، الصف، XP، المستوى والسلسلة. بتتحدّث مع أي تغيير.' },
        { q: 'هل تنفع لكل الصفوف؟', a: 'أيوه، من الأول الابتدائي للتالت الإعدادي، وبنفس التصميم.' },
      ],
    },
    en: {
      title: 'Certificate — print it and put it on the wall',
      description:
        'An A4 certificate with the child’s name, level and streak, ready to print or save as PDF — real motivation, not a star on a screen.',
      eyebrow: 'Certificate',
      h1: 'A star on a screen is forgotten… paper on the wall is not',
      lead:
        'At the end of a month or term, Jessica produces an A4 certificate with the child’s name, level and streak, ready to print or save as PDF. Something tangible to be proud of.',
      problem: [
        'Digital badges fade quickly. A child earns a star, closes the app, and nothing physical remains.',
        'At the end of term, schools and parents need something to print for a file or a wall.',
      ],
      solution: [
        'The certificate page gathers the student name, grade, level, streak and date into a clean A4 design.',
        'Press print for a ready sheet, or save PDF to send to school or the family group. A parent signature line sits at the bottom.',
      ],
      bullets: [
        'A4 with the child’s name, level and streak.',
        'Print or save PDF in one press.',
        'A clean design with no app chrome.',
        'A parent signature line.',
      ],
      steps: [
        { title: 'Open it', text: 'From the menu, open the certificate. Everything comes from the child’s profile.' },
        { title: 'Review', text: 'Check the name, grade, level and streak; edit the name in Settings if needed.' },
        { title: 'Print', text: 'Press print for a printer, or save PDF and send the file.' },
      ],
      audience:
        'For the parent who wants tangible motivation, the teacher rewarding a class, and anyone collecting the term’s achievements in a file.',
      faq: [
        { q: 'Does it use real data?', a: 'Yes, from the child’s profile on the device: name, grade, XP, level and streak. It updates with any change.' },
        { q: 'Does it work for every grade?', a: 'Yes, from Primary 1 to Preparatory 3, with the same design.' },
      ],
    },
  },
]

import { NEW_FEATURES } from './features-new-data.mjs'
FEATURES.push(...NEW_FEATURES)
