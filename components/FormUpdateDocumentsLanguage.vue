<template>
  <div class="com-form-update-documents-language">
    <el-form ref="form" label-position="top" label-width="80px" :model="form">
      <el-form-item
        label="文档语言"
        prop="language"
        :rules="[
          { required: true, trigger: 'blur', message: '请选择新的文档语言' },
        ]"
      >
        <el-select
          v-model="form.language"
          filterable
          placeholder="请选择新的文档语言"
        >
          <el-option
            v-for="item in settings.language"
            :key="item.code"
            :label="item.language"
            :value="item.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文档列表" class="document-list">
        <DocumentSimpleList :target="'_blank'" :docs="documents" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          @click="setDocumentsLanguage"
          >提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { setDocumentsLanguage } from '~/api/document'
import { mapGetters } from 'vuex'
export default {
  name: 'FormUpdateDocumentsLanguage',
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
        language: '',
        document_id: [],
      },
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {},
  methods: {
    async setDocumentsLanguage() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.$confirm('您确定要批量修改文档语言吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          })
            .then(async () => {
              this.form.document_id = this.documents.map((item) => item.id)
              const res = await setDocumentsLanguage(this.form)
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
.com-form-update-documents-language {
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
