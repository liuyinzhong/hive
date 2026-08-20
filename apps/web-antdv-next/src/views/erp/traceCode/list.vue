<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpInventoryApi } from '#/api/erp';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getInventoryTraceCodeListApi } from '#/api/erp';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import MovementDrawerComponent from '../inventory/movement-drawer.vue';
import {
  useInventoryTraceCodeColumns,
  useInventoryTraceCodeSearchSchema,
} from './data';

const [MovementDrawer, movementDrawerApi] = useVbenDrawer({
  connectedComponent: MovementDrawerComponent,
  destroyOnClose: true,
});

const [Grid] = useVbenVxeGrid({
  formOptions: {
    schema: useInventoryTraceCodeSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-5',
  },
  gridOptions: {
    columns: useInventoryTraceCodeColumns(),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          return getInventoryTraceCodeListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'traceId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpInventoryApi.InventoryTraceCode>,
});

function openMovements(row: ErpInventoryApi.InventoryTraceCode) {
  movementDrawerApi
    .setData({ traceCode: row.traceCode, traceId: row.traceId })
    .open();
}
</script>

<template>
  <Page auto-content-height>
    <MovementDrawer />
    <Grid :table-title="$t('erp.traceCode.list')">
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'erp:inventoryTraceCode:movements',
              icon: 'lucide:list',
              text: $t('erp.traceCode.movements'),
              onClick: () => openMovements(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
