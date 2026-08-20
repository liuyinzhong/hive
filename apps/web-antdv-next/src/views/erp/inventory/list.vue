<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpInventoryApi } from '#/api/erp';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Download, Plus } from '@vben/icons';

import { Button, message } from 'antdv-next';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  createInventoryBalanceExportApi,
  getInventoryBalanceListApi,
} from '#/api/erp';
import { $t } from '#/locales';
import { formatSorts } from '#/utils/vxe-table';

import {
  useInventoryBalanceColumns,
  useInventoryBalanceSearchSchema,
} from './data';
import InitialStockModalComponent from './initial-stock-modal.vue';
import MovementDrawerComponent from './movement-drawer.vue';

const { hasAccessByCodes } = useAccess();
let currentSorts = '';

const [InitialStockModal, initialStockModalApi] = useVbenModal({
  connectedComponent: InitialStockModalComponent,
  destroyOnClose: true,
});

const [MovementDrawer, movementDrawerApi] = useVbenDrawer({
  connectedComponent: MovementDrawerComponent,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useInventoryBalanceSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: useInventoryBalanceColumns(),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          currentSorts = formatSorts(sorts);
          return getInventoryBalanceListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: currentSorts,
          });
        },
      },
    },
    rowConfig: { keyField: 'balanceId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpInventoryApi.InventoryBalance>,
});

function openInitialStock() {
  initialStockModalApi.setData({}).open();
}

function openMovements(row: ErpInventoryApi.InventoryBalance) {
  movementDrawerApi.setData(row).open();
}

async function createExport() {
  const formValues =
    (await gridApi.formApi.getValues()) as ErpInventoryApi.InventoryBalanceExportRequest;
  await createInventoryBalanceExportApi({
    ...formValues,
    sorts: currentSorts,
  });
  message.success($t('erp.inventory.exportCreated'));
}
</script>

<template>
  <Page auto-content-height>
    <InitialStockModal @success="gridApi.query()" />
    <MovementDrawer />
    <Grid :table-title="$t('erp.inventory.balanceList')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['erp:inventoryBalance:export'])"
          @click="createExport"
        >
          <Download class="size-5" />
          {{ $t('erp.inventory.export') }}
        </Button>
        <Button
          v-if="hasAccessByCodes(['erp:inventoryInitial:create'])"
          type="primary"
          @click="openInitialStock"
        >
          <Plus class="size-5" />
          {{ $t('erp.inventory.initialStock') }}
        </Button>
      </template>
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'erp:inventoryMovement:list',
              icon: 'lucide:list',
              text: `${$t('erp.inventory.movement')}(${row.movementCount || 0})`,
              onClick: () => openMovements(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
