<script lang="ts" setup>
import type { MedicalScheduleApi } from '#/api/medical';
import type { EditableSlotQuota } from '../shared';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, InputNumber, message } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  createScheduleTemplateApi,
  updateScheduleTemplateApi,
} from '#/api/medical';
import { $t } from '#/locales';

import {
  buildEditableSlots,
  normalizeScheduleTime,
  toSlotQuotaConfig,
} from '../shared';
import { useTemplateFormSchema } from './data';

const emit = defineEmits<{ success: [] }>();
const templateId = ref<string>();
const slots = ref<EditableSlotQuota[]>([]);
const previousDefaultQuota = ref(1);
const title = computed(() =>
  templateId.value
    ? $t('medical.schedule.editTemplate')
    : $t('medical.schedule.createTemplate'),
);

function refreshSlots(
  values: Record<string, unknown>,
  fieldsChanged: string[] = [],
) {
  const nextDefaultQuota = Number(values.defaultSlotQuota || 1);
  const currentSlots = fieldsChanged.includes('defaultSlotQuota')
    ? slots.value.map((slot) => ({
        ...slot,
        quota:
          slot.quota === previousDefaultQuota.value
            ? nextDefaultQuota
            : slot.quota,
      }))
    : slots.value;
  slots.value = buildEditableSlots(
    values.startTime,
    values.endTime,
    nextDefaultQuota,
    currentSlots,
  );
  previousDefaultQuota.value = nextDefaultQuota;
}

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  handleValuesChange(values, fieldsChanged) {
    if (
      fieldsChanged.some((field) =>
        ['defaultSlotQuota', 'endTime', 'startTime'].includes(field),
      )
    ) {
      refreshSlots(values, fieldsChanged);
    }
  },
  layout: 'vertical',
  schema: useTemplateFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    if (slots.value.length === 0) {
      message.warning($t('medical.schedule.invalidTimeRange'));
      return;
    }

    drawerApi.lock();
    try {
      const defaultSlotQuota = Number(values.defaultSlotQuota);
      const payload: MedicalScheduleApi.SaveScheduleTemplate = {
        defaultSlotQuota,
        departmentId: values.departmentId as string,
        doctorId: values.doctorId as string,
        effectiveDate: values.effectiveDate as string,
        endTime: values.endTime as string,
        expiryDate: (values.expiryDate as string) || null,
        registrationType: values.registrationType as string,
        remark: (values.remark as string) || null,
        slotQuotaConfig: toSlotQuotaConfig(slots.value, defaultSlotQuota),
        startTime: values.startTime as string,
        status: Number(values.status) as 0 | 1,
        templateName: values.templateName as string,
        weekdays: (values.weekdays as number[]).map(Number),
      };
      await (templateId.value
        ? updateScheduleTemplateApi(templateId.value, payload)
        : createScheduleTemplateApi(payload));
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
      drawerApi.getData<Partial<MedicalScheduleApi.ScheduleTemplate>>() ?? {};
    templateId.value = data.templateId;
    await formApi.resetForm();
    previousDefaultQuota.value = data.defaultSlotQuota ?? 1;
    slots.value = buildEditableSlots(
      normalizeScheduleTime(data.startTime) || '08:00',
      normalizeScheduleTime(data.endTime) || '12:00',
      data.defaultSlotQuota ?? 1,
      data.slotQuotaConfig ?? [],
    );
    await formApi.setValues({
      ...data,
      defaultSlotQuota: data.defaultSlotQuota ?? 1,
      effectiveDate: data.effectiveDate ?? dayjs().format('YYYY-MM-DD'),
      endTime: normalizeScheduleTime(data.endTime) || '12:00',
      startTime: normalizeScheduleTime(data.startTime) || '08:00',
      status: data.status ?? 1,
      weekdays: data.weekdays ?? [],
    });
  },
});
</script>

<template>
  <Drawer class="w-[820px]" :title="title">
    <Form />
    <Alert
      class="mb-3"
      :message="$t('medical.schedule.slotQuotaTip')"
      show-icon
      type="info"
    />
    <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
      <div
        v-for="slot in slots"
        :key="slot.startTime"
        class="flex items-center justify-between rounded border p-2"
      >
        <span>{{ slot.startTime }}–{{ slot.endTime }}</span>
        <InputNumber v-model:value="slot.quota" :max="99" :min="0" />
      </div>
    </div>
  </Drawer>
</template>
