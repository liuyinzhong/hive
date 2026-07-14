<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WorkflowRuntimeApi } from '#/api/workflow';

import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getWorkflowCopiesApi, readWorkflowCopyApi } from '#/api/workflow';
import { $t } from '#/locales';
import {
  useCopyColumns,
  useCopyGridFormSchema,
} from '#/views/workflow/runtime/data';

defineOptions({ name: 'WorkflowCopyList' });

interface GridQueryContext {
  page: { currentPage: number; pageSize: number };
}

const router = useRouter();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useCopyGridFormSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useCopyColumns(),
    proxyConfig: {
      ajax: {
        query: async (
          { page }: GridQueryContext,
          formValues: Record<string, unknown>,
        ) =>
          getWorkflowCopiesApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<WorkflowRuntimeApi.WorkflowCopy>,
});

async function openDetail(row: WorkflowRuntimeApi.WorkflowCopy) {
  if (row.status === '0') {
    await readWorkflowCopyApi(row.copyId);
  }
  router.push(`/workflow/instance/detail/${row.instanceId}`);
}

async function markRead(row: WorkflowRuntimeApi.WorkflowCopy) {
  await readWorkflowCopyApi(row.copyId);
  message.success($t('flow.runtime.copy.readSuccess'));
  gridApi.query();
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
              icon: 'lucide:mail-open',
              text: $t('flow.runtime.copy.markRead'),
              onClick: () => markRead(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
