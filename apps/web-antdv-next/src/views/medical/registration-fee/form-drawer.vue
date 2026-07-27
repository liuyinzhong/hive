<script lang="ts" setup>
import type { MedicalRegistrationFeeApi } from '#/api/medical';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  adjustRegistrationFeeRuleApi,
  createRegistrationFeeRuleApi,
} from '#/api/medical';
import { $t } from '#/locales';

import { useRegistrationFeeFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();
const feeRuleId = ref<string>();
const title = computed(() =>
  feeRuleId.value
    ? $t('medical.registrationFee.adjust')
    : $t('medical.registrationFee.create'),
);

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  layout: 'vertical',
  schema: useRegistrationFeeFormSchema(),
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
      const feeAmount = String(values.feeAmount);
      await (feeRuleId.value
        ? adjustRegistrationFeeRuleApi(feeRuleId.value, {
            effectiveDate: values.effectiveDate as string,
            feeAmount,
            remark: (values.remark as string) || null,
          })
        : createRegistrationFeeRuleApi({
            departmentId: values.departmentId as string,
            doctorId: values.doctorId as string,
            effectiveDate: values.effectiveDate as string,
            expiryDate: (values.expiryDate as string) || null,
            feeAmount,
            registrationType: values.registrationType as string,
            remark: (values.remark as string) || null,
          }));
      message.success($t('medical.common.saveSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const data =
      drawerApi.getData<
        Partial<MedicalRegistrationFeeApi.RegistrationFeeRule>
      >() ?? {};
    feeRuleId.value = data.feeRuleId;
    await formApi.reset();

    let effectiveDate = dayjs().format('YYYY-MM-DD');
    if (data.feeRuleId && data.effectiveDate) {
      const nextVersionDate = dayjs(data.effectiveDate).add(1, 'day');
      const today = dayjs().startOf('day');
      effectiveDate = (
        nextVersionDate.isAfter(today) ? nextVersionDate : today
      ).format('YYYY-MM-DD');
    }

    await formApi.setValues({
      ...data,
      effectiveDate,
      feeRuleId: data.feeRuleId,
      expiryDate: data.feeRuleId ? undefined : data.expiryDate,
      remark: undefined,
    });
  },
});
</script>

<template>
  <Drawer class="w-[720px]" :title="title">
    <Form />
  </Drawer>
</template>
