<template>
  <div class="homepage">
    <!-- Hero Section with Background Video/Image -->
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

    <!-- Main Content -->
    <div ref="mainContent" class="main-content">
      <div class="container">
        <!-- Important Content First: Featured Documents Section -->
        <section class="featured-documents">
          <div class="section-header">
            <h2 class="section-title">
              <i class="el-icon-star-on"></i>
              精选推荐
            </h2>
            <div class="section-actions">
              <el-button-group class="view-toggle">
                <el-button
                  :type="viewMode === 'grid' ? 'primary' : 'default'"
                  size="small"
                  @click="viewMode = 'grid'"
                >
                  <i class="el-icon-menu"></i> 网格
                </el-button>
                <el-button
                  :type="viewMode === 'list' ? 'primary' : 'default'"
                  size="small"
                  @click="viewMode = 'list'"
                >
                  <i class="el-icon-s-operation"></i> 列表
                </el-button>
              </el-button-group>
            </div>
          </div>

          <div v-loading="loadingRecommends" class="documents-container">
            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="documents-grid">
              <nuxt-link
                v-for="doc in recommendedDocuments"
                :key="'rec-' + doc.id"
                :to="`/document/${doc.uuid}`"
                class="document-card"
              >
                <div class="doc-cover">
                  <document-cover :document="doc" />
                  <div class="doc-overlay">
                    <div class="overlay-content">
                      <el-button type="primary" size="mini" circle>
                        <i class="el-icon-view"></i>
                      </el-button>
                      <el-button type="success" size="mini" circle>
                        <i class="el-icon-download"></i>
                      </el-button>
                    </div>
                  </div>
                </div>
                <div class="doc-info">
                  <h4 class="doc-title">{{ doc.title }}</h4>
                  <!-- <div class="doc-meta">
                    <el-tag v-if="doc.category_name" size="mini" type="info">
                      {{ doc.category_name }}
                    </el-tag>
                    <div class="doc-stats">
                      <span
                        ><i class="el-icon-view"></i>
                        {{ doc.view_count || 0 }}</span
                      >
                      <span
                        ><i class="el-icon-download"></i>
                        {{ doc.download_count || 0 }}</span
                      >
                    </div>
                  </div> -->
                </div>
              </nuxt-link>
            </div>

            <!-- List View -->
            <div v-else class="documents-list">
              <nuxt-link
                v-for="doc in recommendedDocuments"
                :key="'list-' + doc.id"
                :to="`/document/${doc.uuid}`"
                class="document-list-item"
              >
                <div class="list-cover">
                  <document-cover :document="doc" :width="80" />
                </div>
                <div class="list-content">
                  <h4 class="list-title">{{ doc.title }}</h4>
                  <p class="list-description">
                    {{ doc.description || '暂无描述' }}
                  </p>
                  <div class="list-meta">
                    <div class="meta-tags">
                      <el-tag
                        v-if="doc.category_name"
                        size="mini"
                        type="primary"
                      >
                        {{ doc.category_name }}
                      </el-tag>
                      <span v-if="doc.pages" class="pages-count">
                        <i class="el-icon-document"></i> {{ doc.pages }} 页
                      </span>
                    </div>
                    <div class="meta-stats">
                      <span
                        ><i class="el-icon-view"></i>
                        {{ doc.view_count || 0 }}</span
                      >
                      <span
                        ><i class="el-icon-download"></i>
                        {{ doc.download_count || 0 }}</span
                      >
                    </div>
                  </div>
                </div>
              </nuxt-link>
            </div>
          </div>
        </section>

        <!-- Featured Categories Section -->
        <section
          v-if="settings.display.show_index_categories"
          class="featured-categories"
        >
          <div class="section-header">
            <h2 class="section-title">
              <i class="el-icon-menu"></i>
              热门分类
            </h2>
            <p class="section-subtitle">探索丰富的文档资源分类</p>
          </div>

          <div class="categories-grid">
            <nuxt-link
              v-for="category in featuredCategories"
              :key="'cat-' + category.id"
              :to="`/category/${category.id}`"
              class="category-card"
            >
              <div class="category-icon">
                <img
                  :src="category.icon || '/static/images/logo-icon.png'"
                  :alt="category.title"
                />
              </div>
              <div class="category-info">
                <h3 class="category-title">{{ category.title }}</h3>
                <p class="category-count">
                  {{ category.doc_count || 0 }} 个文档
                </p>
              </div>
              <div class="category-arrow">
                <i class="el-icon-arrow-right"></i>
              </div>
            </nuxt-link>
          </div>
        </section>

        <!-- Two Column Layout -->
        <el-row :gutter="30" class="content-section">
          <!-- Left Column -->
          <el-col :span="16" :xs="24">
            <!-- Latest Articles -->
            <section class="latest-articles">
              <div class="section-header">
                <h2 class="section-title">
                  <i class="el-icon-reading"></i>
                  {{ articleName }}
                </h2>
                <nuxt-link to="/article" target="_blank">
                  <el-button type="text"
                    >查看更多 <i class="el-icon-arrow-right"></i
                  ></el-button>
                </nuxt-link>
              </div>
              <div class="articles-list">
                <nuxt-link
                  v-for="article in latestArticles"
                  :key="'art-' + article.id"
                  :to="`/article/${article.identifier}`"
                  class="article-list-item"
                >
                  <div class="article-meta-date">
                    <span class="date">{{
                      formatDate(article.created_at)
                    }}</span>
                    <span class="view-count">
                      <i class="el-icon-view"></i>
                      {{ article.view_count || 0 }}
                    </span>
                  </div>
                  <div class="article-content">
                    <h4 class="article-title">{{ article.title }}</h4>
                    <p v-if="article.description" class="article-excerpt">
                      {{ article.description }}
                    </p>
                    <div class="article-meta">
                      <span class="author">
                        <i class="el-icon-user"></i>
                        {{ article.user?.username || '匿名用户' }}
                      </span>
                      <span class="read-more">
                        阅读全文 <i class="el-icon-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                </nuxt-link>
              </div>
            </section>

            <!-- Category Documents -->
            <section
              v-for="categoryDoc in categoryDocuments"
              :key="'catdoc-' + categoryDoc.category_id"
              class="category-documents"
            >
              <div class="section-header">
                <h2 class="section-title">{{ categoryDoc.category_name }}</h2>
                <nuxt-link
                  :to="`/category/${categoryDoc.category_id}`"
                  target="_blank"
                >
                  <el-button type="text"
                    >查看更多 <i class="el-icon-arrow-right"></i
                  ></el-button>
                </nuxt-link>
              </div>
              <div class="category-docs-grid">
                <nuxt-link
                  v-for="doc in categoryDoc.document"
                  :key="'cdoc-' + doc.id"
                  :to="`/document/${doc.uuid}`"
                  class="category-doc-item"
                >
                  <div class="cdoc-cover">
                    <document-cover :document="doc" :width="60" />
                  </div>
                  <div class="cdoc-info">
                    <h5 class="cdoc-title">{{ doc.title }}</h5>
                    <p class="cdoc-pages">{{ doc.pages || 0 }} 页</p>
                  </div>
                </nuxt-link>
              </div>
            </section>
          </el-col>

          <!-- Right Sidebar -->
          <el-col :span="8" :xs="24">
            <!-- User Panel -->
            <aside class="user-panel">
              <el-card v-if="user.id" class="user-card" shadow="never">
                <div class="user-info">
                  <div class="user-avatar">
                    <user-avatar :size="60" :user="user" />
                  </div>
                  <div class="user-details">
                    <h3 class="username">{{ user.username }}</h3>
                    <el-tag size="mini" type="info"> 个性签名 </el-tag>
                    <small>{{ user.signature || '暂无个性签名' }}</small>
                  </div>
                </div>

                <div class="user-stats">
                  <div class="stat-row">
                    <div class="stat-col">
                      <div class="stat-value">{{ user.doc_count || 0 }}</div>
                      <div class="stat-name">文档</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-value">
                        {{ user.article_count || 0 }}
                      </div>
                      <div class="stat-name">文章</div>
                    </div>
                    <div class="stat-col">
                      <div class="stat-value">{{ user.credit_count || 0 }}</div>
                      <div class="stat-name">积分</div>
                    </div>
                  </div>
                </div>

                <div class="user-actions">
                  <el-button
                    v-if="!todaySign.id"
                    style="width: 48%"
                    type="success"
                    size="medium"
                    class="sign-btn"
                    @click="signIn"
                  >
                    <i class="el-icon-s-opportunity"></i> 签到
                  </el-button>
                  <el-button
                    v-else
                    type="success"
                    size="medium"
                    disabled
                    style="width: 48%"
                    class="signed-btn"
                  >
                    <i class="el-icon-circle-check"></i> 已签到
                  </el-button>
                  <el-dropdown trigger="click" style="width: 48%">
                    <el-button
                      size="medium"
                      style="width: 100%"
                      class="more-btn"
                    >
                      <i class="el-icon-more"></i> 更多
                      <i class="el-icon-arrow-down"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item>
                        <nuxt-link to="/upload" class="el-link el-link--default"
                          ><i class="el-icon-upload"></i> 上传文档</nuxt-link
                        >
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <nuxt-link to="/me" class="el-link el-link--default"
                          ><i class="el-icon-user"></i> 个人中心</nuxt-link
                        >
                      </el-dropdown-item>
                      <el-dropdown-item divided>
                        <span @click="logout"
                          ><i class="el-icon-switch-button"></i> 退出登录</span
                        >
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </el-card>

              <!-- Guest Panel -->
              <el-card v-else class="guest-card" shadow="never">
                <div class="guest-content">
                  <div class="guest-avatar">
                    <user-avatar :size="60" :user="{}" />
                  </div>
                  <div class="guest-text">
                    <h3>欢迎访问</h3>
                    <p>登录后享受更多功能</p>
                  </div>
                </div>
                <div class="guest-actions">
                  <nuxt-link to="/login" class="guest-action-item">
                    <el-button type="primary" size="medium" class="login-btn">
                      <i class="el-icon-user"></i>
                      登录
                    </el-button>
                  </nuxt-link>
                  <nuxt-link to="/register" class="guest-action-item">
                    <el-button
                      type="default"
                      size="medium"
                      class="register-btn"
                    >
                      <i class="el-icon-plus"></i>
                      注册
                    </el-button>
                  </nuxt-link>
                </div>
              </el-card>
            </aside>

            <!-- Latest Updates -->
            <aside class="latest-updates">
              <el-card shadow="never">
                <div slot="header">
                  <h3><i class="el-icon-time"></i> 最新文档</h3>
                </div>
                <div class="updates-list">
                  <div
                    v-for="doc in latestDocuments"
                    :key="'latest-' + doc.id"
                    class="update-item"
                    @click="$router.push(`/document/${doc.uuid}`)"
                  >
                    <div class="update-cover">
                      <document-cover :document="doc" :width="40" />
                    </div>
                    <div class="update-info">
                      <h5 class="update-title">{{ doc.title }}</h5>
                      <p class="update-time">
                        {{ formatRelativeTime(doc.created_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </el-card>
            </aside>

            <!-- Quick Links -->
            <aside class="quick-links">
              <el-card shadow="never">
                <div slot="header">
                  <h3><i class="el-icon-link"></i> 快捷入口</h3>
                </div>
                <div class="links-grid">
                  <nuxt-link to="/upload" class="link-item">
                    <i class="el-icon-upload2"></i>
                    <span>上传文档</span>
                  </nuxt-link>
                  <nuxt-link to="/post" class="link-item">
                    <i class="el-icon-edit"></i>
                    <span>发布文章</span>
                  </nuxt-link>
                  <nuxt-link to="/category" class="link-item">
                    <i class="el-icon-document"></i>
                    <span>浏览文档</span>
                  </nuxt-link>
                  <nuxt-link to="/article" class="link-item">
                    <i class="el-icon-reading"></i>
                    <span>阅读文章</span>
                  </nuxt-link>
                </div>
              </el-card>
            </aside>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Advertisements Sections -->
    <template v-for="ad in advertisements">
      <div
        v-if="ad.position === 'index_banner_bottom'"
        :key="ad.id"
        class="ad-section"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="ad.content"></div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import UserAvatar from '~/components/UserAvatar.vue'
import DocumentCover from '~/components/DocumentCover.vue'
import { listBanner } from '~/api/banner'
import { listDocument, listDocumentForHome } from '~/api/document'
import { listArticle } from '~/api/article'
import { getSignedToday, signToday } from '~/api/user'
import { getStats } from '~/api/config'

export default {
  name: 'HomePage',
  components: {
    UserAvatar,
    DocumentCover,
  },
  data() {
    return {
      banners: [],
      recommendedDocuments: [],
      latestDocuments: [],
      latestArticles: [],
      categoryDocuments: [],
      featuredCategories: [],
      loadingRecommends: false,
      search: {
        wd: '',
      },
      searchForm: {
        keyword: '',
        type: 'all',
      },
      stats: {
        document_count: 0,
        user_count: 0,
        article_count: 0,
        download_count: 0,
      },
      todaySign: { id: 0 },
      viewMode: 'grid',
      advertisements: [],
      carouselIndexes: [0], // 轮播图索引，用于懒加载
    }
  },
  async fetch() {
    await Promise.all([
      this.loadBanners(),
      this.loadRecommendedDocuments(),
      this.loadLatestDocuments(),
      this.loadLatestArticles(),
      this.loadCategoryDocuments(),
      this.loadFeaturedCategories(),
      this.loadStats(),
      this.loadTodaySign(),
    ])
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
      return nav ? nav.title : '最新文章'
    },
  },

  methods: {
    ...mapActions('user', ['logout', 'getUser']),

    // Data Loading Methods
    async loadBanners() {
      try {
        const res = await listBanner({
          enable: true,
          field: ['id', 'title', 'path', 'url'],
          type: 0,
        })
        if (res.status === 200) {
          this.banners = res.data.banner || []
        }
      } catch (error) {
        // Failed to load banners
      }
    },

    async loadRecommendedDocuments() {
      this.loadingRecommends = true
      try {
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
          limit: 14,
        })
        if (res.status === 200) {
          this.recommendedDocuments = res.data.document || []
        }
      } catch (error) {
        // Failed to load recommended documents
      } finally {
        this.loadingRecommends = false
      }
    },

    async loadLatestDocuments() {
      try {
        const res = await listDocument({
          field: ['id', 'title', 'uuid', 'category_name', 'created_at'],
          order: 'id desc',
          limit: 8,
        })
        if (res.status === 200) {
          this.latestDocuments = res.data.document || []
        }
      } catch (error) {
        // Failed to load latest documents
      }
    },

    async loadLatestArticles() {
      try {
        const res = await listArticle({
          page: 1,
          size: 6,
        })
        if (res.status === 200) {
          this.latestArticles = res.data.article || []
        }
      } catch (error) {
        // Failed to load articles
      }
    },

    async loadCategoryDocuments() {
      try {
        const res = await listDocumentForHome({ limit: 6 })
        if (res.status === 200) {
          this.categoryDocuments = (res.data.document || []).filter(
            (item) => item.document && item.document.length > 0
          )
        }
      } catch (error) {
        // Failed to load category documents
      }
    },

    loadFeaturedCategories() {
      if (this.categoryTrees) {
        let featuredCategories = this.categoryTrees
          .filter((cat) => cat.enable && cat.doc_count > 0)
          .slice(0, 8)
        if (featuredCategories.length < 8) {
          // 只取前4个
          featuredCategories = featuredCategories.slice(0, 4)
        }
        this.featuredCategories = featuredCategories
      }
    },

    async loadStats() {
      try {
        const res = await getStats()
        if (res.status === 200) {
          this.stats = res.data || {}
        }
      } catch (error) {
        // Failed to load stats
      }
    },

    async loadTodaySign() {
      if (!this.user.id) return
      try {
        const res = await getSignedToday()
        if (res.status === 200) {
          this.todaySign = res.data || { id: 0 }
        }
      } catch (error) {
        // Failed to load sign status
      }
    },

    // Event Handlers
    changeCarousel(index) {
      const carouselIndexes = this.carouselIndexes
      if (!carouselIndexes.includes(index)) {
        carouselIndexes.push(index)
      }
      this.carouselIndexes = carouselIndexes
    },

    onCarouselChange(index) {
      // Handle carousel change if needed
    },

    onSearch() {
      if (this.search.wd) {
        location.href = '/search?wd=' + encodeURIComponent(this.search.wd)
      }
    },

    searchKeyword(keyword) {
      this.searchForm.keyword = keyword
      this.onSearch()
    },

    async signIn() {
      if (this.todaySign.id > 0) {
        this.$message.warning('今日已签到')
        return
      }
      try {
        const res = await signToday()
        if (res.status === 200) {
          this.todaySign = res.data || { id: 1 }
          this.getUser()
          this.$message.success(
            `签到成功，获得 ${res.data.award || 0} 积分奖励`
          )
        }
      } catch (error) {
        this.$message.error('签到失败，请稍后重试')
      }
    },

    // Utility Methods
    formatLargeNumber(num) {
      if (!num) return '0'
      const number = parseInt(num)
      if (number >= 10000) {
        return (number / 10000).toFixed(1) + 'w'
      } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'k'
      }
      return number.toString()
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString()
    },

    formatRelativeTime(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))

      if (days === 0) {
        const hours = Math.floor(diff / (60 * 60 * 1000))
        return hours === 0 ? '刚刚' : `${hours}小时前`
      } else if (days < 7) {
        return `${days}天前`
      } else {
        return date.toLocaleDateString()
      }
    },

    getTagType(index) {
      const types = ['primary', 'success', 'info', 'warning', 'danger']
      return types[index % types.length]
    },
  },
}
</script>

