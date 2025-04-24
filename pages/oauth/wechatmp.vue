<template>
  <div class="mplogin">
    <el-card shadow="never">
      <div slot="header">小程序扫码登录</div>
      <div>
        <el-tooltip content="点击刷新小程序码" placement="top">
          <img
            src="https://static.sitestack.cn/projects/dapr-1.15-zh/wxacode.jpeg"
            alt=""
          />
        </el-tooltip>
      </div>
      <div class="help-block">打开微信，扫码登录</div>
    </el-card>
  </div>
</template>
<script>
export default {
  layout: 'empty',
}
</script>

<style lang="scss" scoped>
.mplogin {
  .el-card {
    margin: 50px auto;
    width: 300px;
    max-width: 100%;
  }
  .help-block {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: #999;
  }
  img {
    width: 200px;
    height: 200px;
    display: block;
    margin: auto;
    border-radius: 10px;
    object-fit: cover;
    cursor: pointer;
    &:hover {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
