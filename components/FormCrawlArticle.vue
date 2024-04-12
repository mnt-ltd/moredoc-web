<template>
  <div class="com-form-crawl-article" :class="form.mode === 0 ? 'auto' : ''">
    <el-form :model="form">
      <el-form-item>
        <el-input
          v-model="form.url"
          placeholder="请输入文章链接地址"
          class="input-with-select"
        >
          <el-select
            slot="prepend"
            v-model="form.mode"
            placeholder="请选择文档提取模式"
            @change="setLocalstorage"
          >
            <el-option label="智能提取" :value="0"></el-option>
            <el-option label="自定义" :value="1"></el-option>
          </el-select>
          <el-button
            slot="append"
            :loading="loading"
            icon="el-icon-truck"
            type="primary"
            @click="crawlArticle"
            >采集文章</el-button
          >
        </el-input>
      </el-form-item>
      <el-row v-if="form.mode === 1" :gutter="20">
        <el-col :span="8">
          <el-form-item label="选择器">
            <el-input
              v-model="form.select"
              placeholder="请填写html选择器，多个选择器请换行输入"
              type="textarea"
              :rows="3"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排除器">
            <el-input
              v-model="form.exclude"
              placeholder="请填写html选择器，多个选择器请换行输入"
              type="textarea"
              :rows="3"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="替换">
            <el-input
              v-model="form.replace"
              placeholder="内容替换，格式为：原内容 => 新内容。多个内容的替换请换行输入。"
              type="textarea"
              :rows="3"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import { crawlArticle } from '~/api/article'
export default {
  name: 'FormCrawlArticle',
  data() {
    return {
      loading: false,
      form: {
        url: '',
        mode: 0, // 0: auto, 1: 自定义
        select: '',
        exclude: '',
        replace: '',
      },
    }
  },
  mounted() {
    this.resetFromLocalstorage()
  },
  methods: {
    async crawlArticle() {
      this.loading = true
      const res = await crawlArticle(this.form)
      this.loading = false
      if (res.status !== 200) {
        this.$message.error(res.data.message)
      } else {
        this.$message.success('采集成功')
        this.setLocalstorage()
        this.$emit('success', res.data)
      }
    },
    setLocalstorage() {
      const data = { ...this.form }
      data.url = ''
      localStorage.setItem('crawlarticle', JSON.stringify(data))
    },
    resetFromLocalstorage() {
      const crawlarticle = localStorage.getItem('crawlarticle')
      if (crawlarticle) {
        this.form = { ...this.form, ...JSON.parse(crawlarticle) }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.com-form-crawl-article {
  padding: 20px;
  padding-bottom: 0;
  background-color: #f9f9f9;
  border-radius: 5px;
  &.auto {
    padding-bottom: 1px;
  }
}

:deep(.el-select) {
  .el-input {
    width: 110px;
  }
}
</style>
