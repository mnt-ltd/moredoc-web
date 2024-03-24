<template>
  <div class="page page-article-index">
    <el-row :gutter="20">
      <el-col :span="4">
        <article-navbar class="fixed-left" />
        <div>&nbsp;</div>
      </el-col>
      <el-col :span="14" class="main-list">
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
          <article-list :articles="articles" />
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
      <el-col :span="6">
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
export default {
  name: 'PageArticleIndex',
  components: { ArticleNavbar, ArticleFooter },
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
        size: 6,
        totalPage: 1,
        loading: false,
      },
      recommendArticles: [],
      articles: [],
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  watch: {
    $route: {
      handler() {
        const page = this.$route.query.page || 1
        this.query.page = parseInt(page) || 1
        this.getArticles()
      },
      immediate: true,
    },
  },
  async created() {
    await Promise.all([this.getRecommendArticles()])
  },
  methods: {
    pageChange(page) {
      this.query.page = page
      this.$router.push({
        path: this.$route.path,
        query: this.query,
      })
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
  },
}
</script>
<style lang="scss">
.page-article-index {
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
}
</style>
