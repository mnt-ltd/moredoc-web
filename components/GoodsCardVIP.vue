<template>
  <!-- 商品卡片 -->
  <div v-loading="loading" class="com-goods-card-vip">
    <el-descriptions :column="isMobile ? 1 : 2" border>
      <el-descriptions-item
        v-for="(item, idx) in descriptions"
        :key="'desc-' + idx"
      >
        <template slot="label">
          <i :class="item.icon"></i>
          {{ item.label }}
        </template>
        {{ item.value }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { formatBytes, formatDatetime } from '~/utils/utils'
import { getUserVIPOrder } from '~/api/user'
export default {
  name: 'GoodsCardVIP',
  props: {
    order: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      descriptions: [],
    }
  },
  watch: {
    order: {
      async handler(val) {
        console.log(this.settings.vip)
        let download = '不限'
        let discount = '不打折'
        let frequency = '不限'
        let startTime = ''
        let endTime = ''
        switch (val.product_id) {
          case 2: // 月卡
            download = this.settings.vip.month_download
              ? this.settings.vip.month_download
              : download
            if (this.settings.vip.month_download)
              download = this.settings.vip.month_download

            discount = this.settings.vip.month_document_discount
              ? (this.settings.vip.month_document_discount / 10).toFixed(1) +
                ' 折'
              : discount
            frequency = this.settings.vip.month_times_every_day
              ? `${this.settings.vip.month_times_every_day} 次/天`
              : frequency
            break
          case 1: // 季卡
            download = this.settings.vip.quarter_download
              ? this.settings.vip.quarter_download
              : download
            discount = this.settings.vip.quarter_document_discount
              ? (this.settings.vip.quarter_document_discount / 10).toFixed(1) +
                ' 折'
              : discount
            frequency = this.settings.vip.quarter_times_every_day
              ? `${this.settings.vip.quarter_times_every_day} 次/天`
              : frequency
            break
          default: // 0 或其他，默认为年卡
            download = this.settings.vip.year_download
              ? this.settings.vip.year_download
              : download
            discount = this.settings.vip.year_document_discount
              ? (this.settings.vip.year_document_discount / 10).toFixed(1) +
                ' 折'
              : discount
            frequency = this.settings.vip.year_times_every_day
              ? `${this.settings.vip.year_times_every_day} 次/天`
              : frequency
        }

        const res = await getUserVIPOrder({ order_no: val.order_no })

        console.log(res)
        if (res.status === 200) {
          if (res.data.times) frequency = `${res.data.times} 次/天`
          if (res.data.download) download = res.data.download
          if (res.data.discount)
            discount = `${(res.data.discount / 10).toFixed(1)} 折`
          if (res.data.joined_at) startTime = formatDatetime(res.data.joined_at)
          if (res.data.expired_at) endTime = formatDatetime(res.data.expired_at)
        }

        const descriptions = [
          {
            label: '名称',
            value: val.product_name,
            icon: 'el-icon-s-order',
          },
          {
            label: '下载频次',
            value: frequency,
            icon: 'el-icon-download',
          },
          {
            label: 'VIP专享免费下载',
            value: `${download} 次/月`,
            icon: 'el-icon-download',
          },
          {
            label: 'VIP专享折扣',
            value: `${discount}`,
            icon: 'el-icon-s-ticket',
          },
          {
            label: '身份标识',
            value: '√',
            icon: 'el-icon-s-check',
          },
          {
            label: '清爽去广告',
            value: '√',
            icon: 'el-icon-s-release',
          },
        ]
        if (startTime) {
          descriptions.push({
            label: '开始时间',
            value: startTime,
            icon: 'el-icon-time',
          })
        }
        if (endTime) {
          descriptions.push({
            label: '结束时间',
            value: endTime,
            icon: 'el-icon-time',
          })
        }
        console.log(descriptions)
        this.descriptions = descriptions
      },
      immediate: true,
    },
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {
    formatBytes,
    formatDatetime,
  },
}
</script>
<style lang="scss" scoped>
.btn-download {
  margin-left: 10px;
  top: 2px;
  position: relative;
}

.download-tips {
  margin-bottom: 20px;
}
.count-down {
  font-size: 16px;
  font-weight: bold;
  position: relative;
  top: -2px;
}
</style>
