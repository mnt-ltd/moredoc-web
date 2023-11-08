<template>
    <div class="bind-account">
        <div class="avatar text-center">
            <el-avatar :size="64" :src="oauth.avatar"></el-avatar>
        </div>
        <FormLogin v-if="existAccount"/>
        <FormRegister v-else />
        <div class="text-center" v-if="existAccount">没有帐号？<el-button type="text" @click="switchBind">注册一个</el-button> </div>
        <div class="text-center" v-else>已有帐号？<el-button type="text" @click="switchBind">点此绑定</el-button></div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            existAccount: true,
            bindData:{
                email: '',
                username: '',
                password: '',
                repeat_password: '',
            }
        }
    },
    props:{
        oauth:{
            type:Object,
            default:()=>{}
        }
    },
    methods: {
        switchBind() {
            this.existAccount = !this.existAccount
            this.bindData.password = ''
            this.bindData.repeat_password = ''
            this.bindData.username = ''
            this.bindData.email = ''
            if(!this.existAccount){
                this.bindData.username = this.oauth.username || ''
                this.bindData.email = this.oauth.email || ''
            }
        },
        bindOauth(){
            this.$refs.oauth.validate(async valid=>{
                if(!valid){
                    return
                }
                let data = {...this.bindData, oauth_type: this.oauth.oauth_type, openid: this.oauth.openid}
                if(data.password || data.repeat_password){
                    if(data.password !== data.repeat_password){
                        this.$message.error('两次输入的密码不一致')
                        return
                    }
                }
                delete data.repeat_password
                console.log('bindOauth', data)
            })
        }
    }
}
</script>
<style lang="scss" scoped>
</style>