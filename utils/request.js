import axios from 'axios'
import qs from 'qs'
import Cookies from 'js-cookie'
import store from '~/store/index'

// 创建 axios 实例的辅助函数
const createAxiosInstance = ($axios) => {
  // 克隆一个新的 axios 实例，而不是直接修改 $axios
  const instance = $axios.create()

  // 配置参数序列化
  instance.defaults.paramsSerializer = (params) => {
    // 序列化参数，防止params = {status: [1,2]} 这样的参数解析成 status[]=1&status[]=2，后端无法解析。
    // 使用当前qs序列化，上述参数会被处理为 status=1&status=2
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }

  // 设置超时时间
  instance.defaults.timeout = 30000

  return instance
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

// 默认 service 实例（将在插件中初始化）
let service = null

// 初始化 service 的函数（将在插件中调用）
export const initService = ($axios, headers = {}) => {
  service = createAxiosInstance($axios)

  // 请求拦截器
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

      config.headers = {
        ...config.headers,
        ...config.headers.common,
        ...headers,
      }

      if (config.headers['x-forwarded-host']) {
        config.headers.host = config.headers['x-forwarded-host']
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  service.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      return {
        status: error.response?.status,
        data:
          error.response?.data && error.response.data.message
            ? error.response.data
            : {
                message: `${error.response?.status || 'Unknown'} ${
                  error.response?.statusText || 'Error'
                } ${error.response?.data || ''}`,
              },
      }
    }
  )

  return service
}

// 获取 service 实例的函数
export const getService = () => {
  if (!service) {
    throw new Error('Service not initialized. Please call initService first.')
  }
  return service
}

// 创建一个函数代理，支持作为函数调用和访问属性
const createServiceProxy = () => {
  const proxyFunction = function (...args) {
    // 当作为函数调用时，直接调用 service 实例
    const serviceInstance = getService()
    return serviceInstance(...args)
  }

  // 使用 Proxy 包装这个函数，以支持属性访问
  return new Proxy(proxyFunction, {
    get(target, prop) {
      const serviceInstance = getService()
      const value = serviceInstance[prop]

      if (typeof value === 'function') {
        return value.bind(serviceInstance)
      }
      return value
    },

    set(target, prop, value) {
      const serviceInstance = getService()
      serviceInstance[prop] = value
      return true
    },
  })
}

export default createServiceProxy()
