<script lang="ts" setup>
import type { ErpInventoryApi } from '#/api/erp';
import type { InventoryInitialStockFormValues } from './data';

import { useVbenModal } from '@vben/common-ui';

import { Alert, message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { createInventoryInitialStocksApi } from '#/api/erp';
import { $t } from '#/locales';

import { useInventoryInitialStockFormSchema } from './data';

function encodeInitialStockFormValues(
  values: Readonly<InventoryInitialStockFormValues>,
): InventoryInitialStockFormValues {
  return {
    ...values,
    items: (values.items || []).map((item) => {
      const remark = item.remark?.trim();
      return {
        batchNo: item.batchNo.trim(),
        expiryDate: item.expiryDate,
        packageUnitName: item.packageUnitName,
        quantity: Number(item.quantity),
        remark: remark || undefined,
        skuId: item.skuId,
        unitCost: String(item.unitCost).trim(),
      };
    }),
  };
}

function decodeInitialStockFormValues(
  values: Readonly<InventoryInitialStockFormValues>,
): InventoryInitialStockFormValues {
  return {
    ...values,
    items: (values.items || []).map((item) => ({
      ...item,
      remark: item.remark ?? '',
    })),
  };
}

const emit = defineEmits<{ success: [] }>();

const [Form, formApi] = useVbenForm<InventoryInitialStockFormValues>({
  codec: {
    decode: decodeInitialStockFormValues,
    encode: encodeInitialStockFormValues,
  },
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 90,
  },
  handleSubmit: async (values) => {
    await saveInitialStocks(values);
  },
  schema: useInventoryInitialStockFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 gap-x-4 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    await formApi.validateAndSubmit();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    await formApi.reset();
  },
});

function validateInitialStockItems(
  items: InventoryInitialStockFormValues['items'],
) {
  const seen = new Set<string>();
  for (const item of items || []) {
    if (!item.skuId) {
      message.error($t('erp.inventory.skuRequired'));
      return false;
    }
    if (!item.batchNo?.trim()) {
      message.error($t('erp.inventory.batchNoRequired'));
      return false;
    }
    if (!item.expiryDate) {
      message.error($t('erp.inventory.expiryDateRequired'));
      return false;
    }
    const unitCost = String(item.unitCost || '').trim();
    if (!/^\d+(\.\d{1,4})?$/.test(unitCost) || Number(unitCost) <= 0) {
      message.error($t('erp.inventory.unitCostInvalid'));
      return false;
    }
    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
      message.error($t('erp.inventory.quantityInvalid'));
      return false;
    }

    const key = [
      item.skuId,
      item.batchNo.trim(),
      item.expiryDate,
      unitCost,
    ].join('|');
    if (seen.has(key)) {
      message.error($t('erp.inventory.duplicateInitialStockItem'));
      return false;
    }
    seen.add(key);
  }
  return true;
}

async function saveInitialStocks(values: InventoryInitialStockFormValues) {
  if (!validateInitialStockItems(values.items)) return;

  modalApi.lock();
  try {
    const payload: ErpInventoryApi.CreateInitialStocks = {
      warehouseId: values.warehouseId,
      items: values.items.map((item) => {
        const remark = item.remark?.trim();
        return {
          batchNo: item.batchNo.trim(),
          expiryDate: item.expiryDate,
          quantity: Number(item.quantity),
          remark: remark || null,
          skuId: item.skuId,
          unitCost: String(item.unitCost).trim(),
        };
      }),
    };
    const result = await createInventoryInitialStocksApi(payload);
    message.success(
      $t('erp.inventory.initialStockSuccess', [
        result.sourceBillNo,
        result.movementCount,
      ]),
    );
    modalApi.close();
    emit('success');
  } finally {
    modalApi.unlock();
  }
}
</script>

<template>
  <Modal class="w-[1080px]" :title="$t('erp.inventory.initialStock')">
    <Alert
      class="mb-4"
      show-icon
      :message="$t('erp.inventory.initialStockTip')"
      type="info"
    />
    <Form />
  </Modal>
</template>
