<template>
  <el-container class="layout-default">
    <global-header />
    <el-main>
      <nuxt />
    </el-main>
    <el-footer height="auto">
      <global-footer />
    </el-footer>
  </el-container>
</template>
<script>
import GlobalHeader from '~/components/GlobalHeader.vue'
import GlobalFooter from '~/components/GlobalFooter.vue'

export default {
  components: { GlobalHeader, GlobalFooter },
}
</script>
<style lang="scss">
.layout-default {
  background-color: $background-grey-light;
  min-width: $min-width !important;
  min-height: 100vh;
  .el-table th {
    height: 45px;
    line-height: 45px;
    padding: 1px 0 5px;
    &.el-table__cell {
      background-color: #f7fbff;
      color: #000;
      font-weight: normal;
      &.el-table-column--selection > .cell {
        padding-left: 14px;
      }
    }
    &.el-table__cell.is-leaf {
      border-bottom: 0;
    }
  }
  .el-main {
    padding-left: 0;
    padding-right: 0;
  }
  .el-link {
    font-size: 15px;
  }
  .el-rate {
    display: inline-block;
    .el-rate__icon {
      margin-right: 0;
    }
    .el-rate__text {
      margin-left: 5px;
      color: #bdc3c7 !important;
    }
  }
  .el-breadcrumb__inner a,
  .el-breadcrumb__inner.is-link {
    font-weight: normal;
  }
  padding-top: 60px;
  .el-card {
    border-radius: 5px;
    border: 0;
  }
  .nav-ucenter {
    &.is-active {
      border-color: transparent !important;
    }
    .el-dropdown-link {
      line-height: 60px;
      display: inline-block;
      font-weight: 400;
      font-size: 1.2em;
      margin-top: -8px;
      .nav-user-avatar {
        position: relative;
        top: -2px;
      }
    }
  }
}
.dropdown-upload {
  font-size: 17px;
  margin-left: -2px;
}
.page {
  width: $default-width;
  min-width: $min-width !important;
  // max-width: $max-width;
  margin: 0 auto;
  overflow-x: hidden;
}
.btn-search {
  cursor: pointer;
}
.channel-category {
  &.is-active {
    background-color: #f2f6fc !important;
    a {
      color: #409eff;
    }
  }
  a {
    display: block;
  }
}
.el-menu--popup {
  min-width: 115px;
  .el-menu-item {
    a {
      display: block;
    }
  }
}

.el-dialog__header {
  padding: 20px 20px 10px;
}
.el-dialog__body {
  padding: 1px 20px;
}

.el-menu-mobile {
  margin-top: 15px;
  margin-left: -15px;
  border-right: 0;
  & > li {
    padding-left: 0;
  }
  .el-submenu__title {
    height: 32px;
    line-height: 32px;
    font-size: 15px;
  }
  .el-menu-item {
    height: 32px;
    line-height: 32px;
  }
}

// =======================
// 移动端样式
// =======================
@media screen and (max-width: $mobile-width) {
  .layout-default {
    min-width: 0 !important;
    .el-card {
      border-radius: 0;
    }
    .menu-drawer-box {
      .el-drawer__body {
        padding: 15px;
      }
      .navs {
        padding: 0;
        list-style: none;
        li {
          line-height: 30px;
          .login-link {
            max-width: 100%;
            .user-avatar {
              margin-right: 5px;
              top: 4px;
            }
            span {
              display: inline-block;
              position: relative;
              top: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          .el-link {
            font-size: 14px;
            display: block;
          }
        }
        & > li {
          margin: 5px 0;
        }
        .el-icon-upload2 {
          font-size: 17px;
        }
      }
      .el-collapse {
        .el-icon-menu {
          font-size: 16px;
        }
        .el-collapse-item__content {
          padding-bottom: 0;
          margin-top: -15px;
        }
        ul {
          padding-left: 30px;
          li {
            line-height: 30px;
          }
        }
      }
    }
    .el-header {
      .el-menu.el-menu--horizontal {
        border-bottom: 0;
        width: 100%;
        max-width: unset;
        min-width: unset;
        .float-right {
          float: right;
          a {
            padding: 0 15px;
          }
        }
      }
      a {
        padding: 0 15px;
      }
      .menu-drawer {
        padding: 0 15px;
        display: inline-block;
        &.is-active {
          border-bottom: 0;
        }
        .el-icon-s-operation {
          font-size: 22px;
        }
      }
    }
  }
  .page {
    width: 100%;
    min-width: auto !important;
  }
  .el-card__header,
  .el-card__body {
    padding: 15px;
  }
  .el-dialog__header {
    padding: 15px 15px 5px;
  }
  .el-dialog__body {
    padding: 1px 15px;
  }
}

.breadcrumb-dropdown {
  max-height: 320px;
  overflow-y: auto;
  width: 360px;
  box-sizing: border-box;
  padding: 10px;
  max-width: 100%;
  .el-dropdown-menu__item {
    display: inline-block;
    padding: 0 10px;
    border-radius: 4px;
  }
  &::-webkit-scrollbar {
    background-color: transparent;
    width: 6px;
    height: 6px;
  }

  &:hover::-webkit-scrollbar {
    background-color: rgb(241, 241, 241);
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 3px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: rgb(193, 193, 193);
  }

  &:hover::-webkit-scrollbar-thumb::hover {
    background-color: rgb(168, 168, 168);
  }
}
</style>
