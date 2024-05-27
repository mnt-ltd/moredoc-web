<template>
  <div class="com-user-article">
    <!-- 文章搜索表单 -->
    <el-form
      :inline="true"
      :model="query"
      class="demo-form-inline"
      @submit.native.prevent
    >
      <el-form-item>
        <el-input
          v-model="query.wd"
          placeholder="请输入关键字"
          clearable
          size="medium"
          @keydown.enter.native="onSearch"
        ></el-input>
      </el-form-item>
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
      <el-form-item>
        <el-button
          type="primary"
          size="medium"
          icon="el-icon-search"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="articles" style="width: 100%">
      <el-table-column prop="title" label="标题" min-width="300">
        <template slot-scope="scope">
          <el-tooltip
            :content="scope.row.title"
            :disabled="query.wd"
            placement="right"
          >
            <nuxt-link
              target="_blank"
              :to="{
                name: 'article-id',
                params: { id: scope.row.identifier },
              }"
              class="el-link el-link--default doc-title"
            >
              <span v-if="isSearch" v-html="scope.row.title"></span>
              <span v-else>{{ scope.row.title }}</span>
            </nuxt-link>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        v-if="showPrivateData"
        prop="status"
        label="状态"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag
            :type="filterStatus(scope.row.status).type"
            size="mini"
            effect="plain"
          >
            {{ filterStatus(scope.row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="view_count" label="阅读" width="100">
        <template slot-scope="scope">{{ scope.row.view_count || 0 }}</template>
      </el-table-column>
      <el-table-column prop="comment_count" label="评论" width="100">
        <template slot-scope="scope">{{
          scope.row.comment_count || 0
        }}</template>
      </el-table-column>
      <el-table-column prop="favorite_count" label="收藏" width="100">
        <template slot-scope="scope">{{
          scope.row.favorite_count || 0
        }}</template>
      </el-table-column>

      <el-table-column prop="created_at" label="发布" width="100">
        <template slot-scope="scope">
          <el-tooltip
            :content="formatDatetime(scope.row.created_at)"
            placement="top"
          >
            <span>{{ formatRelativeTime(scope.row.created_at) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        v-if="userId === user.id"
        label="操作"
        width="70"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-tooltip content="编辑文章" placement="top">
            <el-button
              type="text"
              icon="el-icon-edit"
              @click="updateArticle(scope.row)"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="删除文章" placement="top">
            <el-button
              type="text"
              icon="el-icon-delete"
              @click="deleteArticle(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
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
import { formatBytes, formatDatetime, formatRelativeTime } from '~/utils/utils'
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
      languageMap: {},
      articles: [],
      total: 0,
      loading: false,
      query: {
        page: parseInt(this.$route.query.page) || 1,
        size: 20,
        wd: '',
        created_at: [],
      },
      article: { id: 0 },
      isSearch: false,
    }
  },
  computed: {
    ...mapGetters('user', ['user', 'permissions']),
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('setting', ['settings']),
    showPrivateData() {
      // 如果是用户自身或者是网站管理员则显示私有数据
      return this.userId === this.user.id || this.permissions.length > 0
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.query = {
          ...this.$route.query,
          page: parseInt(this.$route.query.page) || 1,
          size: parseInt(this.$route.query.size) || 20,
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

    const languageMap = {}
    ;(this.settings.language || []).forEach((item) => {
      languageMap[item.code] = item
    })
    this.languageMap = languageMap
    this.getArticles()
  },
  methods: {
    formatBytes,
    formatDatetime,
    formatRelativeTime,
    updateArticle(row) {
      this.$router.push({
        path: '/post',
        query: { identifier: row.identifier },
      })
    },
    tabClick(tab) {
      this.activeTab = tab.name
    },
    onSearch() {
      this.query.page = 1
      this.$router.push({
        path: this.$route.path,
        query: this.query,
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
        query: { ...this.query, page },
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
    filterLanguage(lang) {
      return (
        this.languageMap[lang] || {
          value: lang || '-',
          label: lang || '-',
          type: 'info',
        }
      )
    },
  },
}
</script>

<style lang="scss">
.com-user-article {
  .doc-title {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 180%;
    img {
      height: 18px;
      position: relative;
      top: 3px;
    }
  }
}
</style>
