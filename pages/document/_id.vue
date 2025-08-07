<template>
  <div class="page page-document">
    <el-row :gutter="20">
      <el-col :span="scaleSpan" class="doc-left">
        <el-card ref="docMain" shadow="never" class="doc-main">
          <div slot="header" class="clearfix">
            <h1 v-if="document.id > 0">
              <img
                :src="`/static/images/${document.icon}_24.png`"
                :alt="`${document.icon}文档`"
              />
              {{ document.title }}
              <img
                v-if="document.recommend_at"
                class="icon-recommend"
                src="/static/images/recommend.png"
                alt="推荐"
              />
              <el-popover
                v-show="document.id > 0"
                class="hidden-xs-only"
                placement="bottom"
                width="200"
                trigger="hover"
              >
                <div id="qrcode" ref="qrcode" class="qrcode text-center"></div>
                <span slot="reference">
                  <span target="_blank" class="share-wechat">
                    <i class="fa fa-qrcode"></i>
                  </span>
                </span>
              </el-popover>
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
                  v-if="accessUpdate"
                  type="text"
                  icon="el-icon-edit"
                  :loading="showUpdating"
                  @click="showUpdateDocument"
                  >编辑文档</el-button
                >
                <el-button
                  v-if="accessDelete"
                  type="text"
                  icon="el-icon-delete"
                  @click="deleteDocument"
                  >删除文档</el-button
                >
                <template>
                  <!-- 管理员权限 -->
                  <el-dropdown v-if="accessForbiden" @command="setForbiden">
                    <span class="el-dropdown-link">
                      <el-button type="text" icon="el-icon-no-smoking">
                        文档启禁</el-button
                      >
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="disable"
                        >禁用文档</el-dropdown-item
                      >
                      <el-dropdown-item command="enable"
                        >启用文档</el-dropdown-item
                      >
                    </el-dropdown-menu> </el-dropdown
                  >&nbsp;
                  <el-dropdown v-if="accessRecommend" @command="setRecommend">
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
                        >推荐文档</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </div>
            </h1>
            <el-skeleton v-else animated>
              <template slot="template"
                ><el-skeleton-item variant="h1" style="width: 70%"
              /></template>
            </el-skeleton>
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item>
                <nuxt-link to="/">
                  <i class="el-icon-s-home"></i> 首页
                </nuxt-link>
              </el-breadcrumb-item>
              <el-breadcrumb-item>
                <nuxt-link to="/category">全部文档</nuxt-link>
              </el-breadcrumb-item>
              <template v-if="breadcrumbs.length < 3">
                <el-breadcrumb-item
                  v-for="breadcrumb in breadcrumbs"
                  :key="'bread-' + breadcrumb.id"
                >
                  <nuxt-link :to="`/category/${breadcrumb.id}`">
                    {{ breadcrumb.title }}
                  </nuxt-link>
                </el-breadcrumb-item>
              </template>
              <template v-else>
                <el-breadcrumb-item>
                  <nuxt-link :to="`/category/${breadcrumbs[0].id}`">
                    {{ breadcrumbs[0].title }}
                  </nuxt-link>
                </el-breadcrumb-item>
                <el-breadcrumb-item>...</el-breadcrumb-item>
                <el-breadcrumb-item>
                  <nuxt-link
                    :to="`/category/${breadcrumbs[breadcrumbs.length - 1].id}`"
                    >{{ breadcrumbs[breadcrumbs.length - 1].title }}</nuxt-link
                  >
                </el-breadcrumb-item>
              </template>
              <el-breadcrumb-item>文档阅览</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="float-right doc-info">
              <span>
                <!-- 显示文档大小 -->
                <i class="el-icon-document"></i>
                {{ formatBytes(document.size) }}
              </span>
              <span>
                <i class="el-icon-files"></i>
                {{ document.pages || '-' }} 页
              </span>
              <span v-if="settings.display.show_document_download_count">
                <i class="el-icon-download"></i>
                {{ document.download_count || 0 }} 下载
              </span>
              <span v-if="settings.display.show_document_view_count">
                <i class="el-icon-view"></i>
                {{ document.view_count || 0 }} 浏览
              </span>
              <span>
                <i class="el-icon-chat-dot-square"></i>
                {{ document.comment_count || 0 }} 评论
              </span>
              <span v-if="settings.display.show_document_favorite_count">
                <i class="el-icon-star-off"></i>
                {{ document.favorite_count || 0 }} 收藏
              </span>
              <span v-if="!settings.display.show_document_descriptions">
                <el-rate
                  v-model="document.score"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                ></el-rate>
              </span>
            </div>
          </div>
          <template v-if="tips">
            <el-alert
              type="warning"
              effect="dark"
              :title="tips"
              show-icon
              :closable="false"
            ></el-alert>
            <div class="mgt-20px"></div>
          </template>

          <template v-for="item in advertisements">
            <div
              v-if="item.position == 'document_top'"
              :key="item.position + item.id"
              v-html="item.content"
            ></div>
          </template>

          <el-descriptions
            v-if="settings.display.show_document_descriptions"
            class="document-descriptions"
            :column="isMobile ? 1 : 3"
            border
            direction="vertical"
          >
            <el-descriptions-item
              v-for="item in descriptions"
              :key="'desc-' + item.label"
              :span="item.name == 'description' ? 3 : 1"
              label-class-name="descriptions-label"
            >
              <template slot="label">
                <i :class="item.icon"></i>
                {{ item.label }}
              </template>
              <span v-if="item.name === 'score'">
                <el-rate
                  v-model="item.value"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                ></el-rate>
              </span>
              <div v-else-if="item.name === 'description'">
                <div v-if="item.value.length > 255">
                  <div
                    ref="description"
                    class="description"
                    :class="showContent ? 'description-lg' : ''"
                  >
                    {{ item.value }}
                  </div>
                  <div class="text-center">
                    <el-button
                      v-if="showContent"
                      type="text"
                      icon="el-icon-arrow-up"
                      size="mini"
                      @click="toggleContent"
                      >收起内容</el-button
                    >
                    <el-button
                      v-else
                      type="text"
                      icon="el-icon-arrow-down"
                      size="mini"
                      @click="toggleContent"
                      >展开内容</el-button
                    >
                  </div>
                </div>
                <div v-else class="description">{{ item.value }}</div>
              </div>
              <div v-else>{{ item.value }}</div>
            </el-descriptions-item>
          </el-descriptions>
          <div ref="docPages" class="doc-pages" @contextmenu.prevent>
            <el-skeleton v-if="!document.id" animated>
              <template slot="template">
                <div style="background-color: #f6f6f6; padding: 5px">
                  <el-skeleton-item
                    variant="image"
                    style="width: 100%; height: 520px"
                  />
                  <div style="height: 5px"></div>
                  <el-skeleton-item
                    variant="image"
                    style="width: 100%; height: 520px"
                  />
                </div>
              </template>
            </el-skeleton>
            <div v-if="isMobile" v-viewer>
              <div v-for="(page, index) in pages" :key="index + page.src">
                <el-image
                  :src="page.src"
                  :alt="page.alt"
                  :data-source="page.lazySrc"
                  lazy
                  class="doc-page"
                  :style="{
                    width: pageWidth + 'px',
                    height: pageHeight + 'px',
                  }"
                ></el-image>
                <div
                  v-if="randomAdvertisement()"
                  class="doc-page"
                  v-html="randomAdvertisement().content"
                ></div>
              </div>
            </div>
            <div v-else>
              <div v-for="(page, index) in pages" :key="index + page.src">
                <el-image
                  :src="page.src"
                  :alt="page.alt"
                  :data-source="page.lazySrc"
                  lazy
                  class="doc-page"
                  :style="{
                    width: pageWidth + 'px',
                    height: pageHeight + 'px',
                  }"
                ></el-image>
                <div
                  v-if="randomAdvertisement()"
                  class="doc-page"
                  v-html="randomAdvertisement().content"
                ></div>
              </div>
            </div>
          </div>
          <div class="doc-page-more text-center">
            <div>下载文档到本地，方便使用</div>
            <el-button
              type="primary"
              icon="el-icon-download"
              :size="isMobile ? 'medium' : ''"
              :loading="downloading"
              @click="downloadDocument"
              >下载文档({{ formatBytes(document.size) }})</el-button
            >
            <div v-if="document.preview - pages.length > 0">
              共 {{ document.pages }} 页， 还有
              {{ document.preview - pages.length }} 页可预览，
              <span class="el-link el-link--primary" @click="continueRead"
                >继续阅读</span
              >
            </div>
            <template v-else>
              <div v-if="document.pages != document.preview" class="text-muted">
                <small>
                  - 可预览页数已用完，剩余
                  {{ document.pages - document.preview }} 页请下载阅读 -
                </small>
              </div>
            </template>
          </div>
          <div class="moreinfo">
            <div class="share-info">
              本文档由
              <nuxt-link
                :to="`/user/${document.user_id}`"
                class="el-link el-link--primary"
                >{{ document.user.username || '匿名用户' }}</nuxt-link
              >
              于
              <span class="text-muted">
                {{ formatDatetime(document.created_at) }}
              </span>
              上传分享
            </div>
            <div class="btn-actions">
              <el-button
                type="primary"
                :size="isMobile ? 'medium' : ''"
                plain
                icon="el-icon-warning-outline"
                @click="showReport"
                >举报</el-button
              >
              <!-- <el-button
                type="primary"
                icon="el-icon-download"
                class="float-right"
                :size="isMobile ? 'medium' : ''"
                :loading="downloading"
                @click="downloadDocument"
                >下载文档({{ formatBytes(document.size) }})</el-button
              >-->
              <el-button
                v-if="favorite.id > 0"
                type="primary"
                plain
                class="float-right hidden-xs-only"
                icon="el-icon-star-on"
                @click="deleteFavorite"
                >取消收藏</el-button
              >
              <el-button
                v-else
                type="primary"
                class="float-right hidden-xs-only"
                icon="el-icon-star-off"
                @click="createFavorite"
                >收藏</el-button
              >
            </div>
          </div>
        </el-card>
        <el-card
          v-if="isMobile && relatedDocuments.length > 0"
          shadow="never"
          class="mgt-20px relate-docs"
        >
          <div slot="header">相关文档</div>
          <document-simple-list
            :docs="isMobile ? relatedDocuments.slice(0, 5) : relatedDocuments"
            :show-popover="!isMobile"
          />
        </el-card>

        <template v-for="item in advertisements">
          <div
            v-if="item.position == 'document_bottom'"
            :key="item.position + item.id"
            v-html="item.content"
          ></div>
        </template>

        <el-card
          v-if="document.id > 0"
          ref="commentBox"
          shadow="never"
          class="mgt-20px"
        >
          <div>
            <span v-if="disabledScore" class="score-tips">我的评分</span>
            <span v-else class="score-tips">文档评分</span>
            <el-rate
              v-model="score"
              :disabled="disabledScore"
              show-text
              :texts="[
                '该文档令人失望',
                '该文档不怎么样',
                '该文档一般般',
                '该文档很让我满意',
                '该文档非常棒',
              ]"
              @change="setDocumentScore"
            ></el-rate>
          </div>
          <FormComment
            :document-id="document.id"
            class="mgt-20px"
            @success="commentSuccess"
          />
          <comment-list ref="commentList" :document-id="document.id" />
        </el-card>
      </el-col>
      <el-col :span="24 - scaleSpan" class="hidden-xs-only document-author">
        <el-card shadow="never">
          <div slot="header">分享用户</div>
          <user-card :hide-actions="true" :user="document.user" />
        </el-card>
        <el-card
          v-if="relatedDocuments.length > 0"
          ref="relateDocs"
          shadow="never"
          class="mgt-20px relate-docs"
        >
          <div slot="header">相关文档</div>
          <div :style="`max-height: ${footerTop - 188}px;overflow-y: auto;`">
            <document-simple-list :docs="relatedDocuments" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div class="fixed-buttons">
      <el-card shadow="never">
        <el-row>
          <el-col :span="18">
            <el-button-group class="btn-actions">
              <el-tooltip v-if="isMobile" content="文档点评">
                <el-button
                  icon="el-icon-chat-dot-square"
                  @click="gotoComment"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="全屏阅读" class="hidden-xs-only">
                <el-button
                  icon="el-icon-full-screen"
                  @click="fullscreen"
                ></el-button>
              </el-tooltip>
              <el-tooltip :content="favorite.id > 0 ? '取消收藏' : '收藏文档'">
                <el-button
                  v-if="favorite.id > 0"
                  icon="el-icon-star-on"
                  @click="deleteFavorite"
                ></el-button>
                <el-button
                  v-else
                  icon="el-icon-star-off"
                  @click="createFavorite"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="缩小" class="hidden-xs-only">
                <el-button
                  icon="el-icon-zoom-out"
                  :disabled="scaleSpan === 18"
                  @click="zoomOut"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="放大" class="hidden-xs-only">
                <el-button
                  icon="el-icon-zoom-in"
                  :disabled="scaleSpan === 24"
                  @click="zoomIn"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="上一页" class="hidden-xs-only">
                <el-button
                  icon="el-icon-arrow-up"
                  :disabled="currentPage === 1"
                  @click="prevPage"
                ></el-button>
              </el-tooltip>
              <el-tooltip content="当前页数/总页数" class="hidden-xs-only">
                <el-button>{{ currentPage }}/{{ document.pages }}</el-button>
              </el-tooltip>
              <el-tooltip content="下一页" class="hidden-xs-only">
                <el-button
                  icon="el-icon-arrow-down"
                  :disabled="currentPage === document.preview"
                  @click="nextPage"
                ></el-button>
              </el-tooltip>
            </el-button-group>
            <el-button
              class="btn-comment hidden-xs-only"
              icon="el-icon-chat-dot-square"
              @click="gotoComment"
              >文档点评</el-button
            >
            <el-button-group class="float-right">
              <el-button type="primary" icon="el-icon-coin" class="btn-coin">
                {{ document.price || 0 }}
                <span>{{ settings.system.credit_name || '魔豆' }}</span>
              </el-button>
              <el-button
                type="primary"
                icon="el-icon-download"
                :loading="downloading"
                @click="downloadDocument"
              >
                下载文档
                <span class="hidden-xs-only"
                  >({{ formatBytes(document.size) }})</span
                >
              </el-button>
            </el-button-group>
          </el-col>
          <el-col :span="6" class="text-right hidden-xs-only">
            <el-button icon="el-icon-top" @click="scrollTop"
              >回到顶部</el-button
            >
          </el-col>
        </el-row>
      </el-card>
    </div>
    <el-drawer
      :visible.sync="reportVisible"
      direction="rtl"
      :size="isMobile ? '90%' : '50%'"
      :wrapper-closable="false"
    >
      <div slot="title">
        <el-page-header content="举报文档" @back="reportVisible = false">
        </el-page-header>
      </div>
      <div style="padding: 0 20px">
        <FormReport
          ref="reportForm"
          :init-report="report"
          :is-admin="false"
          @success="formReportSuccess"
        />
      </div>
    </el-drawer>
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
          :init-document="updateDocument"
          :is-admin="false"
          @success="updateDocumentSuccess"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import QRCode from 'qrcodejs2' // 引入qrcode
