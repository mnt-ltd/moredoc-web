<template>
  <div class="page page-user">
    <template v-for="item in advertisements">
      <div
        v-if="item.position == 'user_top'"
        :key="item.position + item.id"
        v-html="item.content"
      ></div>
    </template>
    <div class="user-layout">
      <aside class="user-layout__sidebar">
        <el-card class="user-panel user-panel--profile" shadow="never">
          <user-card2 :user="user" />
        </el-card>
      </aside>
      <section class="user-layout__content">
        <el-card class="user-panel user-panel--content" shadow="never">
          <el-tabs v-model="activeTab" class="user-tabs" @tab-click="tabClick">
            <el-tab-pane name="user-id">
              <span slot="label" class="user-tab-label">
                <nuxt-link
                  class="user-tab-link"
                  :class="{ 'is-active': activeTab === 'user-id' }"
                  :to="{
                    name: 'user-id',
                    params: { id: user.id },
                  }"
                >
                  <i class="el-icon-document"></i>
                  <span>文档</span>
                </nuxt-link>
              </span>
            </el-tab-pane>
            <el-tab-pane name="user-id-article">
              <span slot="label" class="user-tab-label">
                <nuxt-link
                  class="user-tab-link"
                  :class="{ 'is-active': activeTab === 'user-id-article' }"
                  :to="`/user/${user.id}/article`"
                >
                  <i class="el-icon-tickets"></i>
                  <span>文章</span>
                </nuxt-link>
              </span>
            </el-tab-pane>
            <template v-for="item in advertisements">
              <div
                v-if="item.position == 'user_document_top'"
                :key="item.position + item.id"
                class="user-inline-ad"
                v-html="item.content"
              ></div>
            </template>
            <nuxt-child :user="user" />
          </el-tabs>
        </el-card>
      </section>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUser } from '~/api/user'
export default {
  data() {
    return {
      user: {
        id: 0,
      },
      activeTab: this.$route.name,
    }
  },
  head() {
    return {
      title: `[个人主页] ${this.user.username} - ${this.settings.system.sitename}`,
      meta: [
        {
          hid: 'keywords',
          name: 'keywords',
          content: `个人主页,${this.settings.system.sitename},${this.settings.system.keywords}`,
        },
        {
          hid: 'description',
          name: 'description',
          content: `${this.settings.system.description}`,
        },
      ],
    }
  },
  computed: {
    ...mapGetters('setting', ['settings']),
  },
  watch: {
    '$route.name'(value) {
      this.activeTab = value
    },
  },
  created() {
    try {
      const id = parseInt(this.$route.params.id)
      this.user.id = id
      Promise.all([this.getUser(), this.getAdvertisements('user')])
    } catch (error) {}
  },
  methods: {
    tabClick(e) {
      this.$router.push({
        name: e.name,
        params: { id: this.user.id },
      })
    },
    async getUser() {
      const res = await getUser({ id: this.user.id })
      if (res.status === 200) {
        this.user = res.data || { id: 0 }
      }
    },
  },
}
</script>
<style lang="scss">
.page-user {
  padding: 24px 0 36px;

  .user-layout {
    display: flex;
    align-items: flex-start;
    gap: 24px;
  }

  .user-layout__sidebar {
    width: 272px;
    flex: 0 0 272px;
  }

  .user-layout__content {
    min-width: 0;
    flex: 1;
  }

  .user-panel {
    // border: 1px solid #e8edf5;
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(31, 45, 61, 0.05);

    .el-card__body {
      padding: 28px;
    }
  }

  .user-tabs {
    margin-top: -6px;

    .el-tabs__nav-wrap::after {
      background-color: #edf1f7;
    }

    // .el-tabs__item {
    //   padding: 0 0 14px;
    //   height: auto;
    //   line-height: 1;
    //   // margin-right: 28px;
    // }

    .el-tabs__active-bar {
      height: 3px;
      border-radius: 999px;
      background: #409eff;
    }

    & > .el-tabs__content {
      min-height: calc(100vh - 240px);
      padding-top: 18px;
    }

    .el-tabs__header {
      margin-bottom: 0;
    }
  }

  .user-tab-label {
    display: inline-flex;
    align-items: center;
  }

  .user-tab-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s ease;

    &.is-active,
    &:hover {
      color: #409eff;
    }
  }

  .user-inline-ad {
    margin-bottom: 18px;
  }
}

@media screen and (max-width: $mobile-width) {
  .page-user {
    padding-top: 12px;

    .user-layout {
      flex-direction: column;
      gap: 16px;
    }

    .user-layout__sidebar,
    .user-layout__content {
      width: 100%;
      flex-basis: auto;
    }

    .user-panel {
      border-radius: 14px;

      .el-card__body {
        padding: 18px;
      }
    }

    .user-tabs {
      .el-tabs__item {
        margin-right: 18px;
      }

      & > .el-tabs__content {
        min-height: unset;
      }
    }
  }
}
</style>
