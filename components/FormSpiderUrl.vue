<template>
  <div class="com-form-spiderurl">
    <el-form
      ref="formSpiderUrl"
      label-position="top"
      label-width="80px"
      :model="spiderurl"
    >
      <el-form-item label="批量链接">
        <el-input
          v-model="spiderurl.url"
          :type="spiderurl.id > 0 ? 'text' : 'textarea'"
          :rows="5"
          :disabled="spiderurl.id > 0"
          :placeholder="
            spiderurl.id > 0
              ? ''
              : '请输入链接地址，支持文档链接和网页链接。多个链接请换行，每行一个'
          "
        ></el-input>
      </el-form-item>
      <el-row v-if="spiderurl.id > 0" :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="spiderurl.status" placeholder="请选择状态">
              <el-option
                v-for="item in spiderUrlStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select> </el-form-item
        ></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="启用浏览器渲染(针对JS渲染页面)">
            <el-switch
              v-model="spiderurl.enable_browser"
              active-color="#13ce66"
              inactive-color="#ff4949"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="嗅探层级">
            <el-input
              v-model="spiderurl.level"
              :min="0"
              :max="999"
              :step="1"
              type="number"
              controls-position="right"
              placeholder="链接嗅探层级，0表示种子链接"
            ></el-input>
          </el-form-item>
        </el-col>
        <!-- 嗅探频率 -->
        <el-col :span="8">
          <el-form-item label="嗅探频率(天)">
            <el-input
              v-model="spiderurl.frequency"
              :min="0"
              :max="999"
              :step="1"
              type="number"
              controls-position="right"
              placeholder="请输入嗅探频率"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-collapse>
        <el-collapse-item title="链接快筛" name="generator">
          <template slot="title">
            <h3>链接快筛</h3>
          </template>
          <div class="generator-container">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="【推荐】链接前缀">
                  <el-input
                    v-model="spiderurl.url_prefix"
                    placeholder="请输入链接前缀，用于快速筛选链接，只嗅探带有该前缀的链接。多个链接前缀请用换行分隔，取并集。"
                    type="textarea"
                    :rows="5"
                  ></el-input>
                  <div
                    style="
                      line-height: 1;
                      padding: 5px 10px;
                      margin-top: 10px;
                      background: #fff7e6;
                      border: 1px solid #ffe58f;
                      border-radius: 5px;
                    "
                    class="generator-container"
                  >
                    <p>
                      用于快速筛选链接，只嗅探带有该前缀的链接。多个链接前缀，请用换行分隔。
                      比如数据源链接为 https://example.com/download/pdf/xxx.html
                      ，则可以填写前缀：
                    </p>
                    <p>https://example.com/download/pdf</p>
                    <p>https://example.com/pdf/</p>
                    <p>请视资源链接前缀填写。</p>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="排除特定关键字链接">
                  <el-input
                    v-model="spiderurl.exclude_url_keywords"
                    placeholder="请输入需要排除带有特定关键字的链接，如带有#号等关键字的链接。多个关键字请用换行分隔"
                    type="textarea"
                    :rows="3"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="只包含特定关键字链接">
                  <el-input
                    v-model="spiderurl.include_url_keywords"
                    placeholder="请输入只包含带有特定关键字的链接，多个关键字请用换行分隔"
                    type="textarea"
                    :rows="3"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>
      </el-collapse>
      <el-form-item class="mgt-20px">
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          :loading="loading"
          @click="onSubmit"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import {
  spiderUrlStatusOptions,
  searchEngineOptions,
  documentDomainOptions,
} from '~/utils/enum'
import { createSpiderUrl, updateSpiderUrl } from '~/api/spiderurl'
export default {
  name: 'FormSpiderUrl',
  props: {
    initSpiderUrl: {
      type: Object,
      default: () => {
        return {}
      },
    },
    openserpAddr: {
      type: String,
      default: '',
    },
    openserpEngines: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      loading: false,
      loadingDomains: false,
      spiderurl: {
        id: 0,
        url: '',
        status: 0,
        level: 0,
        url_prefix: '',
        exclude_url_keywords: '',
      },
      generator: {
        language: [],
        engine: [],
        domain: [],
        total: 10,
        keyword: '',
        ext: ['pdf'],
      },
      spiderUrlStatusOptions,
      searchEngineOptions,
      documentDomainOptions,
      languages: [],
      domains: [],
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    searchOptions() {
      const options = [...this.searchEngineOptions]
      // 如果配置了 OpenSERP 地址，则添加到搜索引擎选项中
      if (this.openserpAddr && this.openserpAddr.trim()) {
        const addr = this.openserpAddr.trim()
        options.unshift({
          label: 'OpenSERP',
          value: addr,
        })
      }
      return options
    },
  },
  watch: {
    initSpiderUrl: {
      handler(val) {
        this.spiderurl = {
          id: 0,
          url: '',
          status: 0,
          level: 0,
          url_prefix: '',
          exclude_url_keywords: '',
          ...val,
        }
      },
      immediate: true,
    },
  },
  created() {
    this.spiderurl = { ...this.spiderurl, ...this.initSpiderUrl }
  },
  methods: {
    async onSubmit() {
      this.loading = true
      const spiderurl = { url: '', ...this.spiderurl }
      if (this.spiderurl.id > 0) {
        const res = await updateSpiderUrl(spiderurl)
        if (res.status === 200) {
          this.$message.success('修改成功')
          this.resetFields()
          this.$emit('success', res.data)
        } else {
          this.$message.error(res.data.message)
        }
      } else {
        const req = {
          ...spiderurl,
          status: 0,
          url: spiderurl.url.split('\n'),
        }
        delete req.id
        delete req.status
        const res = await createSpiderUrl(req)
        if (res.status === 200) {
          this.$message.success('新增成功')
          this.resetFields()
          this.$emit('success', res.data)
        } else {
          this.$message.error(res.data.message)
        }
      }
      this.loading = false
    },
    clearValidate() {
      this.$refs.formSpiderUrl.clearValidate()
    },
    async searchDomains(wd = '') {
      this.loadingDomains = true
      const res = await listSourceDomain({
        size: 20,
        page: 1,
        wd,
      })
      this.loadingDomains = false
      if (res.data && res.data.sourceDomain) {
        this.domains = res.data.sourceDomain || []
      }
    },
    genLinks() {
      if (this.generator.engine.length === 0) {
        this.$message.error('请选择搜索引擎')
        return
      }

      if (this.generator.ext.length === 0) {
        this.$message.error('请选择文档格式')
        return
      }

      // 提示重新生成会覆盖已有链接
      if (this.spiderurl.url && this.spiderurl.url.trim()) {
        this.$confirm('重新生成会覆盖已有链接，确定要重新生成吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            this.genLinksHandler()
          })
          .catch(() => {})
      } else {
        this.genLinksHandler()
      }
    },
    clearLinks() {
      if (!this.spiderurl.url) {
        return
      }

      // 弹出确认框
      this.$confirm('您确定要清空批量链接里面的链接吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.spiderurl.url = ''
        })
        .catch(() => {})
    },
    resetFields() {
      this.spiderurl = {
        id: 0,
        url: '',
        status: 0,
      }
    },
    reset() {
      this.resetFields()
      this.clearValidate()
    },
  },
}
</script>
<style lang="scss">
.com-form-spiderurl .el-textarea__inner {
  white-space: nowrap;
}
.generator-container {
  padding: 20px;
  border: 1px dashed #f60;
  border-radius: 5px;
}
</style>
