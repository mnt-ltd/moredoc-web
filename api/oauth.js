import service from '~/utils/request'

export const loginOauthQQ = (data) => {
  return service({
    url: '/api/v1/oauth/qq',
    method: 'post',
    data,
  })
}

export const loginOauthWechat = (data) => {
  return service({
    url: '/api/v1/oauth/wechat',
    method: 'post',
    data,
  })
}

export const loginOauthGitee = (data) => {
  return service({
    url: '/api/v1/oauth/gitee',
    method: 'post',
    data,
  })
}

export const loginOauthGithub = (data) => {
  return service({
    url: '/api/v1/oauth/github',
    method: 'post',
    data,
  })
}

export const loginOauthWechatMini = (data) => {
  return service({
    url: '/api/v1/oauth/wechat/mini',
    method: 'post',
    data,
  })
}

export const loginOauthCustom = (data) => {
  return service({
    url: '/api/v1/oauth/custom',
    method: 'post',
    data,
  })
}

export const getEnableOauths = (params) => {
  return service({
    url: '/api/v1/oauths',
    method: 'get',
    params,
  })
}


