<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WorkflowAutomationApi } from '#/api/workflow';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteAutomationApi,
  getAutomationListApi,
} from '#/api/workflow';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import FormModal from './form-modal.vue';

defineOptions({
  name: 'WorkflowAutomationList',
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useColumns(),
    exportConfig: {},
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page }: any, formValues: Recordable<any>) => {
          return await getAutomationListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: '',
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
  } as VxeTableGridOptions<WorkflowAutomationApi.AutomationResponse>,
});

const [AutomationModal, AutomationModalApi] = useVbenModal({
  connectedComponent: FormModal,
  destroyOnClose: true,
});

function onCreate() {
  AutomationModalApi.setData({}).open();
}

function onEdit(row: WorkflowAutomationApi.AutomationResponse) {
  AutomationModalApi.setData(row).open();
}

async function onDelete(row: WorkflowAutomationApi.AutomationResponse) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.automationName]),
    duration: 0,
  });
  try {
    await deleteAutomationApi([row.automationId ?? '']);
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
          新建动作
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: '编辑',
              icon: 'lucide:pencil-line',
              onClick: () => onEdit(row),
            },
            {
              text: '删除',
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title:
                  $t('ui.actionMessage.deleteConfirm', [row.automationName]) +
                  '(已配置到流程画布的挂载不受影响)',
                confirm: () => onDelete(row),
              },
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
    <AutomationModal @success="gridApi.query" />
  </Page>
</template>
