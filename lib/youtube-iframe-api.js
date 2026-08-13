import { YOUTUBE_IFRAME_API_SRC } from '@/lib/constants'

// Playback runs through YouTube's IFrame player: the app holds no audio files,
// it just drives an off-screen embed. The API script is global, so the loader is
// shared and only ever injected once per page.
let apiPromise = null

/** Resolves once `window.YT.Player` is constructible. */
export function loadIframeApi() {
  if (typeof window === 'undefined') return new Promise(() => {})
  if (window.YT?.Player) return Promise.resolve()

  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve()
      }
      const script = document.createElement('script')
      script.src = YOUTUBE_IFRAME_API_SRC
      script.async = true
      document.head.appendChild(script)
    })
  }
  return apiPromise
}
