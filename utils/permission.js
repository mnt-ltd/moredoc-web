// 这里前端维护映射关系，后端只需要返回权限列表即可
// Key 为组，对象为权限相关名称
const cumstomPermissionMap = {
  'api.v1.DocumentAPI': {
    label: '文档管理',
    path: 'ListDocument',
    children: [],
    pages: ['/admin/document', '/admin/document/list'],
  },
  'api.v1.RecycleAPI': {
    label: '回收站管理',
    path: 'ListRecycleDocument',
    children: [],
    pages: ['/admin/document', '/admin/document/recycle'],
  },
  'api.v1.SearchRecordAPI': {
    label: '搜索记录管理',
    path: 'ListSearchRecord',
    children: [],
    pages: ['/admin/document', '/admin/document/searchrecord'],
  },
  'api.v1.LanguageAPI': {
    label: '语言管理',
    path: 'ListLanguage',
    children: [],
    pages: ['/admin/document', '/admin/document/language'],
  },
  'api.v1.CategoryAPI': {
    label: '分类管理',
    path: 'ListCategory',
    children: [],
    pages: ['/admin/document', '/admin/document/category'],
  },
  'api.v1.UserAPI': {
    label: '用户管理',
    path: 'ListUser',
    children: [],
    pages: ['/admin/user', '/admin/user/list'],
  },
  'api.v1.FriendlinkAPI': {
    label: '友链管理',
    path: 'ListFriendlink',
    children: [],
    pages: ['/admin/friendlink'],
  },
  'api.v1.AttachmentAPI': {
    label: '附件管理',
    path: 'ListAttachment',
    children: [],
    pages: ['/admin/attachment'],
  },
  'api.v1.ReportAPI': {
    label: '举报管理',
    path: 'ListReport',
    children: [],
    pages: ['/admin/report'],
  },
  'api.v1.BannerAPI': {
    label: '横幅管理',
    path: 'ListBanner',
    children: [],
    pages: ['/admin/banner'],
  },
  'api.v1.GroupAPI': {
    label: '角色管理',
    path: 'ListGroup',
    children: [],
    pages: ['/admin/user', '/admin/user/group'],
  },
  'api.v1.PermissionAPI': {
    label: '权限管理',
    path: 'ListPermission',
    children: [],
    pages: ['/admin/user', '/admin/user/permission'],
  },
  'api.v1.AdvertisementAPI': {
    label: '广告管理',
    path: 'ListAdvertisement',
    children: [],
    pages: ['/admin/advertisement'],
  },
  'api.v1.ConfigAPI': {
    label: '系统设置',
    path: 'ListConfig',
    children: [],
    pages: [
      '/admin/config',
      '/admin/config/system',
      '/admin/config/display',
      '/admin/config/footer',
      '/admin/config/security',
      '/admin/config/converter',
      '/admin/config/download',
      '/admin/config/score',
      '/admin/config/email',
      '/admin/config/captcha',
    ],
  },
  'api.v1.ArticleAPI': {
    label: '文章管理',
    path: 'ListArticle',
    children: [],
    pages: ['/admin/article', '/admin/article/set'],
  },
  'api.v1.CommentAPI': {
    label: '评论管理',
    path: 'ListComment',
    children: [],
    pages: ['/admin/comment'],
  },
  'api.v1.PunishmentAPI': {
    label: '惩罚管理',
    path: 'ListPunishment',
    children: [],
    pages: ['/admin/user/punishment'],
  },
  upload: {
    id: 0,
    label: '上传管理',
    children: [],
  },
}

