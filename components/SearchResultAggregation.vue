<template>
  <div class="com-search-result-aggregation">
    <ul>
      <li v-if="docs.length === 0">
        <el-empty description="很遗憾，未能检索到相关结果"></el-empty>
      </li>
      <li v-for="doc in docs" :key="'doc-' + doc.id">
        <h3 class="doc-title">
          <nuxt-link
            target="_blank"
            :to="
              doc.doc_type === 1
                ? `/article/${doc.identifier}`
                : `/document/${doc.identifier}`
            "
            class="el-link el-link--primary"
          >
            <img
              v-if="doc.ext"
              :src="`/static/images/${doc.icon}_24.png`"
              :alt="`${doc.icon}文档`"
            />
            <i v-else class="el-icon-tickets"></i>
            <span v-html="doc.title"></span>
          </nuxt-link>
        </h3>
        <div class="doc-desc" v-html="doc.description"></div>
        <div class="doc-info">
          <i class="el-icon-time"></i> {{ formatRelativeTime(doc.created_at) }}
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { formatBytes, formatRelativeTime } from '~/utils/utils'
export default {
  props: {
    docs: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapGetters('user', ['user']),
    ...mapGetters('category', ['categoryTrees']),
    ...mapGetters('setting', ['settings']),
    filterSize() {
      return this.isMobile ? 'mini' : 'medium'
    },
  },
  methods: {
    formatBytes,
    formatRelativeTime,
  },
}
</script>
<style lang="scss" scoped>
.search-result {
  ul,
  li {
    list-style: none;
    padding: 0;
  }
  li {
    padding-top: 20px;
    &:first-of-type {
      padding-top: 0;
    }
  }
  .noresult {
    text-align: center;
    font-size: 14px;
    line-height: 200px;
    color: #999;
  }
}
h3 {
  margin-bottom: 10px;
  :deep(.el-link) {
    font-size: 18px;
    font-weight: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: 100%;
    img {
      height: 18px;
      position: relative;
      top: 2px;
    }
  }
}
.doc-desc {
  font-size: 14px;
  color: #6b7a88;
  line-height: 180%;
  word-break: break-all;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  max-height: 81px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
.doc-info {
  color: #bdc3c7;
  font-size: 13px;
}
</style>