<style lang="scss" scoped>
// Variables
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #ebeef5;
$background-color: #f5f7fa;

.homepage {
  min-height: 100vh;
  background: $background-color;
  :deep(.el-card) {
    border: 1px solid #ebeef5;
  }
  a {
    text-decoration: none;
  }
  h3 {
    margin: 0;
  }

  & > .el-row {
    width: 1200px;
    max-width: 100%;
    margin: 0 auto !important;
  }
}

.el-carousel__button {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.searchbox {
  position: relative;
  margin-bottom: 0;
  margin-top: -20px;
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

// Hero Section
.hero-section {
  position: relative;
  height: 520px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .hero-background {
    .el-carousel {
      height: 520px;

      :deep(.el-carousel__container) {
        height: 520px;
      }

      :deep(.el-carousel__arrow) {
        background: rgba(255, 255, 255, 0.8);
        color: #409eff;
        border-radius: 50%;
        width: 50px;
        height: 50px;

        &:hover {
          background: white;
          transform: scale(1.1);
        }
      }

      :deep(.el-carousel__indicators) {
        .el-carousel__indicator {
          .el-carousel__button {
            background: rgba(255, 255, 255, 0.5);
            border-radius: 2px;
            width: 20px;
            height: 3px;
          }

          &.is-active .el-carousel__button {
            background: white;
          }
        }
      }
    }

    .hero-slide {
      height: 520px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(0, 0, 0, 0.2) 0%,
          rgba(64, 158, 255, 0.1) 50%,
          rgba(0, 0, 0, 0.2) 100%
        );
        z-index: 1;
      }
    }
  }

  .hero-content {
    text-align: center;
    color: white;
    z-index: 10;
    max-width: 900px;
    padding: 0 20px;
    position: relative;

    .hero-text {
      .hero-title {
        font-size: 3.2rem;
        font-weight: 700;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
        background: linear-gradient(135deg, #fff 0%, #e3f2fd 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .hero-subtitle {
        font-size: 1.3rem;
        margin-bottom: 2.5rem;
        opacity: 0.95;
        text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
        line-height: 1.5;
      }
    }

    .hero-search {
      margin-bottom: 2.5rem;

      .search-wrapper {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 60px;
        padding: 8px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .search-container {
        .search-input-wrapper {
          .search-input {
            .el-input__inner {
              height: 60px;
              font-size: 16px;
              border: none;
              background: transparent;
              color: #333;
              padding-left: 50px;

              &::placeholder {
                color: #999;
              }
            }

            .el-input__prefix {
              left: 20px;
              color: #409eff;
              font-size: 18px;
            }

            .el-input-group__prepend {
              background: transparent;
              border: none;
              border-radius: 50px 0 0 50px;

              .search-type-select {
                width: 130px;

                .el-input__inner {
                  background: transparent;
                  border: none;
                  color: #409eff;
                  font-weight: 500;
                  height: 60px;
                  line-height: 60px;
                  padding-left: 20px;
                }
              }
            }

            .el-input-group__append {
              background: transparent;
              border: none;
              border-radius: 0 50px 50px 0;
              padding: 0;

              .search-btn {
                height: 60px;
                border-radius: 50px;
                padding: 0 35px;
                background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
                border: none;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
                transition: all 0.3s ease;

                &:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 12px 35px rgba(64, 158, 255, 0.4);
                  background: linear-gradient(135deg, #66b1ff 0%, #85ce61 100%);
                }

                &:active {
                  transform: translateY(0);
                }
              }
            }
          }
        }
      }

      .hot-keywords {
        margin-top: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;

        .hot-label {
          color: rgba(255, 255, 255, 0.9);
          margin-right: 15px;
          font-weight: 500;
          display: flex;
          align-items: center;

          i {
            margin-right: 5px;
            color: #ffd700;
          }
        }

        .hot-tag {
          margin: 0;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: white;
          border-radius: 20px;
          padding: 6px 15px;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);

          &:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            border-color: rgba(255, 255, 255, 0.4);
          }
        }
      }
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 40px;

      .stat-item {
        text-align: center;

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }
      }
    }
  }
}

