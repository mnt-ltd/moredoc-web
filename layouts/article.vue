<template>
  <el-container class="layout-default layout-article">
    <global-header />
    <el-main>
      <nuxt />
    </el-main>
    <el-footer v-if="$route.path != '/article'" height="auto">
      <global-footer />
    </el-footer>
  </el-container>
</template>
<script>
import GlobalHeader from '~/components/GlobalHeader.vue'
import GlobalFooter from '~/components/GlobalFooter.vue'

export default {
  components: { GlobalHeader, GlobalFooter },
  middleware: ['checkFront', 'analytic'],
}
</script>
