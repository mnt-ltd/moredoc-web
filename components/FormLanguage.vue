<template>
  <div class="com-form-language">
    <el-form
      ref="formLanguage"
      label-position="top"
      label-width="80px"
      :model="language"
    >
      <el-form-item
        label="语言名称"
        prop="language"
        :rules="[
          { required: true, trigger: 'blur', message: '请输入语言名称' },
        ]"
      >
        <el-input
          v-model="language.language"
          placeholder="请输入语言名称，如：中文(简体)"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item
        label="语言代码"
        prop="code"
        :rules="[
          {
            required: true,
            trigger: 'blur',
            message: '请输入语言代码',
          },
          {
            //最大 8个字符长度
            max: 8,
            message: '最大8个字符长度',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="language.code"
          placeholder="请输入语言代码，如：zh-CN。建议遵循相应ISO标准"
          :disabled="language.id > 0"
          clearable
        ></el-input>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序(值越大越靠前)">
            <el-input-number
              v-model.number="language.sort"
              clearable
              :min="0"
              :step="1"
              placeholder="请输入排序值"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否启用">
            <el-switch
              v-model="language.enable"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch> </el-form-item
        ></el-col>
      </el-row>
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
import { createLanguage, updateLanguage } from '~/api/language'
export default {
  name: 'FormLanguage',
  props: {
    initLanguage: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      loading: false,
      language: {},
    }
  },
  watch: {
    initLanguage: {
      handler(val) {
        this.language = { ...val }
      },
      immediate: true,
    },
  },
  created() {
    this.language = { ...this.initLanguage }
  },
  methods: {
    onSubmit() {
      this.$refs.formLanguage.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.loading = true
        const language = { ...this.language }
        if (this.language.id > 0) {
          const res = await updateLanguage(language)
          if (res.status === 200) {
            this.$message.success('修改成功')
            this.resetFields()
            this.$emit('success', res.data)
          } else {
            this.$message.error(res.data.message)
          }
        } else {
          const res = await createLanguage(language)
          if (res.status === 200) {
            this.$message.success('新增成功')
            this.resetFields()
            this.$emit('success', res.data)
          } else {
            this.$message.error(res.data.message)
          }
        }
        this.loading = false
      })
    },
    clearValidate() {
      this.$refs.formLanguage.clearValidate()
    },
    resetFields() {
      this.language = {
        id: 0,
        language: '',
        code: '',
        sort: 0,
        enable: true,
      }
    },
    reset() {
      this.resetFields()
      this.clearValidate()
    },
  },
}
</script>
