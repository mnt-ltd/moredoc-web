<template>
  <div class="com-form-charge">
    <el-form
      ref="recharge"
      label-position="top"
      label-width="80px"
      :model="user"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="user.username" disabled></el-input>
      </el-form-item>
      <el-form-item
        :label="settings.system.credit_name || '魔豆'"
        prop="credit"
        :rules="[
          { required: true, message: '请输入充值数量', trigger: 'blur' },
        ]"
      >
        <el-input-number
          type="number"
          :min="1"
          :max="1000000"
          v-model="user.credit"
        ></el-input-number>
        <div>
          <div class="el-link el-link--info">
            每次充值，限 1 ~ 100w ，以免充值失误
          </div>
        </div>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
        :rules="[
          { required: true, message: '请输入充值备注', trigger: 'blur' },
        ]"
      >
        <el-input
          v-model="user.remark"
          rows="5"
          type="textarea"
          placeholder="请输入充值备注"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="充值用户确认"
        prop="repeat_username"
        :rules="[
          {
            required: true,
            message: '请输入当前用户的用户名予以确认',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model.trim="user.repeat_username"
          placeholder="请输入当前充值用户的用户名予以确认"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          :loading="loading"
          @click="createSystemRecharge"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { createSystemRecharge } from '~/api/order'
import { mapGetters } from 'vuex'
export default {
  name: 'FormRecharge',
  props: {
    groups: {
      type: Array,
      default: () => {
        return []
      },
    },
    initUser: {
      type: Object,
      default: () => {
        return {
          id: 0,
          username: '',
          credit: 0,
        }
      },
    },
  },
  data() {
    return {
      user: { id: 0, credit: 0 },
      loading: false,
    }
  },
  watch: {
    initUser: {
      handler(val) {
        this.user = { id: 0, credit: 0, ...val }
      },
      immediate: true,
    },
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {
    this.user = { ...this.user, ...this.initUser }
  },
  methods: {
    createSystemRecharge() {
      this.$refs.recharge.validate(async (valid) => {
        if (valid) {
          if (this.user.repeat_username !== this.user.username) {
            this.$message.error('您输入的用户名与当前要充值的用户不一致')
            return
          }

          // 确认是否给当前账号充值
          const confirm = await this.$confirm(
            `确认给用户 ${this.user.username} 充值 ${this.user.credit} ${
              this.settings.system.credit_name || '魔豆'
            }吗？`,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          )

          if (!confirm) {
            return
          }

          this.loading = true
          const res = await createSystemRecharge({
            user_id: this.user.id,
            credit: this.user.credit,
            remark: this.user.remark,
          })
          if (res.status === 200) {
            this.$message.success('充值成功')
            this.$emit('success')
          } else {
            this.$message.error(res.data.message || '充值失败')
          }
          this.loading = false
        }
      })
    },
    reset() {
      this.user = { id: 0 }
      this.$refs.recharge.resetFields()
      this.$refs.recharge.clearValidate()
    },
  },
}
</script>
<style lang="scss">
.com-form-charge {
  .el-select {
    width: 100%;
  }
}
</style>
