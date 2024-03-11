<template>
  <div class="com-form-update-articles-category">
    <el-form ref="form" label-position="top" label-width="80px" :model="form">
      <el-form-item
        label="新文章分类"
        prop="category_id"
        :rules="[
          { required: true, trigger: 'blur', message: '请选择新的文章分类' },
        ]"
      >
        <el-cascader
          v-model="form.category_id"
          :options="categoryTrees"
          :filterable="true"
          :props="{
            checkStrictly: true,
            expandTrigger: 'hover',
            label: 'title',
            value: 'id',
          }"
          clearable
          placeholder="请选择新的文章分类"
        ></el-cascader>
      </el-form-item>
      <el-form-item label="文章列表" class="document-list">
        <ArticleSimpleList :articles="articles" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          @click="setArticlesCategory"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { setArticlesCategory } from '~/api/article'
export default {
  name: 'FormUpdateArticlesCategory',
  props: {
    // 文章分类
    categoryTrees: {
      type: Array,
      default: () => {
        return []
      },
    },
    articles: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      form: {
        category_id: [],
        article_id: [],
      },
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {},
  methods: {
    setArticlesCategory() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$confirm('您确定要批量修改文章分类吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(async () => {
              this.form.article_id = this.articles.map((item) => item.id)
              const res = await setArticlesCategory(this.form)
              if (res.status === 200) {
                this.$message.success('修改成功')
                this.$emit('success', res.data)
              }
            })
            .catch(() => {})
        }
      })
    },
  },
}
</script>
<style lang="scss">
.com-form-update-articles-category {
  .document-list {
    ul,
    li {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    ul {
      max-height: 300px;
      overflow: auto;
    }
    li {
      line-height: 30px;
      color: #777;
    }
  }
}
</style>
