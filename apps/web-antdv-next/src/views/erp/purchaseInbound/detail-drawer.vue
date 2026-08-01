<script lang="ts" setup>
import type { DescriptionsItemType } from '@vben/common-ui';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpPurchaseInboundApi } from '#/api/erp';

import { computed, nextTick, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import { Button, Spin } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPurchaseInboundDetailApi } from '#/api/erp';
import { $t } from '#/locales';

import { inventoryAmountLabel } from '../inventory/data';
import { usePurchaseInboundDetailColumns } from './data';
import MovementDrawerComponent from '../inventory/movement-drawer.vue';

const { hasAccessByCodes } = useAccess();

const detail = ref<ErpPurchaseInboundApi.PurchaseInbound>();
const loading = ref(false);

const basicItems = computed<DescriptionsItemType[]>(() => [
  {
    content: detail.value?.inboundNo || '-',
    label: $t('erp.purchaseInbound.inboundNo'),
  },
  {
    content: detail.value?.inboundDate || '-',
    label: $t('erp.purchaseInbound.inboundDate'),
  },
  {
    content: detail.value?.supplierName || '-',
    label: $t('erp.purchaseInbound.supplier'),
  },
  {
    content: detail.value?.warehouseName || '-',
    label: $t('erp.purchaseInbound.warehouse'),
  },
  {
    content: detail.value?.lineCount ?? '-',
    label: $t('erp.purchaseInbound.lineCount'),
  },
  {
    content: inventoryAmountLabel(detail.value?.totalAmount),
    label: $t('erp.purchaseInbound.totalAmount'),
  },
  {
    content: detail.value?.createDate || '-',
    label: $t('erp.purchaseInbound.createDate'),
  },
  {
    content: detail.value?.remark || '-',
    label: $t('erp.purchaseInbound.remark'),
  },
]);

const [Grid, gridApi] =
  useVbenVxeGrid<ErpPurchaseInboundApi.PurchaseInboundItem>({
    gridOptions: {
      height: 420,
      columns: usePurchaseInboundDetailColumns(),
      pagerConfig: { enabled: false },
      rowConfig: { keyField: 'inboundItemId' },
      showOverflow: true,
      toolbarConfig: { custom: true, zoom: true },
    } as VxeTableGridOptions<ErpPurchaseInboundApi.PurchaseInboundItem>,
  });

const [MovementDrawer, movementDrawerApi] = useVbenDrawer({
  connectedComponent: MovementDrawerComponent,
  destroyOnClose: true,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data =
      drawerApi.getData<
        Pick<ErpPurchaseInboundApi.PurchaseInbound, 'inboundId'>
      >();
    loading.value = true;
    detail.value = undefined;
    await gridApi.grid?.loadData?.([]);
    try {
      detail.value = await getPurchaseInboundDetailApi(data.inboundId);
      await nextTick();
      await gridApi.grid?.loadData?.(detail.value.items || []);
    } finally {
      loading.value = false;
    }
  },
});

function openMovements() {
  if (!detail.value) return;
  movementDrawerApi
    .setData({
      sourceBillId: detail.value.inboundId,
      sourceBillNo: detail.value.inboundNo,
      sourceBillType: 'PURCHASE_INBOUND',
    })
    .open();
}
</script>

<template>
  <Drawer
    :footer="false"
    class="w-[1280px]"
    :title="$t('erp.purchaseInbound.detail')"
  >
    <MovementDrawer />
    <Spin :spinning="loading">
      <template v-if="detail">
        <VbenDescriptions
          bordered
          :column="2"
          :items="basicItems"
          size="small"
        />
        <Grid :table-title="$t('erp.purchaseInbound.items')">
          <template #toolbar-tools>
            <Button
              v-if="hasAccessByCodes(['erp:inventorySourceMovement:list'])"
              @click="openMovements"
            >
              {{ $t('erp.purchaseInbound.viewMovements') }}
            </Button>
          </template>
        </Grid>
      </template>
    </Spin>
  </Drawer>
</template>
