<script lang="ts" setup>
import type { ErpPurchaseInboundApi } from '#/api/erp';
import type { PurchaseInboundFormValues } from './data';

import dayjs from 'dayjs';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { createPurchaseInboundApi } from '#/api/erp';
import { $t } from '#/locales';

import { usePurchaseInboundFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();

function encodeFormValues(
  values: Readonly<PurchaseInboundFormValues>,
): ErpPurchaseInboundApi.CreatePurchaseInbound {
  return {
    inboundDate: values.inboundDate,
    items: (values.items || []).map((item) => ({
      batchNo: item.batchNo.trim(),
      expiryDate: item.expiryDate,
      quantity: Number(item.quantity),
      remark: item.remark?.trim() || null,
      skuId: item.skuId,
      unitCost: String(item.unitCost).trim(),
    })),
    remark: values.remark?.trim() || null,
    supplierId: values.supplierId,
    warehouseId: values.warehouseId,
  };
}

function validateItems(items: PurchaseInboundFormValues['items']) {
  const seen = new Map<string, number>();
  for (const [index, item] of (items || []).entries()) {
    const lineNo = index + 1;
    if (!item.skuId) {
      message.error($t('erp.purchaseInbound.skuRequired', [lineNo]));
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

    const unitCost = String(item.unitCost || '').trim();
    if (!/^\d+(\.\d{1,4})?$/.test(unitCost) || Number(unitCost) <= 0) {
      message.error($t('erp.purchaseInbound.unitCostInvalid', [lineNo]));
      return false;
    }
    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
      message.error($t('erp.purchaseInbound.quantityInvalid', [lineNo]));
      return false;
    }

    const key = [
      item.skuId,
      item.batchNo.trim(),
      item.expiryDate,
      unitCost,
    ].join('|');
    const duplicateLineNo = seen.get(key);
    if (duplicateLineNo) {
      message.error(
        $t('erp.purchaseInbound.duplicateItem', [lineNo, duplicateLineNo]),
      );
      return false;
    }
    seen.set(key, lineNo);
  }
  return true;
}

const [Form, formApi] = useVbenForm<PurchaseInboundFormValues>({
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 90,
  },
  handleSubmit: async (values) => {
    await savePurchaseInbound(values);
  },
  schema: usePurchaseInboundFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 gap-x-4 md:grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    await formApi.validateAndSubmit();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    await formApi.reset();
    await formApi.setValues({
      inboundDate: dayjs().format('YYYY-MM-DD'),
      remark: '',
      supplierId: undefined,
      warehouseId: undefined,
    });
  },
});

async function savePurchaseInbound(values: PurchaseInboundFormValues) {
  if (!validateItems(values.items)) return;

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
    <Form />
  </Drawer>
</template>
