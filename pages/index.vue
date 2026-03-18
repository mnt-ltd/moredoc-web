<template>
  <div class="page page-index">
    <section class="hero-search">
      <el-carousel
        :interval="3000"
        arrow="always"
        :height="isMobile ? '250px' : '420px'"
        @change="changeCarousel"
      >
        <a
          v-for="(banner, index) in banners"
          :key="'banner-' + banner.id"
          :href="banner.url || 'javascript:;'"
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
      <div class="hero-mask"></div>
      <div class="hero-content">
        <el-form :model="search" class="search-form" @submit.native.prevent>
          <el-form-item>
            <el-input
              v-model="search.wd"
              size="large"
              placeholder="搜索文档、文章"
              @keydown.native.enter="onSearch"
            >
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
              <!-- <i
                slot="suffix"
                class="el-input__icon el-icon-search btn-search"
                @click="onSearch"
              ></i> -->
            </el-input>
          </el-form-item>
          <el-form-item v-if="recommendWords.length" class="search-word-row">
            <nuxt-link
              v-for="word in recommendWords"
              :key="'kw-' + word"
              target="_blank"
              class="search-keyword"
              :to="{
                path: '/search',
                query: { wd: word },
              }"
            >
              {{ word }}
            </nuxt-link>
          </el-form-item>
        </el-form>
      </div>
    </section>
    <div v-if="notices.length > 0" class="notice-board">
      <div>
        <el-row :gutter="20">
          <el-col :span="24">
            <notice-board :notices="notices" />
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="page-shell">
      <section class="section-block recommend-section">
        <div class="section-header">
          <div class="recommend-header-wrap">
            <div class="recommend-heading">
              <h2>文档推荐</h2>
              <button
                class="recommend-refresh"
                type="button"
                @click="changeRecommendBatch"
              >
                <i class="el-icon-refresh-right"></i>
                <span>换一批</span>
              </button>
            </div>
            <div class="recommend-links">
              <nuxt-link to="/upload" class="nuxt-link" target="_blank">
                <span><i class="el-icon el-icon-upload2"></i> 上传文档</span>
              </nuxt-link>
              <span class="text-muted">|</span>
              <nuxt-link to="/post" class="nuxt-link" target="_blank">
                <span><i class="el-icon el-icon-edit"></i> 发布文章</span>
              </nuxt-link>
            </div>
          </div>
        </div>
        <div class="recommend-grid">
          <template v-if="loadingRecommend">
            <div
              v-for="item in 8"
              :key="'recommend-skeleton-' + item"
              class="recommend-card recommend-card-skeleton"
            >
              <el-skeleton animated>
                <template slot="template">
                  <div class="recommend-cover-skeleton">
                    <el-skeleton-item variant="image" />
                  </div>
                  <el-skeleton-item
                    variant="h3"
                    class="recommend-title-skeleton"
                  />
                  <el-skeleton-item
                    variant="text"
                    class="recommend-meta-skeleton recommend-meta-skeleton-author"
                  />
                  <el-skeleton-item
                    variant="text"
                    class="recommend-meta-skeleton"
                  />
                </template>
              </el-skeleton>
            </div>
          </template>
          <nuxt-link
            v-for="item in displayedRecommends"
            v-else
            :key="'recommend-' + item.id"
            :to="`/document/${item.uuid}`"
            target="_blank"
            class="recommend-card"
          >
            <div class="recommend-cover-wrap">
              <document-cover
                :document="item"
                :lazy="false"
                :width="isMobile ? 88 : 118"
                :show-ext="true"
              />
            </div>
            <div class="recommend-title hover-link">{{ item.title }}</div>
            <div class="recommend-author">
              <i class="el-icon el-icon-user"></i>
              {{ getRecommendAuthor(item) }}
            </div>
            <div class="recommend-category">
              {{
                item.category && item.category.length > 0
                  ? item.category[0].title
                  : '文档资源'
              }}
              {{
                item.category && item.category.length > 1
                  ? '· ' + item.category[1].title
                  : ''
              }}
            </div>
          </nuxt-link>
        </div>
      </section>

      <section class="section-block latest-section">
        <div class="section-header">
          <div>
            <h2>最新内容</h2>
          </div>
        </div>
        <div class="latest-grid">
          <template v-if="loadingLatest">
            <div
              v-for="panel in 2"
              :key="'latest-skeleton-panel-' + panel"
              class="latest-panel latest-panel-skeleton"
            >
              <div class="panel-header panel-header-skeleton">
                <div class="panel-title-skeleton-wrap">
                  <el-skeleton-item
                    variant="image"
                    class="panel-icon-skeleton"
                  />
                  <el-skeleton-item variant="h3" class="panel-title-skeleton" />
                </div>
                <el-skeleton-item variant="text" class="panel-more-skeleton" />
              </div>
              <div
                v-for="item in 8"
                :key="'latest-skeleton-row-' + panel + '-' + item"
                class="latest-item latest-item-skeleton"
              >
                <el-skeleton-item variant="text" class="latest-rank-skeleton" />
                <el-skeleton-item variant="text" class="latest-text-skeleton" />
                <el-skeleton-item variant="text" class="latest-date-skeleton" />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="latest-panel">
              <div class="panel-header">
                <div class="panel-title">
                  <span class="panel-icon doc-icon el-icon-document"></span>
                  <strong>文档资料</strong>
                </div>
                <nuxt-link to="/category" target="_blank" class="panel-more">
                  查看更多 <i class="el-icon el-icon-arrow-right"></i>
                </nuxt-link>
              </div>
              <nuxt-link
                v-for="(doc, index) in latestDocuments.slice(0, 8)"
                :key="'latest-doc-' + doc.id"
                :to="`/document/${doc.uuid}`"
                target="_blank"
                class="latest-item hover-link"
              >
                <span
                  class="latest-rank"
                  :class="index > 2 ? 'latest-rank-older' : ''"
                  >{{ index + 1 }}</span
                >
                <span class="latest-text">{{ doc.title }}</span>
                <span class="latest-date">{{
                  formatDate(doc.created_at)
                }}</span>
              </nuxt-link>
            </div>

            <div class="latest-panel">
              <div class="panel-header">
                <div class="panel-title">
                  <span
                    class="panel-icon article-icon el-icon-notebook-2"
                  ></span>
                  <strong>{{ articleName }}</strong>
                </div>
                <nuxt-link to="/article" target="_blank" class="panel-more">
                  查看更多 <i class="el-icon el-icon-arrow-right"></i>
                </nuxt-link>
              </div>
              <nuxt-link
                v-for="(article, index) in articles.slice(0, 8)"
                :key="'latest-article-' + article.id"
                :to="`/article/${article.identifier || article.id}`"
                target="_blank"
                class="latest-item hover-link"
              >
                <span
                  class="latest-rank"
                  :class="index > 2 ? 'latest-rank-older' : ''"
                  >{{ index + 1 }}</span
                >
                <span class="latest-text">{{ article.title }}</span>
                <span class="latest-date">{{
                  formatDate(article.created_at)
                }}</span>
              </nuxt-link>
            </div>
          </template>
        </div>
      </section>

      <section class="section-block categories-section">
        <div class="section-header">
          <div>
            <h2>分类浏览</h2>
          </div>
        </div>
        <div class="category-grid">
          <div
            v-for="category in featuredCategories"
            :key="'category-' + category.id"
            class="category-card"
          >
            <div class="category-top">
              <nuxt-link
                class="category-main-link"
                :to="`/category/${category.id}`"
                target="_blank"
              >
                <span class="category-badge">
                  <img
                    :src="category.icon || '/static/images/logo-icon.png'"
                    :alt="category.title"
                  />
                </span>
                <span class="category-main-text">
                  <strong>{{ category.title }}</strong>
                  <small>{{ category.doc_count || 0 }} 篇文档</small>
                </span>
              </nuxt-link>
              <nuxt-link
                class="category-more"
                :to="`/category/${category.id}`"
                target="_blank"
              >
                查看更多
              </nuxt-link>
            </div>
            <div class="category-children">
              <nuxt-link
                v-for="(child, index) in category.children"
                v-show="index < 9"
                :key="'child-' + child.id"
                :to="`/category/${child.id}`"
                target="_blank"
                class="category-child"
              >
                <span>{{ child.title }}</span>
                <small>{{ child.doc_count || 0 }}篇</small>
              </nuxt-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listBanner } from '~/api/banner'
