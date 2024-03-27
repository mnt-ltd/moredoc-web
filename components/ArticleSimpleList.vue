<template>
  <div class="com-article-simple-list">
    <ul>
      <li v-for="article in articles" :key="'article-' + article.id">
        <nuxt-link
          target="_blank"
          :to="`/article/${article.identifier}`"
          class="el-link el-link--default"
        >
          {{ article.title }}
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ArticleSimpleList',
  props: {
    articles: {
      type: Array,
      default: () => [],
    },
    target: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      documentMap: {},
      activeDocument: {},
    }
  },
  async created() {},
  methods: {},
}
</script>
<style lang="scss" scoped>
.com-article-simple-list {
  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 40px;
      height: 40px;
      border-bottom: 1px dashed #efefef;
      img {
        height: 18px;
        position: relative;
        top: 3px;
        margin-right: 5px;
      }
    }
    &:last-of-type {
      a {
        border-bottom: none;
      }
    }
  }
}
</style>
