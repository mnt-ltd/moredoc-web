import service from '~/utils/request'

export const listUserVip = (params) => {
  return service({
    url: '/api/v1/uservip/list',
    method: 'get',
    params,
  })
}