// Main Content
.main-content {
  background: white;
  // position: relative;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 0;
}

// Section Headers
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  .section-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: $text-primary;
    margin: 0;

    i {
      color: $primary-color;
      margin-right: 10px;
    }
  }

  .section-subtitle {
    color: $text-secondary;
    margin: 5px 0 0 0;
    font-size: 0.9rem;
  }

  .section-actions {
    .view-toggle {
      .el-button {
        padding: 8px 15px;
      }
    }
  }
}

// Featured Categories
.featured-categories {
  margin-bottom: 30px;

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;

    .category-card {
      background: white;
      border: 1px solid $border-color;
      border-radius: 12px;
      padding: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border-color: $primary-color;
      }

      .category-icon {
        margin-right: 20px;

        img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
        }
      }

      .category-info {
        flex: 1;

        .category-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: $text-primary;
          margin: 0 0 5px 0;
        }

        .category-count {
          color: $text-secondary;
          margin: 0;
          font-size: 0.9rem;
        }
      }

      .category-arrow {
        color: $text-secondary;
        font-size: 1.2rem;
        transition: transform 0.3s ease;
      }

      &:hover .category-arrow {
        transform: translateX(5px);
        color: $primary-color;
      }
    }
  }
}

// Featured Documents
.featured-documents {
  margin-bottom: 25px;

  .section-header {
    margin-bottom: 20px;

    .section-actions {
      .view-toggle {
        .el-button {
          padding: 6px 12px;

          i {
            margin-right: 3px;
          }
        }
      }
    }
  }

  .documents-container {
    min-height: 300px;
  }

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;

    .document-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid $border-color;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);

        .doc-overlay {
          opacity: 1;
        }
      }

      .doc-cover {
        position: relative;
        overflow: hidden;
        aspect-ratio: 1 / 1;
        width: 100%;
        :deep(.com-document-cover) {
          border: 0;
          width: 100%;
          height: 100%;
        }

        .el-image {
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
          background: rgba(0, 0, 0, 0.6);
          border-bottom: 1px solid #efefef;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;

          .overlay-content {
            display: flex;
            gap: 8px;
          }
        }
      }

      .doc-info {
        padding: 10px 12px;

        .doc-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: $text-primary;
          margin: 0;
          height: 32px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.3;
        }

        .doc-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .doc-stats {
            display: flex;
            gap: 10px;
            font-size: 0.7rem;
            color: $text-secondary;

            span i {
              margin-right: 3px;
            }
          }
        }
      }
    }
  }

  .documents-list {
    .document-list-item {
      background: white;
      border: 1px solid $border-color;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;

      &:hover {
        border-color: $primary-color;
        box-shadow: 0 3px 10px rgba(64, 158, 255, 0.08);
      }

      .list-cover {
        margin-right: 15px;
        flex-shrink: 0;
      }

      .list-content {
        flex: 1;

        .list-title {
          font-size: 1rem;
          font-weight: 600;
          color: $text-primary;
          margin: 0 0 8px 0;
        }

        .list-description {
          color: $text-regular;
          margin: 0 0 10px 0;
          font-size: 0.85rem;
          line-height: 1.4;
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

          .meta-tags {
            display: flex;
            align-items: center;
            gap: 8px;

            .pages-count {
              font-size: 0.8rem;
              color: $text-secondary;

              i {
                margin-right: 4px;
              }
            }
          }

          .meta-stats {
            display: flex;
            gap: 15px;
            font-size: 0.8rem;
            color: $text-secondary;

            span i {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}

// Content Section
.content-section {
  margin-bottom: 30px;
  &:last-of-type {
    margin-bottom: 0;
  }
}

// Latest Articles
.latest-articles {
  margin-bottom: 40px;

  .articles-list {
    .article-list-item {
      background: white;
      border: 1px solid $border-color;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: flex-start;
      gap: 20px;

      &:hover {
        border-color: $primary-color;
        box-shadow: 0 5px 15px rgba(64, 158, 255, 0.1);
        transform: translateY(-2px);
      }

      .article-meta-date {
        flex-shrink: 0;
        width: 100px;
        text-align: center;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #e9ecef;

        .date {
          display: block;
          font-size: 0.85rem;
          color: $text-primary;
          font-weight: 500;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .view-count {
          display: block;
          font-size: 0.75rem;
          color: $text-secondary;

          i {
            margin-right: 3px;
          }
        }
      }

      .article-content {
        flex: 1;
        min-width: 0;

        .article-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: $text-primary;
          margin: 0 0 10px 0;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
        }

        .article-excerpt {
          color: $text-regular;
          margin: 0 0 15px 0;
          font-size: 0.9rem;
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .article-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;

          .author {
            color: $text-secondary;

            i {
              margin-right: 4px;
            }
          }

          .read-more {
            color: $primary-color;
            font-weight: 500;
            transition: all 0.3s ease;

            i {
              margin-left: 3px;
              transition: transform 0.3s ease;
            }
          }
        }

        &:hover .read-more i {
          transform: translateX(3px);
        }
      }
    }
  }
}

// Category Documents
.category-documents {
  margin-bottom: 40px;

  .category-docs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;

    .category-doc-item {
      background: white;
      border: 1px solid $border-color;
      border-radius: 8px;
      padding: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;

      &:hover {
        border-color: $primary-color;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .cdoc-cover {
        margin-right: 15px;
        flex-shrink: 0;
      }

      .cdoc-info {
        flex: 1;
        min-width: 0;

        .cdoc-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: $text-primary;
          margin: 0 0 5px 0;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
        }

        .cdoc-pages {
          font-size: 0.8rem;
          color: $text-secondary;
          margin: 0;
        }
      }
    }
  }
}

// Sidebar
.user-panel,
.latest-updates,
.quick-links {
  margin-bottom: 30px;
}

.user-card,
.guest-card {
  .user-info,
  .guest-content {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .user-avatar,
    .guest-avatar {
      margin-right: 15px;
    }

    .user-details,
    .guest-text {
      flex: 1;

      .username,
      h3 {
        margin: 0 0 5px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: $text-primary;
      }

      p {
        margin: 0;
        color: $text-secondary;
        font-size: 0.9rem;
      }
    }
  }

  .user-stats {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;

    .stat-row {
      display: flex;
      justify-content: space-around;

      .stat-col {
        text-align: center;

        .stat-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: $primary-color;
        }

        .stat-name {
          font-size: 0.8rem;
          color: $text-secondary;
          margin-top: 2px;
        }
      }
    }
  }

  .user-actions,
  .guest-actions {
    display: flex;
    gap: 12px;

    .guest-action-item {
      flex: 1;
      display: block;
    }

    .login-btn,
    .register-btn,
    .sign-btn,
    .signed-btn,
    .more-btn {
      width: 100%;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.3s ease;

      i {
        margin-right: 6px;

        &:last-child {
          margin-right: 0;
          margin-left: 6px;
        }
      }

      &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .login-btn {
      background-color: #409eff;
      border-color: #409eff;
      color: white;

      &:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
      }

      &:active {
        background-color: #3a8ee6;
        border-color: #3a8ee6;
      }
    }

    .register-btn {
      background-color: white;
      border-color: #dcdfe6;
      color: #606266;

      &:hover {
        background-color: #409eff;
        border-color: #409eff;
        color: white;
      }

      &:active {
        background-color: #3a8ee6;
        border-color: #3a8ee6;
        color: white;
      }
    }

    .sign-btn {
      background-color: #67c23a;
      border-color: #67c23a;
      color: white;

      &:hover {
        background-color: #85ce61;
        border-color: #85ce61;
      }

      &:active {
        background-color: #5daf34;
        border-color: #5daf34;
      }
    }

    .signed-btn {
      background-color: #f0f9ff;
      border-color: #67c23a;
      color: #67c23a;
      opacity: 0.8;
    }

    .more-btn {
      background-color: #909399;
      border-color: #909399;
      color: white;

      &:hover {
        background-color: #a6aeb7;
        border-color: #a6aeb7;
      }

      &:active {
        background-color: #82898f;
        border-color: #82898f;
      }
    }
  }
}

.latest-updates {
  .updates-list {
    .update-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f8f9fa;
        transform: translateX(5px);

        .update-title {
          color: $primary-color;
        }
      }

      .update-cover {
        margin-right: 12px;
        flex-shrink: 0;
      }

      .update-info {
        flex: 1;
        min-width: 0;

        .update-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: $text-primary;
          margin: 0 0 5px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .update-time {
          font-size: 0.8rem;
          color: $text-secondary;
          margin: 0;
        }
      }
    }
  }
}

.quick-links {
  .links-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;

    .link-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 10px;
      background: #f8f9fa;
      border-radius: 8px;
      text-decoration: none;
      color: $text-primary;
      transition: all 0.3s ease;

      &:hover {
        background: $primary-color;
        color: white;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
      }

      i {
        font-size: 2rem;
        margin-bottom: 8px;
      }

      span {
        font-size: 0.9rem;
        font-weight: 500;
      }
    }
  }
}

