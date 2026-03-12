import service from '~/utils/request'

export const createSpiderArticleList = (data) => {
  return service({
    url: '/api/v1/spiderarticle/source',
    method: 'post',
    data,
  })
}

export const updateSpiderArticleList = (data) => {
  return service({
    url: '/api/v1/spiderarticle/source',
    method: 'put',
    data: { spider_article_list: data },
  })
}

export const deleteSpiderArticleList = (params) => {
  return service({
    url: '/api/v1/spiderarticle/source',
    method: 'delete',
    params,
  })
}

export const getSpiderArticleList = (params) => {
  return service({
    url: '/api/v1/spiderarticle/source',
    method: 'get',
    params,
  })
}

export const listSpiderArticleList = (params) => {
  return service({
    url: '/api/v1/spiderarticle/source/list',
    method: 'get',
    params,
  })
}

export const batchSetSpiderArticleListStatus = (data) => {
  return service({
    url: '/api/v1/spiderarticle/source/status',
    method: 'put',
    data,
  })
}

export const updateSpiderArticleDetail = (data) => {
  return service({
    url: '/api/v1/spiderarticle/detail',
    method: 'put',
    data: { spider_article_detail: data },
  })
}

export const batchUpdateSpiderArticleDetail = (data) => {
  return service({
    url: '/api/v1/spiderarticle/detail/batch',
    method: 'put',
    data,
  })
}

export const deleteSpiderArticleDetail = (params) => {
  return service({
    url: '/api/v1/spiderarticle/detail',
    method: 'delete',
    params,
  })
}

export const getSpiderArticleDetail = (params) => {
  return service({
    url: '/api/v1/spiderarticle/detail',
    method: 'get',
    params,
  })
}

export const listSpiderArticleDetail = (params) => {
  return service({
    url: '/api/v1/spiderarticle/detail/list',
    method: 'get',
    params,
  })
}
