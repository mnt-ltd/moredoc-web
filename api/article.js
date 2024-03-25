import service from '~/utils/request'

export const createArticle = (data) => {
  return service({
    url: '/api/v1/article',
    method: 'post',
    data,
  })
}

export const updateArticle = (data) => {
  return service({
    url: '/api/v1/article',
    method: 'put',
    data,
  })
}

export const deleteArticle = (params) => {
  return service({
    url: '/api/v1/article',
    method: 'delete',
    params,
  })
}

export const getArticle = (params) => {
  return service({
    url: '/api/v1/article',
    method: 'get',
    params,
  })
}

export const listArticle = (params) => {
  return service({
    url: '/api/v1/article/list',
    method: 'get',
    params,
  })
}

export const listRecycleArticle = (params) => {
  return service({
    url: '/api/v1/article/recycle/list',
    method: 'get',
    params,
  })
}

export const restoreRecycleArticle = (data) => {
  return service({
    url: '/api/v1/article/recycle/restore',
    method: 'post',
    data,
  })
}

export const deleteRecycleArticle = (params) => {
  return service({
    url: '/api/v1/article/recycle',
    method: 'delete',
    params,
  })
}

export const emptyRecycleArticle = (params) => {
  return service({
    url: '/api/v1/article/recycle/empty',
    method: 'delete',
    params,
  })
}

export const setArticlesCategory = (data) => {
  return service({
    url: '/api/v1/article/category',
    method: 'put',
    data,
  })
}

export const recommendArticles = (data) => {
  return service({
    url: '/api/v1/article/recommend',
    method: 'put',
    data,
  })
}

export const checkArticles = (data) => {
  return service({
    url: '/api/v1/article/check',
    method: 'put',
    data,
  })
}

export const getRelatedArticles = (params) => {
  return service({
    url: '/api/v1/article/related',
    method: 'get',
    params,
  })
}

export const searchArticle = (params) => {
  return service({
    url: '/api/v1/article/search',
    method: 'get',
    params,
  })
}
