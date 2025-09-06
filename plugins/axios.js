import { initService } from '~/utils/request'

export default function ({ $axios, req }) {
  // console.log('Axios plugin loaded. isDev:', isDev, req.headers)
  // 初始化 service
  const headers = req ? req.headers : {}
  initService($axios, headers)
}
