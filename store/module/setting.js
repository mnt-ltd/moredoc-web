import { Message } from 'element-ui'
import { getSettings } from '~/api/config'
import { listNavigation } from '~/api/navigation'
import { categoryToTrees } from '~/utils/utils'
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
      language: [],
    },
    navigations: [],
  },
  mutations: {
    setSettings(state, settings) {
      state.settings = settings
    },
    setNavigations(state, navigations) {
      state.navigations = navigations
    },
  },
  actions: {
    async getSettings({ commit }) {
      const res = await getSettings()
      if (res.status === 200) {
        commit('setSettings', {
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
          language: [],
          ...res.data,
        })
      } else {
        Message({
          type: 'error',
          message: res.data.message || '查询系统设置失败',
        })
      }
      return res
    },
    async listNavigation({ commit }) {
      const res = await listNavigation({ page: 1, size: 10000 })
      if (res.status === 200) {
        let navigations = res.data.navigation || []
        navigations = categoryToTrees(navigations).filter((item) => item.enable)
        commit('setNavigations', navigations)
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
    navigations(state) {
      return state.navigations || []
    },
  },
}
