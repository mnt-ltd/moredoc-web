<template>
    <el-card shadow="never">
      <div
        style="margin-bottom: 10px;"
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
            <li>当前支付的回调地址是：<span class="text-danger">{{ location.origin }}/callback/{{ subActiveName }}</span></li>
          </ul>
        </el-alert>
      </div>
      <el-tabs v-if="subActiveName && subCategories" type="card" v-model="subActiveName" @tab-click="subTabClick">
        <el-tab-pane
          v-for="item in subCategories"
          :key="'sub-category-' + item.value"
          :label="item.label"
          :name="item.value"
        >
        </el-tab-pane>
      </el-tabs>
      <FormConfig :init-configs="configs"/>
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
      async loadConfig(tabname) {
        let activeTab = tabname
        let subCategories = []
        this.categories.map(item=>{
          if(item.value === this.activeName){
            subCategories = item.children || []
          }
        })
        this.subCategories = subCategories
        if(subCategories.length>0 && this.subActiveName===''){
          activeTab = subCategories[0].value
          this.subActiveName=activeTab
        }
  
        console.log('loadConfig', activeTab, this.activeName, subCategories)
  
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