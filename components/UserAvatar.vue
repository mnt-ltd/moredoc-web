<template>
  <div class="com-user-avatar">
    <el-avatar
      :size="size"
      :alt="user.username"
      :src="user.avatar"
      @error="errorAvatar"
    >
      <img src="/static/images/avatar.png" />
    </el-avatar>
    <div
      class="vip-icon"
      v-if="settings.vip.enable && user.is_vip"
      :class="size <= 42 ? 'vip-icon-sm' : ''"
    >
      <el-tooltip class="item" effect="dark" content="VIP会员" placement="left">
        <img
          :src="settings.vip.icon || '/static/images/icon-vip.png'"
          alt="VIP会员"
        />
      </el-tooltip>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'UserAvatar',
  props: {
    size: {
      type: Number,
      default: 80,
    },
    src: {
      type: String,
      default: '',
    },
    user: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  methods: {
    errorAvatar() {
      return true
    },
  },
}
</script>
<style lang="scss">
.com-user-avatar {
  display: inline-block;
  position: relative;
  .el-avatar {
    border: 2px solid #ddd;
    padding: 3px;
    box-sizing: border-box;
    background-color: #fff;
    &:hover {
      border: 2px solid #409eff;
    }
    img {
      // height: 100%;
      // width: 100%;
      // border-radius: 50%;
      margin: 0 auto;
    }
  }
  .vip-icon {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #fff;
    border-radius: 10px;
    height: 20px;
    width: 20px;
    box-sizing: border-box;
    img {
      height: 20px;
      width: 20px;
      border-radius: 50%;
    }
    &.vip-icon-sm {
      height: 16px;
      width: 16px;
      img {
        height: 16px;
        width: 16px;
      }
    }
  }
}
</style>
