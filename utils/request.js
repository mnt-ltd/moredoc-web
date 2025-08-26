import axios from 'axios' // 引入axios
import qs from 'qs'
import Cookies from 'js-cookie'
import store from '~/store/index'

// SSR 环境下的 baseURL 配置
const getBaseURL = () => {
  // 在服务端渲染时，使用完整的后端 URL
  if (process.server) {
    return 'http://127.0.0.1:8880'
  }
  // 在客户端，使用相对路径（通过代理）
  return ''
}

const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
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
    const token = store().getters['user/token'] || Cookies.get('token') || ''
    if (token) config.headers.authorization = `Bearer ${token}`
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
    console.log('error', error.response)
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
