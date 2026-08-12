<script lang="ts" setup>
import type { MedicalDiagnosisApi } from '#/api/medical';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createDiagnosisApi,
  getDiagnosisDetailApi,
  updateDiagnosisApi,
} from '#/api/medical';
import { $t } from '#/locales';

import { useDiagnosisFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();
const diagnosisId = ref<string>();
const title = computed(() =>
  diagnosisId.value
    ? $t('medical.diagnosis.edit')
    : $t('medical.diagnosis.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useDiagnosisFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    drawerApi.lock();
    try {
      const values =
        await formApi.getValues<MedicalDiagnosisApi.SaveDiagnosis>();
      await (diagnosisId.value
        ? updateDiagnosisApi(diagnosisId.value, values)
        : createDiagnosisApi(values));
      message.success($t('medical.common.saveSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<{ diagnosisId?: string }>() ?? {};
    diagnosisId.value = data.diagnosisId;
    await formApi.reset();
    if (diagnosisId.value) {
      await formApi.setValues(
        await getDiagnosisDetailApi(diagnosisId.value),
      );
    } else {
      await formApi.setValues({ sort: 0, status: 1 });
    }
  },
});
</script>

<template>
  <Drawer class="w-[680px]" :title="title">
    <Form />
  </Drawer>
</template>
