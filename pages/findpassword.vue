<template>
  <div class="page page-findpassword">
    <el-card shadow="never">
      <div slot="header">
        找回密码
        <nuxt-link
          v-if="settings.system.enable_sms"
          class="float"
          to="/findpassword-mobile"
        >
          <el-button type="text" icon="el-icon-top-right"
            >通过手机号找回密码</el-button
          >
        </nuxt-link>
      </div>
      <form-find-password-step-two v-if="token" />
      <form-find-password-step-one v-else />
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
      bodyAttrs: {
        class: 'autoheight',
      },
    }
  },
  async created() {},
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {},
}
</script>
<style lang="scss">
.page-findpassword {
  .el-card {
    width: 520px;
    margin: 100px auto;
  }
  .float {
    float: right;
    margin-top: -10px;
  }
  .el-card__body {
    padding-bottom: 0;
    margin-bottom: -20px;
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
