import service from '~/utils/request'

export const createAdvertisement = (data) => {
  return service({
    url: '/api/v1/advertisement',
    method: 'post',
    data,
  })
}

export const updateAdvertisement = (data) => {
  return service({
    url: '/api/v1/advertisement',
    method: 'put',
    data,
  })
}

export const deleteAdvertisement = (params) => {
  return service({
    url: '/api/v1/advertisement',
    method: 'delete',
    params,
  })
}

export const getAdvertisement = (params) => {
  return service({
    url: '/api/v1/advertisement',
    method: 'get',
    params,
  })
}

export const getAdvertisementByPosition = (params) => {
  return service({
    url: '/api/v1/advertisement/position',
    method: 'get',
    params,
  })
}

export const listAdvertisement = (params) => {
  return service({
    url: '/api/v1/advertisement/list',
    method: 'get',
    params,
  })
}


