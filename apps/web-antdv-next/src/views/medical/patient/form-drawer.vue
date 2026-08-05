<script lang="ts" setup>
import type { MedicalPatientApi } from '#/api/medical';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createPatientApi,
  getPatientDetailApi,
  updatePatientApi,
} from '#/api/medical';
import { $t } from '#/locales';

import { usePatientFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();
const patientId = ref<string>();
const title = computed(() =>
  patientId.value ? $t('medical.patient.edit') : $t('medical.patient.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: usePatientFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  zIndex: 999,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    drawerApi.lock();
    try {
      const values = await formApi.getValues();
      const payload = values as MedicalPatientApi.SavePatient;
      await (patientId.value
        ? updatePatientApi(patientId.value, payload)
        : createPatientApi(payload));
      message.success($t('medical.common.saveSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<
      Partial<MedicalPatientApi.Patient>
    >() ?? {};
    patientId.value = data.patientId;
    await formApi.reset();

    let detail = data;
    if (data.patientId) {
      drawerApi.lock();
      try {
        detail = await getPatientDetailApi(data.patientId);
      } finally {
        drawerApi.unlock();
      }
    }
    await formApi.setValues({
      ...detail,
      address: detail.address ?? undefined,
      emergencyContactName: detail.emergencyContactName ?? undefined,
      emergencyContactPhone: detail.emergencyContactPhone ?? undefined,
      emergencyContactRelation: detail.emergencyContactRelation ?? undefined,
      remark: detail.remark ?? undefined,
    });
  },
});
</script>

<template>
  <Drawer class="w-[900px]" :title="title">
    <Form />
  </Drawer>
</template>
