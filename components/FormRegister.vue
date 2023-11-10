<template>
  <div class="com-form-register">
    <el-form
      ref="formRegister"
      label-position="left"
      label-width="100px"
      :model="user"
    >
      <el-form-item
        label="用户名"
        prop="username"
        :rules="[
          {
            required: true,
            message: '请输入您用于登录的用户名',
            trigger: 'blur',
          },
          {
            min: 3,
            max: 32,
            message: '用户名长度在 3 到 32 个字符',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.username"
          placeholder="请输入您用于登录的用户名，限 3 ~ 32 个字符"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="登录密码"
        prop="password"
        :rules="[
          {
            required: true,
            message: '请输入您的登录密码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.password"
          placeholder="请输入您的登录密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="确认密码"
        prop="repeat_password"
        :rules="[
          {
            required: true,
            message: '请再次输入您的登录密码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.repeat_password"
          placeholder="请再次输入您的登录密码"
          type="password"
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
        label="电子邮箱"
        prop="email"
        :rules="[
          {
            required: true,
            message: '请输入您的邮箱地址，以便忘记密码时找回',
            trigger: 'blur',
          },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.email"
          placeholder="请输入您的邮箱地址，以便忘记密码时找回"
        >
          <el-button :disabled="leftSeconds>0" v-if="settings.security.enable_verify_register_email" slot="append" icon="el-icon-message" @click="sendEmailCode">
            <template v-if="leftSeconds>0">剩余 {{ leftSeconds }} 秒</template>
            <template v-else>获取邮箱验证码</template>
          </el-button>
      </el-input>
      </el-form-item>
      <!-- 邮箱验证码 -->
      <el-form-item  v-if="settings.security.enable_verify_register_email"
        label="邮箱验证码"
        prop="code"
        :rules="[
          {
            required: true,
            message: '请输入邮箱验证码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="user.code"
          placeholder="请输入邮箱验证码"
        ></el-input>
      </el-form-item>
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
import { getUserCaptcha,sendEmailCode } from '~/api/user'
export default {
  name: 'FormRegister',
  props: {
    redirect: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      user: {
        email: '',
        username: '',
        password: '',
        repeat_password: '',
        captcha: '',
        captcha_id: '',
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
    ...mapActions('user', ['register']),
    execRegister() {
      this.$refs.formRegister.validate(async (valid) => {
        if (valid) {
          const user = { ...this.user }
          if (user.password !== user.repeat_password) {
            this.$message.error('两次输入的密码不一致')
            return
          }
          delete user.repeat_password

          this.loading = true
          const res = await this.register(user)
          if (res.status === 200) {
            this.$message.success('注册成功')
            if (this.redirect) {
              this.$router.replace(this.redirect)
            } else {
              this.$router.replace({ name: 'index' })
            }
          }else{
            this.loadCaptcha()
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
    // 发送邮箱验证码
    async sendEmailCode(){
      if(!this.user.email){
        this.$message.error('请输入邮箱地址')
        return
      }

      if(!this.user.captcha){
        this.$message.error('请输入验证码')
        return
      }

      const res = await sendEmailCode({
        email:this.user.email,
        captcha_id:this.user.captcha_id,
        captcha:this.user.captcha,
      })
      if(res.status===200){
        this.$message.success('验证码发送成功')
        this.leftSeconds = 60
        const timer = setInterval(() => {
          this.leftSeconds--
          if (this.leftSeconds <= 0) {
            clearInterval(timer)
          }
        }, 1000)
      }else{
        this.$message.error(res.data.message || '请求失败')
      }
    }
  },
}
</script>
<style lang="scss">
.com-form-register {
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
