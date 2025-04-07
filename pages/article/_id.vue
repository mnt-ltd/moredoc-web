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
              <img
                v-if="article.recommend_at"
                class="icon-recommend"
                src="/static/images/recommend.png"
                alt="推荐"
              />
              <div
                v-if="
                  user.id > 0 &&
                  (accessDelete ||
                    accessRecommend ||
                    accessUpdate ||
                    accessForbiden)
                "
                class="actions"
              >
                <el-button
                  v-if="accessDelete"
                  type="text"
                  icon="el-icon-delete"
                  @click="deleteArticle"
                  >删除文章</el-button
                >
                <nuxt-link
                  v-if="accessUpdate"
                  :to="`/post?identifier=${article.identifier}`"
                >
                  <el-button type="text" icon="el-icon-edit"
                    >编辑文章</el-button
                  >
                </nuxt-link>
                <template>
                  <!-- 管理员权限 -->
                  <el-dropdown v-if="accessForbiden" @command="checkArticle">
                    <span class="el-dropdown-link">
                      <el-button type="text" icon="el-icon-document-checked"
                        >文章审批</el-button
                      >
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="pass"
                        >审核通过</el-dropdown-item
                      >
                      <el-dropdown-item command="reject"
                        >审核拒绝</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                  <el-dropdown
                    v-if="accessRecommend"
                    @command="recommendArticle"
                  >
                    <span class="el-dropdown-link">
                      <el-button type="text"
                        ><i class="fa fa-thumbs-up"></i> 推荐设置</el-button
                      >
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="cancel"
                        >取消推荐</el-dropdown-item
                      >
                      <el-dropdown-item command="recommend"
                        >推荐文章</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
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
            <div
              ref="viewer"
              v-viewer
              data-slate-editor
              v-html="article.content"
            ></div>
            <div v-if="!article.id" style="min-height: 100vh"></div>
          </article>
          <div v-if="article.source || article.source_url" class="source">
            <span>来源:</span>
            <div v-if="article.source">{{ article.source }}</div>
            <div v-if="article.source_url">
              <a
                class="el-link el-link--default"
                target="_blank"
                :href="article.source_url"
                >{{ article.source_url }}</a
              >
            </div>
          </div>
          <el-row v-if="article.id > 0" class="btn-actions">
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
    <WxShare
      v-if="article.id > 0"
      :share-data="{
        title: article.title,
        imgUrl: shareImage,
        desc: article.description,
      }"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  getArticle,
  getRelatedArticles,
  deleteArticle,
  recommendArticles,
  checkArticles,
} from '~/api/article'
import ShareBox from '~/components/ShareBox.vue'
import { getFavorite, createFavorite, deleteFavorite } from '~/api/favorite'
import { categoryToTrees, formatRelativeTime } from '~/utils/utils'
import WxShare from '~/components/WxShare.vue'
export default {
  components: { ShareBox, WxShare },
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
      shareImage: '',
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
    ...mapGetters('category', ['categoryMap', 'categoryTrees', 'categories']),
    ...mapGetters('user', ['user', 'permissions']),
    accessUpdate() {
      if (this.user.id === this.article.user_id) {
        return true
      }
      return (
        this.permissions.filter((item) => item.path.endsWith('UpdateArticle'))
          .length > 0
      )
    },
    accessDelete() {
      if (this.user.id === this.article.user_id) {
        return true
      }
      return (
        this.permissions.filter((item) => item.path.endsWith('DeleteArticle'))
          .length > 0
      )
    },
    accessRecommend() {
      return (
        this.permissions.filter((item) =>
          item.path.endsWith('RecommendArticles')
        ).length > 0
      )
    },
    accessForbiden() {
      return (
        this.permissions.filter((item) => item.path.endsWith('UpdateArticle'))
          .length > 0
      )
    },
  },
  async created() {
    if (this.categories.length === 0) {
      await this.getCategories()
    }
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
    ...mapActions('category', ['getCategories']),
    formatRelativeTime,
    async getArticle() {
      const res = await getArticle({ identifier: this.$route.params.id })
      if (res.status !== 200) {
        this.$nuxt.error({
          statusCode: 404,
          message: res.data.message || '',
        })
        return
      }
      const article = {
        favorite_count: 0,
        ...res.data,
      }

      const breadcrumbs = []
      const trees = categoryToTrees(article.category || [])
      if (trees.length > 0) {
        breadcrumbs.push(trees[0])
        while (trees[0].children && trees[0].children.length > 0) {
          trees[0] = trees[0].children[0]
          breadcrumbs.push(trees[0])
        }
      }
      this.breadcrumbs = breadcrumbs
      this.article = article
      this.getRelatedArticles()

      this.$nextTick(() => {
        setTimeout(() => {
          try {
            // 如果是移动端，则直接返回
            if (this.isMobile) return
            const viewer = this.$refs.viewer.$viewer
            viewer.options.url = 'src' // 设置图片地址，之前已经全局设置为了data-source，不过只在移动端应用。这里的修改是为了PC端应用
            viewer.update()

            // 设置shareImage
            document.querySelectorAll('article').forEach((item) => {
              const img = item.querySelector('img')
              if (!this.shareImage) {
                this.shareImage = img.src
              }
            })
          } catch (error) {}
          if (!this.shareImage) {
            if (this.settings.system.logo.indexOf('http') === 0) {
              this.shareImage = this.settings.system.logo
            } else {
              this.shareImage = location.origin + this.settings.system.logo
            }
          }
        }, 1000) // 设置延迟，等待内容渲染完成
      })
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
    deleteArticle() {
      this.$confirm('此操作将删除该文章, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const res = await deleteArticle({ id: this.article.id })
          if (res.status === 200) {
            this.$message.success('删除成功')
            this.$router.push('/article')
          } else {
            this.$message.error(res.data.message || '删除失败')
          }
        })
        .catch(() => {})
    },
    async recommendArticle(command) {
      const res = await recommendArticles({
        article_id: [this.article.id],
        is_recommend: command === 'recommend',
      })
      if (res.status === 200) {
        this.$message.success('操作成功')
        this.getArticle()
      } else {
        this.$message.error(res.data.message)
      }
    },
    async checkArticle(command) {
      const res = await checkArticles({
        article_id: [this.article.id],
        status: command === 'pass' ? 1 : 2,
      })
      if (res.status === 200) {
        this.$message.success('操作成功')
        this.getArticle()
      } else {
        this.$message.error(res.data.message)
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
      .icon-recommend {
        height: 30px;
        vertical-align: middle;
      }
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
    line-height: 180%;
    min-height: 300px;
    word-wrap: break-word;
    img {
      max-width: 100% !important;
      cursor: zoom-in;
      height: auto !important;
      &:hover {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 4px !important;
        overflow: hidden;
      }
    }
    .w-e-text-container [data-slate-editor] blockquote {
      border-left-width: 4px !important;
    }
    blockquote {
      padding: 10px;
      color: #777;
      font-size: 0.95em;
      background-color: #f6f8fa;
    }
  }
  .source {
    margin: 20px 0;
    line-height: 1.7;
    font-size: 14px;
    background-color: #f9f9f9;
    padding: 10px;
    border-radius: 3px;
    position: relative;
    color: #666;
    border-left: 5px solid #ddd;
    span {
      color: #ccc;
      display: block;
    }
    a {
      color: #409eff;
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
  @media screen and (max-width: 768px) {
    .article-list {
      position: relative !important;
      width: 100% !important;
      top: 0 !important;
    }
  }
}
</style>
