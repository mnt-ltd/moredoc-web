<template>
  <el-card v-loading="loading" shadow="never">
    <FormConfig v-if="configs.length > 0" :init-configs="configs">
      <template slot="buttons">
        <!-- <el-button
          type="primary"
          icon="el-icon-refresh"
          :loading="testing"
          @click="updateDocumentIndexes"
          >更新全量全文索引</el-button
        > -->
        <el-alert class="mgt-20px" type="warning" show-icon :closeable="false">
          <div slot="title">
            变更全文搜索引擎之后，务必在当前 管理后台 ->
            <nuxt-link
              to="/admin/dashboard"
              style="font-size: 12px; vertical-align: middle; margin-top: -2px"
              class="el-link el-link--primary"
              >面板</nuxt-link
            >
            数据统计右侧分别更新全文索引。
          </div>
        </el-alert>
      </template>
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