import { listDocument } from '~/api/document'
import { listArticle } from '~/api/article'

export default {
  name: 'HomeIndexPage',
  data() {
    return {
      banners: [],
      recommends: [],
      latestDocuments: [],
      loadingRecommend: true,
      loadingLatest: true,
      search: {
        wd: '',
      },
      carouselIndexes: [0],
      articles: [],
      notices: [],
      recommendBatch: 0,
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
    ...mapGetters('setting', ['settings', 'navigations']),
    articleName() {
      const nav = this.navigations.find((nav) => nav.href === '/article')
      return nav ? nav.title : '最新文章'
    },
    recommendWords() {
      return (this.settings.system.recommend_words || []).slice(0, 4)
    },
    displayedRecommends() {
      if (!this.recommends.length) {
        return []
      }
      const start = this.recommendBatch * 8
      return this.recommends.slice(start, start + 8)
    },
    recommendBatchCount() {
      return Math.max(Math.ceil(this.recommends.length / 8), 1)
    },
    featuredCategories() {
      const hideEmpty = this.settings.display.hide_category_without_document
      return (this.categoryTrees || [])
        .filter((item) => item.enable && !item.type)
        .filter((item) => (hideEmpty ? item.doc_count > 0 : true))
        .map((item) => ({
          ...item,
          children: (item.children || []).filter((child) => {
            if (!child.enable) {
              return false
            }
            return hideEmpty ? child.doc_count > 0 : true
          }),
        }))
      // .slice(0, 4)
    },
  },
  async created() {
    await Promise.all([
      this.listBanner(),
      this.getRecommendDocuments(),
      this.getNotices(),
      this.getLatestContent(),
    ])
  },
  methods: {
    async listBanner() {
      const res = await listBanner({
        enable: true,
        field: ['id', 'title', 'path', 'url'],
        type: 0,
      })
      if (res.status === 200) {
        this.banners = res.data.banner || []
      }
    },
    onSearch() {
      if (this.search.wd) {
        location.href = '/search?wd=' + encodeURIComponent(this.search.wd)
      }
    },
    async getNotices() {
      const res = await listArticle({
        page: 1,
        size: 100,
        is_notice: [1],
      })
      if (res.status === 200) {
        this.notices = res.data.article || []
      }
    },
    async getArticles() {
      const res = await listArticle({
        page: 1,
        size: 8,
      })
      if (res.status === 200) {
        this.articles = res.data.article || []
      }
    },
    async getRecommendDocuments() {
      this.loadingRecommend = true
      try {
        const res = await listDocument({
          // field: ['id', 'title', 'uuid', 'category_name', 'username', 'cover'],
          is_recommend: true,
          order: 'recommend_at desc',
          limit: 24,
        })
        if (res.status === 200) {
          this.recommends = res.data.document || []
          this.recommendBatch = 0
        }
      } finally {
        this.loadingRecommend = false
      }
    },
    async getLatestContent() {
      this.loadingLatest = true
      try {
        await Promise.all([this.getLatestDocuments(), this.getArticles()])
      } finally {
        this.loadingLatest = false
      }
    },
    async getLatestDocuments() {
      const res = await listDocument({
        field: ['id', 'title', 'uuid', 'created_at'],
        order: 'id desc',
        limit: 8,
      })
      if (res.status === 200) {
        this.latestDocuments = res.data.document || []
      }
    },
    changeCarousel(index) {
      const carouselIndexes = this.carouselIndexes
      if (!carouselIndexes.includes(index)) {
        carouselIndexes.push(index)
      }
      this.carouselIndexes = carouselIndexes
    },
    changeRecommendBatch() {
      if (this.recommendBatchCount <= 1) {
        return
      }
      this.recommendBatch = (this.recommendBatch + 1) % this.recommendBatchCount
    },
    getRecommendAuthor(item) {
      return (
        item.realname ||
        item.nickname ||
        item.username ||
        (item.user &&
          (item.user.realname || item.user.nickname || item.user.username)) ||
        '未知作者'
      )
    },
    formatDate(value) {
      if (!value) {
        return ''
      }
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) {
        return value
      }
      const year = date.getFullYear()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${year}-${month}-${day}`
    },
  },
}
</script>

<style lang="scss">
.page-index {
  width: 100%;
  max-width: 100%;
  margin-top: -20px;

  a {
    text-decoration: none;
  }

  .el-carousel__button {
    width: 20px;
    height: 3px;
    border-radius: 2px;
  }

  .notice-board {
    margin-top: 0;
    margin-bottom: 0 !important;
    background-color: #fff;
    & > div {
      width: $default-width;
      max-width: $max-width;
      margin: 0 auto;
    }
  }
}

.hero-search {
  position: relative;

  a {
    display: inline-block;
  }

  .el-carousel__item {
    background-size: cover !important;
  }

  .hero-mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(230, 236, 244, 0.12) 0%,
      rgba(230, 236, 244, 0.4) 55%,
      rgba(230, 236, 244, 0.7) 100%
    );
    pointer-events: none;
  }

  .hero-content {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
    padding: 0 20px;
    box-sizing: border-box;
  }

  .search-form {
    width: 560px;
    max-width: 100%;
    margin: 0 auto;

    .el-form-item {
      margin-bottom: 12px;
    }

    .el-input__inner {
      height: 50px;
      line-height: 50px;
      border: 0;
      border-radius: 999px;
      padding-left: 42px;
      padding-right: 42px;
      font-size: 15px;
      color: #606266;
      box-shadow: 0 10px 30px rgba(31, 45, 61, 0.15);
    }

    .el-input__prefix,
    .el-input__suffix {
      display: flex;
      align-items: center;
      color: #98a2b3;
      margin-left: 6px;
      color: #000;
      font-size: 1.2em;
    }

    .btn-search {
      cursor: pointer;
      color: #7b8794;
    }
  }

  .search-word-row {
    text-align: center;
  }

  .search-keyword {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    padding: 0 14px;
    height: 28px;
    margin: 0 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.6);
    color: #5f6c7b;
    font-size: 12px;
    backdrop-filter: blur(8px);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.85);
      color: #2f7cf6;
    }
  }
}

.page-shell {
  width: $default-width;
  max-width: $max-width;
  margin: 0 auto;
  padding-top: 10px;
}

.section-block {
  margin-bottom: 30px;

  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 10px;
    margin-top: 16px;

    h2 {
      margin: 0 0 4px;
      color: #202939;
      font-size: 22px;
      line-height: 1.1;
    }

    p {
      margin: 0;
      color: #7b8794;
      font-size: 13px;
    }
  }
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px 24px;
}

.recommend-card,
.latest-panel,
.category-card,
.publish-entry {
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.recommend-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 16px 16px;
  color: #303133;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  }
}

.recommend-card-skeleton {
  display: block;
}

.recommend-cover-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 190px;
  margin-bottom: 14px;

  .com-document-cover {
    border-color: #e8ebf0;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);

    img:hover {
      transform: none;
    }
  }
}

.recommend-cover-skeleton {
  width: 100%;
  height: 190px;
  margin-bottom: 14px;

  .el-skeleton__item {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }
}

.recommend-title-skeleton {
  width: 88%;
  height: 20px;
  margin: 0 auto 12px;
}

.recommend-meta-skeleton {
  width: 70%;
  height: 14px;
  margin: 0 auto;
}

.recommend-meta-skeleton-author {
  width: 58%;
  margin-bottom: 8px;
}

.recommend-title {
  width: 100%;
  min-height: 48px;
  overflow: hidden;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 24px;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.recommend-author,
.recommend-category {
  width: 100%;
  color: #6b7280;
  font-size: 13px;
  line-height: 20px;
}

.recommend-author {
  margin-bottom: 2px;
  margin-top: 5px;
  color: #1f2937;
}

.recommend-header-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.recommend-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recommend-refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #606266;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: #2f7cf6;
  }
}

.recommend-links {
  display: inline-flex;
  align-items: center;
  gap: 14px;

  .nuxt-link {
    color: #606266;
    font-size: 14px;

    &:hover {
      color: #2f7cf6;
    }
  }
}

.publish-panel {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
}

.publish-entry {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  color: #243b53;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  }

  .entry-icon {
    width: 46px;
    height: 46px;
    margin-bottom: 14px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  strong {
    margin-bottom: 6px;
    font-size: 18px;
    line-height: 1.2;
  }

  small {
    color: #7b8794;
    font-size: 12px;
    line-height: 1.6;
  }
}

.entry-upload .entry-icon {
  background: rgba(38, 132, 255, 0.12);
  color: #2f7cf6;
}

.entry-post .entry-icon {
  background: rgba(46, 184, 92, 0.12);
  color: #2eb85c;
}

.latest-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.latest-panel {
  padding: 18px 18px 10px;
}

.latest-panel-skeleton {
  padding-bottom: 14px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  margin-bottom: 2px;
  border-bottom: 1px solid #eef2f6;
}

.panel-header-skeleton {
  align-items: center;
}

.panel-title-skeleton-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon-skeleton {
  width: 30px;
  height: 30px;
  border-radius: 8px;
}

.panel-title-skeleton {
  width: 96px;
  height: 18px;
}

.panel-more-skeleton {
  width: 72px;
  height: 14px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #111827;
  font-size: 16px;
}

.panel-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.doc-icon {
  background: linear-gradient(135deg, #ff8a5b 0%, #ff6b57 100%);
}

.article-icon {
  background: linear-gradient(135deg, #5bc58c 0%, #33a06f 100%);
}

.panel-more {
  color: #2f7cf6;
  font-size: 12px;
}

.latest-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 90px;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px dashed #edf2f7;
  color: #344054;

  &:last-child {
    border-bottom: 0;
  }
}

.latest-item-skeleton {
  cursor: default;
}

.latest-rank-skeleton {
  width: 18px;
  height: 18px;
  border-radius: 6px;
}

.latest-text-skeleton {
  width: 88%;
  height: 14px;
}

.latest-date-skeleton {
  width: 72px;
  height: 14px;
  justify-self: end;
}

.latest-rank {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: #ff7a59;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

.latest-rank-older {
  background: #6b7280;
}

.latest-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.latest-date {
  color: #98a2b3;
  font-size: 12px;
  text-align: right;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.category-card {
  padding: 18px;
}

.category-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.category-main-link {
  display: flex;
  align-items: center;
  min-width: 0;
  color: #243b53;
}

.category-badge {
  width: 42px;
  height: 42px;
  margin-right: 12px;
  border-radius: 12px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img {
    width: 42px;
    height: 42px;
  }
}

.category-main-text {
  display: flex;
  flex-direction: column;

  strong {
    margin-bottom: 4px;
    color: #111827;
    font-size: 18px;
  }

  small {
    color: #7b8794;
    font-size: 12px;
  }
}

.category-more {
  color: #2f7cf6;
  font-size: 12px;
  white-space: nowrap;
}

.category-children {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 18px;
  padding-top: 14px;
  border-top: 1px solid #eef2f6;
}

.category-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: #f6f6f6;
  color: #52606d;
  font-size: 13px;
  &:hover {
    background: #e9e9e9;
    color: #2f7cf6;
  }

  span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  small {
    color: #98a2b3;
    white-space: nowrap;
  }
}

@media screen and (max-width: $mobile-width) {
  .page-index {
    .el-carousel__arrow {
      display: none;
    }
  }

  .hero-search {
    .hero-content {
      padding: 0 14px;
    }

    .search-form {
      width: 100%;

      .el-form-item {
        margin-bottom: 10px;
      }

      .el-input__inner {
        height: 44px;
        line-height: 44px;
        font-size: 14px;
      }
    }

    .search-keyword {
      min-width: auto;
      padding: 0 12px;
      margin-bottom: 6px;
    }
  }

  .page-shell {
    width: auto;
    padding: 16px 10px 0;
  }

  .section-block {
    margin-bottom: 18px;

    .section-header {
      margin-bottom: 12px;

      h2 {
        font-size: 24px;
      }
    }
  }

  .latest-grid,
  .category-grid {
    grid-template-columns: 1fr;
  }

  .recommend-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .recommend-card {
    padding: 12px;
  }

  .recommend-cover-wrap {
    min-height: 150px;
    margin-bottom: 10px;
  }

  .recommend-cover-skeleton {
    height: 150px;
    margin-bottom: 10px;
  }

  .recommend-header-wrap {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .recommend-heading {
    gap: 10px;
  }

  .recommend-refresh,
  .recommend-links .nuxt-link {
    font-size: 13px;
  }

  .recommend-links {
    gap: 12px;
  }

  .publish-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    gap: 12px;
  }

  .publish-entry {
    padding: 16px;

    strong {
      font-size: 16px;
    }
  }

  .latest-panel {
    padding: 16px 14px 8px;
  }

  .latest-item {
    grid-template-columns: 22px minmax(0, 1fr) 74px;
    gap: 10px;
  }

  .latest-date {
    font-size: 11px;
  }

  .category-card {
    padding: 16px 14px;
  }

  .category-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .category-more {
    padding-left: 54px;
  }

  .category-children {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
  }
}
</style>
