<template>
  <div class="com-global-footer">
    <div
      v-if="$route.path === '/' && friendlinks.length > 0"
      class="footer-friendlink"
    >
      <el-card class="box-card" shadow="never">
        <div slot="header" class="clearfix">
          <strong>友情链接</strong>
        </div>
        <a
          v-for="link in friendlinks"
          :key="'fl-' + link.id"
          :underline="false"
          :href="link.link"
          class="el-link el-link--default"
          target="_blank"
          >{{ link.title }}</a
        >
      </el-card>
    </div>
    <div class="footer-links">
      <div class="links-logo">
        <nuxt-link to="/">
          <img
            :src="settings.system.logo || '/static/images/logo-empty.png'"
            :alt="settings.system.sitename"
          />
        </nuxt-link>
        <div>
          <el-link
            v-if="settings.footer.about"
            :underline="false"
            type="white"
            target="_blank"
            :href="settings.footer.about"
            >关于我们</el-link
          >
          <el-link
            v-if="settings.footer.agreement"
            :href="settings.footer.agreement"
            :underline="false"
            target="_blank"
            type="white"
            >文库协议</el-link
          >
          <el-link
            v-if="settings.footer.contact"
            :underline="false"
            type="white"
            target="_blank"
            :href="settings.footer.contact"
            >联系我们</el-link
          >
          <el-link
            v-if="settings.footer.feedback"
            :underline="false"
            type="white"
            :href="settings.footer.feedback"
            target="_blank"
            >意见反馈</el-link
          >
          <el-link
            v-if="settings.footer.copyright"
            :underline="false"
            type="white"
            :href="settings.footer.copyright"
            target="_blank"
            >免责声明</el-link
          >
        </div>
      </div>
      <div v-if="settings.display.copyright_statement">
        <div
          class="el-link el-link--default copyright-statement"
          v-html="settings.display.copyright_statement"
        ></div>
      </div>
      <div>
        <el-link
          v-if="settings.system.domain"
          :underline="false"
          type="white"
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
        <span>|</span>
        <el-link
          :underline="false"
          type="white"
          target="_blank"
          title="站点地图"
          href="/sitemap.xml"
          >站点地图</el-link
        >
        <el-link
          v-if="settings.system.icp"
          :underline="false"
          type="white"
          target="_blank"
          :title="settings.system.icp"
          href="https://beian.miit.gov.cn/"
          >{{ settings.system.icp }}</el-link
        >
        <el-link
          v-if="settings.system.sec_icp"
          :underline="false"
          type="white"
          target="_blank"
          :title="settings.system.sec_icp"
          :href="`http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${settings.system.sec_icp.replace(
            /[^\d]/g,
            ''
          )}`"
          >{{ settings.system.sec_icp }}</el-link
        >
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
      </div>
    </div>
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
import { categoryToTrees } from '~/utils/utils'
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
      sign: { id: 0 },
      activeCollapse: 'categories',
      navigations: [],
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
  },
  methods: {
    ...mapActions('category', ['getCategories']),
    ...mapActions('setting', ['getSettings']),
    ...mapActions('user', ['logout', 'getUser', 'checkAndRefreshUser']),
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
.com-global-footer {
  .footer-friendlink {
    margin: 0 auto;
    padding: 10px 0;
    width: $default-width;
    max-width: $max-width;
    .el-link {
      margin-right: 10px;
    }
  }
  .footer-links {
    background-color: #1c2b40;
    color: #a4acb7;
    padding: 30px 0;
    .links-logo {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      img {
        margin-right: 10px;
        height: 30px;
        filter: brightness(0) invert(0.73);
      }
      div {
        flex: 1;
      }
    }
    & > div {
      margin: 0 auto;
      width: $default-width;
      max-width: $max-width;
      box-sizing: border-box;
      padding: 0 20px;
      // text-align: center;
    }
    .el-link {
      color: #a4acb7;
      margin: 5px;
      font-size: 13px;
      font-weight: normal;
      .el-link--primary {
        color: #409eff;
      }
      &:hover {
        color: #409eff;
      }
      &.copyright-statement {
        color: #a4acb7;
        cursor: auto;
      }
    }
    .copyright-year {
      font-size: 13px;
      position: relative;
      top: 1px;
      margin-left: -5px;
      margin-right: 5px;
    }
    .powered-by {
      float: right;
      font-size: 13px !important;
      margin-left: 0;
      margin-right: 0;
      .el-link {
        position: relative;
        top: -1px;
        color: #409eff;
      }
    }
  }
  .footer-links {
    font-size: 13px !important;
    padding: 20px 0;
    .el-link {
      font-size: 13px;
    }
    .copyright-year {
      font-size: 13px;
    }
  }
}
@media screen and (max-width: 768px) {
  .com-global-footer {
    .footer-links {
      & > div {
        padding: 0 10px;
      }
      .powered-by {
        padding: 0 5px;
        float: unset;
      }
    }
  }
}
</style>
