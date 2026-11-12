/**
 * Video tutorials shown inside the app.
 *
 * To swap the Gemini key explainer, replace `youtubeId` with the id of the
 * new YouTube video (the part after `watch?v=`) and update `duration`.
 */
export interface VideoTutorial {
  youtubeId: string
  duration: string
  channel: string
}

export const geminiKeyVideo: VideoTutorial = {
  youtubeId: '8LRxc2MGNJI',
  duration: '1:16',
  channel: 'شروحات و حلول',
}

export function youtubeWatchUrl(video: VideoTutorial) {
  return `https://www.youtube.com/watch?v=${video.youtubeId}`
}

export function youtubeEmbedUrl(video: VideoTutorial) {
  return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`
}

export function youtubeThumbUrl(video: VideoTutorial) {
  return `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`
}
