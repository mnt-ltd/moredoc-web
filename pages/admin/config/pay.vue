<template>
  <el-card shadow="never">
    <div style="margin-bottom: 10px">
      <el-alert title="重要配置提示" type="warning" :closable="false" show-icon>
        <ul>
          <li>
            请务必填写【系统设置】->【<nuxt-link
              class="el-link el-link--primary"
              to="?tab=system"
              >系统配置</nuxt-link
            >】->【网站域名】，否则支付回调无法正常更新订单支付状态。
          </li>
          <li>
            请配置【系统设置】->【<nuxt-link
              class="el-link el-link--primary"
              to="?tab=score"
              >积分配置</nuxt-link
            >】->【人民币兑积分】，以确定人民币与积分的兑换比率。
          </li>
          <li>
            请配置【系统设置】->【<nuxt-link
              class="el-link el-link--primary"
              to="?tab=security"
              >安全配置</nuxt-link
            >】->【待支付超时关闭】，以确定待支付订单超时多长时间自动关闭。
          </li>
          <li>
            当前支付的回调地址是：<span class="text-danger"
              >{{ location.origin }}/callback/{{ subActiveName }}</span
            >
          </li>
          <li v-if="subActiveName == 'wechatpay'">
            <strong style="font-size: 1.2em; color: red"
              >如果需要用户可以在微信内支付，则请配置微信公众号登录！在 系统配置
              -> Oauth配置 -> 微信公众号 进行配置！</strong
            >
          </li>
        </ul>
      </el-alert>
    </div>
    <el-tabs
      v-if="subActiveName && subCategories"
      v-model="subActiveName"
      type="card"
      @tab-click="subTabClick"
    >
      <el-tab-pane
        v-for="item in subCategories"
        :key="'sub-category-' + item.value"
        :label="item.label"
        :name="item.value"
      >
      </el-tab-pane>
    </el-tabs>
    <FormConfig :init-configs="configs">
      <template v-if="subActiveName == 'wechatpay'" slot="buttons">
        <el-button
          type="success"
          icon="el-icon-refresh"
          @click="getWechatPayCert"
          >获取平台证书</el-button
        >
      </template>
    </FormConfig>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { listConfig, getWechatPayCert } from '~/api/config'
import FormConfig from '~/components/FormConfig.vue'
export default {
  components: { FormConfig },
  layout: 'admin',
  data() {
    return {
      activeName: 'system',
      subActiveName: '',
      location: window.location,
      subCategories: [],
      configs: [],
      subConfigs: [],
      categories: [
        {
          label: '支付配置',
          value: 'pay',
          children: [
            {
              label: '微信支付',
              value: 'wechatpay',
            },
            {
              label: '支付宝支付',
              value: 'alipay',
            },
            {
              label: '虎皮椒支付',
              value: 'xunhupay',
            },
          ],
        },
      ],
    }
  },
  head() {
    return {
      title: `支付配置 - ${this.settings.system.sitename}`,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  watch: {
    '$route.query': {
      handler() {
        this.activeName = this.$route.query.tab || 'pay'
        this.loadConfig(this.activeName)
      },
      immediate: true,
    },
  },
  methods: {
    subTabClick(tab) {
      this.subActiveName = tab.name
      this.loadConfig(tab.name)
    },
    async getWechatPayCert() {
      const res = await getWechatPayCert()
      if (res.status === 200) {
        const configs = []
        this.configs.map((item) => {
          // 注意：value值类型全都是字符串，所以提交上去的value值也要转换成字符串
          if (item.name == 'platform_cert') {
            item.value = res.data.cert || ''
          }
          configs.push(item)
        })
        this.configs = configs

        this.$alert(
          '微信支付平台证书获取成功，请点击【保存设置】按钮保存配置',
          '提示',
          {
            confirmButtonText: '知道了',
            callback: () => {},
          }
        )
        return
      }
      this.$message.error(res.data.message || '获取失败')
    },
    async loadConfig(tabname) {
      let activeTab = tabname
      let subCategories = []
      this.categories.map((item) => {
        if (item.value === this.activeName) {
          subCategories = item.children || []
        }
      })
      this.subCategories = subCategories
      if (subCategories.length > 0 && this.subActiveName === '') {
        activeTab = subCategories[0].value
        this.subActiveName = activeTab
      }

      const res = await listConfig({ category: [activeTab] })
      if (res.status === 200) {
        this.configs = res.data.config || []
      } else {
        this.configs = []
        this.$message.error(res.data.message)
      }
    },
    async loadSubConfigs(category) {
      const res = await listConfig({ category: [category] })
      if (res.status === 200) {
        this.subConfigs = res.data.config || []
      } else {
        this.subConfigs = []
        this.$message.error(res.data.message)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.oauth-tips {
  margin-bottom: 10px;
}
</style>
