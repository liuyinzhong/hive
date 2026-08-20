<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalPatientApi } from '#/api/medical';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getPatientListApi } from '#/api/medical';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import { usePatientColumns, usePatientSearchSchema } from './data';
import DetailDrawerComponent from './detail-drawer.vue';
import FormDrawerComponent from './form-drawer.vue';

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: FormDrawerComponent,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createDate', ['createDateFrom', 'createDateTo']]],
    schema: usePatientSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 lg:grid-cols-4',
  },
  gridOptions: {
    columns: usePatientColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues) =>
          getPatientListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          }),
      },
    },
    rowConfig: { keyField: 'patientId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<MedicalPatientApi.Patient>,
});

function openCreate() {
  formDrawerApi.setData({}).open();
}

function openEdit(row: MedicalPatientApi.Patient) {
  formDrawerApi.setData({ patientId: row.patientId }).open();
}

function openDetail(row: MedicalPatientApi.Patient) {
  detailDrawerApi.setData({ patientId: row.patientId }).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="gridApi.query()" />
    <DetailDrawer />
    <Grid :table-title="$t('medical.patient.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['medical:patient:create'])"
          type="primary"
          @click="openCreate"
        >
          <Plus class="size-5" />
          {{ $t('medical.patient.create') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'medical:patient:detail',
              icon: 'lucide:eye',
              onClick: () => openDetail(row),
              text: $t('medical.patient.viewSensitive'),
            },
            {
              auth: 'medical:patient:update',
              icon: 'lucide:edit',
              onClick: () => openEdit(row),
              text: $t('common.edit'),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
