<script lang="ts" setup>
import type { ProductMpApi, ProductRpApi } from '#/api/product';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createProductMpApi,
  getProductMpDetailApi,
  updateProductMpApi,
} from '#/api/product';
import { $t } from '#/locales';

import { useProductMpFormSchema } from './mp-data';

interface ModalData {
  mp?: ProductMpApi.ProductMp;
  rp: ProductRpApi.ProductRp;
}

const emit = defineEmits<{ success: [] }>();

const currentRp = ref<ProductRpApi.ProductRp>();
const mpId = ref<string>();
const enterpriseId = ref<string>();
const rowVersion = ref<number>();
const title = computed(() =>
  mpId.value ? $t('product.mp.edit') : $t('product.mp.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useProductMpFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid || !currentRp.value) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        enterpriseId: enterpriseId.value || values.enterpriseId,
        expectedRowVersion: rowVersion.value,
        rpId: currentRp.value.rpId,
      } as ProductMpApi.SaveProductMp;
      await (mpId.value
        ? updateProductMpApi(mpId.value, payload)
        : createProductMpApi(payload));
      message.success($t('product.mp.saveSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = modalApi.getData<ModalData>();
    currentRp.value = data.rp;
    mpId.value = data.mp?.mpId;
    enterpriseId.value = data.mp?.enterpriseId;
    rowVersion.value = data.mp?.rowVersion;
    await formApi.reset();

    let detail = data.mp;
    if (data.mp?.mpId) {
      modalApi.lock();
      try {
        detail = await getProductMpDetailApi(data.mp.mpId);
      } finally {
        modalApi.unlock();
      }
    }

    enterpriseId.value = detail?.enterpriseId;
    rowVersion.value = detail?.rowVersion;
    await formApi.setValues({
      status: 1,
      ...detail,
      enterpriseDisplay: detail
        ? `${detail.enterpriseName}（${detail.enterpriseCode}）`
        : undefined,
    });
  },
});
</script>

<template>
  <Modal class="w-[720px]" :title="title">
    <Form />
  </Modal>
</template>
