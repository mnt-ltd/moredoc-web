<template>
  <div class="wp-admin-container">
    <el-form
      ref="formArticle"
      label-position="top"
      label-width="80px"
      :model="article"
      class="wp-form"
    >
      <!-- 主内容区域 -->
      <div class="wp-main-layout">
        <!-- 左侧主要内容 -->
        <div class="wp-main-content">
          <!-- 标题输入 -->
          <div class="wp-title-section">
            <el-form-item
              prop="title"
              :rules="[
                { required: true, trigger: 'blur', message: '请输入文章标题' },
              ]"
            >
              <el-input
                v-model="article.title"
                placeholder="在此处添加标题"
                :disabled="!canIPublish"
                size="large"
                class="wp-title-input"
              />
            </el-form-item>
          </div>

          <!-- 内容编辑器 -->
          <div class="wp-editor-section">
            <el-form-item class="wp-editor-item">
              <Editor
                v-if="canIPublish"
                v-model="article.content"
                :init="init"
              />
              <div v-else class="wp-no-permission-editor">
                <div class="wp-no-permission-hint">
                  <i class="el-icon-lock"></i>
                  <p>你未登录或没有权限发布文章</p>
                </div>
                <el-input
                  v-model="article.content"
                  type="textarea"
                  rows="15"
                  :disabled="true"
                  placeholder="你未登录或没有权限发布文章"
                />
              </div>
            </el-form-item>
          </div>
        </div>
        <!-- 右侧边栏 -->
        <div class="wp-sidebar">
          <!-- 发布状态 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">发布</h3>
            <div class="wp-meta-content">
              <div class="wp-publish-actions">
                <el-button
                  type="primary"
                  :icon="loading ? 'el-icon-loading' : 'el-icon-check'"
                  :disabled="!canIPublish"
                  :loading="loading"
                  class="wp-publish-btn-sidebar"
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
            </div>
          </div>

          <!-- 分类设置 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">分类</h3>
            <div class="wp-meta-content">
              <el-form-item
                prop="category_id"
                :rules="[
                  {
                    required: true,
                    trigger: 'blur',
                    message: '请选择文章分类',
                  },
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
                  placeholder="选择分类"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 标签 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">标签</h3>
            <div class="wp-meta-content">
              <el-form-item>
                <el-input
                  v-model="article.keywords"
                  :disabled="!canIPublish"
                  placeholder="添加标签，用逗号分隔"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 摘要 -->
          <div class="wp-meta-box">
            <h3 class="wp-meta-title">摘要</h3>
            <div class="wp-meta-content">
              <el-form-item>
                <el-input
                  v-model="article.description"
                  placeholder="请输入文章摘要描述（可选）"
                  type="textarea"
                  :disabled="!canIPublish"
                  :rows="3"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                  show-word-limit
                  maxlength="500"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 管理员设置 -->
          <div v-if="isAdmin" class="wp-meta-box">
            <h3 class="wp-meta-title">管理设置</h3>
            <div class="wp-meta-content">
              <el-form-item label="审核状态">
                <el-select v-model="article.status" style="width: 100%">
                  <el-option
                    v-for="item in articleStatusOptions"
                    :key="'s-' + item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="推荐文章">
                <el-switch
                  v-model="article.is_recommend"
                  active-text="是"
                  inactive-text="否"
                  active-color="#67C23A"
                  inactive-color="#F56C6C"
                />
              </el-form-item>

              <el-form-item v-if="isAdmin" label="文章标识" prop="identifier">
                <el-input
                  v-model="article.identifier"
                  placeholder="文章标识（字母数字组合）"
                  :disabled="article.id > 0"
                  clearable
                />
              </el-form-item>

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
                />
              </el-form-item>
            </div>
          </div>
        </div>
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
        height: 980, // 编辑器高度
        branding: true, // 是否禁用“Powered by TinyMCE”
        placeholder: '请输入内容',
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
// Element UI 风格的管理界面
.wp-admin-container {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

// 页面头部
.wp-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .wp-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 20px;
  }

  .wp-title {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    color: #303133;
    line-height: 1.3;
  }

  .wp-header-actions {
    display: flex;
    gap: 12px;
  }

  .wp-publish-btn {
    background: #409eff;
    border-color: #409eff;
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    line-height: 1;
    min-height: 40px;
    margin: 0;
    padding: 12px 20px;
    cursor: pointer;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    font-weight: 500;

    &:hover:not(:disabled) {
      background: #66b1ff;
      border-color: #66b1ff;
    }

    &:disabled {
      background: #c0c4cc;
      border-color: #c0c4cc;
      color: #fff;
    }
  }
}

// 主布局
.wp-main-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

