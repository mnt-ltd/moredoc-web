<template>
  <div class="com-category-card">
    <div
      v-for="cate in categoryTrees.filter(
        (x) => x.type === type || (!type && !x.type)
      )"
      :key="'cate-' + cate.id"
      class="row"
    >
      <div class="lv1">
        <nuxt-link
          class="el-link el-link--default"
          :to="
            cate.type === 1
              ? '/article?category_id=' + cate.id
              : `/category/${cate.id}`
          "
        >
          <el-avatar :size="20" :src="cate.icon"></el-avatar>
          <span>{{ cate.title }}</span>
        </nuxt-link>
      </div>
      <div class="lv2">
        <nuxt-link
          v-for="sub in cate.children"
          :key="'sub-' + sub.id"
          class="el-link el-link--default"
          :to="
            sub.type === 1
              ? '/article?category_id=' + sub.id
              : `/category/${sub.id}`
          "
          >{{ sub.title }}</nuxt-link
        >
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'CategoryCard',
  props: {
    type: {
      type: Number,
      default: 0, // 0文档 1文章
    },
  },
  computed: {
    ...mapGetters('category', ['categoryTrees']),
  },
}
</script>
<style lang="scss" scoped>
.com-category-card {
  max-height: calc(100vh - 80px);
  overflow: auto;
  .row {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px dashed #f1f2f3;
    &:last-of-type {
      border-bottom: 0;
      padding-bottom: 5px;
    }
    &:first-of-type {
      padding-top: 5px;
    }
    :deep(.el-link--default) {
      padding: 3px 0;
    }
    .lv1 {
      border-right: 1px solid #eee;
      width: 100px;
      :deep(.el-link--default) {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        .el-avatar {
          vertical-align: middle;
          position: relative;
          top: -2px;
        }
      }
    }
    .lv2 {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      :deep(.el-link--default) {
        font-weight: normal;
        margin-left: 15px;
        font-size: 14px;
      }
    }
  }
}
</style>
