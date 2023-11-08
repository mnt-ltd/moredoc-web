<template>
  <div class="com-form-register-mobile">
    <el-form
      ref="formRegister"
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
      <el-form-item
        label="密码"
        prop="password"
        v-if="user.setpassword"
        :rules="[
          {
            required: true,
            message: '请输入您的账号密码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.password"
          placeholder="请输入您的账号密码"
        ></el-input>
      </el-form-item>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        初始密码默认为您当前注册的短信验证码，您可在个人中心进行修改，或直接
        <el-checkbox v-model="user.setpassword">设置密码</el-checkbox>
      </el-alert>
      <el-form-item class="register">
        <el-alert
          v-if="
            settings && settings.security && !settings.security.enable_register
          "
          title="网站暂未开放用户注册"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 10px"
        ></el-alert>
        <el-button
          type="primary"
          class="btn-block btn-register"
          icon="el-icon-check"
          @click="execRegister"
          :disabled="
            settings && settings.security && !settings.security.enable_register
          "
          :loading="loading"
          >立即注册</el-button
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
  name: 'FormRegisterMobile',
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
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {
    this.loadCaptcha()
  },
  methods: {
    ...mapActions('user', ['registerByMobile']),
    execRegister() {
      this.$refs.formRegister.validate(async (valid) => {
        if (valid) {
          this.loading = true
          if(!this.user.setpassword) this.user.password=''
          const res = await this.registerByMobile({
            code: this.user.code,
            mobile: this.user.mobile,
            password: this.user.password,
          })
          if (res.status === 200) {
            this.$message.success('注册成功')
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
      const res = await getUserCaptcha({ type: 'register', t: Date.now() })
      if (res.data.enable) {
        // 启用了验证码
        this.user = {
          ...this.user,
          captcha_id: res.data.id,
        }
        this.captcha = res.data
      }
    },
    tabClick(tab) {
      this.activeTab = tab.name
      if (tab.name === 'company') {
        this.user.group_id = 2
      } else {
        this.user.group_id = 3
      }

      // 清除表单验证
      this.$refs.formRegister.clearValidate()
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
        type: 0, // 发送短信验证码
      })

      if (res.status !== 200) {
        this.$message.error(res.data.message)
        return
      }

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
.com-form-register-mobile {
  .btn-audio-refresh {
    vertical-align: -webkit-baseline-middle;
  }
  .register {
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
}
</style>
