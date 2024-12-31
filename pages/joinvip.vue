<template>
  <div
    v-if="settings.vip.enable"
    class="page page-joinvip"
    style="margin-bottom: -20px"
  >
    <el-row :gutter="20">
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col :sm="8" :xs="24">
            <el-card
              :shadow="vip === 0 ? '' : 'hover'"
              :class="vip === 0 ? 'active' : ''"
              class="vip-card"
              @click.native="selectVIP(0)"
            >
              <div slot="header">年卡VIP</div>
              <div class="price">
                <div>
                  <small>¥</small>
                  {{ ((settings.vip.year_price || 0) / 100).toFixed(2) }}
                  <small>元</small>
                </div>
                <del
                  >¥
                  {{
                    ((settings.vip.year_original_price || 0) / 100).toFixed(2)
                  }}</del
                >
              </div>
              <div class="diff">
                <div>
                  <i class="el-icon-caret-right"></i> 文档购买折扣：<span>{{
                    ((settings.vip.year_document_discount || 0) / 10).toFixed(1)
                  }}</span>
                  折
                </div>
                <div>
                  <i class="el-icon-caret-right"></i> VIP专享免费下载：
                  <span>{{ settings.vip.year_download || 0 }}</span>
                  次/月
                </div>
                <div>
                  <i class="el-icon-caret-right"></i> 整站文档下载频次：
                  <span>{{ settings.vip.year_times_every_day || '不限' }}</span>
                  次/天
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :sm="8" :xs="24">
            <el-card
              :shadow="vip === 1 ? '' : 'hover'"
              :class="vip === 1 ? 'active' : ''"
              class="vip-card"
              @click.native="selectVIP(1)"
            >
              <div slot="header">季卡VIP</div>
              <div class="price">
                <div>
                  <small>¥</small>
                  {{ ((settings.vip.quarter_price || 0) / 100).toFixed(2) }}
                  <small>元</small>
                </div>
                <del
                  >¥
                  {{
                    ((settings.vip.quarter_original_price || 0) / 100).toFixed(
                      2
                    )
                  }}</del
                >
              </div>
              <div class="diff">
                <div>
                  <i class="el-icon-caret-right"></i> 文档购买折扣：<span>{{
                    (
                      (settings.vip.quarter_document_discount || 0) / 10
                    ).toFixed(1)
                  }}</span>
                  折
                </div>
                <div>
                  <i class="el-icon-caret-right"></i> VIP专享免费下载：
                  <span>{{ settings.vip.quarter_download || 0 }}</span>
                  次/月
                </div>
                <div>
                  <i class="el-icon-caret-right"></i> 整站文档下载频次：
                  <span>{{
                    settings.vip.quarter_times_every_day || '不限'
                  }}</span>
                  次/天
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8" :xs="24">
            <el-card
              :shadow="vip === 2 ? '' : 'hover'"
              :class="vip === 2 ? 'active' : ''"
              class="vip-card"
              @click.native="selectVIP(2)"
            >
              <div slot="header">月卡VIP</div>
              <div class="price">
                <div>
                  <small>¥</small>
                  {{ ((settings.vip.month_price || 0) / 100).toFixed(2) }}
                  <small>元</small>
                </div>
                <del
                  >¥
                  {{
                    ((settings.vip.month_original_price || 0) / 100).toFixed(2)
                  }}</del
                >
              </div>
              <div class="diff">
                <div>
                  <i class="el-icon-caret-right"></i> 文档购买折扣：<span>{{
                    ((settings.vip.month_document_discount || 0) / 10).toFixed(
                      1
                    )
                  }}</span>
                  折
                </div>
                <div>
                  <i class="el-icon-caret-right"></i> VIP专享免费下载：
                  <span>{{ settings.vip.month_download || 0 }}</span>
                  次/月
                </div>
                <div>
                  <i class="el-icon-caret-right"></i> 整站文档下载频次：
                  <span>{{
                    settings.vip.month_times_every_day || '不限'
                  }}</span>
                  次/天
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row class="rights">
          <el-col :span="24">
            <el-card shadow="never">
              <div slot="header">权益</div>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="6">
                  <div class="item">
                    <div class="icon"><i class="el-icon-download"></i></div>
                    <div class="rights-item">
                      <strong>VIP文档</strong>
                      <small> 专享免费下载</small>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="6">
                  <div class="item">
                    <div class="icon"><i class="el-icon-s-check"></i></div>
                    <div class="rights-item">
                      <strong>身份标识</strong>
                      <small> 头像标记，彰显尊贵 </small>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="6">
                  <div class="item">
                    <div class="icon"><i class="el-icon-s-ticket"></i></div>
                    <div class="rights-item">
                      <strong>文档折扣</strong>
                      <small> 非VIP文档，享折扣优惠 </small>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="6">
                  <div class="item">
                    <div class="icon"><i class="el-icon-s-release"></i></div>
                    <div class="rights-item">
                      <strong>去广告</strong>
                      <small> 清爽体验，不受广告干扰 </small>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
          <el-col :sm="16" class="hidden-xs-only"> &nbsp; </el-col>
          <el-col :sm="8" :xs="24">
            <el-button
              class="btn-block mgt-20px"
              icon="el-icon-shopping-cart-full"
              type="warning"
              :loading="loading"
              @click="buyVIP"
              >立即购买</el-button
            >
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24">
        <el-card shadow="never" class="mgt-20px">
          <div slot="header">补充说明</div>
          <div class="content">
            <p>1. 本站VIP会员服务，购买后不支持<strong>退款</strong>。</p>
            <p>2. VIP用户每月可免费下载VIP特享文档。</p>
            <p>3. VIP用户通过下载免费的VIP文档不消耗VIP下载专享额度。</p>
            <p>
              4.
              已购买过的文档，在购买有效期内再次下载，不消耗积分和VIP专享下载额度。
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { createOrder } from '~/api/order'
import { orderTypeBuyVIP } from '~/utils/enum'
export default {
  name: 'JoinVip',
  data() {
    return {
      vip: 0,
      loading: false,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {
    if (!this.settings.vip.enable) {
      this.$router.replace('/me')
    }
  },
  methods: {
    selectVIP(vip) {
      this.vip = vip
    },
    async buyVIP() {
      this.loading = true
      // 创建购买VIP订单
      const res = await createOrder({
        order_type: orderTypeBuyVIP,
        product_id: this.vip, // 0 年卡，1 季卡，2 月卡
      })
      console.log(res)
      // 跳转到支付页面
      if (res.status === 200) {
        // 订单状态为待支付，跳转到支付页面
        if (res.data.status === 1) {
          this.$router.push({
            name: 'order',
            query: {
              order_no: res.data.order_no,
            },
          })
        }
      } else {
        this.$message.error(res.data.message)
      }
      this.loading = false
    },
  },
}
</script>
<style lang="scss">
.page-joinvip {
  width: 100%;
  margin-top: -20px;
  padding-top: 20px;
  background-color: #fff9e8;
  background-image: linear-gradient(183deg, #fff9e8 3%, #f5f5f5);
  min-height: calc(100vh - 60px - 240px - 20px - 20px);
  & > .el-row {
    width: $default-width;
    max-width: $max-width;
    margin: 20px auto !important;
  }
  .el-card {
    margin-bottom: 20px;
  }
  .vip-card {
    cursor: pointer;
    &.active {
      box-shadow: 0 2px 12px 0 #f7a46dc2;
      .el-card__header {
        background-color: #f7a46d;
        color: #fff;
        &::after {
          border-color: #fff;
          font-family: element-icons !important;
          content: '\e6da';
          float: right;
          font-size: 40px;
          /* vertical-align: baseline; */
          margin-top: -32px;
        }
      }
    }
    .el-card__body {
      text-align: center;
      line-height: 180%;
      .price {
        font-size: 36px;
        font-weight: bold;
        small {
          font-size: 24px;
        }
        del {
          font-size: 22px;
          color: #bbb;
          font-weight: 200;
        }
      }
      .diff {
        text-align: left;
        border-top: 1px solid #f1f2f3;
        margin-top: 10px;
        padding-top: 10px;
        font-size: 14px;
        margin-bottom: -10px;
        span {
          font-size: 1.3em;
        }
      }
    }
  }
  .rights {
    margin-top: 20px;
    .el-card__body {
      padding-bottom: 0;
    }
    .item {
      border: 1px solid rgba(247, 164, 109, 0.253);
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
      .icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: rgb(247, 164, 109);
        line-height: 50px;
        text-align: center;
        color: #fff;
        font-size: 1.5em;
        display: inline-block;
      }
      display: flex;
      .rights-item {
        margin-left: 10px;
        strong {
          font-size: 1.2em;
          display: block;
        }
        small {
          font-size: 0.8em;
          color: #999;
        }
      }
    }
  }
  .el-button.btn-block {
    padding: 15px 20px;
  }
}
</style>
