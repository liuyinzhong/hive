import type { VbenFormSchema } from '#/adapter/form';
import type { MedicalScheduleApi } from '#/api/medical';

import { getAllDoctorsApi, getDoctorDetailApi } from '#/api/medical';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

export interface EditableSlotQuota extends MedicalScheduleApi.SlotQuota {
  endTime: string;
}

function timeToMinutes(value?: unknown) {
  const match = String(value ?? '').match(/^(\d{2}):(\d{2})/);
  if (!match) return undefined;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function normalizeScheduleTime(value?: null | string) {
  return value?.slice(0, 5) ?? '';
}

export function buildEditableSlots(
  startTime: unknown,
  endTime: unknown,
  defaultQuota: unknown,
  current: Array<
    MedicalScheduleApi.ScheduleSlot | MedicalScheduleApi.SlotQuota
  > = [],
) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const fallbackQuota = Number(defaultQuota || 1);
  if (start === undefined || end === undefined || start >= end) return [];

  const quotaByStart = new Map(
    current.map((item) => [normalizeScheduleTime(item.startTime), item.quota]),
  );
  const result: EditableSlotQuota[] = [];
  for (let cursor = start; cursor + 30 <= end; cursor += 30) {
    const slotStart = minutesToTime(cursor);
    result.push({
      endTime: minutesToTime(cursor + 30),
      quota: quotaByStart.get(slotStart) ?? fallbackQuota,
      startTime: slotStart,
    });
  }
  return result;
}

export function toSlotQuotaConfig(
  slots: EditableSlotQuota[],
  defaultQuota: number,
) {
  return slots
    .filter((item) => item.quota !== defaultQuota)
    .map(({ quota, startTime }) => ({ quota, startTime }));
}

export function weekdayOptions() {
  return Array.from({ length: 7 }, (_, index) => ({
    label: $t(`medical.schedule.weekday${index + 1}`),
    value: index + 1,
  }));
}

export function statusOptions() {
  return [0, 1, 2, 3].map((value) => ({
    label: $t(`medical.schedule.status${value}`),
    value,
  }));
}

export function useScheduleDimensionSchemas(): VbenFormSchema[] {
  return [
    {
      component: 'ApiSelect',
      componentProps: {
        api: getAllDoctorsApi,
        labelField: 'name',
        resultField: '',
        showSearch: true,
        valueField: 'doctorId',
      },
      fieldName: 'doctorId',
      label: $t('medical.schedule.doctor'),
      rules: 'selectRequired',
    },
    {
      component: 'ApiSelect',
      componentProps: (values) => ({
        api: async () => {
          if (!values.doctorId) return [];
          const doctor = await getDoctorDetailApi(values.doctorId as string);
          return doctor.departments.filter(
            (item) => item.status === 1 && item.appointmentEnabled === 1,
          );
        },
        key: `schedule-department-${values.doctorId ?? 'empty'}`,
        labelField: 'departmentName',
        resultField: '',
        valueField: 'departmentId',
      }),
      dependencies: {
        disabled: (values) => !values.doctorId,
        triggerFields: ['doctorId'],
      },
      fieldName: 'departmentId',
      label: $t('medical.schedule.department'),
      rules: 'selectRequired',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('MED_REGISTRATION_TYPE'),
      },
      fieldName: 'registrationType',
      label: $t('medical.schedule.registrationType'),
      rules: 'selectRequired',
    },
  ];
}

export function scheduleTimeSchemas(): VbenFormSchema[] {
  return [
    {
      component: 'TimePicker',
      componentProps: {
        allowClear: false,
        format: 'HH:mm',
        minuteStep: 30,
        valueFormat: 'HH:mm',
      },
      fieldName: 'startTime',
      label: $t('medical.schedule.startTime'),
      rules: 'selectRequired',
    },
    {
      component: 'TimePicker',
      componentProps: {
        allowClear: false,
        format: 'HH:mm',
        minuteStep: 30,
        valueFormat: 'HH:mm',
      },
      fieldName: 'endTime',
      label: $t('medical.schedule.endTime'),
      rules: 'selectRequired',
    },
    {
      component: 'InputNumber',
      componentProps: { max: 99, min: 1, precision: 0 },
      fieldName: 'defaultSlotQuota',
      label: $t('medical.schedule.defaultSlotQuota'),
      rules: 'required',
    },
  ];
}