// 权限树
export const permissionsToTree = (permissions) => {
  const tree = []
  const permissionMap = JSON.parse(JSON.stringify(cumstomPermissionMap))
  permissions.forEach((permission) => {
    const slice = permission.path.split('/')
    // GRPC和HTTP要分开处理。method===GRPC的，为grpc接口，其他均为HTTP
    if (permission.method === 'GRPC') {
      if (!permissionMap[slice[1]]) {
        permissionMap[slice[1]] = {
          children: [],
        }
      }
      if (slice[2] === permissionMap[slice[1]].path) {
        permissionMap[slice[1]].id = permission.id
      }
      permissionMap[slice[1]].children.push({
        ...permission,
        label: permission.title || permission.path,
      })
    } else {
      if (!permissionMap[slice[3]]) {
        permissionMap[slice[3]] = {
          children: [],
          label: slice[3],
        }
      }
      permissionMap[slice[3]].children.push({
        ...permission,
        label: permission.title || permission.path,
      })
    }
  })
  Object.keys(permissionMap).forEach((key) => {
    tree.push(permissionMap[key])
  })
  return tree
}

// 管理员菜单
export const adminMenus = [
  {
    page: '/admin/document',
    title: '文档管理',
    icon: 'el-icon-document-copy',
    children: [
      {
        page: '/admin/document/category',
        title: '分类管理',
        icon: 'el-icon-s-grid',
      },
      {
        page: '/admin/document/list',
        title: '文档列表',
        icon: 'el-icon-tickets',
      },
      {
        page: '/admin/document/language',
        title: '语言管理',
        icon: 'fa fa-language',
      },
      {
        page: '/admin/document/searchrecord',
        title: '搜索记录',
        icon: 'el-icon-search',
      },
      {
        page: '/admin/document/recycle',
        title: '回收站',
        icon: 'el-icon-delete',
      },
    ],
  },
  {
    page: '/admin/user',
    title: '用户管理',
    icon: 'el-icon-user',
    children: [
      {
        page: '/admin/user/list',
        title: '用户管理',
        icon: 'el-icon-user',
      },
      {
        page: '/admin/user/group',
        title: '角色管理',
        icon: 'el-icon-magic-stick',
      },
      {
        page: '/admin/user/permission',
        title: '权限管理',
        icon: 'el-icon-circle-check',
      },
      {
        page: '/admin/user/punishment',
        title: '处罚管理',
        icon: 'el-icon-warning-outline',
      },
    ],
  },
  {
    page: '/admin/banner',
    title: '横幅管理',
    icon: 'el-icon-picture-outline',
  },
  {
    page: '/admin/navigation',
    title: '导航管理',
    icon: 'el-icon-monitor',
    is_public: true,
  },
  {
    page: '/admin/article',
    title: '文章管理',
    icon: 'el-icon-discover',
  },
  {
    page: '/admin/friendlink',
    title: '友链管理',
    icon: 'el-icon-link',
  },
  {
    page: '/admin/comment',
    title: '评论管理',
    icon: 'el-icon-chat-dot-square',
  },
  {
    page: '/admin/report',
    title: '举报管理',
    icon: 'el-icon-warning-outline',
  },
  {
    title: '广告管理',
    page: '/admin/advertisement',
    icon: 'el-icon-s-flag',
  },
  {
    page: '/admin/attachment',
    title: '附件管理',
    icon: 'el-icon-paperclip',
  },
  {
    page: '/admin/config',
    title: '系统设置',
    icon: 'el-icon-setting',
    children: [
      {
        title: '系统配置',
        page: '/admin/config/system',
        icon: 'el-icon-setting',
      },
      {
        title: '展示配置',
        page: '/admin/config/display',
        icon: 'el-icon-s-platform',
      },
      {
        title: '底链配置',
        page: '/admin/config/footer',
        icon: 'el-icon-link',
      },
      {
        title: '验证码配置',
        page: '/admin/config/captcha',
        icon: 'el-icon-postcard',
      },
      {
        title: '安全配置',
        page: '/admin/config/security',
        icon: 'el-icon-coffee-cup',
      },
      {
        title: '转换配置',
        page: '/admin/config/converter',
        icon: 'el-icon-refresh',
      },
      {
        title: '下载配置',
        page: '/admin/config/download',
        icon: 'el-icon-download',
      },
      {
        title: '积分配置',
        page: '/admin/config/score',
        icon: 'el-icon-coin',
      },
      {
        title: '邮箱配置',
        page: '/admin/config/email',
        icon: 'el-icon-message',
      },
    ],
  },
]
