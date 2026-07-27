<script lang="ts" setup>
import type { ProductSpuApi } from '#/api/product';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createProductSpuApi,
  getProductSpuDetailApi,
  updateProductSpuApi,
} from '#/api/product';
import { $t } from '#/locales';

import { useProductSpuFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();

const spuId = ref<string>();
const rowVersion = ref<number>();
const title = computed(() =>
  spuId.value ? $t('product.spu.edit') : $t('product.spu.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useProductSpuFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    drawerApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = {
        ...values,
        expectedRowVersion: rowVersion.value,
      } as ProductSpuApi.SaveProductSpu;
      await (spuId.value
        ? updateProductSpuApi(spuId.value, payload)
        : createProductSpuApi(payload));
      message.success($t('product.spu.saveSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = drawerApi.getData<Partial<ProductSpuApi.ProductSpu>>() ?? {};
    spuId.value = data.spuId;
    rowVersion.value = data.rowVersion;
    await formApi.reset();

    let detail = data;
    if (data.spuId) {
      drawerApi.lock();
      try {
        detail = await getProductSpuDetailApi(data.spuId);
      } finally {
        drawerApi.unlock();
      }
    }

    rowVersion.value = detail.rowVersion;
    await formApi.setValues({
      productType: 'DRUG',
      status: 1,
      ...detail,
    });
  },
});
</script>

<template>
  <Drawer class="w-[760px]" :title="title">
    <Form />
  </Drawer>
</template>
