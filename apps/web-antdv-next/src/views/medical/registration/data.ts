import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalRegistrationApi } from '#/api/medical';

import { h } from 'vue';

import { Tag } from 'antdv-next';

import { getAllDoctorsApi, getAllMedicalDepartmentsApi } from '#/api/medical';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

import {
  registrationMethodLabel,
  registrationStatusColor,
  registrationStatusLabel,
  registrationStatusValues,
} from './constants';

export function useRegistrationSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'registrationNo',
      label: $t('medical.registration.registrationNo'),
    },
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'patientKeyword',
      label: $t('medical.registration.patientKeyword'),
    },
    {
      component: 'RangePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'visitDate',
      label: $t('medical.registration.visitDate'),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getAllMedicalDepartmentsApi,
        childrenField: 'children',
        labelField: 'departmentName',
        valueField: 'departmentId',
      },
      fieldName: 'departmentId',
      label: $t('medical.registration.department'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getAllDoctorsApi,
        labelField: 'name',
        valueField: 'doctorId',
      },
      fieldName: 'doctorId',
      label: $t('medical.registration.doctor'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => getLocalDictList('MED_REGISTRATION_TYPE'),
      },
      fieldName: 'registrationType',
      label: $t('medical.registration.registrationType'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [0, 10].map((value) => ({
          label: registrationMethodLabel(
            value as MedicalRegistrationApi.RegistrationMethod,
          ),
          value,
        })),
      },
      fieldName: 'registrationMethod',
      label: $t('medical.registration.registrationMethod'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: registrationStatusValues.map((value) => ({
          label: registrationStatusLabel(value),
          value,
        })),
      },
      fieldName: 'status',
      label: $t('medical.registration.status'),
    },
  ];
}

export function useRegistrationColumns(): VxeTableGridOptions<MedicalRegistrationApi.Registration>['columns'] {
  return [
    {
      field: 'registrationNo',
      sortable: true,
      title: $t('medical.registration.registrationNo'),
      width: 130,
    },
    {
      field: 'patientName',
      sortable: true,
      title: $t('medical.registration.patientName'),
      width: 110,
    },
    {
      field: 'patientNo',
      title: $t('medical.registration.patientNo'),
      width: 120,
    },
    {
      field: 'patientPhone',
      title: $t('medical.registration.patientPhone'),
      width: 130,
    },
    {
      field: 'departmentName',
      title: $t('medical.registration.department'),
      width: 120,
    },
    {
      field: 'doctorName',
      title: $t('medical.registration.doctor'),
      width: 110,
    },
    {
      field: 'scheduleDate',
      sortable: true,
      title: $t('medical.registration.visitDate'),
      width: 110,
    },
    {
      field: 'startTime',
      formatter: ({ row }) =>
        `${row.startTime.slice(0, 5)}-${row.endTime.slice(0, 5)}`,
      title: $t('medical.registration.visitTime'),
      width: 120,
    },
    {
      field: 'registrationTypeName',
      title: $t('medical.registration.registrationType'),
      width: 100,
    },
    {
      field: 'registrationMethod',
      formatter: ({ cellValue }) => registrationMethodLabel(cellValue),
      title: $t('medical.registration.registrationMethod'),
      width: 100,
    },
    {
      field: 'feeAmount',
      sortable: true,
      title: $t('medical.registration.feeAmount'),
      width: 90,
    },
    {
      field: 'status',
      slots: {
        default: ({ row }) =>
          h(Tag, { color: registrationStatusColor(row.status) }, () =>
            registrationStatusLabel(row.status),
          ),
      },
      sortable: true,
      title: $t('medical.registration.status'),
      width: 100,
    },
    {
      field: 'createDate',
      sortable: true,
      title: $t('medical.registration.createDate'),
      width: 165,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('medical.registration.operation'),
      width: 280,
    },
  ];
}
