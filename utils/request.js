import axios from 'axios' // 引入axios
import qs from 'qs'
import Cookies from 'js-cookie'
import store from '~/store/index'

// 创建带上下文的服务实例
export const createServiceWithContext = (context) => {
  const contextService = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
    paramsSerializer(params) {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    },
  })

  // 请求拦截器
  contextService.interceptors.request.use(
    (config) => {
      let token = ''

      if (process.server && context && context.$cookies) {
        // 服务端直接从请求的 cookie 中获取 token，避免状态共享
        token = context.$cookies.get('token') || ''
      } else if (process.client) {
        // 客户端从 store 或 cookie 获取
        token = store().getters['user/token'] || Cookies.get('token') || ''
      }

      if (token) {
        config.headers.authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  contextService.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      return {
        status: error.response.status,
        data:
          error.response.data && error.response.data.message
            ? error.response.data
            : {
                message: `${error.response.status} ${
                  error.response.statusText
                } ${error.response.data || ''}`,
              },
      }
    }
  )

  return contextService
}

// SSR 环境下的 baseURL 配置
const getBaseURL = () => {
  // 在服务端渲染时，使用完整的后端 URL
  if (process.server) {
    return process.env.API_BASE_URL || ''
  }
  // 在客户端，使用相对路径（通过代理）
  return ''
}

const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  withCredentials: true, // 发送跨域请求时携带cookie
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer(params) {
    // 序列化参数，防止params = {status: [1,2]} 这样的参数解析成 status[]=1&status[]=2，后端无法解析。
    // 使用当前qs序列化，上述参数会被处理为 status=1&status=2
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
})

// http request 拦截器
service.interceptors.request.use(
  (config) => {
    let token = ''

    // 在服务端避免直接访问 store，使用默认行为
    if (process.server) {
      // 服务端不设置 token，由带上下文的服务处理
      token = ''
    } else {
      // 在客户端，优先从store获取，然后从cookie获取
      token = store().getters['user/token'] || Cookies.get('token') || ''
    }

    if (token) {
      config.headers.authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// http response 拦截器
service.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // console.log('error', error.response)
    return {
      status: error.response.status,
      data:
        error.response.data && error.response.data.message
          ? error.response.data
          : {
              message: `${error.response.status} ${error.response.statusText} ${
                error.response.data || ''
              }`,
            },
    }
  }
)

export default service
