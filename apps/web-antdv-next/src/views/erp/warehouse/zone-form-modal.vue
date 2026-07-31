<script lang="ts" setup>
import type { ErpWarehouseApi } from '#/api/erp';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createWarehouseZoneApi,
  getWarehouseZoneDetailApi,
  updateWarehouseZoneApi,
} from '#/api/erp';
import { $t } from '#/locales';

import { useWarehouseZoneFormSchema } from './data';

interface ModalData {
  warehouseId: string;
  zone?: ErpWarehouseApi.WarehouseZone;
}

const emit = defineEmits<{ success: [] }>();

const rowVersion = ref<number>();
const warehouseId = ref<string>();
const zoneId = ref<string>();
const title = computed(() =>
  zoneId.value ? $t('erp.warehouseZone.edit') : $t('erp.warehouseZone.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useWarehouseZoneFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid || !warehouseId.value) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        expectedRowVersion: rowVersion.value,
      } as ErpWarehouseApi.SaveWarehouseZone;
      await (zoneId.value
        ? updateWarehouseZoneApi(warehouseId.value, zoneId.value, payload)
        : createWarehouseZoneApi(warehouseId.value, payload));
      message.success($t('erp.warehouse.saveSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = modalApi.getData<ModalData>();
    const zone = data.zone;
    warehouseId.value = data.warehouseId;
    zoneId.value = zone?.zoneId;
    rowVersion.value = zone?.rowVersion;
    await formApi.reset();

    let detail = zone;
    if (data.warehouseId && zone?.zoneId) {
      modalApi.lock();
      try {
        detail = await getWarehouseZoneDetailApi(
          data.warehouseId,
          zone.zoneId,
        );
      } finally {
        modalApi.unlock();
      }
    }

    rowVersion.value = detail?.rowVersion;
    await formApi.setValues({
      zoneType: 'NORMAL',
      ...detail,
      remark: detail?.remark || undefined,
    });
  },
});
</script>

<template>
  <Modal class="w-[720px]" :title="title">
    <Form />
  </Modal>
</template>
