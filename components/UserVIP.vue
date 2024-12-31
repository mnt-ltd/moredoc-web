<template>
  <div class="com-user-vip">
    <el-table v-loading="loading" :data="userVIP" style="width: 100%">
      <el-table-column prop="type" label="VIP类型" min-width="90">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 2" type="warning">月卡VIP</el-tag>
          <el-tag v-else-if="scope.row.type === 1" type="primary"
            >季卡VIP</el-tag
          >
          <el-tag v-else type="success">年卡VIP</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="discount" label="折扣" width="70">
        <template slot-scope="scope">
          {{ ((scope.row.discount || 0) / 10).toFixed(1) }} 折
        </template>
      </el-table-column>
      <el-table-column prop="download" label="专享免费下载" width="110">
        <template slot-scope="scope">
          {{ scope.row.download || '0' }} 次(总数)
        </template>
      </el-table-column>
      <el-table-column prop="download" label="已用专享下载" width="110">
        <template slot-scope="scope">
          {{ scope.row.download_used || '0' }} 次
        </template>
      </el-table-column>
      <el-table-column prop="download" label="下载频次" width="90">
        <template slot-scope="scope">
          {{ scope.row.times || '不限' }} <small>次/天</small>
        </template>
      </el-table-column>
      <el-table-column
        prop="download"
        label="有效期"
        min-width="195"
        fixed="right"
      >
        <template slot-scope="scope">
          <div class="vip-duration">
            <div>
              {{ formatDate(scope.row.joined_at) }} ~
              {{ formatDate(scope.row.expired_at) }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="order_no" label="关联订单" min-width="200">
        <template slot-scope="scope">
          <nuxt-link
            class="el-link el-link--primary"
            :to="`/order?order_no=${scope.row.order_no}`"
            ><small>{{ scope.row.order_no }}</small></nuxt-link
          >
          <div>
            <small><span>购买于：</span></small
            >{{ formatDate(scope.row.created_at) }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="total > 0"
      :current-page="query.page"
      :page-size="size"
      :layout="
        isMobile
          ? 'total, prev, pager, next'
          : 'total, prev, pager, next, jumper'
      "
      :pager-count="isMobile ? 5 : 7"
      :small="isMobile"
      :total="total"
      class="mgt-20px"
      @current-change="pageChange"
    >
    </el-pagination>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { formatDatetime, formatRelativeTime, formatDate } from '~/utils/utils'
import { listUserVIP } from '~/api/user'
export default {
  name: 'UserVIP',
  props: {},
  data() {
    return {
      userVIP: [],
      total: 0,
      loading: false,
      query: {
        page: parseInt(this.$route.query.page) || 1,
      },
      size: 20,
    }
  },
  watch: {
    '$route.query': {
      handler(val) {
        this.query = {
          page: parseInt(val.page) || 1,
        }
        this.listUserVIP()
      },
      immediate: true,
    },
  },
  created() {},
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {
    formatDatetime,
    formatDate,
    formatRelativeTime,
    // 查询用户自己的订单列表
    async listUserVIP() {
      this.loading = true
      const res = await listUserVIP({ ...this.query, size: this.size })
      if (res.status === 200) {
        this.userVIP = res.data.user_vip || []
        this.total = res.data.total || 0
      }
      this.loading = false
    },
    pageChange(page) {
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.query,
          page,
        },
      })
    },
  },
}
</script>
<style scoped lang="scss">
.vip-duration {
  font-size: 13px;
  span {
    color: #aaa;
  }
}
</style>
