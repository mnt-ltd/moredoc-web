<template>
  <div class="com-article-navbar">
    <ul>
      <li>
        <nuxt-link
          to="/article"
          class="el-link el-link--default"
          :class="!activeId ? 'active' : ''"
        >
          <el-image :src="'/static/favicon.ico'" class="icon">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
          全部文章
        </nuxt-link>
      </li>
      <li
        v-for="cate in categories.filter((item) => item.type === 1)"
        :key="'cate-' + cate.id"
      >
        <nuxt-link
          :to="`/article?category_id=${cate.id}`"
          class="el-link el-link--default"
          :class="activeId === cate.id ? 'active' : ''"
        >
          <el-image :src="cate.icon || '/static/favicon.ico'" class="icon">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
          {{ cate.title }}</nuxt-link
        >
      </li>
    </ul>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    activeId: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapGetters('category', ['categories']),
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
ul {
  justify-content: space-between;
  li {
    .icon {
      width: 18px;
      height: 18px;
      margin-right: 5px;
      border-radius: 4px;
      vertical-align: middle;
      margin-top: -2px;
    }
  }
}
.el-link--default {
  color: #21293c;
  display: block;
  line-height: 40px;
  font-weight: normal;
  padding: 0 10px;
  border-radius: 3px;
  &:hover,
  &.active {
    background-color: #eee;
    color: #409eff;
    font-weight: bold;
  }
}
</style>
