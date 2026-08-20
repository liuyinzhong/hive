<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FormSchemaApi } from '#/api/form';

import { useRouter } from 'vue-router';
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { deleteFormSchemasApi, getFormSchemaListApi } from '#/api/form';
import { $t } from '#/locales';
import { formatSorts } from '#/utils/vxe-table';

import { useFormSchemaColumns, useFormSchemaGridForm } from './data';
import FormModal from './form-modal.vue';

defineOptions({ name: 'FormSchemaList' });

const router = useRouter();
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useFormSchemaGridForm(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 lg:grid-cols-4',
  },
  gridOptions: {
    columns: useFormSchemaColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }: any, values: Recordable<unknown>) =>
          getFormSchemaListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
            ...values,
          }),
      },
    },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<FormSchemaApi.FormSchemaRecord>,
});

const [SchemaModal, schemaModalApi] = useVbenModal({
  connectedComponent: FormModal,
  destroyOnClose: true,
});

function onCreate() {
  schemaModalApi.setData({}).open();
}

function onEdit(row: FormSchemaApi.FormSchemaRecord) {
  schemaModalApi.setData(row).open();
}

function onDesign(row: FormSchemaApi.FormSchemaRecord) {
  router.push(`/form/schema/designer/${row.formSchemaId}`);
}

async function onDelete(row: FormSchemaApi.FormSchemaRecord) {
  await deleteFormSchemasApi([row.formSchemaId]);
  message.success($t('form.messages.deleteSuccess'));
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('form.actions.createSchema') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              text: $t('form.actions.design'),
              icon: 'lucide:panels-top-left',
              onClick: () => onDesign(row),
            },
            {
              text: $t('form.actions.edit'),
              icon: 'lucide:pencil-line',
              onClick: () => onEdit(row),
            },
          ]"
          :dropdown-actions="[
            {
              text: $t('form.actions.delete'),
              icon: 'lucide:trash-2',
              danger: true,
              popConfirm: {
                title: $t('form.messages.deleteConfirm', [row.schemaName]),
                confirm: () => onDelete(row),
              },
            },
          ]"
        />
      </template>
    </Grid>
    <SchemaModal @success="gridApi.query" />
  </Page>
</template>
