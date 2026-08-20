<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WorkflowDefinitionApi } from '#/api/workflow';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteWorkflowDefinitionApi,
  getWorkflowDefinitionListApi,
  publishWorkflowDefinitionApi,
  updateWorkflowDefinitionStatusApi,
} from '#/api/workflow';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import { getWorkflowStatusText, useColumns, useGridFormSchema } from './data';
import FormModal from './form-modal.vue';

defineOptions({
  name: 'WorkflowDefinitionList',
});

const router = useRouter();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useColumns(),
    exportConfig: {},
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }: any, formValues: Recordable<any>) => {
          return await getWorkflowDefinitionListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            ...formValues,
          });
        },
      },
    },
    sortConfig: {
      multiple: true,
      remote: true,
    },
    toolbarConfig: {
      custom: true,
      export: true,
      refresh: true,
      zoom: true,
    },
  } as VxeTableGridOptions<WorkflowDefinitionApi.WorkflowDefinition>,
});

const [DefinitionModal, DefinitionModalApi] = useVbenModal({
  connectedComponent: FormModal,
  destroyOnClose: true,
});

function onCreate() {
  DefinitionModalApi.setData({}).open();
}

function onEdit(row: WorkflowDefinitionApi.WorkflowDefinition) {
  DefinitionModalApi.setData(row).open();
}

function onDesign(row: WorkflowDefinitionApi.WorkflowDefinition) {
  router.push({
    path: `/workflow/definition/designer/${row.definitionId}`,
  });
}

async function onPublish(row: WorkflowDefinitionApi.WorkflowDefinition) {
  await publishWorkflowDefinitionApi(row.definitionId ?? '');
  message.success('发布成功');
  gridApi.query();
}

async function onStatusChange(
  row: WorkflowDefinitionApi.WorkflowDefinition,
  status: string,
) {
  await updateWorkflowDefinitionStatusApi(row.definitionId ?? '', status);
  message.success(`已更新为${getWorkflowStatusText(status)}`);
  gridApi.query();
}

async function onDelete(row: WorkflowDefinitionApi.WorkflowDefinition) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.definitionName]),
    duration: 0,
  });
  try {
    await deleteWorkflowDefinitionApi([row.definitionId ?? '']);
    message.success('删除成功');
    gridApi.query();
  } finally {
    hideLoading();
  }
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          新建流程
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: '设计',
              icon: 'lucide:workflow',
              onClick: () => onDesign(row),
            },
            {
              text: '发布',
              icon: 'lucide:rocket',
              onClick: () => onPublish(row),
            },
            {
              text: '编辑',
              icon: 'lucide:pencil-line',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: '设为草稿',
              icon: 'lucide:file-pen-line',
              disabled: row.status === '0',
              onClick: () => onStatusChange(row, '0'),
            },
            {
              text: '停用',
              icon: 'lucide:circle-pause',
              disabled: row.status === '2',
              onClick: () => onStatusChange(row, '2'),
            },
            {
              text: '删除',
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [
                  row.definitionName,
                ]),
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
    <DefinitionModal @success="gridApi.query" />
  </Page>
</template>
