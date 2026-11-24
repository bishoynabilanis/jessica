/**
 * Read the text in one photo on the device, with no AI key.
 * The reading engine is downloaded from a CDN when needed (it is not bundled),
 * so this needs a connection. The photo itself never leaves the device.
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
  // @ts-expect-error remote ESM module loaded at runtime
  const mod: any = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js')
  const worker = await mod.createWorker(language, 1, {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    logger: (message: any) => {
      if (message?.status) onProgress?.(message.status, Number(message.progress) || 0)
    },
  })
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
