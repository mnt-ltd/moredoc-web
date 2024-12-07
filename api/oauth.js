import service from '~/utils/request'

export const loginOauthQQ = (data) => {
  return service({
    url: '/api/v1/oauth/qq',
    method: 'post',
    data,
  })
}

export const loginOauth = (data) => {
  return service({
    url: '/api/v1/oauth/login',
    method: 'post',
    data,
  })
}

// 绑定oauth
export const bindOauth = (data) => {
  return service({
    url: '/api/v1/oauth/bind',
    method: 'post',
    data,
  })
}

export const getOauths = (params) => {
  return service({
    url: '/api/v1/oauth/configs',
    method: 'get',
    params,
  })
}

export const getWxshareSignature = (params) => {
  return service({
    url: '/api/v1/oauth/wxshare/signature',
    method: 'get',
    params,
  })
}
