<template>
    <div class="page-oauth">
        <el-card shadow="never">
            <div slot="header">完善用户信息</div>
            <OauthBind :oauth="oauth"/>
        </el-card>
    </div>
</template>
<script>
import{
    oauthTypeGitee,
    oauthTypeGithub,
    oauthTypeQQ,
    oauthTypeWechat,
    oauthTypeCustom,
} from '~/utils/enum'
import {
    mapActions,
    mapGetters,
} from 'vuex'
export default{
    data(){
        return{
            title: '',
            oauth:{
                id: 0,
            },
        }
    },
    computed:{
        ...mapGetters('setting',['settings']),
    },
    head(){
        return{
            title:this.title || `[${this.$route.params.type}]登录中... - ${this.settings.system.sitename}`,
        }
    },
    created(){
        this.login()
    },
    methods:{
        ...mapActions('user',['loginOauth']),
        async login(){
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
            const res = await this.loginOauth({
                code:this.code,
                oauth_type: oauthType,
            })

            if(res.status===200){
                if(res.data.oauth){
                    this.title=`[${this.$route.params.type}] 完善用户信息 - ${this.settings.system.sitename}`
                    this.oauth = res.data.oauth
                }else{
                    this.$message.success('登录成功')
                    this.$router.push('/')
                }
            }else{
                this.$message.error(res.data.message || '登录失败')
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.page-oauth{
    .el-card{
        margin: 0 auto;
        width: 640px;
        max-width: 100%;
    }
}
</style>