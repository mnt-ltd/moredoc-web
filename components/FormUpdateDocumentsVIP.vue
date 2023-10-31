<template>
  <div class="com-form-update-documents-vip">
    <el-form ref="form" label-position="top" label-width="80px" :model="form">
      <el-form-item label="文档列表" class="document-list">
        <DocumentSimpleList :target="'_blank'" :docs="documents" />
      </el-form-item>
      <!-- 是否设置为VIP，用 switch 组件 -->
      <el-form-item prop="is_vip">
        <el-switch
          v-model="form.is_vip"
          :active-value="true"
          :inactive-value="false"
          active-text="设置VIP文档"
          inactive-text="取消VIP文档"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          @click="setDocumentsVIP"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { setDocumentsVIP } from '~/api/document'
import { mapGetters } from 'vuex'
export default {
  name: 'FormUpdateDocumentsVIP',
  props: {
    documents: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      form: {
        is_vip: false,
        document_id: [],
      },
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {},
  methods: {
    async setDocumentsVIP() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          let tips = '您确定要将选中的文档取消VIP吗？'
          if (this.form.is_vip) {
            tips = '您确定要将选中的文档设置为VIP吗？'
          }
          this.$confirm(tips, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(async () => {
              this.form.document_id = this.documents.map((item) => item.id)
              const res = await setDocumentsVIP(this.form)
              if (res.status === 200) {
                this.$message.success('修改成功')
                this.$emit('success', res.data)
              }
            })
            .catch(() => {})
        }
      })
    },
  },
}
</script>
<style lang="scss">
.com-form-update-documents-vip {
  .document-list {
    ul,
    li {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    ul {
      max-height: 300px;
      overflow: auto;
    }
    li {
      line-height: 30px;
      color: #777;
    }
  }
}
</style>
