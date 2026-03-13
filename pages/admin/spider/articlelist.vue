<template>
  <div>
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
            <el-button
              type="warning"
              icon="el-icon-refresh"
              :disabled="selectedRow.length === 0"
              @click="batchSetStatus(0)"
              >批量嗅探</el-button
            >
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>

    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="spiderArticleLists"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="100"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      >
        <template slot="actions" slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-reading"
            @click="viewDetails(scope.row)"
            >文章</el-button
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
      :visible.sync="formVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <div slot="title">
        <el-page-header
          :content="form.id ? '编辑文章列表页' : '新增文章列表页'"
          @back="formVisible = false"
        ></el-page-header>
      </div>
      <div style="padding: 0 20px">
        <el-form ref="form" :model="form" label-position="top">
          <el-form-item label="批量链接" prop="url">
            <el-input
              v-model="form.url"
              :type="form.id > 0 ? 'text' : 'textarea'"
              :rows="5"
              :disabled="form.id > 0"
              placeholder="请输入文章列表页地址。新增时支持多行输入，每行一个链接。"
            ></el-input>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="启用浏览器渲染">
                <el-switch v-model="form.enable_browser"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="嗅探频率(天)">
                <el-input
                  v-model="form.frequency"
                  type="number"
                  min="0"
                  placeholder="请输入嗅探频率"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col v-if="form.id > 0" :span="8">
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="请选择状态">
                  <el-option
                    v-for="item in spiderArticleListStatusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="列表规则(HTML选择器，每行一个)">
            <el-input
              v-model="form.list_rules"
              type="textarea"
              :rows="3"
              placeholder="示例：.article-list > .news-list a"
            ></el-input>
          </el-form-item>

          <!-- 折叠 -->
          <el-divider content-position="left">内容采集规则</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="标题规则(HTML选择器，每行一个)">
                <el-input
                  v-model="form.content_title_rules"
                  type="textarea"
                  :rows="3"
                  placeholder="示例：h1.article-title"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内容规则(HTML选择器，每行一个)">
                <el-input
                  v-model="form.content_rules"
                  type="textarea"
                  :rows="3"
                  placeholder="示例：.article-content > #article-content"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排除规则(HTML选择器，每行一个)">
                <el-input
                  v-model="form.content_exclude_rules"
                  type="textarea"
                  :rows="3"
                  placeholder="示例：script"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="替换规则(每行一条，格式：a => b)">
                <el-input
                  v-model="form.content_replace_rules"
                  type="textarea"
                  :rows="3"
                  placeholder="示例：原字符 => 新字符"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button
              type="primary"
              class="btn-block"
              icon="el-icon-check"
              :loading="loadingSubmit"
              @click="submitForm"
              >提交</el-button
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
import {
  batchSetSpiderArticleListStatus,
  createSpiderArticleList,
  deleteSpiderArticleList,
  getSpiderArticleList,
  listSpiderArticleList,
  updateSpiderArticleList,
} from '~/api/spiderarticle'
import { spiderArticleListStatusOptions } from '~/utils/enum'
import { genLinkHTML, parseQueryIntArray } from '~/utils/utils'

