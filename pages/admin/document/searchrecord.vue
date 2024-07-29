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
        @onDelete="batchDelete"
      >
        <template slot="buttons"> </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableList
        :loading="loading"
        :table-data="records"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="true"
        :show-select="true"
        :actions-min-width="100"
        @selectRow="selectRow"
        @deleteRow="deleteRow"
      >
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
import { deleteSearchRecord, listSearchRecord } from '~/api/searchrecord'
import TableList from '~/components/TableList.vue'
import FormSearch from '~/components/FormSearch.vue'
import {
  parseQueryIntArray,
  parseQueryBoolArray,
  genLinkHTML,
} from '~/utils/utils'
import { mapGetters } from 'vuex'
export default {
  components: { TableList, FormSearch },
  layout: 'admin',
  data() {
    return {
      loading: false,
      search: {
        page: 1,
        size: 10,
      },
      records: [],
      trees: [],
      total: 0,
      searchFormFields: [],
      tableListFields: [],
      selectedRow: [],
    }
  },
  head() {
    return {
      title: `搜索记录列表 - ${this.settings.system.sitename}`,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  watch: {
    '$route.query': {
      immediate: true,
      async handler() {
        let search = { ...this.search, ...this.$route.query }
        search.page = parseInt(this.$route.query.page) || 1
        search.size = parseInt(this.$route.query.size) || 10
        search.wd = this.$route.query.wd || ''
        this.search = {
          ...search,
        }
        await this.listSearchRecord()
      },
    },
  },
  async created() {
    this.initSearchForm()
    this.initTableListFields()
  },
  methods: {
    async listSearchRecord() {
      this.loading = true
      const search = { ...this.search }
      const res = await listSearchRecord(search)
      this.loading = false
      if (res.status === 200) {
        const records = res.data.search_record || []
        records.forEach((item) => {
          // 对于转换中的文档，禁止删除
          item.username_html = '-'
          if (item.user_id > 0) {
            item.username_html = genLinkHTML(
              item.username,
              `/user/${item.user_id}`
            )
          }

          item.keywords_html = genLinkHTML(
            item.keywords,
            `/search?wd=${item.keywords}&page=${item.page}`
          )
        })

        this.records = records
        this.total = res.data.total
      } else {
        this.$message.error(res.data.message)
      }
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
        this.listSearchRecord()
      } else {
        this.$router.push({
          query: this.search,
        })
      }
    },
    batchDelete() {
      this.$confirm(
        `您确定要删除选中的【${this.selectedRow.length}条】搜索记录吗？删除之后将不可恢复。`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const ids = this.selectedRow.map((item) => item.id)
          const res = await deleteSearchRecord({ id: ids })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listSearchRecord()
          } else {
            this.$message.error(res.data.message)
          }
        })
        .catch(() => {})
    },
    deleteRow(row) {
      this.$confirm(
        `您确定要搜索记录【${row.keywords}(ID:${row.id})】吗？删除之后将不可恢复。`,
        '温馨提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(async () => {
          const res = await deleteSearchRecord({ id: row.id })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.listSearchRecord()
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
      let orderbyOptions = [
        {
          label: '最新排序',
          value: 'id desc',
        },
        {
          label: '最早排序',
          value: 'id asc',
        },
        {
          label: '结果数倒序排序',
          value: 'total desc',
        },
        {
          label: '结果数顺序排序',
          value: 'total asc',
        },
        {
          label: '耗时倒序排序',
          value: 'spend_time desc',
        },
        {
          label: '耗时顺序排序',
          value: 'spend_time asc',
        },
      ]
      this.searchFormFields = [
        {
          type: 'text',
          label: '关键字',
          name: 'keywords',
          placeholder: '请输入关键字',
        },
        {
          type: 'text',
          label: 'IP',
          name: 'ip',
          placeholder: '请输入IP地址',
        },
        {
          type: 'select',
          label: '排序',
          name: 'order',
          placeholder: '请选择状态',
          options: orderbyOptions,
        },
      ]
    },
    initTableListFields() {
      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        { prop: 'username_html', label: '用户', width: 120, type: 'html' },
        {
          prop: 'keywords_html',
          label: '关键字',
          minWidth: 150,
          type: 'html',
        },
        { prop: 'total', label: '结果数', width: 80, type: 'number' },
        { prop: 'page', label: '页码', width: 70 },
        { prop: 'ip', label: 'IP', width: 100 },
        { prop: 'spend_time', label: '耗时(秒)', width: 100, type: 'number' },
        { prop: 'created_at', label: '搜索时间', width: 170, type: 'datetime' },
        { prop: 'user_agent', label: '客户端', minWidth: 200, type: 'number' },
      ]
    },
  },
}
</script>
<style lang="scss" scoped>
.tooltip-box {
  max-width: 300px;
  word-break: break-all;
}
</style>
