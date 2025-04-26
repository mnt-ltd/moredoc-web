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
      />
    </el-card>
    <el-card shadow="never" class="mgt-20px">
      <TableListV2
        :loading="loading"
        :table-data="orders"
        :fields="tableListFields"
        :show-actions="true"
        :show-view="false"
        :show-edit="false"
        :show-delete="false"
        :show-select="false"
      >
        <!-- 查看文章 -->
        <template slot="actions" slot-scope="scope">
          <nuxt-link
            target="_blank"
            :to="{
              name: 'user-id',
              params: { id: scope.row.user_id },
            }"
          >
            <el-button type="text" size="mini" icon="el-icon-user"
              >查看用户</el-button
            >
          </nuxt-link>
          <nuxt-link
            v-if="scope.row.order_type === 1"
            target="_blank"
            :to="{
              name: 'document-id',
              params: { id: scope.row.product_id },
            }"
          >
            <el-button type="text" size="mini" icon="el-icon-goods"
              >查看商品</el-button
            >
          </nuxt-link>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listOrder } from '~/api/order'
import { genLinkHTML, parseQueryIntArray } from '~/utils/utils'
import {
  orderStatusOptions,
  paymentTypeOptions,
  orderTypeOptions,
} from '~/utils/enum'
import TableListV2 from '~/components/TableListV2.vue'
import FormSearch from '~/components/FormSearch.vue'
export default {
  components: { TableListV2, FormSearch },
  layout: 'admin',
  data() {
    return {
      loading: false,
      search: {
        wd: '',
        page: 1,
        enable: [],
        size: 10,
      },
      orders: [],
      total: 0,
      searchFormFields: [],
      tableListFields: [],
      selectedRow: [],
      order: { id: 0 },
      orderStatusOptions,
      paymentTypeOptions,
      orderTypeOptions,
    }
  },
  head() {
    return {
      title: `订单管理 - ${this.settings.system.sitename}`,
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
            'order_status',
            'order_type',
            'payment_type',
          ]),
        }
        this.listOrder()
      },
    },
  },
  async created() {
    this.initSearchForm()
    this.initTableListFields()
    // await this.listOrder()
  },
  methods: {
    async listOrder() {
      this.loading = true
      const res = await listOrder(this.search)
      if (res.status === 200) {
        let orders = res.data.order || []
        orders = orders.map((item) => {
          if (item.order_type === 1) {
            // 购买文档
            item.product_name_html = genLinkHTML(
              item.product_name,
              `/document/${item.product_id}`
            )
          } else {
            item.product_name_html = (item.product_name || '-')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
          }
          return item
        })
        this.orders = orders
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
    selectRow(rows) {
      this.selectedRow = rows
    },
    initSearchForm() {
      this.searchFormFields = [
        {
          type: 'text',
          label: '关键字',
          name: 'wd',
          placeholder: '请输入订单号或者产品名称关键字',
        },
        {
          type: 'select',
          label: '状态',
          name: 'order_status',
          placeholder: '请选择订单状态',
          multiple: true,
          options: this.orderStatusOptions,
        },
        {
          type: 'select',
          label: '订单类型',
          name: 'order_type',
          placeholder: '请选择订单类型',
          multiple: true,
          options: this.orderTypeOptions,
        },
        {
          type: 'select',
          label: '支付方式',
          name: 'payment_type',
          placeholder: '请选择订单支付方式',
          multiple: true,
          options: this.paymentTypeOptions,
        },
      ]
    },
    initTableListFields() {
      const statusMap = {}
      const paymentTypeMap = {}
      const orderTypeMap = {}
      this.orderStatusOptions.forEach((item) => {
        statusMap[item.value] = item
      })
      this.paymentTypeOptions.forEach((item) => {
        item.type = 'primary'
        paymentTypeMap[item.value] = item
      })
      this.orderTypeOptions.forEach((item) => {
        item.type = 'success'
        orderTypeMap[item.value] = item
      })

      this.tableListFields = [
        { prop: 'id', label: 'ID', width: 80, type: 'number', fixed: 'left' },
        {
          prop: 'product_name_html',
          label: '名称',
          minWidth: 200,
          fixed: 'left',
          type: 'html',
        },
        { prop: 'order_no', label: '订单号', minWidth: 220 },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          type: 'enum',
          enum: statusMap,
        },
        {
          prop: 'payment_type',
          label: '支付方式',
          width: 110,
          type: 'enum',
          enum: paymentTypeMap,
        },
        {
          prop: 'order_type',
          label: '订单类型',
          width: 110,
          type: 'enum',
          enum: orderTypeMap,
        },
        { prop: 'username', label: '用户', width: 120 },
        { prop: 'quantity', label: '数量', width: 80, type: 'number' },
        { prop: 'price', label: '价格', width: 80, type: 'number' },
        { prop: 'coupon_amount', label: '优惠', width: 80, type: 'number' },
        { prop: 'amount', label: '实付', width: 80, type: 'number' },
        { prop: 'created_at', label: '创建时间', width: 170, type: 'datetime' },
        // { prop: 'updated_at', label: '更新时间', width: 170, type: 'datetime' },
        { prop: 'paid_at', label: '支付时间', width: 170, type: 'datetime' },
        { prop: 'closed_at', label: '关闭时间', width: 170, type: 'datetime' },
      ]
    },
  },
}
</script>
<style></style>
