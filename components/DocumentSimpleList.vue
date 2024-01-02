<template>
  <div class="com-document-simple-list">
    <ul>
      <li v-for="doc in docs" :key="'doc-' + doc.id">
        <el-popover
          v-if="showPopover"
          :placement="placement"
          width="480"
          trigger="hover"
          @show="getPopoverDocument(doc.id)"
        >
          <document-card :document="activeDocument" />
          <nuxt-link
            :target="target"
            :to="`/document/${doc.id}`"
            class="el-link el-link--default"
            slot="reference"
          >
            <img
              :src="'/static/images/' + getIcon(doc.ext) + '_24.png'"
              :alt="getIcon(doc.ext) + '文档'"
            />
            {{ doc.title }}
          </nuxt-link>
        </el-popover>
        <nuxt-link
          :target="target"
          :to="`/document/${doc.id}`"
          class="el-link el-link--default"
          v-else
        >
          <img
            :src="'/static/images/' + getIcon(doc.ext) + '_24.png'"
            :alt="getIcon(doc.ext) + '文档'"
          />
          {{ doc.title }}
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { getDocument } from '~/api/document'
import { getIcon } from '~/utils/utils'
export default {
  name: 'DocumentSimpleList',
  props: {
    docs: {
      type: Array,
      default: () => [],
    },
    target: {
      type: String,
      default: '',
    },
    showPopover: {
      type: Boolean,
      default: true,
    },
    placement: {
      type: String,
      default: 'left',
    },
  },
  data() {
    return {
      documentMap: {},
      activeDocument: {},
    }
  },
  async created() {},
  methods: {
    getIcon,
    async getPopoverDocument(id) {
      this.activeDocument = { id: 0 }
      if (!this.showPopover) {
        return
      }
      if (this.documentMap[id]) {
        this.activeDocument = this.documentMap[id]
        return
      }

      const res = await getDocument({ id: id, with_author: true })
      this.activeDocument = res.data
      this.documentMap[id] = res.data
    },
  },
}
</script>
<style lang="scss" scoped>
.com-document-simple-list {
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
