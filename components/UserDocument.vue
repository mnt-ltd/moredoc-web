<template>
  <div class="com-user-document">
    <div class="document-filter-panel">
      <el-form
        :model="query"
        class="document-filter-form"
        @submit.native.prevent
      >
        <div class="document-filter-form__main">
          <el-form-item class="document-filter-form__keyword">
            <el-input
              v-model="query.wd"
              placeholder="搜索文档标题..."
              clearable
              size="medium"
              prefix-icon="el-icon-search"
              @keydown.enter.native="onSearch"
            ></el-input>
          </el-form-item>
          <div class="document-filter-form__actions">
            <el-button
              type="primary"
              size="medium"
              icon="el-icon-search"
              :loading="loading"
              @click="onSearch"
            >
              搜索
            </el-button>
            <el-button
              size="medium"
              icon="el-icon-refresh"
              @click="resetSearch"
            >
              重置
            </el-button>
          </div>
        </div>
        <div
          v-show="showAdvancedFilters"
          class="document-filter-form__advanced"
        >
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
          class="document-filter-toggle"
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

    <div class="document-summary">
      <i class="el-icon-document"></i>
      <span
        >共 <strong>{{ total }}</strong> 个文档</span
      >
    </div>

    <div
      class="document-list"
      :class="{ 'without-actions': !canManageDocuments }"
    >
      <div class="document-list__head">
        <div class="document-list__select"></div>
        <div class="document-list__title">文档信息</div>
        <div class="document-list__stats">阅读/下载/收藏/评分</div>
        <div v-if="canManageDocuments" class="document-list__actions">操作</div>
      </div>
      <div v-loading="loading" class="document-list__body">
        <template v-if="docs.length > 0">
          <div
            v-for="item in docs"
            :key="item.uuid || item.id"
            class="document-row"
          >
            <div class="document-row__select">
              <el-checkbox :value="false" disabled></el-checkbox>
            </div>
            <div class="document-row__info">
              <nuxt-link
                target="_blank"
                :to="{
                  name: 'document-id',
                  params: { id: item.uuid || item.id },
                }"
                class="document-row__cover"
              >
                <img :src="getDocumentCover(item)" :alt="item.title" />
              </nuxt-link>
              <div class="document-row__content">
                <el-tooltip :content="item.title" placement="top-start">
                  <nuxt-link
                    target="_blank"
                    :to="{
                      name: 'document-id',
                      params: { id: item.uuid || item.id },
                    }"
                    class="document-row__title"
                  >
                    {{ item.title }}
                  </nuxt-link>
                </el-tooltip>
                <div class="document-row__meta">
                  <span>
                    <i class="el-icon-time"></i>
                    {{ formatRelativeTime(item.created_at) }}
                  </span>
                  <span>{{ formatBytes(item.size) }}</span>
                  <span>{{ item.pages || '-' }} 页</span>
                  <el-tag
                    v-if="showPrivateData"
                    :type="filterStatus(item.status).type"
                    size="mini"
                    effect="plain"
                  >
                    {{ filterStatus(item.status).label }}
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="document-row__stats">
              <div class="document-row__stat-line">
                <span
                  ><i class="el-icon-view"></i> {{ item.view_count || 0 }}</span
                >
                <span
                  ><i class="el-icon-download"></i>
                  {{ item.download_count || 0 }}</span
                >
                <span
                  ><i class="el-icon-star-off"></i>
                  {{ item.favorite_count || 0 }}</span
                >
              </div>
              <div class="document-row__rating">
                <el-rate :value="item.score || 0.0" disabled></el-rate>
                <span class="document-row__rating-value">{{
                  formatScore(item.score)
                }}</span>
              </div>
            </div>
            <div v-if="canManageDocuments" class="document-row__actions">
              <el-button
                type="text"
                icon="el-icon-edit-outline"
                :loading="updating"
                @click="updateDocument(item)"
              >
                编辑
              </el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                class="is-danger"
                @click="deleteDocument(item)"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无文档"></el-empty>
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
    <el-drawer
      :visible.sync="updateDocumentVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <div slot="title">
        <el-page-header
          content="编辑文档"
          @back="updateDocumentVisible = false"
        >
        </el-page-header>
      </div>
      <div style="padding: 0 20px">
        <FormUpdateDocument
          :category-trees="categoryTrees"
          :init-document="document"
          :is-admin="false"
          @success="updateDocumentSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  deleteDocument,
  getDocument,
  listDocument,
  searchDocument,
} from '~/api/document'
import { formatBytes, formatRelativeTime, getIcon } from '~/utils/utils'
import { datetimePickerOptions, documentStatusOptions } from '~/utils/enum'

