<template>
  <el-form
    ref="formArticle"
    label-position="top"
    label-width="80px"
    :model="article"
  >
    <el-row :gutter="20">
      <el-col :span="11">
        <el-form-item
          label="标题"
          prop="title"
          :rules="[
            { required: true, trigger: 'blur', message: '请输入文章标题' },
          ]"
        >
          <el-input
            v-model="article.title"
            placeholder="请输入文章标题"
            clearable
          >
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item
          label="分类"
          prop="category_id"
          :rules="[
            { required: true, trigger: 'blur', message: '请选择文章分类' },
          ]"
        >
          <el-cascader
            v-model="article.category_id"
            :options="categoryTrees"
            :filterable="true"
            :props="{
              checkStrictly: true,
              expandTrigger: 'hover',
              label: 'title',
              value: 'id',
            }"
            clearable
            placeholder="请选择文章分类"
          ></el-cascader>
        </el-form-item>
      </el-col>
      <el-col :span="7">
        <el-form-item label="标识" prop="identifier">
          <!-- 管理员才有权限设置标识 -->
          <el-input
            v-model="article.identifier"
            placeholder="请输入文章标识，建议为字母和数字组合"
            :disabled="article.id > 0"
            clearable
          ></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="11">
        <el-form-item label="关键字">
          <el-input
            v-model="article.keywords"
            placeholder="请输入文章关键字，多个关键字用英文逗号分隔"
          ></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="7">
        <!-- 推荐 -->
        <el-form-item label="推荐">
          <el-switch
            v-model="article.is_recommend"
            active-text="是"
            inactive-text="否"
          ></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="描述">
      <el-input
        v-model="article.description"
        placeholder="请输入文章描述，可为空"
        type="textarea"
        rows="5"
      ></el-input>
    </el-form-item>
    <el-form-item label="内容" class="editor-item">
      <Editor v-model="article.content" :init="init"></Editor>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        class="btn-block"
        icon="el-icon-check"
        :loading="loading"
        @click="onSubmit"
        >提交</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import { createArticle, updateArticle } from '~/api/article'
export default {
  components: {
    Editor,
  },
  props: {
    initArticle: {
      type: Object,
      default: () => {
        return {
          title: '',
          identifier: '',
          keywords: '',
          description: '',
          content: '',
          id: 0,
          category_id: [],
        }
      },
    },
    categoryTrees: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      init: {
        base_url: '/static/tinymce',
        language_url: '/static/tinymce/langs/zh-Hans.js', // 语言包的路径
        language: 'zh-Hans', // 语言
        skin_url: '/static/tinymce/skins/ui/oxide', // skin路径
        height: 600, // 编辑器高度
        branding: true, // 是否禁用“Powered by TinyMCE”
        menubar: true, // 顶部菜单栏显示,
        toolbar:
          'undo redo | styleselect blocks | kityformula-editor codesample table link bold italic | bullist numlist alignleft aligncenter alignright alignjustify indent outdent | image media | searchreplace preview fullscreen help',
        plugins:
          'kityformula-editor image media wordcount codesample code link charmap emoticons table searchreplace visualblocks fullscreen table paste code help wordcount lists preview',
        relative_urls: false, // 是否使用相对路径
        images_upload_handler: this.images_upload_handler,
      },
      loading: false,
      article: {
        title: '',
        identifier: '',
        keywords: '',
        description: '',
        content: '',
        id: 0,
        category_id: [],
      },
    }
  },
  watch: {
    initArticle: {
      handler(val) {
        this.article = { ...val }
      },
      immediate: true,
    },
  },
  mounted() {
    tinymce.init({})
  },
  methods: {
    images_upload_handler(blobInfo, progress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.withCredentials = false
        xhr.open('POST', '/api/v1/upload/article?type=image')
        // 设置header
        xhr.setRequestHeader(
          'Authorization',
          'Bearer ' + this.$store.state.user.token
        )
        xhr.upload.onprogress = (e) => {
          progress((e.loaded / e.total) * 100)
        }

        xhr.onload = () => {
          if (xhr.status === 403) {
            reject(new Error('HTTP Error: ' + xhr.status))
            return
          }
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error('HTTP Error: ' + xhr.status))
            return
          }
          const res = JSON.parse(xhr.responseText)
          resolve(res.data.url)
        }

        xhr.onerror = () => {
          reject(
            new Error(
              'Image upload failed due to a XHR Transport error. Code: ' +
                xhr.status
            )
          )
        }
        const formData = new FormData()
        formData.append('file', blobInfo.blob(), blobInfo.filename())
        xhr.send(formData)
      })
    },
    onSubmit() {
      this.$refs.formArticle.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.loading = true
        const article = { ...this.article }
        if (this.article.id > 0) {
          const res = await updateArticle(article)
          if (res.status === 200) {
            this.$message.success('修改成功')
            this.$emit('success', res.data)
          } else {
            this.$message.error(res.data.message)
          }
        } else {
          const res = await createArticle(article)
          if (res.status === 200) {
            this.$message.success('新增成功')
            this.$emit('success', res.data)
            this.article = res.data
          } else {
            this.$message.error(res.data.message)
          }
        }
        this.loading = false
      })
    },
  },
}
</script>

<style>
.tox-promotion {
  display: none !important;
}
</style>
<style lang="scss" scoped>
.header-title {
  height: 40px;
  line-height: 40px;
  font-size: 20px;
}
</style>