// Large desktop screens (1440px+)
@media (min-width: 1440px) {
  .featured-documents {
    .documents-grid {
      grid-template-columns: repeat(7, 1fr);
      gap: 18px;
    }
  }
}

// Desktop screens (1200px - 1439px)
@media (max-width: 1439px) and (min-width: 1200px) {
  .featured-documents {
    .documents-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
    }
  }
}

// Medium desktop screens (992px - 1199px)
@media (max-width: 1199px) and (min-width: 992px) {
  .featured-documents {
    .documents-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
    }
  }
}

// Tablet screens (768px - 991px)
@media (max-width: 991px) and (min-width: 768px) {
  .featured-documents {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .section-actions {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }

    .documents-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;

      .document-card {
        .doc-info {
          padding: 8px 10px;

          .doc-title {
            font-size: 0.8rem;
            height: 28px;
          }

          .doc-meta {
            .doc-stats {
              gap: 6px;
              font-size: 0.65rem;
            }
          }
        }
      }
    }

    .documents-list {
      .document-list-item {
        padding: 12px;

        .list-cover {
          margin-right: 12px;
        }

        .list-content {
          .list-title {
            font-size: 0.95rem;
          }

          .list-description {
            font-size: 0.8rem;
          }
        }
      }
    }
  }
}

