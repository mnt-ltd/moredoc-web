<template>
  <div class="com-user-order">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="全部订单" name="0"></el-tab-pane>
      <el-tab-pane
        v-for="item in orderStatusOptions"
        :key="'order-status-' + item.value"
        :label="item.label"
        :name="'' + item.value"
      ></el-tab-pane>
    </el-tabs>
    <el-table v-loading="loading" :data="orders" style="width: 100%">
      <el-table-column prop="status" label="支付状态" width="80">
        <template slot-scope="scope">
          <el-tag :type="filterOrderStatus(scope.row.status).type" size="mini">
            {{ filterOrderStatus(scope.row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 商品名称、订单号、下单时间、支付状态、操作 -->
      <el-table-column prop="product_name" label="商品名称" min-width="321">
        <template slot-scope="scope">
          {{ scope.row.product_name }}
          <div class="order_no">
            订单号：<span>{{ scope.row.order_no }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="order_no"
        :label="`金额(${settings.system.credit_name || '魔豆'})`"
        width="100"
      >
        <template slot-scope="scope">
          {{ scope.row.amount || '0' }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="下单时间" width="90">
        <template slot-scope="scope">
          <small>{{ formatDatetime(scope.row.created_at) }}</small>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template slot-scope="scope">
          <nuxt-link :to="`/order?order_no=${scope.row.order_no}`"
            ><el-button type="text" size="mini" icon="el-icon-view"
              >查看</el-button
            ></nuxt-link
          >
          <span v-if="scope.row.status === 1">
            <!-- 待支付，显示支付按钮和关闭按钮 -->
            <nuxt-link :to="`/order?order_no=${scope.row.order_no}`"
              ><el-button
                type="text"
                size="mini"
                class="text-danger"
                icon="el-icon-coin"
                >支付</el-button
              ></nuxt-link
            >
            <br />
            <el-button
              type="text"
              class="text-info"
              size="mini"
              icon="el-icon-close"
              @click="closeOrder(scope.row)"
              >关闭</el-button
            >
          </span>
          <span v-else-if="scope.row.status === 3">
            <!-- 已关闭，显示删除按钮 -->
            <el-button
              type="text"
              size="mini"
              class="text-warning"
              icon="el-icon-delete"
              @click="deleteOrder(scope.row)"
              >删除</el-button
            >
          </span>
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
      @current-change="pageChange"
      class="mgt-20px"
    >
    </el-pagination>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { formatDatetime, formatRelativeTime } from '~/utils/utils'
import { orderStatusOptions } from '~/utils/enum'
import { listUserOrder } from '~/api/user'
import { closeOrder, deleteOrder } from '~/api/order'
export default {
  name: 'UserOrder',
  props: {},
  data() {
    return {
      orderStatusOptions,
      orderStatusMap: {},
      activeTab: this.$route.query.status || '0',
      orders: [],
      total: 0,
      loading: false,
      query: {
        page: parseInt(this.$route.query.page) || 1,
        status: parseInt(this.$route.query.status) || 0,
      },
      size: 20,
    }
  },
  watch: {
    '$route.query': {
      handler(val) {
        this.query = {
          ...val,
          page: parseInt(val.page) || 1,
          status: parseInt(val.status) || 0,
        }
        this.activeTab = val.status || '0'
        this.getOrders()
      },
      immediate: true,
    },
  },
  created() {
    this.orderStatusMap = orderStatusOptions.reduce((acc, cur) => {
      acc[cur.value] = cur
      return acc
    }, {})
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {
    formatDatetime,
    formatRelativeTime,
    // 查询用户自己的订单列表
    async getOrders() {
      this.loading = true
      const res = await listUserOrder({ size: this.size, ...this.query })
      if (res.status === 200) {
        this.orders = res.data.order || []
        this.total = res.data.total || 0
      }
      console.log(res)
      this.loading = false
    },
    handleTabClick(tab) {
      this.$router.push({
        path: this.$route.path,
        query: {
          ...this.query,
          status: tab.name,
        },
      })
    },
    filterOrderStatus(status) {
      return (
        this.orderStatusMap[status] || {
          label: '未知',
          value: status,
          name: '未知',
          type: 'primary',
        }
      )
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
    // 关闭订单
    async closeOrder(order) {
      const res = await closeOrder({ order_no: order.order_no })
      if (res.status === 200) {
        this.$message.success('订单关闭成功')
        this.getOrders()
      } else {
        this.$message.error(res.data.message || '关闭订单失败')
      }
    },
    // 删除订单
    async deleteOrder(order) {
      const res = await deleteOrder({ order_no: order.order_no })
      if (res.status === 200) {
        this.$message.success('订单删除成功')
        this.getOrders()
      } else {
        this.$message.error(res.data.message || '删除订单失败')
      }
    },
  },
}
</script>
<style scoped>
.order_no {
  color: #999;
  font-size: 12px;
}
.text-info {
  color: #909399;
}
.text-danger {
  color: #f56c6c;
}
.text-warning {
  color: #e6a23c;
}
</style>
