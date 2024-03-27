<template>
  <div class="page-admin-article">
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="false"
        :show-delete="false"
        :disabled-delete="selectedRow.length === 0"
        :default-search="search"
        @onSearch="onSearch"
      >
        <template slot="buttons">
          <el-form-item>
            <el-button
              type="success"
              icon="el-icon-refresh-left"
              :disabled="selectedRow.length === 0"
              @click="batchRecover"
              >恢复选中</el-button
            > </el-form-item
          ><el-form-item>
            <el-button
              type="warning"
              icon="el-icon-close"
              :disabled="selectedRow.length === 0"
              @click="batchDelete"
              >删除选中</el-button
            > </el-form-item
          ><el-form-item>
            <el-button
              type="danger"
              :disabled="selectedRow.length > 0"
              icon="el-icon-delete"
              @click="clearAll"
              >清空回收站</el-button
            >
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableList
        :loading="loading"
        :table-data="articles"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="true"
        :show-select="true"
        @selectRow="selectRow"
        @deleteRow="deleteRow"
      >
        <template slot="actions" slot-scope="scope">
          <el-button
            type="text"
            icon="el-icon-refresh-left"
            size="small"
            @click="recoverRow(scope.row)"
            >恢复</el-button
          >
        </template>
      </TableList>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <div class="text-right">
        <el-pagination
          background
          :current-page="search.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="search.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  listRecycleArticle,
  deleteArticle,
  restoreRecycleArticle,
  deleteRecycleArticle,
  emptyRecycleArticle,
} from '~/api/article'
import { listCategory } from '~/api/category'
import TableList from '~/components/TableList.vue'
import FormSearch from '~/components/FormSearch.vue'
import { genLinkHTML, categoryToTrees } from '~/utils/utils'
export default {
  components: { TableList, FormSearch },
  layout: 'admin',
  data() {
    return {
      loading: false,
      formArticleVisible: false,
      search: {
        wd: '',
        page: 1,
        status: [],
        size: 10,
      },
      articles: [],
      total: 0,
      trees: [],
      categoryMap: {},
      searchFormFields: [],
      tableListFields: [],
      selectedRow: [],
      article: {
        id: 0,
        title: '',
        identifier: '',
        keywords: '',
        description: '',
        content: '',
      },
      formArticlesCategoryVisible: false,
      categoryArticles: [],
    }
  },
  head() {
    return {
      title: `文章管理 - ${this.settings.system.sitename}`,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  watch: {
    '$route.query': {
      immediate: true,
      async handler() {
        this.search = {
          ...this.search,
          ...this.$route.query,
          page: parseInt(this.$route.query.page) || 1,
          size: parseInt(this.$route.query.size) || 10,
        }
        // 需要先加载分类数据
        if (this.trees.length === 0) {
          await this.listCategory()
        }
        this.listArticle()
      },
    },
  },
  async created() {
    await this.initSearchForm()
    this.initTableListFields()
  },
  methods: {
    // 恢复选中
    batchRecover() {
      this.$confirm(
        `您确定要从回收站中恢复选中的【${this.selectedRow.length}篇】文章吗？`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        }
      )
        .then(async () => {
          const ids = this.selectedRow.map((item) => item.id)
          const res = await restoreRecycleArticle({ id: ids })
          if (res.status === 200) {
            this.$message.success('恢复成功')
            this.listArticle()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    // 删除选中
    batchDelete() {
      this.$confirm(
        `您确定要从回收站中删除选中的【${this.selectedRow.length}篇】文章吗？删除之后不可恢复！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        }
      )
        .then(async () => {
          const ids = this.selectedRow.map((item) => item.id)
          const res = await deleteRecycleArticle({ id: ids })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listArticle()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    deleteRow(row) {
      this.$confirm(
        `您确定要从回收站中删除文章【${row.title}】吗？删除之后不可恢复！`,
        '告警',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await deleteRecycleArticle({ id: [row.id] })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listArticle()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    recoverRow(row) {
      this.$confirm(`您确定要恢复文章【${row.title}】吗？`, '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }).then(async () => {
        const res = await restoreRecycleArticle({ id: [row.id] })
        if (res.status === 200) {
          this.$message.success('恢复成功')
          this.listArticle()
        } else {
          this.$message.error(res.data.message || '操作失败')
        }
      })
    },
    // 清空回收站
    clearAll() {
      this.$confirm(
        '您确定要永久删除回收站中的所有文章吗？清空之后不可恢复，请慎重操作！',
        '风险提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error',
        }
      ).then(async () => {
        const res = await emptyRecycleArticle()
        if (res.status === 200) {
          this.$message.success('清空成功')
          this.listArticle()
        } else {
          this.$message.error(res.data.message || '操作失败')
        }
      })
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
        this.categoryMap = categoryMap
        this.trees = categoryToTrees(categories, false)
        this.total = res.data.total
        await this.initSearchForm()
      } else {
        this.$message.error(res.data.message)
      }
    },
    async listArticle() {
      this.loading = true
      const res = await listRecycleArticle(this.search)
      if (res.status === 200) {
        const articles = res.data.article || []
        articles.map((item) => {
          ;(item.category_id || (item.category_id = [])).forEach((id) => {
            ;(item.category_name || (item.category_name = [])).push(
              this.categoryMap[id] && this.categoryMap[id].title
                ? this.categoryMap[id].title
                : '-'
            )
          })
          item.title_html = genLinkHTML(
            item.title,
            `/article/${item.identifier}`
          )
          return item
        })
        this.articles = articles
        this.total = res.data.total
      } else {
        this.$message.error(res.data.message)
      }
      this.loading = false
    },
    handleSizeChange(val) {
      this.search.size = val
      this.$router.push({
        query: this.search,
      })
      // this.listArticle()
    },
    handlePageChange(val) {
      this.search.page = val
      this.$router.push({
        query: this.search,
      })
      // this.listArticle()
    },
    onSearch(search) {
      this.search = { ...this.search, ...search, page: 1 }
      if (
        location.pathname + location.search ===
        this.$router.resolve({
          query: this.search,
        }).href
      ) {
        this.listArticle()
      } else {
        this.$router.push({
          query: this.search,
        })
      }
    },
    onCreate() {
      this.$router.push('/admin/article/set')
    },
    editRow(row) {
      this.$router.push(`/admin/article/set?id=${row.id}`)
    },
    formSuccess() {
      this.formArticleVisible = false
      this.formArticlesCategoryVisible = false
      this.listArticle()
    },
    selectRow(rows) {
      this.selectedRow = rows
    },
    initSearchForm() {
      this.searchFormFields = [
        {
          type: 'text',
          label: '关键字',
          name: 'wd',
          placeholder: '请输入关键字',
        },
        {
          type: 'cascader',
          label: '分类',
          name: 'category_id',
          placeholder: '请选择分类',
          trees: this.trees,
        },
      ]
    },
    initTableListFields() {
      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'title_html',
          label: '标题',
          minWidth: 150,
          fixed: 'left',
          type: 'html',
        },
        { prop: 'identifier', label: '标识', width: 200 },
        { prop: 'view_count', label: '浏览', width: 80, type: 'number' },
        {
          prop: 'category_name',
          label: '分类',
          minWidth: 180,
          type: 'breadcrumb',
        },
        { prop: 'created_at', label: '创建时间', width: 160, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 160, type: 'datetime' },
        { prop: 'deleted_at', label: '删除时间', width: 160, type: 'datetime' },
      ]
    },
    batchUpdateArticlesCategory() {
      this.categoryArticles = this.selectedRow
      this.formArticlesCategoryVisible = true
    },
  },
}
</script>
<style lang="scss">
.page-admin-article {
  .el-drawer__body {
    padding: 0 20px;
  }
}
</style>
