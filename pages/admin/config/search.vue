<template>
  <el-card v-loading="loading" shadow="never">
    <FormConfig v-if="configs.length > 0" :init-configs="configs">
      <template slot="buttons">
        <el-button
          type="success"
          icon="el-icon-connection"
          :loading="testing"
          @click="TestFulltextSearch"
          >测试连通性</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-refresh"
          :loading="testing"
          @click="updateDocumentIndexes"
          >更新全量全文索引</el-button
        >
      </template>
      <el-alert
        title="变更全文搜索引擎之后，务必重新更新全量全文索引。"
        type="warning"
        show-icon
      >
      </el-alert>
    </FormConfig>
  </el-card>
</template>
<script>
import { mapGetters } from 'vuex'
import { listConfig } from '~/api/config'
import FormConfig from '~/components/FormConfig.vue'
import { updateDocumentIndexes } from '~/api/document'
export default {
  components: { FormConfig },
  layout: 'admin',
  data() {
    return {
      activeName: 'fulltext_search',
      configs: [],
      loading: false,
      testing: false,
      updateIndexLoading: false,
    }
  },
  head() {
    return {
      title: `全文搜索 - ${this.settings.system.sitename}`,
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
    TestFulltextSearch() {
      this.testing = true

      // this.testing = false
    },
    async updateDocumentIndexes() {
      this.updateIndexLoading = true
      const res = await updateDocumentIndexes()
      if (res.status === 200) {
        this.$message.success('提交成功')
        this.updateIndexLoading = false
        return
      }
      this.updateIndexLoading = false
      this.$message.error(res.data.message || '更新失败')
    },
  },
}
</script>
