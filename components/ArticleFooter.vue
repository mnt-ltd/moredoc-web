<template>
  <div class="com-global-footer">
    <div>
      <el-link
        v-if="settings.footer.about"
        :underline="false"
        target="_blank"
        :href="settings.footer.about"
        >关于我们</el-link
      >
      <el-link
        v-if="settings.footer.agreement"
        :href="settings.footer.agreement"
        :underline="false"
        target="_blank"
        >文库协议</el-link
      >
      <el-link
        v-if="settings.footer.contact"
        :underline="false"
        target="_blank"
        :href="settings.footer.contact"
        >联系我们</el-link
      >
      <el-link
        v-if="settings.footer.feedback"
        :underline="false"
        :href="settings.footer.feedback"
        target="_blank"
        >意见反馈</el-link
      >
      <el-link
        v-if="settings.footer.copyright"
        :underline="false"
        :href="settings.footer.copyright"
        target="_blank"
        >免责声明</el-link
      >
      <el-link
        :underline="false"
        target="_blank"
        title="站点地图"
        href="/sitemap.xml"
        >站点地图</el-link
      >
    </div>
    <div>
      <el-link
        v-if="settings.system.domain"
        :underline="false"
        :title="settings.system.sitename || ''"
        :href="settings.system.domain"
      >
        {{ settings.system.sitename }}
      </el-link>
      <span class="copyright-year"
        ><span v-if="settings.system.copyright_start_year == currentYear"
          >©{{ currentYear }}</span
        >
        <span v-else>
          ©{{ settings.system.copyright_start_year }} - {{ currentYear }}
        </span></span
      >
    </div>
    <div v-if="settings.system.icp">
      <el-link
        :underline="false"
        target="_blank"
        :title="settings.system.icp"
        href="https://beian.miit.gov.cn/"
        >{{ settings.system.icp }}</el-link
      >
    </div>
    <div v-if="settings.system.sec_icp">
      <el-link
        :underline="false"
        target="_blank"
        :title="settings.system.sec_icp"
        :href="`http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${settings.system.sec_icp.replace(
          /[^\d]/g,
          ''
        )}`"
        >{{ settings.system.sec_icp }}</el-link
      >
    </div>
    <div class="powered-by">
      Powered By
      <el-link
        :underline="false"
        type="primary"
        target="_blank"
        href="https://mnt.ltd/#services"
        title="MOREDOC"
        >MOREDOC</el-link
      >
      CE
      <span>{{ settings.system.version }}</span>
    </div>
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
            ><i class="el-icon-menu"></i> &nbsp; <span>文档分类</span>
          </template>
          <ul>
            <li
              v-for="item in categoryTrees.filter((item) => !item.type)"
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
          <NavigationLink v-else :key="'nav-' + item.id" :navigation="item" />
        </template>
      </el-menu>
    </el-drawer>
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'global_bottom'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { listFriendlink } from '~/api/friendlink'
import { listNavigation } from '~/api/navigation'
import { categoryToTrees, requireLogin } from '~/utils/utils'
import { getSignedToday, signToday } from '~/api/user'

export default {
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
      this.listNavigation(),
      this.listFriendlink(),
      this.getAdvertisements('global'),
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
    async listNavigation() {
      const res = await listNavigation({ page: 1, size: 10000 })
      if (res.status === 200) {
        let navigations = res.data.navigation || []
        navigations = categoryToTrees(navigations).filter((item) => item.enable)
        this.navigations = navigations
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
      console.log('handleDropdown', command)
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
.com-global-footer {
  font-size: 14px;

  & > div {
    margin-bottom: 6px;
  }
  .el-link {
    font-weight: normal;
    display: inline-block;
    line-height: 160%;
    font-size: 14px;
    margin-right: 10px;
  }
  .powered-by {
    color: #898989;
  }
  .copyright-year {
    position: relative;
    top: 1px;
    color: #606266;
  }
}
</style>
