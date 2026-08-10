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

interface SkuPackChainValue {
  cartonConversion?: number;
  cartonUnitName?: string;
  minUnitName?: string;
  packConversion?: number;
  packageUnitName?: string;
}

interface ProductSkuFormValues extends Record<string, unknown> {
  packChain?: SkuPackChainValue;
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

function encodeSkuFormValues(values: Readonly<ProductSkuFormValues>) {
  const { packChain, ...formValues } = values;
  if (!packChain) {
    return formValues;
  }

  return {
    ...formValues,
    cartonConversion: packChain.cartonConversion,
    cartonUnitName: packChain.cartonUnitName,
    minUnitName: packChain.minUnitName,
    packConversion: packChain.packConversion,
    packageUnitName: packChain.packageUnitName,
  };
}

function decodeSkuFormValues(
  values: Readonly<Record<string, unknown>>,
): ProductSkuFormValues {
  return {
    ...values,
    packChain: {
      cartonConversion: values.cartonConversion as number | undefined,
      cartonUnitName: values.cartonUnitName as string | undefined,
      minUnitName: values.minUnitName as string | undefined,
      packConversion: values.packConversion as number | undefined,
      packageUnitName: values.packageUnitName as string | undefined,
    },
  };
}

function getSpecSourceValues(values: Record<string, unknown>) {
  const packChain = values.packChain as SkuPackChainValue | undefined;
  return {
    cartonConversion: packChain?.cartonConversion ?? values.cartonConversion,
    cartonUnitName: packChain?.cartonUnitName ?? values.cartonUnitName,
    minUnitName: packChain?.minUnitName ?? values.minUnitName,
    packConversion: packChain?.packConversion ?? values.packConversion,
    packageUnitName: packChain?.packageUnitName ?? values.packageUnitName,
  };
}

function buildSkuSpecPreview(values: Record<string, unknown>) {
  const specSourceValues = getSpecSourceValues(values);
  const packConversion = toPositiveInteger(specSourceValues.packConversion);
  const cartonConversion = toPositiveInteger(
    specSourceValues.cartonConversion,
  );
  const minUnitName = toTrimmedString(specSourceValues.minUnitName);
  const packageUnitName = toTrimmedString(specSourceValues.packageUnitName);
  const cartonUnitName = toTrimmedString(specSourceValues.cartonUnitName);

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
  codec: {
    decode: decodeSkuFormValues,
    encode: encodeSkuFormValues,
  },
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
      const values = encodeSkuFormValues(await formApi.getValues());
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
    await formApi.setValues(
      decodeSkuFormValues({
        allowSplit: 0,
        status: 1,
        traceMode: 'NONE',
        ...detail,
      }),
    );
    await refreshSpecPreview();
  },
});
</script>

<template>
  <Modal class="w-[760px]" :title="title">
    <Form />
  </Modal>
</template>
