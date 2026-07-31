<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpInventoryApi } from '#/api/erp';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getInventoryMovementsApi } from '#/api/erp';
import { $t } from '#/locales';
import { formatSorts } from '#/utils';

import { useInventoryMovementColumns } from './data';

const currentBalance = ref<ErpInventoryApi.InventoryBalance>();

const title = computed(() => {
  const skuCode = currentBalance.value?.skuCode || '-';
  const productName = currentBalance.value?.productName || '-';
  const batchNo = currentBalance.value?.batchNo || '-';
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
          if (!currentBalance.value?.balanceId) {
            return { items: [], total: 0 };
          }
          return getInventoryMovementsApi(currentBalance.value.balanceId, {
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatSorts(sorts),
          });
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
    currentBalance.value = drawerApi.getData<ErpInventoryApi.InventoryBalance>();
    await gridApi.query();
  },
});
</script>

<template>
  <Drawer :footer="false" class="w-[1080px]" :title="title">
    <Grid :table-title="$t('erp.inventory.movementList')" />
  </Drawer>
</template>
