export default async function ({ store, $cookies }) {
  // 只在客户端运行，用于页面刷新后恢复用户状态
  if (process.client) {
    const token = $cookies.get('token')
    const currentToken = store.getters['user/token']
    const user = store.getters['user/user']

    // 如果有token但没有用户信息，说明是页面刷新了，需要重新获取用户信息
    if (token && (!currentToken || !user.id)) {
      try {
        // 设置token
        if (!currentToken) {
          store.dispatch('user/setTokenFromCookie', token)
        }

        // 获取用户信息和权限
        await Promise.all([
          store.dispatch('user/getUser'),
          store.dispatch('user/getUserPermissions'),
          store.dispatch('user/getUserGroups'),
        ])
      } catch (error) {
        // 如果获取用户信息失败，可能token已过期，清除token
        store.dispatch('user/logout')
      }
    }
  }
}
