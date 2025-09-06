import { createServiceWithContext } from '~/utils/request'

// 创建支持上下文的 API 函数
export const createContextualAPI = (context) => {
  const contextService = createServiceWithContext(context)

  return {
    getUser: (params) => {
      return contextService({
        url: '/api/v1/user',
        method: 'get',
        params,
      })
    },
    getUserPermissions: (params) => {
      return contextService({
        url: '/api/v1/user/permission',
        method: 'get',
        params,
      })
    },
    listUserGroup: (params) => {
      return contextService({
        url: '/api/v1/user/group',
        method: 'get',
        params,
      })
    },
  }
}
