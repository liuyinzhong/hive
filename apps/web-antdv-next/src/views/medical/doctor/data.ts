import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalDoctorApi } from '#/api/medical';
import type { DescriptionsItemType } from '@vben/common-ui';

import { h } from 'vue';

import { Tag } from 'antdv-next';

import { z } from '#/adapter/form';
import { upload_file } from '#/api/examples/upload';
import {
  getAllMedicalDepartmentsApi,
  updateDoctorStatusApi,
} from '#/api/medical';
import { getUserListAllApi } from '#/api/system';
import DictTag from '#/components/DictTag/index.vue';
import { getLocalDictList } from '#/dicts';
import { $t } from '#/locales';

const binaryOptions = () => [
  { label: $t('common.yes'), value: 1 },
  { label: $t('common.no'), value: 0 },
];

export function useDoctorFormSchema(): VbenFormSchema[] {
  const dateProps = { allowClear: true, valueFormat: 'YYYY-MM-DD' };
  const departmentProps = {
    api: getAllMedicalDepartmentsApi,
    childrenField: 'children',
    labelField: 'departmentName',
    resultField: '',
    valueField: 'departmentId',
  };

  return [
    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg',
        aspectRatio: '1:1',
        crop: true,
        customRequest: upload_file,
        listType: 'picture-card',
        maxCount: 1,
        maxSize: 2,
      },
      fieldName: 'avatar',
      formItemClass: 'md:col-span-2',
      label: $t('medical.doctor.avatar'),
      renderComponentContent: () => ({
        default: () => $t('medical.doctor.uploadAvatar'),
      }),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'doctorNo',
      label: $t('medical.doctor.doctorNo'),
      rules: z.string().min(1).max(32),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'name',
      label: $t('medical.doctor.name'),
      rules: z.string().min(1).max(64),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'namePinyin',
      label: $t('medical.doctor.namePinyin'),
      rules: z.string().max(128).optional(),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => getLocalDictList('GENDER'),
      },
      fieldName: 'gender',
      label: $t('medical.doctor.gender'),
    },
    {
      component: 'DatePicker',
      componentProps: dateProps,
      fieldName: 'birthDate',
      label: $t('medical.doctor.birthDate'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 20 },
      fieldName: 'phone',
      label: $t('medical.doctor.phone'),
      rules: z.string().max(20).optional(),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'email',
      label: $t('medical.doctor.email'),
      rules: z.string().email().max(128).optional(),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: getUserListAllApi,
        labelField: 'realName',
        resultField: '',
        showSearch: true,
        valueField: 'userId',
      },
      fieldName: 'userId',
      label: $t('medical.doctor.user'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('MED_DOCTOR_TITLE'),
      },
      fieldName: 'professionalTitle',
      label: $t('medical.doctor.professionalTitle'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'administrativePosition',
      label: $t('medical.doctor.administrativePosition'),
      rules: z.string().max(64).optional(),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => getLocalDictList('MED_EMPLOYMENT_TYPE'),
      },
      fieldName: 'employmentType',
      label: $t('medical.doctor.employmentType'),
      rules: 'selectRequired',
    },
    {
      component: 'DatePicker',
      componentProps: dateProps,
      fieldName: 'practiceStartDate',
      label: $t('medical.doctor.practiceStartDate'),
    },
    {
      component: 'DatePicker',
      componentProps: dateProps,
      fieldName: 'employmentDate',
      label: $t('medical.doctor.employmentDate'),
    },
    {
      component: 'DatePicker',
      componentProps: dateProps,
      fieldName: 'departureDate',
      label: $t('medical.doctor.departureDate'),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        ...departmentProps,
        maxTagCount: 4,
        multiple: true,
      },
      fieldName: 'departmentIds',
      label: $t('medical.doctor.department'),
      rules: 'required',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: departmentProps,
      fieldName: 'primaryDepartmentId',
      label: $t('medical.doctor.primaryDepartment'),
      rules: 'selectRequired',
    },
    {
      component: 'InputNumber',
      componentProps: { max: 240, min: 5, precision: 0 },
      defaultValue: 15,
      fieldName: 'defaultVisitMinutes',
      label: $t('medical.doctor.defaultVisitMinutes'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: { options: binaryOptions() },
      defaultValue: 0,
      fieldName: 'onlineConsultation',
      label: $t('medical.doctor.onlineConsultation'),
    },
    {
      component: 'RadioGroup',
      componentProps: { options: binaryOptions() },
      defaultValue: 1,
      fieldName: 'appointmentEnabled',
      label: $t('medical.doctor.appointmentEnabled'),
    },
    {
      component: 'RadioGroup',
      componentProps: { options: binaryOptions() },
      defaultValue: 1,
      fieldName: 'profileVisible',
      label: $t('medical.doctor.profileVisible'),
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, precision: 0 },
      defaultValue: 0,
      fieldName: 'sort',
      label: $t('medical.doctor.sort'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('medical.doctor.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 2000, rows: 3, showCount: true },
      fieldName: 'expertise',
      formItemClass: 'md:col-span-2',
      label: $t('medical.doctor.expertise'),
      rules: z.string().max(2000).optional(),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 4000, rows: 4, showCount: true },
      fieldName: 'introduction',
      formItemClass: 'md:col-span-2',
      label: $t('medical.doctor.introduction'),
      rules: z.string().max(4000).optional(),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      formItemClass: 'md:col-span-2',
      label: $t('medical.doctor.remark'),
      rules: z.string().max(512).optional(),
    },
  ];
}

