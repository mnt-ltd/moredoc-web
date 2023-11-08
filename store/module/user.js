import { Message } from 'element-ui'
import {
  login,
  getUser,
  updateUserProfile,
  logout,
  getUserPermissions,
  register,
  registerByMobile,
  loginByMobile,
} from '~/api/user'
import { permissionsToTree } from '~/utils/permission'
import {
  loginOauth,
  bindOauth,
} from '~/api/oauth'
export const user = {
  namespaced: true,
  state: {
    user: {
      id: 0,
      username: '',
      realname: '',
      email: '',
      mobile: '',
      avatar: '',
      address: '',
      signature: '',
    },
    token: '',
    permissions: [],
    allowPages: [],
    redirectAfterOauth: '/me', // oauth 登录后的跳转页面
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    mergeUser(state, user) {
      state.user = { ...state.user, ...user }
    },
    setToken(state, token) {
      state.token = token
    },
    logout(state) {
      state.user = {}
      state.token = ''
      state.permissions = []
      state.allowPages = []
      localStorage.clear()
    },
    setPermissions(state, permissions) {
      state.permissions = permissions
    },
    setAllowPages(state, pages) {
      state.allowPages = pages
    },
    setRedirectAfterOauth(state, redirect) {
      state.redirectAfterOauth = redirect
    },
  },
  actions: {
    setRedirectAfterOauth({ commit }, redirect) {
      commit('setRedirectAfterOauth', redirect)
    },
    // 获取用户信息
    async getUser({ commit }) {
      const res = await getUser()
      if (res.status === 200) {
        commit('setUser', res.data)
      }
      return res
    },
    async updateUserProfile({ commit }, profile) {
      const res = await updateUserProfile(profile)
      if (res.status === 200) {
        commit('mergeUser', profile)
      } else {
        Message({
          type: 'error',
          message: res.data.message || '修改失败',
        })
      }
      return res
    },
    async register({ commit, dispatch }, registerInfo) {
      const res = await register(registerInfo)
      if (res.status !== 200) {
        Message({
          type: 'error',
          message: res.data.message || '注册失败',
        })
        return res
      }
      commit('setUser', res.data.user)
      commit('setToken', res.data.token)
      // 获取用户权限
      await dispatch('getUserPermissions')
      return res
    },
    async registerByMobile({ commit, dispatch }, registerInfo) {
      const res = await registerByMobile(registerInfo)
      if (res.status !== 200) {
        Message({
          type: 'error',
          message: res.data.message || '注册失败',
        })
        return res
      }
      commit('setUser', res.data.user)
      commit('setToken', res.data.token)
      // 获取用户权限
      await dispatch('getUserPermissions')
      return res
    },
    async login({ commit, dispatch }, loginInfo) {
      const res = await login(loginInfo)
      if (res.status !== 200) {
        Message({
          type: 'error',
          message: res.data.message || '登录失败',
        })
        return res
      }
      commit('setUser', res.data.user)
      commit('setToken', res.data.token)
      // 获取用户权限
      await dispatch('getUserPermissions')
      return res
    },
    async loginOauth({ commit, dispatch }, loginInfo) {
      const res = await loginOauth(loginInfo)
      if (res.status !== 200) {
        Message({
          type: 'error',
          message: res.data.message || '登录失败',
        })
        return res
      }
      
      if(res.data.token && res.data.user){        // 如果返回信息中有token和用户信息，则表示登录成功。否则表示需要对用户信息进行绑定
        commit('setUser', res.data.user)
        commit('setToken', res.data.token)
        await dispatch('getUserPermissions')
      }
      // 如果没返回上述数据，则表示需要绑定
      return res
    },
    // 绑定oauth。如果已登录，则绑定到当前用户。如果未登录，则绑定到新用户
    async bindOauth({ commit, dispatch }, bindInfo) {
      const res = await bindOauth(bindInfo)
      if (res.status !== 200) {
        Message({
          type: 'error',
          message: res.data.message || '绑定失败',
        })
        return res
      }
      if(res.data.token) commit('setToken', res.data.token)
      if(res.data.user) commit('setUser', res.data.user)
      await dispatch('getUserPermissions')
      return res
    },
    async loginByMobile({ commit, dispatch }, loginInfo) {
      const res = await loginByMobile(loginInfo)
      if (res.status !== 200) {
        Message({
          type: 'error',
          message: res.data.message || '登录失败',
        })
        return res
      }
      commit('setUser', res.data.user)
      commit('setToken', res.data.token)
      // 获取用户权限
      await dispatch('getUserPermissions')
      return res
    },
    async logout({ commit }) {
      const res = await logout()
      commit('logout')
      return res
    },
    async getUserPermissions({ commit }) {
      const res = await getUserPermissions()
      if (res.status === 200) {
        commit('setPermissions', res.data.permission)
        const allowPages = []
        try {
          const trees = permissionsToTree(res.data.permission)
          trees.forEach((tree) => {
            if (tree.pages && tree.id && tree.id > 0) {
              allowPages.push(...tree.pages)
            }
          })
        } catch (error) {}
        commit('setAllowPages', allowPages)
      } else {
        Message({
          type: 'error',
          message: res.data.message || '获取权限失败',
        })
      }
      return res
    },
    checkAndRefreshUser({ commit, state }) {
      try {
        const moredoc = JSON.parse(localStorage.getItem('moredoc'))
        if (state.token !== moredoc.user.token) {
          // 以 localStorage 存储的信息为准
          console.log('exec checkAndRefreshUser')
          commit('setUser', moredoc.user.user || {})
          commit('setToken', moredoc.user.token || '')
          commit('setPermissions', moredoc.user.permissions || [])
          commit('setAllowPages', moredoc.user.allowPages || [])
        }
      } catch (error) {
        console.log(error)
      }
    },
  },
  getters: {
    user(state) {
      return state.user
    },
    token(state) {
      return state.token
    },
    permissions(state) {
      return state.permissions
    },
    allowPages(state) {
      return state.allowPages
    },
    redirectAfterOauth(state) {
      return state.redirectAfterOauth
    }
  },
}
