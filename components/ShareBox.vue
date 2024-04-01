<template>
  <div class="com-share-box">
    <span class="text-muted">分享到: &nbsp;</span>
    <el-popover
      placement="top"
      width="200"
      class="hidden-xs-only"
      trigger="hover"
    >
      <div id="qrcode" ref="qrcode" class="qrcode text-center">
        <div class="mgb-5px">打开微信 扫码分享</div>
      </div>
      <span slot="reference">
        <span target="_blank" class="share-wechat">
          <i class="fa fa-wechat"></i>
        </span>
      </span> </el-popover
    ><el-tooltip effect="dark" content="分享到QQ" placement="top">
      <a
        :href="`https://connect.qq.com/widget/shareqq/index.html?title=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(currentURL)}`"
        target="_blank"
        class="share-qq"
      >
        <i class="fa fa-qq"></i>
      </a> </el-tooltip
    ><el-tooltip effect="dark" content="分享到微博" placement="top">
      <a
        :href="`https://service.weibo.com/share/share.php?title=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(currentURL)}`"
        target="_blank"
        class="share-weibo"
      >
        <i class="fa fa-weibo"></i>
      </a>
    </el-tooltip>
  </div>
</template>
<script>
import QRCode from 'qrcodejs2' // 引入qrcode
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  computed: {
    currentURL() {
      return window.location.href
    },
  },
  watch: {
    title() {
      this.qrcode()
    },
  },
  methods: {
    qrcode() {
      // 把之前可能存在的二维码清空
      this.$refs.qrcode.innerHTML =
        '<div class="mgb-5px">打开微信 扫码分享</div>'
      // eslint-disable-next-line no-new
      new QRCode('qrcode', {
        width: 200,
        height: 200,
        text: location.href,
        colorDark: '#000',
        colorLight: '#fff',
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.com-share-box {
  a {
    margin-left: 10px;
  }
  .share-weibo {
    .fa {
      font-size: 17px;
      color: rgb(235, 25, 45);
    }
  }
  .share-qq {
    .fa {
      color: #208de1;
    }
  }
  .share-wechat {
    cursor: pointer;
    .fa {
      color: #1abc9c;
    }
  }
  .article-share {
    .el-tooltip {
      margin-left: 10px;
    }
  }
  font-size: 14px;
  line-height: 40px;
  .item {
    margin-right: 10px;
  }
}
#qrcode {
  img {
    margin: 20px auto;
  }
}
</style>
