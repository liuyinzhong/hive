<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpPurchaseInboundApi } from '#/api/erp';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { getPurchaseInboundListApi } from '#/api/erp';
import { $t } from '#/locales';
import { formatVxeTableSorts } from '#/utils';

import {
  usePurchaseInboundColumns,
  usePurchaseInboundSearchSchema,
} from './data';
import DetailDrawerComponent from './detail-drawer.vue';
import MovementDrawerComponent from '../inventory/movement-drawer.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawerComponent,
  destroyOnClose: true,
});

const [MovementDrawer, movementDrawerApi] = useVbenDrawer({
  connectedComponent: MovementDrawerComponent,
  destroyOnClose: true,
});

const [Grid] = useVbenVxeGrid({
  formOptions: {
    schema: usePurchaseInboundSearchSchema(),
    showCollapseButton: false,
    wrapperClass: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  gridOptions: {
    columns: usePurchaseInboundColumns(),
    height: 'auto',
    proxyConfig: {
      sort: true,
      ajax: {
        query: async ({ page, sorts }, formValues: Recordable<unknown>) => {
          return getPurchaseInboundListApi({
            ...formValues,
            page: page.currentPage,
            pageSize: page.pageSize,
            sorts: formatVxeTableSorts(sorts),
          });
        },
      },
    },
    rowConfig: { keyField: 'inboundId' },
    sortConfig: { multiple: true, remote: true },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as VxeTableGridOptions<ErpPurchaseInboundApi.PurchaseInboundListItem>,
});

function openDetail(row: ErpPurchaseInboundApi.PurchaseInboundListItem) {
  detailDrawerApi.setData({ inboundId: row.inboundId }).open();
}

function openMovements(row: ErpPurchaseInboundApi.PurchaseInboundListItem) {
  movementDrawerApi
    .setData({
      sourceBillId: row.inboundId,
      sourceBillNo: row.inboundNo,
      sourceBillType: 'PURCHASE_INBOUND',
    })
    .open();
}
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />
    <MovementDrawer />
    <Grid :table-title="$t('erp.purchaseInbound.list')">
      <template #action="{ row }">
        <VbenTableAction
          :actions="[
            {
              auth: 'erp:purchaseInbound:detail',
              icon: 'lucide:eye',
              text: $t('common.detail'),
              onClick: () => openDetail(row),
            },
            {
              auth: 'erp:inventorySourceMovement:list',
              icon: 'lucide:list',
              text: $t('erp.inventory.movement'),
              onClick: () => openMovements(row),
            },
          ]"
          align="center"
        />
      </template>
    </Grid>
  </Page>
</template>
