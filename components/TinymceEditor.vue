<template>
  <div class="tinymce-editor">
    <Editor v-model="contentValue" :init="editorInit" />
  </div>
</template>

<script>
import tinymce from 'tinymce/tinymce'
import Editor from '@tinymce/tinymce-vue'
import MarkdownIt from 'markdown-it'

const defaultToolbar =
  'undo redo | styleselect blocks | kityformula-editor codesample code table link bold italic | bullist numlist alignleft aligncenter alignright alignjustify indent outdent | image media | searchreplace preview fullscreen help'

const defaultPlugins =
  'kityformula-editor image media wordcount codesample code link charmap emoticons table searchreplace visualblocks fullscreen table help wordcount lists preview paste'

export default {
  name: 'TinymceEditor',
  components: {
    Editor,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: 600,
    },
    placeholder: {
      type: String,
      default: '请输入内容',
    },
    menubar: {
      type: Boolean,
      default: true,
    },
    uploadUrl: {
      type: String,
      default: '/api/v1/upload/article?type=image',
    },
    enableMarkdownPaste: {
      type: Boolean,
      default: true,
    },
    init: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      markdownParser: new MarkdownIt({
        html: false,
        linkify: true,
        typographer: true,
      }),
    }
  },
  computed: {
    contentValue: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
    editorInit() {
      const customInit = this.init || {}
      const customSetup = customInit.setup
      return {
        base_url: '/static/tinymce',
        language_url: '/static/tinymce/langs/zh-Hans.js',
        language: 'zh-Hans',
        skin_url: '/static/tinymce/skins/ui/oxide',
        height: this.height,
        branding: true,
        placeholder: this.placeholder,
        menubar: this.menubar,
        toolbar: defaultToolbar,
        plugins: defaultPlugins,
        relative_urls: false,
        images_upload_handler: this.imagesUploadHandler,
        ...customInit,
        setup: (editor) => {
          if (this.enableMarkdownPaste) {
            editor.on('Paste', (event) => this.handleEditorPaste(event, editor))
          }
          if (typeof customSetup === 'function') {
            customSetup(editor)
          }
        },
      }
    },
  },
  mounted() {
    tinymce.init({})
  },
  methods: {
    imagesUploadHandler(blobInfo, progress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.withCredentials = false
        xhr.open('POST', this.uploadUrl)

        const token = this.$store?.state?.user?.token
        if (token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + token)
        }

        xhr.upload.onprogress = (event) => {
          progress((event.loaded / event.total) * 100)
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
    handleEditorPaste(event, editor) {
      const clipboardData =
        event.clipboardData || event.originalEvent?.clipboardData
      if (!clipboardData) {
        return
      }

      const plaintext = clipboardData.getData('text/plain')
      if (!plaintext || !this.shouldTreatAsMarkdown(plaintext)) {
        return
      }

      event.preventDefault()
      const converted = this.markdownParser.render(plaintext)
      editor.insertContent(converted)
    },
    containsHtml(content) {
      const htmlTagPattern = /<\/?[a-z][\s\S]*?>/i
      return htmlTagPattern.test(content)
    },
    shouldTreatAsMarkdown(content) {
      const text = content.trim()
      if (!text) {
        return false
      }
      if (this.containsHtml(text)) {
        return false
      }
      const markdownIndicators =
        /(^|\n)(#{1,6}\s.+|[-*+]\s.+|\d+\.\s.+|>\s.+|`{3}|\[[^\]]+\]\([^)]+\)|\*{1,2}[^*]+\*{1,2})/
      return markdownIndicators.test(text)
    },
  },
}
</script>

<style>
.tox-promotion {
  display: none !important;
}
</style>
