<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="false"
        :show-delete="true"
        :disabled-delete="selectedRow.length === 0"
        :default-search="search"
        @onSearch="onSearch"
        @onCreate="onCreate"
        @onDelete="batchDelete"
      >
        <template slot="buttons">
          <el-form-item>
            <el-button-group>
              <template v-if="batchUpdating">
                <el-button
                  type="primary"
                  icon="el-icon-check"
                  :loading="loading"
                  @click="submitBatchUpdate"
                  >提交修改</el-button
                >
                <el-button
                  type="warning"
                  icon="el-icon-close"
                  @click="cancelBatchUpdate"
                  >取消</el-button
                >
              </template>
              <el-button
                v-else
                type="primary"
                icon="el-icon-edit"
                :disabled="selectedRow.length === 0"
                @click="batchUpdate"
                >批量修改</el-button
              >
            </el-button-group>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="selectedRow.length === 0"
              icon="el-icon-download"
              @click="onDownload"
              >下载选中</el-button
            >
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="selectedRow.length === 0"
              icon="el-icon-finished"
              @click="onPublish"
              >发布选中</el-button
            >
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        ref="TableListV2"
        :loading="loading"
        :table-data="spiderDocuments"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="true"
        :show-select="!batchUpdating"
        :actions-min-width="80"
        @selectRow="selectRow"
        @editRow="editRow"
        @deleteRow="deleteRow"
      >
        <template v-if="batchUpdating" slot="header" slot-scope="scope">
          <el-popover
            v-if="scope.row.property === 'title'"
            placement="bottom"
            width="520"
            trigger="click"
          >
            <el-form v-model="titleForm" label-position="top" size="mini">
              <el-form-item label="引用(将指定字段内容填充到正式标题)">
                <el-select
                  v-model="titleForm.field"
                  placeholder="请选择"
                  clearable
                >
                  <el-option
                    v-for="item in [
                      { label: '文档链接', value: 'url' },
                      { label: '链接标题', value: 'title_from_href' },
                      { label: 'URL标题', value: 'title_from_url' },
                      { label: '附件标题', value: 'title_from_attachment' },
                      { label: '替换为空', value: 'empty' },
                    ]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-button
                  icon="el-icon-check"
                  type="primary"
                  @click="fillTitle"
                  >确定</el-button
                >
              </el-form-item>
              <el-form-item label="字符串替换">
                <el-row :gutter="10">
                  <el-col :span="10">
                    <el-input
                      v-model="titleForm.search"
                      placeholder="查找内容"
                    ></el-input>
                  </el-col>
                  <el-col :span="10">
                    <el-input
                      v-model="titleForm.replace"
                      placeholder="替换内容"
                    ></el-input>
                  </el-col>
                  <el-col :span="4">
                    <el-button type="primary" @click="replaceTitle">
                      <i class="fa fa-exchange"></i>
                      替换
                    </el-button>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-form>
            <el-tooltip slot="reference" content="快捷操作">
              <el-button icon="el-icon-setting" type="text"></el-button>
            </el-tooltip>
          </el-popover>
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
        >
        </el-pagination>
      </div>
    </el-card>
    <el-drawer
      :visible.sync="showPublishing"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <div slot="title">
        <el-page-header content="发布选中文档" @back="showPublishing = false">
        </el-page-header>
      </div>
      <div style="padding: 0 20px">
        <FormPublishSpiderDocument
          v-if="showPublishing"
          :documents="selectedRow"
          @success="formSpiderDocumentSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  listSpiderDocument,
  deleteSpiderDocument,
  getSpiderDocument,
  batchUpdateSpiderDocument,
} from '~/api/spiderdocument'
import { genLinkHTML, parseQueryIntArray } from '~/utils/utils'
import { spiderDocumentStatusOptions } from '~/utils/enum'
import TableListV2 from '~/components/TableListV2.vue'
import FormSearch from '~/components/FormSearch.vue'
// import FormSpiderDocument from '~/components/FormSpiderDocument.vue'
export default {
  components: {
    TableListV2,
    FormSearch,
    // FormSpiderDocument,
  },
  layout: 'admin',
  data() {
    return {
      loading: false,
      showPublishing: false,
      formSpiderDocumentVisible: false,
      search: {
        wd: '',
        page: 1,
        enable: [],
        size: 10,
      },
      titleForm: {
        field: '',
        search: '',
        replace: '',
      },
      spiderDocuments: [],
      total: 0,
      searchFormFields: [],
      tableListFields: [],
      selectedRow: [],
      spiderDocument: { id: 0 },
      spiderDocumentStatusOptions,
      batchUpdating: false,
    }
  },
  head() {
    return {
      title: `文档管理 - ${this.settings.system.sitename}`,
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
        this.listSpiderDocument()
      },
    },
  },
  created() {
    this.initSearchForm()
    this.initTableListFields()
  },
  methods: {
    async listSpiderDocument() {
      this.loading = true
      this.batchUpdating = false
      const res = await listSpiderDocument({
        ...this.search,
        order: 'status asc, id desc',
      })
      if (res.status === 200) {
        const spiderDocuments = res.data.spider_document || []
        spiderDocuments.map((item) => {
          item.url_html = genLinkHTML(item.url, item.url)
          item.editing = false
          item.status = item.status || 0
          item.title = item.title || '' // 添加title字段，用于编辑
          item.disable_delete = item.status === 1 || item.status === 2
          return item
        })
        this.spiderDocuments = spiderDocuments
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
    fillTitle() {
      this.spiderDocuments.map((item) => {
        if (item.editing) {
          if (this.titleForm.field === 'empty') {
            item.title = ''
            return item
          }
          item.title = item[this.titleForm.field]
          const ext = item.ext || ''
          if (ext) {
            const reg = new RegExp(ext, 'i')
            item.title = item.title.replace(reg, '')
          }
        }
        return item
      })
    },
    replaceTitle() {
      this.spiderDocuments.map((item) => {
        if (item.editing) {
          const reg = new RegExp(this.titleForm.search, 'g')
          item.title = (item.title || '').replace(reg, this.titleForm.replace)
        }
        return item
      })
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
      this.spiderDocument = { id: 0 }
      this.formSpiderDocumentVisible = true
      this.$nextTick(() => {
        this.$refs.spiderDocumentForm.reset()
      })
    },
    batchUpdate() {
      // 将spiderDocuments中可以修改的字段设置为修改中
      const selectIdMap = {}
      this.selectedRow.map((item) => {
        selectIdMap[item.id] = true
        return item
      })

      this.spiderDocuments = this.spiderDocuments.map((item) => {
        if (selectIdMap[item.id]) {
          item.editing = true
        }
        return item
      })

      this.batchUpdating = true
    },
    cancelBatchUpdate() {
      this.batchUpdating = false
      this.listSpiderDocument()
    },
    async submitBatchUpdate() {
      // 批量提交修改中的数据
      const docs = this.spiderDocuments
        .filter((item) => item.editing)
        .map((item) => {
          const newItem = { ...item }
          delete newItem.url_html
          delete newItem.editing
          delete newItem.disable_delete
          return newItem
        })
      this.loading = true
      const res = await batchUpdateSpiderDocument({ spider_document: docs })
      this.loading = false
      if (res.status === 200) {
        this.$message.success('批量修改成功')
        this.batchUpdating = false
        this.listSpiderDocument()
      } else {
        this.$message.error(res.data.message)
      }
    },
    async editRow(row) {
      const res = await getSpiderDocument({ id: row.id })
      if (res.status === 200) {
        this.spiderDocument = res.data
        this.formSpiderDocumentVisible = true
      } else {
        this.$message.error(res.data.message)
      }
    },
    formSpiderDocumentSuccess() {
      this.formSpiderDocumentVisible = false
      this.showPublishing = false
      this.listSpiderDocument()
    },
    onDownload() {
      this.$confirm(
        `您确定要将选中的【${this.selectedRow.length}篇】文档加入到下载队列吗？`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        const docs = this.selectedRow.map((item) => {
          const newItem = {
            ...item,
            status: 1, // 加入到采集队列
          }
          delete newItem.url_html
          delete newItem.editing
          delete newItem.disable_delete
          return newItem
        })
        const res = await batchUpdateSpiderDocument({ spider_document: docs })
        if (res.status === 200) {
          this.$message.success('加入下载队列成功')
          this.listSpiderDocument()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    onPublish() {
      this.showPublishing = true
    },
    batchDelete() {
      this.$confirm(
        `您确定要删除选中的【${this.selectedRow.length}条】文档吗？删除之后不可恢复！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const ids = this.selectedRow.map((item) => item.id)
          const res = await deleteSpiderDocument({ id: ids })
          if (res.status === 200) {
            this.$message.success('删除成功')
            if (!this.batchUpdating) {
              this.listSpiderDocument()
            } else {
              this.spiderDocuments = this.spiderDocuments.filter(
                (item) => !ids.includes(item.id)
              )
              if (this.spiderDocuments.length === 0) {
                this.listSpiderDocument()
              }
            }
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    deleteRow(row) {
      this.$confirm(
        `您确定要删除文档【${
          row.title ||
          row.title_from_attachment ||
          row.title_from_href ||
          row.title_from_url ||
          row.url
        }】吗？删除之后不可恢复！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await deleteSpiderDocument({ id: row.id })
          if (res.status === 200) {
            this.$message.success('删除成功')
            if (!this.batchUpdating) {
              this.listSpiderDocument()
            } else {
              this.spiderDocuments = this.spiderDocuments.filter(
                (item) => item.id !== row.id
              )
              if (this.spiderDocuments.length === 0) {
                this.listSpiderDocument()
              }
            }
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
          options: this.spiderDocumentStatusOptions,
        },
      ]
    },
    initTableListFields() {
      const enumStatus = {}
      const enumLanguage = {}
      this.spiderDocumentStatusOptions.map((item) => {
        enumStatus[item.value] = item
        return item
      })
      ;(this.settings.language || []).map((item) => {
        enumLanguage[item.code] = { label: item.language, value: item.code }
        return item
      })

      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'status',
          label: '状态',
          width: 130,
          type: 'enum',
          enum: enumStatus,
          editable: true,
        },
        { prop: 'url_html', label: '文档链接', minWidth: 200, type: 'html' },
        {
          prop: 'language',
          label: '语言',
          width: 130,
          type: 'enum',
          enum: enumLanguage,
          editable: true,
        },
        {
          prop: 'title',
          label: '正式标题',
          minWidth: 300,
          editable: true,
        },
        {
          prop: 'title_from_href',
          label: '链接标题',
          minWidth: 200,
          editable: true,
        },
        {
          prop: 'title_from_url',
          label: 'URL标题',
          minWidth: 200,
          editable: true,
        },
        {
          prop: 'title_from_attachment',
          label: '附件标题',
          minWidth: 200,
          editable: true,
        },
        { prop: 'price', label: '价格', width: 80 },
        { prop: 'size', label: '大小', width: 120, type: 'bytes' },
        { prop: 'ext', label: '扩展名', width: 80 },
        { prop: 'content_type', label: 'ContentType', width: 150 },
        { prop: 'error', label: '错误信息', minWidth: 120 },
        { prop: 'save_path', label: '存储路径', minWidth: 250 },
        {
          prop: 'user_id',
          label: '发布到用户',
          minWidth: 100,
          type: 'number',
        },
        // { prop: 'document_id', label: '发布到文档', minWidth: 200 },
        { prop: 'category_id', label: '发布到分类', minWidth: 150 },
        { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
      ]
    },
  },
}
</script>
<style></style>
