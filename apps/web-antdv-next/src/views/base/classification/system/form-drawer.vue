<script lang="ts" setup>
import type { BaseClassificationApi } from '#/api/base';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createClassificationSystemApi,
  getClassificationSystemDetailApi,
  updateClassificationSystemApi,
} from '#/api/base';
import { $t } from '#/locales';

import { useClassificationSystemFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();

const systemId = ref<string>();
const rowVersion = ref<number>();
const title = computed(() =>
  systemId.value
    ? $t('base.classification.systemEdit')
    : $t('base.classification.systemCreate'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useClassificationSystemFormSchema(),
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
      } as BaseClassificationApi.SaveClassificationSystem;
      await (systemId.value
        ? updateClassificationSystemApi(systemId.value, payload)
        : createClassificationSystemApi(payload));
      message.success($t('base.classification.saveSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = drawerApi.getData<Partial<BaseClassificationApi.ClassificationSystem>>() ?? {};
    systemId.value = data.classificationSystemId;
    rowVersion.value = data.rowVersion;
    await formApi.reset();

    let detail = data;
    if (data.classificationSystemId) {
      drawerApi.lock();
      try {
        detail = await getClassificationSystemDetailApi(data.classificationSystemId);
      } finally {
        drawerApi.unlock();
      }
    }

    rowVersion.value = detail.rowVersion;
    await formApi.setValues({
      sort: 0,
      ...detail,
    });
  },
});
</script>

<template>
  <Drawer class="w-[640px]" :title="title">
    <Form />
  </Drawer>
</template>
