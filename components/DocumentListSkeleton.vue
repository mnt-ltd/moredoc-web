<template>
  <div class="com-document-list">
    <el-skeleton animated>
      <template slot="template">
        <ul>
          <li v-for="i in 1" :key="i">
            <el-row :gutter="20">
              <el-col
                :span="
                  !settings.display.hide_keywords_on_lists || isMobile ? 4 : 3
                "
                class="doc-cover"
              >
                <el-skeleton-item
                  variant="image"
                  :style="
                    isMobile
                      ? `width: 100%; height: 120px`
                      : `width: 100%; height: 178px`
                  "
                />
              </el-col>
              <el-col
                :span="
                  !settings.display.hide_keywords_on_lists || isMobile ? 20 : 21
                "
              >
                <el-skeleton-item variant="h1" style="width: 70%" />
                <div class="doc-info">
                  <el-skeleton-item variant="text" style="width: 20%" />
                  <el-skeleton-item
                    variant="text"
                    style="width: 45%; float: right"
                  />
                </div>
                <div class="doc-desc">
                  <el-skeleton-item variant="text" style="width: 100%" />
                  <el-skeleton-item variant="text" style="width: 100%" />
                  <el-skeleton-item variant="text" style="width: 45%" />
                </div>
              </el-col>
            </el-row>
          </li>
        </ul>
      </template>
    </el-skeleton>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { formatBytes, formatDatetime, getIcon } from '~/utils/utils'
export default {
  name: 'DocumentList',
  props: {
    rows: {
      type: Number,
      default: 4,
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
}
</script>
<style lang="scss" scoped>
.com-document-list {
  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    margin-bottom: 20px;
    padding-bottom: 18px;
    border-bottom: 1px dashed #ddd;
  }
  h3 {
    margin: 0;
    a {
      font-size: 18px;
      font-weight: 400;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      img {
        height: 18px;
        position: relative;
        top: 3px;
      }
    }
  }
  .doc-cover {
    .el-image {
      width: 100%;
      border: 2px solid #efefef;
      border-radius: 5px;
      &:hover img {
        transform: scale(1.2);
      }
    }
  }
  .doc-info {
    margin: 10px 0;
    font-size: 13px;
    color: #888;
    .line {
      color: #ddd;
      margin: 0 5px;
    }
  }
  .doc-desc {
    font-size: 14px;
    color: #999;
    line-height: 180%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    max-height: 78px;
    -webkit-box-orient: vertical;
  }
}
</style>
<style lang="scss">
.com-document-list {
  .el-image {
    img {
      transition: transform 0.3s ease 0s;
      &:hover {
        transform: scale(1.2);
      }
    }
  }
}
</style>
