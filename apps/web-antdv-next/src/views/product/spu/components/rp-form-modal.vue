<script lang="ts" setup>
import type { ProductRpApi, ProductSpuApi } from '#/api/product';

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
  rp?: ProductRpApi.ProductRp;
  spu: ProductSpuApi.ProductSpu;
}

const emit = defineEmits<{ success: [] }>();

const currentSpu = ref<ProductSpuApi.ProductSpu>();
const rpId = ref<string>();
const rowVersion = ref<number>();
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
    if (!valid || !currentSpu.value) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        expectedRowVersion: rowVersion.value,
        spuId: currentSpu.value.spuId,
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
    currentSpu.value = data.spu;
    rpId.value = data.rp?.rpId;
    rowVersion.value = data.rp?.rowVersion;
    await formApi.reset();

    let detail = data.rp;
    if (data.rp?.rpId) {
      modalApi.lock();
      try {
        detail = await getProductRpDetailApi(data.rp.rpId);
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
