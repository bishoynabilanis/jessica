import { createOcrWorker } from '@/lib/ocrEngine'
/**
 * Read the text in one photo on the device, with no AI key.
 * The reading engine ships with the app; only the language data downloads on
 * first use, so the first run needs a connection. The photo itself never leaves the device.
 */
export function ocrLanguageFor(uiLanguage: string): string {
  return uiLanguage === 'ar' ? 'ara+eng' : 'eng'
}

export async function ocrImage(
  dataUrl: string,
  language = 'eng',
  onProgress?: (status: string, progress: number) => void,
): Promise<string> {
  onProgress?.('loading', 0)
  const worker = await createOcrWorker(language, onProgress)
  try {
    const { data } = await worker.recognize(dataUrl)
    return String(data?.text || '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  } finally {
    await worker.terminate().catch(() => undefined)
  }
}
