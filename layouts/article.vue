<template>
  <el-container class="layout-default layout-article">
    <GlobalNavbar />
    <el-main>
      <nuxt />
    </el-main>
    <el-footer v-if="$route.path != '/article'" height="auto">
      <GlobalFooter />
    </el-footer>
  </el-container>
</template>
<script>
import GlobalNavbar from '~/components/GlobalHeader.vue'
import GlobalFooter from '~/components/GlobalFooter.vue'

export default {
  components: { GlobalNavbar, GlobalFooter },
  middleware: ['checkFront', 'analytic'],
}
</script>
