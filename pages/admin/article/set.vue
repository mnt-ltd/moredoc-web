<template>
  <div>
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="4">
            <el-button @click="onCancel" icon="el-icon-back">返回</el-button>
          </el-col>
          <el-col :span="20" class="text-center">
            <div class="header-title">
              <span v-if="article.id>0">编辑文章</span>
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
        <el-form-item label="关键字">
          <el-input
            v-model="article.keywords"
            placeholder="请输入文章关键字，多个关键字用英文逗号分隔"
          ></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="article.description"
            placeholder="请输入文章描述，可为空"
            type="textarea"
            rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="内容" class="editor-item">
          <Editor :init="init" v-model="article.content"></Editor>
        </el-form-item>
        <el-form-item v-if="!isEditorFullScreen">
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
import {getArticle, createArticle, updateArticle } from '~/api/article'
export default {
    layout: 'admin',
    components:{
      Editor
    },
    data() {
      return {
        init:{
          base_url: '/static/tinymce',
          language_url: '/static/tinymce/langs/zh-Hans.js',// 语言包的路径
          language: 'zh-Hans',//语言
          skin_url: '/static/tinymce/skins/ui/oxide',// skin路径
          height: 500,//编辑器高度
          branding: true,//是否禁用“Powered by TinyMCE”
          menubar: true,//顶部菜单栏显示,
          toolbar: 'undo redo | styleselect blocks | kityformula-editor codesample table searchreplace link bold italic fullscreen | alignleft aligncenter alignright alignjustify | indent outdent | bullist numlist | image media | help',
          plugins:'kityformula-editor image media wordcount codesample code link charmap emoticons table searchreplace visualblocks fullscreen media table paste code help wordcount',
          relative_urls: false,//是否使用相对路径
          paste_data_images: true,//是否允许粘贴图片
          image_advtab: true,//是否显示高级选项
          image_caption: true,//是否允许图片添加标题
          image_title: true,//是否允许图片添加标题
          image_description: true,//是否允许图片添加描述
          image_dimensions: true,//是否允许图片添加尺寸
          image_class_list: [
            { title: 'None', value: '' },
            { title: 'Responsive', value: 'img-responsive' },
          ],
          image_uploadtab: true,//是否显示上传选项
          image_upload_url: '/api/upload/image',//图片上传地址
          image_upload_credentials: true,//是否允许携带cookie
        },
        article:{
          title:'',
          identifier:'',
          keywords:'',
          description:'',
          content:'',
          id:0
        },
      }
    },
    mounted() {
      tinymce.init({
        selector: '#mytextarea'
      });
    },
    created() {
      this.getArticle()
    },
    methods: {
      async getArticle(){
        const id = this.$route.query.id
        if(!id){
          return
        }
        const res = await getArticle({id: this.$route.query.id})
        if(res.status !== 200){
          this.$message.error(res.data.message || '获取文章失败')
          return
        }
        this.article = res.data
      },
      async onSubmit(){
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
              this.resetFields()
              this.$emit('success', res.data)
            } else {
              this.$message.error(res.data.message)
            }
          } else {
            const res = await createArticle(article)
            if (res.status === 200) {
              this.$message.success('新增成功')
              this.resetFields()
              this.$emit('success', res.data)
            } else {
              this.$message.error(res.data.message)
            }
          }
          this.loading = false
        })
      },
      onCancel(){
        this.$router.push('/admin/article')
      }
    },
}
</script> 

<style>
.tox-promotion{
  display: none !important;
}
</style>
<style lang="scss" scoped>
.header-title{
  height: 40px;
  line-height: 40px;
  font-size: 20px;
}
</style>