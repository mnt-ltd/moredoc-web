<template>
  <el-form
    ref="formArticle"
    label-position="top"
    label-width="80px"
    :model="article"
  >
    <el-row :gutter="20">
      <el-col v-if="isAdmin || canICrawlArticle" :span="24">
        <FormCrawlArticle @success="crawlArticleSuccess"></FormCrawlArticle>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="11" :xs="14">
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
            :disabled="!canIPublish"
          >
          </el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6" :xs="10">
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
            :disabled="!canIPublish"
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
      <el-col v-if="isAdmin" :span="7" :xs="12">
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
      <el-col :span="11" :xs="16">
        <el-form-item label="关键字">
          <el-input
            v-model="article.keywords"
            :disabled="!canIPublish"
            placeholder="请输入文章关键字，多个关键字用英文逗号分隔"
          ></el-input>
        </el-form-item>
      </el-col>
      <template v-if="isAdmin">
        <el-col :span="4" :xs="8">
          <!-- 审核状态 -->
          <el-form-item label="审核状态">
            <el-select v-model="article.status">
              <el-option
                v-for="item in articleStatusOptions"
                :key="'s-' + item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item>
            <div slot="label">
              公告值
              <el-tooltip
                content="大于0表示该文章为公告内容，值越大越靠前"
                placement="top"
              >
                <el-button type="text" icon="el-icon-info"></el-button>
              </el-tooltip>
            </div>
            <el-input-number
              v-model="article.notice"
              :min="0"
              clearable
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="4" :xs="24">
          <!-- 推荐 -->
          <el-form-item label="推荐">
            <el-switch
              v-model="article.is_recommend"
              active-text="是"
              inactive-text="否"
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <!-- 如果是审核拒绝，则填写拒绝原因 -->
          <el-form-item
            v-if="article.status === 2"
            label="拒绝原因"
            prop="reject_reason"
          >
            <el-input
              v-model="article.reject_reason"
              placeholder="请输入拒绝原因"
              type="textarea"
              rows="3"
            ></el-input>
          </el-form-item>
        </el-col>
      </template>
    </el-row>
    <el-form-item label="描述">
      <el-input
        v-model="article.description"
        placeholder="请输入文章描述，可为空"
        type="textarea"
        :disabled="!canIPublish"
        rows="5"
      ></el-input>
    </el-form-item>
    <el-form-item label="内容" class="editor-item">
      <Editor
        v-if="canIPublish"
        v-model="article.content"
        :init="init"
      ></Editor>
      <div v-else>
        <el-input
          v-model="article.content"
          type="textarea"
          rows="10"
          :disabled="true"
          placeholder="你未登录或没有权限发布文章"
        ></el-input>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        class="btn-block"
        icon="el-icon-check"
        :disabled="!canIPublish"
        :loading="loading"
        @click="onSubmit"
        >{{ canIPublish ? '提交' : '你未登录或没有权限发布文章' }}</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import { createArticle, updateArticle } from '~/api/article'
import { articleStatusOptions } from '~/utils/enum'
export default {
  components: {
    Editor,
  },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
    canIPublish: {
      type: Boolean,
      default: false,
    },
    canICrawlArticle: {
      type: Boolean,
      default: false,
    },
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
          status: 0,
          notice: 0,
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
      articleStatusOptions,
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
        status: 0,
        notice: 0,
      },
    }
  },
  watch: {
    initArticle: {
      handler(val) {
        if (val.recommend_at) {
          val.is_recommend = true
        }
        const article = { notice: 0, status: 0, ...val }
        if (this.isAdmin && !article.id) {
          article.status = 1
        }
        this.article = article
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
    crawlArticleSuccess(artice) {
      console.log(artice)
      this.article = { ...this.article, ...artice }
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
            this.$emit('success', article)
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
