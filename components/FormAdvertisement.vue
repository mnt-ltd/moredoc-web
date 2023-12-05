<template>
  <div class="com-form-advertisement">
    <el-form
      ref="formAdvertisement"
      label-position="top"
      label-width="80px"
      :model="advertisement"
    >
      <!-- 广告位下拉菜单 -->
      <el-form-item label="广告位" prop="position" :rules="[{ required: true, trigger: 'blur', message: '请选择广告位' }]">
        <el-select v-model="advertisement.position" filterable placeholder="请选择广告投放位置">
          <el-option-group
            v-for="item in advertisementPositions"
            :key="item.value"
            :label="item.label">
            <el-option
              v-for="child in item.children"
              :key="child.value"
              :label="child.label"
              :value="child.value">
            </el-option>
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="18">
          <el-form-item
            label="名称"
            prop="title"
            :rules="[{ required: true, trigger: 'blur', message: '请输入广告名称' }]"
          >
            <el-input
              v-model="advertisement.title"
              placeholder="请输入广告名称"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="是否启用">
            <el-switch
              v-model="advertisement.enable"
              style="display: block"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-text="是"
              inactive-text="否"
            >
          </el-switch> </el-form-item>
        </el-col>
      </el-row>
      <!-- 起止时间 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="advertisement.start_time"
              type="datetime"
              placeholder="请选择开始时间"
              clearable
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="advertisement.end_time"
              type="datetime"
              placeholder="请选择结束时间"
              clearable
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 广告内容代码 -->
      <el-form-item label="广告代码" prop="content" :rules="[{ required: true, trigger: 'blur', message: '请输入广告内容代码' }]">
        <el-input
          v-model="advertisement.content"
          type="textarea"
          rows="5"
          placeholder="请输入广告内容代码"
        ></el-input>
      </el-form-item>
      <el-form-item label="广告备注">
        <el-input
          v-model="advertisement.remark"
          type="textarea"
          rows="3"
          placeholder="请输入广告相关描述或备注"
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
import { createAdvertisement, updateAdvertisement } from '~/api/advertisement'
import { advertisementPositions } from '~/utils/enum'
export default {
  name: 'FormAdvertisement',
  props: {
    initAdvertisement: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      loading: false,
      advertisement: {
        id: 0,
        title: '',
        enable: true,
        content: '',
        remark: '',
        position: '',
        start_time: '',
        end_time: '',
      },
      advertisementPositions,
    }
  },
  watch: {
    initAdvertisement: {
      handler(val) {
        this.advertisement = { ...val }
      },
      immediate: true,
    },
  },
  created() {
    this.advertisement = { ...this.initAdvertisement }
  },
  methods: {
    onSubmit() {
      this.$refs.formAdvertisement.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.loading = true
        const advertisement = { ...this.advertisement }
        if (this.advertisement.id > 0) {
          const res = await updateAdvertisement(advertisement)
          if (res.status === 200) {
            this.$message.success('修改成功')
            this.resetFields()
            this.$emit('success', res.data)
          } else {
            this.$message.error(res.data.message)
          }
        } else {
          const res = await createAdvertisement(advertisement)
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
      this.$refs.formAdvertisement.clearValidate()
    },
    resetFields() {
      this.advertisement = {
        id: 0,
        title: '',
        enable: true,
        content: '',
        remark: '',
        position: '',
        start_time: '',
        end_time: '',
      }
    },
    reset() {
      this.resetFields()
      this.clearValidate()
    },
  },
}
</script>
