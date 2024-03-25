<template>
  <el-container class="layout-article">
    <GlobalNavbar />
    <el-main>
      <nuxt />
    </el-main>
    <el-footer v-if="$route.path != '/article'" height="auto">
      <GlobalFooter />
    </el-footer>
  </el-container>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import GlobalNavbar from '~/components/GlobalNavbar.vue'
import GlobalFooter from '~/components/GlobalFooter.vue'
import { listFriendlink } from '~/api/friendlink'
import { categoryToTrees, requireLogin } from '~/utils/utils'
import { getSignedToday, signToday } from '~/api/user'

export default {
  components: { GlobalNavbar, GlobalFooter },
  middleware: ['checkFront', 'analytic'],
  data() {
    return {
      search: {
        wd: '',
      },
      friendlinks: [],
      timeouter: null,
      currentYear: new Date().getFullYear(),
      categoryTrees: [],
      menuDrawerVisible: false,
      sign: { id: 0 },
      activeCollapse: 'categories',
      navigations: [],
    }
  },
  head() {
    return {
      title:
        this.settings.system.title || this.settings.system.sitename || '文库',
      keywords: this.settings.system.keywords,
      description: this.settings.system.description,
      // favicon
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
    ...mapGetters('setting', ['settings']),
    ...mapGetters('category', ['categories']),
  },
  async created() {
    await Promise.all([
      this.getCategories(),
      this.getSettings(),
      this.listFriendlink(),
    ])

    this.categoryTrees = categoryToTrees(this.categories).filter((item) => {
      if (
        this.settings.display &&
        this.settings.display.hide_category_without_document
      ) {
        return item.enable && item.doc_count > 0
      }
      return item.enable
    })

    this.loopUpdate()
    if (requireLogin(this.settings, this.user, this.$route, this.permissions)) {
      this.$router.push('/login')
    }
  },
  methods: {
    ...mapActions('category', ['getCategories']),
    ...mapActions('setting', ['getSettings']),
    ...mapActions('user', ['logout', 'getUser', 'checkAndRefreshUser']),
    showMenuDrawer() {
      this.getSignedToday()
      this.menuDrawerVisible = true
    },
    goToLink(link) {
      this.menuDrawerVisible = false
      this.$router.push(link)
    },
    async getSignedToday() {
      const res = await getSignedToday()
      if (res.status === 200) {
        this.sign = res.data || this.sign
      }
    },
    async listFriendlink() {
      const res = await listFriendlink({
        enable: true,
        field: ['id', 'title', 'link'],
      })
      if (res.status === 200) {
        this.friendlinks = res.data.friendlink || []
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
.layout-article {
  background-color: $background-grey-light;
  min-width: $min-width !important;
  min-height: 100vh;
  .el-table th {
    height: 45px;
    line-height: 45px;
    padding: 1px 0 5px;
    &.el-table__cell {
      background-color: #f7fbff;
      color: #000;
      font-weight: normal;
      &.el-table-column--selection > .cell {
        padding-left: 14px;
      }
    }
    &.el-table__cell.is-leaf {
      border-bottom: 0;
    }
  }
  .el-main {
    padding-left: 0;
    padding-right: 0;
  }
  .nav-search-form {
    margin-top: 10px;
    .el-form-item {
      margin-right: 20px;
    }
  }
  .el-link {
    font-size: 15px;
  }
  .el-rate {
    display: inline-block;
    .el-rate__icon {
      margin-right: 0;
    }
    .el-rate__text {
      margin-left: 5px;
      color: #bdc3c7 !important;
    }
  }
  .el-breadcrumb__inner a,
  .el-breadcrumb__inner.is-link {
    font-weight: normal;
  }
  padding-top: 60px;
  .el-card {
    border-radius: 5px;
    border: 0;
  }
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
    }
    .el-menu-item {
      padding: 0;
      [class^='el-icon-'] {
        font-size: 15px;
        margin-right: 2px;
      }
    }
  }

  .nav-ucenter {
    &.is-active {
      border-color: transparent !important;
    }
    .el-dropdown-link {
      line-height: 60px;
      display: inline-block;
      font-weight: 400;
      font-size: 1.2em;
      margin-top: -8px;
      .nav-user-avatar {
        position: relative;
        top: -2px;
      }
    }
  }
}
.dropdown-upload {
  font-size: 17px;
  margin-left: -2px;
}
.page {
  width: $default-width;
  min-width: $min-width !important;
  // max-width: $max-width;
  margin: 0 auto;
  overflow-x: hidden;
}
.btn-search {
  cursor: pointer;
}
.channel-category {
  &.is-active {
    background-color: #f2f6fc !important;
    a {
      color: #409eff;
    }
  }
  a {
    display: block;
  }
}
.el-menu--popup {
  min-width: 115px;
  .el-menu-item {
    a {
      display: block;
    }
  }
}

.el-dialog__header {
  padding: 20px 20px 10px;
}
.el-dialog__body {
  padding: 1px 20px;
}

.el-menu-mobile {
  margin-top: 15px;
  margin-left: -15px;
  border-right: 0;
  & > li {
    padding-left: 0;
  }
  .el-submenu__title {
    height: 32px;
    line-height: 32px;
    font-size: 15px;
  }
  .el-menu-item {
    height: 32px;
    line-height: 32px;
  }
}

// =======================
// 移动端样式
// =======================
@media screen and (max-width: $mobile-width) {
  .layout-article {
    min-width: 0 !important;
    .el-card {
      border-radius: 0;
    }
    .menu-drawer-box {
      .el-drawer__body {
        padding: 15px;
      }
      .navs {
        padding: 0;
        list-style: none;
        li {
          line-height: 30px;
          .login-link {
            max-width: 100%;
            .user-avatar {
              margin-right: 5px;
              top: 4px;
            }
            span {
              display: inline-block;
              position: relative;
              top: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          .el-link {
            font-size: 14px;
            display: block;
          }
        }
        & > li {
          margin: 5px 0;
        }
        .el-icon-upload2 {
          font-size: 17px;
        }
      }
      .el-collapse {
        .el-icon-menu {
          font-size: 16px;
        }
        .el-collapse-item__content {
          padding-bottom: 0;
          margin-top: -15px;
        }
        ul {
          padding-left: 30px;
          li {
            line-height: 30px;
          }
        }
      }
    }
    .el-header {
      .el-menu.el-menu--horizontal {
        border-bottom: 0;
        width: 100%;
        max-width: unset;
        min-width: unset;
        .float-right {
          float: right;
          a {
            padding: 0 15px;
          }
        }
      }
      a {
        padding: 0 15px;
      }
      .menu-drawer {
        padding: 0 15px;
        display: inline-block;
        &.is-active {
          border-bottom: 0;
        }
        .el-icon-s-operation {
          font-size: 22px;
        }
      }
    }
    .el-footer {
      .footer-links {
        font-size: 13px !important;
        padding: 30px 0;
        .el-link {
          font-size: 13px;
        }
        .copyright-year {
          font-size: 13px;
        }
      }
    }
  }
  .page {
    width: 100%;
    min-width: auto !important;
  }
  .el-card__header,
  .el-card__body {
    padding: 15px;
  }
  .el-dialog__header {
    padding: 15px 15px 5px;
  }
  .el-dialog__body {
    padding: 1px 15px;
  }
}

.breadcrumb-dropdown {
  max-height: 320px;
  overflow-y: auto;
  width: 360px;
  box-sizing: border-box;
  padding: 10px;
  max-width: 100%;
  .el-dropdown-menu__item {
    display: inline-block;
    padding: 0 10px;
    border-radius: 4px;
  }
  &::-webkit-scrollbar {
    background-color: transparent;
    width: 6px;
    height: 6px;
  }

  &:hover::-webkit-scrollbar {
    background-color: rgb(241, 241, 241);
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 3px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgb(193, 193, 193);
  }

  &:hover::-webkit-scrollbar-thumb::hover {
    background-color: rgb(168, 168, 168);
  }
}
</style>
