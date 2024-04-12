<template>
  <div class="com-form-group">
    <el-form
      ref="formGroup"
      label-position="top"
      label-width="80px"
      :model="group"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            label="名称"
            prop="title"
            :rules="[
              { required: true, trigger: 'blur', message: '请输入名称' },
            ]"
          >
            <el-input
              v-model="group.title"
              placeholder="请输入名称"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排序(值越大越靠前)">
            <el-input-number
              v-model.number="group.sort"
              clearable
              :min="0"
              :step="1"
              placeholder="请输入排序值"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否为默认用户组">
            <el-switch
              v-model="group.is_default"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="允许上传文档">
            <el-switch
              v-model="group.enable_upload"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文档需要审核">
            <el-switch
              v-model="group.enable_document_review"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否允许评论">
            <el-switch
              v-model="group.enable_comment"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="评论需要审核">
            <el-switch
              v-model="group.enable_comment_approval"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="允许发布文章">
            <el-switch
              v-model="group.enable_article"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文章需要审核">
            <el-switch
              v-model="group.enable_article_approval"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="允许采集文章">
            <el-switch
              v-model="group.enable_article_crawl"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述">
        <el-input
          v-model="group.description"
          type="textarea"
          rows="5"
          placeholder="请输入分组描述"
        ></el-input>
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
import { createGroup, updateGroup } from '~/api/group'
export default {
  name: 'FormGroup',
  props: {
    initGroup: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      loading: false,
      group: {
        sort: 0,
      },
    }
  },
  watch: {
    initGroup: {
      handler(val) {
        if (!val.sort) val.sort = 0
        this.group = val
      },
      immediate: true,
    },
  },
  created() {
    this.group = this.initGroup
    if (!this.initGroup.sort) this.group.sort = 0
  },
  methods: {
    onSubmit() {
      this.$refs.formGroup.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.loading = true
        const group = { ...this.group }
        if (group.id > 0) {
          const res = await updateGroup(group)
          if (res.status === 200) {
            this.$message.success('修改成功')
            this.$emit('success')
          } else {
            this.$message.error(res.data.message)
          }
        } else {
          const res = await createGroup(group)
          if (res.status === 200) {
            this.$message.success('新增成功')
            this.$emit('success')
          } else {
            this.$message.error(res.data.message)
          }
        }
        this.loading = false
      })
    },
  },
}
</script>
