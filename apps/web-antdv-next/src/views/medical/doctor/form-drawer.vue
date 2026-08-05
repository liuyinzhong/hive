<script lang="ts" setup>
import type { MedicalDoctorApi } from '#/api/medical';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  createDoctorApi,
  getDoctorDetailApi,
  updateDoctorApi,
} from '#/api/medical';
import { $t } from '#/locales';
import { filesToUrlString, urlStringToFiles } from '#/utils';

import { useDoctorFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();
const doctorId = ref<string>();
const title = computed(() =>
  doctorId.value ? $t('medical.doctor.edit') : $t('medical.doctor.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useDoctorFormSchema(),
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
        avatar: filesToUrlString(values.avatar) || null,
      } as MedicalDoctorApi.SaveDoctor;
      await (doctorId.value
        ? updateDoctorApi(doctorId.value, payload)
        : createDoctorApi(payload));
      message.success($t('medical.common.saveSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<Partial<MedicalDoctorApi.Doctor>>() ?? {};
    doctorId.value = data.doctorId;
    await formApi.reset();

    let detail = data;
    if (data.doctorId) {
      drawerApi.lock();
      try {
        detail = await getDoctorDetailApi(data.doctorId);
      } finally {
        drawerApi.unlock();
      }
    }
    await formApi.setValues({
      appointmentEnabled: 1,
      defaultVisitMinutes: 15,
      onlineConsultation: 0,
      profileVisible: 1,
      sort: 0,
      status: 1,
      ...detail,
      avatar: urlStringToFiles(detail.avatar ?? ''),
    });
  },
});
</script>

<template>
  <Drawer class="w-[900px]" :title="title">
    <Form />
  </Drawer>
</template>
