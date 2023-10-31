<template>
  <div>
    <el-card shadow="never" class="search-card">
      <FormSearch
        :fields="searchFormFields"
        :loading="loading"
        :show-create="false"
        :show-delete="false"
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
      <TableList
        :table-data="listData"
        :fields="tableListFields"
        :show-actions="false"
        :show-view="false"
        :loading="loading"
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
import { listUserVip } from '~/api/uservip'
import TableList from '~/components/TableList.vue'
import FormSearch from '~/components/FormSearch.vue'
import { vipTypeOptions } from '~/utils/enum'
import { parseQueryIntArray, genLinkHTML } from '~/utils/utils'
import { listUser } from '~/api/user'
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
        user_id: [],
      },
      listData: [],
      total: 0,
      searchFormFields: [],
      tableListFields: [],
      vipTypeOptions,
      users: [],
    }
  },
  head() {
    return {
      title: `会员管理 - ${this.settings.system.sitename}`,
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
          ...parseQueryIntArray(this.$route.query, ['type', 'user_id']),
        }
        this.listUserVip()
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
    async listUserVip() {
      this.loading = true
      const res = await listUserVip(this.search)
      if (res.status === 200) {
        let data = res.data.user_vip || []
        data.map((item) => {
          item.username_html = genLinkHTML(
            item.username,
            `/user/${item.user_id}`
          )
        })
        this.listData = data
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
        this.listPermission()
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
          placeholder: '请选择VIP类型',
          multiple: true,
          options: this.vipTypeOptions,
        },
      ]
    },
    initTableListFields() {
      const typeEnum = {}
      this.vipTypeOptions.map((item) => {
        typeEnum[item.value] = item
      })

      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'type',
          label: 'VIP类型',
          width: 80,
          type: 'enum',
          enum: typeEnum,
        },
        {
          prop: 'username_html',
          label: '用户',
          minWidth: 100,
          type: 'html',
        },
        { prop: 'discount', label: '折扣(折)', minWidth: 150 },
        {
          prop: 'download',
          label: '专享下载(次)',
          minWidth: 150,
          type: 'number',
        },
        {
          prop: 'download_used',
          label: '已用专享下载(次)',
          minWidth: 150,
          type: 'number',
        },
        { prop: 'times', label: '下载频次(次/天)', minWidth: 150 },
        { prop: 'joined_at', label: '加入时间', width: 160, type: 'datetime' },
        { prop: 'expired_at', label: '过期时间', width: 160, type: 'datetime' },
      ]
    },
  },
}
</script>
<style></style>
