<template>
    <el-card shadow="never">
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
        activeName: 'sms',
        configs: [],
        subConfigs: [],
      }
    },
    head() {
      return {
        title: `短信配置 - ${this.settings.system.sitename}`,
      }
    },
    computed: {
      ...mapGetters('setting', ['settings']),
    },
    created() {
      this.loadConfig()
    },
    methods: {
      tabClick(tab) {
        this.activeName = tab.name
        this.$router.push({
          query: {
            tab: tab.name,
          },
        })
      },
      async loadConfig() {
        const res = await listConfig({ category: [this.activeName] })
        if (res.status === 200) {
          this.configs = res.data.config || []
              this.configs.map((item) => {
                if (item.name === 'sms_provider') {
                  this.loadSubConfigs(item.value)
                }
              })
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