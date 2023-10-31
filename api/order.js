import service from '~/utils/request'

// 创建订单
export const createOrder = (data) => {
  return service({
    method: 'POST',
    url: '/api/v1/order',
    data,
  })
}

export const createSystemRecharge = (data) => {
  return service({
    url: '/api/v1/order/system/recharge',
    method: 'post',
    data,
  })
}

// 查询订单
export const getOrder = (params) => {
  return service({
    method: 'GET',
    url: '/api/v1/order',
    params,
  })
}

// 查询订单状态
export const getOrderStatus = (params) => {
  return service({
    method: 'GET',
    url: '/api/v1/order/status',
    params,
  })
}

// 支付订单
export const payOrder = (data) => {
  return service({
    method: 'POST',
    url: '/api/v1/order/pay',
    data,
  })
}

// 关闭订单
export const closeOrder = (data) => {
  return service({
    method: 'PUT',
    url: '/api/v1/order/close',
    data,
  })
}

// 删除订单
export const deleteOrder = (params) => {
  return service({
    method: 'DELETE',
    url: '/api/v1/order',
    params,
  })
}

// 订单列表
export const listOrder = (params) => {
  return service({
    method: 'GET',
    url: '/api/v1/order/list',
    params,
  })
}
