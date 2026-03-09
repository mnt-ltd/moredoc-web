<template>
  <div class="com-user-article">
    <div class="article-filter-panel">
      <el-form
        :model="query"
        class="article-filter-form"
        @submit.native.prevent
      >
        <div class="article-filter-form__main">
          <el-form-item class="article-filter-form__keyword">
            <el-input
              v-model="query.wd"
              placeholder="搜索文章标题..."
              clearable
              size="medium"
              prefix-icon="el-icon-search"
              @keydown.enter.native="onSearch"
            ></el-input>
          </el-form-item>
          <div class="article-filter-form__actions">
            <el-button
              type="primary"
              size="medium"
              icon="el-icon-search"
              :loading="loading"
              @click="onSearch"
            >
              搜索
            </el-button>
            <!-- <el-button
              size="medium"
              icon="el-icon-refresh"
              @click="resetSearch"
            >
              重置
            </el-button> -->
          </div>
        </div>
        <div v-show="showAdvancedFilters" class="article-filter-form__advanced">
          <el-form-item>
            <el-date-picker
              v-model="query.created_at"
              type="datetimerange"
              :picker-options="datetimePickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              size="medium"
              value-format="yyyy-MM-dd HH:mm:ss"
            >
            </el-date-picker>
          </el-form-item>
        </div>
        <button
          type="button"
          class="article-filter-toggle"
          @click="toggleAdvancedFilters"
        >
          <i
            :class="
              showAdvancedFilters ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
            "
          ></i>
          <span>{{ showAdvancedFilters ? '收起筛选' : '展开筛选' }}</span>
        </button>
      </el-form>
    </div>

    <div class="article-summary">
      <i class="el-icon-tickets"></i>
      <span
        >共 <strong>{{ total }}</strong> 篇文章</span
      >
    </div>

    <div
      class="article-list"
      :class="{ 'without-actions': !canManageArticles }"
    >
      <div class="article-list__body">
        <el-table
          v-loading="loading"
          :data="articles"
          row-key="id"
          class="article-table"
          empty-text=""
        >
          <el-table-column
            min-width="360"
            label="文章"
            class-name="article-column--info"
          >
            <template slot-scope="scope">
              <div class="article-cell article-cell--info">
                <el-tooltip :content="scope.row.title" placement="top-start">
                  <nuxt-link
                    target="_blank"
                    :to="{
                      name: 'article-id',
                      params: { id: scope.row.identifier },
                    }"
                    class="article-row__title"
                  >
                    <span v-if="isSearch" v-html="scope.row.title"></span>
                    <template v-else>{{ scope.row.title }}</template>
                  </nuxt-link>
                </el-tooltip>
                <div class="article-row__meta">
                  <span>
                    <i class="el-icon-time"></i>
                    {{ formatRelativeTime(scope.row.created_at) }}
                  </span>
                  <span>{{ formatDatetime(scope.row.created_at) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            min-width="140"
            label="统计信息"
            class-name="article-column--stats"
          >
            <template slot-scope="scope">
              <div class="article-cell article-cell--stats">
                <div class="article-row__stat-line">
                  <span
                    ><i class="el-icon-view"></i>
                    {{ scope.row.view_count || 0 }}</span
                  >
                  <span
                    ><i class="el-icon-chat-dot-round"></i>
                    {{ scope.row.comment_count || 0 }}</span
                  >
                  <span
                    ><i class="el-icon-star-off"></i>
                    {{ scope.row.favorite_count || 0 }}</span
                  >
                </div>
                <el-tag
                  v-if="showPrivateData"
                  :type="filterStatus(scope.row.status).type"
                  size="mini"
                  effect="plain"
                >
                  {{ filterStatus(scope.row.status).label }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="canManageArticles"
            width="92"
            class-name="article-column--actions"
            label="操作"
          >
            <template slot-scope="scope">
              <div class="article-cell article-cell--actions">
                <el-button
                  type="text"
                  icon="el-icon-edit-outline"
                  size="mini"
                  @click="updateArticle(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  class="is-danger"
                  size="mini"
                  @click="deleteArticle(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
          <template slot="empty">
            <el-empty description="暂无文章"></el-empty>
          </template>
        </el-table>
      </div>
    </div>

    <el-pagination
      v-if="total > 0"
      :current-page="query.page"
      :page-size="query.size"
      :layout="
        isMobile
          ? 'total, prev, pager, next'
          : 'total, prev, pager, next, jumper'
      "
      :pager-count="isMobile ? 5 : 7"
      :small="isMobile"
      :total="total"
      class="mgt-20px"
      @current-change="pageChange"
    >
    </el-pagination>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listArticle, searchArticle, deleteArticle } from '~/api/article'
import { formatDatetime, formatRelativeTime } from '~/utils/utils'
import { datetimePickerOptions, articleStatusOptions } from '~/utils/enum'

export default {
  name: 'UserArticle',
  props: {
    userId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      datetimePickerOptions,
      articleStatusOptions,
      articleStatusOptionsMap: {},
      articles: [],
      total: 0,
      loading: false,
      query: {
        page: parseInt(this.$route.query.page) || 1,
        size: 10,
        wd: this.$route.query.wd || '',
        created_at: [],
      },
      article: { id: 0 },
      isSearch: false,
      showAdvancedFilters: false,
    }
  },
  computed: {
    ...mapGetters('user', ['user', 'permissions']),
    canManageArticles() {
      return this.userId === this.user.id
    },
    showPrivateData() {
      // 如果是用户自身或者是网站管理员则显示私有数据
      return this.userId === this.user.id || this.permissions.length > 0
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.query = {
          wd: this.$route.query.wd || '',
          page: parseInt(this.$route.query.page) || 1,
          size: parseInt(this.$route.query.size) || 10,
          created_at: Array.isArray(this.$route.query.created_at)
            ? this.$route.query.created_at
            : [],
        }
        this.getArticles()
      },
      immediate: true,
    },
  },
  created() {
    const statusMap = {}
    this.articleStatusOptions.forEach((item) => {
      statusMap[item.value] = item
    })
    this.articleStatusOptionsMap = statusMap
  },
  methods: {
    formatDatetime,
    formatRelativeTime,
    toggleAdvancedFilters() {
      this.showAdvancedFilters = !this.showAdvancedFilters
    },
    buildQuery() {
      const query = {
        page: this.query.page,
        size: this.query.size,
      }

      if (this.query.wd) {
        query.wd = this.query.wd
      }

      if (
        Array.isArray(this.query.created_at) &&
        this.query.created_at.length === 2
      ) {
        query.created_at = this.query.created_at
      }

      return query
    },
    resetSearch() {
      this.query = {
        page: 1,
        size: this.query.size,
        wd: '',
        created_at: [],
      }
      this.$router.push({
        path: this.$route.path,
        query: this.buildQuery(),
      })
    },
    updateArticle(row) {
      this.$router.push({
        path: '/post',
        query: { identifier: row.identifier },
      })
    },
    onSearch() {
      this.query.page = 1
      this.$router.push({
        path: this.$route.path,
        query: this.buildQuery(),
      })
    },
    async getArticles() {
      if (this.userId === 0 || this.loading) return
      this.loading = true
      let res
      if (this.query.wd) {
        res = await searchArticle({
          ...this.query,
          user_id: this.userId,
        })
      } else {
        res = await listArticle({
          ...this.query,
          user_id: this.userId,
        })
      }

      if (res.status === 200) {
        this.isSearch = !!this.query.wd
        this.articles = res.data.article || []
        this.total = res.data.total || 0
      }
      this.loading = false
    },
    pageChange(page) {
      this.$router.push({
        query: { ...this.buildQuery(), page },
      })
    },
    deleteArticle(row) {
      this.$confirm(`您确定要删除文章《${row.title}》吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const res = await deleteArticle({ id: row.id })
        if (res.status === 200) {
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          this.getArticles()
        }
      })
    },
    filterStatus(status) {
      return (
        this.articleStatusOptionsMap[status || 0] || {
          value: status,
          label: '待审核',
          type: 'info',
        }
      )
    },
  },
}
</script>

<style lang="scss">
.com-user-article {
  .article-filter-panel {
    padding: 20px 24px 14px;
    border: 1px solid #edf1f7;
    border-radius: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
  }

  .article-filter-form__main {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .article-filter-form__keyword {
    flex: 1;
    margin-bottom: 0;

    .el-input__inner {
      height: 48px;
      border-radius: 12px;
      border-color: #edf1f7;
    }
  }

  .article-filter-form__actions {
    display: flex;
    gap: 12px;

    .el-button {
      min-width: 88px;
      height: 48px;
      border-radius: 10px;
      padding: 0 22px;
    }
  }

  .article-filter-form__advanced {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #edf1f7;

    .el-form-item {
      margin-bottom: 0;
    }

    .el-date-editor {
      max-width: 360px;
    }
  }

  .article-filter-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 14px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #409eff;
    font-size: 13px;
    cursor: pointer;
  }

  .article-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 24px 0 14px;
    color: #6b7280;
    font-size: 15px;

    i {
      color: #409eff;
    }

    strong {
      color: #409eff;
      font-size: 24px;
      font-weight: 700;
    }
  }

  // .article-list {
  //   border: 1px solid #edf1f7;
  //   border-radius: 16px;
  //   overflow: hidden;
  //   background-color: #fff;
  // }

  .article-list__head {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(180px, 260px) 92px;
    column-gap: 18px;
    align-items: center;
  }

  .article-list.without-actions {
    .article-list__head,
    .article-row {
      grid-template-columns: minmax(0, 1.9fr) minmax(180px, 280px);
    }
  }

  .article-list__head {
    padding: 16px 22px;
    background-color: #f6f8fb;
    color: #4b5563;
    font-size: 14px;
    font-weight: 600;
  }

  .article-list__body {
    min-height: 120px;
  }

  .article-table {
    width: 100%;

    &::before {
      display: none;
    }

    .el-table__body-wrapper {
      overflow-x: hidden;
    }

    td {
      padding: 0;
      border-bottom: 1px solid #f1f4f8;
      vertical-align: top;
    }

    .cell {
      padding: 0;
    }

    tr:last-child td {
      border-bottom: 0;
    }
  }

  .article-cell {
    padding: 22px 0;
    padding-left: 10px;
  }

  .article-cell--info {
    padding-right: 18px;
  }

  .article-row__title {
    display: block;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.45;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: #409eff;
    }
  }

  .article-row__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin-top: 10px;
    color: #8b95a7;
    font-size: 13px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  .article-cell--stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: #6b7280;
    font-size: 14px;
    padding-right: 18px;
  }

  .article-row__stat-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }

  .article-cell--actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding-right: 22px;

    .el-button {
      margin-left: 0;
      padding: 0;
      color: #409eff;
    }

    .el-button.is-danger {
      color: #f56c6c;
    }
  }

  .el-pagination {
    margin-top: 20px;
    text-align: right;
  }

  .article-column--stats {
    .el-tag {
      width: 72px;
      text-align: center;
    }
  }
}

@media screen and (max-width: 1200px) {
  .com-user-article {
    .article-list__head {
      grid-template-columns: minmax(0, 1fr) 180px 78px;
    }

    .article-list.without-actions {
      .article-list__head {
        grid-template-columns: minmax(0, 1fr) 180px;
      }
    }

    .article-table {
      .article-column--stats {
        width: 180px;
      }

      .article-column--actions {
        width: 78px;
      }
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .com-user-article {
    .article-filter-panel {
      padding: 16px;
      border-radius: 14px;
    }

    .article-filter-form__main {
      flex-direction: column;
      align-items: stretch;
    }

    .article-filter-form__actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }

    .article-filter-form__advanced {
      .el-date-editor {
        width: 100%;
        max-width: none;
      }
    }

    .article-summary {
      margin-top: 18px;

      strong {
        font-size: 20px;
      }
    }

    .article-list {
      border-radius: 14px;
    }

    .article-list__head {
      display: none;
    }

    .article-table {
      .el-table__body,
      .el-table__body tbody,
      .el-table__body tr,
      .el-table__body td {
        display: block;
        width: 100% !important;
      }

      .el-table__body-wrapper {
        overflow-x: visible;
      }

      .el-table__row {
        padding: 18px 16px;
        border-top: 1px solid #f1f4f8;
      }

      .el-table__row:first-child {
        border-top: 0;
      }

      td {
        border-bottom: 0;
      }

      .cell {
        overflow: visible;
      }
    }

    .article-cell {
      padding: 0;
    }

    .article-row__title {
      font-size: 16px;
      white-space: normal;
      line-clamp: 2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .article-cell--stats {
      padding-top: 14px;
      padding-right: 0;
    }

    .article-cell--actions {
      flex-direction: row;
      gap: 14px;
      padding-top: 14px;
      padding-right: 0;
    }

    .el-pagination {
      text-align: center;
    }
  }
}
</style>
