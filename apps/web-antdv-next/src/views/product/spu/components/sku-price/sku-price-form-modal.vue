<script lang="ts" setup>
import type { ProductSkuApi } from '#/api/product';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  createProductSkuPriceApi,
  updateProductSkuPriceApi,
} from '#/api/product';
import { $t } from '#/locales';

import { useProductSkuPriceFormSchema } from './sku-price-data';

interface ModalData {
  price?: ProductSkuApi.ProductSkuPrice;
  skuId: string;
}

const emit = defineEmits<{ success: [] }>();

const priceId = ref<string>();
const rowVersion = ref<number>();
const skuId = ref<string>();
const title = computed(() =>
  priceId.value ? $t('product.skuPrice.edit') : $t('product.skuPrice.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleValuesChange(values, fieldsChanged) {
    if (fieldsChanged.includes('scopeType') && values.scopeType === 'GLOBAL') {
      formApi.setFieldValue('scopeId', undefined);
    }
  },
  layout: 'vertical',
  schema: useProductSkuPriceFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid || !skuId.value) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      const payload: ProductSkuApi.SaveProductSkuPrice = {
        currencyCode: 'CNY',
        effectiveEnd: (values.effectiveEnd as string) || null,
        effectiveStart: values.effectiveStart as string,
        expectedRowVersion: rowVersion.value,
        price: String(values.price),
        priceType: values.priceType as string,
        remark: (values.remark as string) || null,
        scopeId:
          values.scopeType === 'GLOBAL'
            ? null
            : (values.scopeId as string) || null,
        scopeType: values.scopeType as string,
        status: Number(values.status) as ProductSkuApi.ProductSkuPriceStatus,
        taxIncluded: Number(
          values.taxIncluded,
        ) as ProductSkuApi.ProductSkuPriceTaxIncluded,
      };
      await (priceId.value
        ? updateProductSkuPriceApi(skuId.value, priceId.value, payload)
        : createProductSkuPriceApi(skuId.value, payload));
      message.success($t('product.skuPrice.saveSuccess'));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = modalApi.getData<ModalData>();
    const price = data.price;
    skuId.value = data.skuId;
    priceId.value = price?.priceId;
    rowVersion.value = price?.rowVersion;
    await formApi.reset();
    await formApi.setValues({
      currencyCode: 'CNY',
      effectiveStart: dayjs().add(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
      priceType: 'RETAIL',
      scopeType: 'GLOBAL',
      status: 1,
      taxIncluded: 1,
      ...price,
      effectiveEnd: price?.effectiveEnd || undefined,
      remark: price?.remark || undefined,
      scopeId: price?.scopeId || undefined,
    });
  },
});
</script>

<template>
  <Modal class="w-[760px]" :title="title">
    <Form />
  </Modal>
</template>
