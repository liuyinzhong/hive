import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalScheduleApi } from '#/api/medical';

import { $t } from '#/locales';

export function useTaskSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('medical.schedule.taskPublish'), value: 'publish' },
          { label: $t('medical.schedule.taskGenerate'), value: 'generate' },
        ],
      },
      fieldName: 'taskType',
      label: $t('medical.schedule.taskType'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [0, 1, 2, 3].map((value) => ({
          label: $t(`medical.schedule.taskStatus${value}`),
          value,
        })),
      },
      fieldName: 'status',
      label: $t('medical.schedule.taskStatus'),
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'startDate',
      label: $t('medical.schedule.startDate'),
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'endDate',
      label: $t('medical.schedule.endDate'),
    },
  ];
}

export function useTaskColumns(): VxeTableGridOptions<MedicalScheduleApi.AutoTask>['columns'] {
  return [
    {
      field: 'taskType',
      formatter: ({ row }) =>
        $t(
          row.taskType === 'publish'
            ? 'medical.schedule.taskPublish'
            : 'medical.schedule.taskGenerate',
        ),
      title: $t('medical.schedule.taskType'),
      width: 120,
    },
    {
      field: 'targetWeekStart',
      formatter: ({ row }) => `${row.targetWeekStart} ~ ${row.targetWeekEnd}`,
      title: $t('medical.schedule.targetWeek'),
      width: 220,
    },
    {
      field: 'status',
      slots: { default: 'status' },
      title: $t('medical.schedule.taskStatus'),
      width: 110,
    },
    {
      field: 'successDoctorCount',
      title: $t('medical.schedule.successDoctorCount'),
      width: 120,
    },
    {
      field: 'failureDoctorCount',
      slots: { default: 'failures' },
      title: $t('medical.schedule.failureDoctorCount'),
      width: 120,
    },
    {
      field: 'executedAt',
      sortable: true,
      title: $t('medical.schedule.executedAt'),
      width: 180,
    },
  ];
}
