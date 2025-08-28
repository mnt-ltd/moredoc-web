export default async function ({ store, route, redirect, $cookies }) {
  // 在服务端需要从cookie中检查token
  if (process.server) {
    const token = $cookies.get('token')
    if (!token) {
      redirect('/')
      return
    }
    // 如果store中没有token，设置一下
    if (!store.getters['user/token']) {
      store.dispatch('user/setTokenFromCookie', token)
    }
    return
  }

  // 客户端处理逻辑
  const token = store.getters['user/token'] || $cookies.get('token')
  const user = store.getters['user/user']

  // 如果有token但没有用户信息，说明可能是页面刷新了，尝试恢复用户状态
  if (token && !user.id) {
    try {
      await store.dispatch('user/checkAndRefreshUser')
    } catch (error) {
      // 如果恢复失败，重定向到首页
      redirect('/')
      return
    }
  }

  // 检查登录状态和权限
  const currentToken = store.getters['user/token']
  const allowPages = store.getters['user/allowPages'] || []

  // 未登录或没有权限
  if (!currentToken || allowPages.length === 0) {
    redirect('/')
    return
  }

  // 管理员均可访问的页面
  allowPages.push(
    '/admin',
    '/admin/index',
    '/admin/dashboard',
    '/admin/navigation'
  )

  // 去除route.path最后的斜杠
  let routePath = route.path
  if (routePath.endsWith('/')) {
    routePath = route.path.slice(0, -1)
  }

  // 没有特定页面的访问权限
  if (!allowPages.includes(routePath)) {
    redirect('/admin')
  }
}
