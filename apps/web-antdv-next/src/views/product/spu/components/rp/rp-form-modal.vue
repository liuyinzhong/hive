<script lang="ts" setup>
import type { ProductRpApi } from '#/api/product';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createProductRpApi,
  getProductRpDetailApi,
  updateProductRpApi,
} from '#/api/product';
import { $t } from '#/locales';

import { useProductRpFormSchema } from './rp-data';

interface ModalData {
  rpId?: string;
  spuId: string;
}

const emit = defineEmits<{ success: [] }>();

const rpId = ref<string>();
const rowVersion = ref<number>();
const spuId = ref<string>();
const title = computed(() =>
  rpId.value ? $t('product.rp.edit') : $t('product.rp.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useProductRpFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid || !spuId.value) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        expectedRowVersion: rowVersion.value,
        spuId: spuId.value,
      } as ProductRpApi.SaveProductRp;
      await (rpId.value
        ? updateProductRpApi(rpId.value, payload)
        : createProductRpApi(payload));
      message.success($t('product.rp.saveSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = modalApi.getData<ModalData>();
    rpId.value = data.rpId;
    rowVersion.value = undefined;
    spuId.value = data.spuId;
    await formApi.reset();

    let detail: ProductRpApi.ProductRp | undefined;
    if (data.rpId) {
      modalApi.lock();
      try {
        detail = await getProductRpDetailApi(data.rpId);
      } finally {
        modalApi.unlock();
      }
    }

    rowVersion.value = detail?.rowVersion;
    await formApi.setValues({
      status: 1,
      ...detail,
    });
  },
});
</script>

<template>
  <Modal class="w-[680px]" :title="title">
    <Form />
  </Modal>
</template>
