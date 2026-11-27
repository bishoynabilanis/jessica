/** A parent note is plain text only: no links, no control characters, at most 100 characters. */
export function cleanParentNote(text: string): string {
  return text
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/(https?:\/\/|www\.)\S*/gi, '')
    .replace(/\S+@\S+\.\S+/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
}
