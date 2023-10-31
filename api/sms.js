import service from '~/utils/request'

export const getSms = (params) => {
  return service({
    url: '/api/v1/sms',
    method: 'get',
    params,
  })
}

export const listSms = (params) => {
  return service({
    url: '/api/v1/sms/list',
    method: 'get',
    params,
  })
}

export const sendSMS = (data) => {
  return service({
    url: '/api/v1/sms',
    method: 'post',
    data,
  })
}
