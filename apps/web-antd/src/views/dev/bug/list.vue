<script lang="ts" setup>
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import {
  useVbenVxeGrid,
  type VxeTableGridOptions,
  type OnActionClickParams,
} from '#/adapter/vxe-table';

import addFormModal from './add-modal.vue';
import nextModal from './next-modal.vue';
import { getBugList, type SystemBugApi } from '#/api/dev';
import trackDrawer from './track-drawer.vue';
import { useGridFormSchema, useColumns } from './data';
import { message } from 'ant-design-vue';
import { sleep } from '#/utils';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5',
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    toolbarConfig: {
      zoom: true,
      custom: true,
      refresh: true,
      export: true,
    },
    exportConfig: {},
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getBugList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    } as VxeTableGridOptions<SystemBugApi.SystemBug>,
  },
  gridEvents: {},
});

// #region 表格操作按钮的回调函数
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemBugApi.SystemBug>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'addTask': {
      break;
    }
    case 'next': {
      openNextModal(row);
      break;
    }
  }
}

function onCreate() {
  AddFormModalApi.setData(null).open();
}

function onEdit(row: SystemBugApi.SystemBug) {
  AddFormModalApi.setData(row).open();
}

async function onDelete(row: SystemBugApi.SystemBug) {
  const hideLoading = message.loading({
    content: '正在删除',
    duration: 0,
    key: 'action_process_msg',
  });

  await sleep(1000);

  message.success({
    content: '删除成功',
    key: 'action_process_msg',
  });

  await sleep(1000);
  hideLoading();
  gridApi.query();
}
//#endregion

// #region 单个添加
const [AddFormModal, AddFormModalApi] = useVbenModal({
  connectedComponent: addFormModal,
  destroyOnClose: true,
});

// #endregion

// #region 流转弹窗

const [NextModal, NextModalApi] = useVbenModal({
  connectedComponent: nextModal,
  destroyOnClose: true,
});

/** 打开流转弹窗 */
function openNextModal(row: any) {
  NextModalApi.setData(row).open();
}

// #endregion

// #region 抽屉组件

/** 打开轨迹抽屉 */
const [TrackDrawer, TrackDrawerApi] = useVbenDrawer({
  connectedComponent: trackDrawer,
});
function openTracDrawer(rowInfo: any) {
  if (rowInfo.column.field !== 'bugTitle') {
    return;
  }
  TrackDrawerApi.setData(rowInfo.row).open();
}

// #endregion
</script>

<template>
  <Page autoContentHeight>
    <Grid>
      <template #action="{ row }">
        <a-space :size="0">
          <a-button type="link" size="small" @click="openNextModal(row)">
            流转
          </a-button>
          <a-button type="link" size="small" @click="onEdit(row)">
            编辑
          </a-button>
        </a-space>
      </template>
      <template #toolbar-actions>
        <a-button type="primary" @click="onCreate">新建缺陷</a-button>
      </template>
    </Grid>
    <AddFormModal />
    <TrackDrawer />
    <NextModal />
  </Page>
</template>
