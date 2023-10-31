<template>
  <div class="com-form-find-password-mobile">
    <el-form label-position="top" label-width="80px" :model="user">
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
      <!-- 新密码 -->
      <el-form-item
        label="新密码"
        prop="password"
        :rules="[
          {
            required: true,
            message: '请输入您的新密码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.password"
          placeholder="请输入您的新密码"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          @click="execFindPassword"
          :loading="loading"
          :disabled="disabled"
          >立即提交</el-button
        >
        <nuxt-link to="/register" title="" class="el-link el-link--default"
          >注册账户</nuxt-link
        >
        <nuxt-link
          to="/login"
          title="登录账户"
          class="el-link el-link--default float-right"
          >登录账户</nuxt-link
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import {
  getUserCaptcha,
  findPasswordStepOne,
  findPasswordByMobile,
} from '~/api/user'
import { isValidMobile } from '~/utils/utils'
import { sendSMS } from '~/api/sms'
export default {
  name: 'FormFindPasswordStepOne',
  props: {
    redirect: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      leftSeconds: 0,
      user: {
        mobile: '',
        captcha: '',
        captcha_id: '',
        code: '',
        password: '',
      },
      captcha: {
        enable: false,
      },
      loading: false,
      disabled: false,
    }
  },
  created() {
    this.loadCaptcha()
  },
  methods: {
    async execFindPassword() {
      this.loading = true
      const res = await findPasswordByMobile({
        mobile: this.user.mobile,
        code: this.user.code,
        password: this.user.password,
      })
      if (res.status === 200) {
        this.$message.success('密码重置成功，请重新登录')
        this.$router.push({
          path: '/login',
          query: {
            redirect: this.redirect,
          },
        })
        this.disabled = true
      } else {
        this.$message.error(res.data.message || '请求失败')
      }
      this.loading = false
    },
    async loadCaptcha() {
      const res = await getUserCaptcha({ type: 'find_password', t: Date.now() })
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
        type: 2, // 发送短信验证码
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
<style scoped>
.btn-audio-refresh {
  vertical-align: -webkit-baseline-middle;
}
</style>
