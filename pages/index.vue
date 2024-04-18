<template>
  <div class="page page-index">
    <div class="searchbox">
      <el-carousel
        :interval="3000"
        arrow="always"
        :height="isMobile ? '250px' : '420px'"
        @change="changeCarousel"
      >
        <a
          v-for="(banner, index) in banners"
          :key="'banner-' + banner.id"
          :href="banner.url ? banner.url : 'javascript:;'"
          :target="banner.url ? '_blank' : ''"
          :title="banner.title"
        >
          <el-carousel-item
            :style="
              'background: url(' +
              (carouselIndexes.indexOf(index) > -1 ? banner.path : '') +
              ') center center no-repeat;'
            "
          ></el-carousel-item>
        </a>
      </el-carousel>
      <el-form :model="search" class="search-form" @submit.native.prevent>
        <el-form-item>
          <el-input
            v-model="search.wd"
            size="large"
            placeholder="搜索文档..."
            @keydown.native.enter="onSearch"
          >
            <i
              slot="suffix"
              class="el-input__icon el-icon-search btn-search"
              @click="onSearch"
            ></i>
          </el-input>
        </el-form-item>
        <el-form-item v-if="settings.system.recommend_words">
          <span class="hidden-xs-only">大家在搜:</span>
          <nuxt-link
            v-for="word in settings.system.recommend_words"
            :key="'kw-' + word"
            :to="{
              path: '/search',
              query: { wd: word },
            }"
          >
            <el-tag size="small">{{ word }}</el-tag>
          </nuxt-link>
        </el-form-item>
      </el-form>
    </div>

    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'index_banner_bottom'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>

    <el-row :gutter="20" class="mgt-20px">
      <el-col :span="6" class="float-right right-at-recommend">
        <el-card
          v-if="user.id > 0"
          class="box-card hidden-xs-only login-form"
          shadow="never"
        >
          <el-row>
            <el-col :span="8">
              <nuxt-link :to="`/me`">
                <user-avatar :size="64" :user="user" />
              </nuxt-link>
            </el-col>
            <el-col :span="16">
              <nuxt-link class="el-link el-link--default" :to="`/me`">
                <h3>{{ user.username }}</h3>
              </nuxt-link>
              <div class="help-block login-tips">
                <span class="el-link el-link--default" @click="logout">
                  <i class="fa fa-sign-out"></i> &nbsp;
                  <small>退出登录</small>
                </span>
              </div>
            </el-col>
          </el-row>
          <div class="line"></div>
          <el-button
            v-if="sign.id > 0"
            :key="'sign-' + sign.id"
            class="btn-block"
            type="success"
            disabled
          >
            <i class="fa fa-calendar-check-o" aria-hidden="true"></i>
            今日已签到
          </el-button>
          <el-button
            v-else
            :key="'sign-0'"
            class="btn-block"
            type="success"
            @click="signToday"
          >
            <i class="fa fa-calendar-plus-o"></i>
            每日签到
          </el-button>
          <div class="help-block sub-btn">
            <el-row>
              <el-col :span="12">
                <nuxt-link to="/upload" class="el-link el-link--default">
                  <small><i class="el-icon-upload2"></i> 上传文档</small>
                </nuxt-link>
              </el-col>
              <el-col :span="12" class="text-right">
                <nuxt-link to="/post" class="el-link el-link--default">
                  <small><i class="el-icon-plus"></i> 发布文章</small>
                </nuxt-link>
              </el-col>
            </el-row>
          </div>
        </el-card>
        <el-card
          v-else
          class="box-card hidden-xs-only login-form"
          shadow="never"
        >
          <el-row>
            <el-col :span="8">
              <nuxt-link to="/login">
                <user-avatar :size="64" :user="user" />
              </nuxt-link>
            </el-col>
            <el-col :span="16">
              <h3>欢迎您，游客</h3>
              <div class="help-block login-tips">登录，体验更多功能</div>
            </el-col>
          </el-row>
          <div class="line"></div>
          <div class="btn-login">
            <nuxt-link to="/login">
              <el-button class="btn-block" type="primary">马上登录</el-button>
            </nuxt-link>
          </div>
          <div class="help-block sub-btn">
            <el-row>
              <el-col :span="12">
                <nuxt-link to="/findpassword" class="el-link el-link--default">
                  <small>找回密码</small>
                </nuxt-link>
              </el-col>
              <el-col :span="12" class="text-right">
                <nuxt-link to="/register" class="el-link el-link--default">
                  <small>注册账户</small>
                </nuxt-link>
              </el-col>
            </el-row>
          </div>
        </el-card>
        <el-card shadow="never" class="index-articles mgt-20px">
          <div slot="header">
            <i class="fa fa-newspaper-o"></i> 文章资讯
            <nuxt-link to="/article" class="float-right">
              <el-button type="text">更多</el-button>
            </nuxt-link>
          </div>
          <ArticleSimpleList :articles="articles"></ArticleSimpleList>
        </el-card>
      </el-col>
      <el-col :span="18" class="latest-recommend">
        <el-card v-loading="loadingRecommend" shadow="never">
          <div slot="header">
            <div>
              <i class="fa fa-thumbs-o-up"></i>
              文档推荐
              <div class="float-right stats">
                <el-button type="text"
                  >{{ stats.document_count || 0 }}
                  <span class="text-muted">文档</span></el-button
                >
                <el-button type="text"
                  >{{ stats.article_count || 0 }}
                  <span class="text-muted">文章</span>
                </el-button>
                <el-button
                  v-if="settings.display.show_register_user_count"
                  type="text"
                  >{{ stats.user_count || 0 }}
                  <span class="text-muted">用户</span>
                </el-button>
              </div>
            </div>
          </div>
          <el-row :gutter="20">
            <el-col
              v-for="(item, index) in recommends"
              :key="'recommend' + item.id"
              :span="4"
              :class="isMobile && index > 7 ? 'hidden-xs-only' : ''"
            >
              <el-tooltip
                class="item"
                effect="dark"
                :content="item.title"
                placement="top"
              >
                <nuxt-link :to="`/document/${item.uuid}`">
                  <document-cover :document="item" />
                  <div class="el-link el-link--default">{{ item.title }}</div>
                </nuxt-link>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'index_category_top'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>

    <div
      v-if="settings.display.show_index_categories"
      class="categories mgt-20px"
    >
      <el-row :gutter="20">
        <div
          v-for="(category, index) in categoryTreesV2.filter(
            (item) => !item.type
          )"
          :key="'tree-' + category.id"
        >
          <el-col v-if="index < 4" :span="6">
            <el-card class="box-card" shadow="never">
              <div slot="header" class="clearfix">
                <nuxt-link
                  class="el-link el-link--default"
                  :to="`/category/${category.id}`"
                >
                  <img
                    :src="category.icon || '/static/images/logo-icon.png'"
                    :alt="category.title"
                    class="category-icon"
                  />
                  <strong>{{ category.title }}</strong>
                </nuxt-link>
              </div>
              <nuxt-link
                v-for="child in category.children"
                :key="'child-' + child.id"
                class="el-link el-link--default"
                :to="`/category/${child.id}`"
                >{{ child.title }}</nuxt-link
              >
            </el-card>
          </el-col>
        </div>
      </el-row>
    </div>

    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'index_category_bottom'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
    <el-row :gutter="isMobile ? 0 : 20" class="category-item">
      <el-col
        v-for="item in documents"
        :key="'card-cate-' + item.category_id"
        :span="24"
      >
        <el-card class="box-card mgt-20px" shadow="never">
          <div slot="header" class="clearfix">
            <strong>{{ item.category_name }}</strong>
            <nuxt-link
              :to="`/category/${item.category_id}`"
              class="float-right"
            >
              <el-button type="text">更多</el-button>
            </nuxt-link>
          </div>
          <el-row :gutter="isMobile ? 10 : 20">
            <el-col
              v-for="doc in item.document"
              :key="'c-' + item.category_id + 'd' + doc.id"
              :span="6"
              :xs="12"
            >
              <div class="doc-item">
                <nuxt-link
                  class="el-link el-link--default doc-cover"
                  :to="`/document/${doc.uuid}`"
                >
                  <document-cover
                    :width="70"
                    :document="doc"
                    :show-ext="true"
                  />
                </nuxt-link>
                <div class="doc-title">
                  <nuxt-link
                    class="el-link el-link--default"
                    :to="`/document/${doc.uuid}`"
                  >
                    <div>{{ doc.title }}</div>
                  </nuxt-link>
                  <div>{{ doc.pages || '-' }} 页</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'index_link_top'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import UserAvatar from '~/components/UserAvatar.vue'