// Small tablet screens (576px - 767px)
@media (max-width: 767px) and (min-width: 576px) {
  .featured-documents {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .section-title {
        font-size: 1.4rem;
      }

      .section-actions {
        width: 100%;
        display: flex;
        justify-content: center;

        .view-toggle {
          .el-button {
            padding: 5px 10px;
            font-size: 0.8rem;

            i {
              margin-right: 2px;
            }
          }
        }
      }
    }

    .documents-container {
      min-height: 250px;
    }

    .documents-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;

      .document-card {
        .doc-info {
          padding: 8px;

          .doc-title {
            font-size: 0.75rem;
            height: 28px;
            -webkit-line-clamp: 2;
            line-clamp: 2;
          }

          .doc-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;

            .doc-stats {
              gap: 8px;
              font-size: 0.65rem;
            }
          }
        }
      }
    }

    .documents-list {
      .document-list-item {
        padding: 10px;
        flex-direction: column;
        text-align: center;

        .list-cover {
          margin: 0 auto 8px auto;
        }

        .list-content {
          .list-title {
            font-size: 0.9rem;
            text-align: center;
          }

          .list-description {
            font-size: 0.75rem;
            text-align: center;
            -webkit-line-clamp: 3;
            line-clamp: 3;
          }

          .list-meta {
            flex-direction: column;
            gap: 6px;

            .meta-tags {
              justify-content: center;
            }

            .meta-stats {
              justify-content: center;
              gap: 10px;
            }
          }
        }
      }
    }
  }
}

