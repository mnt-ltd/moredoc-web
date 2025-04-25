<template>
  <vxe-table
    resizable
    stripe
    :loading="loading"
    :data="tableData"
    row-id="id"
    :tree-config="treeConfig"
    :row-config="{ isHover: true }"
    border="none"
    @checkbox-change="selectRow"
    @select-all="selectRow"
  >
    <!-- 选择列 -->
    <vxe-column
      v-if="showSelect"
      type="checkbox"
      width="55"
      fixed="left"
      :check-method="selectable"
    ></vxe-column>

    <!-- 动态数据列 -->
    <vxe-column
      v-for="item in fields"
      :key="'field-' + item.prop"
      :field="item.prop"
      :title="item.label"
      :width="item.width"
      :min-width="item.minWidth"
      :fixed="item.fixed"
    >
      <template #default="{ row }">
        <!-- 头像 -->
        <el-avatar
          v-if="item.type === 'avatar'"
          :size="45"
          :src="row[item.prop]"
        >
          <img src="/static/images/blank.png" />
        </el-avatar>
        <!-- 数字 -->
        <span v-else-if="item.type === 'number'">{{
          row[item.prop] || '0'
        }}</span>
        <el-tag
          v-else-if="item.type === 'bool'"
          :type="row[item.prop] ? 'success' : 'danger'"
          effect="dark"
        >
          {{ row[item.prop] ? '是' : '否' }}</el-tag
        >
        <span v-else-if="item.type === 'bytes'">
          {{ formatBytes(row[item.prop]) }}
        </span>
        <!-- 枚举，键为数字 -->
        <span v-else-if="item.type === 'enum'">
          <el-tag
            v-if="item.enum[row[item.prop] || 0]"
            :type="item.enum[row[item.prop] || 0].type || 'info'"
            :effect="item.enum[row[item.prop] || 0].effect || 'dark'"
          >
            {{ item.enum[row[item.prop] || 0].label }}
          </el-tag>
          <span v-else>{{ row[item.prop] || '-' }}</span>
        </span>
        <span v-else-if="item.type === 'datetime'">
          {{ formatDatetime(row[item.prop]) || '0000-00-00 00:00:00' }}
        </span>
        <span v-else-if="item.type === 'color'">
          <span :style="{ color: row[item.prop] }">{{
            row[item.prop] || '-'
          }}</span>
        </span>
        <span v-else-if="['link', 'url'].includes(item.type)">
          <a :href="row[item.prop]" target="_blank">
            <i class="el-icon-link"></i> {{ row[item.prop] }}</a
          >
        </span>
        <span v-else-if="item.type === 'image'">
          <!-- 因为table cell有个左右的10px内边距，所以需要调整下 -->
          <UploadImage
            v-if="row[item.prop]"
            :disabled="true"
            :image="row[item.prop]"
            :width="item.width ? item.width + 'px' : 'auto'"
            style="margin-left: -10px; margin-right: -10px"
          />
          <span v-else>-</span>
        </span>
        <span v-else-if="item.type === 'array'">
          <template v-if="row[item.prop]">
            <el-tag
              v-for="(value, idx) in row[item.prop]"
              :key="item.prop + idx"
              class="mgr-5px"
              >{{ value }}</el-tag
            >
          </template>
          <template v-else>{{ row[item.prop] || '-' }}</template>
        </span>
        <!-- 有层级的，用breadcrumb -->
        <span v-else-if="item.type === 'breadcrumb'">
          <template v-if="row[item.prop]">
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item
                v-for="(value, idx) in row[item.prop]"
                :key="item.prop + idx"
                >{{ value }}</el-breadcrumb-item
              >
            </el-breadcrumb>
          </template>
          <template v-else>{{ row[item.prop] || '-' }}</template>
        </span>
        <span v-else-if="item.type === 'category'">
          <template v-if="row[item.prop]">
            <el-breadcrumb separator-class="el-icon-arrow-right">
              <el-breadcrumb-item
                v-for="(value, idx) in row[item.prop]"
                :key="item.prop + idx"
                >{{ value.title }}</el-breadcrumb-item
              >
            </el-breadcrumb>
          </template>
          <template v-else>{{ row[item.prop] || '-' }}</template>
        </span>
        <!-- 字符串。更多，则需要继续扩展 -->
        <span v-else-if="item.type === 'html'">
          <span v-html="row[item.prop]"></span>
        </span>
        <span v-else>{{ row[item.prop] || '-' }}</span>
      </template>
    </vxe-column>

    <!-- 操作列 -->
    <vxe-column
      v-if="showActions"
      fixed="right"
      title="操作"
      :min-width="actionsMinWidth"
      class="com-table-list-actions"
    >
      <template #default="{ row }">
        <slot name="actions" :row="row"></slot>
        <div>
          <el-button
            v-if="showView"
            type="text"
            size="small"
            icon="el-icon-view"
            @click="viewRow(row)"
            >查看</el-button
          >
        </div>
        <div>
          <el-button
            v-if="showEdit"
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="editRow(row)"
            >编辑</el-button
          >
        </div>
        <div>
          <el-button
            v-if="showDelete"
            type="text"
            size="small"
            icon="el-icon-delete"
            :disabled="row.disable_delete"
            class="text-danger"
            @click="deleteRow(row)"
            >删除</el-button
          >
        </div>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<script>
import UploadImage from './UploadImage.vue'
import { formatDatetime, formatBytes } from '~/utils/utils'
export default {
  name: 'ComTableList',
  components: { UploadImage },
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    // 每个field结构，包括：label、prop、width、min-width、fixed，还有type，其中type枚举包括：text、image、link、button、slot
    fields: {
      type: Array,
      default: () => [],
    },
    treeProps: {
      type: Object,
      default: () => ({}),
    },
    actionsMinWidth: {
      type: Number,
      default: 180,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    showView: {
      type: Boolean,
      default: true,
    },
    showEdit: {
      type: Boolean,
      default: true,
    },
    showDelete: {
      type: Boolean,
      default: true,
    },
    showSelect: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    formatDatetime,
    formatBytes,
    viewRow(row) {
      this.$emit('viewRow', row)
    },
    editRow(row) {
      this.$emit('editRow', row)
    },
    deleteRow(row) {
      this.$emit('deleteRow', row)
    },
    selectRow(rows) {
      this.$emit('selectRow', rows)
    },
    selectable(row) {
      // 取反，禁止删除的行，不可选中
      return !row.disable_delete
    },
  },
}
</script>

<style scoped>
/* 调整单元格内边距 */
.vxe-table .vxe-body--column {
  padding: 8px 10px;
}

/* 保持操作按钮样式一致 */
.com-table-list-actions .el-button {
  margin-left: 5px;
  padding: 5px;
}
</style>
