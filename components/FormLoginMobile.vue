<template>
  <div class="com-form-login-mobile">
    <el-form
      ref="formLogin"
      label-position="top"
      label-width="100px"
      :model="user"
    >
      <el-form-item
        label="手机号码"
        prop="mobile"
        :rules="[
          {
            required: true,
            message: '请输入您的手机号码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.mobile"
          placeholder="请输入您的手机号码"
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="captcha.enable"
        label="验证码"
        prop="captcha"
        :rules="[
          {
            required: true,
            message: '请输入验证码',
            trigger: 'blur',
          },
        ]"
      >
        <div v-if="captcha.type == 'audio'">
          <el-row :gutter="15">
            <el-col :span="20">
              <audio controls="controls" :src="captcha.captcha"></audio>
            </el-col>
            <el-col :span="4">
              <el-tooltip placement="top" content="刷新语音验证码">
                <el-button
                  icon="el-icon-refresh"
                  class="btn-audio-refresh"
                  @click="loadCaptcha"
                ></el-button>
              </el-tooltip>
            </el-col>
          </el-row>
        </div>
        <div v-else>
          <el-tooltip placement="right" content="点击可刷新验证码">
            <img :src="captcha.captcha" class="pointer" @click="loadCaptcha" />
          </el-tooltip>
        </div>
        <el-input v-model="user.captcha" placeholder="请输入验证码"></el-input>
      </el-form-item>
      <el-form-item
        label="短信验证码"
        prop="captcha"
        :rules="[
          {
            required: true,
            message: '请输入您的短信验证码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input v-model="user.code" placeholder="请输入您的短信验证码">
          <el-button
            slot="append"
            type="primary"
            @click="sendSMSCaptcha"
            :class="leftSeconds > 0 || loading ? 'btn-disabled' : ''"
          >
            <span v-if="leftSeconds > 0">{{ leftSeconds }} 秒</span>
            <span v-else>发送短信验证码</span>
          </el-button>
        </el-input>
      </el-form-item>
      <el-alert
        v-if="!isRegistered"
        type="warning"
        show-icon
        class="mgb-20px"
        :closable="false"
        title="检测到到您手机号码未注册，将为您自动注册。初始密码默认为您当前的短信验证码，您可在个人中心修改密码。"
      ></el-alert>
      <el-form-item class="login">
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          @click="execLogin"
          :loading="loading"
          >立即登录</el-button
        >
        <nuxt-link to="/findpassword" class="el-link el-link--default"
          >找回密码</nuxt-link
        >
        <nuxt-link
          :to="{ name: 'register', query: { redirect } }"
          title="注册账户"
          class="el-link el-link--default float-right"
          >注册账户</nuxt-link
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { getUserCaptcha } from '~/api/user'
import { sendSMS } from '~/api/sms'
import { isValidMobile } from '~/utils/utils'
export default {
  name: 'FormLoginMobile',
  props: {
    redirect: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      user: {
        mobile: '',
        captcha: '',
        captcha_id: '',
        setpassword: false,
      },
      captcha: {
        enable: false,
      },
      loading: false,
      leftSeconds: 0,
      isRegistered: true,
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {
    this.loadCaptcha()
  },
  methods: {
    ...mapActions('user', ['loginByMobile']),
    execLogin() {
      this.$refs.formLogin.validate(async (valid) => {
        if (valid) {
          this.loading = true
          const res = await this.loginByMobile({
            code: this.user.code,
            mobile: this.user.mobile,
          })
          if (res.status === 200) {
            this.$message.success('登录成功')
            if (this.redirect) {
              this.$router.replace(this.redirect)
            } else {
              this.$router.replace({ name: 'index' })
            }
          }
          this.loading = false
        }
      })
    },
    async loadCaptcha() {
      const res = await getUserCaptcha({ type: 'login', t: Date.now() })
      if (res.data.enable) {
        // 启用了验证码
        this.user = {
          ...this.user,
          captcha_id: res.data.id,
        }
        this.captcha = res.data
      }
    },
    // 发送短信验证码
    async sendSMSCaptcha() {
      if (this.leftSeconds > 0 || this.loading) {
        return
      }

      // 验证手机号码格式是否正确
      if (!isValidMobile(this.user.mobile)) {
        this.$message.error('请输入正确的手机号码')
        return
      }

      if (this.captcha.enable && !this.user.captcha) {
        this.$message.error('请输入验证码')
        return
      }

      // 发送短信验证码
      const res = await sendSMS({
        mobile: this.user.mobile,
        captcha_id: this.user.captcha_id,
        captcha: this.user.captcha,
        type: 1, // 发送短信验证码
      })

      if (res.status !== 200) {
        this.$message.error(res.data.message)
        return
      }

      this.isRegistered = res.data.is_registered ? true : false

      this.leftSeconds = 60
      setInterval(() => {
        this.leftSeconds--
      }, 1000)
      this.$message.success('短信验证码已发送，请注意查收')
    },
  },
}
</script>
<style lang="scss">
.com-form-login-mobile {
  .btn-audio-refresh {
    vertical-align: -webkit-baseline-middle;
  }
  .login {
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
</style>
