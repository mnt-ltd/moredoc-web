<template>
    <div class="bind-account">
        <div class="avatar text-center">
            <el-avatar :size="64" :src="oauth.avatar"></el-avatar>
        </div>
        <el-form :model="bindData" label-width="80px" ref="oauth"  label-position="top">
            <div v-if="existAccount">
                    <el-form-item label="登录账号" prop="username" :rules="[{
                        required: true,
                        message: '请输入用户名、邮箱或手机号码',
                        trigger: 'blur'
                    }]">
                        <el-input v-model="bindData.username" placeholder="请输入用户名、邮箱或手机号码"></el-input>
                    </el-form-item>
                    <el-form-item label="登录密码" prop="password" :rules="[{
                        required: true,
                        message: '请输入密码',
                        trigger: 'blur'
                    }]">
                        <el-input v-model="bindData.password" type="password" placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="bindOauth" class="btn-block" icon="el-icon-connection">登录并绑定</el-button>
                    </el-form-item>
                <div class="text-center">已有帐号？<el-button type="text" @click="switchBind">点此绑定</el-button></div>
            </div>
            <div v-else>
                    <el-form-item label="邮箱" prop="email" :rules="[{
                        required: true,
                        message: '请输入邮箱，以便用于找回密码',
                        trigger: 'blur'
                    }]">
                        <el-input v-model="bindData.email" placeholder="请输入邮箱，以便用于找回密码"></el-input>
                    </el-form-item>
                    <el-form-item label="用户名" prop="username" :rules="[{
                        required: true,
                        message: '请输入用户名',
                        trigger: 'blur'
                    }]">
                        <el-input v-model="bindData.username" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="登录密码" prop="password" :rules="[{
                        required: true,
                        message: '请输入密码',
                        trigger: 'blur'
                    }]">
                        <el-input v-model="bindData.password" type="password" placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="repeat_password" :rules="[{
                        required: true,
                        message: '请再次输入密码',
                        trigger: 'blur'
                    }]">
                        <el-input v-model="bindData.repeat_password" type="password" placeholder="请再次输入密码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="bindOauth" class="btn-block" icon="el-icon-connection">注册并绑定</el-button>
                    </el-form-item>
                <div class="text-center">没有帐号？<el-button type="text" @click="switchBind">注册一个</el-button> </div>
            </div>
        </el-form>
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