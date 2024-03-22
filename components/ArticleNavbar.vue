<template>
  <div class="com-article-navbar">
    <ul>
      <li>
        <nuxt-link
          to="/article"
          class="el-link el-link--default"
          :class="!activeId ? 'active' : ''"
        >
          <el-image :src="'/static/images/all.png'" class="icon">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
          全部文章
        </nuxt-link>
      </li>
      <li
        v-for="cate in categories.filter(
          (item) => item.type === 1 && !item.parent_id
        )"
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
  data() {
    return {
      activeId: parseInt(this.$route.query.category_id) || 0,
    }
  },
  computed: {
    ...mapGetters('category', ['categories']),
  },
  watch: {
    $route: {
      handler() {
        this.activeId = parseInt(this.$route.query.category_id) || 0
      },
      immediate: true,
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
ul {
  justify-content: space-between;
  li {
    margin-bottom: 5px;
    .icon {
      width: 20px;
      height: 20px;
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
  &:hover {
    background-color: #21293c14;
  }
  &.active {
    background-color: #fff;
    color: #409eff;
  }
}
</style>
