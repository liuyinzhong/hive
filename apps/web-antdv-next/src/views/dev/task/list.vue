<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DevTaskApi } from '#/api/dev';
import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Download, Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  createTaskExportApi,
  deleteTaskApi,
  getTaskListApi,
  updateTaskFieldApi,
} from '#/api/dev/task';
import { $t } from '#/locales';

import addFormModal from './add-modal.vue';
import batchFormModal from './batch-modal.vue';
import { useColumns, useGridFormSchema } from './data';
import detailDrawer from './detail-drawer.vue';
import nextModal from './next-modal.vue';
import { formatSorts } from '#/utils/index.js';

const { hasAccessByCodes } = useAccess();
let currentSorts = '';

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
    },
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    columns: useColumns(onActionClick),
    sortConfig: {
      remote: true,
      multiple: true,
    },
    proxyConfig: {
      sort: true,
      ajax: {
        query: async (
          { page, sorts }: any,
          formValues: Recordable<any>,
        ) => {
          currentSorts = formatSorts(sorts);
          return await getTaskListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: currentSorts,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<DevTaskApi.DevTaskFace>,
  gridEvents: {},
});

// #region 表格操作按钮的回调函数

function onActionClick({
  code,
  row,
}: OnActionClickParams<DevTaskApi.DevTaskFace>) {
  switch (code) {
    case 'taskTitle': {
      DetailDrawerApi.setData(row).open();
      break;
    }
    case 'updateField': {
      updateTaskFieldApi(row.taskId ?? '', {
        key: row.key,
        value: row.value,
      }).finally(() => {
        gridApi.query();
      });
      break;
    }
  }
}

function onCreate() {
  AddFormModalApi.setData(null).open();
}

async function createExport() {
  const formValues = (await gridApi.formApi.getValues()) as Recordable<unknown>;
  const taskStatus = Array.isArray(formValues.taskStatus)
    ? formValues.taskStatus.map(Number)
    : undefined;
  await createTaskExportApi({
    projectId: formValues.projectId as string | undefined,
    sorts: currentSorts,
    taskStatus,
    taskTitle: formValues.taskTitle as string | undefined,
    versionId: formValues.versionId as string | undefined,
  });
  message.success($t('dev.task.exportCreated'));
}

function onEdit(row: DevTaskApi.DevTaskFace) {
  AddFormModalApi.setData(row).open();
}

async function onDelete(_row: DevTaskApi.DevTaskFace) {
  const hideLoading = message.loading({
    content: '正在删除',
    duration: 0,
  });

  try {
    await deleteTaskApi([_row.taskId ?? '']);
    gridApi.query();
  } finally {
    hideLoading();
  }
}
// #endregion

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
        <Button
          v-if="hasAccessByCodes(['dev:task:export'])"
          class="mr-2"
          @click="createExport"
        >
          <Download class="size-5" />
          {{ $t('dev.task.export') }}
        </Button>
        <Button class="mr-2" type="primary" @click="onCreate()">
          <Plus class="size-5" />新建任务
        </Button>
        <Button type="primary" @click="openBatchFormModal">
          批量添加任务
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: '流转',
              icon: 'lucide:redo-dot',
              disabled: row.taskStatus === '99',
              onClick: () => openNextModal(row),
            },
            {
              text: '编辑',
              icon: 'lucide:edit',
              disabled: row.taskStatus === '99',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: '删除',
              icon: 'lucide:trash-2',
              danger: true,
              disabled: row.taskStatus === '99',
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [
                  '#' + row.taskNum,
                ]),
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
    <AddFormModal @success="gridApi.query" />
    <BatchFormModal />
    <NextModal @success="gridApi.query" />
    <DetailDrawer />
  </Page>
</template>
