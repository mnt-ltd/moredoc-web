<template>
  <div class="com-table-list">
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
      row-key="id"
      :tree-props="treeProps"
      @selection-change="selectRow"
    >
      <el-table-column
        v-if="showSelect"
        type="selection"
        width="55"
        :selectable="selectable"
      >
      </el-table-column>
      <el-table-column
        v-for="item in fields"
        :key="'field-' + item.prop"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :min-width="item.minWidth"
        :fixed="item.fixed"
      >
        <template slot="header" slot-scope="scope">
          {{ item.label }}
          <slot :row="scope.column" name="header"></slot>
        </template>
        <template slot-scope="scope">
          <!-- 头像 -->
          <el-avatar
            v-if="item.type === 'avatar'"
            :size="45"
            :src="scope.row[item.prop]"
          >
            <img src="/static/images/blank.png" />
          </el-avatar>
          <!-- 数字 -->
          <div v-else-if="item.type === 'number'">
            <el-input-number
              v-if="item.editable && scope.row['editing']"
              :key="'number-' + item.prop + '-' + scope.row.id"
              v-model="scope.row[item.prop]"
              size="medium"
            ></el-input-number>
            <div v-else>{{ scope.row[item.prop] || '0' }}</div>
          </div>
          <el-tag
            v-else-if="item.type === 'bool'"
            :type="scope.row[item.prop] ? 'success' : 'danger'"
            effect="dark"
            size="medium"
          >
            {{ scope.row[item.prop] ? '是' : '否' }}</el-tag
          >
          <span v-else-if="item.type === 'bytes'">
            {{ formatBytes(scope.row[item.prop]) }}
          </span>
          <!-- 枚举，键为数字 -->
          <div v-else-if="item.type === 'enum'">
            <el-select
              v-if="item.editable && scope.row['editing']"
              :key="'select-' + item.prop + '-' + scope.row.id"
              v-model="scope.row[item.prop]"
              size="medium"
            >
              <el-option
                v-for="(option, index) in item.enum"
                :key="'enum-' + item.prop + index"
                :label="option.label"
                :value="option.value"
              ></el-option>
            </el-select>
            <template v-else>
              <el-tag
                v-if="item.enum[scope.row[item.prop] || 0]"
                size="medium"
                :type="item.enum[scope.row[item.prop] || 0].type || 'info'"
                :effect="item.enum[scope.row[item.prop] || 0].effect || 'dark'"
              >
                {{ item.enum[scope.row[item.prop] || 0].label }}
              </el-tag>
              <span v-else>{{ scope.row[item.prop] || '-' }}</span>
            </template>
          </div>
          <span v-else-if="item.type === 'datetime'">
            {{ formatDatetime(scope.row[item.prop]) || '0000-00-00 00:00:00' }}
          </span>
          <span v-else-if="item.type === 'color'">
            <span :style="{ color: scope.row[item.prop] }">{{
              scope.row[item.prop] || '-'
            }}</span>
          </span>
          <span v-else-if="['link', 'url'].includes(item.type)">
            <a :href="scope.row[item.prop]" target="_blank">
              <i class="el-icon-link"></i> {{ scope.row[item.prop] }}</a
            >
          </span>
          <span v-else-if="item.type === 'image'">
            <!-- 因为table cell有个左右的10px内边距，所以需要调整下 -->
            <UploadImage
              v-if="scope.row[item.prop]"
              :disabled="true"
              :image="scope.row[item.prop]"
              :width="item.width ? item.width + 'px' : 'auto'"
              style="margin-left: -10px; margin-right: -10px"
            />
            <span v-else>-</span>
          </span>
          <span v-else-if="item.type === 'array'">
            <template v-if="scope.row[item.prop]">
              <el-tag
                v-for="(value, idx) in scope.row[item.prop]"
                :key="item.prop + idx"
                size="medium"
                class="mgr-5px"
                >{{ value }}</el-tag
              >
            </template>
            <template v-else>{{ scope.row[item.prop] || '-' }}</template>
          </span>
          <!-- 有层级的，用breadcrumb -->
          <span v-else-if="item.type === 'breadcrumb'">
            <template v-if="scope.row[item.prop]">
              <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item
                  v-for="(value, idx) in scope.row[item.prop]"
                  :key="item.prop + idx"
                  >{{ value }}</el-breadcrumb-item
                >
              </el-breadcrumb>
            </template>
            <template v-else>{{ scope.row[item.prop] || '-' }}</template>
          </span>
          <span v-else-if="item.type === 'category'">
            <template v-if="scope.row[item.prop]">
              <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item
                  v-for="(value, idx) in scope.row[item.prop]"
                  :key="item.prop + idx"
                  >{{ value.title }}</el-breadcrumb-item
                >
              </el-breadcrumb>
            </template>
            <template v-else>{{ scope.row[item.prop] || '-' }}</template>
          </span>
          <!-- 字符串。更多，则需要继续扩展 -->
          <span v-else-if="item.type === 'html'">
            <span v-html="scope.row[item.prop]"></span>
          </span>
          <template v-else>
            <el-input
              v-if="item.editable && scope.row['editing']"
              v-model="scope.row[item.prop]"
              size="medium"
              :placeholder="item.placeholder || '请输入' + item.label"
              type="textarea"
              :rows="3"
            ></el-input>
            <template v-else>{{ scope.row[item.prop] || '-' }}</template>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        v-if="showActions || showView || showDelete || showEdit"
        fixed="right"
        label="操作"
        :min-width="actionsMinWidth"
        class="com-table-list-actions"
      >
        <template slot-scope="scope">
          <slot :row="scope.row" name="actions"></slot>
          <el-button
            v-if="showView"
            type="text"
            size="small"
            icon="el-icon-view"
            @click="viewRow(scope.row)"
            >查看</el-button
          >
          <el-button
            v-if="showEdit"
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="editRow(scope.row)"
            >编辑</el-button
          >
          <el-button
            v-if="showDelete"
            type="text"
            size="small"
            icon="el-icon-delete"
            :disabled="scope.row.disable_delete"
            class="text-danger"
            @click="deleteRow(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
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
<style lang="scss">
.com-table-list {
  .el-button {
    margin-left: 0;
    margin-right: 10px;
  }
  .el-breadcrumb__separator[class*='icon'] {
    margin: 0;
  }
  .el-table--border,
  .el-table--group {
    border: 0;
  }
  .el-table--border th.el-table__cell,
  .el-table--border .el-table__cell,
  .el-table__fixed-right-patch {
    border: 0;
  }
  .editable {
    cursor: pointer;
    position: relative;
  }
}
</style>
