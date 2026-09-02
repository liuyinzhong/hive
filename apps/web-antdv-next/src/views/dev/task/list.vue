<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DevTaskApi } from '#/api/dev';
import { onMounted } from 'vue';
import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Download, Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getProjectsListApi } from '#/api/dev';
import {
  createTaskExportApi,
  deleteTaskApi,
  getTaskListApi,
  updateTaskFieldApi,
} from '#/api/dev/task';
import { $t } from '#/locales';

import addFormModal from './add-modal.vue';
import batchFormModal from './batch-modal.vue';
import { useColumns, useGridFormSchema, createExport } from './data';
import detailDrawer from './detail-drawer.vue';
import nextModal from './next-modal.vue';
import { formatVxeTableSorts } from '#/utils';

const { hasAccessByCodes } = useAccess();

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
      export: hasAccessByCodes(['dev:task:export']),
      import: true,
      print: true,
    },
    editConfig: {
      trigger: 'click',
      mode: 'cell',
    },
    printConfig: {},
    importConfig: {},
    exportConfig: {
      exportMethod: async (exportOptions: any) => {
        let formValues = await gridApi.formApi.getValues();
        await createExport(formValues, exportOptions);
      },
    },
    columns: useColumns(onActionClick),
    sortConfig: {
      remote: true,
      multiple: true,
    },
    proxyConfig: {
      autoLoad: false,
      sort: true,
      ajax: {
        query: async ({ page, sorts }: any, formValues: Recordable<any>) => {
          return await getTaskListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<DevTaskApi.DevTaskFace>,
  gridEvents: {},
});

onMounted(async () => {
  /* 项目默认选中第一个后再生效首查;query不实时读表单,须显式传参 */
  const projects = await getProjectsListApi();
  const projectId = projects?.[0]?.projectId;
  if (projectId) {
    await gridApi.formApi.setValues({ projectId });
  }
  gridApi.query(projectId ? { projectId } : {});
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
