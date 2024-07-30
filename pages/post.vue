<template>
  <div class="page page-post">
    <el-card shadow="never">
      <template slot="header">
        <div>
          发布文章
          <el-button
            style="float: right; margin-top: -10px"
            type="text"
            icon="el-icon-back"
            @click="back"
            >返回</el-button
          >
        </div>
      </template>
      <FormArticle
        v-loading="loading"
        :init-article="article"
        :category-trees="trees"
        :can-i-publish="canIPublish"
        :can-i-crawl-article="canICrawlArticle"
        @success="success"
      ></FormArticle>
    </el-card>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { getArticle } from '~/api/article'
export default {
  data() {
    return {
      loading: false,
      article: {
        title: '',
        identifier: '',
        keywords: '',
        description: '',
        content: '',
        id: 0,
        category_id: [],
      },
    }
  },
  head() {
    return {
      title: `发布文章 - ${this.settings.system.sitename}`,
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: `发布文章,${this.settings.system.sitename},${this.settings.system.keywords}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: `${this.settings.system.description}`,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('user', ['token', 'user', 'groups']),
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('setting', ['settings']),
    trees() {
      return this.categoryTrees.filter((item) => item.type === 1)
    },
    canIPublish() {
      return this.groups.some((group) => group.enable_article)
    },
    canICrawlArticle() {
      return this.groups.some((group) => group.enable_article_crawl)
    },
  },
  created() {
    this.getArticle()
    this.getCategories()
  },
  methods: {
    ...mapActions('category', ['getCategories']),
    async getArticle() {
      const identifier = this.$route.query.identifier
      if (!identifier) {
        return
      }
      const res = await getArticle({ identifier })
      if (res.status !== 200) {
        this.$message.error(res.data.message || '获取文章失败')
        return
      }
      this.article = res.data
    },
    success(article) {
      this.$router.push(`/article/${article.identifier}`)
    },
    back() {
      if (history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    },
  },
}
</script>
<style lang="scss"></style>
