// The text-reading engine ships with the app (copied into ./ocr/ at build time from
// the pinned npm package), so no code is fetched from a third-party host.
// Only the language data (plain data files) still comes from the tessdata host.
const LANG_DATA = 'https://tessdata.projectnaptha.com/4.0.0'

function local(path: string) {
  return new URL(path, document.baseURI).href
}

export async function createOcrWorker(
  language: string,
  onProgress?: (status: string, progress: number) => void,
  langPath = LANG_DATA,
): Promise<{ recognize: (image: any) => Promise<{ data?: { text?: string } }>; terminate: () => Promise<unknown> }> {
  const mod: any = await import(/* @vite-ignore */ local('ocr/tesseract.esm.min.js'))
  // The packaged file only has a default export; test doubles may expose createWorker directly.
  const createWorker = mod.createWorker ?? mod.default?.createWorker
  if (!createWorker) throw new Error('OCR_UNAVAILABLE')
  return createWorker(language, 1, {
    workerPath: local('ocr/worker.min.js'),
    corePath: local('ocr/core/'),
    langPath,
    logger: (message: any) => {
      if (message?.status) onProgress?.(message.status, Number(message.progress) || 0)
    },
  })
}
