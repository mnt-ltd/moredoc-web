import axios from 'axios' // 引入axios
import Cookies from 'js-cookie'
import store from '~/store/index'
const CancelToken = axios.CancelToken // 取消请求

// 只在客户端设置取消上传文件请求
if (process.client) {
  window.uploadDocumentCancel = []
}

const fileService = axios.create({
  timeout: 6000000, // 文件上传超时时间，100分钟
  withCredentials: true, // 发送跨域请求时携带cookie
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

fileService.interceptors.request.use(
  (config) => {
    let token = ''

    // 在服务端，从store中获取token（通过nuxtServerInit设置）
    if (process.server) {
      token = store().getters['user/token'] || ''
    } else {
      // 在客户端，优先从store获取，然后从cookie获取
      token = store().getters['user/token'] || Cookies.get('token') || ''
    }

    if (token) {
      config.headers.authorization = `Bearer ${token}`
    }

    config.cancelToken = new CancelToken((c) => {
      // 只在客户端添加取消请求
      if (process.client && window.uploadDocumentCancel) {
        window.uploadDocumentCancel.push(c)
      }
    })
    return config
  },
  (error) => {
    // console.log('error', error)
    return Promise.reject(error)
  }
)

// http response 拦截器
fileService.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return error.response
  }
)

export default fileService
