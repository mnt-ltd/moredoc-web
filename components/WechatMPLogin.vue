<template>
  <div class="mplogin">
    <el-card shadow="never">
      <div v-if="showHeader" slot="header">
        {{ isBindMode ? '微信扫码绑定' : '微信扫码登录' }}
      </div>
      <el-skeleton v-if="loading" animated>
        <template slot="template">
          <el-skeleton-item
            variant="image"
            style="
              width: 200px;
              height: 200px;
              border-radius: 50%;
              margin: 0 auto;
            "
          />
          <div class="help-block">小程序码加载中...</div>
        </template>
      </el-skeleton>
      <template v-else>
        <img v-if="qrcode" :src="qrcode" alt="" />
        <!-- <img
            v-else
            src="/static/images/blank.png"
            alt=""
            @click="getQrCode"
          /> -->
        <el-skeleton-item
          v-else
          variant="image"
          style="
            width: 200px;
            height: 200px;
            border-radius: 50%;
            margin: 0 auto;
          "
          @click="getQrCode"
        />
        <div class="help-block">
          {{ isBindMode ? '打开微信，扫码绑定' : '打开微信，扫码登录' }}
        </div>
        <el-alert
          v-if="error && !qrcode"
          :title="error"
          type="error"
          class="mgt-20px"
          show-icon
        ></el-alert>
      </template>
    </el-card>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { checkWechatmpScanStatus, getWechatmpScanCode } from '~/api/oauth'
export default {
  layout: 'empty',
  props: {
    showHeader: {
      type: Boolean,
      default: true,
    },
    // 已登录用户，则就是绑定，否则就是登录
    // isBindMode: {
    //   type: Boolean,
    //   default: false,
    // },
    redirect: {
      type: String,
      default: '/me',
    },
  },
  data() {
    return {
      qrcode: '',
      scene: '1',
      error: '',
      loading: false,
      timeouter: null,
    }
  },
  computed: {
    ...mapGetters('user', ['user']),
    isBindMode() {
      return this.user && this.user.id > 0
    },
  },
  head() {
    return {
      title: this.isBindMode ? '微信绑定' : '微信登录',
    }
  },
  async created() {
    await Promise.all([this.getQrCode(), this.checkLoginStatus()])
  },
  beforeDestroy() {
    try {
      if (this.timeouter) {
        clearTimeout(this.timeouter)
      }
    } catch (error) {}
  },
  methods: {
    async getQrCode() {
      this.loading = true
      const res = await getWechatmpScanCode({ is_bind: this.isBindMode })
      this.loading = false
      if (res.status === 200) {
        this.qrcode = `data:image/png;base64,${res.data.code}` || ''
        this.scene = res.data.scene || ''
      } else {
        this.qrcode = ''
        this.scene = ''
        this.error = '获取小程序码失败：' + (res.data.message || res.message)
        this.$message.error(this.error)
      }
    },
    async checkLoginStatus() {
      try {
        if (this.timeouter) {
          clearTimeout(this.timeouter)
        }
      } catch (error) {}

      if (this.scene) {
        const res = await checkWechatmpScanStatus({ scene: this.scene })
        if (res.status === 200) {
          if (this.isBindMode) {
            // 绑定模式
            if (res.data.success) {
              this.$message.success('绑定成功')
              this.$router.push('/me/profile?tab=oauth')
              return
            }
          } else if (res.data.token && res.data.user) {
            // 登录模式
            this.$store.commit('user/setUser', res.data.user)
            this.$store.commit('user/setToken', res.data.token)
            await this.$store.dispatch('user/getUserPermissions')
            this.$message.success('登录成功')
            this.$router.push(
              this.$store.getters['user/redirectAfterOauth'] || '/me'
            )
            return
          }
        }
      }
      this.timeouter = setTimeout(() => {
        this.checkLoginStatus()
      }, 2000) // 改为2秒轮询一次
    },
  },
}
</script>

<style lang="scss" scoped>
.mplogin {
  .el-card {
    margin: 50px auto;
    width: 300px;
    max-width: 100%;
  }
  .help-block {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: #999;
  }
  img {
    width: 200px;
    height: 200px;
    display: block;
    margin: auto;
    border-radius: 10px;
    object-fit: cover;
  }
}
</style>
