import service from '~/utils/request'

export const deleteSearchRecord = (params) => {
  return service({
    url: '/api/v1/searchrecord',
    method: 'delete',
    params,
  })
}

export const listSearchRecord = (params) => {
  return service({
    url: '/api/v1/searchrecord/list',
    method: 'get',
    params,
  })
}


