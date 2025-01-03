import service from '~/utils/request'

export const getSettings = (params) => {
  return service({
    url: '/api/v1/settings',
    method: 'get',
    params,
  })
}

export const getSettingsVIP = (params) => {
  return service({
    url: '/api/v1/settings/vip',
    method: 'get',
    params,
  })
}

export const getSettingsRecharge = (params) => {
  return service({
    url: '/api/v1/settings/recharge',
    method: 'get',
    params,
  })
}

export const updateConfig = (data) => {
  return service({
    url: '/api/v1/config',
    method: 'put',
    data,
  })
}

export const listConfig = (params) => {
  return service({
    url: '/api/v1/config/list',
    method: 'get',
    params,
  })
}

export const getStats = (params) => {
  return service({
    url: '/api/v1/stats',
    method: 'get',
    params,
  })
}

export const getEnvs = (params) => {
  return service({
    url: '/api/v1/envs',
    method: 'get',
    params,
  })
}

export const getLicense = (params) => {
  return service({
    url: '/api/v1/license',
    method: 'get',
    params,
  })
}

export const updateSitemap = (data) => {
  return service({
    url: '/api/v1/sitemap',
    method: 'put',
    data,
  })
}

export const getDeviceInfo = (params) => {
  return service({
    url: '/api/v1/device',
    method: 'get',
    params,
  })
}

export const getWechatPayCert = (params) => {
  return service({
    url: '/api/v1/wechatpay/cert',
    method: 'get',
    params,
  })
}

export const setSQLMode = (data) => {
  return service({
    url: '/api/v1/sqlmode',
    method: 'put',
    data,
  })
}

export const renewDocumentIndex = (data) => {
  return service({
    url: '/api/v1/renew/document/index',
    method: 'put',
    data,
  })
}

export const getLatestRelease = () => {
  return service({
    url: '/api/v1/release',
    method: 'get',
  })
}

export const refreshLatestRelease = (data) => {
  return service({
    url: '/api/v1/release',
    method: 'post',
    data,
  })
}

export const ignoreRelease = (data) => {
  return service({
    url: '/api/v1/release/ignore',
    method: 'put',
    data,
  })
}

export const setReleaseSource = (data) => {
  return service({
    url: '/api/v1/release/source',
    method: 'put',
    data,
  })
}
