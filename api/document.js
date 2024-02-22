import service from '~/utils/request'

export const createDocument = (data) => {
  return service({
    url: '/api/v1/document',
    method: 'post',
    data,
  })
}

export const updateDocument = (data) => {
  return service({
    url: '/api/v1/document',
    method: 'put',
    data,
  })
}

export const setDocumentRecommend = (data) => {
  return service({
    url: '/api/v1/document/recommend',
    method: 'put',
    data,
  })
}

export const setDocumentReconvert = (data) => {
  return service({
    url: '/api/v1/document/reconvert',
    method: 'put',
    data,
  })
}

export const deleteDocument = (params) => {
  return service({
    url: '/api/v1/document',
    method: 'delete',
    params,
  })
}

export const getDocument = (params) => {
  return service({
    url: '/api/v1/document',
    method: 'get',
    params,
  })
}

export const getRelatedDocuments = (params) => {
  return service({
    url: '/api/v1/document/related',
    method: 'get',
    params,
  })
}

export const listDocumentForHome = (params) => {
  return service({
    url: '/api/v1/document/home',
    method: 'get',
    params,
  })
}

export const listDocument = (params) => {
  return service({
    url: '/api/v1/document/list',
    method: 'get',
    params,
  })
}

export const searchDocument = (params) => {
  return service({
    url: '/api/v1/document/search',
    method: 'get',
    params,
  })
}

export const downloadDocument = (params) => {
  return service({
    url: '/api/v1/document/download',
    method: 'get',
    params,
  })
}

export const downloadVIPDocument = (params) => {
  return service({
    url: '/api/v1/document/download/vip',
    method: 'get',
    params,
  })
}

export const listRecycleDocument = (params) => {
  return service({
    url: '/api/v1/document/recycle',
    method: 'get',
    params,
  })
}

export const recoverRecycleDocument = (data) => {
  return service({
    url: '/api/v1/document/recycle',
    method: 'put',
    data,
  })
}

export const deleteRecycleDocument = (params) => {
  return service({
    url: '/api/v1/document/recycle',
    method: 'delete',
    params,
  })
}

export const clearRecycleDocument = (params) => {
  return service({
    url: '/api/v1/document/recycle/all',
    method: 'delete',
    params,
  })
}

export const updateDocumentIndexes = (data) => {
  return service({
    url: '/api/v1/document/index',
    method: 'put',
    data,
  })
}

export const getDocumentScore = (params) => {
  return service({
    url: '/api/v1/document/score',
    method: 'get',
    params,
  })
}

export const setDocumentScore = (data) => {
  return service({
    url: '/api/v1/document/score',
    method: 'post',
    data,
  })
}

export const isDocumentExist = (params) => {
  return service({
    url: '/api/v1/document/exist',
    method: 'get',
    params,
  })
}

export const setDocumentsCategory = (data) => {
  return service({
    url: '/api/v1/document/category',
    method: 'put',
    data,
  })
}

export const setDocumentsVIP = (data) => {
  return service({
    url: '/api/v1/document/vip',
    method: 'put',
    data,
  })
}

export const checkDocument = (data) => {
  return service({
    url: '/api/v1/document/check',
    method: 'put',
    data,
  })
}

export const downloadDocumentToBeReviewed = (params) => {
  return service({
    url: '/api/v1/document/download/bereviewed',
    method: 'get',
    params,
  })
}

export const setDocumentsLanguage = (data) => {
  return service({
    url: '/api/v1/document/language',
    method: 'put',
    data,
  })
}
