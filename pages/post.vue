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
        @success="back"
      ></FormArticle>
    </el-card>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getArticle } from '~/api/article'
import { canIPublishArticle } from '~/api/user'
export default {
  data() {
    return {
      canIPublish: false,
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
  computed: {
    ...mapGetters('user', ['token', 'user']),
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('setting', ['settings']),
    trees() {
      return this.categoryTrees.filter((item) => item.type === 1)
    },
  },
  created() {
    this.canIPublishArticle()
  },
  methods: {
    async canIPublishArticle() {
      if (!this.token) {
        return
      }
      this.loading = true
      const res = await canIPublishArticle()
      if (res.status === 200) {
        this.canIPublish = true
        this.getArticle()
      }
      this.loading = false
    },
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
