/** Album art. 480x360 with letterbox bars, which the sleeve crops out. */
export function thumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

/** Where the "YouTube" link in the top bar points. */
export function watchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`
}
