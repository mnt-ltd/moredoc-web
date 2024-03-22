<template>
  <div>
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="4">
            <el-button icon="el-icon-back" @click="onCancel">返回</el-button>
          </el-col>
          <el-col :span="20" class="text-center">
            <div class="header-title">
              <span v-if="article.id > 0">编辑文章</span>
              <span v-else>新增文章</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <FormArticle
        :init-article="article"
        :category-trees="trees"
        :is-admin="true"
        :can-i-publish="true"
      ></FormArticle>
    </el-card>
  </div>
</template>

<script>
import { getArticle } from '~/api/article'
import { listCategory } from '~/api/category'
import FormArticle from '~/components/FormArticle.vue'
import { categoryToTrees } from '~/utils/utils'
export default {
  components: {
    FormArticle,
  },
  layout: 'admin',
  data() {
    return {
      article: {
        title: '',
        identifier: '',
        keywords: '',
        description: '',
        content: '',
        id: 0,
        category_id: [],
      },
      trees: [],
    }
  },
  async created() {
    await Promise.all([this.listCategory(), this.getArticle()])
  },
  methods: {
    async getArticle() {
      const id = this.$route.query.id
      if (!id) {
        return
      }
      const res = await getArticle({ id: this.$route.query.id })
      if (res.status !== 200) {
        this.$message.error(res.data.message || '获取文章失败')
        return
      }
      this.article = res.data
    },
    async listCategory() {
      const res = await listCategory({
        field: ['id', 'parent_id', 'title'],
        type: [1], // 筛选文章分类
      })
      if (res.status === 200) {
        let categories = res.data.category || []
        categories = categories.map((item) => {
          item.disable_delete = item.doc_count > 0
          return item
        })
        const categoryMap = {}
        categories.forEach((item) => {
          categoryMap[item.id] = item
        })
        this.trees = categoryToTrees(categories, false)
      } else {
        this.$message.error(res.data.message)
      }
    },
    onCancel() {
      this.$router.push('/admin/article/list')
    },
  },
}
</script>

<style>
.tox-promotion {
  display: none !important;
}
</style>
<style lang="scss" scoped>
.header-title {
  height: 40px;
  line-height: 40px;
  font-size: 20px;
}
</style>
