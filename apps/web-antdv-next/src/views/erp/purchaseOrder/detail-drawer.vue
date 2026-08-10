<script lang="ts" setup>
import type { DescriptionsItemType } from '@vben/common-ui';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ErpPurchaseOrderApi } from '#/api/erp';

import { computed, nextTick, ref } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import {
  Divider,
  Empty,
  Spin,
  Tag,
  Timeline,
  TimelineItem,
} from 'antdv-next';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getPurchaseOrderDetailApi,
  getPurchaseOrderLogsApi,
} from '#/api/erp';
import { $t } from '#/locales';

import { inventoryAmountLabel } from '../inventory/data';
import {
  purchaseOrderLogActionLabel,
  purchaseOrderStatusColor,
  purchaseOrderStatusLabel,
} from './constants';
import { usePurchaseOrderDetailColumns } from './data';

const detail = ref<ErpPurchaseOrderApi.PurchaseOrder>();
const logs = ref<ErpPurchaseOrderApi.PurchaseOrderLog[]>([]);
const loading = ref(false);
const { hasAccessByCodes } = useAccess();
const canViewLogs = computed(() =>
  hasAccessByCodes(['erp:purchaseOrder:logs']),
);

const basicItems = computed<DescriptionsItemType[]>(() => [
  {
    content: detail.value?.purchaseOrderNo || '-',
    label: $t('erp.purchaseOrder.purchaseOrderNo'),
  },
  {
    content: detail.value?.orderDate || '-',
    label: $t('erp.purchaseOrder.orderDate'),
  },
  {
    content: detail.value?.expectedArrivalDate || '-',
    label: $t('erp.purchaseOrder.expectedArrivalDate'),
  },
  {
    content: detail.value?.supplierName || '-',
    label: $t('erp.purchaseOrder.supplier'),
  },
  {
    content: detail.value?.warehouseName || '-',
    label: $t('erp.purchaseOrder.warehouse'),
  },
  {
    content: inventoryAmountLabel(detail.value?.totalAmount),
    label: $t('erp.purchaseOrder.totalAmount'),
  },
  {
    content: detail.value?.confirmedAt || '-',
    label: $t('erp.purchaseOrder.confirmedAt'),
  },
  {
    content: detail.value?.createDate || '-',
    label: $t('erp.purchaseOrder.createDate'),
  },
  {
    content: detail.value?.remark || '-',
    label: $t('erp.purchaseOrder.remark'),
  },
]);

const [Grid, gridApi] =
  useVbenVxeGrid<ErpPurchaseOrderApi.PurchaseOrderItem>({
    gridOptions: {
      columns: usePurchaseOrderDetailColumns(),
      height: 380,
      pagerConfig: { enabled: false },
      rowConfig: { keyField: 'purchaseOrderItemId' },
      showOverflow: true,
      toolbarConfig: { custom: true, zoom: true },
    } as VxeTableGridOptions<ErpPurchaseOrderApi.PurchaseOrderItem>,
  });

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const { purchaseOrderId } = drawerApi.getData<{
      purchaseOrderId: string;
    }>();
    loading.value = true;
    detail.value = undefined;
    logs.value = [];
    await gridApi.grid?.loadData?.([]);
    try {
      const [order, logRows] = await Promise.all([
        getPurchaseOrderDetailApi(purchaseOrderId),
        canViewLogs.value
          ? getPurchaseOrderLogsApi(purchaseOrderId)
          : Promise.resolve([]),
      ]);
      detail.value = order;
      logs.value = logRows;
      await nextTick();
      await gridApi.grid?.loadData?.(order.items || []);
    } finally {
      loading.value = false;
    }
  },
});
</script>

<template>
  <Drawer
    :footer="false"
    class="w-[1280px]"
    :title="$t('erp.purchaseOrder.detail')"
  >
    <Spin :spinning="loading">
      <template v-if="detail">
        <div class="mb-3 flex items-center gap-2">
          <span>{{ $t('erp.purchaseOrder.currentStatus') }}</span>
          <Tag :color="purchaseOrderStatusColor(detail.status)">
            {{ purchaseOrderStatusLabel(detail.status) }}
          </Tag>
        </div>
        <VbenDescriptions
          bordered
          :column="2"
          :items="basicItems"
          size="small"
        />
        <Grid :table-title="$t('erp.purchaseOrder.items')" />

        <template v-if="canViewLogs">
          <Divider>{{ $t('erp.purchaseOrder.logs') }}</Divider>
          <Empty v-if="logs.length === 0" />
          <Timeline v-else>
            <TimelineItem
              v-for="record in logs"
              :key="record.purchaseOrderLogId"
              :color="
                record.toStatus
                  ? purchaseOrderStatusColor(record.toStatus)
                  : 'blue'
              "
            >
              <div class="font-medium">
                {{ purchaseOrderLogActionLabel(record.actionType) }}
                <template v-if="record.fromStatus && record.toStatus">
                  · {{ purchaseOrderStatusLabel(record.fromStatus) }} →
                  {{ purchaseOrderStatusLabel(record.toStatus) }}
                </template>
              </div>
              <div>{{ record.summary }}</div>
              <div v-if="record.relatedInboundNo">
                {{ $t('erp.purchaseOrder.relatedInboundNo') }}：{{
                  record.relatedInboundNo
                }}
              </div>
              <div v-if="record.reason">
                {{ $t('erp.purchaseOrder.reason') }}：{{ record.reason }}
              </div>
              <div class="text-muted-foreground">
                {{ record.operatedAt }} ·
                {{ record.operatorName || record.operatorId || '-' }}
              </div>
            </TimelineItem>
          </Timeline>
        </template>
      </template>
    </Spin>
  </Drawer>
</template>
