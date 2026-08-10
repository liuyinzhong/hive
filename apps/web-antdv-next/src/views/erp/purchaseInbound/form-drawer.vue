<script lang="ts" setup>
import type { DescriptionsItemType } from '@vben/common-ui';
import type { ErpPurchaseInboundApi, ErpPurchaseOrderApi } from '#/api/erp';
import type { PurchaseInboundFormValues } from './data';

import { computed, ref } from 'vue';

import dayjs from 'dayjs';

import { useVbenDrawer, VbenDescriptions } from '@vben/common-ui';

import { Alert, message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createPurchaseInboundApi,
  getPurchaseOrderDetailApi,
} from '#/api/erp';
import { $t } from '#/locales';

import {
  setPurchaseInboundOrderItems,
  usePurchaseInboundFormSchema,
} from './data';

const emit = defineEmits<{ success: [] }>();
const purchaseOrder = ref<ErpPurchaseOrderApi.PurchaseOrder>();

const orderItems = computed<DescriptionsItemType[]>(() => [
  {
    content: purchaseOrder.value?.purchaseOrderNo || '-',
    label: $t('erp.purchaseOrder.purchaseOrderNo'),
  },
  {
    content: purchaseOrder.value?.supplierName || '-',
    label: $t('erp.purchaseInbound.supplier'),
  },
  {
    content: purchaseOrder.value?.warehouseName || '-',
    label: $t('erp.purchaseInbound.warehouse'),
  },
]);

function encodeFormValues(
  values: Readonly<PurchaseInboundFormValues>,
): ErpPurchaseInboundApi.CreatePurchaseInbound {
  return {
    inboundDate: values.inboundDate,
    items: (values.items || []).map((item) => ({
      batchNo: item.batchNo.trim(),
      expiryDate: item.expiryDate,
      purchaseOrderItemId: item.purchaseOrderItemId,
      quantity:
        item.traceMode === 'REQUIRED'
          ? item.traceCodes?.length || 0
          : Number(item.quantity),
      remark: item.remark?.trim() || null,
      traceCodes: item.traceCodes || [],
    })),
    purchaseOrderId: purchaseOrder.value?.purchaseOrderId || '',
    remark: values.remark?.trim() || null,
  };
}

function validateItems(items: PurchaseInboundFormValues['items']) {
  const duplicateKeys = new Map<string, number>();
  const seenTraceCodes = new Map<string, number>();
  const quantityByOrderItem = new Map<string, number>();
  const remainingByOrderItem = new Map<string, number>();
  for (const [index, item] of (items || []).entries()) {
    const lineNo = index + 1;
    if (!item.purchaseOrderItemId) {
      message.error($t('erp.purchaseInbound.purchaseOrderItemRequired', [lineNo]));
      return false;
    }
    if (!item.batchNo?.trim()) {
      message.error($t('erp.purchaseInbound.batchNoRequired', [lineNo]));
      return false;
    }
    if (!item.expiryDate) {
      message.error($t('erp.purchaseInbound.expiryDateRequired', [lineNo]));
      return false;
    }
    const quantity =
      item.traceMode === 'REQUIRED'
        ? item.traceCodes?.length || 0
        : Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      message.error($t('erp.purchaseInbound.quantityInvalid', [lineNo]));
      return false;
    }
    if (item.traceMode === 'REQUIRED' && quantity < 1) {
      message.error($t('erp.inventory.traceCodesRequired', [lineNo]));
      return false;
    }
    for (const traceCode of item.traceCodes || []) {
      const duplicateLineNo = seenTraceCodes.get(traceCode);
      if (duplicateLineNo) {
        message.error(
          $t('erp.inventory.duplicateTraceCodeAcrossLines', [
            traceCode,
            lineNo,
            duplicateLineNo,
          ]),
        );
        return false;
      }
      seenTraceCodes.set(traceCode, lineNo);
    }
    const duplicateKey = [
      item.purchaseOrderItemId,
      item.batchNo.trim(),
      item.expiryDate,
    ].join('|');
    const duplicateLineNo = duplicateKeys.get(duplicateKey);
    if (duplicateLineNo) {
      message.error(
        $t('erp.purchaseInbound.duplicateItem', [lineNo, duplicateLineNo]),
      );
      return false;
    }
    duplicateKeys.set(duplicateKey, lineNo);
    quantityByOrderItem.set(
      item.purchaseOrderItemId,
      (quantityByOrderItem.get(item.purchaseOrderItemId) || 0) + quantity,
    );
    remainingByOrderItem.set(
      item.purchaseOrderItemId,
      Number(item.remainingQuantity || 0),
    );
  }
  for (const [orderItemId, quantity] of quantityByOrderItem.entries()) {
    const remaining = remainingByOrderItem.get(orderItemId) || 0;
    if (quantity > remaining) {
      message.error(
        $t('erp.purchaseInbound.exceedsRemaining', [quantity, remaining]),
      );
      return false;
    }
  }
  return true;
}

const [Form, formApi] = useVbenForm<PurchaseInboundFormValues>({
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 100,
  },
  handleSubmit: async (values) => savePurchaseInbound(values),
  schema: usePurchaseInboundFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 gap-x-4 md:grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) await formApi.validateAndSubmit();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const { purchaseOrderId } = drawerApi.getData<{
      purchaseOrderId: string;
    }>();
    drawerApi.lock();
    purchaseOrder.value = undefined;
    try {
      const detail = await getPurchaseOrderDetailApi(purchaseOrderId);
      purchaseOrder.value = detail;
      setPurchaseInboundOrderItems(detail.items);
      formApi.setState({ schema: usePurchaseInboundFormSchema() });
      await formApi.reset();
      await formApi.setValues({
        inboundDate: dayjs().format('YYYY-MM-DD'),
        purchaseOrderId,
        remark: '',
      });
    } finally {
      drawerApi.unlock();
    }
  },
});

async function savePurchaseInbound(values: PurchaseInboundFormValues) {
  if (!purchaseOrder.value || !validateItems(values.items)) return;
  drawerApi.lock();
  try {
    const result = await createPurchaseInboundApi(encodeFormValues(values));
    message.success(
      $t('erp.purchaseInbound.createSuccess', [result.inboundNo]),
    );
    drawerApi.close();
    emit('success');
  } finally {
    drawerApi.unlock();
  }
}
</script>

<template>
  <Drawer class="w-[1220px]" :title="$t('erp.purchaseInbound.create')">
    <Alert
      class="mb-4"
      show-icon
      :message="$t('erp.purchaseInbound.createTip')"
      type="info"
    />
    <VbenDescriptions
      v-if="purchaseOrder"
      class="mb-4"
      bordered
      :column="3"
      :items="orderItems"
      size="small"
    />
    <Form />
  </Drawer>
</template>
