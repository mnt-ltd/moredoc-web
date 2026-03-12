<template>
  <div>
    <el-alert
      v-if="search.article_list_id"
      type="info"
      :closable="false"
      class="mgb-20px"
      :title="`当前仅查看列表源 #${search.article_list_id} 发现的文章`"
    >
      <template slot="default">
        <el-button type="text" @click="clearSourceFilter">清除筛选</el-button>
      </template>
    </el-alert>

    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="false"
        :show-delete="true"
        :disabled-delete="selectedRow.length === 0"
        :default-search="search"
        @onSearch="onSearch"
        @onDelete="batchDelete"
      >
        <template slot="buttons">
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-download"
              :disabled="selectedRow.length === 0"
              @click="joinCollectQueue"
              >加入采集队列</el-button
            >
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-finished"
              :disabled="selectedRow.length === 0"
              @click="openPublishDrawer"
              >发布选中</el-button
            >
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>

    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="spiderArticleDetails"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="170"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      >
        <template slot="actions" slot-scope="scope">
          <el-button
            type="text"
            icon="el-icon-view"
            @click="previewRow(scope.row)"
            >预览</el-button
          >
          <el-button
            v-if="scope.row.article_id"
            type="text"
            icon="el-icon-link"
            @click="openPublishedArticle(scope.row)"
            >已发布</el-button
          >
        </template>
      </TableListV2>
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
        ></el-pagination>
      </div>
    </el-card>

    <el-drawer
      :visible.sync="detailVisible"
      direction="rtl"
      :size="isMobile ? '100%' : '65%'"
      :wrapper-closable="false"
    >
      <div slot="title">
        <el-page-header
          content="文章详情"
          @back="detailVisible = false"
        ></el-page-header>
      </div>
      <div style="padding: 0 20px 20px">
        <el-form ref="detailForm" :model="detailForm" label-position="top">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标题">
                <el-input v-model="detailForm.title"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来源">
                <el-input v-model="detailForm.source"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发布时间">
                <el-date-picker
                  v-model="detailForm.published_at"
                  type="datetime"
                  placeholder="请选择发布时间"
                  style="width: 100%"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-select v-model="detailForm.status" style="width: 100%">
                  <el-option
                    v-for="item in spiderArticleDetailStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="摘要">
            <el-input
              v-model="detailForm.description"
              type="textarea"
              :rows="3"
            ></el-input>
          </el-form-item>
          <el-form-item label="内容规则(JSON)">
            <el-input
              v-model="detailForm.content_rules"
              type="textarea"
              :rows="5"
            ></el-input>
          </el-form-item>
          <el-tabs v-model="detailTab">
            <el-tab-pane label="HTML编辑" name="editor">
              <el-input
                v-model="detailForm.content"
                type="textarea"
                :rows="20"
              ></el-input>
            </el-tab-pane>
            <el-tab-pane label="效果预览" name="preview">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="article-preview" v-html="detailForm.content"></div>
            </el-tab-pane>
          </el-tabs>
          <el-form-item class="mgt-20px">
            <el-button
              type="primary"
              :loading="loadingSubmit"
              @click="saveDetail"
              >保存</el-button
            >
            <el-button @click="detailVisible = false">关闭</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <el-drawer
      :visible.sync="publishVisible"
      direction="rtl"
      :size="isMobile ? '95%' : '50%'"
      :wrapper-closable="false"
    >
      <div slot="title">
        <el-page-header
          content="发布选中文章"
          @back="publishVisible = false"
        ></el-page-header>
      </div>
      <div style="padding: 0 20px 20px">
        <el-form ref="publishFormRef" :model="publishForm" label-position="top">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户ID">
                <el-input-number
                  v-model="publishForm.user_id"
                ></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发布到分类">
                <el-cascader
                  v-model="publishForm.category_id"
                  :options="categoryTrees"
                  :props="categoryProps"
                  clearable
                  filterable
                  style="width: 100%"
                ></el-cascader>
              </el-form-item>
            </el-col>
          </el-row>
          <el-alert
            type="warning"
            title="只有采集成功且标题、内容均不为空的文章会进入发布队列"
            show-icon
          ></el-alert>
          <el-table :data="selectedRow" height="320" class="mgt-20px">
            <el-table-column label="发布条件" width="90">
              <template slot-scope="scope">
                <i
                  v-if="
                    scope.row.status === 3 &&
                    scope.row.title &&
                    scope.row.content
                  "
                  class="el-icon-success text-success"
                  >满足</i
                >
                <i v-else class="el-icon-error text-danger">不满足</i>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="title" label="标题"></el-table-column>
          </el-table>
          <el-form-item class="mgt-20px">
            <el-button
              type="primary"
              :loading="loadingSubmit"
              @click="submitPublish"
              >提交发布</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FormSearch from '~/components/FormSearch.vue'
