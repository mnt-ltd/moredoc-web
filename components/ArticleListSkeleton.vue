<template>
  <div class="com-article-list">
    <el-skeleton animated>
      <template slot="template">
        <ul>
          <li v-for="i in rows" :key="i">
            <el-skeleton-item variant="h1" style="width: 60%" />
            <div><el-skeleton-item variant="text" style="width: 80px" /></div>
            <el-skeleton-item variant="text" style="width: 100%" />
            <el-skeleton-item variant="text" style="width: 80%" />
            <div><el-skeleton-item variant="text" style="width: 160px" /></div>
          </li>
        </ul>
      </template>
    </el-skeleton>
  </div>
</template>
<script>
export default {
  props: {
    rows: {
      type: Number,
      default: 5,
    },
  },
}
</script>
<style lang="scss" scoped>
ul,
li {
  padding: 0;
  margin: 0;
  list-style: none;
}
li {
  border-bottom: 1px solid #f6f6f6;
  padding-bottom: 15px;
  margin-bottom: 10px;
  &:last-of-type {
    border-bottom: 0;
    padding-bottom: 0;
    margin-bottom: 0;
  }
}
</style>
