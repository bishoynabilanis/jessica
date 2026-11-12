import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, HelpCircle, MessageSquareWarning, Search, Youtube } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getLanguage, tr } from '@/i18n'
import { geminiKeyVideo, youtubeWatchUrl } from '@/data/tutorials'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/data/support'

interface FaqItem {
  question: string
  answer: string
  tag: string
}

const FAQ: { ar: FaqItem[]; en: FaqItem[] } = {
  ar: [
    {
      tag: 'البدء',
      question: 'إزاي أجيب مفتاح Gemini المجاني؟',
      answer:
        'افتح Google AI Studio من لينك «جيب مفتاح» جوه التطبيق، اعمل مفتاح جديد، وانسخه والصقه في شاشة الإعداد. لو مش عارف، فيه فيديو قصير جوه التطبيق بيشرح كل خطوة.',
    },
    {
      tag: 'البدء',
      question: 'ليه التطبيق مش بيفتح قبل ما أحط مفتاح وكتاب؟',
      answer:
        'عشان كل ميزة فيه مبنية على كتابك الحقيقي. بعد ما تربط المفتاح وتستورد كتاب واحد، التطبيق يفتح على طول ومش هيطلب منك تاني.',
    },
    {
      tag: 'البدء',
      question: 'إزاي أستورد كتاب الوزارة؟',
      answer:
        'من شاشة الإعداد أو المكتبة: اختار صفك، اضغط «تحميل» على الكتاب، وبعد ما ينزل على جهازك اضغط «استيراد» واختار الملف. الفهرسة بتتم على جهازك مرة واحدة.',
    },
    {
      tag: 'المذاكرة',
      question: 'هل التطبيق بيشتغل من غير إنترنت؟',
      answer:
        'أيوه بعد أول تحميل واستيراد. الكتب والبطاقات والامتحانات المحفوظة والتدريب على بنك الأسئلة بيشتغلوا أوفلاين. ميزات الذكاء الاصطناعي بس هي اللي محتاجة اتصال.',
    },
    {
      tag: 'المذاكرة',
      question: 'إزاي أجهز بنك أسئلة لوحدة؟',
      answer:
        'افتح «تدريب تكيفي» واضغط «جهّز الوحدة الجاية». هيتولّد ٨ أسئلة ويتحفظوا على جهازك، وبعدها تقدر تتدرب عليهم أوفلاين. التجهيز محتاج مفتاح ونت مرة واحدة.',
    },
    {
      tag: 'المذاكرة',
      question: 'ليه الصوت مش طالع بلهجتي؟',
      answer:
        'التطبيق بيستخدم الأصوات المثبتة على جهازك. من الإعدادات → الصوت واللهجة اختار لهجتك، والتطبيق هيختار أقرب صوت متاح. لو مفيش صوت للهجة دي، المتصفح بيستخدم أقرب صوت عربي.',
    },
    {
      tag: 'الخصوصية',
      question: 'فين بياناتي ومفتاحي؟',
      answer:
        'كل حاجة على جهازك: المفتاح في متصفحك والكتب في تخزين التطبيق المحلي. مفيش سيرفر ومفيش حساب. تقدر تصدّر نسخة احتياطية كاملة أو تمسح كل حاجة من الإعدادات.',
    },
    {
      tag: 'الخصوصية',
      question: 'إيه حكاية عداد الاستخدام؟',
      answer:
        'عداد مجهول تمامًا بيزود رقم واحد كل مرة حد يفتح التطبيق، بدون أي بيانات شخصية. تقدر توقفه من الإعدادات → عداد الاستخدام.',
    },
    {
      tag: 'المدارس',
      question: 'بيشتغل للمدارس الحكومية والخاصة واللغات؟',
      answer:
        'أيوه. اختار نوع مدرستك من الإعدادات (حكومي / خاص / لغات / أزهر). مدارس اللغات بتشوف الفرنساوي والألماني في الكتالوج، والباقي بيشوف المواد الأساسية والتربية الدينية.',
    },
    {
      tag: 'المدارس',
      question: 'مادتي مش موجودة في كتالوج الوزارة، أعمل إيه؟',
      answer:
        'استورد أي PDF من جهازك من زرار «أضف كتاب» في المكتبة. جيسيكا هتفهرسه وتعلّم منه عادي، بنفس الشرح والامتحانات والبطاقات.',
    },
    {
      tag: 'البدء',
      question: 'إزاي أثبت التطبيق على الموبايل؟',
      answer:
        'أندرويد (Chrome): افتح اللينك → قائمة ⋮ → «تثبيت التطبيق». آيفون (Safari): زرار المشاركة → «إضافة إلى الشاشة الرئيسية». بعد التثبيت بيفتح زي أي تطبيق.',
    },
    {
      tag: 'الخصوصية',
      question: 'هل التطبيق مجاني وفيه إعلانات؟',
      answer: 'مجاني بالكامل، بدون إعلانات وبدون اشتراك وبدون بيع بيانات. مفتاح Gemini مجاني كمان من Google.',
    },
  ],
  en: [
    {
      tag: 'Getting started',
      question: 'How do I get a free Gemini key?',
      answer:
        'Open Google AI Studio from the “Get a key” link inside the app, create a key, copy it and paste it in the setup screen. There is a short video guide inside the app too.',
    },
    {
      tag: 'Getting started',
      question: 'Why does the app wait for a key and a book?',
      answer:
        'Every feature is grounded in your real textbook. Once you connect a key and import one book, the app opens and will not ask again.',
    },
    {
      tag: 'Getting started',
      question: 'How do I import an official book?',
      answer:
        'From setup or the Library: choose your grade, tap Download, then Import and pick the saved PDF. Indexing happens once, on your device.',
    },
    {
      tag: 'Studying',
      question: 'Does it work offline?',
      answer:
        'Yes, after the first load. Books, flashcards, saved exams and question-bank practice work offline. Only AI features need a connection.',
    },
    {
      tag: 'Studying',
      question: 'How do I prepare a question bank for a unit?',
      answer:
        'Open Adaptive practice and tap “Prepare next unit”. Eight questions are generated and saved on your device, then you can practise offline.',
    },
    {
      tag: 'Studying',
      question: 'Why is the voice not in my dialect?',
      answer:
        'The app uses voices installed on your device. Pick your dialect in Settings → Voice & accent; the browser uses the closest installed voice.',
    },
    {
      tag: 'Privacy',
      question: 'Where are my data and key?',
      answer:
        'Everything stays on your device: the key in your browser and books in local storage. No server and no account. You can export a backup or erase everything.',
    },
    {
      tag: 'Privacy',
      question: 'What is the community counter?',
      answer:
        'An anonymous counter that increments once per open, with no identifiers. You can turn it off in Settings.',
    },
    {
      tag: 'Schools',
      question: 'Does it work for government, private and language schools?',
      answer:
        'Yes. Choose your school type in Settings. Language schools also see French and German in the catalog.',
    },
    {
      tag: 'Schools',
      question: 'My subject is missing from the catalog — what now?',
      answer: 'Import any PDF from your device. Jessica indexes it and teaches from it like any official book.',
    },
    {
      tag: 'Getting started',
      question: 'How do I install it on my phone?',
      answer:
        'Android Chrome: menu ⋮ → Install app. iPhone Safari: Share → Add to Home Screen. It then opens like a native app.',
    },
    {
      tag: 'Privacy',
      question: 'Is it free and ad-free?',
      answer: 'Completely free, with no ads, no subscription and no data selling. The Gemini key is free too.',
    },
  ],
}

