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
            @success="success"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { getArticle } from '~/api/article'
export default {
  data() {
    return {
      canIPublish: false,
      loading: false,
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
  },
  created() {
    this.canIPublishArticle()
    this.getCategories()
  },
  methods: {
    ...mapActions('category', ['getCategories']),
    canIPublishArticle() {
      this.groups.forEach((group) => {
        if (group.enable_article) {
          this.canIPublish = true
        }
      })
      if (this.canIPublish) {
        this.getArticle()
      }
    },
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
  },
}
</script>
<style lang="scss">
.page-post {
  min-height: calc(100vh - 150px);
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
