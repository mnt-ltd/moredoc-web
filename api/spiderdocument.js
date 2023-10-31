import service from '~/utils/request'

export const updateSpiderDocument = (data) => {
  return service({
    url: '/api/v1/spiderdocument',
    method: 'put',
    data,
  })
}

export const deleteSpiderDocument = (params) => {
  return service({
    url: '/api/v1/spiderdocument',
    method: 'delete',
    params,
  })
}

export const getSpiderDocument = (params) => {
  return service({
    url: '/api/v1/spiderdocument',
    method: 'get',
    params,
  })
}

export const listSpiderDocument = (params) => {
  return service({
    url: '/api/v1/spiderdocument/list',
    method: 'get',
    params,
  })
}

export const batchUpdateSpiderDocument = (data) => {
  return service({
    url: '/api/v1/spiderdocument/batch',
    method: 'put',
    data,
  })
}
