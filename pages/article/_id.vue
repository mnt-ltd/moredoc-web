<template>
  <div class="page page-article">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card shadow="never">
          <div slot="header">
            <h1>{{ article.title }}</h1>
          </div>
          <div class="help-block text-muted article-info">
            <span
              ><i class="el-icon-view"></i>
              {{ article.view_count || 0 }} 阅读</span
            >
            <span
              ><i class="el-icon-star-off"></i>
              {{ article.favorite_count || 0 }} 收藏</span
            >
            <span
              ><i class="el-icon-chat-dot-square"></i>
              {{ article.favorite_count || 0 }} 评论</span
            >
            <span class="float-right"
              ><i class="el-icon-time"></i>
              <span class="hidden-xs-only">发布:</span
              >{{ formatRelativeTime(article.created_at) }}
            </span>
          </div>
          <article class="mgt-20px markdown-body">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div data-slate-editor v-html="article.content"></div>
          </article>
          <el-row class="btn-actions">
            <el-col :span="12">
              <share-box :title="article.title" />
            </el-col>
            <el-col :span="12" class="text-right">
              <el-button
                v-if="favorite.id > 0"
                type="primary"
                icon="el-icon-star-on"
                @click="deleteFavorite"
                >取消收藏</el-button
              >
              <el-button
                v-else
                type="primary"
                icon="el-icon-star-off"
                @click="createFavorite"
                >收藏文章</el-button
              >
            </el-col>
          </el-row>
        </el-card>
        <el-card shadow="never" class="mgt-20px">
          <FormComment
            :document-id="article.id"
            class="mgt-20px"
            @success="commentSuccess"
          />
          <comment-list ref="commentList" :document-id="article.id" />
        </el-card>
      </el-col>
      <el-col :span="6" class="article-list">
        <el-card shadow="never">
          <div slot="header">相关文章</div>
          <nuxt-link to="/" class="el-link el-link--default"
            >关于我们</nuxt-link
          >
          <nuxt-link to="/" class="el-link el-link--default"
            >联系我们</nuxt-link
          >
          <nuxt-link to="/" class="el-link el-link--default"
            >免责声明</nuxt-link
          >
        </el-card>
        <el-card shadow="never" class="mgt-20px">
          <div slot="header">最新推荐</div>
          <nuxt-link to="/" class="el-link el-link--default"
            >关于我们</nuxt-link
          >
          <nuxt-link to="/" class="el-link el-link--default"
            >联系我们</nuxt-link
          >
          <nuxt-link to="/" class="el-link el-link--default"
            >免责声明</nuxt-link
          >
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getArticle } from '~/api/article'
import ShareBox from '~/components/ShareBox.vue'
import { getFavorite, createFavorite, deleteFavorite } from '~/api/favorite'
import { formatRelativeTime } from '~/utils/utils'
export default {
  components: { ShareBox },
  data() {
    return {
      id: this.$route.params.id,
      article: {},
      editor: null,
      editorConfig: {
        readOnly: true,
      },
      favorite: {
        id: 0,
      },
    }
  },
  head() {
    return {
      title: `${this.article.title} - ${this.settings.system.sitename}`,
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: this.article.keywords,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.article.description,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    ...mapGetters('user', ['user']),
  },
  async created() {
    await this.getArticle()
    await this.getFavorite()
  },
  methods: {
    formatRelativeTime,
    async getArticle() {
      const res = await getArticle({ identifier: this.$route.params.id })
      if (res.status === 200) {
        this.article = {
          favorite_count: 0,
          ...res.data,
        }
      } else {
        this.$message.error(res.data.message || '查询失败')
        this.$router.push('/404')
      }
    },
    async getFavorite() {
      if (!this.user.id) {
        return
      }
      const res = await getFavorite({ document_id: this.article.id, type: 1 })
      if (res.status === 200) {
        this.favorite = res.data
      }
    },
    async createFavorite() {
      if (!this.user.id) {
        this.$message.error('请先登录')
        return
      }
      const res = await createFavorite({
        document_id: this.article.id,
        type: 1,
      })
      if (res.status === 200) {
        this.favorite = res.data
        this.article.favorite_count++
        this.$message.success('收藏成功')
      } else {
        this.$message.error(res.data.message || '收藏失败')
      }
    },
    async deleteFavorite() {
      if (!this.user.id) {
        this.$message.error('请先登录')
        return
      }
      const res = await deleteFavorite({ id: this.favorite.id })
      if (res.status === 200) {
        this.favorite = { id: 0 }
        this.article.favorite_count--
        this.$message.success('取消收藏成功')
      } else {
        this.$message.error(res.data.message || '取消收藏失败')
      }
    },
  },
}
</script>
<style lang="scss">
.page-article {
  .el-breadcrumb {
    margin-top: 15px;
    .el-breadcrumb__inner a,
    .el-breadcrumb__inner.is-link {
      color: #666;
    }
    .el-breadcrumb__item:last-child .el-breadcrumb__inner {
      color: #777;
    }
    .el-breadcrumb__inner a:hover,
    .el-breadcrumb__inner.is-link:hover {
      color: #409eff;
    }
  }
  .el-card__header {
    h1 {
      font-size: 24px;
      font-weight: 400;
      margin: 0;
      color: #111;
    }
  }
  [data-w-e-type='todo'] {
    input {
      margin-right: 5px;
    }
  }
  .article-info {
    font-size: 13px;
    span {
      margin-right: 10px;
      &.float-right {
        margin-right: 0;
      }
    }
  }
  .article-list {
    .el-card__body {
      padding-top: 10px;
    }
    a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px dashed #efefef;
    }
  }
  article {
    img {
      max-width: 100%;
    }
    .w-e-text-container [data-slate-editor] blockquote {
      border-left-width: 4px !important;
    }
    line-height: 180%;
    blockquote {
      padding: 10px;
      color: #777;
      font-size: 0.95em;
      background-color: #f6f8fa;
    }
  }
}
</style>
