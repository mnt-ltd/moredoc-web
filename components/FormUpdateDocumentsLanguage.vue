<template>
  <div class="com-form-update-documents-language">
    <el-form ref="form" label-position="top" label-width="80px" :model="form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="批量默认文档语言" prop="language">
            <el-select
              v-model="form.language"
              filterable
              placeholder="请选择新的文档语言"
              @change="changeLanguage"
            >
              <el-option
                v-for="item in settings.language"
                :key="item.code"
                :label="item.language"
                :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="检测文档语言">
            <el-button
              type="primary"
              class="btn-block"
              icon="el-icon-refresh"
              :loading="detecting"
              @click="detectDocumentLanguage"
              >检测文档语言</el-button
            >
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="文档列表" class="document-list">
        <el-table :data="docs" style="width: 100%" :max-height="420">
          <el-table-column
            prop="title"
            label="文档标题"
            min-width="300"
          ></el-table-column>
          <el-table-column
            prop="language"
            label="文档语言"
            width="200"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.language"
                filterable
                clearable
                size="medium"
              >
                <el-option
                  v-for="item in settings.language"
                  :key="item.code"
                  :label="item.language"
                  :value="item.code"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          @click="setDocumentsLanguage"
          >提交设置</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { setDocumentsLanguage, detectDocumentLanguage } from '~/api/document'
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
      detecting: false,
      form: {
        language: '',
        document_id: [],
      },
      docs: [],
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  created() {},
  watch: {
    documents: {
      handler(val) {
        this.docs = val.map((item) => {
          return {
            id: item.id,
            title: item.title,
            language: item.language || '',
          }
        })
      },
      immediate: true,
    },
  },
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
              const res = await setDocumentsLanguage({ document: this.docs })
              if (res.status === 200) {
                this.$message.success('修改成功')
                this.$emit('success', res.data)
              }
            })
            .catch(() => {})
        }
      })
    },
    async detectDocumentLanguage() {
      let ids = []
      this.documents.forEach((item) => {
        ids.push(item.id)
      })
      this.detecting = true
      const res = await detectDocumentLanguage({ document_id: ids })
      this.detecting = false
      if (res.status === 200) {
        this.docs = (res.data.document || []).map((item) => {
          return {
            id: item.id,
            title: item.title,
            language: item.language || '',
          }
        })
      }
    },
    changeLanguage() {
      this.docs.forEach((item) => {
        item.language = this.form.language
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
