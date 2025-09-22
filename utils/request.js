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

// 删除下划线的无效参数
const removeUnderscoreParams = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUnderscoreParams(item))
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {}
    Object.keys(obj).forEach((key) => {
      if (!key.startsWith('_')) {
        newObj[key] = removeUnderscoreParams(obj[key])
      }
    })
    return newObj
  }
  return obj
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
    try {
      token = store().getters['user/token'] || Cookies.get('token') || ''
    } catch (error) {
      console.log('获取token失败:', error)
    }
    if (token) {
      config.headers.authorization = `Bearer ${token}`
    }

    let headers = {}
    if (config.params && config.params._headers) {
      headers = { ...config.params._headers }
    }
    if (config.data && config.data._headers) {
      headers = { ...headers, ...config.data._headers }
    }

    config.headers = { ...config.headers, ...headers }
    config.params = removeUnderscoreParams(config.params)
    config.data = removeUnderscoreParams(config.data)
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
