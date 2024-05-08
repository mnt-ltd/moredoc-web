<template>
  <div class="bind-account">
    <!-- <div class="avatar text-center">
            <el-avatar :size="64" :src="oauth.avatar"></el-avatar>
        </div> -->
    <template v-if="user.id">
      <div style="padding: 150px 0; text-align: center">
        <el-button type="text" icon="el-icon-loading">绑定中...</el-button>
      </div>
    </template>
    <div v-show="!user.id">
      <template v-if="existAccount">
        <el-tabs v-if="settings.system.enable_sms">
          <el-tab-pane label="密码登录并绑定">
            <form-login :is-oauth-bind="true" @onSuccess="bind"></form-login>
          </el-tab-pane>
          <el-tab-pane label="短信登录并绑定">
            <form-login-mobile
              :is-oauth-bind="true"
              @onSuccess="bind"
            ></form-login-mobile>
          </el-tab-pane>
        </el-tabs>
        <form-login v-else :is-oauth-bind="true" @onSuccess="bind"></form-login>
      </template>
      <template v-else>
        <el-tabs v-if="settings.system.enable_sms">
          <el-tab-pane label="邮箱注册并绑定">
            <form-register
              :is-oauth-bind="true"
              @onSuccess="bind"
            ></form-register>
          </el-tab-pane>
          <el-tab-pane label="手机注册并绑定">
            <form-register-mobile
              :is-oauth-bind="true"
              @onSuccess="bind"
            ></form-register-mobile>
          </el-tab-pane>
        </el-tabs>
        <form-register
          v-else
          :is-oauth-bind="true"
          @onSuccess="bind"
        ></form-register>
      </template>
      <div v-if="existAccount" class="text-center">
        没有帐号？<el-button type="text" @click="switchBind"
          >注册一个</el-button
        >
      </div>
      <div v-else class="text-center">
        已有帐号？<el-button type="text" @click="switchBind"
          >点此绑定</el-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { bindOauth } from '~/api/oauth'
export default {
  props: {
    oauth: {
      type: Object,
      default: () => {},
    },
    redirect: {
      type: String,
      default: '/me',
    },
  },
  data() {
    return {
      existAccount: true,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    ...mapGetters('user', ['user', 'redirectAfterOauth']),
  },
  watch: {
    oauth: {
      handler(val) {
        if (this.user.id > 0) {
          // 用户已登录，则直接绑定，无需完善用户信息
          this.bind()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    switchBind() {
      this.existAccount = !this.existAccount
    },
    async bind() {
      const resOauth = await bindOauth({
        openid: this.oauth.openid,
        oauth_type: this.oauth.oauth_type,
        session: this.oauth.session,
      })
      if (resOauth.status === 200) {
        this.$message.success('绑定成功')
        this.$router.replace(this.redirectAfterOauth || '/me')
      } else {
        this.$message.error(resOauth.data.message || '绑定失败')
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
