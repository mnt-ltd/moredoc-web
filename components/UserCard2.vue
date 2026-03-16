<template>
  <div class="com-user-card2">
    <div class="user-card__avatar-wrap">
      <nuxt-link :to="'/user/' + user.id" class="user-card__avatar-link">
        <UserAvatar :size="108" :user="user" />
      </nuxt-link>
    </div>
    <div class="user-card__body">
      <h2 class="user-card__username">{{ user.username || '未命名用户' }}</h2>
      <div v-if="!hideSignature" class="user-card__signature">
        {{ user.signature || '这个人很懒，暂时还没有留下个性签名。' }}
      </div>
    </div>
    <div class="user-card__divider"></div>
    <div class="user-card__stats">
      <div
        v-for="item in statItems"
        :key="item.label"
        class="user-card__stat-item"
      >
        <div class="user-card__stat-value">{{ item.value }}</div>
        <div class="user-card__stat-label">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { formatDate } from '~/utils/utils'
// 用户信息卡片
export default {
  name: 'UserCard2',
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          id: 0,
          name: '',
          avatar: '',
          signature: '',
          doc_count: 0,
          favorite_count: 0,
          credit_count: 0,
        }
      },
    },
    hideActions: {
      type: Boolean,
      default: false,
    },
    hideSignature: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {}
  },
  async created() {},
  computed: {
    ...mapGetters('setting', ['settings']),
    statItems() {
      return [
        {
          label: '文档',
          value: this.user.doc_count || 0,
        },
        {
          label: '文章',
          value: this.user.article_count || 0,
        },
        {
          label: this.settings.system.credit_name || '魔豆',
          value: this.user.credit_count || 0,
        },
      ]
    },
  },
  methods: {
    formatJoinDate(time) {
      return formatDate(time)
    },
  },
}
</script>
<style lang="scss" scoped>
.com-user-card2 {
  text-align: center;

  .user-card__avatar-wrap {
    display: flex;
    justify-content: center;
  }

  .user-card__avatar-link {
    display: inline-flex;
    // padding: 8px;
    // border-radius: 999px;
    // background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
    // box-shadow: inset 0 0 0 1px #dbe7fb;
  }

  .el-avatar {
    border: 4px solid #0d2b4d;
    background-color: #fff;
    img {
      border-radius: 50%;
    }
  }

  .user-card__body {
    margin-top: 18px;
  }

  .user-card__username {
    margin: 0;
    color: #1f2937;
    font-size: 34px;
    font-weight: 700;
    line-height: 1.15;
  }

  .user-card__signature {
    margin-top: 14px;
    color: #7b8794;
    font-size: 14px;
    line-height: 1.8;
    min-height: 50px;
  }

  .user-card__joined {
    margin-top: 14px;
    color: #9aa5b1;
    font-size: 13px;

    i {
      margin-right: 6px;
    }
  }

  .user-card__divider {
    height: 1px;
    margin: 22px 0;
    background: linear-gradient(
      90deg,
      rgba(232, 237, 245, 0) 0%,
      #e8edf5 18%,
      #e8edf5 82%,
      rgba(232, 237, 245, 0) 100%
    );
  }

  .user-card__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .user-card__stat-item {
    min-width: 0;
  }

  .user-card__stat-value {
    color: #1f2937;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }

  .user-card__stat-label {
    margin-top: 8px;
    color: #8a94a6;
    font-size: 13px;
  }
}

@media screen and (max-width: $mobile-width) {
  .com-user-card2 {
    .user-card__username,
    .user-card__stat-value {
      font-size: 28px;
    }

    .user-card__signature {
      min-height: auto;
    }
  }
}
</style>
