export const userStatusOptions = [
  { label: '正常', value: 0 },
  { label: '禁用', value: 1 },
  { label: '审核中', value: 2 },
  { label: '拒绝', value: 3 },
  { label: '忽略', value: 4 },
]

export const attachmentTypeOptions = [
  { label: '未知', value: 0 },
  { label: '头像', value: 1 },
  { label: '文档', value: 2 },
  { label: '文章', value: 3 },
  { label: '评论', value: 4 },
  { label: '轮播图', value: 5 },
  { label: '分类封面', value: 6 },
  { label: '配置', value: 7 },
  { label: '爬虫文档', value: 8 },
]

export const documentStatusOptions = [
  { label: '待转换', value: 0, type: 'info' },
  { label: '转换中', value: 1, type: 'primary' },
  { label: '已转换', value: 2, type: 'success' },
  { label: '转换失败', value: 3, type: 'warning' },
  { label: '已禁用', value: 4, type: 'danger' },
  { label: '重新转换', value: 5, type: 'info' },
  { label: '待审核', value: 6, type: 'warning' },
  { label: '审核拒绝', value: 7, type: 'danger' },
]

// 0 网站轮播图，1 小程序轮播图，2 APP轮播图
export const bannerTypeOptions = [
  { label: '网站轮播图', value: 0, type: 'primary' },
  { label: '小程序轮播图', value: 1, type: 'success' },
  { label: 'APP轮播图', value: 2, type: 'warning' },
]

export const boolOptions = [
  { label: '是', value: true, type: 'success' },
  { label: '否', value: false, type: 'danger' },
]

export const reportOptions = [
  { label: '垃圾广告', value: 1 },
  { label: '淫秽色情', value: 2 },
  { label: '虚假中奖', value: 3 },
  { label: '敏感信息', value: 4 },
  { label: '人身攻击', value: 5 },
  { label: '骚扰他人', value: 6 },
]

export const methodOptions = [
  {
    label: 'GET',
    value: 'GET',
    type: 'success',
  },
  {
    label: 'POST',
    value: 'POST',
    type: 'primary',
  },
  {
    label: 'PUT',
    value: 'PUT',
    type: 'warning',
  },
  {
    label: 'DELETE',
    value: 'DELETE',
    type: 'danger',
  },
  {
    label: 'GRPC',
    value: 'GRPC',
    type: 'primary',
  },
]

export const orderStatusOptions = [
  { label: '待支付', name: 'pending', value: 1, type: 'danger' },
  { label: '已支付', name: 'paid', value: 2, type: 'success' },
  { label: '已关闭', name: 'closed', value: 3, type: 'info' },
]

export const orderTypeBuyDocument = 1 // 购买文档
export const orderTypeBuyVIP = 2 // 购买VIP
export const orderTypeRecharge = 3 // 充值
export const orderTypeWithdraw = 4 // 提现

// 支付方式
export const paymentTypeOptions = [
  { label: '微信支付', value: 1 },
  { label: '支付宝支付', value: 2 },
  { label: '银行卡', value: 3 },
  { label: '现金支付', value: 4 },
  { label: '积分支付', value: 5 },
  { label: '系统充值', value: 6 },
  { label: '虎皮椒支付', value: 8 },
  { label: '其他', value: 7 },
  { label: '下载码支付', value: 9 },
  { label: '广告支付', value: 10 },
]

export const orderTypeOptions = [
  { label: '购买文档', value: orderTypeBuyDocument },
  { label: '购买VIP', value: orderTypeBuyVIP },
  { label: '账户充值', value: orderTypeRecharge },
  // { label: '提现', value: orderTypeWithdraw },
]
export const datetimePickerOptions = {
  shortcuts: [
    {
      text: '最近一周',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        picker.$emit('pick', [start, end])
      },
    },
    {
      text: '最近一个月',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        picker.$emit('pick', [start, end])
      },
    },
    {
      text: '最近三个月',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        picker.$emit('pick', [start, end])
      },
    },
    {
      text: '最近半年',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
        picker.$emit('pick', [start, end])
      },
    },
    {
      text: '最近一年',
      onClick(picker) {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
        picker.$emit('pick', [start, end])
      },
    },
  ],
}

