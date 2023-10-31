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
                  @click="submitBatchUpdate"
                  icon="el-icon-check"
                  :loading="loading"
                  >提交修改</el-button
                >
                <el-button
                  type="warning"
                  @click="cancelBatchUpdate"
                  icon="el-icon-close"
                  >取消</el-button
                >
              </template>
              <el-button
                type="primary"
                v-else
                icon="el-icon-edit"
                @click="batchUpdate"
                :disabled="selectedRow.length === 0"
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
              >采集选中</el-button
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
      <TableList
        :loading="loading"
        :table-data="spiderDocuments"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="true"
        :show-select="true"
        :actionsMinWidth="80"
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

    <el-dialog
      title="发布选中文档"
      :visible.sync="showPublishing"
      width="640px"
    >
      <FormPublishSpiderDocument
        v-if="showPublishing"
        :documents="selectedRow"
        @success="formSpiderDocumentSuccess"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  listSpiderDocument,
  deleteSpiderDocument,
  getSpiderDocument,
  batchUpdateSpiderDocument,
} from '~/api/spiderdocument'
import { genLinkHTML, parseQueryIntArray } from '~/utils/utils'
import { spiderDocumentStatusOptions } from '~/utils/enum'
import TableList from '~/components/TableList.vue'
import FormSearch from '~/components/FormSearch.vue'
// import FormSpiderDocument from '~/components/FormSpiderDocument.vue'
import { mapGetters } from 'vuex'
export default {
  components: {
    TableList,
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
  async created() {
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
        let spiderDocuments = res.data.spider_document || []
        spiderDocuments.map((item) => {
          item.url_html = genLinkHTML(item.url, item.url)
          item.editing = false
          item.status = item.status || 0
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
    async batchUpdate() {
      // 将spiderDocuments中可以修改的字段设置为修改中
      const selectIdMap = {}
      this.selectedRow.map((item) => {
        selectIdMap[item.id] = true
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
    async onDownload() {
      this.$confirm(
        `您确定要将选中的【${this.selectedRow.length}条】文档加入到采集队列吗？`,
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
          return newItem
        })
        const res = await batchUpdateSpiderDocument({ spider_document: docs })
        if (res.status === 200) {
          this.$message.success('加入采集队列成功')
          this.listSpiderDocument()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    async onPublish() {
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
            this.listSpiderDocument()
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
            this.listSpiderDocument()
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
      this.spiderDocumentStatusOptions.map((item) => {
        enumStatus[item.value] = item
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
        {
          prop: 'title',
          label: '正式标题',
          minWidth: 200,
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
        { prop: 'url_html', label: '文档链接', minWidth: 250, type: 'html' },
        {
          prop: 'user_id',
          label: '发布到用户',
          minWidth: 100,
          type: 'number',
        },
        // { prop: 'document_id', label: '发布到文档', minWidth: 200 },
        { prop: 'category_id', label: '发布到分类', minWidth: 150 },
        { prop: 'created_at', label: '创建时间', width: 160, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 160, type: 'datetime' },
      ]
    },
  },
}
</script>
<style></style>
