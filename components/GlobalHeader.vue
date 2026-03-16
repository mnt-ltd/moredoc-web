<template>
  <div class="com-global-header">
    <template v-if="advertisements.length > 0">
      <div v-for="item in advertisements" :key="'header-ad-' + item.id">
        <div
          v-if="item.position == 'global_top'"
          :key="item.position + item.id"
          v-html="item.content"
        ></div>
      </div>
    </template>
    <el-header
      v-if="$route.name !== 'search' || isMobile"
      :height="'70px'"
      :class="{
        'is-scrolled': isScrolled,
        'is-hidden': !isHeaderVisible,
      }"
    >
      <div>
        <el-menu :default-active="activePath" mode="horizontal">
          <el-menu-item class="logo" index="/">
            <nuxt-link to="/"
              ><img
                :src="settings.system.logo || '/static/images/logo-empty.png'"
                :alt="settings.system.sitename"
            /></nuxt-link>
          </el-menu-item>
          <template v-for="item in navigations.filter((item) => item.enable)">
            <template v-if="item.fixed">
              <el-menu-item
                v-if="item.href == '/'"
                :key="'nav-index-' + item.id"
                index="/"
                class="hidden-xs-only"
              >
                <nuxt-link to="/">{{ item.title || '首页' }}</nuxt-link>
              </el-menu-item>
              <el-menu-item
                v-else-if="item.href == '/category'"
                :key="'nav-category-' + item.id"
                index="/category"
                class="hidden-xs-only"
              >
                <el-popover
                  ref="popover0"
                  width="520"
                  trigger="hover"
                  :open-delay="600"
                  :disabled="categories.filter((x) => !x.type).length === 0"
                >
                  <CategoryCard
                    :type="0"
                    @close="closePopover('popover0')"
                  ></CategoryCard>
                  <nuxt-link slot="reference" to="/category">{{
                    item.title || '文库资料'
                  }}</nuxt-link>
                </el-popover>
              </el-menu-item>
              <el-menu-item
                v-else-if="item.href == '/article'"
                :key="'nav-article-' + item.id"
                index="/article"
                class="hidden-xs-only"
              >
                <el-popover
                  ref="popover1"
                  width="520"
                  trigger="hover"
                  :open-delay="600"
                  :disabled="
                    categories.filter((x) => x.type === 1).length === 0
                  "
                >
                  <CategoryCard
                    :type="1"
                    @close="closePopover('popover1')"
                  ></CategoryCard>
                  <nuxt-link slot="reference" to="/article">{{
                    item.title || '文章资讯'
                  }}</nuxt-link>
                </el-popover>
              </el-menu-item>
              <NavigationLink
                v-else
                :key="'nav-fixed-else-' + item.id"
                :navigation="item"
                :hidden-x-s="true"
              />
            </template>
            <template v-else>
              <el-submenu
                v-if="item.children && item.children.length > 0"
                :key="'nav-' + item.id"
                :index="`nav-${item.id}`"
                class="hidden-xs-only"
              >
                <template slot="title">{{ item.title }}</template>
                <NavigationLink
                  v-for="child in item.children || []"
                  :key="'child-' + child.id"
                  :hidden-x-s="true"
                  :navigation="child"
                />
              </el-submenu>
              <NavigationLink
                v-else
                :key="'nav1-' + item.id"
                :navigation="item"
                :hidden-x-s="true"
              />
            </template>
          </template>
          <el-menu-item
            index="searchbox"
            class="nav-searchbox hidden-xs-only"
            :class="navigations.length <= 2 ? 'nav-searchbox-large' : ''"
          >
            <el-input
              class="search-input"
              size="large"
              readonly
              :placeholder="
                $route.path.startsWith('/article')
                  ? '搜索文章...'
                  : '搜索文档...'
              "
              @click.native="openSearchModal"
            >
              <i
                slot="suffix"
                class="el-icon-search el-input__icon"
                @click="openSearchModal"
              >
              </i>
            </el-input>
          </el-menu-item>
          <el-menu-item
            v-if="user.id > 0"
            index="ucenter"
            class="float-right nav-ucenter hidden-xs-only"
          >
            <el-dropdown trigger="hover" @command="handleDropdown">
              <span class="el-dropdown-link">
                <user-avatar class="nav-user-avatar" :user="user" :size="42" />
                <span>{{ user.username }}</span
                ><i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="sign.id > 0" disabled
                  ><i class="fa fa-calendar-check-o"></i>
                  今日已签到</el-dropdown-item
                >
                <el-dropdown-item v-else command="sign"
                  ><i class="fa fa-calendar-plus-o"></i>
                  每日签到</el-dropdown-item
                >
                <el-dropdown-item command="ucenter"
                  ><i class="fa fa-home"></i> 个人主页</el-dropdown-item
                >
                <el-dropdown-item command="me"
                  ><i class="fa fa-user-o"></i> 个人中心</el-dropdown-item
                >
                <el-dropdown-item command="upload"
                  ><i class="el-icon-upload2 dropdown-upload"></i
                  >上传文档</el-dropdown-item
                >
                <el-dropdown-item command="post"
                  ><i class="el-icon-plus"></i>发布文章</el-dropdown-item
                >
                <el-dropdown-item v-if="allowPages.length > 0" command="admin">
                  <i class="el-icon-box"></i> 管理后台</el-dropdown-item
                >
                <el-dropdown-item command="logout"
                  ><i class="fa fa-sign-out"></i> 退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </el-menu-item>
          <el-menu-item
            v-else
            index="/login"
            class="float-right hidden-xs-only login"
          >
            <nuxt-link to="/login">
              <el-button type="primary" round>
                &nbsp;
                <i
                  class="el-icon el-icon-user"
                  style="color: #fff; font-size: 1.2em"
                ></i>
                登录 &nbsp;
              </el-button>
            </nuxt-link>
          </el-menu-item>
          <el-menu-item
            v-if="isMobile"
            class="menu-drawer float-right"
            index="menuDrawer"
            @click="showMenuDrawer"
          >
            <i class="el-icon-s-operation"></i>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-drawer
      :visible.sync="menuDrawerVisible"
      size="60%"
      :with-header="false"
      class="menu-drawer-box"
    >
      <el-input
        class="search-input"
        size="large"
        placeholder="搜索文档..."
        readonly
        @click.native="openSearchModal"
      >
        <i
          slot="suffix"
          class="el-icon-search el-input__icon"
          @click="openSearchModal"
        >
        </i>
      </el-input>
      <ul class="navs">
        <li>
          <div
            class="el-link el-link--default login-link"
            @click="goToLink('/login')"
          >
            <user-avatar :size="38" :user="user" class="user-avatar" />
            <span v-if="user.id > 0">{{ user.username }}</span>
            <span v-else>登录注册</span>
          </div>
        </li>
        <template v-if="user.id > 0">
          <li cass="mgt-20px">
            <el-button
              v-if="sign.id > 0"
              :key="'sign-' + sign.id"
              class="btn-block"
              type="success"
              size="medium"
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
              size="medium"
              @click="signToday"
            >
              <i class="fa fa-calendar-plus-o"></i>
              每日签到</el-button
            >
          </li>
          <li>
            <div
              class="el-link el-link--default"
              @click="goToLink(`/user/${user.id}`)"
            >
              <i class="fa fa-home"></i> &nbsp;个人主页
            </div>
          </li>
          <li>
            <div class="el-link el-link--default" @click="goToLink(`/me`)">
              <i class="fa fa-user-o"></i> &nbsp;个人中心
            </div>
          </li>
          <li>
            <div class="el-link el-link--default" @click="goToLink(`/upload`)">
              <i class="el-icon-upload2"></i> 上传文档
            </div>
          </li>
          <li>
            <div class="el-link el-link--default" @click="goToLink(`/post`)">
              <i class="el-icon-plus"></i> &nbsp;发布文章
            </div>
          </li>
          <li>
            <nuxt-link to="/admin" class="el-link el-link--default"
              ><i class="el-icon-box"></i> &nbsp;管理后台</nuxt-link
            >
          </li>
          <li>
            <div class="el-link el-link--default" @click="logout">
              <i class="fa fa-sign-out"></i> &nbsp;退出登录
            </div>
          </li></template
        >
      </ul>
      <el-collapse v-model="activeCollapse">
        <el-collapse-item
          v-if="
            navigations.filter(
              (item) => item.enable && item.fixed && item.href === '/category'
            ).length > 0
          "
          name="categories"
        >
          <template slot="title"
            ><i class="el-icon-document"></i> &nbsp;
            <span>{{
              navigations.filter(
                (item) => item.enable && item.fixed && item.href === '/category'
              )[0].title || '文库资料'
            }}</span>
          </template>
          <ul>
            <li
              v-for="item in categoryDocumentTrees"
              :key="'collapse-sub-cate-' + item.id"
            >
              <div
                class="el-link el-link--default"
                @click="goToLink(`/category/${item.id}`)"
              >
                {{ item.title }}
              </div>
            </li>
          </ul>
        </el-collapse-item>
        <el-collapse-item
          v-if="
            navigations.filter(
              (item) => item.enable && item.fixed && item.href === '/article'
            ).length > 0
          "
          name="article"
        >
          <template slot="title"
            ><i class="el-icon-tickets"></i> &nbsp;
            <span>{{
              navigations.filter(
                (item) => item.enable && item.fixed && item.href === '/article'
              )[0].title || '文章资讯'
            }}</span>
          </template>
          <ul>
            <li
              v-for="item in categoryArticleTrees"
              :key="'collapse-sub-cate-' + item.id"
            >
              <div
                class="el-link el-link--default"
                @click="goToLink(`/article?category_id=${item.id}`)"
              >
                {{ item.title }}
              </div>
            </li>
          </ul>
        </el-collapse-item>
      </el-collapse>
      <el-menu :default-active="$route.path" class="el-menu-mobile">
        <template
          v-for="item in navigations.filter(
            (item) =>
              item.enable &&
              !(
                item.href === '/' ||
                item.href === '/category' ||
                item.href === '/article'
              )
          )"
        >
          <el-submenu
            v-if="item.children && item.children.length > 0"
            :key="'nav-' + item.id"
            :index="`nav-${item.id}`"
          >
            <template slot="title">{{ item.title }}</template>
            <NavigationLink
              v-for="child in item.children || []"
              :key="'child-' + child.id"
              :navigation="child"
            />
          </el-submenu>
          <NavigationLink v-else :key="'nav1-' + item.id" :navigation="item" />
        </template>
      </el-menu>
    </el-drawer>

    <div
      class="search-modal-overlay"
      :class="{ show: searchModalVisible }"
      @click="closeSearchModal"
    >
      <div class="search-modal" @click.stop>
        <div class="search-modal-header">
          <h3>搜索</h3>
          <button class="close-btn" type="button" @click="closeSearchModal">
            <i class="el-icon-close"></i>
          </button>
        </div>
        <div class="search-modal-body">
          <el-input
            ref="searchModalInput"
            v-model="search.wd"
            class="search-modal-input"
            size="large"
            :placeholder="searchPlaceholder"
            @keydown.native.enter="onSearch"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <el-button
            type="primary"
            class="search-submit-btn"
            :disabled="!search.wd"
            icon="el-icon-search"
            @click="onSearch"
          >
            搜索
          </el-button>
        </div>
        <div class="search-modal-footer">按 Enter 键快速搜索</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import UserAvatar from '~/components/UserAvatar.vue'
