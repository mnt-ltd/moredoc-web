<template>
  <div class="page page-me">
    <el-row :gutter="20">
      <el-col :span="6" class="part-left">
        <el-card shadow="never">
          <user-card :user="user" :hide-latest="true" />
          <el-row v-if="!isMobile" :gutter="10">
            <el-col :span="12">
              <nuxt-link to="/upload">
                <el-button
                  type="primary"
                  icon="el-icon-upload2"
                  class="btn-block mgt-20px"
                  >上传文档</el-button
                >
              </nuxt-link>
            </el-col>
            <el-col :span="12">
              <nuxt-link to="/post">
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  class="btn-block mgt-20px"
                  >发布文章</el-button
                >
              </nuxt-link>
            </el-col>
          </el-row>
          <el-tabs
            v-if="isMobile"
            v-model="defaultActive.value"
            class="mgt-20px"
            type="card"
            @tab-click="tabClick"
          >
            <el-tab-pane
              v-for="item in tabs"
              :key="item.value"
              :name="item.value"
              :label="item.label"
            >
              <span slot="label">
                <i :class="item.icon"></i> {{ item.label }}</span
              >
            </el-tab-pane>
          </el-tabs>
          <el-menu
            v-else
            class="mgt-20px"
            :router="true"
            :default-active="defaultActive.value"
          >
            <el-menu-item
              v-for="item in tabs"
              :key="item.value"
              :index="item.value"
            >
              <i :class="item.icon"></i>
              <span slot="title">{{ item.label }}</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      <el-col :span="18" class="part-right">
        <el-card shadow="never">
          <div slot="header">{{ defaultActive.label }}</div>
          <div class="nuxt-child">
            <nuxt-child :user="user" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'PageMe',
  data() {
    return {
      defaultActive: {
        value: '/me',
        label: '我的动态',
      },
      tabs: [
        {
          label: '我的动态',
          value: '/me',
          icon: 'el-icon-magic-stick',
        },
        {
          label: '我的上传',
          value: '/me/document',
          icon: 'el-icon-document',
        },
        {
          label: '我的文章',
          value: '/me/article',
          icon: 'el-icon-tickets',
        },
        {
          label: '我的收藏',
          value: '/me/favorite',
          icon: 'el-icon-star-off',
        },
        {
          label: '我的下载',
          value: '/me/download',
          icon: 'el-icon-download',
        },
        {
          label: '资料设置',
          value: '/me/profile',
          icon: 'fa fa-shield',
        },
      ],
    }
  },
  head() {
    return {
      title: `${this.defaultActive.label} - ${this.user.username} - ${this.settings.system.sitename}`,
    }
  },
  computed: {
    ...mapGetters('user', ['user']),
    ...mapGetters('setting', ['settings']),
  },
  watch: {
    '$route.path': {
      handler(val) {
        // val 去掉最后的斜杠
        val = val.replace(/\/$/, '')
        const item = this.tabs.find((item) => item.value === val)
        this.defaultActive = {
          value: val,
          label: item.label || '我的动态',
        }
      },
      immediate: true,
    },
  },
  methods: {
    tabClick(tab) {
      this.defaultActive = {
        value: tab.name,
        label: tab.label,
      }
      this.$router.push(tab.name)
    },
  },
}
</script>
<style lang="scss">
.page-me {
  .el-menu {
    border-right: 0;
  }
  .fa-shield {
    margin-right: 5px;
    width: 24px;
    text-align: center;
    font-size: 18px;
    vertical-align: middle;
  }
  .nuxt-child {
    min-height: calc(100vh - 190px);
  }
}

@media screen and (max-width: $mobile-width) {
  .page-me {
    .part-left {
      width: 100%;
    }
    .part-right {
      margin-top: -20px;
      width: 100%;
    }
  }
}
</style>
