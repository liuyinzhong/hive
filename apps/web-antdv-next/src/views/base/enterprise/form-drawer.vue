<script lang="ts" setup>
import type { BaseEnterpriseApi } from '#/api/base';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createEnterpriseApi,
  getEnterpriseDetailApi,
  updateEnterpriseApi,
} from '#/api/base';
import { $t } from '#/locales';

import { useEnterpriseFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();

const enterpriseId = ref<string>();
const rowVersion = ref<number>();
const title = computed(() =>
  enterpriseId.value
    ? $t('base.enterprise.edit')
    : $t('base.enterprise.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useEnterpriseFormSchema(),
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
      } as BaseEnterpriseApi.SaveEnterprise;
      await (enterpriseId.value
        ? updateEnterpriseApi(enterpriseId.value, payload)
        : createEnterpriseApi(payload));
      message.success($t('base.enterprise.saveSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;

    const data = drawerApi.getData<Partial<BaseEnterpriseApi.Enterprise>>() ?? {};
    enterpriseId.value = data.enterpriseId;
    rowVersion.value = data.rowVersion;
    await formApi.reset();

    let detail = data;
    if (data.enterpriseId) {
      drawerApi.lock();
      try {
        detail = await getEnterpriseDetailApi(data.enterpriseId);
      } finally {
        drawerApi.unlock();
      }
    }

    rowVersion.value = detail.rowVersion;
    await formApi.setValues({
      enterpriseType: 'ENTERPRISE',
      roles: [],
      status: 1,
      ...detail,
    });
  },
});
</script>

<template>
  <Drawer class="w-[860px]" :title="title">
    <Form />
  </Drawer>
</template>