export function Help() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('All')
  const arabic = getLanguage() === 'ar'
  const items = arabic ? FAQ.ar : FAQ.en

  const tags = useMemo(() => ['All', ...new Set(items.map((item) => item.tag))], [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesTag = tag === 'All' || item.tag === tag
      const matchesQuery = !q || `${item.question} ${item.answer}`.toLowerCase().includes(q)
      return matchesTag && matchesQuery
    })
  }, [items, query, tag])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={tr('Help centre')}
        title={tr('How can we help?')}
        subtitle={tr('Quick answers for setup, studying, privacy and schools.')}
        icon={<HelpCircle className="h-5 w-5" />}
        actions={
          <Link to="/feedback">
            <Button size="sm" variant="secondary">
              <MessageSquareWarning className="h-3.5 w-3.5" /> {tr('Suggestions & complaints')}
            </Button>
          </Link>
        }
      />

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tr('Search help…')}
            className="field ps-9 text-sm"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((item) => (
            <button
              key={item}
              onClick={() => setTag(item)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${
                tag === item
                  ? 'border-aurora-400/50 bg-aurora-400/15 text-aurora-200'
                  : 'border-line bg-card-2 text-muted hover:text-main'
              }`}
            >
              {item === 'All' ? tr('All') : item}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-2.5">
        {filtered.map((item) => (
          <details key={item.question} className="group rounded-2xl border border-line bg-card-2 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
              <span className="text-[12px] font-extrabold text-main" dir="auto">
                {item.question}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-[11px] leading-relaxed text-muted" dir="auto">
              {item.answer}
            </p>
          </details>
        ))}
        {!filtered.length && (
          <Card className="p-6 text-center text-[11px] text-muted">{tr('No answers match your search. Ask us directly.')}</Card>
        )}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[12px] font-extrabold text-main">{tr('Still stuck?')}</p>
          <p className="text-[10px] text-muted">{tr('Send a suggestion, a complaint or a bug report — we read everything.')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/feedback?kind=bug&auto=1">
            <Button size="sm">{tr('Report a bug')}</Button>
          </Link>
          <Link to="/feedback">
            <Button size="sm" variant="secondary">{tr('Contact us')}</Button>
          </Link>
          {SUPPORT_WHATSAPP && (
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noreferrer">
              <Button size="sm" variant="ghost">{tr('WhatsApp')}</Button>
            </a>
          )}
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              <Button size="sm" variant="ghost">{tr('Email')}</Button>
            </a>
          )}
          <Link to="/disclaimer">
            <Button size="sm" variant="ghost">{tr('Disclaimer')}</Button>
          </Link>
          <a href={youtubeWatchUrl(geminiKeyVideo)} target="_blank" rel="noreferrer">
            <Button size="sm" variant="secondary">
              <Youtube className="h-3.5 w-3.5" /> {tr('Key video')}
            </Button>
          </a>
        </div>
      </Card>
    </div>
  )
}