import TableListV2 from '~/components/TableListV2.vue'
import { listCategory } from '~/api/category'
import {
  batchUpdateSpiderArticleDetail,
  deleteSpiderArticleDetail,
  getSpiderArticleDetail,
  listSpiderArticleDetail,
  updateSpiderArticleDetail,
} from '~/api/spiderarticle'
import { categoryToTrees, genLinkHTML, parseQueryIntArray } from '~/utils/utils'
import { spiderArticleDetailStatusOptions } from '~/utils/enum'

export default {
  name: 'AdminSpiderArticleDetailPage',
  components: { FormSearch, TableListV2 },
  layout: 'admin',
  data() {
    return {
      loading: false,
      loadingSubmit: false,
      detailVisible: false,
      publishVisible: false,
      detailTab: 'editor',
      search: {
        wd: '',
        page: 1,
        size: 10,
        status: [],
        article_list_id: 0,
      },
      searchFormFields: [],
      tableListFields: [],
      total: 0,
      selectedRow: [],
      spiderArticleDetails: [],
      detailForm: {},
      publishForm: {
        user_id: localStorage.getItem('user_id') || '',
        category_id: [],
      },
      categoryTrees: [],
      categoryProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        label: 'title',
        value: 'id',
      },
      spiderArticleDetailStatusOptions,
    }
  },
  head() {
    return {
      title: `文章采集 - ${this.settings.system.sitename}`,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler() {
        this.search = {
          ...this.search,
          ...this.$route.query,
          page: parseInt(this.$route.query.page) || 1,
          size: parseInt(this.$route.query.size) || 10,
          article_list_id: parseInt(this.$route.query.article_list_id) || 0,
          ...parseQueryIntArray(this.$route.query, ['status']),
        }
        this.fetchData()
      },
    },
  },
  created() {
    this.initSearchForm()
    this.initTableFields()
    this.fetchCategories()
  },
  methods: {
    initSearchForm() {
      this.searchFormFields = [
        {
          type: 'text',
          label: '关键字',
          name: 'wd',
          placeholder: '请输入标题或链接',
        },
        {
          type: 'select',
          label: '状态',
          name: 'status',
          placeholder: '请选择状态',
          multiple: true,
          options: this.spiderArticleDetailStatusOptions,
        },
      ]
    },
    initTableFields() {
      const statusEnum = {}
      this.spiderArticleDetailStatusOptions.forEach((item) => {
        statusEnum[item.value] = item
      })
      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          type: 'enum',
          enum: statusEnum,
        },
        { prop: 'title', label: '标题', minWidth: 220 },
        { prop: 'url_html', label: '来源链接', minWidth: 260, type: 'html' },
        { prop: 'source', label: '来源', width: 150 },
        {
          prop: 'published_at',
          label: '发布时间',
          width: 170,
          type: 'datetime',
        },
        { prop: 'article_id', label: '发布文章ID', width: 110, type: 'number' },
        { prop: 'error', label: '错误', minWidth: 200 },
        { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
      ]
    },
    async fetchCategories() {
      const res = await listCategory({
        field: ['id', 'parent_id', 'title'],
        type: [1],
      })
      if (res.status === 200) {
        this.categoryTrees = categoryToTrees(res.data.category || [], false)
      }
    },
    async fetchData() {
      this.loading = true
      const res = await listSpiderArticleDetail({
        ...this.search,
        order: 'status asc,id desc',
      })
      this.loading = false
      if (res.status === 200) {
        const items = res.data.spider_article_detail || []
        items.forEach((item) => {
          item.url_html = genLinkHTML(item.url, item.url)
          item.disable_delete = [1, 2, 6].includes(item.status)
        })
        this.spiderArticleDetails = items
        this.total = res.data.total || 0
      } else {
        this.$message.error(res.data.message)
      }
    },
    handleSizeChange(size) {
      this.search.size = size
      this.$router.push({ query: this.search })
    },
    handlePageChange(page) {
      this.search.page = page
      this.$router.push({ query: this.search })
    },
    onSearch(search) {
      this.search = { ...this.search, ...search, page: 1 }
      this.$router.push({ query: this.search })
    },
    clearSourceFilter() {
      const query = { ...this.search, page: 1 }
      delete query.article_list_id
      this.$router.push({ path: this.$route.path, query })
    },
    selectRow(rows) {
      this.selectedRow = rows
    },
    async editRow(row) {
      const res = await getSpiderArticleDetail({ id: row.id })
      if (res.status === 200) {
        this.detailForm = {
          ...res.data,
          published_at: res.data.published_at
            ? new Date(res.data.published_at)
            : '',
        }
        this.detailVisible = true
        this.detailTab = 'editor'
      } else {
        this.$message.error(res.data.message)
      }
    },
    previewRow(row) {
      this.editRow(row)
    },
    openPublishedArticle(row) {
      window.open(`/admin/article/set?id=${row.article_id}`, '_blank')
    },
    async saveDetail() {
      this.loadingSubmit = true
      const res = await updateSpiderArticleDetail({ ...this.detailForm })
      this.loadingSubmit = false
      if (res.status === 200) {
        this.$message.success('保存成功')
        this.detailVisible = false
        this.fetchData()
      } else {
        this.$message.error(res.data.message)
      }
    },
    joinCollectQueue() {
      this.$confirm(
        `您确定要将选中的【${this.selectedRow.length}篇】文章加入采集队列吗？`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const docs = this.selectedRow.map((item) => {
            return {
              id: item.id,
              status: 1,
              title: item.title,
              content: item.content,
              description: item.description,
              keywords: item.keywords,
              source: item.source,
              published_at: item.published_at,
              content_rules: item.content_rules,
              enable_browser: item.enable_browser,
            }
          })
          const res = await batchUpdateSpiderArticleDetail({
            spider_article_detail: docs,
          })
          if (res.status === 200) {
            this.$message.success('加入采集队列成功')
            this.fetchData()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    openPublishDrawer() {
      this.publishVisible = true
    },
    async submitPublish() {
      if (!this.publishForm.user_id) {
        this.$message.error('请输入用户ID')
        return
      }
      if (this.publishForm.category_id.length === 0) {
        this.$message.error('请选择发布分类')
        return
      }
      const docs = this.selectedRow
        .map((item) => {
          return {
            id: item.id,
            status: item.status === 3 ? 5 : item.status,
            user_id: this.publishForm.user_id,
            category_id: JSON.stringify(this.publishForm.category_id),
            title: item.title,
            content: item.content,
            description: item.description,
            keywords: item.keywords,
            source: item.source,
            published_at: item.published_at,
            content_rules: item.content_rules,
            enable_browser: item.enable_browser,
          }
        })
        .filter((item) => item.status === 5 && item.title && item.content)

      if (docs.length === 0) {
        this.$message.error('没有满足发布条件的文章')
        return
      }

      this.loadingSubmit = true
      const res = await batchUpdateSpiderArticleDetail({
        spider_article_detail: docs,
      })
      this.loadingSubmit = false
      if (res.status === 200) {
        localStorage.setItem('user_id', this.publishForm.user_id)
        this.$message.success('加入发布队列成功')
        this.publishVisible = false
        this.fetchData()
      } else {
        this.$message.error(res.data.message)
      }
    },
    batchDelete() {
      this.$confirm(
        `您确定要删除选中的【${this.selectedRow.length}篇】文章吗？`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await deleteSpiderArticleDetail({
            id: this.selectedRow.map((item) => item.id),
          })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    deleteRow(row) {
      this.$confirm(`您确定要删除【${row.title || row.url}】吗？`, '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await deleteSpiderArticleDetail({ id: row.id })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<style scoped>
.article-preview {
  min-height: 320px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: auto;
}
</style>
