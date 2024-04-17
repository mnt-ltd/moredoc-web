<template>
  <div class="com-fixed-right-bar hidden-xs-only">
    <ul>
      <li>
        <el-tooltip
          class="item"
          effect="dark"
          content="上传文档"
          placement="left"
        >
          <nuxt-link to="/upload" class="el-link el-link--default">
            <i class="el-icon-document-add"></i>
          </nuxt-link>
        </el-tooltip>
      </li>
      <li>
        <el-tooltip
          class="item"
          effect="dark"
          content="发布文章"
          placement="left"
        >
          <nuxt-link to="/post" class="el-link el-link--default">
            <i class="el-icon-edit-outline"></i>
          </nuxt-link>
        </el-tooltip>
      </li>
      <!-- 公众号二维码 -->
      <li>
        <el-popover placement="left" trigger="hover" width="200">
          <div class="qrcode">
            <img
              src="https://www.bookstack.cn/static/images/qrcode_for_gh.jpg"
              alt="公众号"
              style="width: 100%"
            />
            <div class="help-block text-center" style="font-size: 13px">
              我们的公众号同样精彩
            </div>
          </div>
          <a
            slot="reference"
            href="javascript:;"
            class="el-link el-link--default"
          >
            <i class="fa fa-wechat"></i>
          </a>
        </el-popover>
      </li>
      <li>
        <el-tooltip
          class="item"
          effect="dark"
          content="联系我们，反馈您的意见与建议"
          placement="left"
        >
          <a href="javascript:;" class="el-link el-link--default">
            <i class="el-icon-s-custom"></i>
          </a>
        </el-tooltip>
      </li>
      <li>
        <el-tooltip
          class="item"
          effect="dark"
          content="返回顶部"
          placement="left"
        >
          <a
            href="javascript:;"
            class="el-link el-link--default"
            @click="go2top"
          >
            <i class="el-icon-top"></i>
          </a>
        </el-tooltip>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'FixedRightBar',
  methods: {
    go2top() {
      document.scrollingElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.com-fixed-right-bar {
  z-index: 9999;
  position: fixed;
  right: 20px;
  bottom: 0;
  transform: translateY(-20%);
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      margin-bottom: 10px;
      a {
        display: block;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background-color: #f5f5f5;
        border-radius: 50%;
        color: #666;
        font-size: 12px;
        box-shadow: 0px 1px 20px 0px rgba(0, 0, 0, 0.1),
          inset 0px -1px 0px 0px rgba(0, 0, 0, 0.1);
        &:hover {
          background-color: #f0f0f0;
        }
        i {
          font-size: 16px;
          vertical-align: middle;
        }
      }
    }
  }
}
</style>
