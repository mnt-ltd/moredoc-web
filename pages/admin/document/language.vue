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
            <el-dropdown
              :disabled="selectedRow.length === 0"
              @command="batchStatus"
            >
              <el-button type="warning">
                批量启用/禁用 <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="true">启用</el-dropdown-item>
                <el-dropdown-item :command="false">禁用</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableList
        :loading="loading"
        :table-data="languages"
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
    <el-dialog
      :close-on-click-modal="false"
      :title="language.id ? '编辑语言' : '新增语言'"
      :visible.sync="formLanguageVisible"
      width="640px"
    >
      <FormLanguage
        :init-language="language"
        :visible="formLanguageVisible"
        @success="onSuccess"
        @close="formLanguageVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import {
  listLanguage,
  updateLanguageStatus,
  deleteLanguage,
} from '~/api/language'
import { genLinkHTML, parseQueryIntArray } from '~/utils/utils'
import TableList from '~/components/TableList.vue'
import FormSearch from '~/components/FormSearch.vue'
import FormLanguage from '~/components/FormLanguage.vue'
import { mapGetters } from 'vuex'
export default {
  components: { TableList, FormSearch, FormLanguage },
  layout: 'admin',
  data() {
    return {
      loading: false,
      search: {
        wd: '',
        enable: [],
      },
      languages: [],
      language: {},
      searchFormFields: [],
      tableListFields: [],
      selectedRow: [],
      formLanguageVisible: false,
    }
  },
  head() {
    return {
      title: `语言管理 - ${this.settings.system.sitename}`,
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
          ...parseQueryIntArray(this.$route.query, ['enable']),
        }
        this.listLanguage()
      },
    },
  },
  async created() {
    this.initSearchForm()
    this.initTableListFields()
  },
  methods: {
    async listLanguage() {
      this.loading = true
      const res = await listLanguage(this.search)
      if (res.status === 200) {
        this.languages = res.data.language || []
        this.total = res.data.total
      } else {
        this.$message.error(res.data.message)
      }
      this.loading = false
    },
    handleSizeChange(size) {
      this.search = { ...this.search, size, page: 1 }
      this.listLanguage()
    },
    handlePageChange(page) {
      this.search = { ...this.search, page }
      this.listLanguage()
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
        this.listLanguage()
      }
    },
    onCreate() {
      this.language = {}
      this.formLanguageVisible = true
    },
    async deleteRow(row) {
      const res = await this.$confirm(
        `您确定要删除语言【${row.language}】吗？删除之后不可恢复`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch(() => {})
      if (res === 'confirm') {
        const res = await deleteLanguage({ id: row.id })
        if (res.status === 200) {
          this.$message.success('删除成功')
          this.listLanguage()
        } else {
          this.$message.error(res.data.message)
        }
      }
    },
    async batchDelete() {
      const ids = this.selectedRow.map((item) => item.id)
      const res = await this.$confirm(
        `您确定要删除选中的【${this.selectedRow.length}条】语言吗？删除之后不可恢复`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch(() => {})
      if (res === 'confirm') {
        const res = await deleteLanguage({ id: ids })
        if (res.status === 200) {
          this.$message.success('删除成功')
          this.listLanguage()
        } else {
          this.$message.error(res.data.message)
        }
      }
    },
    async updateLanguageStatus(status) {
      const ids = this.selectedRow.map((item) => item.id)
      const res = await updateLanguageStatus({ id: ids, enable: status })
      if (res.status === 200) {
        this.$message.success('更新成功')
        this.listLanguage()
      } else {
        this.$message.error(res.data.message)
      }
    },
    onSuccess() {
      this.formLanguageVisible = false
      this.listLanguage()
    },
    batchStatus(cmd) {
      console.log(cmd)
      this.updateLanguageStatus(cmd)
    },
    editRow(row) {
      this.language = row
      this.formLanguageVisible = true
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
          name: 'enable',
          placeholder: '请选择状态',
          multiple: true,
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ],
        },
      ]
    },
    initTableListFields() {
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
          prop: 'language',
          label: '语言',
          minWidth: 150,
        },
        { prop: 'code', label: '代码', minWidth: 150 },
        { prop: 'sort', label: '排序', width: 80, type: 'number' },
        { prop: 'created_at', label: '创建时间', width: 160, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 160, type: 'datetime' },
      ]
    },
  },
}
</script>
<style></style>
