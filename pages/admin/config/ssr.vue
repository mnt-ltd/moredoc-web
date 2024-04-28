<template>
  <el-card v-loading="loading" shadow="never">
    <el-row :gutter="20">
      <el-col :span="16">
        <FormConfig v-if="configs.length > 0" :init-configs="configs"
      /></el-col>
      <el-col :span="8">
        <div class="tips">
          <h3>SSR说明</h3>
          <p>
            1. SSR
            是为了SEO，方便搜索引擎抓取网站内容，如果您的网站为对内访问，则可以不配置。
          </p>
          <p>
            2. SSR配置是为了方便用户自定义配置，如果您不了解，请勿随意修改。
          </p>
          <p>
            3. SSR 项目地址
            <a href="https://gitee.com/mnt-ltd/morender" target="_blank"
              >https://gitee.com/mnt-ltd/morender</a
            >，安装部署请查看项目文档。
          </p>
          <p>
            4.
            SSR项目的启动，您可以自己使用PM2做守护进程，也可以配置SSR项目在系统中的路径，使用魔豆文库来启动该服务。
          </p>
        </div>
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
      activeName: 'ssr',
      configs: [],
      loading: false,
    }
  },
  head() {
    return {
      title: `SSR配置 - ${this.settings.system.sitename}`,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {
    this.loadConfig()
  },
  methods: {
    async loadConfig() {
      this.loading = true
      const res = await listConfig({ category: [this.activeName] })
      if (res.status === 200) {
        this.configs = res.data.config || []
      } else {
        this.configs = []
        this.$message.error(res.data.message)
      }
      this.loading = false
    },
  },
}
</script>
<style scoped lang="scss">
.tips {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  h3 {
    font-size: 16px;
    margin-bottom: 10px;
  }
  p {
    font-size: 14px;
    margin-bottom: 10px;
  }
  a {
    color: #409eff;
  }
}
</style>
