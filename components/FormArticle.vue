<template>
  <div class="form-article-container">
    <el-form
      ref="formArticle"
      label-position="top"
      label-width="80px"
      :model="article"
      class="article-form"
    >
      <el-card
        v-if="isAdmin || canICrawlArticle"
        class="form-section"
        shadow="never"
      >
        <template #header>
          <div class="section-title">
            <i class="el-icon-truck"></i>
            <span>爬虫助手</span>
          </div>
        </template>
        <FormCrawlArticle @success="crawlArticleSuccess"></FormCrawlArticle>
      </el-card>
      <!-- 基础信息卡片 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-title">
            <i class="el-icon-edit-outline"></i>
            <span>基础信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="14" :md="16" :sm="24" :xs="24">
            <el-form-item
              label="标题"
              prop="title"
              :rules="[
                { required: true, trigger: 'blur', message: '请输入文章标题' },
              ]"
            >
              <el-input
                v-model="article.title"
                placeholder="请输入文章标题"
                clearable
                :disabled="!canIPublish"
                size="large"
              >
                <template #prefix>
                  <i class="el-icon-document"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10" :md="8" :sm="24" :xs="24">
            <el-form-item
              label="分类"
              prop="category_id"
              :rules="[
                { required: true, trigger: 'blur', message: '请选择文章分类' },
              ]"
            >
              <el-cascader
                v-model="article.category_id"
                :options="categoryTrees"
                :disabled="!canIPublish"
                :filterable="true"
                :props="{
                  checkStrictly: true,
                  expandTrigger: 'hover',
                  label: 'title',
                  value: 'id',
                }"
                clearable
                placeholder="请选择文章分类"
                size="large"
                style="width: 100%"
              ></el-cascader>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col
            :span="isAdmin ? 12 : 24"
            :md="isAdmin ? 14 : 24"
            :sm="24"
            :xs="24"
          >
            <el-form-item label="关键字">
              <el-input
                v-model="article.keywords"
                :disabled="!canIPublish"
                placeholder="请输入文章关键字，多个关键字用英文逗号分隔"
              >
                <template #prefix>
                  <i class="el-icon-price-tag"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col v-if="isAdmin" :span="12" :md="10" :sm="24" :xs="24">
            <el-form-item label="标识" prop="identifier">
              <el-input
                v-model="article.identifier"
                placeholder="请输入文章标识，建议为字母和数字组合"
                :disabled="article.id > 0"
                clearable
              >
                <template #prefix>
                  <i class="el-icon-key"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述">
          <el-input
            v-model="article.description"
            placeholder="请输入文章描述，可为空"
            type="textarea"
            :disabled="!canIPublish"
            :rows="4"
            :autosize="{ minRows: 3, maxRows: 6 }"
            show-word-limit
            maxlength="500"
          ></el-input>
        </el-form-item>
      </el-card>

      <!-- 管理员设置卡片 -->
      <el-card v-if="isAdmin" class="form-section" shadow="never">
        <template #header>
          <div class="section-title">
            <i class="el-icon-setting"></i>
            <span>管理设置</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12" :md="12" :sm="24" :xs="24">
            <el-form-item label="审核状态">
              <el-select v-model="article.status" style="width: 100%">
                <el-option
                  v-for="item in articleStatusOptions"
                  :key="'s-' + item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :md="12" :sm="24" :xs="24">
            <el-form-item label="推荐">
              <div class="switch-wrapper">
                <el-switch
                  v-model="article.is_recommend"
                  active-text="是"
                  inactive-text="否"
                  active-color="#67C23A"
                  inactive-color="#F56C6C"
                ></el-switch>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 拒绝原因 -->
        <el-form-item
          v-if="article.status === 2"
          label="拒绝原因"
          prop="reject_reason"
        >
          <el-input
            v-model="article.reject_reason"
            placeholder="请输入拒绝原因"
            type="textarea"
            :rows="3"
            show-word-limit
            maxlength="200"
          ></el-input>
        </el-form-item>
      </el-card>

      <!-- 内容编辑卡片 -->
      <el-card class="form-section editor-section" shadow="never">
        <template #header>
          <div class="section-title">
            <i class="el-icon-edit"></i>
            <span>内容编辑</span>
          </div>
        </template>

        <el-form-item class="editor-item">
          <Editor
            v-if="canIPublish"
            v-model="article.content"
            :init="init"
          ></Editor>
          <div v-else class="no-permission-editor">
            <div class="no-permission-hint">
              <i class="el-icon-lock"></i>
              <p>你未登录或没有权限发布文章</p>
            </div>
            <el-input
              v-model="article.content"
              type="textarea"
              rows="10"
              :disabled="true"
              placeholder="你未登录或没有权限发布文章"
            ></el-input>
          </div>
        </el-form-item>
      </el-card>

      <!-- 提交按钮区域 -->
      <div class="submit-section">
        <el-button
          type="primary"
          size="large"
          :icon="loading ? 'el-icon-loading' : 'el-icon-check'"
          :disabled="!canIPublish"
          :loading="loading"
          class="submit-btn"
          @click="onSubmit"
        >
          {{
            canIPublish
              ? article.id > 0
                ? '更新文章'
                : '发布文章'
              : '你未登录或没有权限发布文章'
          }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import { createArticle, updateArticle } from '~/api/article'
import { articleStatusOptions } from '~/utils/enum'
export default {
  components: {
    Editor,
  },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
    canIPublish: {
      type: Boolean,
      default: false,
    },
    canICrawlArticle: {
      type: Boolean,
      default: false,
    },
    initArticle: {
      type: Object,
      default: () => {
        return {
          title: '',
          identifier: '',
          keywords: '',
          description: '',
          content: '',
          id: 0,
          category_id: [],
          status: 0,
          notice: 0,
        }
      },
    },
    categoryTrees: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      articleStatusOptions,
      init: {
        base_url: '/static/tinymce',
        language_url: '/static/tinymce/langs/zh-Hans.js', // 语言包的路径
        language: 'zh-Hans', // 语言
        skin_url: '/static/tinymce/skins/ui/oxide', // skin路径
        height: 600, // 编辑器高度
        branding: true, // 是否禁用“Powered by TinyMCE”
        menubar: true, // 顶部菜单栏显示,
        toolbar:
          'undo redo | styleselect blocks | kityformula-editor codesample code table link bold italic | bullist numlist alignleft aligncenter alignright alignjustify indent outdent | image media | searchreplace preview fullscreen help',
        plugins:
          'kityformula-editor image media wordcount codesample code link charmap emoticons table searchreplace visualblocks fullscreen table help wordcount lists preview',
        relative_urls: false, // 是否使用相对路径
        images_upload_handler: this.images_upload_handler,
      },
      loading: false,
      article: {
        title: '',
        identifier: '',
        keywords: '',
        description: '',
        content: '',
        id: 0,
        category_id: [],
        status: 0,
        notice: 0,
      },
    }
  },
  watch: {
    initArticle: {
      handler(val) {
        if (val.recommend_at) {
          val.is_recommend = true
        }
        const article = { notice: 0, status: 0, ...val }
        if (this.isAdmin && !article.id) {
          article.status = 1
        }
        this.article = article
      },
      immediate: true,
    },
  },
  mounted() {
    tinymce.init({})
  },
  methods: {
    images_upload_handler(blobInfo, progress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.withCredentials = false
        xhr.open('POST', '/api/v1/upload/article?type=image')
        // 设置header
        xhr.setRequestHeader(
          'Authorization',
          'Bearer ' + this.$store.state.user.token
        )
        xhr.upload.onprogress = (e) => {
          progress((e.loaded / e.total) * 100)
        }

        xhr.onload = () => {
          if (xhr.status === 403) {
            reject(new Error('HTTP Error: ' + xhr.status))
            return
          }
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error('HTTP Error: ' + xhr.status))
            return
          }
          const res = JSON.parse(xhr.responseText)
          resolve(res.data.url)
        }

        xhr.onerror = () => {
          reject(
            new Error(
              'Image upload failed due to a XHR Transport error. Code: ' +
                xhr.status
            )
          )
        }
        const formData = new FormData()
        formData.append('file', blobInfo.blob(), blobInfo.filename())
        xhr.send(formData)
      })
    },
    crawlArticleSuccess(artice) {
      console.log(artice)
      this.article = { ...this.article, ...artice }
    },
    onSubmit() {
      this.$refs.formArticle.validate(async (valid) => {
        if (!valid) {
          this.$message.error('请填写标题或选择分类')
          return
        }
        this.loading = true
        const article = { ...this.article }
        if (this.article.id > 0) {
          const res = await updateArticle(article)
          if (res.status === 200) {
            this.$message.success('修改成功')
            this.$emit('success', article)
          } else {
            this.$message.error(res.data.message)
          }
        } else {
          const res = await createArticle(article)
          if (res.status === 200) {
            this.$message.success('新增成功')
            this.$emit('success', res.data)
            this.article = res.data
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

<style>
.tox-promotion {
  display: none !important;
}
</style>

<style lang="scss" scoped>
.form-article-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.article-form {
  .form-section {
    margin-bottom: 24px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;

    &.editor-section {
      margin-bottom: 32px;
      border: 0;
      :deep(.el-card__body) {
        padding: 0;
      }
    }

    ::v-deep .el-card__header {
      background: linear-gradient(135deg, #409eff 0%, #53a8ff 100%);
      color: white;
      padding: 16px 20px;
      border-bottom: none;

      .section-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 16px;

        i {
          margin-right: 8px;
          font-size: 18px;
        }
      }
    }

    ::v-deep .el-card__body {
      padding: 24px;
    }
  }
}

.switch-wrapper {
  display: flex;
  align-items: center;
  height: 40px;
}

.no-permission-editor {
  .no-permission-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 4px;
    margin-bottom: 16px;
    color: #6c757d;

    i {
      font-size: 24px;
      margin-right: 8px;
    }

    p {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.submit-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;

  .submit-btn {
    min-width: 140px;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 4px;
    background: #409eff;
    border: 1px solid #409eff;

    &:hover:not(:disabled) {
      background: #66b1ff;
      border-color: #66b1ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
    }

    &:active:not(:disabled) {
      background: #3a8ee6;
      border-color: #3a8ee6;
    }

    &:disabled {
      background: #c0c4cc;
      border-color: #c0c4cc;
      color: #fff;
    }
  }

  .reset-btn {
    min-width: 120px;
    height: 44px;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    color: #606266;

    &:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: #ecf5ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
      color: #3a8ee6;
      border-color: #3a8ee6;
    }
  }
}

// 表单项优化
::v-deep .el-form-item {
  margin-bottom: 20px;

  .el-form-item__label {
    color: #303133;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .el-input {
    .el-input__inner {
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      transition: all 0.3s;

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }

    .el-input__prefix {
      color: #909399;
    }
  }

  .el-textarea {
    .el-textarea__inner {
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      transition: all 0.3s;

      &:focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
  }

  .el-cascader {
    .el-input__inner {
      border-radius: 4px;
    }
  }

  .el-select {
    .el-input__inner {
      border-radius: 4px;
    }
  }
}

// 编辑器样式优化
.editor-item {
  margin-bottom: 0;
  ::v-deep .tox-tinymce {
    border-radius: 4px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border: 1px solid #dcdfe6;
    border-top: 0;
    overflow: hidden;
  }

  ::v-deep .tox-toolbar-overlord {
    background: #f8f9fa;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .form-article-container {
    padding: 16px;
  }

  .article-form {
    .form-section {
      ::v-deep .el-card__body {
        padding: 16px;
      }
    }
  }

  .submit-section {
    flex-direction: column;
    padding: 24px 16px;

    .submit-btn,
    .reset-btn {
      width: 100%;
      margin: 0;
    }
  }
}

@media (max-width: 480px) {
  .form-article-container {
    padding: 12px;
  }

  .article-form {
    .form-section {
      margin-bottom: 16px;

      ::v-deep .el-card__header {
        padding: 12px 16px;

        .section-title {
          font-size: 14px;

          i {
            font-size: 16px;
          }
        }
      }

      ::v-deep .el-card__body {
        padding: 12px;
      }
    }
  }
}
</style>
