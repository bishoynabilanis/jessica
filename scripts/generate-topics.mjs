import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://bishoynabilanis.github.io/jessica'
const OUT = 'public/welcome/topics'

/**
 * Topic pages: each one targets a distinct search intent that the grade, quiz,
 * guide and install pages do not cover. Written in Egyptian Arabic, practical,
 * and linked back to the app without keyword cannibalisation.
 */
const TOPICS = [
  {
    slug: 'study-plan',
    emoji: '🗓️',
    card: 'جدول مذاكرة',
    title: 'جدول مذاكرة يومي وأسبوعي جاهز للطلاب — طريقة تبنيه في ١٠ دقايق',
    h1: 'جدول مذاكرة جاهز: إزاي تبني جدول يومي وأسبوعي في ١٠ دقايق',
    description:
      'طريقة عملية لبناء جدول مذاكرة واقعي للطلاب المصريين: كم ساعة، إزاي تقسم اليوم، إزاي تتعامل مع الأيام اللي مذاكرتش فيها، وجدول جاهز للمرحلة الابتدائية والإعدادية.',
    keyword: 'جدول مذاكرة',
    minutes: 6,
    intro:
      'أغلب جداول المذاكرة بتفشل لأنها مكتوبة على مزاج يوم واحد مش على مزاج الأسبوع كله. الجدول اللي بيفضل شغال هو اللي بيتكتب في ١٠ دقايق، وفيه وقت للفشل، وبيتقاس بعدد الأيام اللي كملت فيها مش بعدد الساعات. الطريقة دي مبنية على طلبة بيذاكروا فعلًا في ظروف عادية.',
    sections: [
      {
        h: '١) ابدأ بجدول المدرسة، مش بجدول المذاكرة',
        p: [
          'اكتب مواعيد المدرسة والدروس والرياضة والنوم الأول. اليوم اللي فيه ٧ ساعات مدرسة مش زي يوم الجمعة. لو بدأت بـ«هذاكر ٤ ساعات يوميًا» قبل ما تشوف اليوم، الجدول هيتكسر في أول أسبوع.',
          'بعد ما الحدود تتحدد، هتلاقي فاضي بين ساعة ونص و٣ ساعات في أيام المدرسة، و٣–٤ ساعات في الأجازة. دي المساحة الحقيقية اللي هتبني عليها.',
        ],
      },
      {
        h: '٢) ٣ بلوكات في اليوم أفضل من ٦ ساعات متصلة',
        p: [
          'قسم الوقت الفاضي لبلوكات ٢٥–٤٠ دقيقة، بينهم ٥–١٠ دقايق راحة بدون موبايل (تشرب مية، تمشي، تبص من الشباك). البلوك الأول بعد المدرسة بساعة — قبل الغدا الثقيل وقبل ما الدماغ تقفل.',
          'لو عندك ٣ ساعات فاضية، مش معناه ٣ ساعات مذاكرة. اكتب بلوكين مذاكرة وبلوك مراجعة قصير ١٥ دقيقة، وسيب الباقي احتياطي.',
        ],
      },
      {
        h: '٣) حدد المادة بالمهارة، مش بالمادة',
        p: [
          '«رياضيات» مش مهمة. «حل ١٠ مسائل على المعادلات» مهمة لها بداية ونهاية. الفرق إنك بتعرف خلصت ولا لأ، وده اللي بيمنع التسويف.',
          'قاعدة بسيطة: كل بلوك = مهمة واحدة قابلة للقياس + طريقة تصحيح. لو مش عارف هتصحح إزاي، يبقى المهمة ناقصة.',
        ],
      },
      {
        h: '٤) سيب يوم فاضي في الأسبوع',
        p: [
          'يوم واحد من غير مذاكرة جديدة، للمراجعة الخفيفة أو الراحة الكاملة. اليوم ده مش كسل — هو اللي بيخلي باقي الأسبوع يكمل. الطلبة اللي بيحاولوا يذاكروا ٧ أيام بينهاروا في اليوم التاسع.',
          'استخدم اليوم الفاضي في حاجة واحدة: راجع أخطاء الأسبوع. ٢٠ دقيقة بس.',
        ],
      },
      {
        h: '٥) قيّم الأسبوع بعدد الأيام، مش بعدد الساعات',
        p: [
          'آخر كل أسبوع اسأل سؤال واحد: كام يوم من ٧ نفّذت فيهم الجدول؟ لو ٤ أو أكتر، الجدول واقعي. لو أقل من ٣، صغّر الجدول — مش تكبّره.',
          'التعديل الطبيعي بعد أول أسبوع: قلل عدد البلوكات ٢٠٪ وزوّد وقت المراجعة. الجداول اللي بتنجح بتبدأ صغيرة وتكبر، مش العكس.',
        ],
      },
    ],
    faq: [
      ['كام ساعة مذاكرة في اليوم كفاية؟', 'ابتدائي: ٤٥ دقيقة لساعة ونص يوميًا. إعدادي: ساعتين لـ٣ ساعات في أيام المدرسة، وأكتر في الأجازة. المهم البلوكات المنفصلة والمراجعة، مش الرقم الكبير.'],
      ['أعمل إيه لو فوت يوم من الجدول؟', 'تكمل من اليوم اللي بعده، مش تعوّض اليوم اللي فات. التعويض بيكسر الجدول تاني، والمراجعة المتباعدة هتغطي الفرق.'],
      ['الجدول ينفع لولي الأمر ولا للطالب؟', 'الأفضل يكتبه الطالب بنفسه، وولي الأمر يراجع الأرقام بس. الجدول المفروض على الطالب بيتنفذ أقل من الجدول اللي هو شارك في كتابته.'],
    ],
    cta: 'ابني جدولك النهاردة، وخلي التطبيق ينفّذه معاك',
    related: ['homework', 'math', 'parents'],
  },
  {
    slug: 'homework',
    emoji: '📸',
    card: 'حل الواجب',
    title: 'حل الواجب بالكاميرا: إزاي تستخدم الذكاء الاصطناعي من غير ما تنقل الحل',
    h1: 'حل الواجب بالكاميرا: إزاي تستخدم الذكاء الاصطناعي من غير ما تنقل الحل',
    description:
      'طريقة آمنة للاستعانة بالذكاء الاصطناعي في الواجب: تصوّر السؤال، تفهم الخطوات، تحل سؤال شبيه بنفسك، وتتأكد إنك اتعلمت مش نقلت.',
    keyword: 'حل الواجب',
    minutes: 5,
    intro:
      'الذكاء الاصطناعي بقى بيساعد في الواجب، والسؤال الحقيقي مش «نستخدمه ولا لأ» — السؤال إزاي نستخدمه بشكل يخلي الطالب يفهم بدل ما ينقل. الفرق بين الاتنين مش في التطبيق، هو في الخطوة اللي بعد ما تظهر الإجابة.',
    sections: [
      {
        h: '١) صوّر السؤال، متصوّرش الصفحة كلها',
        p: [
          'صورة واضحة لسؤال واحد بتدّي شرح أدق من صورة الصفحة كاملة. لو السؤال فيه رسم أو جدول، صوّره في نص الصورة وبإضاءة كويسة.',
          'قبل ما تصوّر، حاول تكتب اللي فهمته من السؤال بكلامك. لو مش قادر، المشكلة في فهم السؤال مش في الحل.',
        ],
      },
      {
        h: '٢) اطلب الخطوات، مش الإجابة',
        p: [
          'الطلب الصح: «اشرح خطوات الحل وليه كل خطوة». الطلب الغلط: «إيه الإجابة؟». الأول بيبني مهارة، والتاني بيخلص الواجب ويضيّع الامتحان.',
          'لو الشرح طويل، اطلب تلخيص القاعدة في سطر واحد + مثال صغير. القاعدة هي اللي هتفضل معاك بعد أسبوع.',
        ],
      },
      {
        h: '٣) اقفل الحل، وحل سؤال شبيه بنفسك',
        p: [
          'ده الاختبار الحقيقي: خد سؤال شبيه، اقفل الحل، وحله لوحدك على ورقة. لو وقفت في خطوة، ارجع للشرح بتاعها بس.',
          'التطبيق بيولّد سؤال شبيه على نفس المهارة — استخدمه بدل ما تعيد قراءة الحل ٣ مرات.',
        ],
      },
      {
        h: '٤) سجّل الغلطة، مش الحل',
        p: [
          'دفتر أخطاء واحد فيه: السؤال، الغلطة، والقاعدة الصح. قبل أي امتحان راجع الدفتر مش الكتاب — ده أسرع مراجعة ممكنة.',
          'لو غلطت في نفس نوع السؤال مرتين، ده مش إهمال — ده مهارة ناقصة محتاجة شرح من الأول.',
        ],
      },
    ],
    faq: [
      ['هل استخدام الذكاء الاصطناعي في الواجب غش؟', 'لو بتنقل الإجابة وتسلّمها، أيوه. لو بتفهم الخطوات وتحل سؤال شبيه بنفسك، ده استخدام زي الكتاب الإضافي بالظبط. المدرسة بتقيّم اللي انت عارفه في الامتحان.'],
      ['الشرح طلع غلط، أعمل إيه؟', 'راجع مع الكتاب أو المدرس. أي أداة ذكاء اصطناعي ممكن تغلط، والمسؤولية على المستخدم إنه يراجع. التطبيق بيشجعك ترجع للكتاب الرسمي.'],
      ['ينفع أصوّر سؤال إنجليزي أو رسم؟', 'أيوه، بس اكتب في الصورة اللي عايزه: شرح القاعدة، ترجمة الجملة، أو حل الرسم خطوة بخطوة.'],
    ],
    cta: 'صوّر أول سؤال، وخلّي التطبيق يشرحلك الخطوات',
    related: ['study-plan', 'math', 'parents'],
  },
  {
    slug: 'parents',
    emoji: '👨‍👩‍👦',
    card: 'دليل ولي الأمر',
    title: 'دليل ولي الأمر: إزاي تساعد ابنك يذاكر من غير مشاكل يومية',
    h1: 'دليل ولي الأمر: إزاي تساعد ابنك يذاكر من غير مشاكل يومية',
    description:
      'دليل عملي لولي الأمر المصري: إزاي تتابع من غير ما تضغط، إزاي تعرف إن ابنك بيذاكر فعلًا، وإزاي تتعامل مع الموبايل والدرجات والامتحانات.',
    keyword: 'مساعدة الأبناء في المذاكرة',
    minutes: 7,
    intro:
      'أغلب الخلافات اليومية حول المذاكرة مش بسبب الكسل — هي بسبب إن الطالب وولي الأمر بيتكلموا عن حاجتين مختلفتين: واحد بيتكلم عن المجهود، والتاني عن النتيجة. الدليل ده بيحوّل النقاش من «ذاكر» لـ«إيه اللي محتاجين نعرفه النهاردة».',
    sections: [
      {
        h: '١) اسأل عن المهمة، مش عن الوقت',
        p: [
          '«ذاكرت كام ساعة؟» بيخلّي الطالب يقعد قدام الكتاب من غير ما يشتغل. «خلصت إيه النهاردة؟» بيخليه يجاوب بمهمة، وده اللي بيتقاس.',
          'لو الإجابة «مش فاكر»، يبقى محتاج مراجعة مش محاضرة. اسأله يشرحلك حاجة واحدة فهمها — لو قدر، يبقى ذاكر فعلًا.',
        ],
      },
      {
        h: '٢) ثبّت وقت واحد في اليوم',
        p: [
          'وقت ثابت (مثلًا بعد المغرب ٤٥ دقيقة) أفضل من ساعتين في يوم ومفيش حاجة باقي الأسبوع. الروتين بيقلل المفاوضات اليومية.',
          'وقت الموبايل يتحدد في نفس الجدول، مش كعقاب أو مكافأة كل يوم. اللي بيتغير كل يوم بيخلق صراع كل يوم.',
        ],
      },
      {
        h: '٣) الدرجة مش تشخيص',
        p: [
          'درجة قليلة في امتحان معناها غالبًا مهارة واحدة ناقصة، مش إن الطالب «مش بيحب المادة». اطلب من المدرس أو من التطبيق يحدد المهارة دي، وراجعها لوحدها.',
          'قارن الطالب بنفسه الشهر اللي فات، مش بابن الجيران. المقارنة الخارجية بتقلل المحاولة، والمحاولة هي اللي بتجيب الدرجات.',
        ],
      },
      {
        h: '٤) خلي الموبايل أداة، مش ساحة معركة',
        p: [
          'بدل المنع الكامل، حدد أماكن وأوقات: الموبايل في غرفة تانية وقت المذاكرة العميقة، ومسموح في الراحة. المنع المفتوح بيخلق استخدام مخفي.',
          'لو الموبايل بيستخدم في حل الواجب، اطلب قاعدة واحدة: بعد الحل، يحل سؤال شبيه لوحده. ده الفرق بين أداة تعليم وأداة تسلية.',
        ],
      },
      {
        h: '٥) راجع أسبوعيًا في ١٠ دقايق',
        p: [
          'اجتماع قصير كل أسبوع: إيه اللي خلص، إيه اللي اتأخر، وإيه المطلوب الأسبوع الجاي. بدون تقييم للأشخاص — تقييم للخطة.',
          'لو الخطة اتأخرت ٣ أسابيع ورا بعض، المشكلة في الخطة مش في الطالب. صغّرها.',
        ],
      },
    ],
    faq: [
      ['ابني بيكدب ويقول ذاكر وهو مش بيذاكر — أعمل إيه؟', 'غيّر طريقة السؤال بدل ما تشك. اطلب منه يشرح ٣ جمل عن اللي قرأه، أو يحل ٥ أسئلة قدامك. الشرح بيكشف الحقيقة بدون اتهام.'],
      ['أمنع الموبايل خالص؟', 'المنع الكامل بيشتغل مع الأطفال الصغيرين لفترة، ومع الإعدادي غالبًا بيخلق استخدام مخفي. الأفضل وقت وأماكن واضحة، وأداة تعليمية بدل ألعاب.'],
      [' كام ساعة مراجعة قبل الامتحان؟', 'آخر أسبوع: ٣–٤ ساعات موزعة على ٥ أيام أفضل من ١٢ ساعة في يومين. المراجعة القصيرة المتكررة أقوى من الجلسة الطويلة.'],
      ['التطبيق بيساعدني كولي أمر إزاي؟', 'فيه بوابة ولي أمر محمية بوقت استخدام محدد وتقرير أسبوعي: وقت المذاكرة ونقاط القوة والضعف. مفيش حساب ولا بيانات بتطلع من الجهاز.'],
    ],
    cta: 'افتح بوابة ولي الأمر وشوف تقرير الأسبوع',
    related: ['study-plan', 'exam-anxiety', 'homework'],
  },
  {
    slug: 'math',
    emoji: '➗',
    card: 'مذاكرة الرياضيات',
    title: 'إزاي تذاكر رياضيات صح: من الحفظ للتطبيق في ٥ خطوات',
    h1: 'إزاي تذاكر رياضيات صح: من الحفظ للتطبيق في ٥ خطوات',
    description:
      'طريقة مذاكرة الرياضيات اللي بتنقل الدرجة: فهم القاعدة، حل أمثلة، حل بدون النظر، دفتر أخطاء، ومراجعة متباعدة — مع اختبار سريع مجاني.',
    keyword: 'ازاي اذاكر رياضيات',
    minutes: 6,
    intro:
      'الرياضيات المادة الوحيدة اللي الدرجة فيها بتقيس مهارة مش حفظ. عشان كده الطالب اللي بيفهم الشرح ويقعد ساعات بيتفاجئ بدرجة قليلة: هو قرأ الحل، ما حلّش. الفرق بين الاتنين مش ذكاء — هو تكرار التطبيق بدون مساعدة.',
    sections: [
      {
        h: '١) افهم القاعدة قبل المثال',
        p: [
          'كل درس رياضيات فيه فكرة واحدة جديدة والباقي تطبيقات عليها. لو قدرت تكتب الفكرة في سطر واحد بكلامك، يبقى فهمت. لو محتاج تقرأ المثال عشان تتذكر، يبقى لسه بتحفظ.',
          'سؤال سريع: ليه الخطوة دي موجودة؟ لو مفيش إجابة، ارجع للقاعدة مش للأمثلة.',
        ],
      },
      {
        h: '٢) حل المثال بإيدك، مش بعينك',
        p: [
          'قراءة الحل بتدّي إحساس كاذب بالفهم. غطي الحل، وحل المثال على ورقة، وبعدين قارن. أول مرة هتغلط — ده طبيعي وهو اللي بيثبّت.',
          'لو وقفت، بص على أول سطر بس، وبعدين كمّل لوحدك.',
        ],
      },
      {
        h: '٣) ٥ مسائل متنوعة مش ٢٥ مسألة متكررة',
        p: [
          'الخمسة يكونوا: مسألة مباشرة، مسألة معكوسة، مسألة فيها خطوتين، مسألة فيها كلام، ومسألة من امتحان. التنويع بيمنع الحفظ الأعمى للخطوات.',
          'التصحيح فوري. الغلطة اللي مش بتتصحح فورًا بتتحول لعادة.',
        ],
      },
      {
        h: '٤) دفتر أخطاء الرياضيات',
        p: [
          'لكل غلطة: السؤال، الخطوة الغلط، والسبب (نسيان شرط، إشارة، قانون). بعد أسبوع هتلاقي نمط متكرر — وده اللي بياخد درجاتك.',
          'قبل الامتحان راجع الدفتر مش الكتاب. ٢٠ دقيقة على الأخطاء بتساوي ساعتين على أسئلة جديدة.',
        ],
      },
      {
        h: '٥) قِس نفسك قبل ما تذاكر أكتر',
        p: [
          'اختبار قصير ١٠ أسئلة بيقولك مهارتك الحقيقية، وبعدها تذاكر اللي ناقص بس. المذاكرة بدون قياس بتخلّيك تعيد اللي بتعرفه.',
          'كرر القياس كل أسبوع، وقارن بالأسبوع اللي فات — مش بزميلك.',
        ],
      },
    ],
    faq: [
      ['أحفظ القوانين ولا أفهمها؟', 'افهمها الأول، وبعدين ثبّتها بحل مسائل. الحفظ لوحده بيشتغل في السؤال المباشر وبيفشل في أي سؤال فيه خطوة إضافية.'],
      ['كام مسألة أحل في اليوم؟', '٥–١٠ مسائل مركّزة على مهارة واحدة، مع تصحيح فوري، أفضل من ٣٠ مسألة بسرعة بدون مراجعة.'],
      ['الرياضيات صعبة عندي من سنين — ينفع ألحق؟', 'أيوه، بس ابدأ من المهارة الناقصة مش من أول المنهج. اختبار قصير بيحدد نقطة البداية في ٦٠ ثانية.'],
    ],
    cta: 'اعرف مستواك في الرياضيات في ٦٠ ثانية',
    related: ['study-plan', 'homework', 'exam-anxiety'],
  },
  {
    slug: 'exam-anxiety',
    emoji: '🧠',
    card: 'التوتر قبل الامتحان',
    title: 'التوتر قبل الامتحان: ٧ خطوات عملية تهدّي الأعصاب وتفرق في الدرجة',
    h1: 'التوتر قبل الامتحان: ٧ خطوات عملية تهدّي الأعصاب وتفرق في الدرجة',
    description:
      'خطة عملية للتعامل مع قلق الامتحان: تنظيم آخر أسبوع، تنفس قبل اللجنة، إدارة الوقت جوه الامتحان، وإيه اللي تعمله لو دماغك قفلت.',
    keyword: 'التوتر قبل الامتحان',
    minutes: 5,
    intro:
      'القلق مش عيب ومش دليل ضعف — هو جسم بيستعد. المشكلة لما يبقى القلق أكتر من الطاقة اللي بيدّيها. الحاجات اللي جاية بسيطة ومجرّبة، ومش محتاجة دكتور ولا أدوية، وبتشتغل مع الطالب قبل وأثناء الامتحان.',
    sections: [
      {
        h: '١) القلق بيزيد مع الوقت الفاضي',
        p: [
          'أكبر سبب للقلق قبل الامتحان هو الأيام اللي فيها وقت كتير ومهام غير محددة. حدد مهمة واحدة لكل بلوك، واكتبها. الدماغ بتهدى لما تعرف الخطوة الجاية.',
          'خد كل يوم مهمة واحدة صغيرة مضمونة (مراجعة درس، ٥ أسئلة). الإنجاز الصغير بيقلل القلق أكتر من الجلسة الطويلة.',
        ],
      },
      {
        h: '٢) نام قبل الامتحان، بجد',
        p: [
          'السهرة الأخيرة بتضيّع أكتر مما بتضيف: الذاكرة بتثبت أثناء النوم. ٧ ساعات نوم أفضل من ٣ ساعات مراجعة.',
          'لو مش قادر تنام، اقفل الشاشات قبل النوم بساعة، واكتب على ورقة «اللي لسه فاضل» — كتابة القائمة بتقلل التفكير المتكرر.',
        ],
      },
      {
        h: '٣) روتين ٦٠ ثانية قبل ما تدخل اللجنة',
        p: [
          'تنفس ٤ ثواني شهيق، ٤ حبس، ٦ زفير — ٥ مرات. ده بيقلل ضربات القلب وبيرجّع التركيز.',
          'بعدها جملة واحدة تقولها لنفسك: «هبدأ بأسهل سؤال». البداية السهلة بتكسر التجمد.',
        ],
      },
      {
        h: '٤) جوه الامتحان: اقرأ الورقة كلها الأول',
        p: [
          'دقيقتين تقرأ فيهم الأسئلة كلها وتبدأ بالأسهل. الترتيب بيوفر وقت وبيقلل الذعر لما تشوف سؤال صعب في النص.',
          'لو سؤال وقفك أكتر من ٣ دقايق، علّمه وكمّل. ارجعله في الآخر — العقل بيرجّع المعلومة لما يبعد عنها شوية.',
        ],
      },
      {
        h: '٥) لو الدماغ قفلت',
        p: [
          'اقفل عينك ١٠ ثواني، اتنفس، وابدأ من أول خطوة في السؤال مش من الإجابة. الخطوة الأولى بتفتح الباقي.',
          'لو لسه، اكتب أي حاجة تعرفها عن الموضوع. الكتابة بترجّع الترابط.',
        ],
      },
    ],
    faq: [
      ['القلق ده طبيعي ولا محتاج دكتور؟', 'القلق الخفيف طبيعي ومفيد. لو بيمنع النوم أو الأكل لأسابيع أو بيسبب نوبات هلع متكررة، استشير مختص — ده مش ضعف.'],
      ['أذاكر ولا أرتاح آخر يوم؟', 'مراجعة خفيفة (ساعتين كتير) + نوم بدري أفضل من مراجعة جديدة أو راحة كاملة قلق. الأفضل مراجعة دفتر الأخطاء والعناوين.'],
      ['الكلام ده للابتدائي كمان؟', 'أيوه، بس بشكل أبسط: وقت محدد، نوم كافي، وطمأنة من الأهل قبل الامتحان بدون ضغط على الدرجة.'],
    ],
    cta: 'مراجعة قصيرة هادية قبل الامتحان أحسن من سهرة',
    related: ['study-plan', 'parents', 'math'],
  },
]

