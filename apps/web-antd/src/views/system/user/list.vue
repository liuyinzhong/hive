<script lang="ts" setup>
import { useUserStore } from '@vben/stores';

import { getUsersList, type SystemUserApi } from '#/api/system';

import { useVbenDrawer, Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import {
  useVbenVxeGrid,
  type OnActionClickParams,
  type VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { sleep } from '#/utils';
import ExtraDrawer from './drawer.vue';
import { useRouter, useRoute } from 'vue-router';
import { useRefresh } from '@vben/hooks';
import { useGridFormSchema, useColumns } from './data';

const userStore = useUserStore();

// 刷新路由
const { refresh } = useRefresh();
// 页面参数
const route = useRoute();
// 跳转路由
const router = useRouter();

//#region 表格搜索,配置

// 表格分页
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getUsersList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
  gridEvents: {},
});

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

//#region 抽屉组件

const [Drawer, drawerApi] = useVbenDrawer({
  // 连接抽离的组件
  connectedComponent: ExtraDrawer,
});

function onEdit(row: SystemUserApi.SystemUser) {
  drawerApi.setData(row).open();
}

function onCreate() {
  drawerApi.setData(null).open();
}

async function onDelete(row: SystemUserApi.SystemUser) {
  const hideLoading = message.loading({
    content: '正在删除用户:' + row.username,
    duration: 0,
    key: 'action_process_msg',
  });

  await sleep(1000);

  message.success({
    content: '删除用户:' + row.username + '成功',
    key: 'action_process_msg',
  });

  await sleep(1000);
  hideLoading();
  gridApi.query();
}

//#endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <a-button type="primary" @click="onCreate">新建</a-button>
      </template>
    </Grid>
    <Drawer />
  </Page>
</template>
