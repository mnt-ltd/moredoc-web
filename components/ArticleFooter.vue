<template>
  <div class="com-article-footer">
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
    <div v-if="settings.system.enable_powered_by" class="powered-by">
      Powered By
      <el-link
        :underline="false"
        type="primary"
        target="_blank"
        href="https://mnt.ltd/#services"
        title="MOREDOC"
        >MOREDOC</el-link
      >
      PRO
      <span>{{ settings.system.version }}</span>
    </div>
    <FixedRightBar />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      currentYear: new Date().getFullYear(),
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
}
</script>
<style lang="scss">
.com-article-footer {
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
    font-size: 12px;
    .el-link {
      margin-right: 0;
      position: relative;
      top: -1px;
      font-size: 12px;
    }
  }
  .copyright-year {
    position: relative;
    top: 1px;
    color: #606266;
  }
}
</style>