export const spiderUrlStatusOptions = [
  { label: '待采集', value: 0, type: 'info' },
  { label: '采集中', value: 1, type: 'primary' },
  { label: '采集完成', value: 2, type: 'success' },
  { label: '采集失败', value: 3, type: 'warning' },
]

export const spiderDocumentStatusOptions = [
  { label: '待下载', value: 0, type: 'info' },
  { label: '下载队列', value: 1, type: 'primary' },
  { label: '下载中..', value: 2, type: 'primary' },
  { label: '下载成功', value: 3, type: 'success' },
  { label: '下载失败', value: 4, type: 'warning' },
  { label: '发布队列', value: 5, type: 'primary' },
  { label: '发布中', value: 6, type: 'primary' },
  { label: '发布成功', value: 7, type: 'success' },
  { label: '发布失败', value: 8, type: 'danger' },
]

export const datetimePickerPunishmentOptions = {
  shortcuts: [
    {
      text: '1小时',
      onClick(picker) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000)
        picker.$emit('pick', end)
      },
    },
    {
      text: '12小时',
      onClick(picker) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 12)
        picker.$emit('pick', end)
      },
    },
    {
      text: '1天',
      onClick(picker) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24)
        picker.$emit('pick', end)
      },
    },
    {
      text: '2天',
      onClick(picker) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 2)
        picker.$emit('pick', end)
      },
    },
    {
      text: '1周',
      onClick(picker) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 7)
        picker.$emit('pick', end)
      },
    },
    {
      text: '1月',
      onClick(picker) {
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 30)
        picker.$emit('pick', end)
      },
    },
    {
      text: '半年',
      onClick(picker) {
        const start = new Date()
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 183)
        picker.$emit('pick', [start, end])
      },
    },
    {
      text: '1年',
      onClick(picker) {
        const start = new Date()
        const end = new Date()
        end.setTime(end.getTime() + 3600 * 1000 * 24 * 365)
        picker.$emit('pick', [start, end])
      },
    },
  ],
}

export const punishmentTypeOptions = [
  { label: '禁用账户', value: 1, type: 'danger' },
  { label: '禁止评论', value: 2, type: 'warning' },
  { label: '禁止上传', value: 3, type: 'warning' },
  { label: '禁止下载', value: 4, type: 'warning' },
  { label: '禁止收藏', value: 5, type: 'warning' },
  { label: '禁止发布文章', value: 6, type: 'warning' },
]

export const vipTypeOptions = [
  {
    label: '年卡VIP',
    value: 0,
    type: 'success',
  },
  {
    label: '季卡VIP',
    value: 1,
    type: 'primary',
  },
  {
    label: '月卡VIP',
    value: 2,
    type: 'warning',
  },
]

// 短信类型
export const smsTypeOptions = [
  { label: '注册', value: 0, type: 'primary' },
  { label: '登录', value: 1, type: 'success' },
  { label: '找回密码', value: 2, type: 'warning' },
]

// 短信状态
export const smsStatusOptions = [
  { label: '发送中', value: 0, type: 'primary' },
  { label: '发送成功', value: 1, type: 'success' },
  { label: '发送失败', value: 2, type: 'danger' },
]

// 短信服务商
export const smsProviderOptions = [
  { label: '阿里云', value: 'smsAliyun', type: 'primary' },
  { label: '腾讯云', value: 'smsTencent', type: 'primary' },
  { label: '百度云', value: 'smsBaidu', type: 'primary' },
  { label: '华为云', value: 'smsHuawei', type: 'primary' },
  { label: '浩信', value: 'smsHaomas', type: 'primary' },
]

// // Oauth 类型
// enum OauthType {
//   Unknown = 0;
//   QQ = 1;
//   WECHAT = 2;
//   GITEE = 3;
//   GITHUB = 4;
//   WECHAT_MINI = 5;
//   CUSTOM = 6;
// }

export const oauthTypeQQ = 1
export const oauthTypeWechat = 2
export const oauthTypeGitee = 3
export const oauthTypeGithub = 4
export const oauthTypeWechatMini = 5
export const oauthTypeCustom = 6
export const oauthTypeGoogle = 7
export const oauthTypeOfficialAccount = 8

