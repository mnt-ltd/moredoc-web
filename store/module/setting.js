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
      display: {},
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
        commit('setSettings', res.data)
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
    navigations(state) {
      return state.navigations || []
    },
  },
}
