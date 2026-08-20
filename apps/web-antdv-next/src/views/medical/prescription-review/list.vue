<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalOutpatientApi } from '#/api/medical';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getPrescriptionReviewListApi } from '#/api/medical';
import { $t } from '#/locales';
import { formatSorts } from '#/utils/vxe-table';

import {
  usePrescriptionReviewColumns,
  usePrescriptionReviewSearchSchema,
} from './data';
import DetailDrawerComponent from './detail-drawer.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: usePrescriptionReviewSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 sm:grid-cols-3',
  },
  gridOptions: {
    columns: usePrescriptionReviewColumns(),
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, values) =>
          getPrescriptionReviewListApi({
            ...values,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          }),
      },
    },
    rowConfig: { keyField: 'prescriptionId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<MedicalOutpatientApi.Prescription>,
});

function statusColor(status: MedicalOutpatientApi.PrescriptionStatus) {
  return (
    (
      { 10: 'processing', 20: 'success', 30: 'error' } as Record<number, string>
    )[status] ?? 'default'
  );
}
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer @success="gridApi.query()" />
    <Grid :table-title="$t('medical.prescriptionReview.list')">
      <template #status="{ row }">
        <Tag :color="statusColor(row.status)">
          {{ $t(`medical.workbench.prescriptionStatus${row.status}`) }}
        </Tag>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              icon: 'lucide:clipboard-check',
              text:
                row.status === 10
                  ? $t('medical.prescriptionReview.review')
                  : $t('medical.prescriptionReview.detail'),
              onClick: () =>
                detailDrawerApi
                  .setData({ prescriptionId: row.prescriptionId })
                  .open(),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
