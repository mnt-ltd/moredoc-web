import service from '~/utils/request'

export const search = (params) => {
  return service({
    url: '/api/v1/search',
    method: 'get',
    params,
  })
}
