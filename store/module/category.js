import { listCategory } from '~/api/category'
import { categoryToTrees } from '~/utils/utils'
import { categoryTypeOptions } from '~/utils/enum'
export const category = {
  namespaced: true,
  state: {
    categories: [],
    categoryMap: {},
    categoryTrees: [],
  },
  mutations: {
    setCategories(state, categories) {
      state.categories = categories || []
    },
    setCategoryMap(state, categories) {
      const map = {}
      categories.forEach((item) => {
        map[item.id] = item
      })
      state.categoryMap = map
    },
    setCategoryTrees(state, categories) {
      state.categoryTrees = categoryToTrees(categories)
    },
  },
  actions: {
    async getCategories({ commit }) {
      const types = categoryTypeOptions.map((item) => item.value)
      const res = await listCategory({
        field: [
          'id',
          'title',
          'parent_id',
          'icon',
          'cover',
          'doc_count',
          'enable',
          'description',
          'show_description',
          'type',
        ],
        type: types,
      })
      if (res.status === 200) {
        commit('setCategories', res.data.category || [])
        commit('setCategoryMap', res.data.category || [])
        commit('setCategoryTrees', res.data.category || [])
      }
      return res
    },
  },
  getters: {
    categories(state) {
      return state.categories
    },
    documentCategories(state) {
      return state.categories.filter((item) => !item.type)
    },
    categoryTrees(state) {
      return state.categoryTrees
    },
    categoryMap(state) {
      return state.categoryMap
    },
  },
}
