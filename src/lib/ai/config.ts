/**
 * Where the free-trial proxy lives. Deploy `cloudflare-worker/worker.js`
 * (see its DEPLOY.md), then paste the workers.dev URL here.
 * Empty string means the trial is not configured: the app still runs, and AI
 * actions ask for a personal key instead.
 */
export const PROXY_ENDPOINT_URL = ''

/** Free AI actions per day on the shared proxy. */
export const TRIAL_ACTIONS_PER_DAY = 15

/** Local model used for the offline mode. */
export const OFFLINE_MODEL = 'Qwen2.5-3B-Instruct-q4f16_1-MLC'
export const OFFLINE_MODEL_SIZE_GB = 1.8

export function proxyConfigured() {
  return PROXY_ENDPOINT_URL.trim().length > 0
}
