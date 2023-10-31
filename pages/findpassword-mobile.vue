<template>
  <div class="page page-findpassword" v-if="settings.system.enable_sms">
    <el-card shadow="never">
      <div slot="header">
        找回密码
        <nuxt-link class="float" to="/findpassword">
          <el-button type="text" icon="el-icon-top-right"
            >通过邮箱找回密码</el-button
          >
        </nuxt-link>
      </div>
      <form-find-password-mobile />
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      form: {
        email: '',
      },
      token: this.$route.query.token,
    }
  },
  head() {
    return {
      title: '找回密码 - ' + this.settings.system.sitename,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  async created() {
    if (!this.settings.system.enable_sms) {
      this.$router.replace('/findpassword')
      return
    }
  },
  methods: {},
}
</script>
<style lang="scss">
.page-findpassword {
  .el-card {
    width: 720px;
    margin: 0 auto;
  }
  .float {
    float: right;
    margin-top: -10px;
  }
}
@media screen and (max-width: 768px) {
  .page-findpassword {
    .el-card {
      width: 100%;
    }
  }
}
</style>
