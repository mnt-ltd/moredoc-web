import { extractScripts } from '~/utils/utils'
export default function ({ store, route, redirect }) {
  const settings = store.getters['setting/settings']
  window._hmt = window._hmt || []
  window.loaded_hmt = window.loaded_hmt || false
  if (!window.loaded_hmt) {
    const scripts = extractScripts(settings.system.analytics || '')
    for (let index = 0; index < scripts.length; index++) {
      try {
        eval(settings.system.analytics)
        if (_hmt) {
          window._hmt = _hmt
          window.loaded_hmt = true
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  if (window.loaded_hmt) {
    window._hmt.push(['_trackPageview', route.fullPath])
  }
}
