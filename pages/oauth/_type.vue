<template>
    <div></div>
</template>
<script>
import {
    loginOauth
} from '~/api/oauth'
import{
    oauthTypeGitee,
    oauthTypeGithub,
    oauthTypeQQ,
    oauthTypeWechat,
    oauthTypeCustom,
} from '~/utils/enum'
export default{
    data(){
        return{
        }
    },
    created(){
        this.loginOauth()
    },
    methods:{
        async loginOauth(){
            let code = this.$route.query.code || ''
            if(code===''){
                this.$message.error('code不能为空')
                return
            }

            let oauthType = 0
            switch (this.$route.params.type) {
                case "gitee":
                    oauthType = oauthTypeGitee
                    break;
                case "github":
                    oauthType = oauthTypeGithub
                    break;
                case "qq":
                    oauthType = oauthTypeQQ
                    break;
                case "wechat":
                    oauthType = oauthTypeWechat
                    break;
                case "custom":
                    oauthType = oauthTypeCustom
                    break;
                default:
                    break;
            }

            if (oauthType===0){
                this.$message.error('未知授权类型')
                return
            }

            console.log(this.$route.query, this.$route.params)
            const res = await loginOauth({
                code:this.code,
                oauth_type: oauthType,
            })

            // TODO: 在vuex中登录

            if(res.status===200){
                this.$message.success('登录成功')
                this.$store.commit('setUser', res.data.user)
                this.$store.commit('setToken', res.data.token)
                this.$router.push('/')
            }else{
                this.$message.error('登录失败')
            }
            console.log(res)
        }
    }
}
</script>