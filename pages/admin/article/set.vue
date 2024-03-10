<template>
  <div>
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="4">
            <el-button icon="el-icon-back" @click="onCancel">返回</el-button>
          </el-col>
          <el-col :span="20" class="text-center">
            <div class="header-title">
              <span v-if="article.id > 0">编辑文章</span>
              <span v-else>新增文章</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <el-form
        ref="formArticle"
        label-position="top"
        label-width="80px"
        :model="article"
      >
        <el-row :gutter="20">
          <el-col :span="12">
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
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关键字">
              <el-input
                v-model="article.keywords"
                placeholder="请输入文章关键字，多个关键字用英文逗号分隔"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="标识"
              prop="identifier"
              :rules="[
                {
                  required: true,
                  trigger: 'blur',
                  message: '请输入文章标识，建议为字母和数字组合',
                },
              ]"
            >
              <!-- 如果是编辑文章，不允许修改文章标识 -->
              <el-input
                v-model="article.identifier"
                placeholder="请输入文章标识，建议为字母和数字组合"
                :disabled="article.id > 0"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者">
              <el-input
                v-model="article.author"
                placeholder="请输入文章作者，可为空，默认为当前登录用户"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input
            v-model="article.description"
            placeholder="请输入文章描述，可为空"
            type="textarea"
            rows="3"
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
    </el-card>
  </div>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import { getArticle, createArticle, updateArticle } from '~/api/article'
export default {
  components: {
    Editor,
  },
  layout: 'admin',
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
      article: {
        title: '',
        identifier: '',
        keywords: '',
        description: '',
        content: '',
        id: 0,
      },
    }
  },
  mounted() {
    tinymce.init({})
  },
  created() {
    this.getArticle()
  },
  methods: {
    async getArticle() {
      const id = this.$route.query.id
      if (!id) {
        return
      }
      const res = await getArticle({ id: this.$route.query.id })
      if (res.status !== 200) {
        this.$message.error(res.data.message || '获取文章失败')
        return
      }
      this.article = res.data
    },
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
            reject({ message: 'HTTP Error: ' + xhr.status, remove: true })
            return
          }
          if (xhr.status < 200 || xhr.status >= 300) {
            reject('HTTP Error: ' + xhr.status)
            return
          }
          const res = JSON.parse(xhr.responseText)
          console.log(res)
          resolve(res.data.url)
        }

        xhr.onerror = () => {
          reject(
            'Image upload failed due to a XHR Transport error. Code: ' +
              xhr.status
          )
        }
        const formData = new FormData()
        formData.append('file', blobInfo.blob(), blobInfo.filename())
        xhr.send(formData)
      })
    },
    async onSubmit() {
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
          } else {
            this.$message.error(res.data.message)
          }
        } else {
          const res = await createArticle(article)
          if (res.status === 200) {
            this.$message.success('新增成功')
            this.article = res.data
          } else {
            this.$message.error(res.data.message)
          }
        }
        this.loading = false
      })
    },
    onCancel() {
      this.$router.push('/admin/article/list')
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
