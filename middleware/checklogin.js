export default function ({ store, route, redirect }) {
  const user = store.getters['user/user'] || { id: 0 }
  const settings = store.getters['setting/settings'] || {}
  if (user.id) {
    const permissions = store.getters['user/permissions'] || []
    if (
      settings.security &&
      settings.security.is_close &&
      permissions.length === 0
    ) {
      // 关站了，且不是管理员
      // 修复SSR环境下route.name可能为undefined的问题
      if (route && route.name !== 'login') {
        redirect('/login')
      }
      return
    }
    redirect(`/user/${user.id}`)
  }
}
