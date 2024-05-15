<template>
  <div class="com-input-tag">
    <el-tag
      v-for="tag in dynamicTags"
      :key="tag"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      ref="saveTagInput"
      v-model="inputValue"
      class="input-new-tag"
      :placeholder="placeholder"
      @keyup.enter.native="handleInputConfirm"
      @blur="handleInputConfirm"
    >
      <!-- @keyup.delete.native="handleClose(dynamicTags[dynamicTags.length - 1])" -->
    </el-input>
  </div>
</template>

<script>
export default {
  props: {
    placeholder: {
      type: String,
      default: '请输入，按回车键确认',
    },
  },
  data() {
    return {
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
    }
  },
  methods: {
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
      this.$emit('change', this.dynamicTags)
    },
    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputValue = ''
      this.$emit('change', this.dynamicTags)
    },
  },
}
</script>

<style lang="scss">
.com-input-tag {
  .el-tag {
    margin-right: 10px;
    position: relative;
    top: -4px;
  }
  .button-new-tag {
    margin-right: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 180px;
    vertical-align: bottom;
  }
}
</style>
