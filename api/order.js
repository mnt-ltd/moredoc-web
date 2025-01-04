import service from '~/utils/request'

export const systemRecharge = (data) => {
  return service({
    url: '/api/v1/order/system/recharge',
    method: 'post',
    data,
  })
}

export const createOrder = (data) => {
  return service({
    url: '/api/v1/order',
    method: 'post',
    data,
  })
}

export const getOrder = (params) => {
  return service({
    url: '/api/v1/order',
    method: 'get',
    params,
  })
}

export const deleteOrder = (params) => {
  return service({
    url: '/api/v1/order',
    method: 'delete',
    params,
  })
}

export const getOrderStatus = (params) => {
  return service({
    url: '/api/v1/order/status',
    method: 'get',
    params,
  })
}

export const listOrder = (params) => {
  return service({
    url: '/api/v1/order/list',
    method: 'get',
    params,
  })
}

export const payOrder = (data) => {
  return service({
    url: '/api/v1/order/pay',
    method: 'post',
    data,
  })
}

export const closeOrder = (data) => {
  return service({
    url: '/api/v1/order/close',
    method: 'put',
    data,
  })
}

export const creditRecharge = (data) => {
  return service({
    url: '/api/v1/order/recharge',
    method: 'post',
    data,
  })
}
