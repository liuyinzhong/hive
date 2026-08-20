<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalDiagnosisApi } from '#/api/medical';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { deleteDiagnosisApi, getDiagnosisListApi } from '#/api/medical';
import { $t } from '#/locales';
import { formatSorts } from '#/utils/vxe-table';

import { useDiagnosisColumns, useDiagnosisSearchSchema } from './data';
import FormDrawerComponent from './form-drawer.vue';

const { hasAccessByCodes } = useAccess();
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useDiagnosisSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 sm:grid-cols-2',
  },
  gridOptions: {
    columns: useDiagnosisColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, values) =>
          getDiagnosisListApi({
            ...values,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          }),
      },
    },
    rowConfig: { keyField: 'diagnosisId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<MedicalDiagnosisApi.Diagnosis>,
});

function remove(row: MedicalDiagnosisApi.Diagnosis) {
  Modal.confirm({
    content: $t('medical.diagnosis.deleteConfirm', [row.icdName]),
    async onOk() {
      await deleteDiagnosisApi(row.diagnosisId);
      message.success($t('medical.common.deleteSuccess'));
      await gridApi.query();
    },
    title: $t('common.confirm'),
  });
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('medical.diagnosis.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['medical:diagnosis:create'])"
          type="primary"
          @click="formDrawerApi.setData({}).open()"
        >
          <Plus class="size-5" />
          {{ $t('medical.diagnosis.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'medical:diagnosis:update',
              icon: 'lucide:pencil',
              text: $t('common.edit'),
              onClick: () =>
                formDrawerApi.setData({ diagnosisId: row.diagnosisId }).open(),
            },
            {
              auth: 'medical:diagnosis:delete',
              danger: true,
              icon: 'lucide:trash-2',
              text: $t('common.delete'),
              onClick: () => remove(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
