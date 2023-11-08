<template>
    <div v-if="oauths.length>0" class="oauth">
        <div class="tips">您可以通过以下方式快速注册或登录</div>
        <a v-for="(oauth, idx) in oauths" :key="idx" :href="oauth.authorize_url" rel="nofollow" >
            <img :src="oauth.icon" :alt="oauth.name" :title="oauth.name">
        </a>
    </div>
</template>
<script>
import {
    getEnableOauths
} from '~/api/oauth'
import {
    oauthTypeCustom,
    oauthTypeGitee,
    oauthTypeGithub,
    oauthTypeQQ,
    oauthTypeWechat
} from '~/utils/enum'
export default {
    name: 'Oauth',
    data() {
        return {
            oauths: []
        }
    },
    mounted() {
        
    },
    created() {
        this.getEnableOauths()
    },
    methods: {
        async getEnableOauths() {
            const res = await getEnableOauths()
            if (res.status === 200 && res.data) {
                let oauths = res.data.oauths || []
                oauths = oauths.map(item=>{
                    switch (item.type) {
                        case oauthTypeQQ:
                            item.authorize_url = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${item.client_id}&redirect_uri=${item.redirect_url}&state=qq&scope=get_user_info`
                            break;
                        case oauthTypeWechat:
                            item.authorize_url = `https://open.weixin.qq.com/connect/qrconnect?appid=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=snsapi_login&state=wechat#wechat_redirect`
                            break;
                        case oauthTypeGitee:
                            item.authorize_url = `https://gitee.com/oauth/authorize?client_id=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=user_info`
                            break;
                        case oauthTypeGithub:
                            item.authorize_url = `https://github.com/login/oauth/authorize?client_id=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=user`
                            break;
                        case oauthTypeCustom:
                            item.authorize_url = `${item.authorize_url}?client_id=${item.client_id}&redirect_uri=${item.redirect_url}&response_type=code&scope=user`
                            break;
                        default:
                            break;
                    }
                    return item
                })
                this.oauths = oauths
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.oauth {
    .tips{
        color: #888;
        font-size: 13px;
    }
    a {
        display: inline-block;
        margin: 10px 10px 10px 0;
        img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
    }
}
</style>