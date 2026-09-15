<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WorkflowRuntimeApi } from '#/api/workflow';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getWorkflowTasksApi } from '#/api/workflow';
import { $t } from '#/locales';
import {
  useTaskColumns,
  useTaskGridFormSchema,
} from '#/views/workflow/runtime/data';
import TaskActionModal from '#/views/workflow/runtime/task-action-modal.vue';
import TaskOperationModal from '#/views/workflow/runtime/task-operation-modal.vue';

defineOptions({ name: 'WorkflowTaskList' });

interface GridQueryContext {
  page: { currentPage: number; pageSize: number };
}

const router = useRouter();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useTaskGridFormSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useTaskColumns(),
    proxyConfig: {
      ajax: {
        query: async (
          { page }: GridQueryContext,
          formValues: Record<string, unknown>,
        ) =>
          getWorkflowTasksApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<WorkflowRuntimeApi.WorkflowTask>,
});

const [ActionModal, actionModalApi] = useVbenModal({
  connectedComponent: TaskActionModal,
  destroyOnClose: true,
});
const [OperationModal, operationModalApi] = useVbenModal({
  connectedComponent: TaskOperationModal,
  destroyOnClose: true,
});

function openDetail(row: WorkflowRuntimeApi.WorkflowTask) {
  router.push(`/workflow/instance/detail/${row.instanceId}`);
}

/** 任务可用操作包含指定动作时才渲染对应按钮（后端下发的节点操作集投影）。 */
function actionAllowed(
  row: WorkflowRuntimeApi.WorkflowTask,
  action: string,
): boolean {
  return (row.allowedActions ?? []).includes(action);
}

function openAction(
  action: 'approve' | 'reject',
  task: WorkflowRuntimeApi.WorkflowTask,
) {
  actionModalApi.setData({ action, task }).open();
}

function openOperation(
  action:
    | 'addSign'
    | 'removeSign'
    | 'returnNode'
    | 'returnPrevious'
    | 'transfer',
  task: WorkflowRuntimeApi.WorkflowTask,
) {
  operationModalApi.setData({ action, task }).open();
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              icon: 'lucide:eye',
              text: $t('flow.runtime.common.detail'),
              onClick: () => openDetail(row),
            },
            {
              disabled: row.status !== '0',
              icon: 'lucide:check',
              ifShow: actionAllowed(row, 'approve'),
              text: $t('flow.runtime.task.approve'),
              onClick: () => openAction('approve', row),
            },
            {
              danger: true,
              disabled: row.status !== '0',
              icon: 'lucide:x',
              ifShow: actionAllowed(row, 'reject'),
              text: $t('flow.runtime.task.reject'),
              onClick: () => openAction('reject', row),
            },
          ]"
          align="center"
          :dropdown-actions="[
            {
              disabled: row.status !== '0',
              icon: 'lucide:send',
              ifShow: actionAllowed(row, 'transfer'),
              text: $t('flow.runtime.task.operation.transfer'),
              onClick: () => openOperation('transfer', row),
            },
            {
              disabled: row.status !== '0',
              icon: 'lucide:user-round-plus',
              ifShow: actionAllowed(row, 'addSign'),
              text: $t('flow.runtime.task.operation.addSign'),
              onClick: () => openOperation('addSign', row),
            },
            {
              disabled: row.status !== '0',
              icon: 'lucide:user-round-minus',
              ifShow: actionAllowed(row, 'removeSign'),
              text: $t('flow.runtime.task.operation.removeSign'),
              onClick: () => openOperation('removeSign', row),
            },
            {
              disabled: row.status !== '0',
              icon: 'lucide:undo-2',
              ifShow: actionAllowed(row, 'returnPrevious'),
              text: $t('flow.runtime.task.operation.returnPrevious'),
              onClick: () => openOperation('returnPrevious', row),
            },
            {
              disabled: row.status !== '0',
              icon: 'lucide:corner-up-left',
              ifShow: actionAllowed(row, 'returnNode'),
              text: $t('flow.runtime.task.operation.returnNode'),
              onClick: () => openOperation('returnNode', row),
            },
          ]"
        />
      </template>
    </Grid>
    <ActionModal @success="gridApi.query" />
    <OperationModal @success="gridApi.query" />
  </Page>
</template>
