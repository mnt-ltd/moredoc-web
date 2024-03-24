<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="文档收藏" name="document">
        <favorite-document :user-id="user.id" />
      </el-tab-pane>
      <el-tab-pane label="文章收藏" name="article">
        <favorite-article :user-id="user.id" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import FavoriteDocument from '~/components/FavoriteDocument.vue'
export default {
  components: { FavoriteDocument },
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      activeName: this.$route.query.type || 'document',
    }
  },
  methods: {
    handleClick(tab, event) {
      this.$router.push({ query: { type: tab.name } })
    },
  },
}
</script>
