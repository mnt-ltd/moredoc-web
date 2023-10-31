<template>
  <el-card shadow="never">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane
        v-for="item in categories"
        :key="'category-' + item.value"
        :label="item.label"
        :name="item.value"
      >
      </el-tab-pane>
    </el-tabs>
    <div
      v-if="
        activeName == 'pay' &&
        (subActiveName == 'xunhupay' ||
          subActiveName == 'alipay' ||
          subActiveName == 'wechatpay')
      "
    >
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
        </ul>
      </el-alert>

      <el-tabs v-model="subActiveName" @tab-click="subHandleClick">
        <el-tab-pane
          v-for="item in subCategories"
          :key="'sub-category-' + item.value"
          :label="item.label"
          :name="item.value"
        >
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-row v-if="activeName === 'sms'" :gutter="20">
      <el-col :span="10">
        <FormConfig
          ref="sms"
          :init-configs="configs"
          @change="onChange"
          :show-button="false"
        />
      </el-col>
      <el-col :span="14">
        <FormConfig
          :showMessage="false"
          @onSuccess="onSMSConfigSuccess"
          v-if="activeName === 'sms'"
          :init-configs="subConfigs"
        />
      </el-col>
    </el-row>
    <FormConfig v-else :init-configs="configs" @change="onChange" />
    <el-alert
      v-if="activeName == 'converter'"
      title="同时启用GZIP和SVGO，相对直接的SVG文件，总体可以节省85%左右的存储空间。（启用SVGO，需要全局安装node.js的SVGO模块）"
      type="info"
      :closable="false"
      show-icon
    >
    </el-alert>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { listConfig } from '~/api/config'
import FormConfig from '~/components/FormConfig.vue'
export default {
  components: { FormConfig },
  layout: 'admin',
  data() {
    return {
      activeName: 'system',
      subActiveName: 'wechatpay',
      configs: [],
      subConfigs: [],
      categories: [
        {
          label: '系统配置',
          value: 'system',
        },
        {
          label: '支付配置',
          value: 'pay',
        },
        {
          label: '小程序配置',
          value: 'mp',
        },
        {
          label: 'VIP配置',
          value: 'vip',
        },
        {
          label: '短信配置',
          value: 'sms',
        },
        {
          label: '展示配置',
          value: 'display',
        },
        {
          label: '底链配置',
          value: 'footer',
        },
        {
          label: '验证码配置',
          value: 'captcha',
        },
        {
          label: '安全配置',
          value: 'security',
        },
        {
          label: '转换配置',
          value: 'converter',
        },
        {
          label: '下载配置',
          value: 'download',
        },
        {
          label: '积分配置',
          value: 'score',
        },
        {
          label: '邮箱配置',
          value: 'email',
        },
      ],
      subCategories: [
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
    }
  },
  head() {
    return {
      title: `系统设置 - ${this.settings.system.sitename}`,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  watch: {
    '$route.query': {
      handler() {
        this.activeName = this.$route.query.tab || 'system'
        this.loadConfig()
      },
      immediate: true,
    },
  },
  methods: {
    handleClick(tab) {
      this.activeName = tab.name
      this.$router.push({
        query: {
          tab: tab.name,
        },
      })
    },
    subHandleClick(tab) {
      this.subActiveName = tab.name
      this.loadConfig(tab.name)
    },
    async loadConfig(tabname) {
      let activeTab = tabname
      if (activeTab === undefined && this.activeName === 'pay') {
        // 默认
        activeTab = 'wechatpay'
      } else if (this.activeName !== 'pay') {
        activeTab = this.activeName
      }

      const res = await listConfig({ category: [activeTab] })
      if (res.status === 200) {
        this.configs = res.data.config || []
        if (this.activeName === 'sms') {
          this.configs.map((item) => {
            if (item.name === 'sms_provider') {
              this.loadSubConfigs(item.value)
            }
          })
        }
      } else {
        this.configs = []
        this.$message.error(res.data.message)
      }
    },
    async onChange(item) {
      if (this.activeName === 'sms') {
        this.loadSubConfigs(item.value)
      }
    },
    async onSMSConfigSuccess(res) {
      console.log('onSMSConfigSuccess', res, this.$refs.sms)
      this.$nextTick(() => {
        this.$refs.sms.onSubmit()
      })
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
