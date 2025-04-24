import service from '~/utils/request'

export const loginOauth = (data) => {
  return service({
    url: '/api/v1/oauth/login',
    method: 'post',
    data,
  })
}

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

export const loginWechatmp = (data) => {
  return service({
    url: '/api/v1/oauth/wechatmp/login',
    method: 'post',
    data,
  })
}

export const getWxshareSignature = (params) => {
  return service({
    url: '/api/v1/oauth/wxshare/signature',
    method: 'get',
    params,
  })
}

export const loginWechatmpScan = (data) => {
  return service({
    url: '/api/v1/oauth/wechatmp/scan/login',
    method: 'post',
    data,
  })
}

export const getWechatmpScanCode = (params) => {
  return service({
    url: '/api/v1/oauth/wechatmp/scan/code',
    method: 'get',
    params,
  })
}

export const checkWechatmpScanStatus = (data) => {
  return service({
    url: '/api/v1/oauth/wechatmp/scan/login/status',
    method: 'post',
    data,
  })
}
