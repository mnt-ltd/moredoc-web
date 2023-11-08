<template>
    <div class="bind-account">
        <!-- <div class="avatar text-center">
            <el-avatar :size="64" :src="oauth.avatar"></el-avatar>
        </div> -->
        <template v-if="existAccount">
            <el-tabs v-if="settings.system.enable_sms">
                <el-tab-pane label="密码登录并绑定">
                <form-login :isOauthBind="true" @onSuccess="loginOrRegisterSuccess"></form-login>
                </el-tab-pane>
                <el-tab-pane label="短信登录并绑定">
                <form-login-mobile  :isOauthBind="true" @onSuccess="loginOrRegisterSuccess"></form-login-mobile>
                </el-tab-pane>
            </el-tabs>
            <form-login v-else  :isOauthBind="true" @onSuccess="loginOrRegisterSuccess"></form-login>
        </template>
        <template v-else>
            <el-tabs v-if="settings.system.enable_sms">
            <el-tab-pane label="邮箱注册并绑定">
                <form-register  :isOauthBind="true" @onSuccess="loginOrRegisterSuccess"></form-register>
            </el-tab-pane>
            <el-tab-pane label="手机注册并绑定">
                <form-register-mobile  :isOauthBind="true" @onSuccess="loginOrRegisterSuccess"></form-register-mobile>
            </el-tab-pane>
            </el-tabs>
            <form-register v-else  :isOauthBind="true" @onSuccess="loginOrRegisterSuccess"></form-register>
        </template>
        <div class="text-center" v-if="existAccount">没有帐号？<el-button type="text" @click="switchBind">注册一个</el-button> </div>
        <div class="text-center" v-else>已有帐号？<el-button type="text" @click="switchBind">点此绑定</el-button></div>
    </div>
</template>
<script>
import {
    mapGetters,
} from 'vuex'
import {
    bindOauth
} from '~/api/oauth'
export default {
    data() {
        return {
            existAccount: true,
        }
    },
    props:{
        oauth:{
            type:Object,
            default:()=>{}
        },
        redirect: {
            type: String,
            default: '/me',
        },
    },
    computed: {
        ...mapGetters('setting', ['settings']),
        ...mapGetters('user', ['user', 'redirectAfterOauth']),
    },
    methods: {
        switchBind() {
            this.existAccount = !this.existAccount
        },
        async loginOrRegisterSuccess(res){
            // console.log('loginOrRegisterSuccess',res)
            const resOauth =await bindOauth({
                openid: this.oauth.openid,
                oauth_type: this.oauth.oauth_type,
            })
            // console.log('bindOauth',resOauth)
            if(resOauth.status===200){
                this.$message.success('绑定成功')
                this.$router.replace(this.redirectAfterOauth || '/me')
            }else{
                this.$message.error(resOauth.data.message || '绑定失败')
            }
        },
    }
}
</script>
<style lang="scss" scoped>
</style>