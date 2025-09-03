<template>
  <div class="homepage">
    <!-- Hero Section with Background Video/Image -->
    <section class="hero-section">
      <div class="hero-background">
        <el-carousel
          :interval="5000"
          arrow="hover"
          indicator-position="outside"
          height="480px"
          @change="onCarouselChange"
        >
          <el-carousel-item
            v-for="banner in banners"
            :key="'banner-' + banner.id"
          >
            <div
              class="hero-slide"
              :style="{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${banner.path})`,
              }"
            >
              <div class="hero-content">
                <div class="hero-text">
                  <h1 class="hero-title">{{ settings.system.sitename }}</h1>
                  <p class="hero-subtitle">{{ settings.system.description }}</p>

                  <!-- Enhanced Search Box -->
                  <div class="hero-search">
                    <el-form
                      :model="searchForm"
                      @submit.native.prevent="onSearch"
                    >
                      <div class="search-container">
                        <el-input
                          v-model="searchForm.keyword"
                          size="large"
                          placeholder="搜索文档、文章、用户..."
                          class="search-input"
                          @keydown.native.enter="onSearch"
                        >
                          <el-select
                            slot="prepend"
                            v-model="searchForm.type"
                            placeholder="类型"
                            style="width: 120px"
                          >
                            <el-option label="全部" value="all"></el-option>
                            <el-option
                              label="文档"
                              value="document"
                            ></el-option>
                            <el-option label="文章" value="article"></el-option>
                          </el-select>
                          <el-button
                            slot="append"
                            type="primary"
                            icon="el-icon-search"
                            @click="onSearch"
                          >
                            搜索
                          </el-button>
                        </el-input>
                      </div>
                    </el-form>

                    <!-- Hot Keywords -->
                    <div
                      v-if="settings.system.recommend_words"
                      class="hot-keywords"
                    >
                      <span class="hot-label">热门搜索：</span>
                      <el-tag
                        v-for="(
                          word, idx
                        ) in settings.system.recommend_words.slice(0, 6)"
                        :key="'hot-' + idx"
                        :type="getTagType(idx)"
                        size="small"
                        class="hot-tag"
                        @click="searchKeyword(word)"
                      >
                        {{ word }}
                      </el-tag>
                    </div>
                  </div>

                  <!-- Quick Stats -->
                  <div class="hero-stats">
                    <div class="stat-item">
                      <div class="stat-number">
                        {{ formatLargeNumber(stats.document_count) }}
                      </div>
                      <div class="stat-label">文档资源</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">
                        {{ formatLargeNumber(stats.user_count) }}
                      </div>
                      <div class="stat-label">注册用户</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-number">
                        {{ formatLargeNumber(stats.download_count) }}
                      </div>
                      <div class="stat-label">下载次数</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </section>

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
                  <div class="doc-meta">
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
                  </div>
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
                    <el-tag size="mini" :type="getUserTagType(user.group_name)">
                      {{ user.group_name || '普通用户' }}
                    </el-tag>
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
                    size="small"
                    @click="signIn"
                  >
                    <i class="el-icon-calendar-check"></i> 签到
                  </el-button>
                  <el-button
                    v-else
                    type="success"
                    size="small"
                    disabled
                    style="width: 48%"
                  >
                    <i class="el-icon-check"></i> 已签到
                  </el-button>
                  <el-dropdown trigger="click" style="width: 48%">
                    <el-button size="small" style="width: 100%">
                      更多 <i class="el-icon-arrow-down"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item>
                        <nuxt-link to="/upload"
                          ><i class="el-icon-upload"></i> 上传文档</nuxt-link
                        >
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <nuxt-link to="/me"
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
                  <nuxt-link to="/login">
                    <el-button type="primary" style="width: 48%"
                      >登录</el-button
                    >
                  </nuxt-link>
                  <nuxt-link to="/register">
                    <el-button style="width: 48%">注册</el-button>
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
                  <nuxt-link to="/document" class="link-item">
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
      return nav ? nav.title : '最新文章'
    },
  },
  async created() {
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
          limit: 12,
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
        this.featuredCategories = this.categoryTrees
          .filter((cat) => cat.enable && cat.doc_count > 0)
          .slice(0, 8)
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
    onCarouselChange(index) {
      // Handle carousel change if needed
    },

    onSearch() {
      if (this.searchForm.keyword.trim()) {
        const query = { wd: this.searchForm.keyword }
        if (this.searchForm.type !== 'all') {
          query.type = this.searchForm.type
        }
        this.$router.push({ path: '/search', query })
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

    getUserTagType(groupName) {
      const typeMap = {
        管理员: 'danger',
        VIP用户: 'warning',
        普通用户: 'info',
      }
      return typeMap[groupName] || 'info'
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
}

// Hero Section
.hero-section {
  position: relative;
  height: 480px;
  overflow: hidden;

  .hero-background {
    .el-carousel {
      height: 480px;
    }

    .hero-slide {
      height: 480px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
  }

  .hero-content {
    text-align: center;
    color: white;
    z-index: 10;
    max-width: 800px;
    padding: 0 20px;

    .hero-text {
      .hero-title {
        font-size: 2.8rem;
        font-weight: 700;
        margin-bottom: 0.8rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }

      .hero-subtitle {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.9;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      }
    }
    .hero-search {
      margin-bottom: 2rem;

      .search-container {
        .search-input {
          .el-input__inner {
            height: 50px;
            font-size: 16px;
            border-radius: 25px 0 0 25px;
          }

          .el-input-group__prepend {
            border-radius: 25px 0 0 25px;
          }

          .el-input-group__append {
            border-radius: 0 25px 25px 0;

            .el-button {
              border-radius: 0 25px 25px 0;
              padding: 0 30px;
            }
          }
        }
      }

      .hot-keywords {
        margin-top: 20px;

        .hot-label {
          color: rgba(255, 255, 255, 0.8);
          margin-right: 10px;
        }

        .hot-tag {
          margin: 0 5px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
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
  position: relative;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
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
  margin-bottom: 30px;

  .documents-container {
    min-height: 400px;
  }

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;

    .document-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid $border-color;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);

        .doc-overlay {
          opacity: 1;
        }
      }

      .doc-cover {
        position: relative;
        height: 180px;
        overflow: hidden;

        .el-image {
          width: 100%;
          height: 100%;
        }

        .doc-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;

          .overlay-content {
            display: flex;
            gap: 10px;
          }
        }
      }

      .doc-info {
        padding: 15px;

        .doc-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: $text-primary;
          margin: 0 0 12px 0;
          height: 40px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .doc-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .doc-stats {
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

  .documents-list {
    .document-list-item {
      background: white;
      border: 1px solid $border-color;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;

      &:hover {
        border-color: $primary-color;
        box-shadow: 0 5px 15px rgba(64, 158, 255, 0.1);
      }

      .list-cover {
        margin-right: 20px;
        flex-shrink: 0;
      }

      .list-content {
        flex: 1;

        .list-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: $text-primary;
          margin: 0 0 10px 0;
        }

        .list-description {
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

        .list-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .meta-tags {
            display: flex;
            align-items: center;
            gap: 10px;

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
    justify-content: space-between;
    gap: 10px;
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

// Medium screen responsive design (tablets)
@media (max-width: 1200px) and (min-width: 769px) {
  .documents-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .hero-section {
    height: 320px;

    .hero-background {
      .el-carousel {
        height: 320px;
      }

      .hero-slide {
        height: 320px;
      }
    }
  }

  .hero-content {
    .hero-text {
      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
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

  .documents-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
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
</style>
