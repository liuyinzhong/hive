<script lang="ts" setup>
import type { ProductMpApi } from '#/api/product';

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
  mpId?: string;
  rpId: string;
}

const emit = defineEmits<{ success: [] }>();

const mpId = ref<string>();
const enterpriseId = ref<string>();
const rowVersion = ref<number>();
const rpId = ref<string>();
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
    if (!valid || !rpId.value) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        enterpriseId: enterpriseId.value || values.enterpriseId,
        expectedRowVersion: rowVersion.value,
        rpId: rpId.value,
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
    enterpriseId.value = undefined;
    mpId.value = data.mpId;
    rowVersion.value = undefined;
    rpId.value = data.rpId;
    await formApi.reset();

    let detail: ProductMpApi.ProductMp | undefined;
    if (data.mpId) {
      modalApi.lock();
      try {
        detail = await getProductMpDetailApi(data.mpId);
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
