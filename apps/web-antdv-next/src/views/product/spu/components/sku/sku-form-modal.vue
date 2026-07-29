<script lang="ts" setup>
import type { ProductSkuApi } from '#/api/product';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createProductSkuApi,
  getProductSkuDetailApi,
  updateProductSkuApi,
} from '#/api/product';
import { $t } from '#/locales';

import { useProductSkuFormSchema } from './sku-data';

interface ModalData {
  mpId: string;
  skuId?: string;
}

const emit = defineEmits<{ success: [] }>();

const mpId = ref<string>();
const rowVersion = ref<number>();
const skuId = ref<string>();
const title = computed(() =>
  skuId.value ? $t('product.sku.edit') : $t('product.sku.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useProductSkuFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    await fillDefaultPackageSpecName();

    const { valid } = await formApi.validate();
    if (!valid || !mpId.value) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        expectedRowVersion: rowVersion.value,
        mpId: mpId.value,
      } as ProductSkuApi.SaveProductSku;
      await (skuId.value
        ? updateProductSkuApi(skuId.value, payload)
        : createProductSkuApi(payload));
      message.success($t('product.sku.saveSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = modalApi.getData<ModalData>();
    mpId.value = data.mpId;
    skuId.value = data.skuId;
    rowVersion.value = undefined;
    await formApi.reset();

    let detail: ProductSkuApi.ProductSku | undefined;
    if (data.skuId) {
      modalApi.lock();
      try {
        detail = await getProductSkuDetailApi(data.skuId);
      } finally {
        modalApi.unlock();
      }
    }

    rowVersion.value = detail?.rowVersion;
    await formApi.setValues({
      allowSplit: 0,
      status: 1,
      ...detail,
    });
  },
});

async function fillDefaultPackageSpecName() {
  if (skuId.value) return;

  const values = await formApi.getValues();
  if (String(values.packageSpecName || '').trim()) return;

  const packageQuantity = values.packageQuantity;
  const minUnitName = String(values.minUnitName || '').trim();
  const packageUnitName = String(values.packageUnitName || '').trim();
  if (!packageQuantity || !minUnitName || !packageUnitName) return;

  await formApi.setFieldValue(
    'packageSpecName',
    `${packageQuantity}${minUnitName}/${packageUnitName}`,
  );
}
</script>

<template>
  <Modal class="w-[760px]" :title="title">
    <Form />
  </Modal>
</template>
