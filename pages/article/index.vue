<template>
  <div class="page page-article-index">
    <el-row :gutter="20">
      <el-col :span="4">
        <article-navbar :active-id="activeId" />
      </el-col>
      <el-col :span="14">
        <el-card shadow="never">
          <div slot="header" class="header-tabs">
            <nuxt-link
              class="el-link el-link--default el-link--primary"
              :to="`?category_id=${$route.query.category_id}&tab=latest`"
              >最新</nuxt-link
            >
            <nuxt-link
              class="el-link el-link--default"
              :to="`?category_id=${$route.query.category_id}&tab=popular`"
              >热门</nuxt-link
            >
            <el-button
              size="small"
              type="primary"
              style="float: right"
              icon="el-icon-plus"
              >发布文章</el-button
            >
          </div>
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
        <el-card shadow="never" class="popular">
          <div slot="header">推荐</div>
          <div v-if="populars.length > 0">
            <nuxt-link
              v-for="article in populars"
              :key="'article-' + article.id"
              :to="`/article/${article.identifier}`"
              :title="article.title"
              class="el-link el-link--default"
              >{{ article.title }}</nuxt-link
            >
          </div>
          <el-empty v-else> </el-empty>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { listArticle } from '~/api/article'
import ArticleNavbar from '~/components/ArticleNavbar.vue'
export default {
  name: 'PageArticleIndex',
  components: { ArticleNavbar },
  layout: 'article',
  data() {
    return {
      total: 0,
      size: 10,
      query: {
        page: 1,
      },
      populars: [],
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
    await Promise.all([this.getPopulars()])
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
      const res = await listArticle({ size: this.size, page: this.query.page })
      if (res.status !== 200) {
        this.$message.error(res.data.message || '获取文章列表失败')
        return
      }
      this.articles = res.data.article || []
      this.total = res.data.total || 0
    },
    async getPopulars() {
      const res = await listArticle({
        page: 1,
        size: 5,
        order: 'view_count desc',
      })
      if (res.status !== 200) {
        this.$message.error(res.data.message || '获取热门文章失败')
        return
      }
      this.populars = res.data.article || []
    },
  },
}
</script>
<style lang="scss">
.page-article-index {
  .el-card__body {
    padding-top: 0;
    padding-bottom: 0;
    .el-pagination {
      padding: 20px 0;
      border-top: 1px dashed #efefef;
    }
  }
  .popular {
    .el-card__header {
      padding: 14px 20px;
    }
    a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px dashed #efefef;
      &:last-of-type {
        border-bottom: 0;
      }
    }
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
