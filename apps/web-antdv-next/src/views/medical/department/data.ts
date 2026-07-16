import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MedicalDepartmentApi } from '#/api/medical';

import { z } from '#/adapter/form';
import {
  getMedicalDepartmentTreeApi,
  updateMedicalDepartmentStatusApi,
} from '#/api/medical';
import { $t } from '#/locales';

export function useDepartmentFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { maxlength: 32 },
      fieldName: 'departmentCode',
      label: $t('medical.department.code'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('medical.department.code')]))
        .max(32)
        .regex(/^[A-Za-z0-9_-]+$/, {
          message: $t('medical.department.code'),
        }),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64 },
      fieldName: 'departmentName',
      label: $t('medical.department.name'),
      rules: z.string().min(1).max(64),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getMedicalDepartmentTreeApi,
        childrenField: 'children',
        class: 'w-full',
        labelField: 'departmentName',
        valueField: 'departmentId',
      },
      fieldName: 'pid',
      label: $t('medical.department.parent'),
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, precision: 0 },
      defaultValue: 0,
      fieldName: 'sort',
      label: $t('medical.department.sort'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        optionType: 'button',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('medical.department.status'),
    },
    {
      component: 'Textarea',
      componentProps: { maxlength: 512, rows: 3, showCount: true },
      fieldName: 'remark',
      label: $t('medical.department.remark'),
      rules: z.string().max(512).optional(),
    },
  ];
}

export function useDepartmentSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { allowClear: true },
      fieldName: 'keyword',
      label: $t('medical.department.keyword'),
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
      label: $t('medical.department.status'),
    },
  ];
}

export function useDepartmentColumns(): VxeTableGridOptions<MedicalDepartmentApi.Department>['columns'] {
  return [
    {
      field: 'departmentName',
      fixed: 'left',
      minWidth: 180,
      title: $t('medical.department.name'),
      treeNode: true,
    },
    {
      field: 'departmentCode',
      minWidth: 140,
      title: $t('medical.department.code'),
    },
    {
      cellRender: {
        attrs: {
          onChange: (newStatus: 0 | 1, row: MedicalDepartmentApi.Department) =>
            updateMedicalDepartmentStatusApi(row.departmentId, newStatus),
        },
        name: 'CellSwitch',
      },
      field: 'status',
      title: $t('medical.department.status'),
      width: 100,
    },
    {
      field: 'sort',
      title: $t('medical.department.sort'),
      width: 90,
    },
    {
      field: 'remark',
      minWidth: 180,
      title: $t('medical.department.remark'),
    },
    {
      field: 'createDate',
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
      width: 250,
    },
  ];
}
