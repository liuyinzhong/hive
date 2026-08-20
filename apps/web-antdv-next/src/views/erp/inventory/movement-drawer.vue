<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpInventoryApi } from '#/api/erp';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getInventoryMovementsApi,
  getInventorySourceMovementsApi,
  getInventoryTraceCodeMovementsApi,
} from '#/api/erp';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import { useInventoryMovementColumns } from './data';

interface InventorySourceMovementData {
  sourceBillId: string;
  sourceBillNo: string;
  sourceBillType: ErpInventoryApi.InventorySourceBillType;
}

interface InventoryTraceCodeMovementData {
  traceCode: string;
  traceId: string;
}

type InventoryMovementDrawerData =
  | ErpInventoryApi.InventoryBalance
  | InventorySourceMovementData
  | InventoryTraceCodeMovementData;

const currentData = ref<InventoryMovementDrawerData>();

const title = computed(() => {
  const data = currentData.value;
  if (!data) {
    return `${$t('erp.inventory.movementManageTitle')}：-`;
  }
  if ('sourceBillId' in data) {
    return `${$t('erp.inventory.movementManageTitle')}：${data.sourceBillNo}`;
  }
  if ('traceId' in data) {
    return `${$t('erp.traceCode.movements')}：${data.traceCode}`;
  }
  const skuCode = data.skuCode || '-';
  const productName = data.productName || '-';
  const batchNo = data.batchNo || '-';
  return `${$t('erp.inventory.movementManageTitle')}：${skuCode} / ${productName} / ${batchNo}`;
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useInventoryMovementColumns(),
    height: 420,
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          const data = currentData.value;
          if (!data) {
            return { items: [], total: 0 };
          }
          const params = {
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          };
          if ('sourceBillId' in data) {
            return getInventorySourceMovementsApi(
              data.sourceBillType,
              data.sourceBillId,
              params,
            );
          }
          if ('traceId' in data) {
            return getInventoryTraceCodeMovementsApi(data.traceId, params);
          }
          return getInventoryMovementsApi(data.balanceId, params);
        },
      },
    },
    rowConfig: { keyField: 'movementId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpInventoryApi.InventoryMovement>,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    currentData.value = drawerApi.getData<InventoryMovementDrawerData>();
    await gridApi.query();
  },
});
</script>

<template>
  <Drawer :footer="false" class="w-[1080px]" :title="title">
    <Grid :table-title="$t('erp.inventory.movementList')" />
  </Drawer>
</template>
