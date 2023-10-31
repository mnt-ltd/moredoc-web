<template>
  <div class="com-form-spiderurl">
    <el-form
      ref="formSpiderUrl"
      label-position="top"
      label-width="80px"
      :model="spiderurl"
    >
      <el-form-item label="采集链接">
        <el-input
          v-model="spiderurl.url"
          :type="spiderurl.id > 0 ? 'text' : 'textarea'"
          rows="8"
          :disabled="spiderurl.id > 0"
          :placeholder="
            spiderurl.id > 0
              ? ''
              : '请输入链接地址，支持文档链接和网页链接。多个链接请换行，每行一个'
          "
        ></el-input>
      </el-form-item>
      <el-form-item label="状态" v-if="spiderurl.id > 0">
        <el-select v-model="spiderurl.status" placeholder="请选择状态">
          <el-option
            v-for="item in spiderUrlStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
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
import { spiderUrlStatusOptions } from '~/utils/enum'
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
  },
  data() {
    return {
      loading: false,
      spiderurl: {
        id: 0,
        url: '',
        status: 0,
      },
      spiderUrlStatusOptions,
    }
  },
  watch: {
    initSpiderUrl: {
      handler(val) {
        this.spiderurl = { status: 0, ...val }
      },
      immediate: true,
    },
  },
  created() {
    this.spiderurl = { ...this.initSpiderUrl }
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
        const res = await createSpiderUrl({ url: spiderurl.url.split('\n') })
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
