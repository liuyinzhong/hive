<script lang="ts" setup>
import type { DescriptionsItemType } from '@vben/common-ui';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpPurchaseInboundApi } from '#/api/erp';

import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import { Button, Flex, Spin } from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPurchaseInboundDetailApi } from '#/api/erp';
import { $t } from '#/locales';

import { inventoryAmountLabel } from '../inventory/data';
import { usePurchaseInboundDetailColumns } from './data';

const detail = ref<ErpPurchaseInboundApi.PurchaseInbound>();
const loading = ref(false);
const router = useRouter();
const { hasAccessByCodes } = useAccess();

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
    content: detail.value?.purchaseOrderNo || '-',
    label: $t('erp.purchaseOrder.purchaseOrderNo'),
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

function openPrintPreview() {
  if (!detail.value?.inboundId) return;
  router.push({
    path: '/print/preview',
    query: { inboundId: detail.value.inboundId },
  });
}
</script>

<template>
  <Drawer
    :footer="false"
    class="w-[1280px]"
    :title="$t('erp.purchaseInbound.detail')"
  >
    <Spin :spinning="loading">
      <template v-if="detail">
        <Flex class="mb-3" justify="end">
          <Button
            v-if="hasAccessByCodes(['print:purchaseInbound:print'])"
            type="primary"
            @click="openPrintPreview"
          >
            {{ $t('print.actions.print') }}
          </Button>
        </Flex>
        <VbenDescriptions
          bordered
          :column="2"
          :items="basicItems"
          size="small"
        />
        <Grid :table-title="$t('erp.purchaseInbound.items')" />
      </template>
    </Spin>
  </Drawer>
</template>
