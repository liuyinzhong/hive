<script lang="ts" setup>
import type { ProductSkuApi } from '#/api/product';

import { computed, nextTick, ref } from 'vue';

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

function toPositiveInteger(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return undefined;
  }
  return Math.trunc(numberValue);
}

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildSkuSpecPreview(values: Record<string, unknown>) {
  const packConversion = toPositiveInteger(values.packConversion);
  const cartonConversion = toPositiveInteger(values.cartonConversion);
  const minUnitName = toTrimmedString(values.minUnitName);
  const packageUnitName = toTrimmedString(values.packageUnitName);
  const cartonUnitName = toTrimmedString(values.cartonUnitName);

  const packageSpecName =
    packConversion && minUnitName && packageUnitName
      ? `${packConversion}${minUnitName}/${packageUnitName}`
      : '';
  const cartonSpecName =
    cartonConversion && packageUnitName && cartonUnitName
      ? `${cartonConversion}${packageUnitName}/${cartonUnitName}`
      : '';
  const fullChainSpecName =
    cartonConversion &&
    cartonUnitName &&
    packageUnitName &&
    packConversion &&
    minUnitName
      ? `1${cartonUnitName}/${cartonConversion}${packageUnitName}/${cartonConversion * packConversion}${minUnitName}`
      : '';

  return {
    cartonSpecName,
    fullChainSpecName,
    packageSpecName,
  };
}

async function refreshSpecPreview() {
  await nextTick();
  const values = await formApi.getValues();
  const preview = buildSkuSpecPreview(values);

  await Promise.all([
    formApi.setFieldValue('packageSpecName', preview.packageSpecName, false),
    formApi.setFieldValue('cartonSpecName', preview.cartonSpecName, false),
    formApi.setFieldValue(
      'fullChainSpecName',
      preview.fullChainSpecName,
      false,
    ),
  ]);
}

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useProductSkuFormSchema(() => {
    void refreshSpecPreview();
  }),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
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
    await refreshSpecPreview();
  },
});
</script>

<template>
  <Modal class="w-[760px]" :title="title">
    <Form />
  </Modal>
</template>
