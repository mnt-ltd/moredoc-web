<template>
  <div class="com-form-download2">
    <el-form
      ref="formDownload"
      label-position="left"
      label-width="80px"
      :model="download"
    >
      <ul>
        <li><span>文档：</span>《{{ document.title }}》</li>
        <li><span>大小：</span>{{ formatBytes(document.size) }}</li>
        <li><span>页数：</span>{{ document.pages || '-' }} 页</li>
        <li>
          <span>价格：</span>{{ document.price }}
          {{ settings.system.credit_name }}
          （{{
            (
              (document.price || 0) / (settings.system.credit_exchange || 1)
            ).toFixed(2)
          }}
          元）
        </li>
      </ul>
      <div class="mgt-20px">
        <el-button
          v-for="item in typeOptions"
          :key="'type-' + item.value"
          :type="item.type"
          plain
        >
          <i :class="item.icon"></i>
          {{ item.label }}</el-button
        >
      </div>
    </el-form>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { formatBytes } from '~/utils/utils'
export default {
  name: 'FormDownload2',
  props: {
    document: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      download: {
        enable_code_download: false,
        code: '',
        captcha: '',
        captcha_id: '',
        type: 0, // 0，付费下载，1，积分下载，2，下载码下载
      },
      activeTab: '0',
      typeOptions: [
        {
          label: '积分下载',
          value: 0,
          icon: 'el-icon-coin',
          type: 'primary',
        },
        {
          label: '付费下载',
          value: 1,
          icon: 'el-icon-money',
          type: 'success',
        },
      ],
    }
  },
  created() {},
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {
    ...mapActions('user', ['getUser']),
    formatBytes,
  },
}
</script>
<style lang="scss" scoped>
.com-form-download2 {
  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    line-height: 300%;
    border-bottom: 1px dashed #ddd;
    span {
      color: #aaa;
    }
  }
}
</style>
