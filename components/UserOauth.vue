<template>
    <div class="user-oauth">
        <!-- 用了el-table展示userOauths数据 -->
        <el-table :data="userOauths">
            <el-table-column prop="oauth_type" label="登录类型" :min-width="81">
                <template slot-scope="scope">
                    {{ getOauthName(scope.row.oauth_type) || '-'  }}
                </template>
            </el-table-column>
            <el-table-column prop="avatar" label="头像" :min-width="72">
                <template slot-scope="scope">
                    <el-avatar :size="48" :src="scope.row.avatar"></el-avatar>
                </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名"></el-table-column>
            <el-table-column prop="nickname" label="昵称"></el-table-column>
            <el-table-column prop="updated_at" label="绑定时间">
                <template slot-scope="scope">
                    <small>{{ formatDatetime(scope.row.updated_at)  }}</small>
                </template>
            </el-table-column>
            <el-table-column label="操作" :width="100">
                <template slot-scope="scope">
                    <el-button type="danger" icon="el-icon-close" size="mini" @click="unbind(scope.row.id)">解绑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="mgt-20px" v-if="loadDone">
            <Oauth :redirect="`/me/profile?tab=oauth`" :isBind="true" :showName="true" :userOauths="userOauths" ref="oauth"/>
        </div>
    </div>
</template>
<script>
import {
    listUserOauth,
    deleteUserOauth,
} from '~/api/user'
import {
    getEnableOauths,
} from '~/api/oauth'
import {
    formatDatetime,
} from '~/utils/utils'
export default{
    name:'UserOauth',
    data(){
        return{
            userOauths:[],
            oauths: [],
            oauthsMap:{},
            loadDone: false,
        }
    },
    created(){
        Promise.all([
            this.getUserOauths(),
            this.getEnableOauths(),
        ])
    },
    methods:{
        formatDatetime,
        async getUserOauths(){
            const res = await listUserOauth()
            console.log(res)
            if(res.status===200){
                this.userOauths = res.data.oauth || []
            }
            this.loadDone=true
        },
        async getEnableOauths(){
            const res = await getEnableOauths()
            if(res.status===200){
                let oauths = res.data.oauths || []
                this.oauths= oauths
                oauths.map((item)=>{
                    this.oauthsMap[item.type] = item
                })
            }
        },
        getOauthName(type){
            try {
                return this.oauthsMap[type].name
            } catch (error) {
                return ''
            }
        },
        async unbind(id){
            // 弹出确认框
            this.$confirm('解绑后将无法使用该第三方帐号快速登录，您确定要解绑吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await deleteUserOauth({id})
                if(res.status===200){
                    this.$message({
                        type: 'success',
                        message: '解绑成功!'
                    })
                    await this.getUserOauths()
                    try {
                        this.$refs.oauth.getEnableOauths()
                    } catch (error) {
                        console.log(error)
                    }
                }
            })
        }
    }
}
</script>