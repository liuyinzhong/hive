<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WorkflowRuntimeApi } from '#/api/workflow';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, message, Modal } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  cancelWorkflowInstanceApi,
  getWorkflowInstancesApi,
} from '#/api/workflow';
import { $t } from '#/locales';
import {
  useInstanceColumns,
  useInstanceGridFormSchema,
} from '#/views/workflow/runtime/data';
import StartModal from '#/views/workflow/runtime/start-modal.vue';

defineOptions({ name: 'WorkflowInstanceMine' });

interface GridQueryContext {
  page: { currentPage: number; pageSize: number };
}

const router = useRouter();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useInstanceGridFormSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useInstanceColumns(),
    proxyConfig: {
      ajax: {
        query: async (
          { page }: GridQueryContext,
          formValues: Record<string, unknown>,
        ) =>
          getWorkflowInstancesApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<WorkflowRuntimeApi.WorkflowInstance>,
});

const [StartWorkflowModal, startWorkflowModalApi] = useVbenModal({
  connectedComponent: StartModal,
  destroyOnClose: true,
});

function openDetail(row: WorkflowRuntimeApi.WorkflowInstance) {
  router.push(`/workflow/instance/detail/${row.instanceId}`);
}

function cancelInstance(row: WorkflowRuntimeApi.WorkflowInstance) {
  Modal.confirm({
    content: $t('flow.runtime.instance.cancelConfirm', [row.title]),
    onOk: async () => {
      await cancelWorkflowInstanceApi(row.instanceId);
      message.success($t('flow.runtime.instance.cancelSuccess'));
      gridApi.query();
    },
    title: $t('flow.runtime.instance.cancel'),
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Button type="primary" @click="startWorkflowModalApi.open()">
          <Plus class="size-5" />
          {{ $t('flow.runtime.instance.start') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              icon: 'lucide:eye',
              text: $t('flow.runtime.common.detail'),
              onClick: () => openDetail(row),
            },
            {
              danger: true,
              disabled: row.status !== '0',
              icon: 'lucide:circle-x',
              text: $t('flow.runtime.instance.cancel'),
              onClick: () => cancelInstance(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
    <StartWorkflowModal @success="gridApi.query" />
  </Page>
</template>