import { listBanner } from '~/api/banner'
import { listDocument, listDocumentForHome } from '~/api/document'
import { getSignedToday, signToday } from '~/api/user'
import { getStats } from '~/api/config'
import { getIcon } from '~/utils/utils'
import { advertisementPositions } from '~/utils/enum'
import { listArticle } from '~/api/article'
export default {
  components: { UserAvatar },
  data() {
    return {
      banners: [],
      recommends: [],
      loadingRecommend: false,
      documents: [],
      search: {
        wd: '',
      },
      sign: {
        sign_at: 0,
      },
      stats: {
        document_count: '-',
        user_count: '-',
      },
      carouselIndexes: [0], // 跑马灯index，用于跑马灯图片的懒加载
      advertisementPositions,
      activeIndex: '0',
      articles: [],
    }
  },
  head() {
    return {
      title: this.settings.system.title || 'MOREDOC · 魔豆文库',
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: `${this.settings.system.sitename},${this.settings.system.keywords}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.settings.system.description,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('user', ['user']),
    ...mapGetters('setting', ['settings']),
    categoryTreesV2() {
      const trees = (this.categoryTrees || []).filter((item) => {
        if (this.settings.display.hide_category_without_document) {
          return item.doc_count > 0 && item.enable
        }
        return item.enable
      })

      // 过滤二级分类
      trees.forEach((item) => {
        item.children = (item.children || []).filter((child) => {
          if (this.settings.display.hide_category_without_document) {
            return child.doc_count > 0 && child.enable
          }
          return child.enable
        })
      })

      return trees
    },
  },
  async created() {
    const requests = [
      this.getRecommendDocuments(),
      this.getArticles(),
      this.listBanner(),
      this.getDocuments(),
      this.getSignedToday(),
      this.getStats(),
      this.getAdvertisements('index'),
    ]
    if (this.user.id) {
      requests.push(this.getUser())
    }
    await Promise.all(requests)
  },
  methods: {
    ...mapActions('user', ['logout', 'getUser']),
    getIcon,
    async listBanner() {
      const res = await listBanner({
        enable: true,
        field: ['id', 'title', 'path', 'url'],
        type: 0, // 0，网站横幅
      })
      if (res.status === 200) {
        this.banners = res.data.banner
      }
    },
    changeActiveIndex(tab) {
      this.activeIndex = tab.name
    },
    onSearch() {
      if (this.search.wd) {
        location.href = '/search?wd=' + encodeURIComponent(this.search.wd)
      }
    },
    async getArticles() {
      const res = await listArticle({
        page: 1,
        size: 6,
      })
      if (res.status === 200) {
        this.articles = res.data.article || []
      }
    },
    async getSignedToday() {
      if (!this.user.id) {
        return
      }
      const res = await getSignedToday()
      if (res.status === 200) {
        this.sign = res.data || { id: 0 }
      }
    },
    async signToday() {
      if (this.sign.id > 0) {
        this.$message.warning('今日已签到')
        return
      }
      const res = await signToday()
      if (res.status === 200) {
        const sign = res.data || { id: 1 }
        this.sign = sign
        this.getUser()
        this.$message.success(
          `签到成功，获得 ${sign.award || 0} ${
            this.settings.system.credit_name || '魔豆'
          }奖励`
        )
      } else {
        this.$message.error(res.message || res.data.message)
      }
    },
    async getRecommendDocuments() {
      this.loadingRecommend = true
      const res = await listDocument({
        field: ['id', 'title', 'uuid'],
        is_recommend: true,
        order: 'recommend_at desc',
        limit: 12,
      })
      this.loadingRecommend = false
      if (res.status === 200) {
        this.recommends = res.data.document || []
      }
    },
    async getDocuments() {
      const res = await listDocumentForHome({
        limit: 8,
      })
      if (res.status === 200) {
        this.documents = (res.data.document || []).filter(
          (item) => item.document && item.document.length > 0
        )
      }
    },
    async getStats() {
      const res = await getStats()
      if (res.status === 200) {
        this.stats = res.data || {}
      }
    },
    login() {
      // 跳转到登录页面，先串通页面
      this.$router.push('/login')
    },
    changeCarousel(index) {
      const carouselIndexes = this.carouselIndexes
      if (!carouselIndexes.includes(index)) {
        carouselIndexes.push(index)
      }
      this.carouselIndexes = carouselIndexes
    },
  },
}
</script>
<style lang="scss">
.page-index {
  width: 100%;
  max-width: 100%;
  margin-top: -20px;

  .upload-box a {
    border: 1px dashed #ddd;
    border-radius: 4px;
    color: #666;
    text-decoration: none !important;
    font-size: 13px;
    display: block;
    padding: 20px 0;
    i {
      font-size: 55px;
      margin-bottom: 20px;
      color: #c0c4cc;
    }
  }

  .el-carousel__button {
    width: 20px;
    height: 3px;
    border-radius: 2px;
  }
  .searchbox {
    position: relative;
    margin-bottom: 20px;

    a {
      display: inline-block;
    }

    .el-carousel__item {
      background-size: cover !important;
    }

    // 搜索表单垂直居中显示
    .search-form {
      position: absolute;
      z-index: 99;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 640px;
      color: #fff;

      .el-form-item {
        margin-bottom: 0;
      }

      .el-tag {
        margin-left: 5px;
      }

      .el-input__icon {
        color: #666;
      }

      .el-input__inner {
        border-right: 0;
        height: 45px;
        line-height: 45px;
        font-size: 15px;

        &:focus {
          border-color: #dcdfe6;
        }
      }

      .el-input-group__append {
        background-color: #fff;
        border-left: 0;
      }
    }
  }

  & > .el-row {
    width: $default-width;
    max-width: $max-width;
    margin: 0 auto !important;
  }

  .stat-info {
    color: #888;
    font-size: 18px;

    small {
      font-size: 13px;
    }

    .el-card__body {
      padding: 5px 0;

      .el-col {
        padding: 8px 0;

        &:first-child {
          border-right: 1px solid #efefef;
        }
      }
    }
  }

  .categories {
    background-color: #fff;

    .category-icon {
      width: 22px;
      height: 22px;
      position: relative;
      top: 5px;
    }

    .el-card__header {
      a {
        font-size: 16px;
        color: #303133;
        margin-top: -2px;
        margin-bottom: 0 !important;
        margin-left: 3px;

        &:hover {
          color: #409eff;
        }
      }
    }

    .el-row {
      margin: 0 auto !important;
      width: $default-width;
      max-width: $max-width;

      .el-card__header {
        padding-left: 0;
        border-bottom: 0;
        padding-bottom: 0;
      }

      .el-card__body {
        padding: 15px 0 20px;
        max-height: 80px;
        overflow: hidden;
        display: -webkit-box;
        // -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
      }

      a {
        display: inline-block;
        padding: 2px 0 5px;
        text-decoration: none;
        margin-right: 10px;
        margin-bottom: 5px;
      }
    }
  }

  .login-form {
    h3 {
      margin-top: 5px;
    }

    .line {
      border-top: 1px solid #efefef;
      margin: 14px 0 15px;
    }

    ul,
    li {
      margin: 0;
      padding: 0;
    }

    ul {
      margin: 10px 0;
    }

    li {
      margin-left: 20px;
      line-height: 200%;
      color: #555;
      font-size: 15px;
    }

    .login-tips {
      margin-top: -10px;
      font-size: 14px;
    }

    .user-count {
      margin: 20px 0;
      font-size: 13px;
      color: #999;

      .el-col:nth-child(2) {
        border-left: 1px solid #efefef;
        border-right: 1px solid #efefef;
      }

      span {
        display: block;
        margin-top: 5px;
        font-size: 16px;
        color: #409eff;
      }
    }

    .user-signature {
      text-align: left;
      text-indent: 2em;
      margin-top: 10px;
      height: 41px;
      font-size: 14px;
      line-height: 23px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  .el-card__header {
    .float-right {
      margin-top: -7px;
      .text-muted {
        font-weight: normal !important;
      }
    }
  }

  .sub-btn {
    position: relative;
    top: 13px;
    padding-bottom: 7px;
  }

  .index-articles {
    .el-card__body {
      padding-top: 4px;
      padding-bottom: 4px;
      min-height: 253px;
      box-sizing: border-box;
    }
  }

  .latest-recommend {
    .el-card__body {
      padding-bottom: 0;
      min-height: 476px;
      box-sizing: border-box;
    }

    a {
      text-decoration: none;
      display: block;
      margin-bottom: 20px;

      &:hover {
        color: #409eff;
      }

      .el-image {
        border: 2px solid #efefef;
        border-radius: 5px;
        height: 160px;
        width: 115px;
        max-width: 100%;

        img {
          width: 100%;
          transition: transform 0.3s ease 0s;

          &:hover {
            transform: scale(1.2);
          }
        }
      }

      div.el-link {
        height: 40px;
        overflow: hidden;
        margin-bottom: 0px;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-word;
        font-size: 13px;
        line-height: 20px;
      }
    }
  }

  .category-item {
    .el-card__body {
      padding-bottom: 0;
      .doc-item {
        margin-bottom: 20px;
        display: flex;
        .el-link {
          display: block;
        }
        .doc-cover {
          width: 70px;
          margin-right: 15px;
        }
        .doc-title {
          flex: 1;
          .el-link {
            font-size: 14px;
            margin-bottom: 20px;
            line-height: 180%;
            & > div {
              overflow: hidden;
              display: -webkit-box;
              text-overflow: ellipsis;
              height: 50px;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              word-break: break-word;
            }
          }
          & > div {
            font-size: 13px;
            color: #888;
          }
        }
      }
    }
  }
}

// =================================
// 移动端样式
// =================================
@media screen and (max-width: $mobile-width) {
  .page-index {
    .searchbox {
      margin-bottom: 15px;

      .search-form {
        width: 90%;

        .el-input__inner {
          height: 40px;
          line-height: 40px;
        }
      }
    }

    .el-carousel__arrow {
      display: none;
    }

    .latest-recommend {
      width: 100%;
      padding-left: 0 !important;
      padding-right: 0 !important;

      .el-card__body {
        padding: 15px;
        padding-bottom: 0;
        min-height: auto;
      }

      .el-col-4 {
        width: 25%;
        padding-left: 7.5px !important;
        padding-right: 7.5px !important;
      }

      a {
        margin-bottom: 15px;

        .el-image {
          height: auto;
          width: 100%;
          border: 1px solid #e6e6e6;
        }

        div.el-link {
          font-size: 12px;
        }
      }
    }

    .right-at-recommend {
      width: 100%;
      margin-top: -20px;
      padding-left: 0 !important;
      padding-right: 0 !important;
      margin-bottom: 15px;
    }

    .categories {
      padding-bottom: 15px;

      .el-col-6 {
        width: 50%;

        .el-card__body {
          height: 75px;
          overflow: hidden;
        }
      }
    }

    .category-item {
      & > .el-col {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .el-card__body {
        padding: 15px 10px;
        .doc-item {
          margin-bottom: 10px;
          .doc-cover {
            margin-right: 10px;
          }
          .doc-title {
            .el-link {
              font-size: 13px;
            }
            & > div {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}
</style>