export default {
  name: 'AdminSpiderArticleListPage',
  components: { FormSearch, TableListV2 },
  layout: 'admin',
  data() {
    return {
      loading: false,
      loadingSubmit: false,
      formVisible: false,
      search: {
        wd: '',
        page: 1,
        size: 10,
        status: [],
      },
      total: 0,
      selectedRow: [],
      spiderArticleLists: [],
      searchFormFields: [],
      tableListFields: [],
      form: this.getDefaultForm(),
      spiderArticleListStatusOptions,
    }
  },
  head() {
    return {
      title: `文章嗅探 - ${this.settings.system.sitename}`,
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
          ...parseQueryIntArray(this.$route.query, ['status']),
        }
        this.fetchData()
      },
    },
  },
  created() {
    this.initSearchForm()
    this.initTableFields()
  },
  methods: {
    getDefaultForm() {
      return {
        id: 0,
        url: '',
        status: 0,
        frequency: 0,
        enable_browser: false,
        list_rules: '',
        content_rules: '',
        content_title_rules: '',
        content_exclude_rules: '',
        content_replace_rules: '',
      }
    },
    async fetchData() {
      this.loading = true
      const res = await listSpiderArticleList({
        ...this.search,
        order: 'status asc,id desc',
      })
      this.loading = false
      if (res.status === 200) {
        const items = res.data.spider_article_list || []
        items.forEach((item) => {
          item.url_html = genLinkHTML(item.url, item.url)
        })
        this.spiderArticleLists = items
        this.total = res.data.total || 0
      } else {
        this.$message.error(res.data.message)
      }
    },
    initSearchForm() {
      this.searchFormFields = [
        {
          type: 'text',
          label: '关键字',
          name: 'wd',
          placeholder: '请输入链接关键字',
        },
        {
          type: 'select',
          label: '状态',
          name: 'status',
          placeholder: '请选择状态',
          multiple: true,
          options: this.spiderArticleListStatusOptions,
        },
      ]
    },
    initTableFields() {
      const statusEnum = {}
      this.spiderArticleListStatusOptions.forEach((item) => {
        statusEnum[item.value] = item
      })
      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'status',
          label: '状态',
          width: 90,
          type: 'enum',
          enum: statusEnum,
        },
        { prop: 'url_html', label: '列表页链接', minWidth: 300, type: 'html' },
        { prop: 'total', label: '发现文章', width: 100, type: 'number' },
        {
          prop: 'enable_browser',
          label: '浏览器渲染',
          width: 100,
          type: 'bool',
        },
        {
          prop: 'frequency',
          label: '频率(天)',
          width: 100,
          type: 'number',
        },
        { prop: 'error', label: '错误', minWidth: 220 },
        { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
      ]
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
    onCreate() {
      this.form = this.getDefaultForm()
      this.formVisible = true
    },
    async editRow(row) {
      const res = await getSpiderArticleList({ id: row.id })
      if (res.status === 200) {
        this.form = {
          ...this.getDefaultForm(),
          ...res.data,
        }
        this.formVisible = true
      } else {
        this.$message.error(res.data.message)
      }
    },
    selectRow(rows) {
      this.selectedRow = rows
    },
    viewDetails(row) {
      this.$router.push({
        path: '/admin/spider/articledetail',
        query: { article_list_id: row.id },
      })
    },
    async submitForm() {
      if (!this.form.url || !this.form.url.trim()) {
        this.$message.error('请输入链接')
        return
      }
      this.loadingSubmit = true
      let res
      if (this.form.id > 0) {
        res = await updateSpiderArticleList({ ...this.form })
      } else {
        const req = {
          ...this.form,
          url: this.form.url.split('\n'),
          frequency: parseInt(this.form.frequency) || 0,
        }
        delete req.id
        delete req.status
        res = await createSpiderArticleList(req)
      }
      this.loadingSubmit = false
      if (res.status === 200) {
        this.$message.success(this.form.id > 0 ? '修改成功' : '新增成功')
        this.formVisible = false
        this.fetchData()
      } else {
        this.$message.error(res.data.message)
      }
    },
    batchDelete() {
      this.$confirm(
        `您确定要删除选中的【${this.selectedRow.length}条】记录吗？`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await deleteSpiderArticleList({
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
      this.$confirm(`您确定要删除【${row.url}】吗？`, '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await deleteSpiderArticleList({ id: row.id })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.fetchData()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    batchSetStatus(status) {
      if (this.selectedRow.length === 0) {
        this.$message.warning('请选择要操作的记录')
        return
      }
      this.$confirm(
        `您确定要将选中的【${this.selectedRow.length}条】记录设置为【${this.spiderArticleListStatusOptions[status].label}】吗？`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await batchSetSpiderArticleListStatus({
            id: this.selectedRow.map((item) => item.id),
            status,
          })
          if (res.status === 200) {
            this.$message.success('操作成功')
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
