/**
 * We do not host video, and we never will: a curated search opens the exact
 * lesson on YouTube (the titles match what teachers publish), so the video gap
 * closes without bandwidth, copyright or cost.
 */
export function lessonVideoUrl(parts: { title?: string; subject?: string; grade?: string; book?: string }) {
  const query = [parts.title, parts.book, parts.subject, parts.grade, 'شرح'].filter(Boolean).join(' ')
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`
}
