<template>
  <div class="page page-order">
    <el-card v-loading="loading" shadow="never">
      <div slot="header">
        订单信息
        <nuxt-link to="/me/order">
          <el-button
            type="text"
            class="order-action el-link el-link--primary"
            icon="el-icon-top-right"
            >订单列表</el-button
          >
        </nuxt-link>
        <el-button
          v-if="order.status === 1"
          type="text"
          class="order-action el-link el-link--warning"
          icon="el-icon-close"
          @click="closeOrder"
          >关闭订单</el-button
        >
      </div>
      <div v-if="order.status === 1" class="mgb-20px">
        <el-alert title="温馨提示" type="warning" :closable="false" show-icon>
          请在
          <strong class="el-link el-link--danger count-down">{{
            formatDatetime(order.closed_at)
          }}</strong>
          前完成支付，否则订单将自动关闭。距离订单关闭，还有
          <strong class="el-link el-link--danger count-down">{{
            countdown
          }}</strong>
          。
        </el-alert>
      </div>
      <el-descriptions :column="isMobile ? 1 : 2" border>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-goods"></i>
            商品名称
          </template>
          <template v-if="order.order_type === 1">
            <nuxt-link
              class="el-link el-link--primary"
              target="_blank"
              :to="`/document/${order.product_uuid || order.product_id}`"
              >{{ order.product_name }}</nuxt-link
            >
          </template>
          <template v-else>{{ order.product_name }}</template>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-s-ticket"></i>
            订单号
          </template>
          {{ order.order_no }}&nbsp;
          <el-tooltip content="复制订单号">
            <el-button
              icon="el-icon-document-copy"
              type="text"
              @click="copyOrderNO(order.order_no)"
            ></el-button>
          </el-tooltip>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-date"></i>
            下单时间
          </template>
          {{ formatDatetime(order.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="order.paid_at">
          <template slot="label">
            <i class="el-icon-date"></i>
            支付时间
          </template>
          {{ formatDatetime(order.paid_at) }}
        </el-descriptions-item>
        <!-- 已关闭订单才会显示该值 -->
        <el-descriptions-item v-if="order.status === 3 && order.closed_at">
          <template slot="label">
            <i class="el-icon-date"></i>
            关闭时间
          </template>
          {{ formatDatetime(order.closed_at) }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-coffee-cup"></i>
            订单状态
          </template>
          <template v-if="order.status === 1">
            <el-tag type="danger">待支付</el-tag>
          </template>
          <template v-else-if="order.status === 2">
            <el-tag type="success">已支付</el-tag>
          </template>
          <template v-else-if="order.status === 3">
            <el-tag type="info">已关闭</el-tag>
          </template>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-tickets"></i>
            购买数量
          </template>
          {{ order.quantity }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-coin"></i>
            商品单价
          </template>
          {{ order.price || '0' }} {{ settings.system.credit_name
          }}<template v-if="settings.system.show_exchange"
            >（
            <span class="el-link el-link--danger price">{{
              (
                (order.price || 0) / (settings.system.credit_exchange || 1)
              ).toFixed(2)
            }}</span>
            元）</template
          >
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-coin"></i>
            实付金额
          </template>
          <div class="actual-pay">
            {{ order.amount || '0' }} {{ settings.system.credit_name
            }}<template v-if="settings.system.show_exchange"
              >（
              <span class="el-link el-link--danger price">{{
                (
                  (order.amount || 0) / (settings.system.credit_exchange || 1)
                ).toFixed(2)
              }}</span>
              元）</template
            >
          </div>
          <div>
            <del v-if="order.coupon_amount" class="text-muted">
              <small>
                {{ (order.amount || 0) + order.coupon_amount }}
                {{ settings.system.credit_name
                }}<template v-if="settings.system.show_exchange"
                  >（
                  <span class="el-link el-link--danger price">{{
                    (
                      ((order.amount || 0) + order.coupon_amount || 0) /
                      (settings.system.credit_exchange || 1)
                    ).toFixed(2)
                  }}</span>
                  元）</template
                >
              </small>
            </del>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="order.payment_type > 0 && order.status === 2"
        >
          <template slot="label">
            <i class="el-icon-coin"></i>
            支付方式
          </template>
          <span v-if="order.payment_type === 8">
            {{
              settings.payment.xunhupay_name ||
              paymentTypeMap[order.payment_type].label ||
              '-'
            }}
          </span>
          <span v-else>{{
            paymentTypeMap[order.payment_type].label || '-'
          }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    <!-- 购买文档的商品信息 -->
    <el-card v-if="order.order_type === 1" shadow="never" class="mgt-20px">
      <div slot="header">商品信息</div>
      <goods-card :order="order" />
    </el-card>
    <el-card v-else-if="order.order_type === 2" shadow="never" class="mgt-20px">
      <div slot="header">商品信息</div>
      <!-- 购买VIP的商品信息 -->
      <GoodsCardVIP :order="order" />
    </el-card>
    <!-- 待支付的订单，才现实支付方式 -->
    <el-card v-if="order.status === 1" shadow="never" class="mgt-20px">
      <div slot="header">支付方式</div>
      <div class="payment-type">
        <el-radio
          v-if="order.order_type != 2 || settings.vip.enable_credit_pay"
          v-model="paymentType"
          class="payment-type-radio"
          :label="5"
          :disabled="order.amount > user.credit_count"
          border
        >
          积分支付
          <small class="el-link el-link--info"
            >剩余 {{ user.credit_count || 0 }}
            {{ settings.system.credit_name }}</small
          > </el-radio
        ><el-radio
          v-for="item in payments"
          v-show="
            settings.payment['enable_' + item.name] ||
            (item.name === 'downcode' &&
              settings.download.enable_code_download &&
              order.order_type === 1)
          "
          :key="'pt-' + item.value"
          v-model="paymentType"
          class="payment-type-radio"
          :label="item.value"
          :disabled="
            !order.amount ||
            (item.name === 'downcode' &&
              settings.download.enable_code_download &&
              settings.download.max_price > 0 &&
              order.amount > settings.download.max_price)
          "
          border
        >
          <span v-if="item.name === 'xunhupay'">
            {{ settings.payment.xunhupay_name || item.label }}
          </span>
          <span v-else>{{ item.label }}</span>
          <img :src="`/static/images/pay-${item.name}.png`" :alt="item.label" />
        </el-radio>
      </div>
      <!-- 下载码下载 -->
      <div v-if="paymentType === 9">
        <div class="downcode-tips">
          <div v-html="settings.download.code_tip"></div>
        </div>
      </div>
      <div class="text-right">
        <!-- 输入下载码 -->
        <el-input
          v-if="paymentType === 9"
          v-model="downcode"
          placeholder="请输入下载码"
          class="downcode"
        ></el-input>
        <el-button type="text" class="btn-disabled" :disabled="true">
          {{ order.amount || '0' }} {{ settings.system.credit_name
          }}<template v-if="settings.system.show_exchange"
            >（
            <span class="el-link el-link--danger price"
              >{{
                (
                  (order.amount || 0) / (settings.system.credit_exchange || 1)
                ).toFixed(2)
              }}
              元</span
            >）</template
          ></el-button
        >
        <el-button
          type="danger"
          :disabled="paymentType === 5 && user.credit_count < order.amount"
          :loading="paying"
          icon="el-icon-position"
          @click="payOrder"
          >支付订单</el-button
        >
      </div>
    </el-card>
    <a ref="redirect" href="" target="_blank"></a>
    <el-dialog
      title="支付"
      :visible.sync="payCheckVisible"
      :width="isMobile ? '95%' : '520px'"
      :before-close="donePayment"
    >
      <div class="tips">
        <div v-if="paymentType === 1" class="text-center">
          <!-- 微信支付，显示二维码 -->
          <h3 class="text-center">
            微信支付：<span class="el-link el-link--danger"
              >{{
                (
                  (order.amount || 0) / (settings.system.credit_exchange || 1)
                ).toFixed(2)
              }}
              元</span
            >
          </h3>
          <div id="qrcode" ref="qrcode" class="text-center"></div>
          <small>使用微信扫描二维码进行支付 </small>
        </div>
        <div v-else>请在新打开的页面进行支付。</div>
        <div><small>支付完成后，根据您的情况点击下面按钮。</small></div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          icon="el-icon-check"
          size="small"
          @click="donePayment"
          >支付成功</el-button
        >
        <el-button
          type="warning"
          icon="el-icon-warning-outline"
          size="small"
          @click="donePayment"
          >支付失败</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import QRCode from 'qrcodejs2' // 引入qrcode
import { getOrder, payOrder, getOrderStatus, closeOrder } from '~/api/order'
import { formatDatetime, countDownTime, isWeixin } from '~/utils/utils'
import { paymentTypeOptions } from '~/utils/enum'
import { downloadDocument } from '~/api/document'
export default {
  name: 'PageOrder',
  data() {
    return {
      paymentType: 5, // 5，积分支付; 8，虎皮椒支付
      downcode: '',
      order: {},
      paymentTypeOptions,
      paymentTypeMap: {},
      loading: false,
      payments: [
        { label: '微信支付', value: 1, name: 'wechatpay' },
        { label: '支付宝支付', value: 2, name: 'alipay' },
        { label: '虎皮椒支付', value: 8, name: 'xunhupay' },
        { label: '下载码支付', value: 9, name: 'downcode' },
      ],
      paying: false,
      payCheckVisible: false,
      intervaler: null,
      countdown: '-分-秒',
    }
  },
  head() {
    return {
      title: `订单详情 - 订单号:${this.$route.query.order_no || 'loading'}`,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    ...mapGetters('user', ['user']),
    enablePayments() {
      return this.payments.filter(
        (item) =>
          this.settings.payment['enable_' + item.name] ||
          (item.name === 'downcode' &&
            this.settings.download.enable_code_download &&
            this.order.order_type === 1)
      )
    },
  },
  created() {
    this.paymentTypeMap = paymentTypeOptions.reduce((obj, item) => {
      obj[item.value] = item
      return obj
    }, {})
    Promise.all([this.getUser(), this.getOrder()])
    if (this.enablePayments.length > 0) {
      this.paymentType = this.enablePayments[0].value
    }
    if (this.$route.query.code) {
      this.paymentType = 1
      this.execPayOrder()
    }
  },
  beforeDestroy() {
    try {
      clearInterval(this.intervaler)
    } catch (e) {
      console.error(e)
    }
    document.removeEventListener('WeixinJSBridgeReady', this.onBridgeReady)
  },
  methods: {
    ...mapActions('user', ['getUser']),
    ...mapActions('setting', ['getSettings']),
    formatDatetime,
    isWeixin,
    // 获取订单详情
    async getOrder() {
      this.loading = true
      const res = await getOrder({ order_no: this.$route.query.order_no })
      if (res.status === 200) {
        const order = res.data || {}
        this.order = order
        if (order.status === 1) {
          this.paymentType = order.payment_type || this.paymentType
          // 待支付的订单，根据closed_at字段来计算还有多长时间关闭订单
          this.intervaler = setInterval(async () => {
            const left = countDownTime(order.closed_at)
            if (left.seconds <= 0) {
              clearInterval(this.intervaler)
              await this.closeOrder()
              await this.getOrder()
            } else {
              this.countdown = left.format
            }
          }, 1000)
        }
      } else {
        this.$message.error(res.data.message || '获取订单详情失败')
        this.$router.push('/me/order')
      }
      this.loading = false
    },
    async payOrder() {
      if (isWeixin()) {
        if (
          !this.settings.payment ||
          !this.settings.payment.official_account_appid
        ) {
          await this.getSettings()
        }
        // 微信浏览器，需要先获取code
        location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${
          this.settings.payment.official_account_appid
        }&redirect_uri=${encodeURIComponent(
          location.origin + '/order?order_no=' + this.$route.query.order_no
        )}&response_type=code&scope=snsapi_base&state=state#wechat_redirect`
      } else {
        this.execPayOrder()
      }
    },
    async execPayOrder() {
      this.paying = true
      const code = this.$route.query.code || ''
      const req = {
        order_no: this.$route.query.order_no,
        payment_type: this.paymentType,
        downcode: this.downcode,
        is_wap: this.isMobile,
        code,
      }
      const res = await payOrder(req)
      this.paying = false
      if (res.status !== 200) {
        this.$message.error(
          // 'PayOrder:' + res.data.message + JSON.stringify(req) || '支付失败'
          res.data.message
        )
        return
      }

      if (res.data.order_status === 1) {
        // 微信支付，需要根据返回的链接生成二维码
        if (this.paymentType === 1) {
          if (isWeixin() && res.data.extra && this.isMobile) {
            // 如果是微信客户端，调用微信支付
            this.onBridgeReady(res.data.extra)
          } else if (this.isMobile) {
            location.href = res.data.payment_url
          } else {
            this.$nextTick(() => {
              this.$refs.qrcode.innerHTML = ''
              // eslint-disable-next-line no-new
              new QRCode(this.$refs.qrcode, {
                width: 160,
                height: 160,
                text: res.data.payment_url,
                colorDark: '#000',
                colorLight: '#fff',
              })
            })
            this.payCheckVisible = true
          }
        } else {
          // 新开一个子窗口
          this.$refs.redirect.setAttribute('href', res.data.payment_url)
          this.$refs.redirect.click()
          if (!this.isMobile) this.payCheckVisible = true
        }
      } else if (res.data.order_status === 2) {
        this.$message.success('恭喜您，支付成功')
        this.execAfterPaid()
      }
    },
    // 复制订单号
    copyOrderNO(orderNo) {
      const input = document.createElement('input')
      input.setAttribute('readonly', 'readonly')
      input.setAttribute('value', orderNo)
      document.body.appendChild(input)
      input.select()
      input.setSelectionRange(0, 9999)
      if (document.execCommand('copy')) {
        document.execCommand('copy')
        this.$message.success('复制成功')
      }
      document.body.removeChild(input)
    },
    async downloadDocument() {
      const res = await downloadDocument({ id: this.order.product_id })
      if (res.status === 200) {
        location.href = res.data.url
      } else {
        this.$message.error(res.data.message || '下载失败')
      }
    },
    execAfterPaid() {
      this.getOrder()
      if (this.order.order_type === 1) {
        // 如果是下载文档，则跳转下载
        this.downloadDocument()
      } else {
        // 刷新当前页面
        location.reload()
      }
    },
    // 支付完成
    async donePayment() {
      await this.getOrderStatus()
      if (this.order.status === 2) {
        this.execAfterPaid()
      }
      this.payCheckVisible = false
    },
    async getOrderStatus() {
      const res = await getOrderStatus({ order_no: this.order.order_no })
      if (res.status === 200) {
        this.order = res.data || {}
      } else {
        this.$message.error(res.data.message)
      }
    },
    // 关闭订单
    async closeOrder() {
      const res = await closeOrder({ order_no: this.order.order_no })
      if (res.status === 200) {
        this.$message.success('订单关闭成功')
        this.order = res.data || {}
      } else {
        this.$message.error(res.data.message || '关闭订单失败')
      }
    },
    onBridgeReady(paydata) {
      if (typeof WeixinJSBridge === 'undefined') {
        if (document.addEventListener) {
          document.addEventListener(
            'WeixinJSBridgeReady',
            this.onBridgeReady,
            false
          )
        } else if (document.attachEvent) {
          document.attachEvent('WeixinJSBridgeReady', this.onBridgeReady)
          document.attachEvent('onWeixinJSBridgeReady', this.onBridgeReady)
        }
      }

      WeixinJSBridge.invoke('getBrandWCPayRequest', paydata, (res) => {
        if (res.err_msg === 'get_brand_wcpay_request:ok') {
          this.$message.success('支付成功')
          this.execAfterPaid()
          // } else {
          //   // 支付失败
          //   this.$message.error('支付失败' + res.err_msg)
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.payment-type {
  img {
    width: 32px;
    height: 32px;
    float: right;
    user-select: none;
    margin-top: -8px;
    margin-left: 5px;
  }
  .payment-type-radio {
    height: 50px;
    padding-top: 16px;
    padding-right: 10px;
    margin-bottom: 20px;
    margin-left: 0 !important;
    margin-right: 10px;
  }
  .el-link {
    font-size: 12px;
  }
}

.price {
  position: relative;
  top: -2px;
}
.btn-disabled {
  cursor: auto !important;
  .el-link {
    cursor: auto;
  }
  opacity: 1;
}

.downcode-tips {
  border: 1px dashed #f60;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  font-size: 14px;
}

.downcode {
  width: 200px;
  max-width: 100%;
}

.mgb-20px {
  margin-bottom: 20px;
}

.count-down {
  position: relative;
  top: -2px;
}

.actual-pay {
  font-size: 1.3em;
}
.tips {
  line-height: 200%;
  color: #666;
  small {
    color: #888;
  }
}
#qrcode {
  width: 160px;
  height: 160px;
  margin: 0 auto 10px;
}
.order-action {
  margin-top: -10px;
  float: right;
  margin-left: 10px;
}
</style>
