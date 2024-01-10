<template>
  <el-image
    :src="
      document.attachment && document.attachment.hash
        ? `/view/cover/${document.attachment.hash}`
        : ''
    "
    :lazy="lazy"
    :alt="document.title"
    :class="document.is_vip && settings.vip.enable ? 'vip-doc' : ''"
    ref="image"
  >
    <div slot="error" class="image-slot">
      <img src="/static/images/default-cover.png" />
    </div>
  </el-image>
</template>
<script>
import { mapGetters } from 'vuex'
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
    resetImageHeight() {
      // 210/297
      // 重置封面高度：1. 读取封面宽度，2，根据宽高比计算高度
      const image = this.$refs.image.$el
      const width = image.offsetWidth
      const height = (width * 297) / 210
      image.style.height = `${this.isMobile ? height - 2 : height - 10}px`
    },
  },
}
</script>
<style lang="scss" scoped>
.el-image {
  border: 2px solid #efefef;
  border-radius: 5px;
}
img {
  width: 100%;
  transition: transform 0.3s ease 0s;
  &:hover {
    transform: scale(1.2);
  }
}
</style>
