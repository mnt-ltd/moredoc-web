<template>
  <div class="com-article-list">
    <ul v-if="articles.length > 0">
      <li v-for="article in articles" :key="'article-' + article.id">
        <h3>
          <nuxt-link
            :to="`/article/${article.identifier}`"
            class="el-link el-link--default"
            >{{ article.title }}</nuxt-link
          >
        </h3>
        <div class="author">
          <nuxt-link
            :to="`/user/${article.user_id}`"
            class="el-link el-link--default"
            ><span
              ><i class="fa fa-user-o"></i> {{ article.author }}管理员</span
            ></nuxt-link
          >
          •
          <span> &nbsp;2小时前</span>
          <span>分类1 - 分类2</span>
        </div>
        <div class="desc">
          {{ article.description }}
        </div>
        <div class="info">
          <span><i class="el-icon-view"></i> 0</span>
          <span><i class="el-icon-star-off"></i> 0</span>
          <span><i class="el-icon-chat-dot-square"></i> 0</span>
        </div>
      </li>
    </ul>
    <div v-else>
      <el-empty></el-empty>
    </div>
  </div>
</template>
<script>
import { formatDatetime, formatRelativeTime } from '~/utils/utils'
export default {
  props: {
    articles: {
      type: Array,
      default: () => [],
    },
    withDescription: {
      type: Boolean,
      default: false,
    },
    withHtml: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    formatRelativeTime,
    formatDatetime,
  },
}
</script>
<style lang="scss">
.com-article-list {
  padding: 15px 0;
  mark {
    background-color: transparent;
    color: red;
  }
}
</style>
<style lang="scss" scoped>
.com-article-list {
  ul,
  li {
    padding: 0;
    margin: 0;
    list-style: none;
  }
  h3 {
    margin: 0;
    a {
      color: #000;
      font-size: 16px;
      font-weight: 400;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
      line-height: 40px;
    }
  }
  .author {
    color: #999;
    font-size: 12px;
    margin-top: 5px;
    margin-bottom: 5px;
    .el-link {
      font-size: 12px;
      margin-top: -4px;
      font-weight: normal;
    }
    span {
      margin-right: 5px;
    }
  }
  .desc {
    color: #666;
    font-size: 13px;
    margin: 10px 0;
    line-height: 1.8;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .info {
    color: #999;
    font-size: 12px;
    span {
      margin-right: 10px;
      i {
        margin-right: 5px;
      }
    }
  }
  li {
    border-bottom: 1px solid #f6f6f6;
    padding-bottom: 20px;
    margin-bottom: 10px;
  }
  .no-articles {
    text-align: center;
    font-size: 15px;
    color: #ccc;
    padding: 40px 0;
  }
}
</style>
