<template>
  <div>
    <el-row :gutter="20">
      <el-col
        v-for="(account, idx) in discounts"
        :key="'idx-' + idx"
        :xs="24"
        :sm="12"
        :md="12"
        ><el-badge
          :value="
            account.discount == 1
              ? '无折扣'
              : (account.discount * 10).toFixed(1) + '折'
          "
          class="recharge-item"
          :class="{ 'recharge-item-active': rechargeBox === idx }"
        >
          <div @click="changeBox(idx)">
            <div class="price">
              <i class="el-icon-coin"></i> {{ account.amount }}
              {{ recharge.credit_name || '积分' }}
            </div>
            <div class="discount">
              <del>
                {{
                  (account.amount / (recharge.credit_exchange || 0)).toFixed(2)
                }}
                元
              </del>
              <span>
                {{
                  (
                    (account.amount / (recharge.credit_exchange || 0)) *
                    account.discount
                  ).toFixed(2)
                }}
                元
              </span>
            </div>
            <span class="icon"><i class="el-icon-check"></i></span>
          </div>
        </el-badge>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12">
        <el-badge
          :value="
            customDiscount == 1
              ? '无折扣'
              : (customDiscount * 10).toFixed(1) + '折'
          "
          class="recharge-item recharge-item-custom"
          :class="{
            'recharge-item-active': rechargeBox === discounts.length,
          }"
        >
          <div @click="changeBox(discounts.length)">
            <div class="price">
              自定义
              <el-input-number
                v-model="amount"
                :min="0"
                :step="recharge.credit_exchange"
                controls-position="right"
                size="mini"
                style="position: relative; top: -5px"
              ></el-input-number>
              {{ recharge.credit_name || '积分' }}
            </div>
            <div class="discount" style="margin-top: -2px">
              <del
                >{{
                  (amount / (recharge.credit_exchange || 0)).toFixed(2)
                }}
                元</del
              >
              <span>
                {{
                  (
                    (amount / (recharge.credit_exchange || 0)) *
                    customDiscount
                  ).toFixed(2)
                }}
                元
              </span>
            </div>
            <span class="icon"><i class="el-icon-check"></i></span>
          </div>
        </el-badge>
      </el-col>
      <el-col :xs="24">
        <div class="text-right">
          <el-button
            type="danger"
            icon="el-icon-shopping-cart-full"
            @click="createOrder"
            >立即充值</el-button
          >
        </div>
        <div class="mgt-20px"></div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { orderTypeRecharge } from '~/utils/enum'
import { createOrder } from '~/api/order'
export default {
  name: 'CreditRecharge',
  props: {
    recharge: {
      type: Object,
      default: () => ({
        enable: false,
      }),
      required: true,
    },
  },
  data() {
    return {
      amount: 0,
      rechargeBox: 0,
    }
  },
  head() {
    return {
      title: `积分充值`,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    discounts() {
      try {
        return this.recharge.recharge_discount.split('\n').map((item) => {
          const [amount, discount] = item.split(':')
          return { amount: +amount, discount: +discount }
        })
      } catch (error) {
        return []
      }
    },
    customDiscount() {
      const discounts = this.discounts.map((item) => {
        return this.amount >= item.amount ? item.discount : 1
      })
      // 获取最小的discounts值
      return Math.min(...discounts)
    },
  },
  methods: {
    changeBox(idx) {
      this.rechargeBox = idx
      if (idx < this.discounts.length) {
        this.amount = this.discounts[idx].amount
      }
    },
    async createOrder() {
      const res = await createOrder({
        order_type: orderTypeRecharge, // 积分充值
        quantity:
          this.rechargeBox >= this.discounts.length
            ? this.amount
            : this.discounts[this.rechargeBox].amount,
      })
      if (res.status === 200) {
        this.$emit('success')
        this.$router.push(`/order?order_no=${res.data.order_no}`)
      } else {
        this.$message.error(res.data.message || res.message || '订单创建失败')
      }
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

.recharge-item {
  // 使用flex，一行显示两个
  display: flex;
  // justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-right: 30px;
  border: 1px solid #ebeef5;
  border-radius: 5px;
  cursor: pointer;
  & > div {
    width: 100%;
    padding: 10px;
  }
  &:hover {
    border-color: #409eff;
  }
  .price {
    font-size: 20px;
    i {
      font-size: 24px;
      margin-right: 5px;
    }
  }
  .discount {
    font-size: 14px;
    color: #999;
    display: flex;
    // justify-content: space-between;
    span {
      padding-left: 10px;
      color: red;
    }
  }
  .icon {
    display: none;
  }
}
.recharge-item-active {
  border-color: #409eff;
  .icon {
    display: block;
    color: #67c23a;
    position: absolute;
    bottom: 5px;
    right: 10px;
    font-weight: bold;
    font-size: 1.3em;
  }
}
.recharge-item-custom {
  display: block;
  & > div {
    display: block;
  }
}
</style>
