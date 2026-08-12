import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalDiagnosisApi } from '#/api/medical';

import { updateDiagnosisStatusApi } from '#/api/medical';
import { $t } from '#/locales';

export function useDiagnosisSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'keyword',
      label: $t('medical.diagnosis.keyword'),
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
      label: $t('medical.diagnosis.status'),
    },
  ];
}

export function useDiagnosisFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'icdCode',
      label: $t('medical.diagnosis.icdCode'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 128 },
      fieldName: 'icdName',
      label: $t('medical.diagnosis.icdName'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 256 },
      fieldName: 'namePinyin',
      label: $t('medical.diagnosis.namePinyin'),
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, precision: 0 },
      defaultValue: 0,
      fieldName: 'sort',
      label: $t('medical.diagnosis.sort'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('medical.diagnosis.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 4, showCount: true },
      fieldName: 'remark',
      formItemClass: 'col-span-2',
      label: $t('medical.diagnosis.remark'),
    },
  ];
}

export function useDiagnosisColumns(): VxeTableGridOptions<MedicalDiagnosisApi.Diagnosis>['columns'] {
  return [
    {
      field: 'icdCode',
      fixed: 'left',
      minWidth: 130,
      sortable: true,
      title: $t('medical.diagnosis.icdCode'),
    },
    {
      field: 'icdName',
      minWidth: 200,
      sortable: true,
      title: $t('medical.diagnosis.icdName'),
    },
    {
      field: 'namePinyin',
      minWidth: 180,
      title: $t('medical.diagnosis.namePinyin'),
    },
    {
      field: 'sort',
      sortable: true,
      title: $t('medical.diagnosis.sort'),
      width: 90,
    },
    {
      cellRender: {
        attrs: {
          auth: 'medical:diagnosis:status',
          onChange: (
            status: 0 | 1,
            row: MedicalDiagnosisApi.Diagnosis,
          ) => updateDiagnosisStatusApi(row.diagnosisId, status),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      sortable: true,
      title: $t('medical.diagnosis.status'),
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 180,
      title: $t('medical.diagnosis.remark'),
    },
    {
      field: 'updateDate',
      sortable: true,
      title: $t('medical.diagnosis.updateDate'),
      width: 170,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      slots: { default: 'action' },
      title: $t('medical.common.operation'),
      width: 150,
    },
  ];
}
