<template>
  <div class="page page-upload">
    <el-row>
      <el-col :span="24">
        <el-card shadow="never" class="upload-card">
          <!-- 页面头部 -->
          <div slot="header" class="clearfix upload-header">
            <strong>📚 上传文档</strong>
            <div class="upload-steps">
              <el-steps :active="currentStep" size="small" simple>
                <el-step title="配置参数" icon="el-icon-setting"></el-step>
                <el-step title="选择文件" icon="el-icon-upload"></el-step>
                <el-step title="确认上传" icon="el-icon-check"></el-step>
              </el-steps>
            </div>
          </div>

          <!-- 第一步：基础配置 -->
          <div class="upload-section step-config">
            <div class="section-header">
              <h4>📋 基础配置</h4>
              <p class="section-desc">设置文档的基本信息和上传选项</p>
            </div>

            <el-form
              ref="form"
              :model="document"
              label-position="top"
              label-width="80px"
              class="config-form"
            >
              <el-row :gutter="20">
                <el-col :lg="8" :md="12" :sm="24">
                  <el-form-item
                    label="文档分类"
                    prop="category_id"
                    :rules="[
                      {
                        required: true,
                        trigger: 'blur',
                        message: '请选择文档分类',
                      },
                    ]"
                  >
                    <el-cascader
                      v-model="document.category_id"
                      :options="categoryTrees.filter((x) => !x.type)"
                      :filterable="true"
                      :disabled="loading"
                      :props="{
                        checkStrictly: true,
                        expandTrigger: 'hover',
                        label: 'title',
                        value: 'id',
                      }"
                      placeholder="请选择文档分类"
                      style="width: 100%"
                    ></el-cascader>
                  </el-form-item>
                </el-col>
                <el-col
                  v-if="(settings.language || []).length > 0"
                  :lg="8"
                  :md="12"
                  :sm="24"
                >
                  <el-form-item label="默认语言" prop="language">
                    <template slot="label">
                      <span>默认语言</span>
                      <ToolTip
                        content="如果您不想为每个文档单独设置语言，可以在此处设置默认的文档语言"
                      />
                    </template>
                    <el-select
                      v-model="document.language"
                      filterable
                      clearable
                      style="width: 100%"
                    >
                      <el-option
                        v-for="item in settings.language"
                        :key="item.code"
                        :label="item.language"
                        :value="item.code"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :lg="8" :md="12" :sm="24">
                  <el-form-item prop="price">
                    <template slot="label">
                      <span>{{
                        `默认售价（${settings.system.credit_name || '魔豆'}）`
                      }}</span>
                      <ToolTip
                        content="如果您不想为每个文档单独设置售价，可以在此处设置默认售价"
                      />
                    </template>
                    <el-input-number
                      v-model="document.price"
                      :min="0"
                      :step="1"
                      :disabled="loading"
                      style="width: 100%"
                    ></el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-divider content-position="left">上传选项</el-divider>

              <el-row :gutter="20">
                <el-col :lg="6" :md="12" :sm="24">
                  <el-form-item prop="isDir">
                    <el-checkbox
                      v-model="isDir"
                      :disabled="loading"
                      @change="changeDir"
                    >
                      📁 上传文件夹
                    </el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col v-if="settings.vip.enable" :lg="6" :md="12" :sm="24">
                  <el-form-item prop="is_vip">
                    <el-checkbox
                      v-model="isVIP"
                      :disabled="loading"
                      @change="changeVIP"
                    >
                      👑 加入VIP文档
                    </el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :lg="6" :md="12" :sm="24">
                  <el-form-item>
                    <el-checkbox
                      v-model="setKeywordsAndDescription"
                      :disabled="loading"
                    >
                      🏷️ 设置关键字与摘要
                    </el-checkbox>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <!-- 第二步：文件上传 -->
          <div class="upload-section step-upload">
            <div class="section-header">
              <h4>📤 选择文件</h4>
              <p class="section-desc">
                {{
                  isDir ? '选择要上传的文件夹' : '拖拽文件到此处或点击选择文件'
                }}
              </p>
            </div>

            <el-upload
              ref="upload"
              drag
              multiple
              :action="'/api/v1/upload/document'"
              :headers="{ authorization: `bearer ${token}` }"
              :show-file-list="false"
              :disabled="loading || !canIUploadDocument"
              :auto-upload="false"
              :on-change="onChange"
              :file-list="fileList"
              class="enhanced-upload"
            >
              <div class="upload-content">
                <i class="el-icon-upload upload-icon"></i>
                <div class="el-upload__text">
                  <template v-if="isDir">
                    点击选择需要上传的<em>文件夹</em>
                  </template>
                  <template v-else>
                    将文件拖到此处，或<em>点击上传</em>
                  </template>
                </div>
                <div class="upload-hint">支持：{{ allowExtDisplay }}</div>
              </div>
            </el-upload>
          </div>

          <!-- 第三步：文件列表和确认 -->
          <div v-if="fileList.length > 0" class="upload-section step-confirm">
            <div class="section-header">
              <h4>📝 文件列表</h4>
              <p class="section-desc">
                已选择 {{ fileList.length }} 个文件，请确认信息后点击上传
              </p>
            </div>

            <div class="file-list-container">
              <vxe-table
                :data="fileList"
                style="width: 100%"
                max-height="480"
                stripe
                border="inner"
                :column-config="{ resizable: true }"
                :row-config="{ height: setKeywordsAndDescription ? 130 : 80 }"
                class="enhanced-file-table"
              >
                <vxe-column type="seq" width="60">
                  <template #header>序号</template>
                </vxe-column>

                <vxe-column field="title" title="文档" min-width="300">
                  <template #header>
                    <span>📄 文档</span>
                    <el-button
                      type="text"
                      size="mini"
                      :disabled="loading"
                      style="margin-left: 8px"
                      @click="clearAllFiles"
                    >
                      🗑️ 清空
                    </el-button>
                  </template>
                  <template #default="{ row, rowIndex }">
                    <div class="file-item">
                      <el-input
                        v-model="row.title"
                        :disabled="loading"
                        size="small"
                      >
                        <el-select
                          v-if="(settings.language || []).length > 0"
                          slot="prepend"
                          v-model="row.language"
                          placeholder="语言"
                          clearable
                          filterable
                          class="language-select"
                        >
                          <el-option
                            v-for="item in settings.language || []"
                            :key="item.code"
                            :label="item.language"
                            :value="item.code"
                          ></el-option>
                        </el-select>
                        <template slot="append">{{ row.ext }}</template>
                      </el-input>

                      <div v-if="row.error" class="file-status error">
                        <el-progress
                          :key="row.name"
                          :percentage="row.percentage"
                          status="exception"
                        ></el-progress>
                        <small class="el-link el-link--danger error-tips">{{
                          row.error
                        }}</small>
                      </div>
                      <div
                        v-else-if="row.percentage > 0"
                        class="file-status uploading"
                      >
                        <el-progress :percentage="row.percentage"></el-progress>
                      </div>

                      <div class="file-actions">
                        <span class="file-size">{{
                          formatBytes(row.size)
                        }}</span>
                        <el-checkbox
                          v-if="settings.vip.enable"
                          v-model="row.is_vip"
                          class="is-vip-checkbox"
                          :disabled="loading"
                          size="small"
                        >
                          👑 VIP
                        </el-checkbox>
                        <el-button
                          size="mini"
                          type="text"
                          icon="el-icon-delete"
                          :disabled="loading"
                          class="remove-btn"
                          @click="handleRemove(rowIndex)"
                        >
                          移除
                        </el-button>
                      </div>
                    </div>
                  </template>
                </vxe-column>

                <vxe-column
                  field="price"
                  :title="`💰 售价(${settings.system.credit_name || '魔豆'})`"
                  width="130"
                >
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.price"
                      :min="0"
                      :step="1"
                      :disabled="loading"
                      controls-position="right"
                      size="small"
                    ></el-input-number>
                  </template>
                </vxe-column>

                <template v-if="setKeywordsAndDescription">
                  <vxe-column
                    field="keywords"
                    title="关键字与摘要"
                    min-width="200"
                  >
                    <template #default="{ row }">
                      <div class="keywords-description-container">
                        <div class="field-group">
                          <label class="field-label">🏷️ 关键字</label>
                          <el-input
                            v-model="row.keywords"
                            :disabled="loading"
                            type="textarea"
                            :rows="2"
                            placeholder="多个关键字用逗号分隔"
                            size="small"
                          ></el-input>
                        </div>
                        <div class="field-group">
                          <label class="field-label">📝 摘要</label>
                          <el-input
                            v-model="row.description"
                            :disabled="loading"
                            type="textarea"
                            :rows="2"
                            placeholder="文档摘要描述"
                            size="small"
                          ></el-input>
                        </div>
                      </div>
                    </template>
                  </vxe-column>
                </template>
              </vxe-table>
            </div>

            <!-- 警告信息 -->
            <el-alert
              v-if="fileMessages.length > 0"
              title="⚠️ 告警提示"
              type="warning"
              class="tips-alert"
              :closable="false"
            >
              <div
                v-for="(message, index) in fileMessages"
                :key="'msg-' + index"
              >
                {{ message }}
              </div>
            </el-alert>
          </div>
          <!-- 上传按钮 -->
          <div class="upload-actions">
            <el-button
              v-if="canIUploadDocument"
              type="primary"
              size="large"
              :loading="loading"
              class="upload-btn"
              :disabled="fileList.length === 0 || loading"
              @click="onSubmit"
            >
              <i class="el-icon-upload2"></i>
              <span v-if="loading">请勿刷新页面，文档上传中...</span>
              <span v-else
                >确定上传<span v-if="fileList.length > 0">
                  {{ fileList.length }} 个文档</span
                ></span
              >
            </el-button>
            <el-button
              v-else
              type="primary"
              size="large"
              icon="el-icon-lock"
              disabled
              class="upload-btn"
            >
              <span v-if="user.id > 0">您暂无权限上传文档</span>
              <span v-else>您未登录，请先登录再上传</span>
            </el-button>
          </div>
          <!-- 帮助提示 -->
          <div class="upload-section help-section">
            <el-collapse>
              <el-collapse-item title="💡 上传帮助" name="help">
                <div class="help-content">
                  <div class="help-item">
                    <i class="el-icon-warning-outline text-warning"></i>
                    <span>带有 <span class="required">*</span> 为必填项</span>
                  </div>

                  <div class="help-item">
                    <i class="el-icon-document text-primary"></i>
                    <span>
                      最大文件大小：
                      <strong
                        >{{
                          settings.security &&
                          settings.security.max_document_size
                            ? settings.security.max_document_size.toFixed(2)
                            : '50.00'
                        }}
                        MB</strong
                      >
                    </span>
                  </div>

                  <div class="help-item">
                    <i class="el-icon-upload text-success"></i>
                    <span>支持批量上传和文件夹上传</span>
                  </div>

                  <div class="help-item supported-formats">
                    <span>
                      <i class="el-icon-folder-opened text-info"></i
                      >支持的文档类型：</span
                    >
                    <div class="format-list">
                      <div v-if="wordExt.length > 0" class="format-group">
                        <img src="/static/images/word_24.png" alt="Word" />
                        <span>{{ wordExt.join('，') }}</span>
                      </div>
                      <div v-if="pptExt.length > 0" class="format-group">
                        <img src="/static/images/ppt_24.png" alt="PPT" />
                        <span>{{ pptExt.join('，') }}</span>
                      </div>
                      <div v-if="excelExt.length > 0" class="format-group">
                        <img src="/static/images/excel_24.png" alt="Excel" />
                        <span>{{ excelExt.join('，') }}</span>
                      </div>
                      <div v-if="otherExt.length > 0" class="format-group">
                        <img src="/static/images/other_24.png" alt="其他" />
                        <span>{{ otherExt.join('，') }}</span>
                      </div>
                      <div
                        v-if="allowExt.includes('.txt')"
                        class="format-group"
                      >
                        <img src="/static/images/text_24.png" alt="TXT" />
                        <span>.txt</span>
                      </div>
                      <div
                        v-if="allowExt.includes('.pdf')"
                        class="format-group"
                      >
                        <img src="/static/images/pdf_24.png" alt="PDF" />
                        <span>.pdf</span>
                      </div>
                    </div>
                  </div>

                  <div class="help-item">
                    <i class="el-icon-question text-primary"></i>
                    <span>
                      需要帮助？查看
                      <nuxt-link
                        to="/article/help"
                        class="el-link el-link--primary"
                      >
                        文库帮助
                      </nuxt-link>
                    </span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { calcMD5, formatBytes } from '~/utils/utils'
