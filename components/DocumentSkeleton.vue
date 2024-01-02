<template>
  <div class="com-document-skeleton">
    <el-skeleton>
      <template slot="template">
        <!-- h1 -->
        <el-skeleton-item variant="h1" style="width: 70%" />
      </template>
    </el-skeleton>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'DocumentSkeleton',
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
