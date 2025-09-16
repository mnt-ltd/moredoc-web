<template>
  <div
    class="page page-login"
    :style="
      settings.system.login_background
        ? 'background:url(' +
          settings.system.login_background +
          ') no-repeat center center'
        : ''
    "
  >
    <div>
      <el-card
        shadow="never"
        :class="settings.security.is_close ? 'close-box' : ''"
      >
        <div slot="header" class="clearfix">
          <span v-if="user.id > 0 && settings.security.is_close">网站关闭</span>
          <span v-else>用户登录</span>
        </div>
        <div v-if="settings.security.is_close" class="close-tips">
          <div v-html="settings.security.close_statement"></div>
        </div>
        <!-- 优先显示小程序扫码登录 -->
        <div class="wechatmp-login">
          <div class="login-tabs">
            <el-button-group>
              <el-button
                v-if="
                  settings.security &&
                  settings.security.enable_wechatmp_pc_login
                "
                :type="activeTab === 'wechatmp' ? 'primary' : 'default'"
                @click="activeTab = 'wechatmp'"
                >微信扫码登录</el-button
              >
              <el-button
                :type="activeTab === 'password' ? 'primary' : 'default'"
                @click="activeTab = 'password'"
                >账号登录</el-button
              >
              <el-button
                v-if="settings.system.enable_sms"
                :type="activeTab === 'sms' ? 'primary' : 'default'"
                @click="activeTab = 'sms'"
                >短信登录</el-button
              >
            </el-button-group>
          </div>

          <!-- 小程序扫码登录 -->
          <div v-if="activeTab === 'wechatmp'" class="wechatmp-scan">
            <WechatMPLogin
              :is-bind-mode="false"
              :redirect="redirect"
              :show-header="false"
            />
          </div>
          <div v-else-if="activeTab === 'sms' && settings.system.enable_sms">
            <form-login-mobile :redirect="redirect"></form-login-mobile>
          </div>
          <div v-else>
            <form-login :redirect="redirect"></form-login>
          </div>
        </div>
        <div class="reg">
          <nuxt-link to="/findpassword" class="el-link el-link--default"
            >找回密码</nuxt-link
          >
          <nuxt-link
            :to="{ name: 'register', query: { redirect } }"
            title="注册账户"
            class="el-link el-link--default float-right"
            >注册账户</nuxt-link
          >
        </div>
        <Oauth
          v-if="!settings.security.is_close && activeTab !== 'wechatmp'"
          :redirect="redirect"
        />
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WechatMPLogin from '~/components/WechatMPLogin.vue'
export default {
  components: {
    WechatMPLogin,
  },
  // 已登录用户，直接跳转到个人中心
  middleware: ['checklogin'],
  data() {
    return {
      redirect: this.$route.query.redirect || '/me',
      activeTab: '',
    }
  },
  head() {
    return {
      title: `用户登录 - ${this.settings.system.sitename}`,
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: `用户登录,${this.settings.system.sitename},${this.settings.system.keywords}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: `${this.settings.system.description}`,
        },
      ],
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
    if (this.user.id > 0) {
      this.$router.push(this.redirect)
      return
    }
    this.activeTab =
      this.settings.security && this.settings.security.enable_wechatmp_pc_login
        ? 'wechatmp'
        : 'password' // 默认显示小程序扫码登录
  },
}
</script>
<style lang="scss">
.page-login {
  width: 100%;
  margin-top: -20px;
  margin-bottom: -20px;
  background-size: cover !important;
  & > div {
    width: $default-width;
    margin: 0 auto;
  }
  .el-card {
    width: 520px;
    max-width: 100%;
    margin: 100px auto;
    margin-right: 0;
    &.close-box {
      margin-right: auto;
      width: 520px;
      .close-tips {
        margin-bottom: 20px;
        border: 1px dashed #f60;
        padding: 20px;
        border-radius: 4px;
        line-height: 180%;
        font-size: 15px;
      }
    }
    .el-card__body {
      padding-bottom: 0;
    }
    .reg {
      margin: -10px auto 10px;
    }
    .wechatmp-login {
      .login-tabs {
        margin-bottom: 20px;
        text-align: center;

        .el-button-group .el-button {
          padding: 12px 20px;
        }
      }

      .wechatmp-scan {
        text-align: center;

        iframe {
          border-radius: 4px;
          min-height: 400px;
        }
      }
    }
  }
}
@media screen and (max-width: $mobile-width) {
  .page-login {
    background: none !important;
    & > div {
      width: 100%;
      margin: 0 auto;
    }
    .el-card {
      width: 100%;
      margin: 20px auto;
    }
  }
}
</style>
