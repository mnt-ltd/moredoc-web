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
  createContextualAPI,
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
      // 只在客户端设置 Cookie
      if (process.client) {
        Cookies.set('token', token, { expires: 365 })
      }
    },
    logout(state) {
      state.user = {}
      state.token = ''
      state.permissions = []
      state.allowPages = []
      // 只在客户端删除 Cookie
      if (process.client) {
        Cookies.remove('token')
      }
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
    async getUser({ commit }, context) {
      let res
      if (process.server && context) {
        // 服务端使用上下文API
        const contextAPI = createContextualAPI(context)
        res = await contextAPI.getUser()
      } else {
        // 客户端使用普通API
        res = await getUser()
      }

      if (res.status === 200) {
        commit('setUser', res.data)
      }
      return res
    },
    async getUserGroups({ commit }, context) {
      let res
      if (process.server && context) {
        // 服务端使用上下文API
        const contextAPI = createContextualAPI(context)
        res = await contextAPI.listUserGroup()
      } else {
        // 客户端使用普通API
        res = await listUserGroup()
      }

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
    async getUserPermissions({ commit }, context) {
      let res
      if (process.server && context) {
        // 服务端使用上下文API
        const contextAPI = createContextualAPI(context)
        res = await contextAPI.getUserPermissions()
      } else {
        // 客户端使用普通API
        res = await getUserPermissions()
      }

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
      } else if (process.client) {
        // 只在客户端显示错误信息
        Message({
          type: 'error',
          message: res.data.message || '获取权限失败',
        })
      }
      return res
    },
    async checkAndRefreshUser({ commit, state, dispatch }) {
      try {
        const token = state.token || Cookies.get('token') || ''
        const user = state.user || { id: 0 }

        // 如果有token但没有用户信息，或者token不匹配，则需要重新获取
        if (token && (!user.id || state.token !== token)) {
          if (state.token !== token) {
            commit('setToken', token)
          }

          await Promise.all([
            // 重新获取用户信息
            dispatch('getUser'),
            dispatch('getUserGroups'),
            dispatch('getUserPermissions'),
          ])
        }
      } catch (error) {
        // 如果获取失败，清除无效的token
        if (error.response && error.response.status === 401) {
          commit('logout')
        }
      }
    },
    // 从cookie中设置token（服务端用）
    setTokenFromCookie({ commit }, token) {
      if (token) {
        commit('setToken', token)
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
