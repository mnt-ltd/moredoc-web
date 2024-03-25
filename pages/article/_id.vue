<template>
  <div class="page page-article">
    <el-row :gutter="20">
      <el-col :span="18" :xs="24">
        <el-card shadow="never">
          <div slot="header">
            <h1>
              <template v-if="article.id > 0">
                <template v-if="article.status != 1">
                  (
                  <span v-if="article.status == 2" class="text-danger"
                    >审核拒绝</span
                  >
                  <span v-else class="text-warning">待审核</span>
                  )
                </template>
              </template>
              {{ article.title }}
            </h1>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>
                <nuxt-link to="/"><i class="fa fa-home"></i> 首页</nuxt-link>
              </el-breadcrumb-item>
              <el-breadcrumb-item>
                <nuxt-link to="/article">文章</nuxt-link>
              </el-breadcrumb-item>
              <template v-if="breadcrumbs.length < 3">
                <el-breadcrumb-item
                  v-for="breadcrumb in breadcrumbs"
                  :key="'bread-' + breadcrumb.id"
                >
                  <nuxt-link :to="`/article?category_id=${breadcrumb.id}`">
                    {{ breadcrumb.title }}
                  </nuxt-link>
                </el-breadcrumb-item>
              </template>
              <template v-else>
                <el-breadcrumb-item>
                  <nuxt-link :to="`/article?category_id=${breadcrumbs[0].id}`">
                    {{ breadcrumbs[0].title }}
                  </nuxt-link>
                </el-breadcrumb-item>
                <el-breadcrumb-item>...</el-breadcrumb-item>
                <el-breadcrumb-item>
                  <nuxt-link
                    :to="`/article?category_id=${
                      breadcrumbs[breadcrumbs.length - 1].id
                    }`"
                    >{{ breadcrumbs[breadcrumbs.length - 1].title }}</nuxt-link
                  >
                </el-breadcrumb-item>
              </template>
              <el-breadcrumb-item>文章详情</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="help-block text-muted article-info hidden-xs-only">
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
              {{ article.comment_count || 0 }} 评论</span
            >
            <span class="float-right"
              ><i class="el-icon-time"></i>
              <span class="hidden-xs-only">发布:</span
              >{{ formatRelativeTime(article.created_at) }}
            </span>
          </div>
          <div v-if="article.id > 0" class="hidden-sm-and-up">
            <!-- 展示文章作者信息 -->
            <div class="m-userinfo">
              <div>
                <nuxt-link :to="'/user/' + article.user_id">
                  <UserAvatar :size="32" :user="article.user" />
                </nuxt-link>
              </div>
              <div class="user-profile">
                <nuxt-link
                  class="el-link el-link--default"
                  :to="'/user/' + article.user_id"
                >
                  <strong>{{ article.user.username }}</strong>
                </nuxt-link>
                <div>
                  <small class="help-block">
                    发布于 {{ formatRelativeTime(article.created_at) }}
                  </small>
                </div>
              </div>
              <div class="article-info">
                <span
                  ><i class="el-icon-view"></i>
                  {{ article.view_count || 0 }}</span
                >
                <span>
                  <i class="el-icon-star-off"></i>
                  {{ article.favorite_count || 0 }}
                </span>
                <span>
                  <i class="el-icon-chat-dot-square"></i>
                  {{ article.comment_count || 0 }}
                </span>
              </div>
            </div>
          </div>
          <article class="mgt-20px markdown-body">
            <el-alert
              v-if="article.status === 2 && article.reject_reason"
              title="审核拒绝原因"
              type="error"
            >
              {{ article.reject_reason }}
            </el-alert>
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
                :size="isMobile ? 'medium' : 'large'"
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
            :type="1"
            class="mgt-20px"
            @success="commentSuccess"
          />
          <comment-list
            v-if="article.id > 0"
            ref="commentList"
            :document-id="article.id"
            :type="1"
          />
        </el-card>
      </el-col>
      <el-col :span="6" :xs="24" class="article-right">
        <el-card shadow="never" class="hidden-xs-only">
          <div slot="header">分享用户</div>
          <user-card
            :hide-actions="true"
            :type="'article'"
            :user="article.user"
          />
        </el-card>
        <el-card
          v-if="relatedArticles.length > 0"
          ref="relArt"
          shadow="never"
          class="mgt-20px article-list"
        >
          <div slot="header">相关文章</div>
          <article-simple-list
            :articles="relatedArticles"
          ></article-simple-list>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getArticle, getRelatedArticles } from '~/api/article'
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
      breadcrumbs: [],
      relatedArticles: [],
      cardWidth: 0,
      cardOffsetTop: 0,
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
    ...mapGetters('category', ['categoryMap', 'categoryTrees']),
    ...mapGetters('user', ['user']),
  },
  async created() {
    await this.getArticle()
    await this.getFavorite()
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    formatRelativeTime,
    async getArticle() {
      const res = await getArticle({ identifier: this.$route.params.id })
      if (res.status !== 200) {
        this.$message.error(res.data.message || '查询失败')
        this.$router.push('/404')
        return
      }
      const article = {
        favorite_count: 0,
        ...res.data,
      }

      const breadcrumbs = []
      const tmpBreadcrumbs = (article.category_id || []).map((id) => {
        const breadcrumb = this.categoryMap[id]
        if (!breadcrumb.parent_id) {
          breadcrumbs.push(breadcrumb)
        }
        return breadcrumb
      })

      const length = tmpBreadcrumbs.length
      for (let j = 0; j < length; j++) {
        for (let i = 0; i < tmpBreadcrumbs.length; i++) {
          const breadcrumb = tmpBreadcrumbs[i]
          if (breadcrumb.parent_id === breadcrumbs[breadcrumbs.length - 1].id) {
            breadcrumbs.push(breadcrumb)
            tmpBreadcrumbs.splice(i, 1)
            break
          }
        }
      }

      this.breadcrumbs = breadcrumbs
      this.article = article
      this.getRelatedArticles()
    },
    async getRelatedArticles() {
      const res = await getRelatedArticles({
        identifier: this.article.identifier,
      })
      if (res.status === 200) {
        this.relatedArticles = res.data.article || []
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
    commentSuccess() {
      this.$refs.commentList.getComments()
    },
    handleScroll() {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop
      try {
        const relArt = this.$refs.relArt.$el
        if (relArt) {
          if (this.cardWidth === 0) {
            this.cardWidth = relArt.offsetWidth
            this.cardOffsetTop = relArt.offsetTop
          }

          if (scrollTop > this.cardOffsetTop) {
            relArt.style.position = 'fixed'
            relArt.style.top = '60px'
            relArt.style.zIndex = '999'
            relArt.style.width = `${this.cardWidth}px`
          } else {
            relArt.style = null
          }
        }
      } catch (error) {
        console.log('handleScroll relArt', error)
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
  .m-userinfo {
    display: flex;
    align-items: center;
    color: #999;
    .user-profile {
      margin-left: 10px;
      position: relative;
      top: -4px;
    }
    small {
      font-size: 12px;
    }
    .article-info {
      margin-top: 15px;
      color: #999;
      font-size: 12px;
      flex: 1;
      text-align: right;
      span {
        margin-right: 0;
        margin-left: 10px;
      }
    }
  }
}
</style>
