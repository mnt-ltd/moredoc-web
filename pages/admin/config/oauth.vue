<template>
    <el-card shadow="never">
      <el-alert title="Oauth配置提示" type="success" class="oauth-tips">
        当前Oauth的回调地址是：{{ location.origin }}/oauth/{{ oauthType }}
      </el-alert>
      <el-tabs v-if="subActiveName && subCategories" type="card" v-model="subActiveName" @tab-click="subTabClick">
        <el-tab-pane
          v-for="item in subCategories"
          :key="'sub-category-' + item.value"
          :label="item.label"
          :name="item.value"
        >
        </el-tab-pane>
      </el-tabs>
      <FormConfig :init-configs="configs" @change="onChange" />
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
        activeName: 'oauth',
        subActiveName: '',
        location: window.location,
        subCategories: [],
        configs: [],
        subConfigs: [],
        categories: [
          {
            label: 'Oauth配置',
            value: 'oauth',
            children: [
              {
                label: '微信登录',
                value: 'oauthWechat',
              },
              {
                label: 'QQ登录',
                value: 'oauthQQ',
              },
              {
                label: '谷歌登录',
                value: 'oauthGoogle',
              },
              {
                label: 'Github登录',
                value: 'oauthGithub',
              },
              {
                label: 'Gitee登录',
                value: 'oauthGitee',
              },
              {
                label: '自定义Oauth',
                value: 'oauthCustom',
              },
              // {
              //   label: '微博登录',
              //   value: 'oauthWeibo',
              // },
              // {
              //   label: '飞书登录',
              //   value: 'oauthFeishu',
              // },
              // {
              //   label: '钉钉登录',
              //   value: 'oauthDingtalk',
              // },
              // {
              //   label: '企业微信登录',
              //   value: 'oauthWechatEnterprise',
              // },
            ]
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
      oauthType(){
        return this.subActiveName.toLocaleLowerCase().replace('oauth','')
      }
    },
    watch: {
      '$route.query': {
        handler() {
          this.activeName = this.$route.query.tab || 'oauth'
          this.loadConfig(this.activeName)
        },
        immediate: true,
      },
    },
    methods: {
      tabClick(tab) {
        this.activeName = tab.name
        this.subActiveName=''
        this.subCategories = []
        this.$router.push({
          query: {
            tab: tab.name,
          },
        })
      },
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
          if (this.activeName==='sms'){
              this.configs.map((item) => {
                if (item.name === 'sms_provider') {
                  this.loadSubConfigs(item.value)
                }
              })
          }else{
  
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
  <style lang="scss" scoped>
  .oauth-tips {
    margin-bottom: 10px;
  }
  </style>