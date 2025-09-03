<template>
  <div class="page page-post">
    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">
            <i class="el-icon-house"></i>
            首页
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            {{ article.id > 0 ? '编辑文章' : '发布文章' }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <div class="nav-actions">
          <div v-if="article.id > 0" class="draft-status">
            <i class="el-icon-edit-outline"></i>
            <span>编辑中</span>
          </div>
          <el-button
            type="text"
            icon="el-icon-back"
            class="back-link"
            @click="back"
          >
            返回
          </el-button>
        </div>
      </div>

      <!-- 权限检查提示 -->
      <el-alert
        v-if="!canIPublish && !loading"
        title="无权限提示"
        type="warning"
        :closable="false"
        show-icon
        class="permission-alert"
      >
        <template slot="title">
          <span>你暂时无法发布文章</span>
        </template>
        <p>请先登录账号，或联系管理员开通文章发布权限。</p>
        <div style="margin-top: 12px">
          <el-button
            type="primary"
            size="small"
            @click="$router.push('/login')"
          >
            前往登录
          </el-button>
          <el-button type="default" size="small" @click="$router.push('/')">
            返回首页
          </el-button>
        </div>
      </el-alert>

      <!-- 主内容网格 -->
      <div v-if="canIPublish" class="content-grid">
        <!-- 表单容器 -->
        <div class="form-container">
          <FormArticle
            v-loading="loading"
            :init-article="article"
            :category-trees="trees"
            :can-i-publish="canIPublish"
            :can-i-crawl-article="canICrawlArticle"
            @success="success"
          ></FormArticle>
        </div>

        <!-- 帮助信息侧边栏（桌面端显示） -->
        <div class="help-sidebar">
          <el-card shadow="never" class="help-card">
            <template #header>
              <div class="help-title">
                <i class="el-icon-question"></i>
                <span>发布指南</span>
              </div>
            </template>

            <div class="help-content">
              <div class="help-item">
                <h4><i class="el-icon-edit-outline"></i> 标题建议</h4>
                <p>使用清晰、描述性的标题，避免标题党</p>
              </div>

              <div class="help-item">
                <h4><i class="el-icon-folder"></i> 选择分类</h4>
                <p>为文章选择合适的分类，便于读者发现</p>
              </div>

              <div class="help-item">
                <h4><i class="el-icon-price-tag"></i> 关键词</h4>
                <p>添加相关关键词，用逗号分隔，提升文章可发现性</p>
              </div>

              <div class="help-item">
                <h4><i class="el-icon-document"></i> 内容编写</h4>
                <p>使用丰富的格式，添加图片、链接等增强可读性</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 写作帮助对话框 -->
    <el-dialog
      title="写作帮助"
      :visible.sync="showHelp"
      width="600px"
      :before-close="handleCloseHelp"
    >
      <div class="help-dialog-content">
        <h3>Markdown 语法参考</h3>
        <el-table :data="markdownHelp" style="width: 100%" size="small">
          <el-table-column
            prop="syntax"
            label="语法"
            width="120"
          ></el-table-column>
          <el-table-column prop="description" label="说明"></el-table-column>
        </el-table>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showHelp = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { getArticle } from '~/api/article'
export default {
  data() {
    return {
      loading: false,
      showHelp: false,
      previewMode: false,
      article: {
        title: '',
        identifier: '',
        keywords: '',
        description: '',
        content: '',
        id: 0,
        category_id: [],
      },
      markdownHelp: [
        { syntax: '# 标题', description: '一级标题' },
        { syntax: '## 标题', description: '二级标题' },
        { syntax: '**粗体**', description: '粗体文字' },
        { syntax: '*斜体*', description: '斜体文字' },
        { syntax: '[链接](url)', description: '插入链接' },
        { syntax: '![图片](url)', description: '插入图片' },
        { syntax: '`代码`', description: '行内代码' },
        { syntax: '```代码块```', description: '代码块' },
      ],
    }
  },
  head() {
    return {
      title: `发布文章 - ${this.settings.system.sitename}`,
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: `发布文章,${this.settings.system.sitename},${this.settings.system.keywords}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: `${this.settings.system.description}`,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('user', ['token', 'user', 'groups']),
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('setting', ['settings']),
    trees() {
      return this.categoryTrees.filter((item) => item.type === 1)
    },
    canIPublish() {
      return this.groups.some((group) => group.enable_article)
    },
    canICrawlArticle() {
      return this.groups.some((group) => group.enable_article_crawl)
    },
  },
  created() {
    this.getArticle()
    this.getCategories()
  },
  methods: {
    ...mapActions('category', ['getCategories']),
    async getArticle() {
      const identifier = this.$route.query.identifier
      if (!identifier) {
        return
      }
      const res = await getArticle({ identifier })
      if (res.status !== 200) {
        this.$message.error(res.data.message || '获取文章失败')
        return
      }
      this.article = res.data
    },
    success(article) {
      this.$router.push(`/article/${article.identifier}`)
    },
    back() {
      if (history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    },
    saveDraft() {
      this.$message.success('草稿保存功能开发中...')
    },
    handleCloseHelp() {
      this.showHelp = false
    },
  },
}
</script>
<style lang="scss">
.page-post {
  min-height: 100vh;
  background-color: #f8f9fa;
}

// 主要内容区域
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  .form-article-container {
    padding: 0 !important;
    background-color: transparent !important;
  }

  // 顶部导航栏 - 简洁现代
  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 24px 0;
    border-bottom: 1px solid #e4e7ed;
    margin-bottom: 32px;

    .breadcrumb {
      ::v-deep .el-breadcrumb {
        .el-breadcrumb__item {
          .el-breadcrumb__inner {
            color: #606266;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.3s ease;

            &:hover {
              color: #409eff;
            }

            i {
              margin-right: 6px;
              color: #909399;
            }
          }

          .el-breadcrumb__separator {
            color: #c0c4cc;
            margin: 0 8px;
          }
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .draft-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #909399;
        background-color: #f0f2f5;
        padding: 4px 12px;
        border-radius: 12px;
        border: 1px solid #e4e7ed;

        i {
          font-size: 13px;
          color: #409eff;
        }
      }

      .back-link {
        color: #606266;
        font-size: 14px;
        padding: 6px 12px;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          color: #409eff;
          background-color: #ecf5ff;
        }

        i {
          margin-right: 6px;
        }
      }
    }
  }

  .permission-alert {
    margin-bottom: 24px;
    border-radius: 6px;
  }

  // 主内容网格布局
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    align-items: start;

    .help-sidebar {
      position: sticky;
      top: 20px;

      .help-card,
      .quick-actions-card {
        margin-bottom: 20px;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
        }

        ::v-deep .el-card__header {
          background-color: #fafbfc;
          border-bottom: 1px solid #e4e7ed;
          padding: 16px 20px;

          .help-title {
            display: flex;
            align-items: center;
            font-weight: 600;
            color: #303133;
            font-size: 14px;

            i {
              margin-right: 8px;
              color: #409eff;
              font-size: 16px;
            }
          }
        }

        ::v-deep .el-card__body {
          padding: 20px;
        }
      }

      .help-content {
        .help-item {
          margin-bottom: 16px;
          padding: 12px;
          background-color: #f8f9fa;
          border: 1px solid #f0f0f0;
          border-radius: 6px;
          transition: all 0.3s ease;

          &:hover {
            border-color: #c6e2ff;
            background-color: #ecf5ff;
          }

          &:last-child {
            margin-bottom: 0;
          }

          h4 {
            margin: 0 0 6px 0;
            font-size: 13px;
            color: #303133;
            display: flex;
            align-items: center;
            font-weight: 600;

            i {
              margin-right: 6px;
              color: #409eff;
              font-size: 14px;
            }
          }

          p {
            margin: 0;
            font-size: 12px;
            color: #606266;
            line-height: 1.4;
          }
        }
      }

      .quick-actions {
        .quick-btn {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          padding: 10px 16px;
          margin-bottom: 4px;
          color: #606266;
          border-radius: 4px;
          transition: all 0.3s ease;
          font-weight: 500;

          &:hover {
            color: #409eff;
            background-color: #ecf5ff;
          }

          i {
            margin-right: 8px;
            font-size: 14px;
          }
        }
      }
    }
  }
}

// 帮助对话框
.help-dialog-content {
  h3 {
    margin-top: 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  ::v-deep .el-table {
    .el-table__header {
      th {
        background-color: #409eff;
        color: white;
        font-weight: 600;
        border: none;
      }
    }

    .el-table__body {
      tr {
        &:hover {
          background-color: #ecf5ff;
        }

        td {
          border-bottom: 1px solid #ebeef5;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .page-content {
    .content-grid {
      grid-template-columns: 1fr;
      gap: 20px;

      .help-sidebar {
        position: static;
        display: none;
      }
    }
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 16px 20px;

    .top-nav {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding-bottom: 16px;
      margin-bottom: 20px;

      .nav-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .content-grid {
      gap: 16px;

      .form-container {
        .page-title-area {
          margin-bottom: 20px;
          padding-bottom: 16px;

          .page-title {
            font-size: 20px;
          }

          .page-subtitle {
            font-size: 13px;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 16px;

    .top-nav {
      .breadcrumb {
        ::v-deep .el-breadcrumb {
          .el-breadcrumb__item {
            .el-breadcrumb__inner {
              font-size: 13px;
            }
          }
        }
      }

      .nav-actions {
        .back-link {
          font-size: 13px;
          padding: 4px 8px;
        }
      }
    }

    .content-grid {
      .form-container {
        .page-title-area {
          .page-title {
            font-size: 18px;
          }
        }
      }
    }
  }
}
</style>