// Mobile screens (max-width: 575px)
@media (max-width: 575px) {
  .featured-documents {
    margin-bottom: 20px;

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 20px;

      .section-title {
        font-size: 1.3rem;

        i {
          margin-right: 8px;
        }
      }

      .section-actions {
        width: 100%;
        display: flex;
        justify-content: center;

        .view-toggle {
          .el-button {
            padding: 5px 10px;
            font-size: 0.8rem;

            i {
              margin-right: 2px;
            }
          }
        }
      }
    }

    .documents-container {
      min-height: 200px;
    }

    .documents-grid {
      grid-template-columns: 1fr;
      gap: 12px;

      .document-card {
        display: flex;

        .doc-cover {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          aspect-ratio: 1 / 1;
        }

        .doc-info {
          flex: 1;
          padding: 8px 10px;

          .doc-title {
            font-size: 0.85rem;
            height: auto;
            margin-bottom: 8px;
            -webkit-line-clamp: 2;
            line-clamp: 2;
          }

          .doc-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;

            .el-tag {
              font-size: 0.7rem;
            }

            .doc-stats {
              gap: 8px;
              font-size: 0.65rem;
            }
          }
        }
      }
    }

    .documents-list {
      .document-list-item {
        padding: 10px;

        .list-cover {
          margin-right: 10px;
        }

        .list-content {
          .list-title {
            font-size: 0.9rem;
            margin-bottom: 6px;
          }

          .list-description {
            font-size: 0.75rem;
            margin-bottom: 8px;
            -webkit-line-clamp: 2;
            line-clamp: 2;
          }

          .list-meta {
            flex-direction: column;
            gap: 6px;

            .meta-tags {
              .el-tag {
                font-size: 0.7rem;
              }

              .pages-count {
                font-size: 0.7rem;
              }
            }

            .meta-stats {
              gap: 8px;
              font-size: 0.65rem;
            }
          }
        }
      }
    }
  }
}

