import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import { user } from '~/store/module/user'
import { setting } from '~/store/module/setting'
import { category } from '~/store/module/category'

Vue.use(Vuex)

const store = () =>
  new Store({
    modules: {
      user,
      category,
      setting,
    },
    actions: {
      // 服务端初始化，从cookie中读取token等信息
      async nuxtServerInit({ dispatch }, context) {
        // 从cookie中获取token
        const token = context.$cookies.get('token')
        if (token) {
          // 设置token到store
          await dispatch('user/setTokenFromCookie', token)

          // 尝试获取用户信息和权限，传递 context
          try {
            await Promise.all([
              dispatch('user/getUser', context),
              dispatch('user/getUserPermissions', context),
              dispatch('user/getUserGroups', context),
            ])
          } catch (error) {
            // 如果获取用户信息失败，可能token已过期，清除token
            await dispatch('user/logout')
          }
        }
      },
    },
  })

export default store
