<script>
import wx from 'weixin-js-sdk'
import { getWxshareSignature } from '~/api/oauth'
export default {
  props: {
    shareData: {
      type: Object,
      default: () => ({
        title: '',
        imgUrl: '',
        desc: '',
      }),
    },
  },
  data() {
    return {
      // 微信配置
      wxConfg: {
        appId: '',
        timestamp: '',
        nonceStr: '',
        signature: '',
        jsApiList: [
          'checkJsApi',
          'getLocation',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'updateAppMessageShareData',
          'updateTimelineShareData',
        ],
      },
      link: location.href,
    }
  },
  async created() {
    await this.getWxSignature()
    await this.initWeixinShare()
  },
  methods: {
    // 获取微信签名信息
    async getWxSignature() {
      const res = await getWxshareSignature({
        url: this.link,
      })
      if (res.status === 200) {
        this.wxConfg.appId = res.data.appid
        this.wxConfg.timestamp = res.data.timestamp
        this.wxConfg.nonceStr = res.data.noncestr
        this.wxConfg.signature = res.data.signature
      } else {
        console.error('获取微信签名失败:', res)
      }
    },
    // 初始化微信分享
    initWeixinShare() {
      wx.config(this.wxConfg)
      wx.ready(function () {
        const shareData = { ...this.shareData, link: this.link }
        wx.updateAppMessageShareData(shareData)
        wx.updateTimelineShareData(shareData)
      })
      wx.error(function (res) {
        console.error('WeChat JSSDK error:', res)
      })
    },
  },
}
</script>

<template>
  <span></span>
</template>

<style lang="scss" scoped></style>
