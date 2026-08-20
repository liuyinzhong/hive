<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { PrintTemplateListItem } from '#/api/print';

import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  createPrintTemplateApi,
  deletePrintTemplateApi,
  getPrintTemplateListApi,
} from '#/api/print';
import { $t } from '#/locales';
import { formatSorts } from '#/utils/vxe-table';

import { createDefaultPrintLayout } from './default-layout';

defineOptions({ name: 'PrintTemplateList' });

const router = useRouter();
const { hasAccessByCodes } = useAccess();

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      {
        field: 'documentType',
        formatter: () => $t('print.documentType.purchaseInbound'),
        minWidth: 160,
        title: $t('print.template.documentType'),
      },
      {
        field: 'templateName',
        minWidth: 220,
        title: $t('print.template.name'),
      },
      {
        field: 'status',
        formatter: ({ row }: { row: PrintTemplateListItem }) =>
          $t(
            row.status === 'PUBLISHED'
              ? 'print.template.statusPublished'
              : 'print.template.statusDraft',
          ),
        width: 120,
        title: $t('print.template.status'),
      },
      {
        field: 'updateDate',
        minWidth: 180,
        title: $t('print.template.updateDate'),
      },
      {
        align: 'center',
        field: 'operation',
        fixed: 'right',
        showOverflow: false,
        slots: { default: 'action' },
        title: $t('print.template.operation'),
        width: 220,
      },
    ],
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }) =>
          getPrintTemplateListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          }),
      },
    },
    rowConfig: { keyField: 'templateId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<PrintTemplateListItem>,
});

async function createTemplate() {
  const template = await createPrintTemplateApi({
    documentType: 'PURCHASE_INBOUND',
    draftLayout: createDefaultPrintLayout(),
    templateName: $t('print.template.defaultName'),
  });
  message.success($t('print.messages.createSuccess'));
  await router.push({
    path: '/print/management/designer',
    query: { templateId: template.templateId },
  });
}

function openDesigner(row: PrintTemplateListItem) {
  router.push({
    path: '/print/management/designer',
    query: { templateId: row.templateId },
  });
}

async function deleteTemplate(row: PrintTemplateListItem) {
  await deletePrintTemplateApi(row.templateId);
  message.success($t('print.messages.deleteSuccess'));
  await gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('print.template.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['print:template:create'])"
          type="primary"
          @click="createTemplate"
        >
          <Plus class="size-5" />
          {{ $t('print.actions.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'print:template:update',
              icon: 'lucide:panels-top-left',
              text: $t('print.actions.design'),
              onClick: () => openDesigner(row),
            },
          ]"
          :dropdown-actions="[
            {
              auth: 'print:template:delete',
              danger: true,
              icon: 'lucide:trash-2',
              popConfirm: {
                confirm: () => deleteTemplate(row),
                title: $t('print.messages.deleteConfirm', [row.templateName]),
              },
              text: $t('print.actions.delete'),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
