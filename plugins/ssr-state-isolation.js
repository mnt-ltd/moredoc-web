export default function (context) {
  // 只在服务端运行
  if (!process.server) {
    return
  }

  const { store, $cookies, req } = context

  // 为每个服务端请求创建唯一标识（用于调试）
  const requestId = Math.random().toString(36).substr(2, 9)

  // 开发环境日志
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SSR-${requestId}] 处理服务端请求`)
  }

  // 检查当前请求的 token
  const currentToken = $cookies.get('token') || ''
  const storeToken = store.getters['user/token'] || ''

  // 如果没有有效的 token，强制清空用户状态
  if (!currentToken) {
    store.commit('user/logout')
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SSR-${requestId}] 没有 token，清空用户状态`)
    }
    return
  }

  // 检查 store 中的 token 是否与当前请求的 token 一致
  if (storeToken && storeToken !== currentToken) {
    // 如果不一致，清空状态并重新设置
    store.commit('user/logout')
    store.commit('user/setToken', currentToken)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SSR-${requestId}] Token 不一致，重置状态`)
    }
  }

  // 添加请求完成后的清理工作
  if (req && req.on) {
    req.on('close', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SSR-${requestId}] 请求完成，清理状态`)
      }
    })
  }
}