import DocumentSimpleList from '~/components/DocumentSimpleList.vue'
import {
  getDocument,
  downloadDocument,
  getRelatedDocuments,
  setDocumentScore,
  getDocumentScore,
  deleteDocument,
  updateDocument,
  setDocumentRecommend,
} from '~/api/document'
import { getFavorite, createFavorite, deleteFavorite } from '~/api/favorite'
import {
  formatDatetime,
  formatBytes,
  getIcon,
  genPrevPage,
  categoryToTrees,
} from '~/utils/utils'
import { documentStatusOptions } from '~/utils/enum'
import FormComment from '~/components/FormComment.vue'
import CommentList from '~/components/CommentList.vue'
export default {
  components: { DocumentSimpleList, FormComment, CommentList },
  data() {
    return {
      documentStatusOptions,
      docs: [],
      document: {
        id: 0,
        score: 4.0,
        user: {
          id: 0,
        },
        attachment: {
          hash: '',
        },
      },
      updateDocument: {},
      showContent: false,
      score: null,
      disabledScore: false,
      downloading: false,
      documentId:
        this.$route.params.id.length === 16
          ? 0
          : parseInt(this.$route.params.id),
      documentUUID: this.$route.params.id || '',
      pages: [],
      pagesPerRead: 10,
      pageHeight: 0,
      pageWidth: 0,
      currentPage: 1,
      currentPageFullscreen: 1,
      breadcrumbs: [],
      favorite: {
        id: 0,
      },
      scaleSpan: 18,
      loadingImage: '/static/images/loading.svg',
      reportVisible: false,
      report: {
        document_id: 0,
        document_title: '',
        reason: 1,
      },
      relatedDocuments: [],
      cardWidth: 0,
      cardOffsetTop: 0,
      tips: '',
      descriptions: [],
      updateDocumentVisible: false,
      metaDescription: '',
      showUpdating: false,
    }
  },
  head() {
    return {
      title: this.document.title + ' - ' + this.settings.system.sitename,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.metaDescription,
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: this.document.keywords,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('category', ['categoryMap', 'categoryTrees']),
    ...mapGetters('setting', ['settings']),
    ...mapGetters('user', ['user', 'permissions']),
    accessUpdate() {
      if (this.user.id === this.document.user_id) {
        return true
      }
      return (
        this.permissions.filter((item) => item.path.endsWith('UpdateDocument'))
          .length > 0
      )
    },
    accessDelete() {
      if (this.user.id === this.document.user_id) {
        return true
      }
      return (
        this.permissions.filter((item) => item.path.endsWith('DeleteDocument'))
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
        this.permissions.filter((item) => item.path.endsWith('UpdateDocument'))
          .length > 0
      )
    },
  },
  async created() {
    await this.getDocument()
    const requests = [
      this.getRelatedDocuments(),
      this.getDocumentScore(),
      this.getAdvertisements('document'),
    ]
    if (this.user.id) {
      requests.push(this.getFavorite())
    }
    Promise.all(requests)
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleResize)
    try {
      this.$refs.docMain.$el.addEventListener(
        'scroll',
        this.handleFullscreenScroll
      )
    } catch (error) {
      console.log(error)
    }
    window.addEventListener('fullscreenchange', this.fullscreenchange)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
    try {
      this.$refs.docMain.$el.removeEventListener(
        'scroll',
        this.handleFullscreenScroll
      )
    } catch (error) {
      console.log(error)
    }
    window.removeEventListener('fullscreenchange', this.fullscreenchange)
  },
  methods: {
    formatDatetime,
    formatBytes,
    ...mapActions('user', ['getUser', 'checkAndRefreshUser']),
    updateDocumentSuccess() {
      this.updateDocumentVisible = false
      this.getDocument()
    },
    async showUpdateDocument() {
      this.showUpdating = true
      await this.getDocument(true)
      this.updateDocumentVisible = true
      this.showUpdating = false
      const doc = { ...this.document }
      delete doc.icon
      this.updateDocument = doc
    },
    setForbiden(command) {
      this.$confirm(
        `您确定要${command === 'enable' ? '启用' : '禁用'}文档《${
          this.document.title
        }》吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        const doc = { ...this.document }
        delete doc.icon
        if (command === 'enable') {
          doc.status = doc.pages > 0 ? 2 : 0 // 更新文档状态为启用状态
        } else {
          doc.status = 4 // 更新文档状态为禁用状态
        }
        const res = await updateDocument(doc)
        if (res.status === 200) {
          this.$message({
            type: 'success',
            message: '操作成功!',
          })
          this.getDocument()
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    async setRecommend(command) {
      let recommend = 1 // 推荐
      if (command === 'cancel') {
        recommend = 0 // 取消推荐
      }
      const res = await setDocumentRecommend({
        id: [this.document.id],
        type: recommend,
      })
      if (res.status === 200) {
        this.$message.success('操作成功')
        this.getDocument()
      } else {
        this.$message.error(res.data.message)
      }
    },
    toggleContent() {
      if (this.showContent) {
        try {
          this.$nextTick(() => {
            this.$refs.description[0].scrollTo(0, 0)
          })
        } catch (error) {
          console.log(error)
        }
      }
      this.showContent = !this.showContent
    },
    deleteDocument() {
      this.$confirm(`您确定要删除文档《${this.document.title}》吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const res = await deleteDocument({ id: this.document.id })
        if (res.status === 200) {
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          // 跳转到首页
          this.$router.push('/')
        } else {
          this.$message.error(res.data.message)
        }
      })
    },
    async getDocument(withAllContent = false) {
      if (!this.documentId && !this.documentUUID) {
        this.$nuxt.error({
          statusCode: 404,
          message: '文档不存在',
        })
        return
      }

      const res = await getDocument({
        id: this.documentId,
        uuid: this.documentUUID,
        with_author: !withAllContent, // 不需要获取作者信息
        with_all_content: withAllContent,
      })

      if (res.status !== 200) {
        this.$nuxt.error({
          statusCode: 404,
          message: res.data.message || res.message || '文档不存在',
        })
        return
      }
      const doc = {
        user: this.document.user,
        ...res.data,
      }
      doc.score = parseFloat(doc.score) / 100 || 4.0

      if (!doc.preview || doc.preview >= doc.pages) {
        doc.preview = doc.pages
      }

      // 限定每次预览页数
      let preview = 2
      if (doc.preview < preview) {
        preview = doc.preview
      }

      // 限定预览页数，拼装图片链接
      const pages = []
      for (let i = 1; i <= preview; i++) {
        const src = genPrevPage(
          doc.attachment.hash,
          i,
          doc.preview_ext,
          doc.enable_gzip
        )
        pages.push({
          lazySrc: src,
          src,
          alt: `${doc.title} 第${i + 1}页`,
        })
      }

      const breadcrumbs = []
      const trees = categoryToTrees(doc.category || [])
      if (trees.length > 0) {
        breadcrumbs.push(trees[0])
        while (trees[0].children && trees[0].children.length > 0) {
          trees[0] = trees[0].children[0]
          breadcrumbs.push(trees[0])
        }
      }
      this.breadcrumbs = breadcrumbs
      doc.icon = getIcon(doc.ext)
      this.pages = pages
      this.document = doc
      this.pageWidth = this.$refs.docPages.offsetWidth
      this.pageHeight =
        (this.$refs.docPages.offsetWidth / doc.width) * doc.height

      if (doc.status !== 2) {
        // 2 为文档已转换成功，不需要展示提示
        this.documentStatusOptions.map((item) => {
          if (item.value === doc.status || (!doc.status && item.value === 0)) {
            this.tips = `当前文档【${item.label}】，暂时无法正常提供预览，建议您下载到本地进行阅读。`
          }
          return item
        })
      } else {
        this.tips = ''
      }

      let description = (doc.description || '-').trim()
      if (description) description = description + '...'
      this.metaDescription = description.replace(' ', '').substr(0, 200)
      ;(this.settings.language || []).map((item) => {
        if (item.code === doc.language) {
          doc.language = item.language
        }
        return item
      })

      const item = doc.language
        ? {
            label: '语言',
            value: doc.language,
            icon: 'fa fa-language',
            name: 'language',
          }
        : {
            label: '上传',
            value: doc.user.username,
            icon: 'el-icon-user',
            name: 'username',
          }

      this.descriptions = [
        item,
        {
          label: '格式',
          value: doc.ext,
          icon: 'el-icon-document',
          name: 'ext',
        },
        {
          label: '评分',
          value: doc.score,
          icon: 'el-icon-star-on',
          name: 'score',
        },
        {
          label: '概览',
          value: doc.content || description,
          icon: 'el-icon-document',
          name: 'description',
        },
      ]
      this.$nextTick(() => {
        this.genQrcode()
      })
    },
    handleResize() {
      this.calcPageSize()
    },
    calcPageSize() {
      try {
        this.pageWidth = this.$refs.docPages.offsetWidth
        this.pageHeight =
          (this.$refs.docPages.offsetWidth / this.document.width) *
          this.document.height
      } catch (error) {}
    },
    showReport() {
      this.report.document_id = this.document.id
      this.report.document_title = this.document.title
      this.reportVisible = true
    },
    formReportSuccess() {
      this.reportVisible = false
    },
    handleScroll() {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop
      // 还有5像素的border
      let currentPage = Math.round(scrollTop / (this.pageHeight + 5)) + 1
      if (currentPage > this.pages.length) {
        currentPage = this.pages.length
      }
      this.currentPage = currentPage
      this.pages[currentPage - 1].src = this.pages[currentPage - 1].lazySrc
      if (currentPage < this.pages.length) {
        // 多加载一页
        this.pages[currentPage].src = this.pages[currentPage].lazySrc
      }
      // 右侧相关文档固定
      try {
        const relateDocs = this.$refs.relateDocs.$el
        if (relateDocs) {
          if (this.cardWidth === 0) {
            this.cardWidth = relateDocs.offsetWidth
            this.cardOffsetTop = relateDocs.offsetTop
          }

          if (scrollTop > this.cardOffsetTop) {
            relateDocs.style.position = 'fixed'
            relateDocs.style.top = '60px'
            relateDocs.style.zIndex = '999'
            relateDocs.style.width = `${this.cardWidth}px`
          } else {
            relateDocs.style = null
          }
        }
      } catch (error) {
        console.log('handleScroll relateDocs', error)
      }
    },
    handleFullscreenScroll() {
      try {
        const scrollTop = this.$refs.docMain.$el.scrollTop
        if (scrollTop === 0) {
          // 当退出全屏的时候，会触发这个事件，但是scrollTop为0，所以直接返回，避免直接将当前页码重置为1
          return
        }
        let currentPage = Math.round(scrollTop / (this.pageHeight + 5)) + 1
        if (currentPage > this.pages.length) {
          currentPage = this.pages.length
        }
        this.currentPageFullscreen = currentPage
      } catch (error) {
        console.log(error)
      }
    },
    scrollTop() {
      this.scrollTo(0)
    },
    gotoComment() {
      try {
        this.scrollTo(this.$refs.commentBox.$el.offsetTop)
      } catch (error) {
        console.log('gotoComment', error)
      }
    },
    commentSuccess() {
      this.$refs.commentList.getComments()
    },
    async downloadDocument() {
      await this.checkAndRefreshUser()

      this.downloading = true
      const res = await downloadDocument({
        id: this.document.id,
      })
      if (res.status === 200) {
        this.getUser()
        // 跳转下载
        window.location.href = res.data.url
      } else {
        this.$message.error(res.data.message || '下载失败')
      }
      this.downloading = false
    },
    async getRelatedDocuments() {
      const res = await getRelatedDocuments({
        id: this.document.id,
      })
      if (res.status === 200) {
        this.relatedDocuments = res.data.document || []
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        const currentPage = this.currentPage - 1
        this.scrollToPage(currentPage)
      }
    },
    nextPage() {
      if (this.currentPage < this.document.preview) {
        const currentPage = this.currentPage + 1
        if (currentPage > this.pages.length) {
          this.continueRead()
        }
        this.scrollToPage(currentPage)
      }
    },
    scrollToPage(page) {
      const scrollTop = (page - 1) * this.pageHeight
      this.scrollTo(scrollTop)
    },
    scrollTo(position) {
      document.scrollingElement.scrollTo({
        top: position,
        behavior: 'smooth',
      })
      this.$refs.docMain.$el.scrollTo({
        top: position,
        behavior: 'smooth',
      })
    },
    getDocMainWidth() {
      return this.$refs.docMain.$el.offsetWidth
    },
    // 缩小
    zoomOut() {
      if (this.scaleSpan > 18) {
        const currentPage = this.currentPage
        this.scaleSpan -= 6
        this.$nextTick(() => {
          this.zoomSetPage(currentPage)
        })
      }
    },
    // 放大
    zoomIn() {
      if (this.scaleSpan < 24) {
        const currentPage = this.currentPage
        this.scaleSpan += 6
        this.$nextTick(() => {
          this.zoomSetPage(currentPage)
        })
      }
    },
    zoomSetPage(page) {
      const newPageWidth = this.getDocMainWidth() - 20 * 2 // 减去两个内边距（因为设置了border-box，所以两个border的宽度不计）
      const newPageHeight = (newPageWidth / this.pageWidth) * this.pageHeight
      this.pageWidth = newPageWidth
      this.pageHeight = newPageHeight
      this.$nextTick(() => {
        this.scrollToPage(page)
      })
    },
    // 全屏
    fullscreen() {
      // 全屏前，将当前浏览的页码赋值到全屏时浏览的页码
      this.currentPageFullscreen = this.currentPage
      const docPages = this.$refs.docMain.$el
      if (docPages.requestFullscreen) {
        docPages.requestFullscreen()
      } else if (docPages.mozRequestFullScreen) {
        docPages.mozRequestFullScreen()
      } else if (docPages.webkitRequestFullscreen) {
        docPages.webkitRequestFullscreen()
      } else if (docPages.msRequestFullscreen) {
        docPages.msRequestFullscreen()
      }
    },
    fullscreenchange(e) {
      const currentPage = this.currentPageFullscreen
      console.log('fullscreenchange currentPage', currentPage)
      if (document.fullscreenElement) {
        // 全屏
        this.scaleSpan = 24
        this.pages.map((page) => {
          page.src = page.lazySrc
          return page
        })
      } else {
        this.scaleSpan = 18
      }
      this.$nextTick(() => {
        this.zoomSetPage(currentPage)
      })
    },
    async getFavorite() {
      const res = await getFavorite({
        document_id: this.document.id,
      })
      if (res.status === 200) {
        this.favorite = res.data || { id: 0 }
      }
    },
    // 取消收藏
    async deleteFavorite() {
      const res = await deleteFavorite({ id: this.favorite.id })
      if (res.status === 200) {
        this.$message.success('取消收藏成功')
        this.favorite = { id: 0 }
        this.document.favorite_count--
      } else {
        this.$message.error(res.data.message)
      }
    },
    // 添加收藏
    async createFavorite() {
      const res = await createFavorite({
        document_id: this.document.id,
      })
      if (res.status === 200) {
        this.$message.success('收藏成功')
        this.favorite = res.data
        this.document.favorite_count++
      } else {
        this.$message.error(res.data.message)
      }
    },
    continueRead() {
      const pagesPerRead =
        this.settings.display.pages_per_read || this.pagesPerRead
      let end = this.pages.length + pagesPerRead
      if (end > this.document.preview) {
        end = this.document.preview
      }
      let j = 0
      let startLazyLoad = 2
      if (document.fullscreenElement) startLazyLoad = 5
      for (let i = this.pages.length + 1; i <= end; i++) {
        j += 1
        const src = genPrevPage(
          this.document.attachment.hash,
          i,
          this.document.preview_ext,
          this.document.enable_gzip
        )
        this.pages.push({
          // 前两页，直接不要懒加载，如果非全屏
          src: j <= startLazyLoad ? src : this.loadingImage,
          lazySrc: src,
          alt: `${this.document.title} 第${i + 1}页`,
        })
      }
    },
    async setDocumentScore() {
      if (!this.score) {
        return
      }
      const res = await setDocumentScore({
        document_id: this.document.id,
        score: this.score * 100,
      })
      if (res.status === 200) {
        this.$message.success('提交评分成功')
        this.disabledScore = true
      } else {
        this.$message.error(res.data.message)
      }
    },
    async getDocumentScore() {
      // 判断用户是否已登录
      let userId = 0
      try {
        userId = this.$store.state.user.user.id || 0
      } catch (error) {}
      if (!userId) {
        return
      }
      const res = await getDocumentScore({
        document_id: this.document.id,
      })
      if (res.status === 200) {
        const score = res.data.score / 100 || null
        this.score = score
        if (score) this.disabledScore = true
        // } else {
        //   this.$message.error(res.data.message)
      }
    },
    genQrcode() {
      // 把之前可能存在的二维码清空
      this.$refs.qrcode.innerHTML =
        '<div style="margin-bottom:10px">手机扫码，畅享阅读</div>'
      // eslint-disable-next-line no-new
      new QRCode('qrcode', {
        width: 200,
        height: 200,
        text: location.href,
        colorDark: '#000',
        colorLight: '#fff',
      })
    },
    randomAdvertisement() {
      const advertisements = this.advertisements.filter(
        (item) => item.position == 'document_between'
      )
      if (advertisements.length > 0) {
        const index = Math.floor(Math.random() * advertisements.length)
        return advertisements[index]
      }
      return null
    },
  },
}
</script>
<style lang="scss">
.viewer-canvas > img {
  background-color: #fff;
}
.page-document {
  .doc-main {
    min-height: 90vh;
    overflow: auto;
  }
  .relate-docs {
    .el-card__body {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
  h1 {
    margin: 0;
    img {
      position: relative;
      top: 3px;
    }
    .fa-qrcode {
      color: #aaa;
      cursor: pointer;
      margin-left: 5px;
      font-size: 26px;
      top: 2px;
      position: relative;
      &:hover {
        color: unset;
      }
    }
    .actions {
      margin-bottom: -8px;
    }
    .icon-recommend {
      height: 26px;
    }
  }
  .el-breadcrumb {
    font-weight: normal;
    margin-top: 12px;
    color: #565656;
    .el-breadcrumb__inner a,
    .el-breadcrumb__inner.is-link {
      font-weight: normal;
    }
    .el-breadcrumb__separator[class*='icon'] {
      margin: 0 3px;
    }
    .el-breadcrumb__inner {
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 90px;
      display: inline-block;
    }
  }
  .doc-info {
    font-weight: normal;
    position: relative;
    top: -16px;
    font-size: 14px;
    color: #bbb;
    & > span {
      margin-left: 8px;
    }
    .el-rate {
      position: relative;
      top: -2px;
    }
  }
  .doc-pages {
    min-height: 640px;
    .doc-page {
      display: block;
      width: 100%;
      box-sizing: border-box;
      border: 5px solid $background-grey-light;
      border-bottom: 0;
      img {
        width: 100%;
        background-color: #fff;
      }
      .el-image__error {
        min-height: 360px;
      }
    }
  }
  .doc-page-more {
    padding: 30px 0;
    border: 5px solid $background-grey-light;
    color: #565656;
    .el-button {
      margin: 10px 0;
    }
  }
  .share-info {
    font-size: 15px;
    color: #666;
    margin: 15px 0;
    .el-link {
      top: -2px;
    }
  }

  .fixed-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    width: 100%;
    min-width: $min-width;
    background-color: #ecf0f1;
    height: 50px;
    [class*=' el-icon-'],
    [class^='el-icon-'] {
      font-weight: bold;
    }
    .el-card {
      border-radius: 0;
      background-color: transparent;
      width: $default-width;
      max-width: $max-width;
      margin: 0 auto;
      .el-card__body {
        padding: 0;
      }
      .el-button {
        border: 0;
        border-radius: 0;
        padding: 18px 20px;
      }
      .btn-comment {
        top: 1px;
        position: relative;
        background-color: transparent;
        &:hover {
          background-color: #ecf5ff;
        }
      }
      .btn-actions .el-button {
        background-color: transparent;
        &:hover {
          background-color: #ecf5ff;
        }
      }
      .btn-coin {
        background-color: transparent;
        color: #606266;
        cursor: auto;
      }
    }
  }
  .score-tips {
    position: relative;
    top: 3px;
    margin-right: 10px;
    color: #565656;
  }

  .document-descriptions {
    margin-bottom: 20px;
  }
  .descriptions-label {
    width: 80px;
  }
  .description {
    position: relative;
    max-height: 101px;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    line-height: 180%;
    // 只显示4行
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    &.description-lg {
      max-height: unset;
      display: block;
      max-height: 360px;
      overflow-y: auto;
    }
  }
}

@media screen and (max-width: $mobile-width) {
  .el-image-viewer__wrapper {
    .el-image-viewer__actions {
      .el-icon-refresh-left,
      .el-image-viewer__actions__divider,
      .el-icon-refresh-right {
        display: none;
      }
    }
    .el-image-viewer__canvas {
      display: block;
      overflow: auto;
      padding-top: 20px;
      .el-image-viewer__img {
        transform-origin: 0 0 !important;
      }
    }
  }

  .viewer-canvas > img {
    transform: scale(1.2) !important;
  }

  .page-document {
    .doc-left {
      width: 100% !important;
    }
    .doc-info {
      float: left;
      margin-top: 40px;
      & > span {
        margin-left: 0;
        margin-right: 8px;
        display: inline-block;
        margin-top: 5px;
      }
    }
    .doc-main {
      .el-card__body {
        padding-left: 0;
        padding-right: 0;
      }
    }
    .doc-pages {
      .doc-page {
        border-left: 0;
        border-right: 0;
      }
    }
    .doc-page-more {
      border-left: 0;
      border-right: 0;
    }
    .moreinfo {
      padding: 0 15px;
    }
    .fixed-buttons {
      min-width: 100%;
      .el-col-18 {
        width: 100% !important;
      }
      .btn-actions {
        padding-left: 5px;
      }
      .el-card .el-button {
        padding: 19px 15px;
      }
    }
  }
}
</style>
