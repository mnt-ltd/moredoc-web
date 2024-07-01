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
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableList
        :loading="loading"
        :table-data="advertisements"
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
      :visible.sync="formAdvertisementVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <div slot="title">
        <el-page-header
          :content="advertisement.id ? '编辑广告' : '新增广告'"
          @back="formAdvertisementVisible = false"
        >
        </el-page-header>
      </div>
      <div style="padding: 0 20px">
        <FormAdvertisement
          ref="advertisementForm"
          :init-advertisement="advertisement"
          @success="formAdvertisementSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  listAdvertisement,
  deleteAdvertisement,
  getAdvertisement,
} from '~/api/advertisement'
import { genLinkHTML, parseQueryIntArray } from '~/utils/utils'
import { advertisementPositions } from '~/utils/enum'
import TableList from '~/components/TableList.vue'
import FormSearch from '~/components/FormSearch.vue'
import FormAdvertisement from '~/components/FormAdvertisement.vue'
export default {
  components: { TableList, FormSearch, FormAdvertisement },
  layout: 'admin',
  data() {
    return {
      loading: false,
      formAdvertisementVisible: false,
      search: {
        wd: '',
        page: 1,
        enable: [],
        size: 10,
      },
      advertisements: [],
      advertisementPositions,
      total: 0,
      searchFormFields: [],
      tableListFields: [],
      selectedRow: [],
      advertisement: { id: 0 },
    }
  },
  head() {
    return {
      title: `广告管理 - ${this.settings.system.sitename}`,
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
          ...parseQueryIntArray(this.$route.query, ['enable']),
        }
        this.listAdvertisement()
      },
    },
  },
  async created() {
    this.initSearchForm()
    this.initTableListFields()
    // await this.listAdvertisement()
  },
  methods: {
    async listAdvertisement() {
      this.loading = true
      const res = await listAdvertisement(this.search)
      if (res.status === 200) {
        const advertisements = res.data.advertisement || []
        advertisements.map((item) => {
          item.title_html = genLinkHTML(item.title, item.link)
        })
        this.advertisements = advertisements
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
      if (
        location.pathname + location.search ===
        this.$router.resolve({
          query: this.search,
        }).href
      ) {
        this.$router.push({
          query: this.search,
        })
      } else {
        this.listAdvertisement()
      }
    },
    onCreate() {
      this.advertisement = { id: 0 }
      this.formAdvertisementVisible = true
      this.$nextTick(() => {
        this.$refs.advertisementForm.reset()
      })
    },
    async editRow(row) {
      const res = await getAdvertisement({ id: row.id })
      if (res.status === 200) {
        this.advertisement = res.data
        this.formAdvertisementVisible = true
      } else {
        this.$message.error(res.data.message)
      }
    },
    formAdvertisementSuccess() {
      this.formAdvertisementVisible = false
      this.listAdvertisement()
    },
    batchDelete() {
      this.$confirm(
        `您确定要删除选中的【${this.selectedRow.length}条】广告吗？删除之后不可恢复！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const ids = this.selectedRow.map((item) => item.id)
          const res = await deleteAdvertisement({ id: ids })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listAdvertisement()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    deleteRow(row) {
      this.$confirm(
        `您确定要删除广告【${row.title}】吗？删除之后不可恢复！`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await deleteAdvertisement({ id: row.id })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listAdvertisement()
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
      const positions = []
      this.advertisementPositions.map((item) => {
        positions.push(...item.children)
      })
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
          name: 'enable',
          placeholder: '请选择状态',
          multiple: true,
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ],
        },
        {
          type: 'select',
          label: '位置',
          name: 'position',
          placeholder: '请选择位置',
          multiple: true,
          options: positions,
        },
      ]
    },
    initTableListFields() {
      const positions = {}
      this.advertisementPositions.map((item) => {
        ;(item.children || []).map((item) => {
          positions[item.value] = item
        })
      })
      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'enable',
          label: '状态',
          width: 80,
          type: 'bool',
          fixed: 'left',
        },
        {
          prop: 'position',
          label: '广告位',
          width: 200,
          type: 'enum',
          enum: positions,
        },
        {
          prop: 'title',
          label: '广告名称',
          minWidth: 150,
        },
        { prop: 'remark', label: '广告备注', minWidth: 250 },
        // { prop: 'content', label: '广告代码', minWidth:250 },
        { prop: 'start_time', label: '开始时间', width: 160, type: 'datetime' },
        { prop: 'end_time', label: '截止时间', width: 160, type: 'datetime' },
        { prop: 'created_at', label: '创建时间', width: 160, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 160, type: 'datetime' },
      ]
    },
  },
}
</script>
<style></style>
