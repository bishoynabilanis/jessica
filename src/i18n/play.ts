/**
 * Strings for the games and lab upgrades. Kept in one file so parallel work
 * on the main dictionaries does not collide. Arabic is Egyptian colloquial.
 */
export const playAr: Record<string, string> = {
  'Try it in the lab': 'جرّبه في المعمل',
  'Your goal: play with the lab, then explain what changed in “{unit}”.': 'هدفك: العب في المعمل، وبعدين اشرح إيه اللي اتغيّر في «{unit}».',
  'From page {page} of {book}': 'من صفحة {page} في {book}',
  'Back to the lesson': 'ارجع للدرس',
  'Open page {page}': 'افتح صفحة {page}',
}

export const playLocales: Record<'fr' | 'es' | 'de' | 'tr' | 'id', Record<string, string>> = {
  fr: {
    'Try it in the lab': 'Essaie-le au labo',
    'Your goal: play with the lab, then explain what changed in “{unit}”.': 'Ton but : joue avec le labo, puis explique ce qui a changé dans « {unit} ».',
    'From page {page} of {book}': 'Page {page} de {book}',
    'Back to the lesson': 'Retour à la leçon',
    'Open page {page}': 'Ouvrir la page {page}',
  },
  es: {
    'Try it in the lab': 'Pruébalo en el laboratorio',
    'Your goal: play with the lab, then explain what changed in “{unit}”.': 'Tu meta: juega con el laboratorio y explica qué cambió en «{unit}».',
    'From page {page} of {book}': 'De la página {page} de {book}',
    'Back to the lesson': 'Volver a la lección',
    'Open page {page}': 'Abrir la página {page}',
  },
  de: {
    'Try it in the lab': 'Im Labor ausprobieren',
    'Your goal: play with the lab, then explain what changed in “{unit}”.': 'Dein Ziel: Spiel im Labor und erkläre, was sich in „{unit}“ geändert hat.',
    'From page {page} of {book}': 'Von Seite {page} in {book}',
    'Back to the lesson': 'Zurück zur Lektion',
    'Open page {page}': 'Seite {page} öffnen',
  },
  tr: {
    'Try it in the lab': 'Laboratuvarda dene',
    'Your goal: play with the lab, then explain what changed in “{unit}”.': 'Hedefin: laboratuvarla oyna, sonra “{unit}” içinde neyin değiştiğini anlat.',
    'From page {page} of {book}': '{book} kitabının {page}. sayfasından',
    'Back to the lesson': 'Derse dön',
    'Open page {page}': '{page}. sayfayı aç',
  },
  id: {
    'Try it in the lab': 'Coba di laboratorium',
    'Your goal: play with the lab, then explain what changed in “{unit}”.': 'Tujuanmu: bermain di laboratorium, lalu jelaskan apa yang berubah di “{unit}”.',
    'From page {page} of {book}': 'Dari halaman {page} di {book}',
    'Back to the lesson': 'Kembali ke pelajaran',
    'Open page {page}': 'Buka halaman {page}',
  },
}