export function useDoctorSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'keyword',
      label: $t('medical.doctor.keyword'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => getLocalDictList('MED_DOCTOR_TITLE'),
      },
      fieldName: 'professionalTitle',
      label: $t('medical.doctor.professionalTitle'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => getLocalDictList('MED_EMPLOYMENT_TYPE'),
      },
      fieldName: 'employmentType',
      label: $t('medical.doctor.employmentType'),
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
      fieldName: 'status',
      label: $t('medical.doctor.status'),
    },
  ];
}

export function useDoctorColumns(): VxeTableGridOptions<MedicalDoctorApi.Doctor>['columns'] {
  return [
    {
      cellRender: {
        name: 'UserAvatar',
        props: { avatarField: 'avatar', nameField: 'name' },
      },
      field: 'avatar',
      fixed: 'left',
      minWidth: 150,
      sortBy: 'name',
      sortable: true,
      title: $t('medical.doctor.name'),
    },
    {
      field: 'doctorNo',
      sortable: true,
      title: $t('medical.doctor.doctorNo'),
      width: 130,
    },
    {
      field: 'primaryDepartmentName',
      minWidth: 130,
      title: $t('medical.doctor.primaryDepartment'),
    },
    {
      cellRender: { name: 'DictTag', props: { type: 'MED_DOCTOR_TITLE' } },
      field: 'professionalTitle',
      title: $t('medical.doctor.professionalTitle'),
      width: 120,
    },
    {
      cellRender: {
        name: 'DictTag',
        props: { type: 'MED_EMPLOYMENT_TYPE' },
      },
      field: 'employmentType',
      title: $t('medical.doctor.employmentType'),
      width: 110,
    },
    {
      field: 'phone',
      title: $t('medical.doctor.phone'),
      width: 140,
    },
    {
      cellRender: {
        attrs: {
          onChange: (newStatus: 0 | 1, row: MedicalDoctorApi.Doctor) =>
            updateDoctorStatusApi(row.doctorId, newStatus),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      sortable: true,
      title: $t('medical.doctor.status'),
      width: 90,
    },
    {
      field: 'createDate',
      sortable: true,
      title: $t('system.dept.createDate'),
      width: 180,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('system.dept.operation'),
      width: 200,
    },
  ];
}

export function useDoctorBasicDescriptionItems(
  doctor?: MedicalDoctorApi.Doctor,
): DescriptionsItemType[] {
  const enabled = doctor?.status === 1;
  return [
    {
      content: () =>
        h(DictTag, {
          dictType: 'GENDER',
          value: doctor?.gender,
        }),
      label: $t('medical.doctor.gender'),
    },
    {
      content: doctor?.birthDate || '-',
      label: $t('medical.doctor.birthDate'),
    },
    { content: doctor?.phone || '-', label: $t('medical.doctor.phone') },
    { content: doctor?.email || '-', label: $t('medical.doctor.email') },
    { content: doctor?.userName || '-', label: $t('medical.doctor.user') },
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
      label: $t('medical.doctor.status'),
    },
  ];
}

export function useDoctorPracticeDescriptionItems(
  doctor?: MedicalDoctorApi.Doctor,
): DescriptionsItemType[] {
  return [
    {
      content: () =>
        h(DictTag, {
          dictType: 'MED_DOCTOR_TITLE',
          value: doctor?.professionalTitle,
        }),
      label: $t('medical.doctor.professionalTitle'),
    },
    {
      content: () =>
        h(DictTag, {
          dictType: 'MED_EMPLOYMENT_TYPE',
          value: doctor?.employmentType,
        }),
      label: $t('medical.doctor.employmentType'),
    },
    {
      content: doctor?.administrativePosition || '-',
      label: $t('medical.doctor.administrativePosition'),
    },
    {
      content: doctor?.primaryDepartmentName || '-',
      label: $t('medical.doctor.primaryDepartment'),
    },
    {
      content: doctor?.departmentNames?.join('、') || '-',
      label: $t('medical.doctor.department'),
    },
    {
      content: doctor?.practiceStartDate || '-',
      label: $t('medical.doctor.practiceStartDate'),
    },
    {
      content: doctor?.employmentDate || '-',
      label: $t('medical.doctor.employmentDate'),
    },
    {
      content: doctor?.departureDate || '-',
      label: $t('medical.doctor.departureDate'),
    },
    {
      content: doctor?.defaultVisitMinutes ?? '-',
      label: $t('medical.doctor.defaultVisitMinutes'),
    },
    {
      content: doctor?.expertise || '-',
      label: $t('medical.doctor.expertise'),
    },
    {
      content: doctor?.introduction || '-',
      label: $t('medical.doctor.introduction'),
    },
    { content: doctor?.remark || '-', label: $t('medical.doctor.remark') },
  ];
}