// Medium screen responsive design (tablets)
@media (max-width: 1200px) and (min-width: 769px) {
  .documents-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
}

// Tablet responsive design
@media (max-width: 1024px) and (min-width: 769px) {
  .hero-section {
    height: 480px;

    .hero-background {
      .el-carousel {
        height: 480px;

        :deep(.el-carousel__container) {
          height: 480px;
        }
      }

      .hero-slide {
        height: 480px;
      }
    }
  }

  .hero-content {
    max-width: 90%;

    .hero-text {
      .hero-title {
        font-size: 2.8rem;
      }

      .hero-subtitle {
        font-size: 1.2rem;
      }
    }

    .hero-search {
      .search-container {
        .search-input-wrapper {
          .search-input {
            .el-input-group__prepend {
              .search-type-select {
                width: 120px;
              }
            }

            .el-input-group__append {
              .search-btn {
                padding: 0 30px;
              }
            }
          }
        }
      }

      .hot-keywords {
        .hot-tag {
          padding: 5px 14px;
        }
      }
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .hero-section {
    height: 420px;

    .hero-background {
      .el-carousel {
        height: 420px;

        :deep(.el-carousel__container) {
          height: 420px;
        }

        :deep(.el-carousel__arrow) {
          width: 40px;
          height: 40px;
        }
      }

      .hero-slide {
        height: 420px;
      }
    }
  }

  .hero-content {
    max-width: 95%;

    .hero-text {
      .hero-title {
        font-size: 2.2rem;
        margin-bottom: 0.8rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }
    }

    .hero-search {
      margin-bottom: 2rem;

      .search-wrapper {
        border-radius: 50px;
        padding: 6px;
      }

      .search-container {
        .search-input-wrapper {
          .search-input {
            .el-input__inner {
              height: 50px;
              font-size: 15px;
              padding-left: 45px;
            }

            .el-input__prefix {
              left: 15px;
              font-size: 16px;
            }

            .el-input-group__prepend {
              .search-type-select {
                width: 110px;

                .el-input__inner {
                  height: 50px;
                  line-height: 50px;
                  font-size: 14px;
                  padding-left: 15px;
                }
              }
            }

            .el-input-group__append {
              .search-btn {
                height: 50px;
                padding: 0 25px;
                font-size: 14px;
              }
            }
          }
        }
      }

      .hot-keywords {
        margin-top: 20px;

        .hot-label {
          margin-right: 10px;
          font-size: 0.9rem;
        }

        .hot-tag {
          padding: 4px 12px;
          font-size: 0.8rem;
          margin: 2px;
        }
      }
    }

    .hero-stats {
      gap: 20px;

      .stat-item {
        .stat-number {
          font-size: 1.5rem;
        }

        .stat-label {
          font-size: 0.8rem;
        }
      }
    }
  }

  .container {
    padding: 20px 15px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .latest-articles {
    .articles-list {
      .article-list-item {
        flex-direction: column;
        gap: 15px;

        .article-meta-date {
          width: 100%;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;

          .date {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  .category-docs-grid {
    grid-template-columns: 1fr;
  }

  .links-grid {
    grid-template-columns: repeat(4, 1fr);

    .link-item {
      padding: 15px 5px;

      i {
        font-size: 1.5rem;
      }

      span {
        font-size: 0.8rem;
      }
    }
  }
}

// Advertisement sections
.ad-section {
  margin: 40px 0;
  text-align: center;
}

// Searchbox mobile responsive
@media (max-width: 768px) {
  .searchbox {
    .search-form {
      width: 90%;
      max-width: 500px;
    }
  }
}

@media (max-width: 480px) {
  .searchbox {
    .search-form {
      width: 95%;
      max-width: 400px;

      .recommend-tags {
        justify-content: center;
      }
    }
  }
}
</style>
