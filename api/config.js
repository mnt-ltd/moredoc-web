import service from '~/utils/request'

export const updateConfig = (data) => {
  return service({
    url: '/api/v1/config',
    method: 'put',
    data,
  })
}

export const updateSitemap = (data) => {
  return service({
    url: '/api/v1/sitemap',
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

export const getSettings = () => {
  return service({
    url: '/api/v1/settings',
    method: 'get',
  })
}

export const getStats = () => {
  return service({
    url: '/api/v1/stats',
    method: 'get',
  })
}

export const getEnvs = () => {
  return service({
    url: '/api/v1/envs',
    method: 'get',
  })
}

export const getDevice = () => {
  return service({
    url: '/api/v1/device',
    method: 'get',
  })
}

export const setSQLMode = (data) => {
  return service({
    url: '/api/v1/sqlmode',
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

export const refreshLatestRelease = () => {
  return service({
    url: '/api/v1/release',
    method: 'post',
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
