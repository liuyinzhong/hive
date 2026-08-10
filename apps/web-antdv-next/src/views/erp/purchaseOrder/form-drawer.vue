<script lang="ts" setup>
import type { ErpPurchaseOrderApi } from '#/api/erp';
import type { PurchaseOrderFormValues } from './data';

import { computed, ref } from 'vue';

import dayjs from 'dayjs';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createPurchaseOrderApi,
  getPurchaseOrderDetailApi,
  updatePurchaseOrderApi,
} from '#/api/erp';
import { $t } from '#/locales';

import { usePurchaseOrderFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();
const purchaseOrderId = ref<string>();
const editing = computed(() => Boolean(purchaseOrderId.value));

function encodeFormValues(
  values: Readonly<PurchaseOrderFormValues>,
): ErpPurchaseOrderApi.SavePurchaseOrder {
  return {
    expectedArrivalDate: values.expectedArrivalDate || null,
    expectedRowVersion: values.expectedRowVersion,
    items: (values.items || []).map((item) => ({
      orderedQuantity: Number(item.orderedQuantity),
      remark: item.remark?.trim() || null,
      skuId: item.skuId,
      unitPrice: String(item.unitPrice).trim(),
    })),
    orderDate: values.orderDate,
    remark: values.remark?.trim() || null,
    supplierId: values.supplierId,
    warehouseId: values.warehouseId,
  };
}

function validateItems(items: PurchaseOrderFormValues['items']) {
  const seen = new Map<string, number>();
  for (const [index, item] of (items || []).entries()) {
    const lineNo = index + 1;
    if (!item.skuId) {
      message.error($t('erp.purchaseOrder.skuRequired', [lineNo]));
      return false;
    }
    const duplicateLineNo = seen.get(item.skuId);
    if (duplicateLineNo) {
      message.error(
        $t('erp.purchaseOrder.duplicateSku', [lineNo, duplicateLineNo]),
      );
      return false;
    }
    seen.set(item.skuId, lineNo);
    if (
      !Number.isInteger(Number(item.orderedQuantity)) ||
      Number(item.orderedQuantity) < 1
    ) {
      message.error($t('erp.purchaseOrder.quantityInvalid', [lineNo]));
      return false;
    }
    const price = String(item.unitPrice || '').trim();
    if (!/^\d+(\.\d{1,4})?$/.test(price) || Number(price) <= 0) {
      message.error($t('erp.purchaseOrder.unitPriceInvalid', [lineNo]));
      return false;
    }
  }
  return true;
}

const [Form, formApi] = useVbenForm<PurchaseOrderFormValues>({
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 100,
  },
  handleSubmit: async (values) => save(values),
  schema: usePurchaseOrderFormSchema(),
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
    const data = drawerApi.getData<{ purchaseOrderId?: string }>();
    purchaseOrderId.value = data.purchaseOrderId;
    await formApi.reset();
    if (!data.purchaseOrderId) {
      await formApi.setValues({
        expectedArrivalDate: undefined,
        orderDate: dayjs().format('YYYY-MM-DD'),
        remark: '',
        supplierId: undefined,
        warehouseId: undefined,
      });
      return;
    }
    drawerApi.lock();
    try {
      const detail = await getPurchaseOrderDetailApi(data.purchaseOrderId);
      await formApi.setValues({
        expectedArrivalDate: detail.expectedArrivalDate || undefined,
        expectedRowVersion: detail.rowVersion,
        items: detail.items.map((item) => ({
          orderedQuantity: item.orderedQuantity,
          packageUnitName: item.packageUnitName,
          remark: item.remark || '',
          skuId: item.skuId,
          unitPrice: item.unitPrice,
        })),
        orderDate: detail.orderDate,
        remark: detail.remark || '',
        supplierId: detail.supplierId,
        warehouseId: detail.warehouseId,
      });
    } finally {
      drawerApi.unlock();
    }
  },
});

async function save(values: PurchaseOrderFormValues) {
  if (!validateItems(values.items)) return;
  drawerApi.lock();
  try {
    const result = purchaseOrderId.value
      ? await updatePurchaseOrderApi(
          purchaseOrderId.value,
          encodeFormValues(values),
        )
      : await createPurchaseOrderApi(encodeFormValues(values));
    message.success(
      $t('erp.purchaseOrder.saveSuccess', [result.purchaseOrderNo]),
    );
    drawerApi.close();
    emit('success');
  } finally {
    drawerApi.unlock();
  }
}
</script>

<template>
  <Drawer
    class="w-[1220px]"
    :title="
      editing
        ? $t('erp.purchaseOrder.edit')
        : $t('erp.purchaseOrder.create')
    "
  >
    <Alert
      class="mb-4"
      show-icon
      :message="$t('erp.purchaseOrder.draftTip')"
      type="info"
    />
    <Form />
  </Drawer>
</template>