export const oauthTypeOptions = [
  { label: 'QQ', value: oauthTypeQQ },
  { label: '微信', value: oauthTypeWechat },
  { label: '公众号', value: oauthTypeOfficialAccount },
  { label: '码云', value: oauthTypeGitee },
  { label: 'Github', value: oauthTypeGithub },
  { label: '微信小程序', value: oauthTypeWechatMini },
  { label: '谷歌', value: oauthTypeGoogle },
  { label: '自定义', value: oauthTypeCustom },
]

// 广告位置
export const advertisementPositions = [
  {
    label: '全局广告',
    value: 'global',
    description: '网站全局广告，所有页面都会显示',
    children: [
      {
        label: '全局底部',
        value: 'global_bottom',
        description: '网站全局底部，所有页面都会显示',
      },
      {
        label: '全局顶部',
        value: 'global_top',
        description: '网站全局顶部，所有页面都会显示',
      },
    ],
  },
  {
    label: '首页',
    value: 'index',
    description: '网站首页，只有首页会显示',
    children: [
      {
        label: '首页轮播图下方',
        value: 'index_banner_bottom',
        description: '网站首页轮播图下方，只有首页会显示',
      },
      {
        label: '首页分类上方',
        value: 'index_category_top',
        description: '网站首页分类上方，只有首页会显示',
      },
      {
        label: '首页分类下方',
        value: 'index_category_bottom',
        description: '网站首页分类下方，只有首页会显示',
      },
      {
        label: '首页友链上方',
        value: 'index_link_top',
        description: '网站首页友链上方，只有首页会显示',
      },
    ],
  },
  {
    label: '列表页',
    value: 'list',
    description: '网站列表页，只有列表页会显示',
    children: [
      {
        label: '列表页导航下方',
        value: 'list_nav_bottom',
        description: '网站列表页导航下方，只有列表页会显示',
      },
      {
        label: '列表页文档列表上方',
        value: 'list_document_top',
        description: '网站列表页文档列表内容上方，只有列表页会显示',
      },
      {
        label: '列表页文档列表下方',
        value: 'list_document_bottom',
        description: '网站列表页文档列表内容下方，只有列表页会显示',
      },
    ],
  },
  {
    label: '文档浏览页',
    value: 'document',
    description: '网站文档浏览页，只有文档浏览页会显示',
    children: [
      {
        label: '文档浏览页顶部',
        value: 'document_top',
        description: '网站文档浏览页顶部，只有文档浏览页会显示',
      },
      {
        label: '文档浏览页评论顶部',
        value: 'document_bottom',
        description: '文档浏览页评论顶部，只有文档浏览页会显示',
      },
      {
        label: '文档浏览页页间',
        value: 'document_between',
        description: '网站文档浏览页页间，只有文档浏览页会显示',
      },
    ],
  },
  {
    label: '个人主页',
    value: 'user',
    description: '网站个人主页，只有个人主页会显示',
    children: [
      {
        label: '个人主页顶部',
        value: 'user_top',
        description: '网站个人主页顶部，只有个人主页会显示',
      },
      {
        label: '个人主页文档列表顶部',
        value: 'user_document_top',
        description: '网站个人主页文档列表顶部，只有个人主页会显示',
      },
    ],
  },
  {
    label: '搜索结果页',
    value: 'search',
    description: '网站搜索结果页，只有搜索结果页会显示',
    children: [
      {
        label: '搜索结果页顶部',
        value: 'search_top',
        description: '网站搜索结果页顶部，只有搜索结果页会显示',
      },
      {
        label: '搜索结果页底部',
        value: 'search_bottom',
        description: '网站搜索结果页底部，只有搜索结果页会显示',
      },
      {
        label: '搜索结果页右侧',
        value: 'search_right',
        description: '网站搜索结果页右侧，只有搜索结果页会显示',
      },
    ],
  },
]

export const categoryTypeDocument = 0
export const categoryTypeArticle = 1

export const categoryTypeOptions = [
  { label: '文档', value: categoryTypeDocument, type: 'primary' },
  { label: '文章', value: categoryTypeArticle, type: 'success' },
]

export const articleStatusOptions = [
  { label: '待审核', value: 0, type: 'info' },
  { label: '审核通过', value: 1, type: 'success' },
  { label: '审核拒绝', value: 2, type: 'danger' },
]
