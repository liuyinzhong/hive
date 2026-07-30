<script lang="ts" setup>
import type { ErpWarehouseApi } from '#/api/erp';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createWarehouseApi,
  getWarehouseDetailApi,
  updateWarehouseApi,
} from '#/api/erp';
import { $t } from '#/locales';

import { useWarehouseFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();

const rowVersion = ref<number>();
const warehouseId = ref<string>();
const title = computed(() =>
  warehouseId.value
    ? $t('erp.warehouse.edit')
    : $t('erp.warehouse.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useWarehouseFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        expectedRowVersion: rowVersion.value,
      } as ErpWarehouseApi.SaveWarehouse;
      await (warehouseId.value
        ? updateWarehouseApi(warehouseId.value, payload)
        : createWarehouseApi(payload));
      message.success($t('erp.warehouse.saveSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = modalApi.getData<Partial<ErpWarehouseApi.Warehouse>>() ?? {};
    warehouseId.value = data.warehouseId;
    rowVersion.value = data.rowVersion;
    await formApi.reset();

    let detail = data;
    if (data.warehouseId) {
      modalApi.lock();
      try {
        detail = await getWarehouseDetailApi(data.warehouseId);
      } finally {
        modalApi.unlock();
      }
    }

    rowVersion.value = detail.rowVersion;
    await formApi.setValues({
      businessScope: 'COMPREHENSIVE',
      status: 1,
      storageType: 'NORMAL',
      ...detail,
    });
  },
});
</script>

<template>
  <Modal class="w-[760px]" :title="title">
    <Form />
  </Modal>
</template>
