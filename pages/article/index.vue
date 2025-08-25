<template>
  <div class="page page-article-index">
    <el-row :gutter="20">
      <el-col class="hidden-xs-only" :span="4">
        <article-navbar class="fixed-left" />
        <div>&nbsp;</div>
      </el-col>
      <el-col :span="14" :xs="24" class="main-list">
        <el-breadcrumb
          v-if="activeCate.id"
          style="margin-bottom: 10px"
          separator="/"
          class="hidden-xs-only"
        >
          <el-breadcrumb-item>
            <nuxt-link to="/"><i class="fa fa-home"></i> 首页</nuxt-link>
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            <nuxt-link to="/article">全部内容</nuxt-link>
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="'bread1-' + item.id"
          >
            <el-dropdown v-if="item.children.length > 0">
              <span class="el-dropdown-link">
                {{ item.title
                }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown" class="breadcrumb-dropdown">
                <el-dropdown-item
                  v-for="ss in item.children.filter((x) => x.type)"
                  :key="'s1-' + ss.id"
                >
                  <nuxt-link
                    class="el-link el-link--default block"
                    :class="{
                      'el-link--primary': ss.id === item.id,
                    }"
                    :to="`/article?category_id=${ss.id}`"
                    >{{ ss.title }}</nuxt-link
                  ></el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
            <span v-else>{{ item.title }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <el-tabs
          v-model="activeCate.idStr"
          type="border-card"
          class="hidden-sm-and-up"
          @tab-click="changeTabs"
        >
          <el-tab-pane label="全部文章" name=""></el-tab-pane>
          <el-tab-pane
            v-for="cate in categoryTrees.filter((item) => item.type === 1)"
            :key="'pane-' + cate.id"
            :label="cate.title"
            :name="`${cate.id}`"
          ></el-tab-pane>
        </el-tabs>
        <el-card shadow="never">
          <template slot="header">
            <nuxt-link
              class="el-link el-link--default"
              :class="{
                'el-link--primary':
                  $route.query.tab === 'latest' || !$route.query.tab,
              }"
              :to="`?category_id=${$route.query.category_id || ''}&tab=latest`"
              >最新发布</nuxt-link
            >
            <nuxt-link
              class="el-link el-link--default"
              :class="{
                'el-link--primary': $route.query.tab === 'popular',
              }"
              :to="`?category_id=${$route.query.category_id || ''}&tab=popular`"
              >热门文章</nuxt-link
            >
            <nuxt-link to="/post">
              <el-button
                size="small"
                type="primary"
                style="float: right; margin-top: -4px"
                icon="el-icon-plus"
                >发布文章</el-button
              >
            </nuxt-link>
          </template>
          <div
            v-if="
              activeCate.description &&
              activeCate.show_description &&
              (query.page === 1 || !query.page)
            "
            class="cate-description"
          >
            {{ activeCate.description }}
          </div>
          <article-list-skeleton
            v-if="loading && articles.length === 0 && query.page === 1"
          />
          <article-list v-else :articles="articles" />
          <el-pagination
            v-if="total > 0"
            :current-page="query.page"
            :page-size="size"
            :layout="
              isMobile
                ? 'total, prev, pager, next'
                : 'total, prev, pager, next, jumper'
            "
            :pager-count="isMobile ? 5 : 7"
            :small="isMobile"
            :total="total"
            @current-change="pageChange"
          >
          </el-pagination>
        </el-card>
      </el-col>
      <el-col :span="6" class="hidden-xs-only">
        <div class="fixed-right">
          <el-card shadow="never" class="recommend">
            <div slot="header">推荐</div>
            <div v-if="recommendArticles.length > 0">
              <ArticleSimpleList
                v-loading="recommend.loading"
                :articles="recommendArticles"
              ></ArticleSimpleList>
              <el-button
                v-if="recommend.totalPage > 1"
                icon="el-icon-refresh"
                type="text"
                class="mgb-5px"
                @click="getRecommendArticles"
                >换一批</el-button
              >
            </div>
            <el-empty v-else> </el-empty>
          </el-card>
          <ArticleFooter class="mgt-20px" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { listArticle } from '~/api/article'
