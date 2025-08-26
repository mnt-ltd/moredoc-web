import Vue from 'vue'
import Vuex, { Store } from 'vuex'
// import { VuexPersistence } from 'vuex-persist'
import { user } from '~/store/module/user'
import { setting } from '~/store/module/setting'
import { category } from '~/store/module/category'

Vue.use(Vuex)

// const vuexLocal = new VuexPersistence({
//   storage: process.client ? window.localStorage : undefined,
//   modules: ['user', 'category', 'setting'],
//   key: 'moredoc',
// })

const store = () =>
  new Store({
    modules: {
      user,
      category,
      setting,
    },
    // plugins: process.client ? [vuexLocal.plugin] : [],
  })

export default store