// 左侧主内容
.wp-main-content {
  flex: 1;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

// 标题输入区域
.wp-title-section {
  padding: 20px 20px 0;
  border-bottom: 1px solid #e4e7ed;

  .wp-title-input {
    ::v-deep .el-input__inner {
      border: none;
      font-size: 1.7em;
      font-weight: 500;
      line-height: 1.4;
      padding: 16px 0;
      background: transparent;
      color: #303133;
      box-shadow: none;

      &::placeholder {
        color: #c0c4cc;
        opacity: 1;
      }

      &:focus {
        border: none;
        box-shadow: none;
        outline: none;
      }
    }
  }

  ::v-deep .el-form-item {
    margin-bottom: 0;
  }
}

// 编辑器区域
.wp-editor-section {
  padding: 0;

  .wp-editor-item {
    margin-bottom: 0;

    ::v-deep .el-form-item__content {
      line-height: normal;
    }

    ::v-deep .tox-tinymce {
      border: none;
      border-radius: 0;
    }

    ::v-deep .tox-toolbar-overlord {
      background: #fafafa;
      border-bottom: 1px solid #e4e7ed;
    }
  }

  .wp-no-permission-editor {
    padding: 20px;

    .wp-no-permission-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
      background: #f5f7fa;
      border: 2px dashed #dcdfe6;
      border-radius: 4px;
      margin-bottom: 16px;
      color: #909399;

      i {
        font-size: 24px;
        margin-right: 8px;
      }

      p {
        margin: 0;
        font-size: 16px;
      }
    }
  }
}

// 摘要区域
.wp-excerpt-section {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;

  .wp-section-title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  ::v-deep .el-form-item {
    margin-bottom: 0;
  }

  ::v-deep .el-textarea__inner {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    color: #606266;

    &:focus {
      border-color: #409eff;
      // box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    &::placeholder {
      color: #c0c4cc;
    }
  }
}

// 右侧边栏
.wp-sidebar {
  width: 280px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 100%;
  }
}

// 元信息框
.wp-meta-box {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  .wp-meta-title {
    margin: 0;
    padding: 16px 20px;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.4;
    color: #303133;
    background: #fafafa;
    border-bottom: 1px solid #e4e7ed;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  .wp-meta-content {
    padding: 20px;
  }

  .wp-publish-actions {
    text-align: center;
  }

  .wp-publish-btn-sidebar {
    width: 100%;
    background: #409eff;
    border-color: #409eff;
    color: #fff;
    font-size: 14px;
    line-height: 1;
    min-height: 40px;
    padding: 12px 20px;
    border-radius: 4px;
    font-weight: 500;

    &:hover:not(:disabled) {
      background: #66b1ff;
      border-color: #66b1ff;
    }

    &:disabled {
      background: #c0c4cc;
      border-color: #c0c4cc;
      color: #fff;
    }
  }

  // 表单项样式调整
  ::v-deep .el-form-item {
    margin-bottom: 18px;

    &:last-child {
      margin-bottom: 0;
    }

    .el-form-item__label {
      color: #606266;
      font-weight: 500;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 8px;
      padding: 0;
    }

    .el-input__inner,
    .el-textarea__inner {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.5;
      color: #606266;

      &:focus {
        border-color: #409eff;
        // box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }

      &::placeholder {
        color: #c0c4cc;
      }
    }

    .el-cascader,
    .el-select {
      width: 100%;

      .el-input__inner {
        font-size: 14px;
      }
    }

    .el-switch {
      .el-switch__label {
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

// 隐藏TinyMCE推广信息
::v-deep .tox-promotion {
  display: none !important;
}

// 响应式设计
@media (max-width: 768px) {
  .wp-header {
    .wp-header-content {
      padding: 12px 16px;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .wp-title {
      font-size: 20px;
      text-align: center;
    }

    .wp-header-actions {
      justify-content: center;
    }
  }

  .wp-form {
    padding: 16px;
  }

  .wp-main-layout {
    gap: 16px;
  }

  .wp-title-section {
    padding: 16px;

    .wp-title-input {
      ::v-deep .el-input__inner {
        font-size: 1.4em;
        padding: 12px 0;
      }
    }
  }

  .wp-excerpt-section {
    padding: 16px;
  }

  .wp-meta-box {
    .wp-meta-title {
      padding: 12px 16px;
      font-size: 14px;
    }

    .wp-meta-content {
      padding: 16px;
    }
  }
}

@media (max-width: 480px) {
  .wp-header {
    .wp-header-content {
      padding: 8px 12px;
    }

    .wp-title {
      font-size: 18px;
    }
  }

  .wp-form {
    padding: 12px;
  }

  .wp-title-section {
    padding: 12px;

    .wp-title-input {
      ::v-deep .el-input__inner {
        font-size: 1.2em;
        padding: 10px 0;
      }
    }
  }

  .wp-excerpt-section {
    padding: 12px;
  }

  .wp-meta-box {
    .wp-meta-title {
      padding: 10px 12px;
      font-size: 14px;
    }

    .wp-meta-content {
      padding: 12px;
    }
  }
}
</style>
