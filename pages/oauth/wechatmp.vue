<template>
  <div v-if="user && user.id">
    <WechatMPLogin :show-header="true" :is-bind-mode="true" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import WechatMPLogin from '~/components/WechatMPLogin.vue'
export default {
  components: {
    WechatMPLogin,
  },
  computed: {
    ...mapGetters('user', ['user']),
  },
  created() {
    // 未登录，则不允许绑定
    if (!this.user || this.user.id <= 0) {
      this.$router.push('/')
    }
  },
}
</script>

<style lang="scss"></style>