import ArticleNavbar from '~/components/ArticleNavbar.vue'
import ArticleFooter from '~/components/ArticleFooter.vue'
import ArticleListSkeleton from '~/components/ArticleListSkeleton.vue'
export default {
  name: 'PageArticleIndex',
  components: { ArticleNavbar, ArticleFooter, ArticleListSkeleton },
  layout: 'article',
  data() {
    return {
      total: 0,
      size: 10,
      query: {
        page: 1,
      },
      recommend: {
        page: 1,
        size: 8,
        totalPage: 1,
        loading: false,
      },
      recommendArticles: [],
      articles: [],
      breadcrumbs: [],
      activeCate: { id: 0, title: '全部文章', description: '', idStr: '' },
    }
  },
  head() {
    return {
      title:
        (this.articleName ? this.articleName : '全部文章') +
        ' - ' +
        this.settings.system.sitename,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            this.activeCate.description || this.settings.system.description,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('setting', ['settings', 'navigations']),
    ...mapGetters('category', ['categoryMap', 'categoryTrees', 'categories']),
    articleName() {
      const nav = this.navigations.find((nav) => nav.href === '/article')
      return nav ? nav.title : '文章资讯'
    },
  },
  watch: {
    $route: {
      handler() {
        const page = this.$route.query.page || 1
        this.query.page = parseInt(page) || 1
        this.setActiveCate()
        this.getArticles()
      },
      immediate: true,
    },
  },
  async fetch() {
    await Promise.all([this.getRecommendArticles()])
  },
  methods: {
    setActiveCate() {
      const cateId = this.$route.query.category_id || undefined
      let activeCate = { title: '全部文章', id: 0 }
      if (cateId) {
        activeCate = this.categoryMap[cateId] || activeCate
      }
      activeCate.idStr = activeCate.id.toString()
      this.activeCate = activeCate
      this.setBreadcrumbs()
    },
    pageChange(page) {
      this.query.page = page
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          ...this.query,
        },
      })
    },
    setBreadcrumbs() {
      const breadcrumbs = []
      let category = { children: [], ...this.categoryMap[this.activeCate.id] }
      if (category.id) {
        // 查询当前分类的兄弟分类
        category.children = this.filterCategoryChildren(category)
        breadcrumbs.push(category)
        while (category.parent_id) {
          category = { children: [], ...this.categoryMap[category.parent_id] }
          if (category.id) {
            category.children = this.filterCategoryChildren(category)
            breadcrumbs.splice(0, 0, category)
          }
        }
      }
      const titles = []
      breadcrumbs.forEach((x) => {
        titles.push(x.title)
      })
      this.title = titles.join(' · ')
      this.breadcrumbs = breadcrumbs
    },
    filterCategoryChildren(category) {
      try {
        return this.categories.filter((x) => {
          return x.parent_id === category.id && x.type === 1 && x.enable
        })
      } catch (error) {}
      return []
    },
    async getArticles() {
      const res = await listArticle({
        size: this.size,
        page: this.query.page,
        category_id: this.$route.query.category_id || undefined,
        order: this.$route.query.tab === 'popular' ? 'view_count desc' : '',
        status: 1, // 审核通过的文章
      })
      if (res.status !== 200) {
        this.$message.error(res.data.message || '获取文章列表失败')
        return
      }
      this.articles = res.data.article || []
      this.total = res.data.total || 0
    },
    async getRecommendArticles() {
      this.loading = true
      const res = await listArticle({
        page: this.recommend.page,
        size: this.recommend.size,
        is_recommend: true,
        status: 1, // 审核通过的文章
      })
      this.loading = false
      if (res.status !== 200) {
        this.$message.error(res.data.message || '获取推荐文章失败')
        return
      }
      const nextPage = this.recommend.page + 1
      this.recommend.totalPage = Math.ceil(res.data.total / this.recommend.size)
      if (nextPage > this.recommend.totalPage) {
        this.recommend.page = 1
      } else {
        this.recommend.page = nextPage
      }
      this.recommendArticles = res.data.article || []
    },
    changeTabs(tab) {
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.$route.query,
          category_id: tab.name,
          page: 1,
        },
      })
    },
  },
}
</script>
<style lang="scss">
.page-article-index {
  .el-tabs--border-card > .el-tabs__header {
    padding: 0 10px;
    border-bottom: 0 !important;
  }
  .el-tabs__item.is-active {
    border-top-left-radius: 4px !important;
    border-top-right-radius: 4px !important;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    margin-top: 2px !important;
  }
  .article-footer {
    .el-card__body {
      padding: 0;
    }
  }

  .el-card__body {
    padding-top: 0;
    padding-bottom: 0;
    .el-pagination {
      padding: 20px 0;
      border-top: 1px dashed #efefef;
    }
  }

  .cate-description {
    padding: 10px 0;
    color: #909399;
    line-height: 170%;
    font-size: 13px;
    word-break: break-all;
    border: 1px dashed #ddd;
    padding: 10px;
    border-radius: 4px;
    margin: 10px -10px 0;
  }

  .popular {
    .el-card__body {
      padding-top: 10px;
    }
    a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: normal;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px dashed #efefef;
      &:last-of-type {
        border-bottom: 0;
      }
    }
  }

  .main-list {
    .el-card__header {
      .el-link--default {
        display: inline-block;
        margin-right: 20px;
      }
    }
  }
  .fixed-left {
    width: 185px;
    position: fixed;
  }

  .fixed-right {
    position: fixed;
    width: 285px;
  }
}

@media screen and (max-width: $mobile-width) {
  .page-article-index {
    .el-col {
      width: 100%;
    }
    .popular {
      margin-top: 15px;
    }
  }
  .el-tabs--border-card {
    border: 0;
    .el-tabs__content {
      display: none;
    }
  }
}
</style>
