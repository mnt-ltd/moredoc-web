<template>
  <div class="page page-index">
    <div class="searchbox">
      <el-carousel
        :interval="3000"
        arrow="always"
        :height="isMobile ? '250px' : '420px'"
        @change="changeCarousel"
      >
        <a
          v-for="(banner, index) in banners"
          :key="'banner-' + banner.id"
          :href="banner.url ? banner.url : 'javascript:;'"
          :target="banner.url ? '_blank' : ''"
          :title="banner.title"
        >
          <el-carousel-item
            :style="
              'background: url(' +
              (carouselIndexes.indexOf(index) > -1 ? banner.path : '') +
              ') center center no-repeat;'
            "
          ></el-carousel-item>
        </a>
      </el-carousel>
      <el-form :model="search" class="search-form" @submit.native.prevent>
        <el-form-item>
          <el-input
            v-model="search.wd"
            size="large"
            placeholder="搜索文档..."
            @keydown.native.enter="onSearch"
          >
            <i
              slot="suffix"
              class="el-input__icon el-icon-search btn-search"
              @click="onSearch"
            ></i>
          </el-input>
        </el-form-item>
        <el-form-item v-if="settings.system.recommend_words">
          <span class="hidden-xs-only recommend-label">大家在搜:</span>
          <div class="recommend-tags">
            <nuxt-link
              v-for="(word, index) in settings.system.recommend_words"
              :key="'kw-' + word"
              target="_blank"
              :to="{
                path: '/search',
                query: { wd: word },
              }"
              class="recommend-tag-link"
            >
              <el-tag
                size="small"
                :type="getTagType(index)"
                effect="plain"
                class="recommend-tag"
              >
                <i class="el-icon-search"></i> {{ word }}
              </el-tag>
            </nuxt-link>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'index_banner_bottom'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>

    <el-row :gutter="20" class="mgt-20px">
      <el-col :span="7" class="float-right right-at-recommend">
        <el-card
          v-if="user.id > 0"
          class="box-card hidden-xs-only login-form user-dashboard"
          shadow="never"
        >
          <el-row>
            <el-col :span="8">
              <nuxt-link :to="`/me`" target="_blank">
                <user-avatar :size="64" :user="user" />
              </nuxt-link>
            </el-col>
            <el-col :span="16">
              <nuxt-link
                class="el-link el-link--default"
                target="_blank"
                :to="`/me`"
              >
                <h3>{{ user.username }}</h3>
              </nuxt-link>
              <div class="help-block login-tips">
                <el-tag size="mini" type="info">{{
                  user.group_name || '普通用户'
                }}</el-tag>
              </div>
              <div class="user-stats">
                <el-row :gutter="10">
                  <el-col :span="8" class="text-center">
                    <div class="stat-number">{{ user.doc_count || 0 }}</div>
                    <div class="stat-label">文档</div>
                  </el-col>
                  <el-col :span="8" class="text-center">
                    <div class="stat-number">{{ user.credit || 0 }}</div>
                    <div class="stat-label">积分</div>
                  </el-col>
                  <el-col :span="8" class="text-center">
                    <div class="stat-number">{{ user.follow_count || 0 }}</div>
                    <div class="stat-label">关注</div>
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
          <div class="line"></div>
          <el-row :gutter="10" class="action-buttons">
            <el-col :span="12">
              <el-button
                v-if="sign.id > 0"
                :key="'sign-' + sign.id"
                size="small"
                type="success"
                disabled
                style="width: 100%"
              >
                <i class="fa fa-calendar-check-o" aria-hidden="true"></i>
                已签到
              </el-button>
              <el-button
                v-else
                :key="'sign-0'"
                size="small"
                type="success"
                style="width: 100%"
                @click="signToday"
              >
                <i class="fa fa-calendar-plus-o"></i>
                签到
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-dropdown trigger="click" style="width: 100%">
                <el-button size="small" style="width: 100%">
                  更多功能 <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <nuxt-link to="/upload" target="_blank">
                      <i class="el-icon-upload2"></i> 上传文档
                    </nuxt-link>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <nuxt-link to="/post" target="_blank">
                      <i class="el-icon-plus"></i> 发布文章
                    </nuxt-link>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <nuxt-link to="/me/document" target="_blank">
                      <i class="el-icon-document"></i> 我的文档
                    </nuxt-link>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <nuxt-link to="/me/favorite" target="_blank">
                      <i class="el-icon-star-on"></i> 我的收藏
                    </nuxt-link>
                  </el-dropdown-item>
                  <el-dropdown-item divided>
                    <span @click="logout">
                      <i class="fa fa-sign-out"></i> 退出登录
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-col>
          </el-row>
        </el-card>
        <el-card
          v-else
          class="box-card hidden-xs-only login-form"
          shadow="never"
        >
          <el-row>
            <el-col :span="8">
              <nuxt-link to="/login">
                <user-avatar :size="64" :user="user" />
              </nuxt-link>
            </el-col>
            <el-col :span="16">
              <h3>欢迎您，游客</h3>
              <div class="help-block login-tips">登录，体验更多功能</div>
            </el-col>
          </el-row>
          <div class="line"></div>
          <div class="btn-login">
            <nuxt-link to="/login">
              <el-button class="btn-block" type="primary">马上登录</el-button>
            </nuxt-link>
          </div>
          <div class="help-block sub-btn">
            <el-row>
              <el-col :span="12">
                <nuxt-link to="/findpassword" class="el-link el-link--default">
                  <small>找回密码</small>
                </nuxt-link>
              </el-col>
              <el-col :span="12" class="text-right">
                <nuxt-link to="/register" class="el-link el-link--default">
                  <small>注册账户</small>
                </nuxt-link>
              </el-col>
            </el-row>
          </div>
        </el-card>
        <el-card shadow="never" class="index-articles mgt-20px">
          <div slot="header">
            <i class="fa fa-newspaper-o"></i> {{ articleName }}
            <nuxt-link to="/article" target="_blank" class="float-right">
              <el-button type="text">更多</el-button>
            </nuxt-link>
          </div>
          <ArticleSimpleList :articles="articles"></ArticleSimpleList>
        </el-card>

        <!-- 最新文档 -->
        <el-card shadow="never" class="latest-documents mgt-20px">
          <div slot="header">
            <i class="el-icon-time"></i> 最新更新
            <nuxt-link to="/document" target="_blank" class="float-right">
              <el-button type="text">更多</el-button>
            </nuxt-link>
          </div>
          <div class="latest-list">
            <nuxt-link
              v-for="doc in latestDocuments"
              :key="'latest-' + doc.id"
              :to="`/document/${doc.uuid}`"
              target="_blank"
              class="latest-item"
            >
              <div class="latest-cover">
                <document-cover :document="doc" :width="40" />
              </div>
              <div class="latest-info">
                <div class="latest-title">{{ doc.title }}</div>
                <div class="latest-meta">
                  <el-tag v-if="doc.category_name" size="mini" type="info">{{
                    doc.category_name
                  }}</el-tag>
                  <span class="latest-time">{{
                    formatTime(doc.created_at)
                  }}</span>
                </div>
              </div>
            </nuxt-link>
          </div>
        </el-card>
      </el-col>
      <el-col :span="17">
        <!-- 文档概览统计 -->
        <el-card
          v-if="settings.display.show_document_count"
          class="document-stats"
          shadow="never"
        >
          <div slot="header" class="stats-header">
            <h3><i class="el-icon-data-analysis"></i> 文库概览</h3>
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item primary">
                <div class="stat-number">
                  {{ formatNumber(stats.document_count) }}
                </div>
                <div class="stat-label">
                  <i class="el-icon-document"></i>
                  文档资源
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item success">
                <div class="stat-number">
                  {{ formatNumber(stats.article_count) }}
                </div>
                <div class="stat-label">
                  <i class="el-icon-reading"></i>
                  精选文章
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item info">
                <div class="stat-number">
                  {{ formatNumber(stats.user_count) }}
                </div>
                <div class="stat-label">
                  <i class="el-icon-user-solid"></i>
                  活跃用户
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item warning">
                <div class="stat-number">
                  {{ formatNumber(stats.download_count || 0) }}
                </div>
                <div class="stat-label">
                  <i class="el-icon-download"></i>
                  下载量
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 热门文档推荐 -->
        <el-card v-loading="loadingRecommend" shadow="hover" class="mgt-20px">
          <div slot="header">
            <div class="section-header">
              <h3><i class="el-icon-star-on"></i> 热门推荐</h3>
              <div class="header-actions">
                <el-tag size="mini" type="info"
                  >{{ recommends.length }}个精选</el-tag
                >
                <el-button-group class="view-controls">
                  <el-button
                    :type="recommendViewMode === 'card' ? 'primary' : 'default'"
                    size="mini"
                    @click="recommendViewMode = 'card'"
                  >
                    <i class="el-icon-menu"></i> 卡片
                  </el-button>
                  <el-button
                    :type="recommendViewMode === 'list' ? 'primary' : 'default'"
                    size="mini"
                    @click="recommendViewMode = 'list'"
                  >
                    <i class="el-icon-s-operation"></i> 列表
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </div>

          <!-- 卡片视图 -->
          <div v-if="recommendViewMode === 'card'" class="document-grid">
            <el-row :gutter="16">
              <el-col
                v-for="(item, index) in recommends"
                :key="'recommend' + item.id"
                :span="4"
                :xs="12"
                :sm="8"
                :md="6"
                :class="isMobile && index > 7 ? 'hidden-xs-only' : ''"
              >
                <div class="document-card">
                  <nuxt-link :to="`/document/${item.uuid}`" target="_blank">
                    <div class="doc-cover">
                      <document-cover :document="item" />
                      <div class="doc-overlay">
                        <el-button type="primary" size="mini" circle>
                          <i class="el-icon-view"></i>
                        </el-button>
                      </div>
                    </div>
                    <div class="doc-info">
                      <h4 class="doc-title" :title="item.title">
                        {{ item.title }}
                      </h4>
                      <div class="doc-meta">
                        <el-tag
                          v-if="item.category_name"
                          size="mini"
                          type="info"
                        >
                          {{ item.category_name }}
                        </el-tag>
                        <div class="doc-stats">
                          <span
                            ><i class="el-icon-view"></i>
                            {{ item.view_count || 0 }}</span
                          >
                          <span
                            ><i class="el-icon-download"></i>
                            {{ item.download_count || 0 }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </nuxt-link>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 列表视图 -->
          <div v-else class="document-list">
            <div
              v-for="item in recommends.slice(0, 8)"
              :key="'list-recommend' + item.id"
              class="document-list-item"
            >
              <nuxt-link
                :to="`/document/${item.uuid}`"
                target="_blank"
                class="list-link"
              >
                <div class="list-cover">
                  <document-cover :document="item" :width="80" />
                </div>
                <div class="list-content">
                  <h4 class="list-title">{{ item.title }}</h4>
                  <p v-if="item.description" class="list-desc">
                    {{ item.description }}
                  </p>
                  <div class="list-meta">
                    <div class="meta-left">
                      <el-tag
                        v-if="item.category_name"
                        size="mini"
                        type="primary"
                      >
                        {{ item.category_name }}
                      </el-tag>
                      <span v-if="item.pages" class="page-count">
                        <i class="el-icon-document"></i> {{ item.pages }}页
                      </span>
                    </div>
                    <div class="meta-right">
                      <span class="stat-item">
                        <i class="el-icon-view"></i> {{ item.view_count || 0 }}
                      </span>
                      <span class="stat-item">
                        <i class="el-icon-download"></i>
                        {{ item.download_count || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </nuxt-link>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'index_category_top'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
    <div
      v-if="settings.display.show_index_categories"
      class="categories mgt-20px"
    >
      <el-row :gutter="20">
        <div
          v-for="(category, index) in categoryTreesV2.filter(
            (item) => !item.type
          )"
          :key="'tree-' + category.id"
        >
          <el-col v-if="index < 4" :span="6">
            <el-card class="box-card" shadow="never">
              <div slot="header" class="clearfix">
                <nuxt-link
                  class="el-link el-link--default"
                  :to="`/category/${category.id}`"
                  target="_blank"
                >
                  <img
                    :src="category.icon || '/static/images/logo-icon.png'"
                    :alt="category.title"
                    class="category-icon"
                  />
                  <strong>{{ category.title }}</strong>
                </nuxt-link>
              </div>
              <nuxt-link
                v-for="child in category.children"
                :key="'child-' + child.id"
                class="el-link el-link--default"
                :to="`/category/${child.id}`"
                target="_blank"
                >{{ child.title }}</nuxt-link
              >
            </el-card>
          </el-col>
        </div>
      </el-row>
    </div>

    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'index_category_bottom'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
    <el-row
      v-if="settings.display.index_document_style == 'list'"
      :gutter="isMobile ? 0 : 20"
      class="category-item-list"
    >
      <el-col
        v-for="item in documents"
        :key="'card-cate-' + item.category_id"
        :span="24"
      >
        <el-card class="box-card mgt-20px" shadow="never">
          <div slot="header" class="clearfix">
            <strong>{{ item.category_name }}</strong>
            <nuxt-link
              :to="`/category/${item.category_id}`"
              class="float-right"
              target="_blank"
            >
              <el-button type="text">更多</el-button>
            </nuxt-link>
          </div>
          <el-row :gutter="isMobile ? 10 : 20">
            <el-col
              v-for="doc in item.document"
              :key="'c-' + item.category_id + 'd' + doc.id"
              :span="6"
              :xs="12"
            >
              <div class="doc-item">
                <nuxt-link
                  class="el-link el-link--default doc-cover"
                  :to="`/document/${doc.uuid}`"
                  target="_blank"
                >
                  <document-cover
                    :width="70"
                    :document="doc"
                    :show-ext="true"
                  />
                </nuxt-link>
                <div class="doc-title">
                  <nuxt-link
                    class="el-link el-link--default"
                    :to="`/document/${doc.uuid}`"
                    target="_blank"
                  >
                    <div>{{ doc.title }}</div>
                  </nuxt-link>
                  <div>{{ doc.pages || '-' }} 页</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-row v-else :gutter="20" class="category-item-card">
      <el-col
        v-for="item in documents"
        :key="'card-cate-' + item.category_id"
        :span="12"
      >
        <el-card class="box-card mgt-20px" shadow="never">
          <div slot="header" class="clearfix">
            <strong>{{ item.category_name }}</strong>
            <nuxt-link :to="`/category/${item.category_id}`" target="_blank">
              <el-button style="float: right; padding: 3px 0" type="text"
                >更多</el-button
              >
            </nuxt-link>
          </div>
          <div>
            <div class="card-body-left hidden-xs-only">
              <nuxt-link target="_blank" :to="`/category/${item.category_id}`">
                <el-image
                  lazy
                  class="category-cover"
                  :src="item.category_cover"
                >
                  <div slot="error" class="image-slot">
                    <img
                      src="/static/images/default-category-cover.png"
                      :alt="item.category_name"
                    />
                  </div>
                </el-image>
              </nuxt-link>
            </div>
            <div class="card-body-right">
              <nuxt-link
                v-for="(doc, index) in item.document"
                v-show="index < 5"
                :key="'c-' + item.category_id + 'd' + doc.id"
                class="el-link el-link--default"
                target="_blank"
                :to="`/document/${doc.uuid}`"
              >
                <img
                  :src="`/static/images/${getIcon(doc.ext)}_24.png`"
                  :alt="`${getIcon(doc.ext)}文档`"
                />
                <span>{{ doc.title }}</span>
              </nuxt-link>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'index_link_top'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import UserAvatar from '~/components/UserAvatar.vue'
import { listBanner } from '~/api/banner'
import { listDocument, listDocumentForHome } from '~/api/document'
import { getSignedToday, signToday } from '~/api/user'
import { getStats } from '~/api/config'
import { getIcon } from '~/utils/utils'
import { advertisementPositions } from '~/utils/enum'
import { listArticle } from '~/api/article'
export default {
  name: 'HomePage',
  components: { UserAvatar },
  data() {
    return {
      banners: [],
      recommends: [],
      loadingRecommend: false,
      documents: [],
      search: {
        wd: '',
      },
      sign: {
        sign_at: 0,
      },
      stats: {
        document_count: '-',
        user_count: '-',
        article_count: '-',
        download_count: '-',
      },
      carouselIndexes: [0], // 跑马灯index，用于跑马灯图片的懒加载
      advertisementPositions,
      activeIndex: '0',
      articles: [],
      latestDocuments: [],
      recommendViewMode: 'card', // 推荐文档显示模式：card/list
    }
  },
  head() {
    return {
      title: this.settings.system.title,
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: `${this.settings.system.sitename},${this.settings.system.keywords}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.settings.system.description,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('user', ['user']),
    ...mapGetters('setting', ['settings', 'navigations']),
    articleName() {
      const nav = this.navigations.find((nav) => nav.href === '/article')
      return nav ? nav.title : '文章资讯'
    },
    categoryTreesV2() {
      const trees = (this.categoryTrees || []).filter((item) => {
        if (this.settings.display.hide_category_without_document) {
          return item.doc_count > 0 && item.enable
        }
        return item.enable
      })

      // 过滤二级分类
      trees.forEach((item) => {
        item.children = (item.children || []).filter((child) => {
          if (this.settings.display.hide_category_without_document) {
            return child.doc_count > 0 && child.enable
          }
          return child.enable
        })
      })

      return trees
    },
  },
  async created() {
    const requests = [
      this.getRecommendDocuments(),
      this.getLatestDocuments(),
      this.getArticles(),
      this.listBanner(),
      this.getDocuments(),
      this.getSignedToday(),
      this.getStats(),
      this.getAdvertisements('index'),
    ]
    if (this.user.id) {
      requests.push(this.getUser())
    }
    await Promise.all(requests)
  },
  methods: {
    ...mapActions('user', ['logout', 'getUser']),
    getIcon,
    formatNumber(num) {
      if (!num || num === '-') return 0
      const number = parseInt(num)
      if (number >= 10000) {
        return (number / 10000).toFixed(1) + 'w'
      } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'k'
      }
      return number
    },
    formatTime(timeStr) {
      if (!timeStr) return ''
      const time = new Date(timeStr)
      const now = new Date()
      const diff = now - time
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))

      if (days === 0) {
        const hours = Math.floor(diff / (60 * 60 * 1000))
        if (hours === 0) {
          const minutes = Math.floor(diff / (60 * 1000))
          return minutes > 0 ? `${minutes}分钟前` : '刚刚'
        }
        return `${hours}小时前`
      } else if (days < 7) {
        return `${days}天前`
      } else {
        return time.toLocaleDateString()
      }
    },
    getTagType(index) {
      const types = ['primary', 'success', 'info', 'warning', 'danger']
      return types[index % types.length]
    },
    async listBanner() {
      const res = await listBanner({
        enable: true,
        field: ['id', 'title', 'path', 'url'],
        type: 0, // 0，网站轮播图
      })
      if (res.status === 200) {
        this.banners = res.data.banner
      }
    },
    changeActiveIndex(tab) {
      this.activeIndex = tab.name
    },
    onSearch() {
      if (this.search.wd) {
        location.href = '/search?wd=' + encodeURIComponent(this.search.wd)
      }
    },
    async getArticles() {
      const res = await listArticle({
        page: 1,
        size: 6,
      })
      if (res.status === 200) {
        this.articles = res.data.article || []
      }
    },
    async getSignedToday() {
      if (!this.user.id) {
        return
      }
      const res = await getSignedToday()
      if (res.status === 200) {
        this.sign = res.data || { id: 0 }
      }
    },
    async signToday() {
      if (this.sign.id > 0) {
        this.$message.warning('今日已签到')
        return
      }
      const res = await signToday()
      if (res.status === 200) {
        const sign = res.data || { id: 1 }
        this.sign = sign
        this.getUser()
        this.$message.success(
          `签到成功，获得 ${sign.award || 0} ${
            this.settings.system.credit_name || '魔豆'
          }奖励`
        )
      } else {
        this.$message.error(res.message || res.data.message)
      }
    },
    async getRecommendDocuments() {
      this.loadingRecommend = true
      const res = await listDocument({
        field: [
          'id',
          'title',
          'uuid',
          'category_name',
          'view_count',
          'download_count',
          'pages',
          'description',
        ],
        is_recommend: true,
        order: 'recommend_at desc',
        limit: 12,
      })
      this.loadingRecommend = false
      if (res.status === 200) {
        this.recommends = res.data.document || []
      }
    },
    async getLatestDocuments() {
      const res = await listDocument({
        field: ['id', 'title', 'uuid', 'category_name', 'created_at'],
        order: 'id desc',
        limit: 6,
      })
      if (res.status === 200) {
        this.latestDocuments = res.data.document || []
      }
    },
    async getDocuments() {
      const res = await listDocumentForHome({
        limit: 8,
      })
      if (res.status === 200) {
        this.documents = (res.data.document || []).filter(
          (item) => item.document && item.document.length > 0
        )
      }
    },
    async getStats() {
      const res = await getStats()
      if (res.status === 200) {
        this.stats = res.data || {}
      }
    },
    login() {
      // 跳转到登录页面，先串通页面
      this.$router.push('/login')
    },
    changeCarousel(index) {
      const carouselIndexes = this.carouselIndexes
      if (!carouselIndexes.includes(index)) {
        carouselIndexes.push(index)
      }
      this.carouselIndexes = carouselIndexes
    },
  },
}
</script>
<style lang="scss">
.page-index {
  width: 100%;
  max-width: 100%;
  margin-top: -20px;

  // 用户面板增强样式
  .user-dashboard {
    .user-stats {
      margin-top: 10px;
      padding: 10px 0;
      background: #f8f9fa;
      border-radius: 4px;

      .stat-number {
        font-size: 16px;
        font-weight: bold;
        color: #409eff;
      }

      .stat-label {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }
    }

    .action-buttons {
      margin-top: 10px;
    }
  }

  // 文档统计样式 - 使用Element UI主题色
  .document-stats {
    .stats-header {
      h3 {
        margin: 0;
        color: #303133;
        font-size: 18px;
        font-weight: 600;

        i {
          color: #409eff;
          margin-right: 8px;
        }
      }
    }

    .stat-item {
      text-align: center;
      padding: 20px 10px;
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 1px solid #ebeef5;
      background: #fff;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.primary {
        border-color: #409eff;

        .stat-number {
          color: #409eff;
        }

        .stat-label i {
          color: #409eff;
        }
      }

      &.success {
        border-color: #67c23a;

        .stat-number {
          color: #67c23a;
        }

        .stat-label i {
          color: #67c23a;
        }
      }

      &.info {
        border-color: #909399;

        .stat-number {
          color: #909399;
        }

        .stat-label i {
          color: #909399;
        }
      }

      &.warning {
        border-color: #e6a23c;

        .stat-number {
          color: #e6a23c;
        }

        .stat-label i {
          color: #e6a23c;
        }
      }

      .stat-number {
        font-size: 28px;
        font-weight: bold;
        line-height: 1;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #606266;

        i {
          margin-right: 4px;
        }
      }
    }
  }

  // 推荐文档增强样式
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #2c3e50;

      i {
        margin-right: 8px;
        color: #409eff;
      }
    }

    .view-controls {
      .el-button {
        padding: 5px 8px;
      }
    }
  }

  .recommend-item {
    .item-info {
      .item-title {
        height: 40px;
        overflow: hidden;
        margin-bottom: 8px;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-word;
        font-size: 13px;
        line-height: 20px;
      }
      .item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 5px;

        .meta-text {
          font-size: 12px;
          color: #666;

          i {
            margin-right: 2px;
          }
        }
      }
    }
  }

  .recommend-list {
    .recommend-list-item {
      margin-bottom: 15px;
      padding: 15px;
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 3px 10px rgba(64, 158, 255, 0.1);
      }

      .list-item-link {
        display: flex;
        text-decoration: none;
        color: inherit;

        &:hover {
          color: inherit;
        }
      }

      .list-item-cover {
        margin-right: 15px;
        flex-shrink: 0;
      }

      .list-item-content {
        flex: 1;

        .list-item-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 500;
          color: #2c3e50;
          line-height: 1.4;
        }

        .list-item-meta {
          margin-bottom: 8px;

          .meta-info {
            margin-left: 10px;
            font-size: 12px;
            color: #666;

            i {
              margin: 0 2px 0 8px;
            }
          }
        }

        .list-item-desc {
          margin: 0;
          font-size: 13px;
          color: #666;
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
  }

  .upload-box a {
    border: 1px dashed #ddd;
    border-radius: 4px;
    color: #666;
    text-decoration: none !important;
    font-size: 13px;
    display: block;
    padding: 20px 0;
    i {
      font-size: 55px;
      margin-bottom: 20px;
      color: #c0c4cc;
    }
  }

  .el-carousel__button {
    width: 20px;
    height: 3px;
    border-radius: 2px;
  }
  .searchbox {
    position: relative;
    margin-bottom: 20px;

    a {
      display: inline-block;
    }

    .el-carousel__item {
      background-size: cover !important;
    }

    // 搜索表单垂直居中显示
    .search-form {
      position: absolute;
      z-index: 99;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 640px;
      color: #fff;

      .el-form-item {
        margin-bottom: 0;
      }

      .recommend-label {
        margin-right: 10px;
        font-size: 14px;
      }

      .recommend-tags {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 8px;

        .recommend-tag-link {
          text-decoration: none;

          .recommend-tag {
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
              background: rgba(255, 255, 255, 0.2);
            }

            i {
              margin-right: 4px;
            }
          }
        }
      }

      .el-tag {
        margin-left: 5px;
      }

      .el-input__icon {
        color: #666;
      }

      .el-input__inner {
        border-right: 0;
        height: 45px;
        line-height: 45px;
        font-size: 15px;

        &:focus {
          border-color: #dcdfe6;
        }
      }

      .el-input-group__append {
        background-color: #fff;
        border-left: 0;
      }
    }
  }

  & > .el-row {
    width: $default-width;
    max-width: $max-width;
    margin: 0 auto !important;
  }

  .stat-info {
    color: #888;
    font-size: 18px;

    small {
      font-size: 13px;
    }

    .el-card__body {
      padding: 5px 0;

      .el-col {
        padding: 8px 0;

        &:first-child {
          border-right: 1px solid #efefef;
        }
      }
    }
  }

  .categories {
    background-color: #fff;

    .category-icon {
      width: 22px;
      height: 22px;
      position: relative;
      top: 5px;
    }

    .el-card__header {
      a {
        font-size: 16px;
        color: #303133;
        margin-top: -2px;
        margin-bottom: 0 !important;
        margin-left: 3px;

        &:hover {
          color: #409eff;
        }
      }
    }

    .el-row {
      margin: 0 auto !important;
      width: $default-width;
      max-width: $max-width;

      .el-card__header {
        padding-left: 0;
        border-bottom: 0;
        padding-bottom: 0;
      }

      .el-card__body {
        padding: 15px 0 20px;
        max-height: 115px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        box-sizing: border-box;
      }

      a {
        display: inline-block;
        padding: 2px 0 5px;
        text-decoration: none;
        margin-right: 10px;
        margin-bottom: 5px;
      }
    }
  }

  .login-form {
    h3 {
      margin-top: 5px;
    }

    .line {
      border-top: 1px solid #efefef;
      margin: 14px 0 15px;
    }

    ul,
    li {
      margin: 0;
      padding: 0;
    }

    ul {
      margin: 10px 0;
    }

    li {
      margin-left: 20px;
      line-height: 200%;
      color: #555;
      font-size: 15px;
    }

    .login-tips {
      margin-top: -10px;
      font-size: 14px;
    }

    .user-count {
      margin: 20px 0;
      font-size: 13px;
      color: #999;

      .el-col:nth-child(2) {
        border-left: 1px solid #efefef;
        border-right: 1px solid #efefef;
      }

      span {
        display: block;
        margin-top: 5px;
        font-size: 16px;
        color: #409eff;
      }
    }

    .user-signature {
      text-align: left;
      text-indent: 2em;
      margin-top: 10px;
      height: 41px;
      font-size: 14px;
      line-height: 23px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  .el-card__header {
    .float-right {
      margin-top: -7px;
      .text-muted {
        font-weight: normal !important;
      }
    }
  }

  .sub-btn {
    position: relative;
    top: 13px;
    padding-bottom: 7px;
  }

  // 最新文档样式
  .latest-documents {
    .el-card__body {
      padding: 15px;
    }

    .latest-list {
      .latest-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f8f9fa;
          transform: translateX(5px);
          color: inherit;

          .latest-title {
            color: #409eff;
          }
        }

        .latest-cover {
          margin-right: 12px;
          flex-shrink: 0;
        }

        .latest-info {
          flex: 1;
          min-width: 0;

          .latest-title {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: color 0.3s ease;
          }

          .latest-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .latest-time {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }
  }

  .index-articles {
    .el-card__body {
      padding-top: 4px;
      padding-bottom: 4px;
      min-height: 253px;
      box-sizing: border-box;
    }
  }

  .latest-recommend {
    .el-card__body {
      padding-bottom: 0;
      min-height: 476px;
      box-sizing: border-box;
    }

    a {
      text-decoration: none;
      display: block;
      margin-bottom: 20px;

      &:hover {
        color: #409eff;
      }

      .el-image {
        border: 2px solid #efefef;
        border-radius: 5px;
        height: 160px;
        width: 115px;
        max-width: 100%;

        img {
          width: 100%;
          transition: transform 0.3s ease 0s;

          &:hover {
            transform: scale(1.2);
          }
        }
      }

      div.el-link {
        height: 40px;
        overflow: hidden;
        margin-bottom: 0px;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-word;
        font-size: 13px;
        line-height: 20px;
      }
    }
  }

  .category-item-list {
    .el-card__body {
      padding-bottom: 0;
      .doc-item {
        margin-bottom: 20px;
        display: flex;
        .el-link {
          display: block;
        }
        .doc-cover {
          width: 70px;
          margin-right: 15px;
        }
        .doc-title {
          flex: 1;
          .el-link {
            font-size: 14px;
            margin-bottom: 20px;
            line-height: 180%;
            & > div {
              overflow: hidden;
              display: -webkit-box;
              text-overflow: ellipsis;
              height: 50px;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
              word-break: break-word;
            }
          }
          @media screen and (max-width: $mobile-width) {
            .el-link {
              margin-bottom: 15px;
              & > div {
                height: 66px;
                line-height: 22px;
                -webkit-line-clamp: 3;
                line-clamp: 3;
              }
            }
          }
          & > div {
            font-size: 13px;
            color: #888;
          }
        }
      }
    }
  }

  .category-item-card {
    .el-card__body {
      padding-bottom: 15px;
    }
    .el-card__body > div {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .card-body-left {
        width: 180px;
        padding-right: 20px;

        .category-cover {
          height: 145px;
          width: 180px;
          overflow: hidden;
        }

        .image-slot {
          height: 145px;
          overflow: hidden;
        }

        img {
          width: 180px;
          height: 145px;
          border-radius: 5px;
        }
      }

      .card-body-right {
        width: 100%;
        margin-top: -5px;
        box-sizing: border-box;
        padding-right: 200px;

        a {
          text-decoration: none;
          display: block;
          line-height: 30px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          img {
            display: none;
          }
        }
      }
    }
  }

  // 新增文档展示样式
  .document-grid {
    .document-card {
      position: relative;
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid #ebeef5;
      background: #fff;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: #409eff;

        .doc-overlay {
          opacity: 1;
        }
      }

      .doc-cover {
        position: relative;
        height: 180px;
        overflow: hidden;

        .el-image,
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .doc-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      }

      .doc-info {
        padding: 12px;

        .doc-title {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          line-height: 1.4;
          height: 40px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          word-break: break-word;
        }

        .doc-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .doc-stats {
            font-size: 12px;
            color: #909399;

            span {
              margin-left: 8px;

              i {
                margin-right: 2px;
              }
            }
          }
        }
      }

      a {
        text-decoration: none;
        color: inherit;

        &:hover {
          color: inherit;
        }
      }
    }
  }

  .document-list {
    .document-list-item {
      margin-bottom: 16px;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      transition: all 0.3s ease;
      background: #fff;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
      }

      .list-link {
        display: flex;
        padding: 16px;
        text-decoration: none;
        color: inherit;

        &:hover {
          color: inherit;
        }
      }

      .list-cover {
        margin-right: 16px;
        flex-shrink: 0;
      }

      .list-content {
        flex: 1;
        min-width: 0;

        .list-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          line-height: 1.4;
        }

        .list-desc {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #606266;
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .list-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .meta-left {
            display: flex;
            align-items: center;
            gap: 12px;

            .page-count {
              font-size: 12px;
              color: #909399;

              i {
                margin-right: 4px;
              }
            }
          }

          .meta-right {
            display: flex;
            gap: 16px;

            .stat-item {
              font-size: 12px;
              color: #909399;

              i {
                margin-right: 4px;
              }
            }
          }
        }
      }
    }
  }
}

// =================================
// 移动端样式
// =================================
@media screen and (max-width: $mobile-width) {
  .page-index {
    // 统计卡片移动端优化
    .document-stats {
      .el-col-6 {
        width: 50%;
        margin-bottom: 15px;
      }

      .stat-item {
        padding: 15px 8px;

        .stat-number {
          font-size: 22px;
        }

        .stat-label {
          font-size: 12px;
        }
      }
    }

    .searchbox {
      margin-bottom: 15px;

      .search-form {
        width: 90%;

        .el-input__inner {
          height: 40px;
          line-height: 40px;
        }
      }
    }

    .el-carousel__arrow {
      display: none;
    }

    .latest-recommend {
      width: 100%;
      padding-left: 0 !important;
      padding-right: 0 !important;

      .el-card__body {
        padding: 15px;
        padding-bottom: 0;
        min-height: auto;
      }

      .el-col-4 {
        width: 25%;
        padding-left: 7.5px !important;
        padding-right: 7.5px !important;
      }

      a {
        margin-bottom: 15px;

        .el-image {
          height: auto;
          width: 100%;
          border: 1px solid #e6e6e6;
        }

        div.el-link {
          font-size: 12px;
        }
      }
    }

    .right-at-recommend {
      width: 100%;
      margin-top: -20px;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 15px;
    }

    .categories {
      padding-bottom: 15px;

      .el-col-6 {
        width: 50%;

        .el-card__body {
          overflow: hidden;
        }
      }
    }

    .category-item-list {
      & > .el-col {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .el-card__body {
        padding: 15px 10px;
        .doc-item {
          margin-bottom: 10px;
          .doc-cover {
            margin-right: 10px;
          }
          .doc-title {
            .el-link {
              font-size: 13px;
            }
            & > div {
              font-size: 12px;
            }
          }
        }
      }
    }

    .category-item-card {
      .el-col-12 {
        width: 100%;
        padding-left: 0 !important;
        padding-right: 0 !important;

        .card-body-right {
          padding-right: 0 !important;

          a {
            line-height: 35px !important;

            img {
              display: inline-block !important;
              height: 18px;
              width: 18px;
              position: relative;
              top: 3px;
              margin-right: 3px;
            }
          }
        }
      }
    }
  }
  .page-index .categories .el-row .el-card__body {
    height: 105px;
  }
}
</style>