export default {
  name: 'UserDocument',
  props: {
    userId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      datetimePickerOptions,
      documentStatusOptions,
      documentStatusOptionsMap: {},
      docs: [],
      total: 0,
      loading: false,
      query: {
        page: parseInt(this.$route.query.page) || 1,
        size: 20,
        wd: this.$route.query.wd || '',
        created_at: [],
      },
      updateDocumentVisible: false,
      document: { id: 0 },
      updating: false,
      showAdvancedFilters: false,
    }
  },
  computed: {
    ...mapGetters('user', ['user', 'permissions']),
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('setting', ['settings']),
    canManageDocuments() {
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
          size: parseInt(this.$route.query.size) || 20,
          created_at: Array.isArray(this.$route.query.created_at)
            ? this.$route.query.created_at
            : [],
        }
        this.getDocuments()
      },
      immediate: true,
    },
  },
  created() {
    const statusMap = {}
    this.documentStatusOptions.forEach((item) => {
      statusMap[item.value] = item
    })
    this.documentStatusOptionsMap = statusMap
  },
  methods: {
    formatBytes,
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
    getDocumentCover(row) {
      const icon = row.icon || 'other'
      const hasLargeCover = [
        'pdf',
        'word',
        'excel',
        'ppt',
        'text',
        'epub',
        'mobi',
        'chm',
        'umd',
        'other',
        'code',
      ]

      if (hasLargeCover.includes(icon)) {
        return `/static/images/${icon}_54.png`
      }

      return `/static/images/${icon}_24.png`
    },
    formatScore(score) {
      return Number(score || 0).toFixed(score ? 1 : 0)
    },
    async updateDocument(row) {
      this.updating = true
      await this.getDocument(row.id)
      this.updating = false
      this.updateDocumentVisible = true
    },
    async getDocument(id) {
      const res = await getDocument({ id, with_all_content: true })
      if (res.status === 200) {
        this.document = res.data || { id: 0 }
      }
    },
    updateDocumentSuccess() {
      this.updateDocumentVisible = false
      this.getDocuments()
    },
    onSearch() {
      this.query.page = 1
      this.$router.push({
        path: this.$route.path,
        query: this.buildQuery(),
      })
    },
    async getDocuments() {
      if (this.userId === 0 || this.loading) return
      this.loading = true
      let res
      if (this.query.wd) {
        res = await searchDocument({
          ...this.query,
          user_id: this.userId,
        })
      } else {
        res = await listDocument({
          ...this.query,
          user_id: this.userId,
        })
      }

      if (res.status === 200) {
        const docs = res.data.document || []
        docs.map((item) => {
          item.score = item.score / 100 || 0.0
          try {
            item.icon = getIcon(item.ext)
          } catch (e) {
            item.icon = 'other'
          }
          return item
        })
        this.docs = docs
        this.total = res.data.total || 0
      }
      this.loading = false
    },
    pageChange(page) {
      this.$router.push({
        query: { ...this.buildQuery(), page },
      })
    },
    deleteDocument(row) {
      this.$confirm(`您确定要删除文档《${row.title}》吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const res = await deleteDocument({ id: row.id })
        if (res.status === 200) {
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          this.getDocuments()
        }
      })
    },
    filterStatus(status) {
      return (
        this.documentStatusOptionsMap[status] || {
          value: status,
          label: '未知',
          type: 'info',
        }
      )
    },
  },
}
</script>

<style lang="scss">
.com-user-document {
  .document-filter-panel {
    padding: 20px 24px 14px;
    border: 1px solid #edf1f7;
    border-radius: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
  }

  .document-filter-form {
    position: relative;
  }

  .document-filter-form__main {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .document-filter-form__keyword {
    flex: 1;
    margin-bottom: 0;

    .el-input__inner {
      height: 48px;
      border-radius: 12px;
      border-color: #edf1f7;
      background-color: #fff;
    }
  }

  .document-filter-form__actions {
    display: flex;
    gap: 12px;

    .el-button {
      min-width: 88px;
      height: 48px;
      border-radius: 10px;
      padding: 0 22px;
    }
  }

  .document-filter-form__advanced {
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

  .document-filter-toggle {
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

  .document-summary {
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

  .document-list {
    border: 1px solid #edf1f7;
    border-radius: 16px;
    overflow: hidden;
    background-color: #fff;
  }

  .document-list__head,
  .document-row {
    display: grid;
    grid-template-columns: 36px minmax(0, 1.7fr) minmax(180px, 260px) 92px;
    column-gap: 18px;
    align-items: center;
  }

  .document-list.without-actions {
    .document-list__head,
    .document-row {
      grid-template-columns: 36px minmax(0, 1.9fr) minmax(180px, 280px);
    }
  }

  .document-list__head {
    padding: 16px 22px;
    background-color: #f6f8fb;
    color: #4b5563;
    font-size: 14px;
    font-weight: 600;
  }

  .document-list__body {
    min-height: 120px;
  }

  .document-row {
    padding: 22px;
    border-top: 1px solid #f1f4f8;
  }

  .document-row__select {
    display: flex;
    justify-content: center;
  }

  .document-row__info {
    display: flex;
    align-items: flex-start;
    min-width: 0;
    gap: 16px;
  }

  .document-row__cover {
    width: 54px;
    min-width: 54px;
    height: 72px;
    border: 1px solid #edf1f7;
    border-radius: 8px;
    background: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }
  }

  .document-row__content {
    min-width: 0;
    padding-top: 4px;
  }

  .document-row__title {
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

  .document-row__meta {
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

  .document-row__stats {
    color: #6b7280;
    font-size: 14px;
  }

  .document-row__stat-line {
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

  .document-row__rating {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;

    .el-rate {
      height: auto;
      line-height: 1;
    }

    .el-rate__icon {
      margin-right: 2px;
      font-size: 14px;
    }
  }

  .document-row__rating-value {
    color: #f59e0b;
    font-weight: 600;
  }

  .document-row__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;

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
}

@media screen and (max-width: 1200px) {
  .com-user-document {
    .document-list__head,
    .document-row {
      grid-template-columns: 36px minmax(0, 1fr) 180px 78px;
    }

    .document-list.without-actions {
      .document-list__head,
      .document-row {
        grid-template-columns: 36px minmax(0, 1fr) 180px;
      }
    }

    .document-row__title {
      font-size: 18px;
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .com-user-document {
    .document-filter-panel {
      padding: 16px;
      border-radius: 14px;
    }

    .document-filter-form__main {
      flex-direction: column;
      align-items: stretch;
    }

    .document-filter-form__actions {
      width: 100%;

      .el-button {
        flex: 1;
      }
    }

    .document-filter-form__advanced {
      .el-date-editor {
        width: 100%;
        max-width: none;
      }
    }

    .document-summary {
      margin-top: 18px;

      strong {
        font-size: 20px;
      }
    }

    .document-list {
      border-radius: 14px;
    }

    .document-list__head {
      display: none;
    }

    .document-row,
    .document-list.without-actions .document-row {
      grid-template-columns: 1fr;
      row-gap: 14px;
      padding: 18px 16px;
    }

    .document-row__select {
      display: none;
    }

    .document-row__info {
      gap: 12px;
    }

    .document-row__cover {
      width: 48px;
      min-width: 48px;
      height: 64px;
    }

    .document-row__title {
      font-size: 16px;
      white-space: normal;
      line-clamp: 2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .document-row__stats,
    .document-row__actions {
      padding-left: 60px;
    }

    .document-row__actions {
      flex-direction: row;
      gap: 14px;
    }

    .el-pagination {
      text-align: center;
    }
  }
}
</style>
