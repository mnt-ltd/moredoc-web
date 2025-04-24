<template>
  <div class="mplogin">
    <el-card shadow="never">
      <div slot="header">小程序扫码登录</div>
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
        <el-tooltip content="点击刷新小程序码" placement="top">
          <img v-if="qrcode" :src="qrcode" alt="" />
          <img
            v-else
            src="https://cdn.jsdelivr.net/gh/yangshun/tech-interview-handbook@master/static/images/empty.png"
            alt=""
            @click="getQrCode"
          />
        </el-tooltip>
        <div class="help-block">打开微信，扫码登录</div>
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
import { checkWechatmpScanStatus, getWechatmpScanCode } from '~/api/oauth'
export default {
  layout: 'empty',
  data() {
    return {
      qrcode: '',
      scene: '1',
      error: '',
      loading: false,
      timeouter: null,
    }
  },
  async created() {
    await Promise.all([this.getQrCode(), this.checkLoginStatus()])
  },
  methods: {
    async getQrCode() {
      this.loading = true
      const res = await getWechatmpScanCode()
      this.loading = false
      if (res.status === 200) {
        this.qrcode = res.data.qrcode || ''
        this.scene = res.data.scene || ''
      } else {
        this.qrcode = ''
        this.scene = ''
        this.error = '获取小程序码失败' + (res.data.message || res.message)
        this.$message.error(this.error)
      }
    },
    async checkLoginStatus() {
      console.log('checkLoginStatus')
      try {
        if (this.timeouter) {
          clearTimeout(this.timeouter)
        }
      } catch (error) {}

      if (this.scene) {
        const res = await checkWechatmpScanStatus({ scene: this.scene })
        if (res.status === 200) {
          console.log('checkLoginStatus success', res)
        } else {
          console.log('checkLoginStatus error', res)
        }
      }
      this.timeouter = setTimeout(() => {
        this.checkLoginStatus()
      }, 1000)
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
    cursor: pointer;
    &:hover {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