const TOPIC_BY_SLUG = Object.fromEntries(TOPICS.map((topic) => [topic.slug, topic]))

/** Render a number with Arabic-Indic digits so the copy stays consistent. */
function ar(value) {
  return String(value).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)])
}

function head({ topic, ld }) {
  const url = `${BASE}/welcome/topics/${topic.slug}/`
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${topic.title} | Jessica</title>
<meta name="description" content="${topic.description}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="ar" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${topic.h1}">
<meta property="og:description" content="${topic.description}">
<meta property="og:image" content="${BASE}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${topic.h1}">
<meta name="twitter:description" content="${topic.description}">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../style.css">
<style>
  .article { max-width: 780px; margin: 0 auto; padding: 40px 0 60px; }
  .article .eyebrow { display: inline-flex; }
  .article h1 { font-size: clamp(27px, 4vw, 40px); line-height: 1.45; margin: 14px 0; }
  .article .meta { color: var(--muted); font-size: 12px; margin-bottom: 24px; }
  .article h2 { font-size: 21px; margin: 30px 0 10px; }
  .article p { color: var(--muted); line-height: 2.15; font-size: 15px; margin-bottom: 10px; }
  .lead { border-inline-start: 3px solid var(--mint); padding-inline-start: 14px; }
  .cta-box { margin-top: 32px; border: 1px solid rgba(46,230,197,.3); background: rgba(46,230,197,.07); border-radius: 18px; padding: 18px; text-align: center; }
  .cta-box p { color: var(--text); font-weight: 700; margin-bottom: 10px; }
  .faq { margin-top: 34px; }
  .faq details { border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; background: rgba(255,255,255,.03); margin-bottom: 8px; }
  .faq summary { cursor: pointer; font-weight: 700; font-size: 14px; }
  .faq p { margin-bottom: 0; }
  .rel-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .rel-grid a { border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700; color: var(--muted); }
  .rel-grid a:hover { color: var(--text); border-color: rgba(46,230,197,.35); }
  .back { display: inline-block; margin-top: 26px; color: var(--mint); font-size: 13px; font-weight: 700; }
</style>
<script type="application/ld+json">
${JSON.stringify(ld)}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../">افتح التطبيق</a></div></header>
<main><div class="wrap"><article class="article">
<span class="eyebrow">${topic.emoji} مواضيع المذاكرة</span>
<h1>${topic.h1}</h1>
<p class="meta">⏱️ ${ar(topic.minutes)} دقايق قراءة · آخر تحديث نوفمبر ٢٠٢٦</p>
<p class="lead">${topic.intro}</p>`
}

function page(topic) {
  const url = `${BASE}/welcome/topics/${topic.slug}/`
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.h1,
    description: topic.description,
    inLanguage: 'ar',
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Person', name: 'Bishoy Nabil' },
    publisher: { '@type': 'Organization', name: 'Jessica' },
    datePublished: '2026-11-13',
    dateModified: '2026-11-13',
    about: topic.keyword,
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: topic.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Jessica', item: `${BASE}/welcome/` },
      { '@type': 'ListItem', position: 2, name: 'مواضيع المذاكرة', item: `${BASE}/welcome/topics/` },
      { '@type': 'ListItem', position: 3, name: topic.card, item: url },
    ],
  }
  const body = topic.sections.map((section) => `<h2>${section.h}</h2>${section.p.map((text) => `<p>${text}</p>`).join('')}`).join('\n')
  const faq = topic.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')
  const related = topic.related
    .map((slug) => TOPIC_BY_SLUG[slug])
    .filter(Boolean)
    .map((item) => `<a href="../${item.slug}/">${item.emoji} ${item.card}</a>`)
    .join('')

  return `${head({ topic, ld })}
${body}
<div class="cta-box">
  <p>${topic.cta}</p>
  <p style="font-weight:400;font-size:13px">Jessica مجانية، بدون حساب، وبتشتغل على كتب الوزارة الرسمية.</p>
  <a class="btn" href="../../../">افتح Jessica ←</a>
  <a class="btn ghost" href="../../quiz/">⏱️ اختبار ٦٠ ثانية</a>
</div>
<div class="faq"><h2>أسئلة شائعة</h2>${faq}</div>
<h2>مواضيع قريبة</h2>
<div class="rel-grid">
  ${related}
  <a href="../../guides/">📘 أدلة المذاكرة</a>
  <a href="../../grades/">📚 كتب الوزارة</a>
  <a href="../../install/">📲 تثبيت التطبيق</a>
</div>
<a class="back" href="../">← كل مواضيع المذاكرة</a>
</article></div></main>
<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="../../">الرئيسية</a> · <a href="../">المواضيع</a> · <a href="../../grades/">كتب الوزارة</a> · <a href="../../">التطبيق</a></span></div></footer>
<script type="application/ld+json">
${JSON.stringify(faqLd)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumbLd)}
</script>
</body>
</html>
`
}

const hub = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>مواضيع المذاكرة: جدول مذاكرة، حل الواجب، الرياضيات، وقلق الامتحان | Jessica</title>
<meta name="description" content="مواضيع عملية للطلاب وأولياء الأمور في مصر: جدول مذاكرة واقعي، حل الواجب بالذكاء الاصطناعي بدون نقل، مذاكرة الرياضيات، قلق الامتحان، ودليل ولي الأمر.">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${BASE}/welcome/topics/">
<link rel="alternate" hreflang="ar" href="${BASE}/welcome/topics/">
<link rel="alternate" hreflang="x-default" href="${BASE}/welcome/topics/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jessica">
<meta property="og:locale" content="ar_EG">
<meta property="og:url" content="${BASE}/welcome/topics/">
<meta property="og:title" content="مواضيع المذاكرة — Jessica">
<meta property="og:description" content="خمسة مواضيع عملية: جدول مذاكرة، حل الواجب، الرياضيات، قلق الامتحان، ودليل ولي الأمر.">
<meta property="og:image" content="${BASE}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${BASE}/og.jpg">
<link rel="icon" href="../../icons/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../style.css">
<style>
  .topic-hero { padding: 46px 0 10px; text-align: center; }
  .topic-hero h1 { font-size: clamp(26px, 4vw, 40px); line-height: 1.45; margin: 12px 0; }
  .topic-hero p { color: var(--muted); font-size: 15px; line-height: 2; max-width: 640px; margin: 0 auto; }
  .topic-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin: 30px 0 50px; }
  .topic-card { display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--line); background: rgba(255,255,255,.03); border-radius: 20px; padding: 20px; }
  .topic-card:hover { border-color: rgba(46,230,197,.4); }
  .topic-card .emoji { font-size: 26px; }
  .topic-card strong { font-size: 17px; }
  .topic-card span { color: var(--muted); font-size: 13px; line-height: 1.9; }
  .topic-card small { color: var(--mint); font-size: 12px; font-weight: 700; margin-top: auto; }
  .more { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 50px; }
  .more a { border: 1px solid var(--line); border-radius: 999px; padding: 9px 16px; font-size: 12px; font-weight: 700; color: var(--muted); }
  .more a:hover { color: var(--text); border-color: rgba(46,230,197,.35); }
</style>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'مواضيع المذاكرة',
  description: 'مواضيع عملية للطلاب وأولياء الأمور في مصر.',
  url: `${BASE}/welcome/topics/`,
  inLanguage: 'ar',
  hasPart: TOPICS.map((topic) => ({ '@type': 'Article', headline: topic.h1, url: `${BASE}/welcome/topics/${topic.slug}/` })),
})}
</script>
</head>
<body>
<div class="bg-glow"></div>
<header><div class="wrap nav"><a class="brand" href="../"><span class="mark">J</span><span>jessica<i>.</i></span></a><a class="btn sm" href="../../">افتح التطبيق</a></div></header>
<main><div class="wrap">
<section class="topic-hero">
  <span class="eyebrow">🧭 مواضيع المذاكرة</span>
  <h1>مواضيع بتفرق فعلًا في المذاكرة</h1>
  <p>خمسة أدلة قصيرة مكتوبة لطالب مصري وولي أمر مصري: جدول مذاكرة واقعي، حل واجب بفهم، رياضيات بدون حفظ، قلق امتحان، وطريقة متابعة ابنك من غير خناق.</p>
</section>
<div class="topic-grid">
${TOPICS.map((topic) => `  <a class="topic-card" href="./${topic.slug}/">
    <span class="emoji">${topic.emoji}</span>
    <strong>${topic.card}</strong>
    <span>${topic.description}</span>
    <small>${ar(topic.minutes)} دقايق قراءة ←</small>
  </a>`).join('\n')}
</div>
<div class="more">
  <a href="../grades/">📚 كتب الوزارة لكل الصفوف</a>
  <a href="../quiz/">⏱️ اختبار ٦٠ ثانية</a>
  <a href="../guides/">📘 أدلة المذاكرة</a>
  <a href="../install/">📲 تثبيت التطبيق</a>
</div>
</div></main>
<footer><div class="wrap foot"><span>© Jessica — صُنع في مصر 🇪🇬</span><span><a href="../">الرئيسية</a> · <a href="../grades/">كتب الوزارة</a> · <a href="../../">التطبيق</a></span></div></footer>
</body>
</html>
`

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'index.html'), hub)

for (const topic of TOPICS) {
  fs.mkdirSync(path.join(OUT, topic.slug), { recursive: true })
  fs.writeFileSync(path.join(OUT, topic.slug, 'index.html'), page(topic))
}

console.log(`topics: ${TOPICS.length} pages + hub`)
