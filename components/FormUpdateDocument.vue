<template>
  <div class="com-form-update-document">
    <el-form
      ref="document"
      label-position="top"
      label-width="80px"
      :model="document"
    >
      <el-row :gutter="20">
        <el-col :span="14">
          <el-form-item
            label="名称"
            prop="title"
            :rules="[
              { required: true, message: '请输入文档名称', trigger: 'blur' },
            ]"
          >
            <el-input
              v-model="document.title"
              type="textarea"
              :rows="3"
              placeholder="请输入文档名称"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-upload
            ref="upload"
            v-loading="uploading"
            drag
            :action="'/api/v1/upload/document'"
            :headers="{ authorization: `bearer ${token}` }"
            :show-file-list="true"
            :auto-upload="true"
            :on-change="onChange"
            :before-upload="beforeUpload"
            :on-remove="onRemove"
            :disabled="loading"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              如需变更文档源文件，请将文件拖到此处，或<em>点击上传</em>
            </div>
          </el-upload>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12" :xs="24">
          <el-form-item
            label="分类"
            prop="category_id"
            :rules="[
              { required: true, trigger: 'blur', message: '请选择文档分类' },
            ]"
          >
            <el-cascader
              v-model="document.category_id"
              :options="categoryTrees.filter((item) => !item.type)"
              :filterable="true"
              :props="{
                checkStrictly: true,
                expandTrigger: 'hover',
                label: 'title',
                value: 'id',
              }"
              clearable
              placeholder="请选择文档分类"
            ></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12" :xs="24">
          <el-form-item
            :label="`价格(${settings.system.credit_name || '魔豆'})`"
            prop="price"
          >
            <el-input-number
              v-model.number="document.price"
              placeholder="文档价格"
              clearable
              :min="0"
              :step="1"
            ></el-input-number> </el-form-item
        ></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col v-if="settings.vip.enable" :span="12">
          <!-- 是否是VIP文档 -->
          <el-form-item label="VIP文档" prop="is_vip">
            <el-switch
              v-model="document.is_vip"
              active-color="#13ce66"
              inactive-color="#ff4949"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col v-if="isAdmin" :span="12">
          <el-form-item
            label="状态"
            prop="status"
            :rules="[
              { required: true, message: '请选择文档状态', trigger: 'change' },
            ]"
          >
            <el-select
              v-model="document.status"
              filterable
              placeholder="请选择文档状态"
            >
              <el-option
                v-for="item in documentStatusOptions"
                :key="'status-' + item.value"
                :value="item.value"
                :label="item.label"
                :disabled="item.disabled"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="语言" prop="language">
            <el-select
              v-model="document.language"
              filterable
              clearable
              placeholder="请选择文档语言"
            >
              <el-option
                v-for="item in settings.language || []"
                :key="'language-' + item.code"
                :value="item.code"
                :label="item.language"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="关键字">
        <el-input
          v-model="document.keywords"
          placeholder="请输入文档关键字，多个关键字用英文逗号分隔"
        ></el-input>
      </el-form-item>
      <el-form-item label="摘要">
        <el-input
          v-model="document.description"
          placeholder="请输入文档摘要"
          type="textarea"
          rows="4 "
        ></el-input>
      </el-form-item>
      <el-form-item
        label="文档文本内容(一般无需编辑，当文档文本乱码时可以在此编辑修正)"
      >
        <el-input
          v-model="document.content"
          placeholder="请输入文档文本内容"
          type="textarea"
          rows="8"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          :loading="loading"
          @click="setDocument"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { updateDocument, getDocument } from '~/api/document'
import { documentStatusOptions } from '~/utils/enum'
export default {
  name: 'FormUpdateDocument',
  props: {
    // 是否是管理员。如果是管理员，则可以更新文档的状态，如禁用等
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // 文档分类
    categoryTrees: {
      type: Array,
      default: () => {
        return []
      },
    },
    initDocument: {
      type: Object,
      default: () => {
        return this.getInitialDocumentData()
      },
    },
  },
  data() {
    return {
      documentStatusOptions,
      loading: false,
      uploading: false,
      document: this.getInitialDocumentData(),
      attachment: {
        id: 0,
      },
      allowExt: [
        '.doc',
        '.docx',
        '.rtf',
        '.wps',
        '.odt',
        '.dot',
        '.ppt',
        '.pptx',
        '.pps',
        '.ppsx',
        '.dps',
        '.odp',
        '.pot',
        '.xls',
        '.xlsx',
        '.csv',
        '.tsv',
        '.et',
        '.ods',
        '.epub',
        '.umd',
        '.chm',
        '.mobi',
        '.txt',
        '.pdf',
      ],
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    ...mapGetters('user', ['token']),
  },
  watch: {
    initDocument: {
      handler(val) {
        if (val.id) {
          this.getDocument(val.id)
        }
      },
      immediate: true,
    },
  },
  created() {
    this.documentStatusOptions = documentStatusOptions.map((item) => {
      if (item.value === 1) {
        // 转换中 这个状态不能选中
        item.disabled = true
      }
      return item
    })
    this.document = this.initDocument
  },
  methods: {
    getInitialDocumentData() {
      return {
        id: 0,
        title: '',
        keywords: '',
        description: '',
        category_id: [],
        price: 0,
        status: 0,
      }
    },
    reset() {
      this.document = this.getInitialDocumentData()
      this.$refs.document.clearValidate()
    },
    setDocument() {
      this.$refs.document.validate(async (valid) => {
        if (valid) {
          this.loading = true
          const res = await updateDocument(this.document)
          if (res.status === 200) {
            this.$message.success('更新成功')
            this.$emit('success')
          } else {
            this.$message.error(res.data.message || '更新失败')
          }
          this.loading = false
        }
      })
    },
    onChange(file) {
      if (!file.response) {
        this.uploading = true
      } else {
        this.uploading = false
        if (file.response.code === 200) {
          this.attachment.id = file.response.data.id
          try {
            // 只取最后一个文件
            this.$refs.upload.uploadFiles = [file]
          } catch (error) {}
        } else {
          this.$message.error(file.response.message || '上传失败')
        }
      }
    },
    beforeUpload(file) {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      const allowExt =
        this.settings.security.document_allowed_ext || this.allowExt
      console.log(allowExt)
      if (!allowExt.includes(ext)) {
        this.$message.error('不允许上传该类型文件')
        this.uploading = false
        return false
      }
      this.attachment.id = 0
      console.log('beforeUpload', file)
    },
    onRemove(file) {
      this.attachment.id = 0
      console.log('onRemove', file)
    },
    async getDocument(documentId) {
      this.loading = true
      const res = await getDocument({ id: documentId })
      if (res.status === 200) {
        this.document = res.data
      }
      this.loading = false
    },
  },
}
</script>
<style lang="scss">
.com-form-update-document {
  .el-select {
    width: 100%;
  }
  .el-upload-dragger {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    height: 125px;
    .el-icon-upload {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 50px;
    }
    .el-upload__text {
      font-size: 13px;
      color: #888888;
    }
  }
}
</style>
