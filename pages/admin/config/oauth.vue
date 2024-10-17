<template>
  <el-card shadow="never">
    <el-alert title="Oauth配置提示" type="success" class="oauth-tips">
      <div>
        当前Oauth的回调地址是：{{ location.origin }}/oauth/{{ oauthType }}
      </div>
      <div>
        公众号Token验证 URL地址：
        {{ location.origin }}/api/v1/oauth/officialaccount/token
      </div>
    </el-alert>
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
        <el-alert
          v-if="item.apply"
          title="Oauth登录申请"
          type="warning"
          class="oauth-tips"
        >
          <a
            :href="item.apply"
            target="_blank"
            class="el-link el-link--primary"
            >{{ item.apply }}</a
          >
        </el-alert>
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
              apply: 'https://open.weixin.qq.com/',
            },
            {
              label: '微信公众号',
              value: 'oauthOfficialAccount',
              apply: 'https://mp.weixin.qq.com/',
            },
            {
              label: 'QQ登录',
              value: 'oauthQQ',
              apply: 'https://connect.qq.com/manage.html#/',
            },
            {
              label: '谷歌登录',
              value: 'oauthGoogle',
              apply: 'https://console.developers.google.com/',
            },
            {
              label: 'Github登录',
              value: 'oauthGithub',
              apply: 'https://github.com/settings/apps/new',
            },
            {
              label: 'Gitee登录',
              value: 'oauthGitee',
              apply: 'https://gitee.com/oauth/applications',
            },
            {
              label: '自定义Oauth',
              value: 'oauthCustom',
            },
          ],
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
    oauthType() {
      return this.subActiveName.toLocaleLowerCase().replace('oauth', '')
    },
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
      this.subActiveName = ''
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

      console.log('loadConfig', activeTab, this.activeName, subCategories)

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
    onChange(item) {
      if (this.activeName === 'sms') {
        this.loadSubConfigs(item.value)
      }
    },
    onSMSConfigSuccess(res) {
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
