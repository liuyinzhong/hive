import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalScheduleApi } from '#/api/medical';

import {
  getAllDoctorsApi,
  getAllMedicalDepartmentsApi,
  updateScheduleTemplateStatusApi,
} from '#/api/medical';
import { $t } from '#/locales';

import {
  scheduleTimeSchemas,
  useScheduleDimensionSchemas,
  weekdayOptions,
} from '../shared';

export function useTemplateFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 64, showCount: true },
      fieldName: 'templateName',
      formItemClass: 'md:col-span-2',
      label: $t('medical.schedule.templateName'),
      rules: 'required',
    },
    ...useScheduleDimensionSchemas(),
    {
      component: 'Select',
      componentProps: {
        maxTagCount: 'responsive',
        mode: 'multiple',
        options: weekdayOptions(),
      },
      fieldName: 'weekdays',
      label: $t('medical.schedule.weekday'),
      rules: 'selectRequired',
    },
    ...scheduleTimeSchemas(),
    {
      component: 'DatePicker',
      componentProps: { allowClear: false, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'effectiveDate',
      label: $t('medical.schedule.effectiveDate'),
      rules: 'selectRequired',
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'expiryDate',
      label: $t('medical.schedule.expiryDate'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      fieldName: 'status',
      label: $t('medical.schedule.status'),
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('medical.schedule.remark'),
    },
  ];
}

export function useTemplateSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getAllDoctorsApi,
        labelField: 'name',
        resultField: '',
        showSearch: true,
        valueField: 'doctorId',
      },
      fieldName: 'doctorId',
      label: $t('medical.schedule.doctor'),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getAllMedicalDepartmentsApi,
        childrenField: 'children',
        labelField: 'departmentName',
        resultField: '',
        valueField: 'departmentId',
      },
      fieldName: 'departmentId',
      label: $t('medical.schedule.department'),
    },
    {
      component: 'Select',
      componentProps: { allowClear: true, options: weekdayOptions() },
      fieldName: 'weekday',
      label: $t('medical.schedule.weekday'),
    },
  ];
}

export function useTemplateColumns(): VxeTableGridOptions<MedicalScheduleApi.ScheduleTemplate>['columns'] {
  return [
    {
      field: 'templateName',
      fixed: 'left',
      minWidth: 160,
      title: $t('medical.schedule.templateName'),
    },
    {
      field: 'doctorName',
      minWidth: 120,
      title: $t('medical.schedule.doctor'),
    },
    {
      field: 'departmentName',
      minWidth: 130,
      title: $t('medical.schedule.department'),
    },
    {
      cellRender: {
        name: 'DictTag',
        props: { type: 'MED_REGISTRATION_TYPE' },
      },
      field: 'registrationType',
      title: $t('medical.schedule.registrationType'),
      width: 100,
    },
    {
      field: 'weekdays',
      formatter: ({ row }) =>
        row.weekdays
          .map((weekday) => $t(`medical.schedule.weekday${weekday}`))
          .join('、'),
      title: $t('medical.schedule.weekday'),
      minWidth: 160,
    },
    {
      field: 'startTime',
      formatter: ({ row }) =>
        `${row.startTime.slice(0, 5)}–${row.endTime.slice(0, 5)}`,
      title: $t('medical.schedule.visitTime'),
      width: 130,
    },
    {
      field: 'defaultSlotQuota',
      title: $t('medical.schedule.defaultSlotQuota'),
      width: 120,
    },
    {
      field: 'totalQuota',
      title: $t('medical.schedule.totalQuota'),
      width: 90,
    },
    {
      field: 'effectiveDate',
      formatter: ({ row }) =>
        `${row.effectiveDate} ~ ${row.expiryDate || $t('medical.registrationFee.longTerm')}`,
      title: $t('medical.schedule.effectiveRange'),
      width: 210,
    },
    {
      cellRender: {
        attrs: {
          onChange: (status: 0 | 1, row: MedicalScheduleApi.ScheduleTemplate) =>
            updateScheduleTemplateStatusApi(row.templateId, status),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      title: $t('medical.schedule.status'),
      width: 100,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('system.dept.operation'),
      width: 100,
    },
  ];
}
