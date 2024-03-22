<template>
  <div class="page-admin-article">
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="true"
        :show-delete="true"
        :disabled-delete="selectedRow.length === 0"
        :default-search="search"
        @onSearch="onSearch"
        @onCreate="onCreate"
        @onDelete="batchDelete"
      >
        <template slot="buttons">
          <el-form-item>
            <el-tooltip
              class="item"
              effect="dark"
              content="批量修改选中的文档分类"
              placement="top"
            >
              <el-button
                type="success"
                :disabled="selectedRow.length === 0"
                icon="el-icon-edit"
                @click="batchUpdateArticlesCategory"
                >批量分类</el-button
              >
            </el-tooltip>
          </el-form-item>
          <el-form-item>
            <el-dropdown
              :disabled="selectedRow.length === 0"
              @command="batchRecommend"
            >
              <el-button type="primary" icon="el-icon-s-check">
                批量推荐 <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="true">推荐选中</el-dropdown-item>
                <el-dropdown-item :command="false">取消推荐</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      >
        <!-- 查看文章 -->
        <!-- <template slot="actions" slot-scope="scope">
          <nuxt-link
            target="_blank"
            :to="{
              name: 'article-id',
              params: { id: scope.row.identifier },
            }"
          >
            <el-button type="text" size="mini" icon="el-icon-view"
              >查看</el-button
            >
          </nuxt-link>
        </template> -->
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
    <el-drawer
      :title="article.id ? '编辑文章' : '新增文章'"
      :visible.sync="formArticleVisible"
      :size="'80%'"
      :wrapper-closable="true"
    >
      <FormArticle
        ref="articleForm"
        :init-article="article"
        @success="formSuccess"
      />
    </el-drawer>
    <el-dialog
      :close-on-click-modal="false"
      title="批量分类"
      width="640px"
      :visible.sync="formArticlesCategoryVisible"
    >
      <FormUpdateArticlesCategory
        v-if="formArticlesCategoryVisible"
        :category-trees="trees"
        :articles="categoryArticles"
        @success="formSuccess"
      />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listArticle, deleteArticle, recommendArticles } from '~/api/article'
import { listCategory } from '~/api/category'
import TableList from '~/components/TableList.vue'
import FormSearch from '~/components/FormSearch.vue'
import FormArticle from '~/components/FormArticle.vue'
import {
  genLinkHTML,
  categoryToTrees,
  parseQueryIntArray,
  parseQueryBoolArray,
} from '~/utils/utils'
export default {
  components: { TableList, FormSearch, FormArticle },
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
    async batchRecommend(command) {
      const ids = this.selectedRow.map((item) => item.id)
      const res = await recommendArticles({
        article_id: ids,
        is_recommend: command,
      })
      if (res.status === 200) {
        this.$message.success('操作成功')
        this.listArticle()
      } else {
        this.$message.error(res.data.message)
      }
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
      const res = await listArticle(this.search)
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
    batchDelete() {
      this.$confirm(
        `您确定要删除选中的【${this.selectedRow.length}篇】文章吗？删除之后将会在回收站！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const ids = this.selectedRow.map((item) => item.id)
          const res = await deleteArticle({ id: ids })
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
        `您确定要删除文章【${row.title}】吗？删除之后不可恢复！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await deleteArticle({ id: row.id })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listArticle()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
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
        // { prop: 'keywords', label: '关键字', width: 200 },
        // { prop: 'description', label: '摘要', minWidth: 200 },
        {
          prop: 'recommend_at',
          label: '推荐时间',
          width: 160,
          type: 'datetime',
        },
        { prop: 'created_at', label: '创建时间', width: 160, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 160, type: 'datetime' },
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
