<template>
  <div>
    <Editor :init="init"></Editor>
  </div>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
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
        }
      }
    },
    mounted() {
      tinymce.init({
        selector: '#mytextarea'
      });
    }
}
</script> 

<style>
.tox-promotion{
  display: none !important;
}

</style>