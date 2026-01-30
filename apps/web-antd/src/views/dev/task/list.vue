<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import { Page, useVbenModal, useVbenDrawer } from '@vben/common-ui';
import { message, Button } from 'ant-design-vue';
import { Plus } from '@vben/icons';
import { getTaskList, type SystemTaskApi } from '#/api/dev';
import detailDrawer from './detail-drawer.vue';
import {
  useVbenVxeGrid,
  type VxeGridProps,
  type VxeTableGridOptions,
  type OnActionClickParams,
} from '#/adapter/vxe-table';

import addFormModal from './add-modal.vue';
import nextModal from './next-modal.vue';
import batchFormModal from './batch-modal.vue';
import { useColumns, useGridFormSchema } from './data';
import { sleep } from '#/utils';
import type { Recordable } from '@vben/types';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4',
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    schema: useGridFormSchema(),
  },
  gridOptions: {
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
    columns: useColumns(onActionClick),
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, formValues: Recordable<any>) => {
          return await getTaskList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as any,
  gridEvents: {},
});

// #region 表格操作按钮的回调函数

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemTaskApi.SystemTask>) {
  switch (code) {
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    case 'next': {
      openNextModal(row);
      break;
    }
    case 'taskTitle': {
      DetailDrawerApi.setData(row).open();
      break;
    }
  }
}

function onCreate() {
  AddFormModalApi.setData(null).open();
}

function onEdit(row: SystemTaskApi.SystemTask) {
  AddFormModalApi.setData(row).open();
}

async function onDelete(row: SystemTaskApi.SystemTask) {
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

// #region 批量添加
const [BatchFormModal, BatchFormModalApi] = useVbenModal({
  connectedComponent: batchFormModal,
  destroyOnClose: true,
});

/** 打开批量添加弹窗 */
function openBatchFormModal() {
  BatchFormModalApi.open();
}
// #endregion

// #region 流转弹窗
const [NextModal, NextModalApi] = useVbenModal({
  title: '流转任务',
  connectedComponent: nextModal,
  destroyOnClose: true,
});

/** 打开流转弹窗 */
function openNextModal(row: any) {
  NextModalApi.setData(row).open();
}
// #endregion

// #region 详情抽屉
const [DetailDrawer, DetailDrawerApi] = useVbenDrawer({
  connectedComponent: detailDrawer,
  destroyOnClose: true,
});
// #endregion
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Button class="mr-2" type="primary" @click="onCreate()">
          <Plus class="size-5" />新建任务
        </Button>
        <Button type="primary" @click="openBatchFormModal">
          批量添加任务
        </Button>
      </template>
    </Grid>
    <AddFormModal />
    <BatchFormModal />
    <NextModal />
    <DetailDrawer />
  </Page>
</template>
