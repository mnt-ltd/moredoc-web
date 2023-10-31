<template>
  <div class="com-notice-board">
    <div class="text">
      <nuxt-link
        class="el-link el-link--danger"
        :to="{ name: 'article', query: { is_notice: 1 } }"
      >
        <span class="hidden-xs-only">网站公告</span> &nbsp;
        <i class="fa fa-volume-up"></i>
      </nuxt-link>
    </div>
    <el-carousel :interval="interval" :height="height" direction="vertical">
      <!-- 移动端，每个轮播只显示一个链接 -->
      <el-carousel-item v-for="item in notices" :key="'mb-' + item.id">
        <nuxt-link
          class="el-link el-link--default"
          :to="{ name: 'article-id', params: { id: item.identifier } }"
        >
          {{ item.title }}
        </nuxt-link>
        <span class="el-link el-link--info datetime">{{
          formatDate(item.updated_at)
        }}</span>
      </el-carousel-item>
    </el-carousel>
    <nuxt-link
      class="el-link el-link--primary"
      :to="{ name: 'article', query: { is_notice: 1 } }"
      ><small>更多 <i class="el-icon-d-arrow-right"></i></small
    ></nuxt-link>
  </div>
</template>
<script>
import { formatDate } from '~/utils/utils'
export default {
  name: 'NoticeBoard',
  props: {
    notices: {
      type: Array,
      default: () => [],
    },
    height: {
      type: String,
      default: '50px',
    },
    interval: {
      type: Number,
      default: 3000,
    },
  },
  data() {
    return {}
  },
  methods: {
    formatDate,
  },
}
</script>
<style lang="scss">
.com-notice-board {
  display: flex;
  .text {
    width: 100px;
    line-height: 50px;
    span {
      position: relative;
      top: -1px;
    }
  }
  .el-carousel {
    flex: 1;
    .el-carousel__item h3 {
      font-size: 14px;
      //   opacity: 0.75;
      margin: 0;
    }

    .el-carousel__item {
      z-index: 10;
      background-color: #ffffffdd;
      .el-link {
        display: inline-block;
        max-width: 100%;
        height: 50px;
        line-height: 50px;
      }
      display: flex;
      justify-content: space-between;
      a {
        flex: 1;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .datetime {
        flex: 1;
        padding-left: 30px;
        font-size: 13px;
        cursor: auto;
      }
    }
    .el-carousel__arrow {
      display: none;
    }
    .el-carousel__indicators {
      display: none;
    }
  }
}
@media screen and (max-width: $mobile-width) {
  .com-notice-board {
    .text {
      width: 30px;
    }
    .el-carousel {
      .el-carousel__item {
        .datetime {
          flex: unset;
          width: 100px;
          padding-left: 0;
        }
      }
    }
  }
}
</style>
