<template>
  <div class="page-oauth">
    <el-card v-if="oauth.id > 0" shadow="never">
      <div slot="header">完善用户信息</div>
      <OauthBind :oauth="oauth" />
    </el-card>
    <div v-if="loading" style="padding: 150px 0; text-align: center">
      <el-button icon="el-icon-loading" type="text">登录中...</el-button>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import {
  oauthTypeGitee,
  oauthTypeGithub,
  oauthTypeQQ,
  oauthTypeWechat,
  oauthTypeCustom,
  oauthTypeGoogle,
} from '~/utils/enum'
export default {
  data() {
    return {
      title: '',
      oauth: {
        id: 0,
      },
      loading: false,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    ...mapGetters('user', ['redirectAfterOauth', 'user']),
  },
  head() {
    return {
      title:
        this.title ||
        `[${this.$route.params.type}]登录中... - ${this.settings.system.sitename}`,
    }
  },
  created() {
    this.login()
  },
  methods: {
    ...mapActions('user', ['loginOauth']),
    async login() {
      const code = this.$route.query.code || ''
      if (code === '') {
        this.$message.error('code不能为空')
        return
      }

      let oauthType = 0
      switch (this.$route.params.type) {
        case 'gitee':
          oauthType = oauthTypeGitee
          break
        case 'github':
          oauthType = oauthTypeGithub
          break
        case 'qq':
          oauthType = oauthTypeQQ
          break
        case 'wechat':
          oauthType = oauthTypeWechat
          break
        case 'custom':
          oauthType = oauthTypeCustom
          break
        case 'google':
          oauthType = oauthTypeGoogle
          break
        default:
          break
      }

      if (oauthType === 0) {
        this.$message.error('未知授权类型')
        return
      }
      const req = {
        code,
        oauth_type: oauthType,
      }
      console.log(this.$route.query, this.$route.params, req)
      this.loading = true
      const res = await this.loginOauth(req)
      this.loading = false
      if (res.status === 200) {
        if (res.data.oauth) {
          this.title = `[${this.$route.params.type}] 完善用户信息 - ${this.settings.system.sitename}`
          this.oauth = res.data.oauth
        } else {
          this.$message.success('登录成功')
          this.$router.replace(this.redirectAfterOauth || '/me')
        }
      } else {
        this.$router.push('/')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.page-oauth {
  .el-card {
    margin: 0 auto;
    width: 640px;
    max-width: 100%;
  }
}
</style>
