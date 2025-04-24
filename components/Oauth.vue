<template>
  <div v-if="enableOauths.length > 0" class="oauth">
    <div v-if="isBind" class="tips">您还可以绑定以下第三方帐号</div>
    <div v-else class="tips">您可以通过以下方式快速注册或登录</div>
    <a
      v-for="(oauth, idx) in enableOauths"
      :key="idx"
      :href="isBound(oauth.type) ? 'javascript:;' : oauth.authorize_url"
      rel="nofollow"
      :class="isBound(oauth.type) ? 'bound' : ''"
      @click="showLoginDialog(oauth)"
    >
      <el-tooltip class="item" effect="dark" :content="oauth.name">
        <img :src="oauth.icon" :alt="oauth.name" />
        <div v-if="showName">{{ oauth.name }}</div>
      </el-tooltip>
    </a>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import { getOauths } from '~/api/oauth'
import {
  oauthTypeCustom,
  oauthTypeGitee,
  oauthTypeGithub,
  oauthTypeQQ,
  oauthTypeWechat,
  oauthTypeGoogle,
  oauthTypeWechatMini,
  oauthTypeOfficialAccount,
} from '~/utils/enum'
import { isWeixin } from '~/utils/utils'
export default {
  name: 'Oauth',
  props: {
    redirect: {
      type: String,
      default: '/me',
    },
    isBind: {
      type: Boolean,
      default: false,
    },
    showName: {
      type: Boolean,
      default: false,
    },
    userOauths: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      oauths: [],
      enableOauths: [],
      bound: {},
      oauthTypeOfficialAccount,
    }
  },
  watch: {
    redirect: {
      handler(val) {
        this.setRedirectAfterOauth(val)
      },
      deep: true,
      immediate: true,
    },
    userOauths: {
      handler(val) {
        this.bound = {}
        val.map((item) => {
          this.bound[item.oauth_type] = true
          return item
        })
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.getOauths()
  },
  methods: {
    ...mapActions('user', ['setRedirectAfterOauth']),
    isWeixin,
    async getOauths() {
      const res = await getOauths()
      if (res.status === 200 && res.data) {
        let oauths = res.data.oauths || []
        oauths = oauths.map((item) => {
          switch (item.type) {
            case oauthTypeQQ:
              item.authorize_url = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${item.client_id}&redirect_uri=${item.redirect_url}&state=qq&scope=get_user_info`
              break
            case oauthTypeWechat:
              item.authorize_url = `https://open.weixin.qq.com/connect/qrconnect?appid=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=snsapi_login&state=wechat#wechat_redirect`
              break
            case oauthTypeOfficialAccount:
              item.authorize_url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=snsapi_userinfo&state=wechat#wechat_redirect`
              break
            case oauthTypeGitee:
              item.authorize_url = `https://gitee.com/oauth/authorize?client_id=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=user_info`
              break
            case oauthTypeGithub:
              item.authorize_url = `https://github.com/login/oauth/authorize?client_id=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=user`
              break
            case oauthTypeCustom:
              item.authorize_url = `${item.authorize_url}?client_id=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=user`
              break
            case oauthTypeGoogle:
              item.authorize_url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=openid%20email%20profile`
              break
            case oauthTypeWechatMini:
              item.authorize_url = `/oauth/wechatmp`
              break
            default:
              break
          }
          return item
        })
        oauths = oauths.filter(
          (item) => item.type !== oauthTypeOfficialAccount
          //  || (item.type === oauthTypeOfficialAccount && isWeixin())
        )
        this.oauths = oauths
        this.enableOauths = oauths.filter((item) => item.enable)
      }
    },
    newWindow(href) {
      // 新开一个浏览器窗口打开oauth登录链接
      window.open(
        href,
        'newWindow',
        'height=600,width=800,top=100,left=100,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no'
      )
    },
    isBound(type) {
      return this.bound[type]
    },
    showLoginDialog(oauth) {
      console.log(oauth)
    },
  },
}
</script>
<style lang="scss" scoped>
.oauth {
  .tips {
    color: #888;
    font-size: 13px;
  }
  a {
    display: inline-block;
    margin: 10px 10px 10px 0;
    text-align: center;
    text-decoration: none;
    font-size: 13px;
    color: #888;
    &:hover {
      color: #333;
    }
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    &.bound {
      color: #ccc;
      cursor: not-allowed;
      img {
        // 将图片设置为浅灰色
        filter: invert(0.2);
      }
    }
  }
}
</style>