import { createDocument, isDocumentExist } from '~/api/document'
import { uploadDocument } from '~/api/attachment'
import {
  wordExtEnum,
  excelExtEnum,
  pptExtEnum,
  otherExtEnum,
  pdfExtEnum,
  textExtEnum,
} from '~/utils/enum'
export default {
  data() {
    return {
      document: {
        category_id: [],
        price: 0,
        overwrite: false,
      },
      isVIP: false,
      setKeywordsAndDescription: false,
      currentStep: 0, // 当前步骤
      maxDocumentSize: 50 * 1024 * 1024,
      fileList: [],
      filesMap: {},
      loading: false,
      percentAge: 0,
      wordExtEnum,
      pptExtEnum,
      excelExtEnum,
      otherExtEnum,
      textExtEnum,
      pdfExtEnum,
      wordExt: [],
      pptExt: [],
      excelExt: [],
      otherExt: [],
      totalFiles: 0, // 总个数
      totalFailed: 0, // 失败个数
      totalSuccess: 0, // 成功个数
      totalDone: 0, // 完成个数
      fileMessages: [],
      isDir: false,
      allowExt: [
        '.doc',
        '.docx',
        '.pdf',
        '.ppt',
        '.pptx',
        '.epub',
        '.xls',
        '.xlsx',
        ...wordExtEnum,
        ...pptExtEnum,
        ...excelExtEnum,
        ...otherExtEnum,
        ...textExtEnum,
      ],
    }
  },
  head() {
    return {
      title: '上传文档 - ' + (this.settings.system.title || '文库'),
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: `上传文档,${this.settings.system.sitename},${this.settings.system.keywords}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.settings.system.description,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('user', ['token', 'user', 'groups']),
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('setting', ['settings']),
    // 允许的文件扩展名显示文本
    allowExtDisplay() {
      return (
        this.allowExt.slice(0, 8).join('、') +
        (this.allowExt.length > 8 ? '等' : '')
      )
    },
    canIUploadDocument() {
      if (!this.user || !this.user.id) return false
      return this.groups.some((group) => group.enable_upload)
    },
    // 当前步骤计算
    currentStepComputed() {
      if (this.fileList.length === 0) {
        return this.document.category_id.length > 0 ? 1 : 0
      }
      return 2
    },
  },
  watch: {
    currentStepComputed: {
      handler(val) {
        this.currentStep = val
      },
      immediate: true,
    },
  },
  async created() {
    await Promise.all([this.getCategories(), this.getUserGroups()])
    try {
      this.maxDocumentSize =
        (this.settings.security.max_document_size || 50) * 1024 * 1024
    } catch (error) {
      // 使用默认值
    }

    try {
      this.allowExt =
        this.settings.security.document_allowed_ext || this.allowExt
    } catch (error) {
      // 使用默认值
    }
    this.allowExt.map((ext) => {
      if (this.wordExtEnum.includes(ext)) {
        this.wordExt.push(ext)
      } else if (this.pptExtEnum.includes(ext)) {
        this.pptExt.push(ext)
      } else if (this.excelExtEnum.includes(ext)) {
        this.excelExt.push(ext)
      } else if (this.otherExtEnum.includes(ext)) {
        this.otherExt.push(ext)
      }
      return ext
    })
  },
  methods: {
    formatBytes,
    ...mapActions('user', ['getUser', 'getUserGroups']),
    ...mapActions('category', ['getCategories']),
    // 设置是否允许选择文件夹上传
    changeDir() {
      const upload = this.$refs.upload.$el.querySelector('input[type=file]')
      if (this.isDir) {
        upload.setAttribute('webkitdirectory', 'webkitdirectory')
        upload.setAttribute('directory', 'directory')
      } else {
        upload.removeAttribute('webkitdirectory')
        upload.removeAttribute('directory')
      }
    },

    // 文件选择变化处理
    onChange(file) {
      const name = file.name.toLowerCase()
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      if (!this.allowExt.includes(ext)) {
        this.fileMessages.unshift(`${file.name} 不支持的文件格式，已忽略该文件`)
        return
      }

      if (file.size > this.maxDocumentSize) {
        this.fileMessages.unshift(
          `${file.name} 文件大小${formatBytes(
            file.size
          )} 超过限制（最大${formatBytes(this.maxDocumentSize)}），已忽略该文件`
        )
        return
      }

      // 文件不能大于指定的文件大小
      if (
        !this.filesMap[name] &&
        this.allowExt.includes(ext) &&
        file.size <= this.maxDocumentSize
      ) {
        const item = {
          ...file,
          title: file.name.substring(0, file.name.lastIndexOf('.')),
          ext,
          price: this.document.price || 0,
          is_vip: this.isVIP || false,
          language: this.document.language || '',
          progressStatus: 'success',
          error: '',
          percentage: 0,
          attachment_id: 0,
        }
        this.filesMap[name] = item
        this.fileList.push(item)
        this.totalFiles = this.fileList.length
      }
    },

    // 移除文件
    handleRemove(index) {
      const fileName = this.fileList[index].name
      this.filesMap[fileName] = null
      this.fileList.splice(index, 1)
    },

    // 提交上传
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 1. 验证文件是否存在
          if (this.fileList.length === 0) {
            this.$message.error('请先选择要上传的文档')
            return
          }

          this.totalFiles = this.fileList.length
          this.totalDone = 0
          this.loading = true
          try {
            // 取消之前上传的请求，不然一直pending，新请求会没法发送
            if (process.client && window.uploadDocumentCancel) {
              window.uploadDocumentCancel.map((c) => c())
              window.uploadDocumentCancel = []
            }
          } catch (error) {}

          // chrome 等浏览器同一域名下最多只能同时发起 6 个请求，所以这里将 fileList 拆分成多个数组，每个数组的长度为 2，以便控制并发，每次只同时上传 2 个文件
          const fileList = this.fileList.reduce((prev, cur, index) => {
            const i = Math.floor(index / 2)
            prev[i] = prev[i] || []
            prev[i].push(cur)
            return prev
          }, [])
          fileList.reduce(async (prev, cur) => {
            await prev
            await Promise.all(
              cur.map(async (file) => {
                await this.uploadDocument(file)
              })
            )
          }, Promise.resolve())
        }
      })
    },

    // 清空所有文件
    clearAllFiles() {
      if (this.loading) {
        return
      }
      this.fileList = []
      this.filesMap = {}
      this.fileMessages = []
      this.$refs.upload.clearFiles()
    },

    // 上传单个文档
    async uploadDocument(file) {
      // 计算文档md5，如果文档已经存在，则不上传
      if (this.settings.security.disable_upload_exist_document) {
        let md5
        try {
          md5 = await calcMD5(file.raw)
        } catch (error) {
          this.$message.error(`文档《${file.name}》md5计算失败:` + error)
          return
        }

        const res = await isDocumentExist({ hash: md5 })
        // 返回200，说明文档已经存在，跳过上传
        if (res.status === 200) {
          this.$message.warning(`文档《${file.name}》已存在，跳过上传`)
          this.totalDone++
          this.removeFile(file)
          if (this.totalDone === this.totalFiles) {
            this.loading = false
          }
          return
        }
      }

      if (file.percentage === 100 && file.attachment_id) {
        // 不用再次上传
        this.createDocument(file)
        this.totalDone++
        if (this.totalDone === this.totalFiles) {
          this.loading = false
        }
        return
      }
      file.error = ''
      file.progressStatus = 'success'

      const formData = new FormData()
      formData.append('file', file.raw)

      try {
        const res = await uploadDocument(formData, {
          onUploadProgress: (progressEvent) => {
            file.percentage = parseInt(
              (progressEvent.loaded / progressEvent.total) * 100
            )
          },
          // timeout: 1000 * 6,
        })
        if (res.status === 200) {
          file.attachment_id = res.data.data.id || 0
          this.createDocument(file)
          this.totalSuccess++
        } else {
          file.progressStatus = 'exception'
          file.error = res.data.message || res.statusText
          this.$message.error(`《${file.name}》${file.error}`)
          this.totalFailed++
        }
      } catch (error) {
        file.progressStatus = 'exception'
        file.error = '上传失败或超时，请重试'
        this.$message.error(`《${file.name}》${file.error}`)
        this.totalFailed++
      }

      this.totalDone++
      if (this.totalDone === this.totalFiles) {
        this.loading = false
      }
    },

    // 创建文档
    async createDocument(doc) {
      const documentData = {
        title: doc.title,
        price: doc.price,
        keywords: doc.keywords,
        description: doc.description,
        attachment_id: doc.attachment_id,
        language: doc.language,
        is_vip: doc.is_vip,
      }

      const createDocumentRequest = {
        overwrite: this.document.overwrite,
        category_id: this.document.category_id,
        document: [documentData],
      }
      const res = await createDocument(createDocumentRequest)
      if (res.status === 200) {
        // 从 fileList 中剔除 attachment_id 与当前文档相同的文档
        this.$message.success(`《${doc.title}》上传成功`)
        this.removeFile(doc)
      } else {
        this.$message.error(`《${doc.title}》上传失败 ` + res.data.message)
      }
    },

    // 剔除文档
    removeFile(file) {
      this.fileList = this.fileList.filter((item) => {
        return item.name !== file.name
      })
      this.filesMap = Object.keys(this.filesMap).reduce((acc, key) => {
        if (this.filesMap[key] && this.filesMap[key].name !== file.name) {
          acc[key] = this.filesMap[key]
        }
        return acc
      }, {})
    },
    // 切换VIP状态
    changeVIP() {
      this.fileList.forEach((file) => {
        file.is_vip = this.isVIP
      })
    },
  },
}
</script>

<style lang="scss">
.page-upload {
  // 新增样式
  .upload-card {
    border-radius: 12px;
    overflow: hidden;
  }

  .upload-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .upload-steps {
      flex: 1;
      max-width: 500px;
      margin-left: 40px;
    }
  }

  .upload-section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-header {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #303133;
        font-weight: 600;
      }

      .section-desc {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .config-form {
    background: #fafafa;
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #ebeef5;
  }

  .enhanced-upload {
    .el-upload-dragger {
      width: 100%;
      height: 200px;
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
        background-color: #f0f8ff;
      }
    }

    .upload-content {
      padding: 40px 20px;
      text-align: center;

      .upload-icon {
        font-size: 48px;
        color: #c0c4cc;
        margin-bottom: 16px;
      }

      .upload-hint {
        margin-top: 12px;
        color: #909399;
        font-size: 12px;
      }
    }
  }

  .file-list-container {
    background: white;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    overflow: hidden;
  }

  .enhanced-file-table {
    .file-item {
      .file-status {
        margin-top: 8px;

        &.error {
          .el-progress {
            margin-bottom: 4px;
          }
        }
      }

      .file-actions {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;

        .file-size {
          color: #909399;
          font-size: 12px;
        }

        .is-vip-checkbox {
          margin: 0;
          .el-checkbox__label {
            padding-left: 5px;
            font-size: 12px;
          }
        }

        .remove-btn {
          color: #f56c6c;
          font-size: 12px;
          padding: 0;

          &:hover {
            color: #f78989;
          }
        }
      }
    }

    // 关键字与摘要容器样式
    .keywords-description-container {
      .field-group {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .field-label {
          display: block;
          font-size: 12px;
          color: #606266;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .el-textarea {
          .el-textarea__inner {
            font-size: 12px;
            line-height: 1.4;
          }
        }
      }
    }
  }

  .upload-actions {
    margin-top: 24px;
    text-align: center;

    .upload-btn {
      padding: 12px 48px;
      font-size: 16px;
      border-radius: 6px;

      i {
        margin-right: 8px;
      }
    }
  }

  .help-section {
    margin-top: 32px;

    .help-content {
      padding: 16px 0;

      .help-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;

        i {
          margin-right: 8px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        &.supported-formats {
          flex-direction: column;
          align-items: flex-start;

          .format-list {
            margin-top: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;

            .format-group {
              display: flex;
              align-items: center;
              gap: 4px;

              img {
                width: 20px;
                height: 20px;
              }

              span {
                font-size: 12px;
                color: #666;
              }
            }
          }
        }
      }

      .required {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }

  // 原有样式保持
  .tips-alert {
    margin-bottom: 20px;
    .el-alert__content {
      width: 100%;
      .el-alert__description {
        width: 100%;
        max-height: 200px;
        overflow: auto;
      }
    }
  }
  .language-select .el-input {
    width: 110px;
  }
  .is-vip-checkbox {
    margin: 0 10px;
    .el-checkbox__label {
      padding-left: 5px;
    }
  }
  .vxe-table {
    .el-input-number {
      width: 100%;
      top: -18px;
    }
    .vxe-header--column {
      .vxe-cell {
        white-space: normal;
      }
    }
  }
  .el-table {
    .el-input-number {
      width: 120px;
    }
  }
  .el-progress {
    position: absolute;
    width: 100%;
    bottom: -1px;
  }
  .error-tips {
    font-size: 12px;
  }
  .part-left {
    border-right: 1px dashed rgb(252, 155, 91);
    &.hide-border {
      border-right: none;
    }
  }
  .upload-tips {
    line-height: 160%;
    padding-left: 20px !important;
    ul,
    li {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      margin: 4px 0;
    }
    .el-link {
      top: -2px;
    }
    img {
      position: relative;
      top: 5px;
      width: 18px;
      height: 18px;
    }
  }
  .table-action {
    margin-top: 8px;
    font-size: 14px;
    .file-size {
      display: inline-block;
      margin: 0 8px;
      color: #999;
    }
    .el-button--text {
      color: red;
    }
  }

  // 文本颜色类
  .text-warning {
    color: #e6a23c;
  }

  .text-primary {
    color: #409eff;
  }

  .text-success {
    color: #67c23a;
  }

  .text-info {
    color: #909399;
  }
}

@media screen and (max-width: 768px) {
  .page-upload {
    .upload-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .upload-steps {
        margin-left: 0;
        max-width: 100%;
      }
    }

    .config-form {
      padding: 16px;
    }

    .enhanced-upload {
      .el-upload-dragger {
        height: 150px;
      }

      .upload-content {
        padding: 30px 15px;

        .upload-icon {
          font-size: 36px;
        }
      }
    }

    .upload-btn {
      padding: 10px 24px !important;
      font-size: 14px !important;
    }

    .help-content {
      .format-list {
        flex-direction: column;
        gap: 8px;
      }
    }

    .part-left {
      border-right: 0;
      width: 100% !important;
      .el-upload {
        display: block;
        .el-upload-dragger {
          width: 100% !important;
        }
      }
    }
    .part-right {
      width: 100% !important;
      margin-top: 20px;
      li {
        margin-bottom: 0;
      }
    }
    .upload-tips {
      border-left: 0;
      padding-left: 10px !important;
    }
  }
}
</style>
