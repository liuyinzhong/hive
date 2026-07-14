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

function openDetail(row: WorkflowRuntimeApi.WorkflowTask) {
  router.push(`/workflow/instance/detail/${row.instanceId}`);
}

function openAction(
  action: 'approve' | 'reject',
  task: WorkflowRuntimeApi.WorkflowTask,
) {
  actionModalApi.setData({ action, task }).open();
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
              text: $t('flow.runtime.task.approve'),
              onClick: () => openAction('approve', row),
            },
            {
              danger: true,
              disabled: row.status !== '0',
              icon: 'lucide:x',
              text: $t('flow.runtime.task.reject'),
              onClick: () => openAction('reject', row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
    <ActionModal @success="gridApi.query" />
  </Page>
</template>
