<template>
  <div>
    <user-article :user-id="userId" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      userId: parseInt(this.$route.params.id) || 0,
    }
  },
  head() {
    return {
      title: `[个人主页]${this.user.username} · 文档 - ${this.settings.system.sitename}`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: `${this.user.username},文档,${this.settings.system.sitename}`,
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: `${this.settings.system.description}`,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
}
</script>

<style></style>
