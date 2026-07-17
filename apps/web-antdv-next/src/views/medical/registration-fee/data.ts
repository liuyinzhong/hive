import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalRegistrationFeeApi } from '#/api/medical';

import {
  getAllDoctorsApi,
  getAllMedicalDepartmentsApi,
  getDoctorDetailApi,
} from '#/api/medical';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

function getPeriodStatusOptions() {
  return [
    { label: $t('medical.registrationFee.current'), value: 'current' },
    { label: $t('medical.registrationFee.future'), value: 'future' },
    { label: $t('medical.registrationFee.expired'), value: 'expired' },
  ];
}

export function useRegistrationFeeFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: ['feeRuleId'],
      },
      fieldName: 'feeRuleId',
      label: 'feeRuleId',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getAllDoctorsApi,
        labelField: 'name',
        resultField: '',
        showSearch: true,
        valueField: 'doctorId',
      },
      dependencies: {
        disabled: (values) => Boolean(values.feeRuleId),
        triggerFields: ['feeRuleId'],
      },
      fieldName: 'doctorId',
      label: $t('medical.registrationFee.doctor'),
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
        key: `registration-fee-department-${values.doctorId ?? 'empty'}`,
        labelField: 'departmentName',
        resultField: '',
        valueField: 'departmentId',
      }),
      dependencies: {
        disabled: (values) => Boolean(values.feeRuleId) || !values.doctorId,
        triggerFields: ['doctorId', 'feeRuleId'],
      },
      fieldName: 'departmentId',
      label: $t('medical.registrationFee.department'),
      rules: 'selectRequired',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('MED_REGISTRATION_TYPE'),
      },
      dependencies: {
        disabled: (values) => Boolean(values.feeRuleId),
        triggerFields: ['feeRuleId'],
      },
      fieldName: 'registrationType',
      label: $t('medical.registrationFee.registrationType'),
      rules: 'selectRequired',
    },
    {
      component: 'InputNumber',
      componentProps: {
        max: 99_999_999.99,
        min: 0.01,
        precision: 2,
        prefix: '¥',
        stringMode: true,
      },
      fieldName: 'feeAmount',
      label: $t('medical.registrationFee.feeAmount'),
      rules: 'required',
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: false, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'effectiveDate',
      label: $t('medical.registrationFee.effectiveDate'),
      rules: 'selectRequired',
    },
    {
      component: 'DatePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      dependencies: {
        show: (values) => !values.feeRuleId,
        triggerFields: ['feeRuleId'],
      },
      fieldName: 'expiryDate',
      label: $t('medical.registrationFee.expiryDate'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('medical.registrationFee.remark'),
    },
  ];
}

export function useRegistrationFeeSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'keyword',
      label: $t('medical.registrationFee.keyword'),
    },
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
      label: $t('medical.registrationFee.doctor'),
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
      label: $t('medical.registrationFee.department'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => getLocalDictList('MED_REGISTRATION_TYPE'),
      },
      fieldName: 'registrationType',
      label: $t('medical.registrationFee.registrationType'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getPeriodStatusOptions(),
      },
      fieldName: 'periodStatus',
      label: $t('medical.registrationFee.periodStatus'),
    },
  ];
}

export function useRegistrationFeeColumns(): VxeTableGridOptions<MedicalRegistrationFeeApi.RegistrationFeeRule>['columns'] {
  return [
    {
      field: 'doctorName',
      fixed: 'left',
      minWidth: 130,
      sortable: true,
      title: $t('medical.registrationFee.doctor'),
    },
    {
      field: 'doctorNo',
      title: $t('medical.doctor.doctorNo'),
      width: 130,
    },
    {
      field: 'departmentName',
      minWidth: 130,
      sortable: true,
      title: $t('medical.registrationFee.department'),
    },
    {
      cellRender: {
        name: 'DictTag',
        props: { type: 'MED_REGISTRATION_TYPE' },
      },
      field: 'registrationType',
      title: $t('medical.registrationFee.registrationType'),
      width: 100,
    },
    {
      field: 'feeAmount',
      formatter: ({ row }) => `¥${Number(row.feeAmount).toFixed(2)}`,
      sortable: true,
      title: $t('medical.registrationFee.feeAmount'),
      width: 110,
    },
    {
      field: 'effectiveDate',
      sortable: true,
      title: $t('medical.registrationFee.effectiveDate'),
      width: 120,
    },
    {
      field: 'expiryDate',
      formatter: ({ row }) =>
        row.expiryDate || $t('medical.registrationFee.longTerm'),
      sortable: true,
      title: $t('medical.registrationFee.expiryDate'),
      width: 120,
    },
    {
      field: 'version',
      formatter: ({ row }) => `v${row.version}`,
      sortable: true,
      title: $t('medical.registrationFee.version'),
      width: 80,
    },
    {
      field: 'periodStatus',
      slots: { default: 'periodStatus' },
      title: $t('medical.registrationFee.periodStatus'),
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 160,
      title: $t('medical.registrationFee.remark'),
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('system.dept.operation'),
      width: 110,
    },
  ];
}
