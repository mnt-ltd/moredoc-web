import axios from 'axios' // 引入axios
import store from '~/store/index'
const cancelToken = axios.CancelToken // 取消请求

// 只在客户端设置取消上传文件请求
if (process.client) {
  window.uploadDocumentCancel = []
}

const fileService = axios.create({
  timeout: 6000000, // 文件上传超时时间，100分钟
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

fileService.interceptors.request.use(
  (config) => {
    const token = store().getters['user/token'] || ''
    if (token) config.headers.authorization = `Bearer ${token}`
    config.cancelToken = new cancelToken((c) => {
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
