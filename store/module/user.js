import { Message } from 'element-ui'
import Cookies from 'js-cookie'
import {
  login,
  getUser,
  updateUserProfile,
  logout,
  getUserPermissions,
  register,
  listUserGroup,
} from '~/api/user'
import { permissionsToTree } from '~/utils/permission'
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
    groups: [],
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setGroups(state, groups) {
      state.groups = groups
    },
    mergeUser(state, user) {
      state.user = { ...state.user, ...user }
    },
    setToken(state, token) {
      state.token = token
      Cookies.set('token', token, { expires: 365 })
    },
    logout(state) {
      state.user = {}
      state.token = ''
      state.permissions = []
      state.allowPages = []
      Cookies.remove('token')
      // if (process.client) {
      //   localStorage.clear()
      // }
    },
    setPermissions(state, permissions) {
      state.permissions = permissions
    },
    setAllowPages(state, pages) {
      state.allowPages = pages
    },
  },
  actions: {
    // 获取用户信息
    async getUser({ commit }) {
      const res = await getUser()
      if (res.status === 200) {
        commit('setUser', res.data)
      }
      return res
    },
    async getUserGroups({ commit }) {
      const res = await listUserGroup()
      if (res.status === 200) {
        commit('setGroups', res.data.group || [])
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
      await Promise.all([
        dispatch('getUserPermissions'),
        dispatch('getUserGroups'),
      ])
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
      await Promise.all([
        dispatch('getUserPermissions'),
        dispatch('getUserGroups'),
      ])
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
    async checkAndRefreshUser({ commit, state, dispatch }) {
      try {
        console.log('exec checkAndRefreshUser')
        // const moredoc = JSON.parse(localStorage.getItem('moredoc'))
        const token = state.token || Cookies.get('token') || ''
        if (state.token !== token) {
          // 以 localStorage 存储的信息为准
          // console.log('exec checkAndRefreshUser')
          commit('setToken', token || '')
          await Promise.all([
            // 重新获取用户信息
            dispatch('getUser'),
            dispatch('getUserGroups'),
            dispatch('getUserPermissions'),
          ])
          // commit('setUser', moredoc.user.user || {})
          // commit('setPermissions', moredoc.user.permissions || [])
          // commit('setAllowPages', moredoc.user.allowPages || [])
        }
      } catch (error) {
        // console.log(error)
      }
    },
  },
  getters: {
    user(state) {
      return state.user || { id: 0 }
    },
    token(state) {
      return state.token || Cookies.get('token') || ''
    },
    permissions(state) {
      return state.permissions || []
    },
    allowPages(state) {
      return state.allowPages || []
    },
    groups(state) {
      return state.groups || []
    },
  },
}
