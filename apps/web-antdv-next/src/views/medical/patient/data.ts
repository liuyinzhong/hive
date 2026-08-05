import type { Dayjs } from 'dayjs';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalPatientApi } from '#/api/medical';
import type { DescriptionsItemType } from '@vben/common-ui';

import dayjs from 'dayjs';
import { h } from 'vue';

import { Tag } from 'antdv-next';

import { z } from '#/adapter/form';
import { updatePatientStatusApi } from '#/api/medical';
import DictTag from '#/components/DictTag/index.vue';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

const phoneSchema = z
  .string()
  .regex(/^1[3-9]\d{9}$/, $t('medical.patient.phoneInvalid'));

const dateProps = {
  allowClear: false,
  disabledDate: (date: Dayjs) => date.isAfter(dayjs(), 'day'),
  valueFormat: 'YYYY-MM-DD',
};

const optionalPhoneSchema = phoneSchema.optional();

export function usePatientFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'name',
      label: $t('medical.patient.name'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('GENDER'),
      },
      fieldName: 'gender',
      label: $t('medical.patient.gender'),
      rules: 'selectRequired',
    },
    {
      component: 'DatePicker',
      componentProps: dateProps,
      fieldName: 'birthDate',
      label: $t('medical.patient.birthDate'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('MED_PATIENT_ID_TYPE'),
        showSearch: true,
      },
      fieldName: 'idType',
      label: $t('medical.patient.idType'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'idNumber',
      label: $t('medical.patient.idNumber'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 11 },
      fieldName: 'phone',
      label: $t('medical.patient.phone'),
      rules: phoneSchema,
    },
    {
      component: 'Input',
      componentProps: { maxlength: 512 },
      fieldName: 'address',
      label: $t('medical.patient.address'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'emergencyContactName',
      label: $t('medical.patient.emergencyContactName'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'emergencyContactRelation',
      label: $t('medical.patient.emergencyContactRelation'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 11 },
      fieldName: 'emergencyContactPhone',
      label: $t('medical.patient.emergencyContactPhone'),
      rules: optionalPhoneSchema,
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('medical.patient.remark'),
    },
  ];
}

export function usePatientSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '患者编号、姓名、手机号或证件号码',
      },
      fieldName: 'keyword',
      label: $t('medical.patient.keyword'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => getLocalDictList('GENDER'),
      },
      fieldName: 'gender',
      label: $t('medical.patient.gender'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('medical.patient.status'),
    },
    {
      component: 'RangePicker',
      componentProps: { allowClear: true, valueFormat: 'YYYY-MM-DD' },
      fieldName: 'createDate',
      label: $t('medical.patient.createDateRange'),
    },
  ];
}

export function usePatientColumns(): VxeTableGridOptions<MedicalPatientApi.Patient>['columns'] {
  return [
    {
      field: 'patientNo',
      sortable: true,
      title: $t('medical.patient.patientNo'),
      width: 140,
    },
    {
      field: 'name',
      sortable: true,
      title: $t('medical.patient.name'),
      width: 120,
    },
    {
      cellRender: { name: 'DictTag', props: { type: 'GENDER' } },
      field: 'gender',
      title: $t('medical.patient.gender'),
      width: 100,
    },
    {
      field: 'birthDate',
      sortable: true,
      title: $t('medical.patient.birthDate'),
      width: 130,
    },
    {
      field: 'idNumber',
      title: $t('medical.patient.idNumber'),
      width: 180,
    },
    {
      field: 'phone',
      title: $t('medical.patient.phone'),
      width: 140,
    },
    {
      cellRender: {
        attrs: {
          auth: 'medical:patient:status',
          onChange: (newStatus: 0 | 1, row: MedicalPatientApi.Patient) =>
            updatePatientStatusApi(row.patientId, newStatus),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      sortable: true,
      title: $t('medical.patient.status'),
      width: 90,
    },
    {
      field: 'createDate',
      sortable: true,
      title: $t('medical.patient.createDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('system.dept.operation'),
      width: 260,
    },
  ];
}

export function usePatientBasicDescriptionItems(
  patient?: MedicalPatientApi.Patient,
): DescriptionsItemType[] {
  const enabled = patient?.status === 1;
  return [
    { content: patient?.name || '-', label: $t('medical.patient.name') },
    {
      content: patient?.patientNo || '-',
      label: $t('medical.patient.patientNo'),
    },
    {
      content: () => h(DictTag, { dictType: 'GENDER', value: patient?.gender }),
      label: $t('medical.patient.gender'),
    },
    {
      content: patient?.birthDate || '-',
      label: $t('medical.patient.birthDate'),
    },
    {
      content: () =>
        h(DictTag, {
          dictType: 'MED_PATIENT_ID_TYPE',
          value: patient?.idType,
        }),
      label: $t('medical.patient.idType'),
    },
    {
      content: patient?.idNumber || '-',
      label: $t('medical.patient.idNumber'),
    },
    { content: patient?.phone || '-', label: $t('medical.patient.phone') },
    {
      content: () =>
        h(
          Tag,
          { color: enabled ? 'success' : 'error' },
          {
            default: () =>
              enabled ? $t('common.enabled') : $t('common.disabled'),
          },
        ),
      label: $t('medical.patient.status'),
    },
  ];
}

export function usePatientContactDescriptionItems(
  patient?: MedicalPatientApi.Patient,
): DescriptionsItemType[] {
  return [
    { content: patient?.address || '-', label: $t('medical.patient.address') },
    {
      content: patient?.emergencyContactName || '-',
      label: $t('medical.patient.emergencyContactName'),
    },
    {
      content: patient?.emergencyContactRelation || '-',
      label: $t('medical.patient.emergencyContactRelation'),
    },
    {
      content: patient?.emergencyContactPhone || '-',
      label: $t('medical.patient.emergencyContactPhone'),
    },
    { content: patient?.remark || '-', label: $t('medical.patient.remark') },
    {
      content: patient?.createDate || '-',
      label: $t('medical.patient.createDate'),
    },
    {
      content: patient?.updateDate || '-',
      label: $t('medical.patient.updateDate'),
    },
  ];
}
