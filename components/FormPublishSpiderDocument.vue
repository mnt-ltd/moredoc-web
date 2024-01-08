<template>
  <div class="com-form-publish-spider-document">
    <!-- 发布文档 -->
    <el-form ref="form" :model="form" label-position="top">
      <el-form-item
        label="用户ID"
        prop="user_id"
        :rules="[{ required: true, message: '请输入用户ID', trigger: 'blur' }]"
      >
        <el-input-number v-model="form.user_id"></el-input-number>
      </el-form-item>
      <el-form-item
        label="发布到分类"
        prop="category_id"
        :rules="[
          {
            required: true,
            message: '请选择发布到文档的分类',
            trigger: 'blur',
          },
        ]"
      >
        <el-cascader
          v-model="form.category_id"
          :options="categoryTrees"
          :props="{
            checkStrictly: true,
            expandTrigger: 'hover',
            label: 'title',
            value: 'id',
          }"
          clearable
          filterable
          placeholder="请选择发布到文档的分类"
        ></el-cascader>
      </el-form-item>
      <!-- 价格 -->
      <el-form-item label="价格" prop="price">
        <el-input-number v-model="form.price"></el-input-number>
      </el-form-item>
      <el-form-item label="文档清单" prop="documents">
        <el-alert
          type="warning"
          title="只有【采集成功】且【标题不为空】的文档才能满足发布条件"
          show-icon
        ></el-alert>
        <el-table :data="documents" height="360">
          <el-table-column prop="status" label="发布条件" width="80">
            <template slot-scope="scope">
              <i
                class="el-icon-success el-link el-link--success"
                v-if="scope.row.status && scope.row.title"
              >
                满足</i
              >
              <i v-else class="el-icon-error el-link el-link--danger">不满足</i>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="title" label="标题"></el-table-column>
          <!-- <el-table-column prop="price" label="价格" width="140">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.price"
                :min="0"
                :max="100000"
                size="mini"
              />
            </template>
          </el-table-column> -->
          <el-table-column prop="size" label="大小" width="100">
            <template slot-scope="scope">
              {{ formatBytes(scope.row.size) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="ext"
            width="70"
            label="扩展名"
          ></el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="btn-block"
          icon="el-icon-check"
          :disabled="
            documents.filter((item) => item.title && item.status === 3)
              .length === 0
          "
          @click="batchUpdateSpiderDocuments"
          >提交发布</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { formatBytes } from '~/utils/utils'
import { batchUpdateSpiderDocument } from '~/api/spiderdocument'

export default {
  props: {
    documents: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      users: [],
      prices: [],
      form: {
        user_id: localStorage.getItem('user_id') || '',
        category_id: [],
        status: 5, // 加入到发布队列
        price: 0, // 价格
      },
    }
  },
  computed: {
    ...mapGetters('category', ['categoryTrees']),
  },
  methods: {
    formatBytes,
    async batchUpdateSpiderDocuments() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const docs = this.documents.map((item) => {
            const newItem = {
              ...item,
              status: 5, // 加入到发布队列
              category_id: JSON.stringify(this.form.category_id),
              user_id: this.form.user_id,
              price: this.form.price || 0,
            }
            localStorage.setItem('user_id', this.form.user_id)
            delete newItem.url_html
            delete newItem.editing
            return newItem
          })

          // 标题为空的文档不发布
          const newDocs = docs.filter((item) => item.title && item.status === 3)

          if (newDocs.length === 0) {
            this.$message.error('文档正式标题为空，无法发布')
            return
          }

          if (newDocs.length !== docs.length) {
            this.$message.warning('已跳过部分标题为空的文档')
          }

          const res = await batchUpdateSpiderDocument({
            spider_document: newDocs,
          })

          if (res.status === 200) {
            this.$message.success('加入发布队列成功')
            this.$emit('success')
          } else {
            this.$message.error(res.data.message)
          }
        }
      })
    },
  },
}
</script>
