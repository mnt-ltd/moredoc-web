<template>
  <div>
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
        <template slot="inputs">
          <el-form-item label="用户">
            <el-select
              v-model="search.user_id"
              filterable
              multiple
              remote
              reserve-keyword
              placeholder="请输入用户名"
              :remote-method="remoteSearchUser"
              :loading="loading"
            >
              <el-option
                v-for="user in users"
                :key="'userid' + user.id"
                :label="user.username"
                :value="user.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </template>
      </FormSearch>
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="sms"
        :fields="tableListFields"
        :show-actions="false"
        :show-view="false"
        :show-edit="false"
        :show-delete="false"
        :show-select="false"
        :actions-min-width="80"
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
  </div>
</template>

<script>
import { listSms } from '~/api/sms'
import { genLinkHTML, parseQueryIntArray } from '~/utils/utils'
import TableListV2 from '~/components/TableListV2.vue'
import FormSearch from '~/components/FormSearch.vue'
import {
  smsTypeOptions,
  smsStatusOptions,
  smsProviderOptions,
} from '~/utils/enum'
import { listUser } from '~/api/user'
import { mapGetters } from 'vuex'
export default {
  components: { TableListV2, FormSearch },
  layout: 'admin',
  data() {
    return {
      smsTypeOptions,
      smsStatusOptions,
      smsProviderOptions,
      loading: false,
      search: {
        wd: '',
        page: 1,
        enable: [],
        size: 10,
        user_id: [],
      },
      total: 0,
      searchFormFields: [],
      tableListFields: [],
      selectedRow: [],
      punishment: { id: 0 },
      users: [],
      sms: [],
    }
  },
  head() {
    return {
      title: `处罚管理 - ${this.settings.system.sitename}`,
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
          ...parseQueryIntArray(this.$route.query, [
            'user_id',
            'status',
            'type',
          ]),
        }
        this.listSMS()
      },
    },
  },
  async created() {
    this.initSearchForm()
    this.initTableListFields()
    if ((this.search.user_id || []).length > 0) {
      this.searchUser('', this.search.user_id)
    }
  },
  methods: {
    async remoteSearchUser(wd) {
      this.searchUser(wd)
    },
    async searchUser(wd, userId = []) {
      const res = await listUser({
        page: 1,
        size: 10,
        wd: wd,
        id: userId || [],
        field: ['id', 'username'],
      })
      if (res.status === 200) {
        this.users = res.data.user || []
      }
    },
    async listSMS() {
      this.loading = true
      const res = await listSms(this.search)
      if (res.status === 200) {
        let sms = res.data.sms || []
        sms.map((item) => {
          if (item.user_id) {
            item.user_html = genLinkHTML(item.username, `/user/${item.user_id}`)
          } else {
            item.user_html = '-'
          }
        })
        this.sms = sms
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
      this.search = {
        ...this.search,
        ...search,
        user_id: this.search.user_id,
        page: 1,
      }
      if (
        location.pathname + location.search ===
        this.$router.resolve({
          query: this.search,
        }).href
      ) {
        this.listSMS()
      } else {
        this.$router.push({
          query: this.search,
        })
      }
    },
    initSearchForm() {
      this.searchFormFields = [
        {
          type: 'select',
          label: '类型',
          name: 'type',
          placeholder: '请选择短信类型',
          multiple: true,
          options: this.smsTypeOptions,
        },
        {
          type: 'select',
          label: '状态',
          name: 'status',
          placeholder: '请选择短信发送状态',
          multiple: true,
          options: this.smsStatusOptions,
        },
        {
          type: 'text',
          label: '手机号',
          name: 'mobile',
          placeholder: '请输入手机号码',
        },
      ]
    },
    initTableListFields() {
      const enumTypeOptions = {}
      const enumStatusOptions = {}
      const enumProviderOptions = {}
      this.smsTypeOptions.map((item) => {
        enumTypeOptions[item.value] = item
      })
      this.smsStatusOptions.map((item) => {
        enumStatusOptions[item.value] = item
      })
      this.smsProviderOptions.map((item) => {
        enumProviderOptions[item.value] = item
      })

      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'type',
          label: '类型',
          width: 100,
          type: 'enum',
          enum: enumTypeOptions,
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          type: 'enum',
          enum: enumStatusOptions,
        },
        {
          prop: 'user_html',
          label: '用户',
          minWidth: 150,
          type: 'html',
        },
        { prop: 'mobile', label: '手机', width: 120 },
        { prop: 'code', label: '验证码', minWidth: 80 },
        { prop: 'ip', label: 'IP', minWidth: 120 },
        {
          prop: 'provider',
          label: '短信服务',
          width: 120,
          type: 'enum',
          enum: enumProviderOptions,
        },
        { prop: 'error', label: '错误信息', minWidth: 150 },
        { prop: 'response', label: '发送结果', minWidth: 250 },
        { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
        { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
      ]
    },
  },
}
</script>
<style></style>