import { categoryToTrees, requireLogin } from '~/utils/utils'
import { getSignedToday, signToday } from '~/api/user'

export default {
  components: { UserAvatar },
  data() {
    return {
      search: {
        wd: '',
        type: this.$route.path.startsWith('/article') ? 1 : 0,
      },
      timeouter: null,
      currentYear: new Date().getFullYear(),
      categoryDocumentTrees: [],
      categoryArticleTrees: [],
      menuDrawerVisible: false,
      sign: { id: 0 },
      activeCollapse: 'categories',
      advertisements: [],
      activePath: '/',
      searchModalVisible: false,
      isScrolled: false,
      isHeaderVisible: true,
      lastScrollTop: 0,
    }
  },
  async fetch() {
    this.resetActivePath()
    this.syncSearchType()
    await Promise.all([
      this.getCategories(),
      this.getSettings(),
      this.listNavigation(),
      this.getAdvertisements('global'),
    ])
    await this.checkAndRefreshUser()

    const trees = categoryToTrees(this.categories)
    this.categoryDocumentTrees = trees.filter((item) => {
      if (
        this.settings.display &&
        this.settings.display.hide_category_without_document
      ) {
        return item.enable && item.doc_count > 0 && !item.type
      }
      return item.enable && !item.type
    })

    this.categoryArticleTrees = trees.filter((item) => {
      return item.enable && item.type
    })

    if (requireLogin(this.settings, this.user, this.$route, this.permissions)) {
      this.$router.push('/login')
    }
  },
  head() {
    return {
      title:
        this.settings.system.title || this.settings.system.sitename || '文库',
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: this.settings.system.favicon,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('user', ['user', 'token', 'allowPages', 'permissions']),
    ...mapGetters('setting', ['settings', 'navigations']),
    ...mapGetters('category', ['categories']),
    searchPlaceholder() {
      return this.search.type === 1 ? '搜索文章...' : '搜索文档...'
    },
  },
  watch: {
    $route(to, from) {
      this.resetActivePath()
      this.syncSearchType()
      if (to.fullPath !== from.fullPath) {
        this.closeSearchModal()
      }
    },
    'user.id'(value) {
      if (value > 0) {
        this.getSignedToday()
      } else {
        this.sign = { id: 0 }
      }
    },
  },
  mounted() {
    window.addEventListener('focus', this.handleWindowFocus)
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    this.handleScroll()
    if (this.user.id > 0) {
      this.getSignedToday()
    }
  },
  beforeDestroy() {
    window.removeEventListener('focus', this.handleWindowFocus)
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    ...mapActions('category', ['getCategories']),
    ...mapActions('setting', ['getSettings', 'listNavigation']),
    ...mapActions('user', [
      'logout',
      'getUser',
      'checkAndRefreshUser',
      'getUserPermissions',
      'getUserGroups',
    ]),
    handleWindowFocus() {
      this.checkAndRefreshUser()
    },
    handleScroll() {
      const currentScrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0

      this.isScrolled = currentScrollTop > 10

      if (currentScrollTop > this.lastScrollTop && currentScrollTop > 100) {
        this.isHeaderVisible = false
      } else {
        this.isHeaderVisible = true
      }

      this.lastScrollTop = currentScrollTop
    },
    syncSearchType() {
      this.search.type = this.$route.path.startsWith('/article') ? 1 : 0
    },
    openSearchModal() {
      this.syncSearchType()
      this.search.wd = ''
      this.searchModalVisible = true
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.searchModalInput.focus()
        }, 300)
      })
    },
    closeSearchModal() {
      this.searchModalVisible = false
    },
    showMenuDrawer() {
      this.getSignedToday()
      this.menuDrawerVisible = true
    },
    resetActivePath() {
      const slice = this.$route.path.split('/').slice(0, 2)
      let actvePath = slice.join('/')
      if (actvePath === '/document') {
        actvePath = '/category'
      }
      this.activePath = actvePath
    },
    goToLink(link) {
      this.menuDrawerVisible = false
      this.$router.push(link)
    },
    closePopover(ref) {
      this.$nextTick(() => {
        try {
          this.$refs[ref].doClose()
        } catch (error) {}
      })
    },
    async getSignedToday() {
      if (!this.user.id) {
        return
      }
      const res = await getSignedToday()
      if (res.status === 200) {
        this.sign = res.data || this.sign
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
    onSearch() {
      const wd = (this.search.wd || '').trim()
      if (!wd) return
      this.menuDrawerVisible = false
      this.searchModalVisible = false
      this.$router.push({
        path: '/search',
        query: {
          wd,
          type: this.search.type,
        },
      })
      this.search.wd = ''
    },
    async handleDropdown(command) {
      switch (command) {
        case 'sign':
          await this.signToday()
          break
        case 'logout':
          await this.logout()
          location.reload()
          break
        case 'upload':
          this.$router.push('/upload')
          break
        case 'post':
          this.$router.push('/post')
          break
        case 'ucenter':
          this.$router.push(`/user/${this.user.id}`)
          break
        case 'me':
          this.$router.push(`/me`)
          break
        case 'admin':
          this.$router.push('/admin')
          break
        default:
          break
      }
    },
  },
}
</script>
<style lang="scss">
.com-global-header {
  .el-header {
    padding: 0;
    background: #fff;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 100;
    overflow: hidden;
    border-bottom: 1px solid $background-grey-light;
    transition: transform 0.3s ease, box-shadow 0.3s ease,
      background-color 0.3s ease;

    &.is-scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
    }

    &.is-hidden {
      transform: translateY(-100%);
    }

    .logo,
    .login {
      &.is-active {
        border-color: transparent !important;
      }
      img {
        margin-top: -4px;
        height: 42px;
      }
    }
    & > div {
      margin: 0 auto;
      // width: $default-width;
      max-width: $max-width;
    }
    .el-menu--horizontal > .el-submenu .el-submenu__title {
      padding-top: 1px;
      height: 70px;
      line-height: 70px;
      font-size: 15px;
      font-weight: 500 !important;
      color: unset;
    }
    .el-menu.el-menu--horizontal {
      border-bottom: 0;
      // width: $default-width;
      max-width: $max-width;
      min-width: $min-width;
      .float-right {
        float: right;
        padding-right: 15px;
        a {
          padding: 0 15px;
        }
      }
    }
    .menu-drawer {
      display: none;
    }
    .nav-searchbox {
      padding: 0 25px !important;
      top: -2px;
      &.nav-searchbox-large {
        .el-input {
          width: 300px;
        }
      }
      &.is-active {
        border-color: transparent;
        color: #6095f7;
      }
      .el-input {
        width: 200px;
      }
    }
    a {
      text-decoration: none;
      height: 70px;
      line-height: 70px;
      display: inline-block;
      // padding: 0 20px;
      padding: 0 15px;
      font-size: 15px;
      // font-weight: normal;
    }
    .el-menu-item {
      padding: 0;
      color: #333;
      font-weight: bold;
      height: 70px;
      line-height: 70px;
      [class^='el-icon-'] {
        font-size: 15px;
        margin-right: 2px;
      }
      & > span {
        position: relative;
        top: -1px;
      }
      &.is-active {
        color: #6095f7;
      }
    }

    .search-input {
      cursor: pointer;

      .el-input__inner {
        border-radius: 20px;
        background-color: $background-grey-light;
        cursor: pointer;
        &:focus {
          background-color: #fff;
        }
      }
    }
  }

  .search-modal-overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 100px;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(6px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;

    &.show {
      opacity: 1;
      visibility: visible;
    }
  }

  .search-modal {
    width: calc(100% - 32px);
    max-width: 560px;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
    transform: translateY(-18px) scale(0.96);
    transition: all 0.3s ease;

    .search-modal-overlay.show & {
      transform: translateY(0) scale(1);
    }
  }

  .search-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid #f0f1f2;

    h3 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 8px;
      background: #f5f7fa;
      color: #909399;
      cursor: pointer;

      &:hover {
        color: #606266;
      }
    }
  }

  .search-modal-body {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;

    .search-modal-input {
      flex: 1;

      .el-input__inner {
        height: 44px;
        border-radius: 12px;
      }
    }

    .search-submit-btn {
      min-width: 96px;
      height: 44px;
      border-radius: 12px;
    }
  }

  .search-modal-footer {
    padding: 0 20px 18px;
    color: #909399;
    font-size: 13px;
    text-align: center;
  }
}

@media screen and (max-width: $mobile-width) {
  .com-global-header {
    .search-modal-overlay {
      padding-top: 70px;
      padding-right: 16px;
      padding-left: 16px;
    }

    .search-modal-body {
      flex-direction: column;

      .search-submit-btn {
        width: 100%;
      }
    }
  }
}
</style>
