<template>
  <div class="com-document-card">
    <div class="card-shell">
      <nuxt-link
        :to="`/document/${document.uuid || document.id}`"
        class="doc-cover"
      >
        <document-cover :document="document" :lazy="false" :width="128" />
      </nuxt-link>

      <div class="doc-main">
        <nuxt-link
          :to="`/document/${document.uuid || document.id}`"
          class="doc-title el-link el-link--default"
        >
          <img
            v-if="document.id > 0"
            :src="`/static/images/${getIcon(document.ext)}_24.png`"
            :alt="`${formatLabel}文档`"
          />
          <span>{{ document.title }}</span>
        </nuxt-link>

        <div class="doc-summary">{{ summaryText }}</div>

        <div class="doc-stats">
          <span class="stat-item">
            <i class="el-icon-coin"></i>
            {{ document.price || 0 }} {{ creditName }}
          </span>
          <span class="stat-item">
            <i class="el-icon-document"></i>
            {{ formatBytes(document.size) }}
          </span>
          <span class="stat-item">
            <i class="el-icon-files"></i>
            {{ pageCount }} 页
          </span>
          <span
            v-if="settings.display.show_document_favorite_count"
            class="stat-item"
          >
            <i class="el-icon-star-off"></i>
            {{ document.favorite_count || 0 }} 收藏
          </span>
          <span
            v-if="settings.display.show_document_download_count"
            class="stat-item"
          >
            <i class="el-icon-download"></i>
            {{ document.download_count || 0 }} 下载
          </span>
          <span v-if="!isCommentClosed" class="stat-item">
            <i class="el-icon-chat-dot-square"></i>
            {{ document.comment_count || 0 }} 评论
          </span>
          <span
            v-if="settings.display.show_document_view_count"
            class="stat-item"
          >
            <i class="el-icon-view"></i>
            {{ document.view_count || 0 }} 阅读
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatBytes, formatRelativeTime, getIcon } from '~/utils/utils'
export default {
  name: 'DocumentCard',
  props: {
    document: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapGetters('setting', ['settings']),
    creditName() {
      return (
        (this.settings.system && this.settings.system.credit_name) || '魔豆'
      )
    },
    authorName() {
      return (
        (this.document.user && this.document.user.username) ||
        this.document.username ||
        '匿名用户'
      )
    },
    pageCount() {
      return this.document.pages || '-'
    },
    summaryText() {
      return this.document.description || this.document.content || '暂无摘要'
    },
    formatLabel() {
      return (
        (this.document.ext || '').replace('.', '') || '文档'
      ).toUpperCase()
    },
    isCommentClosed() {
      return !!(this.settings.security && this.settings.security.close_comment)
    },
  },
  methods: {
    formatBytes,
    formatRelativeTime,
    getIcon,
  },
}
</script>

<style lang="scss">
.com-document-card {
  width: 100%;

  .card-shell {
    display: flex;
    gap: 18px;
    padding: 5px;
    // padding: 18px;
    // background: #f3f4f6;
    // border: 1px solid #e5e7eb;
    // border-radius: 4px;
    // box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  }

  .doc-cover {
    flex: 0 0 128px;
    width: 128px;
    display: block;
    background-color: $background-grey-light;
    padding: 12px 15px 3px 10px;
    border-radius: 8px;
  }

  .doc-title {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;

    img {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      flex: 0 0 auto;
    }

    span {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
      width: 100%;
    }
  }

  .doc-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    margin-bottom: 8px;
    color: #7a7f87;
    font-size: 13px;
    line-height: 1.6;

    span::after {
      content: '•';
      margin-left: 10px;
      color: #c4c7cc;
    }

    span:last-child::after {
      display: none;
    }
  }

  .doc-summary {
    color: #5f6368;
    font-size: 13px;
    line-height: 1.7;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    margin-bottom: 30px;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    margin-bottom: 4px;
  }

  .doc-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-top: 10px;
    color: #8a9099;
    font-size: 12px;
    line-height: 1.5;
  }

  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 13px;
      color: #a0a7b3;
    }
  }

  .com-document-cover {
    width: 128px !important;
  }

  @media (max-width: 768px) {
    .card-shell {
      gap: 14px;
    }

    .doc-cover {
      flex-basis: 104px;
      width: 104px;
    }

    .com-document-cover {
      width: 104px !important;
    }
  }

  @media (max-width: 520px) {
    .card-shell {
      flex-direction: column;
    }

    .doc-cover {
      width: 116px;
      flex-basis: 116px;
    }

    .com-document-cover {
      width: 116px !important;
    }
  }
}
</style>
