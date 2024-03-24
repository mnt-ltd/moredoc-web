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
        <div class="info">
          <!-- 早期文章没有发布的作者 -->
          <span v-if="article.user_id">
            <i class="el-icon-user"></i>
            <nuxt-link
              :to="`/user/${article.user_id}`"
              class="el-link el-link--default font-normal author"
              >{{ article.user.username }}</nuxt-link
            >
          </span>
          <span
            ><i class="el-icon-time"></i
            >{{ formatRelativeTime(article.created_at) }}</span
          >
          <span
            ><i class="el-icon-view"></i> {{ article.view_count || 0 }}</span
          >
          <span>
            <!-- 收藏 -->
            <i class="el-icon-star-off"></i> {{ article.favorite_count || 0 }}
          </span>
        </div>
        <div class="desc">
          {{ article.description }}
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
    padding-bottom: 10px;
    margin-bottom: 10px;
    &:last-of-type {
      border-bottom: 0;
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }
  .no-articles {
    text-align: center;
    font-size: 15px;
    color: #ccc;
    padding: 40px 0;
  }
  .author {
    position: relative;
    top: -2px;
  }
}
</style>
