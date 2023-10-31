import { getSettings } from '~/api/config'
import { Message } from 'element-ui'
export const setting = {
  namespaced: true,
  state: {
    settings: {
      system: {},
      footer: {},
      security: {},
      download: {},
      display: {},
      payment: {},
      vip: {
        enable: false,
        icon: '',
      },
    },
  },
  mutations: {
    setSettings(state, settings) {
      state.settings = settings
    },
  },
  actions: {
    async getSettings({ commit }) {
      const res = await getSettings()
      if (res.status === 200) {
        commit('setSettings', res.data)
      } else {
        Message({
          type: 'error',
          message: res.data.message || '查询系统设置失败',
        })
      }
      return res
    },
  },
  getters: {
    settings(state) {
      return state.settings
    },
    watermarkStyleTag(state) {
      let style = ''
      try {
        const watermark = state.settings.system.watermark
        if (state.settings.system.enable_watermark && watermark) {
          style = `<style>
          .page-document .doc-pages .doc-page::after,.viewer-canvas::after{
            z-index: 1;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            content: '';
            background-image: url(${watermark});background-repeat: repeat;
            pointer-events: none;
          }
          </style>`
        }
      } catch (error) {}
      return style
    },
  },
}
