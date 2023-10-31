import service from '~/utils/request'

export const createSpiderUrl = (data) => {
  return service({
    url: '/api/v1/spiderurl',
    method: 'post',
    data,
  })
}

export const updateSpiderUrl = (data) => {
  return service({
    url: '/api/v1/spiderurl',
    method: 'put',
    data,
  })
}

export const deleteSpiderUrl = (params) => {
  return service({
    url: '/api/v1/spiderurl',
    method: 'delete',
    params,
  })
}

export const getSpiderUrl = (params) => {
  return service({
    url: '/api/v1/spiderurl',
    method: 'get',
    params,
  })
}

export const listSpiderUrl = (params) => {
  return service({
    url: '/api/v1/spiderurl/list',
    method: 'get',
    params,
  })
}


