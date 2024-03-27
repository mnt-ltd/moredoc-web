import Vue from 'vue'
import Element from 'element-ui'
import hotkeys from 'hotkeys-js'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'

import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import zhLocale from 'element-ui/lib/locale/lang/zh-CN'

// mixins
import mixins from '~/mixins/mixins'

Vue.use(VXETable)

// import locale from 'element-ui/lib/locale/lang/en'
// Vue.use(Element, { locale })
Vue.use(VueViewer, {
  defaultOptions: {
    button: true,
    navbar: false,
    title: true,
    toolbar: false,
    tooltip: false,
    movable: true,
    zoomable: true,
    rotatable: true,
    scalable: true,
    transition: true,
    fullscreen: true,
    keyboard: true,
    url: 'data-source',
  },
})

Vue.use(Element, { zhLocale })
// 以便光标在输入框时快捷键同样有效
hotkeys.filter = (e) => {
  return true
}
Vue.mixin(mixins)

// Vue2 引入快捷键
Vue.prototype.$hotkeys = hotkeys
