<template>
  <div class="page page-findpassword">
    <el-card shadow="never">
      <div slot="header">找回密码</div>
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
  computed: {
    ...mapGetters('setting', ['settings']),
    ...mapGetters('user', ['user']),
  },
  created() {
    // 如果已经登录，跳转到个人中心
    if (this.user && this.user.id) {
      this.$router.push('/me')
    }
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
  .el-card__body {
    padding-bottom: 0;
    margin-bottom: -20px;
  }
}
@media screen and (max-width: 768px) {
  .page-findpassword {
    .el-card {
      margin: 10px auto;
      width: 100%;
    }
  }
}
</style>
