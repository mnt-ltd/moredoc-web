<template>
  <div ref="imagebox">
    <el-image
      ref="image"
      class="com-document-cover"
      :src="
        document.attachment && document.attachment.hash
          ? `/view/cover/${document.attachment.hash}`
          : document.cover || ''
      "
      :lazy="lazy"
      :alt="document.title"
      :class="showExt ? 'ext-icon ext-' + getIcon(document.ext) : ''"
    >
      <div slot="error" class="image-slot">
        <img src="/static/images/default-cover.png" />
      </div>
    </el-image>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getIcon } from '~/utils/utils'
export default {
  name: 'DocumentCover',
  props: {
    document: {
      type: Object,
      default: () => ({}),
    },
    lazy: {
      type: Boolean,
      default: true,
    },
    width: {
      type: Number,
      default: 0,
    },
    showExt: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  mounted() {
    this.resetImageHeight()
    window.addEventListener('resize', this.resetImageHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resetImageHeight)
  },
  methods: {
    getIcon,
    resetImageHeight() {
      this.$nextTick(() => {
        // 210/297
        // 重置封面高度：1. 读取封面宽度，2，根据宽高比计算高度
        const image = this.$refs.image.$el
        const imagebox = this.$refs.imagebox
        if (!image) return
        const width = this.width || imagebox.offsetWidth - 4 // 减去边框
        const height = (width * 297) / 210
        image.style.height = `${this.isMobile ? height - 2 : height - 7}px`
        image.style.width = `${width}px`
      })
    },
  },
}
</script>
<style lang="scss">
.com-document-cover {
  border: 2px solid #efefef;
  border-radius: 5px;
  img {
    width: 100% !important;
    transition: transform 0.3s ease 0s;
    &:hover {
      transform: scale(1.2);
    }
  }
}
</style>
