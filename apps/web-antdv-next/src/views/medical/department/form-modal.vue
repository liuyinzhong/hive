<script lang="ts" setup>
import type { MedicalDepartmentApi } from '#/api/medical';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createMedicalDepartmentApi,
  updateMedicalDepartmentApi,
} from '#/api/medical';
import { $t } from '#/locales';

import { useDepartmentFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();
const formData = ref<Partial<MedicalDepartmentApi.Department>>();
const title = computed(() =>
  formData.value?.departmentId
    ? $t('medical.department.edit')
    : $t('medical.department.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useDepartmentFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    modalApi.lock();
    try {
      const values = await formApi.getValues();
      await (formData.value?.departmentId
        ? updateMedicalDepartmentApi(
            formData.value.departmentId,
            values as MedicalDepartmentApi.SaveDepartment,
          )
        : createMedicalDepartmentApi(
            values as MedicalDepartmentApi.SaveDepartment,
          ));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = modalApi.getData<Partial<MedicalDepartmentApi.Department>>();
    formData.value = data ?? {};
    await formApi.reset();
    await formApi.setValues({ status: 1, sort: 0, ...formData.value });
  },
});
</script>

<template>
  <Modal :title="title">
    <Form class="mx-4" />
  </Modal>
</template>
