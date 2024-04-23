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
    <el-header v-if="$route.name !== 'search' || isMobile">
      <div>
        <el-menu
          :default-active="activePath"
          class="float-left"
          mode="horizontal"
        >
          <el-menu-item class="logo" index="/">
            <nuxt-link to="/"
              ><img
                :src="settings.system.logo || '/static/images/logo-empty.png'"
                :alt="settings.system.sitename"
            /></nuxt-link>
          </el-menu-item>
          <el-menu-item index="/" class="hidden-xs-only">
            <nuxt-link to="/">首页</nuxt-link>
          </el-menu-item>
          <el-menu-item index="/category" class="hidden-xs-only">
            <el-popover
              ref="popover0"
              width="520"
              trigger="hover"
              :open-delay="600"
            >
              <CategoryCard
                :type="0"
                @close="closePopover('popover0')"
              ></CategoryCard>
              <nuxt-link slot="reference" to="/category">文库资料</nuxt-link>
            </el-popover>
          </el-menu-item>
          <el-menu-item index="/article" class="hidden-xs-only">
            <el-popover
              ref="popover1"
              width="520"
              trigger="hover"
              :open-delay="600"
            >
              <CategoryCard
                :type="1"
                @close="closePopover('popover1')"
              ></CategoryCard>
              <nuxt-link slot="reference" to="/article">文章资讯</nuxt-link>
            </el-popover>
          </el-menu-item>
          <template v-for="item in navigations">
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
          <el-menu-item
            v-show="$route.path !== '/'"
            index="searchbox"
            class="nav-searchbox hidden-xs-only"
            :class="navigations.length <= 2 ? 'nav-searchbox-large' : ''"
          >
            <el-input
              v-model="search.wd"
              class="search-input"
              size="large"
              :placeholder="
                $route.path.startsWith('/article')
                  ? '搜索文章...'
                  : '搜索文档...'
              "
              @keyup.enter.native="onSearch"
            >
              <i
                slot="suffix"
                class="el-icon-search el-input__icon"
                @click="onSearch"
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
            class="float-right hidden-xs-only"
          >
            <nuxt-link to="/login"><i class="el-icon-user"></i> 登录</nuxt-link>
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
        v-model="search.wd"
        class="search-input"
        size="large"
        placeholder="搜索文档..."
        @keyup.enter.native="onSearch"
      >
        <i
          slot="suffix"
          class="el-icon-search el-input__icon"
          @click="onSearch"
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
        <el-collapse-item name="categories">
          <template slot="title"
            ><i class="el-icon-document"></i> &nbsp; <span>文库资料</span>
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
        <el-collapse-item name="article">
          <template slot="title"
            ><i class="el-icon-tickets"></i> &nbsp; <span>文章资讯</span>
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
        <template v-for="item in navigations">
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
    }
  },
  computed: {
    ...mapGetters('user', ['user', 'token', 'allowPages', 'permissions']),
    ...mapGetters('setting', ['settings', 'navigations']),
    ...mapGetters('category', ['categories']),
  },
  watch: {
    $route(to, from) {
      this.resetActivePath()
    },
  },
  async created() {
    this.resetActivePath()
    await Promise.all([
      this.getCategories(),
      this.getSettings(),
      this.listNavigation(),
      this.getAdvertisements('global'),
    ])

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

    this.loopUpdate()
    if (requireLogin(this.settings, this.user, this.$route, this.permissions)) {
      this.$router.push('/login')
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeouter)
  },
  methods: {
    ...mapActions('category', ['getCategories']),
    ...mapActions('setting', ['getSettings', 'listNavigation']),
    ...mapActions('user', ['logout', 'getUser', 'checkAndRefreshUser']),
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
      const res = await getSignedToday()
      if (res.status === 200) {
        this.sign = res.data || this.sign
      }
    },
    async signToday() {
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
      if (!this.search.wd) return
      this.menuDrawerVisible = false
      const wd = this.search.wd
      this.$router.push({
        path: '/search',
        query: {
          wd,
          type: this.search.type,
        },
      })
      this.search.wd = ''
    },
    loopUpdate() {
      clearTimeout(this.timeouter)
      this.timeouter = setTimeout(() => {
        this.checkAndRefreshUser()
        // 更新系统配置信息
        this.getSettings()
        // 更新分类信息
        this.getCategories()
        // 更新导航栏
        this.listNavigation()
        // 递归
        this.loopUpdate()
      }, 1000 * 60) // 每分钟更新一次
    },
    async handleDropdown(command) {
      switch (command) {
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
    .logo {
      &.is-active {
        border-color: transparent !important;
      }
      img {
        margin-top: -4px;
        height: 42px;
      }
    }
    a.el-popover__reference,
    .el-popover__reference-wrapper {
      position: relative;
      top: -1px !important;
    }
    & > div {
      margin: 0 auto;
      width: $default-width;
      max-width: $max-width;
    }
    .el-menu--horizontal > .el-submenu .el-submenu__title {
      padding-top: 1px;
    }
    .el-menu.el-menu--horizontal {
      border-bottom: 0;
      width: $default-width;
      max-width: $max-width;
      min-width: $min-width;
      .float-right {
        float: right;
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
      }
      .el-input {
        width: 200px;
      }
    }
    a {
      text-decoration: none;
      height: 60px;
      line-height: 60px;
      display: inline-block;
      // padding: 0 20px;
      padding: 0 15px;
      font-weight: normal;
    }
    .el-menu-item {
      padding: 0;
      [class^='el-icon-'] {
        font-size: 15px;
        margin-right: 2px;
      }
    }
  }
}
</style>
