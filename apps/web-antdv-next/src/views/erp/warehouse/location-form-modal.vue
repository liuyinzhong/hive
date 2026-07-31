<script lang="ts" setup>
import type { ErpWarehouseApi } from '#/api/erp';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createWarehouseLocationApi,
  getWarehouseLocationDetailApi,
  updateWarehouseLocationApi,
} from '#/api/erp';
import { $t } from '#/locales';

import { useWarehouseLocationFormSchema } from './data';

interface ModalData {
  location?: ErpWarehouseApi.WarehouseLocation;
  warehouseId: string;
  zoneId: string;
}

const emit = defineEmits<{ success: [] }>();

const locationId = ref<string>();
const rowVersion = ref<number>();
const warehouseId = ref<string>();
const zoneId = ref<string>();
const title = computed(() =>
  locationId.value
    ? $t('erp.warehouseLocation.edit')
    : $t('erp.warehouseLocation.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useWarehouseLocationFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid || !warehouseId.value || !zoneId.value) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        expectedRowVersion: rowVersion.value,
      } as ErpWarehouseApi.SaveWarehouseLocation;
      await (locationId.value
        ? updateWarehouseLocationApi(
            warehouseId.value,
            zoneId.value,
            locationId.value,
            payload,
          )
        : createWarehouseLocationApi(warehouseId.value, zoneId.value, payload));
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
    const location = data.location;
    warehouseId.value = data.warehouseId;
    zoneId.value = data.zoneId;
    locationId.value = location?.locationId;
    rowVersion.value = location?.rowVersion;
    await formApi.reset();

    let detail = location;
    if (data.warehouseId && data.zoneId && location?.locationId) {
      modalApi.lock();
      try {
        detail = await getWarehouseLocationDetailApi(
          data.warehouseId,
          data.zoneId,
          location.locationId,
        );
      } finally {
        modalApi.unlock();
      }
    }

    rowVersion.value = detail?.rowVersion;
    await formApi.setValues({
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
