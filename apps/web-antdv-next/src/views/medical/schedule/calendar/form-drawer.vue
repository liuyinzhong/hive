<script lang="ts" setup>
import type { MedicalScheduleApi } from '#/api/medical';
import type { EditableSlotQuota } from '../shared';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, InputNumber, message } from 'antdv-next';
import dayjs from 'dayjs';

import type { VbenFormSchema } from '#/adapter/form';
import { useVbenForm } from '#/adapter/form';
import { createScheduleApi, updateScheduleApi } from '#/api/medical';
import { $t } from '#/locales';

import {
  buildEditableSlots,
  normalizeScheduleTime,
  scheduleTimeSchemas,
  toSlotQuotaConfig,
  useScheduleDimensionSchemas,
} from '../shared';

const emit = defineEmits<{ success: [] }>();
const scheduleId = ref<string>();
const slots = ref<EditableSlotQuota[]>([]);
const previousDefaultQuota = ref(1);
const title = computed(() =>
  scheduleId.value
    ? $t('medical.schedule.editSchedule')
    : $t('medical.schedule.createSchedule'),
);

const schema: VbenFormSchema[] = [
  ...useScheduleDimensionSchemas(),
  {
    component: 'DatePicker',
    componentProps: { allowClear: false, valueFormat: 'YYYY-MM-DD' },
    fieldName: 'scheduleDate',
    label: $t('medical.schedule.scheduleDate'),
    rules: 'selectRequired',
  },
  ...scheduleTimeSchemas(),
  {
    component: 'Textarea',
    componentProps: { maxlength: 512, rows: 3, showCount: true },
    fieldName: 'remark',
    formItemClass: 'md:col-span-2',
    label: $t('medical.schedule.remark'),
  },
];

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
  schema,
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
      const payload: MedicalScheduleApi.SaveSchedule = {
        defaultSlotQuota,
        departmentId: values.departmentId as string,
        doctorId: values.doctorId as string,
        endTime: values.endTime as string,
        registrationType: values.registrationType as string,
        remark: (values.remark as string) || null,
        scheduleDate: values.scheduleDate as string,
        slotQuotaConfig: toSlotQuotaConfig(slots.value, defaultSlotQuota),
        startTime: values.startTime as string,
      };
      await (scheduleId.value
        ? updateScheduleApi(scheduleId.value, payload)
        : createScheduleApi(payload));
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
      drawerApi.getData<Partial<MedicalScheduleApi.Schedule>>() ?? {};
    scheduleId.value = data.scheduleId;
    await formApi.reset();
    const startTime = normalizeScheduleTime(data.startTime) || '08:00';
    const endTime = normalizeScheduleTime(data.endTime) || '12:00';
    const defaultSlotQuota = data.defaultSlotQuota ?? 1;
    previousDefaultQuota.value = defaultSlotQuota;
    slots.value = buildEditableSlots(
      startTime,
      endTime,
      defaultSlotQuota,
      data.slots ?? [],
    );
    await formApi.setValues({
      ...data,
      defaultSlotQuota,
      endTime,
      scheduleDate: data.scheduleDate ?? dayjs().format('YYYY-MM-DD'),
      startTime,
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
