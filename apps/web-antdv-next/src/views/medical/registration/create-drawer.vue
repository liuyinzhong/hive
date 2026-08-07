<script lang="ts" setup>
import type {
  MedicalPatientApi,
  MedicalRegistrationApi,
  MedicalScheduleApi,
} from '#/api/medical';
import type { Dayjs } from 'dayjs';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { useDebounceFn } from '@vueuse/core';

import {
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  RadioGroup,
  Select,
  Spin,
} from 'antdv-next';
import dayjs from 'dayjs';

import {
  createRegistrationApi,
  getPatientListApi,
  getScheduleListApi,
} from '#/api/medical';
import { $t } from '#/locales';

import { registrationMethodLabel } from './constants';

const emit = defineEmits<{ success: [] }>();
const patientId = ref<string>();
const slotId = ref<string>();
const registrationMethod = ref<MedicalRegistrationApi.RegistrationMethod>(10);
const visitDate = ref(dayjs().format('YYYY-MM-DD'));
const remark = ref('');
const patientOptions = ref<MedicalPatientApi.Patient[]>([]);
const schedules = ref<MedicalScheduleApi.Schedule[]>([]);
const patientLoading = ref(false);
const scheduleLoading = ref(false);
let patientRequestSequence = 0;
let scheduleRequestSequence = 0;

const slotOptions = computed(() =>
  schedules.value.flatMap((schedule) =>
    schedule.slots
      .filter((slot) => slot.canBook)
      .map((slot) => ({
        label: `${schedule.departmentName} / ${schedule.doctorName} / ${schedule.registrationType} / ${slot.startTime.slice(0, 5)}-${slot.endTime.slice(0, 5)} / ¥${schedule.feeAmount ?? '-'}`,
        value: slot.slotId,
      })),
  ),
);

async function loadPatients(keyword = '') {
  const sequence = ++patientRequestSequence;
  patientLoading.value = true;
  try {
    const result = await getPatientListApi({
      keyword,
      page: 1,
      pageSize: 20,
      status: 1,
    });
    if (sequence === patientRequestSequence)
      patientOptions.value = result.items;
  } finally {
    if (sequence === patientRequestSequence) patientLoading.value = false;
  }
}

const searchPatients = useDebounceFn(loadPatients, 300);

async function loadSchedules() {
  const sequence = ++scheduleRequestSequence;
  slotId.value = undefined;
  schedules.value = [];
  if (!visitDate.value) return;
  scheduleLoading.value = true;
  try {
    const items: MedicalScheduleApi.Schedule[] = [];
    let page = 1;
    let total = 0;
    do {
      const result = await getScheduleListApi({
        endDate: visitDate.value,
        page,
        pageSize: 100,
        startDate: visitDate.value,
        status: 1,
      });
      if (sequence !== scheduleRequestSequence) return;
      items.push(...result.items);
      total = result.total;
      page += 1;
      if (result.items.length === 0) break;
    } while (items.length < total);
    schedules.value = items;
  } finally {
    if (sequence === scheduleRequestSequence) scheduleLoading.value = false;
  }
}

function disabledDate(value: Dayjs) {
  return value.isBefore(dayjs().startOf('day'));
}

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (!patientId.value) {
      message.warning($t('medical.registration.patientRequired'));
      return;
    }
    if (!slotId.value) {
      message.warning($t('medical.registration.slotRequired'));
      return;
    }
    drawerApi.lock();
    try {
      await createRegistrationApi({
        patientId: patientId.value,
        registrationMethod: registrationMethod.value,
        remark: remark.value.trim() || undefined,
        slotId: slotId.value,
      });
      message.success($t('medical.registration.createSuccess'));
      drawerApi.close();
      emit('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    patientId.value = undefined;
    slotId.value = undefined;
    registrationMethod.value = 10;
    visitDate.value = dayjs().format('YYYY-MM-DD');
    remark.value = '';
    await Promise.all([loadPatients(), loadSchedules()]);
  },
});
</script>

<template>
  <Drawer class="w-[760px]" :title="$t('medical.registration.create')">
    <Spin :spinning="patientLoading || scheduleLoading">
      <Form layout="vertical">
        <FormItem required :label="$t('medical.registration.patient')">
          <Select
            v-model:value="patientId"
            :filter-option="false"
            :loading="patientLoading"
            :options="
              patientOptions.map((item) => ({
                label: `${item.patientNo} / ${item.name} / ${item.phone}`,
                value: item.patientId,
              }))
            "
            show-search
            @search="searchPatients"
          />
        </FormItem>
        <FormItem
          required
          :label="$t('medical.registration.registrationMethod')"
        >
          <RadioGroup
            v-model:value="registrationMethod"
            button-style="solid"
            option-type="button"
            :options="
              [0, 10].map((value) => ({
                label: registrationMethodLabel(
                  value as MedicalRegistrationApi.RegistrationMethod,
                ),
                value,
              }))
            "
          />
        </FormItem>
        <FormItem required :label="$t('medical.registration.visitDate')">
          <DatePicker
            v-model:value="visitDate"
            class="w-full"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
            @change="loadSchedules"
          />
        </FormItem>
        <FormItem required :label="$t('medical.registration.slot')">
          <Select
            v-model:value="slotId"
            :not-found-content="$t('medical.registration.noBookableSlot')"
            :options="slotOptions"
            show-search
          />
        </FormItem>
        <FormItem :label="$t('medical.registration.remark')">
          <Input.TextArea
            v-model:value="remark"
            :maxlength="512"
            :rows="3"
            show-count
          />
        </FormItem>
      </Form>
    </Spin>
  </Drawer>
</template>
