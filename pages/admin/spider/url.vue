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
            <el-tooltip content="批量将链接设置为待嗅探状态">
              <el-button
                :disabled="selectedRow.length === 0"
                type="warning"
                icon="el-icon-refresh"
                @click="batchSetStatus(0)"
                >批量嗅探</el-button
              >
            </el-tooltip>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="spiderUrls"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="true"
        :show-delete="true"
        :show-select="true"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      />
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
      :visible.sync="formSpiderUrlVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <div slot="title">
        <el-page-header
          :content="spiderUrl.id ? '编辑链接' : '新增链接'"
          @back="formSpiderUrlVisible = false"
        >
        </el-page-header>
      </div>
      <div style="padding: 0 20px">
        <FormSpiderUrl
          ref="spiderUrlForm"
          :init-spider-url="spiderUrl"
          @success="formSpiderUrlSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  listSpiderUrl,
  deleteSpiderUrl,
  getSpiderUrl,
  batchSetSpiderUrlStatus,
} from '~/api/spiderurl'
import { genLinkHTML, parseQueryIntArray } from '~/utils/utils'
import { spiderUrlStatusOptions } from '~/utils/enum'
import TableListV2 from '~/components/TableListV2.vue'
import FormSearch from '~/components/FormSearch.vue'
import FormSpiderUrl from '~/components/FormSpiderUrl.vue'
export default {
  name: 'AdminSpiderUrlPage',
  components: { TableListV2, FormSearch, FormSpiderUrl },
  layout: 'admin',
  data() {
    return {
      loading: false,
      formSpiderUrlVisible: false,
      search: {
        wd: '',
        page: 1,
        enable: [],
        size: 10,
      },
      spiderUrls: [],
      total: 0,
      searchFormFields: [],
      tableListFields: [],
      selectedRow: [],
      spiderUrl: { id: 0 },
      spiderUrlStatusOptions,
    }
  },
  head() {
    return {
      title: `文档嗅探 - ${this.settings.system.sitename}`,
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
        this.listSpiderUrl()
      },
    },
  },
  created() {
    this.initSearchForm()
    this.initTableListFields()
  },
  methods: {
    async listSpiderUrl() {
      this.loading = true
      const res = await listSpiderUrl(this.search)
      if (res.status === 200) {
        const spiderUrls = res.data.spider_url || []
        spiderUrls.forEach((item) => {
          item.url_html = genLinkHTML(item.url, item.url)
        })
        this.spiderUrls = spiderUrls
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
    },
    batchSetStatus(status) {
      if (this.selectedRow.length === 0) {
        this.$message.warning('请选择要操作的链接')
        return
      }
      const ids = this.selectedRow.map((item) => item.id)
      this.$confirm(
        `您确定要将选中的【${this.selectedRow.length}条】链接设置为【${spiderUrlStatusOptions[status].label}】状态吗？`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await batchSetSpiderUrlStatus({ id: ids, status })
          if (res.status === 200) {
            this.$message.success('操作成功')
            this.listSpiderUrl()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    handlePageChange(val) {
      this.search.page = val
      this.$router.push({
        query: this.search,
      })
    },
    onSearch(search) {
      this.search = { ...this.search, ...search, page: 1 }
      this.$router.push({
        query: this.search,
      })
    },
    onCreate() {
      this.spiderUrl = { id: 0 }
      this.formSpiderUrlVisible = true
      this.$nextTick(() => {
        this.$refs.spiderUrlForm.reset()
      })
    },
    async editRow(row) {
      const res = await getSpiderUrl({ id: row.id })
      if (res.status === 200) {
        this.spiderUrl = res.data
        this.formSpiderUrlVisible = true
      } else {
        this.$message.error(res.data.message)
      }
    },
    formSpiderUrlSuccess() {
      this.formSpiderUrlVisible = false
      this.listSpiderUrl()
    },
    batchDelete() {
      this.$confirm(
        `您确定要删除选中的【${this.selectedRow.length}条】链接吗？删除之后不可恢复！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const ids = this.selectedRow.map((item) => item.id)
          const res = await deleteSpiderUrl({ id: ids })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listSpiderUrl()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    deleteRow(row) {
      this.$confirm(
        `您确定要删除链接【${row.url}】吗？删除之后不可恢复！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await deleteSpiderUrl({ id: row.id })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listSpiderUrl()
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
          type: 'select',
          label: '状态',
          name: 'status',
          placeholder: '请选择状态',
          multiple: true,
          options: spiderUrlStatusOptions,
        },
      ]
    },
    initTableListFields() {
      const statusEnum = {}
      spiderUrlStatusOptions.forEach((item) => {
        statusEnum[item.value] = item
      })

      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          type: 'enum',
          enum: statusEnum,
        },
        { prop: 'url_html', label: '链接', minWidth: 250, type: 'html' },
        { prop: 'total', label: '发现文档', width: 100, type: 'number' },
        {
          prop: 'enable_browser',
          label: '浏览器渲染',
          width: 100,
          type: 'bool',
        },
        {
          prop: 'frequency',
          label: '检测频率(天)',
          width: 110,
          type: 'number',
        },
        { prop: 'level', label: '嗅探层级', width: 100, type: 'number' },
        { prop: 'url_prefix', label: '链接前缀', minWidth: 260 },
        {
          prop: 'include_url_keywords',
          label: '包含关键字',
          minWidth: 150,
        },
        {
          prop: 'exclude_url_keywords',
          label: '排除关键字',
          minWidth: 150,
        },
        { prop: 'error', label: '错误', minWidth: 150 },
        { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
      ]
    },
  },
}
</script>
<style></style>
