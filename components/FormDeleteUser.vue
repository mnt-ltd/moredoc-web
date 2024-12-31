<template>
  <div class="com-form-delete-user">
    <el-form :model="deleteUserRequest" label-width="80px" label-position="top">
      <el-form-item label="用户列表">
        <el-table :data="users" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column
            prop="username"
            label="用户名"
            width="150"
          ></el-table-column>
          <el-table-column prop="doc_count" label="文档" :width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.doc_count || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="article_count" label="文章" :width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.article_count || 0 }}</span>
            </template></el-table-column
          >
          <el-table-column label="删除检测">
            <template slot-scope="scope">
              <!-- 如果文档数或文章数大于0，则不符合删除 -->
              <span
                v-if="scope.row.doc_count > 0 || scope.row.article_count > 0"
                class="text-danger"
                >不可删除。用户文档或文章数量大于0</span
              >
              <span v-else style="color: #67c23a"
                >可删除。用户未发布文档和文章</span
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="您的密码">
        <el-input
          v-model="deleteUserRequest.password"
          placeholder="请输入您的密码，以验证身份"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="danger"
          :disabled="disableDelete"
          icon="el-icon-delete"
          @click="onSubmit"
          >提交删除</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { deleteUser } from '~/api/user'
export default {
  name: 'FormDeleteUser',
  components: {},
  props: {
    users: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      deleteUserRequest: {
        id: [],
        password: '',
      },
    }
  },
  computed: {
    disableDelete() {
      // 如果用户列表中，存在文档数或文章数大于0的用户，则不允许删除
      return this.users.some(
        (item) => item.doc_count > 0 || item.article_count > 0
      )
    },
  },
  watch: {
    users: {
      handler(val) {
        this.deleteUserRequest.id = val.map((item) => item.id)
      },
      immediate: true,
    },
  },
  methods: {
    async onSubmit() {
      const res = await deleteUser(this.deleteUserRequest)
      if (res.status === 200) {
        this.$message.success('删除成功')
        this.$emit('success')
      } else {
        this.$message.error(res.data.message || '删除失败')
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
