import service from '~/utils/request'

export const register = (data) => {
  return service({
    url: '/api/v1/user/register',
    method: 'post',
    data,
  })
}

export const login = (data) => {
  return service({
    url: '/api/v1/user/login',
    method: 'post',
    data,
  })
}

export const logout = (params) => {
  return service({
    url: '/api/v1/user/logout',
    method: 'delete',
    params,
  })
}

export const getUser = (params) => {
  return service({
    url: '/api/v1/user',
    method: 'get',
    params,
  })
}

export const canIUploadDocument = () => {
  return service({
    url: '/api/v1/user/caniuploaddocument',
    method: 'get',
  })
}

export const updateUserPassword = (data) => {
  return service({
    url: '/api/v1/user/password',
    method: 'put',
    data,
  })
}

export const updateUserProfile = (data) => {
  return service({
    url: '/api/v1/user/profile',
    method: 'put',
    data,
  })
}

export const deleteUser = (params) => {
  return service({
    url: '/api/v1/user',
    method: 'delete',
    params,
  })
}

export const addUser = (data) => {
  return service({
    url: '/api/v1/user',
    method: 'post',
    data,
  })
}

export const setUser = (data) => {
  return service({
    url: '/api/v1/user',
    method: 'put',
    data,
  })
}

export const listUser = (params) => {
  return service({
    url: '/api/v1/user/list',
    method: 'get',
    params,
  })
}

export const getUserCaptcha = (params) => {
  return service({
    url: '/api/v1/user/captcha',
    method: 'get',
    params,
  })
}

export const getDynamics = (params) => {
  return service({
    url: '/api/v1/user/dynamic',
    method: 'get',
    params,
  })
}

export const getUserDownloads = (params) => {
  return service({
    url: '/api/v1/user/download',
    method: 'get',
    params,
  })
}

export const getUserPermissions = (params) => {
  return service({
    url: '/api/v1/user/permission',
    method: 'get',
    params,
  })
}

export const getSignedToday = () => {
  return service({
    url: '/api/v1/user/sign',
    method: 'get',
  })
}

export const signToday = () => {
  return service({
    url: '/api/v1/user/sign',
    method: 'put',
  })
}

export const findPasswordStepOne = (data) => {
  return service({
    url: '/api/v1/user/findpassword/stepone',
    method: 'post',
    data,
  })
}

export const findPasswordStepTwo = (data) => {
  return service({
    url: '/api/v1/user/findpassword/steptwo',
    method: 'put',
    data,
  })
}

export const listUserOrder = (params) => {
  return service({
    url: '/api/v1/user/order',
    method: 'get',
    params,
  })
}

export const listUserVIP = (params) => {
  return service({
    url: '/api/v1/user/vip',
    method: 'get',
    params,
  })
}

export const getUserVIPOrder = (params) => {
  return service({
    url: '/api/v1/user/vip/order',
    method: 'get',
    params,
  })
}

export const registerByMobile = (data) => {
  return service({
    url: '/api/v1/user/register/mobile',
    method: 'post',
    data,
  })
}

export const loginByMobile = (data) => {
  return service({
    url: '/api/v1/user/login/mobile',
    method: 'post',
    data,
  })
}

export const findPasswordByMobile = (data) => {
  return service({
    url: '/api/v1/user/findpassword/mobile',
    method: 'post',
    data,
  })
}

export const listUserOauth = (params) => {
  return service({
    url: '/api/v1/user/oauth',
    method: 'get',
    params,
  })
}

export const deleteUserOauth = (params) => {
  return service({
    url: '/api/v1/user/oauth',
    method: 'delete',
    params,
  })
}

export const sendEmailCode = (data) => {
  return service({
    url: '/api/v1/user/email/code',
    method: 'post',
    data,
  })
}