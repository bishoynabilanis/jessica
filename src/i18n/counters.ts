import { tr as baseTr } from '@/i18n'
import { useApp } from '@/store/useApp'

const translations: Record<string, Record<string, string>> = {
  "ar": {
    "Install browser records": "سجلات تثبيت المتصفح",
    "Browser records": "سجلات المتصفحات",
    "New browser and install counters start on 24 November 2026. Older totals cannot be recovered.": "عدادات المتصفحات والتثبيت الجديدة بتبدأ من ٢٤ نوفمبر ٢٠٢٦. مينفعش نسترجع الأعداد القديمة.",
    "One local flag per browser profile, not one person or physical device. Clearing storage or using another browser can count again; failures and opt-outs can miss counts.": "علامة محلية لكل ملف متصفح، مش لكل شخص أو جهاز فعلي. مسح التخزين أو تغيير المتصفح ممكن يتعد تاني؛ الأعطال وإيقاف المشاركة ممكن ينقصوا العدد.",
    "Country and governorate are not collected.": "الدولة والمحافظة مش بيتجمعوا.",
    "Totals are visible to anyone. This is not a private owner dashboard.": "الإجماليات متاحة لأي حد. دي مش لوحة خاصة بصاحب التطبيق.",
    "Last checked: {time}": "آخر فحص: {time}",
    "Cumulative snapshots": "لقطات تراكمية",
    "Session opens and new browser/install signals increment public totals without sending a device identifier. Local flags reduce repeats; these are estimates, not a user census.": "فتحات الجلسات وإشارات المتصفح والتثبيت الجديدة بتزود إجماليات متاحة للكل بدون إرسال معرّف جهاز. علامات محلية بتقلل التكرار؛ دي تقديرات مش حصر للمستخدمين.",
    "Installation and home-screen launch share one local flag, so the two signals are not added together.": "التثبيت والفتح من الشاشة الرئيسية بيستخدموا نفس العلامة المحلية، فمش بنجمع الإشارتين.",
    "The counter provider receives normal connection metadata, including your IP address. Jessica does not store an IP address or send a device ID. Turn off the anonymous counter to stop these requests.": "مزوّد العداد بيستقبل بيانات الاتصال المعتادة، ومنها عنوان IP. جيسيكا مش بتخزن عنوان IP ولا بتبعت معرّف جهاز. اقفل العداد المجهول علشان توقف الطلبات دي."
  },
  "fr": {
    "Install browser records": "Installations par navigateur",
    "Browser records": "Navigateurs comptés",
    "New browser and install counters start on 24 November 2026. Older totals cannot be recovered.": "Les nouveaux compteurs de navigateurs et installations commencent le 24 novembre 2026. Les anciens totaux ne peuvent pas être récupérés.",
    "One local flag per browser profile, not one person or physical device. Clearing storage or using another browser can count again; failures and opt-outs can miss counts.": "Un indicateur local par profil de navigateur, pas par personne ou appareil. Effacer le stockage ou changer de navigateur peut recompter ; les erreurs et refus peuvent réduire le total.",
    "Country and governorate are not collected.": "Le pays et la région ne sont pas collectés.",
    "Totals are visible to anyone. This is not a private owner dashboard.": "Les totaux sont visibles par tous. Ce tableau de bord n’est pas privé.",
    "Last checked: {time}": "Dernière vérification : {time}",
    "Cumulative snapshots": "Relevés cumulés",
    "Session opens and new browser/install signals increment public totals without sending a device identifier. Local flags reduce repeats; these are estimates, not a user census.": "Les sessions et nouveaux signaux de navigateur et d’installation augmentent des totaux accessibles à tous sans envoyer d’identifiant. Des indicateurs locaux réduisent les répétitions ; ce sont des estimations, pas un recensement.",
    "Installation and home-screen launch share one local flag, so the two signals are not added together.": "L’installation et le lancement depuis l’écran d’accueil partagent un indicateur local et ne sont donc pas additionnés.",
    "The counter provider receives normal connection metadata, including your IP address. Jessica does not store an IP address or send a device ID. Turn off the anonymous counter to stop these requests.": "Le fournisseur du compteur reçoit les métadonnées de connexion habituelles, dont l’adresse IP. Jessica ne stocke pas d’adresse IP et n’envoie pas d’identifiant d’appareil. Désactivez le compteur pour arrêter ces requêtes."
  },
  "es": {
    "Install browser records": "Instalaciones por navegador",
    "Browser records": "Navegadores contados",
    "New browser and install counters start on 24 November 2026. Older totals cannot be recovered.": "Los nuevos contadores de navegadores e instalaciones empiezan el 24 de noviembre de 2026. No se pueden recuperar los totales anteriores.",
    "One local flag per browser profile, not one person or physical device. Clearing storage or using another browser can count again; failures and opt-outs can miss counts.": "Una marca local por perfil de navegador, no por persona o dispositivo. Borrar datos o cambiar de navegador puede contar otra vez; los fallos y la exclusión pueden reducir el total.",
    "Country and governorate are not collected.": "No se recopilan el país ni la región.",
    "Totals are visible to anyone. This is not a private owner dashboard.": "Los totales son visibles para todos. Este panel no es privado.",
    "Last checked: {time}": "Última consulta: {time}",
    "Cumulative snapshots": "Registros acumulados",
    "Session opens and new browser/install signals increment public totals without sending a device identifier. Local flags reduce repeats; these are estimates, not a user census.": "Las sesiones y nuevas señales de navegador e instalación aumentan totales abiertos a todos sin enviar identificadores. Las marcas locales reducen repeticiones; son estimaciones, no un censo.",
    "Installation and home-screen launch share one local flag, so the two signals are not added together.": "La instalación y la apertura desde inicio comparten una marca local, así que no se suman las dos señales.",
    "The counter provider receives normal connection metadata, including your IP address. Jessica does not store an IP address or send a device ID. Turn off the anonymous counter to stop these requests.": "El proveedor recibe metadatos normales de conexión, incluida tu IP. Jessica no guarda direcciones IP ni envía identificadores de dispositivo. Desactiva el contador para detener estas solicitudes."
  },
  "de": {
    "Install browser records": "Installationen pro Browser",
    "Browser records": "Gezählte Browser",
    "New browser and install counters start on 24 November 2026. Older totals cannot be recovered.": "Die neuen Browser- und Installationszähler beginnen am 24. November 2026. Frühere Zahlen lassen sich nicht wiederherstellen.",
    "One local flag per browser profile, not one person or physical device. Clearing storage or using another browser can count again; failures and opt-outs can miss counts.": "Eine lokale Markierung pro Browserprofil, nicht pro Person oder Gerät. Gelöschte Daten oder andere Browser können erneut zählen; Fehler und Widersprüche können Zählungen auslassen.",
    "Country and governorate are not collected.": "Land und Region werden nicht erfasst.",
    "Totals are visible to anyone. This is not a private owner dashboard.": "Die Summen sind für alle sichtbar. Dies ist kein privates Dashboard.",
    "Last checked: {time}": "Zuletzt geprüft: {time}",
    "Cumulative snapshots": "Kumulative Momentaufnahmen",
    "Session opens and new browser/install signals increment public totals without sending a device identifier. Local flags reduce repeats; these are estimates, not a user census.": "Sitzungen und neue Browser-/Installationssignale erhöhen offen sichtbare Summen ohne Gerätekennung. Lokale Markierungen reduzieren Wiederholungen; dies sind Schätzungen, keine Nutzerzählung.",
    "Installation and home-screen launch share one local flag, so the two signals are not added together.": "Installation und Start vom Startbildschirm nutzen dieselbe lokale Markierung und werden nicht addiert.",
    "The counter provider receives normal connection metadata, including your IP address. Jessica does not store an IP address or send a device ID. Turn off the anonymous counter to stop these requests.": "Der Zähleranbieter erhält übliche Verbindungsdaten einschließlich IP-Adresse. Jessica speichert keine IP-Adresse und sendet keine Geräte-ID. Deaktiviere den anonymen Zähler, um diese Anfragen zu stoppen."
  },
  "tr": {
    "Install browser records": "Tarayıcı kurulum kayıtları",
    "Browser records": "Sayılan tarayıcılar",
    "New browser and install counters start on 24 November 2026. Older totals cannot be recovered.": "Yeni tarayıcı ve kurulum sayaçları 24 Kasım 2026 tarihinde başlar. Eski toplamlar kurtarılamaz.",
    "One local flag per browser profile, not one person or physical device. Clearing storage or using another browser can count again; failures and opt-outs can miss counts.": "Her tarayıcı profili için yerel bir işaret; kişi veya fiziksel cihaz başına değil. Verileri silmek veya başka tarayıcı kullanmak yeniden sayabilir; hatalar ve devre dışı bırakma eksik sayabilir.",
    "Country and governorate are not collected.": "Ülke ve il bilgisi toplanmaz.",
    "Totals are visible to anyone. This is not a private owner dashboard.": "Toplamlar herkese açıktır. Bu özel bir yönetici paneli değildir.",
    "Last checked: {time}": "Son kontrol: {time}",
    "Cumulative snapshots": "Birikimli kayıtlar",
    "Session opens and new browser/install signals increment public totals without sending a device identifier. Local flags reduce repeats; these are estimates, not a user census.": "Oturumlar ve yeni tarayıcı/kurulum sinyalleri cihaz kimliği göndermeden herkese açık toplamları artırır. Yerel işaretler tekrarları azaltır; bunlar tahmindir, kullanıcı sayımı değildir.",
    "Installation and home-screen launch share one local flag, so the two signals are not added together.": "Kurulum ve ana ekran açılışı aynı yerel işareti kullanır; iki sinyal toplanmaz.",
    "The counter provider receives normal connection metadata, including your IP address. Jessica does not store an IP address or send a device ID. Turn off the anonymous counter to stop these requests.": "Sayaç sağlayıcısı IP adresiniz dahil normal bağlantı verilerini alır. Jessica IP adresi saklamaz veya cihaz kimliği göndermez. Bu istekleri durdurmak için anonim sayacı kapatın."
  },
  "id": {
    "Install browser records": "Catatan pemasangan browser",
    "Browser records": "Browser terhitung",
    "New browser and install counters start on 24 November 2026. Older totals cannot be recovered.": "Penghitung browser dan pemasangan baru dimulai pada 24 November 2026. Total lama tidak dapat dipulihkan.",
    "One local flag per browser profile, not one person or physical device. Clearing storage or using another browser can count again; failures and opt-outs can miss counts.": "Satu penanda lokal per profil browser, bukan per orang atau perangkat fisik. Menghapus data atau memakai browser lain dapat menghitung ulang; kegagalan dan pilihan nonaktif dapat mengurangi hitungan.",
    "Country and governorate are not collected.": "Negara dan wilayah tidak dikumpulkan.",
    "Totals are visible to anyone. This is not a private owner dashboard.": "Total dapat dilihat siapa saja. Ini bukan dasbor pribadi pemilik.",
    "Last checked: {time}": "Terakhir diperiksa: {time}",
    "Cumulative snapshots": "Rekaman kumulatif",
    "Session opens and new browser/install signals increment public totals without sending a device identifier. Local flags reduce repeats; these are estimates, not a user census.": "Sesi dan sinyal browser/pemasangan baru menambah total yang terbuka untuk semua tanpa mengirim pengenal perangkat. Penanda lokal mengurangi pengulangan; ini perkiraan, bukan sensus pengguna.",
    "Installation and home-screen launch share one local flag, so the two signals are not added together.": "Pemasangan dan peluncuran dari layar utama memakai penanda lokal yang sama, sehingga kedua sinyal tidak dijumlahkan.",
    "The counter provider receives normal connection metadata, including your IP address. Jessica does not store an IP address or send a device ID. Turn off the anonymous counter to stop these requests.": "Penyedia penghitung menerima metadata koneksi biasa, termasuk alamat IP. Jessica tidak menyimpan IP atau mengirim ID perangkat. Matikan penghitung anonim untuk menghentikan permintaan ini."
  }
}

export function counterTr(key: string, vars?: Record<string, string | number>): string {
  const language = useApp.getState().settings.language
  let text = translations[language]?.[key]
  if (!text) return baseTr(key, vars)
  for (const [name, value] of Object.entries(vars || {})) text = text.split(`{${name}}`).join(String(value))
  return text
}
