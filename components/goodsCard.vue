<template>
  <!-- 商品卡片 -->
  <div class="com-goods-card" v-loading="loading">
    <div
      v-if="order.status === 2 && settings.download.free_download_duration > 0"
      class="download-tips"
    >
      <el-alert
        v-if="document.is_expired"
        title="温馨提示"
        type="warning"
        :closable="false"
        show-icon
      >
        您当前订单购买的文档于
        <strong class="el-link el-link--danger count-down">{{
          formatDatetime(document.expired_at)
        }}</strong>
        过期，已无法继续免费下载，请重新购买。
      </el-alert>
      <el-alert
        v-else
        title="温馨提示"
        type="warning"
        :closable="false"
        show-icon
      >
        您购买的文档有效期截止
        <strong class="el-link el-link--danger count-down">{{
          formatDatetime(document.expired_at)
        }}</strong
        >，到期之前您可以免费下载。
      </el-alert>
    </div>
    <el-descriptions
      v-if="order.order_type === 1"
      :column="isMobile ? 1 : 2"
      border
    >
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-document"></i>
          文档
        </template>
        <nuxt-link
          :to="`/document/${document.id}`"
          class="el-link el-link--primary"
          target="_blank"
          >{{ document.title }}{{ document.ext }}</nuxt-link
        >
        <el-button
          v-if="order.status === 2 && !document.is_expired"
          type="text"
          icon="el-icon-download"
          class="btn-download"
          size="small"
          @click="downloadDocument"
          >下载文档文件</el-button
        >
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-magic-stick"></i>
          评分
        </template>
        <el-rate
          v-model="document.score"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value}"
        >
        </el-rate>
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-box"></i>
          大小
        </template>
        {{ formatBytes(document.size) }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-files"></i>
          页数
        </template>
        {{ document.pages || '-' }} 页
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-view"></i>
          浏览
        </template>
        {{ document.view_count || '0' }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-star-off"></i>
          收藏
        </template>
        {{ document.favorite_count || '0' }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script>
import { getDocument, downloadDocument } from '~/api/document'
import { formatBytes, formatDatetime } from '~/utils/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'GoodsCard',
  props: {
    order: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    // 监听order变化
    order: {
      handler: function (val) {
        // 默认
        this.document = {
          title: val.product_name,
        }
        this.getGoods()
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      document: {},
      loading: false,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {
    formatBytes,
    formatDatetime,
    // 获取商品信息
    async getGoods() {
      if (!this.order.product_id) return

      switch (this.order.order_type) {
        case 1:
          this.getDocument()
          break
        case 2:
        //
        default:
          this.$message.error('未知订单类型')
      }
    },
    async getDocument() {
      this.loading = true
      const res = await getDocument({ id: this.order.product_id })
      if (res.status === 200) {
        let document = res.data || { score: 0 }
        document.score = document.score / 100
        if (this.settings.download.free_download_duration > 0) {
          // 免费下载有效期，时间格式转换
          try {
            const expiredAt = new Date(
              new Date(this.order.paid_at).getTime() +
                this.settings.download.free_download_duration *
                  24 *
                  60 *
                  60 *
                  1000
            )
            document.expired_at = expiredAt.Format('yyyy-MM-dd hh:mm:ss')
            document.is_expired = expiredAt.getTime() < new Date().getTime()
          } catch (error) {}
        }

        this.document = document
      }
      this.loading = false
    },
    async downloadDocument() {
      const res = await downloadDocument({ id: this.order.product_id })
      if (res.status === 200) {
        location.href = res.data.url
      } else {
        this.$message.error(res.data.message || '下载失败')
      }
    },
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
