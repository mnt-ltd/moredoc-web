<template>
  <el-card shadow="never" v-loading="loading">
    <FormConfig v-if="configs.length>0" :init-configs="configs" />
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
      activeName: 'email',
      configs: [],
      loading:false,
    }
  },
  head() {
    return {
      title: `邮箱配置 - ${this.settings.system.sitename}`,
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
      this.loading=true
      const res = await listConfig({ category: [this.activeName] })
      if (res.status === 200) {
        this.configs = res.data.config || []
      } else {
        this.configs = []
        this.$message.error(res.data.message)
      }
      this.loading=false
    },
  },
}
</script>
