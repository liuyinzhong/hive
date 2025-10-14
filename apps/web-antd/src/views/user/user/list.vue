<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import {
  useVbenDrawer,
  useVbenModal,
  VbenCountToAnimator,
  Page,
} from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { getExampleTableApi } from '../mock-api2';
import ExtraDrawer from './drawer.vue';
import { useRouter, useRoute } from 'vue-router';
import { useRefresh } from '@vben/hooks';

// 刷新路由
const { refresh } = useRefresh();
// 页面参数
const route = useRoute();
// 跳转路由
const router = useRouter();

//#region 表格搜索,配置
const querySearch = (e: any) => {
  debugger;
};
/** 搜索表单配置 */
const formOptions: VbenFormProps = {
  handleSubmit: querySearch,
  handleReset: querySearch,
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {},
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: true,
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      defaultValue: '',
      fieldName: 'userName',
      label: '名称',
    },
  ],
};

/** 表格配置 */
const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: 'id',
  },
  toolbarConfig: {
    // 是否显示搜索表单控制按钮
    // @ts-ignore 正式环境时有完整的类型声明
    search: true,
    zoom: true,
    custom: true,
  },
  columns: [
    { field: 'avatar', align: 'left', title: '头像' },
    { field: 'username', align: 'left', title: '名称' },
    { field: 'deptName', align: 'left', title: '部门' },
    { field: 'desc', align: 'left', title: '描述' },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
    },
  ],
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        message.success(`Query params: ${JSON.stringify(formValues)}`);
        return await getExampleTableApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {},
});

//#region 抽屉组件

const [Drawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
});

/** 打开抽屉 */
function openDrawer(row: any) {
  drawerApi.setData(row).open();
}
//#endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <a-button type="primary" @click="openDrawer({})">新建</a-button>
      </template>
      <template #action="{ row }">
        <a-button type="link" @click="openDrawer(row)">编辑</a-button>
      </template>
    </Grid>
    <Drawer />
  </Page>
</template>
