import service from '~/utils/request'

export const createLanguage = (data) => {
  return service({
    url: '/api/v1/language',
    method: 'post',
    data,
  })
}

export const updateLanguage = (data) => {
  return service({
    url: '/api/v1/language',
    method: 'put',
    data,
  })
}

export const updateLanguageStatus = (data) => {
  return service({
    url: '/api/v1/language/status',
    method: 'put',
    data,
  })
}

export const listLanguage = (params) => {
  return service({
    url: '/api/v1/language/list',
    method: 'get',
    params,
  })
}

export const deleteLanguage = (params) => {
  return service({
    url: '/api/v1/language',
    method: 'delete',
    params,
  })
}
